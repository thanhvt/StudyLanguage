import {useCallback} from 'react';
import {Gesture} from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {useHaptic} from '@/hooks/useHaptic';

// ========================
// Constants
// ========================

/** Khoảng cách tối thiểu để nhận diện swipe (px) */
const SWIPE_THRESHOLD = 50;

/** Tốc độ tối thiểu để nhận diện swipe nhanh (px/s) */
const SWIPE_VELOCITY = 300;

/** Swipe xuống cần nhiều hơn để tránh false positive khi scroll */
const SWIPE_DOWN_THRESHOLD = 80;

// ========================
// Types
// ========================

/**
 * Mục đích: Định nghĩa callbacks cho các gesture trên player
 * Khi nào sử dụng: Hook usePlayerGestures yêu cầu object này
 */
interface PlayerGestureCallbacks {
  /** Swipe trái → câu trước */
  onSwipeLeft: () => void;
  /** Swipe phải → câu tiếp */
  onSwipeRight: () => void;
  /** Swipe xuống → minimize player */
  onSwipeDown: () => void;
  /** Double tap → toggle play/pause */
  onDoubleTap: () => void;
}

/**
 * Mục đích: Hook xử lý tất cả gestures cho PlayerScreen
 * Tham số đầu vào: callbacks (PlayerGestureCallbacks) — hàm xử lý cho mỗi gesture
 * Tham số đầu ra: object { gesture, animatedStyle }
 *   - gesture: ComposedGesture để truyền vào GestureDetector
 *   - animatedStyle: Animated style cho visual feedback khi swipe
 * Khi nào sử dụng: PlayerScreen wrap vùng transcript/player bằng GestureDetector
 *   - Swipe left/right: nhảy câu trước/tiếp (MOB-LIS-ENH-HP-004, 005)
 *   - Swipe down: minimize player (MOB-LIS-ENH-HP-006) — placeholder
 *   - Double tap: play/pause (MOB-LIS-ENH-HP-007)
 */
export function usePlayerGestures(callbacks: PlayerGestureCallbacks) {
  const haptic = useHaptic();

  // Shared values cho visual feedback
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  // ========================
  // Callback wrappers (runOnJS an toàn)
  // ========================

  const handleSwipeLeft = useCallback(() => {
    haptic.light();
    callbacks.onSwipeLeft();
  }, [haptic, callbacks]);

  const handleSwipeRight = useCallback(() => {
    haptic.light();
    callbacks.onSwipeRight();
  }, [haptic, callbacks]);

  const handleSwipeDown = useCallback(() => {
    haptic.light();
    callbacks.onSwipeDown();
  }, [haptic, callbacks]);

  const handleDoubleTap = useCallback(() => {
    haptic.light();
    callbacks.onDoubleTap();
  }, [haptic, callbacks]);

  // ========================
  // Pan Gesture: Swipe left/right/down
  // ========================

  /**
   * Mục đích: Nhận diện swipe theo hướng ngang (left/right) và dọc xuống
   * Tham số đầu vào: gesture event (tự động từ handler)
   * Tham số đầu ra: void — gọi callback tương ứng
   * Khi nào sử dụng: User swipe trên vùng player
   *   - activeOffsetX: cần kéo ít nhất 15px ngang mới activate (tránh conflict scroll)
   *   - failOffsetY: nếu kéo dọc quá 15px trước khi ngang đủ → fail gesture
   */
  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onUpdate(e => {
      // Visual feedback: di chuyển nhẹ theo hướng swipe
      translateX.value = e.translationX * 0.3;
      translateY.value = Math.max(0, e.translationY * 0.2);
      // Giảm opacity khi swipe xuống
      if (e.translationY > 0) {
        opacity.value = Math.max(0.7, 1 - e.translationY / 400);
      }
    })
    .onEnd(e => {
      const absX = Math.abs(e.translationX);
      const absY = Math.abs(e.translationY);
      const velX = Math.abs(e.velocityX);
      const velY = Math.abs(e.velocityY);

      // Ưu tiên hướng nào có displacement lớn hơn
      const isHorizontal = absX > absY;

      if (isHorizontal) {
        // Swipe ngang
        if (absX > SWIPE_THRESHOLD || velX > SWIPE_VELOCITY) {
          if (e.translationX < 0) {
            // Swipe trái → câu trước
            runOnJS(handleSwipeLeft)();
          } else {
            // Swipe phải → câu tiếp
            runOnJS(handleSwipeRight)();
          }
        }
      } else {
        // Swipe dọc xuống
        if (
          e.translationY > SWIPE_DOWN_THRESHOLD ||
          velY > SWIPE_VELOCITY
        ) {
          runOnJS(handleSwipeDown)();
        }
      }

      // Reset visual feedback
      translateX.value = withSpring(0, {damping: 15, stiffness: 200});
      translateY.value = withSpring(0, {damping: 15, stiffness: 200});
      opacity.value = withSpring(1, {damping: 15, stiffness: 200});
    })
    .onFinalize(() => {
      // Đảm bảo reset khi gesture bị cancel
      translateX.value = withSpring(0, {damping: 15, stiffness: 200});
      translateY.value = withSpring(0, {damping: 15, stiffness: 200});
      opacity.value = withSpring(1, {damping: 15, stiffness: 200});
    });

  // ========================
  // Double Tap Gesture: Play/Pause
  // ========================

  /**
   * Mục đích: Nhận diện double tap để toggle play/pause
   * Tham số đầu vào: gesture event (tự động)
   * Tham số đầu ra: void — gọi onDoubleTap callback
   * Khi nào sử dụng: User double tap vùng player
   */
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(300)
    .onEnd(() => {
      runOnJS(handleDoubleTap)();
    });

  // ========================
  // Compose gestures — Race: ai thắng dùng ai
  // Pan và DoubleTap không conflict vì Pan cần kéo, Tap cần tap
  // ========================

  const composedGesture = Gesture.Race(doubleTapGesture, panGesture);

  // ========================
  // Animated style cho visual feedback
  // ========================

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
    ],
    opacity: opacity.value,
  }));

  return {
    /** Gesture để truyền vào GestureDetector */
    gesture: composedGesture,
    /** Animated style cho Animated.View wrapper */
    animatedStyle,
  };
}
