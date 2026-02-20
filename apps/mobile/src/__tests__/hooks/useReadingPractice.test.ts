/**
 * Unit test cho useReadingPractice hook
 *
 * Mục đích: Test flow luyện đọc: Record → STT → API analyze → hiện kết quả
 * Tham số đầu vào: không có
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD pipeline, development verification
 *
 * Ref test cases:
 *   - FT-RP-02: Bắt đầu ghi âm → phase 'recording'
 *   - FT-RP-03: Transcript hiện realtime
 *   - FT-RP-04: Dừng + phân tích → phase 'analyzing' → 'result'
 *   - FT-RP-05: Kết quả AI Analysis
 *   - FT-RP-07: Reset practice
 *   - FT-RP-11: STT error (no mic permission)
 *   - FT-RP-12: API analyze fail
 */
import {renderHook, act} from '@testing-library/react-native';
import {useReadingPractice} from '@/hooks/useReadingPractice';
import Voice from '@react-native-voice/voice';
import {readingApi} from '@/services/api/reading';

// Mock Voice module
jest.mock('@react-native-voice/voice', () => ({
  start: jest.fn(),
  stop: jest.fn(),
  cancel: jest.fn(),
  destroy: jest.fn().mockResolvedValue(undefined),
  removeAllListeners: jest.fn(),
  onSpeechResults: null,
  onSpeechError: null,
}));

// Mock Reading API
jest.mock('@/services/api/reading', () => ({
  readingApi: {
    analyzePractice: jest.fn(),
  },
}));

const mockVoice = Voice as jest.Mocked<typeof Voice>;
const mockAnalyze = readingApi.analyzePractice as jest.Mock;

describe('useReadingPractice', () => {
  const sampleText = 'Climate change is one of the most pressing issues.';

  beforeEach(() => {
    jest.clearAllMocks();
    (mockVoice.start as jest.Mock).mockResolvedValue(undefined);
    (mockVoice.stop as jest.Mock).mockResolvedValue(undefined);
    (mockVoice.cancel as jest.Mock).mockResolvedValue(undefined);
  });

  // ===================================
  // Trạng thái ban đầu
  // ===================================

  it('trạng thái ban đầu đúng khi khởi tạo', () => {
    const {result} = renderHook(() => useReadingPractice(sampleText));

    expect(result.current.phase).toBe('idle');
    expect(result.current.transcript).toBe('');
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isRecording).toBe(false);
  });

  // ===================================
  // startRecording — FT-RP-02
  // ===================================

  it('startRecording chuyển phase sang recording + gọi Voice.start', async () => {
    const {result} = renderHook(() => useReadingPractice(sampleText));

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.phase).toBe('recording');
    expect(result.current.isRecording).toBe(true);
    expect(mockVoice.start).toHaveBeenCalledWith('en-US');
  });

  it('startRecording reset state trước đó (transcript, result, error)', async () => {
    const {result} = renderHook(() => useReadingPractice(sampleText));

    await act(async () => {
      await result.current.startRecording();
    });

    // Transcript phải rỗng (đã reset)
    expect(result.current.transcript).toBe('');
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  // ===================================
  // startRecording fail — FT-RP-11
  // ===================================

  it('startRecording set error khi Voice.start fail (no mic permission)', async () => {
    (mockVoice.start as jest.Mock).mockRejectedValue(
      new Error('Microphone permission denied'),
    );

    const {result} = renderHook(() => useReadingPractice(sampleText));

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.phase).toBe('idle');
    expect(result.current.isRecording).toBe(false);
    expect(result.current.error).toContain('Không thể bắt đầu ghi âm');
  });

  // ===================================
  // onSpeechResults — FT-RP-03
  // ===================================

  it('onSpeechResults cập nhật transcript realtime', async () => {
    const {result} = renderHook(() => useReadingPractice(sampleText));

    await act(async () => {
      await result.current.startRecording();
    });

    // Giả lập Voice trả kết quả STT
    act(() => {
      if (mockVoice.onSpeechResults) {
        (mockVoice.onSpeechResults as any)({
          value: ['Climate change is'],
        });
      }
    });

    expect(result.current.transcript).toBe('Climate change is');
  });

  // ===================================
  // onSpeechError — error handling
  // ===================================

  it('onSpeechError set error và reset phase về idle', async () => {
    const {result} = renderHook(() => useReadingPractice(sampleText));

    await act(async () => {
      await result.current.startRecording();
    });

    // Giả lập Voice error
    act(() => {
      if (mockVoice.onSpeechError) {
        (mockVoice.onSpeechError as any)({
          error: {message: 'Không nhận diện được giọng nói'},
        });
      }
    });

    expect(result.current.error).toBe('Không nhận diện được giọng nói');
    expect(result.current.isRecording).toBe(false);
    expect(result.current.phase).toBe('idle');
  });

  // ===================================
  // stopRecording + analyze — FT-RP-04, FT-RP-05
  // ===================================

  it('stopRecording gửi API analyze và chuyển phase result', async () => {
    const mockResult = {
      accuracy: 92,
      fluencyScore: 85,
      errors: [{original: 'pressing', spoken: 'presing', type: 'pronunciation'}],
      feedback: 'Great reading! Focus on pressing.',
    };
    mockAnalyze.mockResolvedValue(mockResult);

    const {result} = renderHook(() => useReadingPractice(sampleText));

    // Bắt đầu recording
    await act(async () => {
      await result.current.startRecording();
    });

    // Giả lập STT trả transcript
    act(() => {
      if (mockVoice.onSpeechResults) {
        (mockVoice.onSpeechResults as any)({
          value: ['Climate change is one of the most presing issues'],
        });
      }
    });

    // Dừng + phân tích
    await act(async () => {
      await result.current.stopRecording();
    });

    expect(mockVoice.stop).toHaveBeenCalled();
    expect(result.current.phase).toBe('result');
    expect(result.current.isRecording).toBe(false);
    expect(result.current.result).toEqual(mockResult);
    expect(result.current.result?.accuracy).toBe(92);
    expect(result.current.result?.fluencyScore).toBe(85);
    expect(result.current.result?.errors).toHaveLength(1);
  });

  // ===================================
  // stopRecording với transcript rỗng
  // ===================================

  it('stopRecording set error khi transcript rỗng', async () => {
    const {result} = renderHook(() => useReadingPractice(sampleText));

    await act(async () => {
      await result.current.startRecording();
    });

    // Không giả lập STT kết quả → transcript vẫn rỗng
    await act(async () => {
      await result.current.stopRecording();
    });

    expect(result.current.error).toContain('Không nhận được giọng nói');
    expect(result.current.phase).toBe('idle');
    expect(mockAnalyze).not.toHaveBeenCalled();
  });

  // ===================================
  // API analyze fail — FT-RP-12
  // ===================================

  it('stopRecording set error khi API analyze fail', async () => {
    mockAnalyze.mockRejectedValue(new Error('Server Error'));

    const {result} = renderHook(() => useReadingPractice(sampleText));

    await act(async () => {
      await result.current.startRecording();
    });

    // Giả lập STT kết quả
    act(() => {
      if (mockVoice.onSpeechResults) {
        (mockVoice.onSpeechResults as any)({
          value: ['Some transcript text here'],
        });
      }
    });

    await act(async () => {
      await result.current.stopRecording();
    });

    expect(result.current.error).toContain('Lỗi phân tích');
    expect(result.current.phase).toBe('idle');
  });

  // ===================================
  // resetPractice — FT-RP-07
  // ===================================

  it('resetPractice reset toàn bộ state + gọi Voice.cancel', async () => {
    const mockResult = {
      accuracy: 88,
      fluencyScore: 80,
      errors: [],
      feedback: 'Good!',
    };
    mockAnalyze.mockResolvedValue(mockResult);

    const {result} = renderHook(() => useReadingPractice(sampleText));

    // Giả lập đã hoàn thành practice
    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      if (mockVoice.onSpeechResults) {
        (mockVoice.onSpeechResults as any)({value: ['Some text']});
      }
    });

    await act(async () => {
      await result.current.stopRecording();
    });

    expect(result.current.phase).toBe('result');

    // Reset
    act(() => {
      result.current.resetPractice();
    });

    expect(result.current.phase).toBe('idle');
    expect(result.current.transcript).toBe('');
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isRecording).toBe(false);
    expect(mockVoice.cancel).toHaveBeenCalled();
  });

  // ===================================
  // Cleanup khi unmount
  // ===================================

  it('cleanup Voice listeners khi unmount', () => {
    const {unmount} = renderHook(() => useReadingPractice(sampleText));

    unmount();

    expect(mockVoice.destroy).toHaveBeenCalled();
  });
});
