# 📖 Reading Module — Tài Liệu Test Toàn Diện

> **Module:** Reading (MVP)  
> **Phase:** MVP → Enhanced  
> **Ref:** `docs/mobile/features/04_Reading.md`  
> **Last Updated:** 2026-02-13

---

## 📊 Tổng Quan Test Coverage

| Loại Test | Số lượng | Trạng thái |
|-----------|----------|------------|
| **Unit Tests** (Jest) | 28 tests | ✅ 28/28 passed |
| **Smoke Tests** (Manual) | 6 scenarios | 🔲 Chưa test |
| **Functional Tests** (Manual) | 18 scenarios | 🔲 Chưa test |
| **Monkey Tests** (Free-form) | 10 scenarios | 🔲 Chưa test |
| **Edge Case Tests** (Manual) | 8 scenarios | 🔲 Chưa test |

---

## 1️⃣ UNIT TESTS (Automated)

> Chạy: `cd apps/mobile && npx jest --testPathPatterns="useReadingStore|readingApi" --verbose`

### Store Tests — `useReadingStore.test.ts` (16 tests ✅)

| # | Test Group | Cases | Status |
|---|-----------|-------|--------|
| 1 | Config (setConfig, merge) | 3 | ✅ |
| 2 | Article (setArticle, clear) | 3 | ✅ |
| 3 | Loading States | 2 | ✅ |
| 4 | Dictionary (setSelectedWord, clear) | 3 | ✅ |
| 5 | Error handling | 2 | ✅ |
| 6 | Defaults + Reset | 3 | ✅ |

### API Tests — `readingApi.test.ts` (12 tests ✅)

| # | Test Group | Cases | Status |
|---|-----------|-------|--------|
| 1 | generateArticle (prompt, parsing, fallback) | 4 | ✅ |
| 2 | lookupWord (payload, response mapping) | 3 | ✅ |
| 3 | textToSpeech (payload) | 2 | ✅ |
| 4 | getStats (data, fallback) | 3 | ✅ |

---

## 2️⃣ SMOKE TESTS (Chạy đầu tiên — tối thiểu 3 phút)

> **Mục đích:** Verify luồng đọc bài hoạt động end-to-end  
> **Khi nào chạy:** Sau mỗi build, trước khi test chi tiết

| ID | Scenario | Steps | Expected | ✅/❌ |
|:---|:---------|:------|:---------|:------|
| SMK-R01 | Navigate ConfigScreen | 1. Dashboard → "📖 Luyện Đọc" | ConfigScreen hiện: topic input, chips, level, length | 🔲 |
| SMK-R02 | Chọn config | 1. Nhập topic / chip<br>2. Chọn level + length | Config cập nhật, nút Start enable | 🔲 |
| SMK-R03 | Generate article | 1. Tap "Bắt đầu" | Loading → ArticleScreen với bài viết hoàn chỉnh | 🔲 |
| SMK-R04 | Đọc + scroll | 1. Scroll bài viết lên/xuống | Smooth, không lag, text rõ | 🔲 |
| SMK-R05 | Tap-to-translate | 1. Tap 1 từ bất kỳ | Dictionary popup hiện: nghĩa VN, IPA, phát âm | 🔲 |
| SMK-R06 | Quay lại | 1. Tap ← | Về ConfigScreen, không crash | 🔲 |

---

## 3️⃣ FUNCTIONAL TESTS (Manual — chi tiết)

### 3.1 ConfigScreen

| ID | Type | Scenario | Steps | Expected Result | Severity | ✅/❌ |
|:---|:-----|:---------|:------|:----------------|:---------|:------|
| FT-RCFG-01 | ✅ | Mở ReadingConfigScreen | 1. Dashboard → Luyện đọc | Header, topic input, chips, level, length, nút Start | 🔴 | 🔲 |
| FT-RCFG-02 | ✅ | Nhập topic tay | 1. Gõ "Climate change" | Text hiện, nút Start enable | 🔴 | 🔲 |
| FT-RCFG-03 | ✅ | Chọn chip gợi ý | 1. Tap chip "🌍 Môi trường" | Chip highlight, input auto-fill | 🟡 | 🔲 |
| FT-RCFG-04 | ✅ | Chọn level | 1. SegmentedControl → Nâng cao | Mô tả level đổi theo | 🟡 | 🔲 |
| FT-RCFG-05 | ✅ | Chọn length | 1. Chọn "Dài" | Length updated | 🟡 | 🔲 |
| FT-RCFG-06 | ❌ | Start không topic | 1. Xóa topic<br>2. Tap Start | Nút disabled hoặc validation error | 🔴 | 🔲 |
| FT-RCFG-07 | ❌ | API generate lỗi | 1. Server down<br>2. Tap Start | Error message, không crash | 🔴 | 🔲 |

### 3.2 ArticleScreen

| ID | Type | Scenario | Steps | Expected Result | Severity | ✅/❌ |
|:---|:-----|:---------|:------|:----------------|:---------|:------|
| FT-RART-01 | ✅ | Hiển thị article | 1. Generate xong | Tiêu đề + nội dung hiện đẹp, font rõ | 🔴 | 🔲 |
| FT-RART-02 | ✅ | Scroll mượt | 1. Scroll bài dài | Không lag, không stuttering | 🟡 | 🔲 |
| FT-RART-03 | ✅ | Tap từ → popup | 1. Tap "unprecedented" | Popup: nghĩa VN, IPA, loại từ, nút 🔊 | 🔴 | 🔲 |
| FT-RART-04 | ✅ | Phát âm từ | 1. Trong popup tap 🔊 | TTS đọc từ | 🟡 | 🔲 |
| FT-RART-05 | ✅ | Save từ vào list | 1. Popup → Tap "Save" | Toast confirm, từ lưu vào Saved | 🟡 | 🔲 |
| FT-RART-06 | ✅ | Dismiss popup | 1. Tap bên ngoài popup | Popup đóng mượt | 🟢 | 🔲 |
| FT-RART-07 | ⚠️ | Tap từ khi popup đang mở | 1. Tap từ A → popup<br>2. Tap từ B | Popup switch sang từ B, không mở 2 popup | 🟡 | 🔲 |
| FT-RART-08 | ⚠️ | Tap "don't" / "it's" | 1. Tap contraction word | Tra đúng nghĩa gốc | 🟡 | 🔲 |
| FT-RART-09 | ✅ | Back button | 1. Tap ← | ConfigScreen, config giữ nguyên | 🟡 | 🔲 |

### 3.3 Enhanced Phase (sau MVP)

| ID | Type | Scenario | Steps | Expected Result | Severity | ✅/❌ |
|:---|:-----|:---------|:------|:----------------|:---------|:------|
| FT-RENH-01 | ✅ | Focus Mode toggle | 1. Bật Focus Mode | Background dim, highlight 1 đoạn | 🟡 | 🔲 |
| FT-RENH-02 | ✅ | Auto-read article | 1. Tap 🔊 Auto-read | TTS đọc bài, highlight theo câu | 🟡 | 🔲 |

---

## 4️⃣ MONKEY TESTS (Free-form — Thao tác ngẫu nhiên)

> **Mục đích:** Phát hiện crash, memory leak, UI glitch  
> **Thời gian:** 10 phút, thao tác TỰ DO  

| ID | Scenario | Thao tác | Quan sát | ✅/❌ |
|:---|:---------|:---------|:---------|:------|
| MNK-R01 | Spam tap Start | 1. Nhập topic<br>2. Tap Start 10 lần nhanh | Không duplicate navigate, loading hiện 1 lần | 🔲 |
| MNK-R02 | Spam tap từ trong bài | 1. Tap 10 từ khác nhau rất nhanh (< 0.3s/từ) | Popup switch mượt, không crash, audio không chồng | 🔲 |
| MNK-R03 | Scroll + tap từ đồng thời | 1. Scroll nhanh + tap từ giữa scroll | Popup hiện đúng từ, scroll dừng | 🔲 |
| MNK-R04 | Back nhanh giữa generate | 1. Tap Start (loading)<br>2. Tap Back ngay | Loading cancel/ignore, quay Config, không treo | 🔲 |
| MNK-R05 | Tắt mạng giữa generate | 1. Tap Start<br>2. Tắt WiFi ngay | Error hiện, không treo vô hạn | 🔲 |
| MNK-R06 | Minimize app giữa đọc bài | 1. Đang đọc bài<br>2. Home button<br>3. Mở lại | Bài vẫn đúng, scroll position nhớ | 🔲 |
| MNK-R07 | Xoay device | 1. Đang đọc<br>2. Xoay ngang → dọc | Layout re-render đúng, text wrap lại | 🔲 |
| MNK-R08 | Nhập topic emoji/unicode | 1. Gõ "🏖️ 寿司 مرحبا"<br>2. Tap Start | Generate hoặc error graceful | 🔲 |
| MNK-R09 | Mở/đóng popup 20 lần | 1. Tap từ → đóng → tap từ khác × 20 | Không memory leak, smooth | 🔲 |
| MNK-R10 | Đổi chip liên tục + Start | 1. Tap 5 chip nhanh<br>2. Tap Start ngay | Dùng chip cuối cùng, generate đúng | 🔲 |

---

## 5️⃣ EDGE CASE TESTS

| ID | Scenario | Steps | Expected Result | Severity | ✅/❌ |
|:---|:---------|:------|:----------------|:---------|:------|
| EC-R01 | Article rỗng (API bug) | 1. API trả article rỗng | Fallback "Không tạo được bài", nút retry | 🔴 | 🔲 |
| EC-R02 | Dark mode | 1. Bật dark mode<br>2. Full flow | Text đọc được, contrast OK, popup style OK | 🟡 | 🔲 |
| EC-R03 | iPhone SE (màn nhỏ) | 1. Chạy iPhone SE | Text không bị cắt, popup fit được | 🟡 | 🔲 |
| EC-R04 | Bài viết rất dài (2000+ từ) | 1. Chọn length "Dài" | Scroll mượt, không lag, memory OK | 🟡 | 🔲 |
| EC-R05 | Từ không có trong dictionary | 1. Tap tên riêng "Tesla" | Popup thông báo "Không tìm thấy" hoặc hiện gần đúng | 🟢 | 🔲 |
| EC-R06 | Slow network (3G) | 1. Throttle 3G<br>2. Generate article | Loading hiện lâu hơn, không timeout quá sớm | 🟡 | 🔲 |
| EC-R07 | Tap số / ký tự đặc biệt | 1. Tap "2024" hoặc "$100" | Popup xử lý đúng hoặc ignore, không crash | 🟢 | 🔲 |
| EC-R08 | Bài có table/list markdown | 1. Article có bullet list | Render đúng, không hiện raw markdown | 🟡 | 🔲 |

---

## 6️⃣ CHECKLIST TRƯỚC KHI RELEASE

| # | Hạng mục | Tiêu chí | Status |
|---|----------|----------|--------|
| 1 | Unit tests | 28/28 passed | ✅ |
| 2 | Smoke tests (6 items) | Tất cả PASS | 🔲 |
| 3 | Critical bugs (🔴) | 0 bugs | 🔲 |
| 4 | Functional tests | Tất cả Happy Path ✅ PASS | 🔲 |
| 5 | Monkey tests (5 phút) | Không crash | 🔲 |
| 6 | Dark mode | Đọc được hết | 🔲 |

---

## 📝 Bug Log (Ghi khi test)

| # | Ngày | Test ID | Mô tả bug | Severity | Device | Screenshot | Status |
|---|------|---------|-----------|----------|--------|------------|--------|
| 1 | | | | | | | |
| 2 | | | | | | | |
