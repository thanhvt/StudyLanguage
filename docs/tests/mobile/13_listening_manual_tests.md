# 🎧 Listening — Manual Test Procedures

> **Module:** Listening (ConfigScreen + PlayerScreen + Components)
> **Mục đích:** Step-by-step QA test trên device thật, verify chi tiết từng tính năng
> **Thời gian chạy:** ~60-90 phút (full run)
> **Tester:** Manual trên physical device (iOS / Android)
> **Khi nào chạy:** Mỗi sprint kết thúc / trước release

---

## Pre-conditions

- Device có iOS 16+ hoặc Android 12+
- App build mới nhất (debug hoặc release)
- WiFi ổn định, speed ≥ 10Mbps
- Đã login với tài khoản test
- Loa hoặc tai nghe kết nối

---

## Flow 1: Config Screen — Cấu hình đầy đủ

### MAN-LIS-001: Topic Selection (Chọn chủ đề)

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Tap vào ô Topic | TopicPickerModal mở, có pill handle kéo xuống | |
| 2 | Quan sát 3 tab | "Chọn theo chủ đề" / "Yêu thích ⭐" / "🎲 Ngẫu nhiên" | |
| 3 | Tap category "IT" | Accordion mở, sub-categories hiện | |
| 4 | Tap sub-category "Web Development" | Danh sách scenarios hiện (vd: "React Component Design") | |
| 5 | Tap 1 scenario | Modal đóng, Topic field = scenario name | |
| 6 | Mở lại → Tap ⭐ cạnh scenario | Star vàng, scenario vào tab "Yêu thích" | |
| 7 | Tap tab "🎲 Ngẫu nhiên" → "Chọn chủ đề ngẫu nhiên" | Chọn random scenario từ pool, modal đóng | |

### MAN-LIS-002: Duration (Thời lượng)

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Tap pill "5 phút" | Pill highlighted, config.duration = 5 | |
| 2 | Tap pill "10 phút" | Pill "10" highlighted, pill "5" unhighlight | |
| 3 | Tap pill "15 phút" | Pill "15" highlighted | |
| 4 | Tap ✏️ Custom → chọn 25 từ picker | Picker hiện 5-60, chọn 25, badge "25 phút" | |

### MAN-LIS-003: Speakers (Số người)

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Tap pill "2" | Default selected | |
| 2 | Tap pill "3" | Pill "3" highlighted, transcript sẽ có 3 speakers | |
| 3 | Tap pill "4" | Pill "4" highlighted | |

### MAN-LIS-004: Level & Keywords

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Mở Advanced Options | AdvancedOptionsSheet mở, level hiện "Intermediate" | |
| 2 | Tap "Beginner" | Chip highlighted, short/simple sentences expected | |
| 3 | Tap "Advanced" | Chip highlighted, complex vocab expected | |
| 4 | Nhập Keywords "machine learning, neural network" | Text hiện đúng, keywords gửi trong API payload | |

### MAN-LIS-005: Vietnamese Translation Toggle

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Bật toggle "Kèm bản dịch VN" (mặc định ON) | Switch = ON | |
| 2 | Generate bài → kiểm tra transcript | Mỗi câu kèm dòng tiếng Việt bên dưới | |
| 3 | Tắt toggle → Generate bài mới | Transcript KHÔNG kèm tiếng Việt | |

### MAN-LIS-006: Start Generate (Bắt đầu nghe)

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Chọn topic + duration → Tap "Bắt đầu nghe" | Loading spinner hiện, nút disabled | |
| 2 | Đợi 5-30 giây | Navigate tới PlayerScreen với transcript | |
| 3 | Tap "Bắt đầu" mà KHÔNG chọn topic | Validation error "Chọn chủ đề trước" hoặc nút disabled | |

### MAN-LIS-007: Scenario Quick Generate

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Scroll xuống vùng Scenario chips | Chips "Restaurant", "Hotel", "Airport"... hiện | |
| 2 | Tap "Restaurant" | Loading → nav PlayerScreen, transcript = nhà hàng scenario | |

---

## Flow 2: Player Screen — Playback & Transcript

### MAN-LIS-008: Full E2E Flow (Config tới Xong Bài)

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Mở app → Tap "Luyện nghe" từ Dashboard | ConfigScreen hiện | |
| 2 | Topic = "Machine Learning", Duration = 10, Speakers = 3 | Config cập nhật đúng | |
| 3 | Keywords = "neural network, deep learning" | Keywords hiển thị đúng | |
| 4 | Tap "Bắt đầu nghe" | Loading → PlayerScreen (5-30s) | |
| 5 | Observe transcript | ≥5 exchanges, 3 speakers khác nhau, có VN translation | |
| 6 | Observe banner | "Đang tạo audio..." hiện, spinner quay | |
| 7 | Đợi audio gen xong | Banner mất, toast "Audio sẵn sàng", auto-play | |
| 8 | Nghe hết bài (hoặc skip đến cuối) | Audio kết thúc, player dừng | |
| 9 | Tap 🔄 "Bài mới" → Confirm | Navigate về ConfigScreen, state reset | |
| 10 | Verify reset | Topic = "", Duration = 5, Speakers = 2 | |

### MAN-LIS-009: Audio Playback Controls Chi Tiết

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Observe progress bar | Thanh progress di chuyển từ trái → phải | |
| 2 | Observe time display | `current / total` format mm:ss (vd: "1:23 / 5:00") | |
| 3 | Tap Pause ⏸️ | Audio dừng, icon đổi ▶️, progress bar dừng | |
| 4 | Đợi 5 giây → Tap Play ▶️ | Audio tiếp tục từ vị trí dừng (không từ đầu) | |
| 5 | Tap ⏩ Skip Forward | Nhảy sang exchange tiếp, audio seek tới timestamp | |
| 6 | Quan sát transcript highlight | Exchange mới được highlight xanh | |
| 7 | Tap ⏪ Skip Back | Quay lại exchange trước, audio seek back | |

### MAN-LIS-010: Speed Control Chi Tiết

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Tap nút tốc độ "1x" | Đổi "1.25x", toast hiện | |
| 2 | Tap 4 lần nữa | Cycle: 1.25x → 1.5x → 2x → 0.5x → 0.75x | |
| 3 | Ở 0.5x: nghe 5 giây | Audio chậm rõ, giọng vẫn rõ (không méo) | |
| 4 | Ở 2x: nghe 5 giây | Audio nhanh, giọng vẫn rõ (không méo) | |
| 5 | Tap → quay về 1x | Badge = "1x", audio tốc độ bình thường | |

### MAN-LIS-011: Transcript Highlight Sync

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Quan sát 30 giây không chạm | Highlight tự di chuyển xuống theo câu đang đọc | |
| 2 | Exchange #1 highlight | Background xanh, animated EQ bars (thanh nhỏ nhấp nháy) hiện | |
| 3 | Khi speaker đổi | Highlight chuyển sang exchange mới | |
| 4 | Tap exchange #5 (nhảy tới) | Audio seek tới timestamp exchange #5 | |
| 5 | Transcript dài (>10 exchanges) — scroll xuống | Highlight vẫn đúng vị trí | |
| 6 | Scroll manual lên → audio vẫn phát | Highlight vẫn ở exchange đang phát (có thể off-screen) | |

---

## Flow 3: Dictionary & Saved Words

### MAN-LIS-012: Dictionary Popup — Tra Từ

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Tap từ "hello" trong transcript | DictionaryPopup BottomSheet mở lên | |
| 2 | Observe: word header | Từ "hello" hiện to ở đầu popup | |
| 3 | Observe: IPA | Phiên âm IPA hiện (vd: /həˈloʊ/) | |
| 4 | Observe: meanings | ≥1 nghĩa hiện, có partOfSpeech badge (noun/verb) | |
| 5 | Observe: example | ≥1 ví dụ hiện (nếu có) | |
| 6 | Tap 🔊 phát âm | Nghe phát âm từ "hello" (TTS hoặc audio file) | |
| 7 | Tap 💾 "Lưu từ" | Toast "Đã lưu từ hello", từ thêm vào savedWords | |
| 8 | Swipe popup xuống để đóng | Popup đóng smooth, audio chính tiếp tục | |
| 9 | Tap từ "serendipity" (từ khó) | Popup mở, hiện nghĩa tiếng Anh | |
| 10 | KHÔNG đóng popup → Tap từ "afternoon" | Popup cập nhật sang từ "afternoon" (MOB-LIS-MVP-EC-005) | |
| 11 | Tap từ không tồn tại (vd: viết tắt "btw") | Error "Không tìm thấy từ" hiện trong popup | |
| 12 | Tap vào dấu câu (dấu chấm) | Không mở popup (filtered out) | |

---

## Flow 4: Bookmark Sentences

### MAN-LIS-013: Bookmark (Long Press)

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Long press (~400ms) câu thứ 1 | Haptic feedback (medium), ⭐ hiện, viền vàng, toast | |
| 2 | Observe visual state | Exchange có highlight vàng + border | |
| 3 | Long press câu thứ 3 | Câu #3 bookmark, câu #1 vẫn có ⭐ | |
| 4 | Long press lại câu thứ 1 | ⭐ biến mất, viền vàng mất, toast "Đã bỏ bookmark" | |
| 5 | Tap câu đã bookmark (tap ngắn) | Audio seek tới câu đó (KHÔNG toggle bookmark) | |
| 6 | Bookmark 5 câu → scroll lên xuống | Tất cả ⭐ vẫn hiện đúng | |
| 7 | Tạo bài mới (reset) → kiểm tra | Bookmarks cũ đã biến mất (reset) | |

---

## Flow 5: Gesture Controls

### MAN-LIS-014: Gestures Trên Player

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Swipe left trên vùng transcript | Nhảy câu trước, haptic feedback | |
| 2 | Swipe right trên vùng transcript | Nhảy câu tiếp, haptic feedback | |
| 3 | Swipe down trên vùng transcript | Console log placeholder (không hiện toast) | |
| 4 | Double tap vùng transcript | Toggle Play/Pause | |
| 5 | Single tap vùng (không phải từ/exchange) | KHÔNG trigger play/pause (tránh false positive) | |
| 6 | Swipe nhẹ (<50px) | KHÔNG trigger action (dưới threshold) | |
| 7 | Swipe nhanh (velocity >300px/s) | Trigger action dù displacement nhỏ | |

---

## Flow 6: Audio & TTS Settings

### MAN-LIS-015: TTS Provider Settings

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Mở Settings → TTS → chọn "Azure" | Provider đổi thành Azure | |
| 2 | Generate bài mới → nghe audio | Giọng đọc khác so với OpenAI (nếu backend hỗ trợ) | |
| 3 | Chọn voice "alloy" → generate bài | Audio dùng voice alloy | |
| 4 | Chọn "Random" (null) → generate 2 bài | 2 bài có voice khác nhau (random) | |

> **Note:** Backend cần hỗ trợ ttsProvider/voice. Nếu chưa → test payload có gửi đúng options.

### MAN-LIS-016: Audio Generation & Banner

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Generate bài mới | "Đang tạo audio..." banner hiện | |
| 2 | Đợi gen xong (≤120s cho bài 5 phút) | Banner biến mất, toast "Audio sẵn sàng" | |
| 3 | Audio auto-play sau khi gen xong | Audio phát, play button = pause, progress chạy | |

---

## Flow 7: Error Handling

### MAN-LIS-017: Xử Lý Lỗi

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Navigate trực tiếp tới PlayerScreen (không qua Config) | Hiện empty state: icon Headphones + "Chưa có bài nghe" + nút "Quay lại" | |
| 2 | Tắt mạng → tap "Bắt đầu nghe" ở Config | Toast error "Cần kết nối mạng" | |
| 3 | Audio đang gen → tắt mạng | Toast "Không thể tạo audio" + transcript vẫn đọc được | |
| 4 | Tap Play khi chưa có audio | Toast "Audio chưa sẵn sàng" | |
| 5 | Play → disconnect Bluetooth headphone | Audio chuyển sang loa ngoài hoặc pause | |
| 6 | Bookmark câu → API lỗi (server down) | Rollback ⭐, toast "Lỗi, thử lại sau" | |
| 7 | Tra từ khi mất mạng | Error trong DictionaryPopup, không crash | |

---

## Flow 8: Background & Lock Screen

### MAN-LIS-018: Audio Background Playback

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Press Home button | Audio tiếp tục phát | |
| 2 | Lock screen | Audio tiếp tục phát | |
| 3 | Xem Lock screen controls | Now Playing card: title, play/pause/next | |
| 4 | Tap Pause trên Lock screen | Audio dừng | |
| 5 | Tap Play trên Lock screen | Audio tiếp tục | |
| 6 | Quay lại app | State đồng bộ: play/pause đúng, highlight đúng | |
| 7 | Nhận cuộc gọi → reject → quay lại | Audio auto-resume (hoặc pause) | |

---

## Flow 9: Navigation & State

### MAN-LIS-019: Navigation Flow

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Dashboard → Tap "Listening" | Config Screen hiện | |
| 2 | Config → Generate → PlayerScreen → Back | Quay về Config, config giữ nguyên | |
| 3 | PlayerScreen → swipe back (iOS gesture) | Hoạt động giống button Back | |

### MAN-LIS-020: State Persistence

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Generate bài → Go Background → Kill app → Reopen | Audio player state restored (nếu có persist) | |

---

## Flow 10: Dark Mode & Accessibility

### MAN-LIS-021: Dark Mode

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Bật Dark Mode → mở Config screen | Tất cả pill/chip/text readable trên dark background | |
| 2 | Generate → PlayerScreen (Dark Mode) | Transcript text + highlight contrast đủ WCAG AA | |
| 3 | DictionaryPopup (Dark Mode) | Popup background/text readable | |

### MAN-LIS-022: Accessibility

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Bật VoiceOver (iOS) / TalkBack (Android) | Screen reader đọc đúng label cho buttons/inputs | |
| 2 | Focus vào nút Play | VoiceOver đọc "Play" hoặc "Pause" đúng state | |
| 3 | Navigate transcript | Từng exchange accessible, speaker name đọc rõ | |

---

## Flow 11: Performance & Visual Quality

### MAN-LIS-023: Performance Metrics

| # | Check | Criteria | P/F |
|:-:|-------|----------|:---:|
| 1 | Scroll FPS (transcript 20+ exchanges) | ≥55 FPS, không janky | |
| 2 | Audio gen loading time | ≤120s cho bài 5 phút | |
| 3 | Dictionary popup animation | Spring animation smooth, không flickering | |
| 4 | Bookmark icon animation | Instant response (<100ms), haptic sync | |
| 5 | Progress bar smooth | Mượt, không giật khi cập nhật mỗi 500ms | |
| 6 | Font rendering | Tiếng Việt hiển thị đúng diacritics, không bị cắt | |
| 7 | Safe area | Content không bị notch/home indicator che | |
| 8 | Dark mode contrast | Tất cả text readable, contrast đủ WCAG AA | |

---

## Flow 12: Bug Fixes Verification (Sprint Hotfix)

> **Mục đích:** Verify các bug fix và UX improvement từ sprint debug
> **Ngày thêm:** 2026-02-15

### MAN-LIS-024: "Tiếp tục nghe" — Session Restoration

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Mở app → Luyện Nghe → Chọn topic → "Bắt đầu nghe" | PlayerScreen mở, transcript + audio hiện | |
| 2 | Nghe ~30 giây, đợi audio phát | Audio đang phát, progress bar chạy | |
| 3 | Kill app hoàn toàn (force close) | App đóng | |
| 4 | Mở lại app → Luyện Nghe | Nút "▶️ Tiếp tục nghe" hiện ở footer với title bài cũ | |
| 5 | Tap "Tiếp tục nghe" | Navigate → PlayerScreen, transcript HIỆN ĐẦY ĐỦ (không phải "Không có dữ liệu") | |
| 6 | Kill app → Clear MMKV → Mở lại | Nút "Tiếp tục nghe" KHÔNG hiện (session đã bị xóa) | |
| 7 | Xóa app data / reinstall → Mở Luyện Nghe | Nút "Tiếp tục nghe" KHÔNG hiện (không có stale session) | |

### MAN-LIS-025: Empty State — "Chưa có bài nghe"

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Navigate trực tiếp tới PlayerScreen (deeplink hoặc code) | Hiện icon 🎧 + text "Chưa có bài nghe" + mô tả hướng dẫn | |
| 2 | Tap nút "← Quay lại chọn chủ đề" | Navigate về ConfigScreen | |
| 3 | Dark mode: kiểm tra empty state | Text + icon có contrast đủ | |

### MAN-LIS-026: Custom Scenario Save — Spread Error Fix

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Mở TopicPicker → Tab "Tuỳ chỉnh" | Form tạo + danh sách scenarios hiện | |
| 2 | Nhập tên "Test Bug Fix" + mô tả → Tap "💾 Lưu lại" | Toast thành công, scenario xuất hiện trong danh sách (KHÔNG crash) | |
| 3 | Tắt mạng → Nhập tên mới → Tap "💾 Lưu lại" | Toast error "Lỗi lưu kịch bản" (KHÔNG crash TypeError) | |
| 4 | Bật mạng lại → Nhập tên → Tap "💾 Lưu lại" | Hoạt động bình thường, scenario lưu thành công | |

### MAN-LIS-027: TopicPickerModal Header Redesign

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Mở TopicPicker modal | Header: X (trái), "Chọn chủ đề" (giữa), trống (phải) | |
| 2 | Chọn 1 scenario từ danh sách | Icon ✓ xanh xuất hiện ở bên phải header | |
| 3 | Tap X ở bên trái | Modal đóng, scenario VẪN được chọn | |
| 4 | Mở lại → Tap ✓ ở bên phải | Modal đóng, scenario confirmed | |

### MAN-LIS-028: Pronunciation Playback Fix

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Trong PlayerScreen, tap vào từ "hello" | DictionaryPopup mở | |
| 2 | Tap nút 🔊 phát âm | NGHE được phát âm từ "hello" (không chỉ console.log) | |
| 3 | Main audio đang phát → Tap 🔊 phát âm | Main audio pause, pronunciation phát, sau đó main audio KHÔNG auto resume | |
| 4 | Tap 🔊 khi không có URL audio (từ hiếm) | Hiện toast error "Không thể phát âm từ này" (không crash) | |

### MAN-LIS-029: Audio Skip Sync (Pause→Seek→Resume)

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Audio đang phát câu #3 → Tap ⏩ Skip Forward | Audio nhảy sang câu #4 NGAY LẬP TỨC, không nghe lọt vài từ cuối câu #3 | |
| 2 | Audio đang phát câu #5 → Tap ⏪ Skip Back | Audio nhảy về câu #4. Không nghe bleed từ câu #5 | |
| 3 | Skip nhanh 3 lần liên tiếp | Audio nhảy đúng 3 câu, không bị nghe lọt audio cũ | |
| 4 | Audio đang pause → Tap ⏩ Skip | Audio vẫn ở trạng thái pause, highlight chuyển đúng câu mới | |

### MAN-LIS-030: Pocket Mode Icon Change

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Mở PlayerScreen → Quan sát header bên phải | Icon Smartphone (📱) hiện thay cho icon Moon (🌙) | |
| 2 | Tap icon Smartphone | Pocket Mode mở: màn hình đen, 3 vùng cử chỉ | |
| 3 | Double tap trong Pocket Mode | Thoát Pocket Mode, quay lại PlayerScreen | |

### MAN-LIS-031: Tab Switching — CompactPlayer hiện khi đổi tab (FIX BUG)

> **Bug:** Khi audio đang phát ở PlayerScreen → chuyển tab (ví dụ: Reading, Dashboard) → CompactPlayer KHÔNG hiện.
> **Fix:** `useFocusEffect` trong PlayerScreen detect blur → `setPlayerMode('compact')`.

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | Generate bài → PlayerScreen đang phát audio | Audio phát, full player hiện | |
| 2 | Tap tab **Reading** ở bottom tab bar | CompactPlayer hiện ở bottom Reading screen | |
| 3 | Kiểm tra CompactPlayer | Tên bài nghe + waveform + nút Play/Pause hiện đúng | |
| 4 | Audio vẫn phát | ✅ Không bị dừng khi đổi tab | |
| 5 | Tap tab **Dashboard** | CompactPlayer vẫn hiện ở bottom Dashboard | |
| 6 | Tap tab **Listening** | PlayerScreen hiện lại ở full mode (không trùng, không flash) | |
| 7 | Tap CompactPlayer (khi đang ở tab khác) | Navigate lại PlayerScreen full mode | |
| 8 | Audio KHÔNG phát + đổi tab | CompactPlayer KHÔNG hiện (chỉ hiện khi đang phát) | |
| 9 | Đổi tab 5 lần liên tục nhanh | CompactPlayer hiện/ẩn đúng, KHÔNG crash, audio liên tục | |

### MAN-LIS-032: Swipe Down Minimize — Compact mode + goBack (FIX BUG)

> **Bug:** Swipe down trên PlayerScreen chỉ `console.log`, không có action thực tế.
> **Fix:** `handleSwipeDownMinimize` giờ set `compact` mode + `navigation.goBack()`.

| # | Action | Expected Result | P/F |
|:-:|--------|-----------------|:---:|
| 1 | PlayerScreen đang phát audio | Full player hiện | |
| 2 | Swipe down trên vùng transcript | Player đóng, CompactPlayer hiện, audio tiếp tục phát | |
| 3 | Haptic feedback | Rung nhẹ khi swipe down trigger | |
| 4 | Swipe down khi audio KHÔNG phát | Player đóng, CompactPlayer KHÔNG hiện (hidden mode) | |
| 5 | Swipe down → Tap CompactPlayer | Quay lại PlayerScreen full mode, audio vẫn phát | |

---

## Tổng Kết Manual Test

| Flow | Test IDs | Kết quả | Bug ID |
|------|----------|:-------:|--------|
| 1. Config Screen | MAN-LIS-001 → 007 | | |
| 2. Player Screen | MAN-LIS-008 → 011 | | |
| 3. Dictionary | MAN-LIS-012 | | |
| 4. Bookmark | MAN-LIS-013 | | |
| 5. Gestures | MAN-LIS-014 | | |
| 6. Audio & TTS | MAN-LIS-015 → 016 | | |
| 7. Error Handling | MAN-LIS-017 | | |
| 8. Background | MAN-LIS-018 | | |
| 9. Navigation | MAN-LIS-019 → 020 | | |
| 10. Dark Mode & A11y | MAN-LIS-021 → 022 | | |
| 11. Performance | MAN-LIS-023 | | |
| **12. Bug Fixes** | **MAN-LIS-024 → 032** | | |

**Tổng:** ___/32 PASS

**Bugs tìm thấy:**

| # | Severity | Description | Steps to Reproduce |
|:-:|----------|-------------|-------------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

---

> **Nguồn gốc:** Merged từ `02_listening_manual_tests.md` (10 flows) + `13_listening_manual_tests.md` (27 tests, 6 flows).
> **Ngày merge:** 2026-02-14
> **Ngày cập nhật:** 2026-02-15 — Thêm Flow 12 (Bug Fixes Verification, MAN-LIS-024 → 030)

> [!IMPORTANT]
> File `02_listening_manual_tests.md` đã được deprecated. Tất cả nội dung đã merge vào đây.
> **Unique content từ file cũ được merge:**
> - Full E2E 12-step flow (MAN-LIS-008)
> - Audio Playback Controls chi tiết (MAN-LIS-009)
> - Speed Control chi tiết với cycle (MAN-LIS-010)
> - Transcript Highlight Sync (MAN-LIS-011)
> - Dictionary Popup 12 bước (MAN-LIS-012)
> - Gesture Controls 7 bước (MAN-LIS-014)
> - TTS Provider Settings (MAN-LIS-015)
> - Error Handling 7 scenarios (MAN-LIS-017)
> - Background & Lock Screen 7 bước (MAN-LIS-018)
> - Performance 8 metrics (MAN-LIS-023)
> - **Bug Fixes Verification 7 tests (MAN-LIS-024 → 030)**
