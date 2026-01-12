# ERROR HANDLING & NEGATIVE TEST CASES
**Project:** StudyLanguage
**Focus:** Robustness, Security, Edge Cases
**Updated:** 12/01/2026

---

## 1. INPUT VALIDATION (FORM & DATA)
*Mục đích: Đảm bảo hệ thống không chấp nhận dữ liệu rác.*

### 1.1 Text Inputs
| ID | Field | Scenario | Input Data | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **ERR-INP-001** | **Email Field** | Nhập email thiếu @ | `userexample.com` | Hiển thị lỗi "Email không hợp lệ" ngay dưới ô input. |
| **ERR-INP-002** | **Email Field** | Nhập email có ký tự cấm | `user<script>@gmail.com` | Sanitize ký tự đặc biệt hoặc báo lỗi. Không cho phép submit. |
| **ERR-INP-003** | **Search Box** | Nhập chuỗi siêu dài | String > 1000 ký tự | Cắt bớt (truncate) hoặc báo lỗi "Từ khóa quá dài". API không bị treo. |
| **ERR-INP-004** | **Quantity** | Nhập số âm vào thời lượng học | `-15` phút | Tự động reset về 0 hoặc báo lỗi "Thời gian không hợp lệ". |

### 1.2 File Uploads (Speaking/Avatar)
| ID | Field | Scenario | Input Data | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **ERR-FILE-001** | **Audio Upload** | Upload sai định dạng | File `.exe` hoặc `.txt` | Báo lỗi "Chỉ hỗ trợ file audio (.mp3, .wav)". Server từ chối request. |
| **ERR-FILE-002** | **Audio Upload** | Upload file quá nặng | File > 25MB (Whisper Limit) | Báo lỗi "File quá lớn (Max 25MB)". |
| **ERR-FILE-003** | **Empty File** | Gửi request không kèm file | `null` | Báo lỗi "Vui lòng ghi âm trước khi gửi". |

---

## 2. API & NETWORK FAILURES
*Mục đích: Đảm bảo App không crash khi Server "ốm".*

### 2.1 Server Errors
| ID | Endpoint | Scenario | Expected UI Behavior |
| :--- | :--- | :--- | :--- |
| **ERR-NET-001** | **Login API** | Trả về 500 Internal Server Error | Hiện Toast error "Lỗi hệ thống, vui lòng thử lại sau". Không crash trắng trang. |
| **ERR-NET-002** | **AI Generate** | Timeout (quá 30s không phản hồi) | Hiện thông báo "AI đang bận, vui lòng thử lại". Nút Retry xuất hiện. |
| **ERR-NET-003** | **Save History** | Database đầy hoặc lỗi ghi (Write fail) | Báo "Không thể lưu kết quả". Dữ liệu nên được cache local để sync lại sau. |

### 2.2 Connectivity
| ID | Condition | Scenario | Expected UI Behavior |
| :--- | :--- | :--- | :--- |
| **ERR-NET-004** | **Slow Network** | Mạng 2G/3G yếu (High Latency) | Hiển thị Loading Spinner trong suốt thời gian chờ. Không cho user bấm loạn xạ (Disable buttons). |
| **ERR-NET-005** | **Switch Network** | Đang upload thì rớt mạng (Wifi -> 4G) | Tự động retry upload hoặc báo lỗi để user upload lại. |

---

## 3. LOGIC & BUSINESS RULES
*Mục đích: Đảm bảo logic nghiệp vụ chặt chẽ.*

| ID | Logic Flow | Scenario | Expected Result |
| :--- | :--- | :--- | :--- |
| **ERR-BIZ-001** | **Premium Feature** | User Free cố truy cập tính năng Premium | Redirect về trang Pricing hoặc hiện popup "Nâng cấp để sử dụng". Không cho phép hack qua URL. |
| **ERR-BIZ-002** | **Daily Streak** | User đổi giờ hệ thống điện thoại để hack streak | Server check thời gian theo NTP (Network Time) hoặc tính toán phía Server, không tin tưởng Client time. |
| **ERR-BIZ-003** | **Concurrent Login** | Login trên thiết bị thứ 3 (nếu giới hạn 2) | Tự động log out thiết bị cũ nhất hoặc cảnh báo. (Tùy policy). |

---

## 4. SECURITY EDGE CASES
*Mục đích: An toàn thông tin.*

| ID | Threat | Scenario | Expected Result |
| :--- | :--- | :--- | :--- |
| **ERR-SEC-001** | **XSS Injection** | Đặt tên hội thoại là `<script>alert(1)</script>` | Hiển thị đúng chuỗi text đó, không hiện popup alert. |
| **ERR-SEC-002** | **IDOR** | Sửa ID trên URL `history/123` thành `history/456` (của người khác) | Trang báo "Không tìm thấy" hoặc "Bạn không có quyền truy cập" (403/404). |
