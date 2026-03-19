import {useEffect, useRef, useCallback} from 'react';

// =======================
// Hook
// =======================

/**
 * Mục đích: Hook quản lý countdown/count-up timer cho Free Talk mode
 * Tham số đầu vào:
 *   durationMinutes — thời gian tính bằng phút (0 = unlimited)
 *   isActive — session đang chạy?
 *   onTick — callback gọi mỗi giây (tick store timer)
 *   onTimeUp — callback khi hết giờ (end session)
 *   onWarning — callback cảnh báo còn 60 giây (tuỳ chọn)
 * Tham số đầu ra: { formatTime }
 * Khi nào sử dụng:
 *   ConversationScreen → mode === 'free-talk'
 *   → useConversationTimer(setup.durationMinutes, isActive, tickTimer, endSession, showWarning)
 */
export function useConversationTimer(
  durationMinutes: number,
  isActive: boolean,
  onTick: () => void,
  onTimeUp: () => void,
  onWarning?: () => void,
) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);
  const warningFiredRef = useRef(false);
  const isUnlimited = durationMinutes === 0;
  const totalSeconds = durationMinutes * 60;

  // Stable refs cho callbacks — tránh re-create interval khi callback thay đổi
  const onTickRef = useRef(onTick);
  const onTimeUpRef = useRef(onTimeUp);
  const onWarningRef = useRef(onWarning);
  useEffect(() => { onTickRef.current = onTick; }, [onTick]);
  useEffect(() => { onTimeUpRef.current = onTimeUp; }, [onTimeUp]);
  useEffect(() => { onWarningRef.current = onWarning; }, [onWarning]);

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
    warningFiredRef.current = false;

    if (isUnlimited) {
      // Unlimited mode: đếm lên, không bao giờ tự kết thúc
      console.log('⏱️ [Timer] Bắt đầu count-up: Unlimited mode');
      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        onTickRef.current();
      }, 1000);
    } else {
      // Countdown mode: đếm xuống, kết thúc khi hết giờ
      console.log(`⏱️ [Timer] Bắt đầu countdown: ${durationMinutes} phút`);
      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        onTickRef.current();

        // Cảnh báo còn 60 giây — chỉ fire 1 lần
        const remaining = totalSeconds - elapsedRef.current;
        if (remaining === 60 && !warningFiredRef.current) {
          warningFiredRef.current = true;
          console.log('⚠️ [Timer] Còn 1 phút!');
          onWarningRef.current?.();
        }

        if (elapsedRef.current >= totalSeconds) {
          console.log('⏰ [Timer] Hết giờ!');
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          onTimeUpRef.current();
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // Chỉ deps vào isActive + durationMinutes — callbacks qua ref
  }, [isActive, isUnlimited, durationMinutes, totalSeconds]);

  /**
   * Mục đích: Format seconds → mm:ss
   * Tham số đầu vào: seconds (number)
   * Tham số đầu ra: string
   * Khi nào sử dụng: UI hiển thị timer badge
   */
  const formatTime = useCallback((seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, []);

  return {formatTime};
}
