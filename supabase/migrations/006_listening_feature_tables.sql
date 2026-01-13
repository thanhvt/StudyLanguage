-- ============================================
-- Migration: Enhanced Listening Feature Tables
-- Tạo các bảng cho tính năng Listen Later và Playlists
-- ============================================

-- 1. Bảng lưu các items "Nghe Sau" 
CREATE TABLE IF NOT EXISTS listen_later (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  conversation JSONB NOT NULL,
  duration INTEGER NOT NULL DEFAULT 5,
  num_speakers INTEGER NOT NULL DEFAULT 2,
  category TEXT, -- 'it' | 'daily' | 'personal'
  sub_category TEXT, -- e.g. 'Agile Ceremonies', 'Airport & Flight'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies cho listen_later
ALTER TABLE listen_later ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own listen_later" ON listen_later
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own listen_later" ON listen_later
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own listen_later" ON listen_later
  FOR DELETE USING (auth.uid() = user_id);

-- Index để tối ưu query
CREATE INDEX IF NOT EXISTS idx_listen_later_user ON listen_later(user_id);
CREATE INDEX IF NOT EXISTS idx_listen_later_created ON listen_later(user_id, created_at DESC);

-- ============================================

-- 2. Bảng playlists
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies cho playlists
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own playlists" ON playlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own playlists" ON playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists" ON playlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists" ON playlists
  FOR DELETE USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_playlists_user ON playlists(user_id);

-- ============================================

-- 3. Bảng playlist items
CREATE TABLE IF NOT EXISTS playlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  conversation JSONB NOT NULL,
  duration INTEGER NOT NULL DEFAULT 5,
  num_speakers INTEGER NOT NULL DEFAULT 2,
  category TEXT,
  sub_category TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies cho playlist_items
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own playlist_items" ON playlist_items
  FOR SELECT USING (
    playlist_id IN (SELECT id FROM playlists WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own playlist_items" ON playlist_items
  FOR INSERT WITH CHECK (
    playlist_id IN (SELECT id FROM playlists WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own playlist_items" ON playlist_items
  FOR UPDATE USING (
    playlist_id IN (SELECT id FROM playlists WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own playlist_items" ON playlist_items
  FOR DELETE USING (
    playlist_id IN (SELECT id FROM playlists WHERE user_id = auth.uid())
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist ON playlist_items(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_items_position ON playlist_items(playlist_id, position);

-- ============================================
-- Bổ sung: Policy cho service role để backend sử dụng
-- ============================================

-- Service role bypass RLS cho listen_later
CREATE POLICY "Service role can manage listen_later" ON listen_later
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Service role bypass RLS cho playlists
CREATE POLICY "Service role can manage playlists" ON playlists
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Service role bypass RLS cho playlist_items
CREATE POLICY "Service role can manage playlist_items" ON playlist_items
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
