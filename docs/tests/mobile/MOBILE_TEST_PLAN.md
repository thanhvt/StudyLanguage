# 📱 MASTER TEST PLAN - MOBILE APP

**Project:** StudyLanguage Mobile (React Native CLI)  
**Version:** 1.0  
**Date:** 13/02/2026  
**Author:** Antigravity (AI Test Lead)

---

## 1. MỤC ĐÍCH

Test scenarios cho toàn bộ features của Mobile App, được tổ chức theo:
- **Feature module** (Dashboard, Auth, Listening, Speaking, Reading, History, Profile, Special Modes, Native)
- **Development phase** (MVP → Enhanced → Advanced) theo `Roadmap.md`
- **Test type** (Happy Path ✅ / Edge Case ⚠️ / Error State ❌)
- **Test level** (Unit → Smoke → Functional → Monkey → Edge Case → E2E)

---

## 2. PHẠM VI FEATURES

| # | Feature | File | Phase | Priority | Unit Tests | Manual Tests |
|---|---------|------|-------|----------|------------|--------------|
| 00 | Dashboard | `00_dashboard_tests.md` | MVP | P0 | — | ✅ |
| 01 | Authentication | `01_authentication_tests.md` | MVP | P0 | — | ✅ |
| 02 | Listening | `02_listening_tests.md` | MVP → Advanced | P0 | ✅ 131/131 | ✅ (Smoke + Monkey + Manual) |
| 02A | Listening → Scenario Picker | `02A_listening_scenario_picker_manual_tests.md` | Enhanced | P0 | ✅ | ✅ |
| 03 | **Speaking** | `03_speaking_tests.md` | MVP → Advanced | P0 | ✅ 34/34 | ✅ (Smoke + Monkey + Manual) |
| 04 | **Reading** | `04_reading_tests.md` | MVP → Enhanced | P1 | ✅ 28/28 | ✅ (Smoke + Monkey + Manual) |
| 07 | History | `07_history_tests.md` | MVP → Advanced | P1 | — | ✅ |
| 08 | Profile & Settings | `08_profile_settings_tests.md` | MVP → Enhanced | P1 | — | ✅ |
| 09 | Special Modes | `09_special_modes_tests.md` | Advanced | P2 | — | ✅ |
| 10 | Native Features | `10_native_features_tests.md` | Enhanced → Advanced | P1–P2 | — | ✅ |
| 11 | 🔥 Listening Smoke | `11_listening_smoke_tests.md` | MVP | P0 | — | ✅ 17 steps |
| 12 | 🐒 Listening Monkey | `12_listening_monkey_tests.md` | MVP → Enhanced | P1 | — | ✅ 15 scenarios |
| 13 | 📋 Listening Manual | `13_listening_manual_tests.md` | MVP → Enhanced | P0 | — | ✅ 27 scripts |

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

### 3.2 Các loại Test mới (bổ sung)
```
SMK-XX      : Smoke Test — verify luồng chính, chạy nhanh 3-5 phút
FT-XXX-XX   : Functional Test — test chi tiết từng feature
MNK-XX      : Monkey Test — thao tác ngẫu nhiên, tìm crash
MNL-XX      : Manual Test — test chi tiết trên device thật (UI/UX, animation, touch)
EC-XX       : Edge Case — trường hợp biên, boundary
```

> **Xem thêm:** [SMOKE_MONKEY_MANUAL_GUIDE.md](file:///Users/thanhvuqlud/ThanhData/CODE/StudyLanguage/docs/tests/mobile/SMOKE_MONKEY_MANUAL_GUIDE.md) — Guide chi tiết cho QA test trên device thật

### 3.3 Severity Levels
| Level | Ý nghĩa |
|-------|---------| 
| 🔴 Critical | App crash, mất data, security |
| 🟡 Major | Feature không hoạt động đúng |
| 🟢 Minor | UI lệch, animation thiếu |

### 3.4 Test Status
| Icon | Ý nghĩa |
|------|---------| 
| ✅ | Happy Path - luồng chính |
| ⚠️ | Edge Case - trường hợp biên |
| ❌ | Error State - xử lý lỗi |
| 🔲 | Chưa test |

---

## 4. CHIẾN LƯỢC TEST THEO LEVEL

### Level 1: Unit Tests (Automated — Jest)
- **Khi nào:** Sau mỗi code change
- **Scope:** Store, API service, utils, hooks
- **Command:** `npx jest --verbose`
- **Target:** >80% core logic coverage

### Level 2: Smoke Tests (Manual — 5 phút)
- **Khi nào:** Sau mỗi build
- **Scope:** Happy path chính end-to-end
- **Checklist:** Mở file test → section "SMOKE TESTS" → đi theo steps

### Level 3: Functional Tests (Manual — 30 phút)
- **Khi nào:** Trước release / sau feature lớn
- **Scope:** Tất cả test cases trong tables
- **Device:** iPhone thật + Simulator

### Level 4: Monkey Tests (Manual — 10 phút)
- **Khi nào:** Sau feature mới, trước release
- **Scope:** Thao tác bất thường, spam, interrupt
- **Mục đích:** Tìm crash, memory leak, UI glitch

### Level 5: Edge Case & Performance (Manual — 15 phút)
- **Khi nào:** Trước release
- **Scope:** Dark mode, small screen, slow network, boundary values
- **Device:** iPhone SE (small), iPad (large)

---

## 5. CHIẾN LƯỢC TEST THEO PHASE

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

## 6. CÔNG CỤ TEST

| Loại | Công cụ | Dùng cho |
|------|---------|----------|
| Unit Test | Jest + React Testing Library | Hooks, utils, components |
| Integration | Jest + MSW | API calls, state management |
| E2E | Detox / Maestro | Full user flows |
| Smoke | Physical device + checklists | Quick sanity check |
| Monkey | Physical device + free-form | Crash hunting |
| Manual | Physical devices | Gestures, audio, haptics |
| Performance | React Native Perf Monitor | FPS, memory, startup |

### Cross-Module Test Guides

| File | Loại | Mô tả | Thời gian |
|------|------|-------|-----------|
| `SMOKE_TEST_CHECKLIST.md` | 🔥 Smoke | 29 items cross-module, chạy mỗi release | ~15 phút |
| `MONKEY_TEST_GUIDE.md` | 🐵 Monkey | 10 kỹ thuật, per-module checklists, bug report template | 20-30 phút |
| `MANUAL_TEST_PLAYBOOK.md` | 📱 Manual | Device thật: audio routing, haptic, mic, background, interrupts | 45-60 phút |

---

## 7. THIẾT BỊ TEST

| Platform | Devices |
|----------|---------|
| iOS | iPhone SE (small), iPhone 15 (standard), iPad |
| Android | Pixel 6 (standard), Samsung S23, Tablet |

---

## 8. TIÊU CHÍ CHẤP NHẬN

- 🔴 Critical bugs: **0**
- Unit test coverage: **>80%** core logic
- Smoke tests: **100% pass** trước release
- Monkey tests: **Không crash** sau 10 phút thao tác
- App startup: **<2s**
- No memory leaks trong audio playback
- Tất cả Happy Path tests **PASS**

---

## 9. QUY TRÌNH TEST TRƯỚC RELEASE

```
1. npm test (unit tests)     → Tất cả PASS
2. Smoke tests (5 phút)     → Tất cả PASS  
3. Functional tests (30p)   → Tất cả HP PASS
4. Monkey tests (10 phút)   → 0 crash
5. Edge case tests (15p)    → Tất cả PASS
6. Bug fix                   → Fix critical/major
7. Re-test fixed bugs        → Verify fix
8. SIGN-OFF ✅
```
