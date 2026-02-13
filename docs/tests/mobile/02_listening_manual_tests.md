# 🎧 Listening — Manual Test Procedures

> **Module:** Listening (ConfigScreen + PlayerScreen)
> **Mục đích:** Hướng dẫn step-by-step cho QA test trên device thật
> **Thời gian chạy:** ~45-60 phút (full run)
> **Tester:** Manually on physical device (iOS / Android)

---

## Pre-conditions

- Device có iOS 16+ hoặc Android 12+
- App build mới nhất (debug hoặc release)
- WiFi ổn định, speed ≥ 10Mbps
- Đã login với tài khoản test
- Loa hoặc tai nghe kết nối

---

## MANUAL-01: Full E2E Flow — Từ Config tới Xong Bài

### Mục đích
Verify toàn bộ luồng chính từ đầu tới cuối — user mở app, config bài nghe, nghe xong, và tạo bài mới.

### Steps

| # | Action | Expected Result | Actual | P/F |
|---|--------|-----------------|--------|-----|
| 1 | Mở app → Tap "Luyện nghe" từ Dashboard | ConfigScreen hiện | | |
| 2 | Tap "Topic" → chọn "IT" category → chọn "Machine Learning" | Topic field = "Machine Learning" | | |
| 3 | Tap Duration = 10 phút | Duration badge = "10 min" | | |
| 4 | Tap Speakers = 3 | Speakers badge = "3" | | |
| 5 | Nhập Keywords = "neural network, deep learning" | Keywords hiển thị đúng | | |
| 6 | Tap "Bắt đầu nghe" | Loading spinner → navigate PlayerScreen (5-30s) | | |
| 7 | Observe: transcript hiện | ≥5 exchanges, 3 speakers khác nhau, có VN translation | | |
| 8 | Observe: audio banner | "Đang tạo audio..." hiện, spinner quay | | |
| 9 | Đợi audio gen xong | Banner biến mất, toast "Audio sẵn sàng", auto-play | | |
| 10 | Nghe hết bài (hoặc skip đến cuối) | Audio kết thúc, player dừng | | |
| 11 | Tap 🔄 "Bài mới" → Confirm | Navigate về ConfigScreen, state đã reset | | |
| 12 | Verify topic/duration/speakers đã reset | Topic = "", Duration = 5, Speakers = 2 | | |

### Kết quả: ☐ PASS / ☐ FAIL

---

## MANUAL-02: Audio Playback Controls — Chi Tiết

### Mục đích
Verify tất cả controls phát audio hoạt động chính xác.

### Pre-condition: Đã generate bài + audio đang phát

| # | Action | Expected Result | Actual | P/F |
|---|--------|-----------------|--------|-----|
| 1 | Observe progress bar | Thanh progress di chuyển từ trái sang phải | | |
| 2 | Observe time display | `current / total` format mm:ss (vd: "1:23 / 5:00") | | |
| 3 | Tap Pause ⏸️ | Audio dừng, icon đổi ▶️, progress bar dừng | | |
| 4 | Đợi 5 giây → Tap Play ▶️ | Audio tiếp tục từ vị trí dừng (không phát lại từ đầu) | | |
| 5 | Tap ⏩ Skip Forward | Nhảy sang exchange tiếp, audio seek tới timestamp | | |
| 6 | Quan sát transcript highlight | Exchange mới được highlight xanh | | |
| 7 | Tap ⏪ Skip Back | Quay lại exchange trước, audio seek back | | |
| 8 | Tap tốc độ "1x" | Đổi "1.25x", toast hiện, audio nhanh hơn | | |
| 9 | Tap tốc độ 4 lần nữa | Cycle: 1.5x → 2x → 0.5x → 0.75x | | |
| 10 | Ở 0.5x: nghe 5 giây | Audio chậm rõ, giọng vẫn rõ (không méo) | | |
| 11 | Ở 2x: nghe 5 giây | Audio nhanh, giọng vẫn rõ (không méo) | | |
| 12 | Tap tốc độ → quay về 1x | Badge = "1x", audio tốc độ bình thường | | |

### Kết quả: ☐ PASS / ☐ FAIL

---

## MANUAL-03: Transcript Highlight Sync

### Mục đích
Verify transcript highlight di chuyển đúng theo audio.

### Pre-condition: Audio đang phát, transcript visible

| # | Action | Expected Result | Actual | P/F |
|---|--------|-----------------|--------|-----|
| 1 | Quan sát 30 giây không chạm | Highlight tự di chuyển xuống theo câu đang đọc | | |
| 2 | Exchange #1 highlight | Background xanh, icon 🔊 hiện | | |
| 3 | Khi speaker đổi | Highlight chuyển sang exchange mới | | |
| 4 | Tap exchange #5 (nhảy tới) | Audio seek tới timestamp exchange #5 | | |
| 5 | Transcript dài (>10 exchanges) — scroll xuống | Highlight vẫn đúng vị trí | | |
| 6 | Scroll manual lên → audio vẫn phát → highlight ở đâu? | Highlight vẫn ở exchange đang phát (có thể off-screen) | | |

### Kết quả: ☐ PASS / ☐ FAIL

---

## MANUAL-04: Dictionary Popup — Tra Từ

### Mục đích
Verify tính năng tra từ điển khi tap vào từ trong transcript.

### Pre-condition: PlayerScreen có transcript

| # | Action | Expected Result | Actual | P/F |
|---|--------|-----------------|--------|-----|
| 1 | Tap từ "hello" trong transcript | DictionaryPopup BottomSheet mở lên | | |
| 2 | Observe: word header | Từ "hello" hiện to ở đầu popup | | |
| 3 | Observe: IPA | Phiên âm IPA hiện (vd: /həˈloʊ/) | | |
| 4 | Observe: meanings | Ít nhất 1 nghĩa hiện, có partOfSpeech badge (noun/verb) | | |
| 5 | Observe: example | Ít nhất 1 ví dụ hiện (nếu có) | | |
| 6 | Tap 🔊 phát âm | Nghe phát âm từ "hello" (TTS hoặc audio file) | | |
| 7 | Tap 💾 "Lưu từ" | Toast "Đã lưu từ hello", từ thêm vào savedWords | | |
| 8 | Swipe popup xuống để đóng | Popup đóng smooth, audio chính tiếp tục | | |
| 9 | Tap từ "serendipity" (từ khó) | Popup mở, hiện nghĩa tiếng Anh | | |
| 10 | KHÔNG đóng popup → Tap từ "afternoon" | Popup cập nhật sang từ "afternoon" (MOB-LIS-MVP-EC-005) | | |
| 11 | Tap từ không tồn tại (vd: viết tắt "btw") | Error message "Không tìm thấy từ" hiện trong popup | | |
| 12 | Tap vào dấu câu (dấu chấm) | Không mở popup (filtered out) | | |

### Kết quả: ☐ PASS / ☐ FAIL

---

## MANUAL-05: Bookmark Sentences

### Mục đích
Verify tính năng bookmark câu bằng long press.

### Pre-condition: PlayerScreen có transcript, audio có thể phát hoặc không

| # | Action | Expected Result | Actual | P/F |
|---|--------|-----------------|--------|-----|
| 1 | Long press (~400ms) câu thứ 1 | Haptic feedback (medium), ⭐ icon hiện, viền vàng, toast "Đã lưu bookmark" | | |
| 2 | Observe visual state | Exchange có `bg-yellow-500/5 border-yellow-500/20` | | |
| 3 | Long press câu thứ 3 | Câu #3 cũng bookmark, câu #1 vẫn có ⭐ | | |
| 4 | Long press lại câu thứ 1 | ⭐ biến mất, viền vàng mất, toast "Đã bỏ bookmark" | | |
| 5 | Tap câu đã bookmark (tap ngắn, không long press) | Audio seek tới câu đó (không toggle bookmark) | | |
| 6 | Bookmark 5 câu → scroll lên xuống | Tất cả ⭐ vẫn hiện đúng | | |
| 7 | Tạo bài mới (reset) → quay lại | Bookmarks cũ đã biến mất (reset) | | |

### Kết quả: ☐ PASS / ☐ FAIL

---

## MANUAL-06: Gesture Controls

### Mục đích
Verify swipe + double tap gestures trên vùng player.

### Pre-condition: PlayerScreen, audio đang phát

| # | Action | Expected Result | Actual | P/F |
|---|--------|-----------------|--------|-----|
| 1 | Swipe left trên vùng transcript | Nhảy câu trước, haptic feedback | | |
| 2 | Swipe right trên vùng transcript | Nhảy câu tiếp, haptic feedback | | |
| 3 | Swipe down trên vùng transcript | Toast "Tính năng mini player sẽ sớm ra mắt!" | | |
| 4 | Double tap vùng transcript | Toggle Play/Pause | | |
| 5 | Single tap vùng transcript (không phải từ/exchange) | KHÔNG trigger play/pause (tránh false positive) | | |
| 6 | Swipe nhẹ (<50px) | KHÔNG trigger action (dưới threshold) | | |
| 7 | Swipe nhanh (velocity >300px/s) | Trigger action dù displacement nhỏ | | |

### Kết quả: ☐ PASS / ☐ FAIL

---

## MANUAL-07: TTS Provider Settings

### Mục đích
Verify chọn TTS provider và voice ảnh hưởng đến audio output.

### Pre-condition: Chưa generate bài

| # | Action | Expected Result | Actual | P/F |
|---|--------|-----------------|--------|-----|
| 1 | (Nếu có UI) Mở Settings → TTS → chọn "Azure" | Provider đổi thành Azure | | |
| 2 | Generate bài mới → nghe audio | Giọng đọc khác so với OpenAI (nếu backend hỗ trợ) | | |
| 3 | Chọn voice "alloy" → generate bài | Audio dùng voice alloy | | |
| 4 | Chọn "Random" (null) → generate 2 bài | 2 bài có voice khác nhau (random) | | |

> **Note:** Backend cần hỗ trợ ttsProvider/voice. Nếu chưa → test payload có gửi đúng options.

### Kết quả: ☐ PASS / ☐ FAIL

---

## MANUAL-08: Error Handling

### Mục đích
Verify app xử lý lỗi đúng trong các tình huống xấu.

| # | Action | Expected Result | Actual | P/F |
|---|--------|-----------------|--------|-----|
| 1 | Navigate trực tiếp tới PlayerScreen (không qua Config) | Hiện "Không có dữ liệu hội thoại" | | |
| 2 | Tắt mạng → tap "Bắt đầu nghe" ở Config | Toast error "Cần kết nối mạng" | | |
| 3 | Audio đang gen → tắt mạng | Toast "Không thể tạo audio" + transcript vẫn đọc được | | |
| 4 | Tap Play khi chưa có audio | Toast "Audio chưa sẵn sàng" | | |
| 5 | Play khi audio gen xong → disconnect Bluetooth headphone | Audio chuyển sang loa ngoài hoặc pause | | |
| 6 | Bookmark câu → API lỗi (server down) | Rollback ⭐, toast "Lỗi, thử lại sau" | | |
| 7 | Tra từ khi mất mạng | Error trong DictionaryPopup, không crash | | |

### Kết quả: ☐ PASS / ☐ FAIL

---

## MANUAL-09: Background & Lock Screen

### Mục đích
Verify audio hoạt động khi app không foreground.

### Pre-condition: Audio đang phát

| # | Action | Expected Result | Actual | P/F |
|---|--------|-----------------|--------|-----|
| 1 | Press Home button | Audio tiếp tục phát | | |
| 2 | Lock screen | Audio tiếp tục phát | | |
| 3 | Xem Lock screen controls | Now Playing card hiện: title, play/pause/next buttons | | |
| 4 | Tap Pause trên Lock screen | Audio dừng | | |
| 5 | Tap Play trên Lock screen | Audio tiếp tục | | |
| 6 | Quay lại app | State đồng bộ: đang play/pause đúng, highlight đúng | | |
| 7 | Nhận cuộc gọi → reject → quay lại | Audio auto-resume (hoặc ở trạng thái pause) | | |

### Kết quả: ☐ PASS / ☐ FAIL

---

## MANUAL-10: Performance & Visual

### Mục đích
Verify performance và visual quality trên device thật.

| # | Check | Criteria | Actual | P/F |
|---|-------|----------|--------|-----|
| 1 | Scroll FPS (transcript 20+ exchanges) | ≥55 FPS, không janky | | |
| 2 | Audio gen loading time | ≤120s cho bài 5 phút | | |
| 3 | Dictionary popup animation | Spring animation smooth, không flickering | | |
| 4 | Bookmark icon animation | Instant response (<100ms), haptic sync | | |
| 5 | Progress bar smooth | Mượt, không giật khi cập nhật mỗi 500ms | | |
| 6 | Font rendering | Tiếng Việt hiển thị đúng diacritics, không bị cắt | | |
| 7 | Safe area | Content không bị notch/home indicator che | | |
| 8 | Dark mode | Tất cả text readable, contrast đủ (WCAG AA) | | |

### Kết quả: ☐ PASS / ☐ FAIL

---

## Tổng Kết Manual Test

| Test | Kết quả | Bug ID (nếu có) |
|------|---------|-----------------|
| MANUAL-01 Full E2E | | |
| MANUAL-02 Playback Controls | | |
| MANUAL-03 Transcript Sync | | |
| MANUAL-04 Dictionary Popup | | |
| MANUAL-05 Bookmark | | |
| MANUAL-06 Gestures | | |
| MANUAL-07 TTS Provider | | |
| MANUAL-08 Error Handling | | |
| MANUAL-09 Background | | |
| MANUAL-10 Performance | | |

**Tổng:** ___/10 PASS

**Bugs tìm thấy:**
| # | Severity | Description | Steps to Reproduce |
|---|----------|-------------|-------------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |
