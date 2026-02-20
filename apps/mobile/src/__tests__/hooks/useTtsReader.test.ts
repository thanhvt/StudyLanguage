/**
 * Unit test cho useTtsReader hook
 *
 * Mục đích: Test TTS auto-read bài viết theo từng đoạn
 * Tham số đầu vào: không có
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD pipeline, development verification
 *
 * Ref test cases:
 *   - FT-TTS-01: Bật TTS → đọc từ đoạn đầu
 *   - FT-TTS-02: Pause/Resume TTS
 *   - FT-TTS-03: Highlight đoạn đang đọc (via currentParagraphIndex)
 *   - FT-TTS-05: Stop TTS → reset
 */
import {renderHook, act} from '@testing-library/react-native';
import {useTtsReader} from '@/hooks/useTtsReader';
import Tts from 'react-native-tts';

// Mock react-native-tts
let ttsFinishCallback: (() => void) | null = null;
jest.mock('react-native-tts', () => ({
  setDefaultLanguage: jest.fn().mockResolvedValue(undefined),
  setDefaultRate: jest.fn(),
  setDefaultPitch: jest.fn(),
  speak: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn((event: string, callback: () => void) => {
    if (event === 'tts-finish') {
      ttsFinishCallback = callback;
    }
    return {remove: jest.fn()};
  }),
}));

const mockTts = Tts as jest.Mocked<typeof Tts>;

describe('useTtsReader', () => {
  const sampleParagraphs = [
    'Climate change is a global issue.',
    'Scientists warn about rising temperatures.',
    'Renewable energy is the future.',
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    ttsFinishCallback = null;
  });

  // ===================================
  // Trạng thái ban đầu
  // ===================================

  it('trạng thái ban đầu đúng khi khởi tạo', () => {
    const {result} = renderHook(() => useTtsReader(sampleParagraphs));

    expect(result.current.isReading).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.currentParagraphIndex).toBe(-1);
  });

  // ===================================
  // play() — FT-TTS-01
  // ===================================

  it('play() bắt đầu đọc từ đoạn đầu', () => {
    const {result} = renderHook(() => useTtsReader(sampleParagraphs));

    act(() => {
      result.current.play();
    });

    expect(result.current.isReading).toBe(true);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.currentParagraphIndex).toBe(0);
    expect(mockTts.speak).toHaveBeenCalledWith(sampleParagraphs[0]);
  });

  // ===================================
  // pause() — FT-TTS-02
  // ===================================

  it('pause() dừng đọc + đánh dấu isPaused', () => {
    const {result} = renderHook(() => useTtsReader(sampleParagraphs));

    // Bắt đầu đọc
    act(() => {
      result.current.play();
    });
    expect(result.current.isReading).toBe(true);

    // Tạm dừng
    act(() => {
      result.current.pause();
    });

    expect(result.current.isReading).toBe(false);
    expect(result.current.isPaused).toBe(true);
    expect(mockTts.stop).toHaveBeenCalled();
  });

  // ===================================
  // Resume after pause — FT-TTS-02
  // ===================================

  it('play() khi đang pause → tiếp tục đọc đúng đoạn hiện tại', () => {
    const {result} = renderHook(() => useTtsReader(sampleParagraphs));

    // Bắt đầu đọc đoạn 0
    act(() => {
      result.current.play();
    });

    // Tạm dừng
    act(() => {
      result.current.pause();
    });
    expect(result.current.isPaused).toBe(true);

    // Tiếp tục
    act(() => {
      result.current.play();
    });

    expect(result.current.isReading).toBe(true);
    expect(result.current.isPaused).toBe(false);
    // speak được gọi lại cho đoạn hiện tại
    expect(mockTts.speak).toHaveBeenCalledTimes(2);
  });

  // ===================================
  // stop() — FT-TTS-05
  // ===================================

  it('stop() dừng hoàn toàn và reset về trạng thái ban đầu', () => {
    const {result} = renderHook(() => useTtsReader(sampleParagraphs));

    // Bắt đầu đọc
    act(() => {
      result.current.play();
    });

    // Dừng hoàn toàn
    act(() => {
      result.current.stop();
    });

    expect(result.current.isReading).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.currentParagraphIndex).toBe(-1);
    expect(mockTts.stop).toHaveBeenCalled();
  });

  // ===================================
  // tts-finish event → auto advance — FT-TTS-03
  // ===================================

  it('đọc xong đoạn → tự động chuyển sang đoạn tiếp theo', () => {
    const {result} = renderHook(() => useTtsReader(sampleParagraphs));

    // Bắt đầu đọc đoạn 0
    act(() => {
      result.current.play();
    });

    expect(result.current.currentParagraphIndex).toBe(0);

    // Giả lập TTS đọc xong đoạn 0
    act(() => {
      if (ttsFinishCallback) {
        ttsFinishCallback();
      }
    });

    // Phải chuyển sang đoạn 1
    expect(result.current.currentParagraphIndex).toBe(1);
    expect(mockTts.speak).toHaveBeenCalledWith(sampleParagraphs[1]);
  });

  // ===================================
  // Đọc xong đoạn cuối → reset
  // ===================================

  it('đọc xong đoạn cuối → reset về trạng thái ban đầu', () => {
    const {result} = renderHook(() => useTtsReader(sampleParagraphs));

    // Bắt đầu đọc
    act(() => {
      result.current.play();
    });

    // Giả lập đọc xong đoạn 0 → 1
    act(() => {
      ttsFinishCallback?.();
    });
    // Giả lập đọc xong đoạn 1 → 2
    act(() => {
      ttsFinishCallback?.();
    });
    // Giả lập đọc xong đoạn 2 → hết bài
    act(() => {
      ttsFinishCallback?.();
    });

    expect(result.current.isReading).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.currentParagraphIndex).toBe(-1);
  });

  // ===================================
  // skipTo(n)
  // ===================================

  it('skipTo(n) nhảy tới đoạn n và bắt đầu đọc', () => {
    const {result} = renderHook(() => useTtsReader(sampleParagraphs));

    act(() => {
      result.current.skipTo(2);
    });

    expect(result.current.currentParagraphIndex).toBe(2);
    expect(result.current.isReading).toBe(true);
    expect(mockTts.speak).toHaveBeenCalledWith(sampleParagraphs[2]);
  });

  it('skipTo() bỏ qua nếu index ngoài phạm vi', () => {
    const {result} = renderHook(() => useTtsReader(sampleParagraphs));

    act(() => {
      result.current.skipTo(10); // Ngoài phạm vi
    });

    // Không thay đổi state
    expect(result.current.currentParagraphIndex).toBe(-1);
    expect(result.current.isReading).toBe(false);
    expect(mockTts.speak).not.toHaveBeenCalled();
  });

  it('skipTo() bỏ qua nếu index âm', () => {
    const {result} = renderHook(() => useTtsReader(sampleParagraphs));

    act(() => {
      result.current.skipTo(-1);
    });

    expect(result.current.currentParagraphIndex).toBe(-1);
    expect(mockTts.speak).not.toHaveBeenCalled();
  });

  // ===================================
  // Edge case: paragraphs rỗng
  // ===================================

  it('play() không làm gì khi paragraphs rỗng', () => {
    const {result} = renderHook(() => useTtsReader([]));

    act(() => {
      result.current.play();
    });

    expect(result.current.isReading).toBe(false);
    expect(mockTts.speak).not.toHaveBeenCalled();
  });

  // ===================================
  // TTS config setup
  // ===================================

  it('setup TTS config đúng khi mount', () => {
    renderHook(() => useTtsReader(sampleParagraphs));

    expect(mockTts.setDefaultLanguage).toHaveBeenCalledWith('en-US');
    expect(mockTts.setDefaultRate).toHaveBeenCalledWith(0.45);
    expect(mockTts.setDefaultPitch).toHaveBeenCalledWith(1.0);
  });
});
