# Deployment Guide - AI Learning App

## 📦 Deployment Overview

| Platform | Service | URL Pattern |
|----------|---------|-------------|
| **Vercel** | Web Frontend (Next.js) | `https://your-app.vercel.app` |
| **Railway** | Backend API (NestJS) | `https://your-api.railway.app` |
| **Supabase** | Database + Auth + Storage | `https://your-project.supabase.co` |

---

---

## 🚀 Step 1: Deploy Web (Legacy v1) to Vercel

### 1.1 Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import GitHub repository: `thanhvt/StudyLanguage`
3. Select "apps/web" as root directory

### 1.2 Configure Environment Variables
Add these in Vercel dashboard → Settings → Environment Variables:

| Variable | Example Value |
|----------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` |
| `NEXT_PUBLIC_API_URL` | `https://your-api.railway.app/api` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

### 1.3 Deploy
```bash
# Vercel will auto-deploy on push to main
git push origin main
```

---

## 🚀 Step 1b: Deploy Web V2 (New Version) to Vercel

### 1b.1 Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import GitHub repository: `thanhvt/StudyLanguage`
3. **IMPORTANT**: Select `apps/web-v2` as the **Root Directory**.
4. Framework Preset: `Next.js` (should be auto-detected).

### 1b.2 Configure Environment Variables
These are the same as v1, but must be set for the new project:

| Variable | Example Value |
|----------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` |
| `NEXT_PUBLIC_API_URL` | `https://your-api.railway.app/api` |
| `NEXT_PUBLIC_APP_URL` | `https://your-web-v2-app.vercel.app` |

### 1b.3 Deploy
```bash
# Vercel will auto-deploy on push to main
git push origin main
```

---

## 🚂 Step 2: Deploy API to Railway

### 2.1 Connect Repository
1. Go to [Railway Dashboard](https://railway.app/new)
2. Select "Deploy from GitHub repo"
3. Choose `thanhvt/StudyLanguage`

### 2.2 Configure Environment Variables

| Variable | Example Value |
|----------|---------------|
| `OPENAI_API_KEY` | `sk-...` |
| `SUPABASE_URL` | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` |
| `CORS_ORIGINS` | `https://your-app.vercel.app` |
| `NODE_ENV` | `production` |
| `PORT` | `3001` (hoặc để Railway assign) |

### 2.3 Configure Build
Railway sẽ đọc `railway.json`:
- Build command: `cd apps/api && pnpm install && pnpm build`
- Start command: `cd apps/api && node dist/main.js`

### 2.4 Health Check
API có endpoint `/api/health` cho monitoring:
```json
{ "status": "ok", "timestamp": "...", "version": "1.0.0" }
```

---

## 🔐 Step 3: Configure Supabase

### 3.1 Enable Row Level Security
Run migration trong Supabase SQL Editor:
```sql
-- File: supabase/migrations/003_rls_policies.sql
-- Bật RLS và tạo policies cho tất cả bảng
```

### 3.2 Update OAuth Redirect URLs
1. Supabase Dashboard → Authentication → URL Configuration
2. Add Site URL: `https://your-app.vercel.app`
3. Add Redirect URLs: `https://your-app.vercel.app/auth/callback`

### 3.3 Enable Storage Buckets
1. Supabase Dashboard → Storage
2. Ensure `audio-lessons` bucket exists
3. Policies should allow authenticated uploads

### 3.4 Enable Backups
1. Supabase Dashboard → Database → Backups
2. Enable Point-in-Time Recovery (PITR) - Pro plan
3. Or enable daily backups

---

## ✅ Step 4: Verification Checklist

### Web (Vercel)
- [ ] Homepage loads with gradient mesh background
- [ ] Google Login works
- [ ] Theme switcher saves preference
- [ ] All 4 skill pages accessible

### API (Railway)
- [ ] Health check returns 200: `GET /api/health`
- [ ] AI endpoints work with auth
- [ ] CORS allows requests from Vercel URL

### Supabase
- [ ] RLS policies active on all tables
- [ ] OAuth redirect works
- [ ] Storage upload works

---

## 🔍 Troubleshooting

### CORS Errors
```bash
# Ensure CORS_ORIGINS includes your Vercel URL
CORS_ORIGINS=https://your-app.vercel.app,https://custom-domain.com
```

### Auth Failures
1. Check Supabase URL Configuration
2. Verify Google OAuth credentials in Supabase
3. Check redirect URL matches exactly

### Build Failures
```bash
# Local test before deploy
cd apps/web && pnpm build
cd apps/api && pnpm build
```

---

## 📊 Post-Deployment

1. **Monitor Vercel**: Analytics tab for Web Vitals
2. **Monitor Railway**: Observability tab for logs
3. **Monitor Supabase**: Database → Logs for queries

---

*Last updated: January 2026*
