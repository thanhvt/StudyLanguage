# Chiến lược OAuth & Quản lý Phiên đăng nhập

Tài liệu này phân tích cơ chế xác thực hiện tại (Supabase Auth) và đưa ra chiến lược quản lý phiên đăng nhập cho các loại ứng dụng khác nhau (Public App vs Internal App).

## 1. Cơ chế hiện tại (Current Architecture)

Hệ thống đang sử dụng **Supabase Auth** kết hợp với **NestJS Guards**.

### Luồng hoạt động:
1.  **Frontend (`apps/web`)**:
    - Sử dụng `@supabase/ssr` (thư viện mới thay thế `auth-helpers`) để quản lý auth.
    - **Lưu trữ**: Token được lưu mặc định trong `LocalStorage` (đối với `createBrowserClient`).
    - **Cơ chế**:
        - **Access Token**: JWT, vòng đời ngắn (thường là 1 giờ). Dùng để gọi API.
        - **Refresh Token**: Chuỗi ngẫu nhiên, vòng đời dài (mặc định không bao giờ hết hạn user không đăng xuất, hoặc cấu hình 1 năm). Dùng để lấy Access Token mới.
    - **Auto Refresh**: Supabase Client tự động chạy ngầm một timer để refresh token trước khi Access Token hết hạn.

2.  **Backend (`apps/api`)**:
    - Sử dụng `SupabaseAuthGuard` để xác thực Access Token gửi lên từ client.
    - Backend **không** quản lý session state (stateless). Nó chỉ verify tính hợp lệ của JWT (chữ ký, hạn dùng).

## 2. Chiến lược cho từng loại ứng dụng

### A. Ứng dụng Public / B2C (Nhiều người dùng, StudyLanguage)
**Yêu cầu**: "Tôi không muốn họ thoát ra đăng nhập lại, mà cần lưu trữ thông tin đăng nhập mãi mãi" (Keep me logged in forever).

**Giải pháp**:
Hệ thống hiện tại **ĐÃ HỖ TRỢ** việc này mặc định.

*   **Tại sao?**: Refresh Token của Supabase được lưu trong LocalStorage. Trừ khi người dùng xóa cache trình duyệt hoặc chủ động bấm "Đăng xuất", token này sẽ tồn tại.
*   **Cơ chế hoạt động**:
    1.  Người dùng tắt trình duyệt (Session cookie có thể mất, nhưng LocalStorage còn).
    2.  Người dùng mở lại trình duyệt.
    3.  `createBrowserClient` khởi tạo, đọc Refresh Token từ LocalStorage.
    4.  Client tự động gọi Supabase để đổi Access Token mới.
    5.  Người dùng vẫn ở trạng thái "Đăng nhập".

**Cấu hình tối ưu (Recommend)**:
1.  Đảm bảo không gọi `supabase.auth.signOut()` trừ khi người dùng thực sự bấm nút Logout.
2.  Trong Supabase Dashboard > Auth Settings:
    - Tắt "Enable Secure Session Cookies" nếu đang dùng LocalStorage đơn thuần (hoặc cấu hình Cookie lifetime thật dài).
    - Kiểm tra "Refresh Token Validity" (Nên để mặc định hoặc tăng lên nếu cần).

### B. Ứng dụng nội bộ / Internal Tools (Admin CMS, Banking App)
**Yêu cầu**: Bảo mật cao, tự logout khi không hoạt động, session timeout.

**Giải pháp**:
Cần can thiệp vào phía Client để chủ động hủy phiên.

1.  **Idle Timeout (Hết hạn khi không hoạt động)**:
    - Dùng React Hook để theo dõi sự kiện chuột/phím.
    - Nếu không có tương tác trong X phút (ví dụ: 15 phút) -> Gọi `supabase.auth.signOut()` và redirect về Login.

2.  **Absolute Session Timeout (Hết hạn cứng)**:
    - Lưu thời điểm login (`login_timestamp`).
    - Mỗi lần check auth, so sánh thời gian hiện tại. Nếu quá Y giờ (ví dụ: 8 giờ làm việc) -> Force Logout.

## 3. Tổng kết & So sánh

| Tính năng | Public App (StudyLanguage) | Internal App (Admin/Security) |
| :--- | :--- | :--- |
| **Mục tiêu** | Tiện dụng (Convenience) | Bảo mật (Security) |
| **Session Lifetime** | "Vĩnh viễn" (Persistent) | Có giới hạn (Time-boxed) |
| **Lưu trữ Token** | LocalStorage / Persistent Cookie | Session Cookie / Memory |
| **Hành động khi tắt tab** | Giữ trạng thái đăng nhập | (Tùy chọn) Xóa session |
| **Refresh Token** | Auto-refresh liên tục | Auto-refresh có điều kiện hoặc tắt |
| **Cài đặt cần làm** | Giữ nguyên mặc định Supabase | Cài thêm `useIdleTimer` để auto-logout |

## 4. Kiểm tra cấu hình hiện tại (Verification)

Để chắc chắn app hoạt động đúng ý muốn "Lưu mãi mãi":

1.  Mở Developer Tools > Application > Local Storage.
2.  Tìm key: `sb-<project-ref>-auth-token`.
3.  Đây là nơi chứa "chìa khóa" để user đăng nhập lại. Miễn là nó còn đó, user sẽ verify được.
4.  Thử tắt tab và mở lại, kiểm tra `apps/web/src/components/providers/auth-provider.tsx` xem log session có được khôi phục không.

---
**Kết luận**: Với `StudyLanguage` (Public App), flow hiện tại của Supabase là chuẩn và đáp ứng đúng nhu cầu "Lưu trữ thông tin đăng nhập mãi mãi". Bạn không cần code thêm tính năng "Remember me", nó là mặc định.
