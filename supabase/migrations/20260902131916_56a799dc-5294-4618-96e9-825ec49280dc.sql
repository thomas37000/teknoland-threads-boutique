ALTER TABLE public.discogs_releases
  ADD COLUMN IF NOT EXISTS num_for_sale integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lowest_price numeric;