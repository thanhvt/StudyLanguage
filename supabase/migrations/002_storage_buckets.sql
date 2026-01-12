-- ================================================
-- STORAGE BUCKETS SETUP
-- Chạy sau khi tạo tables
-- ================================================

-- 1. Bucket cho audio lessons (public - để stream audio)
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-lessons', 'audio-lessons', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Bucket cho user recordings (private - chỉ owner access)
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-recordings', 'audio-recordings', false)
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- STORAGE POLICIES
-- ================================================

-- audio-lessons: Public read, authenticated upload
CREATE POLICY "Public can view audio lessons"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-lessons');

CREATE POLICY "Authenticated users can upload audio lessons"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'audio-lessons' 
  AND auth.role() = 'authenticated'
);

-- audio-recordings: Only owner can access
CREATE POLICY "Users can view own recordings"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'audio-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload own recordings"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'audio-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own recordings"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'audio-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
