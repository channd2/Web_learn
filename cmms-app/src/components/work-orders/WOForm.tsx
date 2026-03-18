'use client';

import { useEffect, useState, FormEvent } from 'react';
import { WorkOrder, Asset } from '@/types';

interface Props {
  wo?: Partial<WorkOrder>;
  assetId?: string;
  pmId?: string;
  onSuccess: (wo: WorkOrder) => void;
  onCancel: () => void;
}

export default function WOForm({ wo, assetId, pmId, onSuccess, onCancel }: Props) {
  const isEdit = !!wo?.id;
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    asset_id: assetId || wo?.asset_id || '',
    pm_id: pmId || wo?.pm_id || '',
    type: wo?.type || 'ADHOC',
    title: wo?.title || '',
    description: wo?.description || '',
    priority: wo?.priority || 'MEDIUM',
    status: wo?.status || 'OPEN',
    start_time: wo?.start_time ? wo.start_time.slice(0, 16) : '',
    end_time: wo?.end_time ? wo.end_time.slice(0, 16) : '',
    comments: wo?.comments || '',
  });

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  useEffect(() => {
    if (!assetId) {
      fetch('/api/assets').then(r => r.json()).then(setAssets);
    }
  }, [assetId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = isEdit ? `/api/work-orders/${wo!.id}` : '/api/work-orders';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          pm_id: form.pm_id || null,
          start_time: form.start_time || null,
          end_time: form.end_time || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      onSuccess(data);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      {!assetId && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Asset *</label>
          <select
            value={form.asset_id}
            onChange={e => set('asset_id', e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select asset...</option>
            {assets.map(a => (
              <option key={a.id} value={a.id}>{a.name} ({a.asset_number})</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
          <div className="flex gap-2">
            {(['PM', 'ADHOC'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => set('type', t)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-xl border transition ${
                  form.type === t
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {t === 'PM' ? 'PM Work' : 'Ad-hoc'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
          <select
            value={form.priority}
            onChange={e => set('priority', e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
        <input
          type="text"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          required
          placeholder="e.g. Oil Change, Brake Pad Replacement"
          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={2}
          placeholder="Work instructions, notes..."
          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      {isEdit && (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={e => set('status', e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMP">Completed</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
              <input
                type="datetime-local"
                value={form.start_time}
                onChange={e => set('start_time', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
              <input
                type="datetime-local"
                value={form.end_time}
                onChange={e => set('end_time', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Comments</label>
            <textarea
              value={form.comments}
              onChange={e => set('comments', e.target.value)}
              rows={3}
              placeholder="Work done, observations, issues found..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={loading}
          className="flex-1 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
        >
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl transition"
        >
          {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create WO'}
        </button>
      </div>
    </form>
  );
}
