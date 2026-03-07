import React, {useState, useCallback, useRef, useEffect} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  Alert,
  FlatList,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
  Animated as RNAnimated,
  Pressable,
} from 'react-native';
import {GestureHandlerRootView, Swipeable} from 'react-native-gesture-handler';
import {AppText, AppButton} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useInsets} from '@/hooks/useInsets';
import {useToast} from '@/components/ui/ToastProvider';
import {radioApi, RadioPlaylistItem, RadioPlaylistResult} from '@/services/api/radio';
import {useRadioStore} from '@/store/useRadioStore';
import {useRadioPlayer} from '@/hooks/useRadioPlayer';
import {useAudioPlayerStore} from '@/store/useAudioPlayerStore';
import {useAppStore} from '@/store/useAppStore';
import LinearGradient from 'react-native-linear-gradient';
import RadioControlsBar from '@/components/listening/RadioControlsBar';
import RadioSkeleton from '@/components/listening/RadioSkeleton';
import TrackPulse from '@/components/listening/TrackPulse';
import RadioTrackSheet from '@/components/listening/RadioTrackSheet';
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
  {id: 'travel', label: '✈️ Du lịch'},
  {id: 'health', label: '🏥 Sức khỏe'},
  {id: 'entertainment', label: '🎬 Giải trí'},
  {id: 'food', label: '🍜 Ẩm thực'},
  {id: 'sports', label: '⚽ Thể thao'},
  {id: 'culture', label: '🎭 Văn hóa'},
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
    togglePlay,
    currentTrackIndex,
    isGeneratingAudio,
    playbackState,
  } = useRadioPlayer();

  // Local state
  const removeTrackFromPlaylist = useRadioStore(s => s.removeTrackFromPlaylist);
  const removeTracksFromPlaylist = useRadioStore(s => s.removeTracksFromPlaylist);
  const [selectedDuration, setSelectedDuration] = useState(routeDuration ?? 30);
  const [radioState, setRadioState] = useState<RadioState>(
    loadedPlaylist ? 'ready' : autoGenerate ? 'generating' : 'idle',
  );
  const [playlist, setPlaylist] = useState<RadioPlaylistResult | null>(
    loadedPlaylist ?? null,
  );
  const flatListRef = useRef<FlatList>(null);

  // Bottom Sheet state — track nào đang mở sheet (null = đóng)
  const [sheetTrackIndex, setSheetTrackIndex] = useState<number | null>(null);

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
    // Callback: cập nhật audioUrl + audioTimestamps trong local state khi download xong
    (index, audioUrl, audioTimestamps) => {
      setPlaylist(prev => {
        if (!prev) return prev;
        const updatedItems = [...prev.items];
        updatedItems[index] = {
          ...updatedItems[index],
          audioUrl,
          ...(audioTimestamps ? {audioTimestamps} : {}),
        };
        return {...prev, items: updatedItems};
      });
    },
  );

  // T-18: Selected categories
  const preferredCategories = useRadioStore(s => s.preferredCategories);
  const setPreferredCategories = useRadioStore(s => s.setPreferredCategories);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(preferredCategories);
  const [selectedTrackIds, setSelectedTrackIds] = useState<Set<string>>(new Set());

  /**
   * Mục đích: Auto chuyển sang track tiếp theo khi track hiện tại kết thúc
   * Khi nào sử dụng: TrackPlayer phát xong queue → listener tự chạy
   */
  // Auto scroll tới track đang phát khi index thay đổi
  useEffect(() => {
    const itemCount = playlist?.items?.length ?? 0;
    // Guard: chỉ scroll khi index hợp lệ và nằm trong range
    if (currentTrackIndex >= 0 && currentTrackIndex < itemCount) {
      flatListRef.current?.scrollToIndex({
        index: currentTrackIndex,
        animated: true,
        viewPosition: 0.3,
      });
    }
  }, [currentTrackIndex, playlist]);

  // T-13: Cleanup SSE khi unmount
  useEffect(() => {
    return () => {
      sseAbortRef.current?.abort();
    };
  }, []);

  // Focus/blur lifecycle — chuyển minimized mode khi rời RadioScreen
  const setPlayerMode = useAudioPlayerStore(s => s.setPlayerMode);
  useFocusEffect(
    useCallback(() => {
      // Focus: đánh dấu player đang full (nếu đang phát)
      const radioState = useRadioStore.getState().playbackState;
      if (radioState === 'playing' || radioState === 'paused') {
        setPlayerMode('full');
      }

      return () => {
        // Blur: nếu đang phát → chuyển sang minimized mode
        const currentRadioState = useRadioStore.getState().playbackState;
        const globalPlaying = useAudioPlayerStore.getState().isPlaying;
        if (currentRadioState === 'playing' || globalPlaying) {
          setPlayerMode('minimized');
        }
      };
    }, [setPlayerMode]),
  );

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
          // Auto-play track đầu tiên
          if (result.items.length > 0) {
            setRadioState('playing');
            playTrack(result.items[0], 0);
          }
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

      // Auto-play track đầu tiên — Radio Mode hoạt động như radio thật
      if (result.items.length > 0) {
        setRadioState('playing');
        playTrack(result.items[0], 0);
      }
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
   * Mục đích: Xử lý tap track — mở sheet + play/pause logic
   * Tham số đầu vào: item (RadioPlaylistItem), index (number)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào track trong FlatList
   *   - Tap track khác → play track mới + mở sheet
   *   - Tap track đang phát → toggle pause + mở sheet
   */
  const handlePlayTrack = useCallback(
    async (item: RadioPlaylistItem, index: number) => {
      haptic.light();

      // Luôn mở sheet
      setSheetTrackIndex(index);

      if (index === currentTrackIndex) {
        // Tap track đang phát/pause → không cần play lại, chỉ mở sheet
        return;
      }

      // Tap track khác → play track mới
      setRadioState('playing');
      if (playlist) {
        useRadioStore.getState().setCurrentPlaylist(playlist);
      }
      await playTrack(item, index);
    },
    [haptic, playlist, playTrack, currentTrackIndex],
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
      const isActuallyPlaying = isCurrent && playbackState === 'playing';

      const isSelectingTracks = selectedTrackIds.size > 0;
      const isSelected = selectedTrackIds.has(item.id);

      // Màu nền card dùng cho gradient
      const cardBg = isSelected
        ? (isDark ? '#1a2e4a' : '#e8f0fe')
        : isCurrent
          ? (isDark ? '#0f2440' : '#e3eefa')
          : (isDark ? colors.background : '#FFFFFF');

      const cardBorderColor = isSelected
        ? LISTENING_BLUE
        : isCurrent
          ? `${LISTENING_BLUE}40`
          : isDark ? 'rgba(255,255,255,0.10)' : colors.border;

      // Container-based border: Border đặt trên Swipeable containerStyle, không phải card.
      // Card và gradient đều trong cùng bordered container → không có gap.
      // Multi-select: card có border riêng vì không trong Swipeable.
      const trackCard = (
        <TouchableOpacity
          className="px-4 py-3.5"
          style={{
            backgroundColor: cardBg,
            ...(isSelectingTracks ? {
              borderWidth: 1,
              borderColor: cardBorderColor,
              borderRadius: 16,
              marginHorizontal: 16,
            } : {}),
          }}
          onPress={() => {
            if (isSelectingTracks) {
              haptic.light();
              setSelectedTrackIds(prev => {
                const next = new Set(prev);
                if (next.has(item.id)) next.delete(item.id);
                else next.add(item.id);
                return next;
              });
            } else {
              handlePlayTrack(item, index);
            }
          }}
          onLongPress={() => {
            haptic.medium();
            setSelectedTrackIds(new Set([item.id]));
          }}
          disabled={isGenerating}
          activeOpacity={0.7}
          accessibilityLabel={`Track ${index + 1}: ${item.topic}`}
          accessibilityRole="button">
          <View className="flex-row items-center">
            {/* Checkbox khi đang multi-select */}
            {isSelectingTracks && (
              <View
                className="w-6 h-6 rounded-lg border-2 items-center justify-center mr-2"
                style={{
                  borderColor: isSelected ? LISTENING_BLUE : colors.neutrals500,
                  backgroundColor: isSelected ? LISTENING_BLUE : 'transparent',
                }}>
                {isSelected && (
                  <AppText className="text-white text-xs font-sans-bold">✓</AppText>
                )}
              </View>
            )}

            {/* Track number / Playing indicator */}
            <TrackPulse isActive={isCurrent && !isGenerating} size={28}>
              <View
                className="w-7 h-7 rounded-full items-center justify-center"
                style={{backgroundColor: isCurrent ? LISTENING_BLUE : colors.surface}}>
                {isGenerating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : isActuallyPlaying ? (
                  <Icon name="Volume2" className="w-3.5 h-3.5" style={{color: '#FFFFFF'}} />
                ) : isCurrent ? (
                  <Icon name="Pause" className="w-3.5 h-3.5" style={{color: '#FFFFFF'}} />
                ) : (
                  <AppText
                    className={`text-xs font-sans-bold`}
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
                {getCategoryLabel(item.category)} • ~{Math.max(1, Math.round(item.conversation.length * 0.4))}'
              </AppText>
            </View>

            {/* Play icon / Downloaded badge */}
            {!isGenerating && !isSelectingTracks && (
              <TouchableOpacity
                className="flex-row items-center p-2 -mr-2"
                onPress={(e) => {
                  e.stopPropagation();
                  if (isCurrent) {
                    togglePlay();
                  } else {
                    handlePlayTrack(item, index);
                  }
                }}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                accessibilityLabel={isCurrent ? 'Tạm dừng' : 'Phát'}
                accessibilityRole="button">
                {isTrackDownloaded(item.id) && !isCurrent && (
                  <Icon name="Check" className="w-3.5 h-3.5 mr-1" style={{color: '#22C55E'}} />
                )}
                <Icon
                  name={isActuallyPlaying ? 'Pause' : 'Play'}
                  className="w-6 h-6"
                  style={{color: isCurrent ? LISTENING_BLUE : colors.neutrals500}}
                />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      );

      if (isSelectingTracks) {
        return trackCard;
      }

      // Ref để gọi close() sau khi xóa
      const swipeRef = React.createRef<any>();

      /**
       * Mục đích: Xử lý xóa track (gọi API + cập nhật store)
       * Khi nào: Gọi khi user full-swipe hoặc nhấn nút Xóa
       */
      const handleDeleteTrack = async () => {
        try {
          if (playlist?.playlist?.id) {
            await radioApi.deletePlaylistItem(playlist.playlist.id, item.id);
          }
          removeTrackFromPlaylist(item.id);
          // Đồng bộ local playlist state sau khi xóa track
          setPlaylist(prev => {
            if (!prev) return prev;
            const updatedItems = prev.items.filter(i => i.id !== item.id);
            return {...prev, items: updatedItems};
          });
          showSuccess('Đã xóa track');
        } catch (err: any) {
          showError('Lỗi xóa: ' + (err?.message || ''));
        }
      };

      return (
        <View style={{marginHorizontal: 16}}>
          <Swipeable
            ref={swipeRef}
            overshootRight={false}
            friction={2}
            rightThreshold={40}
            containerStyle={{
              borderWidth: 1,
              borderColor: cardBorderColor,
              borderRadius: 16,
              overflow: 'hidden',
            }}
            onSwipeableOpen={() => {
              // Full-swipe-to-delete: swipe hết cỡ → auto xóa (có confirm)
              Alert.alert(
                'Xóa track',
                `Xóa "${item.topic}" khỏi playlist?`,
                [
                  {
                    text: 'Hủy',
                    style: 'cancel',
                    onPress: () => swipeRef.current?.close(),
                  },
                  {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: handleDeleteTrack,
                  },
                ],
              );
            }}
            renderRightActions={
              (_progress: RNAnimated.AnimatedInterpolation<number>, dragX: RNAnimated.AnimatedInterpolation<number>) => {
                const scale = dragX.interpolate({
                  inputRange: [-100, 0],
                  outputRange: [1, 0.3],
                  extrapolate: 'clamp',
                });
                const opacity = dragX.interpolate({
                  inputRange: [-100, -30, 0],
                  outputRange: [1, 0.8, 0],
                  extrapolate: 'clamp',
                });
                return (
                  <Pressable
                    onPress={() => {
                      Alert.alert(
                        'Xóa track',
                        `Xóa "${item.topic}" khỏi playlist?`,
                        [
                          {text: 'Hủy', style: 'cancel', onPress: () => swipeRef.current?.close()},
                          {text: 'Xóa', style: 'destructive', onPress: handleDeleteTrack},
                        ],
                      );
                    }}>
                    <LinearGradient
                      colors={[cardBg, '#DC262680', '#DC2626']}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                      locations={[0, 0.35, 1]}
                      style={{
                        width: 90,
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <RNAnimated.View
                        style={{
                          transform: [{scale}],
                          opacity,
                          alignItems: 'center',
                        }}>
                        <View
                          className="w-10 h-10 rounded-full items-center justify-center mb-1"
                          style={{backgroundColor: 'rgba(255,255,255,0.25)'}}>
                          <Icon name="Trash2" className="w-5 h-5" style={{color: '#FFFFFF'}} />
                        </View>
                        <AppText className="text-white text-xs font-sans-semibold">
                          Xóa
                        </AppText>
                      </RNAnimated.View>
                    </LinearGradient>
                  </Pressable>
                );
              }
            }>
            {trackCard}
          </Swipeable>
        </View>
      );
    },
    [currentTrackIndex, isGeneratingAudio, playbackState, selectedTrackIds, handlePlayTrack, togglePlay, removeTrackFromPlaylist, colors, isDark, isTrackDownloaded, playlist, haptic, showSuccess, showError],
  );

  return (
    <GestureHandlerRootView className="flex-1" style={{backgroundColor: colors.background}}>
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
          onPress={() => {
            // Nếu đang phát → chuyển sang minimized mode, ngược lại → hidden
            const currentRadioState = useRadioStore.getState().playbackState;
            const globalPlaying = useAudioPlayerStore.getState().isPlaying;
            if (currentRadioState === 'playing' || globalPlaying) {
              useAudioPlayerStore.getState().setPlayerMode('minimized');
            } else {
              useAudioPlayerStore.getState().setPlayerMode('hidden');
            }
            navigation.goBack();
          }}
          className="p-2 -ml-2"
          accessibilityLabel="Quay lại"
          accessibilityRole="button">
          <Icon name="ArrowLeft" className="w-6 h-6" style={{color: colors.foreground}} />
        </TouchableOpacity>
        <View className="flex-row items-center flex-1 justify-center">
          <Icon name="Radio" className="w-5 h-5 mr-1.5" style={{color: LISTENING_BLUE}} />
          <AppText className="font-sans-bold text-lg" style={{color: colors.foreground}}>
            Radio Mode
          </AppText>
        </View>
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
            Chọn thời lượng, AI sẽ tạo playlist random cho bạn
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
            contentContainerStyle={{paddingHorizontal: 4, gap: 8, alignItems: 'center'}}>
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
            style={{backgroundColor: LISTENING_BLUE, borderWidth: 0}}
            onPress={handleGenerate}
            loading={radioState === 'generating'}
            disabled={radioState === 'generating'}
            accessibilityLabel="Tạo playlist Radio">
            {radioState === 'generating'
              ? `Đang tạo ${Math.ceil(selectedDuration / 7)} bài...`
              : 'Bắt đầu Radio'}
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
                {`${playlist.items.length} bài`}
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
            ItemSeparatorComponent={() => <View style={{height: 10}} />}
            contentContainerStyle={{paddingTop: 12, paddingBottom: insets.bottom + 80}}
            showsVerticalScrollIndicator={false}
            onScrollToIndexFailed={() => {
              // Xử lý khi scroll tới index chưa render — guard range
              setTimeout(() => {
                const itemCount = playlist?.items?.length ?? 0;
                if (currentTrackIndex >= 0 && currentTrackIndex < itemCount) {
                  flatListRef.current?.scrollToIndex({
                    index: currentTrackIndex,
                    animated: true,
                  });
                }
              }, 300);
            }}
            ListFooterComponent={selectedTrackIds.size > 0 ? (
              <View className="flex-row items-center gap-2 mx-4 mt-3">
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
                  style={{backgroundColor: '#EF4444'}}
                  onPress={() => {
                    Alert.alert(
                      'Xóa tracks',
                      `Bạn có chắc chắn muốn xóa ${selectedTrackIds.size} bài?`,
                      [
                        {text: 'Hủy', style: 'cancel'},
                        {
                          text: 'Xóa',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              const ids = Array.from(selectedTrackIds);
                              if (playlist?.playlist?.id) {
                                await radioApi.deletePlaylistItems(playlist.playlist.id, ids);
                              }
                              removeTracksFromPlaylist(ids);
                              // Đồng bộ local playlist state sau khi batch xóa
                              const idsSet = new Set(ids);
                              setPlaylist(prev => {
                                if (!prev) return prev;
                                const updatedItems = prev.items.filter(i => !idsSet.has(i.id));
                                return {...prev, items: updatedItems};
                              });
                              setSelectedTrackIds(new Set());
                              showSuccess(`Đã xóa ${ids.length} bài`);
                            } catch (err: any) {
                              showError('Lỗi xóa: ' + (err?.message || ''));
                            }
                          },
                        },
                      ],
                    );
                  }}>
                  <Icon name="Trash2" className="w-4 h-4 mr-2" style={{color: '#FFFFFF'}} />
                  <AppText className="text-white font-sans-semibold text-sm">
                    Xóa {selectedTrackIds.size} bài
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  className="py-3 px-4 rounded-xl"
                  style={{backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.surface}}
                  onPress={() => setSelectedTrackIds(new Set())}>
                  <AppText className="font-sans-medium text-sm" style={{color: colors.foreground}}>
                    Hủy
                  </AppText>
                </TouchableOpacity>
              </View>
            ) : null}
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
                backgroundColor: 'transparent',
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
              <View className="flex-row items-center">
                <Icon name="RefreshCw" className="w-4 h-4 mr-1.5" style={{color: LISTENING_BLUE}} />
                <AppText className="font-sans-bold" style={{color: LISTENING_BLUE}}>
                  Tạo playlist mới
                </AppText>
              </View>
            </AppButton>
          </View>
        </>
      )}

    {/* RadioTrackSheet — Bottom Sheet transcript */}
    {sheetTrackIndex !== null && playlist?.items?.[sheetTrackIndex] && (
      <RadioTrackSheet
        track={playlist.items[sheetTrackIndex]}
        trackIndex={sheetTrackIndex as number}
        isPlaying={radioState === 'playing' && !isGeneratingAudio}
        isLoading={isGeneratingAudio}
        onClose={() => setSheetTrackIndex(null)}
      />
    )}

    </GestureHandlerRootView>
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
    travel: 'Du lịch',
    health: 'Sức khỏe',
    entertainment: 'Giải trí',
    food: 'Ẩm thực',
    sports: 'Thể thao',
    culture: 'Văn hóa',
  };
  return labels[category] || category;
}
