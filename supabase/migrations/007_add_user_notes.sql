-- ================================================
-- ADD USER NOTES COLUMN MIGRATION
-- Date: 2026-01-15
-- Purpose: Thêm cột user_notes cho tính năng ghi chú cá nhân
-- ================================================

-- 1. Thêm column user_notes vào bảng lessons
ALTER TABLE public.lessons 
  ADD COLUMN IF NOT EXISTS user_notes TEXT;

-- 2. Index để tìm kiếm trong notes (nếu cần)
-- Không tạo index cho user_notes vì thường không search theo notes

-- 3. Comment documentation
COMMENT ON COLUMN public.lessons.user_notes IS 'Ghi chú cá nhân của user cho bài học. VD: "Bài này hay, cần học lại" hoặc "Phát âm từ entrepreneur vẫn sai"';

-- ================================================
-- END OF MIGRATION
-- ================================================
