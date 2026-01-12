-- ================================================
-- HISTORY MANAGEMENT FEATURE MIGRATION
-- Date: 2026-01-12
-- Purpose: Thêm các columns cho tính năng quản lý lịch sử
-- ================================================

-- 1. Thêm columns cho history management vào bảng lessons
ALTER TABLE public.lessons 
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. Indexes cho performance
-- Index cho các bản ghi được pin (filter nhanh)
CREATE INDEX IF NOT EXISTS idx_lessons_pinned 
  ON public.lessons(is_pinned) 
  WHERE is_pinned = TRUE;

-- Index cho các bản ghi yêu thích
CREATE INDEX IF NOT EXISTS idx_lessons_favorite 
  ON public.lessons(is_favorite) 
  WHERE is_favorite = TRUE;

-- Index cho soft delete (tìm bản ghi đã xóa)
CREATE INDEX IF NOT EXISTS idx_lessons_deleted 
  ON public.lessons(deleted_at) 
  WHERE deleted_at IS NOT NULL;

-- Composite index cho filter theo user + type + status
CREATE INDEX IF NOT EXISTS idx_lessons_history_filter 
  ON public.lessons(user_id, type, created_at DESC) 
  WHERE deleted_at IS NULL;

-- 3. Thêm comment cho documentation
COMMENT ON COLUMN public.lessons.is_pinned IS 'Đánh dấu bài học được ghim, hiển thị ở đầu danh sách';
COMMENT ON COLUMN public.lessons.is_favorite IS 'Đánh dấu bài học yêu thích';
COMMENT ON COLUMN public.lessons.deleted_at IS 'Thời điểm xóa mềm, NULL nếu chưa xóa';

-- ================================================
-- END OF MIGRATION
-- ================================================
