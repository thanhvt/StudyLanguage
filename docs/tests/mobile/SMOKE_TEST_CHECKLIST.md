# 🔥 SMOKE TEST CHECKLIST — Cross-Module

> **Mục đích:** Kiểm tra nhanh chức năng cốt lõi toàn app trước mỗi release.
> **Thời gian:** ~15 phút
> **Khi nào chạy:** Mỗi release build, mỗi hotfix
> **Tester:** QA hoặc dev trước khi submit TestFlight / Internal Track
> **Cách dùng:** In ra hoặc copy vào Notion, đánh ☑️ mỗi item PASS

---

## 🚀 App Launch & Auth

| # | Test Case | Steps | ☐ |
|---|-----------|-------|---|
| 1 | App khởi động | Cold start app → Splash screen → Home | ☐ |
| 2 | Splash screen | Logo/animation hiện → Tự chuyển sang main | ☐ |
| 3 | Đăng nhập Google | Tap Sign in with Google → Auth flow → Dashboard | ☐ |
| 4 | Session persist | Kill app → Mở lại → Không cần login lại | ☐ |

---

## 🏠 Dashboard

| # | Test Case | Steps | ☐ |
|---|-----------|-------|---|
| 5 | Dashboard render | Hiện 3 cards: Listening, Speaking, Reading | ☐ |
| 6 | Navigate Listening | Tap 🎧 → ConfigScreen hiện | ☐ |
| 7 | Navigate Speaking | Tap 🗣️ → ConfigScreen hiện | ☐ |
| 8 | Navigate Reading | Tap 📖 → ConfigScreen hiện | ☐ |
| 9 | Bottom tabs | Tap History/Profile → Screen đúng | ☐ |

---

## 🎧 Listening

| # | Test Case | Steps | ☐ |
|---|-----------|-------|---|
| 10 | Chọn config | Chọn topic + duration → Config state đúng | ☐ |
| 11 | Generate + Play | Tap Start → Audio phát sau loading | ☐ |
| 12 | Play/Pause | Tap ⏸️/▶️ → Audio toggle | ☐ |
| 13 | Transcript sync | Highlight câu đúng theo audio | ☐ |
| 14 | Bookmark | Long press câu → ⭐ hiện + toast | ☐ |
| 15 | Dictionary | Tap từ → Popup hiện nghĩa | ☐ |
| 16 | Back clean | Tap Back → Config, không crash | ☐ |

---

## 🗣️ Speaking

| # | Test Case | Steps | ☐ |
|---|-----------|-------|---|
| 17 | Chọn topic | Chọn topic → Start Practice | ☐ |
| 18 | Hiện câu | PracticeScreen → Text rõ ràng | ☐ |
| 19 | Ghi âm | Long press 🎤 → Nói → Thả | ☐ |
| 20 | AI Feedback | Loading → Score + word-by-word hiện | ☐ |
| 21 | Next sentence | Swipe right → Câu tiếp | ☐ |
| 22 | Back clean | Tap Back → Config, không crash | ☐ |

---

## 📖 Reading

| # | Test Case | Steps | ☐ |
|---|-----------|-------|---|
| 23 | Generate article | Chọn topic + Start → Article hiện | ☐ |
| 24 | Scroll + đọc | Scroll toàn bộ bài, text rõ ràng | ☐ |
| 25 | Back clean | Tap Back → Config, không crash | ☐ |

---

## 📊 History & Profile

| # | Test Case | Steps | ☐ |
|---|-----------|-------|---|
| 26 | History list | Tab History → Danh sách sessions hiện | ☐ |
| 27 | Profile info | Tab Profile → Tên + email + avatar đúng | ☐ |
| 28 | Settings | Tap Settings → Các options hiện | ☐ |
| 29 | Đăng xuất | Profile → Logout → Login screen | ☐ |

---

## ✅ Tổng kết

| Kết quả | |
|---------|---|
| **Tổng test cases:** | 29 |
| **PASS:** | ___ /29 |
| **FAIL:** | ___ |
| **Tester:** | |
| **Device:** | |
| **Build version:** | |
| **Ngày test:** | |
| **Notes:** | |
