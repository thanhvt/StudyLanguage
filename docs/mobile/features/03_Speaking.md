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

### 2.2 AI Conversation Flow (Free Talk + Roleplay)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [Setup Screen]                                              │
│  ├─ Chọn sub-mode: [Free Talk] / [Roleplay]                │
│  ├─ Free Talk: Topic + Duration + Feedback Mode             │
│  └─ Roleplay:  Scenario + Difficulty                        │
│         │                                                   │
│         ▼                                                   │
│ [AI Greeting / Context Intro]                               │
│         │                                                   │
│         ▼                                                   │
│ [Conversation Loop] ◄──────────────────────┐                │
│  ├── [Voice/Text Input]                    │                │
│  ├── [AI Transcribe (Groq Whisper)]        │                │
│  ├── [AI Response]                         │                │
│  ├── [Pronunciation Alert? Grammar Fix?]   │                │
│  └── [Continue? ────────────────────────────┘                │
│         │                                                   │
│         ▼ (Timer ends / Turns đủ / User kết thúc)           │
│ [Session Summary + Overall Feedback]                        │
│         │                                                   │
│ [Save to History]                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Shadowing Flow

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

### 2.4 Tongue Twister Flow

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

### Practice Mode
- [ ] Topic selection screen (`ConfigScreen.tsx` — topic + level + suggestion chips)
- [ ] Practice sentence display (`PracticeScreen.tsx` — sentence + IPA display)
- [ ] Hold-to-record button (`PracticeScreen.tsx` — Pressable hold-to-record 80px)
- [ ] Audio recording với react-native-audio-recorder-player (15s max, timer, waveform indicator)
- [ ] Send to backend for AI analysis (`speakingApi.transcribeAudio` + `evaluatePronunciation`)
- [ ] Display feedback with scores (`FeedbackScreen.tsx` — overall score, word scores, tips, retry/next)

### Recording UX
- [ ] Countdown overlay — Animated 3→2→1→GO! trước khi ghi (`CountdownOverlay.tsx`)
- [ ] Swipe-to-cancel — Vuốt lên để hủy recording
- [ ] Preview before submit — Nghe lại bản ghi trước khi gửi (`RecordingPreview.tsx`)

### AI Conversation (Free Talk + Roleplay — hợp nhất)
- [ ] Setup screen hợp nhất (`ConversationSetupScreen.tsx` — sub-mode toggle, topic/scenario, duration/turns, feedback mode, difficulty)
- [ ] Scenario picker cho Roleplay sub-mode (tích hợp trong setup — 8+ scenarios, filter tabs, difficulty)
- [ ] Session screen hợp nhất (`ConversationSessionScreen.tsx` — chat UI, suggested responses, grammar fix, pronunciation alert)
- [ ] Voice/Text input toggle (voice hold + text input)
- [ ] Real-time transcription STT via Groq Whisper (`speakingApi.transcribeAudio`)
- [ ] AI response generation (`speakingApi.continueConversation`)
- [ ] Pronunciation Alert inline (`PronunciationAlert.tsx`)
- [ ] Voice Visualizer (`VoiceVisualizer.tsx` — animated waveform bars)
- [ ] Session Transcript (scrollable chat history)
- [ ] Session Timer (Free Talk) / Turn Counter (Roleplay) with auto-end
- [ ] Overall session feedback + summary (end screen)
- [ ] Save session to History

### Shadowing Mode
- [ ] Shadowing Mode (real-time compare, delay/speed control) (`ShadowingScreen.tsx` — 4-phase flow)

### Tongue Twister Mode
- [ ] Tongue Twister Mode (phoneme categories, speed challenge, leaderboard) (`TongueTwisterScreen.tsx` — 8 twisters + WPM)

### Custom Speaking Scenarios
- [ ] Custom Speaking Scenarios (create/save/favorite/delete) (`CustomScenariosScreen.tsx` — CRUD)

### Gamification & Progress
- [ ] Gamification (daily goals, badges, weekly report) (`DailyGoalCard.tsx`, `BadgeGrid.tsx`)
- [ ] Speaking Progress Dashboard (radar chart, calendar heatmap, weak sounds) (`ProgressDashboardScreen.tsx`, `RadarChart.tsx`, `CalendarHeatmap.tsx`, `WeakSoundsCard.tsx`)

### AI Voice Clone
- [ ] AI Voice Clone Replay (corrected + before/after) — `VoiceCloneReplay.tsx` + `cloneAndCorrectVoice` API

### Save & Share
- [ ] Save & Share Results (share card, recording history, timeline) (`ShareResultCard.tsx`, `RecordingHistoryScreen.tsx`)

### Background Audio & TTS
- [ ] Background Audio for Coach (notification, session persist) — `useCoachTrackPlayer.ts` + TrackPlayer integration
- [ ] TTS Provider Settings (parity với Listening) — `SpeakingTtsSheet.tsx`

### Polish & UX
- [ ] Onboarding overlay cho user mới (`OnboardingOverlay.tsx` — 5-step tutorial)
- [ ] Waveform visualization + comparison (`WaveformComparison.tsx` — AI vs User overlay)
- [ ] Phoneme breakdown view + Phoneme Heatmap (`PhonemeHeatmap.tsx` — word-level red→green)
- [ ] Progress tracking (`ProgressDashboardScreen.tsx`)
- [ ] Haptic feedback (integrated in recording flow)
- [ ] IPA toggle + word stress display (`IPAPopup.tsx`)
- [ ] Tap-to-pronounce word (IPAPopup — tap word → popup IPA + audio)
- [ ] Confetti animation khi score ≥90 (`ConfettiAnimation.tsx` — 30-piece reanimated)

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
