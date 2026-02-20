# 📱 StudyLanguage Mobile App - Tổng Quan

> **Phiên bản:** 1.1  
> **Ngày:** 01/02/2026  
> **Nền tảng:** React Native CLI

---

## 1. Tầm Nhìn & Mục Tiêu

### 1.1 Vision Statement
Xây dựng ứng dụng mobile học tiếng Anh AI-powered, cho phép người dùng **học mọi lúc, mọi nơi** với trải nghiệm mượt mà, tối ưu cho việc học trong thời gian chết.

### 1.2 Core Goals

| # | Goal | Description |
|---|------|-------------|
| 1 | **Học mọi lúc, mọi nơi** | Tối ưu cho di chuyển, trước khi ngủ, nghỉ trưa |
| 2 | **Trải nghiệm mượt mà** | Gestures, voice commands, offline mode |
| 3 | **Đồng bộ liền mạch** | Sync hoàn hảo với Web App |
| 4 | **AI-Powered Learning** | Content generation, feedback, personalization |

---

## 2. Target Users & Use Cases

### 2.1 Users Profile
- **Số lượng:** < 20 người (Personal & Family)
- **Độ tuổi:** 10+ (Phù hợp mọi lứa tuổi)

### 2.2 Primary Use Cases

| Use Case | Context | Duration |
|----------|---------|----------|
| 🚌 **Commute Learning** | Đi làm/đi học trên xe bus, tàu | 15-30 min |
| 🛏️ **Bedtime Study** | Trước khi ngủ | 10-20 min |
| 🍽️ **Lunch Break** | Nghỉ trưa tại văn phòng | 10-15 min |
| 🏃 **Workout Companion** | Chạy bộ, tập gym | 20-45 min |

---

## 3. Mobile-First Principles

| Nguyên tắc | Mô tả |
|------------|-------|
| 🔘 **Thumb-Friendly** | Các nút bấm chính nằm trong vùng ngón tay cái dễ chạm |
| 📴 **Offline-First** | Hoạt động tốt ngay cả khi mất mạng |
| 🔋 **Battery-Optimized** | Tối ưu pin, không drain battery khi chạy nền nhưng khi người dùng cho app chạy foreground / background thì vẫn hoạt động tốt (vẫn phát ra âm thanh, nhận được thông báo, v.v.)|
| ⚡ **Fast Loading** | Skeleton loading, progressive image loading |
| 📳 **Native Feel** | Haptic feedback, native transitions |

---

## 4. Tech Stack

### 4.1 Core Framework
```
┌─────────────────────────────────────────────┐
│              React Native CLI.              │
│    (Cross-platform iOS & Android)           │
├─────────────────────────────────────────────┤
│  Navigation: React Navigation (file-based)  │
│  Styling: NativeWind (Tailwind for RN)      │
│  Animation: Reanimated + Gesture Handler    │
└─────────────────────────────────────────────┘
```

### 4.2 State & Data
| Layer | Technology | Purpose |
|-------|------------|---------|
| Server State | TanStack Query | Cache & sync data |
| Client State | Zustand | Global state (lightweight) |
| Local Storage | AsyncStorage | Settings, preferences |
| Offline DB | SQLite | Downloaded content |
| Secure Storage | react-native-keychain | Tokens, credentials (Keychain/Keystore) |

### 4.3 Audio & Media
| Feature | Technology |
|---------|------------|
| Playback & Background | react-native-track-player | Best-in-class background audio & lock screen controls |
| Recording | react-native-audio-recorder-player | Robust recording with metering |
| Text-to-Speech | Azure Speech SDK | High quality cloud TTS |
| Sound Effects | react-native-sound | Low latency UI sounds |

### 4.4 Native Features
- **Push Notifications:** Notifee + @react-native-firebase/messaging
- **Calendar Integration:** react-native-calendar-events
- **File System:** react-native-fs
- **Motion Detection:** react-native-sensors
- **Location:** react-native-geolocation-service
- **Deep Linking:** React Native Linking (built-in)
- **Haptic Feedback:** react-native-haptic-feedback

### 4.5 Backend
- **Auth & Database:** Supabase JS Client
- **AI Services:** Azure AI via NestJS Backend
- **HTTP Client:** Axios

---

## 5. Features Matrix

### 5.1 Core Modules

| Module | MVP | Enhanced | Advanced |
|--------|-----|----------|----------|
| � **Dashboard** | Greeting + Streak | Quick Actions | - |
| 🎧 **Listening** | Podcast mode, Basic player | TTS Provider Panel, Radio Mode | Background audio, Lock screen |
| 🗣️ **Speaking** | Voice Recorder | Conversation Coach (Basic) | Realtime Transcription, AI Feedback |
| 📖 **Reading** | Article view, Focus Mode | Tap-to-translate, Quiz | Reading Practice with AI |

| 📜 **History** | Timeline view | Analytics (Stats, Chart) | Heatmap, AI Insights, Pinned Items |

### 5.2 Mobile-Specific Features

| Feature | MVP | Enhanced | Advanced |
|---------|-----|----------|----------|
| **Gestures** | Basic swipe | Full gesture system | Voice commands |
| **Offline** | Downloaded lessons | Download manager | Auto-sync WiFi |
| **Notifications** | Daily reminder | Streak warning | Personalized tips |
| **Widgets** | - | Basic widget | Word of the day |
| **Special Modes** | - | - | Car, Bedtime, Workout |

---

## 6. Navigation Structure

```
Tab Navigator (Bottom) — 6 tabs
├── 🏠 Dashboard
│   ├── Greeting + Streak
│   ├── Study Goal + Next Lesson
│   ├── Quick Actions
│   └── Recent Activity
│
├── 🎧 Listening
│   ├── Config Screen (topic, duration, level)
│   └── Player Screen
│
├── 📖 Reading
│   ├── Config Screen (topic, level)
│   └── Article Screen
│
├── 🗣️ Speaking
│   ├── Topic Selection
│   └── Practice Screen
│
├── 📜 History
│   ├── Filter Tabs (All, Listening, Speaking, Reading)
│   ├── Timeline List
│   └── 📚 Saved Words (từ vựng đã lưu từ các module)
│
└── ⚙️ Settings
    ├── Appearance (Theme, Language)
    ├── Audio Settings
    ├── Notifications
    ├── Storage & Privacy
    └── About
```

---

## 8. Related Documents

### Features
- [00_Dashboard.md](features/00_Dashboard.md) - Home & Analytics (NEW ✨)
- [01_Authentication.md](features/01_Authentication.md) - Auth flows
- [02_Listening.md](features/02_Listening.md) - Listening module
- [03_Speaking.md](features/03_Speaking.md) - Speaking module
- [04_Reading.md](features/04_Reading.md) - Reading module

- [07_History.md](features/07_History.md) - History module
- [08_Profile_Settings.md](features/08_Profile_Settings.md) - Profile & Settings
- [09_Special_Modes.md](features/09_Special_Modes.md) - Special modes
- [10_Native_Features.md](features/10_Native_Features.md) - Native features

### Technical
- [Architecture.md](technical/Architecture.md) - Tech architecture

### Design
- [UI_Design_System.md](design/UI_Design_System.md) - Design tokens
- [Style_Convention.md](design/Style_Convention.md) - UI/UX usage patterns & conventions

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| App launch time | < 2 seconds |
| Screen transitions | 60fps smooth |
| Battery drain (passive) | < 5%/hour |
| Offline capability | Core features work |
| User retention D7 | > 50% |
