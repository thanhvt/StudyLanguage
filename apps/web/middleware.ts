import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js Middleware - Token Refresh & Session Management
 *
 * Mục đích:
 *   - Tự động refresh token trước khi hết hạn
 *   - Propagate refreshed token tới Server Components
 *   - Đảm bảo user không bị logout tự động
 *
 * Khi nào được gọi:
 *   - Mỗi request tới các route matching config.matcher
 *
 * Luồng xử lý:
 *   1. Tạo Supabase client với cookie handlers
 *   2. Gọi getUser() để trigger token refresh (nếu cần)
 *   3. Update cookies với token mới
 *   4. Pass refreshed cookies tới response
 */
export async function middleware(request: NextRequest) {
  // Tạo response để có thể modify cookies
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Tạo Supabase client với cookie handlers
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * Lấy tất cả cookies từ request
         */
        getAll() {
          return request.cookies.getAll();
        },
        /**
         * Set cookies cho cả request (Server Components) và response (Browser)
         *
         * QUAN TRỌNG: Phải set cho cả 2 để:
         * - request.cookies: Server Components nhận token mới ngay lập tức
         * - response.cookies: Browser lưu token mới cho requests sau
         */
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // QUAN TRỌNG: Không dùng getSession() ở đây!
  // getUser() sẽ:
  // 1. Validate token với Supabase Auth server
  // 2. Tự động refresh token nếu sắp hết hạn
  // 3. Trigger setAll() để update cookies
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Log để debug (có thể remove sau khi verify)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] Path: ${request.nextUrl.pathname}, User: ${user?.email || 'anonymous'}`);
  }

  // Redirect logic cho các route yêu cầu auth
  // (Optional - có thể enable nếu cần)
  // if (!user && isProtectedRoute(request.nextUrl.pathname)) {
  //   const redirectUrl = new URL('/login', request.url);
  //   redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
  //   return NextResponse.redirect(redirectUrl);
  // }

  return supabaseResponse;
}

/**
 * Config matcher - Định nghĩa routes nào middleware sẽ chạy
 *
 * Exclude:
 * - _next/static: Static files
 * - _next/image: Image optimization
 * - favicon.ico: Browser icon
 * - Các file tĩnh khác (svg, png, jpg, etc.)
 *
 * Include: Tất cả các route còn lại
 */
export const config = {
  matcher: [
    /*
     * Match tất cả request paths NGOẠI TRỪ:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Các file có extension phổ biến
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
