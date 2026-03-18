'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, Trash2, Zap, Wrench, Calendar, Gauge, CheckCircle2 } from 'lucide-react';
import { PMSchedule, WorkOrder } from '@/types';
import { PMStatusLabel } from '@/lib/utils';
import { formatDate, formatKm, formatDateTime } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import ProgressBar from '@/components/ui/ProgressBar';
import Modal from '@/components/ui/Modal';
import PMForm from '@/components/pm/PMForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function PMDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [pm, setPM] = useState<PMSchedule | null>(null);
  const [wos, setWOs] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generatingWO, setGeneratingWO] = useState(false);

  async function load() {
    const [pmRes, woRes] = await Promise.all([
      fetch(`/api/pm/${id}`),
      fetch(`/api/work-orders?pmId=${id}`),
    ]);
    if (pmRes.ok) setPM(await pmRes.json());
    if (woRes.ok) setWOs(await woRes.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/pm/${id}`, { method: 'DELETE' });
    router.push('/pm');
  }

  async function generateWO() {
    setGeneratingWO(true);
    const res = await fetch(`/api/pm/${id}/generate-wo`, { method: 'POST' });
    const wo = await res.json();
    setGeneratingWO(false);
    if (res.ok) router.push(`/work-orders/${wo.id}`);
  }

  if (loading) return <div className="flex justify-center py-20 text-slate-400">Loading...</div>;
  if (!pm) return <div className="p-6 text-center text-slate-500">PM not found.</div>;

  const statusLabel = (pm.pm_status_label ?? 'OK') as PMStatusLabel;

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <Link href="/pm" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm transition">
          <ArrowLeft size={16} /> PM Schedules
        </Link>
        <div className="flex gap-2">
          <button onClick={generateWO} disabled={generatingWO}
            className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-2 rounded-xl hover:bg-indigo-100 transition"
          >
            <Zap size={15} /> {generatingWO ? 'Creating...' : 'Generate WO'}
          </button>
          <button onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition"
          >
            <Edit2 size={15} /> Edit
          </button>
          <button onClick={() => setShowDelete(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-red-600 bg-red-50 px-3 py-2 rounded-xl hover:bg-red-100 transition"
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>

      {/* PM Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{pm.name}</h2>
            <Link href={`/assets/${pm.asset_id}`} className="text-sm text-slate-500 hover:text-indigo-600 transition">
              {pm.asset?.name} ({pm.asset?.asset_number})
            </Link>
            {pm.description && <p className="text-sm text-slate-600 mt-2">{pm.description}</p>}
          </div>
          <StatusBadge value={statusLabel} />
        </div>

        {/* Progress */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Maintenance Progress</span>
            <span className="font-medium">{Math.round(pm.percent_remaining ?? 100)}% remaining</span>
          </div>
          <ProgressBar percent={pm.percent_remaining ?? 100} statusLabel={statusLabel} />
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="text-xs text-slate-400 mb-1">Frequency Type</div>
            <div className="text-sm font-semibold text-slate-700">{pm.frequency_type}</div>
          </div>
          {(pm.frequency_type === 'TIME' || pm.frequency_type === 'BOTH') && (
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1 text-xs text-slate-400 mb-1"><Calendar size={11} /> Time</div>
              <div className="text-sm font-semibold text-slate-700">Every {pm.frequency_days} days</div>
              {pm.days_until_due !== undefined && (
                <div className={`text-xs mt-0.5 ${pm.days_until_due < 0 ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
                  {pm.days_until_due >= 0 ? `${pm.days_until_due} days left` : `${Math.abs(pm.days_until_due)} days overdue`}
                </div>
              )}
            </div>
          )}
          {(pm.frequency_type === 'METER' || pm.frequency_type === 'BOTH') && (
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1 text-xs text-slate-400 mb-1"><Gauge size={11} /> Meter</div>
              <div className="text-sm font-semibold text-slate-700">Every {formatKm(pm.frequency_km ?? 0)}</div>
              {pm.km_until_due !== undefined && (
                <div className={`text-xs mt-0.5 ${pm.km_until_due < 0 ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
                  {pm.km_until_due >= 0 ? `${formatKm(pm.km_until_due)} left` : `${formatKm(Math.abs(pm.km_until_due))} overdue`}
                </div>
              )}
            </div>
          )}
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-1"><CheckCircle2 size={11} /> Last Done</div>
            <div className="text-sm font-semibold text-slate-700">{formatDate(pm.last_completed_date)}</div>
            {pm.last_completed_km && (
              <div className="text-xs text-slate-500 mt-0.5">{formatKm(pm.last_completed_km)}</div>
            )}
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-1"><Calendar size={11} /> Next Due</div>
            <div className="text-sm font-semibold text-slate-700">{formatDate(pm.next_due_date)}</div>
            {pm.next_due_km && (
              <div className="text-xs text-slate-500 mt-0.5">{formatKm(pm.next_due_km)}</div>
            )}
          </div>
        </div>
      </div>

      {/* Work Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
          <Wrench size={18} className="text-slate-600" />
          <h3 className="font-semibold text-slate-800">Work Orders ({wos.length})</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {wos.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No work orders yet. Generate one with the button above.
            </div>
          ) : (
            wos.map(wo => (
              <Link key={wo.id} href={`/work-orders/${wo.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800">{wo.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{wo.wo_number} · {formatDate(wo.created_at)}</div>
                </div>
                <StatusBadge value={wo.status} size="sm" />
              </Link>
            ))
          )}
        </div>
      </div>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit PM Schedule" size="lg">
        <PMForm
          pm={pm}
          onSuccess={(updated) => { setPM(updated); setShowEdit(false); }}
          onCancel={() => setShowEdit(false)}
        />
      </Modal>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete PM Schedule"
        message="This will permanently delete this PM schedule. Related work orders will be kept."
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  );
}
