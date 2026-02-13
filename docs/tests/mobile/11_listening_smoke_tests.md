# 🔥 Listening — Smoke Test Checklist

> **Module:** Listening (ConfigScreen + PlayerScreen)
> **Mục đích:** Chạy nhanh (~15 phút) trên device thật SAU MỖI BẢN BUILD để xác nhận core flows hoạt động.
> **Severity:** Tất cả items đều 🔴 Critical — nếu bất kỳ step nào fail → BLOCK release
> **Thiết bị:** iOS (iPhone) + Android (Pixel/Samsung)

---

## Pre-conditions

- [ ] Device/simulator có mạng ổn định (WiFi)
- [ ] App đã login thành công (Supabase auth)
- [ ] Backend API server đang chạy (`/health` trả 200)
- [ ] Loa hoặc tai nghe hoạt động

---

## SMOKE-01: Config → Generate → Player (Core Flow)

| # | Bước | Expected | iOS | Android | Ghi chú |
|:-:|------|----------|:---:|:-------:|---------|
| 1 | Từ Dashboard, tap 🎧 "Luyện nghe" | Config screen mở, có Topic + Duration + Level + Speakers | | | |
| 2 | Chọn Topic → tap 1 topic bất kỳ (vd: "Coffee Shop") | Topic chip hiện selected state, nút "Bắt đầu" active | | | |
| 3 | Chọn Duration → tap **10 phút** | Pill "10" highlighted, các pill khác unhighlight | | | |
| 4 | Chọn Duration → tap ✏️ Custom → chọn **25 phút** từ picker | Picker mở smooth, chọn → đóng, badge "25 phút" hiện | | | |
| 5 | Chọn Speakers → tap **3** | Speaker pill "3" highlighted | | | |
| 6 | Nhập Keywords → gõ "coffee, meeting" | Text hiển thị đúng trong input | | | |
| 7 | Tap "Bắt đầu nghe" | Loading spinner hiện → chuyển sang PlayerScreen (5-30s) | | | |
| 8 | Observe transcript | Transcript hiển thị ≥3 exchanges, có speaker label | | | |
| 9 | Observe bản dịch tiếng Việt | Mỗi câu có dòng tiếng Việt bên dưới (nếu enable) | | | |
| 10 | Observe banner "Đang tạo audio..." | Banner hiện với spinner, text rõ ràng | | | |
| 11 | Đợi audio gen xong (30-120s) | Banner biến mất, toast "Audio sẵn sàng" hiện, audio tự phát | | | |

> **PASS nếu:** Audio tự phát + transcript hiển thị đúng
> **FAIL nếu:** Crash, blank screen, audio không phát, transcript rỗng

---

## SMOKE-02: Play/Pause Controls

| # | Bước | Expected | iOS | Android | Ghi chú |
|:-:|------|----------|:---:|:-------:|---------|
| 1 | (Tiếp từ SMOKE-01) Audio đang phát | Play button hiện icon Pause ⏸️ | | | |
| 2 | Tap nút Pause | Audio dừng, icon đổi sang Play ▶️ | | | |
| 3 | Tap nút Play | Audio tiếp tục từ vị trí đã dừng | | | |
| 4 | Tap nút Skip Forward (⏩) | Audio nhảy sang câu tiếp theo, transcript highlight đổi | | | |
| 5 | Tap nút Skip Back (⏪) | Audio quay lại câu trước, transcript highlight đổi | | | |

> **PASS nếu:** Play/Pause/Skip hoạt động đúng
> **FAIL nếu:** Nút không respond, audio không dừng, crash

---

## SMOKE-03: Transcript Interaction

| # | Bước | Expected | iOS | Android | Ghi chú |
|:-:|------|----------|:---:|:-------:|---------|
| 1 | Tap vào câu thứ 3 trong transcript | Exchange #3 highlight, audio seek tới timestamp | | | |
| 2 | Quan sát highlight auto-sync | Khi audio phát, highlight tự di chuyển theo câu đang đọc | | | |
| 3 | Tap từ "hello" (hoặc bất kỳ từ nào) trong transcript | DictionaryPopup mở, hiện nghĩa + IPA + nút phát âm | | | |
| 4 | Tap nút 💾 Save Word trong popup | Toast "Đã lưu từ" hiện, popup vẫn mở | | | |
| 5 | Đóng popup (swipe down hoặc tap backdrop) | Popup đóng, audio tiếp tục phát | | | |

> **PASS nếu:** Transcript tương tác được + dictionary hoạt động
> **FAIL nếu:** Tap không phản hồi, popup không mở, crash

---

## SMOKE-04: Speed Control

| # | Bước | Expected | iOS | Android | Ghi chú |
|:-:|------|----------|:---:|:-------:|---------|
| 1 | Tap nút tốc độ (đang hiện "1x") | Đổi sang "1.25x", toast hiện "Đã chuyển sang 1.25x" | | | |
| 2 | Lắng nghe audio | Audio phát nhanh hơn rõ rệt | | | |
| 3 | Tap thêm lần nữa | Đổi sang "1.5x" | | | |

> **PASS nếu:** Tốc độ thay đổi đúng + audio tốc độ thay đổi thực tế
> **FAIL nếu:** Badge hiện sai, audio không đổi tốc

---

## SMOKE-05: Bookmark

| # | Bước | Expected | iOS | Android | Ghi chú |
|:-:|------|----------|:---:|:-------:|---------|
| 1 | Long press câu thứ 2 (~400ms) | Haptic feedback + câu hiện ⭐ + toast "Đã lưu bookmark" | | | |
| 2 | Observe câu đã bookmark | Border viền vàng nhẹ, icon ⭐ hiện trong header row | | | |
| 3 | Long press lại câu đã bookmark | Haptic + ⭐ biến mất + toast "Đã bỏ bookmark" | | | |

> **PASS nếu:** Bookmark toggle đúng, visual feedback rõ
> **FAIL nếu:** Long press không trigger, icon không hiện/ẩn

---

## SMOKE-06: New Conversation (Reset)

| # | Bước | Expected | iOS | Android | Ghi chú |
|:-:|------|----------|:---:|:-------:|---------|
| 1 | Tap nút 🔄 (Bài mới) | Dialog "Tạo bài mới?" hiện | | | |
| 2 | Tap "Cancel" | Dialog đóng, audio tiếp tục | | | |
| 3 | Tap nút 🔄 lần nữa → Tap "Confirm" | Audio dừng, navigate về ConfigScreen, state reset | | | |
| 4 | Chọn topic khác → "Bắt đầu nghe" | Bài mới generate thành công | | | |

> **PASS nếu:** Reset đúng, navigate đúng, bài mới hoạt động
> **FAIL nếu:** State cũ còn lại, crash, audio cũ vẫn phát

---

## SMOKE-07: Scenario Quick Generate

| # | Bước | Expected | iOS | Android | Ghi chú |
|:-:|------|----------|:---:|:-------:|---------|
| 1 | Chọn Scenario chip (VD: "Restaurant") | Loading → chuyển sang PlayerScreen với kịch bản nhà hàng | | | |

---

## SMOKE-08: Navigation & State Preservation

| # | Bước | Expected | iOS | Android | Ghi chú |
|:-:|------|----------|:---:|:-------:|---------|
| 1 | Tap nút **Back** từ PlayerScreen | Quay về Config screen, config giữ nguyên | | | |

---

## SMOKE-09: Offline Error Handling

| # | Bước | Expected | iOS | Android | Ghi chú |
|:-:|------|----------|:---:|:-------:|---------|
| 1 | Tắt mạng → tap **Bắt đầu** | Thông báo lỗi "Cần kết nối mạng" hiện rõ ràng | | | |
| 2 | Bật lại mạng → tap **Bắt đầu** | Hoạt động bình thường | | | |

---

## Kết quả chung

| Smoke Test | iOS | Android | Ghi chú |
|------------|:---:|:-------:|---------|
| SMOKE-01 Config → Generate → Player | | | |
| SMOKE-02 Play/Pause Controls | | | |
| SMOKE-03 Transcript Interaction | | | |
| SMOKE-04 Speed Control | | | |
| SMOKE-05 Bookmark | | | |
| SMOKE-06 New Conversation Reset | | | |
| SMOKE-07 Scenario Quick Generate | | | |
| SMOKE-08 Navigation | | | |
| SMOKE-09 Offline Handling | | | |

**Tổng:** ___/9 PASS (iOS) | ___/9 PASS (Android)

---

## Lưu ý quan trọng

> [!CAUTION]
> Nếu bất kỳ bước nào từ **SMOKE-01 đến SMOKE-02** FAIL → **BLOCK release**, báo dev ngay.
> SMOKE-03 trở đi fail → ghi bug nhưng có thể tiếp tục test.

---

> **Nguồn gốc:** Merged từ `02_listening_smoke_tests.md` (6 flows chi tiết) + `11_listening_smoke_tests.md` (17-step checklist).
> **Ngày merge:** 2026-02-14
