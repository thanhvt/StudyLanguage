# 13. Lock Screen & Notification Controls

> **Status:** 🟡 Planned  
> **Priority:** P1  
> **Dependencies:** `09_BackgroundAudio.md`, `react-native-track-player`  
> **Affects:** Tất cả passive features (Audio Drill, Auto-Listen, Auto Shadow)

---

## 1. Overview

Lock Screen Controls cho phép user điều khiển passive session từ **màn hình khóa** và **notification tray** mà không cần mở app — giống cách Spotify, Podcast hiển thị media controls.

### Tại sao là P1?

- User đi đường = **điện thoại trong túi** = cần controls mà không cần unlock
- Không có lock screen controls = phải mở app mỗi lần muốn pause/skip
- iOS/Android user **đã quen** với media controls → UX tự nhiên

---

## 2. Platform Capabilities

### 2.1 iOS — MPNowPlayingInfoCenter

```typescript
// TrackPlayer đã tự handle thông qua MPRemoteCommandCenter
// Chỉ cần config metadata đúng

// Metadata hiển thị trên Lock Screen & Control Center
const nowPlayingInfo = {
  title: 'Audio Drill — Câu 3/10',           // Dòng chính
  artist: 'StudyLanguage Speaking',            // Dòng phụ
  artwork: 'speaking_icon.png',                // Icon
  duration: estimatedDuration,                  // Tổng thời lượng ước tính
  elapsedPlaybackTime: currentProgress,         // Tiến độ
};
```

**Lock Screen UI (iOS):**
```
┌──────────────────────────────────────┐
│  🎧 Audio Drill — Câu 3/10          │
│  StudyLanguage Speaking              │
│                                      │
│  ─────────●──────────────────        │  ← Progress bar
│  01:23                        05:00  │
│                                      │
│       ⏮️     ▶️/⏸️     ⏭️           │  ← Remote controls
│     Repeat   Play/Pause  Skip       │
└──────────────────────────────────────┘
```

### 2.2 Android — MediaSession + Notification

```typescript
// TrackPlayer tự tạo Foreground Service notification
// Config trong playbackService.ts

const NOTIFICATION_CONFIG = {
  capabilities: [
    Capability.Play,
    Capability.Pause,
    Capability.SkipToNext,
    Capability.SkipToPrevious,
    Capability.Stop,
  ],
  compactCapabilities: [
    Capability.Play,
    Capability.Pause,
    Capability.SkipToNext,
  ],
  // Custom notification
  icon: require('../assets/speaking_icon.png'),
  color: '#4CAF50',  // Speaking accent color
};
```

**Android Notification:**
```
┌──────────────────────────────────────┐
│  🎧 StudyLanguage                     │
│  Audio Drill — Câu 3/10              │
│  "The weather is quite nice today"   │
│                                      │
│     ⏮️     ⏸️     ⏭️     ✕          │
│   Repeat  Pause  Skip   Stop       │
└──────────────────────────────────────┘
```

---

## 3. Remote Control Actions

### 3.1 Action Mapping

| Remote Event | Audio Drill | Auto-Listen | Auto Shadow |
|---|---|---|---|
| **Play** | Resume loop | Resume conversation | Resume shadow loop |
| **Pause** | Pause at current phase | Pause + mute mic | Pause at current phase |
| **Skip Next (⏭️)** | Skip to next sentence | — (không áp dụng) | Skip to next sentence |
| **Skip Previous (⏮️)** | Repeat current sentence | AI repeat câu cuối | Repeat current sentence |
| **Stop** | End session → summary | End conversation → summary | End session → summary |

### 3.2 Implementation

```typescript
/**
 * Mục đích: Xử lý remote control events cho passive sessions
 * Tham số đầu vào: event (RemoteEvent)
 * Tham số đầu ra: void
 * Khi nào: Khi user tương tác từ lock screen / notification
 */

// Trong playbackService.ts — mở rộng existing service
TrackPlayer.addEventListener(Event.RemotePause, async () => {
  const activeSession = getActivePassiveSession();
  if (activeSession) {
    activeSession.pause();
    // Cập nhật notification metadata
    await updateNowPlayingState('paused');
  }
});

TrackPlayer.addEventListener(Event.RemotePlay, async () => {
  const activeSession = getActivePassiveSession();
  if (activeSession) {
    activeSession.resume();
    await updateNowPlayingState('playing');
  }
});

TrackPlayer.addEventListener(Event.RemoteNext, async () => {
  const activeSession = getActivePassiveSession();
  if (activeSession?.type !== 'autoListen') {
    activeSession?.skipToNext();
    await updateNowPlayingMetadata(activeSession);
  }
});

TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
  const activeSession = getActivePassiveSession();
  if (activeSession) {
    activeSession.repeatCurrent();
    await updateNowPlayingMetadata(activeSession);
  }
});

TrackPlayer.addEventListener(Event.RemoteStop, async () => {
  const activeSession = getActivePassiveSession();
  if (activeSession) {
    activeSession.end();
    await TrackPlayer.reset();
  }
});
```

---

## 4. Dynamic Metadata Updates

Lock screen metadata phải cập nhật theo context:

### 4.1 Audio Drill

| Phase | Title | Subtitle |
|-------|-------|----------|
| `SPEAKING_SENTENCE` | 🔊 Đang đọc câu 3/10 | "The weather is quite nice..." |
| `RECORDING` | 🎤 Đang ghi âm... | "Hãy nhại theo câu vừa nghe" |
| `EVALUATING` | ⏳ Đang chấm điểm... | "Câu 3/10" |
| `SPEAKING_RESULT` | 📊 85 điểm — Khá tốt! | "Câu tiếp theo..." |
| `PAUSED` | ⏸ Tạm dừng | "Câu 3/10 — Tap ▶️ để tiếp tục" |

### 4.2 Auto-Listen (AI Conversation)

| Phase | Title | Subtitle |
|-------|-------|----------|
| `AI_SPEAKING` | 🤖 AI đang nói... | Preview câu AI |
| `LISTENING` | 🎤 Đang nghe bạn | "Nói xong sẽ tự chuyển" |
| `PROCESSING` | ⏳ Đang xử lý... | "AI Conversation" |

### 4.3 Auto Shadow

| Phase | Title | Subtitle |
|-------|-------|----------|
| `PREVIEW_PLAY` | 👂 Nghe mẫu — Câu 5/15 | Preview câu |
| `SHADOW_PLAY_RECORD` | 🎵 Shadow! — Nhại theo | "Nói theo AI" |
| `SPEAKING_RESULT` | 📊 R78 I85 A90 = 84 | Result |

### 4.4 Update Function

```typescript
/**
 * Mục đích: Cập nhật metadata trên lock screen / notification
 * Tham số đầu vào: session (PassiveSession), phase (string)
 * Tham số đầu ra: Promise<void>
 * Khi nào: Mỗi khi phase thay đổi trong passive loop
 */
async function updateNowPlayingMetadata(
  session: PassiveSession,
  phase: string
): Promise<void> {
  const meta = generatePhaseMetadata(session, phase);
  
  await TrackPlayer.updateNowPlayingMetadata({
    title: meta.title,
    artist: meta.subtitle,
    artwork: meta.artwork || DEFAULT_ARTWORK,
    duration: meta.estimatedDuration,
    elapsedPlaybackTime: meta.elapsed,
  });
}
```

---

## 5. Bluetooth Headphone Controls

Nhiều BT headphones có nút vật lý:

| Button | Tap | Double Tap | Long Press |
|--------|-----|------------|------------|
| Center/Play | Play/Pause | Skip Next | Stop |
| Vol+ | — | — | — |
| Vol- | — | — | — |

→ TrackPlayer tự handle mapping này qua `MPRemoteCommandCenter` (iOS) và `MediaSession` (Android).

### AirPods Specific

| Gesture | Action |
|---------|--------|
| Squeeze 1x | Play/Pause |
| Squeeze 2x | Skip Next |
| Squeeze 3x | Skip Previous |
| Squeeze & hold | Siri (không can thiệp) |

---

## 6. Notification Sound & Haptic

| Event | Sound | Haptic |
|-------|-------|--------|
| Session bắt đầu | Short chime | Light |
| Phase change (beep) | Beep âm | — |
| Score ≥ 85 | — | Success |
| Score < 70 | — | Warning |
| Session pause | — | Light |
| Session hoàn thành | Completion chime | Heavy |

---

## 7. Files to Create/Modify

### Modified Files

| File | Thay đổi |
|------|----------|
| `src/services/audio/trackPlayerService.ts` | Thêm remote event handlers cho passive |
| `src/services/audio/playbackService.ts` | Cập nhật capabilities config |

### New Files

| File | Mô tả |
|------|--------|
| `src/services/audio/nowPlayingService.ts` | Dynamic metadata updates |
| `src/utils/passiveSessionManager.ts` | Central manager cho active passive session |

---

## 8. Edge Cases

| Case | Xử lý |
|------|-------|
| 2 passive sessions cùng lúc | Không cho phép — 1 session tại 1 thời điểm |
| Notification bị dismiss (Android) | Session vẫn chạy, notification tự rebuild |
| Do Not Disturb mode | Notification media vẫn hiện (not affected) |
| CarPlay / Android Auto | TrackPlayer tự support (chưa test) |
| Watch (Apple Watch / WearOS) | Tự hiện media controls (TrackPlayer handles) |

---

## 9. Implementation Phases

### Phase 1: Core Controls (2-3 ngày)
- [ ] Remote event handlers (Play/Pause/Next/Previous/Stop)
- [ ] `passiveSessionManager.ts` — session registry
- [ ] `nowPlayingService.ts` — metadata updates

### Phase 2: Dynamic Metadata (1-2 ngày)
- [ ] Phase-specific metadata cho mỗi passive mode
- [ ] Progress tracking (elapsed time)
- [ ] Artwork/icon

### Phase 3: Testing (2 ngày)
- [ ] iOS Lock Screen + Control Center
- [ ] Android Notification + Lock Screen
- [ ] Bluetooth headphone buttons
- [ ] AirPods gestures

---

## 10. Tài liệu liên quan

- [09_BackgroundAudio.md](09_BackgroundAudio.md) — Background audio foundation
- [08_AudioDrill.md](08_AudioDrill.md) — Uses lock screen controls
- [10_AutoListenMode.md](10_AutoListenMode.md) — Uses lock screen controls
- [12_ShadowingAutoMode.md](12_ShadowingAutoMode.md) — Uses lock screen controls
