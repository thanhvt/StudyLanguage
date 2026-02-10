import axios from 'axios';
import Config from 'react-native-config';
import {supabase} from '@/services/supabase/client';

const API_URL = Config.API_URL ?? 'http://localhost:3001/api';

/**
 * Mục đích: Axios client được cấu hình sẵn để gọi NestJS Backend API
 * Tham số đầu vào: không có (singleton)
 * Tham số đầu ra: AxiosInstance
 * Khi nào sử dụng: Mọi API call tới backend (listening, speaking, reading...)
 *   - services/api/listening.ts
 *   - services/api/speaking.ts
 *   - services/api/reading.ts
 *
 * Tự động:
 *   - Gắn Authorization header từ Supabase session
 *   - Refresh token khi nhận 401
 *   - Timeout 30 giây
 */
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tự động gắn access token vào mỗi request
apiClient.interceptors.request.use(
  async config => {
    const {
      data: {session},
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Interceptor: Xử lý lỗi 401 (token hết hạn) → refresh + retry
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa retry → thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const {
          data: {session},
        } = await supabase.auth.refreshSession();

        if (session?.access_token) {
          originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Không thể refresh token:', refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export {apiClient};
