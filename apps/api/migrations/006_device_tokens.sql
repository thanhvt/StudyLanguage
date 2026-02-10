-- =====================================================
-- Migration 006: Bảng device_tokens
-- Mục đích: Lưu FCM/APNs token cho push notifications
-- Khi nào sử dụng: Notifications Module
-- =====================================================

CREATE TABLE IF NOT EXISTS device_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform VARCHAR(10) NOT NULL CHECK (platform IN ('ios', 'android')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_device_token UNIQUE (user_id, token)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);

-- Bật RLS
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own device tokens" ON device_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own device tokens" ON device_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own device tokens" ON device_tokens
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on device_tokens" ON device_tokens
  FOR ALL USING (auth.role() = 'service_role');

-- Auto-update trigger
CREATE TRIGGER trigger_device_tokens_updated_at
  BEFORE UPDATE ON device_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE device_tokens IS 'FCM/APNs tokens cho push notifications';
