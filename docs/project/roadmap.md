# 🗺️ PROJECT ROADMAP - STUDYLANGUAGE APP

**Dự án:** App Luyện Thi Tiếng Anh Đa Nền Tảng (AI-Powered)
**Ngày lập:** 10/01/2026
**Tổng thời gian ước tính:** 11-17 tuần

---

## 📌 Chú thích Song song (Parallel Execution)
- 🔀 **PARALLEL GROUP**: Các task cùng nhóm có thể chạy song song
- ⏳ **DEPENDS ON**: Task này phụ thuộc vào task khác phải hoàn thành trước
- 🤖 **AI AGENT FRIENDLY**: Task này phù hợp để AI agent tự động thực hiện

---

## Phase 0: Foundation (Nền tảng)
**Thời gian:** 1-2 tuần
**Mục tiêu:** Setup hạ tầng, cấu trúc dự án, đảm bảo kết nối giữa các thành phần.

### 🔀 PARALLEL GROUP A (Có thể làm đồng thời)

#### Task 0.1: Project Structure 🤖 ✅
- [x] Quyết định Monorepo vs Multi-repo
- [x] Khởi tạo Next.js project (Web)
- [x] Khởi tạo Expo project (Mobile)
- [x] Khởi tạo NestJS project (Backend)
- [x] Config Tailwind, Shadcn/ui (Web)
- [ ] Config NativeWind (Mobile)

#### Task 0.2: Supabase Setup 🤖 ✅
- [x] Tạo project trên Supabase Cloud
- [x] Thiết kế Database Schema (ERD)
- [x] Tạo các tables cơ bản: users, user_preferences, lessons, conversations
- [x] Enable Google OAuth Provider
- [x] Tạo Supabase Storage buckets (audio files)

### ⏳ SEQUENTIAL (Phụ thuộc Group A)

#### Task 0.3: Backend AI Skeleton 🤖 ✅
> **DEPENDS ON:** Task 0.1 (NestJS project phải được khởi tạo trước)
- [x] Tạo NestJS module `ai-service`
- [x] Viết service gọi OpenAI GPT (text generation)
- [x] Viết service gọi OpenAI Whisper (STT)
- [x] Viết service gọi OpenAI TTS
- [x] Tạo API endpoints: `/api/ai/generate`, `/api/ai/transcribe`, `/api/ai/speak`

#### Task 0.4: Design System 🤖 ✅
> **DEPENDS ON:** Task 0.1 (Projects phải được khởi tạo trước)
- [x] Xây dựng bộ Theme tokens (colors, spacing, typography)
- [x] Implement Light/Dark mode toggle
- [x] Implement 6 màu Green Nature theme
- [x] Tạo base components: Button, Card, Input, Modal

> 💡 **Gợi ý:** Task 0.3 và Task 0.4 có thể chạy SONG SONG sau khi Group A hoàn thành.

---

## Phase 1: Core Features - MVP
**Thời gian:** 4-6 tuần
**Mục tiêu:** Ra bản dùng được với tính năng Listening & Speaking.

### 🔀 PARALLEL GROUP B (Có thể làm đồng thời)

#### Task 1.1: Authentication Flow 🤖 ✅
> **DEPENDS ON:** Task 0.2 (Supabase phải được setup)
- [x] Implement Google Login (Web - Supabase Auth)
- [ ] Implement Google Login (Mobile - Supabase Auth + Expo AuthSession)
- [ ] Sync user preferences (theme, language) vào DB
- [ ] Protected routes / screens

#### Task 1.4: Background Music 🤖 ✅
> **DEPENDS ON:** Task 0.1 (Projects ready)
- [x] Tích hợp Lofi audio player
- [x] Playlist nhạc nền (có thể dùng free Lofi tracks)
- [x] Implement Audio Ducking (giảm volume khi AI nói)

### 🔀 PARALLEL GROUP C (Sau khi Auth + AI Skeleton ready)

#### Task 1.2: Listening Module (MVP) ✅
> **DEPENDS ON:** Task 0.3 (AI APIs), Task 1.1 (Auth)
- [x] UI Form: Chọn Topic, Duration, Keywords, Number of speakers
- [x] Backend: GPT sinh kịch bản hội thoại
- [x] Backend: TTS sinh audio từ kịch bản (nhiều giọng cho nhiều người)
- [x] Upload audio lên Supabase Storage (StorageService ready)
- [x] UI Audio Player: Play/Pause, Seek, Volume
- [x] UI Transcript sync (Karaoke highlight)

#### Task 1.3: Speaking Module (MVP) ✅
> **DEPENDS ON:** Task 0.3 (AI APIs), Task 1.1 (Auth)
- [x] UI hiển thị Sample Script (AI sinh)
- [x] Ghi âm voice user (expo-av / Web MediaRecorder)
- [x] Upload audio lên Backend
- [x] Backend: Whisper transcribe user audio
- [x] Backend: So sánh user text vs sample text, chấm điểm
- [x] UI hiển thị Feedback (điểm, highlight từ sai)
- [x] Nút "Nghe AI đọc mẫu" (TTS)
- [x] Nút "Luyện lại" (Retry)

> 💡 **Gợi ý:** Task 1.2 và Task 1.3 là 2 module ĐỘC LẬP, hoàn toàn có thể phát triển SONG SONG bởi 2 AI agents hoặc 2 developers.

---

## Phase 2: Complete 4 Skills
**Thời gian:** 3-4 tuần
**Mục tiêu:** Hoàn thiện đủ 4 kỹ năng học.

### 🔀 PARALLEL GROUP D (3 modules độc lập)

#### Task 2.1: Reading Module 🤖 ✅
> **DEPENDS ON:** Phase 1 MVP complete
- [x] Backend: GPT sinh bài đọc theo chủ đề, độ khó
- [x] Backend: GPT sinh 3-5 câu hỏi đọc hiểu
- [x] UI hiển thị bài đọc
- [x] UI làm quiz (trắc nghiệm/tự luận)
- [ ] Dictionary popup (click vào từ tra nghĩa)

#### Task 2.2: Writing Module 🤖 ✅
> **DEPENDS ON:** Phase 1 MVP complete
- [x] UI Text Editor nhập văn bản
- [x] Backend: GPT sửa lỗi ngữ pháp
- [x] Backend: GPT gợi ý paraphrase (viết lại cho hay hơn)
- [x] UI highlight lỗi + hiển thị gợi ý

#### Task 2.3: Interactive Listening (Advanced)
> **DEPENDS ON:** Task 1.2 (Listening MVP)
- [ ] Mode "Tham gia hội thoại"
- [ ] AI sinh hội thoại có chỗ trống cho user
- [ ] AI dừng, chờ user nói
- [ ] User nói -> AI tiếp tục hội thoại dựa trên input

> 💡 **Gợi ý:** Task 2.1, 2.2, 2.3 có thể làm SONG SONG hoàn toàn. Đây là cơ hội lớn nhất để tận dụng AI agents!

---

## Phase 3: Polish & UX
**Thời gian:** 2-3 tuần
**Mục tiêu:** Đánh bóng giao diện, tối ưu trải nghiệm người dùng.

### 🔀 PARALLEL GROUP E (Tất cả độc lập)

#### Task 3.1: Animations & Effects 🤖
- [ ] Page transitions mượt (Framer Motion - Web)
- [ ] Screen transitions (Reanimated - Mobile)
- [ ] Confetti effect khi hoàn thành bài
- [ ] Skeleton loading cho AI response

#### Task 3.2: Glassmorphism UI 🤖
- [ ] Áp dụng hiệu ứng kính mờ cho lesson cards
- [ ] Ripple effects cho buttons
- [ ] Hover/Active states đẹp mắt

#### Task 3.3: Haptic Feedback (Mobile) 🤖
- [ ] Rung nhẹ khi hoàn thành bài học
- [ ] Feedback rung khi bấm nút chính

#### Task 3.4: Responsiveness 🤖
- [ ] Test & fix UI trên các kích thước màn hình
- [ ] Tablet layout optimization

> 💡 **Gợi ý:** Toàn bộ Phase 3 có thể chạy SONG SONG! 4 tasks hoàn toàn độc lập.

---

## Phase 4: Testing & Deploy
**Thời gian:** 1-2 tuần
**Mục tiêu:** Kiểm thử kỹ lưỡng và triển khai production.

### 🔀 PARALLEL GROUP F

#### Task 4.1: QA & Bug Fixing
- [ ] Test trên iOS device thật
- [ ] Test trên Android device thật
- [ ] Test cross-browser (Chrome, Safari, Firefox)
- [ ] Fix critical bugs

#### Task 4.2: Deploy Production 🤖
- [ ] Deploy Next.js Web lên Vercel
- [ ] Deploy NestJS Backend lên Railway/Render
- [ ] Supabase: Enable Row Level Security (RLS)
- [ ] Supabase: Setup backup policies

#### Task 4.3: Mobile App Distribution
> **DEPENDS ON:** Task 4.1 (QA pass)
- [ ] Build iOS app (EAS Build)
- [ ] Submit to TestFlight (Beta testing)
- [ ] Build Android app (EAS Build)
- [ ] Submit to Play Console (Internal testing)

---

## 📊 Tổng kết Milestones

| Milestone | Deliverable | Target |
| :--- | :--- | :--- |
| **M0** | Dev environment ready, AI APIs working | Tuần 2 |
| **M1** | MVP: Listening + Speaking hoạt động | Tuần 8 |
| **M2** | Full 4 skills complete | Tuần 12 |
| **M3** | Polished UI/UX | Tuần 15 |
| **M4** | Production deployed | Tuần 17 |

---

## 🚀 Tối ưu với AI Agents - Parallel Execution Map

```
Phase 0 Timeline:
┌─────────────────────────────────────────────────────────────┐
│  Week 1                          │  Week 2                  │
├─────────────────────────────────────────────────────────────┤
│  [Task 0.1] ════════════╗        │                          │
│  [Task 0.2] ════════════╬═══▶    │  [Task 0.3] ═════════╗   │
│             (PARALLEL)  ║        │  [Task 0.4] ═════════╬══▶│
│                         ║        │             (PARALLEL)   │
└─────────────────────────────────────────────────────────────┘

Phase 1 Timeline:
┌─────────────────────────────────────────────────────────────┐
│  Week 3-4                        │  Week 5-8                │
├─────────────────────────────────────────────────────────────┤
│  [Task 1.1] ════════════╗        │  [Task 1.2] ═════════╗   │
│  [Task 1.4] ════════════╬═══▶    │  [Task 1.3] ═════════╬══▶│
│             (PARALLEL)  ║        │             (PARALLEL)   │
└─────────────────────────────────────────────────────────────┘

Phase 2 Timeline:
┌─────────────────────────────────────────────────────────────┐
│  Week 9-12 (ALL PARALLEL!)                                  │
├─────────────────────────────────────────────────────────────┤
│  [Task 2.1: Reading]  ══════════════════════════════════▶   │
│  [Task 2.2: Writing]  ══════════════════════════════════▶   │
│  [Task 2.3: Interactive] ═══════════════════════════════▶   │
└─────────────────────────────────────────────────────────────┘

Phase 3 Timeline:
┌─────────────────────────────────────────────────────────────┐
│  Week 13-15 (ALL PARALLEL!)                                 │
├─────────────────────────────────────────────────────────────┤
│  [Task 3.1: Animations]   ══════════════════════════════▶   │
│  [Task 3.2: Glassmorphism] ═════════════════════════════▶   │
│  [Task 3.3: Haptic]       ══════════════════════════════▶   │
│  [Task 3.4: Responsive]   ══════════════════════════════▶   │
└─────────────────────────────────────────────────────────────┘
```

---

*Tài liệu này sẽ được cập nhật liên tục khi dự án tiến triển.*
