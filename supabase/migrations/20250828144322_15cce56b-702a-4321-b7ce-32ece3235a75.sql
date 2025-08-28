-- Add variations column to products table
ALTER TABLE public.products 
ADD COLUMN variations JSONB DEFAULT NULL;

-- Add an index for better performance on variations queries
CREATE INDEX idx_products_variations ON public.products USING GIN(variations);