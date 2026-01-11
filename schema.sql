-- Card sales database schema
CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  sale_price REAL NOT NULL,
  sale_price_currency TEXT DEFAULT 'USD',
  current_price REAL,
  current_price_currency TEXT DEFAULT 'USD',
  best_offer_price REAL,
  best_offer_currency TEXT DEFAULT 'USD',
  sale_type TEXT NOT NULL, -- 'auction', 'fixedprice', 'bestoffer'
  bids INTEGER DEFAULT 0,
  image_url TEXT,
  sale_date TEXT NOT NULL,
  shipping_cost REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_item_id ON sales(item_id);
CREATE INDEX IF NOT EXISTS idx_sale_date ON sales(sale_date DESC);

-- Search cache table - tracks what queries we've already fetched
CREATE TABLE IF NOT EXISTS search_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT NOT NULL,
  search_type TEXT NOT NULL, -- 'sold_items', 'for_sale'
  last_fetched TEXT DEFAULT CURRENT_TIMESTAMP,
  result_count INTEGER DEFAULT 0,
  UNIQUE(query, search_type)
);

CREATE INDEX IF NOT EXISTS idx_search_query ON search_cache(query, search_type);
