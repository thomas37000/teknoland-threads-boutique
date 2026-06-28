
ALTER TABLE public.order_items ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS item_name text;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS item_image text;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS external_ref text;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS item_type text NOT NULL DEFAULT 'product';
