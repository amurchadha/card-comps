-- Migration: Add catalog linking to sales table
-- Run with: wrangler d1 execute cards-comp-db --file=migrations/001_add_catalog_link.sql

ALTER TABLE sales ADD COLUMN catalog_id TEXT;
ALTER TABLE sales ADD COLUMN set_id TEXT;
ALTER TABLE sales ADD COLUMN matched_at TEXT;

CREATE INDEX IF NOT EXISTS idx_catalog_id ON sales(catalog_id);
CREATE INDEX IF NOT EXISTS idx_set_id ON sales(set_id);
