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
| **Topic Practice** | Tập theo chủ đề | Học từ vựng theo ngữ cảnh |
| **Roleplay Mode** | Đóng vai tình huống | Advanced practice |

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

### 2.2 Roleplay Flow

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

### 3.6 Roleplay - Scenario Selection

```
┌─────────────────────────────────┐
│  ← Conversation Roleplay    ⋮  │
├─────────────────────────────────┤
│                                 │
│  Chọn tình huống                │
│                                 │
│  ┌─────────────────────────┐   │
│  │  🍽️ Restaurant          │   │
│  │  Order food & drinks    │   │
│  │  ○ Easy ● Medium ○ Hard │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │  ✈️ Airport             │   │
│  │  Check-in & boarding    │   │
│  │  ○ Easy ● Medium ○ Hard │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │  🏨 Hotel               │   │
│  │  Booking & check-in     │   │
│  │  ○ Easy ● Medium ○ Hard │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │  💼 Job Interview       │   │
│  │  Interview preparation  │   │
│  │  ○ Easy ● Medium ○ Hard │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

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
expo-av                    // Audio recording
expo-haptics               // Haptic feedback
react-native-reanimated   // Waveform animation
@tanstack/react-query     // AI feedback caching
```

### 5.2 State Structure

```typescript
interface SpeakingState {
  // Session
  session: {
    topic: string;
    sentences: Sentence[];
    currentIndex: number;
    mode: 'practice' | 'roleplay';
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
- [ ] Audio recording with Expo AV
- [ ] Send to backend for AI analysis
- [ ] Display feedback with scores

### Enhanced Phase
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
