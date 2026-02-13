# 📱 StudyLanguage Mobile App - Implementation Tracker

Master checklist for the mobile app development, aligned with `docs/mobile/features/*.md` and `technical/Roadmap.md`.

## 📌 Legend
- [ ] Todo
- [/] In Progress
- [x] Done

---

## 🏗️ Phase 1: Foundation (Foundations & Auth)
Target: Weeks 1-2

### Setup & Infrastructure
- [ ] Initialize React Native CLI project
- [ ] Setup NativeWind (Tailwind CSS)
- [ ] Configure React Navigation (Stack + Tab)
- [ ] Setup Zustand & TanStack Query
- [ ] Configure Supabase Client
- [ ] Setup i18n support (En/Vi)
- [ ] Setup Track Player & Notifee

### Authentication (Ref: `features/01_Authentication.md`)
- [ ] Splash Screen
- [ ] Onboarding Carousel (3 slides)
- [ ] Google OAuth Integration
- [ ] Token Storage (SecureStore)
- [ ] Auth Context & Provider
- [ ] Auto-login logic

---

## 🚀 Phase 2: MVP Core Features
Target: Weeks 3-6 (Basic functional app)

### 🏠 Dashboard (Ref: `features/00_Dashboard.md`)
- [ ] Header (Greeting, Avatar, Streak count)
- [ ] Study Goal Progress (Circular chart)
- [ ] Next Lesson Card
- [ ] Quick Actions Grid (Listening, Speaking, Reading)
- [ ] Recent Activity List

### 🎧 Listening (Ref: `features/02_Listening.md`)
- [ ] Topic selection UI
- [ ] Duration selector (5, 10, 15, 20 min)
- [ ] Mode toggle (Podcast / Interactive)
- [ ] Audio Player (Basic controls: Play, Pause, Seek)
- [ ] Transcript Auto-scroll
- [ ] Speed Control Sheet

### 📖 Reading (Ref: `features/04_Reading.md`)
- [ ] Article Generation API integration
- [ ] Article View (Text render)
- [ ] Tap-to-translate (Dictionary popup)
- [ ] Text-to-Speech playback
- [ ] Comprehension Quiz UI
- [ ] Quiz Result Screen

### 🗣️ Speaking (Ref: `features/03_Speaking.md`)
- [ ] Practice Mode UI
- [ ] Hold-to-record Button
- [ ] Audio Recording Logic
- [ ] Submit to AI & Get Feedback
- [ ] Pronunciation Score Display
- [ ] Playback User Recording

### ✍️ Writing (Ref: `features/05_Writing.md`)
- [ ] Topic Selection
- [ ] Text Input Area with Word Count
- [ ] Submit for AI Correction
- [ ] Correction Diff View (Green/Red highlights)

### 📜 History & Profile (Ref: `features/07_History.md`, `08_Profile_Settings.md`)
- [x] History Timeline List (SectionList grouped by date)
- [x] Filter by Skill (FilterPills component)
- [x] Search by topic (debounced search)
- [x] Stats Bar (streak, today, week)
- [x] Swipe actions (pin/delete)
- [x] Empty state per skill type
- [x] Skeleton loading
- [x] Pull-to-refresh + pagination
- [x] History API service (8 endpoints)
- [x] History Zustand store
- [x] Profile Screen (User info)
- [x] Logout Functionality
- [x] Theme Toggle (Light/Dark)

---

## ✨ Phase 3: Enhanced UX & Features
Target: Weeks 7-10 (Review, Polish, Advanced Logic)

### 🧠 App-wide Logic
- [ ] Offline Support (SQLite + Download Manager)
- [ ] Background Audio Playback
- [ ] Push Notifications (Daily Reminder)
- [ ] Deep Linking Configuration

### 🏠 Dashboard Enhanced
- [ ] Weekly Activity Chart (Bar chart)
- [ ] Skill Radar Chart (Spider chart)
- [ ] Streak Calendar (Heatmap partial)

### 🎧 Listening Enhanced
- [ ] **TTS Provider Settings** (OpenAI/Azure choices)
- [ ] **Voice & Emotion Selection**
- [ ] **Multi-talker Mode** (Azure)
- [ ] A-B Loop Feature
- [ ] Lock Screen Controls

### 🗣️ Speaking Enhanced
- [ ] **AI Conversation Coach Mode** (Chat UI)
- [ ] **Real-time Transcription (STT)**
- [ ] **Pronunciation Alerts** (Inline feedback)
- [ ] Voice Visualizer Animation

### 📖 Reading Enhanced
- [ ] **Focus Mode** (Immersive view)
- [ ] **Reading Practice** (Record & Feedback)
- [ ] **Space Shortcut** (Hardware keyboard support)
- [ ] Direct Save Article

### 📜 History Enhanced
- [ ] **Stats Dashboard** (Total hours, Lessons count)
- [ ] **Learning Heatmap** (Calendar view)
- [ ] **AI Study Insights**
- [ ] Pinned Sessions

### ⚙️ Settings Enhanced
- [ ] **Audio Settings** (Sound Effects, Auto-play, Hands-free)
- [ ] **Playback Range** (0.5x - 2.0x)
- [ ] Advanced Notification Settings
- [ ] Data Export / Delete Account

---

## 🔮 Phase 4: Advanced Features
Target: Weeks 11-14

- [ ] **Pocket Mode** (Gesture controls, black screen)
- [ ] **Car Mode** (Simplified UI, Voice commands)
- [ ] **Widgets** (iOS/Android Home Screen)
- [ ] **Biometric Login** (FaceID/TouchID)
- [ ] **Magic Link Login**
