import {useCallback, useRef} from 'react';
import {useReadingStore} from '@/store/useReadingStore';

// =======================
// Constants
// =======================

/** Font size tối thiểu cho bài đọc */
const MIN_FONT_SIZE = 12;
/** Font size tối đa cho bài đọc */
const MAX_FONT_SIZE = 28;
/** Hệ số scale → font size (nhạy hơn = giá trị nhỏ hơn) */
const SENSITIVITY = 8;

export interface UsePinchZoomReturn {
  /** Xử lý khi bắt đầu pinch gesture */
  onPinchStart: () => void;
  /** Xử lý khi đang pinch — cập nhật font size */
  onPinchUpdate: (scale: number) => void;
  /** Xử lý khi kết thúc pinch gesture */
  onPinchEnd: () => void;
}

/**
 * Mục đích: Hook xử lý pinch-to-zoom cho text size trong bài đọc
 * Tham số đầu vào: không có (đọc fontSize từ store)
 * Tham số đầu ra: UsePinchZoomReturn — onPinchStart, onPinchUpdate, onPinchEnd
 * Khi nào sử dụng: ArticleScreen — wrap content trong PinchGestureHandler
 *   - Pinch out (scale > 1) → tăng fontSize
 *   - Pinch in (scale < 1) → giảm fontSize
 *   - Clamp trong khoảng [12, 28]sp
 */
export function usePinchZoom(): UsePinchZoomReturn {
  const {fontSize, setFontSize} = useReadingStore();
  const baseFontSize = useRef(fontSize);

  /**
   * Mục đích: Lưu font size ban đầu khi bắt đầu pinch
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: PinchGestureHandler onBegan
   */
  const onPinchStart = useCallback(() => {
    baseFontSize.current = useReadingStore.getState().fontSize;
    console.log('🔍 [PinchZoom] Bắt đầu pinch, fontSize ban đầu:', baseFontSize.current);
  }, []);

  /**
   * Mục đích: Cập nhật font size theo scale gesture
   * Tham số đầu vào: scale (number) — tỉ lệ scale (1 = không đổi, >1 = phóng to, <1 = thu nhỏ)
   * Tham số đầu ra: void — cập nhật fontSize trong store
   * Khi nào sử dụng: PinchGestureHandler onActive
   */
  const onPinchUpdate = useCallback(
    (scale: number) => {
      // Tính font size mới dựa trên scale
      const delta = (scale - 1) * SENSITIVITY;
      const newFontSize = Math.round(
        Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, baseFontSize.current + delta)),
      );

      // Chỉ cập nhật khi giá trị thay đổi
      const currentSize = useReadingStore.getState().fontSize;
      if (newFontSize !== currentSize) {
        setFontSize(newFontSize);
      }
    },
    [setFontSize],
  );

  /**
   * Mục đích: Kết thúc pinch gesture
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: PinchGestureHandler onFinalize
   */
  const onPinchEnd = useCallback(() => {
    const finalSize = useReadingStore.getState().fontSize;
    console.log('🔍 [PinchZoom] Kết thúc pinch, fontSize cuối:', finalSize);
  }, []);

  return {
    onPinchStart,
    onPinchUpdate,
    onPinchEnd,
  };
}
