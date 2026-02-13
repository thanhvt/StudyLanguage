# 🐒 Listening — Monkey Test Kịch bản

> **Mục đích:** Test bằng thao tác ngẫu nhiên, bất thường để tìm crash, memory leak, UI glitch.
> **Triết lý:** Làm mọi thứ "sai" hoặc "quá nhanh" mà user bình thường không làm.
> **Khi nào chạy:** Sau khi Smoke test pass, trước release.
> **Thời gian:** ~45-60 phút / session
> **Thiết bị:** Device thật (KHÔNG giả lập)

---

## Pre-conditions

- Device thật (KHÔNG dùng simulator — cần gesture thật + performance thật)
- App đã vào PlayerScreen với conversation + audio đang phát
- Bật Console log để theo dõi error (Xcode Console hoặc `npx react-native log-ios`)

---

## Quy ước kết quả

| Icon | Ý nghĩa |
|------|---------|
| 🟢 | Không crash, UI bình thường |
| 🟡 | UI glitch nhỏ (animation giật, text chồng) — ghi screenshot |
| 🔴 | App crash / freeze / data mất — block release |

---

## MKY-001: 🔨 Config Spam Machine
**Mục đích:** Kiểm tra UI chịu được thay đổi config cực nhanh

| Bước | Thao tác |
|------|----------|
| 1 | Mở Config screen |
| 2 | Tap chuyển Duration: 5 → 10 → 15 → Custom → 5 → Custom → 10 liên tục **20 lần trong 10 giây** |
| 3 | Đồng thời tap chuyển Level: beginner → intermediate → advanced lặp đi lặp lại |
| 4 | Trong khi đang tap, nhấn Speakers 2 → 3 → 4 → 2 liên tục |
| **Mong đợi:** | Không crash, UI cập nhật mượt, không flickering |

**Kết quả:** __________ | **Ghi chú:** __________

---

## MKY-002: 🏃 Generate → Back → Generate Loop
**Mục đích:** Kiểm tra memory leak khi generate liên tục

| Bước | Thao tác |
|------|----------|
| 1 | Chọn topic + config |
| 2 | Tap "Bắt đầu" → đợi loading |
| 3 | NGAY KHI PlayerScreen hiện → tap **Back** |
| 4 | Lặp lại bước 2-3 **15 lần liên tiếp** |
| 5 | Lần thứ 16: đợi PlayerScreen load xong, kiểm tra transcript |
| **Mong đợi:** | Không crash, không memory warning, transcript hiện đúng |

**Kết quả:** __________ | **Ghi chú:** __________

---

## MKY-003: ⚡ Spam Play/Pause (Rapid Toggle)
**Mục đích:** Stress test các nút điều khiển player — nhấn nhanh liên tục

| Thao tác | Ghi chú |
|----------|---------|
| Tap Play/Pause **30 lần** liên tục cực nhanh | |
| Quan sát: icon Play/Pause có sync đúng state cuối cùng không? | |
| Quan sát: audio state cuối cùng có đúng không? (đang play hoặc pause, không phải cả 2) | |
| Tap Next sentence **20 lần** (kéo đến cuối transcript) | |
| Tiếp tục tap Next khi đã ở cuối | |
| Tap Previous **20 lần** (kéo về đầu) | |
| Tiếp tục tap Previous khi đã ở câu đầu tiên | |
| Quan sát: transcript highlight có đúng không? | |
| Quan sát: index có ra ngoài bounds không? (< 0 hoặc > length) | |

**❌ FAIL nếu:** Out-of-bounds error, icon sai state, audio stuck, highlight sai, crash

**Kết quả:** __________ | **Ghi chú:** __________

---

## MKY-004: 📚 Spam Bookmark Toggle
**Mục đích:** Bookmark rồi bỏ bookmark cùng câu liên tục + bookmark toàn bộ

| Thao tác | Ghi chú |
|----------|---------|
| Long press câu #1 → ⭐ hiện → long press lại → ⭐ ẩn → lặp lại **10 lần** | |
| Long press 5 câu liên tiếp nhanh (1→2→3→4→5) | |
| Bookmark tất cả câu (bài 15 phút, 20+ câu) → scroll lên xuống kiểm tra ⭐ | |
| Bỏ bookmark tất cả | |
| Quan sát: API có gọi đúng create/delete xen kẽ không? (xem console) | |
| Quan sát: optimistic update có rollback đúng khi API fail không? | |
| Quan sát: performance không giảm khi bookmark all | |

**❌ FAIL nếu:** State desync (⭐ hiện nhưng API chưa gọi), crash, duplicate API calls, scroll lag

**Kết quả:** __________ | **Ghi chú:** __________

---

## MKY-005: 📱 Spam Dictionary Popup
**Mục đích:** Tap liên tục vào các từ khác nhau trong transcript

| Thao tác | Ghi chú |
|----------|---------|
| Tap từ #1 → popup mở → KHÔNG đóng → tap từ #2 → popup update | |
| Lặp lại 10 lần liên tiếp (tap 10 từ khác nhau mà không đóng popup) | |
| Tap từ → Save → tap từ khác → Save → lặp lại 5 lần | |
| Tap từ → đóng popup → tap lại cùng từ → đóng → lặp lại | |
| Tap vào khoảng trắng giữa 2 từ | |
| Tap vào dấu câu (dấu chấm, dấu phẩy) | |

**❌ FAIL nếu:** Popup không update, popup stuck, multiple popups mở, memory leak (app chậm dần)

**Kết quả:** __________ | **Ghi chú:** __________

---

## MKY-006: 🌀 Gesture Chaos
**Mục đích:** Thực hiện gestures ngẫu nhiên, sai hướng, chồng chéo

| Thao tác | Ghi chú |
|----------|---------|
| Swipe left + right cùng lúc (2 ngón) | |
| Swipe lên (hướng không xử lý) | |
| Tap 1 lần (không phải double tap) — không nên trigger play/pause | |
| Double tap rồi ngay lập tức swipe | |
| Swipe xuống nhiều lần liên tục | |
| Pinch zoom trên transcript (gesture không hỗ trợ) | |
| 3-finger tap/swipe | |
| Long press + drag (hỗn hợp gesture) | |

**❌ FAIL nếu:** Crash, sai action (single tap trigger play/pause), gesture handler leak

**Kết quả:** __________ | **Ghi chú:** __________

---

## MKY-007: 📜 Scroll + Interact Đồng Thời
**Mục đích:** Scroll transcript trong khi audio đang phát và highlight đang di chuyển

| Thao tác | Ghi chú |
|----------|---------|
| Scroll nhanh lên xuống khi audio đang phát | |
| Scroll rồi tap 1 câu → ngay lập tức scroll tiếp | |
| Scroll xuống cuối rồi ngay lập tức tap Skip Forward | |
| Scroll trong lúc auto-highlight đang chuyển câu | |
| Kéo-thả scroll bar rồi đột ngột thả | |

**❌ FAIL nếu:** Auto-scroll conflict với manual scroll, highlight nhảy lung tung, crash

**Kết quả:** __________ | **Ghi chú:** __________

---

## MKY-008: ⏩ Speed Cycle Spam
**Mục đích:** Nhấn nút tốc độ liên tục để cycle qua tất cả tốc độ

| Thao tác | Ghi chú |
|----------|---------|
| Tap nút tốc độ 12 lần liên tục (cycle 0.5→0.75→1→1.25→1.5→2 → lặp lại) | |
| Nhấn tốc độ trong lúc đang Pause | |
| Nhấn tốc độ → ngay lập tức Play → ngay lập tức đổi tốc độ | |
| Quan sát: audio speed có thực sự đổi không? | |
| Quan sát: badge hiển thị có đúng speed hiện tại không? | |

**❌ FAIL nếu:** Speed desync (badge nói 2x nhưng audio phát 1x), crash

**Kết quả:** __________ | **Ghi chú:** __________

---

## MKY-009: 📱 Orientation Chaos
**Mục đích:** Kiểm tra layout khi xoay device liên tục

| Bước | Thao tác |
|------|----------|
| 1 | Mở Config screen → Portrait |
| 2 | Xoay Landscape → xoay Portrait → Landscape **10 lần nhanh** |
| 3 | Mở PlayerScreen |
| 4 | Lặp lại xoay **10 lần** trong PlayerScreen |
| 5 | Long press 1 câu khi đang xoay |
| **Mong đợi:** | Layout không bị vỡ, text không bị cắt, bookmark vẫn hoạt động |

**Kết quả:** __________ | **Ghi chú:** __________

---

## MKY-010: 🔌 Interrupt Storm
**Mục đích:** Kiểm tra xử lý ngắt quãng liên tục

| Bước | Thao tác |
|------|----------|
| 1 | Đang ở PlayerScreen với audio đang phát |
| 2 | Nhận notification → kéo notification bar xuống → đóng lại |
| 3 | Nhấn Home → quay lại app ngay |
| 4 | Mở Control Center (iOS) / Quick Settings (Android) → đóng |
| 5 | Gọi điện thoại đến (hoặc dùng sim card 2 gọi) → ngắt |
| 6 | Lặp lại 2-5 **3 lần**, mỗi lần cách nhau 5 giây |
| **Mong đợi:** | Audio resume đúng, transcript state không bị mất, app không crash |

**Kết quả:** __________ | **Ghi chú:** __________

---

## MKY-011: 🎹 Keyboard Chaos (Config Screen)
**Mục đích:** Kiểm tra tương tác keyboard bất thường

| Bước | Thao tác |
|------|----------|
| 1 | Mở Config screen → tap vào Keywords input |
| 2 | Gõ bàn phím liên tục "asdfjkl;" **50 ký tự** |
| 3 | Không đóng keyboard → tap Duration picker |
| 4 | Picker mở → keyboard đóng? |
| 5 | Chọn giá trị → đóng picker → tap Keywords lại |
| 6 | Paste text dài 500 ký tự từ clipboard |
| **Mong đợi:** | Keyboard đóng mở mượt, text không tràn, layout không shift |

**Kết quả:** __________ | **Ghi chú:** __________

---

## MKY-012: 🗑️ Empty State Spam
**Mục đích:** Test khi không có data

| Bước | Thao tác |
|------|----------|
| 1 | Mở Config screen → KHÔNG chọn gì |
| 2 | Tap "Bắt đầu" **5 lần** liên tiếp |
| 3 | Chọn topic → xóa topic (clear) → tap "Bắt đầu" |
| 4 | Nhập keywords rỗng → tap "Bắt đầu" |
| **Mong đợi:** | Validation message hiện đúng, nút disabled, không gửi request rác |

**Kết quả:** __________ | **Ghi chú:** __________

---

## MKY-013: 🔄 Scenario Chip Rapid Fire
**Mục đích:** Tap scenario chips nhanh liên tục

| Bước | Thao tác |
|------|----------|
| 1 | Mở Config screen → scroll đến Scenarios |
| 2 | Tap "Restaurant" → ngay lập tức tap "Hotel" → "Airport" → "Shopping" **cực nhanh** |
| 3 | Không đợi API trả về, tiếp tục tap |
| 4 | Cuối cùng đợi 1 kết quả load xong |
| **Mong đợi:** | Chỉ request cuối cùng được xử lý, không có response xếp chồng |

**Kết quả:** __________ | **Ghi chú:** __________

---

## MKY-014: 🌐 Network Chaos
**Mục đích:** Bật/tắt mạng, đổi trạng thái mạng trong lúc đang dùng

| Thao tác | Ghi chú |
|----------|---------|
| Đang gen audio → bật Airplane Mode | |
| Audio đang phát → tắt WiFi | |
| Đang tra từ (Dictionary) → mất mạng | |
| Đang bookmark câu → mất mạng → có mạng lại | |
| Bật mạng lại → tap Play | |
| Tap "Bắt đầu" → ngay lập tức tắt WiFi → bật → tắt → bật (5 giây) | |
| Tắt WiFi khi đang loading (giữa chừng) → bật lại → tap Retry | |

**❌ FAIL nếu:** App crash, lỗi không xử lý, no error toast, treo loading mãi

**Kết quả:** __________ | **Ghi chú:** __________

---

## MKY-015: 🔙 Back Navigation Spam
**Mục đích:** Nhấn Back liên tục ở mọi screen

| Bước | Thao tác |
|------|----------|
| 1 | Dashboard → Listening → Config → generate → Player |
| 2 | Nhấn Back **5 lần cực nhanh** |
| 3 | Kiểm tra đã về đúng screen (Dashboard) |
| 4 | Thử lại: đang loading → nhấn Back 3 lần |
| **Mong đợi:** | Navigate đúng, không blank screen, API call bị cancel |

**Kết quả:** __________ | **Ghi chú:** __________

---

## MKY-016: 📻 App Lifecycle Chaos
**Mục đích:** Chuyển app vào background/foreground trong lúc đang dùng

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

**Kết quả:** __________ | **Ghi chú:** __________

---

## MKY-017: 🌙 Dark Mode Toggle
**Mục đích:** Chuyển light/dark mode liên tục

| Bước | Thao tác |
|------|----------|
| 1 | Mở Config screen → chụp screenshot Light mode |
| 2 | Vào Settings → Dark Mode → quay lại app |
| 3 | Toggle Dark ↔ Light **5 lần** trong khi ở Config screen |
| 4 | Làm tương tự trên PlayerScreen |
| **Mong đợi:** | Màu sắc chuyển đúng, text luôn đọc được, không UI glitch |

**Kết quả:** __________ | **Ghi chú:** __________

---

## MKY-018: 📏 Font Size Scaling
**Mục đích:** Kiểm tra UI khi thay đổi font size hệ thống

| Bước | Thao tác |
|------|----------|
| 1 | Mở Settings → Accessibility → Font size → **Cực lớn (Largest)** |
| 2 | Mở Listening Config screen |
| 3 | Kiểm tra: text có bị cắt? Buttons có bị tràn? Layout có vỡ? |
| 4 | Generate → vào PlayerScreen → kiểm tra transcript |
| 5 | Đổi về font size **Cực nhỏ (Smallest)** → kiểm tra lại |
| **Mong đợi:** | Layout responsive, text không bị cắt, buttons vẫn tap được |

**Kết quả:** __________ | **Ghi chú:** __________

---

## MKY-019: 🔇 Volume & Silent Mode
**Mục đích:** Kiểm tra audio khi volume = 0 hoặc Silent mode

| Bước | Thao tác |
|------|----------|
| 1 | Chuyển device sang **Silent mode** (iOS) / **Vibrate** (Android) |
| 2 | Generate + vào PlayerScreen → tap Play |
| 3 | Audio có phát qua loa không? (Expected: phát vì là media audio) |
| 4 | Kéo volume về **0** → kiểm tra UI phản ánh |
| 5 | Kéo volume lên → audio tiếp tục |
| **Mong đợi:** | Media audio phát bình thường ở Silent mode, volume 0 → không nghe nhưng progress vẫn chạy |

**Kết quả:** __________ | **Ghi chú:** __________

---

## MKY-020: 🧠 Memory Soak Test (30 phút)
**Mục đích:** Kiểm tra memory leak qua thời gian dài

| Bước | Thao tác |
|------|----------|
| 1 | Ghi nhận RAM usage ban đầu (Xcode Instruments / Android Profiler) |
| 2 | Generate 5 conversations liên tiếp (mỗi lần: Config → Generate → Back) |
| 3 | Mỗi lần: tra 5 từ, bookmark 3 câu, play/pause 5 lần |
| 4 | Chuyển tab: Dashboard → Listening → Reading → Listening → History → Listening |
| 5 | Generate thêm 5 conversations |
| 6 | So sánh RAM usage hiện tại vs ban đầu |
| **Mong đợi:** | RAM tăng < 50MB so với ban đầu, không có trend tăng liên tục, scroll không lag |

**Kết quả:** __________ | **RAM ban đầu:** ___MB | **RAM cuối:** ___MB

---

## Bảng tổng kết

| Kịch bản | ID | Kết quả | Bugs |
|----------|:--:|:-------:|------|
| Config Spam | MKY-001 | | |
| Generate Loop | MKY-002 | | |
| Play/Pause/Skip Spam | MKY-003 | | |
| Bookmark Spam + All | MKY-004 | | |
| Dictionary Spam | MKY-005 | | |
| Gesture Chaos | MKY-006 | | |
| Scroll + Interact | MKY-007 | | |
| Speed Cycle Spam | MKY-008 | | |
| Orientation Chaos | MKY-009 | | |
| Interrupt Storm | MKY-010 | | |
| Keyboard Chaos | MKY-011 | | |
| Empty State Spam | MKY-012 | | |
| Scenario Rapid Fire | MKY-013 | | |
| Network Chaos | MKY-014 | | |
| Back Nav Spam | MKY-015 | | |
| App Lifecycle | MKY-016 | | |
| Dark Mode Toggle | MKY-017 | | |
| Font Size Scaling | MKY-018 | | |
| Volume & Silent | MKY-019 | | |
| Memory Soak | MKY-020 | | |

**Tổng bugs:** ___
**Critical (crash):** ___
**Major (feature broken):** ___
**Minor (UI glitch):** ___

---

> [!TIP]
> **Pro tip:** Chạy monkey test khi device đang kết nối Xcode Instruments (iOS) hoặc Android Profiler.
> Ghi lại CPU, Memory, Network metrics để phát hiện performance regression.

---

> **Nguồn gốc:** Merged từ `02_listening_monkey_tests.md` (10 kịch bản) + `12_listening_monkey_tests.md` (15 kịch bản).
> **Ngày merge:** 2026-02-14
