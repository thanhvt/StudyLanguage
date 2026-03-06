-- ============================================
-- Migration: Custom Categories
-- Cho phép users tạo nhóm chủ đề (categories) riêng
-- Và gán custom scenarios vào các nhóm đó
-- ============================================

-- 1. Bảng custom_categories — nhóm chủ đề do user tạo
CREATE TABLE IF NOT EXISTS custom_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(25) NOT NULL,
  icon VARCHAR(20) NOT NULL DEFAULT '📂',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Mỗi user không được tạo tên nhóm trùng nhau
  UNIQUE(user_id, name)
);

-- 2. Enable RLS cho custom_categories
ALTER TABLE custom_categories ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies — user chỉ CRUD dữ liệu của mình
CREATE POLICY "Users can view own custom_categories" ON custom_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom_categories" ON custom_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom_categories" ON custom_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom_categories" ON custom_categories
  FOR DELETE USING (auth.uid() = user_id);

-- Service role bypass RLS
CREATE POLICY "Service role can manage custom_categories" ON custom_categories
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 4. Indexes tối ưu query
CREATE INDEX IF NOT EXISTS idx_custom_categories_user ON custom_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_categories_created ON custom_categories(user_id, created_at ASC);

-- 5. Thêm cột category_id vào custom_scenarios — FK tới custom_categories
-- NULL = thuộc nhóm "Other" (mặc định)
ALTER TABLE custom_scenarios
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES custom_categories(id) ON DELETE SET NULL;

-- 6. Index cho việc filter scenarios theo category
CREATE INDEX IF NOT EXISTS idx_custom_scenarios_category ON custom_scenarios(category_id);

-- ============================================
-- END OF MIGRATION
-- ============================================
