-- Add catalog_id to inventory table for rainbow tracking
-- Run this in Supabase SQL Editor

-- Add catalog_id column to inventory table
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS catalog_id UUID REFERENCES card_catalog(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_inventory_catalog ON inventory(catalog_id) WHERE catalog_id IS NOT NULL;

-- Add unique constraint to prevent duplicate ownership entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_user_catalog
  ON inventory(user_id, catalog_id)
  WHERE catalog_id IS NOT NULL;
