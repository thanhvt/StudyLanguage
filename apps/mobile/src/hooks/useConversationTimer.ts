import {useEffect, useRef, useCallback} from 'react';

/**
 * Mục đích: Hook quản lý countdown timer cho Free Talk mode
 * Tham số đầu vào: durationMinutes, isActive, onTick, onTimeUp
 * Tham số đầu ra: {remainingTime, formattedTime, progress}
 * Khi nào sử dụng:
 *   ConversationScreen → mode === 'free-talk' → useConversationTimer(setup.durationMinutes)
 *   Timer tự đếm ngược, gọi onTick mỗi giây, gọi onTimeUp khi hết giờ
 */
export function useConversationTimer(
  durationMinutes: number,
  isActive: boolean,
  onTick: () => void,
  onTimeUp: () => void,
) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);
  const totalSeconds = durationMinutes * 60;

  // Bắt đầu/dừng timer
  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    elapsedRef.current = 0;
    console.log(`⏱️ [Timer] Bắt đầu countdown: ${durationMinutes} phút`);

    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      onTick();

      if (elapsedRef.current >= totalSeconds) {
        console.log('⏰ [Timer] Hết giờ!');
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        onTimeUp();
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, durationMinutes, totalSeconds, onTick, onTimeUp]);

  /**
   * Mục đích: Format seconds còn lại → mm:ss
   * Tham số đầu vào: remaining (number)
   * Tham số đầu ra: string
   * Khi nào sử dụng: UI hiển thị timer
   */
  const formatTime = useCallback((remaining: number): string => {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, []);

  return {formatTime};
}
