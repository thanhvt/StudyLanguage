-- ============================================
-- Migration: Sentence Bookmarks
-- Tạo bảng lưu bookmark câu trong bài nghe
-- Mục đích: Cho phép user long-press câu → lưu bookmark để ôn tập
-- ============================================

CREATE TABLE IF NOT EXISTS sentence_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Liên kết tới session nếu có (nullable, FK sẽ được thêm khi tạo bảng learning_history)
  history_entry_id UUID,
  
  -- Nội dung câu đã bookmark
  sentence_index INTEGER NOT NULL,           -- Vị trí câu trong transcript
  speaker TEXT NOT NULL DEFAULT '',          -- Tên người nói
  sentence_text TEXT NOT NULL,               -- Nội dung tiếng Anh
  sentence_translation TEXT,                 -- Bản dịch tiếng Việt (nếu có)
  
  -- Context
  topic TEXT,                                -- Chủ đề bài nghe
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE sentence_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON sentence_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON sentence_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON sentence_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Service role bypass RLS
CREATE POLICY "Service role can manage bookmarks" ON sentence_bookmarks
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Indexes để tối ưu query
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON sentence_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created ON sentence_bookmarks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_session ON sentence_bookmarks(user_id, history_entry_id);
