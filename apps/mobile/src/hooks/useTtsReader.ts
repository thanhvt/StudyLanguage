import {useState, useCallback, useEffect, useRef} from 'react';
import Tts from 'react-native-tts';

// =======================
// Interfaces
// =======================

export interface UseTtsReaderReturn {
  /** Đang đọc hay không */
  isReading: boolean;
  /** Đang tạm dừng */
  isPaused: boolean;
  /** Index đoạn đang đọc (-1 = chưa bắt đầu) */
  currentParagraphIndex: number;
  /** Bắt đầu/tiếp tục đọc */
  play: () => void;
  /** Tạm dừng */
  pause: () => void;
  /** Dừng hoàn toàn + reset */
  stop: () => void;
  /** Nhảy tới đoạn cụ thể */
  skipTo: (index: number) => void;
}

/**
 * Mục đích: Hook quản lý TTS đọc bài viết theo từng đoạn
 * Tham số đầu vào: paragraphs (string[]) — danh sách đoạn văn cần đọc
 * Tham số đầu ra: UseTtsReaderReturn — controls + state
 * Khi nào sử dụng: ArticleScreen → user tap nút 🔊 để auto-read
 *   - Đọc từng paragraph qua react-native-tts
 *   - Track paragraph đang đọc để highlight UI
 *   - Hỗ trợ play/pause/stop/skipTo
 */
export function useTtsReader(paragraphs: string[]): UseTtsReaderReturn {
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(-1);

  // Dùng ref để tránh stale closure trong event listener
  const indexRef = useRef(-1);
  const paragraphsRef = useRef(paragraphs);
  const isReadingRef = useRef(false);

  // Cập nhật ref khi paragraphs thay đổi
  useEffect(() => {
    paragraphsRef.current = paragraphs;
  }, [paragraphs]);

  // Setup TTS config + event listeners
  useEffect(() => {
    // Cấu hình ngôn ngữ tiếng Anh
    Tts.setDefaultLanguage('en-US').catch(() =>
      console.warn('⚠️ [TTS] Không thể set ngôn ngữ en-US'),
    );
    Tts.setDefaultRate(0.45); // Tốc độ vừa phải cho người học
    Tts.setDefaultPitch(1.0);

    /**
     * Mục đích: Khi TTS đọc xong 1 đoạn → tự chuyển sang đoạn tiếp
     * Tham số đầu vào: không có (dùng ref)
     * Tham số đầu ra: void
     * Khi nào sử dụng: Event 'tts-finish' từ react-native-tts
     */
    const finishListener = Tts.addEventListener('tts-finish', () => {
      if (!isReadingRef.current) return;

      const nextIndex = indexRef.current + 1;
      if (nextIndex < paragraphsRef.current.length) {
        // Đọc đoạn tiếp theo
        indexRef.current = nextIndex;
        setCurrentParagraphIndex(nextIndex);
        Tts.speak(paragraphsRef.current[nextIndex]);
        console.log(
          `🔊 [TTS] Đang đọc đoạn ${nextIndex + 1}/${paragraphsRef.current.length}`,
        );
      } else {
        // Hết bài → reset
        console.log('✅ [TTS] Đã đọc xong toàn bộ bài');
        isReadingRef.current = false;
        setIsReading(false);
        setIsPaused(false);
        indexRef.current = -1;
        setCurrentParagraphIndex(-1);
      }
    });

    return () => {
      finishListener?.remove();
      Tts.stop();
    };
  }, []);

  /**
   * Mục đích: Bắt đầu đọc bài / tiếp tục nếu đang pause
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap nút play (▶️) ở header
   */
  const play = useCallback(() => {
    if (paragraphsRef.current.length === 0) return;

    if (isPaused) {
      // Tiếp tục từ đoạn đang pause
      setIsPaused(false);
      setIsReading(true);
      isReadingRef.current = true;
      Tts.speak(paragraphsRef.current[indexRef.current]);
      console.log(
        `▶️ [TTS] Tiếp tục đọc đoạn ${indexRef.current + 1}`,
      );
      return;
    }

    // Bắt đầu từ đầu
    const startIndex = 0;
    indexRef.current = startIndex;
    isReadingRef.current = true;
    setCurrentParagraphIndex(startIndex);
    setIsReading(true);
    setIsPaused(false);
    Tts.speak(paragraphsRef.current[startIndex]);
    console.log(
      `🔊 [TTS] Bắt đầu đọc bài (${paragraphsRef.current.length} đoạn)`,
    );
  }, [isPaused]);

  /**
   * Mục đích: Tạm dừng đọc (giữ vị trí đoạn hiện tại)
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap nút pause (⏸️) ở header
   */
  const pause = useCallback(() => {
    Tts.stop(); // react-native-tts không hỗ trợ pause, phải stop + resume sau
    isReadingRef.current = false;
    setIsReading(false);
    setIsPaused(true);
    console.log(
      `⏸️ [TTS] Tạm dừng ở đoạn ${indexRef.current + 1}`,
    );
  }, []);

  /**
   * Mục đích: Dừng hoàn toàn + reset về trạng thái ban đầu
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User rời ArticleScreen hoặc nhấn stop
   */
  const stop = useCallback(() => {
    Tts.stop();
    isReadingRef.current = false;
    indexRef.current = -1;
    setIsReading(false);
    setIsPaused(false);
    setCurrentParagraphIndex(-1);
    console.log('⏹️ [TTS] Đã dừng đọc');
  }, []);

  /**
   * Mục đích: Nhảy tới đoạn cụ thể và bắt đầu đọc
   * Tham số đầu vào: index (number) — index đoạn cần đọc
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào 1 đoạn trong bài để đọc từ đó
   */
  const skipTo = useCallback((index: number) => {
    if (index < 0 || index >= paragraphsRef.current.length) return;

    Tts.stop();
    indexRef.current = index;
    isReadingRef.current = true;
    setCurrentParagraphIndex(index);
    setIsReading(true);
    setIsPaused(false);
    Tts.speak(paragraphsRef.current[index]);
    console.log(`⏭️ [TTS] Nhảy tới đoạn ${index + 1}`);
  }, []);

  return {
    isReading,
    isPaused,
    currentParagraphIndex,
    play,
    pause,
    stop,
    skipTo,
  };
}
