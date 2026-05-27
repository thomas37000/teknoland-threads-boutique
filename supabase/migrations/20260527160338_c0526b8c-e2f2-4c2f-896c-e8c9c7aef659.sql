
CREATE TABLE public.discogs_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id bigint NOT NULL UNIQUE,
  title text NOT NULL,
  artist text,
  year integer,
  thumbnail text,
  discogs_url text,
  current_collection_count integer NOT NULL DEFAULT 0,
  current_wantlist_count integer NOT NULL DEFAULT 0,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_discogs_releases_release_id ON public.discogs_releases(release_id);

GRANT SELECT ON public.discogs_releases TO authenticated;
GRANT ALL ON public.discogs_releases TO service_role;

ALTER TABLE public.discogs_releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view discogs_releases" ON public.discogs_releases
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert discogs_releases" ON public.discogs_releases
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update discogs_releases" ON public.discogs_releases
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete discogs_releases" ON public.discogs_releases
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_discogs_releases_updated_at
  BEFORE UPDATE ON public.discogs_releases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


CREATE TABLE public.discogs_stats_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id bigint NOT NULL,
  collection_count integer NOT NULL DEFAULT 0,
  wantlist_count integer NOT NULL DEFAULT 0,
  delta_collection integer NOT NULL DEFAULT 0,
  delta_wantlist integer NOT NULL DEFAULT 0,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_discogs_stats_release_recorded ON public.discogs_stats_history(release_id, recorded_at DESC);

GRANT SELECT ON public.discogs_stats_history TO authenticated;
GRANT ALL ON public.discogs_stats_history TO service_role;

ALTER TABLE public.discogs_stats_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view discogs_stats_history" ON public.discogs_stats_history
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));


CREATE TABLE public.discogs_sync_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  last_full_sync_at timestamptz,
  last_stats_sync_at timestamptz,
  last_stats_cursor integer NOT NULL DEFAULT 0,
  unseen_collection_delta integer NOT NULL DEFAULT 0,
  unseen_wantlist_delta integer NOT NULL DEFAULT 0,
  last_admin_viewed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.discogs_sync_state (singleton) VALUES (true);

GRANT SELECT ON public.discogs_sync_state TO authenticated;
GRANT ALL ON public.discogs_sync_state TO service_role;

ALTER TABLE public.discogs_sync_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view discogs_sync_state" ON public.discogs_sync_state
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update discogs_sync_state" ON public.discogs_sync_state
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_discogs_sync_state_updated_at
  BEFORE UPDATE ON public.discogs_sync_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
