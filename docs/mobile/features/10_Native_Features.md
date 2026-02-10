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
| **Notifications** | Push & local notifications |
| **Background Audio** | Play when app minimized |
| **Haptic Feedback** | Touch vibration |
| **Offline Mode** | Work without network |

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
@react-native-voice/voice  // Offline fallback

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

## 5. Notifications 🔔

### 5.1 Push Notification Types

| Type | Timing | Content | Action |
|------|--------|---------|--------|
| **Daily Reminder** | 19:00 | "Sẵn sàng học chưa? 💪" | Open app |
| **Streak Warning** | 21:00 | "2 giờ nữa mất streak! 🔥" | Open app |
| **Achievement** | Instant | "🎉 7 ngày liên tục!" | Open profile |
| **Review Reminder** | 10:00 | "15 từ cần ôn hôm nay" | Open vocab |
| **Weekly Tip** | Sunday | "Mẹo: Luyện phát âm mỗi ngày" | Open tip |

### 5.2 Notification UI

```
┌─────────────────────────────────┐
│ 📚 StudyLanguage                │
│ Đừng quên học hôm nay! 💪       │
│ Bạn đang giữ streak 7 ngày     │
│                                 │
│ [Bắt đầu ngay]      [Nhắc sau]  │
└─────────────────────────────────┘
```

### 5.3 Rich Notifications (iOS)

```
┌─────────────────────────────────┐
│ 📚 StudyLanguage        now    │
├─────────────────────────────────┤
│ 💡 Word of the Day              │
│                                 │
│ Serendipity                     │
│ /ˌser.ənˈdɪp.ə.ti/              │
│ May mắn bất ngờ                 │
│                                 │
│ [🔊 Pronounce] [💾 Save] [Open] │
└─────────────────────────────────┘
```

### 5.4 Notification Settings

| Setting | Options |
|---------|---------|
| Daily Reminder | Time picker |
| Streak Warning | ON/OFF |
| Achievements | ON/OFF |
| Review Reminders | Time picker |
| Quiet Hours | Time range |

### 5.5 Local Notifications

| Type | Trigger | Content |
|------|---------|---------|
| Download complete | After download | "Bài học đã tải xong" |
| Storage warning | Storage > 80% | "Dung lượng sắp đầy" |
| Session complete | After lesson | "Chúc mừng! +10 XP" |

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

## 8. Offline Mode 📴

### 8.1 Offline Capabilities

| Feature | Offline Support |
|---------|-----------------|
| Play downloaded lessons | ✅ Full |
| View history | ✅ Cached |
| Review saved words | ✅ Full |
| Read saved articles | ✅ Full |
| Generate new content | ❌ Requires network |
| Speaking practice | ❌ Requires AI |
| Sync progress | ⏳ Queued for sync |

### 8.2 Download Manager

```
┌─────────────────────────────────┐
│  📥 Downloaded Lessons      ⚙️  │
├─────────────────────────────────┤
│                                 │
│  Auto-download on WiFi: [ON]    │
│  Max storage: 500 MB            │
│                                 │
├─────────────────────────────────┤
│                                 │
│  ✅ Coffee Shop Talk    (15 MB) │
│  ✅ Tech Interview      (12 MB) │
│  ⏳ Airport Guide        (8 MB) │
│     Downloading... 45%          │
│  ☐ Climate Change       (10 MB) │
│                                 │
│  ───────────────────────────── │
│  Storage: 35 MB / 500 MB        │
│  [████░░░░░░░░░░░░░░░░]         │
│                                 │
│  [Download All Starred]         │
│                                 │
└─────────────────────────────────┘
```

### 8.3 Offline Indicator

```
┌─────────────────────────────────┐
│  ⚠️ Offline Mode                │
│                                 │
│  Một số tính năng bị giới hạn:  │
│  • Không thể tạo bài mới        │
│  • Không thể luyện nói         │
│                                 │
│  Bạn vẫn có thể:                │
│  ✅ Nghe bài đã download        │
│  ✅ Xem từ đã lưu              │
│  ✅ Đọc bài đã lưu              │
│                                 │
│        [Thử kết nối lại]        │
│                                 │
└─────────────────────────────────┘
```

### 8.4 Sync Queue

| Status | Behavior |
|--------|----------|
| Online | Sync immediately |
| Offline | Queue locally |
| Back online | Sync pending items |
| Conflict | Latest timestamp wins |

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
| Push notification | studylanguage://history/saved-words | Open saved words |
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
@react-native-voice/voice   // Speech recognition (online + offline)

// Widgets (iOS)
react-native-widget-extension

// Notifications
notifee                     // Local & rich notifications
@react-native-firebase/messaging // Remote push

// Background Audio
react-native-track-player   // Playback + lock screen controls

// Haptics
react-native-haptic-feedback

// Offline
@react-native-async-storage/async-storage
react-native-fs             // File system access
react-native-sqlite-storage // SQLite database

// Deep Linking
React Native Linking (built-in) // No extra lib needed
```

---

## 11. Implementation Tasks

### Enhanced Phase
- [ ] Gesture system implementation
- [ ] Voice command recognition
- [ ] Push notifications setup
- [ ] Background audio player
- [ ] Haptic feedback integration
- [ ] Offline download manager

### Advanced Phase
- [ ] iOS widgets
- [ ] Android widgets
- [ ] Voice wake word
- [ ] Deep linking
- [ ] Rich notifications
- [ ] Lock screen controls

---

## 12. Related Documents

- [00_Mobile_Overview.md](../00_Mobile_Overview.md) - Project overview
- [02_Listening.md](02_Listening.md) - Player gestures
- [07_History.md](07_History.md) - Saved words
- [09_Special_Modes.md](09_Special_Modes.md) - Voice commands
