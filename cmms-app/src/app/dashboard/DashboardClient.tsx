'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ClipboardList, Wrench, AlertTriangle, CheckCircle2, DollarSign, TrendingUp, Hammer } from 'lucide-react';
import { DashboardStats, PMSchedule, WorkOrder } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import ProgressBar from '@/components/ui/ProgressBar';
import { PMStatusLabel } from '@/lib/utils';

export default function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [overduePMs, setOverduePMs] = useState<PMSchedule[]>([]);
  const [openWOs, setOpenWOs] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, pmRes, woRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/pm'),
          fetch('/api/work-orders'),
        ]);
        const [statsData, pmData, woData] = await Promise.all([
          statsRes.json(), pmRes.json(), woRes.json()
        ]);
        setStats(statsData);
        setOverduePMs((pmData as PMSchedule[]).filter(p =>
          p.pm_status_label === 'OVERDUE' || p.pm_status_label === 'DUE_SOON'
        ).slice(0, 5));
        setOpenWOs((woData as WorkOrder[]).filter(w =>
          w.status === 'OPEN' || w.status === 'IN_PROGRESS'
        ).slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-500">
          <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Loading dashboard...
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Active Assets',
      value: stats?.active_assets ?? 0,
      total: stats?.total_assets ?? 0,
      icon: Package,
      color: 'bg-blue-500',
      href: '/assets',
    },
    {
      label: 'PM Overdue',
      value: stats?.overdue_pm ?? 0,
      sub: `${stats?.due_soon_pm ?? 0} due soon`,
      icon: AlertTriangle,
      color: (stats?.overdue_pm ?? 0) > 0 ? 'bg-red-500' : 'bg-green-500',
      href: '/pm',
    },
    {
      label: 'Open Work Orders',
      value: stats?.open_wo ?? 0,
      sub: `${stats?.in_progress_wo ?? 0} in progress`,
      icon: Wrench,
      color: 'bg-indigo-500',
      href: '/work-orders',
    },
    {
      label: 'Cost This Month',
      value: formatCurrency(stats?.total_cost_this_month ?? 0),
      sub: `${stats?.completed_wo_this_month ?? 0} WOs completed`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      href: '/work-orders',
    },
    {
      label: 'Tool Capex',
      value: formatCurrency(stats?.total_tool_capex ?? 0),
      sub: `${stats?.total_tools ?? 0} tools`,
      icon: Hammer,
      color: 'bg-amber-500',
      href: '/tools',
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Welcome back!</h2>
        <p className="text-slate-500 text-sm mt-1">Here's what needs your attention today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`${card.color} w-10 h-10 rounded-xl flex items-center justify-center shadow-sm`}>
                <card.icon size={20} className="text-white" />
              </div>
              <TrendingUp size={14} className="text-slate-300 group-hover:text-slate-400 transition" />
            </div>
            <div className="text-2xl font-bold text-slate-800">{card.value}</div>
            <div className="text-xs text-slate-500 mt-1">{card.label}</div>
            {card.sub && <div className="text-xs text-slate-400 mt-0.5">{card.sub}</div>}
            {card.total !== undefined && (
              <div className="text-xs text-slate-400 mt-0.5">of {card.total} total</div>
            )}
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* PM Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <ClipboardList size={18} className="text-slate-600" />
              <h3 className="font-semibold text-slate-800">PM Alerts</h3>
            </div>
            <Link href="/pm" className="text-indigo-600 hover:text-indigo-700 text-xs font-medium">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {overduePMs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <CheckCircle2 size={36} className="text-green-300 mb-2" />
                <p className="text-sm">All PMs are on track!</p>
              </div>
            ) : (
              overduePMs.map((pm) => (
                <Link key={pm.id} href={`/pm/${pm.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{pm.name}</div>
                    <div className="text-xs text-slate-500 truncate">{pm.asset?.name}</div>
                    <ProgressBar
                      percent={pm.percent_remaining ?? 100}
                      statusLabel={(pm.pm_status_label ?? 'OK') as PMStatusLabel}
                    />
                  </div>
                  <div className="shrink-0">
                    <StatusBadge value={(pm.pm_status_label ?? 'OK') as PMStatusLabel} size="sm" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Open WOs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <Wrench size={18} className="text-slate-600" />
              <h3 className="font-semibold text-slate-800">Active Work Orders</h3>
            </div>
            <Link href="/work-orders" className="text-indigo-600 hover:text-indigo-700 text-xs font-medium">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {openWOs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <CheckCircle2 size={36} className="text-green-300 mb-2" />
                <p className="text-sm">No open work orders!</p>
              </div>
            ) : (
              openWOs.map((wo) => (
                <Link key={wo.id} href={`/work-orders/${wo.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{wo.title}</div>
                    <div className="text-xs text-slate-500 truncate">
                      {wo.asset?.name} · {formatDate(wo.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge value={wo.priority} size="sm" />
                    <StatusBadge value={wo.status} size="sm" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
