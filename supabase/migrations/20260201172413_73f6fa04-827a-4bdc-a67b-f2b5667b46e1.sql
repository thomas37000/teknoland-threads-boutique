-- Fix search_path for all vulnerable functions

-- 1. update_updated_at_column - simple trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- 2. handle_new_user - SECURITY DEFINER, critical
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

-- 3. slugify - immutable text function
CREATE OR REPLACE FUNCTION public.slugify(input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
    result text;
BEGIN
    result := lower(input);

    result := translate(
        result,
        'àáâãäåāăąçćčďèéêëēĕėęěìíîïīĭįłñńňòóôõöøōŏőřśşšùúûüũūŭůýÿžźż',
        'aaaaaaaaacccdeeeeeeeeeiiiilnnoooooooorsssuuuuuuuyyz'
    );

    result := regexp_replace(result, '[^a-z0-9]+', '-', 'g');
    result := regexp_replace(result, '^-+|-+$', '', 'g');

    RETURN result;
END;
$$;

-- 4. generate_product_slug - trigger
CREATE OR REPLACE FUNCTION public.generate_product_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    base_slug text;
    temp_slug text;
    counter integer := 1;
BEGIN
    base_slug := public.slugify(NEW.name);
    temp_slug := base_slug;

    WHILE EXISTS (
        SELECT 1 FROM public.products p 
        WHERE p.slug = temp_slug 
        AND p.id <> NEW.id
    ) LOOP
        counter := counter + 1;
        temp_slug := base_slug || '-' || counter;
    END LOOP;

    NEW.slug := temp_slug;
    RETURN NEW;
END;
$$;

-- 5. generate_strict_slug - trigger version
CREATE OR REPLACE FUNCTION public.generate_strict_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base_slug text;
  exists_slug int;
BEGIN
  base_slug := regexp_replace(lower(NEW.name), '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  SELECT count(*) INTO exists_slug
  FROM public.products p
  WHERE p.slug = base_slug
    AND p.id <> NEW.id;

  IF exists_slug > 0 THEN
    RAISE EXCEPTION 'Un produit avec le même nom/slug (%) existe déjà', base_slug
      USING errcode = 'unique_violation';
  END IF;

  NEW.slug := base_slug;
  RETURN NEW;
END;
$$;

-- 6. generate_strict_slug(text) - text function version
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
              public.unaccent(input),
              '[^a-z0-9]+', '-', 'g'
            )
          );

  slug := regexp_replace(slug, '^-+|-+$', '', 'g');

  RETURN slug;
END;
$$;

-- 7. generate_unique_slug - trigger
CREATE OR REPLACE FUNCTION public.generate_unique_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base_slug text;
  temp_slug text;
  counter int := 1;
BEGIN
  base_slug := regexp_replace(lower(NEW.name), '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  temp_slug := base_slug;

  WHILE EXISTS (SELECT 1 FROM public.products p WHERE p.slug = temp_slug AND p.id <> NEW.id) LOOP
    counter := counter + 1;
    temp_slug := base_slug || '-' || counter;
  END LOOP;

  NEW.slug := temp_slug;
  RETURN NEW;
END;
$$;