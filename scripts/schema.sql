-- Card Catalog Schema for Card Comps
-- Stores checklist data scraped from Cardboard Connection

-- Sets table - stores card sets/products
CREATE TABLE IF NOT EXISTS card_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- "2022-23 Panini Prizm Basketball"
  year TEXT NOT NULL,                    -- "2022-23"
  sport TEXT NOT NULL DEFAULT 'basketball',
  manufacturer TEXT,                     -- "Panini"
  product_line TEXT,                     -- "Prizm"
  source_url TEXT,                       -- Cardboard Connection URL
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, year, sport)
);

-- Cards table - individual cards from checklists
CREATE TABLE IF NOT EXISTS card_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID REFERENCES card_sets(id) ON DELETE CASCADE,
  card_number TEXT,                      -- "1", "RC-1", "AU-25"
  player_name TEXT NOT NULL,
  team TEXT,
  subset_name TEXT,                      -- "Base", "Rookies", "Fearless", "Signatures"
  is_rookie BOOLEAN DEFAULT FALSE,
  is_autograph BOOLEAN DEFAULT FALSE,
  is_insert BOOLEAN DEFAULT FALSE,
  is_parallel BOOLEAN DEFAULT FALSE,
  parallel_name TEXT,                    -- "Silver", "Gold /10", etc.
  print_run INTEGER,                     -- NULL for unlimited, number for limited
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- For faster searches
  search_text TEXT GENERATED ALWAYS AS (
    LOWER(player_name || ' ' || COALESCE(team, '') || ' ' || COALESCE(subset_name, ''))
  ) STORED
);

-- Indexes for fast search
CREATE INDEX IF NOT EXISTS idx_card_catalog_player ON card_catalog(player_name);
CREATE INDEX IF NOT EXISTS idx_card_catalog_search ON card_catalog USING GIN(search_text gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_card_catalog_set ON card_catalog(set_id);
CREATE INDEX IF NOT EXISTS idx_card_sets_year ON card_sets(year);
CREATE INDEX IF NOT EXISTS idx_card_sets_sport ON card_sets(sport);

-- Enable trigram extension for fuzzy search (run once as superuser)
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Example queries:
--
-- Search for a player:
-- SELECT c.*, s.name as set_name, s.year
-- FROM card_catalog c
-- JOIN card_sets s ON c.set_id = s.id
-- WHERE c.search_text LIKE '%wembanyama%'
-- ORDER BY s.year DESC;
--
-- Get all cards in a set:
-- SELECT * FROM card_catalog WHERE set_id = 'uuid' ORDER BY card_number;
--
-- Get all rookie cards for a player:
-- SELECT c.*, s.name as set_name
-- FROM card_catalog c
-- JOIN card_sets s ON c.set_id = s.id
-- WHERE c.player_name ILIKE '%banchero%' AND c.is_rookie = true;
