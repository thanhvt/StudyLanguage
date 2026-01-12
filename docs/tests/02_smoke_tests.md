# SMOKE TEST CASES (CRITICAL PATH)
**Project:** StudyLanguage
**Frequency:** Every Release / Deploy
**Updated:** 12/01/2026

---

## 1. ACCOUNT & AUTHENTICATION
*Mục tiêu: Đảm bảo người dùng có thể truy cập vào hệ thống.*

| ID | Feature | Scenarios | Expected Result | Result (Pass/Fail) |
| :--- | :--- | :--- | :--- | :--- |
| **SM-001** | **Google Login** | Click "Login with Google" > Select Account | Redirect về Dashboard, hiển thị đúng Avatar/Name user | |
| **SM-002** | **Logout** | Click Avatar > Logout | Redirect về trang Login, xóa session cũ | |
| **SM-003** | **Sync** | Login trên Web sau đó Login trên Mobile | Dữ liệu (Theme, History) phải đồng bộ | |

---

## 2. CORE FEATURES (LEARNING)
*Mục tiêu: Đảm bảo người dùng có thể thực hiện bài học.*

| ID | Feature | Scenarios | Expected Result | Result (Pass/Fail) |
| :--- | :--- | :--- | :--- | :--- |
| **SM-004** | **Listening Flow** | Chọn bài Listening > Bấm Play | Audio phát ra tiếng, Script chạy chữ theo thời gian (Karaoke) | |
| **SM-005** | **Speaking Flow** | Chọn bài Speaking > Giữ nút Record > Nói > Thả nút | App hiển thị "Analyzing...", sau đó hiện điểm số và Feedback | |
| **SM-006** | **Reading Flow** | Chọn bài Reading > Đọc > Trả lời 1 câu hỏi | Click đáp án -> Hiện Đúng/Sai ngay lập tức | |
| **SM-007** | **Dictionary** | Click vào 1 từ bất kỳ trong bài đọc | Popup từ điển hiện lên: Nghĩa + Phát âm | |

---

## 3. PASSIVE LEARNING & UTILITIES
*Mục tiêu: Đảm bảo các tính năng phụ trợ không gây crash.*

| ID | Feature | Scenarios | Expected Result | Result (Pass/Fail) |
| :--- | :--- | :--- | :--- | :--- |
| **SM-008** | **Theme Switcher** | Toggle Dark Mode | Toàn bộ giao diện chuyển sang màu tối, không có text bị chìm (invisible) | |
| **SM-009** | **Background Music** | Bật nhạc Lofi > Vào bài Listening | Nhạc nền tự động nhỏ lại (Ducking) khi bài hội thoại phát | |
| **SM-010** | **Offline Mode (Mobile)** | Tắt Wifi/4G > Vào mục History | Vẫn xem được text các bài đã học (Cached) | |

---

## 4. HISTORY & DATA
*Mục tiêu: Đảm bảo dữ liệu được lưu trữ.*

| ID | Feature | Scenarios | Expected Result | Result (Pass/Fail) |
| :--- | :--- | :--- | :--- | :--- |
| **SM-011** | **History Logging** | Hoàn thành 1 bài học > Vào menu History | Bài học vừa xong xuất hiện trên đầu danh sách (Timeline top) | |

---

## CRITICAL CHECKLIST TRƯỚC KHI RELEASE
- [ ] UI không bị vỡ trên Mobile (iPhone SE màn hình nhỏ).
- [ ] API Key OpenAI đã set đúng trong Environment Variable.
- [ ] Kết nối Database Supabase ổn định (Check Health).
- [ ] Không có lỗi console log đỏ lòm (JS Error).
