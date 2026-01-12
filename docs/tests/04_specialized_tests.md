# SPECIALIZED TEST CASES
**Types:** Mock, Monkey, Sandbox, Security
**Updated:** 12/01/2026

---

## 1. MOCK TESTS (NETWORK INDEPENDENT)
*Mục đích: Test logic app khi không có mạng hoặc API chết.*

| ID | Component | Mock Scenario | Expected Behavior |
| :--- | :--- | :--- | :--- |
| **MCK-001** | **OpenAI Service** | **Mock Response 500 error:** Giả lập OpenAI bị down service | App không crash, hiển thị thông báo "AI services are currently busy, please try again later" |
| **MCK-002** | **Network** | **Offline Mode:** Tắt mạng hoàn toàn (Airplane mode) | Khi vào bài học mới -> Báo "No Internet". Khi vào bài cũ -> Load data từ Cache |
| **MCK-003** | **Speaking Score** | **Mock Random Score:** Dev mode không gọi Whisper tốn tiền | Bấm record -> Trả về ngay lập tức điểm số random 0-100 để test UI animation |

---

## 2. MONKEY TESTS (CHAOS & STRESS)
*Mục đích: Tìm crash bug bằng cách thao tác điên cuồng.*

| ID | Target | Action | Expected Behavior |
| :--- | :--- | :--- | :--- |
| **MNK-001** | **Recording Button** | Tap nút Record liên tục 20 lần trong 5 giây | App không được treo, không gửi 20 request lên server. Chỉ nhận 1 lần hoặc disable nút khi processing. |
| **MNK-002** | **Navigation** | Switch qua lại giữa các tab (Home <-> Podcast <-> Profile) cực nhanh | App không bị blank screen, không chồng chéo layout. |
| **MNK-003** | **Input Field** | Copy paste đoạn văn bản dài 10,000 ký tự vào ô Chat với AI | App không bị lag đơ, tự động cắt ngắn hoặc cảnh báo giới hạn ký tự. |

---

## 3. SANDBOX TESTS (DANGEROUS ZONES)
*Mục đích: Test các tính năng nhạy cảm trong môi trường cô lập.*

| ID | Feature | Scenario | Safety Check |
| :--- | :--- | :--- | :--- |
| **SB-001** | **Delete Account** | User request xóa tài khoản vĩnh viễn | Verify email xác nhận -> Sau đó xóa toàn bộ trong DB (Cascade delete History, File). Không được sót data rác. |
| **SB-002** | **Change Plan** | Nâng cấp lên Premium (nếu có) sau đó Refund | Đảm bảo quyền lợi Premium bị thu hồi ngay lập tức, tiền hoàn về đúng user. |

---

## 4. SECURITY & PERMISSION TESTS

| ID | Feature | Scenario | Expected Behavior |
| :--- | :--- | :--- | :--- |
| **SEC-001** | **API Access** | Gọi API `GET /api/history` mà không kèm Bearer Token | Server trả về `401 Unauthorized` ngay lập tức. |
| **SEC-002** | **Data Leak** | Login User A, cố tính đoán ID của User B để gọi API xem lịch sử | Server check `user_id` trong Token khớp với chủ sở hữu data. Trả về `403 Forbidden`. |
| **SEC-003** | **Injection** | Nhập code SQL/JS vào ô search: `<script>alert(1)</script>` | Hệ thống Sanitize input, hiển thị như text thường, không execute code. |
