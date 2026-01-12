# MASTER TEST PLAN: STUDY LANGUAGE APP

**Project:** StudyLanguage (AI-Powered English Learning)
**Version:** 1.0
**Date:** 12/01/2026
**Author:** Antigravity (AI Test Lead)

---

## 1. GIỚI THIỆU (INTRODUCTION)

### 1.1 Mục đích
Tài liệu này quy định chiến lược kiểm thử (Testing Strategy) cho dự án StudyLanguage, đảm bảo chất lượng từ code đến trải nghiệm người dùng cuối.

### 1.2 Phạm vi (Scope)
Kiểm thử bao gồm:
*   **Web App** (Next.js)
*   **Mobile App** (React Native/Expo)
*   **Backend Logic** (NestJS)
*   **Integrations** (Supabase Auth/DB, OpenAI API)

---

## 2. CHIẾN LƯỢC KIỂM THỬ (TEST STRATEGY)

Chúng ta sẽ áp dụng mô hình **Tháp kiểm thử (Testing Pyramid)** kết hợp với các phương pháp kiểm thử chuyên sâu cho AI và Mobile.

### 2.1 Các cấp độ kiểm thử (Levels of Testing)

1.  **Unit Testing (Kiểm thử đơn vị):**
    *   *Mục tiêu:* Kiểm tra tính đúng đắn của từng hàm, component, hook riêng lẻ.
    *   *Phạm vi:* Utilities, Helpers, Hooks, API Services, UI Components (Button, Card).
    *   *Công cụ:* Jest, React Testing Library.

2.  **Integration Testing (Kiểm thử tích hợp - SIT):**
    *   *Mục tiêu:* Kiểm tra sự giao tiếp giữa các module (FE <-> BE, BE <-> OpenAI, App <-> Supabase).
    *   *Phạm vi:* Authentication flow, API calls, Data synchronization.

3.  **System Testing (Kiểm thử hệ thống - E2E/Smoke):**
    *   *Mục tiêu:* Kiểm tra toàn bộ luồng nghiệp vụ của người dùng từ đầu đến cuối.
    *   *Phạm vi:* Đăng ký -> Học bài Listening -> Xem kết quả -> Lưu lịch sử.
    *   *Công cụ:* Cypress (Web), Detox/Maestro (Mobile).

### 2.2 Các loại kiểm thử chuyên biệt (Specialized Testing)

1.  **Smoke Testing (Kiểm thử khói):**
    *   Test nhanh các chức năng cốt lõi nhất sau mỗi lần deploy để đảm bảo app "chưa sập".
    *   VD: Login thành công, Mở bài học không crash.

2.  **Mock Testing:**
    *   Giả lập (Mock) các phản hồi từ OpenAI và Supabase để test logic app mà không tốn tiền API thật và không phụ thuộc mạng.

3.  **Monkey Testing (Kiểm thử ngẫu nhiên):**
    *   Thực hiện các thao tác ngẫu nhiên, điên cuồng (tap, swipe loạn xạ) để tìm crash và lỗi UX.

4.  **Sandbox Testing:**
    *   Môi trường cô lập để test các tính năng nguy hiểm (VD: Delete account, Payment) hoặc tính năng AI mới chưa ổn định.

---

## 3. CẤU TRÚC TÀI LIỆU TEST (DOCUMENTATION STRUCTURE)

Toàn bộ test case sẽ được lưu trữ tại `docs/tests/` với cấu trúc sau:

1.  `docs/tests/01_unit_tests.md`: Các case unit test chi tiết cho Dev.
2.  `docs/tests/02_smoke_tests.md`: Checklist kiểm tra nhanh sức khỏe hệ thống.
3.  `docs/tests/03_integration_tests.md`: Test case tích hợp các module.
4.  `docs/tests/04_specialized_tests.md`: (Mock, Monkey, Sandbox).

---

## 4. MÔI TRƯỜNG TEST (TEST ENVIRONMENT)

*   **Local:** Máy developer, chạy mock server.
*   **Staging:** Môi trường giống Production nhất, kết nối Supabase Staging.
*   **Production:** Môi trường thật (hạn chế test, chỉ dùng Smoke Test).

---

## 5. TIÊU CHÍ CHẤP NHẬN (ACCEPTANCE CRITERIA)

*   **High Priority Bugs:** 0 (Không được phép tồn tại lỗi nghiêm trọng làm crash app hoặc mất dữ liệu).
*   **Unit Test Coverage:** > 80% cho các core logic.
*   **Performance:**
    *   App khởi động < 2s.
    *   AI response (hoặc feedback) hiển thị trạng thái loading rõ ràng.
