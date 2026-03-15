# 💬 Speaking — AI Conversation (Free Talk & Roleplay)

> **Module:** Speaking
> **Features:** AI Conversation — Free Talk + Roleplay
> **Priority:** P0 (Core)
> **Tham chiếu chính:** [03_Speaking.md](../03_Speaking.md), [01_Navigation_PracticeMode.md](01_Navigation_PracticeMode.md)

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Shared Components](#2-shared-components)
3. [Free Talk — Chi tiết](#3-free-talk--chi-tiết)
4. [Roleplay — Chi tiết](#4-roleplay--chi-tiết)
5. [Session Summary (Shared)](#5-session-summary-shared)
6. [State Structure](#6-state-structure)
7. [API Endpoints](#7-api-endpoints)
8. [Test Cases](#8-test-cases)
9. [Edge Cases](#9-edge-cases)

---

## 1. Tổng quan

AI Conversation là mode hội thoại realtime với AI, chia thành 2 sub-mode:

| | 💬 Free Talk | 🎭 Roleplay |
|---|-------------|------------|
| **Mục đích** | Luyện giao tiếp tự do theo topic | Đóng vai tình huống cụ thể |
| **Kết thúc** | Timer hết (3-20 phút) | Đủ turns (5-10) hoặc AI.shouldEnd |
| **Accent color** | 🟢 Green | 🟠 Orange |
| **Top badge** | ⏱ Timer countdown | Turn X/Y |
| **Context banner** | ❌ | ✅ Scenario + mô tả + difficulty |
| **AI avatar** | 🤖 Generic AI | 👨‍🍳 Persona (name + role) |
| **Gợi ý câu** | ✅ beginner | ❌ |
| **Difficulty** | ❌ | Easy / Medium / Hard |

---

## 2. Shared Components

> Free Talk và Roleplay chia sẻ **phần lớn** components. Chỉ khác **config props**, không cần duplicate code.

### 2.1 Component Map

| Component | Mô tả | Props khác nhau |
|-----------|-------|-----------------|
| `<ConversationSetupScreen>` | Màn config (topic + settings) | `mode: 'free-talk' \| 'roleplay'` → ẩn/hiện: duration vs turns, difficulty | ✅ |
| `<ChatBubble>` | Bubble tin nhắn (AI hoặc User) | `persona?: { name, role, avatar }` — nếu có → hiện persona thay 🤖 | ✅ |
| `<RecordingOverlay>` | Overlay khi đang ghi âm | Không khác — chỉ top bar context khác | ✅ (component, chưa integrate) |
| `<PronunciationAlertCard>` | Card vàng cảnh báo phát âm | Không khác | ✅ |
| `<GrammarCorrectionCard>` | Card sửa ngữ pháp inline | Không khác | ✅ |
| `<InputBar>` | Text input + mic button | Không khác | ✅ |
| `<WaveformVisualizer>` | Sóng âm real-time | Không khác | ⬜ |
| `<AIThinkingIndicator>` | "..." typing dots | `personaName?: string` → "Tony đang trả lời..." vs "AI đang suy nghĩ..." | ✅ |
| `<SuggestedResponses>` | 3 chips gợi ý | Chỉ render khi `mode === 'free-talk' && feedbackLevel === 'beginner'` | ✅ |
| `<ContextBanner>` | Banner scenario + difficulty | Chỉ render khi `mode === 'roleplay'` | ✅ |
| `<SessionSummaryScreen>` | Màn tổng kết | `scenarioBadge` chỉ hiện cho Roleplay | ✅ |

### 2.2 Architecture: 1 Screen, 2 Modes

```
ConversationScreen (shared)
├── props.mode = 'free-talk' | 'roleplay'
├── props.setup = { topic, duration?, turns?, difficulty?, persona? }
│
├── <TopBar>
│   ├── title = mode === 'free-talk' ? "Free Talk" : "Roleplay"
│   └── badge = mode === 'free-talk' ? <TimerBadge /> : <TurnBadge />
│
├── {mode === 'roleplay' && <ContextBanner />}
│
├── <ChatList>
│   └── messages.map(msg => <ChatBubble persona={setup.persona} />)
│
├── <InlineCards> (giữa messages)
│   ├── <PronunciationAlertCard />   ← shared
│   └── <GrammarCorrectionCard />    ← shared
│
├── {mode === 'free-talk' && feedbackLevel === 'beginner' && <SuggestedResponses />}
│
├── <InputBar>
│   └── onMicTap → <RecordingOverlay />  ← shared (tap-to-toggle)
│
└── onSessionEnd → <SessionSummaryScreen scenarioBadge={mode === 'roleplay'} />
```

### 2.3 Lợi ích

| Benefit | Chi tiết |
|---------|----------|
| **DRY** | 11 components, chỉ 3 có props khác nhau |
| **Maintain** | Fix bug 1 chỗ → fix cho cả 2 mode |
| **Test** | Test shared components 1 lần |
| **Bundle** | Không duplicate code → app nhẹ hơn |

---

## 3. Free Talk — Chi tiết

### 3.1 Setup Screen

| Config | UI | Default |
|--------|-----|---------|
| Sub-mode toggle | `[💬 Free Talk]` active green | Free Talk |
| Topic | REUSE Listening Topic Picker | — |
| Duration | Pills: 3' / 5' / 10' / 15' / 20' | 5' |
| Feedback mode | 3 cards: Beginner / Intermediate / Advanced | Intermediate |
| Gợi ý câu | Toggle (chỉ hiện khi beginner) | ON |
| Grammar fix | Toggle | ON |
| Pronun alert | Toggle | ON |
| CTA | "🎤 Bắt đầu hội thoại" (green) | — |

### 3.2 Session States

| State | Components | Mô tả |
|-------|-----------|-------|
| **Idle** | ChatList + InputBar + SuggestedResponses | User đọc AI message, chọn cách reply |
| **Recording** | RecordingOverlay bottom-sheet (waveform + mic pulsing) | User nhấn mic → overlay hiện, nhấn ■ hoặc vuốt xuống để gửi |
| **Transcribing** | InputBar disabled + "Đang nhận dạng..." | Groq Whisper STT đang xử lý |
| **AI Thinking** | AIThinkingIndicator ("...") | AI đang generate response |
| **Pronun Alert** | PronunciationAlertCard inline | Phát hiện từ phát âm sai |
| **Grammar Fix** | GrammarCorrectionCard inline | Phát hiện lỗi ngữ pháp |
| **Timer End** | Alert "Hết thời gian!" → Summary | Auto-end khi countdown = 0 |

---

## 4. Roleplay — Chi tiết

### 4.1 Setup Screen

| Config | UI | Khác Free Talk |
|--------|-----|---------------|
| Sub-mode toggle | `[🎭 Roleplay]` active orange | Orange accent |
| Scenario | REUSE Listening Topic Picker | Cùng component |
| Difficulty | Pills: Easy / Medium / Hard | **Mới** — không có ở Free Talk |
| Duration | ❌ Không có | Thay bằng turns |
| CTA | "🎭 Bắt đầu Roleplay" (orange) | Orange gradient |

### 4.2 AI Persona System

> Mỗi scenario trong DB có `persona` metadata:

```typescript
interface ScenarioPersona {
  name: string;        // "Tony"
  role: string;        // "Waiter"
  avatar: string;      // emoji hoặc URL: "👨‍🍳"
  greeting: string;    // "Welcome to Bella Italia!"
  systemPrompt: string; // AI behavior instructions
}
```

| Scenario | Persona | Avatar |
|----------|---------|--------|
| 🍽️ Restaurant | Tony — Waiter | 👨‍🍳 |
| ✈️ Airport | Sarah — Agent | 👩‍✈️ |
| 💼 Interview | Mr. Lee — HR Manager | 👨‍💼 |
| 🏥 Hospital | Dr. Kim — Doctor | 👩‍⚕️ |
| 🏨 Hotel | Maria — Receptionist | 👩‍💻 |

### 4.3 Session States

Giống Free Talk (Section 3.2) + thêm:

| State | Khác |
|-------|------|
| **ContextBanner** | Luôn hiện sticky ở top |
| **Turn tracking** | `Turn X/Y` badge (cam) thay timer |
| **AI Persona** | Chat bubble hiện 👨‍🍳 "Tony" thay 🤖 |
| **Turn End** | Khi `currentTurn >= maxTurns` → "Kết thúc roleplay!" → Summary |
| **AI shouldEnd** | AI reply `{shouldEnd: true}` → tự động kết thúc sớm |

---

## 5. Session Summary (Shared)

| Section | Component | Free Talk | Roleplay |
|---------|-----------|-----------|----------|
| Stats row | `StatsCard` × 3 | ✅ Thời gian + Lượt + Điểm | ✅ |
| Phát âm | `PronunciationList` | ✅ Từ + % + IPA + 🔊 | ✅ |
| Ngữ pháp | `GrammarFixList` | ✅ ~~Sai~~ → Đúng | ✅ |
| AI Feedback | `FeedbackCard` | ✅ Nhận xét AI | ✅ |
| Scenario badge | `ScenarioBadge` | ❌ | ✅ "Hoàn thành: Restaurant" |
| Actions | 3 buttons | ✅ | ✅ |

---

## 6. State Structure

```typescript
interface AIConversationState {
  // Setup
  setup: {
    mode: 'free-talk' | 'roleplay';
    topic: TopicScenario | CustomScenario | null;
    scenario?: {
      persona: ScenarioPersona;
      difficulty: 'easy' | 'medium' | 'hard';
    };
    duration?: number;           // Free Talk only (phút)
    maxTurns?: number;           // Roleplay only (5-10)
    feedbackMode: 'beginner' | 'intermediate' | 'advanced';
    options: {
      showSuggestions: boolean;  // Chỉ Free Talk + beginner
      inlineGrammarFix: boolean;
      pronunciationAlert: boolean;
    };
  };

  // Session (shared)
  session: {
    isActive: boolean;
    messages: ConversationMessage[];
    remainingTime?: number;       // Free Talk (seconds)
    currentTurn?: number;         // Roleplay
    inputMode: 'voice' | 'text';
  };

  // Recording (shared)
  recording: {
    isRecording: boolean;
    duration: number;
    audioUri: string | null;
    waveformData: number[];
  };

  // AI state (shared)
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
  pronunciationFeedback?: { word: string; ipa: string; tip: string };
  grammarCorrections?: { wrong: string; correct: string; explanation: string }[];
}
```

---

## 7. API Endpoints

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/speaking/transcribe` | POST | Audio → text (Groq Whisper STT) |
| `/conversation-generator/continue-conversation` | POST | AI tiếp tục hội thoại |
| `/ai/generate-conversation-audio` | POST | TTS cho AI response |
| `/speaking/evaluate-pronunciation` | POST | Chấm phát âm inline |
| `/speaking/check-grammar` | POST | Kiểm tra ngữ pháp inline |
| `/api/history` | POST | Lưu session vào history |

**Shared với Navigation:** `/custom-scenarios` (CRUD — chung Listening)

---

## 8. Test Cases

### 8.1 Setup

| TC-ID | Tên | Expected |
|-------|-----|----------|
| CONV-TC01 | Toggle Free Talk → Roleplay | UI đổi: ẩn duration, hiện difficulty | ✅ |
| CONV-TC02 | Chọn topic từ Listening picker | Scenario selected ✓ | ✅ |
| CONV-TC03 | Bắt đầu Free Talk | Timer bắt đầu countdown | ✅ |
| CONV-TC04 | Bắt đầu Roleplay | Context banner + persona hiện | ✅ |
| CONV-TC05 | Bắt đầu không chọn topic | Button disabled / toast warning | ✅ |

### 8.2 Session (Shared)

| TC-ID | Tên | Expected |
|-------|-----|----------|
| CONV-TC10 | Ghi âm (tap mic) | Bottom-sheet overlay + Waveform + timer + pulsing glow | ⬜ (component sẵn, chưa integrate) |
| CONV-TC11 | Ghi âm → release | STT → user bubble hiện text | ⬜ |
| CONV-TC12 | Swipe down stop / Swipe up cancel | Vuốt xuống → gửi, Vuốt lên/trái → hủy | ⬜ |
| CONV-TC13 | Gõ text thay voice | Text bubble hiện, no STT | ✅ |
| CONV-TC14 | AI response | AI bubble + audio auto-play | ✅ (bubble ✅, audio ⬜) |
| CONV-TC15 | Pronun alert trigger | Amber card hiện inline | ✅ |
| CONV-TC16 | Grammar fix trigger | Amber card ~~sai~~ → đúng | ✅ |
| CONV-TC17 | Tap [Đã hiểu] | Dismiss grammar card | ✅ |
| CONV-TC18 | Tap [🔊 Nghe] pronun | Audio IPA phát | ✅ (button ✅, audio ⬜) |
| CONV-TC19 | Tap [Re-speak] | Focus mic, gợi ý nói lại từ đó | ✅ (button ✅, focus ⬜) |

### 8.3 Free Talk Only

| TC-ID | Tên | Expected |
|-------|-----|----------|
| CONV-TC20 | Timer countdown | Badge đếm ngược đúng | ✅ |
| CONV-TC21 | Timer hết | Alert → auto navigate Summary | ✅ |
| CONV-TC22 | Suggested responses (beginner) | 3 chips hiện sau AI msg | ✅ |
| CONV-TC23 | Tap suggested response | Text gửi đi như user typed | ✅ |
| CONV-TC24 | No suggestions (intermediate) | Không hiện chips | ✅ |

### 8.4 Roleplay Only

| TC-ID | Tên | Expected |
|-------|-----|----------|
| CONV-TC30 | Context banner | Scenario + mô tả + difficulty hiện | ✅ |
| CONV-TC31 | AI persona | Avatar + name hiện trong bubble | ✅ |
| CONV-TC32 | Turn counter | "Turn X/Y" cập nhật mỗi lượt | ✅ |
| CONV-TC33 | Max turns reached | Alert → navigate Summary | ✅ |
| CONV-TC34 | AI shouldEnd | AI tự kết thúc sớm → Summary | ✅ |
| CONV-TC35 | Difficulty affects AI | Easy = simple vocab, Hard = complex | ✅ (API config) |

### 8.5 Session Summary

| TC-ID | Tên | Expected |
|-------|-----|----------|
| CONV-TC40 | Stats hiển thị | Thời gian + Lượt + Điểm đúng | ✅ |
| CONV-TC41 | Phát âm cần cải thiện | Từ + % + IPA + 🔊 play | ✅ |
| CONV-TC42 | Sửa ngữ pháp | ~~Sai~~ → Đúng hiện đúng | ✅ |
| CONV-TC43 | AI Feedback | Nhận xét hiển thị | ✅ |
| CONV-TC44 | Scenario badge (Roleplay) | "Hoàn thành: [scenario]" ✅ | ✅ |
| CONV-TC45 | No badge (Free Talk) | Badge KHÔNG hiện | ✅ |
| CONV-TC46 | Luyện lại | Reset → Setup screen cùng config | ✅ |
| CONV-TC47 | Chia sẻ | Capture card → share sheet | ✅ (button, capture ⬜) |
| CONV-TC48 | Về Home | Navigate Speaking Home | ✅ |

---

## 9. Edge Cases

### 9.1 Recording & STT

| Case | Xử lý | Rủi ro |
|------|-------|--------|
| Mic permission denied | Alert → [Mở Settings] | ⚠️ |
| Recording <1s | Toast "Nói lâu hơn nhé!" | ✅ |
| STT fail / gibberish | Toast "Không nhận dạng được" + [Thử lại] | ⚠️ |
| Background noise | STT quality giảm → tip "Tìm nơi yên tĩnh hơn" | ✅ |
| App minimize khi recording | Auto-stop + save locally | ⚠️ |
| Incoming call | Audio interrupt → auto-stop → resume khi quay lại | 🔴 |

### 9.2 Network & AI

| Case | Xử lý | Rủi ro |
|------|-------|--------|
| Mất mạng giữa session | Toast "Mất kết nối" + auto-save transcript locally | 🔴 |
| AI response timeout (>10s) | Cancel + Toast + [Thử lại] | ⚠️ |
| Groq quota exceeded | Fallback model hoặc "Hệ thống bận" | 🔴 |
| AI generate inappropriate content | Content filter + fallback response | ⚠️ |
| Concurrent pronun + grammar | Hiện cả 2 cards stacked (pronun trước) | ✅ |

### 9.3 Roleplay-Specific

| Case | Xử lý | Rủi ro |
|------|-------|--------|
| User nói off-topic | AI gently redirect: "Let's get back to..." | ✅ |
| User nói tiếng Việt | AI respond: "Please try in English!" | ✅ |
| Persona data missing | Fallback: 🤖 generic avatar + default greeting | ⚠️ |
| AI shouldEnd too early | Minimum 3 turns trước khi cho phép shouldEnd | ⚠️ |

### 9.4 Potential Issues

| Issue | Mitigation |
|-------|------------|
| **Timer vs Turn race** | Free Talk: server đếm time, client sync. Roleplay: `currentTurn` increment only after AI response |
| **Topic sync delay** | `useFocusEffect` → refetch custom scenarios khi vào Setup |
| **Audio overlap** | AI TTS playing + user tap mic → pause AI audio trước khi record |
| **Grammar card overflow** | Nếu >3 corrections → collapse, "Xem thêm" link |
| **Chat scroll** | Auto-scroll to bottom khi new message. User scroll up → disable auto-scroll |
| **Persona consistency** | AI system prompt include persona throughout conversation |
| **Memory: long conversation** | Giới hạn 50 messages in view, older messages paged |

---

## Design Reference — Hi-Fi Mockups

> Hình có sẵn ở dark mode (xem [ai_conversation_walkthrough.md]). Light mode sẽ bổ sung sau.

| Màn hình | Dark Mode |
|----------|-----------|
| Free Talk Session | `screens_v2/09_freetalk_session_dark.png` |
| Free Talk Recording | `screens_v2/10_freetalk_recording_dark.png` |
| Free Talk AI Thinking + Pronun | `screens_v2/11_freetalk_thinking_dark.png` |
| Free Talk Grammar Fix | `screens_v2/12_freetalk_grammar_dark.png` |
| Roleplay Setup | `screens_v2/13_roleplay_setup_dark.png` |
| Roleplay Session | `screens_v2/14_roleplay_session_dark.png` |
| Roleplay Recording | `screens_v2/15_roleplay_recording_dark.png` |
| Roleplay AI Thinking + Pronun | `screens_v2/16_roleplay_thinking_dark.png` |
| Roleplay Grammar Fix | `screens_v2/17_roleplay_grammar_dark.png` |
| Session Summary | `screens_v2/18_session_summary_dark.png` |
