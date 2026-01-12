# UNIT TEST CASES
**Project:** StudyLanguage
**Module:** Core, 4 Skills, Utilities
**Updated:** 12/01/2026

---

## 1. FRONTEND UTILITIES & HOOKS
*Mục tiêu: Đảm bảo các hàm xử lý logic nhỏ hoạt động đúng.*

| ID | Function/Component | Test Case Description | Input Data | Expected Output | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UT-FE-001** | `calculateReadingScore(correct, total)` | Tính điểm bài đọc chính xác | `correct=3`, `total=5` | Returns `60` (or `6.0`) | High |
| **UT-FE-002** | `calculateReadingScore` | Xử lý chia cho 0 | `correct=0`, `total=0` | Returns `0` (No crash) | Low |
| **UT-FE-003** | `formatDuration(seconds)` | Format thời gian hiển thị | `65` | Returns `"01:05"` | Medium |
| **UT-FE-004** | `formatDuration` | Format thời gian > 1 giờ | `3665` | Returns `"01:01:05"` | Medium |
| **UT-FE-005** | `useThemeStore` | Switch theme logic | Call `setTheme('dark')` | `theme` state becomes `'dark'` | High |
| **UT-FE-006** | `validateEmail(email)` | Kiểm tra định dạng email đúng | `"test@email.com"` | Returns `true` | High |
| **UT-FE-007** | `validateEmail(email)` | Kiểm tra định dạng email sai | `"test-email"` | Returns `false` | High |

---

## 2. CORE COMPONENTS (UI)
*Mục tiêu: Đảm bảo UI render đúng trạng thái.*

| ID | Component | Test Case Description | Props/State | Expected Output | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UT-UI-001** | `<Button />` | Render trạng thái Loading | `isLoading={true}` | Show Spinner/Loading icon, disabled click | High |
| **UT-UI-002** | `<ConversationBubble />` | Render tin nhắn của User | `role="user"`, `text="Hello"` | Bubble nằm bên phải, màu xanh (accent) | Medium |
| **UT-UI-003** | `<ConversationBubble />` | Render tin nhắn của AI | `role="ai"`, `text="Hi there"` | Bubble nằm bên trái, màu xám | Medium |
| **UT-UI-004** | `<ProgressBar />` | Hiển thị % đúng | `progress={50}` | Width của bar là 50% | Medium |

---

## 3. BACKEND SERVICES (NESTJS)
*Mục tiêu: Đảm bảo logic xử lý dữ liệu backend đúng.*

| ID | Service/Function | Test Case Description | Input Data | Expected Output | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UT-BE-001** | `AuthService.validateUser` | Validate user tồn tại | Valid `googleId` | Returns User object | High |
| **UT-BE-002** | `SpeakingService.calculatePronunciationScore` | Tính điểm phát âm trung bình | List word scores `[80, 90, 70]` | Returns `80` | High |
| **UT-BE-003** | `DictionaryService.lookup` | Tra cứu từ điển thành công | Word `"apple"` | Returns definition, IPA, audio URL | High |
| **UT-BE-004** | `HistoryService.logActivity` | Log hoạt động mới vào DB | Activity DTO object | Record Created in DB, Returns ID | High |

---

## 4. AI PROMPT ENGINEERING TESTS
*Mục tiêu: Đảm bảo Prompt gửi lên OpenAI trả về đúng format JSON mong đợi (Unit test cho Prompt).*

| ID | Prompt Template | Test Case Description | Verification Method | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **UT-AI-001** | `GENERATE_CONVERSATION` | Output trả về đúng cấu trúc JSON hội thoại | Parse JSON | No Error, contains `dialogue` array | High |
| **UT-AI-002** | `GENERATE_QUIZ` | Output trả về đủ 4 đáp án trắc nghiệm | Check `options.length` | Equal 4 | High |
| **UT-AI-003** | `CORRECT_GRAMMAR` | Output highlight đúng lỗi sai giả định | Feed incorrect sentence | JSON contains `errors` array | High |
