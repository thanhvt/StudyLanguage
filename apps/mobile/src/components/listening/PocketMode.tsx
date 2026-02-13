import React, {useCallback, useRef, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import {AppText} from '@/components/ui';
import {useHaptic} from '@/hooks/useHaptic';
import {useAudioPlayerStore} from '@/store/useAudioPlayerStore';
import TrackPlayer from 'react-native-track-player';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

/**
 * Mục đích: Pocket Mode — màn hình tối cho nghe thụ động khi bỏ túi
 * Tham số đầu vào: onExit (callback thoát Pocket Mode)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: PlayerScreen → user nhấn nút "Pocket Mode"
 *   - Màn hình đen tối đa, tiết kiệm pin
 *   - 3 vùng cử chỉ lớn: Top (lùi 15s), Center (play/pause), Bottom (tới 15s)
 *   - Double tap = thoát Pocket Mode
 *   - Hiện đèn flash nhẹ khi tap để feedback
 */
export default function PocketMode({onExit}: {onExit: () => void}) {
  const haptic = useHaptic();
  const isPlaying = useAudioPlayerStore(s => s.isPlaying);
  const setGlobalPlaying = useAudioPlayerStore(s => s.setIsPlaying);

  // Flash feedback khi tap
  const flashOpacity = useSharedValue(0);

  // Vùng hiển thị text (xuất hiện ngắn khi tap)
  const feedbackText = useRef('');
  const textOpacity = useSharedValue(0);
  const [displayText, setDisplayText] = React.useState('');

  /**
   * Mục đích: Hiển thị feedback ngắn khi user tap
   * Tham số đầu vào: text (string) — nội dung hiển thị
   * Tham số đầu ra: void
   * Khi nào sử dụng: Mỗi gesture action (play/pause/seek)
   */
  const showFeedback = useCallback(
    (text: string) => {
      feedbackText.current = text;
      setDisplayText(text);
      flashOpacity.value = withSequence(
        withTiming(0.15, {duration: 100}),
        withTiming(0, {duration: 600, easing: Easing.out(Easing.quad)}),
      );
      textOpacity.value = withSequence(
        withTiming(1, {duration: 100}),
        withTiming(0, {duration: 1200, easing: Easing.out(Easing.quad)}),
      );
    },
    [flashOpacity, textOpacity],
  );

  /**
   * Mục đích: Toggle play/pause audio
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vùng giữa
   */
  const handlePlayPause = useCallback(async () => {
    try {
      haptic.medium();
      if (isPlaying) {
        await TrackPlayer.pause();
        setGlobalPlaying(false);
        showFeedback('⏸ Tạm dừng');
      } else {
        await TrackPlayer.play();
        setGlobalPlaying(true);
        showFeedback('▶️ Đang phát');
      }
    } catch (error) {
      console.log('⚠️ [PocketMode] Lỗi toggle play/pause:', error);
    }
  }, [isPlaying, haptic, setGlobalPlaying, showFeedback]);

  /**
   * Mục đích: Tua lùi 15 giây
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vùng trên
   */
  const handleSeekBack = useCallback(async () => {
    try {
      haptic.light();
      const progress = await TrackPlayer.getProgress();
      const newPos = Math.max(0, progress.position - 15);
      await TrackPlayer.seekTo(newPos);
      showFeedback('⏪ -15s');
    } catch (error) {
      console.log('⚠️ [PocketMode] Lỗi seek back:', error);
    }
  }, [haptic, showFeedback]);

  /**
   * Mục đích: Tua tới 15 giây
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vùng dưới
   */
  const handleSeekForward = useCallback(async () => {
    try {
      haptic.light();
      const progress = await TrackPlayer.getProgress();
      const newPos = Math.min(progress.duration, progress.position + 15);
      await TrackPlayer.seekTo(newPos);
      showFeedback('⏩ +15s');
    } catch (error) {
      console.log('⚠️ [PocketMode] Lỗi seek forward:', error);
    }
  }, [haptic, showFeedback]);

  // Double-tap gesture → thoát
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      haptic.heavy();
      onExit();
    });

  // Animated styles
  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  // Ẩn StatusBar khi Pocket Mode active
  useEffect(() => {
    StatusBar.setHidden(true, 'fade');
    return () => {
      StatusBar.setHidden(false, 'fade');
    };
  }, []);

  return (
    <GestureDetector gesture={doubleTap}>
      <View className="flex-1 bg-black">
        {/* Toàn bộ nền đen */}

        {/* Vùng trên — Tap = lùi 15s */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleSeekBack}
          style={{height: SCREEN_HEIGHT * 0.3}}
          className="items-center justify-center"
          accessibilityLabel="Tua lùi 15 giây"
          accessibilityRole="button">
          <AppText className="text-white/10 text-4xl">⏪</AppText>
        </TouchableOpacity>

        {/* Vùng giữa — Tap = play/pause */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={handlePlayPause}
          style={{height: SCREEN_HEIGHT * 0.4}}
          className="items-center justify-center"
          accessibilityLabel={isPlaying ? 'Tạm dừng' : 'Phát'}
          accessibilityRole="button">
          <AppText className="text-white/10 text-6xl">
            {isPlaying ? '⏸' : '▶️'}
          </AppText>
        </TouchableOpacity>

        {/* Vùng dưới — Tap = tới 15s */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleSeekForward}
          style={{height: SCREEN_HEIGHT * 0.3}}
          className="items-center justify-center"
          accessibilityLabel="Tua tới 15 giây"
          accessibilityRole="button">
          <AppText className="text-white/10 text-4xl">⏩</AppText>
        </TouchableOpacity>

        {/* Flash overlay — feedback khi tap */}
        <Animated.View
          pointerEvents="none"
          className="absolute inset-0 bg-white"
          style={flashStyle}
        />

        {/* Text feedback — hiện ngắn */}
        <Animated.View
          pointerEvents="none"
          className="absolute inset-0 items-center justify-center"
          style={textStyle}>
          <AppText className="text-white text-2xl font-sans-bold">
            {displayText}
          </AppText>
        </Animated.View>

        {/* Exit hint — siêu mờ */}
        <View className="absolute bottom-10 left-0 right-0 items-center">
          <AppText className="text-white/5 text-xs">
            Double-tap để thoát
          </AppText>
        </View>
      </View>
    </GestureDetector>
  );
}
