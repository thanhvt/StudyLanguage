/**
 * useWordHighlight — Custom hook cho word-level karaoke highlight
 *
 * Mục đích: Polling audio position → binary search → trả về index từ đang nói
 * Tham số đầu vào:
 *   - wordTimestamps: mảng WordTimestamp cho câu hiện tại
 *   - isActive: chỉ chạy khi exchange đang được phát
 *   - isPlaying: audio đang phát hay không
 * Tham số đầu ra: { currentWordIndex }
 * Khi nào sử dụng: Mỗi ExchangeItem active import hook này
 *   Flow: ExchangeItem → useWordHighlight → setInterval(80ms) → TrackPlayer.getProgress
 *         → findCurrentWordIndexWithFallback → highlight UI
 */

import {useState, useEffect, useRef} from 'react';
import TrackPlayer from 'react-native-track-player';
import {
  findCurrentWordIndexWithFallback,
  type WordTimestamp,
} from '@/utils/wordHighlightUtils';

// Tần suất polling (ms) — 80ms cho balance giữa accuracy và performance
const POLLING_INTERVAL_MS = 80;
// Polling interval cho tốc độ cao (> 1.5x)
const FAST_POLLING_INTERVAL_MS = 50;

interface UseWordHighlightParams {
  /** Word timestamps cho câu này */
  wordTimestamps: WordTimestamp[] | undefined;
  /** Câu này có đang active (đang được phát) không */
  isActive: boolean;
  /** Audio đang phát (play) hay pause */
  isPlaying: boolean;
  /** Tốc độ phát audio hiện tại */
  playbackSpeed?: number;
}

interface UseWordHighlightResult {
  /** Index của từ đang được highlight (-1 = không highlight) */
  currentWordIndex: number;
}

/**
 * Mục đích: Hook chính — polling audio position và binary search để tìm từ đang nói
 * Tham số đầu vào: UseWordHighlightParams
 * Tham số đầu ra: UseWordHighlightResult
 * Khi nào sử dụng: Được gọi trong ExchangeItem component
 *   Flow: Component mount → isActive+isPlaying → start interval → poll position
 *         → binary search → update state (chỉ khi index đổi) → re-render word highlight
 */
export function useWordHighlight({
  wordTimestamps,
  isActive,
  isPlaying,
  playbackSpeed = 1,
}: UseWordHighlightParams): UseWordHighlightResult {
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  /**
   * Ref giữ lastIndex cho gap fallback
   * Dùng ref thay vì state để tránh re-render + closure stale
   */
  const lastIndexRef = useRef(-1);

  useEffect(() => {
    // Chỉ chạy khi: có data + đang active + đang phát
    if (!wordTimestamps?.length || !isActive || !isPlaying) {
      return;
    }

    // Chọn polling interval theo tốc độ
    const interval = playbackSpeed > 1.5 ? FAST_POLLING_INTERVAL_MS : POLLING_INTERVAL_MS;

    const timer = setInterval(async () => {
      try {
        const {position} = await TrackPlayer.getProgress();
        const newIndex = findCurrentWordIndexWithFallback(
          wordTimestamps,
          position,
          lastIndexRef.current,
        );

        // Chỉ update state khi index thật sự thay đổi → tránh re-render vô ích
        if (newIndex !== lastIndexRef.current) {
          lastIndexRef.current = newIndex;
          setCurrentWordIndex(newIndex);
        }
      } catch {
        // Lỗi TrackPlayer (chưa init, track chưa load) → bỏ qua
      }
    }, interval);

    return () => {
      clearInterval(timer);
    };
  }, [wordTimestamps, isActive, isPlaying, playbackSpeed]);

  // Reset khi exchange đổi (không active nữa)
  useEffect(() => {
    if (!isActive) {
      lastIndexRef.current = -1;
      setCurrentWordIndex(-1);
    }
  }, [isActive]);

  return {currentWordIndex};
}
