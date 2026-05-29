
-- Generate or reuse a stable cron secret in Supabase Vault, and reschedule cron jobs
-- to pass it as an x-cron-secret header. The edge functions accept either an admin JWT
-- or a matching x-cron-secret.

DO $$
DECLARE
  v_secret text;
  v_id uuid;
BEGIN
  SELECT id INTO v_id FROM vault.secrets WHERE name = 'discogs_cron_secret' LIMIT 1;
  IF v_id IS NULL THEN
    v_secret := encode(extensions.gen_random_bytes(32), 'hex');
    PERFORM vault.create_secret(v_secret, 'discogs_cron_secret', 'Shared secret for discogs sync cron');
  END IF;
END $$;

-- Unschedule existing
DO $$ BEGIN PERFORM cron.unschedule('discogs-sync-stats-30min'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM cron.unschedule('discogs-sync-releases-daily'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule(
  'discogs-sync-stats-30min',
  '*/30 * * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://thwkmsuqkevfgqwlayqv.supabase.co/functions/v1/discogs-sync-stats',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2ttc3Vxa2V2Zmdxd2xheXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NTM4MDUsImV4cCI6MjA1OTUyOTgwNX0.uxyLw7U2wPTJIQssjXT_de8C_3nhge7ReJlFR1bj2g4',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'discogs_cron_secret' LIMIT 1)
    ),
    body := '{}'::jsonb
  );
  $cron$
);

SELECT cron.schedule(
  'discogs-sync-releases-daily',
  '0 3 * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://thwkmsuqkevfgqwlayqv.supabase.co/functions/v1/discogs-sync-releases',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2ttc3Vxa2V2Zmdxd2xheXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NTM4MDUsImV4cCI6MjA1OTUyOTgwNX0.uxyLw7U2wPTJIQssjXT_de8C_3nhge7ReJlFR1bj2g4',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'discogs_cron_secret' LIMIT 1)
    ),
    body := '{}'::jsonb
  );
  $cron$
);

-- Function readable by service_role only to fetch the cron secret from vault
CREATE OR REPLACE FUNCTION public.get_discogs_cron_secret()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'discogs_cron_secret' LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.get_discogs_cron_secret() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_discogs_cron_secret() TO service_role;
