'use client';

import { useEffect, useState, FormEvent } from 'react';
import { PMSchedule, Asset } from '@/types';

interface Props {
  pm?: Partial<PMSchedule>;
  assetId?: string;
  onSuccess: (pm: PMSchedule) => void;
  onCancel: () => void;
}

export default function PMForm({ pm, assetId, onSuccess, onCancel }: Props) {
  const isEdit = !!pm?.id;
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    asset_id: assetId || pm?.asset_id || '',
    name: pm?.name || '',
    description: pm?.description || '',
    frequency_type: pm?.frequency_type || 'TIME',
    frequency_days: pm?.frequency_days?.toString() || '30',
    frequency_km: pm?.frequency_km?.toString() || '5000',
    last_completed_date: pm?.last_completed_date ? pm.last_completed_date.split('T')[0] : '',
    last_completed_km: pm?.last_completed_km?.toString() || '',
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
      const url = isEdit ? `/api/pm/${pm!.id}` : '/api/pm';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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

  const showTime = form.frequency_type === 'TIME' || form.frequency_type === 'BOTH';
  const showMeter = form.frequency_type === 'METER' || form.frequency_type === 'BOTH';

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

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">PM Name *</label>
        <input
          type="text"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          required
          placeholder="e.g. Engine Oil Change, Air Filter Replacement"
          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={2}
          placeholder="Steps, notes, parts needed..."
          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Frequency Type *</label>
        <div className="grid grid-cols-3 gap-2">
          {(['TIME', 'METER', 'BOTH'] as const).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => set('frequency_type', type)}
              className={`py-2.5 text-sm font-medium rounded-xl border transition ${
                form.frequency_type === type
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {type === 'TIME' ? 'Time Based' : type === 'METER' ? 'Meter Based' : 'Both'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {showTime && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Frequency (days) *</label>
            <input
              type="number"
              value={form.frequency_days}
              onChange={e => set('frequency_days', e.target.value)}
              required={showTime}
              min="1"
              placeholder="30"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-400 mt-1">e.g. 30 = monthly</p>
          </div>
        )}
        {showMeter && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Frequency (km) *</label>
            <input
              type="number"
              value={form.frequency_km}
              onChange={e => set('frequency_km', e.target.value)}
              required={showMeter}
              min="1"
              placeholder="5000"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-400 mt-1">e.g. 5000 km</p>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-slate-100">
        <p className="text-xs font-medium text-slate-500 mb-3">Last Completion (optional - set to calculate next due)</p>
        <div className="grid grid-cols-2 gap-4">
          {showTime && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Completed Date</label>
              <input
                type="date"
                value={form.last_completed_date}
                onChange={e => set('last_completed_date', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
          {showMeter && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Completed at (km)</label>
              <input
                type="number"
                value={form.last_completed_km}
                onChange={e => set('last_completed_km', e.target.value)}
                min="0"
                placeholder="0"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={loading}
          className="flex-1 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
        >
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl transition"
        >
          {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create PM'}
        </button>
      </div>
    </form>
  );
}
