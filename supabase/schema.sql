-- Card Comps Power Suite Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles (synced from Clerk)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Card sets metadata
CREATE TABLE sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sport TEXT NOT NULL,
  year INTEGER NOT NULL,
  manufacturer TEXT NOT NULL,
  base_set_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parallel types per set
CREATE TABLE parallels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  set_id UUID REFERENCES sets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  print_run INTEGER,
  rarity_tier TEXT DEFAULT 'common',
  color_code TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User inventory
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  card_number TEXT,
  set_id UUID REFERENCES sets(id),
  parallel_id UUID REFERENCES parallels(id),

  -- Cost basis
  purchase_price DECIMAL(10,2) DEFAULT 0,
  purchase_tax DECIMAL(10,2) DEFAULT 0,
  shipping_paid DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) GENERATED ALWAYS AS (purchase_price + purchase_tax + shipping_paid) STORED,

  -- Purchase info
  purchase_date DATE,
  purchase_source TEXT,
  purchase_platform TEXT,

  -- Card details
  image_url TEXT,
  grade TEXT,
  grading_company TEXT,
  cert_number TEXT,
  notes TEXT,

  -- Status
  status TEXT DEFAULT 'owned',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions (sales, trades)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES inventory(id) ON DELETE SET NULL,

  type TEXT NOT NULL,
  platform TEXT,

  -- Sale details
  gross_amount DECIMAL(10,2),
  platform_fee_pct DECIMAL(5,2),
  platform_fees DECIMAL(10,2),
  shipping_cost DECIMAL(10,2),
  net_amount DECIMAL(10,2),

  -- Profit calculation
  cost_basis DECIMAL(10,2),
  profit DECIMAL(10,2),
  roi_pct DECIMAL(5,2),

  transaction_date DATE,
  buyer_username TEXT,
  tracking_number TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grail goals
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  player_name TEXT NOT NULL,
  card_description TEXT,
  set_name TEXT,
  parallel_name TEXT,

  target_price DECIMAL(10,2) NOT NULL,
  current_funding DECIMAL(10,2) DEFAULT 0,

  target_image_url TEXT,
  ebay_search_url TEXT,

  status TEXT DEFAULT 'active',
  achieved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform fee presets
CREATE TABLE platform_fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT UNIQUE NOT NULL,
  fee_percentage DECIMAL(5,2) NOT NULL,
  payment_processing_pct DECIMAL(5,2) DEFAULT 0,
  notes TEXT
);

-- Insert default platform fees
INSERT INTO platform_fees (platform, fee_percentage, payment_processing_pct, notes) VALUES
  ('ebay', 13.25, 0, 'Final value fee including payment processing'),
  ('whatnot', 9.9, 2.9, 'Seller fee + payment processing'),
  ('mercari', 10, 2.9, 'Seller fee + payment processing'),
  ('comc', 5, 2.5, 'Consignment fee'),
  ('myslabs', 10, 0, 'Seller fee'),
  ('private', 0, 0, 'No fees for private sales');

-- Create indexes for performance
CREATE INDEX idx_inventory_user ON inventory(user_id);
CREATE INDEX idx_inventory_player ON inventory(player_name);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_parallels_set ON parallels(set_id);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only see their own data
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can view own inventory"
  ON inventory FOR SELECT
  USING (user_id IN (
    SELECT id FROM profiles WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can insert own inventory"
  ON inventory FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM profiles WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can update own inventory"
  ON inventory FOR UPDATE
  USING (user_id IN (
    SELECT id FROM profiles WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can delete own inventory"
  ON inventory FOR DELETE
  USING (user_id IN (
    SELECT id FROM profiles WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (user_id IN (
    SELECT id FROM profiles WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM profiles WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  USING (user_id IN (
    SELECT id FROM profiles WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can manage own goals"
  ON goals FOR ALL
  USING (user_id IN (
    SELECT id FROM profiles WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

-- Public read access for sets and parallels (metadata)
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE parallels ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sets" ON sets FOR SELECT USING (true);
CREATE POLICY "Anyone can view parallels" ON parallels FOR SELECT USING (true);
CREATE POLICY "Anyone can view platform fees" ON platform_fees FOR SELECT USING (true);

-- Function to create profile on first login
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (clerk_id, email)
  VALUES (NEW.clerk_id, NEW.email)
  ON CONFLICT (clerk_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
