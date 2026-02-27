import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useAudioPlayerStore} from '@/store/useAudioPlayerStore';
import TrackPlayer, {usePlaybackState, State} from 'react-native-track-player';
import {useHaptic} from '@/hooks/useHaptic';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

const LISTENING_BLUE = '#2563EB';

/**
 * Mục đích: Floating pill nhỏ gọn — hiện khi user vuốt compact player xuống
 * Tham số đầu vào: không (đọc từ useAudioPlayerStore)
 * Tham số đầu ra: JSX.Element | null
 * Khi nào sử dụng: RootNavigator render component này
 *   - playerMode === 'minimized' → hiện FAB pill góc phải dưới
 *   - Tap → expand lại compact player
 *   - Long press → mở full PlayerScreen
 *   - Draggable: user có thể kéo pill đến vị trí khác
 */
export default function MinimizedPlayer() {
  const haptic = useHaptic();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const playerMode = useAudioPlayerStore(state => state.playerMode);
  const isPlaying = useAudioPlayerStore(state => state.isPlaying);
  const setPlayerMode = useAudioPlayerStore(state => state.setPlayerMode);

  const playbackState = usePlaybackState();
  const isTrackPlaying = playbackState.state === State.Playing;

  // Vị trí draggable
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  // Chỉ hiện khi mode = minimized
  if (playerMode !== 'minimized') {
    return null;
  }

  /**
   * Mục đích: Expand pill thành compact player
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào minimized pill
   */
  const handleExpand = () => {
    haptic.light();
    setPlayerMode('compact');
  };

  /**
   * Mục đích: Mở full PlayerScreen
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User long-press vào minimized pill
   */
  const handleOpenFull = () => {
    haptic.medium();
    setPlayerMode('full');
    navigation.navigate('Listening', {screen: 'Player'});
  };

  /**
   * Mục đích: Toggle play/pause
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Tap vào nút play nhỏ trên pill
   */
  const handlePlayPause = async () => {
    haptic.light();
    if (isTrackPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  // Drag gesture — cho phép kéo pill tự do
  const dragGesture = Gesture.Pan()
    .onUpdate(e => {
      translateX.value = savedX.value + e.translationX;
      translateY.value = savedY.value + e.translationY;
    })
    .onEnd(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    });

  // Tap + Long press
  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(handleExpand)();
  });

  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onEnd(() => {
      runOnJS(handleOpenFull)();
    });

  // Kết hợp gestures
  const composedGesture = Gesture.Race(
    dragGesture,
    Gesture.Exclusive(longPressGesture, tapGesture),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
    ],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: insets.bottom + 80,
            right: 16,
            borderRadius: 28,
            shadowColor: LISTENING_BLUE,
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 10,
          },
          animatedStyle,
        ]}>
        <View
          className="bg-neutrals900 flex-row items-center px-3 py-2.5"
          style={{
            borderRadius: 28,
            gap: 8,
            borderWidth: 1,
            borderColor: `${LISTENING_BLUE}30`,
          }}>
          {/* Animated indicator */}
          <View
            className="w-2.5 h-2.5 rounded-full"
            style={{backgroundColor: isPlaying ? LISTENING_BLUE : '#525252'}}
          />

          {/* Label */}
          <AppText className="text-foreground text-xs font-sans-medium">
            🎧
          </AppText>

          {/* Play/Pause mini button */}
          <TouchableOpacity
            onPress={handlePlayPause}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            activeOpacity={0.7}
            accessibilityLabel={isTrackPlaying ? 'Tạm dừng' : 'Phát'}
            accessibilityRole="button">
            <Icon
              name={isTrackPlaying ? 'Pause' : 'Play'}
              className="w-4 h-4"
              style={{color: LISTENING_BLUE}}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
