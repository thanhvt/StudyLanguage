# 📖 Reading Feature - Mobile

> **Module:** Reading  
> **Priority:** P0 (Core)  

---

## 1. Overview

Module đọc hiểu với AI-generated articles, tối ưu cho màn hình nhỏ với tap-to-translate và reading practice.

### 1.1 Key Features

| Feature | Description |
|---------|-------------|
| **Tap-to-Translate** | Chạm từ để xem nghĩa |
| **Focus Mode** | Ẩn UI, tập trung đọc bài |
| **Reading Practice** | Luyện đọc với AI phân tích phát âm |

### 1.2 Reading Practice Mode

Chế độ luyện đọc với AI phản hồi:

| Feature | Description |
|---------|-------------|
| **Record Reading** | Ghi âm giọng đọc của user |
| **Space Shortcut** | Nhấn Space để toggle recording (giống Speaking) |
| **AI Analysis** | AI phân tích phát âm và đánh giá |
| **Direct Save** | Lưu bài practice trực tiếp vào History |

---

## 2. User Flows

### 2.1 Reading Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [Home]  →  [Config]  →  [Generate]  →  [Read]  →  [Save]    │
│             Topic          AI          Article    History  │
│             Level                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Word Lookup Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [Tap Word]  →  [Dictionary Popup]  →  [Save Word?]         │
│                  Pronunciation        → Vocabulary list    │
│                  Meaning                                    │
│                  Examples                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---


## 4. Features Detail

### 4.1 Interactive Features

| Feature | Gesture | Result |
|---------|---------|--------|
| Tap word | Single tap | Dictionary popup |
| Long press word | Long press | Highlight & save |
| Pinch | Pinch in/out | Zoom text |

### 4.2 Dictionary Lookup

| Element | Description |
|---------|-------------|
| Word | Selected word |
| IPA | Phonetic transcription |
| Definition | Vietnamese meaning |
| Examples | Usage in sentences |
| Audio | Pronunciation audio |
| Save | Add to vocabulary |

---

## 5. Technical Implementation

### 5.1 Libraries

```typescript
react-native-tts                // TTS auto-read
@react-native-voice/voice       // STT cho Reading Practice
react-native-gesture-handler    // Pinch-to-zoom
zustand                         // State management (useReadingStore)
@tanstack/react-query           // API caching (optional)
```

### 5.2 File Structure

| File | Purpose |
|------|---------|
| `screens/reading/ConfigScreen.tsx` | Config UI (topic, level, length) |
| `screens/reading/ArticleScreen.tsx` | Article view + TTS + Highlight + Focus Mode + Save |
| `screens/reading/PracticeScreen.tsx` | Reading practice (STT + AI analysis) |
| `hooks/useTtsReader.ts` | TTS auto-read (play/pause/stop/skip) |
| `hooks/usePinchZoom.ts` | Pinch gesture → fontSize (12-28sp) |
| `hooks/useReadingPractice.ts` | Practice state machine (idle→record→analyze→result) |
| `store/useReadingStore.ts` | Zustand store (config, article, fontSize, savedWords, focusMode) |
| `services/api/reading.ts` | API service (7 endpoints) |
| `navigation/stacks/ReadingStack.tsx` | Navigator (Config → Article → Practice) |

### 5.3 State Structure (Actual)

```typescript
interface ReadingState {
  config: ReadingConfig;          // { topic, level, length }
  article: ArticleResult | null;  // { title, content, wordCount, readingTime, level }
  isGenerating: boolean;
  error: string | null;
  fontSize: number;               // 12-28sp, default 16
  savedWords: string[];           // In-memory, lowercase
  isFocusMode: boolean;           // Ẩn header/footer
  isArticleSaved: boolean;        // Đã lưu vào History chưa
}
```

### 5.4 API Endpoints

| Method | Endpoint | Function |
|--------|----------|----------|
| POST | `/reading/generate-article` | `generateArticle()` |
| POST | `/reading/saved-words` | `saveWord()` |
| GET | `/reading/saved-words` | `getSavedWords()` |
| DELETE | `/reading/saved-words/:id` | `deleteWord()` |
| POST | `/reading/analyze-practice` | `analyzePractice()` |
| POST | `/history` | `saveReadingSession()` |

### 5.5 Word Detection

```typescript
// Tap-to-translate: mỗi từ là 1 TouchableOpacity
paragraph.split(/(\s+)/).map(token => (
  <TouchableOpacity onPress={() => handleWordTap(token)}>
    <AppText style={{
      color: isWordHighlighted(token) ? readingColor : foreground,
      backgroundColor: isWordHighlighted(token) ? readingColor + '20' : 'transparent',
    }}>
      {token}
    </AppText>
  </TouchableOpacity>
));
```

---

## 6. Implementation Tasks

### Config & Generation
- [ ] Config screen (topic, level, length)
- [ ] Generate article via API

### Article Display
- [ ] Article display with scrolling
- [ ] Tap-to-translate popup
- [ ] Dictionary popup: save word + audio playback (reuse từ Listening, audio via Linking.openURL)
- [ ] Highlight new vocabulary (amber badge khi từ đã lưu)

### Text Controls
- [ ] Font size controls (A+/A-)
- [ ] Pinch-to-zoom text (usePinchZoom hook + GestureDetector)

### TTS Auto-Read
- [ ] TTS auto-read article (useTtsReader hook, paragraph highlight + auto-scroll)

### Reading Practice
- [ ] Reading practice with AI analysis (PracticeScreen + useReadingPractice + STT + analyzePractice API)

### Focus Mode
- [ ] Focus Mode toggle (animated chrome hiding, status bar, hint label)

### Save to History
- [ ] Direct save reading articles (saveReadingSession → History API)
- [ ] Save words to vocabulary (in-memory store + DictionaryPopup)

---

## 7. API Reference

> **Base URL:** `/api`  
> **Auth:** Tất cả endpoints yêu cầu `Authorization: Bearer <Supabase JWT>`

### 7.1 Reading Module (`/api/reading`)

#### `POST /api/reading/generate-article`

> Sinh bài đọc theo chủ đề và level

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

#### `POST /api/reading/analyze-practice`

> Phân tích kết quả reading practice (so sánh transcript với văn bản gốc)

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `originalText` | string | ✅ | Văn bản gốc của bài đọc |
| `userTranscript` | string | ✅ | Transcript từ Whisper (user đọc) |

**Response:**

```json
{
  "accuracy": 92,
  "fluencyScore": 85,
  "errors": [{ "word": "serendipity", "expected": "serendipity", "got": "serendipiti" }],
  "feedback": "Great reading! Pay attention to..."
}
```

---

#### `GET /api/reading/saved-words?page=1&limit=20`

> Lấy danh sách từ đã lưu (paginated)

**Query Params:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `page` | number | ❌ | Trang hiện tại, default: 1 |
| `limit` | number | ❌ | Số lượng mỗi trang, default: 20 |

**Response:**

```json
{
  "words": [
    { "id": "uuid", "word": "serendipity", "meaning": "sự tình cờ may mắn", "context": "...", "articleId": "..." }
  ],
  "total": 45,
  "page": 1,
  "limit": 20
}
```

---

#### `POST /api/reading/saved-words`

> Lưu từ mới vào danh sách (tap-to-translate → Save)

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `word` | string | ✅ | Từ cần lưu |
| `meaning` | string | ❌ | Nghĩa tiếng Việt |
| `context` | string | ❌ | Ngữ cảnh (câu chứa từ) |
| `articleId` | string | ❌ | ID bài đọc liên quan |

---

#### `DELETE /api/reading/saved-words/:id`

> Xóa từ khỏi danh sách đã lưu

---

### 7.2 Dictionary Module (`/api/dictionary`)

#### `GET /api/dictionary/lookup?word=serendipity`

> Tra nghĩa, IPA, ví dụ cho 1 từ tiếng Anh (proxy Free Dictionary API)

**Query Params:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `word` | string | ✅ | Từ cần tra |

**Response:**

```json
{
  "success": true,
  "result": {
    "word": "serendipity",
    "ipa": "/ˌsɛr.ənˈdɪp.ɪ.ti/",
    "audio": "https://...",
    "meanings": [
      { "partOfSpeech": "noun", "definition": "The occurrence of events by chance...", "example": "..." }
    ]
  }
}
```

---

### 7.3 AI Module (`/api/ai`)

#### `POST /api/ai/text-to-speech`

> TTS cho auto-read article feature

> Xem chi tiết request/response ở [02_Listening.md - Section 8.1](02_Listening.md#post-apiaitext-to-speech)

---

#### `POST /api/ai/evaluate-pronunciation`

> Đánh giá phát âm cho Reading Practice

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `originalText` | string | ✅ | Văn bản gốc |
| `userTranscript` | string | ✅ | Transcript user đọc |

**Response:**

```json
{ "overallScore": 88, "feedback": "Very clear reading..." }
```

---

### 7.4 Conversation Generator (`/api/conversation-generator`)

#### `POST /api/conversation-generator/generate-text`

> Sinh bài đọc bằng Groq (alternative to Reading generate-article)

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `prompt` | string | ✅ | Prompt mô tả bài đọc cần sinh |
| `systemPrompt` | string | ❌ | System prompt cho AI |

**Response:**

```json
{ "text": "Generated article content..." }
```

---

### 7.5 History Module (`/api/history`)

#### `POST /api/history`

> Tạo mới bản ghi lịch sử học tập (save reading session)

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `type` | string | ✅ | `listening` \| `speaking` \| `reading` |
| `topic` | string | ✅ | Chủ đề bài học |
| `content` | object | ❌ | Nội dung bài học (article data, transcript, ...) |
| `durationMinutes` | number | ❌ | Thời gian luyện tập (phút) |
| `numSpeakers` | number | ❌ | Số người nói (cho listening) |
| `keywords` | string | ❌ | Từ khóa liên quan |
| `mode` | string | ❌ | Chế độ luyện tập (`article` \| `practice`) |
| `audioUrl` | string | ❌ | URL audio nếu có |
| `audioTimestamps` | array | ❌ | Timestamps `[{ startTime, endTime }]` |

**Response (201):**

```json
{
  "success": true,
  "entry": {
    "id": "uuid",
    "type": "reading",
    "topic": "The Art of Travel",
    "content": { "title": "...", "wordCount": 350 },
    "durationMinutes": 15,
    "mode": "article",
    "status": "completed",
    "isPinned": false,
    "isFavorite": false,
    "createdAt": "2026-02-26T08:30:00.000Z"
  },
  "message": "Đã lưu bài học vào lịch sử"
}
```

---

## 8. Related Documents

- [00_Mobile_Overview.md](../00_Mobile_Overview.md) - Project overview
- [07_History.md](07_History.md) - Saved words & History
- [UI_Design_System.md](../design/UI_Design_System.md) - Typography
