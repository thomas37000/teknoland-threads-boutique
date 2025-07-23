-- Add mois column to depenses_mois table if it doesn't exist
ALTER TABLE public.depenses_mois 
ADD COLUMN IF NOT EXISTS mois TEXT DEFAULT '';

-- Add seller_id column to products table for marketplace functionality  
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES profiles(id);

-- Update profiles table to support seller role
UPDATE public.profiles 
SET roles = 'seller' 
WHERE roles IS NULL;

-- Create index for better performance on seller products
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);

-- Update RLS policies for products to allow sellers to manage their own products
DROP POLICY IF EXISTS "Allow users to insert products" ON public.products;
DROP POLICY IF EXISTS "Allow users to update their products" ON public.products;
DROP POLICY IF EXISTS "Allow users to delete their products" ON public.products;

-- Create new policies for marketplace
CREATE POLICY "Sellers can insert their own products" ON public.products
FOR INSERT 
WITH CHECK (auth.uid() = seller_id OR get_current_user_role() = 'admin');

CREATE POLICY "Sellers can update their own products" ON public.products
FOR UPDATE 
USING (auth.uid() = seller_id OR get_current_user_role() = 'admin');

CREATE POLICY "Sellers can delete their own products" ON public.products
FOR DELETE 
USING (auth.uid() = seller_id OR get_current_user_role() = 'admin');