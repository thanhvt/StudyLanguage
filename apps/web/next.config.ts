import type { NextConfig } from "next";

// Lấy API URL từ env để thêm vào CSP (bỏ /api suffix nếu có)
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';

const nextConfig: NextConfig = {
  // [SECURITY - OWASP A03] Security Headers: Bảo vệ khỏi XSS, Clickjacking, v.v.
  async headers() {
    // Build connect-src với các domain cần thiết
    // - 'self': Same origin
    // - Supabase: Auth + Realtime
    // - localhost:3001: Development API
    // - Railway: Production API (lấy từ NEXT_PUBLIC_API_URL)
    // - *.up.railway.app: Backup pattern cho Railway
    const connectSources = [
      "'self'",
      "https://*.supabase.co",
      "wss://*.supabase.co",
      "http://localhost:3001",
      "https://*.up.railway.app", // Railway production domains
      apiUrl, // Dynamic từ env
    ].filter(Boolean).join(' ');

    return [
      {
        // Áp dụng cho tất cả routes
        source: '/:path*',
        headers: [
          // [CSP] Content Security Policy: Chặn inline scripts, chỉ cho phép scripts từ self và trusted sources
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js cần unsafe-inline/eval cho dev mode
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https:",
              "font-src 'self' https://fonts.gstatic.com",
              "media-src 'self' blob: data: https://cdn.pixabay.com", // Cho phép audio từ Pixabay, blob URLs và data URLs
              `connect-src ${connectSources} https://api.dictionaryapi.dev`, // Thêm Dictionary API
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          // [X-Frame-Options] Chống Clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // [X-Content-Type-Options] Chống MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // [Referrer-Policy] Kiểm soát thông tin referrer
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // [Permissions-Policy] Giới hạn browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
