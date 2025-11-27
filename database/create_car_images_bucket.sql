-- Create storage bucket for car images
INSERT INTO storage.buckets (id, name, public)
VALUES ('car-images', 'car-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for car images bucket

-- Policy: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload car images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'car-images');

-- Policy: Allow public to view car images
CREATE POLICY "Public can view car images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'car-images');

-- Policy: Allow users to delete their own car images
CREATE POLICY "Users can delete their own car images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'car-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to update their own car images
CREATE POLICY "Users can update their own car images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'car-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
