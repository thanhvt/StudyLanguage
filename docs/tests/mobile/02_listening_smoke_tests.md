# 🎧 Listening — Smoke Test Checklist

> **Module:** Listening (PlayerScreen + ConfigScreen)
> **Mục đích:** Verify core flows hoạt động ĐÚNG sau mỗi build/PR
> **Thời gian chạy:** ~10 phút
> **Severity:** Tất cả items đều 🔴 Critical — nếu bất kỳ step nào fail → BLOCK release

---

## Pre-conditions

- [ ] Device/simulator có mạng ổn định (WiFi)
- [ ] App đã login thành công (Supabase auth)
- [ ] Backend API server đang chạy (`/health` trả 200)
- [ ] Loa hoặc tai nghe hoạt động

---

## SMOKE-01: Config → Generate → Player (Core Flow)

| # | Bước | Expected | ✅/❌ |
|---|------|----------|-------|
| 1 | Từ Dashboard, tap 🎧 "Luyện nghe" | Config screen mở | |
| 2 | Chọn topic bất kỳ (vd: "Coffee Shop") | Topic chip hiện selected state | |
| 3 | Giữ nguyên duration mặc định (5 phút) | Duration = 5 hiển thị | |
| 4 | Tap "Bắt đầu nghe" | Loading spinner hiện, sau 5-30s → chuyển sang PlayerScreen | |
| 5 | Observe transcript | Transcript hiển thị ≥3 exchanges, có speaker label | |
| 6 | Observe banner "Đang tạo audio..." | Banner hiện với spinner, text rõ ràng | |
| 7 | Đợi audio gen xong (30-120s) | Banner biến mất, toast "Audio sẵn sàng" hiện, audio tự phát | |

> **PASS nếu:** Audio tự phát + transcript hiển thị đúng
> **FAIL nếu:** Crash, blank screen, audio không phát, transcript rỗng

---

## SMOKE-02: Play/Pause Controls

| # | Bước | Expected | ✅/❌ |
|---|------|----------|-------|
| 1 | (Tiếp từ SMOKE-01) Audio đang phát | Play button hiện icon Pause ⏸️ | |
| 2 | Tap nút Pause | Audio dừng, icon đổi sang Play ▶️ | |
| 3 | Tap nút Play | Audio tiếp tục từ vị trí đã dừng | |
| 4 | Tap nút Skip Forward (⏩) | Audio nhảy sang câu tiếp theo, transcript highlight đổi | |
| 5 | Tap nút Skip Back (⏪) | Audio quay lại câu trước, transcript highlight đổi | |

> **PASS nếu:** Play/Pause/Skip hoạt động đúng
> **FAIL nếu:** Nút không respond, audio không dừng, crash

---

## SMOKE-03: Transcript Interaction

| # | Bước | Expected | ✅/❌ |
|---|------|----------|-------|
| 1 | Tap vào câu thứ 3 trong transcript | Exchange #3 highlight, audio seek tới timestamp | |
| 2 | Quan sát highlight auto-sync | Khi audio phát, highlight tự di chuyển theo câu đang đọc | |
| 3 | Tap từ "hello" (hoặc bất kỳ từ nào) trong transcript | DictionaryPopup mở, hiện nghĩa + IPA + nút phát âm | |
| 4 | Tap nút 💾 Save Word trong popup | Toast "Đã lưu từ" hiện, popup vẫn mở | |
| 5 | Đóng popup (swipe down hoặc tap backdrop) | Popup đóng, audio tiếp tục phát | |

> **PASS nếu:** Transcript tương tác được + dictionary hoạt động
> **FAIL nếu:** Tap không phản hồi, popup không mở, crash

---

## SMOKE-04: Speed Control

| # | Bước | Expected | ✅/❌ |
|---|------|----------|-------|
| 1 | Tap nút tốc độ (đang hiện "1x") | Đổi sang "1.25x", toast hiện "Đã chuyển sang 1.25x" | |
| 2 | Lắng nghe audio | Audio phát nhanh hơn rõ rệt | |
| 3 | Tap thêm lần nữa | Đổi sang "1.5x" | |

> **PASS nếu:** Tốc độ thay đổi đúng + audio tốc độ thay đổi thực tế
> **FAIL nếu:** Badge hiện sai, audio không đổi tốc

---

## SMOKE-05: Bookmark

| # | Bước | Expected | ✅/❌ |
|---|------|----------|-------|
| 1 | Long press câu thứ 2 (~400ms) | Haptic feedback + câu hiện ⭐ + toast "Đã lưu bookmark" | |
| 2 | Observe câu đã bookmark | Border viền vàng nhẹ, icon ⭐ hiện trong header row | |
| 3 | Long press lại câu đã bookmark | Haptic + ⭐ biến mất + toast "Đã bỏ bookmark" | |

> **PASS nếu:** Bookmark toggle đúng, visual feedback rõ
> **FAIL nếu:** Long press không trigger, icon không hiện/ẩn

---

## SMOKE-06: New Conversation (Reset)

| # | Bước | Expected | ✅/❌ |
|---|------|----------|-------|
| 1 | Tap nút 🔄 (Bài mới) | Dialog "Tạo bài mới?" hiện | |
| 2 | Tap "Cancel" | Dialog đóng, audio tiếp tục | |
| 3 | Tap nút 🔄 lần nữa → Tap "Confirm" | Audio dừng, navigate về ConfigScreen, state reset | |
| 4 | Chọn topic khác → "Bắt đầu nghe" | Bài mới generate thành công | |

> **PASS nếu:** Reset đúng, navigate đúng, bài mới hoạt động
> **FAIL nếu:** State cũ còn lại, crash, audio cũ vẫn phát

---

## Kết quả chung

| Smoke Test | Kết quả | Ghi chú |
|------------|---------|---------|
| SMOKE-01 | | |
| SMOKE-02 | | |
| SMOKE-03 | | |
| SMOKE-04 | | |
| SMOKE-05 | | |
| SMOKE-06 | | |

**Tổng kết:** ___/6 PASS

> ⚠️ **Rule:** Nếu bất kỳ smoke test nào FAIL → không merge PR. Fix trước.
