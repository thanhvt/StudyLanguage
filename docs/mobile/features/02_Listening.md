# 🎧 Listening Feature - Mobile

> **Module:** Listening  
> **Priority:** P0 (Core)  
> **Phase:** MVP → Enhanced → Advanced

---

## 1. Overview

Module nghe hiểu với AI-generated conversations, tối ưu cho học trên di chuyển với offline support và background playback.

### 1.1 Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **Podcast Mode** | Nghe thụ động, có transcript | Commute, Workout |
| **Interactive Mode** | AI pause, user respond | Focused learning |
| **Radio Mode** | Continuous playlists | Background learning |

---

## 2. User Flows

### 2.1 Main Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [Home]  →  [Config Screen]  →  [Generating]  →  [Player]   │
│             (Topic, Duration,      (AI)          (Listen)  │
│              Mode, Speakers)                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Pocket Mode Flow (Walking/Driving)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [Player Active]  →  [Motion Detected]  →  [Pocket Mode]    │
│                       (Gyroscope)           (Black screen) │
│                                               (Gestures)   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. UI Mockups

### 3.1 Configuration Screen

```
┌─────────────────────────────────┐
│  ← Listening                ⋮  │
├─────────────────────────────────┤
│                                 │
│  📝 Chủ đề                      │
│  ┌─────────────────────────┐   │
│  │ Cuộc sống hằng ngày   ▼│   │
│  └─────────────────────────┘   │
│                                 │
│  ⏱️ Thời lượng                  │
│  ┌─────────────────────────┐   │
│  │  5  10 (15) 20  30  min │   │
│  └─────────────────────────┘   │
│                                 │
│  🎙️ Chế độ                      │
│  ┌────────────┬────────────┐   │
│  │  Podcast   │Interactive │   │
│  │    ●       │     ○      │   │
│  └────────────┴────────────┘   │
│                                 │
│  👥 Số người nói                │
│  ┌─────────────────────────┐   │
│  │   [ 2 ]  [ 3 ]  [ 4 ]   │   │
│  └─────────────────────────┘   │
│                                 │
│  ▼ Tùy chọn nâng cao            │
│                                 │
│  ┌─────────────────────────┐   │
│  │    🎧 Bắt đầu nghe      │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

**Specs:**
- Topic: Dropdown with categories
- Duration: Pill buttons (5, 10, 15, 20, 30)
- Mode: Toggle switches
- Speakers: Stepper or chips
- Advanced: Bottom sheet (keywords, custom settings)

### 3.2 Advanced Options (Bottom Sheet)

```
┌─────────────────────────────────┐
│  ━━━━━                          │
│  Tùy chọn nâng cao              │
├─────────────────────────────────┤
│                                 │
│  🔑 Từ khóa (Optional)          │
│  ┌─────────────────────────┐   │
│  │ coffee, meeting         │   │
│  └─────────────────────────┘   │
│                                 │
│  🎯 Độ khó                      │
│  ○ Beginner  ● Intermediate ○ Advanced │
│                                 │
│  🔊 Giọng đọc                   │
│  ○ Alloy  ● Nova  ○ Onyx        │
│                                 │
│       [Áp dụng]                 │
└─────────────────────────────────┘
```

### 3.3 Player - Podcast Mode

```
┌─────────────────────────────────┐
│  ← Coffee Shop Talk         ⋮  │
├─────────────────────────────────┤
│                                 │
│     🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊        │
│     [Waveform Animation]        │
│                                 │
│    ────●────────────── 12:30    │
│    5:30                  15:00  │
│                                 │
│      [⏪]  [⏸️ ]  [⏩]          │
│                                 │
├─────────────────────────────────┤
│                                 │
│  👤 A: Hi, can I order a        │
│        coffee please?           │
│                                 │
│  👤 B: Sure! What size would    │
│        you like?                │
│                                 │
│  👤 A: Large, please. And could │
│        I have some milk?        │
│                                 │
│     [Karaoke-style scrolling]   │
│                                 │
├─────────────────────────────────┤
│  🔖 Save  │  🔁 Repeat  │ ⚡ x1.0│
└─────────────────────────────────┘
```

**Specs:**
- Waveform: Lottie animation synced with audio
- Progress bar: Draggable, shows time
- Controls: Play/Pause (center, large), Skip ±15s
- Transcript: Auto-scroll with highlight
- Bottom bar: Bookmark, A-B Loop, Speed

### 3.4 Player - Interactive Mode

```
┌─────────────────────────────────┐
│  ← Job Interview Practice   ⋮  │
├─────────────────────────────────┤
│                                 │
│     👤 AI                       │
│     ┌─────────────────────┐    │
│     │ Tell me about       │    │
│     │ your experience     │    │
│     └─────────────────────┘    │
│              🔊                 │
│                                 │
├─────────────────────────────────┤
│                                 │
│        Đến lượt bạn!            │
│                                 │
│         🎤                      │
│    [Giữ để ghi âm]              │
│                                 │
│     ⏱️ Time: 0:00 / 0:15        │
│                                 │
├─────────────────────────────────┤
│  💡 Gợi ý  │  ⏭️ Bỏ qua        │
└─────────────────────────────────┘
```

**Specs:**
- AI speech: Bubble with audio icon
- User turn: Mic button (hold-to-record)
- Timer: Countdown for response
- Hints: Tap to see suggestion
- Skip: Move to next exchange

### 3.5 Speed Control Popup

```
┌─────────────────────────────────┐
│         Tốc độ phát             │
├─────────────────────────────────┤
│                                 │
│   0.5x  0.75x  1.0x  1.25x 1.5x│
│    ○     ○      ●      ○     ○ │
│                                 │
└─────────────────────────────────┘
```

### 3.6 A-B Loop Selection

```
┌─────────────────────────────────┐
│         Chọn đoạn lặp           │
├─────────────────────────────────┤
│                                 │
│  Start: 02:30  ────  End: 03:15 │
│                                 │
│  ──────[====]─────────────────  │
│        A     B                  │
│                                 │
│  [Hủy]           [Áp dụng]     │
└─────────────────────────────────┘
```

### 3.7 Pocket Mode (Lock Screen Compatible)

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│                                 │
│         Coffee Shop Talk        │
│                                 │
│      ← Previous sentence →     │
│      ↓ Save to bookmarks       │
│                                 │
│         Double tap: Play/Pause  │
│                                 │
│                                 │
└─────────────────────────────────┘
```

**Specs:**
- Ultra-minimal UI (battery saving)
- Large gesture areas
- Black/OLED background

### 3.8 Lock Screen Controls (iOS/Android)

```
┌─────────────────────────────────┐
│  🔒 Lock Screen                 │
├─────────────────────────────────┤
│                                 │
│  📚 StudyLanguage               │
│  Coffee Shop Talk               │
│                                 │
│  ────●────────────── 5:30/15:00│
│                                 │
│     [⏪]    [⏸️]    [⏩]         │
│                                 │
└─────────────────────────────────┘
```

---

## 4. Features Detail

### 4.1 Playback Controls

| Control | Action | Gesture |
|---------|--------|---------|
| Play/Pause | Toggle playback | Tap center / Double tap |
| Skip +15s | Forward 15 seconds | Tap right control |
| Skip -15s | Back 15 seconds | Tap left control |
| Seek | Jump to position | Drag progress bar |
| Speed | Change playback rate | Tap speed button |

### 4.2 Transcript Features

| Feature | Description |
|---------|-------------|
| Auto-scroll | Script tự cuộn theo audio |
| Highlight | Từ đang phát được highlight |
| Tap word | Tra từ điển popup |
| Long press | Save sentence to bookmarks |
| Swipe sentence | Repeat that sentence |

### 4.3 A-B Loop

| Feature | Description |
|---------|-------------|
| Set A | Mark start point |
| Set B | Mark end point |
| Loop | Auto-repeat between A-B |
| Clear | Remove loop markers |
| Adjust | Drag markers to adjust |

### 4.4 Background Audio

| Feature | Description |
|---------|-------------|
| Minimize app | Audio continues |
| Lock screen | Controls available |
| Bluetooth | Works with headphones |
| Notification | Persistent player notification |
| Auto-pause | Pause on call/another audio |

### 4.5 Offline Support

| Feature | Description |
|---------|-------------|
| Download | Save lesson locally |
| Storage | SQLite + File System |
| Max lessons | 50 lessons (configurable) |
| Auto-download | On WiFi, download new lessons |
| Sync | Upload progress when online |

---

## 5. Technical Implementation

### 5.1 Libraries

```typescript
expo-av                    // Audio playback
@react-native-community/slider // Progress bar
expo-file-system          // Offline storage
expo-media-library        // Background audio
react-native-reanimated   // Waveform animation
```

### 5.2 State Structure

```typescript
interface ListeningState {
  // Config
  config: {
    topic: string;
    duration: number;
    mode: 'podcast' | 'interactive';
    speakers: number;
    keywords?: string[];
  };
  
  // Player
  player: {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    speed: number;
    loopStart?: number;
    loopEnd?: number;
  };
  
  // Content
  content: {
    title: string;
    transcript: TranscriptLine[];
    audioUrl: string;
    isDownloaded: boolean;
  };
}
```

### 5.3 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [Config]  →  [API: Generate]  →  [Cache Audio]  →  [Play]  │
│                    │                   │                    │
│                    └── OpenAI ─────────┘                    │
│                                                             │
│ [Player Events]  →  [Update State]  →  [Update UI]         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Gestures System

| Context | Gesture | Action |
|---------|---------|--------|
| Player | Swipe left | Previous sentence |
| Player | Swipe right | Next sentence |
| Player | Swipe down | Minimize player |
| Player | Double tap | Play/Pause |
| Transcript | Long press | Save bookmark |
| Pocket Mode | Swipe up | Save to bookmarks |

---

## 7. Voice Commands

| Command | Action |
|---------|--------|
| "Next" / "Tiếp theo" | Next sentence |
| "Repeat" / "Lặp lại" | Repeat current |
| "Slower" | Decrease speed |
| "Faster" | Increase speed |
| "Save" / "Lưu" | Bookmark |
| "Pause" / "Play" | Toggle playback |

---

## 8. Implementation Tasks

### MVP Phase
- [ ] Config screen with topic, duration, mode
- [ ] Basic audio player with play/pause/seek
- [ ] Transcript display with auto-scroll
- [ ] Speed control (0.5x - 1.5x)
- [ ] Generate conversation via API

### Enhanced Phase
- [ ] A-B Loop feature
- [ ] Bookmark sentences
- [ ] Offline download
- [ ] Background audio
- [ ] Lock screen controls

### Advanced Phase
- [ ] Interactive mode with recording
- [ ] Pocket mode with gestures
- [ ] Voice commands
- [ ] Radio mode (playlists)

---

## 9. Related Documents

- [00_Mobile_Overview.md](../00_Mobile_Overview.md) - Project overview
- [10_Native_Features.md](10_Native_Features.md) - Gestures, Voice commands
- [09_Special_Modes.md](09_Special_Modes.md) - Pocket mode, Car mode
- [Architecture.md](../technical/Architecture.md) - Audio handling
