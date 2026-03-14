# 📖 Audio Article Feature - Mobile

> **Module:** Audio Article (formerly Reading)  
> **Priority:** P1 (Core Passive)  

---

## 1. Overview

Module nghe hiểu nội dung bài viết do AI sinh, tối ưu cho học thụ động 100% hands-free. User nghe bài viết → trả lời câu hỏi comprehension bằng giọng nói → luyện từ vựng mới — tất cả không cần nhìn màn hình.

> **Triết lý:** Biến Reading thành trải nghiệm NGHE. Nội dung bài viết (article, essay, news) được TTS đọc cho user, xen kẽ comprehension quiz và vocabulary drill qua giọng nói.

### 1.1 Tại sao không phải Reading truyền thống?

| | Reading truyền thống | Audio Article |
|---|---|---|
| **Mắt** | ❌ Cần nhìn liên tục | ✅ Không cần nhìn |
| **Tay** | ❌ Tap, swipe, pinch | ✅ Không cần chạm |
| **Use case** | Chỉ khi ngồi yên (~20%) | Mọi lúc mọi nơi (100%) |
| **Target 80% user** | ❌ Không phù hợp | ✅ Perfect |

### 1.2 Khác biệt với Listening

| | Listening | Audio Article |
|---|---|---|
| **Nội dung** | Hội thoại 2+ người | Bài viết 1 narrator đọc |
| **Mục tiêu** | Nghe hiểu conversation | Comprehension + vocabulary |
| **Tương tác** | Thụ động (nghe suông) | Active recall (bị hỏi sau đoạn) |
| **Vocabulary** | Từ giao tiếp | Từ học thuật, chuyên ngành |

### 1.3 Key Features

| Feature | Description |
|---------|-------------|
| **AI Article Generation** | Sinh bài viết theo topic + level |
| **TTS Narration** | Azure TTS đọc bài, paragraph-by-paragraph |
| **Comprehension Q&A** | AI hỏi câu hỏi sau mỗi đoạn, user trả lời bằng giọng |
| **Auto Vocabulary Explain** | Gặp từ khó → TTS pause → giải thích nghĩa |
| **Vocabulary Drill** | Nhại lại từ mới + AI chấm phát âm |
| **Playlist Mode** | Nhiều article liên tiếp, nghe như podcast |
| **Background Audio** | Tiếp tục phát khi minimize app |

### 1.4 Quiz Modes

| Mode | Mô tả | Khi nào dùng |
|------|-------|-------------|
| **🎯 After Each Paragraph** | Hỏi sau mỗi đoạn, comprehension sâu | Muốn học kỹ |
| **📝 After Full Article** | Hỏi sau cả bài, thụ động hơn | Đi xe, gym |
| **❌ No Quiz** | Nghe suông, không bị hỏi | Chill, trước ngủ |

---

## 2. User Flows

### 2.1 Setup Flow (Trước khi bỏ điện thoại vào túi)

```
[Home] → [📖 Audio Article Tab] → [Config Screen]
    │
    ├─ Chọn topic → REUSE Listening Topic Picker
    ├─ Chọn level → Beginner / Intermediate / Advanced
    ├─ Chọn length → Short (3 phút) / Medium (7 phút) / Long (12 phút)
    ├─ Quiz mode → After paragraph / After article / No quiz
    ├─ Auto-explain vocabulary → ON/OFF
    └─ [▶️ Bắt đầu nghe]
         │
         └─ Bỏ điện thoại vào túi → Hands-free đến khi hết bài
```

### 2.2 Core Session Flow (100% Hands-free)

```
[Audio Article Session]
    │
    ├─ 🎧 PHASE 1: LISTEN
    │    ├─ TTS đọc paragraph (Azure TTS, giọng tự nhiên)
    │    ├─ Gặp từ khó → TTS auto pause
    │    │    └─ "serendipity — nghĩa là sự tình cờ may mắn"
    │    └─ Đọc xong paragraph → chime sound
    │
    ├─ 🧠 PHASE 2: COMPREHENSION CHECK (nếu quiz mode ON)
    │    ├─ AI hỏi câu hỏi bằng giọng nói:
    │    │    "What was the main topic of this paragraph?"
    │    │    hoặc "Can you use 'serendipity' in a sentence?"
    │    │
    │    ├─ ⏳ Chờ user trả lời (timeout 10s)
    │    │    ├─ User nói → STT → AI đánh giá
    │    │    └─ Im lặng 10s → auto skip → đọc đáp án
    │    │
    │    └─ AI feedback bằng giọng nói:
    │         ├─ ✅ "Great! That's correct..."
    │         └─ ❌ "Not quite. The answer is..."
    │
    ├─ 📚 PHASE 3: VOCABULARY DRILL (nếu auto-explain ON)
    │    ├─ "Repeat after me: serendipity"
    │    ├─ User nhại lại → STT + evaluate pronunciation
    │    ├─ ✅ "Good pronunciation!"
    │    └─ ❌ "Try again: se-ren-DI-pi-ty"
    │
    ├─ [Auto advance to next paragraph]
    │    └─ ─── repeat cho mỗi paragraph ───
    │
    └─ 📊 PHASE 4: SESSION SUMMARY (khi hết article)
         ├─ TTS đọc tóm tắt kết quả
         ├─ "You answered 4 out of 5 questions correctly"
         ├─ "New words learned: serendipity, wanderlust, ephemeral"
         ├─ Notification push: "Xem chi tiết kết quả"
         └─ Auto-save to History
```

### 2.3 Playlist Mode (Continuous)

```
[Config] → Bật "Playlist Mode"
    │
    ├─ Article 1 → Quiz → Vocab → ✅ → chime
    ├─ Article 2 → Quiz → Vocab → ✅ → chime
    ├─ Article 3 → Quiz → Vocab → ✅ → chime
    └─ ... (cho đến khi user dừng hoặc hết thời gian)

Giống nghe podcast, nhưng XEN KẼ bài tập
→ User đi bộ 30 phút ≈ 3 articles ≈ 15+ từ mới
```

### 2.4 Voice Controls (Khi hands-free)

| Command | Action |
|---------|--------|
| "Next" / "Tiếp" | Skip đến paragraph/article tiếp |
| "Repeat" / "Lặp lại" | Đọc lại paragraph hiện tại |
| "Pause" / "Dừng" | Tạm dừng |
| "Resume" / "Tiếp tục" | Tiếp tục |
| "Skip quiz" | Bỏ qua câu hỏi |

---

## 3. Edge Cases & Error Flows

### 3.1 Voice Input Errors

```
[Comprehension Q&A]
    ├─ ⚠️ User im lặng > 10s
    │    └─ Auto skip → TTS đọc đáp án → next paragraph
    │
    ├─ ⚠️ Không nghe rõ (noise/wind)
    │    └─ "Không nghe rõ, hãy nói lại" → retry 1 lần → skip
    │
    └─ ⚠️ User nói sai ngôn ngữ
         └─ "Please answer in English" → retry
```

### 3.2 Network Errors

```
[Session đang phát]
    ├─ ❌ Mất mạng giữa chừng
    │    ├─ Paragraphs đã TTS → tiếp tục phát (cached)
    │    ├─ Paragraphs chưa TTS → pause + toast "Mất kết nối"
    │    └─ Resume khi có lại mạng
    │
    └─ ❌ AI generate article fail
         └─ Retry 3 lần → "Không thể tạo bài, thử topic khác"
```

### 3.3 Background & Interruption

```
[Session đang phát]
    ├─ ⚠️ App minimize → TIẾP TỤC PHÁT (background audio)
    │    └─ Quiz vẫn hoạt động qua mic + notification
    │
    ├─ ⚠️ Cuộc gọi đến → PAUSE → Resume sau cuộc gọi
    │
    ├─ ⚠️ Rút tai nghe → PAUSE (safety)
    │
    └─ ⚠️ Navigation app (Google Maps) → Duck volume 30%
```

### 3.4 Save to History

```
[Session kết thúc]
    │
    ├─ Auto-save → POST /api/history
    │    ├─ type: 'audio-article'
    │    ├─ topic, scores, duration, wordsLearned
    │    └─ quizResults
    │
    ├─ ✅ Success → notification "Xem chi tiết"
    │
    └─ ❌ Fail → retry silently + cache locally
```

---

## 4. Features Detail

### 4.1 Article Content Types

| Type | Description | Example |
|------|-------------|---------|
| **News** | Tin tức thời sự | "AI Revolution in Healthcare" |
| **Essay** | Bài luận chủ đề | "The Impact of Social Media" |
| **Story** | Truyện ngắn | "A Day in Tokyo" |
| **Science** | Bài khoa học phổ thông | "How Black Holes Work" |
| **Culture** | Văn hóa các nước | "Vietnamese Coffee Culture" |

### 4.2 Comprehension Question Types

| Type | Mô tả | Ví dụ |
|------|-------|-------|
| **Factual** | Hỏi thông tin trực tiếp từ bài | "How many tourists visit Japan?" |
| **Inference** | Suy luận từ nội dung | "Why did the author mention X?" |
| **Vocabulary** | Dùng từ mới trong câu | "Use 'serendipity' in a sentence" |
| **Summary** | Tóm tắt đoạn vừa nghe | "Summarize the main idea" |
| **Opinion** | Ý kiến cá nhân (open-ended) | "Do you agree with the author?" |

### 4.3 Vocabulary Drill

| Feature | Description |
|---------|-------------|
| Auto-detect difficult words | AI xác định từ khó dựa trên level user |
| In-context explanation | Giải thích nghĩa trong ngữ cảnh bài viết |
| Pronunciation practice | Nhại lại từ + AI chấm (reuse Speaking evaluate) |
| Spaced repetition hint | Từ đã gặp trước → nhắc lại ở article sau |

### 4.4 Session UI (Khi user mở màn hình)

Dù 100% hands-free, vẫn có UI để user xem khi muốn:

| Element | Description |
|---------|-------------|
| Article title + topic | Header |
| Current paragraph text | Hiển thị text đang đọc (optional) |
| Progress bar | Paragraph X/Y |
| Quiz result inline | ✅/❌ cho từng câu hỏi |
| Words learned | List từ mới trong session |
| Play/Pause button | Backup control |

---

## 5. Technical Implementation

### 5.1 Libraries (Reuse từ Listening + Speaking)

```typescript
react-native-track-player       // REUSE - Background audio playback
react-native-tts                // TTS cho Q&A voice feedback
@react-native-voice/voice       // STT cho user answers
zustand                         // State management (useAudioArticleStore)
notifee                         // REUSE - Notification controls
```

### 5.2 File Structure

| File | Purpose | Reuse |
|------|---------|-------|
| `screens/reading/ConfigScreen.tsx` | Config UI (topic, level, length, quiz mode) | Modify existing |
| `screens/reading/AudioArticleScreen.tsx` | Main session screen (ít UI, chủ yếu audio) | **NEW** |
| `screens/reading/SessionSummaryScreen.tsx` | Kết quả chi tiết khi mở app | **NEW** |
| `hooks/useAudioArticleSession.ts` | State machine: listen → quiz → vocab → next | **NEW** |
| `hooks/useVoiceQuiz.ts` | Q&A voice interaction (hỏi → chờ → đánh giá) | **NEW** |
| `store/useAudioArticleStore.ts` | Zustand store | Rename from useReadingStore |
| `services/api/reading.ts` | API service | Modify existing |
| `navigation/stacks/ReadingStack.tsx` | Navigator | Modify existing |

### 5.3 State Structure

```typescript
interface AudioArticleState {
  // Cấu hình bài học
  config: {
    topic: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    articleLength: 'short' | 'medium' | 'long'; // 3, 7, 12 phút
    quizMode: 'after-paragraph' | 'after-article' | 'none';
    autoExplainVocab: boolean;
    playlistMode: boolean;
  };

  // Bài viết hiện tại
  article: {
    title: string;
    paragraphs: ArticleParagraph[];
    vocabulary: VocabularyItem[]; // Từ khó AI xác định
    totalDuration: number; // Ước tính thời gian (giây)
  } | null;

  // Session đang chạy
  session: {
    isActive: boolean;
    currentParagraphIndex: number;
    phase: 'listening' | 'quiz' | 'vocab-drill' | 'summary';
    quizResults: QuizResult[];
    wordsLearned: string[];
    startTime: Date | null;
  };

  // Trạng thái UI
  isGenerating: boolean;
  error: string | null;
}

interface ArticleParagraph {
  text: string;
  audioBase64?: string; // TTS pre-generated
  vocabulary: string[]; // Từ khó trong đoạn này
}

interface VocabularyItem {
  word: string;
  meaning: string; // Tiếng Việt
  ipa: string;
  context: string; // Câu chứa từ trong bài
}

interface QuizResult {
  paragraphIndex: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}
```

### 5.4 Session State Machine

```typescript
// Luồng chuyển đổi trạng thái trong session
type SessionPhase = 'listening' | 'quiz' | 'vocab-drill' | 'summary';

// useAudioArticleSession hook
// Mục đích: Điều phối luồng session Audio Article
// Tham số đầu vào: config (AudioArticleConfig)
// Tham số đầu ra: session state + control actions
// Khi nào sử dụng: AudioArticleScreen mount → khởi tạo session

/*
  State Machine Flow:
  
  START → listening (paragraph 1)
    → [paragraph done] → quiz (nếu quizMode != 'none')
      → [quiz done] → vocab-drill (nếu autoExplainVocab)
        → [drill done] → listening (paragraph 2)
          → ... repeat ...
            → [last paragraph done] → summary
              → END (auto-save to history)
              
  Trường hợp quizMode = 'after-article':
  START → listening (all paragraphs) → quiz (1 quiz cuối) → summary
  
  Trường hợp quizMode = 'none':
  START → listening (all paragraphs) → summary
*/
```

### 5.5 API Endpoints

| Method | Endpoint | Function | Reuse? |
|--------|----------|----------|--------|
| POST | `/reading/generate-article` | `generateArticle()` | ✅ Giữ nguyên |
| POST | `/reading/generate-quiz` | `generateQuiz()` | **NEW** |
| POST | `/ai/text-to-speech` | TTS cho narration | ✅ Reuse Listening |
| POST | `/ai/transcribe` | STT cho user answers | ✅ Reuse Speaking |
| POST | `/ai/evaluate-pronunciation` | Chấm phát âm vocab drill | ✅ Reuse Speaking |
| GET | `/dictionary/lookup` | Tra nghĩa từ khó | ✅ Reuse existing |
| POST | `/history` | Lưu session | ✅ Reuse History |

---

## 6. Implementation Tasks

### Config & Generation
- [ ] Update ConfigScreen (thêm quiz mode, article length, playlist toggle)
- [ ] Generate article via existing API

### Audio Article Session
- [ ] AudioArticleScreen (main session — minimal UI, audio-first)
- [ ] useAudioArticleSession hook (state machine: listen → quiz → vocab → next)
- [ ] Paragraph-by-paragraph TTS playback (pre-generate hoặc stream)
- [ ] Auto vocabulary detection + TTS explanation

### Comprehension Q&A
- [ ] generateQuiz API endpoint (paragraph → AI sinh câu hỏi)
- [ ] useVoiceQuiz hook (TTS hỏi → STT chờ → AI đánh giá)
- [ ] Timeout handling (10s silence → auto skip)
- [ ] Voice feedback (correct/incorrect TTS response)

### Vocabulary Drill
- [ ] In-session pronunciation practice (reuse Speaking evaluate-pronunciation)
- [ ] Auto-detect difficult words based on level

### Playlist Mode
- [ ] Continuous article generation + playback
- [ ] Transition chime between articles
- [ ] Aggregate session summary

### Background Audio
- [ ] REUSE TrackPlayer background playback từ Listening
- [ ] Notification controls (play/pause/skip)
- [ ] Audio interruption handling (call, headphone, etc.)

### Session Summary
- [ ] SessionSummaryScreen (quiz results, words learned, score)
- [ ] Auto-save to History (type: 'audio-article')
- [ ] Push notification "Xem chi tiết kết quả"

### Voice Commands (P2)
- [ ] Basic voice commands (next, repeat, pause, skip quiz)

---

## 7. API Reference

> **Base URL:** `/api`  
> **Auth:** Tất cả endpoints yêu cầu `Authorization: Bearer <Supabase JWT>`

### 7.1 Reading Module (`/api/reading`)

#### `POST /api/reading/generate-article`

> Sinh bài đọc theo chủ đề và level (giữ nguyên từ Reading cũ)

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `topic` | string | ✅ | Chủ đề bài đọc |
| `level` | string | ❌ | `beginner` \| `intermediate` \| `advanced`, default: intermediate |
| `wordCount` | number | ❌ | Số từ mong muốn |

**Response:**

```json
{
  "title": "The Art of Travel",
  "content": "Traveling opens your mind...",
  "wordCount": 350,
  "level": "intermediate",
  "vocabulary": ["serendipity", "wander"]
}
```

---

#### `POST /api/reading/generate-quiz` *(NEW)*

> Sinh câu hỏi comprehension cho 1 paragraph hoặc toàn bài

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `paragraphText` | string | ✅ | Nội dung paragraph/article |
| `level` | string | ❌ | `beginner` \| `intermediate` \| `advanced` |
| `vocabulary` | string[] | ❌ | Từ vựng mới cần hỏi |
| `questionType` | string | ❌ | `factual` \| `inference` \| `vocabulary` \| `summary` \| `mixed` |

**Response:**

```json
{
  "question": "What was the main topic of this paragraph?",
  "expectedAnswer": "The paragraph discusses the impact of travel on personal growth",
  "questionType": "summary",
  "relatedVocabulary": ["serendipity"]
}
```

---

#### `POST /api/reading/evaluate-answer` *(NEW)*

> Đánh giá câu trả lời comprehension của user

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `question` | string | ✅ | Câu hỏi đã hỏi |
| `expectedAnswer` | string | ✅ | Đáp án kỳ vọng |
| `userAnswer` | string | ✅ | Câu trả lời của user (từ STT) |

**Response:**

```json
{
  "isCorrect": true,
  "score": 85,
  "feedback": "Great answer! You correctly identified the main topic.",
  "correctAnswer": "The paragraph discusses the impact of travel on personal growth"
}
```

---

### 7.2 Reused APIs

> Các API dưới đây đã có sẵn, Audio Article chỉ reuse:

| API | Module gốc | Dùng cho |
|-----|-----------|---------|
| `POST /api/ai/text-to-speech` | Listening | TTS narration + Q&A voice |
| `POST /api/ai/transcribe` | Speaking | STT user answers |
| `POST /api/ai/evaluate-pronunciation` | Speaking | Vocabulary drill |
| `GET /api/dictionary/lookup` | Shared | Auto vocabulary explain |
| `POST /api/history` | Shared | Save session |

---

### 7.3 History Module (`/api/history`)

#### `POST /api/history`

> Lưu session Audio Article

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `type` | string | ✅ | `audio-article` |
| `topic` | string | ✅ | Chủ đề bài học |
| `content` | object | ❌ | `{ title, wordCount, paragraphCount }` |
| `durationMinutes` | number | ❌ | Thời gian nghe (phút) |
| `mode` | string | ❌ | `single` \| `playlist` |
| `quizResults` | object | ❌ | `{ total, correct, score }` |
| `wordsLearned` | string[] | ❌ | Danh sách từ mới đã học |

---

## 8. Migration Notes

> Chuyển đổi từ Reading truyền thống sang Audio Article

### 8.1 Những gì BỎ (từ Reading cũ)

| Component | Lý do bỏ |
|-----------|----------|
| Tap-to-translate (word detection) | Yêu cầu nhìn + tap → không passive |
| Focus Mode | Chỉ dùng khi đọc text → không cần |
| Pinch-to-zoom (`usePinchZoom`) | Interaction thủ công → không passive |
| Font size controls | Không đọc text → không cần |
| `PracticeScreen.tsx` | **Gộp vào Speaking "Read Aloud" sub-mode** |
| `useReadingPractice.ts` | **Gộp vào Speaking** |
| `/reading/analyze-practice` API | **Merge vào Speaking evaluate-pronunciation** |
| Saved words management | Tự động qua vocabulary drill |

### 8.2 Những gì GIỮ

| Component | Cách dùng mới |
|-----------|--------------|
| `ConfigScreen.tsx` | Thêm quiz mode, article length |
| `/reading/generate-article` API | Giữ nguyên |
| `useReadingStore.ts` → `useAudioArticleStore.ts` | Rename + restructure |
| `ReadingStack.tsx` | Đổi routes |

### 8.3 Reading Practice → Speaking "Read Aloud"

> Reading Practice (đọc bài to → AI chấm) được gộp vào Speaking module dưới tên "Read Aloud". Xem [03_Speaking.md](03_Speaking.md) section 1.1 cho chi tiết.

---

## 9. Related Documents

- [00_Mobile_Overview.md](../00_Mobile_Overview.md) - Project overview
- [02_Listening.md](02_Listening.md) - Audio player, TTS, background playback
- [03_Speaking.md](03_Speaking.md) - "Read Aloud" sub-mode (từ Reading Practice)
- [07_History.md](07_History.md) - Session history & analytics
- [09_Special_Modes.md](09_Special_Modes.md) - Car Mode, Pocket Mode integration
