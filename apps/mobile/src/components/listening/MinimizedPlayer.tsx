import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useAudioPlayerStore} from '@/store/useAudioPlayerStore';
import {useListeningStore} from '@/store/useListeningStore';
import TrackPlayer, {usePlaybackState, useProgress, State} from 'react-native-track-player';
import {useHaptic} from '@/hooks/useHaptic';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useColors} from '@/hooks/useColors';

const LISTENING_BLUE = '#2563EB';

/**
 * Mục đích: Format giây thành m:ss
 * Tham số đầu vào: seconds (number)
 * Tham số đầu ra: string
 * Khi nào sử dụng: Hiển thị thời gian trong mini player
 */
function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) { return '0:00'; }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Mục đích: Full-width minimized player bar — hiện ở bottom trên tab bar
 *   Matching mockup: progress line, waveform, title, time, play/close
 * Tham số đầu vào: không (đọc từ stores)
 * Tham số đầu ra: JSX.Element | null
 * Khi nào sử dụng: RootNavigator render component này khi playerMode === 'minimized'
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
  const numSpeakers = config.numSpeakers ?? 2;

  const playbackState = usePlaybackState();
  const isTrackPlaying = playbackState.state === State.Playing;
  const progress = useProgress(500);

  // Chỉ hiện khi mode = minimized
  if (playerMode !== 'minimized') {
    return null;
  }

  // Tính progress percent cho thanh progress trên đỉnh
  const progressPercent = progress.duration > 0
    ? (progress.position / progress.duration) * 100
    : 0;

  // Tên chủ đề hiển thị — truncate nếu dài
  const topicName = selectedTopic?.name || config.topic || 'Bài nghe';

  /**
   * Mục đích: Tap vào bar → mở full PlayerScreen
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào toàn bộ bar (trừ nút play/close)
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
   * Khi nào sử dụng: User tap nút play/pause
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
   * Mục đích: Đóng minimized player — dừng phát và reset
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap nút X
   */
  const handleClose = async () => {
    haptic.light();
    await TrackPlayer.reset();
    setGlobalPlaying(false);
    setPlayerMode('hidden');
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: insets.bottom + 56, // 56 = chiều cao tab bar
        left: 0,
        right: 0,
        borderTopWidth: 0,
        backgroundColor: colors.neutrals900,
        borderTopColor: colors.glassBorder,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
      }}>
      {/* Progress line — thanh xanh trên đỉnh */}
      <View className="h-[3px] w-full" style={{backgroundColor: colors.glassBorder}}>
        <View
          className="h-full"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: LISTENING_BLUE,
          }}
        />
      </View>

      {/* Content bar */}
      <TouchableOpacity
        className="flex-row items-center px-4"
        style={{height: 52}}
        onPress={handleExpand}
        activeOpacity={0.8}
        accessibilityLabel={`Đang phát: ${topicName}. Nhấn để mở rộng`}
        accessibilityRole="button">

        {/* Waveform bars — bên trái */}
        <View className="flex-row items-end mr-3" style={{gap: 2, height: 20}}>
          {[8, 14, 20, 10, 16].map((h, i) => (
            <View
              key={i}
              className="w-[3px] rounded-full"
              style={{
                height: isTrackPlaying ? h : h * 0.4,
                backgroundColor: LISTENING_BLUE,
                opacity: isTrackPlaying ? 1 : 0.5,
              }}
            />
          ))}
        </View>

        {/* Title + Time — giữa, chiếm flex */}
        <View className="flex-1 mr-3">
          <AppText
            className="text-sm font-sans-bold"
            style={{color: colors.foreground}}
            numberOfLines={1}>
            {topicName}
          </AppText>
          <AppText className="text-xs" style={{color: colors.neutrals300}}>
            {formatTime(progress.position)} / {formatTime(progress.duration)}
            {numSpeakers > 0 ? ` · ${numSpeakers}sp` : ''}
          </AppText>
        </View>

        {/* Play/Pause button */}
        <TouchableOpacity
          onPress={handlePlayPause}
          className="w-9 h-9 rounded-full items-center justify-center mr-2"
          style={{backgroundColor: `${LISTENING_BLUE}20`}}
          hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
          activeOpacity={0.7}
          accessibilityLabel={isTrackPlaying ? 'Tạm dừng' : 'Phát'}
          accessibilityRole="button">
          <Icon
            name={isTrackPlaying ? 'Pause' : 'Play'}
            className="w-4.5 h-4.5"
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
            className="w-4 h-4"
            style={{color: colors.neutrals400}}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}
