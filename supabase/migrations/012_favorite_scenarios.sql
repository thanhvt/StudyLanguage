-- Migration: favorite_scenarios
-- Tạo bảng lưu các scenario yêu thích của user
-- Khi nào sử dụng: User ghim/đánh dấu scenario để truy cập nhanh

CREATE TABLE IF NOT EXISTS favorite_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scenario_id VARCHAR(50) NOT NULL,  -- Matches scenario.id in topic-data.ts (e.g., 'it-1', 'daily-25')
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Đảm bảo mỗi user chỉ ghim 1 scenario 1 lần
  UNIQUE(user_id, scenario_id)
);

-- Index để query nhanh theo user
CREATE INDEX IF NOT EXISTS idx_favorite_scenarios_user_id ON favorite_scenarios(user_id);

-- RLS policies
ALTER TABLE favorite_scenarios ENABLE ROW LEVEL SECURITY;

-- User chỉ được xem favorite của mình
CREATE POLICY "Users can view their own favorites"
  ON favorite_scenarios FOR SELECT
  USING (auth.uid() = user_id);

-- User được phép insert favorite của mình
CREATE POLICY "Users can insert their own favorites"
  ON favorite_scenarios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User được phép xóa favorite của mình
CREATE POLICY "Users can delete their own favorites"
  ON favorite_scenarios FOR DELETE
  USING (auth.uid() = user_id);
