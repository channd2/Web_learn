'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, ClipboardList, ChevronRight, Trash2, Zap } from 'lucide-react';
import { PMSchedule } from '@/types';
import { PMStatusLabel } from '@/lib/utils';
import { formatDate, formatKm } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import ProgressBar from '@/components/ui/ProgressBar';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import PMForm from '@/components/pm/PMForm';

export default function PMClient() {
  const [pms, setPMs] = useState<PMSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [generatingWO, setGeneratingWO] = useState<string | null>(null);

  async function load() {
    const res = await fetch('/api/pm');
    if (res.ok) setPMs(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/pm/${deleteId}`, { method: 'DELETE' });
    setDeleting(false);
    setDeleteId(null);
    load();
  }

  async function generateWO(pmId: string) {
    setGeneratingWO(pmId);
    const res = await fetch(`/api/pm/${pmId}/generate-wo`, { method: 'POST' });
    const wo = await res.json();
    setGeneratingWO(null);
    if (res.ok) {
      window.location.href = `/work-orders/${wo.id}`;
    }
  }

  const filtered = pms.filter(pm => {
    const matchSearch = !search ||
      pm.name.toLowerCase().includes(search.toLowerCase()) ||
      pm.asset?.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' ||
      (filter === 'OVERDUE' && pm.pm_status_label === 'OVERDUE') ||
      (filter === 'DUE_SOON' && pm.pm_status_label === 'DUE_SOON') ||
      (filter === 'OK' && (pm.pm_status_label === 'OK' || pm.pm_status_label === 'UPCOMING'));
    return matchSearch && matchFilter;
  });

  const counts = {
    overdue: pms.filter(p => p.pm_status_label === 'OVERDUE').length,
    dueSoon: pms.filter(p => p.pm_status_label === 'DUE_SOON').length,
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Preventive Maintenance</h2>
          <p className="text-slate-500 text-sm">
            {counts.overdue > 0 && <span className="text-red-500 font-medium">{counts.overdue} overdue · </span>}
            {counts.dueSoon > 0 && <span className="text-orange-500 font-medium">{counts.dueSoon} due soon · </span>}
            {pms.length} total
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New PM</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search PM..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'OVERDUE', 'DUE_SOON', 'OK'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-medium rounded-xl transition ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
              }`}
            >
              {f === 'DUE_SOON' ? 'Due Soon' : f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16 text-slate-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <ClipboardList size={48} className="text-slate-200 mb-3" />
          <p className="font-medium">No PM schedules found</p>
          <button onClick={() => setShowCreate(true)}
            className="mt-4 flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-xl"
          >
            <Plus size={16} /> New PM Schedule
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(pm => (
            <div key={pm.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800 text-sm">{pm.name}</span>
                      <StatusBadge value={(pm.pm_status_label ?? 'OK') as PMStatusLabel} size="sm" />
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      <Link href={`/assets/${pm.asset_id}`} className="hover:text-indigo-600 transition">
                        {pm.asset?.name} ({pm.asset?.asset_number})
                      </Link>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => generateWO(pm.id)}
                      disabled={generatingWO === pm.id}
                      title="Generate Work Order"
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition text-xs"
                    >
                      {generatingWO === pm.id ? '...' : <Zap size={16} />}
                    </button>
                    <button
                      onClick={() => setDeleteId(pm.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                    <Link href={`/pm/${pm.id}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                      <ChevronRight size={18} />
                    </Link>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-3">
                  <ProgressBar
                    percent={pm.percent_remaining ?? 100}
                    statusLabel={(pm.pm_status_label ?? 'OK') as PMStatusLabel}
                    showLabel
                  />
                </div>

                {/* Details */}
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                  {(pm.frequency_type === 'TIME' || pm.frequency_type === 'BOTH') && (
                    <span>⏱ Every {pm.frequency_days} days
                      {pm.days_until_due !== undefined && (
                        <span className={pm.days_until_due < 0 ? ' text-red-500 font-medium' : ''}>
                          {' '}· {pm.days_until_due >= 0 ? `${pm.days_until_due}d left` : `${Math.abs(pm.days_until_due)}d overdue`}
                        </span>
                      )}
                    </span>
                  )}
                  {(pm.frequency_type === 'METER' || pm.frequency_type === 'BOTH') && (
                    <span>📍 Every {formatKm(pm.frequency_km ?? 0)}
                      {pm.km_until_due !== undefined && (
                        <span className={pm.km_until_due < 0 ? ' text-red-500 font-medium' : ''}>
                          {' '}· {pm.km_until_due >= 0 ? `${formatKm(pm.km_until_due)} left` : `${formatKm(Math.abs(pm.km_until_due))} overdue`}
                        </span>
                      )}
                    </span>
                  )}
                  {pm.last_completed_date && (
                    <span>✓ Last: {formatDate(pm.last_completed_date)}</span>
                  )}
                  {pm.next_due_date && (
                    <span>📅 Due: {formatDate(pm.next_due_date)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New PM Schedule" size="lg">
        <PMForm
          onSuccess={() => { setShowCreate(false); load(); }}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete PM Schedule"
        message="This will permanently delete the PM schedule. Related work orders will be kept."
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  );
}
