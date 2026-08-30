DROP POLICY IF EXISTS "Sellers can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Users can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can create products" ON public.products;
DROP POLICY IF EXISTS "Sellers and admins can create products" ON public.products;

CREATE POLICY "Sellers and admins can create products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR (auth.uid() = seller_id AND public.has_role(auth.uid(), 'seller'))
);