# 🐒 Listening — Monkey Test (Chaos Testing)

> **Module:** Listening (PlayerScreen)
> **Mục đích:** Thao tác ngẫu nhiên, bất thường, lặp đi lặp lại để tìm crash/hang/leak
> **Thời gian chạy:** ~15-20 phút
> **Mindset:** "Tôi là user không biết gì, tôi bấm lung tung"
> **Ghi chú:** Monkey test KHÔNG có kết quả expected cụ thể — chỉ cần app KHÔNG crash

---

## Pre-conditions

- Device thật (KHÔNG dùng simulator — cần gesture thật + performance thật)
- App đã vào PlayerScreen với conversation + audio đang phát
- Bật Console log để theo dõi error (Xcode Console hoặc `npx react-native log-ios`)

---

## MONKEY-01: Spam Play/Pause (Rapid Toggle)

**Mô tả:** Nhấn nút Play/Pause liên tục thật nhanh (20-30 lần)

| Thao tác | Ghi chú |
|----------|---------|
| Tap Play/Pause 20 lần liên tục (nhanh nhất có thể) | |
| Quan sát: app crash không? | |
| Quan sát: icon Play/Pause có sync đúng state cuối cùng không? | |
| Quan sát: audio state cuối cùng có đúng không? (đang play hoặc pause, không phải cả 2) | |

**❌ FAIL nếu:** Crash, icon sai state, audio stuck (không play cũng không pause)

---

## MONKEY-02: Spam Skip Forward/Back

**Mô tả:** Nhấn Skip Forward rồi Skip Back xen kẽ liên tục

| Thao tác | Ghi chú |
|----------|---------|
| Tap ⏩⏪⏩⏪⏩⏪ xen kẽ 15 lần | |
| Tap ⏩ liên tục 20 lần (vượt quá số exchanges) | |
| Tap ⏪ liên tục 20 lần (vượt qua đầu bài) | |
| Quan sát: transcript highlight có đúng không? | |
| Quan sát: audio seek có tương ứng không? | |
| Quan sát: index có ra ngoài bounds không? (< 0 hoặc > length) | |

**❌ FAIL nếu:** Out-of-bounds error, highlight sai, crash

---

## MONKEY-03: Spam Bookmark Toggle

**Mô tả:** Long press rồi long press lại cùng 1 câu liên tục

| Thao tác | Ghi chú |
|----------|---------|
| Long press câu #1 → ⭐ hiện → long press lại → ⭐ ẩn → lặp lại 10 lần | |
| Long press 5 câu liên tiếp nhanh (1→2→3→4→5) | |
| Bookmark tất cả câu → scroll lên xuống → bỏ bookmark tất cả | |
| Quan sát: API có gọi đúng create/delete xen kẽ không? (xem console) | |
| Quan sát: optimistic update có rollback đúng khi API fail không? | |

**❌ FAIL nếu:** State desync (⭐ hiện nhưng API chưa gọi), crash, duplicate API calls

---

## MONKEY-04: Spam Dictionary Popup

**Mô tả:** Tap liên tục vào các từ khác nhau trong transcript

| Thao tác | Ghi chú |
|----------|---------|
| Tap từ #1 → popup mở → KHÔNG đóng → tap từ #2 → popup update | |
| Lặp lại 10 lần liên tiếp (tap 10 từ khác nhau mà không đóng popup) | |
| Tap từ → Save → tap từ khác → Save → lặp lại 5 lần | |
| Tap từ → đóng popup → tap lại cùng từ → đóng → lặp lại | |
| Tap vào khoảng trắng giữa 2 từ | |
| Tap vào dấu câu (dấu chấm, dấu phẩy) | |

**❌ FAIL nếu:** Popup không update, popup stuck, multiple popups mở, memory leak (app chậm dần)

---

## MONKEY-05: Gesture Chaos

**Mô tả:** Thực hiện gestures ngẫu nhiên, sai hướng, chồng chéo

| Thao tác | Ghi chú |
|----------|---------|
| Swipe left + right cùng lúc (2 ngón) | |
| Swipe lên (không phải xuống — hướng không xử lý) | |
| Tap 1 lần (không phải double tap) — không nên trigger play/pause | |
| Double tap rồi ngay lập tức swipe | |
| Swipe xuống nhiều lần liên tục | |
| Pinch zoom trên transcript (gesture không hỗ trợ) | |
| 3-finger tap/swipe | |
| Long press + drag (hỗn hợp gesture) | |

**❌ FAIL nếu:** Crash, sai action (single tap trigger play/pause), gesture handler leak

---

## MONKEY-06: Scroll + Interact Đồng Thời

**Mô tả:** Scroll transcript trong khi audio đang phát và highlight đang di chuyển

| Thao tác | Ghi chú |
|----------|---------|
| Scroll nhanh lên xuống khi audio đang phát | |
| Scroll rồi tap 1 câu → ngay lập tức scroll tiếp | |
| Scroll xuống cuối rồi ngay lập tức tap Skip Forward | |
| Scroll trong lúc auto-highlight đang chuyển câu | |
| Kéo-thả scroll bar rồi đột ngột thả | |

**❌ FAIL nếu:** Auto-scroll conflict với manual scroll, highlight nhảy lung tung, crash

---

## MONKEY-07: Speed Cycle Spam

**Mô tả:** Nhấn nút tốc độ liên tục để cycle qua tất cả tốc độ

| Thao tác | Ghi chú |
|----------|---------|
| Tap nút tốc độ 12 lần liên tục (cycle 0.5→0.75→1→1.25→1.5→2 → lặp lại) | |
| Nhấn tốc độ trong lúc đang Pause | |
| Nhấn tốc độ → ngay lập tức Play → ngay lập tức đổi tốc độ | |
| Quan sát: audio speed có thực sự đổi không? | |
| Quan sát: badge hiển thị có đúng speed hiện tại không? | |

**❌ FAIL nếu:** Speed desync (badge nói 2x nhưng audio phát 1x), crash

---

## MONKEY-08: Network Chaos

**Mô tả:** Đổi trạng thái mạng trong lúc đang dùng

| Thao tác | Ghi chú |
|----------|---------|
| Đang gen audio → bật Airplane Mode | |
| Audio đang phát → tắt WiFi | |
| Đang tra từ (Dictionary) → mất mạng | |
| Đang bookmark câu → mất mạng → có mạng lại | |
| Bật mạng lại → tap Play | |

**❌ FAIL nếu:** App crash khi mất mạng, lỗi không xử lý, no error toast

---

## MONKEY-09: App Lifecycle Chaos

**Mô tả:** Chuyển app vào background/foreground trong lúc đang dùng

| Thao tác | Ghi chú |
|----------|---------|
| Audio đang phát → Home button → quay lại app | |
| Audio đang phát → double-click Home → chọn app khác → quay lại | |
| Đang gen audio → Home → chờ 30s → quay lại | |
| Đang tra từ → Home → quay lại | |
| Xoay màn hình ngang/dọc (nếu app cho phép) | |
| Incoming call → reject → quay lại app | |
| Screenshot trong lúc popup đang mở | |
| Pull down Control Center khi audio đang phát | |

**❌ FAIL nếu:** State lost, audio dừng không resume, UI broken khi quay lại

---

## MONKEY-10: Memory Stress

**Mô tả:** Sử dụng liên tục lâu để detect memory leak

| Thao tác | Ghi chú |
|----------|---------|
| Tạo bài mới 5 lần liên tiếp (Config → Player → New → Config → ...) | |
| Mỗi lần: tra 5 từ, bookmark 3 câu, play/pause 5 lần | |
| Sau 5 lần: app có chậm dần không? | |
| Memory usage tăng đều hay stable? (check Xcode Instruments) | |
| Scroll có lag không sau lần tạo bài thứ 5? | |

**❌ FAIL nếu:** App chậm rõ rệt sau nhiều lần tạo bài, memory > 200MB

---

## Checklist Tổng Kết

| Monkey Test | Kết quả | Bugs tìm thấy |
|-------------|---------|----------------|
| MONKEY-01 Spam Play/Pause | | |
| MONKEY-02 Spam Skip | | |
| MONKEY-03 Spam Bookmark | | |
| MONKEY-04 Spam Dictionary | | |
| MONKEY-05 Gesture Chaos | | |
| MONKEY-06 Scroll + Interact | | |
| MONKEY-07 Speed Cycle | | |
| MONKEY-08 Network Chaos | | |
| MONKEY-09 App Lifecycle | | |
| MONKEY-10 Memory Stress | | |

**Tổng bugs:** ___
**Critical (crash):** ___
**Major (feature broken):** ___
**Minor (UI glitch):** ___

> 💡 **Tip:** Chạy monkey test sau mỗi lần refactor lớn. Nếu tìm được bug → tạo unit test/e2e test tương ứng.
