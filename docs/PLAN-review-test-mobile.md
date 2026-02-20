# 📋 PLAN: Review Code & Test Mobile Features (Trừ Listening/Reading/Speaking)

> **Ngày tạo:** 2026-02-19
> **Phạm vi:** Dashboard, Authentication, History, Profile & Settings, Special Modes, Native Features
> **Loại trừ:** Listening, Reading, Speaking (đã review riêng)

---

## Tổng quan

Review code và kiểm tra toàn bộ test cases trong `docs/tests/mobile` cho **6 chức năng** (trừ Listening, Reading, Speaking). Đảm bảo code hiện tại đáp ứng **207 test cases** bao gồm Happy Path, Edge Case, và Error State.

---

## Phân tích hiện trạng

### Test Cases theo Feature

| # | Feature | Test Cases | Unit Tests hiện tại | Trạng thái |
|---|---------|-----------|-------------------|-----------|
| 00 | Dashboard | 16 (MVP + Enhanced) | ✅ 30 tests — `dashboard.test.ts` | Cần bổ sung |
| 01 | Authentication | 20 (MVP + Enhanced) | ✅ 6+7 tests — `useAuthStore.test.ts` + `authService.test.ts` + `useAppStore.test.ts` | Cần bổ sung |
| 07 | History | 62 (MVP + Enhanced + Smoke + Monkey + Manual) | ✅ 57 tests — `useHistoryStore.test.ts` + `historyHelpers.test.ts` + `historyApi.test.ts` | Đầy đủ unit, cần manual verify |
| 08 | Profile & Settings | 36 (MVP + Enhanced) | ❌ 0 tests cho `useSettingsStore` | **CẦN TẠO MỚI** |
| 09 | Special Modes | 30 (Advanced) | ❌ Chưa implement (Advanced phase) | Chỉ review docs |
| 10 | Native Features | 43 (Enhanced + Advanced) | ❌ Một phần — audio player tested, gesture/haptic chưa | Review + bổ sung |

### Source Code cần Review

| Layer | Files | Mô tả |
|-------|-------|-------|
| **Stores** | `useAppStore.ts`, `useAuthStore.ts`, `useHistoryStore.ts`, `useSettingsStore.ts`, `useVocabularyStore.ts` | Zustand state management |
| **Services** | `history.ts`, `auth.ts` | API calls, auth service |
| **Screens** | Dashboard, Profile, Settings (Appearance/Audio/Privacy), About, Onboarding, Splash | UI components |
| **Utils** | `historyHelpers.ts` | Helper functions |

---

## Proposed Changes

### Phase 1: Code Review & Gap Analysis

> Đọc code source so sánh với test cases, xác định gaps giữa implementation và expected behavior.

#### Feature 00 — Dashboard

Review `DashboardScreen` so sánh với `00_dashboard_tests.md`:

| TC Group | Test Cases | Testable via Unit? | Gap |
|----------|-----------|-------------------|-----|
| Greeting Logic (HP-001~004) | 4 Happy Path | ✅ Đã có | ❌ Thiếu "Still studying" cho 22:00-05:59 |
| Greeting Edge (EC-001~002) | 2 Edge Case | ✅ Đã có 1 | ❌ Thiếu test tên dài 50+ ký tự |
| Streak Display (HP-005~006, EC-001~002) | 4 cases | ⚠️ Có basic | ❌ Thiếu streak reset logic, milestone |
| Quick Actions (HP-007~010) | 4 cases | ✅ Đã có | ❌ Thiếu haptic feedback test |
| Guest vs Auth (HP-011~012, ERR-001) | 3 cases | ⚠️ Manual only | ❌ Cần integration test |
| Enhanced: Today's Progress (ENH-HP-001~002, EC-001) | 3 cases | ⚠️ Chưa có | ❌ Cần thêm |

---

#### Feature 01 — Authentication

Review `authService` + `useAuthStore` so sánh với `01_authentication_tests.md`:

| TC Group | Test Cases | Unit Test? | Gap |
|----------|-----------|-----------|-----|
| Onboarding (HP-001~003, EC-001) | 4 cases | ✅ `useAppStore.test.ts` | ✅ Đủ |
| Google OAuth (HP-004~006, ERR-001~003, EC-001) | 7 cases | ✅ `authService.test.ts` | ❌ Thiếu: user hủy OAuth (ERR-001), double-tap (EC-001), offline login (ERR-002) |
| Token Management (HP-007~009, ERR-004, EC-002) | 5 cases | ✅ Partial | ❌ Thiếu: token refresh thất bại (ERR-004), app upgrade (EC-002) |
| Logout (HP-010~012, ERR-005) | 4 cases | ✅ Có 2 | ❌ Thiếu: confirm dialog (HP-011), cancel (HP-012), offline logout (ERR-005) |
| Guest Mode (ENH-HP-001~002, EC-001) | 3 cases | ❌ Chưa có | ❌ Cần thêm nếu đã implement |

---

#### Feature 07 — History

Review `useHistoryStore` + `historyApi` + `historyHelpers` so sánh với `07_history_tests.md`:

| TC Group | Test Cases | Unit Test? | Gap |
|----------|-----------|-----------|-----|
| History List (HP-001~004) | 4 cases | ✅ 57 tests total | ✅ Đã cover store + helpers + API |
| Filters (HP-005~008) | 4 cases | ✅ Store filters tested | ✅ Đủ |
| Empty State (HP-014~015) | 2 cases | ✅ Store tested | ✅ Đủ |
| Stats (HP-017~018) | 2 cases | ✅ Stats tests có | ✅ Đủ |
| Error States (ERR-001~002) | 2 cases | ✅ API service tested | ✅ Đủ |
| Search (ENH-HP-001~004) | 4 cases | ✅ searchQuery tested | ⚠️ Đủ store, debounce cần manual |
| Gestures (ENH-HP-005~008) | 3 cases | ✅ togglePin/remove tested | ⚠️ Gesture cần manual |
| Pagination (ENH-HP-016~017) | 2 cases | ✅ Pagination tested | ✅ Đủ |
| Smoke (S1~S10) | 10 cases | — Manual only | 📋 Manual checklist |
| Monkey (M1~M22) | 22 cases | — Manual only | 📋 Manual checklist |
| Manual (MT-01~MT-40) | 40 cases | — Device testing | 📋 Manual checklist |

---

#### Feature 08 — Profile & Settings

Review `useSettingsStore` + screens so sánh với `08_profile_settings_tests.md`:

| TC Group | Test Cases | Unit Test? | Gap |
|----------|-----------|-----------|-----|
| Profile Screen (HP-001~003, EC-001) | 4 cases | ❌ Không có | ❌ **Cần tạo** |
| Theme Toggle (HP-004~007) | 4 cases | ✅ `useAppStore` toggleTheme | ⚠️ Cần bổ sung auto/persist |
| Logout (HP-008) | 1 case | ✅ Cross-ref Auth | ✅ Đủ |
| About (HP-009~011) | 3 cases | ❌ Manual only | 📋 Manual |
| Appearance Enhanced (ENH-HP-001~004, EC-001) | 5 cases | ❌ Chưa có | ❌ **Cần tạo** nếu đã implement |
| Avatar (ENH-HP-005~006, ERR-001, EC-002) | 4 cases | ❌ Manual only | 📋 Manual |
| Notification (ENH-HP-007~010, ERR-002) | 5 cases | ❌ Manual/E2E | 📋 Manual |
| Audio Settings (ENH-HP-011~016) | 6 cases | ❌ **CHƯA CÓ** | ❌ **Cần tạo `useSettingsStore.test.ts`** |
| Download & Storage (ENH-HP-017~020) | 4 cases | ❌ Manual only | 📋 Manual |
| Privacy (ENH-HP-021~024, ERR-003, EC-003) | 6 cases | ❌ **CHƯA CÓ** | ❌ **Cần tạo tests** |
| Speaking Goal (ENH-HP-025~026) | 2 cases | ❌ Manual | 📋 Manual |

> **⚠️ IMPORTANT:** `useSettingsStore.ts` có 10 actions (audio + privacy) nhưng **0 unit tests**. Đây là gap lớn nhất!

---

#### ~~Feature 09 — Special Modes (Advanced Phase)~~ → **SKIP**

> ✅ Đã SKIP theo quyết định của user. Thuộc Advanced Phase, chưa implement.

---

#### Feature 10 — Native Features

| TC Group | Test Cases | Unit Test? | Gap |
|----------|-----------|-----------|-----|
| Gesture System (ENH-HP-001~008) | 8 cases | ❌ Manual | 📋 Manual (device only) |
| Haptic Feedback (ENH-HP-009~016, EC-001) | 9 cases | ❌ Manual | 📋 Manual (device only) |
| Push Notifications (ENH-HP-017~021, ERR-001) | 6 cases | ❌ Manual | 📋 Manual |
| Background Audio (ENH-HP-022~027) | 6 cases | ⚠️ Partial — `trackPlayer.test.ts` | ⚠️ Cần verify coverage |
| Offline Mode (ENH-HP-028~033, ERR-002, EC-002~004) | 10 cases | ❌ Manual | 📋 Manual |
| ~~iOS/Android Widgets, Voice, Deep Link, Rich Notif, Lock Screen~~ | ~~25 cases~~ | **SKIP** | ✅ SKIP theo quyết định user |

---

### Phase 2: Unit Test Implementation

#### [NEW] useSettingsStore.test.ts

File: `apps/mobile/src/__tests__/store/useSettingsStore.test.ts`

Tạo mới ~25-30 tests:

| Group | Tests | Covers TCs |
|-------|-------|-----------|
| Default state | 3 | Verify audio/privacy defaults |
| Audio: setBackgroundMusic | 2 | ENH-HP-011 |
| Audio: setMusicVolume | 3 | ENH-HP-011 (boundary 0, 50, 100) |
| Audio: setMusicDucking | 2 | ENH-HP-012 |
| Audio: setPlaybackSpeed | 3 | ENH-HP-013 (0.5, 1.0, 2.0) |
| Audio: setSoundEffects | 2 | ENH-HP-014 |
| Audio: setAutoPlay | 2 | ENH-HP-015 |
| Audio: setHandsFree | 2 | ENH-HP-016 |
| Privacy: setSaveRecordings | 2 | ENH-HP-021 |
| Privacy: setAutoDeleteDays | 3 | ENH-HP-022 (30, 60, 90) |
| Privacy: setDataSync | 2 | ENH-HP-023 partial |
| State isolation | 2 | Audio change doesn't affect privacy |

#### [MODIFY] dashboard.test.ts

Bổ sung tests:

| Test | Covers TC |
|------|----------|
| Greeting "Still studying" (22:00-05:59) | MOB-DASH-MVP-HP-004 |
| Greeting tên dài 50+ ký tự | MOB-DASH-MVP-EC-001 |
| Streak = 0 (user mới) | MOB-DASH-MVP-HP-006 |
| Streak milestone detection (7/30/100) | MOB-DASH-MVP-EC-002 |
| Enhanced: Today's Progress calculation | MOB-DASH-ENH-HP-001 |

#### [MODIFY] authService.test.ts / useAuthStore.test.ts

Bổ sung tests:

| Test | Covers TC |
|------|----------|
| User hủy OAuth → không crash | MOB-AUTH-MVP-ERR-001 |
| Token refresh thất bại → logout | MOB-AUTH-MVP-ERR-004 |
| Trạng thái khi offline | MOB-AUTH-MVP-ERR-002 |

---

### Phase 3: Manual Testing Checklist

#### Cross-Module Smoke (13 items)
Items cần verify: #1-9, #26-29 từ `SMOKE_TEST_CHECKLIST.md`

#### Feature-specific Manual Tests

| Feature | Source | Items |
|---------|-------|-------|
| History | `07_history_tests.md` §SMOKE + §MONKEY + §MANUAL | 72 |
| Profile | `08_profile_settings_tests.md` | ~13 |
| Native | `10_native_features_tests.md` | ~29 |
| Cross-Module | `MANUAL_TEST_PLAYBOOK.md` Flow G | 3 |

---

## Skills & Tools sử dụng

| Tool | Mục đích |
|------|----------|
| `testing-patterns` skill | AAA pattern, mocking strategies, test pyramid |
| `/test` workflow | Generate + run tests |
| `clean-code` skill | Code review standards |
| `webapp-testing` skill | E2E testing patterns |
| `systematic-debugging` skill | Nếu phát hiện bugs |
| Jest CLI | `npx jest --verbose` |

---

## Verification Plan

### Automated Tests

```bash
# 1. Chạy toàn bộ unit tests hiện tại
npx jest --verbose

# 2. Chạy specific feature tests (sau khi bổ sung)
npx jest --verbose src/__tests__/store/useSettingsStore.test.ts
npx jest --verbose src/__tests__/components/dashboard.test.ts
npx jest --verbose src/__tests__/store/useAuthStore.test.ts
npx jest --verbose src/__tests__/services/authService.test.ts

# 3. Coverage report
npx jest --coverage --verbose \
  --collectCoverageFrom='src/store/useSettingsStore.ts' \
  --collectCoverageFrom='src/store/useAppStore.ts' \
  --collectCoverageFrom='src/store/useAuthStore.ts' \
  --collectCoverageFrom='src/store/useHistoryStore.ts' \
  --collectCoverageFrom='src/utils/historyHelpers.ts' \
  --collectCoverageFrom='src/services/api/history.ts' \
  --collectCoverageFrom='src/services/supabase/auth.ts'
```

> Tất cả commands chạy từ thư mục `apps/mobile/`

### Manual Verification

Anh zai Thành cần test trên device thật (iPad đang connected):

1. **Smoke Test** (~5 phút): Theo `SMOKE_TEST_CHECKLIST.md` — items #1-9, #26-29
2. **History Manual** (~20 phút): Theo `07_history_tests.md` — section "MANUAL TEST CHECKLIST"
3. **Profile Manual** (~10 phút): Settings screens (Audio/Privacy/Appearance) — toggle and verify persistence
4. **Native Features Manual** (~15 phút): Haptic, gestures, background audio — theo `MANUAL_TEST_PLAYBOOK.md`

### Acceptance Criteria

| Tiêu chí | Target |
|----------|--------|
| 🔴 Critical bugs | **0** |
| Unit test pass rate | **100%** |
| Core logic coverage | **>80%** |
| Smoke tests pass | **100%** (13 items) |
| Monkey tests pass | **Không crash** sau 10 phút |

---

## Thứ tự thực hiện

| Phase | Mô tả | Est. Tool Calls |
|-------|--------|----------------|
| 1 | Code Review (đọc code, so sánh test cases) | ~15 |
| 2 | Viết unit tests mới + bổ sung | ~20 |
| 3 | Chạy Jest, verify pass | ~5 |
| 4 | Manual testing (cần anh zai test trên device) | User action |
| 5 | Tổng hợp report | ~5 |

---

## User Review Required

> **⚠️ IMPORTANT:**
> 1. **Special Modes (Feature 09):** Thuộc Advanced phase, chưa implement. Anh có muốn **skip review** hoàn toàn, hay vẫn muốn **review docs** để đảm bảo test cases đầy đủ cho khi implement?
> 2. **Native Features Advanced (Widgets, Voice, Deep Link):** Tương tự — skip hay review docs?
> 3. **Manual testing trên device:** Anh có muốn em tạo 1 consolidated checklist dễ follow trên device không?
