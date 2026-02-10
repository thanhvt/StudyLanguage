-- =====================================================
-- Migration 002: Bảng user_settings
-- Mục đích: Sync settings across devices (JSON blob)
-- Khi nào sử dụng: Profile & Settings sync
-- =====================================================

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Bật RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on settings" ON user_settings
  FOR ALL USING (auth.role() = 'service_role');

-- Auto-update trigger
CREATE TRIGGER trigger_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE user_settings IS 'Settings đồng bộ của user dạng JSON blob';
