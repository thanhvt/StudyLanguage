import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
  FlatList,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {AppText, AppButton} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useInsets} from '@/hooks/useInsets';
import {useToast} from '@/components/ui/ToastProvider';
import {radioApi, RadioPlaylistItem, RadioPlaylistResult} from '@/services/api/radio';
import {useAudioPlayerStore} from '@/store/useAudioPlayerStore';
import {listeningApi} from '@/services/api/listening';
import TrackPlayer, {Event} from 'react-native-track-player';
import {setupPlayer, addTrack} from '@/services/audio/trackPlayer';

// =======================
// Constants
// =======================
const LISTENING_BLUE = '#2563EB';

/** Các option duration cho Radio */
const DURATION_OPTIONS = [
  {value: 1, label: '1 phút', emoji: '⚡', desc: 'Thử nhanh'},
  {value: 30, label: '30 phút', emoji: '🎧', desc: 'Ngắn gọn'},
  {value: 60, label: '60 phút', emoji: '📻', desc: 'Tiêu chuẩn'},
  {value: 120, label: '120 phút', emoji: '🎵', desc: 'Marathon'},
];

/** Trạng thái của Radio */
type RadioState = 'idle' | 'generating' | 'ready' | 'playing' | 'error';

/**
 * Mục đích: Màn hình Radio Mode — nghe thụ động playlist tự động
 * Tham số đầu vào: navigation (React Navigation props)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: User chọn "Radio Mode" từ ConfigScreen hoặc ListeningStack
 *   - Chọn duration (1/30/60/120 phút)
 *   - Generate playlist (backend random topics)
 *   - Hiển thị danh sách track + auto-play
 */
export default function RadioScreen({navigation}: {navigation: any}) {
  const colors = useColors();
  const haptic = useHaptic();
  const insets = useInsets();
  const {showError, showSuccess} = useToast();

  // State
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [radioState, setRadioState] = useState<RadioState>('idle');
  const [playlist, setPlaylist] = useState<RadioPlaylistResult | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Global player store
  const setPlayerMode = useAudioPlayerStore(s => s.setPlayerMode);
  const setGlobalPlaying = useAudioPlayerStore(s => s.setIsPlaying);

  // Ref cho current index (tránh stale closure trong event listener)
  const currentTrackIndexRef = useRef(-1);

  // BUG-03 fix: Ref cho handlePlayTrack để event listener luôn dùng phiên bản mới nhất
  const handlePlayTrackRef = useRef<((item: RadioPlaylistItem, index: number) => Promise<void>) | undefined>(undefined);

  /**
   * Mục đích: Auto chuyển sang track tiếp theo khi track hiện tại kết thúc
   * Khi nào sử dụng: TrackPlayer phát xong queue → listener tự chạy
   */
  useEffect(() => {
    const subscription = TrackPlayer.addEventListener(
      Event.PlaybackQueueEnded,
      async () => {
        const idx = currentTrackIndexRef.current;
        const items = playlist?.items;
        if (!items || idx < 0 || idx >= items.length - 1) {
          console.log('📻 [Radio] Playlist đã phát hết');
          setGlobalPlaying(false);
          return;
        }
        // Tự động phát track tiếp theo — dùng ref để tránh stale closure
        const nextIdx = idx + 1;
        console.log(`📻 [Radio] Auto next → track ${nextIdx + 1}`);
        if (handlePlayTrackRef.current) {
          await handlePlayTrackRef.current(items[nextIdx], nextIdx);
        }
        // Auto scroll tới track đang phát
        flatListRef.current?.scrollToIndex({index: nextIdx, animated: true});
      },
    );
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlist]);

  /**
   * Mục đích: Generate playlist từ backend
   * Tham số đầu vào: không (dùng selectedDuration)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Bắt đầu" sau khi chọn duration
   */
  const handleGenerate = useCallback(async () => {
    try {
      haptic.medium();
      setRadioState('generating');
      console.log('📻 [Radio] Đang tạo playlist', selectedDuration, 'phút...');

      const result = await radioApi.generate(selectedDuration);
      setPlaylist(result);
      setRadioState('ready');
      showSuccess(
        'Playlist sẵn sàng!',
        `${result.items.length} bài nghe đã được tạo 📻`,
      );
      console.log('✅ [Radio] Playlist tạo xong:', result.items.length, 'tracks');
    } catch (error: any) {
      console.error('❌ [Radio] Lỗi tạo playlist:', error);
      setRadioState('error');
      showError(
        'Không thể tạo playlist',
        error?.response?.data?.message || 'Vui lòng thử lại sau',
      );
    }
  }, [selectedDuration, haptic, showSuccess, showError]);

  /**
   * Mục đích: Phát một track cụ thể trong playlist
   * Tham số đầu vào: item (RadioPlaylistItem), index (number)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào 1 track hoặc auto-play tuần tự
   */
  const handlePlayTrack = useCallback(
    async (item: RadioPlaylistItem, index: number) => {
      try {
        haptic.light();
        setCurrentTrackIndex(index);
        currentTrackIndexRef.current = index;
        setIsGeneratingAudio(true);
        setRadioState('playing');
        console.log(`🎵 [Radio] Đang sinh audio cho track ${index + 1}:`, item.topic);

        // Sinh audio TTS cho track này
        const audioResult = await listeningApi.generateConversationAudio(
          item.conversation.map(c => ({speaker: c.speaker, text: c.text})),
          {provider: 'azure', randomVoice: true},
        );

        // Load vào TrackPlayer
        await setupPlayer();
        await TrackPlayer.reset();
        await addTrack(audioResult.audioUrl, item.topic);
        await TrackPlayer.play();

        setIsGeneratingAudio(false);
        setGlobalPlaying(true);
        setPlayerMode('full');

        console.log('✅ [Radio] Đang phát track', index + 1);
      } catch (error: any) {
        console.error('❌ [Radio] Lỗi phát track:', error);
        setIsGeneratingAudio(false);
        showError('Lỗi phát audio', 'Không thể sinh audio cho track này');
      }
    },
    [haptic, showError, setGlobalPlaying, setPlayerMode],
  );

  // BUG-03 fix: Cập nhật ref sau mỗi render để event listener luôn dùng phiên bản mới nhất
  handlePlayTrackRef.current = handlePlayTrack;

  /**
   * Mục đích: Render một track item trong danh sách
   * Tham số đầu vào: item (RadioPlaylistItem), index (number)
   * Tham số đầu ra: JSX.Element
   * Khi nào sử dụng: FlatList renderItem callback
   */
  const renderTrackItem = useCallback(
    ({item, index}: {item: RadioPlaylistItem; index: number}) => {
      const isCurrent = index === currentTrackIndex;
      const isGenerating = isCurrent && isGeneratingAudio;

      return (
        <TouchableOpacity
          className="mx-4 mb-3 rounded-2xl border px-4 py-3.5"
          style={{
            backgroundColor: isCurrent ? `${LISTENING_BLUE}15` : undefined,
            borderColor: isCurrent ? `${LISTENING_BLUE}40` : undefined,
          }}
          onPress={() => handlePlayTrack(item, index)}
          disabled={isGenerating}
          activeOpacity={0.7}
          accessibilityLabel={`Track ${index + 1}: ${item.topic}`}
          accessibilityRole="button">
          <View className="flex-row items-center">
            {/* Track number / Playing indicator */}
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
              style={{backgroundColor: isCurrent ? LISTENING_BLUE : undefined}}>
              {isGenerating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : isCurrent ? (
                <Icon name="Volume2" className="w-4 h-4 text-primary-foreground" />
              ) : (
                <AppText
                  className={`text-sm font-sans-bold ${
                    isCurrent ? 'text-primary-foreground' : ''
                  }`}
                  style={!isCurrent ? {color: colors.neutrals400} : undefined}>
                  {index + 1}
                </AppText>
              )}
            </View>

            {/* Track info */}
            <View className="flex-1">
              <AppText
                className={`font-sans-medium ${
                  isCurrent ? 'text-primary' : ''
                } font-sans-medium`}
                style={!isCurrent ? {color: colors.foreground} : undefined}
                numberOfLines={1}>
                {item.topic}
              </AppText>
              <AppText className="text-xs mt-0.5" style={{color: colors.neutrals500}}>
                {item.conversation.length} câu • {item.numSpeakers} người •{' '}
                {getCategoryLabel(item.category)}
              </AppText>
            </View>

            {/* Play icon */}
            {!isGenerating && (
              <Icon
                name={isCurrent ? 'Pause' : 'Play'}
                className="w-5 h-5"
                style={{color: isCurrent ? undefined : colors.neutrals500}}
              />
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [currentTrackIndex, isGeneratingAudio, handlePlayTrack],
  );

  return (
    <View className="flex-1" style={{backgroundColor: colors.background}}>
      {/* Header */}
      <View className="px-6 pt-safe-offset-4 pb-3 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2"
          accessibilityLabel="Quay lại"
          accessibilityRole="button">
          <Icon name="ArrowLeft" className="w-6 h-6" style={{color: colors.foreground}} />
        </TouchableOpacity>
        <AppText className="font-sans-bold text-lg flex-1 text-center" style={{color: colors.foreground}}>
          📻 Radio Mode
        </AppText>
        <View className="w-10" />
      </View>

      {/* Nội dung chính */}
      {radioState === 'idle' || radioState === 'generating' ? (
        /* ==========================================
           PHASE 1: Chọn duration + Generate
           ========================================== */
        <View className="flex-1 px-6 justify-center">
          {/* Tiêu đề */}
          <AppText className="font-sans-bold text-2xl text-center mb-2" style={{color: colors.foreground}}>
            Nghe thụ động
          </AppText>
          <AppText className="text-center mb-8" style={{color: colors.neutrals400}}>
            Chọn thời lượng, AI sẽ tạo playlist random cho bạn 🎲
          </AppText>

          {/* Duration picker */}
          <View className="gap-3 mb-8">
            {DURATION_OPTIONS.map(opt => {
              const isSelected = selectedDuration === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  className="flex-row items-center rounded-2xl border px-4 py-4"
                  style={{
                    backgroundColor: isSelected ? `${LISTENING_BLUE}15` : undefined,
                    borderColor: isSelected ? `${LISTENING_BLUE}40` : undefined,
                  }}
                  onPress={() => {
                    haptic.light();
                    setSelectedDuration(opt.value);
                  }}
                  disabled={radioState === 'generating'}
                  activeOpacity={0.7}
                  accessibilityLabel={`${opt.label} — ${opt.desc}`}
                  accessibilityRole="button">
                  <AppText className="text-2xl mr-3">{opt.emoji}</AppText>
                  <View className="flex-1">
                    <AppText
                      className="font-sans-bold text-base"
                      style={{color: isSelected ? LISTENING_BLUE : undefined}}>
                      {opt.label}
                    </AppText>
                    <AppText className="text-xs" style={{color: colors.neutrals500}}>
                      {opt.desc}
                    </AppText>
                  </View>
                  {isSelected && (
                    <Icon name="Check" className="w-5 h-5" style={{color: LISTENING_BLUE}} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Generate button */}
          <AppButton
            variant="primary"
            size="lg"
            className="w-full rounded-2xl"
            style={{backgroundColor: LISTENING_BLUE}}
            onPress={handleGenerate}
            loading={radioState === 'generating'}
            disabled={radioState === 'generating'}
            accessibilityLabel="Tạo playlist Radio">
            {radioState === 'generating'
              ? '🔄 Đang tạo playlist...'
              : '📻 Bắt đầu Radio'}
          </AppButton>

          {radioState === 'generating' && (
            <AppText className="text-xs text-center mt-3" style={{color: colors.neutrals400}}>
              AI đang tạo hội thoại cho {selectedDuration} phút nghe...
            </AppText>
          )}
        </View>
      ) : (
        /* ==========================================
           PHASE 2: Playlist đã sẵn sàng
           ========================================== */
        <>
          {/* Playlist header info */}
          {playlist && (
            <View className="px-6 py-3" style={{borderBottomWidth: 1, borderBottomColor: colors.border}}>
              <AppText className="font-sans-bold text-base" style={{color: colors.foreground}}>
                {playlist.playlist.name}
              </AppText>
              <AppText className="text-xs mt-1" style={{color: colors.neutrals400}}>
                {playlist.items.length} bài • {playlist.playlist.duration} phút •{' '}
                {playlist.playlist.description}
              </AppText>
            </View>
          )}

          {/* Track list */}
          <FlatList
            ref={flatListRef}
            data={playlist?.items ?? []}
            keyExtractor={item => item.id}
            renderItem={renderTrackItem}
            contentContainerStyle={{paddingTop: 12, paddingBottom: insets.bottom + 80}}
            showsVerticalScrollIndicator={false}
          />

          {/* Bottom controls */}
          <View
            className="absolute bottom-0 left-0 right-0 px-6 pt-3"
            style={{paddingBottom: Math.max(insets.bottom, 16), backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border}}>
            <AppButton
              variant="ghost"
              size="lg"
              className="w-full rounded-2xl"
              style={{
                backgroundColor: `${LISTENING_BLUE}12`,
                borderWidth: 1.5,
                borderColor: `${LISTENING_BLUE}30`,
              }}
              onPress={() => {
                haptic.medium();
                setRadioState('idle');
                setPlaylist(null);
                setCurrentTrackIndex(-1);
              }}
              accessibilityLabel="Tạo playlist mới">
              <AppText className="font-sans-bold" style={{color: LISTENING_BLUE}}>
                🔄 Tạo playlist mới
              </AppText>
            </AppButton>
          </View>
        </>
      )}

      {/* Error state */}
      {radioState === 'error' && (
        <View className="px-6 items-center mt-4">
          <AppText className="text-destructive text-center mb-4">
            Có lỗi xảy ra khi tạo playlist 😔
          </AppText>
          <AppButton
            variant="primary"
            size="lg"
            className="rounded-2xl"
            style={{backgroundColor: LISTENING_BLUE}}
            onPress={() => setRadioState('idle')}
            accessibilityLabel="Thử lại">
            Thử lại
          </AppButton>
        </View>
      )}
    </View>
  );
}

// =======================
// Helpers
// =======================

/**
 * Mục đích: Map category ID sang label tiếng Việt
 * Tham số đầu vào: category (string)
 * Tham số đầu ra: string
 * Khi nào sử dụng: Hiển thị category trong track list
 */
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    it: 'Công nghệ',
    daily: 'Đời sống',
    personal: 'Cá nhân',
    business: 'Kinh doanh',
    academic: 'Học thuật',
  };
  return labels[category] || category;
}
