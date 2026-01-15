-- ============================================
-- Migration: Add audio_url columns
-- Lưu trữ audio URL để không cần sinh lại khi xem lịch sử
-- ============================================

-- 1. Thêm column audio_url vào bảng listen_later
ALTER TABLE public.listen_later 
ADD COLUMN IF NOT EXISTS audio_url TEXT;

COMMENT ON COLUMN public.listen_later.audio_url IS 'URL của audio đã sinh, lưu trên Supabase Storage để tái sử dụng';

-- 2. Thêm column audio_url vào bảng playlist_items
ALTER TABLE public.playlist_items 
ADD COLUMN IF NOT EXISTS audio_url TEXT;

COMMENT ON COLUMN public.playlist_items.audio_url IS 'URL của audio đã sinh, lưu trên Supabase Storage để tái sử dụng';

-- 3. Thêm column audio_timestamps vào lessons để lưu timing sync với transcript
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS audio_timestamps JSONB;

COMMENT ON COLUMN public.lessons.audio_timestamps IS 'Timestamps của từng câu trong audio [{startTime, endTime}]';

-- 4. Thêm column audio_timestamps vào listen_later
ALTER TABLE public.listen_later 
ADD COLUMN IF NOT EXISTS audio_timestamps JSONB;

COMMENT ON COLUMN public.listen_later.audio_timestamps IS 'Timestamps của từng câu trong audio [{startTime, endTime}]';

-- 5. Thêm column audio_timestamps vào playlist_items
ALTER TABLE public.playlist_items 
ADD COLUMN IF NOT EXISTS audio_timestamps JSONB;

COMMENT ON COLUMN public.playlist_items.audio_timestamps IS 'Timestamps của từng câu trong audio [{startTime, endTime}]';
