-- ============================================================
-- SUPABASE STORAGE - Avatars Bucket
-- Run this in Supabase SQL Editor
-- ============================================================

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'avatars'
    AND auth.uid()::text = REPLACE(REPLACE(name, 'avatars/', ''), '.png', '')
       OR auth.uid()::text = REPLACE(REPLACE(name, 'avatars/', ''), '.jpg', '')
       OR auth.uid()::text = REPLACE(REPLACE(name, 'avatars/', ''), '.jpeg', '')
       OR auth.uid()::text = REPLACE(REPLACE(name, 'avatars/', ''), '.webp', '')
  );

-- Allow anyone to view avatars (public bucket)
CREATE POLICY "Public read access for avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = REPLACE(REPLACE(name, 'avatars/', ''), '.png', '')
       OR auth.uid()::text = REPLACE(REPLACE(name, 'avatars/', ''), '.jpg', '')
       OR auth.uid()::text = REPLACE(REPLACE(name, 'avatars/', ''), '.jpeg', '')
       OR auth.uid()::text = REPLACE(REPLACE(name, 'avatars/', ''), '.webp', '')
  );

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = REPLACE(REPLACE(name, 'avatars/', ''), '.png', '')
       OR auth.uid()::text = REPLACE(REPLACE(name, 'avatars/', ''), '.jpg', '')
       OR auth.uid()::text = REPLACE(REPLACE(name, 'avatars/', ''), '.jpeg', '')
       OR auth.uid()::text = REPLACE(REPLACE(name, 'avatars/', ''), '.webp', '')
  );
