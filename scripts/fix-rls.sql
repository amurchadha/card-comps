-- Fix RLS warnings for card_catalog and card_sets
-- Run this in Supabase SQL Editor

-- Enable RLS on card_catalog
ALTER TABLE public.card_catalog ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read card_catalog (it's public reference data)
CREATE POLICY "Allow public read access to card_catalog"
ON public.card_catalog
FOR SELECT
TO public
USING (true);

-- Enable RLS on card_sets
ALTER TABLE public.card_sets ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read card_sets (it's public reference data)
CREATE POLICY "Allow public read access to card_sets"
ON public.card_sets
FOR SELECT
TO public
USING (true);

-- Allow service role full access (for scrapers)
CREATE POLICY "Allow service role full access to card_catalog"
ON public.card_catalog
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role full access to card_sets"
ON public.card_sets
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
