import { createClient } from '@/lib/supabase/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Lấy access token mới nhất từ Supabase session
 *
 * Mục đích: Đảm bảo luôn dùng token mới nhất, đặc biệt sau khi refresh
 * Tham số đầu ra: access_token hoặc null
 */
async function getAccessToken(): Promise<string | null> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

/**
 * Refresh session và lấy token mới
 *
 * Mục đích: Force refresh khi gặp 401
 * Tham số đầu ra: access_token mới hoặc null
 */
async function refreshAndGetToken(): Promise<string | null> {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.refreshSession();
  
  if (error) {
    console.warn('[API] Không thể refresh session:', error.message);
    return null;
  }
  
  return session?.access_token ?? null;
}

/**
 * api - Hàm gọi API có xác thực với retry logic
 *
 * Mục đích: Tự động lấy token từ Supabase và gửi kèm request
 *           Nếu gặp 401, sẽ thử refresh token và gọi lại
 * Tham số đầu vào:
 *   - endpoint: Đường dẫn API (ví dụ: '/ai/generate-text')
 *   - options: Tùy chọn fetch (method, body, headers, ...)
 *   - _isRetry: Internal flag, không dùng trực tiếp
 * Tham số đầu ra: Promise<Response>
 * Khi nào sử dụng: Thay thế fetch thông thường khi gọi Backend API
 */
export async function api(
  endpoint: string,
  options: RequestInit = {},
  _isRetry = false
): Promise<Response> {
  // Lấy token mới nhất
  const token = await getAccessToken();

  // Chuẩn bị headers
  const headers = new Headers(options.headers);

  // Thêm Authorization nếu đã đăng nhập
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
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

  // Xử lý 401 - thử refresh token và retry 1 lần
  if (response.status === 401 && !_isRetry) {
    console.warn('[API] Token hết hạn, đang thử refresh...');
    
    const newToken = await refreshAndGetToken();
    
    if (newToken) {
      console.log('[API] Refresh thành công, đang retry request...');
      return api(endpoint, options, true); // Retry với flag
    }
    
    console.error('[API] Refresh thất bại, user cần đăng nhập lại');
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

