import { supabaseAdmin } from './supabase';
import { Asset, PMSchedule, WorkOrder, WOPart, WODocument, AssetDocument } from '@/types';
import { calcPMProgress } from './utils';
import { addDays } from 'date-fns';

function db() {
  return supabaseAdmin();
}

// ============ ASSETS ============

export async function getAssets(): Promise<Asset[]> {
  const { data, error } = await db()
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(enrichAsset);
}

export async function getAssetById(id: string): Promise<Asset | null> {
  const { data, error } = await db()
    .from('assets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return enrichAsset(data);
}

function enrichAsset(a: Asset): Asset {
  if (a.date_of_birth) {
    const birth = new Date(a.date_of_birth);
    const now = new Date();
    const msPerYear = 1000 * 60 * 60 * 24 * 365.25;
    a.equipment_age_years = parseFloat(((now.getTime() - birth.getTime()) / msPerYear).toFixed(1));
  }
  return a;
}

export async function createAsset(data: Partial<Asset>): Promise<Asset> {
  const { data: created, error } = await db()
    .from('assets')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return enrichAsset(created);
}

export async function updateAsset(id: string, data: Partial<Asset>): Promise<Asset> {
  const { data: updated, error } = await db()
    .from('assets')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return enrichAsset(updated);
}

export async function deleteAsset(id: string): Promise<void> {
  const { error } = await db().from('assets').delete().eq('id', id);
  if (error) throw error;
}

export async function getAssetDocuments(assetId: string): Promise<AssetDocument[]> {
  const { data, error } = await db()
    .from('asset_documents')
    .select('*')
    .eq('asset_id', assetId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ============ PM SCHEDULES ============

export async function getPMSchedules(assetId?: string): Promise<PMSchedule[]> {
  let query = db()
    .from('pm_schedules')
    .select('*, asset:assets(id, asset_number, name, meter_reading)')
    .order('created_at', { ascending: false });

  if (assetId) query = query.eq('asset_id', assetId);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(enrichPM);
}

export async function getPMById(id: string): Promise<PMSchedule | null> {
  const { data, error } = await db()
    .from('pm_schedules')
    .select('*, asset:assets(id, asset_number, name, meter_reading)')
    .eq('id', id)
    .single();

  if (error) return null;
  return enrichPM(data);
}

function enrichPM(pm: PMSchedule): PMSchedule {
  const progress = calcPMProgress(pm, pm.asset?.meter_reading);
  return {
    ...pm,
    days_until_due: progress.daysUntilDue,
    km_until_due: progress.kmUntilDue,
    percent_remaining: progress.percentRemaining,
    pm_status_label: progress.statusLabel,
  };
}

export async function createPM(data: Partial<PMSchedule>): Promise<PMSchedule> {
  // Calculate initial next due dates
  const enriched = calcNextDueDates(data);
  const { data: created, error } = await db()
    .from('pm_schedules')
    .insert(enriched)
    .select('*, asset:assets(id, asset_number, name, meter_reading)')
    .single();

  if (error) throw error;
  return enrichPM(created);
}

export async function updatePM(id: string, data: Partial<PMSchedule>): Promise<PMSchedule> {
  const { data: updated, error } = await db()
    .from('pm_schedules')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, asset:assets(id, asset_number, name, meter_reading)')
    .single();

  if (error) throw error;
  return enrichPM(updated);
}

export async function deletePM(id: string): Promise<void> {
  const { error } = await db().from('pm_schedules').delete().eq('id', id);
  if (error) throw error;
}

function calcNextDueDates(pm: Partial<PMSchedule>): Partial<PMSchedule> {
  const result = { ...pm };

  if ((pm.frequency_type === 'TIME' || pm.frequency_type === 'BOTH') && pm.frequency_days) {
    const base = pm.last_completed_date ? new Date(pm.last_completed_date) : new Date();
    result.next_due_date = addDays(base, pm.frequency_days).toISOString();
  }

  if ((pm.frequency_type === 'METER' || pm.frequency_type === 'BOTH') && pm.frequency_km) {
    const baseKm = pm.last_completed_km || 0;
    result.next_due_km = baseKm + pm.frequency_km;
  }

  return result;
}

export async function resetPMAfterCompletion(
  pmId: string,
  completedDate: string,
  completedKm?: number
): Promise<void> {
  const pm = await getPMById(pmId);
  if (!pm) return;

  const updateData: Partial<PMSchedule> = {
    last_completed_date: completedDate,
    last_completed_km: completedKm ?? pm.last_completed_km,
  };

  if ((pm.frequency_type === 'TIME' || pm.frequency_type === 'BOTH') && pm.frequency_days) {
    updateData.next_due_date = addDays(new Date(completedDate), pm.frequency_days).toISOString();
  }

  if ((pm.frequency_type === 'METER' || pm.frequency_type === 'BOTH') && pm.frequency_km) {
    const baseKm = completedKm ?? pm.last_completed_km ?? 0;
    updateData.next_due_km = baseKm + pm.frequency_km;
  }

  await updatePM(pmId, updateData);
}

// ============ WORK ORDERS ============

export async function getWorkOrders(filters?: { assetId?: string; pmId?: string; status?: string }): Promise<WorkOrder[]> {
  let query = db()
    .from('work_orders')
    .select('*, asset:assets(id, asset_number, name), pm:pm_schedules(id, name)')
    .order('created_at', { ascending: false });

  if (filters?.assetId) query = query.eq('asset_id', filters.assetId);
  if (filters?.pmId) query = query.eq('pm_id', filters.pmId);
  if (filters?.status) query = query.eq('status', filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getWOById(id: string): Promise<WorkOrder | null> {
  const { data, error } = await db()
    .from('work_orders')
    .select(`
      *,
      asset:assets(id, asset_number, name),
      pm:pm_schedules(id, name),
      parts:wo_parts(*),
      documents:wo_documents(*)
    `)
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function createWO(data: Partial<WorkOrder>): Promise<WorkOrder> {
  const { data: created, error } = await db()
    .from('work_orders')
    .insert(data)
    .select('*, asset:assets(id, asset_number, name), pm:pm_schedules(id, name)')
    .single();

  if (error) throw error;
  return created;
}

export async function updateWO(id: string, data: Partial<WorkOrder>): Promise<WorkOrder> {
  const { data: updated, error } = await db()
    .from('work_orders')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, asset:assets(id, asset_number, name), pm:pm_schedules(id, name)')
    .single();

  if (error) throw error;
  return updated;
}

export async function deleteWO(id: string): Promise<void> {
  const { error } = await db().from('work_orders').delete().eq('id', id);
  if (error) throw error;
}

export async function addWOPart(data: Partial<WOPart>): Promise<WOPart> {
  const { data: created, error } = await db()
    .from('wo_parts')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return created;
}

export async function deleteWOPart(id: string): Promise<void> {
  const { error } = await db().from('wo_parts').delete().eq('id', id);
  if (error) throw error;
}

export async function updateWOTotalCost(woId: string): Promise<void> {
  const { data: parts } = await db()
    .from('wo_parts')
    .select('quantity, unit_price')
    .eq('wo_id', woId);

  const total = (parts || []).reduce((sum, p) => sum + p.quantity * p.unit_price, 0);
  await db().from('work_orders').update({ total_cost: total }).eq('id', woId);
}

// ============ DASHBOARD ============

export async function getDashboardStats() {
  const [assets, pms, wos] = await Promise.all([
    db().from('assets').select('status'),
    db().from('pm_schedules').select('*, asset:assets(meter_reading)').eq('status', 'ACTIVE'),
    db().from('work_orders').select('status, total_cost, created_at'),
  ]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const assetList = assets.data || [];
  const pmList = (pms.data || []).map(enrichPM);
  const woList = wos.data || [];

  return {
    total_assets: assetList.length,
    active_assets: assetList.filter((a: { status: string }) => a.status === 'ACTIVE').length,
    overdue_pm: pmList.filter((p) => p.pm_status_label === 'OVERDUE').length,
    due_soon_pm: pmList.filter((p) => p.pm_status_label === 'DUE_SOON').length,
    open_wo: woList.filter((w: { status: string }) => w.status === 'OPEN').length,
    in_progress_wo: woList.filter((w: { status: string }) => w.status === 'IN_PROGRESS').length,
    completed_wo_this_month: woList.filter(
      (w: { status: string; created_at: string }) => w.status === 'COMP' && new Date(w.created_at) >= startOfMonth
    ).length,
    total_cost_this_month: woList
      .filter((w: { status: string; created_at: string }) => w.status === 'COMP' && new Date(w.created_at) >= startOfMonth)
      .reduce((sum: number, w: { total_cost: number }) => sum + (w.total_cost || 0), 0),
  };
}
