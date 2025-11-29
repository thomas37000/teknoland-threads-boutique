-- Enable unaccent extension if not already enabled
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS generate_product_slug ON products;

-- Create or replace the slug generation function with proper accent handling
CREATE OR REPLACE FUNCTION public.generate_product_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
declare
  base_slug text;
  temp_slug text;
  counter int := 1;
begin
  -- Generate slug from name using unaccent to remove accents properly
  base_slug := lower(
    regexp_replace(
      unaccent(trim(new.name)),  -- Remove accents and trim whitespace
      '[^a-z0-9]+', '-', 'g'     -- Replace non-alphanumeric with hyphens
    )
  );
  
  -- Remove leading and trailing hyphens
  base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
  
  temp_slug := base_slug;

  -- Loop to ensure uniqueness
  while exists (select 1 from products p where p.slug = temp_slug and p.id <> new.id) loop
    counter := counter + 1;
    temp_slug := base_slug || '-' || counter;
  end loop;

  new.slug := temp_slug;
  return new;
end;
$$;

-- Create trigger on products table
CREATE TRIGGER generate_product_slug
  BEFORE INSERT OR UPDATE OF name ON products
  FOR EACH ROW
  EXECUTE FUNCTION generate_product_slug();