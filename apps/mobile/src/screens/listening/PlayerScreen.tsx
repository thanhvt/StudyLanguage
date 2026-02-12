import React, {useEffect} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useListeningStore} from '@/store/useListeningStore';
import TrackPlayer, {usePlaybackState, State} from 'react-native-track-player';
import {setupPlayer} from '@/services/audio/trackPlayer';
import {useToast} from '@/components/ui/ToastProvider';
import {useDialog} from '@/components/ui/DialogProvider';
import {useHaptic} from '@/hooks/useHaptic';

// Tốc độ có thể chọn
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

/**
 * Mục đích: Màn hình phát bài nghe + hiển thị transcript
 * Tham số đầu vào: navigation (React Navigation props)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Sau khi ConfigScreen generate conversation thành công
 *   - Hiển thị transcript hội thoại
 *   - Điều khiển play/pause (TODO: tích hợp Track Player)
 *   - Highlight exchange đang phát
 *   - Đổi tốc độ phát
 */
export default function ListeningPlayerScreen({
  navigation,
}: {
  navigation: any;
}) {
  const conversation = useListeningStore(state => state.conversation);
  const isPlaying = useListeningStore(state => state.isPlaying);
  const togglePlaying = useListeningStore(state => state.togglePlaying);
  const currentExchangeIndex = useListeningStore(
    state => state.currentExchangeIndex,
  );
  const setCurrentExchangeIndex = useListeningStore(
    state => state.setCurrentExchangeIndex,
  );
  const playbackSpeed = useListeningStore(state => state.playbackSpeed);
  const setPlaybackSpeed = useListeningStore(state => state.setPlaybackSpeed);
  const config = useListeningStore(state => state.config);
  const reset = useListeningStore(state => state.reset);
  const playbackState = usePlaybackState();
  const isTrackPlaying = playbackState.state === State.Playing;

  const {showError, showInfo} = useToast();
  const {showConfirm} = useDialog();
  const haptic = useHaptic();

  // Khởi tạo Track Player khi vào màn hình
  useEffect(() => {
    setupPlayer();
  }, []);

  if (!conversation) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <AppText className="text-neutrals400">
          Không có dữ liệu hội thoại
        </AppText>
      </View>
    );
  }

  const exchanges = conversation.conversation || [];

  /**
   * Mục đích: Xử lý khi user nhấn vào 1 exchange trong transcript
   * Tham số đầu vào: index (number) - vị trí exchange
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn vào 1 câu trong transcript để nhảy tới
   */
  const handleExchangePress = (index: number) => {
    setCurrentExchangeIndex(index);
    // TODO: Seek audio tới vị trí tương ứng khi có Track Player
    console.log('📍 [Player] Nhảy đến exchange:', index);
  };

  /**
   * Mục đích: Quay lại ConfigScreen và reset listening state
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút "Bài mới"
   */
  const handleNewConversation = () => {
    showConfirm(
      'Tạo bài mới?',
      'Bài nghe hiện tại sẽ bị xóa. Bạn có chắc muốn tiếp tục?',
      () => {
        haptic.medium();
        reset();
        navigation.goBack();
      },
    );
  };

  /**
   * Mục đích: Chuyển sang tốc độ tiếp theo trong danh sách SPEEDS
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút tốc độ phát
   */
  const cycleSpeed = async () => {
    const currentIdx = SPEEDS.indexOf(playbackSpeed);
    const nextIdx = (currentIdx + 1) % SPEEDS.length;
    const newSpeed = SPEEDS[nextIdx];
    setPlaybackSpeed(newSpeed);
    // Áp dụng tốc độ cho Track Player
    try {
      await TrackPlayer.setRate(newSpeed);
      haptic.light();
      showInfo('Tốc độ phát', `Đã chuyển sang ${newSpeed}x`);
      console.log('🎵 [Player] Đổi tốc độ:', newSpeed);
    } catch (error) {
      showError('Lỗi đổi tốc độ', 'Không thể thay đổi tốc độ phát');
      console.error('Lỗi đổi tốc độ:', error);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-safe-offset-4 pb-3 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2">
          <Icon name="ArrowLeft" className="w-6 h-6 text-foreground" />
        </TouchableOpacity>
        <AppText className="text-foreground font-sans-bold text-lg flex-1 text-center">
          {conversation.title || config.topic || 'Bài nghe'}
        </AppText>
        <View className="w-10" />
      </View>

      {/* Transcript */}
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 120}}>
        {/* Summary */}
        {conversation.summary && (
          <View className="bg-neutrals900 rounded-2xl p-4 mb-4">
            <AppText className="text-neutrals400 text-sm">
              {conversation.summary}
            </AppText>
          </View>
        )}

        {/* Danh sách exchanges */}
        <View className="gap-3">
          {exchanges.map((exchange, index) => {
            const isActive = index === currentExchangeIndex;
            const isEvenSpeaker = index % 2 === 0;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleExchangePress(index)}
                activeOpacity={0.7}
                className={`rounded-2xl p-4 border ${
                  isActive
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-neutrals950 border-transparent'
                }`}>
                {/* Speaker label */}
                <View className="flex-row items-center mb-2">
                  <View
                    className={`w-7 h-7 rounded-full items-center justify-center mr-2 ${
                      isEvenSpeaker ? 'bg-blue-500/20' : 'bg-green-500/20'
                    }`}>
                    <AppText className="text-xs">
                      {isEvenSpeaker ? '👤' : '👥'}
                    </AppText>
                  </View>
                  <AppText
                    className={`text-sm font-sans-semibold ${
                      isEvenSpeaker ? 'text-blue-400' : 'text-green-400'
                    }`}>
                    {exchange.speaker}
                  </AppText>
                  {isActive && (
                    <View className="ml-auto">
                      <Icon
                        name="Volume2"
                        className="w-4 h-4 text-primary"
                      />
                    </View>
                  )}
                </View>

                {/* Nội dung tiếng Anh */}
                <AppText className="text-foreground text-base leading-6">
                  {exchange.text}
                </AppText>

                {/* Bản dịch tiếng Việt */}
                {exchange.vietnamese && (
                  <AppText className="text-neutrals500 text-sm mt-1 italic">
                    {exchange.vietnamese}
                  </AppText>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Từ vựng */}
        {conversation.vocabulary && conversation.vocabulary.length > 0 && (
          <View className="mt-6">
            <AppText className="text-foreground font-sans-bold text-base mb-3">
              📝 Từ vựng đáng chú ý
            </AppText>
            <View className="flex-row flex-wrap gap-2">
              {conversation.vocabulary.map((word, i) => (
                <View
                  key={i}
                  className="bg-neutrals900 rounded-xl px-3 py-2">
                  <AppText className="text-foreground text-sm">
                    {word}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Playback controls */}
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-neutrals900 px-6 pb-safe-offset-4 pt-4">
        <View className="flex-row items-center justify-between">
          {/* Tốc độ */}
          <TouchableOpacity
            className="bg-neutrals900 rounded-full px-3 py-2"
            onPress={cycleSpeed}>
            <AppText className="text-foreground font-sans-bold text-sm">
              {playbackSpeed}x
            </AppText>
          </TouchableOpacity>

          {/* Điều khiển phát */}
          <View className="flex-row items-center gap-6">
            {/* Lùi 10s */}
            <TouchableOpacity
              onPress={() => {
                if (currentExchangeIndex > 0) {
                  setCurrentExchangeIndex(currentExchangeIndex - 1);
                }
              }}>
              <Icon
                name="SkipBack"
                className="w-6 h-6 text-neutrals300"
              />
            </TouchableOpacity>

            {/* Play/Pause */}
            <TouchableOpacity
              className="w-14 h-14 bg-primary rounded-full items-center justify-center"
              onPress={async () => {
                togglePlaying();
                try {
                  if (isTrackPlaying) {
                    await TrackPlayer.pause();
                  } else {
                    await TrackPlayer.play();
                  }
                } catch (error) {
                  showError('Lỗi phát audio', 'Chưa có audio track để phát. Vui lòng thử lại');
                  console.log('🎵 [Player] Chưa có audio track để phát');
                }
              }}>
              <Icon
                name={isTrackPlaying ? 'Pause' : 'Play'}
                className="w-7 h-7 text-white"
              />
            </TouchableOpacity>

            {/* Tới 10s */}
            <TouchableOpacity
              onPress={() => {
                if (currentExchangeIndex < exchanges.length - 1) {
                  setCurrentExchangeIndex(currentExchangeIndex + 1);
                }
              }}>
              <Icon
                name="SkipForward"
                className="w-6 h-6 text-neutrals300"
              />
            </TouchableOpacity>
          </View>

          {/* Nút bài mới */}
          <TouchableOpacity
            className="bg-neutrals900 rounded-full px-3 py-2"
            onPress={handleNewConversation}>
            <Icon name="RefreshCw" className="w-4 h-4 text-neutrals300" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
