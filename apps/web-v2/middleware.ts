import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js Middleware - Token Refresh & Session Management
 *
 * Purpose:
 *   - Auto-refresh tokens before expiration
 *   - Propagate refreshed tokens to Server Components
 *   - Protect routes that require authentication
 *
 * Flow:
 *   1. Create Supabase client with cookie handlers
 *   2. Call getUser() to trigger token refresh if needed
 *   3. Update cookies with new token
 *   4. Redirect to login if accessing protected route without auth
 */

// Routes that require authentication
// CHANGED: Allow guest browsing - protection moved to action level (AuthActionGuard)
// const PROTECTED_ROUTES = ['/', '/listening', '/speaking', '/reading', '/history', '/settings'];
const PROTECTED_ROUTES: string[] = []; // Guest có thể xem tất cả các trang

// Routes that should redirect to home if already authenticated
const AUTH_ROUTES = ['/login'];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(route => pathname === route);
}

export async function middleware(request: NextRequest) {
  // Create response to modify cookies
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Create Supabase client with cookie handlers
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * Get all cookies from request
         */
        getAll() {
          return request.cookies.getAll();
        },
        /**
         * Set cookies for both request (Server Components) and response (Browser)
         *
         * IMPORTANT: Must set for both:
         * - request.cookies: Server Components receive new token immediately
         * - response.cookies: Browser saves new token for future requests
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

  // IMPORTANT: Don't use getSession() here!
  // getUser() will:
  // 1. Validate token with Supabase Auth server
  // 2. Auto-refresh token if about to expire
  // 3. Trigger setAll() to update cookies
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Debug log (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] Path: ${pathname}, User: ${user?.email || 'anonymous'}`);
  }

  // Redirect to login if accessing protected route without auth
  if (!user && isProtectedRoute(pathname)) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to home if accessing auth routes while authenticated
  if (user && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return supabaseResponse;
}

/**
 * Config matcher - Define which routes middleware will run on
 *
 * Exclude:
 * - _next/static: Static files
 * - _next/image: Image optimization
 * - favicon.ico: Browser icon
 * - Static files (svg, png, jpg, etc.)
 * - API routes (handled separately)
 *
 * Include: All other routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Common static file extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
