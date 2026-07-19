/*
# Create public images bucket for founder/about photos

## Why
The admin needs to upload real photos of the team (founders + about page hero)
instead of pasting external URLs. Supabase Storage gives us a bucket to hold
 those uploads, served over the project's CDN.

## Changes
- Create a PUBLIC storage bucket named `images` (no size limit override).
- Storage Object policies: anyone can READ; only authenticated users can WRITE.
  Public read is needed because founders/about pages are public.

## Data safety
- Additive only. No tables touched, no data dropped.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for the images bucket
DROP POLICY IF EXISTS "anon_read_images" ON storage.objects;
CREATE POLICY "anon_read_images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'images');

-- Authenticated can upload into images
DROP POLICY IF EXISTS "auth_insert_images" ON storage.objects;
CREATE POLICY "auth_insert_images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'images');

-- Authenticated can update their own uploads (for re-uploads)
DROP POLICY IF EXISTS "auth_update_images" ON storage.objects;
CREATE POLICY "auth_update_images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'images')
  WITH CHECK (bucket_id = 'images');

-- Authenticated can delete uploads
DROP POLICY IF EXISTS "auth_delete_images" ON storage.objects;
CREATE POLICY "auth_delete_images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'images');
