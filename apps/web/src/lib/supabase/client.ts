import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase Browser Client
 *
 * Mục đích: Tạo Supabase client cho phía browser (React components)
 * Khi nào sử dụng: Trong Client Components để gọi Supabase APIs
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
