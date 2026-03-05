/**
 * NowPlayingBar — Mini bar hiển thị track đang phát
 *
 * Mục đích: Hiện ở bottom của ConfigScreen khi có track radio đang phát
 * Tham số đầu vào: không (đọc từ useRadioStore)
 * Tham số đầu ra: JSX.Element | null
 * Khi nào sử dụng: Khi user rời RadioScreen nhưng vẫn đang phát audio
 */
import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useRadioStore} from '@/store/useRadioStore';
import {useRadioPlayer} from '@/hooks/useRadioPlayer';

const LISTENING_BLUE = '#2563EB';

/**
 * Mục đích: Mini bar ở bottom hiện track đang phát + controls
 * Tham số đầu vào: onPress (tap để mở RadioScreen)
 * Tham số đầu ra: JSX.Element | null (null nếu không có track đang phát)
 * Khi nào sử dụng: ConfigScreen render ở bottom khi có radio đang phát
 */
export default function NowPlayingBar({onPress}: {onPress?: () => void}) {
  const playbackState = useRadioStore(s => s.playbackState);
  const currentPlaylist = useRadioStore(s => s.currentPlaylist);
  const currentTrackIndex = useRadioStore(s => s.currentTrackIndex);
  const {togglePlay, skip} = useRadioPlayer();

  // Ẩn nếu không đang phát
  if (!currentPlaylist || currentTrackIndex < 0 || playbackState === 'idle') {
    return null;
  }

  const track = currentPlaylist.items[currentTrackIndex];
  if (!track) {return null;}

  const isPlaying = playbackState === 'playing';
  const isLoading = playbackState === 'loading';
  const total = currentPlaylist.items.length;

  return (
    <TouchableOpacity
      className="mx-4 mb-2 rounded-2xl overflow-hidden"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
      }}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel={`Đang phát: ${track.topic}`}
      accessibilityRole="button">
      <View className="flex-row items-center px-4 py-3">
        {/* Track icon */}
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{backgroundColor: `${LISTENING_BLUE}25`}}>
          <AppText className="text-lg">📻</AppText>
        </View>

        {/* Track info */}
        <View className="flex-1 mr-3">
          <AppText
            className="font-sans-medium text-sm"
            style={{color: '#E2E8F0'}}
            numberOfLines={1}>
            {track.topic}
          </AppText>
          <AppText className="text-xs" style={{color: '#94A3B8'}}>
            Track {currentTrackIndex + 1}/{total} • {track.numSpeakers} người
          </AppText>
        </View>

        {/* Controls */}
        <View className="flex-row items-center gap-2">
          {/* Play/Pause */}
          <TouchableOpacity
            onPress={e => {
              e.stopPropagation?.();
              togglePlay();
            }}
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{backgroundColor: LISTENING_BLUE}}
            disabled={isLoading}
            accessibilityLabel={isPlaying ? 'Tạm dừng' : 'Tiếp tục phát'}
            accessibilityRole="button">
            <Icon
              name={isPlaying ? 'Pause' : 'Play'}
              className="w-4 h-4"
              style={{color: '#FFFFFF'}}
            />
          </TouchableOpacity>

          {/* Skip */}
          <TouchableOpacity
            onPress={e => {
              e.stopPropagation?.();
              skip();
            }}
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{backgroundColor: 'rgba(255,255,255,0.08)'}}
            disabled={isLoading || currentTrackIndex >= total - 1}
            accessibilityLabel="Bài tiếp theo"
            accessibilityRole="button">
            <Icon
              name="SkipForward"
              className="w-4 h-4"
              style={{color: '#94A3B8'}}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress bar nhỏ */}
      <View className="h-[2px]" style={{backgroundColor: 'rgba(255,255,255,0.05)'}}>
        <View
          className="h-full"
          style={{
            backgroundColor: LISTENING_BLUE,
            width: `${total > 0 ? ((currentTrackIndex + 1) / total) * 100 : 0}%`,
          }}
        />
      </View>
    </TouchableOpacity>
  );
}
