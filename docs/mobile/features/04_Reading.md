# 📖 Reading Feature - Mobile

> **Module:** Reading  
> **Priority:** P0 (Core)  
> **Phase:** MVP → Enhanced

---

## 1. Overview

Module đọc hiểu với AI-generated articles, tối ưu cho màn hình nhỏ với tap-to-translate và reading practice.

### 1.1 Key Features

| Feature | Description |
|---------|-------------|
| **Tap-to-Translate** | Chạm từ để xem nghĩa |
| **Focus Mode** | Ẩn UI, tập trung đọc bài (NEW ✨) |
| **Reading Practice** | Luyện đọc với AI phân tích phát âm (NEW ✨) |

### 1.2 Reading Practice Mode (NEW ✨)

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

## 3. UI Mockups

### 3.1 Configuration Screen

```
┌─────────────────────────────────┐
│  ← Reading Practice         ⋮  │
├─────────────────────────────────┤
│                                 │
│  📝 Chủ đề                      │
│  ┌─────────────────────────┐   │
│  │ Climate Change        ▼│   │
│  └─────────────────────────┘   │
│                                 │
│  📊 Trình độ                    │
│  ┌─────────────────────────┐   │
│  │ Beginner  [Intermediate] Advanced │
│  └─────────────────────────┘   │
│                                 │
│  📏 Độ dài                      │
│  ┌─────────────────────────┐   │
│  │ Short  [Medium]  Long   │   │
│  └─────────────────────────┘   │
│                                 │
│  ⚙️ Tùy chọn                    │
│  ☑️ Tự động đọc (TTS)           │
│  ☑️ Highlight từ mới            │
│                                 │
│  ┌─────────────────────────┐   │
│  │    📖 Tạo bài đọc       │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

**Specs:**
- Topic: Dropdown with categories
- Level: 3-option toggle
- Length: Short (~200w), Medium (~400w), Long (~600w)
- Options: Checkboxes for preferences

### 3.2 Article View

```
┌─────────────────────────────────┐
│  ← Climate Change           🔊  │
├─────────────────────────────────┤
│  📖 Reading Time: ~5 minutes    │
│  📊 Level: Intermediate         │
│  📝 Words: 384                  │
├─────────────────────────────────┤
│                                 │
│  Climate change is one of the   │
│  most [pressing] issues facing  │
│  our planet today. Scientists   │
│  around the world warn that     │
│  global temperatures are rising │
│  at an unprecedented rate.      │
│                                 │
│  The effects of climate change  │
│  are already visible. Extreme   │
│  weather events, rising sea     │
│  levels, and melting glaciers   │
│  are just a few examples of     │
│  how our world is changing.     │
│                                 │
│  Many countries have started    │
│  taking action to combat this   │
│  crisis. Renewable energy       │
│  sources like solar and wind    │
│  power are becoming more        │
│  popular and affordable.        │
│                                 │
│     [Swipe up để tiếp tục]      │
│                                 │
├─────────────────────────────────┤
│  Aa  │  🔲 Focus  │  � Save  │  📚   │
└─────────────────────────────────┘
```

**Specs:**
- Header: Title + audio toggle
- Meta: Reading time, level, word count
- Content: Readable font size (16-18sp)
- Highlighted words: Tap-able (new vocabulary)
- Bottom bar: Font size, Focus mode, Save, Vocabulary

### 3.3 Article View - Focus Mode (NEW ✨)

```
┌─────────────────────────────────┐
│                                 │
│  Climate change is one of the   │
│  most pressing issues facing    │
│  our planet today. Scientists   │
│  around the world warn that     │
│  global temperatures are rising │
│  at an unprecedented rate.      │
│                                 │
│  The effects of climate change  │
│  are already visible. Extreme   │
│  weather events, rising sea     │
│  levels, and melting glaciers   │
│  are just a few examples of     │
│  how our world is changing.     │
│                                 │
│     [Tap center to exit]        │
│                                 │
└─────────────────────────────────┘
```

**Specs:**
- Hidden: Header, Bottom bar, Status bar
- Font size: Increased by 1 step
- Background: High contrast (or dark mode)
- Interaction: Tap anywhere to show controls

### 3.4 Reading Practice (NEW ✨)

```
┌─────────────────────────────────┐
│  ← Practice Reading         💾  │
├─────────────────────────────────┤
│  Climate change is one of...    │
│  (Original text context)        │
├─────────────────────────────────┤
│                                 │
│  🗣️ Your Turn:                  │
│  "Climate change is one of      │
│   the most pressing issues..."  │
│                                 │
│  📊 Feedback:                   │
│  Accuracy: 92%                  │
│  Words: 15/16                   │
│                                 │
│  ⚠️ Improve:                    │
│  "pressing" (/ˈpres.ɪŋ/)        │
│                                 │
├─────────────────────────────────┤
│  [🎤 Hold Space / Tap to Record]│
│                                 │
│  [▶️ Nghe lại]  [Thử lại]       │
└─────────────────────────────────┘
```

**Specs:**
- Split screen: Text top, Practice bottom
- Hardware Keyboard: Spacebar toggle recording
- Visualizer: When recording
- Feedback: Immediate score + pronunciation tips



### 3.5 Dictionary Popup

```
┌─────────────────────────────────┐
│                                 │
│  pressing  /ˈpres.ɪŋ/      ❌  │
├─────────────────────────────────┤
│                                 │
│  adjective                      │
│                                 │
│  1. Khẩn cấp, cấp bách          │
│  2. Đòi hỏi sự chú ý ngay       │
│                                 │
│  📝 Example:                    │
│  "This is a pressing matter     │
│   that needs immediate          │
│   attention."                   │
│                                 │
│  🔊 Phát âm                     │
│                                 │
├─────────────────────────────────┤
│  [💾 Lưu vào từ vựng]           │
└─────────────────────────────────┘
```

**Specs:**
- Word: Large, with IPA pronunciation
- Definition: Vietnamese translation
- Example: English sentence
- Audio: Tap to hear pronunciation
- Save: Add to vocabulary list

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

### MVP Phase
- [x] Config screen (topic, level, length)
- [x] Generate article via API
- [x] Article display with scrolling
- [x] Tap-to-translate popup

### Enhanced Phase
- [x] Font size controls *(A+/A- done)*
- [x] Save words to vocabulary *(in-memory store + DictionaryPopup)*
- [x] Highlight new vocabulary *(amber badge khi từ đã lưu)*
- [x] **Dictionary popup: save word + audio playback** *(reuse từ Listening, audio via Linking.openURL)*
- [x] **Pinch-to-zoom text** *(usePinchZoom hook + GestureDetector)*
- [x] **TTS auto-read article** *(useTtsReader hook, paragraph highlight + auto-scroll)*
- [x] **Direct save reading articles** *(saveReadingSession → History API)*
- [x] **Reading practice with AI analysis** *(PracticeScreen + useReadingPractice + STT + analyzePractice API)*
- [x] **Focus Mode toggle** *(animated chrome hiding, status bar, hint label)*

---

## 7. Related Documents

- [00_Mobile_Overview.md](../00_Mobile_Overview.md) - Project overview
- [07_History.md](07_History.md) - Saved words & History
- [UI_Design_System.md](../design/UI_Design_System.md) - Typography
