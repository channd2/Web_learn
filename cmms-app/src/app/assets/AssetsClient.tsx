'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Package, Gauge, Calendar, ChevronRight, Trash2, DollarSign } from 'lucide-react';
import { Asset } from '@/types';
import { formatKm, calcEquipmentAge, formatCurrency } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AssetForm from '@/components/assets/AssetForm';
import Modal from '@/components/ui/Modal';

export default function AssetsClient() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  async function load() {
    const res = await fetch('/api/assets');
    if (res.ok) setAssets(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/assets/${deleteId}`, { method: 'DELETE' });
    setDeleting(false);
    setDeleteId(null);
    load();
  }

  const filtered = assets.filter(a => {
    const matchSearch = !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.asset_number.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Assets</h2>
          <p className="text-slate-500 text-sm">{assets.length} total assets</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Asset</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl text-sm text-slate-700 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="RETIRED">Retired</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16 text-slate-400">Loading assets...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Package size={48} className="text-slate-200 mb-3" />
          <p className="font-medium">No assets found</p>
          <p className="text-sm mt-1">Create your first asset to get started</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-xl"
          >
            <Plus size={16} /> New Asset
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(asset => (
            <div key={asset.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-4 p-4">
                {/* Photo or icon */}
                <div className="shrink-0">
                  <Link href={`/assets/${asset.id}`}>
                    {asset.photo_url ? (
                      <img
                        src={asset.photo_url}
                        alt={asset.name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-100 hover:opacity-80 transition"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center hover:bg-indigo-100 transition">
                        <Package size={24} className="text-indigo-400" />
                      </div>
                    )}
                  </Link>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <Link href={`/assets/${asset.id}`} className="font-semibold text-slate-800 text-sm hover:text-indigo-600 transition">
                      {asset.name}
                    </Link>
                    <span className="text-xs text-slate-400 font-mono">{asset.asset_number}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{asset.description || 'No description'}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Gauge size={12} className="text-slate-400" />
                      {formatKm(asset.meter_reading)}
                    </div>
                    {asset.date_of_birth && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar size={12} className="text-slate-400" />
                        {calcEquipmentAge(asset.date_of_birth)}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <DollarSign size={12} className="text-slate-400" />
                      <span className="text-slate-400">Capex:</span> {asset.capex != null ? formatCurrency(asset.capex) : '—'}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <DollarSign size={12} className="text-slate-400" />
                      <span className="text-slate-400">Maint:</span> {formatCurrency(asset.total_maintenance_cost ?? 0)}
                    </div>
                    <StatusBadge value={asset.status} size="sm" />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => { e.preventDefault(); setDeleteId(asset.id); }}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                  <Link
                    href={`/assets/${asset.id}`}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                  >
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Asset" size="lg">
        <AssetForm
          onSuccess={() => { setShowCreate(false); load(); }}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Asset"
        message="This will permanently delete the asset and all its PMs and work orders. This action cannot be undone."
        confirmLabel="Delete Asset"
        danger
        loading={deleting}
      />
    </div>
  );
}
