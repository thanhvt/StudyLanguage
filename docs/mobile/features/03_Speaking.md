# 🗣️ Speaking Feature - Mobile

> **Module:** Speaking  
> **Priority:** P0 (Core)  

---

## 1. Overview

Module luyện phát âm với AI feedback, tối ưu cho mobile với hold-to-record UX và haptic feedback.

### 1.1 Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **Practice Mode** | Đọc theo mẫu, AI chấm điểm | Luyện từng câu |
| **Shadowing Mode** | Nhại theo AI đồng thời, so sánh real-time | Luyện ngữ điệu, nhịp nói |
| **AI Conversation** | Hội thoại với AI — Free Talk hoặc Roleplay | Luyện giao tiếp tự nhiên & tình huống |
| **Tongue Twister Mode** | Luyện phát âm vui với câu nói lái | Luyện âm khó |
| **Read Aloud Mode** | Đọc to bài viết dài, AI chấm phát âm | Luyện đọc paragraph/article |

### 1.2 AI Conversation (Coach + Roleplay hợp nhất)

Chế độ hội thoại với AI, hợp nhất Conversation Coach và Roleplay thành 1 mode với 2 sub-mode:

| Sub-mode | Mô tả | Kết thúc khi |
|----------|-------|--------------|
| **💬 Free Talk** | Hội thoại tự do theo topic, AI làm coach | Timer hết (3-20 phút) |
| **🎭 Roleplay** | Đóng vai tình huống cụ thể (restaurant, interview...) | Đủ turns (5-10) hoặc AI.shouldEnd |

#### Shared Features (cả 2 sub-mode)

| Feature | Description |
|---------|-------------|
| **Voice Input** | Hold-to-record, gửi audio để transcribe (Groq Whisper) |
| **Text Input** | Gõ text khi không tiện nói |
| **Real-time Transcription** | STT via `/speaking/transcribe` |
| **AI Response** | AI tiếp tục hội thoại qua `/conversation-generator/continue-conversation` |
| **Pronunciation Alert** | Inline feedback khi phát âm sai |
| **Grammar Correction** | Sửa ngữ pháp inline |
| **Voice Visualizer** | Waveform animation khi đang ghi âm |
| **Session Transcript** | Scrollable conversation history |
| **Feedback Mode** | Beginner / Intermediate / Advanced |
| **Save to History** | Tự động lưu khi kết thúc session |

#### Free Talk Only

| Feature | Description |
|---------|-------------|
| **Session Timer** | Countdown theo duration đã chọn, auto-end |
| **Suggested Responses** | 2-3 gợi ý câu trả lời cho beginner |

#### Roleplay Only

| Feature | Description |
|---------|-------------|
| **Scenario Selection** | REUSE Listening Topic Picker (chung UI component + `customScenarioApi`). Xem Shared Components. |
| **Difficulty Levels** | Easy / Medium / Hard filter |
| **AI Persona** | AI đóng vai nhân vật theo scenario. Mỗi scenario có `persona` metadata (name, role, avatar). VD: 🍽️ Restaurant → 👨‍🍳 "Tony — Waiter". Persona hiển thị trong chat bubble thay vì avatar 🤖 generic. |
| **Turn Limit** | 5-10 turns per session |
| **Overall Feedback** | Feedback tổng kết cuối session |

### 1.3 Shadowing Mode

Technique luyện nói hiệu quả: nghe AI → nhại lại đồng thời → AI so sánh real-time.

| Feature | Description |
|---------|-------------|
| **AI Playback** | Phát câu mẫu với tốc độ tùy chỉnh (0.5x - 1.5x) |
| **Simultaneous Record** | Ghi âm đồng thời khi AI đang phát |
| **Real-time Comparison** | So sánh pitch, tempo, intonation |
| **Delay Control** | Chỉnh delay 0-2s giữa AI và user |
| **Score Breakdown** | Điểm riêng cho rhythm, intonation, accuracy |

#### Shadowing Design Guidelines

> Các gợi ý thiết kế UX dựa trên phương pháp luận shadowing (Alexander Arguelles, Kadota & Tamai 2004):

| # | Guideline | Lý do |
|---|-----------|-------|
| 1 | **Preview trước khi shadow** — Cho user nghe qua 1 lần TRƯỚC khi bắt đầu shadow | Não cần "preview" audio pattern → shadow hiệu quả hơn |
| 2 | **Start slow (0.7x-0.8x)** — Tốc độ mặc định bắt đầu chậm, KHÔNG full speed | Full speed ngay = frustration = bỏ app. Tăng dần theo progress |
| 3 | **Mumble Shadowing mode** — Thêm chế độ dễ: chỉ chấm rhythm + intonation, bỏ qua accuracy | Hạ rào cản cho beginner, tập trung vào "cảm nhận nhịp" trước |
| 4 | **Text + highlight sync** — Hiển thị text và highlight từ đang phát real-time | Giúp user theo dõi vị trí, đặc biệt quan trọng cho người mới |
| 5 | **Progressive difficulty** — Câu ngắn (3-5 từ) → câu dài (10-15 từ) → đoạn văn | Tránh overload, xây dựng confidence dần dần |
| 6 | **Delay control rất quan trọng** — Beginner: 1.5-2s delay, Advanced: 0-0.5s | Delay là tham số quan trọng nhất ảnh hưởng trải nghiệm shadow |
| 7 | **Feedback nhẹ nhàng lúc đầu** — Chấm rhythm + intonation trước, chỉ chấm accuracy khi user đã quen | Tránh feedback quá khắt khe → nản → bỏ luyện |

### 1.4 Tongue Twister Mode

Luyện phát âm vui vẻ với tongue twisters, phân loại theo âm cần luyện.

| Feature | Description |
|---------|-------------|
| **Phoneme Categories** | Phân loại theo âm: `/θ/`, `/ʃ/`, `/r/ vs /l/`... |
| **Speed Challenge** | Tăng tốc dần → thử thách phản xạ |
| **Leaderboard** | Bảng xếp hạng tốc độ + chính xác |
| **Unlock System** | Hoàn thành level dễ → mở khóa level khó |

### 1.5 Custom Scenarios (Shared với Listening)

> Speaking **KHÔNG** có hệ thống Custom Scenarios riêng. Dùng chung DB, API (`customScenarioApi`), và UI component Topic Picker với Listening module.

| Yếu tố | Chi tiết |
|---------|----------|
| **Data** | Chung bảng `custom_scenarios` — tạo ở Listening thấy ở Speaking và ngược lại |
| **API** | Chung `GET/POST/PATCH/DELETE /custom-scenarios` |
| **UI** | Reuse Listening Topic Picker (tab "✨ Tuỳ chỉnh") |
| **CRUD** | Create, Edit, Delete, Favorite — thao tác giống hệt Listening |

### 1.6 TTS Provider Settings

Cấu hình giọng AI mẫu khi phát âm sample (parity với Listening):

| Feature | Description |
|---------|-------------|
| **Provider** | Dùng chung config từ Listening (Azure TTS) |
| **Emotion Context** | AI mẫu nói với emotion phù hợp context câu |
| **Voice Selection** | Chọn giọng mẫu hoặc random |

### 1.7 Gamification & Progress

Hệ thống gamification nâng cao cho Speaking:

| Feature | Description |
|---------|-------------|
| **Achievement Badges** | 🏆 100 câu, 1000 câu, streak 7/30 ngày... |
| **Daily Speaking Goal** | Target nói X câu/ngày, hiện trên Dashboard |
| **Weekly Report** | Trend điểm số, thời gian luyện, weak sounds |
| **Progress Radar** | Biểu đồ radar: Pronunciation / Fluency / Vocabulary / Grammar |
| **Weak Sounds Heatmap** | Hiển thị âm hay sai: `/θ/`, `/ð/`, `/ʃ/`... |
| **Calendar Heatmap** | Ngày nào luyện, ngày nào không |

### 1.8 Save & Share Results

| Feature | Description |
|---------|-------------|
| **Share Card** | Export kết quả dưới dạng image card đẹp (share social) |
| **Recording History** | Lưu recordings để nghe lại sự tiến bộ |
| **Progress Timeline** | So sánh recording cũ vs mới cho cùng câu |

### 1.9 Background Audio cho Coach

| Feature | Description |
|---------|-------------|
| **AI Response Notification** | Notification khi AI response đến (nếu minimize app) |
| **Session Persist** | Giữ session khi chuyển app, resume khi quay lại |

### 1.10 AI Voice Clone Replay

| Feature | Description |
|---------|-------------|
| **Corrected Replay** | Nghe lại giọng mình được AI "sửa" phát âm đúng |
| **Before/After** | So sánh bản gốc vs bản AI-corrected |

---

## 2. User Flows

> Tổng hợp tất cả user flows trong Speaking, bao gồm core modes, cross-cutting features và navigation.

### 2.0 Navigation — Entry Points

> Speaking Home chỉ chọn **MODE**. Chọn **CHỦ ĐỀ** xảy ra bên trong config/setup screen của từng mode, reuse component topic picker từ Listening.

```
┌──────────────────────────────────────────────────────────────────┐
│                      [Home / Tab Bar]                            │
│                           │                                      │
│                      [Speaking Tab]                               │
│                           │                                      │
│                  [Speaking Home Screen]                           │
│                  ┌──────────────────┐                             │
│                  │ ⚙️ TTS Settings  │ ← overlay bottom sheet     │
│                  │ Daily Goal card  │ → tap "Dashboard →"        │
│                  │ 4 Mode Cards     │                            │
│                  └──────────────────┘                             │
│                           │                                      │
│           (user tap 1 trong 4 mode cards)                        │
│                           │                                      │
│      ┌────────┬───────────┼───────────┬──────────┐               │
│      ▼        ▼           ▼           ▼          │               │
│ [Practice] [AI Conv.] [Shadowing] [Tongue T.]    │               │
│ [Config]   [Setup]    [Config]    [Screen]       │               │
│   │          │           │           │       [Dashboard]         │
│   │    Reuse Listening   │           │      (from Daily Goal)    │
│   │    Topic Picker      │           │                           │
│   ▼          ▼           ▼           ▼                           │
│ [Session] [Session]   [Session]  [Practice]                      │
└──────────────────────────────────────────────────────────────────┘
```

| Speaking Home hiện | Tap → Đi đâu |
|-------|-------|
| ⚙️ Settings (top-right) | TTS Settings Bottom Sheet (overlay, không rời Home) |
| Daily Goal card → "Xem Dashboard →" | Progress Dashboard |
| 🎤 Practice card | Practice Config Screen (chọn topic Listening picker ở đây) |
| 💬 AI Conversation card | Conversation Setup (chọn topic Listening picker ở đây) |
| 🔊 Shadowing card | Shadowing Config Screen (chọn sentences) |
| 👅 Tongue Twister card | Tongue Twister Screen (chọn phoneme) |
| 📖 Read Aloud card | Read Aloud Config Screen (chọn topic + paragraph length) |

> ❌ Home **KHÔNG** hiện topics/scenarios. Sạch sẽ, tập trung.

---

### 2.1 Practice Mode — Luyện phát âm từng câu

```
[Speaking Home] → [🎤 Practice card] → [Practice Config Screen]
                    │
                    ├─ Chọn topic → REUSE Listening Topic Picker
                    ├─ Chọn level (Beginner / Intermediate / Advanced)
                    └─ [Bắt đầu]
                         │
                         ▼
                  [Practice Screen]
                    │
                    ├─ Hiển thị câu mẫu + IPA (toggle show/hide)
                    ├─ [Nghe mẫu] → AI TTS phát câu → highlight từ
                    │
                    ├─ [Ghi âm] (hold mic)
                    │    ├─ Countdown 3→2→1→GO! (nếu bật)
                    │    ├─ Haptic start (medium)
                    │    ├─ Waveform animation
                    │    ├─ Max 15s timer
                    │    ├─ Swipe up → Hủy recording
                    │    └─ Release mic → Haptic end (light)
                    │         │
                    │         ├─ (Nếu Preview bật) → [Preview Screen]
                    │         │    ├─ Nghe lại bản ghi
                    │         │    ├─ [Gửi] → submit
                    │         │    └─ [Ghi lại] → quay lại ghi âm
                    │         │
                    │         └─ (Nếu Preview tắt) → Submit trực tiếp
                    │              │
                    │              ▼
                    │       [Loading: AI đang phân tích...]
                    │              │
                    │              ▼
                    │       [Feedback Screen]
                    │         ├─ Overall Score (0-100 + grade)
                    │         ├─ Word-by-word score (tap từ → IPA + audio)
                    │         ├─ Phoneme Heatmap (red→green)
                    │         ├─ AI Tips
                    │         ├─ AI Voice Clone (Before/After)
                    │         ├─ (nếu ≥90) Confetti animation 🎉
                    │         ├─ [Retry] → quay lại câu (swipe left)
                    │         ├─ [Next] → câu tiếp theo (swipe right)
                    │         └─ [Share] → Share Card flow
                    │
                    └─ [Tap từ bất kỳ] → IPA popup + audio phát âm
```

---

### 2.2 AI Conversation — Free Talk

```
[Speaking Home] → [💬 AI Conversation card] → [Conversation Setup Screen]
                    │
                    ├─ Chọn sub-mode: [💬 Free Talk] ← active
                    ├─ Chọn topic → REUSE Listening Topic Picker
                    ├─ Chọn duration: 3 / 5 / 10 / 15 / 20 phút
                    ├─ Chọn feedback mode: Beginner / Intermediate / Advanced
                    ├─ Tùy chọn nâng cao:
                    │    ├─ ☑ Gợi ý câu trả lời
                    │    ├─ ☑ Sửa ngữ pháp inline
                    │    └─ ☑ Cảnh báo phát âm
                    └─ [🎤 Bắt đầu hội thoại]
                         │
                         ▼
                  [Conversation Session Screen]
                    │
                    ├─ Timer countdown (top bar)
                    ├─ AI Greeting message (first msg)
                    │
                    ├─ 🔁 CONVERSATION LOOP:
                    │    │
                    │    ├─ User chọn input mode:
                    │    │    ├─ [🎤 Voice] → Hold mic → Recording → Groq Whisper transcribe
                    │    │    └─ [⌨️ Text] → Gõ text → Send
                    │    │
                    │    ├─ [AI thinking...]
                    │    │    ├─ AI response → chat bubble
                    │    │    ├─ AI audio (TTS) → auto-play
                    │    │    └─ (nếu beginner) Suggested responses (2-3 chips)
                    │    │
                    │    ├─ [Pronunciation Alert?] (inline, nếu phát âm sai)
                    │    │    ├─ Highlight từ sai + IPA + tip
                    │    │    └─ [Nghe phát âm chuẩn] + [Thử lại]
                    │    │
                    │    ├─ [Grammar Fix?] (inline, nếu ngữ pháp sai)
                    │    │    ├─ Hiển thị câu gốc vs câu sửa
                    │    │    └─ Tap để xem giải thích
                    │    │
                    │    └─ Loop tiếp ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
                    │
                    ├─ SESSION KẾT THÚC khi:
                    │    ├─ Timer hết → auto-end
                    │    └─ User bấm [Kết thúc]
                    │
                    ▼
              [Session Summary Screen]
                ├─ Thời gian luyện / Số lượt nói
                ├─ Overall pronunciation score
                ├─ Danh sách từ phát âm sai + sửa
                ├─ Grammar corrections
                ├─ AI feedback tổng kết
                └─ [Share] → Share Card flow
```

---

### 2.3 AI Conversation — Roleplay

```
[Speaking Home] → [💬 AI Conversation card] → [Conversation Setup Screen]
                    │
                    ├─ Chọn sub-mode: [🎭 Roleplay] ← active
                    ├─ Chọn scenario → REUSE Listening Topic Picker
                    ├─ Chọn difficulty: Easy / Medium / Hard
                    ├─ Feedback mode: Beginner / Intermediate / Advanced
                    └─ [🎤 Bắt đầu]
                         │
                         ▼
                  [Conversation Session Screen]
                    │
                    ├─ Turn counter: "Turn 1/8" (top bar)
                    ├─ Context banner: "You are at a restaurant..."
                    ├─ AI persona: "Waiter — Tony"
                    │
                    ├─ 🔁 CONVERSATION LOOP (giống Free Talk)
                    │    ├─ Voice/Text input → AI transcribe → AI response
                    │    ├─ Pronunciation Alert / Grammar Fix inline
                    │    └─ Turn counter ++
                    │
                    ├─ SESSION KẾT THÚC khi:
                    │    ├─ Đủ turns (5-10) / AI.shouldEnd = true
                    │    └─ User bấm [Kết thúc]
                    │
                    ▼
              [Session Summary Screen]
                ├─ (Giống Free Talk summary)
                ├─ + Scenario-specific feedback
                └─ + "Bạn đã hoàn thành tình huống: Restaurant Ordering 🍽️"
```

---

### 2.4 Shadowing Mode

```
[Speaking Home] → [🔊 Shadowing card] → [Shadowing Config]
                    │
                    ├─ Chọn topic → REUSE Listening Topic Picker
                    ├─ Speed: 0.5x — 0.75x — 1.0x — 1.25x — 1.5x
                    ├─ Delay: slider 0s — 2.0s (default: 0.5s)
                    ├─ Scoring: Post-recording / Realtime (Beta)
                    ├─ 🎧 Headphone status
                    └─ [Bắt đầu]
                         │
                         ▼
                  [Shadowing Screen — 4 Phase Flow]
                    │
                    ├─ PHASE 1: Preview
                    │    ├─ AI phát câu mẫu 1 lần (user chỉ nghe)
                    │    ├─ Text highlight sync
                    │    └─ [Shadow!] → vào Phase 2
                    │
                    ├─ PHASE 2: Shadow
                    │    ├─ AI phát lại + User ghi âm đồng thời
                    │    ├─ Waveform visualizer (2 track: AI purple + User green)
                    │    ├─ Text highlight sync
                    │    └─ AI phát xong → auto-stop recording
                    │
                    ├─ PHASE 3: Score
                    │    ├─ Upload audio → Groq Whisper → evaluate
                    │    ├─ Score breakdown:
                    │    │    ├─ 🎵 Rhythm: __/100
                    │    │    ├─ 🎶 Intonation: __/100
                    │    │    └─ 🎯 Accuracy: __/100
                    │    ├─ Waveform comparison (AI vs User overlay)
                    │    └─ Tips
                    │
                    ├─ PHASE 4: Action
                    │    ├─ [Repeat] → quay lại Phase 1 (cùng câu)
                    │    ├─ [Next] → câu tiếp theo → Phase 1
                    │    └─ [Share] → Share Card flow
                    │
                    └─ Khi hết danh sách câu → Session Summary
```

---

### 2.5 Tongue Twister Mode

```
[Speaking Home] → [Tongue Twister Screen]
                    │
                    ├─ Chọn Phoneme Category:
                    │    ├─ /θ/ vs /ð/ (th sounds)
                    │    ├─ /ʃ/ vs /s/ (sh vs s)
                    │    ├─ /r/ vs /l/
                    │    ├─ /v/ vs /w/
                    │    └─ ...
                    │
                    ├─ Chọn Level (Easy → Medium → Hard → Extreme 🔒)
                    │    └─ Unlock: hoàn thành level trước → mở khóa sau
                    │
                    └─ [Practice]
                         │
                         ├─ Hiển thị tongue twister text
                         ├─ [Nghe mẫu] → AI TTS (tốc độ chậm + bình thường)
                         ├─ [Ghi âm] → Record → Score
                         │
                         ├─ Speed Challenge:
                         │    ├─ Round 1: 0.8x speed → Score
                         │    ├─ Round 2: 1.0x speed → Score
                         │    ├─ Round 3: 1.2x speed → Score
                         │    ├─ Round 4: 1.5x speed → Score
                         │    └─ WPM (Words Per Minute) tracking
                         │
                         └─ [Leaderboard] → Bảng xếp hạng speed + accuracy
```

---

### 2.6 Read Aloud Mode — Đọc to bài viết

> **Gốc:** Gộp từ Reading Practice (04_Reading.md cũ). Mọi hoạt động phát âm giờ thuộc Speaking module.

```
[Speaking Home] → [📖 Read Aloud card] → [Read Aloud Config]
                    │
                    ├─ Chọn topic → REUSE Listening Topic Picker
                    ├─ Chọn level (Beginner / Intermediate / Advanced)
                    ├─ Chọn độ dài (Short / Medium / Long paragraph)
                    └─ [Bắt đầu]
                         │
                         ▼
                  [Read Aloud Session Screen]
                    │
                    ├─ Hiển thị paragraph text
                    ├─ [Nghe mẫu] → AI TTS đọc paragraph → highlight
                    │
                    ├─ [Ghi âm] (hold mic — reuse Practice recording UX)
                    │    ├─ Countdown + Haptic
                    │    ├─ Waveform animation
                    │    ├─ Max 60s timer (dài hơn Practice vì đọc đoạn)
                    │    └─ Release → Submit
                    │         │
                    │         ▼
                    │  [AI phân tích phát âm toàn đoạn]
                    │    ├─ Overall Score: accuracy + fluency
                    │    ├─ Word-by-word score (highlight sai)
                    │    ├─ AI Tips
                    │    └─ [Retry] / [Next paragraph]
                    │
                    └─ Khi hết paragraphs → Session Summary
                         ├─ Tổng điểm
                         ├─ Từ phát âm sai nhiều nhất
                         └─ Save to History
```

| So sánh | Practice Mode | Read Aloud Mode |
|---------|--------------|----------------|
| Input | 1 câu ngắn (~5-15 từ) | 1 paragraph dài (~30-100 từ) |
| Thời gian ghi âm | Max 15s | Max 60s |
| Đánh giá | Word-level score + phoneme | Paragraph-level + fluency |
| Source text | AI sinh câu mẫu | AI sinh article paragraph |
| Reuse API | `/ai/evaluate-pronunciation` | `/ai/evaluate-pronunciation` (cùng API) |

---

### 2.7 Cross-cutting Feature Flows

#### C1. Custom Scenarios (Shared với Listening)

> **Không có màn riêng cho Speaking.** Custom scenarios dùng chung DB với Listening qua `customScenarioApi` (`/custom-scenarios`). User tạo/quản lý ở Listening → tự động thấy ở Speaking (trong topic picker).

```
Tạo mới:  [Mode Setup → Topic Picker → ➕ Create] → Lưu vào shared DB
Quản lý:  [Listening → Custom Scenarios Screen] → CRUD (tạo/sửa/xóa/favorite)
Sử dụng:  [Speaking → Mode Setup → Topic Picker → tab ✨ Tuỳ chỉnh] → chọn scenario
```

#### C2. TTS Settings (Config độc lập)

```
[Speaking Home] → [⚙️ icon top-right] → [TTS Settings Bottom Sheet]
                    │
                    ├─ Giọng mẫu: dropdown voices (Jenny, Sara, Guy...)
                    │    └─ Toggle: 🎲 Random giọng
                    ├─ Cảm xúc: Cheerful / Neutral / Friendly / Newscast
                    │    └─ Toggle: 🎲 Auto (theo context)
                    ├─ Tốc độ đọc (Rate): slider 0.5x — 2.0x
                    ├─ Cao độ giọng (Pitch): slider -50% — +50%
                    └─ [Lưu cài đặt]
```

> Config **độc lập** với Listening (Speaking cần giọng chậm/rõ ≠ Listening cần tự nhiên).

#### C3. Gamification & Progress Dashboard

```
[Speaking Home] → [Progress Dashboard]
                    │
                    ├─ Daily Goal Card
                    │    ├─ Progress bar: "5/10 câu hôm nay"
                    │    ├─ Streak: "🔥 7 ngày liên tục"
                    │    └─ [Chỉnh mục tiêu] → input (1-100 câu/ngày)
                    │
                    ├─ Radar Chart (Pronunciation/Fluency/Vocab/Grammar)
                    │
                    ├─ Calendar Heatmap (ngày xanh = luyện, ngày trắng = không)
                    │
                    ├─ Weak Sounds Card
                    │    ├─ Phoneme heatmap: /θ/ 45%, /ʃ/ 72%, /r/ 88%...
                    │    └─ [Tap âm yếu] → navigate đến Practice/Tongue Twister
                    │
                    ├─ Badge Grid (🎤 100 câu, 🔥 streak, 🏅 perfect, 🌟 shadower)
                    │
                    └─ Weekly Report (Score trend + thời gian + weak sounds tuần)
```

#### C4. Recording History & Progress Timeline

```
[Speaking Home / Dashboard] → [Recording History Screen]
                    │
                    ├─ Danh sách recordings (grouped by ngày)
                    │    ├─ Câu + Score + Thời gian + Mode
                    │    └─ [Tap] → Nghe lại recording
                    │
                    └─ [So sánh] (cùng câu, khác ngày)
                         ├─ Timeline: Recording cũ ←→ Recording mới
                         ├─ Score trend
                         └─ Waveform comparison
```

#### C5. AI Voice Clone Replay

```
[Feedback Screen] → [AI Voice Clone]
                    │
                    ├─ [Bản gốc] → Nghe recording user
                    ├─ [Bản AI sửa] → Nghe AI-corrected version
                    └─ [So sánh A/B] → Play cả 2 xen kẽ
```

#### C6. Share Result

```
[Feedback / Session Summary] → [Share]
                    │
                    ├─ Generate Share Card (image):
                    │    ├─ Score + Grade + Topic + Câu + Date + Streak
                    │    └─ App branding + QR code
                    │
                    └─ [Share] → react-native-share
                         ├─ Facebook / Instagram Story / Messenger
                         ├─ Copy Image / Save to Photos
                         └─ More options
```

#### C7. Onboarding (First-time User)

```
[First time vào Speaking Tab]
                    │
                    ▼
              [Onboarding Overlay — 5 steps] (trên Speaking Home)
                    │
                    ├─ Step 1: "Chào mừng đến Speaking! 🎤"
                    ├─ Step 2: "Giữ mic để ghi âm" (highlight mic button)
                    ├─ Step 3: "AI sẽ chấm điểm phát âm" (highlight feedback)
                    ├─ Step 4: "Thử các chế độ khác nhau" (highlight mode cards)
                    └─ Step 5: "Bắt đầu nào!" → dismiss
                         └─ [Không hiện lại] → lưu flag
```

---

### 2.7 Flow Map tổng hợp

| # | Flow | Trigger | Topic Picker | End State |
|---|------|---------|--------------|-----------| 
| B1 | Practice Mode | Home → 🎤 Practice → Config | Reuse Listening | Feedback → Retry/Next |
| B2 | AI Conv. Free Talk | Home → 💬 AI Conv. → Setup | Reuse Listening | Summary → History |
| B3 | AI Conv. Roleplay | Home → 💬 AI Conv. → Setup | Reuse Listening | Summary → History |
| B4 | Shadowing | Home → 🔊 Shadowing → Config | Sentences | Score → Repeat/Next |
| B5 | Tongue Twister | Home → 👅 Tongue T. → Screen | Phonemes | Speed Challenge → LB |
| B6 | Read Aloud | Home → 📖 Read Aloud → Config | Reuse Listening | Feedback → Next para |
| C1 | Custom Scenarios | Shared DB với Listening | — | Hiện trong topic picker |
| C2 | TTS Settings | Home → ⚙️ (overlay) | — | Lưu config (độc lập) |
| C3 | Gamification | Home → Daily Goal → Dashboard | — | View-only |
| C4 | Recording History | Dashboard → History | — | Nghe lại + So sánh |
| C5 | Voice Clone | Feedback → Clone | — | Before/After |
| C6 | Share Result | Feedback/Summary → Share | — | Social share |
| C7 | Onboarding | First visit | — | Dismiss overlay |

---

## 3. Edge Cases & Error Flows

### 3.1 Recording Errors

```
[Ghi âm]
    ├─ ❌ Microphone permission denied
    │    └─ Alert: "Cần quyền micro" → [Mở Settings]
    │
    ├─ ❌ Recording quá ngắn (< 1s)
    │    └─ Toast: "Hãy nói lâu hơn nhé!"
    │
    ├─ ❌ Không nghe được gì (silence / noise)
    │    └─ Toast: "Không nghe rõ, thử nói to hơn!"
    │
    └─ ❌ Swipe-to-cancel
         └─ Discard recording → quay lại trạng thái idle
```

### 3.2 Network Errors

```
[Submit audio / AI request]
    ├─ ❌ Mất mạng giữa chừng
    │    ├─ Toast: "Mất kết nối, thử lại?"
    │    ├─ [Thử lại] → retry API call
    │    └─ Audio được cache locally → không mất
    │
    ├─ ❌ Server timeout
    │    └─ Toast + retry button
    │
    └─ ❌ Groq Whisper quota exceeded
         ├─ Fallback → whisper-large-v3
         └─ Nếu vẫn lỗi → Toast: "Hệ thống bận, thử lại sau"
```

### 3.3 AI Conversation Edge Cases

```
[Conversation Session]
    ├─ ⚠️ User im lặng quá lâu (> 30s)
    │    └─ AI prompt: "Bạn còn đó không? Cần gợi ý không?"
    │
    ├─ ⚠️ App minimize / switch app
    │    ├─ Session persist → resume khi quay lại
    │    ├─ Timer pause (hoặc tiếp tục — config)
    │    └─ Notification: "AI đang chờ bạn quay lại 🎤"
    │
    ├─ ⚠️ Incoming call
    │    └─ Auto-pause session → resume sau cuộc gọi
    │
    └─ ⚠️ Timer sắp hết (< 1 phút)
         └─ Toast: "Còn 1 phút!" + [Gia hạn +5 phút]
```

### 3.4 Shadowing Edge Cases

```
[Shadowing Session]
    ├─ ⚠️ Không cắm tai nghe + không có AEC
    │    └─ Warning modal: "Nên dùng tai nghe cho Shadowing 🎧"
    │
    ├─ ⚠️ User nói quá nhỏ (mic không bắt được)
    │    └─ Toast: "Hãy nói to hơn nhé!"
    │
    └─ ⚠️ Device nóng (thermal throttling)
         └─ Auto-pause + warning (hiếm gặp)
```

### 3.5 Save to History

```
[Session kết thúc] (bất kỳ mode nào)
    │
    ├─ Auto-save → POST /api/history
    │    ├─ type: 'speaking'
    │    ├─ mode: 'practice' | 'conversation' | 'shadowing' | 'tongue-twister'
    │    ├─ topic, scores, duration
    │    └─ recordings (nếu có)
    │
    ├─ ✅ Success → silent (không alert)
    │
    └─ ❌ Fail → retry silently + cache locally
```

---

## 4. Features Detail

### 4.1 Recording UX

| Feature | Description |
|---------|-------------|
| Hold-to-record | Giữ nút mic để ghi âm |
| Visual feedback | Waveform animation khi đang ghi |
| Haptic start | Medium impact khi bắt đầu |
| Haptic end | Light impact khi thả |
| **Countdown** | Animated 3→2→1→GO! trước khi ghi |
| **Swipe-to-cancel** | Vuốt lên để hủy recording |
| **Preview before submit** | Nghe lại bản ghi trước khi gửi |
| Max duration | 15 giây default |

### 4.2 AI Feedback

| Feedback Type | Description |
|---------------|-------------|
| Overall Score | 0-100 score with grade |
| Word-by-word | Score cho từng word |
| Phoneme breakdown | IPA transcription |
| **Phoneme Heatmap** | Visual map âm cần cải thiện |
| Tips | AI-generated suggestions |
| Comparison | User vs AI waveform |
| **AI Voice Clone** | Nghe giọng mình được AI sửa |
| **Confetti** | Animation mừng khi ≥90 |

### 4.3 Progress Tracking

| Metric | Description |
|--------|-------------|
| Session score | Trung bình tất cả attempts |
| Streak | Liên tục câu đúng |
| History | Tất cả attempts saved |
| Improvement | Score trend theo thời gian |
| **Radar Chart** | Pronunciation/Fluency/Vocab/Grammar |
| **Calendar Heatmap** | Ngày luyện / không |
| **Weak Sounds** | Âm hay sai cần cải thiện |

### 4.4 Gamification

| Feature | Description |
|---------|-------------|
| Daily Goal | X câu/ngày, progress bar |
| Badges | 🎤100 câu, 🔥streak, 🏅perfect, 🌟shadower |
| Weekly Report | Trend + thống kê + weak sounds |
| Leaderboard | Tongue Twister mode |

### 4.5 Save & Share

| Feature | Description |
|---------|-------------|
| Share Card | Export kết quả → image card đẹp |
| Recording History | Lưu recordings, nghe lại tiến bộ |
| Progress Timeline | So sánh recording cũ vs mới cùng câu |

---

## 5. Technical Implementation

### 5.1 Libraries

```typescript
react-native-audio-recorder-player // Ghi âm và phát lại audio
react-native-haptic-feedback       // Phản hồi rung
react-native-reanimated            // Animation waveform, confetti
@tanstack/react-query              // Caching AI feedback
react-native-share                 // Chia sẻ kết quả
react-native-view-shot             // Chụp result card
lottie-react-native                // Animation confetti, countdown
```

### 5.2 State Structure

```typescript
interface SpeakingState {
  // Session
  session: {
    topic: string;
    sentences: Sentence[];
    currentIndex: number;
    mode: 'practice' | 'coach' | 'roleplay' | 'shadowing' | 'tongue-twister';
  };
  
  // Ghi âm
  recording: {
    isRecording: boolean;
    duration: number;
    audioUri?: string;
    showCountdown: boolean; // Countdown animation trước khi ghi
    showPreview: boolean;   // Preview trước khi submit
  };
  
  // Phản hồi từ AI
  feedback: {
    loading: boolean;
    score?: number;
    wordScores?: WordScore[];
    phonemeHeatmap?: PhonemeScore[]; // Heatmap các âm
    tips?: string[];
    aiCorrectedAudioUrl?: string;    // AI Voice Clone URL
  };
  
  // Gamification
  gamification: {
    dailyGoal: { target: number; completed: number };
    streak: number;
    badges: Badge[];
    weakSounds: PhonemeScore[];
  };
  
  // Custom scenarios
  customScenarios: CustomScenario[];
  
  // Cài đặt hiển thị
  displaySettings: {
    showIPA: boolean;
    showStress: boolean;
  };
}

interface WordScore {
  word: string;
  score: number;
  phonemes?: string;
  issues?: string[];
}

interface PhonemeScore {
  phoneme: string;     // Ví dụ: '/θ/'
  accuracy: number;    // 0-100
  totalAttempts: number;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  unlockedAt?: Date;
}

interface CustomScenario {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  createdAt: Date;
}
```

### 5.3 AI Conversation State (Coach + Roleplay hợp nhất)

```typescript
interface AIConversationState {
  // Setup — gộp Coach + Roleplay config
  setup: {
    mode: 'free-talk' | 'roleplay';
    topic: string;
    scenario?: RoleplayScenario;    // Chỉ khi mode = roleplay
    duration?: number;               // Chỉ khi mode = free-talk (phút: 3, 5, 10, 15, 20)
    maxTurns?: number;               // Chỉ khi mode = roleplay (5-10)
    feedbackMode: 'beginner' | 'intermediate' | 'advanced';
    difficulty?: 'easy' | 'medium' | 'hard'; // Chỉ khi mode = roleplay
    options: {
      showSuggestions: boolean;      // Gợi ý câu trả lời (beginner)
      inlineGrammarFix: boolean;     // Sửa ngữ pháp inline
      pronunciationAlert: boolean;   // Cảnh báo phát âm
    };
  };

  // Session — CHUNG cho cả 2 sub-mode
  session: {
    isActive: boolean;
    messages: ConversationMessage[];
    remainingTime?: number;          // Free-talk timer (seconds)
    currentTurn?: number;            // Roleplay turn counter
    inputMode: 'voice' | 'text';
  };

  // AI — CHUNG
  ai: {
    isThinking: boolean;
    isTranscribing: boolean;
  };
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  timestamp: Date;
  pronunciationFeedback?: PronunciationFeedback;
}

interface PronunciationFeedback {
  word: string;
  ipa: string;
  tip: string;
}
```

### 5.4 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ai/transcribe` | POST | Chuyển audio → text (STT) |
| `/conversation-generator/continue-conversation` | POST | AI tiếp tục hội thoại |
| `/ai/generate-conversation-audio` | POST | Generate audio cho AI response |

### 5.5 Recording Flow

```typescript
// Pseudo-code for recording
async function handleRecordStart() {
  ReactNativeHapticFeedback.trigger('impactMedium');
  await AudioRecorderPlayer.startRecorder();
}

async function handleRecordStop() {
  ReactNativeHapticFeedback.trigger('impactLight');
  const uri = await AudioRecorderPlayer.stopRecorder();
  
  // Gửi audio lên server và nhận AI feedback
  const feedback = await speakingAPI.analyze(uri, targetSentence);
  ReactNativeHapticFeedback.trigger('notificationSuccess');
}
```

### 5.6 Shadowing Mode — Technical Challenges

> Shadowing yêu cầu **đồng thời**: phát audio AI + ghi âm user + so sánh + text highlight — trên mobile device với tài nguyên hạn chế.

#### Challenge 1: Audio Echo / Feedback Loop

Mic thu lại audio đang phát từ loa → AI nhận tiếng AI, không phải tiếng user.

| Giải pháp | Mô tả | Khả thi? |
|-----------|--------|----------|
| **AEC (Acoustic Echo Cancellation)** | iOS/Android built-in AEC trong audio session | ✅ iOS `AVAudioSession.Mode.voiceChat` tự bật AEC |
| **Headphone requirement** | Khuyến khích tai nghe | ✅ Nên là "recommended", không "required" |
| **Volume ducking** | Giảm volume AI khi user đang nói | ⚠️ Workaround — không lý tưởng cho shadowing |

**Đề xuất:** Detect headphone → dùng bình thường. Không headphone → bật voiceChat mode (AEC) + toast khuyến khích tai nghe. Fallback: volume AI giảm 30%.

#### Challenge 2: Simultaneous Playback + Recording

`react-native-audio-recorder-player` KHÔNG hỗ trợ phát và ghi đồng thời trên cùng instance.

| Giải pháp | Trade-off |
|-----------|-----------|
| **TrackPlayer (play) + AudioRecorder (record)** | ✅ Đề xuất — App đã có TrackPlayer cho Listening |
| **expo-av** | ⚠️ Khả thi nhưng cần Expo |
| **Native Module tự viết** | ❌ Over-engineering cho MVP |

**Lưu ý iOS:** Cần set audio session category = `playAndRecord` (không phải `playback`), options: `[.defaultToSpeaker, .allowBluetooth]`.

#### Challenge 3: Scoring — STT Provider

| Provider | Model | Latency | Dùng cho |
|----------|-------|---------|----------|
| **Groq Whisper** | `whisper-large-v3-turbo` | ⚡ ~500ms-1s | ✅ **Shadowing — đề xuất** |
| **OpenAI Whisper** | `whisper-1` | 🐢 ~1-3s | Reading Practice |
| **Azure Speech** | Chưa tích hợp STT | — | Hiện chỉ dùng TTS |

**Scoring approach — 2 giai đoạn:**

| Phase | Approach | Effort | Mô tả |
|-------|----------|--------|-------|
| **MVP** | Post-recording compare | 2-3 tuần | Ghi xong → Groq Whisper STT (`/speaking/transcribe-and-evaluate`) → score |
| **V2** | Hybrid real-time | 3-4 tuần | On-device pitch contour extraction (FFT + autocorrelation via `react-native-audio-api`) → visual so sánh đường cong pitch AI vs User real-time. Server vẫn dùng cho final scoring. Để Phase 2 vì: complexity DSP cao, thư viện chưa stable, CPU intensive, cần validate user demand trước |

#### Challenge 4: Delay Synchronization

User chỉnh delay 0-2s → phải sync text highlight + playback + recording. Khi scoring, cần align user audio bằng cách trim delay offset hoặc gửi `delayMs` + `speedRate` metadata cho server.

#### Challenge 5: Performance trên thiết bị yếu

| Concern | Mitigation |
|---------|------------|
| CPU: 4 luồng đồng thời | Offload audio processing sang native thread (TrackPlayer đã làm) |
| Memory: buffer audio lớn | Giới hạn sentence length (max 30s), stream không buffer toàn bộ |
| Battery: mic + speaker + processing | Hiện cảnh báo, khuyến khích sạc |

---

## 6. Gestures & Interactions

| Context | Gesture | Action |
|---------|---------|--------|
| Mic button | Long press | Bắt đầu ghi âm |
| Mic button | Release | Dừng ghi âm |
| **Recording** | **Swipe up** | **Hủy recording** |
| Feedback | Swipe right | Câu tiếp theo |
| Feedback | Swipe left | Retry |
| Word | Tap | Hiển IPA + audio |
| **Weak sound** | **Tap** | **Navigate đến practice âm đó** |
| **Preview** | **Tap play** | **Nghe lại bản ghi** |
| **Share card** | **Tap share** | **Export result → social** |

---

## 7. Haptic Feedback

| Event | Haptic Type |
|-------|-------------|
| Recording start | Medium impact |
| Recording end | Light impact |
| Good score (≥85) | Success notification |
| Low score (<70) | Warning notification |
| Perfect score (100) | Heavy impact |

---

## 8. Implementation Tasks

> Cập nhật trạng thái: 2026-03-10 (audit toàn diện)

### Practice Mode
- [x] Topic selection screen (`ConfigScreen.tsx` — topic + level + suggestion chips)
- [x] Practice sentence display (`PracticeScreen.tsx` — sentence + IPA display)
- [x] Hold-to-record button (`PracticeScreen.tsx` — Pressable hold-to-record 80px)
- [x] Audio recording với react-native-audio-recorder-player (15s max, timer, waveform indicator)
- [x] Send to backend for AI analysis (`speakingApi.transcribeAudio` + `evaluatePronunciation`)
- [x] Display feedback with scores (`FeedbackScreen.tsx` — overall score, word scores, tips, retry/next)

### Recording UX
- [x] Countdown overlay — Animated 3→2→1→GO! trước khi ghi (`CountdownOverlay.tsx`)
- [ ] Swipe-to-cancel — Vuốt lên để hủy recording _(skipped per user feedback)_
- [x] Preview before submit — Nghe lại bản ghi trước khi gửi (`RecordingPreview.tsx`)

### AI Conversation (Free Talk + Roleplay — hợp nhất)
- [x] Setup screen hợp nhất (`ConversationSetupScreen.tsx` — sub-mode toggle, topic/scenario, duration/turns, feedback mode, difficulty)
- [x] Scenario picker cho Roleplay sub-mode (tích hợp trong setup — 8+ scenarios, filter tabs, difficulty)
- [x] Session screen hợp nhất (`ConversationScreen.tsx` — chat UI, suggested responses, grammar fix, pronunciation alert)
- [x] Voice/Text input toggle (voice hold + text input) _(useAudioRecorder rewritten with real recording)_
- [x] Real-time transcription STT via Groq Whisper (`speakingApi.transcribeAudio`)
- [x] AI response generation (`speakingApi.continueConversation`)
- [x] Pronunciation Alert inline (`PronunciationAlert.tsx`)
- [x] Voice Visualizer (`VoiceVisualizer.tsx` — animated waveform bars)
- [x] Session Transcript (scrollable chat history)
- [x] Session Timer (Free Talk) / Turn Counter (Roleplay) with auto-end
- [x] Overall session feedback + summary (end screen)
- [x] Save session to History

### Shadowing Mode
- [x] Shadowing Mode (real-time compare, delay/speed control) (`ShadowingSessionScreen.tsx` — 4-phase flow)

### Tongue Twister Mode
- [x] Tongue Twister Mode (phoneme categories, speed challenge, leaderboard) (`SpeedChallengeScreen.tsx` — leaderboard modal + badges)

### Custom Speaking Scenarios
- [x] Custom Speaking Scenarios (create/save/favorite/delete) — reuse từ Listening module

### Gamification & Progress
- [x] Gamification (daily goals, badges, weekly report) (`ProgressDashboardScreen.tsx`)
- [x] Speaking Progress Dashboard (radar chart, calendar heatmap, weak sounds) (`ProgressDashboardScreen.tsx`)

### AI Voice Clone
- [/] AI Voice Clone Replay (corrected + before/after) — `cloneAndCorrectVoice` API có fallback, UI chưa đầy đủ

### Save & Share
- [x] Save & Share Results (share card, recording history, timeline) (`ShareResultCard.tsx`, `RecordingHistoryScreen.tsx`)

### Background Audio & TTS
- [/] Background Audio for Coach (notification, session persist) — _agent khác đang thực hiện_
- [x] TTS Provider Settings (parity với Listening) — `SpeakingTtsSheet.tsx`

### Read Aloud Mode (gộp từ Reading Practice)
- [ ] Read Aloud Config Screen (`ReadAloudConfigScreen.tsx` — topic, level, paragraph length)
- [ ] Read Aloud Session Screen (paragraph display + hold-to-record + AI feedback)
- [ ] 60s max recording support (longer than Practice 15s)
- [ ] Paragraph-level fluency scoring

### Polish & UX
- [x] Onboarding overlay cho user mới (`OnboardingOverlay.tsx` — 5-step tutorial)
- [x] Waveform visualization + comparison (`DualWaveformVisualizer.tsx` — AI vs User overlay)
- [x] Phoneme breakdown view + Phoneme Heatmap — trong FeedbackScreen
- [x] Progress tracking (`ProgressDashboardScreen.tsx`)
- [x] Haptic feedback (integrated in recording flow)
- [x] IPA toggle + word stress display
- [x] Tap-to-pronounce word (IPAPopup — tap word → popup IPA + audio)
- [x] Confetti animation khi score ≥90 (`ConfettiAnimation.tsx`)

---

## 9. API Reference

> **Base URL:** `/api`  
> **Auth:** Tất cả endpoints yêu cầu `Authorization: Bearer <Supabase JWT>`

### 9.1 Speaking Module (`/api/speaking`)

#### `GET /api/speaking/tongue-twisters?level=beginner`

> Lấy danh sách tongue twisters theo level

**Query Params:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `level` | string | ❌ | `beginner` \| `intermediate` \| `advanced` |

**Response:**

```json
[
  { "id": "1", "text": "She sells seashells...", "level": "beginner", "category": "s-sounds" }
]
```

---

#### `GET /api/speaking/stats`

> Lấy thống kê speaking của user

**Response:**

```json
{
  "totalSessions": 42,
  "totalMinutes": 180,
  "topicsCount": 15,
  "weeklyData": [{ "day": "Mon", "minutes": 25 }]
}
```

---

#### `POST /api/speaking/voice-clone`

> Clone giọng user qua Azure Custom Voice (đang phát triển)

**Request:** `multipart/form-data`

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `audio` | File | ✅ | Audio sample của user |
| `text` | string | ✅ | Text cần TTS bằng giọng clone |

**Response:** Audio buffer hoặc placeholder (feature đang phát triển)

---

### 9.2 AI Module - TTS/STT (`/api/ai`)

#### `POST /api/ai/transcribe`

> Chuyển audio thành text (Whisper STT) — dùng cho recording → text

**Request:** `multipart/form-data`

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `audio` | File | ✅ | File audio cần transcribe |

**Response:**

```json
{ "text": "I want to go for a walk today" }
```

---

#### `POST /api/ai/text-to-speech`

> Chuyển text thành audio (Azure TTS) — dùng cho Coach voice

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `text` | string | ✅ | Text cần TTS |
| `voice` | string | ❌ | Voice ID |
| `provider` | enum | ❌ | `azure` (mặc định) |
| `emotion` | string | ❌ | Emotion cho Azure |
| `randomVoice` | boolean | ❌ | Random giọng |
| `randomEmotion` | boolean | ❌ | Random emotion |
| `pitch` | string | ❌ | Pitch adjustment |
| `rate` | string | ❌ | Tốc độ đọc |
| `volume` | string | ❌ | Âm lượng |

**Response:**

```json
{
  "audio": "<base64>",
  "contentType": "audio/mpeg",
  "wordTimestamps": [{ "word": "hello", "offset": 0, "duration": 500 }]
}
```

---

#### `POST /api/ai/evaluate-pronunciation`

> Đánh giá phát âm của user

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `originalText` | string | ✅ | Văn bản mẫu |
| `userTranscript` | string | ✅ | Transcript từ Whisper |

**Response:**

```json
{
  "overallScore": 85,
  "feedback": "Good pronunciation! Pay attention to..."
}
```

---

#### `GET /api/ai/voices?provider=azure`

> Lấy danh sách voices khả dụng cho TTS Provider Settings

**Query Params:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `provider` | enum | ❌ | `azure` (mặc định) |

---

### 9.3 Conversation Generator (`/api/conversation-generator`)

#### `POST /api/conversation-generator/generate-interactive`

> Sinh hội thoại tương tác cho Roleplay mode

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `topic` | string | ✅ | Chủ đề roleplay |
| `contextDescription` | string | ❌ | Mô tả ngữ cảnh |

---

#### `POST /api/conversation-generator/continue-conversation`

> AI phản hồi trong multi-turn conversation

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `conversationHistory` | `{ speaker, text }[]` | ✅ | Lịch sử hội thoại |
| `userInput` | string | ✅ | Câu user vừa nói |
| `topic` | string | ✅ | Chủ đề |

**Response:**

```json
{
  "response": "That's correct! Now let's...",
  "shouldEnd": false
}
```

---

#### `POST /api/conversation-generator/evaluate-pronunciation`

> Đánh giá phát âm chi tiết từng từ (Groq)

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `originalText` | string | ✅ | Văn bản gốc |
| `userTranscript` | string | ✅ | Transcript user đọc |

---

#### `POST /api/conversation-generator/generate`

> Sinh hội thoại cho Practice mode

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `topic` | string | ✅ | Chủ đề |
| `durationMinutes` | number | ❌ | Thời lượng (5-15 phút) |
| `level` | enum | ❌ | `beginner` \| `intermediate` \| `advanced` |
| `numSpeakers` | number | ❌ | Số người nói (2-4) |
| `keywords` | string | ❌ | Từ khóa gợi ý |

---

### 9.4 Custom Scenarios Module (`/api/custom-scenarios`)

> Xem chi tiết ở [02_Listening.md - Section 8.8](02_Listening.md#88-custom-scenarios-module-apicustom-scenarios)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/custom-scenarios` | Lấy danh sách |
| `POST` | `/api/custom-scenarios` | Tạo mới |
| `PATCH` | `/api/custom-scenarios/:id` | Cập nhật |
| `PATCH` | `/api/custom-scenarios/:id/favorite` | Toggle favorite |
| `DELETE` | `/api/custom-scenarios/:id` | Xóa |

---

## 10. Related Documents

- [00_Mobile_Overview.md](../00_Mobile_Overview.md) - Project overview
- [02_Listening.md](02_Listening.md) - Parity: Custom Scenarios, TTS Settings
- [07_History.md](07_History.md) - Speaking session history & analytics
- [08_Profile_Settings.md](08_Profile_Settings.md) - Speaking goals, achievements
- [10_Native_Features.md](10_Native_Features.md) - Haptic feedback, gestures
- [Architecture.md](../technical/Architecture.md) - Audio handling
- [UI_Design_System.md](../design/UI_Design_System.md) - Button specs
