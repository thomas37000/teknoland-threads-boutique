-- Remove overly permissive policies on products / teknoland-img
DROP POLICY IF EXISTS "Allow authenticated users to upload products images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated sellers can upload images 1ifhysk_0" ON storage.objects;
DROP POLICY IF EXISTS "Give admin access to modify images frf398_0" ON storage.objects;
DROP POLICY IF EXISTS "Give admin access to modify images frf398_1" ON storage.objects;
DROP POLICY IF EXISTS "Give admin access to modify images frf398_2" ON storage.objects;

-- Admins and sellers can upload
CREATE POLICY "Admins and sellers can upload product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = ANY (ARRAY['products','teknoland-img'])
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'seller'))
);

CREATE POLICY "Admins and sellers can update product images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = ANY (ARRAY['products','teknoland-img'])
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'seller'))
)
WITH CHECK (
  bucket_id = ANY (ARRAY['products','teknoland-img'])
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'seller'))
);

CREATE POLICY "Admins and sellers can delete product images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = ANY (ARRAY['products','teknoland-img'])
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'seller'))
);

-- Scope owner delete policy to the site's image buckets
DROP POLICY IF EXISTS "Owner can delete own images" ON storage.objects;
CREATE POLICY "Owner can delete own images"
ON storage.objects FOR DELETE TO authenticated
USING (
  auth.uid() = owner
  AND bucket_id = ANY (ARRAY['products','teknoland-img','stickers','vinyles','sweats','tshirts'])
);
