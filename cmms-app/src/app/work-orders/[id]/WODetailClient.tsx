'use client';

import { useEffect, useState, use, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Edit2, Trash2, CheckCircle2, Package,
  Clock, DollarSign, Plus, X, FileText, Gauge, AlertCircle
} from 'lucide-react';
import { WorkOrder, WOPart } from '@/types';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import WOForm from '@/components/work-orders/WOForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function WODetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [wo, setWO] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completeMeter, setCompleteMeter] = useState('');
  const [completeComments, setCompleteComments] = useState('');

  // Parts
  const [showAddPart, setShowAddPart] = useState(false);
  const [partForm, setPartForm] = useState({ part_name: '', quantity: '1', unit_price: '0' });
  const [addingPart, setAddingPart] = useState(false);

  async function load() {
    const res = await fetch(`/api/work-orders/${id}`);
    if (res.ok) setWO(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/work-orders/${id}`, { method: 'DELETE' });
    router.push('/work-orders');
  }

  async function handleComplete(e: FormEvent) {
    e.preventDefault();
    setCompleting(true);
    const res = await fetch(`/api/work-orders/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comments: completeComments || wo?.comments,
        meter_reading: completeMeter || undefined,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setWO(prev => prev ? { ...prev, ...updated } : updated);
    }
    setCompleting(false);
    setShowComplete(false);
  }

  async function handleAddPart(e: FormEvent) {
    e.preventDefault();
    setAddingPart(true);
    const res = await fetch(`/api/work-orders/${id}/parts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partForm),
    });
    if (res.ok) {
      setPartForm({ part_name: '', quantity: '1', unit_price: '0' });
      setShowAddPart(false);
      load();
    }
    setAddingPart(false);
  }

  async function handleDeletePart(partId: string) {
    await fetch(`/api/work-orders/${id}/parts`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partId }),
    });
    load();
  }

  async function handleStatusChange(newStatus: string) {
    const res = await fetch(`/api/work-orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) setWO(await res.json());
  }

  if (loading) return <div className="flex justify-center py-20 text-slate-400">Loading...</div>;
  if (!wo) return <div className="p-6 text-center text-slate-500">Work order not found.</div>;

  const isComp = wo.status === 'COMP';
  const totalPartsValue = (wo.parts || []).reduce((sum, p) => sum + p.quantity * p.unit_price, 0);

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Back + Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link href="/work-orders" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm transition">
          <ArrowLeft size={16} /> Work Orders
        </Link>
        <div className="flex gap-2 flex-wrap">
          {!isComp && (
            <>
              {wo.status === 'OPEN' && (
                <button
                  onClick={() => handleStatusChange('IN_PROGRESS')}
                  className="flex items-center gap-1.5 text-sm font-medium text-yellow-700 bg-yellow-50 px-3 py-2 rounded-xl hover:bg-yellow-100 transition"
                >
                  <Clock size={15} /> Start Work
                </button>
              )}
              <button
                onClick={() => setShowComplete(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-3 py-2 rounded-xl hover:bg-green-100 transition"
              >
                <CheckCircle2 size={15} /> Mark Complete
              </button>
              <button onClick={() => setShowEdit(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition"
              >
                <Edit2 size={15} /> Edit
              </button>
            </>
          )}
          <button onClick={() => setShowDelete(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-red-600 bg-red-50 px-3 py-2 rounded-xl hover:bg-red-100 transition"
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>

      {/* WO Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        {isComp && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 mb-4">
            <CheckCircle2 size={18} className="text-green-600" />
            <span className="text-sm text-green-700 font-medium">Work Order Completed</span>
          </div>
        )}

        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{wo.title}</h2>
            <p className="text-sm text-slate-400 font-mono">{wo.wo_number}</p>
            {wo.description && <p className="text-sm text-slate-600 mt-2">{wo.description}</p>}
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            <StatusBadge value={wo.status} />
            <StatusBadge value={wo.priority} size="sm" />
            <StatusBadge value={wo.type} size="sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1"><Package size={11} /> Asset</div>
            <Link href={`/assets/${wo.asset_id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              {wo.asset?.name}
            </Link>
            <div className="text-xs text-slate-400">{wo.asset?.asset_number}</div>
          </div>
          {wo.pm && (
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">📋 PM</div>
              <Link href={`/pm/${wo.pm_id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                {wo.pm.name}
              </Link>
            </div>
          )}
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1"><Clock size={11} /> Start Time</div>
            <div className="text-sm font-semibold text-slate-700">{formatDateTime(wo.start_time)}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1"><Clock size={11} /> End Time</div>
            <div className="text-sm font-semibold text-slate-700">{formatDateTime(wo.end_time)}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1"><DollarSign size={11} /> Total Cost</div>
            <div className="text-sm font-bold text-slate-800">{formatCurrency(wo.total_cost)}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 col-span-2">
            <div className="text-xs text-slate-400 mb-1">Created</div>
            <div className="text-sm font-semibold text-slate-700">{formatDate(wo.created_at)}</div>
          </div>
        </div>

        {wo.comments && (
          <div className="mt-4 p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-400 mb-1 font-medium">Comments / Work Notes</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{wo.comments}</p>
          </div>
        )}
      </div>

      {/* Parts Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-slate-600" />
            <h3 className="font-semibold text-slate-800">Parts & Materials</h3>
          </div>
          {!isComp && (
            <button
              onClick={() => setShowAddPart(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition"
            >
              <Plus size={14} /> Add Part
            </button>
          )}
        </div>

        {showAddPart && (
          <form onSubmit={handleAddPart} className="px-5 py-4 border-b border-slate-50 bg-slate-50">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3 sm:col-span-1">
                <input
                  type="text"
                  placeholder="Part name *"
                  value={partForm.part_name}
                  onChange={e => setPartForm(p => ({ ...p, part_name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Qty"
                  value={partForm.quantity}
                  onChange={e => setPartForm(p => ({ ...p, quantity: e.target.value }))}
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Unit price (MYR)"
                  value={partForm.unit_price}
                  onChange={e => setPartForm(p => ({ ...p, unit_price: e.target.value }))}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button type="button" onClick={() => setShowAddPart(false)}
                className="px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button type="submit" disabled={addingPart}
                className="px-3 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
              >
                {addingPart ? 'Adding...' : 'Add Part'}
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-slate-50">
          {!wo.parts || wo.parts.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-sm">No parts added.</div>
          ) : (
            <>
              <div className="px-5 py-2 grid grid-cols-4 text-xs font-medium text-slate-400 gap-4">
                <div className="col-span-2">Part Name</div>
                <div className="text-right">Qty × Price</div>
                <div className="text-right">Total</div>
              </div>
              {wo.parts.map((part: WOPart) => (
                <div key={part.id} className="px-5 py-3 grid grid-cols-4 items-center gap-4">
                  <div className="col-span-2 text-sm font-medium text-slate-700">{part.part_name}</div>
                  <div className="text-right text-xs text-slate-500">
                    {part.quantity} × {formatCurrency(part.unit_price)}
                  </div>
                  <div className="text-right flex items-center justify-end gap-2">
                    <span className="text-sm font-semibold text-slate-800">
                      {formatCurrency(part.quantity * part.unit_price)}
                    </span>
                    {!isComp && (
                      <button
                        onClick={() => handleDeletePart(part.id)}
                        className="text-slate-300 hover:text-red-500 transition"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="px-5 py-3 flex justify-between items-center bg-slate-50">
                <span className="text-sm font-medium text-slate-700">Total Parts Cost</span>
                <span className="text-base font-bold text-slate-800">{formatCurrency(totalPartsValue)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Work Order" size="lg">
        <WOForm
          wo={wo}
          onSuccess={(updated) => { setWO(prev => prev ? { ...prev, ...updated } : updated); setShowEdit(false); }}
          onCancel={() => setShowEdit(false)}
        />
      </Modal>

      {/* Complete Modal */}
      <Modal open={showComplete} onClose={() => setShowComplete(false)} title="Complete Work Order" size="md">
        <form onSubmit={handleComplete} className="space-y-4">
          <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
            <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">Mark as Completed</p>
              <p className="text-xs text-green-600 mt-0.5">
                Status will be set to COMP (final). If linked to a PM, it will reset the PM schedule automatically.
              </p>
            </div>
          </div>

          {wo.pm_id && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <div className="flex items-center gap-1.5"><Gauge size={14} /> Current Meter Reading (km)</div>
              </label>
              <input
                type="number"
                value={completeMeter}
                onChange={e => setCompleteMeter(e.target.value)}
                placeholder="Enter current km reading"
                min="0"
                step="0.1"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-slate-400 mt-1">Used to reset PM meter reading</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Completion Notes</label>
            <textarea
              value={completeComments}
              onChange={e => setCompleteComments(e.target.value)}
              rows={3}
              placeholder="What was done, findings, next steps..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setShowComplete(false)} disabled={completing}
              className="flex-1 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button type="submit" disabled={completing}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-xl transition"
            >
              {completing ? 'Completing...' : 'Complete WO'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
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
