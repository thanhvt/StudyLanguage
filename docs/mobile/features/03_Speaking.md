# 🗣️ Speaking Feature - Mobile

> **Module:** Speaking  
> **Priority:** P0 (Core)  
> **Phase:** MVP → Enhanced → Advanced

---

## 1. Overview

Module luyện phát âm với AI feedback, tối ưu cho mobile với hold-to-record UX và haptic feedback.

### 1.1 Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **Practice Mode** | Đọc theo mẫu, AI chấm điểm | Luyện từng câu |
| **Shadowing Mode** | Nhại theo AI đồng thời, so sánh real-time (NEW ✨) | Luyện ngữ điệu, nhịp nói |
| **Conversation Coach** | AI coach hội thoại realtime | Luyện giao tiếp tự nhiên |
| **Roleplay Mode** | Đóng vai tình huống | Advanced practice |
| **Tongue Twister Mode** | Luyện phát âm vui với câu nói lái (NEW ✨) | Luyện âm khó |

### 1.2 AI Conversation Coach

Chế độ luyện nói với AI coach, tương tự web-v2. User nói hoặc gõ, AI phản hồi realtime với feedback phát âm.

| Feature | Description |
|---------|-------------|
| **Voice Input** | Hold-to-record, gửi audio để transcribe |
| **Text Input** | Gõ text khi không tiện nói |
| **Real-time Transcription** | STT via `/ai/transcribe` |
| **AI Response** | AI tiếp tục hội thoại qua `/conversation-generator/continue-conversation` |
| **Pronunciation Alert** | Inline feedback khi phát âm sai |
| **Grammar Correction** | Sửa ngữ pháp inline (NEW ✨) |
| **Suggested Responses** | 2-3 gợi ý câu trả lời cho beginner (NEW ✨) |
| **Voice Visualizer** | Waveform animation khi đang ghi âm |
| **Session Transcript** | Scrollable conversation history |
| **Session Timer** | Countdown theo duration đã chọn, auto-end |
| **Feedback Mode** | Beginner / Intermediate / Advanced |
| **Save to History** | Tự động lưu khi kết thúc session |

### 1.3 Shadowing Mode (NEW ✨)

Technique luyện nói hiệu quả: nghe AI → nhại lại đồng thời → AI so sánh real-time.

| Feature | Description |
|---------|-------------|
| **AI Playback** | Phát câu mẫu với tốc độ tùy chỉnh (0.5x - 1.5x) |
| **Simultaneous Record** | Ghi âm đồng thời khi AI đang phát |
| **Real-time Comparison** | So sánh pitch, tempo, intonation |
| **Delay Control** | Chỉnh delay 0-2s giữa AI và user |
| **Score Breakdown** | Điểm riêng cho rhythm, intonation, accuracy |

### 1.4 Tongue Twister Mode (NEW ✨)

Luyện phát âm vui vẻ với tongue twisters, phân loại theo âm cần luyện.

| Feature | Description |
|---------|-------------|
| **Phoneme Categories** | Phân loại theo âm: `/θ/`, `/ʃ/`, `/r/ vs /l/`... |
| **Speed Challenge** | Tăng tốc dần → thử thách phản xạ |
| **Leaderboard** | Bảng xếp hạng tốc độ + chính xác |
| **Unlock System** | Hoàn thành level dễ → mở khóa level khó |

### 1.5 Custom Speaking Scenarios (NEW ✨)

Tương tự Listening Custom Scenarios, cho phép user tạo scenario riêng để luyện nói.

| Feature | Description |
|---------|-------------|
| **Create** | Tạo scenario với tên + mô tả chi tiết |
| **Quick Use** | Dùng ngay không lưu vào database |
| **Save** | Lưu vào database để dùng lại |
| **Favorite** | Đánh dấu yêu thích |
| **Delete** | Xóa scenario đã lưu |

### 1.6 TTS Provider Settings (NEW ✨)

Cấu hình giọng AI mẫu khi phát âm sample (parity với Listening):

| Feature | Description |
|---------|-------------|
| **Provider** | Dùng chung config từ Listening (Azure TTS) |
| **Emotion Context** | AI mẫu nói với emotion phù hợp context câu |
| **Voice Selection** | Chọn giọng mẫu hoặc random |

### 1.7 Gamification & Progress (NEW ✨)

Hệ thống gamification nâng cao cho Speaking:

| Feature | Description |
|---------|-------------|
| **Achievement Badges** | 🏆 100 câu, 1000 câu, streak 7/30 ngày... |
| **Daily Speaking Goal** | Target nói X câu/ngày, hiện trên Dashboard |
| **Weekly Report** | Trend điểm số, thời gian luyện, weak sounds |
| **Progress Radar** | Biểu đồ radar: Pronunciation / Fluency / Vocabulary / Grammar |
| **Weak Sounds Heatmap** | Hiển thị âm hay sai: `/θ/`, `/ð/`, `/ʃ/`... |
| **Calendar Heatmap** | Ngày nào luyện, ngày nào không |

### 1.8 Save & Share Results (NEW ✨)

| Feature | Description |
|---------|-------------|
| **Share Card** | Export kết quả dưới dạng image card đẹp (share social) |
| **Recording History** | Lưu recordings để nghe lại sự tiến bộ |
| **Progress Timeline** | So sánh recording cũ vs mới cho cùng câu |

### 1.9 Background Audio cho Coach (NEW ✨)

| Feature | Description |
|---------|-------------|
| **AI Response Notification** | Notification khi AI response đến (nếu minimize app) |
| **Session Persist** | Giữ session khi chuyển app, resume khi quay lại |

### 1.10 AI Voice Clone Replay (NEW ✨)

| Feature | Description |
|---------|-------------|
| **Corrected Replay** | Nghe lại giọng mình được AI "sửa" phát âm đúng |
| **Before/After** | So sánh bản gốc vs bản AI-corrected |

---

## 2. User Flows

### 2.1 Practice Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [Home]  →  [Topic Select]  →  [Practice]  →  [Feedback]    │
│                                  (Record)      (AI Score)  │
│                                     │             │         │
│                                     └─────────────┘         │
│                                       [Repeat / Next]       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Conversation Coach Flow (NEW ✨)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [Setup Screen]  →  [AI Greeting]  →  [Conversation Loop]   │
│  Topic, Duration     (First msg)       │                    │
│  Feedback Mode                    [Voice/Text Input]        │
│                                        │                    │
│                                   [AI Transcribe]           │
│                                        │                    │
│                                   [AI Response]             │
│                                        │                    │
│                                   [Pronunciation Alert?]    │
│                                        │                    │
│                                   [Loop until timer ends]   │
│                                        │                    │
│                                   [Save to History]         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Roleplay Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [Select Scenario]  →  [AI Intro]  →  [Conversation]        │
│  (Restaurant, etc)     (Context)      (5-10 turns)         │
│                                           │                 │
│                                     [Overall Feedback]      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 Shadowing Flow (NEW ✨)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [Select Sentence]  →  [AI Plays]  →  [User Shadows]        │
│                        (Mẫu)         (Ghi âm đồng thời)   │
│                                           │                 │
│                                    [Real-time Compare]      │
│                                           │                 │
│                                    [Score: Rhythm,          │
│                                     Intonation, Accuracy]   │
│                                           │                 │
│                                    [Repeat / Next]          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.5 Tongue Twister Flow (NEW ✨)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [Chọn Phoneme]  →  [Level Select]  →  [Practice]           │
│  (/θ/, /ʃ/...)     (Easy → Hard)     (Record + Score)      │
│                                           │                 │
│                                    [Speed Challenge]        │
│                                    (Tăng tốc dần)          │
│                                           │                 │
│                                    [Leaderboard]            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
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
| **Countdown** (NEW ✨) | Animated 3→2→1→GO! trước khi ghi |
| **Swipe-to-cancel** (NEW ✨) | Vuốt lên để hủy recording |
| **Preview before submit** (NEW ✨) | Nghe lại bản ghi trước khi gửi |
| Max duration | 15 giây default |

### 4.2 AI Feedback

| Feedback Type | Description |
|---------------|-------------|
| Overall Score | 0-100 score with grade |
| Word-by-word | Score cho từng word |
| Phoneme breakdown | IPA transcription |
| **Phoneme Heatmap** (NEW ✨) | Visual map âm cần cải thiện |
| Tips | AI-generated suggestions |
| Comparison | User vs AI waveform |
| **AI Voice Clone** (NEW ✨) | Nghe giọng mình được AI sửa |
| **Confetti** (NEW ✨) | Animation mừng khi ≥90 |

### 4.3 Progress Tracking

| Metric | Description |
|--------|-------------|
| Session score | Trung bình tất cả attempts |
| Streak | Liên tục câu đúng |
| History | Tất cả attempts saved |
| Improvement | Score trend theo thời gian |
| **Radar Chart** (NEW ✨) | Pronunciation/Fluency/Vocab/Grammar |
| **Calendar Heatmap** (NEW ✨) | Ngày luyện / không |
| **Weak Sounds** (NEW ✨) | Âm hay sai cần cải thiện |

### 4.4 Gamification (NEW ✨)

| Feature | Description |
|---------|-------------|
| Daily Goal | X câu/ngày, progress bar |
| Badges | 🎤100 câu, 🔥streak, 🏅perfect, 🌟shadower |
| Weekly Report | Trend + thống kê + weak sounds |
| Leaderboard | Tongue Twister mode |

### 4.5 Save & Share (NEW ✨)

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
react-native-share                 // Chia sẻ kết quả (NEW ✨)
react-native-view-shot             // Chụp result card (NEW ✨)
lottie-react-native                // Animation confetti, countdown (NEW ✨)
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

### 5.3 Conversation Coach State (NEW ✨)

```typescript
interface ConversationCoachState {
  // Setup
  setup: {
    topic: string;
    duration: number; // minutes: 3, 5, 10, 15, 20
    feedbackMode: 'beginner' | 'intermediate' | 'advanced';
  };
  
  // Session
  session: {
    isActive: boolean;
    messages: ConversationMessage[];
    remainingTime: number; // seconds
    inputMode: 'voice' | 'text';
  };
  
  // AI
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

### 5.4 API Endpoints (NEW ✨)

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

---

## 6. Gestures & Interactions

| Context | Gesture | Action |
|---------|---------|--------|
| Mic button | Long press | Bắt đầu ghi âm |
| Mic button | Release | Dừng ghi âm |
| **Recording** | **Swipe up** (NEW ✨) | **Hủy recording** |
| Feedback | Swipe right | Câu tiếp theo |
| Feedback | Swipe left | Retry |
| Word | Tap | Hiển IPA + audio (NEW ✨) |
| **Weak sound** | **Tap** (NEW ✨) | **Navigate đến practice âm đó** |
| **Preview** | **Tap play** (NEW ✨) | **Nghe lại bản ghi** |
| **Share card** | **Tap share** (NEW ✨) | **Export result → social** |

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

### MVP Phase
- [x] Topic selection screen ✅ (`ConfigScreen.tsx` — topic + level + suggestion chips)
- [x] Practice sentence display ✅ (`PracticeScreen.tsx` — sentence + IPA display)
- [x] Hold-to-record button ✅ (`PracticeScreen.tsx` — Pressable hold-to-record 80px)
- [x] Audio recording với react-native-audio-recorder-player ✅ (15s max, timer, waveform indicator)
- [x] Send to backend for AI analysis ✅ (`speakingApi.transcribeAudio` + `evaluatePronunciation`)
- [x] Display feedback with scores ✅ (`FeedbackScreen.tsx` — overall score, word scores, tips, retry/next)
- [x] **Onboarding overlay** cho user mới ✅ (`OnboardingOverlay.tsx` — 5-step tutorial)

### Enhanced Phase
- [x] **Conversation Coach setup screen** ✅ (`CoachSetupScreen.tsx` — topic, duration, feedback mode)
- [x] **Conversation Coach session UI** ✅ (`CoachSessionScreen.tsx` — chat UI, suggested responses, grammar fix, re-speak)
- [x] **Voice/Text input toggle** ✅ (CoachSessionScreen — voice hold + text input)
- [x] **Real-time transcription (STT)** ✅ (`speakingApi.transcribeAudio`)
- [x] **AI response generation** ✅ (`speakingApi.continueConversation`)
- [x] **Pronunciation Alert inline** ✅ (`PronunciationAlert.tsx`)
- [x] **Voice Visualizer** ✅ (`VoiceVisualizer.tsx` — animated waveform bars)
- [x] **Session Transcript** ✅ (CoachSessionScreen — scrollable chat history)
- [x] **Session Timer with auto-end** ✅ (CoachSessionScreen — countdown timer)
- [x] **Save coach session to History** ✅ (placeholder integration)
- [x] Waveform visualization + comparison ✅ (`WaveformComparison.tsx` — AI vs User overlay)
- [x] Phoneme breakdown view + **Phoneme Heatmap** ✅ (`PhonemeHeatmap.tsx` — word-level red→green)
- [x] Progress tracking ✅ (`ProgressDashboardScreen.tsx`)
- [x] Haptic feedback ✅ (integrated in recording flow)
- [x] **Recording UX: countdown, swipe-to-cancel, preview** ✅ (`CountdownOverlay.tsx`, `RecordingPreview.tsx`)
- [x] **Custom Speaking Scenarios** (create/save/favorite/delete) ✅ (`CustomScenariosScreen.tsx` — CRUD)
- [x] **Shadowing Mode** (real-time compare, delay/speed control) ✅ (`ShadowingScreen.tsx` — 4-phase flow)
- [x] **IPA toggle + word stress display** ✅ (`IPAPopup.tsx`)
- [x] **Tap-to-pronounce word** ✅ (IPAPopup — tap word → popup IPA + audio)

### Advanced Phase
- [x] Roleplay scenarios + **Scenario Selection UI** ✅ (`RoleplaySelectScreen.tsx` — 8 scenarios, filter tabs)
- [x] Multi-turn conversations ✅ (`RoleplaySessionScreen.tsx` — AI↔User turn-based voice)
- [x] Difficulty levels ✅ (Easy/Medium/Hard filter in RoleplaySelectScreen)
- [x] Overall session feedback ✅ (RoleplaySessionScreen — end summary)
- [x] **Tongue Twister Mode** (phoneme categories, speed challenge, leaderboard) ✅ (`TongueTwisterScreen.tsx` — 8 twisters + WPM)
- [x] **Gamification** (daily goals, badges, weekly report) ✅ (`DailyGoalCard.tsx`, `BadgeGrid.tsx`)
- [x] **Speaking Progress Dashboard** (radar chart, calendar heatmap, weak sounds) ✅ (`ProgressDashboardScreen.tsx`, `RadarChart.tsx`, `CalendarHeatmap.tsx`, `WeakSoundsCard.tsx`)
- [x] **AI Voice Clone Replay** (corrected + before/after) — ✅ `VoiceCloneReplay.tsx` + `cloneAndCorrectVoice` API
- [x] **Save & Share Results** (share card, recording history, timeline) ✅ (`ShareResultCard.tsx`, `RecordingHistoryScreen.tsx`)
- [x] **Background Audio for Coach** (notification, session persist) — ✅ `useCoachTrackPlayer.ts` + TrackPlayer integration
- [x] **TTS Provider Settings** (parity với Listening) — ✅ `SpeakingTtsSheet.tsx` (reuse pattern từ Listening)
- [x] **Confetti animation** khi score ≥90 ✅ (`ConfettiAnimation.tsx` — 30-piece reanimated)

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
