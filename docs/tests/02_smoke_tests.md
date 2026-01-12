# FUNCTIONAL & SMOKE TEST CASES (DETAILED)
**Project:** StudyLanguage
**Frequency:** Every Release
**Updated:** 12/01/2026

---

## 1. ACCOUNT & AUTHENTICATION FLOW
*Mục tiêu: Đảm bảo luồng đăng nhập/đăng xuất hoạt động trơn tru.*

| ID | Feature | Step-by-Step Scenario | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **FN-AUTH-001** | **Google Login (Success)** | 1. Mở App/Web.<br>2. Click nút "Login with Google".<br>3. Chọn tài khoản Google hợp lệ. | Redirect về Dashboard. Hiển thị đúng Avatar và Tên tài khoản. Token được lưu vào Storage/Cookie. | |
| **FN-AUTH-002** | **Logout** | 1. Click Avatar ở góc trên cùng.<br>2. Chọn "Đăng xuất".<br>3. Xác nhận (nếu có popup). | Redirect về trang Login. Token bị xóa khỏi Client. Không thể truy cập trang Dashboard (Redirect to Login). | |
| **FN-AUTH-003** | **Session Expired** | 1. Login thành công.<br>2. Xóa Token thủ công (DevTools) hoặc chờ 1h.<br>3. Reload trang hoặc chuyển tab. | Tự động Redirect về trang Login. Hiển thị thông báo "Phiên đăng nhập hết hạn". | |

---

## 2. LISTENING MODULE FLOW
*Mục tiêu: Kiểm tra chức năng Luyện Nghe cốt lõi.*

| ID | Feature | Step-by-Step Scenario | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **FN-LIS-001** | **Start Lesson** | 1. Vào Dashboard -> Listening.<br>2. Chọn bài "Morning Coffee".<br>3. Bấm "Start". | Màn hình Player mở ra. Audio tự động load (loading spinner biến mất). | |
| **FN-LIS-002** | **Playback Controls** | 1. Bấm Play (▶).<br>2. Chờ 5s, bấm Pause (II).<br>3. Kéo thanh trượt (Seek) đến 0:30. | Audio phát tiếng. Audio dừng lại ngay lập tức. Audio nhảy đến đúng đoạn 0:30 và tiếp tục phát. | |
| **FN-LIS-003** | **Karaoke Highlight** | 1. Quan sát text khi Audio đang chạy. | Dòng chữ tương ứng với giọng nói phải được highlight tịnh tiến theo thời gian. Không bị lệch (sync). | |
| **FN-LIS-004** | **Dictionary Lookup** | 1. Click vào từ "Cappuccino" trong bài.<br>2. Xem Popup. | Popup hiện ra. Có nghĩa tiếng Việt. Có nút loa (Speaker) để nghe phát âm từ đó. | |

---

## 3. SPEAKING MODULE FLOW (COMPLEX)
*Mục tiêu: Kiểm tra chức năng Luyện Nói (Dễ, lỗi nhất).*

| ID | Feature | Step-by-Step Scenario | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **FN-SPK-001** | **Permission Grant** | 1. Bấm nút Record lần đầu tiên. | Browser/App hiện popup xin quyền Micro. Nếu User chọn "Allow" -> Icon Micro chuyển trạng thái sẵn sàng. | |
| **FN-SPK-002** | **Recording** | 1. Giữ nút Record (hoặc Tap to record).<br>2. Nói "Hello World".<br>3. Thả tay (Stop). | Hiển thị trạng thái "Uploading..." hoặc sóng âm đang chạy. Không bị crash app. | |
| **FN-SPK-003** | **AI Analysis Result** | 1. Chờ AI xử lý xong (3-5s). | Hiển thị Score (VD: 85/100). Hiển thị list các từ sai (nếu có) được tô đỏ. | |
| **FN-SPK-004** | **Retry Flow** | 1. Bấm nút "Thử lại".<br>2. Ghi âm lại đoạn vừa rồi. | Điểm số cũ được lưu vào history (hoặc bị ghi đè tùy logic). Giao diện reset để ghi âm mới. | |
| **FN-SPK-005** | **Permission Deny** | 1. Tắt quyền Micro trong Setting.<br>2. Vào app bấm Record. | Hiện thông báo hướng dẫn user vào Setting bật lại quyền. App không crash. | |

---

## 4. READING & WRITING FLOW
*Mục tiêu: Kiểm tra chức năng Đọc/Viết cơ bản.*

| ID | Feature | Step-by-Step Scenario | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **FN-READ-001** | **Quiz Selection** | 1. Chọn đáp án A.<br>2. Đổi ý chọn đáp án B.<br>3. Bấm Submit. | Hệ thống ghi nhận đáp án B. Hiển thị kết quả Đúng/Sai ngay lập tức. | |
| **FN-WRT-001** | **Submit Text** | 1. Nhập đoạn văn vào ô text.<br>2. Bấm "Check Grammar". | Gửi text lên server. Trả về bản sửa lỗi có highlight (Xanh/Đỏ). | |
| **FN-WRT-002** | **Empty Input** | 1. Để trống ô text.<br>2. Bấm "Check Grammar". | Nút bị Disable hoặc hiện error "Vui lòng nhập nội dung". Không gửi request rác lên server. | |

---

## 5. USER SETTINGS & DATA
*Mục tiêu: Đảm bảo cài đặt được lưu.*

| ID | Feature | Step-by-Step Scenario | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **FN-SET-001** | **Change Theme** | 1. Vào Setting -> Theme.<br>2. Đổi sang Dark Mode.<br>3. Reload trang (F5). | Giao diện vẫn giữ Dark Mode (Persist state). | |
| **FN-HIS-001** | **Verify History** | 1. Hoàn thành 1 bài Speaking.<br>2. Vào History Tab. | Bài Speaking vừa tập phải xuất hiện ở dòng đầu tiên với đúng điểm số vừa đạt được. | |

---

## CHECKLIST THỰC HIỆN TRƯỚC DEPLOY
- [ ] Test trên Chrome Desktop.
- [ ] Test trên Safari (iPhone).
- [ ] Test trên Android App (APK debug).
- [ ] Check logs server (không có Error 500 liên tục).
