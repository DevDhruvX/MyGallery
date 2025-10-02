-- SUPABASE STORAGE SETUP FOR PROFILE IMAGES
-- Run this in your Supabase SQL Editor to create the missing profile-images bucket

-- 1. CREATE PROFILE IMAGES BUCKET
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
);

-- 2. CREATE STORAGE POLICIES FOR PROFILE IMAGES

-- Allow public viewing of profile images
CREATE POLICY "Allow public viewing of profile images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

-- Allow authenticated users to upload their own profile images
CREATE POLICY "Allow users to upload their own profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own profile images
CREATE POLICY "Allow users to update their own profile images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own profile images
CREATE POLICY "Allow users to delete their own profile images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3. VERIFY BUCKET CREATION
-- Run this to check if bucket was created successfully
SELECT * FROM storage.buckets WHERE id = 'profile-images';

-- 4. VERIFY POLICIES
-- Run this to check if policies were created
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%profile%';

-- NOTES:
-- - This creates a public bucket for profile images (images can be viewed by anyone)
-- - Users can only upload/update/delete their own profile images (organized by user ID folder)
-- - 5MB file size limit for profile images
-- - Supports common image formats: JPEG, PNG, WebP
-- - File structure will be: profile-images/{user_id}/profile.jpg