DROP POLICY IF EXISTS "Allow public to view products images" ON storage.objects;
DROP POLICY IF EXISTS "Give admin to select img from teknoland-img frf398_0" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for product images 1ifhysk_0" ON storage.objects;
DROP POLICY IF EXISTS "Public read access stickers and vinyls" ON storage.objects;
DROP POLICY IF EXISTS "Public read access sweats tshirts" ON storage.objects;

CREATE POLICY "Staff can list shop bucket files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id IN ('products','teknoland-img','stickers','vinyles','sweats','tshirts')
  AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'seller'))
);