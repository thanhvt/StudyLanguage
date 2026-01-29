-- ============================================
-- Migration: Custom Scenarios
-- Cho phép users lưu scenarios tùy chỉnh của riêng mình
-- ============================================

-- 1. Bảng custom_scenarios
CREATE TABLE IF NOT EXISTS custom_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'custom',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE custom_scenarios ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own custom_scenarios" ON custom_scenarios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom_scenarios" ON custom_scenarios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom_scenarios" ON custom_scenarios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom_scenarios" ON custom_scenarios
  FOR DELETE USING (auth.uid() = user_id);

-- Service role bypass RLS
CREATE POLICY "Service role can manage custom_scenarios" ON custom_scenarios
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Indexes để tối ưu query
CREATE INDEX IF NOT EXISTS idx_custom_scenarios_user ON custom_scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_scenarios_created ON custom_scenarios(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_scenarios_favorite ON custom_scenarios(user_id, is_favorite);

-- ============================================
-- END OF MIGRATION
-- ============================================
