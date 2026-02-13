# 🐒 Listening — Monkey Test Kịch bản

> **Mục đích:** Test bằng thao tác ngẫu nhiên, bất thường để tìm crash, memory leak, UI glitch.
> **Triết lý:** Làm mọi thứ "sai" hoặc "quá nhanh" mà user bình thường không làm.
> **Khi nào chạy:** Sau khi Smoke test pass, trước release.
> **Thời gian:** ~30-45 phút / session
> **Thiết bị:** Device thật (KHÔNG giả lập)

---

## Quy ước kết quả

| Icon | Ý nghĩa |
|------|---------|
| 🟢 | Không crash, UI bình thường |
| 🟡 | UI glitch nhỏ (animation giật, text chồng) — ghi screenshot |
| 🔴 | App crash / freeze / data mất — block release |

---

## Kịch bản Monkey Test

### MKY-001: 🔨 Config Spam Machine
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

### MKY-002: 🏃 Generate → Back → Generate Loop
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

### MKY-003: ⚡ Player Button Mash
**Mục đích:** Stress test các nút điều khiển player

| Bước | Thao tác |
|------|----------|
| 1 | Mở PlayerScreen (đã có conversation) |
| 2 | Tap Play/Pause **30 lần liên tục cực nhanh** |
| 3 | Tap Next sentence **20 lần** (kéo đến cuối transcript) |
| 4 | Tiếp tục tap Next khi đã ở cuối |
| 5 | Tap Previous **20 lần** (kéo về đầu) |
| 6 | Tiếp tục tap Previous khi đã ở câu đầu tiên |
| **Mong đợi:** | Không crash, highlight index không bị < 0 hoặc > max, play state đúng |

**Kết quả:** __________ | **Ghi chú:** __________

---

### MKY-004: 📱 Orientation Chaos
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

### MKY-005: 🔌 Interrupt Storm
**Mục đích:** Kiểm tra xử lý ngắt quãng liên tục

| Bước | Thao tác |
|------|----------|
| 1 | Đang ở PlayerScreen với audio đang phát (hoặc transcript hiện) |
| 2 | Nhận notification → kéo notification bar xuống → đóng lại |
| 3 | Nhấn Home → quay lại app ngay |
| 4 | Mở Control Center (iOS) / Quick Settings (Android) → đóng |
| 5 | Gọi điện thoại đến (hoặc dùng sim card 2 gọi) → ngắt |
| 6 | Lặp lại 2-5 **3 lần**, mỗi lần cách nhau 5 giây |
| **Mong đợi:** | Audio resume đúng, transcript state không bị mất, app không crash |

**Kết quả:** __________ | **Ghi chú:** __________

---

### MKY-006: 🎹 Keyboard Chaos (Config Screen)
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

### MKY-007: 🗑️ Empty State Spam
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

### MKY-008: 🔄 Scenario Chip Rapid Fire
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

### MKY-009: 📚 Bookmark All Sentences
**Mục đích:** Bookmark toàn bộ câu trong transcript

| Bước | Thao tác |
|------|----------|
| 1 | Generate bài dài (15 phút) → vào PlayerScreen |
| 2 | Long press **mọi câu** trong transcript (20+ câu) |
| 3 | Scroll lên xuống kiểm tra icon ⭐ vẫn hiện |
| 4 | Long press lại **tất cả** để bỏ bookmark |
| **Mong đợi:** | Bookmark toggle đúng, performance không giảm, scroll mượt |

**Kết quả:** __________ | **Ghi chú:** __________

---

### MKY-010: 🧠 Memory Soak Test (30 phút)
**Mục đích:** Kiểm tra memory leak qua thời gian dài

| Bước | Thao tác |
|------|----------|
| 1 | Ghi nhận RAM usage ban đầu (Xcode Instruments / Android Profiler) |
| 2 | Generate 5 conversations liên tiếp (mỗi lần: Config → Generate → Back) |
| 3 | Chuyển tab: Dashboard → Listening → Reading → Listening → History → Listening |
| 4 | Generate thêm 5 conversations |
| 5 | So sánh RAM usage hiện tại vs ban đầu |
| **Mong đợi:** | RAM tăng < 50MB so với ban đầu, không có trend tăng liên tục |

**Kết quả:** __________ | **RAM ban đầu:** ___MB | **RAM cuối:** ___MB

---

### MKY-011: 🌐 Network Flapping
**Mục đích:** Bật/tắt mạng liên tục trong quá trình generate

| Bước | Thao tác |
|------|----------|
| 1 | Tap "Bắt đầu" (bắt đầu API call) |
| 2 | Ngay lập tức: Tắt WiFi → bật lại → tắt → bật (trong 5 giây) |
| 3 | Quan sát kết quả |
| 4 | Thử lại: Tắt WiFi khi đang loading (giữa chừng) → bật lại → tap Retry |
| **Mong đợi:** | Error message hiện rõ, Retry hoạt động, không treo ở loading mãi |

**Kết quả:** __________ | **Ghi chú:** __________

---

### MKY-012: 🔙 Back Navigation Spam
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

### MKY-013: 🌙 Dark Mode Toggle
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

### MKY-014: 📏 Font Size Scaling
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

### MKY-015: 🔇 Volume & Silent Mode
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

## Bảng tổng kết

| Kịch bản | ID | Kết quả | Bugs |
|----------|:--:|:-------:|------|
| Config Spam | MKY-001 | | |
| Generate Loop | MKY-002 | | |
| Player Button Mash | MKY-003 | | |
| Orientation Chaos | MKY-004 | | |
| Interrupt Storm | MKY-005 | | |
| Keyboard Chaos | MKY-006 | | |
| Empty State Spam | MKY-007 | | |
| Scenario Rapid Fire | MKY-008 | | |
| Bookmark All | MKY-009 | | |
| Memory Soak | MKY-010 | | |
| Network Flapping | MKY-011 | | |
| Back Spam | MKY-012 | | |
| Dark Mode Toggle | MKY-013 | | |
| Font Size Scaling | MKY-014 | | |
| Volume & Silent | MKY-015 | | |

---

> [!TIP]
> **Pro tip:** Chạy monkey test khi device đang kết nối Xcode Instruments (iOS) hoặc Android Profiler.
> Ghi lại CPU, Memory, Network metrics để phát hiện performance regression.
