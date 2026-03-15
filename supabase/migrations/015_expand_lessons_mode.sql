-- ================================================
-- MIGRATION 015: Mở rộng cột mode trong bảng lessons
--
-- Mục đích: Cho phép lưu các speaking mode mới:
--   - conversation-freetalk (22 ký tự — vượt VARCHAR(20) cũ)
--   - conversation-roleplay (22 ký tự)
--   - shadowing, tongue-twister, practice
--
-- Lỗi gốc: PostgreSQL error 22001 "value too long for type character varying(20)"
-- ================================================

-- 1. Mở rộng VARCHAR(20) → VARCHAR(50) để chứa tên mode dài hơn
ALTER TABLE public.lessons
  ALTER COLUMN mode TYPE VARCHAR(50);

-- 2. Xóa CHECK constraint cũ (chỉ cho 'passive', 'interactive')
ALTER TABLE public.lessons
  DROP CONSTRAINT IF EXISTS lessons_mode_check;

-- 3. Thêm CHECK constraint mới bao gồm tất cả speaking modes
ALTER TABLE public.lessons
  ADD CONSTRAINT lessons_mode_check
  CHECK (mode IN (
    'passive',
    'interactive',
    'practice',
    'shadowing',
    'tongue-twister',
    'conversation-freetalk',
    'conversation-roleplay'
  ));

-- 4. Cập nhật comment
COMMENT ON COLUMN public.lessons.mode IS 'Chế độ bài học: passive, interactive, practice, shadowing, tongue-twister, conversation-freetalk, conversation-roleplay';
