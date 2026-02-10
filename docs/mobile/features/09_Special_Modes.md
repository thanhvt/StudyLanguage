# 🚗 Special Modes Feature - Mobile

> **Module:** Special Modes  
> **Priority:** P2 (Advanced)  
> **Phase:** Advanced

---

## 1. Overview

Các chế độ đặc biệt tối ưu cho ngữ cảnh sử dụng cụ thể.

### 1.1 Available Modes

| Mode | Description | Auto-trigger |
|------|-------------|--------------|
| **Car Mode** | Lái xe an toàn, voice-only | Bluetooth + GPS |
| **Bedtime Mode** | Trước khi ngủ, OLED-dark | Manual |
| **Workout Mode** | Tập gym/chạy bộ | Manual |
| **Pocket Mode** | Đi bộ, không nhìn màn hình | Motion sensor |

---

## 2. Car Mode 🚗

### 2.1 Overview
Chế độ an toàn khi lái xe, 100% voice control, không cần nhìn màn hình.

### 2.2 Auto-Activation Triggers

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Trigger 1: Bluetooth Connection                            │
│  └─ Connect to car Bluetooth → Prompt to enable            │
│                                                             │
│  Trigger 2: Speed Detection                                 │
│  └─ GPS speed > 30 km/h → Suggest Car Mode                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 UI Mockup

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│         🚗                      │
│      CAR MODE                   │
│                                 │
│   "Say 'Next' for next lesson" │
│                                 │
│      🎧 Now Playing:            │
│    Coffee Shop Dialogue         │
│         ▶️ Playing              │
│                                 │
│                                 │
│    Say: "Hey Study" to command │
│                                 │
│                                 │
│      [Exit Car Mode]            │
│                                 │
└─────────────────────────────────┘
```

**Specs:**
- Black background (OLED)
- Minimal UI
- Large text for glance reading
- Exit button at bottom

### 2.4 Voice Commands (Car Mode)

| Command | Action |
|---------|--------|
| "Next" / "Tiếp" | Next lesson/sentence |
| "Repeat" / "Lặp lại" | Repeat current |
| "Pause" / "Dừng" | Pause playback |
| "Resume" / "Tiếp tục" | Resume playback |
| "Volume up" | Increase volume |
| "Volume down" | Decrease volume |
| "Exit" / "Thoát" | Exit car mode |

### 2.5 Features

| Feature | Description |
|---------|-------------|
| Voice-only control | No touch needed while driving |
| Large audio controls | Big buttons if user needs to tap |
| Auto-volume | Adjust based on ambient noise |
| Listening only | Speaking disabled for safety |
| Screen off | Option to turn off screen completely |

---

## 3. Bedtime Mode 🌙

### 3.1 Overview
Chế độ học trước khi ngủ, giảm ánh sáng xanh, âm thanh nhẹ nhàng.

### 3.2 Activation
- Manual toggle từ Quick Settings hoặc Player

### 3.3 UI Mockup

```
┌─────────────────────────────────┐
│ [Black background - OLED off]  │
│                                 │
│         🌙                      │
│    BEDTIME MODE                 │
│                                 │
│    Now listening:               │
│    Gentle Conversation          │
│                                 │
│    ────●────────────── 5:30     │
│                                 │
│    Sleep timer: 15 min left     │
│                                 │
│                                 │
│                                 │
│                                 │
│      [Exit Bedtime Mode]        │
│                                 │
└─────────────────────────────────┘

* Text color: Warm amber/red
* No bright whites
* Minimal screen brightness
```

### 3.4 Features

| Feature | Description |
|---------|-------------|
| OLED Black | True black background |
| Amber text | No blue light |
| Whisper AI | Softer voice |
| Sleep timer | 15/30/45/60 min |
| Fade out | Volume decreases last 5 min |
| Auto-stop | Stop after timer |
| Ambient sounds | Optional nature sounds at end |

### 3.5 Sleep Timer Options

```
┌─────────────────────────────────┐
│         Sleep Timer             │
├─────────────────────────────────┤
│                                 │
│    ⏱️ Stop playing after:       │
│                                 │
│   [15 min] [30 min] [45 min]   │
│            [60 min]             │
│                                 │
│   🔉 Fade out in last 5 min     │
│   [ON]                          │
│                                 │
│   🎵 Play ambient after:        │
│   [None] [Rain] [Ocean] [Forest]│
│                                 │
│        [Start Timer]            │
│                                 │
└─────────────────────────────────┘
```

---

## 4. Workout Mode 💪

### 4.1 Overview
Chế độ tập thể dục, hands-free, bài học ngắn.

### 4.2 Activation
- Manual toggle từ Quick Settings

### 4.3 UI Mockup

```
┌─────────────────────────────────┐
│  💪 WORKOUT MODE            ❌  │
├─────────────────────────────────┤
│                                 │
│     🎧 Listening                │
│                                 │
│     Quick English Tips          │
│     Episode 5/10                │
│                                 │
│     ──────●───────── 3:24       │
│                                 │
│                                 │
│   ┌───────────────────────┐    │
│   │                       │    │
│   │      ⏸️  PAUSE        │    │
│   │                       │    │
│   └───────────────────────┘    │
│                                 │
│   [⏮️ Prev]        [⏭️ Next]   │
│                                 │
│   🎤 Voice: "Next" "Repeat"    │
│                                 │
└─────────────────────────────────┘
```

**Specs:**
- XL buttons (sweat-proof interaction)
- High contrast colors
- Simple controls
- Voice commands enabled

### 4.4 Features

| Feature | Description |
|---------|-------------|
| XL Touch Targets | 80px+ buttons |
| High Contrast | Easy to see |
| Short Lessons | 5-10 min episodes |
| Voice Control | Hands-free |
| Swipe Gestures | Large swipe areas |
| Auto-playlist | Continuous play |

### 4.5 Content for Workout

| Type | Duration | Style |
|------|----------|-------|
| Quick Tips | 3-5 min | Fast-paced vocabulary |
| Podcast Lite | 5-10 min | Short conversations |
| Motivation | 3 min | Inspiring quotes |

---

## 5. Pocket Mode 📱

### 5.1 Overview
Chế độ khi điện thoại trong túi/không nhìn màn hình, chỉ dùng gestures.

### 5.2 Auto-Activation

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Trigger: Proximity sensor + Motion detection              │
│                                                             │
│  Phone in pocket + Walking → Auto-enable Pocket Mode       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 UI Mockup

```
┌─────────────────────────────────┐
│ [Completely black screen]       │
│                                 │
│                                 │
│                                 │
│                                 │
│    Currently playing:           │
│    Coffee Shop Talk             │
│                                 │
│                                 │
│                                 │
│                                 │
│    ← Previous    Next →        │
│    ↑ Bookmark                   │
│    Double-tap: Play/Pause       │
│                                 │
└─────────────────────────────────┘

* Minimal text (only when tapped)
* Full screen gesture zones
```

### 5.4 Gesture Controls

```
┌─────────────────────────────────┐
│                                 │
│  ┌─────────────────────────┐   │
│  │     SWIPE LEFT          │   │
│  │   Previous sentence     │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │     SWIPE RIGHT         │   │
│  │    Next sentence        │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │     SWIPE UP            │   │
│  │   Save bookmark         │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │     DOUBLE TAP          │   │
│  │    Play / Pause         │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### 5.5 Features

| Feature | Description |
|---------|-------------|
| Full-screen gestures | No need to look |
| Haptic feedback | Feel the response |
| Black screen | Save battery |
| Voice prompts | Audio confirmation |
| Auto-scroll disable | Prevent accidental |

---

## 6. Mode Settings

### 6.1 Quick Settings Panel

```
┌─────────────────────────────────┐
│         Quick Settings          │
├─────────────────────────────────┤
│                                 │
│  🚗 Car Mode            [OFF]   │
│  └─ Auto-detect: [ON]           │
│                                 │
│  🌙 Bedtime Mode        [OFF]   │
│  └─ Schedule: None              │
│                                 │
│  💪 Workout Mode        [OFF]   │
│                                 │
│  📱 Pocket Mode         [AUTO]  │
│  └─ Sensitivity: Medium         │
│                                 │
└─────────────────────────────────┘
```

### 6.2 Mode Detection Settings

```
┌─────────────────────────────────┐
│  ← Mode Detection           ✓  │
├─────────────────────────────────┤
│                                 │
│  🚗 Car Mode Auto-detect        │
│  ┌─────────────────────────┐   │
│  │ [ON]                    │   │
│  │ • Bluetooth connection  │   │
│  │ • Speed > 30 km/h       │   │
│  └─────────────────────────┘   │
│                                 │
│  📱 Pocket Mode Auto-detect     │
│  ┌─────────────────────────┐   │
│  │ [ON]                    │   │
│  │ Sensitivity:            │   │
│  │ [Low] [Medium] [High]   │   │
│  │            ●            │   │
│  └─────────────────────────┘   │
│                                 │
│  🌙 Bedtime Schedule            │
│  ┌─────────────────────────┐   │
│  │ [OFF]                   │   │
│  │ Time: 22:00             │   │
│  │ Duration: 30 min        │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

## 7. Technical Implementation

### 7.1 Libraries

```typescript
react-native-sensors      // Motion detection (gyro, accel)
react-native-geolocation-service // GPS speed
@react-native-community/blur // Night mode overlay
react-native-haptic-feedback // Gesture feedback
```

### 7.2 Mode Detection Logic

```typescript
// Car mode detection
async function detectCarMode() {
  const isBluetoothConnected = await checkBluetoothCar();
  const speed = await getCurrentSpeed(); // km/h
  
  if (isBluetoothConnected || speed > 30) {
    promptCarMode();
  }
}

// Pocket mode detection  
function detectPocketMode() {
  const { accelerometer, gyroscope, proximity } = useSensors();
  
  // Phone in pocket: proximity close + motion detected
  if (proximity.close && isWalkingMotion(accelerometer)) {
    enablePocketMode();
  }
}
```

### 7.3 State Structure

```typescript
interface SpecialModesState {
  carMode: {
    enabled: boolean;
    autoDetect: boolean;
  };
  
  bedtimeMode: {
    enabled: boolean;
    sleepTimer: number | null; // minutes
    fadeOut: boolean;
    ambientSound: 'none' | 'rain' | 'ocean' | 'forest';
  };
  
  workoutMode: {
    enabled: boolean;
  };
  
  pocketMode: {
    enabled: boolean;
    autoDetect: boolean;
    sensitivity: 'low' | 'medium' | 'high';
  };
}
```

---

## 8. Implementation Tasks

### Advanced Phase
- [ ] Car mode UI
- [ ] Car mode voice commands
- [ ] Bluetooth detection
- [ ] Bedtime mode UI
- [ ] Sleep timer functionality
- [ ] **Ambient sounds** (rain/ocean/forest fade-in at end) (NEW ✨)
- [ ] Workout mode UI
- [ ] **Workout content playlists** (Quick Tips, Podcast Lite, Motivation) (NEW ✨)
- [ ] Pocket mode gestures
- [ ] Motion detection
- [ ] Mode settings screen
- [ ] **Quick Settings Panel UI** (toggle all modes) (NEW ✨)

---

## 9. Related Documents

- [00_Mobile_Overview.md](../00_Mobile_Overview.md) - Project overview
- [02_Listening.md](02_Listening.md) - Audio player integration
- [10_Native_Features.md](10_Native_Features.md) - Gestures, Voice commands
