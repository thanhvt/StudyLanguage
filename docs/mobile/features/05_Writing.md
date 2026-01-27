# ✍️ Writing Feature - Mobile

> **Module:** Writing  
> **Priority:** P1 (Core)  
> **Phase:** MVP → Enhanced

---

## 1. Overview

Module luyện viết với AI correction, tối ưu cho mobile với voice input và auto-save.

### 1.1 Key Features

| Feature | Description |
|---------|-------------|
| **Voice Input** | Dictate thay vì gõ |
| **AI Correction** | Sửa lỗi ngữ pháp, từ vựng |
| **Paraphrase** | Gợi ý cách viết "Tây" hơn |
| **Auto-save** | Lưu tự động mỗi 10 giây |

---

## 2. User Flows

### 2.1 Writing Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [Home]  →  [Select Type]  →  [Write]  →  [Submit]  →  [AI] │
│              Journal         Input        Review     Feedback│
│              Essay                                          │
│              Email                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. UI Mockups

### 3.1 Writing Type Selection

```
┌─────────────────────────────────┐
│  ← Writing Practice         ⋮  │
├─────────────────────────────────┤
│                                 │
│  Chọn loại bài viết             │
│                                 │
│  ┌─────────────────────────┐   │
│  │  📓 Daily Journal       │   │
│  │  Free writing practice  │   │
│  │  ~100-200 words         │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │  📝 Essay               │   │
│  │  Structured writing     │   │
│  │  ~300-500 words         │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │  📧 Email               │   │
│  │  Professional writing   │   │
│  │  ~100-200 words         │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │  💬 Social Post         │   │
│  │  Casual writing         │   │
│  │  ~50-100 words          │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### 3.2 Writing Prompt Screen

```
┌─────────────────────────────────┐
│  ← Daily Journal            💡  │
├─────────────────────────────────┤
│                                 │
│  💡 Gợi ý chủ đề:               │
│                                 │
│  ┌─────────────────────────┐   │
│  │ "Describe your morning  │   │
│  │  routine today"         │   │
│  └─────────────────────────┘   │
│                                 │
│  [🔄 Đổi gợi ý khác]            │
│                                 │
│  ─────── hoặc ───────           │
│                                 │
│  [✍️ Viết tự do]                │
│                                 │
└─────────────────────────────────┘
```

### 3.3 Writing Input Screen

```
┌─────────────────────────────────┐
│  ← Daily Journal            💾  │
├─────────────────────────────────┤
│  📅 26/01/2026                  │
│  📝 Word count: 45/200          │
│  ⏱️ Auto-saved 10s ago          │
├─────────────────────────────────┤
│                                 │
│  Today I woke up early and      │
│  went for a morning run. The    │
│  weather was really nice and    │
│  I felt very energetic. After   │
│  that, I had breakfast with     │
│  my family. We talked about     │
│  our plans for the weekend.     │
│  |                              │
│                                 │
│                                 │
│                                 │
│                                 │
├─────────────────────────────────┤
│  [🎤 Voice]  │  [✅ Hoàn thành] │
└─────────────────────────────────┘
```

**Specs:**
- Header: Date, word count, auto-save status
- Input: Multi-line text area
- Voice: Dictation button
- Submit: Send for AI review

### 3.4 Voice Input Mode

```
┌─────────────────────────────────┐
│  ← Daily Journal            ❌  │
├─────────────────────────────────┤
│                                 │
│           🎤                    │
│      Đang nghe...               │
│                                 │
│  ┌─────────────────────────┐   │
│  │ "Today I went to the    │   │
│  │  coffee shop and..."    │   │
│  └─────────────────────────┘   │
│                                 │
│     🌊🌊🌊🌊🌊🌊🌊🌊             │
│     [Live Waveform]             │
│                                 │
│       [⏸️ Pause]                │
│                                 │
└─────────────────────────────────┘
```

**Specs:**
- Real-time transcription
- Waveform visualization
- Pause/Resume controls
- Auto-punctuation

### 3.5 AI Correction View

```
┌─────────────────────────────────┐
│  ← Review & Corrections     ✅  │
├─────────────────────────────────┤
│                                 │
│       📊 Score: 82/100          │
│  ✅ 42 words OK | ⚠️ 3 errors   │
│                                 │
├─────────────────────────────────┤
│  [Original]  [Corrected]        │
├─────────────────────────────────┤
│                                 │
│  I [go] to school yesterday.    │
│      ⚠️ Grammar Error           │
│  ┌─────────────────────────┐   │
│  │ 💡 "go" → "went"        │   │
│  │    Past tense required  │   │
│  │    [Áp dụng] [Bỏ qua]   │   │
│  └─────────────────────────┘   │
│                                 │
│  The weather was very [good].   │
│      💡 Style Suggestion        │
│  ┌─────────────────────────┐   │
│  │ 💡 "good" → "pleasant"  │   │
│  │    More descriptive     │   │
│  │    [Áp dụng] [Bỏ qua]   │   │
│  └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│  [📝 Xem bản sửa hoàn chỉnh]    │
└─────────────────────────────────┘
```

**Specs:**
- Score: Overall grade
- Stats: Correct words vs errors
- Tabs: Original vs Corrected view
- Errors: Inline highlights with suggestions
- Actions: Apply fix, skip, or view full

### 3.6 Error Categories

```
┌─────────────────────────────────┐
│  📊 Error Breakdown             │
├─────────────────────────────────┤
│                                 │
│  ❌ Grammar Errors         (2)  │
│  ├─ Tense: "go → went"          │
│  └─ Article: "a → an"           │
│                                 │
│  📝 Spelling Errors        (1)  │
│  └─ "recieve → receive"         │
│                                 │
│  💡 Style Suggestions      (2)  │
│  ├─ "good → pleasant"           │
│  └─ "very → extremely"          │
│                                 │
│  ✨ Vocabulary Tips        (1)  │
│  └─ Consider: "delightful"      │
│                                 │
└─────────────────────────────────┘
```

### 3.7 Corrected Version View

```
┌─────────────────────────────────┐
│  ← Corrected Version        📋  │
├─────────────────────────────────┤
│                                 │
│  Today I [went] to school.      │
│  The weather was very           │
│  [pleasant] and I felt          │
│  [extremely] happy. I met my    │
│  friends and we had [an]        │
│  interesting conversation       │
│  about our weekend plans.       │
│                                 │
│  [Green = corrections applied]  │
│                                 │
├─────────────────────────────────┤
│  [📋 Copy]  [💾 Save]  [🔄 Edit]│
└─────────────────────────────────┘
```

### 3.8 Paraphrase Suggestions

```
┌─────────────────────────────────┐
│  ✨ Cách diễn đạt hay hơn       │
├─────────────────────────────────┤
│                                 │
│  📝 Original:                   │
│  "The movie was really good     │
│   and I liked it very much."    │
│                                 │
│  ✨ Suggestion 1:               │
│  "The movie was absolutely      │
│   captivating, and I thoroughly │
│   enjoyed every moment."        │
│  [Áp dụng]                      │
│                                 │
│  ✨ Suggestion 2:               │
│  "I found the movie to be       │
│   exceptional and truly         │
│   memorable."                   │
│  [Áp dụng]                      │
│                                 │
│  ✨ Suggestion 3:               │
│  "The film exceeded my          │
│   expectations - it was a       │
│   delightful experience."       │
│  [Áp dụng]                      │
│                                 │
└─────────────────────────────────┘
```

---

## 4. Features Detail

### 4.1 Writing Types

| Type | Purpose | Word Target |
|------|---------|-------------|
| Daily Journal | Free practice | 100-200 words |
| Essay | Structured writing | 300-500 words |
| Email | Professional | 100-200 words |
| Social Post | Casual | 50-100 words |

### 4.2 AI Feedback Categories

| Category | Description | Example |
|----------|-------------|---------|
| Grammar | Tense, articles, prepositions | "go → went" |
| Spelling | Typos, misspellings | "recieve → receive" |
| Style | Word choice, flow | "good → pleasant" |
| Vocabulary | Richer expressions | "happy → delighted" |
| Paraphrase | Complete rewrites | Full sentence alternatives |

### 4.3 Voice Input

| Feature | Description |
|---------|-------------|
| Real-time | Live transcription |
| Punctuation | Auto-add periods, commas |
| Language | English recognition |
| Duration | Unlimited while holding |

---

## 5. Technical Implementation

### 5.1 Libraries

```typescript
expo-speech                // Voice input
@react-native-community/async-storage // Auto-save
react-native-keyboard-aware-scroll-view // Keyboard handling
```

### 5.2 State Structure

```typescript
interface WritingState {
  // Config
  config: {
    type: 'journal' | 'essay' | 'email' | 'social';
    prompt?: string;
  };
  
  // Editor
  editor: {
    content: string;
    wordCount: number;
    lastSaved: Date;
    isDirty: boolean;
  };
  
  // Voice
  voice: {
    isListening: boolean;
    transcript: string;
  };
  
  // Feedback
  feedback: {
    loading: boolean;
    score?: number;
    errors?: WritingError[];
    paraphrases?: string[];
  };
}

interface WritingError {
  type: 'grammar' | 'spelling' | 'style' | 'vocabulary';
  original: string;
  suggestion: string;
  explanation: string;
  position: { start: number; end: number };
}
```

### 5.3 Auto-save Logic

```typescript
// Pseudo-code for auto-save
const AUTO_SAVE_INTERVAL = 10000; // 10 seconds

useEffect(() => {
  const timer = setInterval(() => {
    if (isDirty) {
      saveDraft(content);
      setLastSaved(new Date());
      setIsDirty(false);
    }
  }, AUTO_SAVE_INTERVAL);
  
  return () => clearInterval(timer);
}, [content, isDirty]);
```

---

## 6. Implementation Tasks

### MVP Phase
- [ ] Writing type selection
- [ ] Text input screen
- [ ] Word counter
- [ ] Submit for AI review
- [ ] Display corrections
- [ ] Auto-save draft

### Enhanced Phase
- [ ] Voice input (dictation)
- [ ] Paraphrase suggestions
- [ ] Writing prompts
- [ ] Error categorization
- [ ] Apply/Skip corrections

---

## 7. Related Documents

- [00_Mobile_Overview.md](../00_Mobile_Overview.md) - Project overview
- [06_Vocabulary.md](06_Vocabulary.md) - New words from corrections
- [10_Native_Features.md](10_Native_Features.md) - Voice input
