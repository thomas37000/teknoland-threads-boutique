-- Allow public access to seller information for product display
CREATE POLICY "Allow public access to seller info for products" 
ON public.profiles 
FOR SELECT 
USING (roles = 'seller' OR roles = 'admin');