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
  
  // Kiểm tra session hiện tại trước khi refresh
  // Nếu không có session → user chưa login, không cần spam refresh
  const { data: { session: currentSession } } = await supabase.auth.getSession();
  if (!currentSession) {
    console.debug('[API] Chưa đăng nhập, bỏ qua refresh session');
    return null;
  }
  
  const { data: { session }, error } = await supabase.auth.refreshSession();
  
  if (error) {
    // Chỉ log warning nếu có session mà refresh thất bại
    console.warn('[API] Refresh session thất bại:', error.message);
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
 *   - timeoutMs: Thời gian timeout (ms), mặc định 60s. Tăng lên cho các request sinh audio
 *   - _isRetry: Internal flag, không dùng trực tiếp
 * Tham số đầu ra: Promise<Response>
 * Khi nào sử dụng: Thay thế fetch thông thường khi gọi Backend API
 */
export async function api(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 60000,
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

  // Tạo AbortController với timeout tùy chỉnh
  // Mobile Safari có thể tự kill request sớm, nên xử lý timeout rõ ràng
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.warn(`[API] Request timeout sau ${timeoutMs / 1000} giây`);
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Xử lý 401 - thử refresh token và retry 1 lần
    if (response.status === 401 && !_isRetry) {
      console.warn('[API] Token hết hạn, đang thử refresh...');
      
      const newToken = await refreshAndGetToken();
      
      if (newToken) {
        console.log('[API] Refresh thành công, đang retry request...');
        return api(endpoint, options, timeoutMs, true); // Retry với flag và giữ timeout
      }
      
      console.error('[API] Refresh thất bại, user cần đăng nhập lại');
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Xử lý lỗi network cụ thể cho mobile
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('[API] Request bị hủy (timeout hoặc user cancel)');
        throw new Error('Kết nối bị timeout. Vui lòng thử lại.');
      }
      if (error.message === 'Load failed' || error.message === 'Failed to fetch') {
        console.error('[API] Lỗi kết nối mạng:', error.message);
        throw new Error('Lỗi kết nối. Kiểm tra mạng và thử lại.');
      }
    }
    throw error;
  }
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

