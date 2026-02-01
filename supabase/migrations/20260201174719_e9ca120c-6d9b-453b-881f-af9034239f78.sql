-- Fix overly permissive INSERT policies by adding basic constraints
-- These tables legitimately need public INSERT access but should have some validation

-- 1. Drop and recreate contacts INSERT policy with email format check
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contacts;

CREATE POLICY "Anyone can submit contact messages" 
ON public.contacts 
FOR INSERT 
WITH CHECK (
  -- Require valid email format (basic check)
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  -- Require non-empty required fields
  AND length(trim(name)) > 0
  AND length(trim(subject)) > 0
  AND length(trim(message)) > 0
  -- Limit message length to prevent abuse
  AND length(message) <= 5000
);

-- 2. Drop and recreate newsletter_subscriptions INSERT policy with email format check
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions;

CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscriptions 
FOR INSERT 
WITH CHECK (
  -- Require valid email format
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  -- Ensure confirmation token is provided
  AND length(confirmation_token) > 0
  -- New subscriptions should not be confirmed yet
  AND confirmed = false
  AND unsubscribed = false
);