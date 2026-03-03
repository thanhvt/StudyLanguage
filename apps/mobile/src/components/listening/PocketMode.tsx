import React, {useCallback, useRef, useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useHaptic} from '@/hooks/useHaptic';
import {useAudioPlayerStore} from '@/store/useAudioPlayerStore';
import TrackPlayer, {useProgress} from 'react-native-track-player';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

// Màu tối cho Pocket Mode — luôn dark bất kể theme
const PM_BG = '#000000';
const PM_CARD = 'rgba(30,30,30,0.85)';
const PM_CARD_BORDER = 'rgba(255,255,255,0.08)';
const PM_TEXT = 'rgba(255,255,255,0.9)';
const PM_TEXT_DIM = 'rgba(255,255,255,0.4)';
const PM_ACCENT = '#2563EB';

/**
 * Mục đích: Format giây thành mm:ss
 * Tham số đầu vào: seconds (number)
 * Tham số đầu ra: string (mm:ss)
 * Khi nào sử dụng: Hiển thị thời gian trong Pocket Mode
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Mục đích: Pocket Mode — màn hình tối giản cho nghe thụ động khi bỏ túi
 *   Layout theo mockup: Bookmark (top), Prev/Next (sides), Play (center),
 *   Time display, Exit (bottom)
 * Tham số đầu vào: onExit (callback thoát Pocket Mode)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: PlayerScreen → user nhấn nút "Pocket Mode"
 */
export default function PocketMode({onExit}: {onExit: () => void}) {
  const haptic = useHaptic();
  const insets = useSafeAreaInsets();
  const isPlaying = useAudioPlayerStore(s => s.isPlaying);
  const setGlobalPlaying = useAudioPlayerStore(s => s.setIsPlaying);
  const progress = useProgress(500); // Cập nhật mỗi 500ms

  // Flash feedback khi tap
  const flashOpacity = useSharedValue(0);
  const [feedbackText, setFeedbackText] = useState('');
  const textOpacity = useSharedValue(0);

  /**
   * Mục đích: Hiển thị feedback ngắn khi user tap
   * Tham số đầu vào: text (string) — nội dung hiển thị
   * Tham số đầu ra: void
   * Khi nào sử dụng: Mỗi gesture action (play/pause/seek/bookmark)
   */
  const showFeedback = useCallback(
    (text: string) => {
      setFeedbackText(text);
      flashOpacity.value = withSequence(
        withTiming(0.08, {duration: 80}),
        withTiming(0, {duration: 400, easing: Easing.out(Easing.quad)}),
      );
      textOpacity.value = withSequence(
        withTiming(1, {duration: 100}),
        withTiming(0, {duration: 1000, easing: Easing.out(Easing.quad)}),
      );
    },
    [flashOpacity, textOpacity],
  );

  /**
   * Mục đích: Toggle play/pause audio
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vùng giữa (Play/Pause)
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
   * Khi nào sử dụng: User tap Prev card bên trái
   */
  const handleSeekBack = useCallback(async () => {
    try {
      haptic.light();
      const p = await TrackPlayer.getProgress();
      await TrackPlayer.seekTo(Math.max(0, p.position - 15));
      showFeedback('⏪ -15s');
    } catch (error) {
      console.log('⚠️ [PocketMode] Lỗi seek back:', error);
    }
  }, [haptic, showFeedback]);

  /**
   * Mục đích: Tua tới 15 giây
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap Next card bên phải
   */
  const handleSeekForward = useCallback(async () => {
    try {
      haptic.light();
      const p = await TrackPlayer.getProgress();
      await TrackPlayer.seekTo(Math.min(p.duration, p.position + 15));
      showFeedback('⏩ +15s');
    } catch (error) {
      console.log('⚠️ [PocketMode] Lỗi seek forward:', error);
    }
  }, [haptic, showFeedback]);

  /**
   * Mục đích: Bookmark vị trí hiện tại
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap Bookmark card phía trên
   */
  const handleBookmark = useCallback(async () => {
    haptic.light();
    showFeedback('🔖 Đã bookmark');
  }, [haptic, showFeedback]);

  /**
   * Mục đích: Thoát Pocket Mode
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap Exit card phía dưới
   */
  const handleExit = useCallback(() => {
    haptic.heavy();
    onExit();
  }, [haptic, onExit]);

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
    <View className="flex-1" style={{backgroundColor: PM_BG, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20}}>

      {/* === BOOKMARK CARD (Top) === */}
      <TouchableOpacity
        className="mx-6 mb-4 rounded-2xl items-center py-4"
        style={{backgroundColor: PM_CARD, borderWidth: 1, borderColor: PM_CARD_BORDER}}
        onPress={handleBookmark}
        activeOpacity={0.7}
        accessibilityLabel="Bookmark vị trí hiện tại"
        accessibilityRole="button">
        <Icon name="ChevronUp" className="w-5 h-5 mb-1" style={{color: PM_TEXT_DIM}} />
        <AppText className="text-sm font-sans-medium" style={{color: PM_TEXT}}>
          Bookmark
        </AppText>
      </TouchableOpacity>

      {/* === MIDDLE SECTION: Prev | Play/Pause | Next === */}
      <View className="flex-1 mx-6 flex-row" style={{gap: 12}}>
        {/* Prev Card (Left) */}
        <TouchableOpacity
          className="flex-1 rounded-2xl items-center justify-center"
          style={{backgroundColor: PM_CARD, borderWidth: 1, borderColor: PM_CARD_BORDER}}
          onPress={handleSeekBack}
          activeOpacity={0.7}
          accessibilityLabel="Tua lùi 15 giây"
          accessibilityRole="button">
          <Icon name="ChevronLeft" className="w-8 h-8 mb-2" style={{color: PM_TEXT_DIM}} />
          <AppText className="text-sm font-sans-medium" style={{color: PM_TEXT}}>
            Prev
          </AppText>
        </TouchableOpacity>

        {/* Play/Pause Card (Center — chiếm 2x) */}
        <TouchableOpacity
          className="rounded-2xl items-center justify-center"
          style={{
            flex: 2,
            backgroundColor: PM_CARD,
            borderWidth: 1,
            borderColor: PM_CARD_BORDER,
          }}
          onPress={handlePlayPause}
          activeOpacity={0.7}
          accessibilityLabel={isPlaying ? 'Tạm dừng' : 'Phát'}
          accessibilityRole="button">
          {/* Label */}
          <AppText className="text-xs mb-3" style={{color: PM_TEXT_DIM}}>
            Tap: Play/Pause
          </AppText>

          {/* Waveform Icon Circle */}
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-3"
            style={{borderWidth: 2, borderColor: PM_ACCENT}}>
            {isPlaying ? (
              /* Waveform bars khi đang phát */
              <View className="flex-row items-end" style={{gap: 2, height: 22}}>
                <View className="w-[3px] rounded-full" style={{height: 8, backgroundColor: PM_ACCENT}} />
                <View className="w-[3px] rounded-full" style={{height: 16, backgroundColor: PM_ACCENT}} />
                <View className="w-[3px] rounded-full" style={{height: 22, backgroundColor: PM_ACCENT}} />
                <View className="w-[3px] rounded-full" style={{height: 12, backgroundColor: PM_ACCENT}} />
                <View className="w-[3px] rounded-full" style={{height: 18, backgroundColor: PM_ACCENT}} />
              </View>
            ) : (
              <Icon name="Play" className="w-6 h-6" style={{color: PM_ACCENT}} />
            )}
          </View>

          {/* Time display */}
          <AppText className="text-lg font-sans-bold" style={{color: PM_TEXT}}>
            {formatTime(progress.position)}
            <AppText className="text-sm font-sans-medium" style={{color: PM_TEXT_DIM}}>
              {' '}/ {formatTime(progress.duration)}
            </AppText>
          </AppText>

          {/* Label */}
          <AppText className="text-xs mt-1" style={{color: PM_TEXT_DIM}}>
            Pocket Mode
          </AppText>
        </TouchableOpacity>

        {/* Next Card (Right) */}
        <TouchableOpacity
          className="flex-1 rounded-2xl items-center justify-center"
          style={{backgroundColor: PM_CARD, borderWidth: 1, borderColor: PM_CARD_BORDER}}
          onPress={handleSeekForward}
          activeOpacity={0.7}
          accessibilityLabel="Tua tới 15 giây"
          accessibilityRole="button">
          <Icon name="ChevronRight" className="w-8 h-8 mb-2" style={{color: PM_TEXT_DIM}} />
          <AppText className="text-sm font-sans-medium" style={{color: PM_TEXT}}>
            Next
          </AppText>
        </TouchableOpacity>
      </View>

      {/* === EXIT CARD (Bottom) === */}
      <TouchableOpacity
        className="mx-6 mt-4 rounded-2xl items-center py-4"
        style={{backgroundColor: PM_CARD, borderWidth: 1, borderColor: PM_CARD_BORDER}}
        onPress={handleExit}
        activeOpacity={0.7}
        accessibilityLabel="Thoát Pocket Mode"
        accessibilityRole="button">
        <Icon name="ChevronDown" className="w-5 h-5 mb-1" style={{color: PM_TEXT_DIM}} />
        <AppText className="text-sm font-sans-medium" style={{color: PM_TEXT}}>
          Exit
        </AppText>
      </TouchableOpacity>

      {/* Flash overlay — feedback khi tap */}
      <Animated.View
        pointerEvents="none"
        className="absolute inset-0"
        style={[{backgroundColor: '#FFFFFF'}, flashStyle]}
      />

      {/* Text feedback — hiện ngắn giữa màn hình */}
      <Animated.View
        pointerEvents="none"
        className="absolute inset-0 items-center justify-center"
        style={textStyle}>
        <AppText className="text-white text-2xl font-sans-bold">
          {feedbackText}
        </AppText>
      </Animated.View>
    </View>
  );
}
