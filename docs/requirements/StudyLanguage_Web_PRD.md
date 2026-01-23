# TÀI LIỆU YÊU CẦU SẢN PHẨM (PRODUCT REQUIREMENTS DOCUMENT)
## StudyLanguage Web Application

**Phiên bản:** 1.0.0  
**Ngày cập nhật:** 20/01/2026  
**Trạng thái:** Đã triển khai (Production-Ready)

---

## 1. TỔNG QUAN

### 1.1. Mô tả sản phẩm
StudyLanguage là ứng dụng web học tiếng Anh thông minh, sử dụng công nghệ AI để tạo nội dung học tập cá nhân hóa. Ứng dụng tập trung vào 3 kỹ năng chính: **Nghe (Listening)**, **Nói (Speaking)**, và **Đọc (Reading)**.

### 1.2. Đối tượng người dùng
- Người học tiếng Anh cá nhân/gia đình
- Quy mô: < 20 người dùng
- Nhu cầu: Luyện tập tiếng Anh hàng ngày với nội dung được tạo bởi AI

### 1.3. Công nghệ sử dụng

| Hạng mục | Công nghệ |
|:---------|:----------|
| **Frontend** | Next.js 14+, React, TailwindCSS, Shadcn/ui |
| **Animation** | Framer Motion |
| **Backend** | NestJS (Serverless/Container) |
| **Database** | Supabase Postgres |
| **Authentication** | Supabase Auth (Google OAuth) |
| **AI - LLM** | GPT-4o-mini (sinh nội dung, đánh giá) |
| **AI - TTS** | OpenAI TTS API (alloy, nova, onyx voices) |
| **AI - STT** | OpenAI Whisper API (chuyển đổi giọng nói) |

---

## 2. YÊU CẦU CHỨC NĂNG ĐÃ TRIỂN KHAI

### 2.1. Hệ thống nền tảng (Core System)

#### 2.1.1. Xác thực người dùng (Authentication)
| Tính năng | Mô tả | Trạng thái |
|:----------|:------|:-----------|
| Google OAuth Login | Đăng nhập bằng tài khoản Google (Supabase Auth) |  |
| Protected Routes | Bảo vệ các trang yêu cầu đăng nhập |  |
| Session Management | Quản lý phiên đăng nhập tự động |  |

#### 2.1.2. Giao diện & Chủ đề (UI & Themes)

**Light/Dark Mode:**
| Tính năng | Mô tả |
|:----------|:------|
| Theme Toggle | Chuyển đổi giữa Light/Dark/System mode |
| Persistence | Lưu preference vào localStorage |

**Accent Color System (6 themes):**
| Theme ID | Tên | Mô tả |
|:---------|:----|:------|
| `ocean-scholar` | Ocean Scholar | Teal học thuật, thanh lịch (Mặc định) |
| `sunset-focus` | Sunset Focus | Cam năng động, tập trung |
| `royal-purple` | Royal Purple | Tím sang trọng, sáng tạo |
| `rose-focus` | Rose Focus | Hồng thân thiện, ấm áp |
| `ocean-blue` | Ocean Blue | Xanh dương cổ điển |
| `emerald-study` | Emerald Study | Xanh ngọc bích, phát triển |

#### 2.1.3. Đa ngôn ngữ (i18n)
| Tính năng | Mô tả |
|:----------|:------|
| Language Provider | Context provider quản lý ngôn ngữ UI |
| Supported Languages | Tiếng Việt, Tiếng Anh |
| Language Switcher | Component chuyển đổi ngôn ngữ UI |

#### 2.1.4. Nhạc nền (Background Music)

**Music Provider:**
| Tính năng | Mô tả |
|:----------|:------|
| Kho nhạc | 8 track nhạc Lofi/Chill từ Pixabay (miễn phí) |
| Playback Controls | Play/Pause, Next, Previous, Shuffle |
| Volume Control | Điều chỉnh âm lượng (slider) |
| Smart Ducking | Tự động giảm âm lượng (20%) khi AI đang nói |
| Persistence | Lưu trạng thái vào localStorage |

**Danh sách nhạc:**
- Good Night Lofi
- Lofi Study Chill
- Tactical Pause Lofi
- Relax Lofi Beat
- Lofi Girl Ambient
- Lofi Chill Background
- Lofi Instrumental
- Lofi Girl Chill

---

### 2.2. Module Luyện Nghe (Listening)

> **Mô tả:** Module cho phép người dùng luyện nghe tiếng Anh thông qua các hội thoại được tạo bởi AI.

#### 2.2.1. Cấu hình hội thoại

| Tham số | Mô tả | Giá trị |
|:--------|:------|:--------|
| **Chủ đề (Topic)** | Chọn từ Topic Picker hoặc nhập tự do | 140+ scenarios |
| **Thời lượng** | Duration Selector với các preset | 5 / 10 / 15 phút (hoặc custom max 20) |
| **Số người nói** | Speakers Selector | 2 / 3 / 4 người |
| **Keywords** | Từ khóa gợi ý cho AI (tùy chọn) | Văn bản tự do |

#### 2.2.2. Topic Picker (140+ Scenarios)

**Cấu trúc phân cấp:**
```
Category (3 main categories)
└── Sub-Category
    └── Scenarios (topic cụ thể)
```

**Tính năng:**
| Tính năng | Mô tả |
|:----------|:------|
| Search | Tìm kiếm scenarios theo tên |
| Accordion | Expand/Collapse sub-categories |
| Favorite | Đánh dấu scenarios yêu thích (⭐) |
| Quick Select | Click để chọn và điền vào form |

#### 2.2.3. Chế độ Nghe

**Passive Mode (Podcast):**
| Tính năng | Mô tả |
|:----------|:------|
| AI Generate | AI sinh script hội thoại từ topic |
| TTS Audio | Chuyển script thành audio (OpenAI TTS) |
| Transcripts | Hiển thị transcript với highlight theo thời gian |
| Audio Controls | Play/Pause, Seek, Playback speed, Volume |

**Interactive Mode (Tham gia hội thoại):**
| Tính năng | Mô tả |
|:----------|:------|
| YOUR TURN Markers | AI tạo script với các điểm dừng cho user |
| Voice Recording | Ghi âm phản hồi của user |
| AI Continue | AI tiếp tục hội thoại dựa trên user input |
| Auto-play Option | Tự động phát tiếp sau khi user trả lời |
| Hands-free Mode | Chế độ không cần nhấn nút |

#### 2.2.4. Transcript Viewer

| Tính năng | Mô tả |
|:----------|:------|
| Karaoke Highlighting | Highlight câu đang phát theo thời gian audio |
| Speaker Labels | Hiển thị tên người nói (Speaker A, B, C...) |
| Bubble Layout | Layout dạng chat bubble, phân biệt trái/phải |
| Auto-scroll | Tự động cuộn theo câu đang phát |

#### 2.2.5. Playlist Management

**Quản lý Playlist:**
| Tính năng | Mô tả |
|:----------|:------|
| Create | Tạo playlist mới |
| Rename | Đổi tên playlist |
| Delete | Xóa playlist |
| Drag & Drop | Sắp xếp thứ tự playlists |
| Duration Estimate | Ước tính thời lượng playlist |

**Playlist Player:**
| Tính năng | Mô tả |
|:----------|:------|
| Continuous Playback | Phát liên tục các bài trong playlist |
| Current Track Info | Hiển thị thông tin bài đang phát |
| Skip Controls | Next/Previous track |
| Progress Bar | Tiến độ phát overall |

#### 2.2.6. Listen Later Queue

| Tính năng | Mô tả |
|:----------|:------|
| Add to Queue | Lưu conversation để nghe sau |
| Queue List | Hiển thị danh sách |
| Play from Queue | Phát trực tiếp từ queue |
| Remove Item | Xóa item khỏi queue |
| Clear All | Xóa toàn bộ queue (có confirm) |

#### 2.2.7. Radio Mode

> **Mô tả:** Tự động sinh playlist nhiều conversations để nghe liên tục.

| Tính năng | Mô tả |
|:----------|:------|
| Random Duration | Random thời lượng (30/60/120 phút) |
| Track Count Preview | Hiển thị số bài ước tính |
| Reroll | Random lại duration |
| Generate Playlist | Tạo playlist với AI (async, có progress) |
| Confirmation Modal | Xác nhận trước khi generate (tốn thời gian) |

---

### 2.3. Module Luyện Nói (Speaking)

> **Mô tả:** Module cho phép người dùng hội thoại 1-1 với AI Coach, nhận phản hồi về phát âm và ngữ pháp.

#### 2.3.1. Cấu hình Session

| Tham số | Mô tả |
|:--------|:------|
| **Topic** | Chủ đề hội thoại (nhập tự do hoặc chọn từ Topic Picker) |
| **Duration** | Thời lượng mục tiêu |

#### 2.3.2. Luồng hội thoại

```
1. User chọn topic và bắt đầu session
2. AI gửi câu mở đầu bằng text + TTS audio
3. User trả lời bằng voice (hoặc text)
4. Audio được gửi đến Whisper API → transcribe thành text
5. Text được gửi đến GPT để AI phản hồi
6. AI gửi phản hồi kèm corrections (nếu có)
7. Lặp lại bước 3-6 cho đến khi user exit
8. Session được lưu vào database
```

#### 2.3.3. Input Modes

| Mode | Mô tả |
|:-----|:------|
| **Voice Mode** | Ghi âm bằng MediaRecorder API, hold-to-record hoặc toggle |
| **Text Mode** | Gõ text trực tiếp (fallback cho môi trường không có micro) |
| **Toggle Switch** | Nút chuyển đổi giữa Voice và Text mode |

#### 2.3.4. Audio Recording Features

| Tính năng | Mô tả |
|:----------|:------|
| Permission Handling | Request quyền microphone với error messages |
| MIME Type Auto-detect | Tự động chọn format phù hợp (webm/ogg/mp4) |
| Duration Counter | Hiển thị thời lượng ghi âm (mm:ss) |
| Chunk Recording | Ghi theo chunks 500ms để nhận data thường xuyên |
| Error Recovery | Xử lý lỗi NotAllowedError, NotFoundError |

#### 2.3.5. AI Feedback

| Tính năng | Mô tả |
|:----------|:------|
| Real-time Response | AI phản hồi ngay lập tức sau mỗi turn |
| Corrections | Highlight lỗi và gợi ý sửa |
| Explanation | Giải thích tại sao sai và cách sửa |
| Session Transcript | Lưu toàn bộ conversation để review |

#### 2.3.6. Session Management

| Tính năng | Mô tả |
|:----------|:------|
| Auto-save on Exit | Tự động lưu vào DB khi kết thúc session |
| Resume from History | Xem lại session cũ từ History |
| Message Count | Đếm số tin nhắn trong session |

---

### 2.4. Module Luyện Đọc (Reading)

> **Mô tả:** Module cho phép người dùng đọc bài viết được tạo bởi AI, với từ điển tích hợp và câu hỏi đọc hiểu.

#### 2.4.1. Cấu hình bài đọc

| Tham số | Mô tả | Giá trị |
|:--------|:------|:--------|
| **Chủ đề** | Topic cho bài đọc | Văn bản tự do |
| **Độ khó** | Level của bài đọc | Cơ bản / Nâng cao |

#### 2.4.2. Nội dung AI sinh ra

| Element | Mô tả |
|:--------|:------|
| **Tiêu đề (Title)** | Tiêu đề bài đọc |
| **Nội dung (Content)** | Đoạn văn dài (article/story) |
| **Câu hỏi (Questions)** | 3-5 câu hỏi trắc nghiệm đọc hiểu |

#### 2.4.3. Tính năng đọc

| Tính năng | Mô tả |
|:----------|:------|
| Click-to-Lookup | Click vào từ để tra nghĩa |
| TTS Read Aloud | Nút phát audio đọc bài (OpenAI TTS) |
| Highlight Words | Highlight từ khi hover |
| User đọc bài đọc | User đọc bài đọc |
| AI review | AI đánh giá bài đọc |

#### 2.4.4. Dictionary Popup

| Tính năng | Mô tả |
|:----------|:------|
| API Source | Free Dictionary API (dictionaryapi.dev) |
| Word Display | Hiển thị từ và phiên âm (phonetic) |
| Part of Speech | Loại từ (noun, verb, adjective...) |
| Definitions | Tối đa 3 định nghĩa |
| Examples | Câu ví dụ (nếu có) |
| Google Fallback | Link tìm trên Google nếu không tìm thấy |

#### 2.4.5. Quiz đọc hiểu

| Tính năng | Mô tả |
|:----------|:------|
| Multiple Choice | Câu hỏi trắc nghiệm 4 đáp án |
| Instant Feedback | Hiển thị đúng/sai ngay sau khi chọn |
| Score Display | Hiển thị điểm sau khi hoàn thành |
| Correct Answer | Hiển thị đáp án đúng cho câu sai |

---

### 2.5. Lịch sử học tập (History)

> **Mô tả:** Hệ thống quản lý lịch sử các bài học đã hoàn thành.

#### 2.5.1. History Entry Structure

```typescript
interface HistoryEntry {
  id: string;
  type: 'listening' | 'speaking' | 'reading';
  topic: string;
  content: any; // Conversation, transcript, article...
  durationMinutes?: number;
  numSpeakers?: number;
  keywords?: string;
  mode?: string;
  status: string;
  isPinned: boolean;
  isFavorite: boolean;
  userNotes?: string;
  createdAt: string;
  deletedAt?: string;
}
```

#### 2.5.2. Tính năng quản lý

| Tính năng | Mô tả |
|:----------|:------|
| **View All** | Xem tất cả entries trong History Drawer |
| **Filter by Type** | Lọc theo Listening/Speaking/Reading/All |
| **Filter by Status** | Lọc theo All/Pinned/Favorite/Deleted |
| **Search** | Tìm kiếm theo topic |
| **Pin** | Ghim entry quan trọng |
| **Favorite** | Đánh dấu yêu thích |
| **Delete** | Soft delete (có thể khôi phục) |
| **Add Notes** | Thêm ghi chú cá nhân |

#### 2.5.3. Activity Timeline (Dashboard)

| Tính năng | Mô tả |
|:----------|:------|
| Recent Activities | Hiển thị 5 hoạt động gần nhất trên Home |
| Date Grouping | Nhóm theo ngày (Hôm nay, Hôm qua, Tuần trước...) |
| Quick Resume | Click để mở lại bài học |
| View All Link | Link đến History đầy đủ |

#### 2.5.4. History List

| Tính năng | Mô tả |
|:----------|:------|
| Tabs | Tabs cho từng loại bài học |
| Pagination | Phân trang cho danh sách dài |
| Detail View | Xem chi tiết entry đã chọn |

---

### 2.6. Giao diện & Layout

#### 2.6.1. App Layout

| Component | Mô tả |
|:----------|:------|
| **AppLayout** | Wrapper layout với Sidebar + Main + Right Panel |
| **Sidebar** | Navigation menu (Desktop) |
| **Right Panel** | Panel bên phải với thông tin user, settings |
| **Mobile Nav** | Bottom navigation bar (Mobile) |
| **Mobile Header** | Top header với menu button (Mobile) |
| **Mobile FAB** | Floating Action Button cho quick actions |

#### 2.6.2. Sidebar Navigation

| Menu Item | Icon | Href |
|:----------|:-----|:-----|
| Nghe (Listening) | Headphones | /listening |
| Nói (Speaking) | Mic | /speaking |
| Đọc (Reading) | BookOpen | /reading |

**Tính năng:**
- Collapsible (thu gọn/mở rộng)
- Bilingual labels (Tiếng Việt / English)
- Active state với rainbow glow effect
- User profile section ở bottom

#### 2.6.3. Right Panel ("Motivation Station")

| Section | Mô tả |
|:--------|:------|
| User Profile | Avatar, name, email |
| Quick Settings | Theme toggle, Language switcher |
| Music Controls | Play/Pause, Volume, Track info |
| Logout Button | Nút đăng xuất |

#### 2.6.4. Responsive Design

| Breakpoint | Layout |
|:-----------|:-------|
| Desktop (lg+) | Sidebar + Main + Right Panel |
| Tablet (md-lg) | Main + Right Panel (sidebar thu gọn) |
| Mobile (<md) | Main only + Bottom Nav + Header + FAB |

---

### 2.7. Animation & UX

#### 2.7.1. Animation Components

| Component | Mô tả |
|:----------|:------|
| **PageTransition** | Fade animation khi chuyển trang |
| **FadeIn** | Fade in với configurable delay |
| **SlideIn** | Slide in từ các hướng |
| **ScaleIn** | Scale up animation |
| **StaggerChildren** | Stagger animation cho list items |

#### 2.7.2. Loading States

| Component | Mô tả |
|:----------|:------|
| **SkeletonText** | Placeholder cho text đang load |
| **SkeletonCard** | Placeholder cho card đang load |
| **SkeletonConversation** | Placeholder cho conversation |
| **SkeletonArticle** | Placeholder cho bài đọc |
| **LoadingDots** | 3 dots animation |
| **AIThinking** | "AI đang suy nghĩ..." animation |

#### 2.7.3. Celebration Effects

| Component | Mô tả |
|:----------|:------|
| **Confetti** | Pháo giấy khi hoàn thành bài |
| **CelebrationMessage** | Message với emoji animation |
| **useConfetti** | Hook để trigger confetti dễ dàng |

#### 2.7.4. Design System

| Element | Style |
|:--------|:------|
| **Cards** | Glassmorphism với backdrop-blur |
| **Buttons** | Gradient background, hover effects |
| **Inputs** | Rounded corners, focus ring |
| **Icons** | Colored backgrounds, float animation |
| **Active States** | Rainbow glow, gradient borders |

---

### 2.8. UI Components

#### 2.8.1. Core UI (Shadcn/ui based)

| Component | Mô tả |
|:----------|:------|
| Button | Primary/Secondary/Ghost variants |
| Card | Container với border và shadow |
| Dialog | Modal popup |
| Sheet | Slide-out panel |
| Tabs | Tab navigation |
| Badge | Tags và labels |
| Switch | Toggle switch |
| Slider | Range slider |
| Input | Text input |
| Textarea | Multi-line input |
| Avatar | User avatar |
| Label | Form labels |

#### 2.8.2. Custom UI Components

| Component | Mô tả |
|:----------|:------|
| **GlassCard** | Card với glassmorphism effect |
| **GradientText** | Text với gradient color |
| **AudioPlayer** | Custom audio player với controls |
| **TopicPicker** | Accordion-based topic selector |
| **ThemeSwitcher** | Light/Dark/System toggle + Accent colors |
| **MusicControlBar** | Background music controls |
| **DictionaryPopup** | Dictionary lookup popup |
| **ClickableText** | Text với từ có thể click |

---

## 3. YÊU CẦU PHI CHỨC NĂNG

### 3.1. Performance

| Yêu cầu | Mô tả |
|:--------|:------|
| Skeleton Loading | Hiển thị skeleton trong khi chờ AI response |
| Lazy Loading | Load components khi cần |
| Audio Caching | Cache audio đã generate |
| State Persistence | localStorage cho preferences |

### 3.2. Accessibility

| Yêu cầu | Mô tả |
|:--------|:------|
| Keyboard Navigation | Tab navigation cho các controls |
| Focus States | Visible focus ring |
| Screen Reader | Semantic HTML, ARIA labels |
| Color Contrast | Đảm bảo contrast ratio đủ |

### 3.3. Error Handling

| Scenario | Handling |
|:---------|:---------|
| API Error | Toast notification với message |
| Auth Error | Redirect đến login page |
| Recording Error | Friendly error message với hướng dẫn |
| Network Error | Retry mechanism, offline fallback |

### 3.4. Security

| Yêu cầu | Implementation |
|:--------|:---------------|
| Authentication | Supabase Auth với JWT |
| Protected Routes | ProtectedRoute component |
| API Auth | Bearer token trong headers |
| Input Validation | Sanitize user input |

---

## 4. TỔNG KẾT TÍNH NĂNG

### 4.1. Tính năng theo Module


### 4.2. Điểm nổi bật

1. **AI-Powered Content:** Tất cả nội dung học tập được sinh bởi GPT-4o-mini
2. **Natural TTS:** Giọng đọc tự nhiên từ OpenAI TTS (alloy, nova, onyx)
3. **Speech Recognition:** Nhận diện giọng nói chính xác với Whisper
4. **Modern UI:** Glassmorphism, animations, responsive design
5. **Personalization:** 6 accent themes, Light/Dark mode, Background music
6. **Gamification:** Streaks, XP, Daily goals, Confetti celebrations
7. **Offline-first UX:** Skeleton loading, error handling, state persistence

---

## 5. APPENDIX

### 5.1. File Structure

```
apps/web/src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home/Dashboard
│   ├── listening/         # Listening module
│   ├── speaking/          # Speaking module
│   ├── reading/           # Reading module
│   └── auth/              # Authentication pages
├── components/
│   ├── ui/                # Base UI components (Shadcn)
│   ├── layouts/           # Layout components
│   ├── providers/         # Context providers
│   ├── animations/        # Animation components
│   ├── listening/         # Listening-specific components
│   ├── speaking/          # Speaking-specific components
│   └── history/           # History components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions, API client
├── styles/               # Global styles, CSS
└── types/                # TypeScript types
```

### 5.2. API Endpoints (Backend)

| Endpoint | Method | Mô tả |
|:---------|:-------|:------|
| `/ai/conversation` | POST | Sinh hội thoại mới |
| `/ai/speech` | POST | Chuyển text thành audio (TTS) |
| `/ai/transcribe` | POST | Chuyển audio thành text (STT) |
| `/ai/continue-conversation` | POST | AI tiếp tục hội thoại |
| `/ai/reading` | POST | Sinh bài đọc |
| `/history` | GET/POST/PATCH/DELETE | CRUD lịch sử |
| `/playlists` | GET/POST/PATCH/DELETE | CRUD playlists |
| `/radio/preview` | GET | Preview radio mode |
| `/radio/generate` | POST | Generate radio playlist |

---

*Tài liệu này mô tả đầy đủ các tính năng đã được triển khai trong StudyLanguage Web Application phiên bản 1.0.0.*
