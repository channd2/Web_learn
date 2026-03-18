'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Wrench, ChevronRight, Trash2 } from 'lucide-react';
import { WorkOrder } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import WOForm from '@/components/work-orders/WOForm';

export default function WOClient() {
  const [wos, setWOs] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    const res = await fetch('/api/work-orders');
    if (res.ok) setWOs(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/work-orders/${deleteId}`, { method: 'DELETE' });
    setDeleting(false);
    setDeleteId(null);
    load();
  }

  const filtered = wos.filter(wo => {
    const matchSearch = !search ||
      wo.title.toLowerCase().includes(search.toLowerCase()) ||
      wo.wo_number.toLowerCase().includes(search.toLowerCase()) ||
      wo.asset?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || wo.status === statusFilter;
    const matchType = typeFilter === 'ALL' || wo.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  const sorted = [...filtered].sort((a, b) => {
    if (a.status === 'COMP' && b.status !== 'COMP') return 1;
    if (b.status === 'COMP' && a.status !== 'COMP') return -1;
    return (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
  });

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Work Orders</h2>
          <p className="text-slate-500 text-sm">
            {wos.filter(w => w.status !== 'COMP').length} active · {wos.length} total
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New WO</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search work orders..."
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
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMP">Completed</option>
        </select>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl text-sm text-slate-700 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Types</option>
          <option value="PM">PM</option>
          <option value="ADHOC">Ad-hoc</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16 text-slate-400">Loading...</div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Wrench size={48} className="text-slate-200 mb-3" />
          <p className="font-medium">No work orders found</p>
          <button onClick={() => setShowCreate(true)}
            className="mt-4 flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-xl"
          >
            <Plus size={16} /> New Work Order
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(wo => (
            <div key={wo.id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition ${
              wo.priority === 'HIGH' && wo.status !== 'COMP' ? 'border-red-200' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800 text-sm">{wo.title}</span>
                    {wo.priority === 'HIGH' && wo.status !== 'COMP' && (
                      <span className="text-xs text-red-500 font-bold">● HIGH</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {wo.wo_number} · {wo.asset?.name} · {formatDate(wo.created_at)}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <StatusBadge value={wo.type} size="sm" />
                    <StatusBadge value={wo.status} size="sm" />
                    <StatusBadge value={wo.priority} size="sm" />
                    {wo.total_cost > 0 && (
                      <span className="text-xs text-slate-500">Cost: {formatCurrency(wo.total_cost)}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {wo.status !== 'COMP' && (
                    <button
                      onClick={(e) => { e.preventDefault(); setDeleteId(wo.id); }}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <Link href={`/work-orders/${wo.id}`}
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Work Order" size="lg">
        <WOForm
          onSuccess={(wo) => { setShowCreate(false); window.location.href = `/work-orders/${wo.id}`; }}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Work Order"
        message="This will permanently delete the work order and all its parts and records."
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  );
}
