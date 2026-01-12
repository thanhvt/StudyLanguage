# INTEGRATION TEST CASES (SIT)
**Project:** StudyLanguage
**Focus:** API, Database, AI Service Integration
**Updated:** 12/01/2026

---

## 1. FRONTEND <-> BACKEND (API INTEGRATION)

| ID | Interface / Endpoint | Test Case Scenario | Data Interaction | Expected Response |
| :--- | :--- | :--- | :--- | :--- |
| **SIT-001** | `POST /api/speaking/analyze` | User gửi file ghi âm lên server | FE gửi `FormData` (file `.wav`/`.m4a`) -> BE | BE trả về JSON: `{ transcription: "...", score: 85, feedback: [...] }` |
| **SIT-002** | `GET /api/history` | User cuộn xuống cuối trang History (Infinite Scroll) | FE gửi `page=2` -> BE | BE query DB limit/offset -> Trả về list 20 items tiếp theo |
| **SIT-003** | `POST /api/auth/google/callback` | Callback từ Google OAuth | Auth Code -> BE -> Exchange Token | BE set Cookie/JWT -> Redirect về FE |

---

## 2. BACKEND <-> OPENAI (AI SERVICES)

| ID | AI Service | Test Case Scenario | Data Interaction | Expected Response |
| :--- | :--- | :--- | :--- | :--- |
| **SIT-004** | **Whisper API (STT)** | Gửi file audio > 25MB (Giới hạn OpenAI) | BE cần trim/split hoặc báo lỗi handle | Xử lý graceful error hoặc split file thành công |
| **SIT-005** | **GPT-4o (Chat)** | Tạo hội thoại Listening với chủ đề "Space Travel" | Prompt: "Generate conversation about Space..." | JSON valid, nội dung đúng chủ đề Space, không chứa ký tự lạ |
| **SIT-006** | **TTS API** | Tạo audio cho đoạn hội thoại dài | Gửi text dài -> OpenAI TTS | Nhận về file buffer audio (mp3/opus) có thể play được |

---

## 3. BACKEND <-> SUPABASE (DATABASE & STORAGE)

| ID | Component | Test Case Scenario | Data Interaction | Expected Response |
| :--- | :--- | :--- | :--- | :--- |
| **SIT-007** | **Storage Upload** | Upload file ghi âm người dùng | Save file to bucket `user-recordings` | File xuất hiện trên Supabase Dashboard, trả về public URL access được |
| **SIT-008** | **Realtime update** | Login 2 thiết bị -> Update profile ở Device A | Device B subscribe channel `profile` | Device B tự động update UI mà không cần refresh (nếu có realtime) |
| **SIT-009** | **Transaction** | Lưu bài học History + Cộng điểm XP cùng lúc | Insert `activities` + Update `users_xp` | Cả 2 thành công hoặc cả 2 rollback nếu lỗi (Atomic) |

---

## 4. CROSS-PLATFORM SYNC (MOBILE <-> WEB)

| ID | Feature | Test Case Scenario | Interaction | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **SIT-010** | **Learning Position** | Nghe bài A đến phút 5:00 trên Web -> Pause -> Mở Mobile | Mobile App fetch state `last_position` | Mobile hiển thị nút "Resum from 5:00" |
| **SIT-011** | **Notification** | Web trigger nhắc nhở học tập | BE push notification to FCM | Mobile user nhận được Push Notification |
