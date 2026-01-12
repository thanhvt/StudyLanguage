-- =============================================
-- Supabase Row Level Security (RLS) Policies
-- 
-- Mục đích: Bảo vệ dữ liệu ở mức database
-- Chạy: Sau khi bật RLS trên từng bảng
-- =============================================

-- ========================================
-- 1. Bật RLS cho các bảng
-- ========================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_scores ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. RLS Policies cho bảng USERS
-- ========================================

-- User chỉ xem được profile của chính mình
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- User chỉ update được profile của chính mình
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id);

-- ========================================
-- 3. RLS Policies cho bảng USER_PREFERENCES
-- ========================================

-- User chỉ xem được preferences của chính mình
CREATE POLICY "Users can view own preferences"
ON public.user_preferences
FOR SELECT
USING (auth.uid() = user_id);

-- User có thể tạo preferences cho chính mình
CREATE POLICY "Users can insert own preferences"
ON public.user_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- User có thể update preferences của chính mình
CREATE POLICY "Users can update own preferences"
ON public.user_preferences
FOR UPDATE
USING (auth.uid() = user_id);

-- ========================================
-- 4. RLS Policies cho bảng LESSONS
-- ========================================

-- Tất cả users đã đăng nhập có thể xem lessons
CREATE POLICY "Authenticated users can view lessons"
ON public.lessons
FOR SELECT
USING (auth.role() = 'authenticated');

-- Chỉ admin có thể tạo/sửa lessons (service_role)
-- Không cần policy vì service_role bypass RLS

-- ========================================
-- 5. RLS Policies cho bảng CONVERSATIONS
-- ========================================

-- User chỉ xem được conversations của chính mình
CREATE POLICY "Users can view own conversations"
ON public.conversations
FOR SELECT
USING (auth.uid() = user_id);

-- User có thể tạo conversations cho chính mình
CREATE POLICY "Users can insert own conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 6. RLS Policies cho bảng LESSON_SCORES
-- ========================================

-- User chỉ xem được scores của chính mình
CREATE POLICY "Users can view own scores"
ON public.lesson_scores
FOR SELECT
USING (auth.uid() = user_id);

-- User có thể tạo scores cho chính mình
CREATE POLICY "Users can insert own scores"
ON public.lesson_scores
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 7. RLS Policies cho bảng SYSTEM_LOGS (nếu có)
-- ========================================

-- Chỉ service_role có thể ghi logs
-- User không được xem logs
-- (Không cần policy, service_role sẽ bypass)

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Kiểm tra RLS đã bật chưa
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'user_preferences', 'lessons', 'conversations', 'lesson_scores');

-- Kiểm tra các policies đã tạo
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public';
