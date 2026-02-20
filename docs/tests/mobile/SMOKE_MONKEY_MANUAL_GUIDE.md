# 🔥 SMOKE / MONKEY / MANUAL TEST GUIDE

**Module:** Listening  
**Tester:** Anh zai Thành  
**Date:** 13/02/2026  
**Device:** iPhone thật / Android thật

> Tài liệu này hướng dẫn test thủ công trên device thật. Tick ✅/❌ sau mỗi case.

---

## 🚀 I. SMOKE TEST (~5 phút)

Mục đích: Kiểm tra nhanh các feature **chính** có hoạt động không — chạy TRƯỚC mỗi release.

| # | ID | Tên | Các bước | Expected | Kết quả |
|---|:---|:----|:---------|:---------|:--------|
| 1 | SMK-LIS-001 | Mở Config Screen | Dashboard → Tap "Luyện nghe" | ConfigScreen render đầy đủ sections | ☐ |
| 2 | SMK-LIS-002 | TopicPicker hiển thị | Scroll xuống → thấy TopicPicker | 3 category tabs (IT, Daily, Personal), scenarios hiện | ☐ |
| 3 | SMK-LIS-003 | Chọn 1 scenario | Tap bất kỳ scenario trong TopicPicker | Scenario highlight, topic tự điền | ☐ |
| 4 | SMK-LIS-004 | Search topic | Gõ "coffee" vào search bar | Filter scenarios, chỉ hiện related | ☐ |
| 5 | SMK-LIS-005 | Đổi duration | Tap "10 phút" chip | Duration = 10, chip highlight | ☐ |
| 6 | SMK-LIS-006 | Custom duration | Tap "Custom" → nhập "7" | Duration = 7 phút | ☐ |
| 7 | SMK-LIS-007 | Chọn speakers | Tap "3 Speakers" | Speaker = 3, chip highlight | ☐ |
| 8 | SMK-LIS-008 | Nhập keywords | Gõ "meeting, deadline" | Keywords hiển thị đúng, counter đếm | ☐ |
| 9 | SMK-LIS-009 | Toggle Vietnamese | Bật/tắt switch "Kèm tiếng Việt" | Switch toggle mượt | ☐ |
| 10 | SMK-LIS-010 | Tap "Start Listening" | Config xong → Tap Start | Loading → Navigate sang PlayerScreen (hoặc hiển thị result) | ☐ |

### Tiêu chí PASS Smoke Test
- ✅ **10/10**: Ship an tâm
- ⚠️ **8-9/10**: Ship được, cần fix minor
- ❌ **< 8/10**: BLOCK! Không ship, fix trước

---

## 🐒 II. MONKEY TEST (~10 phút)

Mục đích: Test theo kiểu **"thằng bé nghịch điện thoại"** — tap lung tung, nhập bậy bạ, interrupt flow. Tìm crash & edge case.

### Nguyên tắc Monkey Test
1. **Không suy nghĩ** — tap bất cứ đâu, bất cứ lúc nào
2. **Nhanh** — thao tác liên tục, không chờ animation xong
3. **Bất ngờ** — làm thứ user bình thường KHÔNG BAO GIỜ làm
4. **Ghi lại** — nếu crash, ghi lại bước cuối cùng trước khi crash

| # | ID | Kịch bản Chaos | Các bước | Điều KHÔNG được xảy ra | Kết quả |
|---|:---|:---------------|:---------|:-----------------------|:--------|
| 1 | MKY-LIS-001 | Tap điên cuồng | Tap liên tục vào tất cả buttons, chips, inputs (20 lần/10s) | ❌ App crash ❌ Freeze > 3s | ☐ |
| 2 | MKY-LIS-002 | Xoay màn hình | Xoay dọc → ngang → dọc 5 lần liên tiếp khi đang ở ConfigScreen | ❌ Layout vỡ ❌ Data mất ❌ Crash | ☐ |
| 3 | MKY-LIS-003 | Switch app nhanh | Đang ở ConfigScreen → Home → mở lại app (5 lần) | ❌ Data config bị reset ❌ Crash | ☐ |
| 4 | MKY-LIS-004 | Nhập emoji vào Topic | Gõ "☕🔥💀👻🎃" vào topic input | ❌ Crash ❌ Layout vỡ (nên hiện bình thường hoặc ignore) | ☐ |
| 5 | MKY-LIS-005 | Nhập siêu dài vào Keywords | Paste 500+ ký tự vào Keywords input | ❌ Crash ❌ Input không bị limit (phải cắt ở 200 ký tự) | ☐ |
| 6 | MKY-LIS-006 | Open keyboard + scroll | Mở keyboard → scroll nhanh lên xuống → tap chip | ❌ Crash ❌ Keyboard che mất input | ☐ |
| 7 | MKY-LIS-007 | Back button liên tục | Tap back 10 lần nhanh từ ConfigScreen | ❌ Crash ❌ Navigate sai screen (chỉ nên về Dashboard) | ☐ |
| 8 | MKY-LIS-008 | Interrupt generate | Tap Start → ngay lập tức tap Back/Home button | ❌ Crash ❌ Request bị hang (phải có loading timeout) | ☐ |
| 9 | MKY-LIS-009 | Chọn/bỏ chọn liên tục | Tap 1 scenario chip 20 lần liên tiếp (chọn/hủy/chọn/hủy) | ❌ Crash ❌ State sai (cuối cùng phải đúng selected/unselected) | ☐ |
| 10 | MKY-LIS-010 | Unicode & ký tự đặc biệt | Gõ `<script>alert(1)</script>` và `'; DROP TABLE users; --` vào inputs | ❌ XSS ❌ SQL injection ❌ Crash (nên hiện text bình thường) | ☐ |

### Khi tìm thấy bug
1. Ghi lại **bước cuối cùng** trước khi bug xảy ra
2. Screenshot / screen recording
3. Ghi device + OS version
4. Ghi mức severity: 🔴 Crash / 🟡 UI lỗi / 🟢 Minor

---

## 📱 III. MANUAL TEST (~30 phút)

Mục đích: Test chi tiết **từng feature** trên device thật — kiểm tra UI/UX, animation, touch targets, accessibility.

### A. ConfigScreen — Layout & Rendering

| # | ID | Tên | Các bước chi tiết | Expected Result | Kết quả |
|---|:---|:----|:-------------------|:----------------|:--------|
| 1 | MNL-LIS-001 | Section headers hiển thị | Mở ConfigScreen, scroll từ trên xuống dưới | Thấy đủ sections: Topic, Duration, Speakers, Keywords, Vietnamese, Advanced Options, Start button | ☐ |
| 2 | MNL-LIS-002 | SafeArea & notch | Mở ConfigScreen trên iPhone có notch | Content không bị notch/dynamic island che | ☐ |
| 3 | MNL-LIS-003 | Scroll mượt | Scroll nhanh lên xuống ConfigScreen | ~60 FPS, không jank/stutter | ☐ |
| 4 | MNL-LIS-004 | Dark mode | Bật dark mode trên device → mở ConfigScreen | Tất cả màu sắc phù hợp dark mode, text readable | ☐ |

### B. TopicPicker — Chi tiết

| # | ID | Tên | Các bước chi tiết | Expected Result | Kết quả |
|---|:---|:----|:-------------------|:----------------|:--------|
| 5 | MNL-LIS-005 | Category tabs render | Xem 3 tabs: IT, Daily, Personal | Tabs hiện đúng icon + name, tap chuyển tab mượt | ☐ |
| 6 | MNL-LIS-006 | SubCategory accordion | Tap 1 subcategory header (e.g. "Agile Ceremonies") | Expand ra danh sách scenarios, icon xoay | ☐ |
| 7 | MNL-LIS-007 | Scenario item — tap select | Tap 1 scenario trong list | Scenario highlight, config.topic cập nhật | ☐ |
| 8 | MNL-LIS-008 | Scenario item — tap ⭐ favorite | Tap icon ⭐ trên 1 scenario | Star fill/yellow, scenario lưu vào favorites | ☐ |
| 9 | MNL-LIS-009 | Search — tìm kiếm | Gõ "hotel" vào search bar | Chỉ hiện scenarios match, categories khác ẩn | ☐ |
| 10 | MNL-LIS-010 | Search — clear | Gõ text → tap X clear | Search bar trống, tất cả scenarios hiện lại | ☐ |

### C. Duration & Speakers

| # | ID | Tên | Các bước chi tiết | Expected Result | Kết quả |
|---|:---|:----|:-------------------|:----------------|:--------|
| 11 | MNL-LIS-011 | Duration preset chips | Lần lượt tap [5] [10] [15] | Mỗi chip highlight đúng, chỉ 1 selected | ☐ |
| 12 | MNL-LIS-012 | Custom duration input | Tap "Custom" → nhập 25 → tap ra ngoài | Duration = 25, input hiển thị "25" | ☐ |
| 13 | MNL-LIS-013 | Custom duration boundary | Nhập 0 → Expected: hiện 1 (min). Nhập 99 → Expected: hiện 60 (max) | Giá trị clamp đúng 1-60 | ☐ |
| 14 | MNL-LIS-014 | Speakers chips | Lần lượt tap 👤×2, 👤×3, 👤×4 | Chip highlight, label hiện (Dialog/Group/Team) | ☐ |

### D. Keywords & Vietnamese Toggle

| # | ID | Tên | Các bước chi tiết | Expected Result | Kết quả |
|---|:---|:----|:-------------------|:----------------|:--------|
| 15 | MNL-LIS-015 | Keywords input hiển thị | Tap vào Keywords input | Keyboard lên, multiline, placeholder hiện | ☐ |
| 16 | MNL-LIS-016 | Keywords char counter | Gõ 150 ký tự → xem counter | Counter hiện "150/200", còn gõ được | ☐ |
| 17 | MNL-LIS-017 | Keywords max length | Gõ/paste > 200 ký tự | Input cắt ở 200, counter = "200/200" | ☐ |
| 18 | MNL-LIS-018 | Vietnamese toggle | Tap toggle ON → OFF → ON | Switch animation mượt, state lưu đúng | ☐ |

### E. Advanced Options Bottom Sheet

| # | ID | Tên | Các bước chi tiết | Expected Result | Kết quả |
|---|:---|:----|:-------------------|:----------------|:--------|
| 19 | MNL-LIS-019 | Mở Advanced Options | Tap "Advanced Options" | Bottom sheet slide up, có Difficulty, Voice, Multi-talker | ☐ |
| 20 | MNL-LIS-020 | Chọn difficulty | Tap "Advanced" trong sheet | Chip highlight, setting lưu | ☐ |
| 21 | MNL-LIS-021 | Random voice toggle | Toggle "Random voice" ON | Switch animation mượt | ☐ |
| 22 | MNL-LIS-022 | Đóng sheet | Swipe down hoặc tap backdrop | Sheet đóng mượt, settings giữ nguyên | ☐ |

### F. Start Listening — Full Flow (E2E)

| # | ID | Tên | Các bước chi tiết | Expected Result | Kết quả |
|---|:---|:----|:-------------------|:----------------|:--------|
| 23 | MNL-LIS-023 | Happy path full flow | 1. Chọn topic "Daily Stand-up"<br>2. Duration = 5<br>3. Speakers = 2<br>4. Tap Start | Loading indicator → Navigate sang Player/Result screen | ☐ |
| 24 | MNL-LIS-024 | Start without topic | Không chọn topic → Tap Start | Validation error hiện: "Chọn topic trước" | ☐ |
| 25 | MNL-LIS-025 | Start khi mất mạng | Tắt wifi/4G → Tap Start | Error toast/dialog: "Cần kết nối mạng" | ☐ |

### G. Custom Scenario

| # | ID | Tên | Các bước chi tiết | Expected Result | Kết quả |
|---|:---|:----|:-------------------|:----------------|:--------|
| 26 | MNL-LIS-026 | Tạo custom scenario | Nhập tên "My Topic" + mô tả → Tap "Quick Use" | Scenario điền vào config.topic, ready to start | ☐ |
| 27 | MNL-LIS-027 | Save custom scenario | Nhập tên "My Topic" → Tap "Save" | Scenario lưu vào danh sách (local) | ☐ |
| 28 | MNL-LIS-028 | Delete custom scenario | Tap delete icon trên saved scenario | Scenario xóa khỏi list | ☐ |

---

## 📝 IV. BÁO CÁO KẾT QUẢ

### Thiết bị test
| | Info |
|---|------|
| Device | __________________ |
| OS | iOS/Android ______ |
| App version | __________________ |
| Ngày test | __________________ |

### Tổng hợp
| Loại test | Tổng cases | Pass ✅ | Fail ❌ | Skip ⏭️ |
|-----------|-----------|---------|---------|---------|
| Smoke | 10 | /10 | /10 | /10 |
| Monkey | 10 | /10 | /10 | /10 |
| Manual | 28 | /28 | /28 | /28 |
| **TOTAL** | **48** | **/48** | **/48** | **/48** |

### Bug Log
| # | Test ID | Severity | Mô tả bug | Screenshot |
|---|---------|----------|-----------|------------|
| 1 | | 🔴/🟡/🟢 | | |
| 2 | | 🔴/🟡/🟢 | | |
| 3 | | 🔴/🟡/🟢 | | |

---

> **Tips cho anh zai Thành:**
> - Chạy **Smoke** trước — nếu < 8/10 thì STOP, báo bug
> - Tiếp **Monkey** — tập trung tìm crash
> - Cuối **Manual** — test chi tiết từng feature
> - Ghi chú bug vào bảng Bug Log phía trên
