import { createClient } from '@/lib/supabase/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * api - Hàm gọi API có xác thực
 *
 * Mục đích: Tự động lấy token từ Supabase và gửi kèm request
 * Tham số đầu vào:
 *   - endpoint: Đường dẫn API (ví dụ: '/ai/generate-text')
 *   - options: Tùy chọn fetch (method, body, headers, ...)
 * Tham số đầu ra: Promise<Response>
 * Khi nào sử dụng: Thay thế fetch thông thường khi gọi Backend API
 */
export async function api(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const supabase = createClient();

  // Lấy session hiện tại
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Chuẩn bị headers
  const headers = new Headers(options.headers);

  // Thêm Authorization nếu đã đăng nhập
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  // Thêm Content-Type mặc định nếu chưa có
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`[API] Gọi ${options.method || 'GET'} ${url}`);

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Log nếu lỗi auth
  if (response.status === 401) {
    console.warn('[API] Lỗi 401: Token không hợp lệ hoặc đã hết hạn');
  }

  return response;
}

/**
 * apiJson - Gọi API và parse JSON
 *
 * Mục đích: Shorthand để gọi API và lấy kết quả JSON
 * Tham số đầu vào: Tương tự api()
 * Tham số đầu ra: Promise<T>
 * Khi nào sử dụng: Khi cần kết quả dạng object/array
 */
export async function apiJson<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await api(endpoint, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  return response.json() as Promise<T>;
}
