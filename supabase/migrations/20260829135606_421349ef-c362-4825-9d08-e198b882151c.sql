-- 1. Ideas: drop policy trusting profiles.roles
DROP POLICY IF EXISTS "Admins can read ideas" ON public.ideas;

-- 2. Profiles: replace permissive self-update policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE OR REPLACE FUNCTION public.get_profile_roles(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT roles FROM public.profiles WHERE id = _user_id
$$;

REVOKE EXECUTE ON FUNCTION public.get_profile_roles(uuid) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.get_profile_roles(uuid) TO service_role;

CREATE POLICY "Users can update own profile without role change"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND roles IS NOT DISTINCT FROM public.get_profile_roles(auth.uid())
);

-- Admin update policy needs a WITH CHECK too
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Remove duplicate select policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable Select to users to login with their email" ON public.profiles;