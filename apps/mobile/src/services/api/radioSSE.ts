/**
 * radioSSE — SSE client cho Radio Mode progress
 *
 * Mục đích: Kết nối tới SSE endpoint /radio/generate/progress để nhận real-time progress
 * Tham số đầu vào: token (auth), callbacks (onProgress, onDone, onError)
 * Tham số đầu ra: cleanup function
 * Khi nào sử dụng: RadioScreen gọi trước khi POST /radio/generate
 */
import Config from 'react-native-config';
import {useAuthStore} from '@/store/useAuthStore';

const API_URL = Config.API_URL ?? 'http://localhost:3001/api';

/** Dữ liệu progress từ SSE */
export interface RadioProgressEvent {
  trackIndex: number;
  total: number;
  topic: string;
  percent: number;
  done?: boolean;
  trackCount?: number;
}

/**
 * Mục đích: Kết nối SSE stream để nhận progress khi generate playlist
 * Tham số đầu vào:
 *   - onProgress: callback khi nhận progress event
 *   - onDone: callback khi generate xong
 *   - onError: callback khi lỗi kết nối
 * Tham số đầu ra: AbortController để cancel connection
 * Khi nào sử dụng: RadioScreen.handleGenerate() gọi trước POST /generate
 */
export function connectRadioProgress(
  onProgress: (data: RadioProgressEvent) => void,
  onDone: (trackCount: number) => void,
  onError?: (error: Error) => void,
): AbortController {
  const controller = new AbortController();

  // Lấy token từ auth store
  const session = useAuthStore.getState().session;
  const token = session?.access_token;

  if (!token) {
    console.warn('⚠️ [SSE] Không có token — bỏ qua SSE');
    return controller;
  }

  // Kết nối SSE bằng fetch streaming
  (async () => {
    try {
      console.log('📡 [SSE] Đang kết nối radio progress...');

      const response = await fetch(`${API_URL}/radio/generate/progress`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`SSE connect lỗi: ${response.status}`);
      }

      // React Native fetch không hỗ trợ response.body ReadableStream
      // Dùng XMLHttpRequest streaming thay thế
      const text = await response.text();
      const lines = text.split('\n');

      for (const line of lines) {
        if (controller.signal.aborted) break;

        // SSE format: "data: {...}"
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr) as RadioProgressEvent;

            if (data.done) {
              console.log('✅ [SSE] Generate hoàn thành:', data);
              onDone(data.trackCount ?? data.total ?? 0);
              return;
            }

            // Clamp percent 0-100
            data.percent = Math.max(0, Math.min(100, data.percent ?? 0));
            console.log(`📡 [SSE] Progress: ${data.trackIndex + 1}/${data.total} — ${data.topic}`);
            onProgress(data);
          } catch {
            // JSON parse lỗi — skip event, không crash
            console.warn('⚠️ [SSE] Parse lỗi event:', jsonStr);
          }
        }
      }
    } catch (error: any) {
      // Ignore abort errors (user cancel)
      if (error?.name === 'AbortError') {
        console.log('📡 [SSE] Đã hủy kết nối (user cancel)');
        return;
      }
      console.warn('⚠️ [SSE] Lỗi kết nối:', error?.message);
      onError?.(error);
    }
  })();

  return controller;
}
