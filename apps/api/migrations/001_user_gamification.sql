-- =====================================================
-- Migration 001: Bảng user_gamification
-- Mục đích: Lưu trữ XP, level, badges, goals của user
-- Khi nào sử dụng: Dashboard stats, Speaking gamification
-- =====================================================

-- Tạo bảng gamification
CREATE TABLE IF NOT EXISTS user_gamification (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges JSONB DEFAULT '[]'::jsonb,
  daily_goal_minutes INTEGER DEFAULT 10,
  speaking_goal INTEGER DEFAULT 5,
  total_sessions INTEGER DEFAULT 0,
  total_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_gamification UNIQUE (user_id)
);

-- Index cho tra cứu nhanh theo user
CREATE INDEX IF NOT EXISTS idx_user_gamification_user_id ON user_gamification(user_id);

-- Bật RLS (Row Level Security)
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;

-- Policy: Chỉ user sở hữu mới đọc/ghi được
CREATE POLICY "Users can view own gamification" ON user_gamification
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification" ON user_gamification
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gamification" ON user_gamification
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Cho phép service role truy cập (backend API dùng service role key)
CREATE POLICY "Service role full access on gamification" ON user_gamification
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_gamification_updated_at
  BEFORE UPDATE ON user_gamification
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comment mô tả bảng
COMMENT ON TABLE user_gamification IS 'Dữ liệu gamification của user: XP, level, badges, goals';
