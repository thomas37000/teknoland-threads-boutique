ALTER TABLE public.discogs_stats_history
  ADD COLUMN IF NOT EXISTS for_sale_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delta_for_sale integer NOT NULL DEFAULT 0;

ALTER TABLE public.discogs_sync_state
  ADD COLUMN IF NOT EXISTS unseen_for_sale_delta integer NOT NULL DEFAULT 0;