-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow all operations on contacts" ON public.contacts;

-- Allow anyone to insert contact messages (public contact form)
CREATE POLICY "Anyone can submit contact messages"
ON public.contacts
FOR INSERT
TO public
WITH CHECK (true);

-- Only admins can view contact messages
CREATE POLICY "Admins can view all contacts"
ON public.contacts
FOR SELECT
TO authenticated
USING (get_current_user_role() = 'admin');

-- Only admins can update contact messages (mark as read, etc.)
CREATE POLICY "Admins can update contacts"
ON public.contacts
FOR UPDATE
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- Only admins can delete contact messages
CREATE POLICY "Admins can delete contacts"
ON public.contacts
FOR DELETE
TO authenticated
USING (get_current_user_role() = 'admin');