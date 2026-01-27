# 📱 StudyLanguage Mobile App - Tổng Quan

> **Phiên bản:** 1.0  
> **Ngày:** 26/01/2026  
> **Nền tảng:** React Native + Expo

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
| 🔋 **Battery-Optimized** | Tối ưu pin, không drain battery khi chạy nền |
| ⚡ **Fast Loading** | Skeleton loading, progressive image loading |
| 📳 **Native Feel** | Haptic feedback, native transitions |

---

## 4. Tech Stack

### 4.1 Core Framework
```
┌─────────────────────────────────────────────┐
│              React Native + Expo            │
│    (Cross-platform iOS & Android)           │
├─────────────────────────────────────────────┤
│  Navigation: Expo Router (file-based)       │
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
| Secure Storage | Expo SecureStore | Tokens, credentials |

### 4.3 Audio & Media
| Feature | Technology |
|---------|------------|
| Play/Record Audio | Expo AV |
| Text-to-Speech | Expo Speech (fallback) |
| Background Audio | Expo Audio |

### 4.4 Native Features
- **Push Notifications:** Expo Notifications
- **Calendar Integration:** Expo Calendar
- **File System:** Expo File System
- **Motion Detection:** Expo Sensors
- **Location:** Expo Location
- **Deep Linking:** Expo Linking
- **Haptic Feedback:** Expo Haptics

### 4.5 Backend
- **Auth & Database:** Supabase JS Client
- **AI Services:** OpenAI via NestJS Backend
- **HTTP Client:** Axios

---

## 5. Features Matrix

### 5.1 Core Modules

| Module | MVP | Enhanced | Advanced |
|--------|-----|----------|----------|
| 🎧 **Listening** | Podcast mode, Basic player | Interactive mode, A-B Loop | Background audio, Lock screen |
| 🗣️ **Speaking** | Record & AI feedback | Waveform comparison | Conversation roleplay |
| 📖 **Reading** | Article view, Tap-to-translate | Dictionary, Quiz | Night mode |
| ✍️ **Writing** | Basic input, AI correction | Voice input | Paraphrase suggestions |
| 📚 **Vocabulary** | Word list | Flashcard review | Spaced repetition, Notifications |
| 📜 **History** | Timeline view | Detail view | Replay, Sync |

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
Tab Navigator (Bottom)
├── 🏠 Home
│   ├── Header (Avatar, Notifications, Settings)
│   ├── Greeting + Daily Stats
│   ├── 4 Skill Cards (Listening, Speaking, Reading, Writing)
│   └── Progress Summary
│
├── 📜 History
│   ├── Filter Tabs (All, Listening, Speaking, Reading, Writing)
│   └── Timeline List
│
├── 📚 Vocabulary
│   ├── Word List
│   └── Flashcard Review
│
└── 👤 Profile
    ├── User Info
    ├── Statistics
    └── Settings Links
```

---

## 7. Roadmap Overview

### Phase 1: MVP (4-6 tuần)
> Setup project, Auth, Navigation, 4 Skills basic, History

### Phase 2: Enhanced UX (3-4 tuần)
> Offline manager, Vocabulary, Notifications, Widgets, Background audio

### Phase 3: Advanced Features (4-6 tuần)
> Car/Bedtime mode, Roleplay, Gamification, Family leaderboard

📋 **Chi tiết:** Xem [Roadmap.md](technical/Roadmap.md)

---

## 8. Related Documents

### Features
- [01_Authentication.md](features/01_Authentication.md) - Auth flows
- [02_Listening.md](features/02_Listening.md) - Listening module
- [03_Speaking.md](features/03_Speaking.md) - Speaking module
- [04_Reading.md](features/04_Reading.md) - Reading module
- [05_Writing.md](features/05_Writing.md) - Writing module
- [06_Vocabulary.md](features/06_Vocabulary.md) - Vocabulary system
- [07_History.md](features/07_History.md) - History module
- [08_Profile_Settings.md](features/08_Profile_Settings.md) - Profile & Settings
- [09_Special_Modes.md](features/09_Special_Modes.md) - Special modes
- [10_Native_Features.md](features/10_Native_Features.md) - Native features

### Technical
- [Architecture.md](technical/Architecture.md) - Tech architecture
- [Roadmap.md](technical/Roadmap.md) - Implementation timeline

### Design
- [UI_Design_System.md](design/UI_Design_System.md) - Design tokens

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| App launch time | < 2 seconds |
| Screen transitions | 60fps smooth |
| Battery drain (passive) | < 5%/hour |
| Offline capability | Core features work |
| User retention D7 | > 50% |
