-- Remove permissive client-side INSERT policies: orders are created only by
-- service-role edge functions after Stripe verification.
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;

-- Revoke client insert privileges (service_role bypasses RLS).
REVOKE INSERT ON public.orders FROM authenticated, anon;
REVOKE INSERT ON public.order_items FROM authenticated, anon;

GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.order_items TO service_role;