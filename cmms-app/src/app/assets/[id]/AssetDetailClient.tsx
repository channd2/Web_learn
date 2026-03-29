'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Package, Gauge, Calendar, Edit2, Trash2,
  Plus, ClipboardList, Wrench, FileText, ExternalLink, DollarSign
} from 'lucide-react';
import { Asset, PMSchedule, WorkOrder, AssetDocument } from '@/types';
import { formatDate, formatKm, calcEquipmentAge, formatCurrency } from '@/lib/utils';
import { PMStatusLabel } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import ProgressBar from '@/components/ui/ProgressBar';
import Modal from '@/components/ui/Modal';
import AssetForm from '@/components/assets/AssetForm';
import PMForm from '@/components/pm/PMForm';
import WOForm from '@/components/work-orders/WOForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function AssetDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [asset, setAsset] = useState<Asset & { documents?: AssetDocument[] } | null>(null);
  const [pms, setPMs] = useState<PMSchedule[]>([]);
  const [wos, setWOs] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showNewPM, setShowNewPM] = useState(false);
  const [showNewWO, setShowNewWO] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    const [assetRes, pmRes, woRes] = await Promise.all([
      fetch(`/api/assets/${id}`),
      fetch(`/api/pm?assetId=${id}`),
      fetch(`/api/work-orders?assetId=${id}`),
    ]);
    if (assetRes.ok) setAsset(await assetRes.json());
    if (pmRes.ok) setPMs(await pmRes.json());
    if (woRes.ok) setWOs(await woRes.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/assets/${id}`, { method: 'DELETE' });
    router.push('/assets');
  }

  if (loading) {
    return <div className="flex justify-center py-20 text-slate-400">Loading...</div>;
  }

  if (!asset) {
    return (
      <div className="p-6 text-center text-slate-500">
        <p>Asset not found.</p>
        <Link href="/assets" className="text-indigo-600 mt-2 inline-block">← Back to Assets</Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <Link href="/assets" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm transition">
          <ArrowLeft size={16} />
          Assets
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition"
          >
            <Edit2 size={15} /> Edit
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-red-600 bg-red-50 px-3 py-2 rounded-xl hover:bg-red-100 transition"
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>

      {/* Asset Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex gap-4">
          {asset.photo_url ? (
            <img src={asset.photo_url} alt={asset.name} className="w-24 h-24 rounded-xl object-cover border border-slate-100 shrink-0" />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Package size={40} className="text-indigo-300" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-slate-800">{asset.name}</h2>
              <StatusBadge value={asset.status} />
            </div>
            <p className="text-sm text-slate-400 font-mono">{asset.asset_number}</p>
            {asset.description && <p className="text-sm text-slate-600 mt-2">{asset.description}</p>}
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-50">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Gauge size={12} /> Meter Reading
            </div>
            <div className="text-lg font-bold text-slate-800">{formatKm(asset.meter_reading)}</div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Calendar size={12} /> Date of Birth
            </div>
            <div className="text-sm font-semibold text-slate-700">{formatDate(asset.date_of_birth)}</div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Calendar size={12} /> Equipment Age
            </div>
            <div className="text-sm font-semibold text-slate-700">{calcEquipmentAge(asset.date_of_birth)}</div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <DollarSign size={12} /> Total Maintenance Cost
            </div>
            <div className="text-lg font-bold text-slate-800">{formatCurrency(asset.total_maintenance_cost ?? 0)}</div>
          </div>
          {asset.capex != null && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <DollarSign size={12} /> Purchase Price (Capex)
              </div>
              <div className="text-lg font-bold text-slate-800">{formatCurrency(asset.capex)}</div>
            </div>
          )}
        </div>
      </div>

      {/* PM List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-slate-600" />
            <h3 className="font-semibold text-slate-800">Preventive Maintenance ({pms.length})</h3>
          </div>
          <button
            onClick={() => setShowNewPM(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition"
          >
            <Plus size={14} /> Add PM
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          {pms.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">No PM schedules. Add one to get started.</div>
          ) : (
            pms.map(pm => (
              <Link key={pm.id} href={`/pm/${pm.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800">{pm.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {pm.frequency_type === 'TIME' && `Every ${pm.frequency_days} days`}
                    {pm.frequency_type === 'METER' && `Every ${pm.frequency_km?.toLocaleString()} km`}
                    {pm.frequency_type === 'BOTH' && `Every ${pm.frequency_days} days or ${pm.frequency_km?.toLocaleString()} km`}
                    {pm.days_until_due !== undefined && ` · ${pm.days_until_due >= 0 ? `${pm.days_until_due} days` : `${Math.abs(pm.days_until_due)} days overdue`}`}
                  </div>
                  <div className="mt-1.5">
                    <ProgressBar percent={pm.percent_remaining ?? 100} statusLabel={(pm.pm_status_label ?? 'OK') as PMStatusLabel} />
                  </div>
                </div>
                <StatusBadge value={(pm.pm_status_label ?? 'OK') as PMStatusLabel} size="sm" />
              </Link>
            ))
          )}
        </div>
      </div>

      {/* WO List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <Wrench size={18} className="text-slate-600" />
            <h3 className="font-semibold text-slate-800">Work Orders ({wos.length})</h3>
          </div>
          <button
            onClick={() => setShowNewWO(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition"
          >
            <Plus size={14} /> New WO
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          {wos.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">No work orders.</div>
          ) : (
            wos.map(wo => (
              <Link key={wo.id} href={`/work-orders/${wo.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800">{wo.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {wo.wo_number} · {formatDate(wo.created_at)} · {formatCurrency(wo.total_cost)}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <StatusBadge value={wo.type} size="sm" />
                  <StatusBadge value={wo.status} size="sm" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Documents */}
      {asset.documents && asset.documents.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
            <FileText size={18} className="text-slate-600" />
            <h3 className="font-semibold text-slate-800">Documents ({asset.documents.length})</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {asset.documents.map(doc => (
              <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition"
              >
                <FileText size={16} className="text-slate-400 shrink-0" />
                <span className="text-sm text-slate-700 flex-1">{doc.file_name}</span>
                <ExternalLink size={14} className="text-slate-400" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Asset" size="lg">
        <AssetForm
          asset={asset}
          onSuccess={(updated) => { setAsset(prev => prev ? { ...prev, ...updated } : updated as Asset & { documents?: AssetDocument[] }); setShowEdit(false); }}
          onCancel={() => setShowEdit(false)}
        />
      </Modal>

      <Modal open={showNewPM} onClose={() => setShowNewPM(false)} title="Add PM Schedule" size="lg">
        <PMForm
          assetId={id}
          onSuccess={() => { setShowNewPM(false); load(); }}
          onCancel={() => setShowNewPM(false)}
        />
      </Modal>

      <Modal open={showNewWO} onClose={() => setShowNewWO(false)} title="New Work Order" size="lg">
        <WOForm
          assetId={id}
          onSuccess={() => { setShowNewWO(false); load(); }}
          onCancel={() => setShowNewWO(false)}
        />
      </Modal>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Asset"
        message="This will permanently delete the asset and all associated PMs and work orders."
        confirmLabel="Delete Asset"
        danger
        loading={deleting}
      />
    </div>
  );
}
