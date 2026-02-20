/**
 * Unit test cho usePinchZoom hook
 *
 * Mục đích: Test pinch-to-zoom cho text size trong bài đọc
 * Tham số đầu vào: không có
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD pipeline, development verification
 *
 * Ref test cases:
 *   - FT-PZ-01: Pinch zoom in → font size tăng
 *   - FT-PZ-02: Pinch zoom out → font size giảm
 *   - FT-PZ-03: Giới hạn min 12sp / max 28sp
 *   - FT-PZ-05: Font size giữ khi chuyển focus mode
 */
import {renderHook, act} from '@testing-library/react-native';
import {usePinchZoom} from '@/hooks/usePinchZoom';
import {useReadingStore} from '@/store/useReadingStore';

describe('usePinchZoom', () => {
  beforeEach(() => {
    // Reset store về trạng thái ban đầu
    useReadingStore.getState().reset();
  });

  // ===================================
  // onPinchStart
  // ===================================

  it('onPinchStart lưu fontSize hiện tại làm base', () => {
    // Set fontSize trước
    useReadingStore.getState().setFontSize(20);

    const {result} = renderHook(() => usePinchZoom());

    act(() => {
      result.current.onPinchStart();
    });

    // Sau onPinchStart, scale=1 → fontSize giữ nguyên
    act(() => {
      result.current.onPinchUpdate(1.0);
    });

    // fontSize phải vẫn là 20 (base * 1.0 = 20)
    expect(useReadingStore.getState().fontSize).toBe(20);
  });

  // ===================================
  // Pinch zoom in — FT-PZ-01
  // ===================================

  it('onPinchUpdate scale > 1 → fontSize tăng', () => {
    useReadingStore.getState().setFontSize(16);

    const {result} = renderHook(() => usePinchZoom());

    act(() => {
      result.current.onPinchStart();
    });

    // scale = 1.5 → delta = (1.5 - 1) * 8 = 4 → fontSize = 16 + 4 = 20
    act(() => {
      result.current.onPinchUpdate(1.5);
    });

    expect(useReadingStore.getState().fontSize).toBe(20);
  });

  // ===================================
  // Pinch zoom out — FT-PZ-02
  // ===================================

  it('onPinchUpdate scale < 1 → fontSize giảm', () => {
    useReadingStore.getState().setFontSize(20);

    const {result} = renderHook(() => usePinchZoom());

    act(() => {
      result.current.onPinchStart();
    });

    // scale = 0.5 → delta = (0.5 - 1) * 8 = -4 → fontSize = 20 - 4 = 16
    act(() => {
      result.current.onPinchUpdate(0.5);
    });

    expect(useReadingStore.getState().fontSize).toBe(16);
  });

  // ===================================
  // Max boundary — FT-PZ-03
  // ===================================

  it('fontSize không vượt quá 28sp (max)', () => {
    useReadingStore.getState().setFontSize(26);

    const {result} = renderHook(() => usePinchZoom());

    act(() => {
      result.current.onPinchStart();
    });

    // scale = 2.0 → delta = (2.0 - 1) * 8 = 8 → 26 + 8 = 34 → clamped = 28
    act(() => {
      result.current.onPinchUpdate(2.0);
    });

    expect(useReadingStore.getState().fontSize).toBe(28);
  });

  // ===================================
  // Min boundary — FT-PZ-03
  // ===================================

  it('fontSize không xuống dưới 12sp (min)', () => {
    useReadingStore.getState().setFontSize(14);

    const {result} = renderHook(() => usePinchZoom());

    act(() => {
      result.current.onPinchStart();
    });

    // scale = 0.1 → delta = (0.1 - 1) * 8 = -7.2 → 14 - 7.2 = 6.8 → clamped = 12
    act(() => {
      result.current.onPinchUpdate(0.1);
    });

    expect(useReadingStore.getState().fontSize).toBe(12);
  });

  // ===================================
  // Scale = 1.0 → không đổi
  // ===================================

  it('onPinchUpdate scale = 1.0 → fontSize không đổi', () => {
    useReadingStore.getState().setFontSize(18);

    const {result} = renderHook(() => usePinchZoom());

    act(() => {
      result.current.onPinchStart();
    });

    act(() => {
      result.current.onPinchUpdate(1.0);
    });

    expect(useReadingStore.getState().fontSize).toBe(18);
  });

  // ===================================
  // Multiple pinch cycles
  // ===================================

  it('nhiều lần pinch liên tiếp tích lũy đúng', () => {
    useReadingStore.getState().setFontSize(16);

    const {result} = renderHook(() => usePinchZoom());

    // Pinch cycle 1: 16 + 4 = 20
    act(() => {
      result.current.onPinchStart();
    });
    act(() => {
      result.current.onPinchUpdate(1.5); // delta = 4
    });
    act(() => {
      result.current.onPinchEnd();
    });

    expect(useReadingStore.getState().fontSize).toBe(20);

    // Pinch cycle 2: base = 20, delta = -4 → 16
    act(() => {
      result.current.onPinchStart();
    });
    act(() => {
      result.current.onPinchUpdate(0.5); // delta = -4, base 20 → 16
    });
    act(() => {
      result.current.onPinchEnd();
    });

    expect(useReadingStore.getState().fontSize).toBe(16);
  });

  // ===================================
  // Default fontSize — FT-PZ-05 (kiểm tra tương thích)
  // ===================================

  it('hoạt động đúng với fontSize mặc định (16)', () => {
    // fontSize mặc định sau reset là 16
    expect(useReadingStore.getState().fontSize).toBe(16);

    const {result} = renderHook(() => usePinchZoom());

    act(() => {
      result.current.onPinchStart();
    });

    // scale = 1.25 → delta = 2 → 16 + 2 = 18
    act(() => {
      result.current.onPinchUpdate(1.25);
    });

    expect(useReadingStore.getState().fontSize).toBe(18);
  });
});
