-- Fix overly permissive RLS policies for categories table
DROP POLICY IF EXISTS "Allow all operations on categories" ON public.categories;

-- Create proper policies for categories
CREATE POLICY "Anyone can view categories" 
ON public.categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert categories" 
ON public.categories 
FOR INSERT 
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admins can update categories" 
ON public.categories 
FOR UPDATE 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete categories" 
ON public.categories 
FOR DELETE 
USING (get_current_user_role() = 'admin');

-- Fix overly permissive RLS policies for shop_filters table
DROP POLICY IF EXISTS "Allow all operations on shop_filters" ON public.shop_filters;

-- Create proper policies for shop_filters
CREATE POLICY "Anyone can view shop_filters" 
ON public.shop_filters 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert shop_filters" 
ON public.shop_filters 
FOR INSERT 
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admins can update shop_filters" 
ON public.shop_filters 
FOR UPDATE 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete shop_filters" 
ON public.shop_filters 
FOR DELETE 
USING (get_current_user_role() = 'admin');