
-- Table compteur mensuel des appels Airtable
CREATE TABLE IF NOT EXISTS public.airtable_usage (
  month text PRIMARY KEY,
  count bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.airtable_usage TO authenticated;
GRANT ALL ON public.airtable_usage TO service_role;

ALTER TABLE public.airtable_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read airtable usage"
  ON public.airtable_usage
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Quota mensuel configurable
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS airtable_monthly_quota integer NOT NULL DEFAULT 1000;

-- Fonction d'incrément atomique (utilisée par l'edge function via service role)
CREATE OR REPLACE FUNCTION public.increment_airtable_usage(_delta integer DEFAULT 1)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_month text := to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM');
  new_count bigint;
BEGIN
  INSERT INTO public.airtable_usage (month, count, updated_at)
  VALUES (current_month, GREATEST(_delta, 0), now())
  ON CONFLICT (month) DO UPDATE
    SET count = public.airtable_usage.count + GREATEST(_delta, 0),
        updated_at = now()
  RETURNING count INTO new_count;
  RETURN new_count;
END;
$$;
