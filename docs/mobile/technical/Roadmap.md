# 📅 Implementation Roadmap - Mobile

> **Project:** StudyLanguage Mobile App  
> **Duration:** ~18-20 tuần  
> **Team Size:** 1-2 developers

---

## 1. Overview

Roadmap triển khai mobile app theo 3 phases: MVP, Enhanced UX, và Advanced Features.

### 1.1 Timeline Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    IMPLEMENTATION ROADMAP                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Week 1-2   │  Week 3-4   │  Week 5-6   │  Week 7-12  │ 13-20│
│  ─────────  │  ─────────  │  ─────────  │  ─────────  │ ─────│
│  SETUP &    │  LISTENING  │  SPEAKING   │  ENHANCED   │ ADV  │
│  AUTH       │  & READING  │  & HISTORY  │  UX         │      │
│             │             │             │             │      │
│  ◄────────── MVP (6 weeks) ──────────►│◄── Phase 2 ─►│◄ P3 ►│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Phase 1: MVP (4-6 tuần)

> **Goal:** Core functionality, all 3 skills working

### 2.1 Week 1-2: Foundation

#### Setup & Infrastructure

| Task | Est. | Priority |
|------|------|----------|
| Initialize React Native CLI project | 2h | P0 |
| Setup NativeWind (Tailwind) | 2h | P0 |
| Configure React Navigation | 2h | P0 |
| Setup Zustand stores | 2h | P0 |
| Setup TanStack Query | 2h | P0 |
| Configure Supabase client | 2h | P0 |
| Setup API client (Axios) | 2h | P0 |
| Setup Track Player & Notifee | 4h | P0 |

#### Authentication

| Task | Est. | Priority |
|------|------|----------|
| Splash screen | 2h | P0 |
| Onboarding screens (3 slides) | 4h | P0 |
| Google OAuth flow | 4h | P0 |
| Token storage (SecureStore) | 2h | P0 |
| Auto-relogin | 2h | P0 |
| Auth context/store | 2h | P0 |

#### Navigation & Layout

| Task | Est. | Priority |
|------|------|----------|
| Tab navigator | 2h | P0 |
| Stack navigators | 2h | P0 |
| Home screen layout | 4h | P0 |
| Dashboard widgets (Streak) | 4h | P0 |
| Quick Actions component | 2h | P0 |
| Safe area handling | 1h | P0 |

**Deliverable Week 2:** ✅ User can login, see home screen with 4 skill cards

---

### 2.2 Week 3: Listening Module

| Task | Est. | Priority | Status |
|------|------|----------|--------|
| Config screen UI | 4h | P0 | ✅ Done |
| Topic dropdown | 2h | P0 | ✅ Done |
| Duration selector | 2h | P0 | ✅ Done |
| Speaker selector | 2h | P0 | ✅ Done |
| Generate API integration | 4h | P0 | ✅ Done |
| Loading state | 2h | P0 | ✅ Done |
| Audio player - basic | 6h | P0 | ✅ Done |
| Play/Pause/Seek | 2h | P0 | ✅ Done |
| Transcript display | 4h | P0 | ✅ Done |
| Auto-scroll transcript | 4h | P1 | ✅ Done |
| Speed control | 2h | P1 | ✅ Done |
| TTS Provider Settings | 4h | P1 | ✅ Done |
| Azure TTS Integration | 4h | P1 | ✅ Done |

**Deliverable Week 3:** ✅ User can generate and listen to conversations

---

### 2.3 Week 4: Reading Module

| Task | Est. | Priority | Status |
|------|------|----------|--------|
| Config screen UI | 4h | P0 | ✅ Done |
| Topic/Level selection | 2h | P0 | ✅ Done |
| Generate article API | 4h | P0 | ✅ Done |
| Article view | 4h | P0 | ✅ Done |
| Focus Mode UI | 2h | P1 | ✅ Done |
| Reading Practice (Recording) | 6h | P1 | ✅ Done |
| Tap-to-translate popup | 6h | P0 | ✅ Done |
| Dictionary lookup | 4h | P0 | ✅ Done |

**Deliverable Week 4:** ✅ User can read articles with tap-to-translate

---

### 2.4 Week 5: Speaking Module

| Task | Est. | Priority | Status |
|------|------|----------|--------|
| Topic selection UI | 4h | P0 | ✅ Done |
| Practice screen | 4h | P0 | ✅ Done |
| Audio recording (react-native-audio-recorder-player) | 6h | P0 | ✅ Done |
| Hold-to-record button | 4h | P0 | ✅ Done |
| Recording visualization | 4h | P1 | ☐ |
| Submit for AI analysis | 4h | P0 | ✅ Done |
| Conversation Coach UI | 6h | P1 | ☐ |
| Realtime Transcription | 4h | P1 | ☐ |
| Feedback display | 6h | P0 | ✅ Done |
| Word scores | 4h | P0 | ✅ Done |
| Haptic feedback | 2h | P1 | ☐ |

**Deliverable Week 5:** ✅ User can practice pronunciation and get feedback

---

### 2.5 Week 6: History & Profile

| Task | Est. | Priority |
|------|------|----------|
| History timeline | 6h | P0 |
| Stats Cards | 6h | P1 |

| Filter by skill | 2h | P0 |
| Session detail view | 4h | P0 |
| Profile screen | 4h | P0 |
| Basic settings | 4h | P0 |
| Theme toggle | 2h | P0 |
| Logout | 1h | P0 |

**Deliverable Week 6:** ✅ MVP complete - all 3 skills functional

---

### 2.6 MVP Checklist

| Feature | Status |
|---------|--------|
| ✅ Google Login | ✅ Done |
| ✅ Listening - Generate & Play | ✅ Done |
| ✅ Speaking - Record & Feedback | ✅ Done |
| ✅ Reading - Article & Translate | ✅ Done |
| ✅ History - Timeline view | ✅ Done |
| ✅ Profile - Basic info | ✅ Done |
| ✅ Light/Dark mode | ✅ Done |

---

## 3. Phase 2: Enhanced UX (5-6 tuần)

> **Goal:** Polish UX, offline support, và các Enhanced features mới

### 3.1 Week 7-8: Audio & Speaking Enhancements

#### Audio System

| Task | Est. | Priority |
|------|------|----------|
| Background audio + Lock screen controls | 6h | P1 |
| **Background Music** (Lofi tracks, in-app controls, smart ducking) | 6h | P1 |
| Audio interruption handling (ducking/pause/resume) | 4h | P1 |
| Android notification player (foreground service) | 4h | P1 |
| Bookmark sentences | 2h | P1 |
| Global Audio Player - Compact mode | 6h | P1 |
| Session restoration from player | 4h | P1 |

#### Speaking Enhanced

| Task | Est. | Priority | Status |
|------|------|----------|--------|
| Conversation Coach setup screen | 6h | P1 | ✅ Done |
| Conversation Coach session UI | 8h | P1 | ✅ Done |
| Voice/Text input toggle + Real-time STT | 6h | P1 | ✅ Done |
| AI response generation | 4h | P1 | ✅ Done |
| Recording UX (countdown, swipe-to-cancel, preview) | 4h | P1 | ✅ Done |
| Voice Visualizer + Waveform | 4h | P1 | ✅ Done |
| Session Transcript + Timer + Save to History | 6h | P1 | ✅ Done |
| Pronunciation Alert inline | 2h | P1 | ✅ Done |
| IPA toggle + word stress + Tap-to-pronounce | 4h | P1 | ✅ Done |
| Phoneme breakdown view + Phoneme Heatmap | 4h | P1 | ✅ Done |
| Progress tracking | 2h | P1 | ✅ Done |
| Haptic feedback integration | 2h | P1 | ✅ Done |
| Custom Speaking Scenarios (create/save/favorite/delete) | 6h | P1 | ✅ Done |
| Shadowing Mode (real-time compare, delay/speed) | 6h | P1 | ✅ Done |

#### Listening Enhanced

| Task | Est. | Priority | Status |
|------|------|----------|--------|
| Custom Scenarios UI | 4h | P1 | ✅ Done |
| Radio Mode: 1-min duration + progress tracking | 4h | P1 | ✅ Done |
| Topic picker subcategory highlight | 2h | P1 | ✅ Done |
| TTS Provider Settings UI + Azure TTS Integration | 6h | P1 | ✅ Done |
| Multi-talker logic | 4h | P1 | ✅ Done |
| Global Audio Player (Compact + Minimized) | 6h | P0 | ✅ Done |
| Session restoration (persist + resume) | 4h | P1 | ✅ Done |
| Pocket Mode (black screen + gestures) | 4h | P1 | ✅ Done |
| Bookmark sentences (API + optimistic UI) | 3h | P1 | ✅ Done |
| Walkthrough Tour (5-step interactive) | 3h | P2 | ✅ Done |
| Audio change confirmation dialog | 2h | P1 | ✅ Done |
| Waveform Visualizer + Progress bar | 2h | P2 | ✅ Done |
| Translation toggle (VN/EN) | 1h | P1 | ✅ Done |
| Tappable Transcript (tap word → dictionary) | 3h | P1 | ✅ Done |
| Player Gestures (swipe L/R/down, double-tap) | 4h | P1 | ✅ Done |
| Cross-tab CompactPlayer (useFocusEffect) | 2h | P0 | ✅ Done |

### 3.2 Week 9-10: History & Notifications

#### Saved Words (tích hợp trong History)

| Task | Est. | Priority |
|------|------|----------|
| Saved Words tab trong History | 4h | P1 |
| Save word from Reading/Listening | 2h | P1 |
| Word detail popup | 2h | P1 |

> 💡 **Future Phase:** Full Vocabulary module (Flashcard + Spaced Repetition) sẽ triển khai sau khi core features ổn định.

#### Notifications

| Task | Est. | Priority |
|------|------|----------|
| Push notification setup | 4h | P1 |
| Daily reminder + Streak warning | 4h | P1 |
| Review reminder | 2h | P1 |
| Notification schedule (time picker, quiet hours) | 4h | P1 |

### 3.3 Week 11-12: Reading, History & Profile Enhancements

#### Reading Enhanced

| Task | Est. | Priority | Status |
|------|------|----------|--------|
| Dictionary popup: save word + audio playback | 3h | P1 | ✅ Done |
| Pinch-to-zoom text | 2h | P1 | ✅ Done |
| TTS auto-read article | 4h | P1 | ✅ Done |
| Direct save reading articles | 2h | P1 | ✅ Done |
| Reading practice with AI analysis | 6h | P1 | ✅ Done |
| Focus Mode toggle | 3h | P1 | ✅ Done |

#### History Enhanced

| Task | Est. | Priority |
|------|------|----------|
| Search with debounce + suggestions + highlight | 4h | P1 |
| Swipe-to-action (delete/pin) | 3h | P1 |
| Date range filter + Sort order toggle | 3h | P1 |
| Visual identity cards (accent colors) | 3h | P1 |
| Card press animation + haptic | 2h | P1 |
| Session restoration + Persist audio URL | 4h | P1 |
| AI Insight card (gradient + action) | 3h | P1 |
| Recent Lessons Panel integration | 4h | P1 |

#### Profile Enhanced

| Task | Est. | Priority |
|------|------|----------|
| Full appearance settings + Accent color picker | 4h | P1 |
| Speaking goal display | 2h | P1 |
| Week activity chart component | 3h | P1 |
| Audio settings (Music, SFX, Speed, Hands-free) | 4h | P1 |
| Storage management + Privacy settings | 4h | P1 |

#### UI Polish

| Task | Est. | Priority |
|------|------|----------|
| Full gesture system + Speaking gestures | 6h | P1 |
| Loading skeletons + Error states + Empty states | 6h | P1 |
| Pull-to-refresh | 2h | P1 |

---

### 3.4 Phase 2 Checklist

| Feature | Status |
|---------|--------|
| ✅ Background audio + Lock screen + Interruption handling | ✅ Done (TrackPlayer + autoHandleInterruptions) |
| ✅ Global Audio Player (compact + minimized) | ✅ Done (CompactPlayer + MinimizedPlayer overlay) |
| ☐ Conversation Coach (setup + session) | |
| ☐ Shadowing Mode | |
| ✅ Custom Scenarios (Listening) | ✅ Done (CRUD + Favorites + Quick Use) |
| ☐ Custom Scenarios (Speaking) | |
| ☐ Recording UX improvements | |
| ✅ Listening: Radio Mode, TTS Settings, Multi-talker | ✅ Done |
| ☐ Saved Words trong History | |

| ☐ Push notifications + scheduling | |
| ✅ Reading: Focus Mode, Practice, Dictionary popup | ✅ Done (Focus Mode, PracticeScreen, Dictionary audio, TTS, PinchZoom, Direct Save) |
| ☐ History: Search, Swipe, Analytics, Recent Lessons | |
| ☐ Profile: Appearance, Avatar, Audio settings | |
| ✅ Gesture system + Haptic feedback | ✅ Done (usePlayerGestures + useHaptic) |

---

## 4. Phase 3: Advanced Features (6-8 tuần)

> **Goal:** Special modes, voice commands, widgets, gamification, advanced analytics

### 4.1 Week 13-14: Special Modes & Voice

| Task | Est. | Priority |
|------|------|----------|
| Car mode UI + voice commands | 8h | P2 |
| Bluetooth detection | 4h | P2 |
| Bedtime mode UI + Sleep timer | 6h | P2 |
| Ambient sounds (rain/ocean/forest) | 3h | P2 |
| Workout mode UI + content playlists | 4h | P2 |
| Pocket mode gestures + Motion detection | 6h | P2 | ✅ Done (PocketMode.tsx) |
| Quick Settings Panel UI (toggle all modes) | 3h | P2 |


### 4.2 Week 15-16: Speaking Advanced

| Task | Est. | Priority | Status |
|------|------|----------|--------|
| Roleplay scenarios + Scenario Selection UI | 8h | P2 | ✅ Done |
| Multi-turn conversations + Difficulty levels | 6h | P2 | ✅ Done |
| Overall session feedback | 4h | P2 | ✅ Done |
| Tongue Twister Mode (phoneme categories, speed challenge, leaderboard) | 8h | P2 | ✅ Done |
| Gamification (daily goals, badges, weekly report) | 8h | P2 | ✅ Done |
| Speaking Progress Dashboard (radar chart, calendar heatmap, weak sounds) | 8h | P2 | ✅ Done |
| AI Voice Clone Replay (corrected + before/after) | 6h | P2 | ⏳ Cần backend |
| Save & Share Results (share card, recording history, timeline) | 6h | P2 | ✅ Done |
| Background Audio for Coach (notification, session persist) | 4h | P2 | ⏳ Cần native |
| TTS Provider Settings (parity với Listening) | 3h | P2 | ⏳ Sẽ reuse |
| Confetti animation khi score ≥90 | 2h | P2 | ✅ Done |

### 4.3 Week 17-18: Listening Advanced & History Advanced

#### Listening Advanced

| Task | Est. | Priority |
|------|------|----------|
| Pocket mode with gestures | 4h | P2 |
| Voice commands for player | 4h | P2 |
| Radio mode (playlists) | 6h | P2 |
| Custom Scenarios CRUD | 4h | P2 |
| Global Audio Player - Minimized mode | 4h | P2 |
| Audio change confirmation dialog | 2h | P2 |

#### History Advanced

| Task | Est. | Priority |
|------|------|----------|
| Batch actions (multi-select mode) | 4h | P2 |
| Export/Share session (image card, PDF) | 6h | P2 |
| Weekly activity heatmap | 4h | P2 |
| Progress chart (line chart) | 3h | P2 |
| Skill distribution chart | 3h | P2 |
| Detail view shared element transition | 4h | P2 |

### 4.4 Week 19-20: Widgets, Deep Linking & Native Polish

| Task | Est. | Priority |
|------|------|----------|
| iOS widgets (small, medium, large) | 8h | P2 |
| Android widgets | 6h | P2 |
| Deep linking (URL scheme + Universal Links) | 4h | P2 |
| Rich notifications (iOS) | 4h | P2 |
| Lock screen controls | 4h | P2 |

---

### 4.5 Phase 3 Checklist

| Feature | Status |
|---------|--------|
| ☐ Special Modes (Car, Bedtime, Workout, Pocket) | |
| ☐ Quick Settings Panel | |

| ✅ Speaking: Roleplay, Tongue Twister, Gamification | ✅ Done |
| ✅ Speaking: Progress Dashboard, AI Voice Clone | 🟡 Partial (AI Clone pending) |
| ✅ Speaking: Save & Share, Background Audio Coach | 🟡 Partial (BG Audio pending) |
| ☐ Listening: Radio playlists, Pocket mode, Voice | |
| ☐ History: Batch actions, Export, Charts, Heatmap | |
| ☐ iOS + Android Widgets | |
| ☐ Deep linking + Rich notifications | |

---

## 5. Release Plan

### 5.1 Beta Testing

| Phase | Duration | Scope |
|-------|----------|-------|
| Internal Alpha | 1 week | Developer testing |
| Private Beta | 2 weeks | Family members (5-10) |
| Bug fixes | 1 week | Address feedback |

### 5.2 Launch Checklist

| Item | Status |
|------|--------|
| ☐ App icons (all sizes) | |
| ☐ Splash screen | |
| ☐ Store screenshots | |
| ☐ Store description | |
| ☐ Privacy policy | |
| ☐ Terms of service | |
| ☐ TestFlight (iOS) | |
| ☐ Internal testing (Android) | |

### 5.3 Distribution

| Platform | Method |
|----------|--------|
| iOS | TestFlight → App Store (if needed) |
| Android | APK direct install / Play Internal |

---

## 6. Dependencies & Risks

### 6.1 Dependencies

| Dependency | Impact | Mitigation |
|------------|--------|------------|
| Backend API | Critical | Use mock data first |
| OpenAI API | Critical | Have fallback content |
| Supabase | Critical | Test auth early |
| React Native CLI | High | Test native modules early |

### 6.2 Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Audio bugs | Medium | High | Test on multiple devices |
| iOS approval | Low | High | Follow guidelines |
| Performance | Medium | Medium | Profile early |
| Offline complexity | Medium | Medium | Simplify scope |

---

## 7. Success Metrics

| Metric | Target | Measure When |
|--------|--------|--------------|
| App launch time | < 2s | After MVP |
| Screen transitions | 60fps | After MVP |
| Crash rate | < 0.1% | After beta |
| User satisfaction | 4+ stars | After launch |
| Daily active usage | 50%+ | After 1 month |

---

## 8. Post-Launch

### 8.1 Version 1.1 Ideas

- [ ] **Vocabulary Module** (Flashcard + Spaced Repetition + Review Notifications)
- [ ] Family leaderboard
- [ ] Calendar integration (study reminders in calendar app)
- [ ] Screenshot translate (OCR → translate)
- [ ] More AI voices + custom voice profiles
- [ ] Social features (friends, challenges)
- [ ] Podcast-style content import

### 8.2 Continuous Improvement

| Area | Frequency |
|------|-----------|
| Bug fixes | As needed |
| Performance | Monthly |
| New content | Weekly |
| Feature updates | Quarterly |

---

## 9. Related Documents

- [00_Mobile_Overview.md](../00_Mobile_Overview.md) - Project overview
- [Architecture.md](Architecture.md) - Technical architecture
- [UI_Design_System.md](../design/UI_Design_System.md) - Design system
