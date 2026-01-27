# 📖 Reading Feature - Mobile

> **Module:** Reading  
> **Priority:** P0 (Core)  
> **Phase:** MVP → Enhanced

---

## 1. Overview

Module đọc hiểu với AI-generated articles, tối ưu cho màn hình nhỏ với tap-to-translate và comprehension quiz.

### 1.1 Key Features

| Feature | Description |
|---------|-------------|
| **Tap-to-Translate** | Chạm từ để xem nghĩa |
| **Listen Mode** | AI đọc bài cho user |
| **Quiz** | Kiểm tra hiểu bài |
| **Night Mode** | Tự động đổi màu khi tối |

---

## 2. User Flows

### 2.1 Reading Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [Home]  →  [Config]  →  [Generate]  →  [Read]  →  [Quiz]   │
│             Topic          AI          Article     Test    │
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
│  Aa  │  🌙  │  📝 Quiz  │  📚   │
└─────────────────────────────────┘
```

**Specs:**
- Header: Title + audio toggle
- Meta: Reading time, level, word count
- Content: Readable font size (16-18sp)
- Highlighted words: Tap-able (new vocabulary)
- Bottom bar: Font size, Night mode, Quiz, Save

### 3.3 Dictionary Popup

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

### 3.4 Listen Mode (TTS)

```
┌─────────────────────────────────┐
│  ← Climate Change           ⏸️  │
├─────────────────────────────────┤
│  🔊 Listening Mode Active       │
│  ────●────────────────── 2:30   │
├─────────────────────────────────┤
│                                 │
│  Climate change is one of the   │
│  most [pressing] issues facing  │
│  ████████████                   │
│  our planet today. Scientists   │
│  around the world warn that     │
│  global temperatures are rising │
│  at an unprecedented rate.      │
│                                 │
│  [Highlighted = currently       │
│   being read]                   │
│                                 │
├─────────────────────────────────┤
│    ⏪    │    ⏸️    │    ⏩     │
└─────────────────────────────────┘
```

**Specs:**
- Progress bar: Synced with TTS
- Highlight: Current sentence/word
- Auto-scroll: Follow reading position
- Controls: Pause, skip, speed

### 3.5 Comprehension Quiz

```
┌─────────────────────────────────┐
│  📝 Reading Quiz            3/5 │
├─────────────────────────────────┤
│                                 │
│  What is the main topic of      │
│  the article?                   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ○ Climate solutions     │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ ● Climate change impact │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ ○ Scientific research   │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ ○ Government policies   │   │
│  └─────────────────────────┘   │
│                                 │
│       [Kiểm tra]                │
│                                 │
└─────────────────────────────────┘
```

**Specs:**
- Progress: Question x/total
- Options: Radio buttons, large touch targets
- Submit: Check answer button

### 3.6 Quiz - Correct Answer

```
┌─────────────────────────────────┐
│  📝 Reading Quiz            3/5 │
├─────────────────────────────────┤
│                                 │
│         🎉                      │
│      Chính xác!                 │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ✅ Climate change impact│   │
│  └─────────────────────────┘   │
│                                 │
│  📝 Giải thích:                 │
│  Bài viết tập trung vào tác    │
│  động của biến đổi khí hậu...   │
│                                 │
│       [Câu tiếp theo →]         │
│                                 │
└─────────────────────────────────┘
```

**Specs:**
- Confetti animation
- Haptic: Success notification
- Explanation: Why this is correct
- Auto-advance after 2 seconds

### 3.7 Quiz - Wrong Answer

```
┌─────────────────────────────────┐
│  📝 Reading Quiz            3/5 │
├─────────────────────────────────┤
│                                 │
│         ❌                      │
│     Chưa đúng rồi              │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ❌ Scientific research  │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ ✅ Climate change impact│   │
│  └─────────────────────────┘   │
│                                 │
│  📝 Giải thích:                 │
│  Bài viết không tập trung vào   │
│  nghiên cứu khoa học mà...      │
│                                 │
│       [Câu tiếp theo →]         │
│                                 │
└─────────────────────────────────┘
```

**Specs:**
- Shake animation
- Haptic: Warning notification
- Show correct answer
- Explanation: Why it's wrong

### 3.8 Quiz Results

```
┌─────────────────────────────────┐
│  ← Quiz Results             ✅  │
├─────────────────────────────────┤
│                                 │
│         🎯                      │
│      Kết quả                    │
│        4/5                      │
│       80%                       │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ✅ Question 1            │   │
│  │ ✅ Question 2            │   │
│  │ ✅ Question 3            │   │
│  │ ❌ Question 4            │   │
│  │ ✅ Question 5            │   │
│  └─────────────────────────┘   │
│                                 │
│  [📖 Đọc lại]  [🏠 Trang chủ]  │
│                                 │
└─────────────────────────────────┘
```

### 3.9 Font Size & Display Settings

```
┌─────────────────────────────────┐
│         Hiển thị                │
├─────────────────────────────────┤
│                                 │
│  Cỡ chữ                         │
│  Aa────────●──────────Aa       │
│  Small            Large         │
│                                 │
│  Theme                          │
│  [☀️ Light] [🌙 Dark] [📱 Auto] │
│                                 │
│  Line spacing                   │
│  [Compact] [Normal] [Relaxed]   │
│                                 │
│       [Áp dụng]                 │
└─────────────────────────────────┘
```

---

## 4. Features Detail

### 4.1 Interactive Features

| Feature | Gesture | Result |
|---------|---------|--------|
| Tap word | Single tap | Dictionary popup |
| Long press word | Long press | Highlight & save |
| Pinch | Pinch in/out | Zoom text |
| Listen | Tap 🔊 | AI reads article |
| Night mode | Tap 🌙 | Dark theme |

### 4.2 Dictionary Lookup

| Element | Description |
|---------|-------------|
| Word | Selected word |
| IPA | Phonetic transcription |
| Definition | Vietnamese meaning |
| Examples | Usage in sentences |
| Audio | Pronunciation audio |
| Save | Add to vocabulary |

### 4.3 Font & Display

| Setting | Options |
|---------|---------|
| Font size | 14sp, 16sp, 18sp, 20sp, 22sp |
| Theme | Light, Dark, Auto |
| Line spacing | 1.2, 1.5, 1.8 |

---

## 5. Technical Implementation

### 5.1 Libraries

```typescript
expo-speech               // Text-to-Speech
react-native-tts          // TTS alternative
@react-native-async-storage // Font preferences
```

### 5.2 State Structure

```typescript
interface ReadingState {
  // Config
  config: {
    topic: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    length: 'short' | 'medium' | 'long';
    autoRead: boolean;
  };
  
  // Article
  article: {
    title: string;
    content: string;
    wordCount: number;
    readingTime: number;
    level: string;
  };
  
  // Reader
  reader: {
    fontSize: number;
    theme: 'light' | 'dark' | 'auto';
    lineSpacing: number;
    isListening: boolean;
    currentPosition: number;
  };
  
  // Quiz
  quiz: {
    questions: Question[];
    answers: number[];
    currentIndex: number;
  };
  
  // Dictionary
  dictionary: {
    selectedWord: string | null;
    definition: WordDefinition | null;
  };
}
```

### 5.3 Word Detection

```typescript
// Pseudo-code for tap-to-translate
function handleWordTap(event: TextTouchEvent) {
  const position = event.nativeEvent.position;
  const word = extractWordAtPosition(content, position);
  
  // Show dictionary popup
  setSelectedWord(word);
  fetchDefinition(word);
}
```

---

## 6. Implementation Tasks

### MVP Phase
- [ ] Config screen (topic, level, length)
- [ ] Generate article via API
- [ ] Article display with scrolling
- [ ] Tap-to-translate popup
- [ ] Basic quiz (multiple choice)
- [ ] Quiz results screen

### Enhanced Phase
- [ ] Listen mode (TTS)
- [ ] Font size controls
- [ ] Night mode (auto-detect)
- [ ] Save words to vocabulary
- [ ] Highlight new vocabulary

---

## 7. Related Documents

- [00_Mobile_Overview.md](../00_Mobile_Overview.md) - Project overview
- [06_Vocabulary.md](06_Vocabulary.md) - Saved words
- [UI_Design_System.md](../design/UI_Design_System.md) - Typography
