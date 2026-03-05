import React from 'react';
import {TouchableOpacity, View, Dimensions} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useAudioPlayerStore} from '@/store/useAudioPlayerStore';
import {useListeningStore} from '@/store/useListeningStore';
import TrackPlayer, {usePlaybackState, useProgress, State} from 'react-native-track-player';
import {useHaptic} from '@/hooks/useHaptic';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useColors} from '@/hooks/useColors';
// BUG-05 fix: Dùng chung utility thay vì duplicate
import {formatTime} from '@/utils/formatTime';

const LISTENING_BLUE = '#2563EB';
const {width: SCREEN_WIDTH} = Dimensions.get('window');
// Chiều rộng pill — tối thiểu 200, tối đa 65% màn hình
const PILL_WIDTH = Math.min(SCREEN_WIDTH * 0.65, 280);

/**
 * Mục đích: Floating pill MinimizedPlayer — hiện khi player thu nhỏ
 *   Pill hình viên thuốc, position absolute, góc phải dưới, draggable
 *   Nội dung: waveform + tên bài + speaker đang nói + thời gian + nút play + nút close
 * Tham số đầu vào: không (đọc từ stores)
 * Tham số đầu ra: JSX.Element | null
 * Khi nào sử dụng: RootNavigator render component này khi playerMode === 'minimized'
 *   Tap = mở full PlayerScreen, Tap play = toggle, Tap X = đóng, Kéo = di chuyển
 */
export default function MinimizedPlayer() {
  const haptic = useHaptic();
  const colors = useColors();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const playerMode = useAudioPlayerStore(state => state.playerMode);
  const setPlayerMode = useAudioPlayerStore(state => state.setPlayerMode);
  const setGlobalPlaying = useAudioPlayerStore(state => state.setIsPlaying);

  const config = useListeningStore(state => state.config);
  const selectedTopic = useListeningStore(state => state.selectedTopic);
  const conversation = useListeningStore(state => state.conversation);
  const currentExchangeIndex = useListeningStore(state => state.currentExchangeIndex);
  const numSpeakers = config.numSpeakers ?? 2;

  const playbackState = usePlaybackState();
  const isTrackPlaying = playbackState.state === State.Playing;
  const progress = useProgress(500);

  // Vị trí draggable
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  // Animated style — PHẢI gọi trước early return (Rules of Hooks)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
    ],
  }));

  // Chỉ hiện khi mode = minimized — đặt SAU tất cả hooks
  if (playerMode !== 'minimized') {
    return null;
  }

  // Tên chủ đề — truncate
  const topicName = selectedTopic?.name || config.topic || 'Bài nghe';

  // Lấy tên speaker đang nói hiện tại
  const exchanges = conversation?.conversation || [];
  const currentExchange = exchanges[currentExchangeIndex];
  const speakerName = currentExchange?.speaker || '';

  /**
   * Mục đích: Tap pill → mở full PlayerScreen
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào phần body của pill (trừ nút play/close)
   */
  const handleExpand = () => {
    haptic.light();
    setPlayerMode('full');
    navigation.navigate('Listening', {screen: 'Player'});
  };

  /**
   * Mục đích: Toggle play/pause
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap nút play/pause trên pill
   */
  const handlePlayPause = async () => {
    haptic.light();
    if (isTrackPlaying) {
      await TrackPlayer.pause();
      setGlobalPlaying(false);
    } else {
      await TrackPlayer.play();
      setGlobalPlaying(true);
    }
  };

  /**
   * Mục đích: Đóng pill — dừng phát, reset player
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap nút X trên pill
   */
  const handleClose = async () => {
    haptic.light();
    await TrackPlayer.reset();
    setGlobalPlaying(false);
    setPlayerMode('hidden');
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

  // Tap → expand full player
  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(handleExpand)();
  });

  // Kết hợp gestures: drag ưu tiên, nếu không drag thì tap
  const composedGesture = Gesture.Race(
    dragGesture,
    tapGesture,
  );

  // Tính phần trăm progress
  const progressPercent = progress.duration > 0
    ? (progress.position / progress.duration) * 100
    : 0;

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: insets.bottom + 70,
            right: 16,
            width: PILL_WIDTH,
            borderRadius: 28,
            // Glass-effect shadow với màu xanh nhẹ
            shadowColor: LISTENING_BLUE,
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.18,
            shadowRadius: 16,
            elevation: 12,
          },
          animatedStyle,
        ]}>
        {/* Progress line — thanh xanh mỏng trên đỉnh pill */}
        <View
          className="overflow-hidden"
          style={{
            height: 3,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            backgroundColor: `${LISTENING_BLUE}15`,
          }}>
          <View
            className="h-full"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: LISTENING_BLUE,
              borderTopLeftRadius: 28,
            }}
          />
        </View>

        {/* Body của pill */}
        <View
          className="flex-row items-center px-3 py-2"
          style={{
            borderRadius: 28,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderWidth: 1,
            borderTopWidth: 0,
            borderColor: `${LISTENING_BLUE}20`,
            backgroundColor: colors.neutrals900,
          }}>
          {/* Waveform bars indicator */}
          <View className="flex-row items-end mr-2" style={{gap: 1.5, height: 16}}>
            {[6, 12, 16, 8, 14].map((h, i) => (
              <View
                key={i}
                className="w-[2.5px] rounded-full"
                style={{
                  height: isTrackPlaying ? h : h * 0.35,
                  backgroundColor: LISTENING_BLUE,
                  opacity: isTrackPlaying ? 1 : 0.4,
                }}
              />
            ))}
          </View>

          {/* Title + Speaker + Time */}
          <View className="flex-1 mr-1.5" style={{minWidth: 0}}>
            <AppText
              className="text-[12px] font-sans-bold"
              style={{color: colors.foreground}}
              numberOfLines={1}>
              {topicName}
            </AppText>
            <AppText className="text-[10px]" style={{color: colors.neutrals300}} numberOfLines={1}>
              {formatTime(progress.position)} / {formatTime(progress.duration)} · {numSpeakers}sp
              {speakerName ? ` · 🎤${speakerName}` : ''}
            </AppText>
          </View>

          {/* Play/Pause button */}
          <TouchableOpacity
            onPress={handlePlayPause}
            className="w-7 h-7 rounded-full items-center justify-center mr-1.5"
            style={{backgroundColor: `${LISTENING_BLUE}20`}}
            hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
            activeOpacity={0.7}
            accessibilityLabel={isTrackPlaying ? 'Tạm dừng' : 'Phát'}
            accessibilityRole="button">
            <Icon
              name={isTrackPlaying ? 'Pause' : 'Play'}
              className="w-3.5 h-3.5"
              style={{color: LISTENING_BLUE}}
            />
          </TouchableOpacity>

          {/* Close button */}
          <TouchableOpacity
            onPress={handleClose}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            activeOpacity={0.7}
            accessibilityLabel="Đóng mini player"
            accessibilityRole="button">
            <Icon
              name="X"
              className="w-3.5 h-3.5"
              style={{color: colors.neutrals400}}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
