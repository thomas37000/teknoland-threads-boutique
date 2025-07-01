
-- Lovable ID : 20250621142159-b91eee4a-0de5-4366-975c-2389ea66da4a

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shop_filters table
CREATE TABLE public.shop_filters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('category', 'price', 'size', 'color', 'stock', 'brand')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  options TEXT[], -- Array of filter options
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.categories (name, slug, description, is_active, display_order) VALUES
('T-Shirts Hommes', 'man', 'T-shirts pour hommes', true, 1),
('T-Shirts Femmes', 'women', 'T-shirts pour femmes', true, 2),
('Sweats', 'sweats', 'Sweats et hoodies', true, 3),
('Vinyles', 'vinyls', 'Collection de vinyles', true, 4);

-- Insert default shop filters
INSERT INTO public.shop_filters (name, type, is_active, display_order, options) VALUES
('Catégorie', 'category', true, 1, NULL),
('Prix', 'price', true, 2, NULL),
('Taille', 'size', true, 3, ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL']),
('Couleur', 'color', true, 4, ARRAY['Noir', 'Blanc', 'Rouge', 'Bleu', 'Vert']),
('Stock', 'stock', true, 5, NULL);

-- Enable Row Level Security (optional - you can make these tables public for now)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_filters ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for now (you can restrict later)
CREATE POLICY "Allow all operations on categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Allow all operations on shop_filters" ON public.shop_filters FOR ALL USING (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_shop_filters_updated_at BEFORE UPDATE ON public.shop_filters FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
