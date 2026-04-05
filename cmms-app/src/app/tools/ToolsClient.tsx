'use client';

import { useEffect, useState } from 'react';
import { Tool } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ToolForm from '@/components/tools/ToolForm';
import StatusBadge from '@/components/ui/StatusBadge';
import { Plus, Wrench, Pencil, Trash2, DollarSign, Camera } from 'lucide-react';

export default function ToolsClient() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTool, setEditTool] = useState<Tool | null>(null);
  const [deleteTool, setDeleteTool] = useState<Tool | null>(null);

  async function load() {
    try {
      const res = await fetch('/api/tools');
      const data = await res.json();
      setTools(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handleSuccess(tool: Tool) {
    setShowForm(false);
    setEditTool(null);
    load();
  }

  async function handleDelete() {
    if (!deleteTool) return;
    await fetch(`/api/tools/${deleteTool.id}`, { method: 'DELETE' });
    setDeleteTool(null);
    load();
  }

  const totalCapex = tools.reduce((sum, t) => sum + (t.capex || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-500">
          <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Loading tools...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tools</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {tools.length} tool{tools.length !== 1 ? 's' : ''} · Total Capex: {formatCurrency(totalCapex)}
          </p>
        </div>
        <button
          onClick={() => { setEditTool(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <Plus size={16} />
          Add Tool
        </button>
      </div>

      {/* Tool list */}
      {tools.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center py-16 text-slate-400">
          <Wrench size={40} className="mb-3 text-slate-300" />
          <p className="text-sm font-medium">No tools yet</p>
          <p className="text-xs mt-1">Add your first tool to track its capex</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-50">
          {tools.map((tool) => (
            <div key={tool.id} className="flex items-center gap-4 px-4 py-3.5">
              {/* Photo */}
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                {tool.photo_url ? (
                  <img src={tool.photo_url} alt={tool.name} className="w-full h-full object-cover" />
                ) : (
                  <Camera size={20} className="text-slate-300" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">{tool.tool_number}</span>
                  <StatusBadge value={tool.status} size="sm" />
                </div>
                <div className="font-medium text-slate-800 truncate">{tool.name}</div>
                {tool.description && (
                  <div className="text-xs text-slate-500 truncate">{tool.description}</div>
                )}
                {tool.purchase_date && (
                  <div className="text-xs text-slate-400 mt-0.5">Purchased: {formatDate(tool.purchase_date)}</div>
                )}
              </div>

              {/* Capex */}
              <div className="text-right shrink-0">
                {tool.capex != null ? (
                  <div className="flex items-center gap-1 text-emerald-600 font-semibold text-sm">
                    <DollarSign size={14} />
                    {formatCurrency(tool.capex)}
                  </div>
                ) : (
                  <span className="text-slate-300 text-sm">—</span>
                )}
                <div className="text-xs text-slate-400">capex</div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => { setEditTool(tool); setShowForm(true); }}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteTool(tool)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditTool(null); }}
        title={editTool ? 'Edit Tool' : 'Add Tool'}
      >
        <ToolForm
          tool={editTool || undefined}
          onSuccess={handleSuccess}
          onCancel={() => { setShowForm(false); setEditTool(null); }}
        />
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTool}
        title="Delete Tool"
        message={`Are you sure you want to delete "${deleteTool?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onClose={() => setDeleteTool(null)}
      />
    </div>
  );
}
