-- Migration: CardHedger pricing and market data
-- Adds comprehensive pricing, population, and market trend data from CardHedger API

-- Main pricing table - stores CardHedger card data with prices
CREATE TABLE IF NOT EXISTS card_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Card identification
  source_id TEXT UNIQUE,                    -- CardHedger's card ID (e.g., "mj-1986-fleer-57")
  player_name TEXT NOT NULL,
  year INTEGER,
  set_name TEXT NOT NULL,
  card_number TEXT,
  parallel TEXT,
  sport TEXT NOT NULL DEFAULT 'unknown',
  is_rookie BOOLEAN DEFAULT FALSE,
  print_run INTEGER,
  image_url TEXT,

  -- Link to our catalog if matched
  catalog_id UUID REFERENCES card_catalog(id),

  -- Pricing by grade (in USD)
  price_raw DECIMAL(12,2),
  price_psa_10 DECIMAL(12,2),
  price_psa_9 DECIMAL(12,2),
  price_psa_8 DECIMAL(12,2),
  price_bgs_10 DECIMAL(12,2),
  price_bgs_9_5 DECIMAL(12,2),
  price_bgs_9 DECIMAL(12,2),
  price_sgc_10 DECIMAL(12,2),
  price_sgc_9 DECIMAL(12,2),

  -- Last sale info
  last_sale_price DECIMAL(12,2),
  last_sale_grade TEXT,
  last_sale_date DATE,
  last_sale_marketplace TEXT,
  last_sale_auction_id TEXT,

  -- Market trends
  change_30d TEXT,                          -- "+15.2%"
  change_90d TEXT,
  change_1y TEXT,
  volume_30d INTEGER,                       -- Number of sales in last 30 days
  market_cap TEXT,                          -- "$2.4M"

  -- Population reports
  pop_psa_10 INTEGER,
  pop_psa_9 INTEGER,
  pop_psa_8 INTEGER,
  pop_bgs_10 INTEGER,
  pop_bgs_9_5 INTEGER,
  pop_bgs_9 INTEGER,
  pop_sgc_10 INTEGER,

  -- Source tracking
  source TEXT DEFAULT 'cardhedger',
  raw_data JSONB,                           -- Full API response for this card

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  prices_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price history table - track price changes over time
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_price_id UUID REFERENCES card_prices(id) ON DELETE CASCADE,

  -- Snapshot of prices at this point
  price_raw DECIMAL(12,2),
  price_psa_10 DECIMAL(12,2),
  price_psa_9 DECIMAL(12,2),
  price_psa_8 DECIMAL(12,2),

  -- Market data at snapshot time
  change_30d TEXT,
  volume_30d INTEGER,

  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_card_prices_player ON card_prices(player_name);
CREATE INDEX IF NOT EXISTS idx_card_prices_sport ON card_prices(sport);
CREATE INDEX IF NOT EXISTS idx_card_prices_year ON card_prices(year);
CREATE INDEX IF NOT EXISTS idx_card_prices_set ON card_prices(set_name);
CREATE INDEX IF NOT EXISTS idx_card_prices_source_id ON card_prices(source_id);
CREATE INDEX IF NOT EXISTS idx_card_prices_catalog ON card_prices(catalog_id) WHERE catalog_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_card_prices_rookie ON card_prices(is_rookie) WHERE is_rookie = TRUE;
CREATE INDEX IF NOT EXISTS idx_card_prices_psa10 ON card_prices(price_psa_10 DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_card_prices_volume ON card_prices(volume_30d DESC NULLS LAST);

-- Full text search on player + set
CREATE INDEX IF NOT EXISTS idx_card_prices_search ON card_prices
  USING GIN(to_tsvector('english', player_name || ' ' || set_name || ' ' || COALESCE(parallel, '')));

-- Price history index
CREATE INDEX IF NOT EXISTS idx_price_history_card ON price_history(card_price_id, recorded_at DESC);

-- Enable RLS
ALTER TABLE card_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Public read access (pricing data is not user-specific)
CREATE POLICY "Public read access for card_prices"
  ON card_prices FOR SELECT
  USING (true);

CREATE POLICY "Public read access for price_history"
  ON price_history FOR SELECT
  USING (true);

-- Service role full access for scraping
CREATE POLICY "Service role full access for card_prices"
  ON card_prices FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access for price_history"
  ON price_history FOR ALL
  USING (auth.role() = 'service_role');

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_card_prices_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- Track when prices specifically changed
  IF OLD.price_psa_10 IS DISTINCT FROM NEW.price_psa_10
     OR OLD.price_raw IS DISTINCT FROM NEW.price_raw THEN
    NEW.prices_updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER card_prices_updated_at
  BEFORE UPDATE ON card_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_card_prices_timestamp();

-- Helper view: Top movers (cards with biggest price changes)
CREATE OR REPLACE VIEW top_movers AS
SELECT
  id,
  player_name,
  year,
  set_name,
  parallel,
  sport,
  price_psa_10,
  change_30d,
  change_90d,
  volume_30d,
  pop_psa_10
FROM card_prices
WHERE change_30d IS NOT NULL
  AND volume_30d > 5
ORDER BY
  CASE
    WHEN change_30d LIKE '+%' THEN CAST(REPLACE(REPLACE(change_30d, '+', ''), '%', '') AS DECIMAL)
    WHEN change_30d LIKE '-%' THEN CAST(REPLACE(change_30d, '%', '') AS DECIMAL)
    ELSE 0
  END DESC
LIMIT 100;

-- Helper view: Most valuable cards by sport
CREATE OR REPLACE VIEW most_valuable_by_sport AS
SELECT
  sport,
  player_name,
  year,
  set_name,
  parallel,
  is_rookie,
  price_psa_10,
  pop_psa_10,
  volume_30d
FROM card_prices
WHERE price_psa_10 IS NOT NULL
ORDER BY sport, price_psa_10 DESC;

-- Sample queries:
--
-- Get all pricing for a player:
-- SELECT * FROM card_prices WHERE player_name ILIKE '%jordan%' ORDER BY price_psa_10 DESC NULLS LAST;
--
-- Get cards with high volume and positive momentum:
-- SELECT * FROM card_prices WHERE volume_30d > 10 AND change_30d LIKE '+%' ORDER BY volume_30d DESC;
--
-- Get rookie cards by value:
-- SELECT * FROM card_prices WHERE is_rookie = true ORDER BY price_psa_10 DESC NULLS LAST LIMIT 50;
--
-- Get cards with low pop high value (rare gems):
-- SELECT * FROM card_prices WHERE pop_psa_10 < 100 AND price_psa_10 > 1000 ORDER BY price_psa_10 DESC;
