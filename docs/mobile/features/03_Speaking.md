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
| **Conversation Coach** | AI coach hội thoại realtime (NEW ✨) | Luyện giao tiếp tự nhiên |
| **Roleplay Mode** | Đóng vai tình huống | Advanced practice |

### 1.2 AI Conversation Coach (NEW ✨)

Chế độ luyện nói với AI coach, tương tự web-v2. User nói hoặc gõ, AI phản hồi realtime với feedback phát âm.

| Feature | Description |
|---------|-------------|
| **Voice Input** | Hold-to-record, gửi audio để transcribe |
| **Text Input** | Gõ text khi không tiện nói |
| **Real-time Transcription** | STT via `/ai/transcribe` |
| **AI Response** | AI tiếp tục hội thoại qua `/conversation-generator/continue-conversation` |
| **Pronunciation Alert** | Inline feedback khi phát âm sai |
| **Voice Visualizer** | Waveform animation khi đang ghi âm |
| **Session Transcript** | Scrollable conversation history |
| **Session Timer** | Countdown theo duration đã chọn, auto-end |
| **Feedback Mode** | Beginner / Intermediate / Advanced |
| **Save to History** | Tự động lưu khi kết thúc session |

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

---

## 3. UI Mockups

### 3.1 Topic Selection

```
┌─────────────────────────────────┐
│  ← Speaking Practice        ⋮  │
├─────────────────────────────────┤
│                                 │
│  Chọn chủ đề luyện tập          │
│                                 │
│  ┌─────────────────────────┐   │
│  │  💼 Business            │   │
│  │  Vocabulary & Phrases   │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │  🌍 Travel              │   │
│  │  Airport, Hotel, etc    │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │  💻 Technology          │   │
│  │  Tech terms & trends    │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │  📚 Academic            │   │
│  │  IELTS/TOEFL phrases    │   │
│  └─────────────────────────┘   │
│                                 │
│  ▼ More topics...               │
│                                 │
└─────────────────────────────────┘
```

### 3.2 Practice Screen - Ready State

```
┌─────────────────────────────────┐
│  ← Technology Vocabulary    💬  │
├─────────────────────────────────┤
│  📊 Current Score: 85/100       │
│  🔥 Streak: 5 sentences         │
├─────────────────────────────────┤
│                                 │
│  "Artificial Intelligence       │
│   is revolutionizing the way    │
│   we live and work."            │
│                                 │
│  🔊 [Nghe AI phát âm mẫu]       │
│                                 │
├─────────────────────────────────┤
│                                 │
│           🎤                    │
│      [Giữ để ghi âm]            │
│                                 │
│      ⚪ Ready to record         │
│                                 │
│  💡 Tip: Hold the button        │
│      and speak clearly          │
│                                 │
└─────────────────────────────────┘
```

**Specs:**
- Score: Running average
- Sentence: Large, readable font
- AI Audio: Play sample pronunciation
- Mic button: Large (80px), center-bottom
- Haptic: Light impact when ready

### 3.3 Practice Screen - Recording State

```
┌─────────────────────────────────┐
│  ← Technology Vocabulary    💬  │
├─────────────────────────────────┤
│  📊 Current Score: 85/100       │
├─────────────────────────────────┤
│                                 │
│  "Artificial Intelligence       │
│   is revolutionizing the way    │
│   we live and work."            │
│                                 │
├─────────────────────────────────┤
│                                 │
│     🌊🌊🌊🌊🌊🌊🌊🌊             │
│     [Live Waveform]             │
│                                 │
│           🔴                    │
│       Recording...              │
│      ⏱️ 0:03 / 0:15             │
│                                 │
│     [Thả để dừng ghi]           │
│                                 │
└─────────────────────────────────┘
```

**Specs:**
- Waveform: Real-time audio visualization
- Timer: Countdown from max duration
- Button: Pulsing animation
- Haptic: Continuous light vibration

### 3.4 Feedback Screen - Overview

```
┌─────────────────────────────────┐
│  ← Pronunciation Result     ✅  │
├─────────────────────────────────┤
│                                 │
│         🎯 Score                │
│          88/100                 │
│   [████████████░░] Great job!   │
│                                 │
├─────────────────────────────────┤
│  📊 Phân tích chi tiết:         │
│                                 │
│  ✅ Artificial        (95/100)  │
│  ✅ Intelligence      (90/100)  │
│  ⚠️ Revolutionizing  (75/100)  │
│  ✅ Live              (92/100)  │
│  ✅ Work              (88/100)  │
│                                 │
│  💡 Lời khuyên:                 │
│  "Âm /ʃ/ trong 'revolutionizing'│
│   cần nhấn mạnh hơn"            │
│                                 │
├─────────────────────────────────┤
│  🔊 Nghe lại     🔊 So sánh AI  │
├─────────────────────────────────┤
│  [🔁 Luyện lại]  [➡️ Tiếp theo] │
└─────────────────────────────────┘
```

**Specs:**
- Score: Animated counter (0 → 88)
- Progress bar: Gradient fill
- Word scores: Color-coded (✅ ≥85, ⚠️ <85)
- Tips: AI-generated suggestions
- Haptic: Success notification

### 3.5 Feedback - Waveform Comparison

```
┌─────────────────────────────────┐
│  ← Waveform Comparison      ⟳  │
├─────────────────────────────────┤
│                                 │
│  🤖 AI Sample                   │
│  ────────────────────────────  │
│  ▁▂▃▅▆▇▆▅▃▂▁▂▃▅▆▇▆▅▃▂▁        │
│  ────────────────────────────  │
│                        [▶️ Play]│
│                                 │
├─────────────────────────────────┤
│                                 │
│  👤 Your Recording              │
│  ────────────────────────────  │
│  ▁▂▄▅▆▇▆▅▄▂▁▂▄▅▆▇▆▅▃▂▁        │
│  ────────────────────────────  │
│                        [▶️ Play]│
│                                 │
├─────────────────────────────────┤
│                                 │
│  📝 Overlay mode: [ON/OFF]      │
│                                 │
│       [Luyện lại]               │
│                                 │
└─────────────────────────────────┘
```

### 3.6 Conversation Coach - Setup (NEW ✨)

```
┌─────────────────────────────────┐
│  ← Conversation Coach       ⋮  │
├─────────────────────────────────┤
│                                 │
│  📝 Chủ đề                      │
│  ┌─────────────────────────┐   │
│  │ Tình huống hằng ngày   ▼│   │
│  └─────────────────────────┘   │
│                                 │
│  ⏱️ Thời lượng                  │
│  ┌─────────────────────────┐   │
│  │  3   5  (10)  15  20 min│   │
│  └─────────────────────────┘   │
│                                 │
│  📊 Mức độ phản hồi             │
│  ┌─────────────────────────┐   │
│  │ ○ Beginner              │   │
│  │   (Sửa mọi lỗi)        │   │
│  │ ● Intermediate          │   │
│  │   (Sửa lỗi quan trọng) │   │
│  │ ○ Advanced              │   │
│  │   (Chỉ sửa lỗi nghiêm  │   │
│  │    trọng)               │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │    🗣️ Bắt đầu nói       │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

### 3.7 Conversation Coach - Session (NEW ✨)

```
┌─────────────────────────────────┐
│  ← Conversation       ⏱️ 08:30  │
├─────────────────────────────────┤
│                                 │
│  👤 AI:                         │
│  ┌─────────────────────────┐   │
│  │ Hi! Let me ask you      │   │
│  │ about your daily        │   │
│  │ routine. What do you    │   │
│  │ usually do in the       │   │
│  │ morning?            🔊  │   │
│  └─────────────────────────┘   │
│                                 │
│                 👤 You:         │
│  ┌─────────────────────────┐   │
│  │ I usually wake up at    │   │
│  │ 7 o'clock and have      │   │
│  │ breakfast.              │   │
│  └─────────────────────────┘   │
│                                 │
│  ⚠️ Pronunciation tip:         │
│  ┌─────────────────────────┐   │
│  │ "usually" → /ˈjuːʒuəli/ │   │
│  │ Nhấn âm đầu "YOO"       │   │
│  └─────────────────────────┘   │
│                                 │
│  👤 AI:                         │
│  ┌─────────────────────────┐   │
│  │ That sounds nice! Do    │   │
│  │ you prefer tea or       │   │
│  │ coffee?             🔊  │   │
│  └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│  [🎤 Hold]  [⌨️ Text]   [⏹️]   │
└─────────────────────────────────┘
```

**Specs:**
- Timer: Countdown ở header, auto-end khi hết
- AI bubbles: Left-aligned, có nút 🔊 phát audio
- User bubbles: Right-aligned
- Pronunciation Alert: Inline card giữa messages
- Bottom bar: Voice (hold-to-record), Text toggle, End session
- Voice Visualizer: Hiện khi đang recording (thay thế bottom bar)

### 3.8 Conversation Coach - Voice Recording (NEW ✨)

```
┌─────────────────────────────────┐
│  ← Conversation       ⏱️ 08:15  │
├─────────────────────────────────┤
│                                 │
│     [Chat messages above]       │
│                                 │
├─────────────────────────────────┤
│                                 │
│     🌊🌊🌊🌊🌊🌊🌊🌊             │
│     [Voice Visualizer]          │
│                                 │
│           🔴                    │
│      Đang ghi âm...             │
│      ⏱️ 0:03                    │
│                                 │
│     [Thả để gửi]                │
│                                 │
└─────────────────────────────────┘
```

### 3.9 Roleplay - Scenario Selection

### 3.7 Roleplay - Conversation

```
┌─────────────────────────────────┐
│  ← Restaurant Roleplay      ⋮  │
├─────────────────────────────────┤
│  Turn: 3/10     ⏱️ Time: 02:30  │
├─────────────────────────────────┤
│                                 │
│  👤 Waiter:                     │
│  ┌─────────────────────────┐   │
│  │ Hi! Welcome to our      │   │
│  │ restaurant. Table for   │   │
│  │ how many? 🔊            │   │
│  └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│                                 │
│      💭 Đến lượt bạn!           │
│                                 │
│           🎤                    │
│      [Giữ để trả lời]           │
│                                 │
│      ⏱️ Còn 10 giây             │
│                                 │
├─────────────────────────────────┤
│  💡 Gợi ý  │  📖 Script  │ ⏭️   │
└─────────────────────────────────┘
```

**Specs:**
- Turn counter: x/10 turns
- AI dialogue: With audio playback
- Timer: Response countdown
- Hints: Tap to reveal suggestion
- Script: Show expected dialogue
- Skip: Move to next turn

---

## 4. Features Detail

### 4.1 Recording UX

| Feature | Description |
|---------|-------------|
| Hold-to-record | Press and hold mic button |
| Visual feedback | Waveform animation while recording |
| Haptic start | Medium impact when recording starts |
| Haptic end | Light impact when released |
| Countdown | Optional 3-2-1 before recording |
| Max duration | 15 seconds default |

### 4.2 AI Feedback

| Feedback Type | Description |
|---------------|-------------|
| Overall Score | 0-100 score with grade |
| Word-by-word | Score for each word |
| Phoneme breakdown | IPA transcription |
| Tips | AI suggestions for improvement |
| Comparison | User vs AI waveform |

### 4.3 Progress Tracking

| Metric | Description |
|--------|-------------|
| Session score | Average of all attempts |
| Streak | Consecutive correct sentences |
| History | All attempts saved |
| Improvement | Score trend over time |

---

## 5. Technical Implementation

### 5.1 Libraries

```typescript
react-native-audio-recorder-player // Robust audio recording
react-native-haptic-feedback // Haptic feedback
react-native-reanimated    // Waveform animation
@tanstack/react-query      // AI feedback caching
```

### 5.2 State Structure

```typescript
interface SpeakingState {
  // Session
  session: {
    topic: string;
    sentences: Sentence[];
    currentIndex: number;
    mode: 'practice' | 'coach' | 'roleplay';
  };
  
  // Recording
  recording: {
    isRecording: boolean;
    duration: number;
    audioUri?: string;
  };
  
  // Feedback
  feedback: {
    loading: boolean;
    score?: number;
    wordScores?: WordScore[];
    tips?: string[];
  };
}

interface WordScore {
  word: string;
  score: number;
  phonemes?: string;
  issues?: string[];
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
```

### 5.3 Recording Flow

```typescript
// Pseudo-code for recording
async function handleRecordStart() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  await Audio.setAudioModeAsync({ allowsRecordingIOS: true });
  await recording.startAsync();
}

async function handleRecordStop() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const uri = await recording.stopAndUnloadAsync();
  
  // Upload and get AI feedback
  const feedback = await speakingAPI.analyze(uri, targetSentence);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
```

---

## 6. Gestures & Interactions

| Context | Gesture | Action |
|---------|---------|--------|
| Mic button | Long press | Start recording |
| Mic button | Release | Stop recording |
| Feedback | Swipe right | Next sentence |
| Feedback | Swipe left | Retry |
| Word | Tap | Show phoneme detail |

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
- [ ] Topic selection screen
- [ ] Practice sentence display
- [ ] Hold-to-record button
- [ ] Audio recording with react-native-audio-recorder-player
- [ ] Send to backend for AI analysis
- [ ] Display feedback with scores

### Enhanced Phase
- [ ] **Conversation Coach setup screen** (NEW ✨)
- [ ] **Conversation Coach session UI** (NEW ✨)
- [ ] **Voice/Text input toggle** (NEW ✨)
- [ ] **Real-time transcription (STT)** (NEW ✨)
- [ ] **AI response generation** (NEW ✨)
- [ ] **Pronunciation Alert inline** (NEW ✨)
- [ ] **Voice Visualizer** (NEW ✨)
- [ ] **Session Transcript** (NEW ✨)
- [ ] **Session Timer with auto-end** (NEW ✨)
- [ ] **Save coach session to History** (NEW ✨)
- [ ] Waveform visualization
- [ ] Phoneme breakdown view
- [ ] Waveform comparison
- [ ] Progress tracking
- [ ] Haptic feedback

### Advanced Phase
- [ ] Roleplay scenarios
- [ ] Multi-turn conversations
- [ ] Difficulty levels
- [ ] Overall session feedback

---

## 9. Related Documents

- [00_Mobile_Overview.md](../00_Mobile_Overview.md) - Project overview
- [10_Native_Features.md](10_Native_Features.md) - Haptic feedback
- [Architecture.md](../technical/Architecture.md) - Audio handling
- [UI_Design_System.md](../design/UI_Design_System.md) - Button specs
