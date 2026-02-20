# 🔥 SMOKE / MONKEY / MANUAL TEST GUIDE — Speaking

**Module:** Speaking  
**Tester:** Anh zai Thành  
**Date:** ____/____/2026  
**Device:** iPhone thật (cần mic + loa)

> Tài liệu này hướng dẫn test thủ công Speaking trên device thật. Tick ✅/❌ sau mỗi case.

---

## 🚀 I. SMOKE TEST (~5 phút)

Mục đích: Kiểm tra nhanh luồng chính — chạy TRƯỚC mỗi release.

| # | ID | Tên | Các bước | Expected | Kết quả |
|---|:---|:----|:---------|:---------|:--------|
| 1 | SMK-SPK-001 | Mở ConfigScreen | Dashboard → Tap "Luyện Nói" | ConfigScreen render đầy đủ: input topic, 8 chips, level selector, nút Start | ☐ |
| 2 | SMK-SPK-002 | Chọn topic + level | Tap chip "💻 Công nghệ", chọn level Intermediate | Topic + Level cập nhật, hiện ở UI | ☐ |
| 3 | SMK-SPK-003 | Start → Practice | Config xong → Tap "Bắt đầu" | Loading → Navigate PracticeScreen, hiện câu + mic | ☐ |
| 4 | SMK-SPK-004 | Ghi âm | Nhấn giữ mic 3s → thả | Timer chạy, waveform, thả → preview audio | ☐ |
| 5 | SMK-SPK-005 | Submit → Feedback | Tap "Gửi" | Loading → Navigate FeedbackScreen, hiện điểm | ☐ |
| 6 | SMK-SPK-006 | Nghe mẫu AI | Trên PracticeScreen → Tap 🔊 | Audio AI phát qua loa, nút chuyển trạng thái | ☐ |
| 7 | SMK-SPK-007 | TTS Settings | ConfigScreen → Tap ⚙️ → Bottom sheet | Sheet hiện: provider chips, voice list, speed slider | ☐ |
| 8 | SMK-SPK-008 | Coach Mode | ConfigScreen → Mode Coach → Setup → Start | Welcome message, timer, input area | ☐ |

### Tiêu chí PASS Smoke Test
- ✅ **8/8**: Ship an tâm
- ⚠️ **6-7/8**: Ship được, cần fix minor
- ❌ **< 6/8**: BLOCK! Không ship, fix trước

---

## 🐒 II. MONKEY TEST (~10 phút)

Mục đích: Tap lung tung, nhập bậy bạ, tìm crash & edge case.

### Nguyên tắc Monkey Test
1. **Không suy nghĩ** — tap bất cứ đâu
2. **Nhanh** — thao tác liên tục
3. **Bất ngờ** — làm thứ user bình thường KHÔNG BAO GIỜ làm
4. **Ghi lại** — nếu crash, ghi bước cuối cùng

| # | ID | Kịch bản Chaos | Các bước | Điều KHÔNG được xảy ra | Kết quả |
|---|:---|:---------------|:---------|:-----------------------|:--------|
| 1 | MKY-SPK-001 | Tap điên cuồng ConfigScreen | Tap liên tục tất cả chips, inputs, buttons (20 lần/10s) | ❌ Crash ❌ Freeze > 3s | ☐ |
| 2 | MKY-SPK-002 | Nhấn mic nhanh liên tục | Nhấn/thả mic 10 lần liên tiếp trên PracticeScreen | ❌ Crash ❌ Audio bị trùng | ☐ |
| 3 | MKY-SPK-003 | Switch app khi đang ghi âm | Đang nhấn mic → Home → quay lại app | ❌ Crash ❌ Mic vẫn ghi khi background | ☐ |
| 4 | MKY-SPK-004 | Emoji + XSS vào topic | Gõ `☕🔥<script>alert(1)</script>` vào topic input | ❌ Crash ❌ XSS ❌ Layout vỡ | ☐ |
| 5 | MKY-SPK-005 | Xoay màn hình | Xoay dọc → ngang → dọc 5 lần trên PracticeScreen | ❌ Layout vỡ ❌ Data mất ❌ Crash | ☐ |
| 6 | MKY-SPK-006 | Back nhanh khi loading | Tap Start → ngay lập tức tap Back | ❌ Crash ❌ Request bị hang | ☐ |
| 7 | MKY-SPK-007 | Chuyển câu nhanh | NextSentence 20 lần liên tục | ❌ Crash ❌ Index sai (kiểm tra bounds) | ☐ |
| 8 | MKY-SPK-008 | Coach: gõ + nói liên tục | Đổi text ↔ voice, gửi 10 tin liên tục | ❌ Crash ❌ Messages lộn xộn | ☐ |
| 9 | MKY-SPK-009 | TTS Sheet: kéo slider điên | Kéo speed slider qua lại 20 lần nhanh | ❌ Crash ❌ Lag ❌ Speed sai | ☐ |
| 10 | MKY-SPK-010 | Đóng/mở TTS Sheet liên tục | Mở sheet → đóng → mở → đóng (10 lần) | ❌ Crash ❌ Settings bị reset | ☐ |

### Khi tìm thấy bug
1. Ghi lại **bước cuối cùng** trước khi bug
2. Screenshot / screen recording
3. Ghi device + OS version
4. Ghi mức severity: 🔴 Crash / 🟡 UI lỗi / 🟢 Minor

---

## 📱 III. MANUAL TEST (~40 phút)

### A. ConfigScreen — UI & Interaction

| # | ID | Tên | Các bước chi tiết | Expected Result | Kết quả |
|---|:---|:----|:-------------------|:----------------|:--------|
| 1 | MNL-SPK-001 | Layout đầy đủ | Mở ConfigScreen, scroll từ trên xuống dưới | Topic input, 8 chips, level selector, TTS button, Start button | ☐ |
| 2 | MNL-SPK-002 | Topic input | Gõ "Business meeting" vào input | Text hiện, keyboard mượt | ☐ |
| 3 | MNL-SPK-003 | Chip gợi ý | Tap "💼 Kinh doanh" → topic auto-fill | Topic = "Kinh doanh" (bỏ emoji) | ☐ |
| 4 | MNL-SPK-004 | Level selector | Tap Beginner → Intermediate → Advanced | Segment highlight đúng, chỉ 1 selected | ☐ |
| 5 | MNL-SPK-005 | Dark mode | Bật dark mode → mở ConfigScreen | Tất cả text readable, contrast OK | ☐ |

### B. PracticeScreen — Recording Flow

| # | ID | Tên | Các bước chi tiết | Expected Result | Kết quả |
|---|:---|:----|:-------------------|:----------------|:--------|
| 6 | MNL-SPK-006 | Hiển thị câu | Navigate từ Config → Practice | Câu tiếng Anh hiện rõ, nút mic, counter | ☐ |
| 7 | MNL-SPK-007 | Hold-to-record | Nhấn giữ mic → timer chạy → thả | Waveform animation, timer 0→15s, haptic feedback | ☐ |
| 8 | MNL-SPK-008 | Preview audio | Sau record → tap Play | Nghe lại audio đã ghi, nút ▶/⏹ toggle | ☐ |
| 9 | MNL-SPK-009 | Retry recording | Tap "🔄 Ghi lại" | Xóa audio cũ, có thể ghi mới | ☐ |
| 10 | MNL-SPK-010 | Navigate sentences | Tap ← / → | Đổi câu, progress counter cập nhật | ☐ |
| 11 | MNL-SPK-011 | Nghe mẫu AI TTS | Tap 🔊 → nghe → tap lại | Audio phát → dừng khi tap lại | ☐ |

### C. FeedbackScreen — Score & Actions

| # | ID | Tên | Các bước chi tiết | Expected Result | Kết quả |
|---|:---|:----|:-------------------|:----------------|:--------|
| 12 | MNL-SPK-012 | Score display | Submit → xem Feedback | Overall score (0-100), emoji, label đúng range | ☐ |
| 13 | MNL-SPK-013 | Score breakdown | Xem chi tiết | Fluency, Pronunciation, Pace bars hiện đúng | ☐ |
| 14 | MNL-SPK-014 | Word-by-word | Scroll xuống | Từng từ có màu (xanh/đỏ) + điểm | ☐ |
| 15 | MNL-SPK-015 | Tips & patterns | Scroll xuống | Hiện tips sửa + patterns lỗi | ☐ |
| 16 | MNL-SPK-016 | Retry button | Tap "Luyện lại" | Navigate back PracticeScreen, cùng câu | ☐ |
| 17 | MNL-SPK-017 | Next button | Tap "Tiếp theo" | Navigate PracticeScreen, câu tiếp | ☐ |

### D. TTS Settings Sheet

| # | ID | Tên | Các bước chi tiết | Expected Result | Kết quả |
|---|:---|:----|:-------------------|:----------------|:--------|
| 18 | MNL-SPK-018 | Mở TTS sheet | Tap ⚙️ trên ConfigScreen | Bottom sheet slide up, handle bar hiện | ☐ |
| 19 | MNL-SPK-019 | Chọn provider | Tap OpenAI → Azure → OpenAI | Chip highlight, voice list đổi theo | ☐ |
| 20 | MNL-SPK-020 | Chọn voice | Tap giọng "Nova" | Checkmark hiện, row highlight | ☐ |
| 21 | MNL-SPK-021 | Speed slider | Kéo slider từ 0.5 → 2.0 | Label hiện "0.5x" → "2.0x", steps 0.1 | ☐ |
| 22 | MNL-SPK-022 | Nghe thử | Tap "🔊 Nghe thử" | Audio phát đúng giọng đã chọn, loading state | ☐ |
| 23 | MNL-SPK-023 | Đóng sheet | Swipe down hoặc tap backdrop | Sheet đóng, settings giữ nguyên | ☐ |

### E. Coach Mode

| # | ID | Tên | Các bước chi tiết | Expected Result | Kết quả |
|---|:---|:----|:-------------------|:----------------|:--------|
| 24 | MNL-SPK-024 | Setup screen | Navigate → Coach Setup | Topic, duration, feedback mode inputs | ☐ |
| 25 | MNL-SPK-025 | Start session | Setup xong → Start | Welcome message từ AI, timer chạy | ☐ |
| 26 | MNL-SPK-026 | Voice input | Nhấn giữ mic → nói → thả | Transcribe → gửi → AI trả lời | ☐ |
| 27 | MNL-SPK-027 | Text input | Switch text mode → gõ → gửi | Message hiện, AI trả lời | ☐ |
| 28 | MNL-SPK-028 | Timer countdown | Chờ timer | Timer giảm mm:ss, auto-end khi hết | ☐ |
| 29 | MNL-SPK-029 | End session | Tap End / hết giờ | Banner "Session đã kết thúc", summary | ☐ |

### F. Voice Clone Replay (FeedbackScreen)

| # | ID | Tên | Các bước chi tiết | Expected Result | Kết quả |
|---|:---|:----|:-------------------|:----------------|:--------|
| 30 | MNL-SPK-030 | VoiceClone hiện | Scroll xuống FeedbackScreen | "🎭 AI Voice Clone" section hiện | ☐ |
| 31 | MNL-SPK-031 | Play user audio | Tap "🎤 Bản gốc" | Audio user phát, border highlight đỏ | ☐ |
| 32 | MNL-SPK-032 | Play AI audio | Tap "🤖 AI đã sửa" | Audio AI phát, border highlight tím | ☐ |
| 33 | MNL-SPK-033 | Toggle play | Đang phát user → tap AI | User dừng, AI phát | ☐ |
| 34 | MNL-SPK-034 | Improvements list | Scroll xuống VoiceClone | Phoneme badges, before → after | ☐ |

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
| Smoke | 8 | /8 | /8 | /8 |
| Monkey | 10 | /10 | /10 | /10 |
| Manual | 34 | /34 | /34 | /34 |
| **TOTAL** | **52** | **/52** | **/52** | **/52** |

### Bug Log
| # | Test ID | Severity | Mô tả bug | Screenshot |
|---|---------|----------|-----------|------------|
| 1 | | 🔴/🟡/🟢 | | |
| 2 | | 🔴/🟡/🟢 | | |
| 3 | | 🔴/🟡/🟢 | | |

---

> **Tips cho anh zai Thành:**
> - Chạy **Smoke** trước — nếu < 6/8 thì STOP, báo bug
> - Tiếp **Monkey** — tập trung tìm crash, đặc biệt mic + audio
> - Cuối **Manual** — test chi tiết từng feature, chú ý TTS + Coach
> - Ghi chú bug vào bảng Bug Log phía trên
> - Riêng Coach Mode: test cả voice + text input, chú ý timer
