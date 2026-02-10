# 📅 Implementation Roadmap - Mobile

> **Project:** StudyLanguage Mobile App  
> **Duration:** ~12-14 tuần  
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
│  Week 1-2   │  Week 3-4   │  Week 5-6   │  Week 7-10  │ 11-14│
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

| Task | Est. | Priority |
|------|------|----------|
| Config screen UI | 4h | P0 |
| Topic dropdown | 2h | P0 |
| Duration selector | 2h | P0 |
| Mode toggle (Podcast/Interactive) | 2h | P0 |
| Generate API integration | 4h | P0 |
| Loading state | 2h | P0 |
| Audio player - basic | 6h | P0 |
| Play/Pause/Seek | 2h | P0 |
| Transcript display | 4h | P0 |
| Auto-scroll transcript | 4h | P1 |
| Speed control | 2h | P1 |
| TTS Provider Settings | 4h | P1 |
| Azure TTS Integration | 4h | P1 |

**Deliverable Week 3:** ✅ User can generate and listen to conversations

---

### 2.3 Week 4: Reading Module

| Task | Est. | Priority |
|------|------|----------|
| Config screen UI | 4h | P0 |
| Topic/Level selection | 2h | P0 |
| Generate article API | 4h | P0 |
| Article view | 4h | P0 |
| Focus Mode UI | 2h | P1 |
| Reading Practice (Recording) | 6h | P1 |
| Tap-to-translate popup | 6h | P0 |
| Dictionary lookup | 4h | P0 |
| Comprehension quiz | 6h | P0 |
| Quiz results | 2h | P0 |

**Deliverable Week 4:** ✅ User can read articles and take quizzes

---

### 2.4 Week 5: Speaking Module

| Task | Est. | Priority |
|------|------|----------|
| Topic selection UI | 4h | P0 |
| Practice screen | 4h | P0 |
| Audio recording (react-native-audio-recorder-player) | 6h | P0 |
| Hold-to-record button | 4h | P0 |
| Recording visualization | 4h | P1 |
| Submit for AI analysis | 4h | P0 |
| Conversation Coach UI | 6h | P1 |
| Realtime Transcription | 4h | P1 |
| Feedback display | 6h | P0 |
| Word scores | 4h | P0 |
| Haptic feedback | 2h | P1 |

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
| ✅ Google Login | |
| ✅ Listening - Generate & Play | |
| ✅ Speaking - Record & Feedback | |
| ✅ Reading - Article & Quiz | |

| ✅ History - Timeline view | |
| ✅ Profile - Basic info | |
| ✅ Light/Dark mode | |

---

## 3. Phase 2: Enhanced UX (3-4 tuần)

> **Goal:** Polish UX, offline support, vocabulary

### 3.1 Week 7-8: Vocabulary & Offline

#### Vocabulary System

| Task | Est. | Priority |
|------|------|----------|
| Word list screen | 4h | P1 |
| Word detail view | 4h | P1 |
| Flashcard UI | 6h | P1 |
| Swipe gestures | 4h | P1 |
| Spaced repetition logic | 4h | P1 |
| Save word from reading | 2h | P1 |
| Review session | 4h | P1 |

#### Offline Support

| Task | Est. | Priority |
|------|------|----------|
| SQLite setup | 4h | P1 |
| Download lesson | 6h | P1 |
| Download manager UI | 4h | P1 |
| Offline indicator | 2h | P1 |
| Sync queue | 4h | P1 |
| Auto-sync on WiFi | 2h | P1 |

### 3.2 Week 9-10: Polish & Notifications

#### Audio Enhancements

| Task | Est. | Priority |
|------|------|----------|
| Background audio | 4h | P1 |
| Lock screen controls | 4h | P1 |
| A-B Loop | 4h | P1 |
| Bookmark sentences | 2h | P1 |

#### Notifications

| Task | Est. | Priority |
|------|------|----------|
| Push notification setup | 4h | P1 |
| Daily reminder | 2h | P1 |
| Streak warning | 2h | P1 |
| Review reminder | 2h | P1 |
| Notification settings | 4h | P1 |

#### UI Polish

| Task | Est. | Priority |
|------|------|----------|
| Full gesture system | 6h | P1 |
| Haptic feedback | 2h | P1 |
| Loading skeletons | 4h | P1 |
| Error states | 4h | P1 |
| Empty states | 2h | P1 |
| Pull-to-refresh | 2h | P1 |

---

### 3.3 Phase 2 Checklist

| Feature | Status |
|---------|--------|
| ☐ Vocabulary flashcards | |
| ☐ Spaced repetition | |
| ☐ Offline download | |
| ☐ Background audio | |
| ☐ Push notifications | |
| ☐ Gesture system | |
| ☐ Haptic feedback | |

---

## 4. Phase 3: Advanced Features (4-6 tuần)

> **Goal:** Special modes, voice commands, widgets

### 4.1 Week 11-12: Special Modes

| Task | Est. | Priority |
|------|------|----------|
| Car mode UI | 6h | P2 |
| Bluetooth detection | 4h | P2 |
| Voice commands | 8h | P2 |
| Bedtime mode UI | 4h | P2 |
| Sleep timer | 4h | P2 |
| Workout mode | 4h | P2 |
| Pocket mode gestures | 4h | P2 |
| Motion detection | 4h | P2 |

### 4.2 Week 13-14: Advanced

| Task | Est. | Priority |
|------|------|----------|
| Speaking roleplay | 8h | P2 |
| Conversation scenarios | 4h | P2 |
| iOS widgets | 8h | P2 |
| Android widgets | 6h | P2 |
| Magic link login | 4h | P2 |
| Biometric login | 4h | P2 |
| Deep linking | 4h | P2 |

---

### 4.3 Phase 3 Checklist

| Feature | Status |
|---------|--------|
| ☐ Car mode | |
| ☐ Bedtime mode | |
| ☐ Voice commands | |
| ☐ Speaking roleplay | |
| ☐ Widgets | |
| ☐ Biometric login | |

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

- [ ] Family leaderboard
- [ ] Gamification (XP, badges)
- [ ] Calendar integration
- [ ] Screenshot translate
- [ ] More AI voices

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
