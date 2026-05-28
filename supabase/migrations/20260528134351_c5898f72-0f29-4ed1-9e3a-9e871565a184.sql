
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Cleanup éventuel
DO $$
BEGIN
  PERFORM cron.unschedule('discogs-sync-stats-30min');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.unschedule('discogs-sync-releases-daily');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'discogs-sync-stats-30min',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://thwkmsuqkevfgqwlayqv.supabase.co/functions/v1/discogs-sync-stats',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2ttc3Vxa2V2Zmdxd2xheXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NTM4MDUsImV4cCI6MjA1OTUyOTgwNX0.uxyLw7U2wPTJIQssjXT_de8C_3nhge7ReJlFR1bj2g4"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'discogs-sync-releases-daily',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://thwkmsuqkevfgqwlayqv.supabase.co/functions/v1/discogs-sync-releases',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2ttc3Vxa2V2Zmdxd2xheXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NTM4MDUsImV4cCI6MjA1OTUyOTgwNX0.uxyLw7U2wPTJIQssjXT_de8C_3nhge7ReJlFR1bj2g4"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
