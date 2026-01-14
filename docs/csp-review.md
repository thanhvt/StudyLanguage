# Báo Cáo Kiểm Tra CSP (Content Security Policy)

## Tổng Quan CSP Hiện Tại

| Directive | Giá Trị | Mục Đích |
|-----------|---------|----------|
| `default-src` | `'self'` | Mặc định chỉ cho phép từ cùng origin |
| `script-src` | `'self' 'unsafe-inline' 'unsafe-eval'` | Scripts (Next.js dev cần unsafe-*) |
| `style-src` | `'self' 'unsafe-inline' fonts.googleapis.com` | CSS + Google Fonts |
| `img-src` | `'self' data: blob: https:` | ✅ Đầy đủ |
| `font-src` | `'self' fonts.gstatic.com` | Google Fonts |
| `media-src` | `'self' blob: data: cdn.pixabay.com` | Audio playback |
| `connect-src` | Xem chi tiết bên dưới | API calls, WebSocket |
| `frame-ancestors` | `'none'` | Chống clickjacking |

## Các Tính Năng Đã Được Kiểm Tra

### ✅ 1. Audio Generation (Blob URL)
- **Tình trạng**: ĐÃ FIX  
- **Cần**: `media-src blob:`
- **Ghi chú**: Cho phép phát audio được sinh bởi AI

### ✅ 2. Background Music (Pixabay)
- **Tình trạng**: OK
- **Cần**: `media-src https://cdn.pixabay.com`
- **Ghi chú**: 5 bài nhạc nền từ Pixabay

### ✅ 3. Microphone Recording
- **Tình trạng**: OK
- **Cần**: `Permissions-Policy: microphone=(self)`
- **Ghi chú**: Cho Speaking feature

### ✅ 4. Dictionary Popup
- **Tình trạng**: ĐÃ FIX
- **Cần**: `connect-src https://api.dictionaryapi.dev`
- **Ghi chú**: Free Dictionary API

### ✅ 5. Supabase (Auth + Realtime)
- **Tình trạng**: OK
- **Cần**: `connect-src https://*.supabase.co wss://*.supabase.co`

### ✅ 6. Backend API
- **Tình trạng**: OK  
- **Dev**: `http://localhost:3001`
- **Prod**: `https://*.up.railway.app` + dynamic từ env

## Thay Đổi Đã Thực Hiện

```diff
- "media-src 'self' https://cdn.pixabay.com"
+ "media-src 'self' blob: data: https://cdn.pixabay.com"

- `connect-src ${connectSources}`
+ `connect-src ${connectSources} https://api.dictionaryapi.dev`
```

## Lưu Ý Khi Deploy Production

1. **Kiểm tra env `NEXT_PUBLIC_API_URL`**: Phải đúng URL backend
2. **Restart web sau khi thay đổi `next.config.ts`**
3. **Test tất cả tính năng sau deploy**
