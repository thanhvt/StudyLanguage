import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
  FlatList,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {AppText, AppButton} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useInsets} from '@/hooks/useInsets';
import {useToast} from '@/components/ui/ToastProvider';
import {radioApi, RadioPlaylistItem, RadioPlaylistResult} from '@/services/api/radio';
import {useRadioStore} from '@/store/useRadioStore';
import {useRadioPlayer} from '@/hooks/useRadioPlayer';
import {useAppStore} from '@/store/useAppStore';
import LinearGradient from 'react-native-linear-gradient';
import RadioControlsBar from '@/components/listening/RadioControlsBar';
import RadioSkeleton from '@/components/listening/RadioSkeleton';
import TrackPulse from '@/components/listening/TrackPulse';
import {LISTENING_BLUE} from '@/constants/listening';
import {connectRadioProgress, type RadioProgressEvent} from '@/services/api/radioSSE';
import {useRadioPredownload} from '@/hooks/useRadioPredownload';

// T-18: Categories cho filter
const CATEGORIES = [
  {id: 'it', label: '💻 Công nghệ'},
  {id: 'daily', label: '🌍 Đời sống'},
  {id: 'personal', label: '👤 Cá nhân'},
  {id: 'business', label: '💼 Kinh doanh'},
  {id: 'academic', label: '🎓 Học thuật'},
];

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
 * Tham số đầu vào: navigation, route (có thể chứa loadedPlaylist)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: User chọn "Radio Mode" từ ConfigScreen hoặc tap playlist cũ
 *   - Chọn duration (1/30/60/120 phút)
 *   - Generate playlist (backend random topics)
 *   - Hoặc load playlist cũ từ history (T-02)
 *   - Hiển thị danh sách track + auto-play
 */
export default function RadioScreen({navigation, route}: {navigation: any; route?: any}) {
  const colors = useColors();
  const haptic = useHaptic();
  const insets = useInsets();
  const {showError, showSuccess} = useToast();
  const theme = useAppStore(state => state.theme);
  const isDark = theme !== 'light';

  // T-02: Nhận loadedPlaylist từ route params
  const loadedPlaylist = route?.params?.loadedPlaylist as RadioPlaylistResult | undefined;
  // Nhận duration + autoGenerate từ ConfigScreen
  const routeDuration = route?.params?.duration as number | undefined;
  const autoGenerate = route?.params?.autoGenerate as boolean | undefined;

  // B-02 fix: Dùng useRadioPlayer thay vì tự viết handlePlayTrack
  const {
    playTrack,
    currentTrackIndex,
    isGeneratingAudio,
  } = useRadioPlayer();

  // Local state
  const [selectedDuration, setSelectedDuration] = useState(routeDuration ?? 30);
  const [radioState, setRadioState] = useState<RadioState>(
    loadedPlaylist ? 'ready' : autoGenerate ? 'generating' : 'idle',
  );
  const [playlist, setPlaylist] = useState<RadioPlaylistResult | null>(
    loadedPlaylist ?? null,
  );
  const flatListRef = useRef<FlatList>(null);

  // T-13: SSE progress state
  const [sseProgress, setSseProgress] = useState<RadioProgressEvent | null>(null);
  const sseAbortRef = useRef<AbortController | null>(null);

  // T-25: Pre-download all tracks audio (phải sau radioState/playlist)
  const {
    downloadedCount,
    total: downloadTotal,
    isDownloading,
    isTrackDownloaded,
  } = useRadioPredownload(
    // Chỉ pre-download khi playlist ready hoặc đang play
    (radioState === 'ready' || radioState === 'playing') ? playlist : null,
    // Callback: cập nhật audioUrl trong local state khi download xong
    (index, audioUrl) => {
      setPlaylist(prev => {
        if (!prev) return prev;
        const updatedItems = [...prev.items];
        updatedItems[index] = {...updatedItems[index], audioUrl};
        return {...prev, items: updatedItems};
      });
    },
  );

  // T-18: Selected categories
  const preferredCategories = useRadioStore(s => s.preferredCategories);
  const setPreferredCategories = useRadioStore(s => s.setPreferredCategories);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(preferredCategories);

  /**
   * Mục đích: Auto chuyển sang track tiếp theo khi track hiện tại kết thúc
   * Khi nào sử dụng: TrackPlayer phát xong queue → listener tự chạy
   */
  // Auto scroll tới track đang phát khi index thay đổi
  useEffect(() => {
    if (currentTrackIndex >= 0 && playlist?.items?.length) {
      flatListRef.current?.scrollToIndex({index: currentTrackIndex, animated: true});
    }
  }, [currentTrackIndex, playlist]);

  // T-13: Cleanup SSE khi unmount
  useEffect(() => {
    return () => {
      sseAbortRef.current?.abort();
    };
  }, []);

  // Auto-generate khi navigate từ ConfigScreen với autoGenerate=true
  const hasAutoGenerated = useRef(false);
  useEffect(() => {
    if (autoGenerate && !hasAutoGenerated.current && !loadedPlaylist) {
      hasAutoGenerated.current = true;
      console.log('📻 [Radio] Auto-generate từ ConfigScreen, duration:', selectedDuration);
      // Gọi API generate ngay
      radioApi
        .generate(selectedDuration, selectedCategories.length > 0 ? selectedCategories : undefined)
        .then(result => {
          setPlaylist(result);
          // Đồng bộ playlist vào store để useRadioPlayer dùng được
          useRadioStore.getState().setCurrentPlaylist(result);
          setRadioState('ready');
          showSuccess(
            'Playlist sẵn sàng!',
            `${result.items.length} bài nghe đã được tạo 📻`,
          );
        })
        .catch(error => {
          console.error('❌ [Radio] Lỗi auto-generate:', error);
          setRadioState('error');
          showError(
            'Không thể tạo playlist',
            error?.response?.data?.message || 'Vui lòng thử lại sau',
          );
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Mục đích: Generate playlist từ backend
   * Tham số đầu vào: không (dùng selectedDuration)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Bắt đầu" sau khi chọn duration
   */
  // B-01 fix: Thêm selectedCategories vào deps
  const handleGenerate = useCallback(async () => {
    try {
      haptic.medium();
      setRadioState('generating');
      setSseProgress(null);
      console.log('📻 [Radio] Đang tạo playlist', selectedDuration, 'phút...');

      // T-13: Kết nối SSE trước khi generate
      sseAbortRef.current?.abort();
      sseAbortRef.current = connectRadioProgress(
        (data) => setSseProgress(data),
        () => console.log('✅ [SSE] Generate hoàn thành'),
        () => console.warn('⚠️ [SSE] Lỗi kết nối, tiếp tục không SSE'),
      );

      const result = await radioApi.generate(selectedDuration, selectedCategories.length > 0 ? selectedCategories : undefined);
      setPlaylist(result);
      // Lưu playlist vào store để useRadioPlayer có thể dùng
      useRadioStore.getState().setCurrentPlaylist(result);
      // T-13: Dọn SSE connection khi xong
      sseAbortRef.current?.abort();
      setSseProgress(null);
      setRadioState('ready');
      showSuccess(
        'Playlist sẵn sàng!',
        `${result.items.length} bài nghe đã được tạo 📻`,
      );
      console.log('✅ [Radio] Playlist tạo xong:', result.items.length, 'tracks');
    } catch (error: any) {
      console.error('❌ [Radio] Lỗi tạo playlist:', error);
      setRadioState('error');
      // T-13: Dọn SSE connection khi lỗi
      sseAbortRef.current?.abort();
      setSseProgress(null);
      showError(
        'Không thể tạo playlist',
        error?.response?.data?.message || 'Vui lòng thử lại sau',
      );
    }
  }, [selectedDuration, selectedCategories, haptic, showSuccess, showError]);

  /**
   * Mục đích: Phát track — delegate sang useRadioPlayer (có abort, fade, queue)
   * Tham số đầu vào: item (RadioPlaylistItem), index (number)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào track trong FlatList
   */
  const handlePlayTrack = useCallback(
    async (item: RadioPlaylistItem, index: number) => {
      haptic.light();
      setRadioState('playing');
      // Đảm bảo store có playlist trước khi play
      if (playlist) {
        useRadioStore.getState().setCurrentPlaylist(playlist);
      }
      await playTrack(item, index);
    },
    [haptic, playlist, playTrack],
  );

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
            borderColor: isCurrent
              ? `${LISTENING_BLUE}40`
              : isDark ? colors.glassBorder : colors.border,
          }}
          onPress={() => handlePlayTrack(item, index)}
          disabled={isGenerating}
          activeOpacity={0.7}
          accessibilityLabel={`Track ${index + 1}: ${item.topic}`}
          accessibilityRole="button">
          <View className="flex-row items-center">
            {/* Track number / Playing indicator */}
            <TrackPulse isActive={isCurrent && !isGenerating} size={32}>
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{backgroundColor: isCurrent ? LISTENING_BLUE : colors.surface}}>
                {isGenerating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : isCurrent ? (
                  <Icon name="Volume2" className="w-4 h-4" style={{color: '#FFFFFF'}} />
                ) : (
                  <AppText
                    className={`text-sm font-sans-bold`}
                    style={{color: isCurrent ? '#FFFFFF' : colors.neutrals400}}>
                    {index + 1}
                  </AppText>
                )}
              </View>
            </TrackPulse>

            {/* Track info */}
            <View className="flex-1">
              <AppText
                className="font-sans-medium"
                style={{color: isCurrent ? LISTENING_BLUE : colors.foreground}}
                numberOfLines={1}>
                {item.topic}
              </AppText>
              <AppText className="text-xs mt-0.5" style={{color: colors.neutrals500}}>
                {item.conversation.length} câu • {item.numSpeakers} người •{' '}
                {getCategoryLabel(item.category)}
              </AppText>
            </View>

            {/* Play icon / Downloaded badge */}
            {!isGenerating && (
              <View className="flex-row items-center">
                {isTrackDownloaded(item.id) && !isCurrent && (
                  <Icon name="Check" className="w-3.5 h-3.5 mr-1" style={{color: '#22C55E'}} />
                )}
                <Icon
                  name={isCurrent ? 'Pause' : 'Play'}
                  className="w-5 h-5"
                  style={{color: isCurrent ? LISTENING_BLUE : colors.neutrals500}}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [currentTrackIndex, isGeneratingAudio, handlePlayTrack, colors, isDark, isTrackDownloaded],
  );

  return (
    <View className="flex-1" style={{backgroundColor: colors.background}}>
      {/* T-08: Glassmorphism background — chỉ dark mode dùng gradient */}
      {isDark && (
        <LinearGradient
          colors={[
            '#0a0e1a',
            '#0d1528',
            '#0f1e35',
            '#0a1628',
            '#080d18',
          ]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          className="absolute inset-0"
        />
      )}
      {/* Aurora floating blobs — nhẹ hơn trong light mode */}
      <View
        className="absolute w-[300] h-[300] rounded-full"
        style={{
          backgroundColor: LISTENING_BLUE,
          opacity: isDark ? 0.08 : 0.06,
          top: -80,
          right: -60,
          transform: [{scale: 1.2}],
        }}
      />
      <View
        className="absolute w-[250] h-[250] rounded-full"
        style={{
          backgroundColor: '#3B82F6',
          opacity: isDark ? 0.06 : 0.04,
          bottom: 120,
          left: -80,
          transform: [{scale: 1.3}],
        }}
      />
      <View
        className="absolute w-[200] h-[200] rounded-full"
        style={{
          backgroundColor: '#8B5CF6',
          opacity: isDark ? 0.05 : 0.03,
          top: '40%' as any,
          right: -40,
        }}
      />
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
      {radioState === 'idle' || radioState === 'generating' || radioState === 'error' ? (
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
                    backgroundColor: isSelected
                      ? isDark ? `${LISTENING_BLUE}15` : `${LISTENING_BLUE}10`
                      : isDark ? undefined : colors.surface,
                    borderColor: isSelected
                      ? `${LISTENING_BLUE}40`
                      : isDark ? colors.glassBorder : colors.border,
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
                      style={{color: isSelected ? LISTENING_BLUE : colors.foreground}}>
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

          {/* T-18: Category filter chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
            contentContainerStyle={{paddingHorizontal: 4, gap: 8}}>
            {CATEGORIES.map(cat => {
              const isActive = selectedCategories.includes(cat.id);
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => {
                    const next = isActive
                      ? selectedCategories.filter(c => c !== cat.id)
                      : [...selectedCategories, cat.id];
                    setSelectedCategories(next);
                    setPreferredCategories(next);
                  }}
                  className="rounded-full px-4 py-2"
                  style={{
                    backgroundColor: isActive
                      ? `${LISTENING_BLUE}20`
                      : isDark ? 'rgba(255,255,255,0.08)' : `${colors.neutrals400}12`,
                  }}>
                  <AppText
                    className="text-sm font-sans-medium"
                    style={{color: isActive ? LISTENING_BLUE : colors.foreground}}>
                    {cat.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

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
              ? `🔄 Đang tạo ${Math.ceil(selectedDuration / 7)} bài...`
              : '📻 Bắt đầu Radio'}
          </AppButton>

          {radioState === 'generating' && sseProgress && sseProgress.total > 0 && (
            <RadioSkeleton
              trackCount={Math.ceil(selectedDuration / 7)}
              progress={sseProgress}
            />
          )}

          {/* Error state — hiển thị bên trong phase 1 */}
          {radioState === 'error' && (
            <View className="items-center mt-6">
              <AppText className="text-center mb-4" style={{color: colors.error}}>
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
              {/* T-25: Download progress */}
              {isDownloading && downloadTotal > 0 && (
                <View className="flex-row items-center mt-1">
                  <View
                    className="flex-1 h-1 rounded-full mr-2 overflow-hidden"
                    style={{backgroundColor: `${LISTENING_BLUE}20`}}>
                    <View
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: LISTENING_BLUE,
                        width: `${Math.round((downloadedCount / downloadTotal) * 100)}%`,
                      }}
                    />
                  </View>
                  <AppText className="text-xs" style={{color: colors.neutrals400}}>
                    Đã tải: {downloadedCount}/{downloadTotal}
                  </AppText>
                </View>
              )}
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

          {/* T-19/T-20/T-21/T-24: RadioControlsBar */}
          <RadioControlsBar
            onDelete={async () => {
              if (playlist?.playlist?.id) {
                try {
                  await radioApi.deletePlaylist(playlist.playlist.id);
                  setRadioState('idle');
                  setPlaylist(null);
                  useRadioStore.getState().setCurrentTrackIndex(-1);
                  showSuccess('Đã xóa', 'Playlist đã được xóa thành công');
                } catch {
                  showError('Lỗi', 'Không thể xóa playlist');
                }
              }
            }}
          />

          {/* Bottom controls */}
          <View
            className="px-6 pt-3"
            style={{
              paddingBottom: Math.max(insets.bottom, 16),
              backgroundColor: isDark ? 'rgba(10, 14, 26, 0.95)' : colors.background,
              borderTopWidth: 1,
              borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border,
            }}>
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
                useRadioStore.getState().setCurrentTrackIndex(-1);
              }}
              accessibilityLabel="Tạo playlist mới">
              <AppText className="font-sans-bold" style={{color: LISTENING_BLUE}}>
                🔄 Tạo playlist mới
              </AppText>
            </AppButton>
          </View>
        </>
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
