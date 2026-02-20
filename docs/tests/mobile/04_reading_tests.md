# 📖 Reading Module — Tài Liệu Test Toàn Diện

> **Module:** Reading (MVP + Enhanced)  
> **Phase:** MVP → Enhanced  
> **Ref:** `docs/mobile/features/04_Reading.md`  
> **Last Updated:** 2026-02-19

---

## 📊 Tổng Quan Test Coverage

| Loại Test | Số lượng | Trạng thái |
|-----------|----------|------------|
| **Unit Tests** (Jest) | 73 tests | ✅ 73/73 passed |
| **Smoke Tests** (Manual) | 8 scenarios | 🔲 Chưa test |
| **Enhanced Feature Tests** (Manual) | 32 scenarios | 🔲 Chưa test |
| **Monkey Tests** (Free-form) | 14 scenarios | 🔲 Chưa test |
| **Edge Case Tests** (Manual) | 12 scenarios | 🔲 Chưa test |

---

## 1️⃣ UNIT TESTS (Automated)

> Chạy: `cd apps/mobile && npx jest --testPathPatterns="useReadingStore|readingApi|useReadingPractice|useTtsReader|usePinchZoom" --verbose`

### Store Tests — `useReadingStore.test.ts` (24 tests ✅)

| # | Test Group | Cases | Status |
|---|-----------|-------|--------|
| 1 | Config (setConfig, merge) | 4 | ✅ |
| 2 | Article (setArticle, clear error) | 3 | ✅ |
| 3 | Generating (loading states) | 1 | ✅ |
| 4 | Error (set/clear) | 2 | ✅ |
| 5 | Font Size (set, default) | 2 | ✅ |
| 6 | Saved Words (add, dedupe, remove) | 4 | ✅ |
| 7 | Defaults (all fields) | 1 | ✅ |
| 8 | **Focus Mode** (toggle on/off/liên tục) | 3 | ✅ 🆕 |
| 9 | **Article Saved** (set true/false/default) | 3 | ✅ 🆕 |
| 10 | Reset (all fields including new) | 1 | ✅ |

### API Tests — `readingApi.test.ts` (18 tests ✅)

| # | Test Group | Cases | Status |
|---|-----------|-------|--------|
| 1 | generateArticle (payload, length mapping, response, fallback, readingTime, error) | 6 | ✅ |
| 2 | saveWord (payload) | 1 | ✅ |
| 3 | getSavedWords (pagination, defaults) | 2 | ✅ |
| 4 | deleteWord (endpoint) | 1 | ✅ |
| 5 | **analyzePractice** (payload, format, perfect score, error) | 4 | ✅ 🆕 |
| 6 | **saveReadingSession** (payload, default, response, error) | 4 | ✅ 🆕 |

### Hook Tests — `useReadingPractice.test.ts` (12 tests ✅ 🆕)

| # | Test Group | Cases | Status |
|---|-----------|-------|--------|
| 1 | Trạng thái ban đầu | 1 | ✅ |
| 2 | startRecording (phase, Voice.start, reset) | 2 | ✅ |
| 3 | startRecording fail (no mic) | 1 | ✅ |
| 4 | onSpeechResults (transcript realtime) | 1 | ✅ |
| 5 | onSpeechError (error + reset) | 1 | ✅ |
| 6 | stopRecording + analyze (phase transitions) | 1 | ✅ |
| 7 | stopRecording transcript rỗng | 1 | ✅ |
| 8 | API analyze fail | 1 | ✅ |
| 9 | resetPractice (full reset + Voice.cancel) | 1 | ✅ |
| 10 | Cleanup khi unmount | 1 | ✅ |

### Hook Tests — `useTtsReader.test.ts` (13 tests ✅ 🆕)

| # | Test Group | Cases | Status |
|---|-----------|-------|--------|
| 1 | Trạng thái ban đầu | 1 | ✅ |
| 2 | play() — bắt đầu đọc | 1 | ✅ |
| 3 | pause() — dừng + isPaused | 1 | ✅ |
| 4 | Resume after pause | 1 | ✅ |
| 5 | stop() — reset hoàn toàn | 1 | ✅ |
| 6 | Auto-advance (đọc xong đoạn → đoạn tiếp) | 1 | ✅ |
| 7 | Đọc xong đoạn cuối → reset | 1 | ✅ |
| 8 | skipTo(n) | 1 | ✅ |
| 9 | skipTo ngoài phạm vi | 2 | ✅ |
| 10 | Paragraphs rỗng | 1 | ✅ |
| 11 | TTS config setup | 1 | ✅ |

### Hook Tests — `usePinchZoom.test.ts` (8 tests ✅ 🆕)

| # | Test Group | Cases | Status |
|---|-----------|-------|--------|
| 1 | onPinchStart (lưu base) | 1 | ✅ |
| 2 | Zoom in (scale > 1) | 1 | ✅ |
| 3 | Zoom out (scale < 1) | 1 | ✅ |
| 4 | Max boundary (28sp) | 1 | ✅ |
| 5 | Min boundary (12sp) | 1 | ✅ |
| 6 | Scale = 1.0 → không đổi | 1 | ✅ |
| 7 | Nhiều lần pinch liên tiếp | 1 | ✅ |
| 8 | Default fontSize | 1 | ✅ |

---

## 2️⃣ SMOKE TESTS (Chạy đầu tiên — tối thiểu 5 phút)

> **Mục đích:** Verify luồng đọc bài + Enhanced hoạt động end-to-end  
> **Khi nào chạy:** Sau mỗi build, trước khi test chi tiết

| ID | Scenario | Steps | Expected | ✅/❌ |
|:---|:---------|:------|:---------|:------|
| SMK-R01 | Navigate ConfigScreen | 1. Dashboard → "📖 Luyện Đọc" | ConfigScreen hiện: topic input, chips, level, length | 🔲 |
| SMK-R02 | Chọn config | 1. Nhập topic / chip<br>2. Chọn level + length | Config cập nhật, nút Start enable | 🔲 |
| SMK-R03 | Generate article | 1. Tap "Bắt đầu" | Loading → ArticleScreen với bài viết hoàn chỉnh | 🔲 |
| SMK-R04 | Đọc + scroll | 1. Scroll bài viết lên/xuống | Smooth, không lag, text rõ | 🔲 |
| SMK-R05 | Tap-to-translate | 1. Tap 1 từ bất kỳ | Dictionary popup hiện: nghĩa VN, IPA, phát âm | 🔲 |
| SMK-R06 | Bottom action bar | 1. Kiểm tra bottom bar hiện | Có: Aa, Focus, Lưu bài, Từ vựng | 🔲 |
| SMK-R07 | Nút "Luyện đọc to" | 1. Scroll xuống cuối bài<br>2. Tap "🎤 Luyện đọc to" | Navigate sang PracticeScreen | 🔲 |
| SMK-R08 | Quay lại | 1. Tap ← | Về ConfigScreen, không crash | 🔲 |

---

## 3️⃣ FUNCTIONAL TESTS — Enhanced Features (Manual)

### 3.1 TTS Auto-Read (useTtsReader)

| ID | Type | Scenario | Steps | Expected Result | Severity | ✅/❌ |
|:---|:-----|:---------|:------|:----------------|:---------|:------|
| FT-TTS-01 | ✅ | Bật TTS | 1. Tap nút 🔊 trong header | TTS bắt đầu đọc từ đoạn đầu, icon đổi thành ⏸️ | 🔴 | 🔲 |
| FT-TTS-02 | ✅ | Pause/Resume TTS | 1. Đang đọc → tap ⏸️<br>2. Tap ▶️ lại | Dừng → tiếp tục đọc đúng vị trí | 🔴 | 🔲 |
| FT-TTS-03 | ✅ | Highlight đoạn đang đọc | 1. Bật TTS<br>2. Quan sát text | Đoạn đang đọc có border highlight (readingColor) | 🟡 | 🔲 |
| FT-TTS-04 | ✅ | Auto-scroll theo đoạn | 1. Bật TTS<br>2. Chờ đọc đến đoạn dưới | ScrollView tự scroll xuống đoạn đang đọc | 🟡 | 🔲 |
| FT-TTS-05 | ✅ | Stop TTS | 1. Đang đọc → tap ⏹️ | Dừng hẳn, highlight bỏ, reset về đầu | 🟡 | 🔲 |
| FT-TTS-06 | ⚠️ | TTS + tap từ đồng thời | 1. Đang đọc TTS<br>2. Tap 1 từ | Dictionary popup hiện, TTS không bị ngắt | 🟡 | 🔲 |

### 3.2 Focus Mode

| ID | Type | Scenario | Steps | Expected Result | Severity | ✅/❌ |
|:---|:-----|:---------|:------|:----------------|:---------|:------|
| FT-FOC-01 | ✅ | Bật Focus Mode | 1. Tap nút 🔲 Focus trong bottom bar | Header + bottom bar ẩn (animated), status bar ẩn, font +2 | 🔴 | 🔲 |
| FT-FOC-02 | ✅ | Hint label hiện | 1. Bật Focus Mode<br>2. Quan sát | "Chạm để thoát Focus Mode" hiện 2-3s rồi tự ẩn | 🟡 | 🔲 |
| FT-FOC-03 | ✅ | Tắt Focus Mode | 1. Đang Focus Mode<br>2. Tap giữa màn hình | Header + bottom bar hiện lại (animated), font -2 | 🔴 | 🔲 |
| FT-FOC-04 | ⚠️ | Focus Mode + scroll | 1. Bật Focus Mode<br>2. Scroll bài | Scroll mượt, không hiện chrome | 🟡 | 🔲 |
| FT-FOC-05 | ⚠️ | Focus Mode + tap từ | 1. Bật Focus Mode<br>2. Tap 1 từ | Dictionary popup hiện, Focus Mode giữ nguyên | 🟡 | 🔲 |

### 3.3 Pinch-to-Zoom (usePinchZoom)

| ID | Type | Scenario | Steps | Expected Result | Severity | ✅/❌ |
|:---|:-----|:---------|:------|:----------------|:---------|:------|
| FT-PZ-01 | ✅ | Pinch zoom in | 1. 2 ngón pinch outward (mở ra) | Font size tăng (max 28sp) | 🔴 | 🔲 |
| FT-PZ-02 | ✅ | Pinch zoom out | 1. 2 ngón pinch inward (thu lại) | Font size giảm (min 12sp) | 🔴 | 🔲 |
| FT-PZ-03 | ✅ | Giới hạn min/max | 1. Pinch cực nhỏ → cực to | Không vượt 12sp và 28sp | 🟡 | 🔲 |
| FT-PZ-04 | ⚠️ | Pinch + scroll cùng lúc | 1. Pinch zoom + kéo scroll | Không conflict gesture, ưu tiên pinch | 🟡 | 🔲 |
| FT-PZ-05 | ✅ | Font size giữ khi chuyển focus mode | 1. Pinch to 22sp<br>2. Bật Focus Mode<br>3. Tắt Focus Mode | Font size = 22sp (giữ nguyên) | 🟢 | 🔲 |

### 3.4 Highlight Saved Vocabulary

| ID | Type | Scenario | Steps | Expected Result | Severity | ✅/❌ |
|:---|:-----|:---------|:------|:----------------|:---------|:------|
| FT-HL-01 | ✅ | Từ đã save hiện highlight | 1. Save từ "climate"<br>2. Quan sát trong bài | Từ "climate" có amber background + text color | 🔴 | 🔲 |
| FT-HL-02 | ✅ | Save nhiều từ | 1. Save 3 từ khác nhau | Tất cả 3 từ đều highlight amber | 🟡 | 🔲 |
| FT-HL-03 | ⚠️ | Case insensitive | 1. Save "Climate" (viết hoa)<br>2. Kiểm tra "climate" trong bài | Highlight đúng dù case khác | 🟢 | 🔲 |

### 3.5 Direct Save to History

| ID | Type | Scenario | Steps | Expected Result | Severity | ✅/❌ |
|:---|:-----|:---------|:------|:----------------|:---------|:------|
| FT-DS-01 | ✅ | Lưu bài đọc | 1. Tap nút 💾 "Lưu bài" trong bottom bar | Button đổi "Đang lưu..." → "Đã lưu" ✓, toast/icon confirm | 🔴 | 🔲 |
| FT-DS-02 | ✅ | Button disabled sau khi lưu | 1. Lưu thành công<br>2. Tap nút "Đã lưu" | Không gọi API lần 2, button disabled | 🟡 | 🔲 |
| FT-DS-03 | ✅ | Kiểm tra History | 1. Lưu bài<br>2. Về History tab | Entry reading mới hiện, đúng title + level | 🟡 | 🔲 |
| FT-DS-04 | ❌ | API lưu lỗi | 1. Server down<br>2. Tap "Lưu bài" | Alert lỗi, button quay lại "Lưu bài" (retry được) | 🔴 | 🔲 |

### 3.6 Dictionary Audio Playback

| ID | Type | Scenario | Steps | Expected Result | Severity | ✅/❌ |
|:---|:-----|:---------|:------|:----------------|:---------|:------|
| FT-DA-01 | ✅ | Phát âm từ trong popup | 1. Tap từ → popup<br>2. Tap 🔊 | Audio phát âm từ (via browser/external) | 🟡 | 🔲 |
| FT-DA-02 | ⚠️ | Từ không có audio | 1. Tap từ hiếm → popup<br>2. Tap 🔊 | Graceful: thông báo hoặc silent fail | 🟢 | 🔲 |

### 3.7 Reading Practice (PracticeScreen)

| ID | Type | Scenario | Steps | Expected Result | Severity | ✅/❌ |
|:---|:-----|:---------|:------|:----------------|:---------|:------|
| FT-RP-01 | ✅ | Navigate vào Practice | 1. Scroll cuối bài<br>2. Tap "🎤 Luyện đọc to" | PracticeScreen mở, hiện đoạn 1 gốc ở trên | 🔴 | 🔲 |
| FT-RP-02 | ✅ | Bắt đầu ghi âm | 1. Tap nút 🎤 Record | Nút đổi thành ⏹️ Stop, STT bắt đầu nhận giọng | 🔴 | 🔲 |
| FT-RP-03 | ✅ | Transcript realtime | 1. Đang ghi âm<br>2. Đọc to theo bài | Text transcript hiện dần dưới "Your Turn" | 🔴 | 🔲 |
| FT-RP-04 | ✅ | Dừng + phân tích | 1. Tap ⏹️ Stop | Phase → "Đang phân tích..." (loading) → Kết quả hiện | 🔴 | 🔲 |
| FT-RP-05 | ✅ | Kết quả AI Analysis | 1. Đọc xong + dừng<br>2. Kiểm tra kết quả | Hiện: Accuracy %, Fluency %, danh sách lỗi, feedback AI | 🔴 | 🔲 |
| FT-RP-06 | ✅ | Score colors | 1. Kiểm tra score | ≥80: xanh, 60-79: vàng, <60: đỏ | 🟢 | 🔲 |
| FT-RP-07 | ✅ | "Đọc lại" button | 1. Kết quả hiện<br>2. Tap "🔄 Đọc lại" | Reset: transcript xóa, phase=idle, sẵn sàng ghi âm lại | 🟡 | 🔲 |
| FT-RP-08 | ✅ | Chuyển đoạn tiếp | 1. Kết quả hiện<br>2. Tap "▶️ Đoạn tiếp" | Chuyển sang đoạn 2 (text + transcript reset) | 🟡 | 🔲 |
| FT-RP-09 | ✅ | Navigation đoạn | 1. Tap ◀️/▶️ trong header | Chuyển đoạn, counter cập nhật "Đoạn 2/5" | 🟡 | 🔲 |
| FT-RP-10 | ⚠️ | Đoạn cuối cùng | 1. Đọc đoạn cuối<br>2. Kiểm tra | Nút ▶️ disabled, chỉ hiện "🔄 Đọc lại" | 🟢 | 🔲 |
| FT-RP-11 | ❌ | STT error (no mic permission) | 1. Deny microphone permission<br>2. Tap Record | Error message hiện, không crash | 🔴 | 🔲 |
| FT-RP-12 | ❌ | API analyze fail | 1. Server down<br>2. Đọc + dừng | Error message, nút "Thử lại" hiện | 🔴 | 🔲 |

### 3.8 Navigation & Routing

| ID | Type | Scenario | Steps | Expected Result | Severity | ✅/❌ |
|:---|:-----|:---------|:------|:----------------|:---------|:------|
| FT-NAV-01 | ✅ | Article → Practice | 1. Tap "🎤 Luyện đọc to" | Navigate → PracticeScreen, article data intact | 🔴 | 🔲 |
| FT-NAV-02 | ✅ | Practice → Back | 1. Tap ← trong PracticeScreen | Quay ArticleScreen, scroll position giữ nguyên | 🟡 | 🔲 |

---

## 4️⃣ FUNCTIONAL TESTS — MVP Features (Manual)

### 4.1 ConfigScreen

| ID | Type | Scenario | Steps | Expected Result | Severity | ✅/❌ |
|:---|:-----|:---------|:------|:----------------|:---------|:------|
| FT-RCFG-01 | ✅ | Mở ReadingConfigScreen | 1. Dashboard → Luyện đọc | Header, topic input, chips, level, length, nút Start | 🔴 | 🔲 |
| FT-RCFG-02 | ✅ | Nhập topic tay | 1. Gõ "Climate change" | Text hiện, nút Start enable | 🔴 | 🔲 |
| FT-RCFG-03 | ✅ | Chọn chip gợi ý | 1. Tap chip "🌍 Môi trường" | Chip highlight, input auto-fill | 🟡 | 🔲 |
| FT-RCFG-04 | ✅ | Chọn level | 1. SegmentedControl → Nâng cao | Mô tả level đổi theo | 🟡 | 🔲 |
| FT-RCFG-05 | ✅ | Chọn length | 1. Chọn "Dài" | Length updated | 🟡 | 🔲 |
| FT-RCFG-06 | ❌ | Start không topic | 1. Xóa topic<br>2. Tap Start | Nút disabled hoặc validation error | 🔴 | 🔲 |
| FT-RCFG-07 | ❌ | API generate lỗi | 1. Server down<br>2. Tap Start | Error message, không crash | 🔴 | 🔲 |

### 4.2 ArticleScreen (MVP)

| ID | Type | Scenario | Steps | Expected Result | Severity | ✅/❌ |
|:---|:-----|:---------|:------|:----------------|:---------|:------|
| FT-RART-01 | ✅ | Hiển thị article | 1. Generate xong | Tiêu đề + nội dung hiện đẹp, font rõ | 🔴 | 🔲 |
| FT-RART-02 | ✅ | Scroll mượt | 1. Scroll bài dài | Không lag, không stuttering | 🟡 | 🔲 |
| FT-RART-03 | ✅ | Tap từ → popup | 1. Tap "unprecedented" | Popup: nghĩa VN, IPA, loại từ, nút 🔊 | 🔴 | 🔲 |
| FT-RART-04 | ✅ | Font A+/A- | 1. Tap A+ / A- | Font size tăng/giảm tương ứng | 🟡 | 🔲 |
| FT-RART-05 | ✅ | Back button | 1. Tap ← | ConfigScreen, config giữ nguyên | 🟡 | 🔲 |

---

## 5️⃣ MONKEY TESTS (Free-form — Thao tác ngẫu nhiên)

> **Mục đích:** Phát hiện crash, memory leak, UI glitch  
> **Thời gian:** 15 phút, thao tác TỰ DO

| ID | Scenario | Thao tác | Quan sát | ✅/❌ |
|:---|:---------|:---------|:---------|:------|
| MNK-R01 | Spam tap Start | Tap Start 10 lần nhanh | Không duplicate navigate, loading hiện 1 lần | 🔲 |
| MNK-R02 | Spam tap từ | Tap 10 từ khác nhau rất nhanh (<0.3s/từ) | Popup switch mượt, không crash | 🔲 |
| MNK-R03 | Scroll + tap từ | Scroll nhanh + tap từ giữa scroll | Popup hiện đúng từ, scroll dừng | 🔲 |
| MNK-R04 | Back giữa generate | Tap Start → Back ngay | Loading cancel, quay Config | 🔲 |
| MNK-R05 | Tắt mạng giữa generate | Tap Start → tắt WiFi | Error hiện, không treo | 🔲 |
| MNK-R06 | Minimize app giữa đọc | Home → mở lại | Bài vẫn đúng, scroll position nhớ | 🔲 |
| MNK-R07 | Toggle Focus Mode nhanh | Bật/tắt Focus 10 lần nhanh | Animation không giật, state đúng | 🔲 |
| MNK-R08 | Pinch zoom liên tục | Pinch in/out liên tục 20 lần | Font smooth, không lag, không crash | 🔲 |
| MNK-R09 | TTS + Focus Mode | Bật TTS → bật Focus Mode → tắt TTS | TTS dừng, Focus Mode giữ nguyên | 🔲 |
| MNK-R10 | Record + back nhanh | Tap Record → Back ngay | STT cancel, không crash, quay Article | 🔲 |
| MNK-R11 | Save bài nhiều lần | Tap "Lưu bài" liên tục | Chỉ API call 1 lần, button disabled sau | 🔲 |
| MNK-R12 | Tap từ trong PracticeScreen | Tap text trong original text section | Không crash (text không có tap handler ở Practice) | 🔲 |
| MNK-R13 | Xoay device đang ghi âm | Đang Record → xoay device | Recording tiếp tục hoặc stop graceful | 🔲 |
| MNK-R14 | Nhập topic emoji + Generate + Practice | Gõ "🏖️ 寿司 مرحبا" → Generate → Practice | Tất cả hoạt động hoặc error graceful | 🔲 |

---

## 6️⃣ EDGE CASE TESTS

| ID | Scenario | Steps | Expected Result | Severity | ✅/❌ |
|:---|:---------|:------|:----------------|:---------|:------|
| EC-R01 | Article rỗng | API trả article rỗng | Fallback "Không tạo được bài", retry | 🔴 | 🔲 |
| EC-R02 | Dark mode full flow | Bật dark mode → Config → Article → Practice | Text contrast OK, popup style OK, badges OK | 🟡 | 🔲 |
| EC-R03 | iPad layout | Chạy trên iPad | Text đọc thoải mái, gestures work, popup fit | 🟡 | 🔲 |
| EC-R04 | Bài 2000+ từ | Length "Dài" | Scroll mượt, TTS đọc hết, highlight đúng | 🟡 | 🔲 |
| EC-R05 | Từ không có dictionary | Tap tên riêng "Tesla" | Popup "Không tìm thấy" hoặc gần đúng | 🟢 | 🔲 |
| EC-R06 | Slow 3G network | Throttle 3G → Generate + Practice | Loading hiện, không timeout quá sớm | 🟡 | 🔲 |
| EC-R07 | Article chỉ có 1 đoạn | Generate bài cực ngắn | Practice: đoạn 1/1, nút Next disabled | 🟢 | 🔲 |
| EC-R08 | STT nhận sai hoàn toàn | Đọc tiếng Việt thay vì tiếng Anh | Accuracy thấp, feedback hữu ích | 🟡 | 🔲 |
| EC-R09 | Pinch zoom ở PracticeScreen | Pinch trên PracticeScreen | Không crash (PracticeScreen không dùng pinch) | 🟢 | 🔲 |
| EC-R10 | Focus Mode + bật TTS | Bật Focus → bật TTS | TTS đọc, highlight đoạn, chỉ text + highlight hiện | 🟡 | 🔲 |
| EC-R11 | Lưu bài rồi đọc bài mới | Lưu → "Đọc bài mới" → Generate | Article mới, nút "Lưu bài" reset (chưa lưu) | 🟡 | 🔲 |
| EC-R12 | Practice khi bài có markdown | Article có bold/italic | Practice hiện plain text | 🟢 | 🔲 |

---

## 7️⃣ CHECKLIST TRƯỚC KHI RELEASE

| # | Hạng mục | Tiêu chí | Status |
|---|----------|----------|--------|
| 1 | Unit tests | 73/73 passed | ✅ |
| 2 | Smoke tests (8 items) | Tất cả PASS | 🔲 |
| 3 | Critical bugs (🔴) | 0 bugs | 🔲 |
| 4 | Enhanced features (32 items) | Tất cả Happy Path ✅ PASS | 🔲 |
| 5 | Monkey tests (15 phút) | Không crash | 🔲 |
| 6 | Dark mode + iPad | Đọc được hết | 🔲 |

---

## 📝 Bug Log (Ghi khi test)

| # | Ngày | Test ID | Mô tả bug | Severity | Device | Screenshot | Status |
|---|------|---------|-----------|----------|--------|------------|--------|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |
