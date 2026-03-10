import {useEffect, useRef, useCallback} from 'react';

// =======================
// Hook
// =======================

/**
 * Mục đích: Hook quản lý countdown timer cho Free Talk mode
 * Tham số đầu vào:
 *   durationMinutes — thời gian tính bằng phút
 *   isActive — session đang chạy?
 *   onTick — callback gọi mỗi giây (tick store timer)
 *   onTimeUp — callback khi hết giờ (end session)
 * Tham số đầu ra: { formatTime }
 * Khi nào sử dụng:
 *   ConversationScreen → mode === 'free-talk'
 *   → useConversationTimer(setup.durationMinutes, isActive, tickTimer, endSession)
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

  // Stable refs cho callbacks — tránh re-create interval khi callback thay đổi
  const onTickRef = useRef(onTick);
  const onTimeUpRef = useRef(onTimeUp);
  useEffect(() => { onTickRef.current = onTick; }, [onTick]);
  useEffect(() => { onTimeUpRef.current = onTimeUp; }, [onTimeUp]);

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
      onTickRef.current();

      if (elapsedRef.current >= totalSeconds) {
        console.log('⏰ [Timer] Hết giờ!');
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        onTimeUpRef.current();
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // Chỉ deps vào isActive + totalSeconds — callbacks qua ref
  }, [isActive, durationMinutes, totalSeconds]);

  /**
   * Mục đích: Format seconds còn lại → mm:ss
   * Tham số đầu vào: remaining (number)
   * Tham số đầu ra: string
   * Khi nào sử dụng: UI hiển thị timer badge
   */
  const formatTime = useCallback((remaining: number): string => {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, []);

  return {formatTime};
}
