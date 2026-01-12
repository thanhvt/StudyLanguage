# Báo cáo Khắc phục Lỗ hổng Bảo mật (Security Fix Report)

**Ngày thực hiện:** 12/01/2026
**Người thực hiện:** Antigravity Pentest Team

## 1. Tóm tắt các thay đổi

Tài liệu này mô tả các sửa đổi đã thực hiện để khắc phục các lỗ hổng bảo mật được phát hiện trong báo cáo pentest.

## 2. Các file đã thay đổi

### Backend (NestJS API)

| File | Mô tả thay đổi |
| :--- | :--- |
| `apps/api/src/main.ts` | Bật `ValidationPipe` toàn cục, cấu hình CORS động từ biến môi trường |
| `apps/api/src/auth/auth.module.ts` | **[NEW]** Tạo Auth Module |
| `apps/api/src/auth/supabase-auth.guard.ts` | **[NEW]** Tạo Guard xác thực với Supabase JWT |
| `apps/api/src/app.module.ts` | Import AuthModule |
| `apps/api/src/ai/ai.controller.ts` | Áp dụng `@UseGuards(SupabaseAuthGuard)` cho toàn bộ controller |

### Frontend (Next.js Web)

| File | Mô tả thay đổi |
| :--- | :--- |
| `apps/web/src/lib/api.ts` | **[NEW]** Tạo API client tự động gửi Supabase JWT |
| `apps/web/src/components/interactive-listening.tsx` | Thay thế `fetch()` bằng `api()` để có xác thực |

### Cấu hình

| File | Mô tả thay đổi |
| :--- | :--- |
| `.env.example` | Thêm `CORS_ORIGINS`, `NEXT_PUBLIC_API_URL`, `SUPABASE_URL` |

## 3. Chi tiết kỹ thuật

### [FIX] API-AUTH-01: Thiếu xác thực
*   **Giải pháp**: Tạo `SupabaseAuthGuard` để verify JWT token.
*   **Cơ chế**:
    1.  Frontend lấy `access_token` từ Supabase session.
    2.  Gửi kèm header `Authorization: Bearer <token>`.
    3.  Backend verify token với Supabase Auth API.
    4.  Nếu hợp lệ, gắn `user` vào `request` object.

### [FIX] API-VAL-01: Thiếu kiểm tra đầu vào
*   **Giải pháp**: Bật `ValidationPipe` toàn cục trong `main.ts`.
*   **Cấu hình**:
    ```typescript
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,           // Loại bỏ field không khai báo
        forbidNonWhitelisted: true, // Báo lỗi nếu có field lạ
        transform: true,           // Tự động convert type
      }),
    );
    ```

### [FIX] API-INFO-01: CORS hardcode
*   **Giải pháp**: Đọc `CORS_ORIGINS` từ biến môi trường.
*   **Cách dùng**: `CORS_ORIGINS=https://app.example.com,https://admin.example.com`

## 4. Yêu cầu cấu hình

Để các fix hoạt động, cần đảm bảo các biến môi trường sau được thiết lập trong `.env`:

```env
# Backend (.env trong apps/api)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CORS_ORIGINS=http://localhost:3000

# Frontend (.env.local trong apps/web)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 5. Hành động tiếp theo

> [!IMPORTANT]
> Sau khi áp dụng các thay đổi, cần **restart API server** (`pnpm dev:api`) để các fix có hiệu lực.

*   [ ] Khởi động lại server backend.
*   [ ] Test lại với script `node scripts/pentest_backend.js`.
*   [ ] Kiểm tra Frontend có thể login và gọi API thành công.
