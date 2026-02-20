# 🗣️ Speaking Module — Tài Liệu Test Toàn Diện

> **Module:** Speaking (Practice Mode MVP + Sprint 7)  
> **Phase:** MVP → Enhanced  
> **Ref:** `docs/mobile/features/03_Speaking.md`  
> **Last Updated:** 2026-02-19

---

## 📊 Tổng Quan Test Coverage

| Loại Test | Số lượng | Trạng thái |
|-----------|----------|------------|
| **Unit Tests** (Jest) | 111 tests (5 suites) | ✅ 111/111 passed |
| **Smoke Tests** (Manual) | 8 scenarios | 🔲 Chưa test |
| **Functional Tests** (Manual) | 49 scenarios (+27 Sprint 7) | 🔲 Chưa test |
| **Monkey Tests** (Free-form) | 17 scenarios (+5 Sprint 7) | 🔲 Chưa test |
| **Edge Case Tests** (Manual) | 10 scenarios | 🔲 Chưa test |
| **E2E Flows** (Manual) | 8 flows (+3 Sprint 7) | 🔲 Chưa test |

---

## 1️⃣ UNIT TESTS (Automated)

> Chạy: `cd apps/mobile && npx jest --testPathPatterns="useSpeakingStore|speakingApi|speakingTtsSheet|voiceCloneReplay|speakingScreens" --verbose`

### Store Tests — `useSpeakingStore.test.ts` (36 tests ✅)

| # | Test Group | Cases | Status |
|---|-----------|-------|--------|
| 1 | Config (setConfig, merge) | 3 | ✅ |
| 2 | Sentences (set, next, prev, currentIndex, bounds) | 6 | ✅ |
| 3 | Recording (start, stop, duration, clear) | 4 | ✅ |
| 4 | Feedback (set, loading, null) | 3 | ✅ |
| 5 | Loading States (generating, transcribing) | 2 | ✅ |
| 6 | Error (set, clear) | 2 | ✅ |
| 7 | Defaults (initial state) | 1 | ✅ |
| 8 | Reset (full reset) | 1 | ✅ |
| 9 | TTS Settings (Sprint 7A — defaults, merge, partial) | 5 | ✅ |
| 10 | Coach Mode Actions (start, message, timer, input, AI, end, reset, null-safe) | 9 | ✅ |

### API Tests — `speakingApi.test.ts` (23 tests ✅)

| # | Test Group | Cases | Status |
|---|-----------|-------|--------|
| 1 | generateSentences (prompt, JSON parse, markdown, fallback) | 4 | ✅ |
| 2 | transcribeAudio (FormData upload, empty response) | 2 | ✅ |
| 3 | evaluatePronunciation (payload, mapping, fallback) | 3 | ✅ |
| 4 | playAISample (payload + TTS params Sprint 7A) | 4 | ✅ |
| 5 | getStats (data, fallback) | 2 | ✅ |
| 6 | generateCoachAudio — TTS params (Sprint 7A) | 2 | ✅ |
| 7 | cloneAndCorrectVoice (Sprint 7C — FormData, fallback, empty) | 3 | ✅ |
| 8 | continueConversation (Coach Mode — payload, parse, fallback) | 3 | ✅ |

### Component Tests — `speakingTtsSheet.test.ts` (15 tests ✅)

| # | Test Group | Cases | Status |
|---|-----------|-------|--------|
| 1 | Voice Data Integrity (count, fields, no duplicates, defaults) | 6 | ✅ |
| 2 | Provider Switch Logic (OpenAI↔Azure, speed retention) | 3 | ✅ |
| 3 | Speed Range (default, min 0.5, max 2.0) | 3 | ✅ |
| 4 | Voice Selection (all OpenAI + Azure voices) | 3 | ✅ |

### Component Tests — `voiceCloneReplay.test.ts` (13 tests ✅)

| # | Test Group | Cases | Status |
|---|-----------|-------|--------|
| 1 | Audio State Machine (null→play, play→stop, switch track) | 6 | ✅ |
| 2 | VoiceImprovement Data (fields, IPA format) | 3 | ✅ |
| 3 | VoiceCloneResult Structure | 3 | ✅ |
| 4 | Edge Cases (rapid toggle, empty data) | 2 | ✅ |

### Screen Tests — `speakingScreens.test.ts` (24 tests ✅)

| # | Test Group | Cases | Status |
|---|-----------|-------|--------|
| 1 | Shadowing Phase State Machine | 3 | ✅ |
| 2 | TongueTwister Data Integrity | 4 | ✅ |
| 3 | TongueTwister WPM Calculation | 3 | ✅ |
| 4 | Roleplay Scenario Data | 3 | ✅ |
| 5 | Roleplay Filter Logic | 5 | ✅ |
| 6 | Shared formatTime utility | 6 | ✅ |

---

## 2️⃣ SMOKE TESTS (Chạy đầu tiên — tối thiểu 5 phút)

> **Mục đích:** Verify luồng chính hoạt động, phát hiện crash/block sớm  
> **Khi nào chạy:** Sau mỗi lần build, trước khi test chi tiết  
> **Thiết bị:** iPhone thật (cần mic) hoặc iOS Simulator

| ID | Scenario | Steps | Expected | ✅/❌ |
|:---|:---------|:------|:---------|:------|
| SMK-01 | App launch → Dashboard | 1. Mở app | Dashboard hiện, có nút "Luyện Nói" | 🔲 |
| SMK-02 | Navigate Config | 1. Tap "🗣️ Luyện Nói" | ConfigScreen hiện: topic input, chips, level selector, nút Start | 🔲 |
| SMK-03 | Chọn topic + level | 1. Tap chip "💻 Công nghệ"<br>2. Chọn "Nâng cao" | Chip highlight xanh, level = C1-C2 | 🔲 |
| SMK-04 | Generate sentences | 1. Tap "🗣️ Bắt đầu luyện tập" | Loading → navigate PracticeScreen, câu hiện rõ ràng | 🔲 |
| SMK-05 | Practice — nghe mẫu | 1. Tap "Nghe mẫu" | AI TTS phát câu mẫu | 🔲 |
| SMK-06 | Practice — ghi âm | 1. Giữ nút 🎤 3 giây<br>2. Thả tay | Ghi âm → loading "Đang nhận diện..." → navigate Feedback | 🔲 |
| SMK-07 | Xem feedback | 1. Quan sát FeedbackScreen | Score hiện (0-100), word-by-word có màu, tips hiển thị | 🔲 |
| SMK-08 | Hoàn thành flow | 1. Tap "➡️ Câu tiếp"<br>2. Luyện hết 6 câu<br>3. Tap "✅ Hoàn thành" | Quay về ConfigScreen, không crash | 🔲 |

---

## 3️⃣ FUNCTIONAL TESTS (Manual — chi tiết)

### 3.1 ConfigScreen

| ID | Type | Scenario | Steps | Expected Result | Severity | ✅/❌ |
|:---|:-----|:---------|:------|:----------------|:---------|:------|
| FT-CFG-01 | ✅ | Mở ConfigScreen | 1. Dashboard → "Luyện Nói" | Header "🗣️ Luyện Nói", input topic, 8 chips, SegmentedControl, nút Start | 🔴 | 🔲 |
| FT-CFG-02 | ✅ | Nhập topic tay | 1. Tap input<br>2. Gõ "Daily conversation" | Text hiện trong input, nút Start enable | 🔴 | 🔲 |
| FT-CFG-03 | ✅ | Chọn chip gợi ý | 1. Tap "💼 Kinh doanh" | Chip highlight xanh, input hiện "Kinh doanh" | 🟡 | 🔲 |
| FT-CFG-04 | ✅ | Đổi chip gợi ý | 1. Đã chọn "Kinh doanh"<br>2. Tap "🌍 Du lịch" | "Du lịch" highlight, "Kinh doanh" bỏ highlight | 🟡 | 🔲 |
| FT-CFG-05 | ✅ | Chọn level | 1. Tap "Cơ bản" → "Nâng cao" | SegmentedControl đổi, mô tả level đổi theo | 🟡 | 🔲 |
| FT-CFG-06 | ✅ | Nút Start disabled khi chưa nhập topic | 1. Xóa hết text input<br>2. Quan sát nút | Nút "Bắt đầu" disabled (mờ, không tap được) | 🔴 | 🔲 |
| FT-CFG-07 | ✅ | Generate thành công | 1. Nhập topic<br>2. Tap Start | Loading state → navigate Practice | 🔴 | 🔲 |
| FT-CFG-08 | ❌ | Generate lỗi (server down) | 1. Tắt backend<br>2. Tap Start | Error message hiện, không crash, có thể retry | 🔴 | 🔲 |
| FT-CFG-09 | ⚠️ | Topic rất dài (100+ ký tự) | 1. Nhập text dài | Input không bị overflow, text wrap đúng | 🟢 | 🔲 |
| FT-CFG-10 | ⚠️ | Keyboard covering nút Start | 1. Tap input → keyboard mở | KeyboardAvoidingView đẩy nút lên, vẫn tap được | 🟡 | 🔲 |

### 3.2 PracticeScreen

| ID | Type | Scenario | Steps | Expected Result | Severity | ✅/❌ |
|:---|:-----|:---------|:------|:----------------|:---------|:------|
| FT-PRC-01 | ✅ | Hiển thị câu practice | 1. Vào PracticeScreen | Câu tiếng Anh hiện lớn ở giữa, progress "1/6" | 🔴 | 🔲 |
| FT-PRC-02 | ✅ | Progress bar cập nhật | 1. Luyện câu 1 → next → câu 2 | Bar xanh tiến từ 16% → 33% | 🟡 | 🔲 |
| FT-PRC-03 | ✅ | Nghe AI mẫu | 1. Tap "Nghe mẫu" | Button hiện "Đang phát...", AI nói câu mẫu, button trở lại | 🟡 | 🔲 |
| FT-PRC-04 | ✅ | Hold-to-record start | 1. PressIn nút 🎤 | Mic đổi icon MicOff, nút đỏ, pulse animation, timer bắt đầu 0:00 | 🔴 | 🔲 |
| FT-PRC-05 | ✅ | Hold-to-record stop | 1. PressOut nút 🎤 (sau 3s) | Animation dừng, loading "Đang nhận diện giọng nói..." | 🔴 | 🔲 |
| FT-PRC-06 | ✅ | Auto-navigate Feedback | 1. Thả mic → AI xử lý xong | Tự chuyển sang FeedbackScreen khi có kết quả | 🔴 | 🔲 |
| FT-PRC-07 | ✅ | Timer hiển thị đúng | 1. Giữ mic 5s | Timer: 0:00 → 0:01 → ... → 0:05 | 🟡 | 🔲 |
| FT-PRC-08 | ⚠️ | Max duration 15s | 1. Giữ mic > 15 giây | Tự dừng ở 0:15, xử lý bình thường | 🟡 | 🔲 |
| FT-PRC-09 | ⚠️ | Ghi âm < 1s (quá ngắn) | 1. Tap nhanh nút mic (<1s) | Error "Ghi âm quá ngắn, hãy thử lại" | 🟡 | 🔲 |
| FT-PRC-10 | ❌ | Transcript rỗng | 1. Giữ mic trong im lặng | Error "Không nghe được gì, thử nói to hơn nhé!" | 🟡 | 🔲 |
| FT-PRC-11 | ❌ | API timeout | 1. Mạng chậm, transcribe > 30s | Error message, có thể thử lại | 🔴 | 🔲 |
| FT-PRC-12 | ✅ | Back button | 1. Tap ← | Quay lại ConfigScreen, trạng thái config giữ nguyên | 🟡 | 🔲 |

### 3.3 FeedbackScreen

| ID | Type | Scenario | Steps | Expected Result | Severity | ✅/❌ |
|:---|:-----|:---------|:------|:----------------|:---------|:------|
| FT-FBK-01 | ✅ | Score card hiển thị | 1. Quan sát FeedbackScreen | Score lớn ở giữa (animated 0→actual), emoji + label | 🔴 | 🔲 |
| FT-FBK-02 | ✅ | Sub-scores 3 cột | 1. Quan sát bên dưới score | 3 box: Phát âm 🎯, Trôi chảy 💬, Tốc độ ⚡ | 🟡 | 🔲 |
| FT-FBK-03 | ✅ | Word-by-word color | 1. Scroll xuống "Chi tiết từng từ" | Mỗi từ có badge: xanh ≥85, cam 60-84, đỏ <50 | 🟡 | 🔲 |
| FT-FBK-04 | ✅ | Tips hiển thị | 1. Scroll xuống "Gợi ý cải thiện" | AI tips dạng bullet, dễ đọc | 🟡 | 🔲 |
| FT-FBK-05 | ✅ | Encouragement | 1. Bottom section | Câu khuyến khích từ AI | 🟢 | 🔲 |
| FT-FBK-06 | ✅ | Retry (Luyện lại) | 1. Tap "🔁 Luyện lại" | Quay lại PracticeScreen CÙNG câu, recording state xóa | 🔴 | 🔲 |
| FT-FBK-07 | ✅ | Next (Câu tiếp) | 1. Tap "➡️ Câu tiếp" | Quay PracticeScreen, index +1, câu mới hiện | 🔴 | 🔲 |
| FT-FBK-08 | ✅ | Hoàn thành (câu cuối) | 1. Ở câu cuối → Feedback<br>2. Tap "✅ Hoàn thành" | popToTop → về ConfigScreen | 🔴 | 🔲 |
| FT-FBK-09 | ✅ | Score ≥90 | 1. Phát âm tốt | Emoji 🎉 "Xuất sắc!", màu xanh đậm | 🟢 | 🔲 |
| FT-FBK-10 | ✅ | Score <40 | 1. Phát âm khác hẳn | Emoji 🔄 "Cố gắng thêm nhé!", màu đỏ | 🟡 | 🔲 |

---

## 4️⃣ MONKEY TESTS (Free-form — Thao tác ngẫu nhiên)

> **Mục đích:** Phát hiện crash, memory leak, UI glitch khi user thao tác bất thường  
> **Thời gian:** 10-15 phút mỗi session, thao tác TỰ DO, NGẪU NHIÊN  
> **Ghi chú:** Ghi lại step nào gây crash/bug

### Hướng dẫn chung
- Thao tác **nhanh, bất thường** — không theo flow logic
- Tap nhiều lần liên tục vào cùng 1 chỗ
- Xoay device giữa chừng
- Bật/tắt mạng giữa chừng
- Minimize rồi mở lại app giữa chừng
- Kéo thả random vào các element

| ID | Scenario | Thao tác | Quan sát | ✅/❌ |
|:---|:---------|:---------|:---------|:------|
| MNK-01 | Spam tap nút Start | 1. Nhập topic<br>2. Tap "Bắt đầu" 10 lần liên tục cực nhanh | Không duplicate navigate, không crash, loading hiện đúng | 🔲 |
| MNK-02 | Spam tap/untap mic | 1. Ở PracticeScreen<br>2. Tap in/out nút mic 15 lần nhanh (<0.5s mỗi lần) | Không crash, recording state correct, không leak audio | 🔲 |
| MNK-03 | Back nhanh giữa recording | 1. PressIn mic (đang ghi)<br>2. Ngay lập tức tap Back | Recording dừng, navigate back, không continue recording ẩn | 🔲 |
| MNK-04 | Xoay device giữa chừng | 1. Đang ở PracticeScreen<br>2. Xoay ngang → dọc → ngang | UI rerender đúng, không mất state, mic button visible | 🔲 |
| MNK-05 | Tắt/bật mạng giữa generate | 1. Tap Start (đang loading)<br>2. Tắt WiFi ngay lập tức | Error hiện, không treo vô hạn, retry khả dụng | 🔲 |
| MNK-06 | Minimize app giữa recording | 1. PressIn mic (đang ghi)<br>2. Home button → minimize<br>3. Mở lại app | Recording dừng hoặc resume, không crash, state nhất quán | 🔲 |
| MNK-07 | Cuộc gọi đến giữa recording | 1. Đang ghi âm<br>2. Nhận cuộc gọi → nghe → cúp | Recording dừng, error hoặc resume, mic available lại | 🔲 |
| MNK-08 | Tap nghe mẫu + mic đồng thời | 1. Tap "Nghe mẫu"<br>2. Ngay lập tức PressIn mic | Không 2 audio streams cùng lúc, xử lý graceful | 🔲 |
| MNK-09 | Scroll + tap cùng lúc (Feedback) | 1. FeedbackScreen<br>2. Scroll nhanh + tap "Câu tiếp" giữa scroll | Navigate đúng, không double-navigate | 🔲 |
| MNK-10 | Nhập emoji/unicode vào topic | 1. Nhập "🔥🎯日本語العربية"<br>2. Tap Start | Sinh câu hoặc error graceful, không crash | 🔲 |
| MNK-11 | Thay đổi chip liên tục nhanh | 1. Tap chip 1 → chip 2 → chip 3 → chip 4 rất nhanh | Input update đúng theo chip cuối cùng, không flicker | 🔲 |
| MNK-12 | Memory stress test | 1. Luyện 10 câu liên tục (generate → record → feedback → next × 10) | App không chậm dần, memory usage ổn định, không leak | 🔲 |

---

## 5️⃣ EDGE CASE TESTS

| ID | Scenario | Steps | Expected Result | Severity | ✅/❌ |
|:---|:---------|:------|:----------------|:---------|:------|
| EC-01 | Microphone permission denied | 1. Deny mic permission<br>2. Tap mic | Error "Không thể truy cập microphone", không crash | 🔴 | 🔲 |
| EC-02 | Không có sentences (bug) | 1. Nào đó navigate Practice khi sentences=[] | Hiện fallback "Không có câu nào", nút quay lại | 🔴 | 🔲 |
| EC-03 | Feedback=null (bug) | 1. Navigate Feedback khi feedback=null | Fallback "Không có kết quả", nút quay lại | 🔴 | 🔲 |
| EC-04 | Dark mode | 1. Bật dark mode iOS<br>2. Dùng full flow | Tất cả text đọc được, contrast đủ, colors đúng | 🟡 | 🔲 |
| EC-05 | iPhone SE (màn nhỏ) | 1. Chạy trên iPhone SE/mini | Không bị tràn, nút mic vẫn visible, text không cắt | 🟡 | 🔲 |
| EC-06 | iPad (màn lớn) | 1. Chạy trên iPad | Layout cân đối, không quá stretch, vẫn usable | 🟢 | 🔲 |
| EC-07 | Slow network (3G) | 1. Throttle network 3G<br>2. Full flow | Loading states hiện đúng, timeout có error, không treo | 🟡 | 🔲 |
| EC-08 | Backend trả score = 0 | 1. Nói tiếng Việt hoàn toàn | Score 0 hiện, label "Cố gắng thêm nhé!", không crash | 🟡 | 🔲 |
| EC-09 | Backend trả wordByWord rỗng | 1. API trả wordByWord=[] | Section "Chi tiết từng từ" không hiện (hidden graceful) | 🟢 | 🔲 |
| EC-10 | Nhiều câu có IPA | 1. Sentence có field ipa | IPA hiện bên dưới câu, style nhỏ hơn, đúng phiên âm | 🟢 | 🔲 |

---

## 6️⃣ CHECKLIST TRƯỚC KHI RELEASE

| # | Hạng mục | Tiêu chí | Status |
|---|----------|----------|--------|
| 1 | Unit tests | 111/111 passed (5 suites) | ✅ |
| 2 | Smoke tests (8 items) | Tất cả PASS | 🔲 |
| 3 | Critical bugs (🔴) | 0 bugs | 🔲 |
| 4 | Functional tests | Tất cả Happy Path ✅ PASS | 🔲 |
| 5 | Monkey tests (5 phút) | Không crash | 🔲 |
| 6 | Memory check | Không leak sau 10 câu | 🔲 |
| 7 | Dark mode | Đọc được hết | 🔲 |

---

## 📝 Bug Log (Ghi khi test)

| # | Ngày | Test ID | Mô tả bug | Severity | Device | Screenshot | Status |
|---|------|---------|-----------|----------|--------|------------|--------|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |

> Ghi lại mỗi bug tìm được vào bảng trên. Attach screenshot nếu có.

---

## 📱 Manual Test on Device — Hardware & UX

> **Mục đích:** Test microphone thật, haptic thật, TTS thật trên device thật.
> **Device yêu cầu:** iPhone (iOS 16+), Android (API 28+)
> **Pre-conditions:** Đăng nhập, microphone permission granted

### A. Microphone & Recording

| ID | Scenario | Steps trên Device | Expected | iOS | Android |
|:---|:---------|:-------------------|:---------|:----|:--------|
| DEV-SPK-001 | Ghi âm via mic built-in | 1. Giữ 🎤 → Nói 5s → Thả | Waveform hiện, audio upload thành công | ☐ | ☐ |
| DEV-SPK-002 | Ghi âm qua tai nghe mic | 1. Cắm tai nghe có mic<br>2. Giữ 🎤 → Nói | Ghi qua mic tai nghe, quality OK | ☐ | ☐ |
| DEV-SPK-003 | Ghi âm qua Bluetooth | 1. Kết nối AirPods/BT headset<br>2. Ghi âm | Audio capture qua BT mic | ☐ | ☐ |
| DEV-SPK-004 | Permission denied | 1. Revoke mic trong Settings<br>2. Tap 🎤 | Hiện hướng dẫn mở Settings, không crash | ☐ | ☐ |
| DEV-SPK-005 | Môi trường ồn | 1. Bật nhạc background<br>2. Ghi âm | AI vẫn xử lý, feedback mention noise nếu có | ☐ | ☐ |

### B. Haptic Feedback

| ID | Scenario | Steps trên Device | Expected | iOS | Android |
|:---|:---------|:-------------------|:---------|:----|:--------|
| DEV-SPK-006 | Mic press haptic | 1. Long press 🎤 | Haptic medium rõ ràng | ☐ | ☐ |
| DEV-SPK-007 | Mic release haptic | 1. Thả nút 🎤 | Haptic light | ☐ | ☐ |
| DEV-SPK-008 | Score display haptic | 1. Chờ feedback | Haptic success ≥85, warning <70 | ☐ | ☐ |
| DEV-SPK-009 | Swipe haptic | 1. Swipe right → next | Haptic light mỗi swipe | ☐ | ☐ |

### C. TTS Playback

| ID | Scenario | Steps trên Device | Expected | iOS | Android |
|:---|:---------|:-------------------|:---------|:----|:--------|
| DEV-SPK-010 | Nghe AI mẫu | 1. Tap 🔊 bên cạnh câu | TTS phát rõ, phát âm chuẩn | ☐ | ☐ |
| DEV-SPK-011 | AI mẫu khi đang ghi | 1. Đang ghi → Tap 🔊 | Không phát TTS khi recording | ☐ | ☐ |

### D. Network Edge Cases

| ID | Scenario | Steps trên Device | Expected | iOS | Android |
|:---|:---------|:-------------------|:---------|:----|:--------|
| DEV-SPK-012 | Upload khi mất mạng | 1. Ghi âm xong<br>2. Tắt WiFi | Error + Retry, recording lưu local | ☐ | ☐ |
| DEV-SPK-013 | AI timeout | 1. Ghi âm → gửi<br>2. Server chậm >30s | Timeout error → Retry | ☐ | ☐ |
| DEV-SPK-014 | Mạng 3G | 1. Chuyển 3G<br>2. Full flow | Chậm hơn nhưng hoàn thành | ☐ | ☐ |

### E. Performance

| ID | Scenario | Steps trên Device | Expected | iOS | Android |
|:---|:---------|:-------------------|:---------|:----|:--------|
| DEV-SPK-015 | 20 câu liên tục | 1. Practice 20 câu | Không lag, memory stable | ☐ | ☐ |
| DEV-SPK-016 | Multiple sessions | 1. Hoàn thành → Start mới × 5 | Không leak, state clean | ☐ | ☐ |

---

## 🔄 E2E Test — Full User Flows

> **Mục đích:** Verify luồng end-to-end hoàn chỉnh cho Speaking.

### Flow 1: Basic Practice Session

```
Dashboard → Luyện nói → Chọn topic "Tech Interview"
→ PracticeScreen → Tap 🔊 nghe mẫu → Long press 🎤 → Nói 3-5s → Thả
→ Loading → AI Feedback: Score + Word-by-word + Tips
→ Swipe right → Câu tiếp → Hoàn thành 3 câu → Back
```

| Step | Expected | ☐ |
|------|----------|---|
| 1. Dashboard → Speaking | ConfigScreen render | ☐ |
| 2. Chọn topic + Start | PracticeScreen hiện câu đầu | ☐ |
| 3. Nghe AI mẫu | TTS phát câu target | ☐ |
| 4. Ghi âm | Waveform → Upload → Loading | ☐ |
| 5. Feedback | Score + Word scores + Tips | ☐ |
| 6. Next + Back | Navigate clean | ☐ |

### Flow 2: Record → Retry → Improve

```
Ghi âm lần 1 → Score 65 → Xem weak words
→ Retry → Ghi âm lần 2 → Score 82 → Improvement
```

| Step | Expected | ☐ |
|------|----------|---|
| 1. Ghi lần 1 | Score + color-coded words | ☐ |
| 2. Retry | Quay lại câu cũ | ☐ |
| 3. Ghi lần 2 | Score cải thiện | ☐ |

### Flow 3: Permission Flow (First Time)

```
Tap 🎤 lần đầu → OS prompt → Allow → Ghi âm bình thường
```

| Step | Expected | ☐ |
|------|----------|---|
| 1. Tap 🎤 | OS permission dialog | ☐ |
| 2. Allow | Mic sẵn sàng | ☐ |
| 3. Ghi âm | Recording works | ☐ |

### Flow 4: Error Recovery

```
Tắt WiFi → Ghi âm → Error → Bật WiFi → Retry → Thành công
```

| Step | Expected | ☐ |
|------|----------|---|
| 1. Mất mạng + record | Recording OK local | ☐ |
| 2. Upload fail | Error + Retry button | ☐ |
| 3. WiFi + Retry | Upload + Feedback | ☐ |

### Flow 5: IPA & Stress Display

```
Toggle IPA ON → IPA hiện → Toggle Stress ON → Highlight
→ Ghi âm → Feedback + IPA vẫn hiện
```

| Step | Expected | ☐ |
|------|----------|---|
| 1. Toggle IPA | IPA transcription | ☐ |
| 2. Toggle Stress | Stressed syllables | ☐ |
| 3. Record + Feedback | Toggles persist | ☐ |

---

## 🆕 Sprint 7: TTS Provider Settings + Background Audio + AI Voice Clone

> **Thêm mới:** 2026-02-19 — Sprint 7 (3 features cuối cùng)  
> **Files liên quan:** `SpeakingTtsSheet.tsx`, `useCoachTrackPlayer.ts`, `VoiceCloneReplay.tsx`, `CoachSessionScreen.tsx`, `FeedbackScreen.tsx`

### 7.1 TTS Provider Settings — `SpeakingTtsSheet.tsx`

| ID | Type | Scenario | Steps | Expected Result | Severity | ✅/❌ |
|:---|:-----|:---------|:------|:----------------|:---------|:------|
| FT-TTS-01 | ✅ | Mở TTS settings sheet | 1. ConfigScreen → Tap "⚙️ Cài đặt giọng AI" | Bottom sheet mở, hiện chọn Provider (OpenAI/Azure), danh sách voices, slider speed | 🔴 | 🔲 |
| FT-TTS-02 | ✅ | Chọn provider OpenAI | 1. Tap chip "🤖 OpenAI" | Chip highlight xanh, danh sách voice đổi sang voices OpenAI (alloy, echo, fable...) | 🔴 | 🔲 |
| FT-TTS-03 | ✅ | Chọn provider Azure | 1. Tap chip "☁️ Azure" | Chip highlight xanh, danh sách voice đổi sang Azure voices (JennyNeural, AriaNeural...) | 🔴 | 🔲 |
| FT-TTS-04 | ✅ | Chọn voice | 1. Tap 1 voice row (ví dụ "echo") | Radio button selected, haptic light | 🟡 | 🔲 |
| FT-TTS-05 | ✅ | Điều chỉnh speed slider | 1. Kéo slider từ 1.0x → 1.5x | Label cập nhật "1.5x", giá trị lưu vào store | 🟡 | 🔲 |
| FT-TTS-06 | ✅ | Preview voice | 1. Chọn voice + Tap "🔊 Preview"<br>2. Nghe audio | AI phát câu mẫu bằng giọng đã chọn, đúng speed | 🔴 | 🔲 |
| FT-TTS-07 | ⚠️ | Speed min/max boundary | 1. Kéo slider về 0.5x<br>2. Kéo slider về 2.0x | Không vượt ra ngoài range, label hiện đúng | 🟢 | 🔲 |
| FT-TTS-08 | ✅ | Đóng sheet + settings persist | 1. Chọn Azure + echo + 1.3x<br>2. Đóng sheet<br>3. Mở lại | Settings vẫn giữ nguyên (Azure, echo, 1.3x) | 🔴 | 🔲 |
| FT-TTS-09 | ✅ | TTS settings áp dụng vào Practice | 1. Cài Azure + AriaNeural + 0.8x<br>2. Vào Practice → Tap "Nghe mẫu" | AI mẫu phát bằng giọng Azure AriaNeural, speed 0.8 | 🔴 | 🔲 |

### 7.2 Background Audio for Coach — `useCoachTrackPlayer.ts`

| ID | Type | Scenario | Steps | Expected Result | Severity | ✅/❌ |
|:---|:-----|:---------|:------|:----------------|:---------|:------|
| FT-BGA-01 | ✅ | Coach AI audio phát bình thường | 1. Vào Coach Session<br>2. Nói → AI trả lời | AI response phát audio tự động | 🔴 | 🔲 |
| FT-BGA-02 | ✅ | Audio tiếp tục khi minimize app | 1. Đang phát AI audio<br>2. Home button (minimize) | Audio tiếp tục phát khi app ở background | 🔴 | 🔲 |
| FT-BGA-03 | ✅ | Notification controls hiện | 1. AI đang phát<br>2. Kéo notification tray / Control Center | Hiện media notification: play/pause, tên "AI Coach — [topic]" | 🟡 | 🔲 |
| FT-BGA-04 | ✅ | Pause/Resume từ notification | 1. AI đang phát ở background<br>2. Tap Pause trên notification<br>3. Tap Play | Audio dừng → tiếp tục đúng vị trí | 🟡 | 🔲 |
| FT-BGA-05 | ✅ | Audio dừng khi rời CoachSession | 1. AI đang phát<br>2. Tap Back (rời màn hình) | Audio dừng ngay, không tiếp phát ở background | 🔴 | 🔲 |
| FT-BGA-06 | ⚠️ | Ngắt âm khi có cuộc gọi | 1. AI đang phát<br>2. Nhận cuộc gọi<br>3. Cúp máy | Audio pause khi gọi, có thể resume sau | 🟡 | 🔲 |
| FT-BGA-07 | ✅ | TTS settings áp dụng cho Coach audio | 1. Cài TTS → Azure + DavisNeural + 1.2x<br>2. Vào Coach → Nói | AI trả lời bằng giọng Azure DavisNeural, speed 1.2 | 🔴 | 🔲 |
| FT-BGA-08 | ⚠️ | Nhiều tin nhắn liên tiếp | 1. Nói nhanh 3 tin<br>2. AI trả lời 3 lần | Audio phát lần lượt, không chồng chéo | 🟡 | 🔲 |
| FT-BGA-09 | ⚠️ | Lock screen playback | 1. AI phát → Lock screen | Audio tiếp tục, lock screen hiện media controls | 🟡 | 🔲 |

### 7.3 AI Voice Clone Replay — `VoiceCloneReplay.tsx`

| ID | Type | Scenario | Steps | Expected Result | Severity | ✅/❌ |
|:---|:-----|:---------|:------|:----------------|:---------|:------|
| FT-VCR-01 | ✅ | Voice Clone tự động load | 1. FeedbackScreen mở (có score) | Section "🎭 AI Voice Clone" hiện loading spinner, sau đó hiện 2 audio cards | 🔴 | 🔲 |
| FT-VCR-02 | ✅ | Phát audio bản gốc | 1. Tap card "🎤 Bản gốc" (nút ▶️ đỏ) | Audio user play, card highlight border đỏ | 🔴 | 🔲 |
| FT-VCR-03 | ✅ | Phát audio AI đã sửa | 1. Tap card "🤖 AI đã sửa" (nút ▶️ tím) | Audio corrected play, card highlight border tím | 🔴 | 🔲 |
| FT-VCR-04 | ✅ | Chuyển track giữa chừng | 1. Đang phát bản gốc<br>2. Tap "🤖 AI đã sửa" | Track cũ dừng, track mới play | 🟡 | 🔲 |
| FT-VCR-05 | ✅ | Dừng track đang phát | 1. Đang phát bản gốc<br>2. Tap lại "🎤 Bản gốc" | Audio dừng, icon đổi lại ▶️ | 🟡 | 🔲 |
| FT-VCR-06 | ✅ | Waveform comparison hiện | 1. Scroll xuống Voice Clone section | Waveform overlay 2 màu (AI mẫu xanh, user xanh dương), legend đúng | 🟢 | 🔲 |
| FT-VCR-07 | ✅ | Improvements list hiện | 1. Scroll xuống "📝 Chi tiết cải thiện" | Danh sách phoneme: trước (đỏ) → sau (xanh), badge phoneme tím | 🟡 | 🔲 |
| FT-VCR-08 | ⚠️ | API clone fail → fallback TTS | 1. Backend clone-and-correct lỗi | VoiceCloneReplay vẫn hiện, dùng TTS bình thường, improvements rỗng | 🟡 | 🔲 |
| FT-VCR-09 | ⚠️ | Loading skeleton hiển thị đúng | 1. Mạng chậm, chờ clone API | Spinner + text "🎭 Đang phân tích giọng nói..." hiện | 🟢 | 🔲 |

### 7.4 E2E Flow — Sprint 7 Features

#### Flow A: TTS Settings → Practice → Verify Voice

```
ConfigScreen → Tap "⚙️ Cài đặt giọng AI" → Chọn Azure + AriaNeural + 1.5x
→ Đóng sheet → Vào Practice → Tap "Nghe mẫu" → Verify: giọng Azure, speed 1.5x
```

| Step | Expected | ☐ |
|------|----------|---|
| 1. Mở TTS sheet | Bottom sheet hiện | ☐ |
| 2. Chọn Azure + AriaNeural | Chips & voice row selected | ☐ |
| 3. Kéo speed 1.5x | Label "1.5x" | ☐ |
| 4. Đóng sheet | Settings persist | ☐ |
| 5. Practice → Nghe mẫu | Giọng Azure AriaNeural 1.5x | ☐ |

#### Flow B: Coach Session → Background Audio

```
CoachSetup → Start → Chat với AI → AI trả lời (audio)
→ Minimize app → Audio tiếp tục → Notification controls → Resume app
```

| Step | Expected | ☐ |
|------|----------|---|
| 1. Start Coach | CoachSession mở | ☐ |
| 2. Nói "Tell me about AI" | AI trả lời text + audio | ☐ |
| 3. Minimize | Audio tiếp tục ở background | ☐ |
| 4. Notification Pause | Audio dừng | ☐ |
| 5. Resume app | UI đúng, state nhất quán | ☐ |

#### Flow C: Practice → Feedback → Voice Clone Compare

```
Practice → Ghi âm → Feedback → Voice Clone tự load
→ Phát "Bản gốc" → Phát "AI đã sửa" → So sánh improvements
```

| Step | Expected | ☐ |
|------|----------|---|
| 1. Ghi âm | Upload thành công | ☐ |
| 2. Feedback | Score + breakdowns | ☐ |
| 3. Voice Clone load | Loading → 2 cards hiện | ☐ |
| 4. Phát Bản gốc | User recording play | ☐ |
| 5. Phát AI đã sửa | Corrected version play | ☐ |
| 6. Improvements | Phoneme list (nếu có) | ☐ |

---

## 🧪 Monkey Tests Bổ Sung (Sprint 7)

| ID | Scenario | Thao tác | Quan sát | ✅/❌ |
|:---|:---------|:---------|:---------|:------|
| MNK-S7-01 | Spam toggle Provider | 1. Mở TTS sheet<br>2. Tap OpenAI → Azure → OpenAI nhanh 10 lần | Provider đổi đúng theo lần tap cuối, không crash | 🔲 |
| MNK-S7-02 | Spam play/stop VoiceClone | 1. FeedbackScreen<br>2. Tap play "Bản gốc" → "AI sửa" → "Bản gốc" nhanh | Không chồng audio, dừng đúng, không crash | 🔲 |
| MNK-S7-03 | Minimize + resume nhanh (Coach) | 1. Coach đang phát AI audio<br>2. Home → mở lại × 5 nhanh | Audio state nhất quán, không leak player instance | 🔲 |
| MNK-S7-04 | Coach: gửi 10 tin liên tục | 1. Text mode<br>2. Gửi 10 tin nhanh | Audio queue xử lý đúng, mỗi response phát | 🔲 |
| MNK-S7-05 | TTS sheet + back navigation | 1. Mở TTS sheet<br>2. Tap Back (hardware) | Sheet đóng, config giữ nguyên, không crash | 🔲 |

---

### Store Tests — `useSpeakingStore.test.ts` (36 tests)

| # | Test Group | Cases | Status |
|---|-----------|-------|--------|
| 1–8 | (Sprint 1–6 — giữ nguyên) | 22 | ✅ |
| 9 | TTS Settings (default, merge partial, multi, sequential) | 5 | ✅ |
| 10 | Coach Mode Actions (start, message, timer, input, AI, end, reset, null-safe) | 9 | ✅ |

### API Tests — `speakingApi.test.ts` (23 tests)

| # | Test Group | Cases | Status |
|---|-----------|-------|--------|
| 1–5 | (Sprint 1–6 — giữ nguyên) | 12 | ✅ |
| 6 | playAISample — TTS params (provider, default, speed=1.0) | 3 | ✅ |
| 7 | generateCoachAudio — TTS params (voice+provider, fallback) | 2 | ✅ |
| 8 | cloneAndCorrectVoice (FormData, fallback, empty) | 3 | ✅ |
| 9 | continueConversation (Coach Mode — payload, parse, fallback) | 3 | ✅ |

### Component Tests — `speakingTtsSheet.test.ts` (15 tests) ✅
### Component Tests — `voiceCloneReplay.test.ts` (13 tests) ✅
### Screen Tests — `speakingScreens.test.ts` (24 tests) ✅

> Chạy: `cd apps/mobile && npx jest --testPathPatterns="useSpeakingStore|speakingApi|speakingTtsSheet|voiceCloneReplay|speakingScreens" --verbose`

