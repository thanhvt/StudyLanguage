-- =====================================================
-- Migration 004: Bảng saved_words
-- Mục đích: Lưu từ vựng khi đọc (tap-to-translate)
-- Khi nào sử dụng: Reading Module - saved words CRUD
-- =====================================================

CREATE TABLE IF NOT EXISTS saved_words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word VARCHAR(200) NOT NULL,
  meaning TEXT,
  context TEXT, -- Câu chứa từ trong bài đọc gốc
  article_id UUID, -- Optional reference tới bài đọc
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saved_words_user_id ON saved_words(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_words_created_at ON saved_words(user_id, created_at DESC);

-- Bật RLS
ALTER TABLE saved_words ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own saved words" ON saved_words
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved words" ON saved_words
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved words" ON saved_words
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on saved_words" ON saved_words
  FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE saved_words IS 'Từ vựng đã lưu khi đọc bài (tap-to-translate)';
