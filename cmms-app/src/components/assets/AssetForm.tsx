'use client';

import { useState, FormEvent, useRef } from 'react';
import { Asset } from '@/types';
import { generateAssetNumber } from '@/lib/utils';
import { Camera, X } from 'lucide-react';

interface Props {
  asset?: Partial<Asset>;
  onSuccess: (asset: Asset) => void;
  onCancel: () => void;
}

export default function AssetForm({ asset, onSuccess, onCancel }: Props) {
  const isEdit = !!asset?.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>(asset?.photo_url || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    asset_number: asset?.asset_number || generateAssetNumber(),
    name: asset?.name || '',
    description: asset?.description || '',
    date_of_birth: asset?.date_of_birth ? asset.date_of_birth.split('T')[0] : '',
    meter_reading: asset?.meter_reading?.toString() || '0',
    status: asset?.status || 'ACTIVE',
    photo_url: asset?.photo_url || '',
    capex: asset?.capex?.toString() || '',
  });

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoPreview(URL.createObjectURL(file));
    setUploading(true);
    setError('');

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('bucket', 'asset-photos');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      set('photo_url', data.url);
    } catch (e: unknown) {
      setError((e as Error).message);
      setPhotoPreview(asset?.photo_url || '');
      set('photo_url', asset?.photo_url || '');
    } finally {
      setUploading(false);
    }
  }

  function handleRemovePhoto() {
    setPhotoPreview('');
    set('photo_url', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = isEdit ? `/api/assets/${asset!.id}` : '/api/assets';
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Asset Number *</label>
          <input
            type="text"
            value={form.asset_number}
            onChange={e => set('asset_number', e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={e => set('status', e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Asset Name *</label>
        <input
          type="text"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          required
          placeholder="e.g. Honda Civic, Air Conditioner, Generator"
          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={3}
          placeholder="Model, serial number, location, etc."
          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
          <input
            type="date"
            value={form.date_of_birth}
            onChange={e => set('date_of_birth', e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Current Reading (km)</label>
          <input
            type="number"
            value={form.meter_reading}
            onChange={e => set('meter_reading', e.target.value)}
            min="0"
            step="0.1"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Price (Capex)</label>
          <input
            type="number"
            value={form.capex}
            onChange={e => set('capex', e.target.value)}
            min="0"
            step="0.01"
            placeholder="0.00"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Asset Photo</label>
        {photoPreview ? (
          <div className="relative inline-block">
            <img
              src={photoPreview}
              alt="Preview"
              className="w-32 h-32 rounded-xl object-cover border border-slate-200"
            />
            {uploading ? (
              <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center">
                <span className="text-xs text-slate-600 font-medium">Uploading...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition"
          >
            <Camera size={18} />
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handlePhotoSelect}
          className="hidden"
        />
        <p className="text-xs text-slate-400 mt-1.5">JPEG, PNG, WebP or GIF · Max 5MB</p>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || uploading}
          className="flex-1 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl transition"
        >
          {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Asset'}
        </button>
      </div>
    </form>
  );
}
