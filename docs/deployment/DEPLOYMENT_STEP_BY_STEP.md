# 🚀 Hướng Dẫn Deploy Chi Tiết - Step by Step

> **Tài liệu này** hướng dẫn chi tiết từng bước deploy ứng dụng **StudyLanguage** lên production.
> 
> **Thời gian ước tính**: 1-2 giờ (lần đầu tiên)

---

## 📋 Tổng Quan

| Thành phần | Platform | Mục đích |
|------------|----------|----------|
| **Web** (Next.js) | Vercel | Giao diện người dùng |
| **API** (NestJS) | Railway | Backend xử lý logic |
| **Database** | Supabase | Lưu trữ dữ liệu + Auth |
| **Mobile** | *(Chưa xử lý)* | App di động |

---

## 📌 Yêu Cầu Trước Khi Bắt Đầu

### Tài khoản cần có:
- [ ] **GitHub** - để lưu trữ source code
- [ ] **Vercel** - đăng ký tại [vercel.com](https://vercel.com)
- [ ] **Railway** - đăng ký tại [railway.app](https://railway.app)
- [ ] **Supabase** - đăng ký tại [supabase.com](https://supabase.com)
- [ ] **OpenAI** - lấy API key tại [platform.openai.com](https://platform.openai.com)

### Thông tin cần chuẩn bị:
```
📝 Ghi lại những thông tin sau khi tạo:

SUPABASE_URL = 
SUPABASE_ANON_KEY = 
SUPABASE_SERVICE_ROLE_KEY = 
OPENAI_API_KEY = 
VERCEL_URL = 
RAILWAY_URL = 
```

---

# 🔵 PHASE 1: SETUP SUPABASE (Database)

> ⏱️ Thời gian: ~20 phút

## Step 1.1: Tạo Project Supabase

1. Truy cập [app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Điền thông tin:
   - **Name**: `studylanguage` (hoặc tên bạn muốn)
   - **Database Password**: tạo password mạnh (QUAN TRỌNG: lưu lại!)
   - **Region**: `Southeast Asia (Singapore)` - gần Việt Nam nhất
4. Click **"Create new project"**
5. Đợi 2-3 phút để Supabase khởi tạo

## Step 1.2: Lấy API Keys

1. Sau khi project được tạo, vào **Settings** → **API**
2. Copy các giá trị sau:

```
Project URL:             https://xxxxxx.supabase.co
anon (public) key:       eyJhbGci... (dài ~200 ký tự)
service_role key:        eyJhbGci... (dài ~200 ký tự)
```

> ⚠️ **CẢNH BÁO**: `service_role key` là secret, KHÔNG được commit lên git!

## Step 1.3: Chạy Database Migrations

Vào **SQL Editor** trong Supabase Dashboard và chạy từng file migration theo thứ tự:

### Migration 1: Initial Schema
```sql
-- Copy nội dung từ file: supabase/migrations/001_initial_schema.sql
-- Paste vào SQL Editor và Run
```

### Migration 2: Storage Buckets
```sql
-- Copy nội dung từ file: supabase/migrations/002_storage_buckets.sql
-- Paste vào SQL Editor và Run
```

### Migration 3: Logging Schema
```sql
-- Copy nội dung từ file: supabase/migrations/003_logging_schema.sql
-- Paste vào SQL Editor và Run
```

### Migration 4: RLS Policies
```sql
-- Copy nội dung từ file: supabase/migrations/003_rls_policies.sql
-- Paste vào SQL Editor và Run
```

### Migration 5: Enhance Logging
```sql
-- Copy nội dung từ file: supabase/migrations/004_enhance_logging_schema.sql
-- Paste vào SQL Editor và Run
```

### Migration 6: History Feature
```sql
-- Copy nội dung từ file: supabase/migrations/005_history_feature.sql
-- Paste vào SQL Editor và Run
```

## Step 1.4: Cấu hình Google OAuth

1. Vào **Authentication** → **Providers** → **Google**
2. Bật **Enable Sign in with Google**
3. Điền **Client ID** và **Client Secret** từ Google Cloud Console

> 📚 **Hướng dẫn lấy Google OAuth credentials**:
> - Vào [Google Cloud Console](https://console.cloud.google.com)
> - Tạo project mới hoặc chọn project có sẵn
> - Vào **APIs & Services** → **Credentials**
> - Tạo **OAuth 2.0 Client ID**
> - Chọn **Web application**
> - Thêm **Authorized redirect URIs**: `https://xxxxxx.supabase.co/auth/v1/callback`

## Step 1.5: Cấu hình Storage

1. Vào **Storage** → Kiểm tra bucket `audio-lessons` đã được tạo
2. Nếu chưa có, tạo bucket mới:
   - Name: `audio-lessons`
   - Public: **ON** (hoặc theo nhu cầu)

---

# 🟢 PHASE 2: DEPLOY API LÊN RAILWAY (Backend)

> ⏱️ Thời gian: ~15 phút

## Step 2.1: Push Code lên GitHub

Đảm bảo code mới nhất đã được push:

```bash
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

## Step 2.2: Tạo Project Railway

1. Truy cập [railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub repo"**
3. Chọn repository: `thanhvt/StudyLanguage`
4. Railway sẽ phát hiện `railway.json` và tự động cấu hình

## Step 2.3: Cấu hình Environment Variables

Vào project Railway → **Variables** tab → Add các biến sau:

```env
# Supabase
SUPABASE_URL=https://xxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# OpenAI
OPENAI_API_KEY=sk-...

# CORS (sẽ update sau khi có URL Vercel)
CORS_ORIGINS=https://studylanguage.vercel.app

# Server
NODE_ENV=production
PORT=3001

# Logging
LOG_LEVEL=info
```

## Step 2.4: Xác nhận Build Settings

Railway đọc `railway.json`, đảm bảo settings như sau:
- **Build Command**: `cd apps/api && pnpm install && pnpm build`
- **Start Command**: `cd apps/api && node dist/main.js`
- **Health Check**: `/api/health`

## Step 2.5: Deploy

1. Railway sẽ tự động deploy khi detect changes
2. Theo dõi logs trong **Deployments** tab
3. Đợi đến khi status thành **"Success"**

## Step 2.6: Lấy Railway URL

Sau khi deploy thành công:
1. Vào **Settings** → **Networking** → **Generate Domain**
2. Copy URL (ví dụ: `https://studylanguage-api-production.up.railway.app`)

## Step 2.7: Verify API

Test bằng browser hoặc curl:

```bash
curl https://YOUR-RAILWAY-URL/api/health
```

Kết quả mong đợi:
```json
{
  "status": "ok",
  "timestamp": "2026-01-13T...",
  "version": "1.0.0"
}
```

---

# 🟣 PHASE 3: DEPLOY WEB LÊN VERCEL (Frontend)

> ⏱️ Thời gian: ~15 phút

## Step 3.1: Import Project vào Vercel

1. Truy cập [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Chọn repository: `thanhvt/StudyLanguage`

## Step 3.2: Cấu hình Project

1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: Click **"Edit"** → nhập `apps/web`
3. **Build Command**: `pnpm build` (hoặc để mặc định)
4. **Output Directory**: `.next` (mặc định)

## Step 3.3: Thêm Environment Variables

Click **"Environment Variables"** và thêm:

```env
# Supabase (NEXT_PUBLIC_ prefix cho client-side)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# API URL (Railway URL từ Phase 2)
NEXT_PUBLIC_API_URL=https://YOUR-RAILWAY-URL/api

# App URL (sẽ biết sau khi deploy)
NEXT_PUBLIC_APP_URL=https://studylanguage.vercel.app
```

## Step 3.4: Deploy

1. Click **"Deploy"**
2. Đợi build hoàn thành (~3-5 phút)
3. Sau khi thành công, bạn sẽ có URL: `https://studylanguage.vercel.app`

## Step 3.5: Update CORS trên Railway

**QUAN TRỌNG**: Quay lại Railway và update biến `CORS_ORIGINS`:

```env
CORS_ORIGINS=https://studylanguage.vercel.app
```

Railway sẽ auto-redeploy sau khi thay đổi.

---

# 🔐 PHASE 4: CẤU HÌNH SUPABASE REDIRECTS

> ⏱️ Thời gian: ~5 phút

## Step 4.1: Update URL Configuration

Vào Supabase Dashboard → **Authentication** → **URL Configuration**:

1. **Site URL**: `https://studylanguage.vercel.app`
2. **Redirect URLs**: Add các URL sau:
   - `https://studylanguage.vercel.app/auth/callback`
   - `https://studylanguage.vercel.app/`

## Step 4.2: Update Google OAuth Redirect

Vào Google Cloud Console → **Credentials** → OAuth 2.0 Client:

1. Add **Authorized JavaScript origins**:
   - `https://studylanguage.vercel.app`

2. Add **Authorized redirect URIs**:
   - `https://xxxxxx.supabase.co/auth/v1/callback`

---

# ✅ PHASE 5: KIỂM TRA TOÀN DIỆN

> ⏱️ Thời gian: ~15 phút

## Checklist Web (Vercel)

| Test | URL/Action | Kết quả mong đợi |
|------|------------|------------------|
| [ ] Homepage | Truy cập URL chính | Hiện trang chủ với gradient background |
| [ ] Google Login | Click nút Login | Redirect đến Google, login thành công |
| [ ] Theme Switcher | Đổi Light/Dark | Theme được lưu và áp dụng |
| [ ] Listening Page | Vào `/listening` | Trang load, có thể tương tác |
| [ ] Speaking Page | Vào `/speaking` | Trang load, có thể tương tác |
| [ ] Reading Page | Vào `/reading` | Trang load, có thể tương tác |
| [ ] Writing Page | Vào `/writing` | Trang load, có thể tương tác |

## Checklist API (Railway)

| Test | URL/Action | Kết quả mong đợi |
|------|------------|------------------|
| [ ] Health Check | `GET /api/health` | Response `{"status": "ok"}` |
| [ ] AI Endpoint | Gọi từ Frontend | Không lỗi 401/403/500 |
| [ ] CORS | Request từ Vercel | Không có CORS error |

## Checklist Supabase

| Test | Check | Kết quả mong đợi |
|------|-------|------------------|
| [ ] RLS Policies | Table Editor → Policies | Đã enable RLS trên tất cả bảng |
| [ ] OAuth Working | Login từ Web | User được tạo trong `auth.users` |
| [ ] Storage Working | Upload audio | File lưu vào bucket thành công |

---

# 🔧 TROUBLESHOOTING

## Lỗi thường gặp

### 1. CORS Error
```
Access to fetch blocked by CORS policy
```
**Giải pháp**:
```env
# Railway - thêm tất cả domain cần thiết
CORS_ORIGINS=https://studylanguage.vercel.app,https://custom-domain.com
```

### 2. 401 Unauthorized
```
{"error": "Thiếu token xác thực"}
```
**Giải pháp**:
- Kiểm tra `NEXT_PUBLIC_SUPABASE_ANON_KEY` đúng chưa
- Kiểm tra session có được gửi kèm request không
- Check Supabase Dashboard → Logs → Auth Logs

### 3. Build Failed trên Vercel
```
Build error: Cannot find module...
```
**Giải pháp**:
```bash
# Chạy build local trước
cd apps/web && pnpm install && pnpm build
```

### 4. Build Failed trên Railway
```
Error: Cannot find module...
```
**Giải pháp**:
```bash
# Chạy build local trước
cd apps/api && pnpm install && pnpm build
```

---

# 📊 MONITORING SAU DEPLOY

## Vercel Analytics
- Vào Vercel Dashboard → Project → **Analytics**
- Xem Web Vitals (LCP, FID, CLS)

## Railway Logs
- Vào Railway Dashboard → Project → **Deployments** → **Logs**
- Filter theo level: `error`, `warn`, `info`

## Supabase Monitoring
- **API Logs**: Dashboard → Database → Logs
- **Auth Logs**: Dashboard → Authentication → Logs
- **Storage Logs**: Dashboard → Storage → Logs

---

# 📝 QUICK REFERENCE

## URLs Sau Deploy

| Component | URL |
|-----------|-----|
| Web App | `https://studylanguage.vercel.app` |
| API | `https://studylanguage-api.railway.app/api` |
| API Health | `https://studylanguage-api.railway.app/api/health` |
| Supabase | `https://xxxxxx.supabase.co` |

## Environment Variables Summary

### Vercel (Web)
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_URL=
```

### Railway (API)
```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
CORS_ORIGINS=
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
```

---

*Tài liệu cập nhật: Tháng 1/2026*
*Nếu có thắc mắc, liên hệ team DevOps hoặc tạo issue trên GitHub.*

---

## 🔄 Alternative: Deploy miễn phí trên Render

Railway có phí sau trial period. Nếu muốn **FREE 100%**, xem hướng dẫn:

📄 **[DEPLOY_RENDER_ALTERNATIVE.md](./DEPLOY_RENDER_ALTERNATIVE.md)** - Hướng dẫn deploy API lên Render.com

