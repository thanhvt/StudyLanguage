import {useState, useCallback, useRef, useEffect} from 'react';
import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
} from '@react-native-voice/voice';
import {readingApi} from '@/services/api/reading';

// =======================
// Types
// =======================

/** Các trạng thái của practice flow */
export type PracticePhase =
  | 'idle'       // Chưa bắt đầu
  | 'recording'  // Đang ghi âm + STT
  | 'analyzing'  // Đang gửi API phân tích
  | 'result';    // Đang hiển thị kết quả

/** Lỗi phát âm chi tiết */
export interface PronunciationError {
  original: string;
  spoken: string;
  type: string;
  suggestion?: string;
}

/** Kết quả phân tích từ AI */
export interface PracticeResult {
  accuracy: number;
  fluencyScore: number;
  errors: PronunciationError[];
  feedback: string;
}

export interface UseReadingPracticeReturn {
  /** Trạng thái hiện tại */
  phase: PracticePhase;
  /** Text user đọc được (STT) */
  transcript: string;
  /** Kết quả phân tích (sau phase 'result') */
  result: PracticeResult | null;
  /** Lỗi (nếu có) */
  error: string | null;
  /** Đang ghi âm */
  isRecording: boolean;
  /** Bắt đầu ghi âm + nhận diện giọng nói */
  startRecording: () => Promise<void>;
  /** Dừng ghi âm */
  stopRecording: () => Promise<void>;
  /** Reset về trạng thái ban đầu */
  resetPractice: () => void;
}

/**
 * Mục đích: Hook quản lý flow luyện đọc: Record → STT → API analyze → hiện kết quả
 * Tham số đầu vào: originalText (string) — đoạn văn gốc mà user cần đọc
 * Tham số đầu ra: UseReadingPracticeReturn — state + controls
 * Khi nào sử dụng: PracticeScreen → user chọn đoạn để luyện đọc
 *   1. User nhấn 🎤 → startRecording (phase: 'recording')
 *   2. STT ghi nhận từng từ → update transcript realtime
 *   3. User nhấn ⏹️ → stopRecording → gửi API analyze (phase: 'analyzing')
 *   4. API trả về → hiện kết quả (phase: 'result')
 */
export function useReadingPractice(originalText: string): UseReadingPracticeReturn {
  const [phase, setPhase] = useState<PracticePhase>('idle');
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const originalTextRef = useRef(originalText);
  // Ref để tránh stale closure trong stopRecording — luôn giữ giá trị transcript mới nhất
  const transcriptRef = useRef('');

  useEffect(() => {
    originalTextRef.current = originalText;
  }, [originalText]);

  // Setup Voice listeners
  useEffect(() => {
    /**
     * Mục đích: Nhận kết quả STT realtime
     * Tham số đầu vào: event (SpeechResultsEvent)
     * Tham số đầu ra: void — cập nhật transcript
     * Khi nào sử dụng: Voice engine nhận diện được từ mới
     */
    const onSpeechResults = (event: SpeechResultsEvent) => {
      const text = event.value?.[0] ?? '';
      setTranscript(text);
      transcriptRef.current = text; // Cập nhật ref để tránh stale closure
      console.log('🎤 [Practice] STT transcript:', text);
    };

    /**
     * Mục đích: Xử lý lỗi từ Voice engine
     * Tham số đầu vào: event (SpeechErrorEvent)
     * Tham số đầu ra: void — set error
     * Khi nào sử dụng: Voice engine gặp lỗi
     */
    const onSpeechError = (event: SpeechErrorEvent) => {
      const message = event.error?.message ?? 'Lỗi không xác định';
      console.error('❌ [Practice] Lỗi STT:', message);
      setError(message);
      setIsRecording(false);
      setPhase('idle');
    };

    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners).catch(() => {});
    };
  }, []);

  /**
   * Mục đích: Bắt đầu ghi âm + chạy STT engine
   * Tham số đầu vào: không có
   * Tham số đầu ra: void — chuyển phase sang 'recording'
   * Khi nào sử dụng: User nhấn nút 🎤 trong PracticeScreen
   */
  const startRecording = useCallback(async () => {
    // Guard: Tránh double-tap gọi Voice.start() 2 lần → crash/behavior không xác định
    if (isRecording) {
      console.warn('⚠️ [Practice] Đang ghi âm rồi, bỏ qua lệnh startRecording trùng');
      return;
    }

    try {
      setTranscript('');
      transcriptRef.current = '';
      setResult(null);
      setError(null);
      setPhase('recording');
      setIsRecording(true);

      await Voice.start('en-US');
      console.log('🎤 [Practice] Bắt đầu ghi âm + STT');
    } catch (err: any) {
      console.error('❌ [Practice] Lỗi bắt đầu ghi âm:', err);
      setError('Không thể bắt đầu ghi âm. Kiểm tra quyền microphone.');
      setPhase('idle');
      setIsRecording(false);
    }
  }, [isRecording]);

  /**
   * Mục đích: Dừng ghi âm + gửi transcript cho AI phân tích
   * Tham số đầu vào: không có
   * Tham số đầu ra: void — chuyển phase sang 'analyzing' → 'result'
   * Khi nào sử dụng: User nhấn ⏹️ hoặc đọc xong
   */
  const stopRecording = useCallback(async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
      console.log('⏹️ [Practice] Dừng ghi âm');

      // Dùng ref thay vì state để tránh stale closure — transcriptRef luôn giữ giá trị mới nhất
      const finalTranscript = transcriptRef.current;

      if (!finalTranscript || finalTranscript.trim().length === 0) {
        setError('Không nhận được giọng nói. Vui lòng thử lại.');
        setPhase('idle');
        return;
      }

      // Gửi API phân tích
      setPhase('analyzing');
      console.log('📤 [Practice] Gửi phân tích...');

      const analysisResult = await readingApi.analyzePractice(
        originalTextRef.current,
        finalTranscript,
      );

      setResult(analysisResult);
      setPhase('result');
      console.log('✅ [Practice] Kết quả phân tích:', analysisResult.accuracy);
    } catch (err: any) {
      console.error('❌ [Practice] Lỗi phân tích:', err);
      setError('Lỗi phân tích. Vui lòng thử lại.');
      setPhase('idle');
    }
  }, []);

  /**
   * Mục đích: Reset toàn bộ practice state
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User muốn đọc lại hoặc chuyển đoạn khác
   */
  const resetPractice = useCallback(() => {
    Voice.cancel().catch(() => {});
    setPhase('idle');
    setTranscript('');
    setResult(null);
    setError(null);
    setIsRecording(false);
    console.log('🔄 [Practice] Đã reset phiên luyện đọc');
  }, []);

  return {
    phase,
    transcript,
    result,
    error,
    isRecording,
    startRecording,
    stopRecording,
    resetPractice,
  };
}
