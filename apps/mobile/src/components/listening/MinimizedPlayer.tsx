import React, {useEffect, useRef} from 'react';
import {TouchableOpacity, View, Dimensions} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useAudioPlayerStore} from '@/store/useAudioPlayerStore';
import {useListeningStore} from '@/store/useListeningStore';
import {useRadioStore} from '@/store/useRadioStore';
import TrackPlayer, {usePlaybackState, useProgress, State} from 'react-native-track-player';
import {useHaptic} from '@/hooks/useHaptic';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useColors} from '@/hooks/useColors';
// BUG-05 fix: Dùng chung utility thay vì duplicate
import {formatTime} from '@/utils/formatTime';

const LISTENING_BLUE = '#2563EB';
const RADIO_ACCENT = '#2563EB'; // Cùng màu xanh cho consistency
const {width: SCREEN_WIDTH} = Dimensions.get('window');
// Chiều rộng pill — tối thiểu 200, tối đa 65% màn hình
const PILL_WIDTH = Math.min(SCREEN_WIDTH * 0.65, 280);
const PILL_RADIUS = 15;

// Cấu hình waveform bars
const WAVEFORM_BARS = [
  {baseHeight: 6, delay: 0},
  {baseHeight: 12, delay: 100},
  {baseHeight: 16, delay: 50},
  {baseHeight: 8, delay: 150},
  {baseHeight: 14, delay: 75},
];

/**
 * Mục đích: Floating pill MinimizedPlayer — hiện khi player thu nhỏ
 *   Pill hình viên thuốc, position absolute, góc phải dưới, draggable
 *   Nội dung: waveform (animated) + tên bài + speaker + thời gian + nút play + nút close
 *   Hỗ trợ dual-mode: Listening (podcast) VÀ Radio — dựa trên activeSource
 * Tham số đầu vào: không (đọc từ stores)
 * Tham số đầu ra: JSX.Element | null
 * Khi nào sử dụng: RootNavigator render component này khi playerMode === 'minimized'
 *   Tap body = mở full screen tương ứng, Tap play = toggle, Tap X = đóng, Kéo = di chuyển
 */
export default function MinimizedPlayer() {
  const haptic = useHaptic();
  const colors = useColors();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const playerMode = useAudioPlayerStore(state => state.playerMode);
  const activeSource = useAudioPlayerStore(state => state.activeSource);
  const setPlayerMode = useAudioPlayerStore(state => state.setPlayerMode);
  const setGlobalPlaying = useAudioPlayerStore(state => state.setIsPlaying);

  // === Listening store selectors ===
  const listeningConfig = useListeningStore(state => state.config);
  const listeningSelectedTopic = useListeningStore(state => state.selectedTopic);
  const listeningConversation = useListeningStore(state => state.conversation);
  const listeningCurrentExchangeIndex = useListeningStore(state => state.currentExchangeIndex);
  const setListeningExchangeIndex = useListeningStore(state => state.setCurrentExchangeIndex);
  const listeningTimestamps = useListeningStore(state => state.timestamps);
  const listeningNumSpeakers = listeningConfig.numSpeakers ?? 2;

  // === Radio store selectors ===
  const radioPlaylist = useRadioStore(state => state.currentPlaylist);
  const radioTrackIndex = useRadioStore(state => state.currentTrackIndex);
  const radioPlaybackState = useRadioStore(state => state.playbackState);

  // Xác định source hiện tại
  const isRadio = activeSource === 'radio';

  const playbackState = usePlaybackState();
  const isTrackPlaying = playbackState.state === State.Playing;
  const progress = useProgress(500);

  // Vị trí draggable
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  // Waveform animation — 5 thanh, mỗi thanh 1 shared value
  const bar0 = useSharedValue(WAVEFORM_BARS[0].baseHeight * 0.35);
  const bar1 = useSharedValue(WAVEFORM_BARS[1].baseHeight * 0.35);
  const bar2 = useSharedValue(WAVEFORM_BARS[2].baseHeight * 0.35);
  const bar3 = useSharedValue(WAVEFORM_BARS[3].baseHeight * 0.35);
  const bar4 = useSharedValue(WAVEFORM_BARS[4].baseHeight * 0.35);
  const barValues = [bar0, bar1, bar2, bar3, bar4];

  // Animated style cho pill (drag)
  const pillAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
    ],
  }));

  // Animated styles cho từng waveform bar
  const barStyle0 = useAnimatedStyle(() => ({height: bar0.value}));
  const barStyle1 = useAnimatedStyle(() => ({height: bar1.value}));
  const barStyle2 = useAnimatedStyle(() => ({height: bar2.value}));
  const barStyle3 = useAnimatedStyle(() => ({height: bar3.value}));
  const barStyle4 = useAnimatedStyle(() => ({height: bar4.value}));
  const barStyles = [barStyle0, barStyle1, barStyle2, barStyle3, barStyle4];

  /**
   * Mục đích: Animate waveform bars khi đang phát, dừng khi pause
   * Tham số đầu vào: isTrackPlaying (boolean)
   * Tham số đầu ra: void
   * Khi nào sử dụng: useEffect theo dõi isTrackPlaying
   */
  useEffect(() => {
    if (isTrackPlaying) {
      // Bắt đầu animation: mỗi bar dao động lên xuống theo pattern khác nhau
      WAVEFORM_BARS.forEach((cfg, i) => {
        const minH = cfg.baseHeight * 0.25;
        const maxH = cfg.baseHeight;
        barValues[i].value = withDelay(
          cfg.delay,
          withRepeat(
            withSequence(
              withTiming(maxH, {duration: 300 + i * 50, easing: Easing.inOut(Easing.ease)}),
              withTiming(minH, {duration: 250 + i * 40, easing: Easing.inOut(Easing.ease)}),
            ),
            -1, // Lặp vô hạn
            true, // Reverse
          ),
        );
      });
    } else {
      // Dừng: co bars về kích thước nhỏ
      barValues.forEach((val, i) => {
        cancelAnimation(val);
        val.value = withTiming(WAVEFORM_BARS[i].baseHeight * 0.35, {duration: 200});
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTrackPlaying]);

  /**
   * Mục đích: Sync currentExchangeIndex theo audio position — giữ speaker name real-time
   * Tham số đầu vào: progress.position, timestamps, isTrackPlaying
   * Tham số đầu ra: void (cập nhật store)
   * Khi nào sử dụng: Khi PlayerScreen unmount, MinimizedPlayer tiếp quản sync
   *   Chỉ sync cho Listening mode — Radio dùng track-level navigation
   */
  useEffect(() => {
    // Chỉ sync transcript cho Listening mode
    if (isRadio) {return;}
    if (!listeningTimestamps?.length || !isTrackPlaying) {return;}
    const currentTime = progress.position;
    const activeIndex = listeningTimestamps.findIndex(
      ts => currentTime >= ts.startTime && currentTime < ts.endTime,
    );
    // Dùng getState() thay vì reactive dep để tránh infinite loop
    const currentIdx = useListeningStore.getState().currentExchangeIndex;
    if (activeIndex !== -1 && activeIndex !== currentIdx) {
      setListeningExchangeIndex(activeIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.position, listeningTimestamps, isTrackPlaying, isRadio]);

  // Chỉ hiện khi mode = minimized — đặt SAU tất cả hooks
  if (playerMode !== 'minimized') {
    return null;
  }

  // Tên chủ đề — khác nhau giữa Listening và Radio
  const topicName = isRadio
    ? (radioPlaylist?.items[radioTrackIndex]?.topic || 'Radio')
    : (listeningSelectedTopic?.name || listeningConfig.topic || 'Bài nghe');

  // Lấy tên speaker đang nói hiện tại (chỉ Listening có transcript-level tracking)
  const exchanges = isRadio ? [] : (listeningConversation?.conversation || []);
  const currentExchange = isRadio ? null : exchanges[listeningCurrentExchangeIndex];
  const speakerName = currentExchange?.speaker || '';

  // Số speakers
  const numSpeakers = isRadio
    ? (radioPlaylist?.items[radioTrackIndex]?.numSpeakers ?? 0)
    : listeningNumSpeakers;

  /**
   * Mục đích: Tap body pill → mở full screen tương ứng
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào phần body của pill (trừ nút play/close)
   *   Listening → navigate tới Player screen
   *   Radio → navigate tới Radio screen
   */
  const handleExpand = () => {
    haptic.light();
    setPlayerMode('full');
    if (isRadio) {
      navigation.navigate('Listening', {screen: 'Radio'});
    } else {
      navigation.navigate('Listening', {screen: 'Player'});
    }
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
      // DESYNC fix: Đồng bộ radioStore khi pause từ pill
      if (isRadio) {
        useRadioStore.getState().setPlaybackState('paused');
      }
    } else {
      await TrackPlayer.play();
      setGlobalPlaying(true);
      // DESYNC fix: Đồng bộ radioStore khi resume từ pill
      if (isRadio) {
        useRadioStore.getState().setPlaybackState('playing');
      }
    }
  };

  /**
   * Mục đích: Đóng pill — dừng phát, reset player
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap nút X trên pill
   *   Reset cả TrackPlayer + global store + source-specific store
   */
  const handleClose = async () => {
    haptic.light();
    await TrackPlayer.reset();
    setGlobalPlaying(false);
    // Reset Radio store nếu đang là Radio source
    if (isRadio) {
      useRadioStore.getState().setPlaybackState('idle');
    }
    useAudioPlayerStore.getState().resetPlayer();
  };

  // Drag gesture — chỉ activate khi kéo > 10px, tap ngắn pass-through ngay
  const dragGesture = Gesture.Pan()
    .minDistance(10)
    .onUpdate(e => {
      translateX.value = savedX.value + e.translationX;
      translateY.value = savedY.value + e.translationY;
    })
    .onEnd(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    });

  // Tính phần trăm progress
  const progressPercent = progress.duration > 0
    ? (progress.position / progress.duration) * 100
    : 0;

  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: insets.bottom + 70,
            right: 16,
            width: PILL_WIDTH,
            borderRadius: PILL_RADIUS,
            overflow: 'hidden',
            // Glass-effect shadow
            shadowColor: LISTENING_BLUE,
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.18,
            shadowRadius: 16,
            elevation: 12,
          },
          pillAnimatedStyle,
        ]}>
        {/* Progress line — thanh xanh mỏng trên đỉnh pill */}
        <View
          style={{
            height: 3,
            backgroundColor: `${LISTENING_BLUE}15`,
          }}>
          <View
            className="h-full"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: LISTENING_BLUE,
            }}
          />
        </View>

        {/* Body của pill — TouchableOpacity để tap expand */}
        <TouchableOpacity
          onPress={handleExpand}
          activeOpacity={0.85}
          accessibilityLabel="Mở full player"
          accessibilityRole="button">
          <View
            className="flex-row items-center px-3 py-2"
            style={{
              borderWidth: 1,
              borderTopWidth: 0,
              borderColor: `${LISTENING_BLUE}20`,
              backgroundColor: colors.neutrals900,
            }}>
            {/* Waveform bars — animated */}
            <View className="flex-row items-end mr-2" style={{gap: 1.5, height: 16}}>
              {WAVEFORM_BARS.map((cfg, i) => (
                <Animated.View
                  key={i}
                  style={[
                    {
                      width: 2.5,
                      borderRadius: 2,
                      backgroundColor: LISTENING_BLUE,
                      opacity: isTrackPlaying ? 1 : 0.4,
                    },
                    barStyles[i],
                  ]}
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
                {formatTime(progress.position)} / {formatTime(progress.duration)} · {numSpeakers} speakers
                {speakerName ? ` · 🎤  ${speakerName}` : ''}
              </AppText>
            </View>

            {/* Play/Pause button — stopPropagation tránh trigger expand */}
            <TouchableOpacity
              onPress={handlePlayPause}
              className="w-7 h-7 rounded-full items-center justify-center mr-1.5"
              style={{backgroundColor: `${LISTENING_BLUE}20`}}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              activeOpacity={0.6}
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
              activeOpacity={0.6}
              accessibilityLabel="Đóng mini player"
              accessibilityRole="button">
              <Icon
                name="X"
                className="w-3.5 h-3.5"
                style={{color: colors.neutrals400}}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}
