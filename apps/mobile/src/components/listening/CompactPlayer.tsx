import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useAudioPlayerStore} from '@/store/useAudioPlayerStore';
import {WaveformVisualizer} from '@/components/listening';
import TrackPlayer, {useProgress, usePlaybackState, State} from 'react-native-track-player';
import {useHaptic} from '@/hooks/useHaptic';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
// BUG-05 fix: Dùng chung utility thay vì duplicate
import {formatTime} from '@/utils/formatTime';

/**
 * Mục đích: Mini player cố định bottom — hiện khi user rời PlayerScreen mà audio vẫn phát
 * Tham số đầu vào: không (đọc từ useAudioPlayerStore)
 * Tham số đầu ra: JSX.Element | null
 * Khi nào sử dụng: RootNavigator render component này cùng MainStack
 *   - playerMode === 'compact' → hiện strip bar ở bottom
 *   - Vuốt xuống → chuyển sang 'minimized' (FAB pill)
 *   - Tap → quay lại PlayerScreen (mode = 'full')
 *   - Play/Pause button inline
 */
export default function CompactPlayer() {
  const haptic = useHaptic();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const playerMode = useAudioPlayerStore(state => state.playerMode);
  const lastSession = useAudioPlayerStore(state => state.lastSession);
  const setPlayerMode = useAudioPlayerStore(state => state.setPlayerMode);

  const progress = useProgress();
  const playbackState = usePlaybackState();
  const isTrackPlaying = playbackState.state === State.Playing;

  // Progress bar width
  const progressPercent =
    progress.duration > 0 ? (progress.position / progress.duration) * 100 : 0;

  // Swipe down gesture → minimize
  const translateY = useSharedValue(0);

  /**
   * Mục đích: Chuyển player sang minimized mode
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi user vuốt xuống compact player
   */
  const handleMinimize = () => {
    haptic.light();
    setPlayerMode('minimized');
  };

  const panGesture = Gesture.Pan()
    .onUpdate(e => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd(e => {
      if (e.translationY > 60) {
        // Vuốt đủ xa → minimize
        runOnJS(handleMinimize)();
      }
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
    opacity: withTiming(translateY.value > 40 ? 0.5 : 1, {duration: 100}),
  }));

  // Chỉ hiện khi mode = compact và có session
  if (playerMode !== 'compact' || !lastSession) {
    return null;
  }

  /**
   * Mục đích: Toggle play/pause
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút play/pause trên compact player
   */
  const handlePlayPause = async () => {
    haptic.light();
    if (isTrackPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  /**
   * Mục đích: Mở lại PlayerScreen ở chế độ full
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào compact player body
   */
  const handleExpand = () => {
    haptic.light();
    setPlayerMode('full');
    navigation.navigate('Listening', {screen: 'Player'});
  };

  /**
   * Mục đích: Đóng player hoàn toàn
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút X trên compact player
   */
  const handleClose = async () => {
    haptic.medium();
    try {
      await TrackPlayer.reset();
    } catch {
      // Bỏ qua nếu player chưa setup
    }
    setPlayerMode('hidden');
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: insets.bottom + 60, // Trên tab bar
            left: 12,
            right: 12,
            borderRadius: 16,
            overflow: 'hidden',
          },
          animatedStyle,
        ]}>
        {/* Nền gradient-like */}
        <View
          className="bg-neutrals900 border border-neutrals800"
          style={{borderRadius: 16}}>
          {/* Progress bar mỏng ở trên cùng */}
          <View className="h-0.5 bg-neutrals800">
            <View
              className="h-full bg-primary"
              style={{width: `${progressPercent}%`}}
            />
          </View>

          {/* Nội dung chính */}
          <View className="flex-row items-center px-4 py-3">
            {/* Waveform nhỏ — BUG-12 fix: dùng isTrackPlaying thống nhất */}
            <WaveformVisualizer isPlaying={isTrackPlaying} height={16} />

            {/* Title — tappable để expand */}
            <TouchableOpacity
              className="flex-1 mx-3"
              onPress={handleExpand}
              activeOpacity={0.7}>
              <AppText
                className="text-foreground font-sans-medium text-sm"
                numberOfLines={1}>
                {lastSession.title}
              </AppText>
              <AppText className="text-neutrals500 text-xs" numberOfLines={1}>
                {formatTime(progress.position)} / {formatTime(progress.duration)}
              </AppText>
            </TouchableOpacity>

            {/* Play/Pause */}
            <TouchableOpacity
              onPress={handlePlayPause}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              activeOpacity={0.7}
              accessibilityLabel={isTrackPlaying ? 'Tạm dừng' : 'Phát'}
              accessibilityRole="button">
              <View className="bg-primary rounded-full p-2">
                <Icon
                  name={isTrackPlaying ? 'Pause' : 'Play'}
                  className="w-4 h-4 text-primary-foreground"
                />
              </View>
            </TouchableOpacity>

            {/* Close */}
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              activeOpacity={0.7}
              className="ml-2"
              accessibilityLabel="Đóng player"
              accessibilityRole="button">
              <Icon name="X" className="w-4 h-4 text-neutrals500" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

// BUG-05 fix: Đã chuyển formatTime sang @/utils/formatTime.ts — xóa bản duplicate
