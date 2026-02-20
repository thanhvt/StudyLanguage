# 📱 Native Features - Mobile

> **Module:** Native Mobile Features  
> **Priority:** P1-P2 (Enhanced → Advanced)  
> **Phase:** Enhanced → Advanced

---

## 1. Overview

Các tính năng đặc thù mobile platform, tận dụng hardware và OS capabilities.

### 1.1 Feature Categories

| Category | Description |
|----------|-------------|
| **Gestures** | Swipe, pinch, long-press |
| **Voice Commands** | Hands-free control |
| **Widgets** | Home screen widgets |
| **Background Audio** | Play when app minimized |
| **Haptic Feedback** | Touch vibration |

---

## 2. Gestures System 👆

### 2.1 Global Gestures

| Gesture | Context | Action |
|---------|---------|--------|
| Pull down | Any list | Refresh |
| Swipe from edge | Navigation | Go back |
| Long press | List item | Show options |

### 2.2 Player Gestures

| Gesture | Action |
|---------|--------|
| Swipe left | Previous sentence |
| Swipe right | Next sentence |
| Swipe down | Minimize player |
| Double tap | Play/Pause |
| Long press sentence | Save bookmark |


### 2.4 Reading Gestures

| Gesture | Action |
|---------|--------|
| Tap word | Dictionary popup |
| Long press word | Highlight + save |
| Pinch | Zoom text |
| Swipe up | Scroll |

### 2.5 Gesture Visual Feedback

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Swipe Right Animation:                                     │
│  ┌─────────────────┐    →    ┌─────────────────┐           │
│  │     CARD        │   ───►  │     CARD        │ (flies off)│
│  │                 │         │  ✅ KNEW IT      │           │
│  └─────────────────┘         └─────────────────┘           │
│                                                             │
│  Visual: Card rotates + slides out                         │
│  Haptic: Light impact on complete                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.6 Speaking Gestures (NEW ✨)

| Gesture | Context | Action |
|---------|---------|--------|
| Long press mic | Speaking screen | Bắt đầu ghi âm |
| Release mic | Speaking screen | Dừng ghi âm |
| Swipe up | Đang ghi âm | Hủy recording |
| Tap word | Practice screen | Hiện IPA + audio |
| Tap "Luyện âm" | Feedback screen | Navigate đến practice âm yếu |

**Haptic patterns mới:**

| Event | Haptic Type |
|-------|-------------|
| Badge unlock | Heavy impact + success notification |
| Confetti trigger (score ≥90) | Success notification |
| Countdown tick | Selection (mỗi số) |
| Swipe-to-cancel confirm | Warning notification |

---

## 3. Voice Commands 🎤

### 3.1 Wake Word
- **"Hey Study"** hoặc **"OK Study"**

### 3.2 Global Commands

| Command (EN) | Command (VN) | Action |
|--------------|--------------|--------|
| "Next" | "Tiếp theo" | Next item |
| "Repeat" | "Lặp lại" | Repeat current |
| "Pause" | "Dừng" | Pause playback |
| "Play" | "Phát" | Resume playback |
| "Save" | "Lưu" | Bookmark current |
| "Home" | "Trang chủ" | Go to home |

### 3.3 Player Commands

| Command | Action |
|---------|--------|
| "Slower" | Decrease speed |
| "Faster" | Increase speed |
| "Volume up/down" | Adjust volume |
| "Skip" | Skip current |

### 3.4 Dictionary Commands

| Command | Action |
|---------|--------|
| "What does [word] mean?" | Lookup word |
| "Translate [word]" | Translate |
| "Pronounce [word]" | Play pronunciation |

### 3.5 Voice Recognition

```typescript
// Libraries
@react-native-voice/voice  // Speech recognition
@react-native-voice/voice  // Speech recognition

// Flow
[Wake word detected] → [Listen] → [Process] → [Execute] → [Confirm]
```

### 3.6 Voice Feedback

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  User: "Hey Study, next"                                    │
│                                                             │
│  App: [Haptic] + [Moves to next] + "Next sentence"         │
│                                                             │
│  Visual: Brief toast notification                           │
│  Audio: Confirmation beep (optional)                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Widgets 🔲

### 4.1 iOS Widgets

#### Small Widget (2x2)
```
┌──────────────────┐
│ StudyLanguage    │
│ 🔥 Streak: 7     │
│ 📚 156 words     │
│ [Tap to open]    │
└──────────────────┘
```

#### Medium Widget (4x2)
```
┌────────────────────────────────┐
│ StudyLanguage      🔥 7 days   │
│ ───────────────────────────── │
│ 💡 Word of the Day:            │
│ "Serendipity" - May mắn bất ngờ│
│ ───────────────────────────── │
│ [Continue lesson → ]           │
└────────────────────────────────┘
```

#### Large Widget (4x4)
```
┌────────────────────────────────┐
│ StudyLanguage      🔥 7 days   │
│ ───────────────────────────── │
│ 💡 Word of the Day:            │
│ "Serendipity"                  │
│ /ˌser.ənˈdɪp.ə.ti/             │
│ May mắn bất ngờ                │
│ ───────────────────────────── │
│ 📊 This Week                   │
│ M  T  W  T  F  S  S           │
│ ●  ●  ●  ●  ○  ○  ○           │
│ ───────────────────────────── │
│ [Continue lesson]              │
└────────────────────────────────┘
```

### 4.2 Android Widgets

Similar to iOS but with more customization options:
- Resizable
- Live data updates (30 min interval)
- Theme follows system

### 4.3 Widget Actions

| Widget Element | Tap Action |
|----------------|------------|
| Streak | Open Profile |
| Word of Day | Open History (Saved Words) |
| Continue | Resume last lesson |
| Word count | Open History (Saved Words) |

---

---

## 6. Background Audio 🎵

### 6.1 Capabilities

| Feature | Description |
|---------|-------------|
| Continue when minimized | Audio plays when app in background |
| Lock screen controls | Play/Pause/Next from lock screen |
| Bluetooth support | Works with headphones, car audio |
| Audio focus | Handle interruptions (calls, other apps) |

### 6.2 Lock Screen Player

```
┌─────────────────────────────────┐
│           🔒 Locked             │
├─────────────────────────────────┤
│                                 │
│  📚 StudyLanguage               │
│  Coffee Shop Dialogue           │
│                                 │
│  ────●────────────── 5:30/15:00│
│                                 │
│     [⏪]    [⏸️]    [⏩]         │
│                                 │
└─────────────────────────────────┘
```

### 6.3 Notification Player (Android)

```
┌─────────────────────────────────┐
│ 📚 StudyLanguage        ongoing│
│ Coffee Shop Dialogue            │
│ ────●─────────── 5:30          │
│ [⏪]    [⏸️]    [⏩]    [✕]     │
└─────────────────────────────────┘
```

### 6.4 Audio Interruption Handling

| Interruption | Behavior | Auto-Resume? |
|--------------|----------|:---:|
| Incoming/outgoing call | Pause hoàn toàn | ✅ Sau khi kết thúc |
| Video/Music app khác phát | Pause hoàn toàn | ✅ Khi app khác dừng |
| Navigation app (Maps) | Duck volume 30% | ✅ Tự khôi phục volume |
| Notification sound | Duck volume 50% | ✅ Tự khôi phục volume |
| Siri / Google Assistant | Pause hoàn toàn | ✅ Sau khi kết thúc |
| Headphones unplugged | Pause | ❌ Người dùng bấm play |
| Bluetooth connected | Tiếp tục phát | — |
| App bị kill bởi OS | Dừng hẳn | ❌ Cần mở lại app |

#### Background Playback Requirements

```
Khi người dùng đang nghe passive listening và rời khỏi app:

✅ Âm thanh TIẾP TỤC PHÁT khi:
   • Minimize app (Home button / swipe up)
   • Chuyển sang app khác (multitasking)
   • Tắt màn hình (lock screen)

⏸️ Âm thanh TẠM DỪNG + TỰ BẬT LẠI khi:
   • Có cuộc gọi đến → kết thúc cuộc gọi → phát lại
   • App khác phát nhạc → app khác dừng → phát lại
   • Siri/Assistant kích hoạt → kết thúc → phát lại

⏸️ Âm thanh TẠM DỪNG + KHÔNG tự bật khi:
   • Rút tai nghe (an toàn, tránh phát qua loa ngoài)
```

#### Platform Implementation

| Platform | Mechanism | Library |
|----------|-----------|---------|
| **iOS** | `AVAudioSession` category `.playback` + `UIBackgroundModes: audio` | `react-native-track-player` |
| **Android** | `MediaSession` + Foreground Service + `AudioFocus` | `react-native-track-player` |

> **Note:** `react-native-track-player` xử lý hầu hết audio focus tự động qua native layer. Chỉ cần cấu hình đúng capabilities khi setup.

### 6.5 Background Music (NEW ✨)

Nhạc nền Lofi/Chill du dương chạy song song với bài học — feature parity với web-v2.

#### Nguyên tắc Mobile

| Đặc điểm | Mô tả |
|-----------|--------|
| **Chỉ in-app controls** | Không hiện trên lock screen — lock screen chỉ dành cho lesson audio |
| **Tách biệt audio** | Music dùng `Audio` API riêng, lesson dùng `react-native-track-player` |
| **Smart Ducking** | Tự giảm volume 80% khi lesson audio đang phát |
| **Persist state** | Lưu volume, track, playing state vào MMKV |
| **Auto-pause** | Dừng khi app bị kill hoặc rút tai nghe |

#### Danh sách nhạc (từ Pixabay — Free, no attribution)

| # | Track Name | Style |
|---|-----------|-------|
| 1 | Good Night Lofi | Chill, sleepy |
| 2 | Lofi Study Chill | Study vibes |
| 3 | Tactical Pause Lofi | Calm focus |
| 4 | Relax Lofi Beat | Relaxing |
| 5 | Lofi Girl Ambient | Ambient |
| 6 | Lofi Chill Background | Background |
| 7 | Lofi Instrumental | Instrumental |
| 8 | Lofi Girl Chill | Soft chill |

> 💡 Tracks được bundle sẵn trong app hoặc stream từ CDN (Pixabay URLs).

#### In-App Music Controls UI

```
┌─────────────────────────────────┐
│  🎵 Nhạc nền                    │
├─────────────────────────────────┤
│                                 │
│  🎵 Lofi Study Chill     ▶️     │
│  ────────●────────── Vol: 30%  │
│                                 │
│  [⏮️ Prev] [⏯️ Play] [⏭️ Next]  │
│  [🔀 Shuffle]                   │
│                                 │
│  🔉 Smart Ducking        [ON]   │
│  Tự giảm nhạc khi AI nói       │
│                                 │
└─────────────────────────────────┘
```

**Vị trí UI:** Trong Audio Settings (`08_Profile_Settings.md`) hoặc mini player widget trên Dashboard.

#### State Structure

```typescript
interface BackgroundMusicState {
  // Trạng thái phát nhạc nền
  isPlaying: boolean;
  volume: number; // 0.0 - 1.0, default 0.3
  currentTrackIndex: number;
  
  // Smart Ducking: giảm volume khi lesson audio phát
  isDucking: boolean;
  smartDuckingEnabled: boolean; // default true
  
  // Danh sách tracks
  tracks: {
    id: string;
    name: string;
    url: string;
  }[];
}
```

#### So sánh Web vs Mobile

| Feature | Web-v2 | Mobile |
|---------|:------:|:------:|
| Track list (8 Lofi) | ✅ | ✅ |
| Play/Pause/Next/Prev/Shuffle | ✅ | ✅ |
| Volume control | ✅ | ✅ |
| Smart Ducking | ✅ | ✅ |
| Persist state | ✅ localStorage | ✅ MMKV |
| Lock screen controls | N/A (web) | ❌ **Không** (chỉ lesson audio) |
| Sidebar controls | ✅ | ❌ → In-app widget |
| Loop single track | ✅ | ✅ |

---

## 7. Haptic Feedback 📳

### 7.1 Haptic Patterns

| Event | Haptic Type | When |
|-------|-------------|------|
| Button tap | Light impact | Any button |
| Toggle switch | Selection | Toggle change |
| Correct answer | Success | Quiz correct |
| Wrong answer | Error | Quiz wrong |
| Achievement | Heavy impact | Unlock badge |
| Recording start | Medium impact | Begin recording |
| Recording end | Light impact | Stop recording |

| Long press | Selection | Context menu |

### 7.2 Implementation

```typescript
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

// Nhẹ tap
ReactNativeHapticFeedback.trigger('impactLight');

// Thành công
ReactNativeHapticFeedback.trigger('notificationSuccess');

// Lỗi
ReactNativeHapticFeedback.trigger('notificationError');

// Selection
ReactNativeHapticFeedback.trigger('selection');
```

### 7.3 Settings

| Setting | Options |
|---------|---------|
| Haptic Feedback | ON/OFF |
| Intensity | Light/Medium/Strong |

---



## 9. Deep Linking 🔗

### 9.1 URL Scheme

```
studylanguage://                      # Open app
studylanguage://listening             # Open Listening
studylanguage://listening/123         # Open specific lesson
studylanguage://history/saved-words   # Open Saved Words
studylanguage://profile               # Open Profile
```

### 9.2 Universal Links

```
https://studylanguage.app/lesson/123  # Open lesson
https://studylanguage.app/share/abc   # Shared content
```

### 9.3 Use Cases

| Source | Link | Action |
|--------|------|--------|
| Notification tap | studylanguage://history/saved-words | Open saved words |
| Widget | studylanguage://listening | Open Listening |
| Share | https://studylanguage.app/... | Open shared |

---

## 10. Technical Implementation

### 10.1 Libraries

```typescript
// Gestures
react-native-gesture-handler
react-native-reanimated

// Voice
@react-native-voice/voice   // Speech recognition

// Widgets (iOS)
react-native-widget-extension

// Background Audio
react-native-track-player   // Playback + lock screen controls

// Haptics
react-native-haptic-feedback

// Storage
react-native-mmkv            // Fast key-value storage
react-native-fs             // File system access

// Deep Linking
React Native Linking (built-in) // No extra lib needed
```

---

## 11. Implementation Tasks

### Enhanced Phase
- [ ] Gesture system implementation
- [ ] **Speaking gestures** (swipe-to-cancel, countdown haptic, tap-to-pronounce) (NEW ✨)
- [ ] Voice command recognition
- [ ] **Android notification player** (foreground service MediaSession) (NEW ✨)
- [ ] Background audio player
- [ ] **Background Music** (Lofi tracks, in-app controls, smart ducking, persist) (NEW ✨)
- [ ] **Audio interruption handling** (ducking, pause/resume per source) (NEW ✨)
- [ ] Haptic feedback integration

### Advanced Phase
- [ ] iOS widgets
- [ ] Android widgets
- [ ] Voice wake word
- [ ] Deep linking
- [ ] Lock screen controls

---

## 12. Related Documents

- [00_Mobile_Overview.md](../00_Mobile_Overview.md) - Project overview
- [02_Listening.md](02_Listening.md) - Player gestures
- [07_History.md](07_History.md) - Saved words
- [09_Special_Modes.md](09_Special_Modes.md) - Voice commands
