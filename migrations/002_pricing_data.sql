-- 130point.com pricing data table
-- Stores historical eBay sold prices for cards

CREATE TABLE IF NOT EXISTS pricing_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  sale_price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  sale_date TEXT,
  sale_type TEXT,
  bids INTEGER DEFAULT 0,
  image_url TEXT,
  source TEXT DEFAULT '130point',
  search_query TEXT,

  -- Catalog linking
  catalog_id UUID REFERENCES card_catalog(id),
  set_id UUID REFERENCES card_sets(id),
  matched_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_pricing_title ON pricing_data USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_pricing_sale_date ON pricing_data(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_catalog ON pricing_data(catalog_id) WHERE catalog_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pricing_set ON pricing_data(set_id) WHERE set_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pricing_source ON pricing_data(source);

-- Enable RLS
ALTER TABLE pricing_data ENABLE ROW LEVEL SECURITY;

-- Public read access for pricing data
CREATE POLICY "Public read access for pricing_data"
  ON pricing_data FOR SELECT
  USING (true);

-- Service role full access
CREATE POLICY "Service role full access for pricing_data"
  ON pricing_data FOR ALL
  USING (auth.role() = 'service_role');
