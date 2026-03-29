-- ============================================
-- Home CMMS Application - Database Schema
-- ============================================
-- Run this in Supabase SQL Editor

-- Assets Table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  date_of_birth DATE,
  meter_reading DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'RETIRED')),
  photo_url TEXT,
  capex DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asset Documents Table
CREATE TABLE IF NOT EXISTS asset_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PM Schedules Table
CREATE TABLE IF NOT EXISTS pm_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frequency_type TEXT NOT NULL CHECK (frequency_type IN ('TIME', 'METER', 'BOTH')),
  frequency_days INTEGER,
  frequency_km DECIMAL(10,2),
  last_completed_date TIMESTAMPTZ,
  last_completed_km DECIMAL(10,2),
  next_due_date TIMESTAMPTZ,
  next_due_km DECIMAL(10,2),
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Work Orders Table
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_number TEXT UNIQUE NOT NULL,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  pm_id UUID REFERENCES pm_schedules(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('PM', 'ADHOC')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMP')),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  total_cost DECIMAL(10,2) DEFAULT 0,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WO Parts Table
CREATE TABLE IF NOT EXISTS wo_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
  part_name TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WO Documents Table
CREATE TABLE IF NOT EXISTS wo_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER pm_schedules_updated_at BEFORE UPDATE ON pm_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER work_orders_updated_at BEFORE UPDATE ON work_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Storage Buckets Setup (run in Supabase SQL Editor)
-- ============================================
-- Creates public storage buckets for photos and documents
INSERT INTO storage.buckets (id, name, public) VALUES ('asset-photos', 'asset-photos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('wo-docs', 'wo-docs', true) ON CONFLICT DO NOTHING;

-- Allow authenticated users to upload/read/delete in asset-photos
CREATE POLICY "asset-photos: allow all for authenticated" ON storage.objects
  FOR ALL USING (bucket_id = 'asset-photos') WITH CHECK (bucket_id = 'asset-photos');

-- Allow authenticated users to upload/read/delete in wo-docs
CREATE POLICY "wo-docs: allow all for authenticated" ON storage.objects
  FOR ALL USING (bucket_id = 'wo-docs') WITH CHECK (bucket_id = 'wo-docs');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pm_schedules_asset_id ON pm_schedules(asset_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_asset_id ON work_orders(asset_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_pm_id ON work_orders(pm_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_pm_schedules_status ON pm_schedules(status);
CREATE INDEX IF NOT EXISTS idx_wo_parts_wo_id ON wo_parts(wo_id);
CREATE INDEX IF NOT EXISTS idx_wo_documents_wo_id ON wo_documents(wo_id);
CREATE INDEX IF NOT EXISTS idx_asset_documents_asset_id ON asset_documents(asset_id);
