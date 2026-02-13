# 📜 History - Test Scenarios

> **Module:** History
> **Phase:** MVP → Enhanced → Advanced
> **Ref:** `docs/mobile/features/07_History.md`
> **Last updated:** 2026-02-13

---

## MVP Phase

### 1. History List Screen

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-MVP-HP-001 | ✅ | Mở History tab | 1. Tap History trong bottom nav | SectionList hiển thị sessions grouped by date (Hôm nay, Hôm qua, Tuần này) | 🔴 |
| MOB-HIS-MVP-HP-002 | ✅ | Session cards hiển thị đúng | 1. Xem list sessions | Mỗi card: accent border (blue/green/amber), icon skill, topic, subtitle, timestamp | 🔴 |
| MOB-HIS-MVP-HP-003 | ✅ | Tap session → Detail | 1. Tap vào 1 session card | TODO Sprint 2: Mở detail view | 🔴 |
| MOB-HIS-MVP-HP-004 | ✅ | Pull to refresh | 1. Pull down list | RefreshControl animation → data tải lại + stats update | 🟡 |

### 2. Filter by Skill

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-MVP-HP-005 | ✅ | Filter: All | 1. Tap "📋 Tất cả" pill | Hiển thị tất cả sessions, pill có border indigo | 🟡 |
| MOB-HIS-MVP-HP-006 | ✅ | Filter: Listening only | 1. Tap 🎧 Nghe | Chỉ hiện sessions Listening, pill bg blue, cards border blue | 🟡 |
| MOB-HIS-MVP-HP-007 | ✅ | Filter: Speaking only | 1. Tap 🗣️ Nói | Chỉ hiện sessions Speaking, pill bg green, cards border green | 🟡 |
| MOB-HIS-MVP-HP-008 | ✅ | Filter: Reading only | 1. Tap 📖 Đọc | Chỉ hiện sessions Reading, pill bg amber, cards border amber | 🟡 |

### 3. Empty State

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-MVP-HP-014 | ✅ | No history (user mới) | 1. User mới mở History | Icon 📚 + "Chưa có lịch sử học tập" + 3 CTA buttons (Nghe/Nói/Đọc) | 🟡 |
| MOB-HIS-MVP-HP-015 | ✅ | Empty filtered view | 1. Filter listening<br>2. No listening sessions | "Chưa có bài nghe nào" + CTA "Luyện nghe ngay" | 🟡 |

### 4. Skeleton Loading

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-MVP-HP-016 | ✅ | Loading state | 1. Mở History (first load) | Shimmer skeleton: 4 card skeletons với border xám, opacity pulse | 🟢 |
| MOB-HIS-MVP-EC-001 | ⚠️ | Slow network loading | 1. Throttle network → mở History | Skeleton hiển thị đủ lâu, transition smooth sang data | 🟢 |

### 5. Stats Bar

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-MVP-HP-017 | ✅ | Stats hiển thị đúng | 1. Mở History có data | 3 cards: 🔥 Streak, 📚 Hôm nay count, 📈 Tuần này count | 🟡 |
| MOB-HIS-MVP-HP-018 | ✅ | Stats loading skeleton | 1. First load | 3 skeleton cards thay cho stats | 🟢 |

### 6. Error States

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-MVP-ERR-001 | ❌ | API lỗi khi load | 1. Server down → mở History | Banner đỏ: "❌ {error message}" | 🔴 |
| MOB-HIS-MVP-ERR-002 | ❌ | Mất mạng giữa chừng | 1. Đang xem → tắt WiFi → pull-to-refresh | Error banner hiện, data cũ vẫn hiển thị | 🟡 |

---

## Enhanced Phase

### 7. Search

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-ENH-HP-001 | ✅ | Search history | 1. Tap 🔍<br>2. Gõ "coffee" | Results hiển thị sessions có "coffee" trong topic | 🟡 |
| MOB-HIS-ENH-HP-003 | ✅ | Search debounce 300ms | 1. Gõ nhanh "coff" | Chỉ search sau 300ms ngưng gõ, không mỗi ký tự | 🟡 |
| MOB-HIS-ENH-HP-004 | ✅ | Clear search | 1. Tap ✕ trên header | Clear text, ẩn search bar, hiển thị full list | 🟢 |
| MOB-HIS-ENH-EC-002 | ⚠️ | Search không có kết quả | 1. Search "xyzabc" | EmptyState hiển thị | 🟢 |

### 8. Quick Actions & Gestures

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-ENH-HP-005 | ✅ | Swipe left → Delete | 1. Swipe left trên session card | Red background reveal (🗑️ Xóa) → tap → optimistic delete | 🟡 |
| MOB-HIS-ENH-HP-006 | ✅ | Swipe right → Pin | 1. Swipe right | Yellow background → 📌 Ghim/Bỏ ghim toggle | 🟡 |
| MOB-HIS-ENH-HP-008 | ✅ | Card press animation | 1. Tap session card | Scale 0.97x feedback + navigate | 🟢 |

### 9. Visual Identity

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-ENH-HP-013 | ✅ | Accent colors đúng | 1. Xem list mixed sessions | Listening = #4F46E5 (indigo), Speaking = #16A34A (green), Reading = #D97706 (amber) | 🟢 |
| MOB-HIS-ENH-HP-014 | ✅ | Pin/Fav badges | 1. Pin + favorite 1 entry | 📌 và ⭐ badges hiện bên cạnh title | 🟢 |
| MOB-HIS-ENH-HP-015 | ✅ | Date sections | 1. Xem list nhiều ngày | Section headers: "─── Hôm nay ───", "─── Hôm qua ───", etc. | 🟢 |

### 10. Pagination

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-ENH-HP-016 | ✅ | Load more khi scroll | 1. Scroll tới cuối list | "Đang tải thêm..." spinner → entries mới append | 🟡 |
| MOB-HIS-ENH-HP-017 | ✅ | Hết data → không load thêm | 1. Scroll cuối khi đã hết pages | Không gọi API thêm, footer padding only | 🟢 |

---

## 🧪 SMOKE TEST CHECKLIST

> **Mục đích:** Kiểm tra nhanh các chức năng cốt lõi sau mỗi build/deploy
> **Thời gian:** ~5 phút
> **Khi nào chạy:** Sau mỗi PR merge, trước release, sau deploy

| # | Test Case | Steps | Expected | ✅/❌ |
|---|-----------|-------|----------|------|
| S1 | Mở History tab | Tap History bottom nav | Màn hình load, không crash | ☐ |
| S2 | Data hiển thị | Chờ load xong | Entries hoặc empty state hiện ra, skeleton biến mất | ☐ |
| S3 | Stats bar | Quan sát stats row | 3 stats cards (Streak/Hôm nay/Tuần này) có data hoặc loading | ☐ |
| S4 | Filter pills | Tap 🎧 rồi tap 📋 | List thay đổi theo filter, pill highlight đúng | ☐ |
| S5 | Pull-to-refresh | Pull down list | RefreshControl animation → data reload | ☐ |
| S6 | Search toggle | Tap 🔍 → gõ text → tap ✕ | Search bar mở/đóng smooth, kết quả hiện khi gõ | ☐ |
| S7 | Swipe card | Swipe left 1 card | Red delete action hiện, card không vỡ layout | ☐ |
| S8 | Empty state CTA | Filter 1 loại không có data → tap CTA | Navigate đến module đúng | ☐ |
| S9 | Scroll performance | Scroll nhanh qua 20+ entries | Không jank, FPS ≥ 55 | ☐ |
| S10 | Dark mode | Toggle dark mode → mở History | Tất cả text/bg/border đúng theme | ☐ |

---

## 🐒 MONKEY TEST SCENARIOS

> **Mục đích:** Test ổn định bằng các thao tác ngẫu nhiên, bất thường để tìm crash/UI break
> **Thời gian:** ~10-15 phút mỗi round
> **Khi nào chạy:** Trước release, sau major refactor

### Round 1: Stress Filter + Search (~3 phút)

| # | Thao tác | Mục đích | Quan sát |
|---|----------|----------|----------|
| M1 | Tap nhanh liên tục 4 filter pills (🎧→🗣️→📖→📋) 10 lần | Race condition khi API đang load | Không crash, data cuối match filter cuối |
| M2 | Mở search → gõ rất nhanh 50+ ký tự → xóa hết → gõ lại | Debounce hoạt động, memory leak | Input responsive, không lag, 1 API call cuối |
| M3 | Gõ search → đổi filter → gõ tiếp → clear → đổi filter | Compose filter + search | Kết quả đúng với cả 2 điều kiện |
| M4 | Spam tap 🔍 mở/đóng 20 lần liên tục | Animation state | Search bar không kẹt, không ghost input |

### Round 2: Gesture Chaos (~3 phút)

| # | Thao tác | Mục đích | Quan sát |
|---|----------|----------|----------|
| M5 | Swipe trái 1 card → không tap delete → swipe phải luôn | Swipeable reset state | Card trở về vị trí gốc, cả 2 action không trigger |
| M6 | Swipe trái card A → ngay lập tức swipe trái card B | Multi-swipe conflict | Card A tự đóng, card B mở. Chỉ 1 card open | 
| M7 | Swipe right (pin) → ngay lập tức pull-to-refresh | Optimistic update + refresh race | Pin state giữ nguyên sau refresh |
| M8 | Swipe left (delete) 5 cards liên tục rất nhanh | Batch delete stress | App không crash, entries giảm đúng số lượng |
| M9 | Tap card → back → tap card → back 20 lần nhanh | Navigation memory leak | Không lag, memory không tăng liên tục |

### Round 3: Extreme Scroll + Load (~3 phút)

| # | Thao tác | Mục đích | Quan sát |
|---|----------|----------|----------|
| M10 | Scroll rất nhanh xuống cuối → scroll lên đầu → lặp lại 10x | FlatList virtualization | Không blank rows, smooth 60fps |
| M11 | Scroll tới cuối (trigger loadMore) → ngay lập tức pull-to-refresh | Pagination + refresh conflict | Data đúng, không duplicate entries |
| M12 | Scroll → đổi filter giữa chừng → scroll tiếp | Filter reset scroll | List scroll về đầu, data mới hiện |
| M13 | Pull-to-refresh → khi đang loading, pull-to-refresh lần 2 | Double refresh | Chỉ 1 request, refreshing state đúng |

### Round 4: App Lifecycle (~3 phút)

| # | Thao tác | Mục đích | Quan sát |
|---|----------|----------|----------|
| M14 | Đang scroll History → chuyển sang tab khác → quay lại | Tab memory / state persist | Data + filter + scroll position giữ nguyên |
| M15 | Đang load History → minimize app → mở lại | Background/foreground | Load tiếp tục hoặc retry, không stuck loading |
| M16 | Xoay ngang → xoay dọc → xoay ngang (nếu hỗ trợ) | Orientation change | Layout không vỡ, data không mất |
| M17 | Mở History → lock screen → unlock → interact | Screen off/on memory | App không re-mount, state intact |
| M18 | Force close app → mở lại → mở History | Cold start | Load bình thường, không cache lỗi |

### Round 5: Edge Input (~2 phút)

| # | Thao tác | Mục đích | Quan sát |
|---|----------|----------|----------|
| M19 | Search gõ emoji: 🎧🗣️📖 | Unicode handling | Không crash, hiển thị đúng |
| M20 | Search gõ special chars: `<script>alert(1)</script>` | XSS safety | Hiển thị text thuần, không execute |
| M21 | Search gõ tiếng Việt có dấu: "Cà phê buổi sáng" | Vietnamese diacritics | Search hoạt động đúng |
| M22 | Search paste 1000+ ký tự | Long input boundary | Input truncate hoặc xử lý mượt |

---

## 📋 MANUAL TEST CHECKLIST (Device Test)

> **Mục đích:** Test trải nghiệm thực tế trên device, focus vào UX, visual, haptic
> **Thời gian:** ~20-30 phút
> **Thiết bị:** iPhone + Android device thực
> **Khi nào chạy:** Trước mỗi release

### A. First Impression (1 phút)

| # | Kiểm tra | Kỳ vọng | iOS | Android |
|---|----------|---------|-----|---------|
| MT-01 | Mở History tab lần đầu | Skeleton smooth, fade-in data, không flash trắng | ☐ | ☐ |
| MT-02 | Visual tổng thể | Layout cân đối, spacing đều, font đúng | ☐ | ☐ |
| MT-03 | Safe area | Header không bị notch/dynamic island che | ☐ | ☐ |
| MT-04 | Dark mode | Bg, text, border, card colors đúng dark theme | ☐ | ☐ |

### B. Interaction Feedback (5 phút)

| # | Kiểm tra | Kỳ vọng | iOS | Android |
|---|----------|---------|-----|---------|
| MT-05 | Tap card → scale feedback | Card co lại 0.97x rồi bounce back, cảm giác responsive | ☐ | ☐ |
| MT-06 | Swipe left → red background | Swipe mượt, 🗑️ Xóa text hiện từ từ, ngưỡng 80px | ☐ | ☐ |
| MT-07 | Swipe right → yellow background | Swipe mượt, 📌/📍 icon scale animation | ☐ | ☐ |
| MT-08 | Pull-to-refresh feel | RefreshControl ở đúng vị trí, indigo color, rotation smooth | ☐ | ☐ |
| MT-09 | Filter pill tap | Active pill highlight ngay, list transition mượt | ☐ | ☐ |
| MT-10 | Search open/close | Keyboard show đúng, focus input, close clear text | ☐ | ☐ |

### C. Data Accuracy (5 phút)

| # | Kiểm tra | Kỳ vọng | iOS | Android |
|---|----------|---------|-----|---------|
| MT-11 | Entries match API | So sánh data UI vs API response (devtools) | ☐ | ☐ |
| MT-12 | Stats đúng | Streak, Today, Week match API `/history/stats` | ☐ | ☐ |
| MT-13 | Filter đúng | Tap 🎧 → chỉ hiện listening entries | ☐ | ☐ |
| MT-14 | Search đúng | Search "coffee" → chỉ hiện entries có "coffee" | ☐ | ☐ |
| MT-15 | Date grouping đúng | Entries ngày hôm nay → section "Hôm nay" | ☐ | ☐ |
| MT-16 | Relative time đúng | Entry 5 phút trước → "5 phút trước" | ☐ | ☐ |
| MT-17 | Accent colors match type | Listening=indigo, Speaking=green, Reading=amber | ☐ | ☐ |

### D. Optimistic Updates (5 phút)

| # | Kiểm tra | Kỳ vọng | iOS | Android |
|---|----------|---------|-----|---------|
| MT-18 | Pin entry | Swipe right → 📌 badge hiện ngay (trước API response) | ☐ | ☐ |
| MT-19 | Unpin entry | Swipe right pinned entry → 📌 badge biến mất ngay | ☐ | ☐ |
| MT-20 | Delete entry | Swipe left → tap delete → card biến mất ngay | ☐ | ☐ |
| MT-21 | Delete + refresh | Delete → pull-to-refresh → entry đã xóa không hiện lại | ☐ | ☐ |
| MT-22 | Pin revert on error | Tắt mạng → pin → pin badge hiện → API lỗi → badge mất | ☐ | ☐ |

### E. Empty States (3 phút)

| # | Kiểm tra | Kỳ vọng | iOS | Android |
|---|----------|---------|-----|---------|
| MT-23 | Empty all | User mới → icon 📚, title, subtitle, 3 CTA buttons | ☐ | ☐ |
| MT-24 | Empty listening | Filter 🎧 (no data) → icon 🎧, CTA "Luyện nghe ngay" | ☐ | ☐ |
| MT-25 | Empty speaking | Filter 🗣️ (no data) → icon 🗣️, CTA "Luyện nói ngay" | ☐ | ☐ |
| MT-26 | Empty reading | Filter 📖 (no data) → icon 📖, CTA "Bắt đầu đọc" | ☐ | ☐ |
| MT-27 | CTA navigation | Tap CTA → navigate đến đúng module | ☐ | ☐ |

### F. Performance (3 phút)

| # | Kiểm tra | Kỳ vọng | iOS | Android |
|---|----------|---------|-----|---------|
| MT-28 | First load time | Screen data sẵn sàng < 2s (WiFi) | ☐ | ☐ |
| MT-29 | Scroll FPS | 50+ entries scroll mượt ≥ 55 FPS | ☐ | ☐ |
| MT-30 | Memory usage | Mở History → 5 phút scroll → memory stable | ☐ | ☐ |
| MT-31 | Pagination load | Scroll cuối → load more < 1s | ☐ | ☐ |
| MT-32 | Skeleton → data transition | Không flash, smooth fade | ☐ | ☐ |

### G. Typography & Spacing (2 phút)

| # | Kiểm tra | Kỳ vọng | iOS | Android |
|---|----------|---------|-----|---------|
| MT-33 | Header font | "📜 Lịch sử" bold 2xl, đúng font family | ☐ | ☐ |
| MT-34 | Card title ellipsis | Topic dài → truncate 1 line, "..." cuối | ☐ | ☐ |
| MT-35 | Keywords ellipsis | Keywords dài → truncate 1 line | ☐ | ☐ |
| MT-36 | Section header style | UPPERCASE, tracking-wider, xs size, neutrals400 | ☐ | ☐ |
| MT-37 | Card spacing | Cards cách nhau 12px (mb-3), padding 16px (p-4) | ☐ | ☐ |

### H. Accessibility (2 phút)

| # | Kiểm tra | Kỳ vọng | iOS | Android |
|---|----------|---------|-----|---------|
| MT-38 | Font scale 200% | Tăng font size hệ thống → UI không vỡ, text đọc được | ☐ | ☐ |
| MT-39 | VoiceOver/TalkBack | Elements có label, focus order hợp lý | ☐ | ☐ |
| MT-40 | Reduced motion | Bật reduced motion → animations tắt/giảm | ☐ | ☐ |

---

## 🤖 UNIT TEST COVERAGE

> **Đã implement tự động (Jest)**

| Test File | Tests | Status |
|-----------|-------|--------|
| `useHistoryStore.test.ts` | 24 | ✅ PASS |
| `historyHelpers.test.ts` | 20 | ✅ PASS |
| `historyApi.test.ts` | 13 | ✅ PASS |
| **Total** | **57** | **✅ ALL PASS** |

### Commands

```bash
# Chạy tất cả History tests
npx jest --verbose src/__tests__/store/useHistoryStore.test.ts src/__tests__/services/historyHelpers.test.ts src/__tests__/services/historyApi.test.ts

# Chạy với coverage
npx jest --coverage --verbose --collectCoverageFrom='src/store/useHistoryStore.ts' --collectCoverageFrom='src/utils/historyHelpers.ts' --collectCoverageFrom='src/services/api/history.ts'
```

---

## 🎯 E2E TEST FLOWS (Detox/Maestro)

> **Lưu ý:** E2E tests cần setup Detox/Maestro. Dưới đây là flows thiết kế sẵn.

### Flow 1: Happy Path — Xem lịch sử (MOB-HIS-E2E-001)

```
1. Login thành công
2. Navigate → History tab
3. Chờ skeleton biến mất
4. Assert: SectionList có ≥ 1 section
5. Assert: First card có title, icon, timestamp
6. Assert: Stats bar có 3 items
```

### Flow 2: Filter + Search (MOB-HIS-E2E-002)

```
1. Mở History tab
2. Tap filter "🎧 Nghe" → Assert: chỉ có listening entries
3. Tap filter "📋 Tất cả" → Assert: hiện lại tất cả
4. Tap 🔍 → Type "coffee"
5. Chờ 500ms (debounce)
6. Assert: entries match "coffee"
7. Tap ✕ → Assert: search bar ẩn, full list hiện
```

### Flow 3: Swipe Delete (MOB-HIS-E2E-003)

```
1. Mở History tab
2. Count entries = N
3. Swipe left first card
4. Tap delete button
5. Assert: entries count = N - 1
6. Pull-to-refresh
7. Assert: entries count vẫn = N - 1 (đã delete trên server)
```

### Flow 4: Swipe Pin (MOB-HIS-E2E-004)

```
1. Mở History tab
2. Find first unpinned card
3. Swipe right
4. Tap pin button
5. Assert: card có 📌 badge
6. Swipe right lần nữa
7. Tap unpin
8. Assert: 📌 badge biến mất
```

### Flow 5: Empty State → CTA Navigation (MOB-HIS-E2E-005)

```
1. Login user mới (không có history)
2. Navigate → History
3. Assert: EmptyState hiển thị "Chưa có lịch sử"
4. Tap "🎧 Bắt đầu nghe"
5. Assert: Navigate tới Listening screen
```

### Flow 6: Pagination Scroll (MOB-HIS-E2E-006)

```
1. Login user có 30+ entries
2. Navigate → History
3. Assert: có 20 entries (page 1)
4. Scroll xuống cuối
5. Assert: "Đang tải thêm..." spinner
6. Chờ load
7. Assert: entries > 20
```

---

## 📊 TEST COVERAGE MATRIX

| Feature | Unit | E2E | Smoke | Monkey | Manual |
|---------|------|-----|-------|--------|--------|
| List display | ✅ | ✅ | ✅ | - | ✅ |
| Filter pills | ✅ | ✅ | ✅ | ✅ M1 | ✅ |
| Search | ✅ | ✅ | ✅ | ✅ M2-M4 | ✅ |
| Stats bar | ✅ | ✅ | ✅ | - | ✅ |
| Swipe delete | ✅ | ✅ | ✅ | ✅ M5-M8 | ✅ |
| Swipe pin | ✅ | ✅ | - | ✅ M7 | ✅ |
| Pagination | ✅ | ✅ | - | ✅ M10-M11 | ✅ |
| Empty state | ✅ | ✅ | ✅ | - | ✅ |
| Skeleton | - | - | ✅ | - | ✅ |
| Dark mode | - | - | ✅ | - | ✅ |
| Optimistic update | ✅ | ✅ | - | ✅ M7 | ✅ |
| Performance | - | - | ✅ | ✅ M10 | ✅ |
| Accessibility | - | - | - | - | ✅ |
| App lifecycle | - | - | - | ✅ M14-M18 | - |
