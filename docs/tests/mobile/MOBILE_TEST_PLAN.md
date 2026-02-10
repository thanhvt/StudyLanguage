# 📱 MASTER TEST PLAN - MOBILE APP

**Project:** StudyLanguage Mobile (React Native CLI)
**Version:** 1.0
**Date:** 10/02/2026
**Author:** Antigravity (AI Test Lead)

---

## 1. MỤC ĐÍCH

Test scenarios cho toàn bộ features của Mobile App, được tổ chức theo:
- **Feature module** (Dashboard, Auth, Listening, Speaking, Reading, History, Profile, Special Modes, Native)
- **Development phase** (MVP → Enhanced → Advanced) theo `Roadmap.md`
- **Test type** (Happy Path ✅ / Edge Case ⚠️ / Error State ❌)

---

## 2. PHẠM VI FEATURES

| # | Feature | File | Phase | Priority |
|---|---------|------|-------|----------|
| 00 | Dashboard | `00_dashboard_tests.md` | MVP | P0 |
| 01 | Authentication | `01_authentication_tests.md` | MVP | P0 |
| 02 | Listening | `02_listening_tests.md` | MVP → Advanced | P0 |
| 03 | Speaking | `03_speaking_tests.md` | MVP → Advanced | P0 |
| 04 | Reading | `04_reading_tests.md` | MVP → Enhanced | P1 |
| 07 | History | `07_history_tests.md` | MVP → Advanced | P1 |
| 08 | Profile & Settings | `08_profile_settings_tests.md` | MVP → Enhanced | P1 |
| 09 | Special Modes | `09_special_modes_tests.md` | Advanced | P2 |
| 10 | Native Features | `10_native_features_tests.md` | Enhanced → Advanced | P1–P2 |

---

## 3. QUY ƯỚC

### 3.1 Test ID Format
```
MOB-{MODULE}-{PHASE}-{TYPE}-{NUMBER}

MODULE: DASH, AUTH, LIS, SPK, READ, HIS, PROF, SMOD, NAT
PHASE:  MVP, ENH, ADV
TYPE:   HP (Happy Path), EC (Edge Case), ERR (Error State)
NUMBER: 001, 002, ...
```

### 3.2 Severity Levels
| Level | Ý nghĩa |
|-------|---------|
| 🔴 Critical | App crash, mất data, security |
| 🟡 Major | Feature không hoạt động đúng |
| 🟢 Minor | UI lệch, animation thiếu |

### 3.3 Test Status
| Icon | Ý nghĩa |
|------|---------|
| ✅ | Happy Path - luồng chính |
| ⚠️ | Edge Case - trường hợp biên |
| ❌ | Error State - xử lý lỗi |

---

## 4. CHIẾN LƯỢC TEST THEO PHASE

### Phase 1: MVP (Tuần 1-6)
- Core navigation & auth flow
- Basic listening, speaking, reading
- Dashboard, History cơ bản
- Profile & basic settings

### Phase 2: Enhanced (Tuần 7-12)
- Advanced audio player & gestures
- Conversation Coach, Shadowing mode
- Search, filter, analytics
- Notifications, offline, background audio

### Phase 3: Advanced (Tuần 13-20)
- Special modes (Car, Bedtime, Workout, Pocket)
- Widgets, deep linking, voice commands
- Gamification, charts, batch actions
- Export/share features

---

## 5. CÔNG CỤ TEST

| Loại | Công cụ | Dùng cho |
|------|---------|----------|
| Unit Test | Jest + React Testing Library | Hooks, utils, components |
| Integration | Jest + MSW | API calls, state management |
| E2E | Detox / Maestro | Full user flows |
| Manual | Physical devices | Gestures, audio, haptics |
| Performance | React Native Perf Monitor | FPS, memory, startup |

---

## 6. THIẾT BỊ TEST

| Platform | Devices |
|----------|---------|
| iOS | iPhone SE (small), iPhone 15 (standard), iPad |
| Android | Pixel 6 (standard), Samsung S23, Tablet |

---

## 7. TIÊU CHÍ CHẤP NHẬN

- 🔴 Critical bugs: **0**
- Unit test coverage: **>80%** core logic
- App startup: **<2s**
- No memory leaks trong audio playback
- Tất cả Happy Path tests **PASS**
