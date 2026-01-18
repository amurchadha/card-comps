-- ROI Engine Schema Migration
-- Adds fields for tracking full card lifecycle: Raw -> Grading -> Sold
-- Run in Supabase SQL Editor

-- Create enum for card status lifecycle
DO $$ BEGIN
  CREATE TYPE card_status AS ENUM ('raw', 'submitted', 'in_grading', 'graded', 'listed', 'sold');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add new columns to inventory table
ALTER TABLE inventory
  -- Status tracking (replace simple 'owned' status)
  ADD COLUMN IF NOT EXISTS card_status card_status DEFAULT 'raw',

  -- Acquisition costs (some already exist, adding what's missing)
  ADD COLUMN IF NOT EXISTS raw_purchase_price DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS acquisition_shipping DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS acquisition_tax DECIMAL(10,2) DEFAULT 0,

  -- Grading costs
  ADD COLUMN IF NOT EXISTS grading_company_used TEXT,
  ADD COLUMN IF NOT EXISTS grading_service_level TEXT,
  ADD COLUMN IF NOT EXISTS grading_fee DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS grading_insurance DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS inbound_shipping DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS outbound_shipping DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS grading_submitted_date DATE,
  ADD COLUMN IF NOT EXISTS grading_received_date DATE,

  -- Supply costs
  ADD COLUMN IF NOT EXISTS supply_costs DECIMAL(10,2) DEFAULT 0,

  -- Expected/Actual grade
  ADD COLUMN IF NOT EXISTS expected_grade TEXT,
  ADD COLUMN IF NOT EXISTS actual_grade TEXT,

  -- Sale tracking
  ADD COLUMN IF NOT EXISTS listed_price DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS listed_date DATE,
  ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS sale_date DATE,
  ADD COLUMN IF NOT EXISTS sale_platform TEXT,
  ADD COLUMN IF NOT EXISTS platform_fee_percent DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS platform_fees DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS sale_shipping_cost DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS buyer_paid_shipping BOOLEAN DEFAULT false,

  -- Calculated fields (will be updated by trigger)
  ADD COLUMN IF NOT EXISTS total_cost_basis DECIMAL(10,2) GENERATED ALWAYS AS (
    COALESCE(raw_purchase_price, purchase_price, 0) +
    COALESCE(acquisition_shipping, shipping_paid, 0) +
    COALESCE(acquisition_tax, purchase_tax, 0) +
    COALESCE(grading_fee, 0) +
    COALESCE(grading_insurance, 0) +
    COALESCE(inbound_shipping, 0) +
    COALESCE(outbound_shipping, 0) +
    COALESCE(supply_costs, 0)
  ) STORED,

  ADD COLUMN IF NOT EXISTS net_proceeds DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE WHEN sale_price IS NOT NULL THEN
      sale_price -
      COALESCE(platform_fees, 0) -
      CASE WHEN buyer_paid_shipping = false THEN COALESCE(sale_shipping_cost, 0) ELSE 0 END
    ELSE NULL END
  ) STORED,

  ADD COLUMN IF NOT EXISTS net_profit DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE WHEN sale_price IS NOT NULL THEN
      (sale_price -
       COALESCE(platform_fees, 0) -
       CASE WHEN buyer_paid_shipping = false THEN COALESCE(sale_shipping_cost, 0) ELSE 0 END) -
      (COALESCE(raw_purchase_price, purchase_price, 0) +
       COALESCE(acquisition_shipping, shipping_paid, 0) +
       COALESCE(acquisition_tax, purchase_tax, 0) +
       COALESCE(grading_fee, 0) +
       COALESCE(grading_insurance, 0) +
       COALESCE(inbound_shipping, 0) +
       COALESCE(outbound_shipping, 0) +
       COALESCE(supply_costs, 0))
    ELSE NULL END
  ) STORED;

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_inventory_card_status ON inventory(card_status);
CREATE INDEX IF NOT EXISTS idx_inventory_grading_company ON inventory(grading_company_used);

-- Create a view for ROI analysis
CREATE OR REPLACE VIEW inventory_roi_analysis AS
SELECT
  i.id,
  i.user_id,
  i.player_name,
  i.card_number,
  i.card_status,
  i.grading_company_used,
  i.actual_grade,
  i.total_cost_basis,
  i.sale_price,
  i.net_proceeds,
  i.net_profit,
  CASE
    WHEN i.total_cost_basis > 0 AND i.net_profit IS NOT NULL
    THEN ROUND((i.net_profit / i.total_cost_basis) * 100, 2)
    ELSE NULL
  END as roi_percent,
  i.grading_submitted_date,
  i.grading_received_date,
  CASE
    WHEN i.grading_submitted_date IS NOT NULL AND i.grading_received_date IS NOT NULL
    THEN i.grading_received_date - i.grading_submitted_date
    ELSE NULL
  END as grading_turnaround_days,
  i.created_at
FROM inventory i;

-- Table for tracking grading cost presets by company/service
CREATE TABLE IF NOT EXISTS grading_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  service_level TEXT NOT NULL,
  base_fee DECIMAL(10,2) NOT NULL,
  max_value_threshold DECIMAL(10,2),
  percent_of_value DECIMAL(5,2),
  estimated_turnaround_days INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company, service_level)
);

-- Insert common grading presets
INSERT INTO grading_presets (company, service_level, base_fee, max_value_threshold, estimated_turnaround_days, notes)
VALUES
  ('PSA', 'Value', 25, 499, 65, 'Cards valued $1-$499'),
  ('PSA', 'Regular', 50, 999, 30, 'Cards valued $1-$999'),
  ('PSA', 'Express', 100, 2499, 15, 'Cards valued $1-$2499'),
  ('PSA', 'Super Express', 200, 4999, 5, 'Cards valued $1-$4999'),
  ('PSA', 'Walk-Through', 600, NULL, 1, 'Same day, unlimited value'),
  ('BGS', 'Standard', 30, 999, 50, 'Standard service'),
  ('BGS', 'Express', 80, 2499, 10, '10 business days'),
  ('BGS', 'Premium', 250, NULL, 2, '2 business days'),
  ('SGC', 'Regular', 20, 499, 30, 'Most affordable option'),
  ('SGC', 'Express', 50, 999, 10, 'Faster turnaround'),
  ('CGC', 'Standard', 25, 999, 45, 'Standard service'),
  ('CGC', 'Express', 60, 2499, 10, '10 business days')
ON CONFLICT (company, service_level) DO NOTHING;

COMMENT ON TABLE inventory IS 'User card inventory with full ROI tracking - raw acquisition through grading and sale';
COMMENT ON COLUMN inventory.card_status IS 'Lifecycle status: raw, submitted, in_grading, graded, listed, sold';
COMMENT ON COLUMN inventory.total_cost_basis IS 'Auto-calculated sum of all costs (acquisition + grading + supplies)';
COMMENT ON COLUMN inventory.net_profit IS 'Auto-calculated: net_proceeds - total_cost_basis';
