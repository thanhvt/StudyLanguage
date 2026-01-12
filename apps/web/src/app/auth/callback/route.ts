import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Auth Callback Route Handler
 *
 * Mục đích: Xử lý callback từ OAuth provider (Google)
 * Khi nào được gọi: Sau khi user đăng nhập Google thành công
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Đăng nhập thành công, redirect về trang chính
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Có lỗi, redirect về trang lỗi
  return NextResponse.redirect(`${origin}/auth/error`);
}
