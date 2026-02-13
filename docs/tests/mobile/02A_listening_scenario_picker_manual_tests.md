# 🎯 Scenario Picker — Manual Test, Smoke Test, Monkey Test & E2E

> **Module:** Listening → Chọn kịch bản (Scenario Picker)  
> **Phiên bản:** Redesign v2  
> **Ref:** `docs/mobile/features/02_Listening.md`, `implementation_plan.md`  
> **Ngày tạo:** 13/02/2026  
> **Tác giả:** Antigravity (QA Lead / Test Engineer)

---

## 📋 Mục lục

1. [Manual Test Cases](#1-manual-test-cases)
2. [Smoke Test Checklist](#2-smoke-test-checklist)  
3. [Monkey Test Scenarios](#3-monkey-test-scenarios)
4. [E2E Test Flows](#4-e2e-test-flows)
5. [Hướng dẫn test trên device thật](#5-hướng-dẫn-test-trên-device-thật)

---

## 1. Manual Test Cases

### 1.1 Mở Modal — Pill Handle & Header

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| SP-MAN-001 | ✅ | Mở modal Chọn kịch bản | 1. Mở ConfigScreen​<br>2. Nhấn "Chọn kịch bản >" | Modal slide up, có pill handle 36×4px ở top, title "📋 Chọn kịch bản", nút X bên phải | 🔴 |
| SP-MAN-002 | ✅ | Đóng modal bằng nút X | 1. Mở modal​<br>2. Nhấn X | Modal đóng mượt, giữ nguyên state chọn trước đó | 🟡 |
| SP-MAN-003 | ✅ | Đóng modal bằng swipe down | 1. Mở modal​<br>2. Swipe down từ pill handle | Modal dismiss, iOS pageSheet behavior mượt | 🟡 |
| SP-MAN-004 | ⚠️ | Đóng modal bằng hardware back (Android) | 1. Mở modal​<br>2. Nhấn nút Back | Modal đóng, không crash | 🔴 |

### 1.2 Search Bar — Debounce 300ms

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| SP-MAN-005 | ✅ | Search tìm thấy kết quả | 1. Mở modal​<br>2. Gõ "interview" vào search bar | Sau ~300ms hiện kết quả, mỗi item có category badge (ví dụ "👤 Personal Life") | 🔴 |
| SP-MAN-006 | ✅ | Search không tìm thấy | 1. Gõ "xyznotexist" | Hiện empty state: 🔍 icon + "Không tìm thấy kịch bản nào" + gợi ý "Thử từ khóa khác" | 🟡 |
| SP-MAN-007 | ✅ | Xóa search text | 1. Đang search​<br>2. Nhấn nút X bên phải search bar | Search text xóa, quay về hiển thị category tabs | 🟡 |
| SP-MAN-008 | ⚠️ | Gõ rất nhanh (keyboard mashing) | 1. Gõ nhanh liên tục 20 ký tự | Không lag, debounce 300ms chỉ search lần cuối | 🟡 |
| SP-MAN-009 | ⚠️ | Search ký tự đặc biệt | 1. Gõ `@#$%^&*()` | Không crash, hiện 0 results | 🟢 |
| SP-MAN-010 | ⚠️ | Search Unicode / emoji | 1. Gõ emoji 🎧 hoặc tiếng Việt "họp" | Không crash, trả kết quả nếu có match | 🟢 |

### 1.3 Category Tabs

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| SP-MAN-011 | ✅ | Chuyển tab IT & Technology | 1. Nhấn tab "💻 IT & Technology" | Tab highlight xanh, hiện subcategories của IT | 🔴 |
| SP-MAN-012 | ✅ | Chuyển tab Daily Survival | 1. Nhấn tab "🌍 Daily Survival" | Tab highlight, hiện subcategories Daily | 🟡 |
| SP-MAN-013 | ✅ | Chuyển tab Personal Life | 1. Nhấn tab "👤 Personal Life" | Tab highlight, hiện subcategories Personal | 🟡 |
| SP-MAN-014 | ✅ | Tab "⭐ Yêu thích" khi chưa star | 1. Nhấn tab "⭐ Yêu thích"​<br>2. Chưa star gì | Empty state: icon ⭐ + "Chưa có kịch bản yêu thích" + hướng dẫn | 🟡 |
| SP-MAN-015 | ✅ | Tab "⭐ Yêu thích" khi có favorites | 1. Star 2 scenarios ở tab khác​<br>2. Quay lại tab "⭐ Yêu thích" | Hiện 2 items với category badge, badge count "2" trên tab | 🔴 |
| SP-MAN-016 | ✅ | Tab "✨ Tuỳ chỉnh" | 1. Nhấn tab "✨ Tuỳ chỉnh" | Hiện form CustomScenarioInput inline trong modal | 🔴 |
| SP-MAN-017 | ⚠️ | Scroll ngang tabs (nhiều tabs) | 1. Scroll ngang trên tabs | Scroll mượt, tabs không bị cắt | 🟢 |

### 1.4 SubCategory Accordion

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| SP-MAN-018 | ✅ | Mở accordion | 1. Nhấn subcategory header (ví dụ "Agile Ceremonies") | Accordion mở với animated chevron xoay 180°, hiện danh sách scenarios | 🟡 |
| SP-MAN-019 | ✅ | Đóng accordion | 1. Nhấn lại subcategory đang mở | Accordion đóng, chevron xoay về 0°, scenarios ẩn | 🟡 |
| SP-MAN-020 | ✅ | Badge count hiện đúng | 1. Xem subcategory header | Badge hiện số scenarios đúng (ví dụ "5") | 🟢 |
| SP-MAN-021 | ⚠️ | Mở accordion A → Mở accordion B | 1. Mở "Agile"​<br>2. Mở "Technical" | "Technical" mở, "Agile" đóng (chỉ 1 accordion mở 1 lúc) | 🟡 |

### 1.5 Scenario Selection

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| SP-MAN-022 | ✅ | Chọn scenario | 1. Mở accordion​<br>2. Nhấn 1 scenario | Item highlight xanh (border-primary, bg-primary/10), scale animation 0.97→1 | 🔴 |
| SP-MAN-023 | ✅ | Bỏ chọn scenario | 1. Đã chọn scenario​<br>2. Nhấn lại scenario đó | Item trở về normal state, footer CTA đổi sang "Gợi ý ngẫu nhiên" | 🟡 |
| SP-MAN-024 | ✅ | Chọn scenario khác | 1. Đã chọn A​<br>2. Nhấn scenario B | A bỏ highlight, B highlight xanh | 🟡 |
| SP-MAN-025 | ✅ | Indicator "Đã chọn" hiện | 1. Chọn scenario | Hiện indicator "✅ Đã chọn: {name}" ở bottom nội dung, có nút X bỏ chọn | 🟡 |

### 1.6 Star / Favorite Toggle

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| SP-MAN-026 | ✅ | Star scenario | 1. Nhấn ☆ icon trên scenario item | Icon đổi thành ⭐ (vàng), haptic light | 🟡 |
| SP-MAN-027 | ✅ | Un-star scenario | 1. Nhấn ⭐ đang active | Icon đổi lại ☆ (xám), haptic light | 🟡 |
| SP-MAN-028 | ✅ | Star hiện ở tab Yêu thích | 1. Star scenario X​<br>2. Chuyển tab "⭐ Yêu thích" | Scenario X hiện trong danh sách, có category badge | 🔴 |
| SP-MAN-029 | ⚠️ | Un-star từ tab Yêu thích | 1. Ở tab Yêu thích​<br>2. Un-star 1 scenario | Scenario biến mất khỏi list, count badge giảm 1 | 🟡 |

### 1.7 Sticky Footer CTA

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| SP-MAN-030 | ✅ | Footer khi chưa chọn | 1. Mở modal (chưa chọn scenario) | Hiện "🎲 Gợi ý ngẫu nhiên" border-primary, bg-primary/15 | 🔴 |
| SP-MAN-031 | ✅ | Nhấn "Gợi ý ngẫu nhiên" | 1. Nhấn button "🎲 Gợi ý ngẫu nhiên" | Random scenario được chọn, footer đổi sang "✅ Xác nhận: {name}", haptic medium | 🔴 |
| SP-MAN-032 | ✅ | Footer khi đã chọn | 1. Chọn 1 scenario | Footer đổi sang "✅ Xác nhận: {name}" bg-primary, shadow glow | 🔴 |
| SP-MAN-033 | ✅ | Nhấn "Xác nhận" | 1. Chọn scenario​<br>2. Nhấn "✅ Xác nhận" | Modal đóng, scenario được giữ lại ở ConfigScreen, haptic success | 🔴 |
| SP-MAN-034 | ⚠️ | Nhấn "Gợi ý ngẫu nhiên" nhiều lần | 1. Nhấn random 5 lần liên tục | Mỗi lần đổi scenario khác, không crash, UI cập nhật mượt | 🟡 |

### 1.8 Custom Scenario (Tab "✨ Tuỳ chỉnh")

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| SP-MAN-035 | ✅ | Tạo custom scenario nhanh | 1. Tab "Tuỳ chỉnh"​<br>2. Nhập tên "Họp khách hàng"​<br>3. Nhấn "Sử dụng ngay" | Modal đóng, ConfigScreen hiện topic "Họp khách hàng" | 🔴 |
| SP-MAN-036 | ✅ | Lưu custom scenario | 1. Tab "Tuỳ chỉnh"​<br>2. Nhập tên + mô tả​<br>3. Nhấn "Lưu lại" | Toast thông báo đã lưu, form reset | 🟡 |
| SP-MAN-037 | ❌ | Custom scenario input rỗng | 1. Tab "Tuỳ chỉnh"​<br>2. Không nhập gì​<br>3. Nhấn "Sử dụng ngay" | Toast warning "Chưa nhập tên" | 🟡 |

---

## 2. Smoke Test Checklist

> **Mục đích:** Quick sanity check trước mỗi release. Chạy trong 5-10 phút.  
> **Ai test:** QA hoặc dev  
> **Khi nào:** Sau mỗi build mới, trước đẩy TestFlight/APK

| # | Checklist Item | Action | ✅/❌ |
|---|---------------|--------|-------|
| S1 | Modal mở được | Tap "Chọn kịch bản" → modal hiện | ⬜ |
| S2 | Pill handle visible | Nhìn thấy thanh handle ở top | ⬜ |
| S3 | Tabs hoạt động | Tap qua 5 tabs → không crash | ⬜ |
| S4 | Search hoạt động | Gõ "meeting" → có kết quả | ⬜ |
| S5 | Accordion mở/đóng | Tap subcategory → expand/collapse | ⬜ |
| S6 | Chọn scenario | Tap item → highlight xanh | ⬜ |
| S7 | Star hoạt động | Tap ☆ → đổi thành ⭐ | ⬜ |
| S8 | Tab Yêu thích hiện đúng | Star item → tab Yêu thích hiện item | ⬜ |
| S9 | Footer CTA hoạt động | Thấy "Gợi ý ngẫu nhiên" → chọn → "Xác nhận" | ⬜ |
| S10 | Xác nhận đóng modal | Tap "Xác nhận" → modal đóng, topic lưu | ⬜ |
| S11 | Tab Tuỳ chỉnh hiện form | Tap "Tuỳ chỉnh" → form nhập hiện | ⬜ |
| S12 | Swipe down đóng modal | Swipe down → modal dismiss | ⬜ |

---

## 3. Monkey Test Scenarios

> **Mục đích:** Tìm crash/hang bằng cách thao tác ngẫu nhiên, nhanh, không theo luồng. Simulate hành vi thật của user.  
> **Ai test:** QA, dev, hoặc bất kỳ ai — KHÔNG cần kiến thức kỹ thuật  
> **Thời gian:** 15-20 phút mỗi session  
> **Thiết bị:** iOS + Android, landscape + portrait

### 3.1 Speed Tap Monkey 🐵 (5 phút)

**Hành động:** Nhấn thật nhanh, liên tục, không suy nghĩ.

| # | Hành động | Kỳ vọng | Ghi chú |
|---|----------|---------|---------|
| M01 | Tap nút "Chọn kịch bản" 10 lần liên tục (mở/đóng) | Không crash, modal mở/đóng đúng | Kiểm tra race condition |
| M02 | Mở modal → tap tất cả 5 tabs nhanh trong 3 giây | Tab active cuối cùng đúng, không flicker | Stress test state switching |
| M03 | Tap ☆ star trên 1 item 20 lần liên tục | Star toggle đúng (chẵn=off, lẻ=on), không crash | Toggle stress |
| M04 | Accordion: tap mở/đóng 3 subcategories nhanh | Chỉ 1 accordion mở cuối, animation không giật | Layout animation stress |
| M05 | Scenario items: tap 10 items khác nhau nhanh trong 5 giây | Item cuối cùng được highlight, không crash | Selection stress |
| M06 | "Gợi ý ngẫu nhiên": tap 10 lần nhanh | Mỗi lần scenario đổi, footer hiện đúng tên | Random + state update stress |
| M07 | Tap "Xác nhận" khi đang animation | Modal đóng sạch, không double-trigger | Animation interrupt |

### 3.2 Input Chaos Monkey 🙈 (5 phút)

**Hành động:** Nhập liệu lung tung vào search và custom form.

| # | Hành động | Kỳ vọng | Ghi chú |
|---|----------|---------|---------|
| M08 | Search: gõ 100 ký tự "aaaa..."  | Không lag, debounce hoạt động | Long input stress |
| M09 | Search: paste 1000 ký tự | Search bar truncate hoặc xử lý | Overflow test |
| M10 | Search: gõ → xóa → gõ → xóa 20 lần | Kết quả search đúng cuối cùng | Debounce cancel stress |
| M11 | Custom tab: nhập emoji 🎧🎵🎶🎤🎼 vào tên | Lưu/sử dụng bình thường | Unicode input |
| M12 | Custom tab: nhập mô tả 500 ký tự | Form không bị overflow, text scroll | Multiline overflow |
| M13 | Search: gõ nhanh "a" rồi nhanh xóa trước 300ms | Không hiện kết quả search (debounce cancel) | Debounce cancel |

### 3.3 Navigation Chaos Monkey 🐒 (5 phút)

**Hành động:** Chuyển tab, mở modal, đóng modal, quay lại, không theo luồng.

| # | Hành động | Kỳ vọng | Ghi chú |
|---|----------|---------|---------|
| M14 | Mở modal → chọn scenario → swipe down (không confirm) | Scenario vẫn được giữ khi mở lại modal | State persistence |
| M15 | Mở modal → search "test" → đóng → mở lại | Search bar reset (rỗng), tabs hiện bình thường | State cleanup |
| M16 | Chọn scenario → đổi tab → quay lại tab cũ | Scenario vẫn highlight, accordion vẫn mở | Cross-tab state |
| M17 | Tab Tuỳ chỉnh → nhập nửa tên → đổi tab → quay lại | Form input giữ nguyên hoặc reset (tùy design) | Tab switching form state |
| M18 | Xoay màn hình portrait ↔ landscape khi modal mở | Layout không vỡ, content không bị cắt | Rotation handling |
| M19 | Kéo keyboard lên → đóng keyboard → mở lại | Search bar và content không nhảy | Keyboard avoidance |
| M20 | Mở modal → nhận notification → quay lại | Modal vẫn active, state đúng | Background interrupt |

### 3.4 Extreme Monkey 🦍 (5 phút)

**Hành động:** Tình huống edge case cực đoan.

| # | Hành động | Kỳ vọng | Ghi chú |
|---|----------|---------|---------|
| M21 | Star TẤT CẢ 140+ scenarios rồi vào tab Yêu thích | Tab không crash, scroll mượt, render OK | Large list performance |
| M22 | Mở modal → lock screen → unlock | Modal vẫn hiện, state đúng | App lifecycle |
| M23 | Mở modal → nhận cuộc gọi → kết thúc → quay lại | Modal và state nguyên vẹn | System interrupt |
| M24 | Dùng VoiceOver/TalkBack navigate toàn bộ modal | Tất cả elements có accessible label tiếng Việt | Accessibility |
| M25 | Double-tap nhanh nút "Xác nhận" | Modal chỉ đóng 1 lần, không navigate 2 lần | Double trigger prevention |

---

## 4. E2E Test Flows

> **Mục đích:** Test full user flow từ đầu đến cuối.  
> **Công cụ gợi ý:** Detox, Maestro, hoặc manual  
> **Thời gian:** 30-40 phút cho tất cả flows

### Flow 1: Happy Path — Chọn từ danh mục

```
1. Mở app → Navigate tới Listening
2. Tap "Chọn kịch bản >"
3. Verify: Modal mở, pill handle hiện, 5 tabs hiện
4. Tap tab "💻 IT & Technology"
5. Verify: Subcategories hiện (Agile, Technical...)
6. Tap "Agile Ceremonies" accordion
7. Verify: Accordion expand, chevron xoay 180°, scenarios hiện
8. Tap "Daily Stand-up Update"
9. Verify: Item highlight xanh, footer "✅ Xác nhận: Daily Stand-up Update"
10. Tap "✅ Xác nhận"
11. Verify: Modal đóng, ConfigScreen hiện topic "Daily Stand-up Update"
12. Verify: Nút "Bắt đầu nghe" enabled
```

**Kết quả kỳ vọng:** User flow mượt, 0 lỗi, < 500ms cho mỗi interaction.

### Flow 2: Search → Select → Confirm

```
1. Mở modal
2. Gõ "coffee" vào search bar
3. Verify: Sau ~300ms kết quả hiện, có category badge
4. Tap scenario "Ordering Coffee & Small Talk"
5. Verify: Item highlight, footer hiện confirm
6. Tap "✅ Xác nhận"
7. Verify: Modal đóng, topic = "Ordering Coffee & Small Talk"
```

### Flow 3: Favorites Flow

```
1. Mở modal → Tab IT
2. Star 2 scenarios (⭐ icon vàng)
3. Tab "⭐ Yêu thích"
4. Verify: 2 items hiện, badge "2" trên tab
5. Un-star 1 item
6. Verify: Chỉ còn 1 item, badge "1"
7. Chọn item còn lại → Xác nhận
8. Verify: Modal đóng, topic correct
```

### Flow 4: Custom Scenario Flow

```
1. Mở modal → Tab "✨ Tuỳ chỉnh"
2. Verify: Form nhập hiện trong modal (không navigate ra ngoài)
3. Nhập tên: "Phỏng vấn kỹ thuật React Native"
4. Nhập mô tả: "Hỏi đáp về hooks, state management, debugging"
5. Tap "Sử dụng ngay"
6. Verify: Modal đóng, ConfigScreen hiện topic = "Phỏng vấn kỹ thuật React Native"
```

### Flow 5: Random → Change → Confirm

```
1. Mở modal (chưa chọn scenario)
2. Verify: Footer hiện "🎲 Gợi ý ngẫu nhiên"
3. Tap "🎲 Gợi ý ngẫu nhiên"
4. Verify: Random scenario selected, footer đổi sang "✅ Xác nhận: {name}"
5. Tap "🎲 Gợi ý ngẫu nhiên" → bỏ chọn rồi tap lại
6. Verify: Scenario khác được chọn
7. Tap "✅ Xác nhận"
8. Verify: Modal đóng, topic = random scenario name
```

### Flow 6: Error Recovery

```
1. Mở modal → chọn scenario A
2. Đổi ý → bỏ chọn (tap lại A)
3. Verify: Footer trở về "🎲 Gợi ý ngẫu nhiên"
4. Chọn scenario B → Xác nhận
5. Verify: Topic = B (không phải A)
```

---

## 5. Hướng dẫn test trên device thật

### 5.1 Setup

```bash
# iOS — cài build lên device qua Xcode
# 1. Mở Xcode → chọn đúng Team + Device
# 2. Product → Run (hoặc Cmd+R)

# Android — cài build debug
cd apps/mobile
npx react-native run-android --device
```

### 5.2 Checklist thiết bị

| # | Tiêu chí | iPhone SE | iPhone 15 | Android Pixel | Samsung |
|---|----------|-----------|-----------|---------------|---------|
| 1 | Modal mở/đóng mượt | ⬜ | ⬜ | ⬜ | ⬜ |
| 2 | Pill handle visible | ⬜ | ⬜ | ⬜ | ⬜ |
| 3 | Tabs scroll ngang | ⬜ | ⬜ | ⬜ | ⬜ |
| 4 | Search debounce | ⬜ | ⬜ | ⬜ | ⬜ |
| 5 | Accordion animation | ⬜ | ⬜ | ⬜ | ⬜ |
| 6 | Star haptic feedback | ⬜ | ⬜ | ⬜ | ⬜ |
| 7 | Scale animation on press | ⬜ | ⬜ | ⬜ | ⬜ |
| 8 | Footer CTA luôn hiện | ⬜ | ⬜ | ⬜ | ⬜ |
| 9 | Safe area (notch/island) | ⬜ | ⬜ | ⬜ | ⬜ |
| 10 | Keyboard avoidance | ⬜ | ⬜ | ⬜ | ⬜ |
| 11 | Landscape orientation | ⬜ | ⬜ | ⬜ | ⬜ |
| 12 | Dark mode | ⬜ | ⬜ | ⬜ | ⬜ |

### 5.3 Quy trình test

1. **Smoke Test** (5 phút): Chạy bảng S1-S12 ở Section 2
2. **Manual Test** (20 phút): Chạy SP-MAN-001 → SP-MAN-037
3. **Monkey Test** (15 phút): Chọn 1 section từ 3.1-3.4, thao tác free
4. **E2E Flows** (30 phút): Chạy Flow 1-6 ở Section 4
5. **Cross-device** (10 phút): Lặp Smoke Test trên thiết bị khác

### 5.4 Bug Report Template

Khi phát hiện lỗi, ghi theo format:

```markdown
## Bug: [Tiêu đề ngắn]

- **Test ID:** SP-MAN-XXX / M-XX
- **Device:** iPhone 15, iOS 17.2
- **Steps:** 
  1. ...
  2. ...
- **Expected:** ...
- **Actual:** ...
- **Severity:** 🔴/🟡/🟢
- **Screenshot/Video:** [đính kèm]
```

### 5.5 Tips cho Tester

> [!TIP]
> - **Monkey Test:** Không cần theo thứ tự. Tap lung tung, nhanh hết mức có thể.
> - **Haptic:** Cần device thật mới cảm nhận được. Simulator không có haptic.
> - **Animation:** Quay video để review animation smoothness.
> - **Accessibility:** Bật VoiceOver (iOS) / TalkBack (Android) để test a11y.
> - **Network:** Thử tắt wifi giữa lúc modal đang mở → xem có crash không.
