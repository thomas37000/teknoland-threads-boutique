-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Drop the extension from public schema
DROP EXTENSION IF EXISTS unaccent;

-- Reinstall extension in the extensions schema
CREATE EXTENSION unaccent SCHEMA extensions;

-- Update the generate_strict_slug function to use the new schema path
CREATE OR REPLACE FUNCTION public.generate_strict_slug(input text)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  slug text;
BEGIN
  slug := lower(
            regexp_replace(
              extensions.unaccent(input),
              '[^a-z0-9]+', '-', 'g'
            )
          );

  slug := regexp_replace(slug, '^-+|-+$', '', 'g');

  RETURN slug;
END;
$$;