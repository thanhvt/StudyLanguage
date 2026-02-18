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
- [x] Topic selection UI (TopicPicker + TopicPickerModal)
- [x] Duration selector (DurationSelector component)
- [x] Mode toggle (Podcast + Radio mode)
- [x] Audio Player (TrackPlayer + background playback)
- [x] Transcript Auto-scroll (highlight active exchange)
- [x] Speed Control (0.5x - 2.0x, persist via AudioPlayerStore)

### 📖 Reading (Ref: `features/04_Reading.md`)
- [x] Article Generation API integration
- [x] Article View (Text render)
- [x] Tap-to-translate (Dictionary popup)
- [x] Text-to-Speech playback *(useTtsReader hook, react-native-tts)*

### 🗣️ Speaking (Ref: `features/03_Speaking.md`)
- [x] Practice Mode UI
- [x] Hold-to-record Button
- [x] Audio Recording Logic
- [x] Submit to AI & Get Feedback
- [x] Pronunciation Score Display
- [x] Playback User Recording

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
- [x] Background Audio Playback (TrackPlayer + autoHandleInterruptions)
- [ ] Push Notifications (Daily Reminder)
- [ ] Deep Linking Configuration

### 🏠 Dashboard Enhanced
- [ ] Weekly Activity Chart (Bar chart)
- [ ] Skill Radar Chart (Spider chart)
- [ ] Streak Calendar (Heatmap partial)

### 🎧 Listening Enhanced
- [x] **TTS Provider Settings** (OpenAI/Azure choices)
- [x] **Voice & Emotion Selection** (AdvancedOptionsSheet)
- [x] **Multi-talker Mode** (Azure DragonHD)
- [x] Lock Screen Controls (TrackPlayer playbackService)
- [x] **Background Audio** (autoHandleInterruptions)
- [x] **Custom Scenarios** (CRUD + Favorites)
- [x] **Global Audio Player** (Compact + Minimized modes)
- [x] **Radio Mode** (Playlists + 1-min duration + progress)
- [x] **Session Restoration** (Persist + Resume)
- [x] **Pocket Mode** (Black screen + gestures)
- [x] **Bookmark Sentences** (API + optimistic UI)
- [x] **Walkthrough Tour** (5-step interactive tour)

### 🗣️ Speaking Enhanced
- [x] **AI Conversation Coach Mode** (Chat UI) — `CoachSetupScreen` + `CoachSessionScreen`
- [x] **Real-time Transcription (STT)** — `speakingApi.transcribeAudio`
- [x] **Pronunciation Alerts** (Inline feedback) — `PronunciationAlert.tsx`
- [x] Voice Visualizer Animation — `VoiceVisualizer.tsx`
- [x] **Grammar Correction** — `GrammarFix.tsx`
- [x] **Suggested Responses** — `SuggestedResponses.tsx`
- [x] **Recording UX** (countdown, preview, cancel) — `CountdownOverlay`, `RecordingPreview`
- [x] **Custom Speaking Scenarios** — `CustomScenariosScreen.tsx`
- [x] **Shadowing Mode** (4-phase flow) — `ShadowingScreen.tsx`
- [x] **Waveform Comparison** — `WaveformComparison.tsx`
- [x] **Phoneme Heatmap** — `PhonemeHeatmap.tsx`
- [x] **Score Breakdown** — `ScoreBreakdown.tsx`
- [x] **Confetti Animation** — `ConfettiAnimation.tsx`
- [x] **IPA Popup** — `IPAPopup.tsx`
- [x] **Roleplay Mode** — `RoleplaySelectScreen` + `RoleplaySessionScreen`
- [x] **Tongue Twister Mode** — `TongueTwisterScreen.tsx` (8 twisters + WPM)
- [x] **Progress Dashboard** — `ProgressDashboardScreen` (RadarChart, CalendarHeatmap, BadgeGrid, DailyGoalCard, WeakSoundsCard)
- [x] **Share Results** — `ShareResultCard.tsx` (native Share API)
- [x] **Recording History** — `RecordingHistoryScreen.tsx` (filter by mode)
- [x] **Onboarding Overlay** — `OnboardingOverlay.tsx` (5-step tutorial)
- [x] **TTS Provider Settings** — `SpeakingTtsSheet.tsx` (OpenAI/Azure toggle + voice + speed)
- [x] **Background Audio Coach** — `useCoachTrackPlayer.ts` (TrackPlayer integration)
- [x] **AI Voice Clone Replay** — `VoiceCloneReplay.tsx` + `cloneAndCorrectVoice` API

### 📖 Reading Enhanced
- [x] **Focus Mode** (Immersive view) → `ArticleScreen` animated chrome hiding + status bar + hint
- [x] **Reading Practice** (Record & Feedback) → `PracticeScreen` + `useReadingPractice` hook + STT
- [x] **Pinch-to-zoom** → `usePinchZoom` hook + `GestureDetector` (12-28sp)
- [x] **TTS auto-read article** → `useTtsReader` hook + paragraph highlight + auto-scroll
- [x] Direct Save Article → `saveReadingSession` API + bottom bar button
- [x] Font size controls (A+/A- in ArticleScreen)
- [x] Dictionary popup: save word + audio playback (`Linking.openURL`)
- [x] Highlight saved vocabulary (amber badge in article)
- [x] Reading Store + API service + Unit tests
- [x] `analyzePractice` API endpoint wired

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

- [x] **Pocket Mode** (Gesture controls, black screen) — PocketMode.tsx
- [ ] **Car Mode** (Simplified UI, Voice commands)
- [ ] **Widgets** (iOS/Android Home Screen)
- [ ] **Biometric Login** (FaceID/TouchID)
- [ ] **Magic Link Login**
