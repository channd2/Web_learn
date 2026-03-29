export type AssetStatus = 'ACTIVE' | 'INACTIVE' | 'RETIRED';
export type PMFrequencyType = 'TIME' | 'METER' | 'BOTH';
export type PMStatus = 'ACTIVE' | 'INACTIVE';
export type WOStatus = 'OPEN' | 'IN_PROGRESS' | 'COMP';
export type WOType = 'PM' | 'ADHOC';
export type WOPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Asset {
  id: string;
  asset_number: string;
  name: string;
  description?: string;
  date_of_birth?: string;
  meter_reading: number;
  status: AssetStatus;
  photo_url?: string;
  capex?: number;
  created_at: string;
  updated_at: string;
  // computed
  equipment_age_years?: number;
  pm_count?: number;
  wo_count?: number;
  total_maintenance_cost?: number;
}

export interface AssetDocument {
  id: string;
  asset_id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  created_at: string;
}

export interface PMSchedule {
  id: string;
  asset_id: string;
  name: string;
  description?: string;
  frequency_type: PMFrequencyType;
  frequency_days?: number;
  frequency_km?: number;
  last_completed_date?: string;
  last_completed_km?: number;
  next_due_date?: string;
  next_due_km?: number;
  status: PMStatus;
  created_at: string;
  updated_at: string;
  // relations
  asset?: Pick<Asset, 'id' | 'asset_number' | 'name' | 'meter_reading'>;
  // computed
  days_until_due?: number;
  km_until_due?: number;
  percent_remaining?: number;
  pm_status_label?: 'OVERDUE' | 'DUE_SOON' | 'UPCOMING' | 'OK';
}

export interface WorkOrder {
  id: string;
  wo_number: string;
  asset_id: string;
  pm_id?: string;
  type: WOType;
  title: string;
  description?: string;
  status: WOStatus;
  priority: WOPriority;
  start_time?: string;
  end_time?: string;
  total_cost: number;
  comments?: string;
  created_at: string;
  updated_at: string;
  // relations
  asset?: Pick<Asset, 'id' | 'asset_number' | 'name'>;
  pm?: Pick<PMSchedule, 'id' | 'name'>;
  parts?: WOPart[];
  documents?: WODocument[];
}

export interface WOPart {
  id: string;
  wo_id: string;
  part_name: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
  created_at: string;
}

export interface WODocument {
  id: string;
  wo_id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  created_at: string;
}

export interface DashboardStats {
  total_assets: number;
  active_assets: number;
  overdue_pm: number;
  due_soon_pm: number;
  open_wo: number;
  in_progress_wo: number;
  completed_wo_this_month: number;
  total_cost_this_month: number;
}
