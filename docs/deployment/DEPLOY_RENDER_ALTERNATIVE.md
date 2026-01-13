# 🚀 Deploy API lên Render (Thay thế Railway - FREE)

> **Tài liệu này** hướng dẫn deploy NestJS API lên Render.com như một alternative miễn phí cho Railway.

---

## 📋 So sánh Render vs Railway

| Tiêu chí | Render (Free) | Railway |
|----------|---------------|---------|
| **Giá** | ✅ FREE | $5/tháng sau trial |
| **Auto-deploy** | ✅ Có | ✅ Có |
| **Cold start** | ⚠️ ~30s | ✅ Không |
| **Sleep** | Sau 15 phút | Không |
| **Phù hợp** | Dev/Demo | Production |

> ⚠️ **Lưu ý**: Free tier của Render sẽ "ngủ" sau 15 phút không có request. Request đầu tiên sau khi ngủ sẽ mất ~30s để khởi động lại.

---

## 🔵 Step 1: Tạo tài khoản Render

1. Truy cập [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Đăng ký bằng **GitHub** (recommend để dễ connect repo)

---

## 🟢 Step 2: Tạo Web Service

1. Sau khi đăng nhập, click **"New +"** → **"Web Service"**
2. Chọn **"Build and deploy from a Git repository"**
3. Click **"Connect"** để link GitHub account (nếu chưa)
4. Tìm và chọn repo: `thanhvt/StudyLanguage`
5. Click **"Connect"**

---

## 🟡 Step 3: Cấu hình Service

Điền thông tin như sau:

| Field | Giá trị |
|-------|---------|
| **Name** | `studylanguage-api` |
| **Region** | `Singapore (Southeast Asia)` |
| **Branch** | `main` |
| **Root Directory** | `apps/api` |
| **Runtime** | `Node` |
| **Build Command** | `pnpm install && pnpm build` |
| **Start Command** | `node dist/main.js` |
| **Instance Type** | `Free` |

---

## 🟣 Step 4: Thêm Environment Variables

Scroll xuống phần **"Environment Variables"** → Click **"Add Environment Variable"**:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | `https://xxxxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` |
| `OPENAI_API_KEY` | `sk-...` |
| `CORS_ORIGINS` | `https://your-app.vercel.app` |
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `LOG_LEVEL` | `info` |

> ⚠️ **PORT trên Render**: Render tự động assign port qua biến `PORT`. Mặc định là `10000`, nhưng bạn có thể để trống và dùng `process.env.PORT`.

---

## 🔴 Step 5: Deploy

1. Click **"Create Web Service"**
2. Render sẽ bắt đầu build và deploy
3. Theo dõi logs trong tab **"Logs"**
4. Đợi đến khi thấy **"Your service is live"**

---

## ✅ Step 6: Lấy URL và Test

1. Sau khi deploy thành công, URL sẽ hiện ở đầu trang:
   ```
   https://studylanguage-api.onrender.com
   ```

2. Test health check:
   ```bash
   curl https://studylanguage-api.onrender.com/api/health
   ```

3. Kết quả mong đợi:
   ```json
   {"status": "ok", "timestamp": "...", "version": "1.0.0"}
   ```

---

## 🔄 Step 7: Update Vercel

Quay lại **Vercel Dashboard** và update biến:

| Key | Value mới |
|-----|-----------|
| `NEXT_PUBLIC_API_URL` | `https://studylanguage-api.onrender.com/api` |

Sau đó **Redeploy** Vercel.

---

## 🔄 Step 8: Update CORS trên Render

Sau khi biết URL Vercel, quay lại Render:

1. Vào **Dashboard** → chọn service `studylanguage-api`
2. Vào tab **"Environment"**
3. Update `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://study-language-web-hhd7.vercel.app
   ```
4. Render sẽ tự động redeploy

---

## 🔧 Troubleshooting

### 1. Build failed - pnpm not found
Thêm vào **Build Command**:
```bash
npm install -g pnpm && pnpm install && pnpm build
```

### 2. Cold start chậm
Đây là hạn chế của Free tier. Có 2 cách giảm thiểu:
- Dùng service như [cron-job.org](https://cron-job.org) để ping API mỗi 14 phút
- Upgrade lên paid tier ($7/tháng)

### 3. Port Error
Đảm bảo code NestJS đọc port từ env:
```typescript
// main.ts
const port = process.env.PORT || 3001;
await app.listen(port, '0.0.0.0');
```

---

## 📊 Monitoring

- **Logs**: Dashboard → Service → Logs tab
- **Metrics**: Dashboard → Service → Metrics tab
- **Events**: Dashboard → Service → Events tab

---

## 🔗 Links hữu ích

- [Render Dashboard](https://dashboard.render.com)
- [Render Docs - Node.js](https://render.com/docs/deploy-node-express-app)
- [Render Status Page](https://status.render.com)

---

*Tài liệu cập nhật: Tháng 1/2026*
