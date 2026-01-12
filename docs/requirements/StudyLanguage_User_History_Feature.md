# TÀI LIỆU YÊU CẦU TÍNH NĂNG: LỊCH SỬ HOẠT ĐỘNG NGƯỜI DÙNG
**(User Activity History & Review Feature)**

**Dự án:** App Luyện Thi Tiếng Anh Đa Nền Tảng  
**Phiên bản:** 1.0  
**Ngày:** 12/01/2026  
**Trạng thái:** Draft

---

## 1. TỔNG QUAN (OVERVIEW)

### 1.1. Mục tiêu
Cung cấp cho người dùng một nơi tập trung để **xem lại toàn bộ hoạt động học tập** đã thực hiện trong ứng dụng, bao gồm:
- Các bài học đã hoàn thành
- Nội dung AI đã tạo ra
- Câu trả lời và phản hồi của AI
- Từ vựng đã học/đánh dấu
- Lỗi sai và cách sửa

### 1.2. Lý do cần thiết
| Vấn đề | Giải pháp |
|--------|-----------|
| User quên nội dung đã học hôm qua | Xem lại timeline học tập |
| Muốn ôn lại bài hội thoại hay | Tìm trong lịch sử Listening |
| Cần xem lại feedback AI đã sửa lỗi | Truy cập lịch sử Writing/Speaking |
| Muốn học lại từ vựng đã gặp | Xem danh sách từ đã tra/đánh dấu |

### 1.3. Phân bố nền tảng

| Tính năng | Mobile | Web | Lý do |
|-----------|--------|-----|-------|
| **Timeline View** | ✅ Core | ✅ Core | Cần xem nhanh ở cả 2 nền tảng |
| **Detail View** | ✅ | ✅ Core | Web có màn hình lớn, xem chi tiết tốt hơn |
| **Search & Filter** | Basic | ✅ Advanced | Tìm kiếm phức tạp nên làm trên Web |
| **Export/Download** | ❌ | ✅ | Export file cần màn hình lớn |
| **Replay Audio** | ✅ Core | ✅ | Nghe lại bài học mọi lúc |

---

## 2. YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

### 2.1. Trung tâm Lịch sử (History Center)

#### A. Timeline View (Dòng thời gian)
*Entry point chính để xem lại mọi hoạt động.*

**Hiển thị:**
```
📅 Hôm nay - 12/01/2026
├── 🎧 09:30 - Listening: "Coffee Shop Conversation" (15 phút)
├── 🗣️ 10:15 - Speaking: Luyện phát âm "Technology" (8 phút)
├── 📖 14:00 - Reading: "Climate Change Article" (12 phút)
└── ✍️ 20:30 - Writing: Daily Journal (350 từ)

📅 Hôm qua - 11/01/2026
├── 🎧 08:00 - Listening: "Job Interview Tips" (20 phút)
└── 📚 19:00 - Vocabulary: Đã học 15 từ mới
```

**Thông tin mỗi mục:**
- Icon loại hoạt động (Listening/Speaking/Reading/Writing/Vocabulary)
- Thời gian thực hiện
- Tiêu đề/Chủ đề
- Thời lượng hoặc số lượng (từ, câu)
- Trạng thái: Hoàn thành ✅ / Đang dở 🔄 / Chưa xem lại ⭐

#### B. Phân loại theo Kỹ năng (Skill-based View)
*Xem riêng lịch sử từng kỹ năng.*

| Tab | Nội dung hiển thị |
|-----|-------------------|
| **All** | Tất cả hoạt động theo timeline |
| **Listening** | Các bài nghe, hội thoại, podcast đã thực hiện |
| **Speaking** | Các bài luyện nói, recording của user |
| **Reading** | Các bài đọc, article đã hoàn thành |
| **Writing** | Các bài viết, journal đã submit |
| **Vocabulary** | Từ vựng đã tra, đánh dấu, học |

---

### 2.2. Chi tiết từng loại Lịch sử

#### A. Listening History (Lịch sử bài nghe)

**Lưu trữ:**
| Dữ liệu | Mô tả |
|---------|-------|
| **Conversation Script** | Toàn bộ transcript hội thoại AI đã tạo |
| **Audio File** | File audio để nghe lại (cached locally) |
| **Configuration** | Chủ đề, thời lượng, số người, keywords đã chọn |
| **Marked Sentences** | Các câu user đã đánh dấu (bấm 3 lần tai nghe) |
| **Listening Position** | Vị trí đang nghe dở (để tiếp tục) |
| **Completion Rate** | % đã nghe |

**Hành động:**
- 🔄 **Replay:** Nghe lại toàn bộ
- ⏩ **Continue:** Tiếp tục từ chỗ dừng
- 📋 **View Script:** Xem transcript
- 🔖 **View Marked:** Xem các câu đã đánh dấu
- 🔁 **Regenerate:** Tạo lại bài tương tự với config cũ

#### B. Speaking History (Lịch sử luyện nói)

**Lưu trữ:**
| Dữ liệu | Mô tả |
|---------|-------|
| **Sample Script** | Đoạn văn mẫu AI đã sinh |
| **User Recording** | File ghi âm của user (với sự đồng ý) |
| **AI Reference Audio** | Audio mẫu của AI |
| **Feedback** | Đánh giá của AI (điểm số, lỗi sai, gợi ý) |
| **Pronunciation Score** | Điểm phát âm chi tiết từng từ |
| **Retry History** | Các lần thử lại và sự tiến bộ |

**Hành động:**
- 🎤 **Play My Recording:** Nghe lại giọng mình
- 🔊 **Play AI Sample:** Nghe giọng mẫu
- 📊 **View Feedback:** Xem chi tiết đánh giá
- 📈 **Compare Attempts:** So sánh các lần thử
- 🔁 **Practice Again:** Luyện lại bài này

#### C. Reading History (Lịch sử bài đọc)

**Lưu trữ:**
| Dữ liệu | Mô tả |
|---------|-------|
| **Article Content** | Toàn bộ bài đọc AI đã sinh |
| **Questions & Answers** | Câu hỏi đọc hiểu + đáp án user + đáp án đúng |
| **Score** | Điểm số bài kiểm tra |
| **Looked-up Words** | Các từ user đã click tra nghĩa |
| **Highlighted Text** | Các đoạn user đã highlight |
| **Reading Time** | Thời gian đọc |

**Hành động:**
- 📖 **Read Again:** Đọc lại bài
- ❓ **Redo Quiz:** Làm lại câu hỏi
- 📚 **View Vocabulary:** Xem từ đã tra
- 📝 **View My Answers:** Xem đáp án đã chọn

#### D. Writing History (Lịch sử bài viết)

**Lưu trữ:**
| Dữ liệu | Mô tả |
|---------|-------|
| **Original Text** | Bài viết gốc của user |
| **AI Corrections** | Bản đã sửa lỗi với highlight |
| **Error List** | Danh sách lỗi: Loại lỗi + Giải thích + Cách sửa |
| **Paraphrase Suggestions** | Các gợi ý viết lại hay hơn |
| **Word Count** | Số từ |
| **Writing Prompt** | Đề bài / Chủ đề |

**Hành động:**
- 📝 **View Original:** Xem bài gốc
- ✅ **View Corrected:** Xem bản đã sửa
- 🔍 **Review Errors:** Xem chi tiết từng lỗi
- ✏️ **Edit & Resubmit:** Sửa và nộp lại
- 📤 **Export:** Xuất file (PDF/Word)

#### E. Vocabulary History (Lịch sử từ vựng)

**Lưu trữ:**
| Dữ liệu | Mô tả |
|---------|-------|
| **Word** | Từ vựng |
| **Definition** | Nghĩa (Anh-Việt) |
| **Pronunciation** | Phiên âm IPA + Audio |
| **Example Sentences** | Câu ví dụ |
| **Source** | Học từ đâu (bài Listening nào, Reading nào) |
| **Timestamp** | Thời điểm tra/học |
| **Status** | New / Learning / Mastered |
| **Review Count** | Số lần đã ôn tập |

**Hành động:**
- 🔊 **Play Pronunciation:** Nghe phát âm
- 📍 **Go to Source:** Đến bài học gốc
- ➕ **Add to Flashcard:** Thêm vào bộ flashcard
- ✅ **Mark as Mastered:** Đánh dấu đã thuộc

---

### 2.3. Tìm kiếm & Lọc (Search & Filter)

#### A. Quick Search (Tìm nhanh)
**Nền tảng:** Mobile & Web

- Search box ở đầu trang History
- Tìm theo keyword trong tiêu đề, nội dung, từ vựng
- Kết quả hiển thị ngay khi gõ (instant search)

#### B. Advanced Filter (Lọc nâng cao)
**Nền tảng:** Web (Primary), Mobile (Simplified)

| Filter | Options |
|--------|---------|
| **Skill** | Listening / Speaking / Reading / Writing / Vocabulary |
| **Date Range** | Hôm nay / 7 ngày / 30 ngày / Custom range |
| **Status** | Hoàn thành / Đang dở / Có đánh dấu |
| **Topic** | Các chủ đề đã học |
| **Score** | Điểm cao (>80%) / Trung bình / Cần cải thiện (<60%) |
| **Has Recording** | Có file ghi âm hay không |

#### C. Sort Options (Sắp xếp)
- Mới nhất (Default)
- Cũ nhất
- Điểm cao → thấp
- Điểm thấp → cao
- Thời lượng dài → ngắn

---

### 2.4. Tính năng bổ sung

#### A. Bookmarks / Favorites (Đánh dấu yêu thích)
- User có thể ⭐ Star bất kỳ mục nào trong lịch sử
- Tab riêng "Favorites" để truy cập nhanh
- Sync giữa các thiết bị

#### B. Notes (Ghi chú cá nhân)
- Thêm ghi chú vào bất kỳ mục lịch sử nào
- VD: "Bài này hay, cần học lại" hoặc "Phát âm từ 'entrepreneur' vẫn sai"

#### C. Share (Chia sẻ)
- Chia sẻ bài viết đã sửa (để khoe tiến bộ)
- Export transcript hội thoại hay
- Gửi danh sách từ vựng qua email

#### D. Delete (Xóa)
- Xóa các mục không cần thiết
- Bulk delete (xóa nhiều cùng lúc)
- Xóa riêng file recording (tiết kiệm bộ nhớ, giữ text)

---

## 3. TRẢI NGHIỆM NGƯỜI DÙNG (UX REQUIREMENTS)

### 3.1. Navigation
- Entry point: Icon "History" 📜 trên bottom navigation (Mobile) hoặc sidebar (Web)
- Breadcrumb: History > Listening > "Coffee Shop Conversation"
- Back button luôn quay về list view

### 3.2. Visual Design
- **Timeline style:** Vertical timeline với icon và timestamp rõ ràng
- **Card-based:** Mỗi mục là 1 card có thể tap/click để mở chi tiết
- **Color coding:** Mỗi skill có màu riêng (Listening: Blue, Speaking: Green, Reading: Orange, Writing: Purple)
- **Progress indicator:** Hiển thị % hoàn thành trên card

### 3.3. Performance
- **Lazy loading:** Load thêm khi scroll xuống (infinite scroll)
- **Cached locally:** Nội dung text cache trên device để xem offline
- **Audio streaming:** Audio không cache toàn bộ, stream khi cần

### 3.4. Empty States
- Khi chưa có lịch sử: Hiển thị illustration + CTA "Bắt đầu bài học đầu tiên"
- Khi filter không có kết quả: "Không tìm thấy kết quả. Thử lọc khác?"

---

## 4. YÊU CẦU KỸ THUẬT (TECHNICAL REQUIREMENTS)

### 4.1. Database Schema (Supabase)

```sql
-- Bảng chính lưu tất cả hoạt động
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  skill_type VARCHAR(20) NOT NULL, -- listening, speaking, reading, writing, vocabulary
  activity_type VARCHAR(50) NOT NULL, -- lesson, practice, quiz, lookup
  title VARCHAR(255),
  topic VARCHAR(100),
  
  -- Metadata
  duration_seconds INTEGER,
  word_count INTEGER,
  score DECIMAL(5,2),
  completion_rate DECIMAL(5,2),
  
  -- Content (JSONB for flexibility)
  content JSONB, -- Stores script, questions, corrections, etc.
  user_input JSONB, -- Stores user's answers, recordings info
  ai_feedback JSONB, -- Stores AI's evaluation
  
  -- Status
  status VARCHAR(20) DEFAULT 'completed', -- completed, in_progress, bookmarked
  is_favorite BOOLEAN DEFAULT FALSE,
  user_notes TEXT,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index cho query nhanh
CREATE INDEX idx_activities_user_skill ON user_activities(user_id, skill_type);
CREATE INDEX idx_activities_user_date ON user_activities(user_id, created_at DESC);
CREATE INDEX idx_activities_favorite ON user_activities(user_id, is_favorite) WHERE is_favorite = TRUE;

-- Bảng từ vựng đã học
CREATE TABLE user_vocabulary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  word VARCHAR(100) NOT NULL,
  definition TEXT,
  pronunciation VARCHAR(100),
  example_sentences JSONB,
  source_activity_id UUID REFERENCES user_activities(id),
  
  status VARCHAR(20) DEFAULT 'new', -- new, learning, mastered
  review_count INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, word)
);

-- Bảng lưu câu/đoạn đã đánh dấu
CREATE TABLE user_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  activity_id UUID REFERENCES user_activities(id),
  content_type VARCHAR(20), -- sentence, paragraph, word
  content TEXT,
  position_in_content INTEGER, -- vị trí trong bài
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.2. Storage (Supabase Storage)

| Bucket | Nội dung | Retention |
|--------|----------|-----------|
| `user-recordings` | File ghi âm của user (Speaking) | 90 ngày (có thể extend) |
| `ai-audio-cache` | Audio AI đã sinh (có thể regenerate) | 30 ngày |
| `exports` | File export (PDF, Word) | 7 ngày |

### 4.3. API Endpoints (NestJS)

```
GET    /api/history                    # List all activities (paginated)
GET    /api/history/:id                # Get activity detail
GET    /api/history/skill/:skillType   # Filter by skill
GET    /api/history/search?q=keyword   # Search
PATCH  /api/history/:id/favorite       # Toggle favorite
PATCH  /api/history/:id/notes          # Update notes
DELETE /api/history/:id                # Delete activity

GET    /api/vocabulary                 # List vocabulary
POST   /api/vocabulary/:id/review      # Mark as reviewed
```

### 4.4. Offline Support
- Sử dụng **React Query** với persistence để cache data
- SQLite local (React Native) cho offline access
- Sync khi có internet connection

---

## 5. PRIVACY & DATA RETENTION

### 5.1. User Control
- User có toàn quyền xóa bất kỳ dữ liệu nào
- Option: "Không lưu recording" (chỉ lưu transcript)
- Option: "Auto-delete after X days"

### 5.2. Data Retention Policy
| Loại dữ liệu | Mặc định | Có thể thay đổi |
|--------------|----------|-----------------|
| Text content (script, feedback) | Vĩnh viễn | User xóa thủ công |
| User recordings | 90 ngày | Extend hoặc delete sớm |
| AI audio | 30 ngày | Regenerate khi cần |

### 5.3. Storage Quota
- Với Free tier Supabase (1GB storage): Đủ cho ~500 bài học có audio
- Hiển thị usage cho user: "Đang dùng 250MB / 1GB"

---

## 6. MOCKUP UI CONCEPT

### 6.1. Mobile - History List
```
┌─────────────────────────────────┐
│ ← History                    🔍 │
├─────────────────────────────────┤
│ [All] [🎧] [🗣️] [📖] [✍️] [📚] │
├─────────────────────────────────┤
│ 📅 Today                        │
│ ┌─────────────────────────────┐ │
│ │ 🎧 Coffee Shop Talk    ⭐   │ │
│ │ 09:30 • 15 min • ████░ 80% │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 🗣️ Technology Terms        │ │
│ │ 10:15 • 8 min • Score: 85  │ │
│ └─────────────────────────────┘ │
│                                 │
│ 📅 Yesterday                    │
│ ┌─────────────────────────────┐ │
│ │ 📖 Climate Change      ⭐   │ │
│ │ 14:00 • 12 min • 4/5 ✓     │ │
│ └─────────────────────────────┘ │
│                                 │
│         Load more...            │
└─────────────────────────────────┘
```

### 6.2. Mobile - Detail View (Listening)
```
┌─────────────────────────────────┐
│ ← Coffee Shop Conversation   ⋮ │
├─────────────────────────────────┤
│                                 │
│      advancement: 80%            │
│   advancement: ████████░░ 12:30 / 15:00      │
│                                 │
│     [⏪]   [▶️ Play]   [⏩]     │
│                                 │
├─────────────────────────────────┤
│ 📋 Transcript                   │
│ ─────────────────────────────── │
│ A: Hi, can I get a latte?       │
│ B: Sure! What size would you... │
│ [View full transcript →]        │
├─────────────────────────────────┤
│ 🔖 Marked Sentences (3)         │
│ • "What size would you like?"   │
│ • "That'll be $4.50"            │
│ [View all →]                    │
├─────────────────────────────────┤
│ 📝 My Notes                     │
│ "Cần học cách order coffee"     │
│ [Edit]                          │
├─────────────────────────────────┤
│                                 │
│ [🔁 Practice Again]             │
│                                 │
└─────────────────────────────────┘
```

---

## 7. ĐỘ ƯU TIÊN TRIỂN KHAI

| Phase | Tính năng | Priority |
|-------|-----------|----------|
| **MVP** | Timeline View + Basic Detail | 🔴 High |
| **MVP** | Skill-based tabs | 🔴 High |
| **MVP** | Replay Audio | 🔴 High |
| **v1.1** | Search & Filter | 🟡 Medium |
| **v1.1** | Favorites & Notes | 🟡 Medium |
| **v1.2** | Vocabulary History | 🟡 Medium |
| **v1.3** | Export/Download | 🟢 Low |
| **v1.3** | Advanced Analytics | 🟢 Low |

---

*Tài liệu này định nghĩa tính năng History Center - nơi người dùng xem lại toàn bộ hoạt động học tập trong StudyLanguage App.*
