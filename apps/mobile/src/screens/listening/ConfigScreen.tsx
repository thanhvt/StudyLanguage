import React, {useRef, useState, useCallback, useMemo, useEffect} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Animated as RNAnimated,
  Pressable,
} from 'react-native';
import {Swipeable} from 'react-native-gesture-handler';
import {AppButton, AppText, Switch} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useListeningStore} from '@/store/useListeningStore';
import {useAppStore} from '@/store/useAppStore';
import {listeningApi} from '@/services/api/listening';
import {useToast} from '@/components/ui/ToastProvider';
import {useDialog} from '@/components/ui/DialogProvider';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useInsets} from '@/hooks/useInsets';
import {getTotalScenarios, TOPIC_CATEGORIES, type TopicScenario} from '@/data/topic-data';
import {customScenarioApi, type CustomScenario} from '@/services/api/customScenarios';
import {radioApi, type PlaylistSummary} from '@/services/api/radio';
import {
  DurationSelector,
  SpeakersSelector,
  TopicPickerModal,
} from '@/components/listening';
import {useAudioPlayerStore} from '@/store/useAudioPlayerStore';
import TrackPlayer from 'react-native-track-player';
import LinearGradient from 'react-native-linear-gradient';
import TtsSettingsSheet from '@/components/listening/TtsSettingsSheet';
import GeneratingScreen from '@/components/listening/GeneratingScreen';
import NowPlayingBar from '@/components/listening/NowPlayingBar';
import {LiquidGlassView, isLiquidGlassSupported} from '@/utils/LiquidGlass';

// ========================
// Màu sắc Listening-specific (Blue + Orange identity)
// ========================
const LISTENING_BLUE = '#2563EB';
const LISTENING_ORANGE = '#F97316';

// ========================
// Level config data
// ========================
const LEVELS = [
  {id: 'beginner' as const, label: 'Cơ bản', emoji: '🌱'},
  {id: 'intermediate' as const, label: 'Trung bình', emoji: '🌿'},
  {id: 'advanced' as const, label: 'Nâng cao', emoji: '🌳'},
];

// ========================
// Mode config data
// ========================
const MODES = [
  {id: 'podcast' as const, label: 'Podcast', icon: '🎙'},
  {id: 'radio' as const, label: 'Radio', icon: '📻'},
];

/**
 * Mục đích: Màn hình cấu hình bài nghe — redesign v3 theo Obsidian Glass + Blue/Orange
 * Tham số đầu vào: navigation (React Navigation props)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ListeningStack → màn hình đầu tiên khi user chọn "Luyện Nghe"
 *   - Layout: Header → Topic Picker inline → Level/Mode → Duration/Speakers → Sticky CTA
 *   - Nhấn "Bắt đầu nghe" → gọi API → navigate đến PlayerScreen
 */
export default function ListeningConfigScreen({
  navigation,
}: {
  navigation: any;
}) {
  // ========================
  // Store selectors
  // ========================
  const config = useListeningStore(state => state.config);
  const setConfig = useListeningStore(state => state.setConfig);
  const selectedTopic = useListeningStore(state => state.selectedTopic);
  const setConversation = useListeningStore(state => state.setConversation);
  const setAudioUrl = useListeningStore(state => state.setAudioUrl);
  const setTimestamps = useListeningStore(state => state.setTimestamps);
  const setWordTimestamps = useListeningStore(state => state.setWordTimestamps);
  const setCurrentExchangeIndex = useListeningStore(state => state.setCurrentExchangeIndex);
  const setSelectedTopic = useListeningStore(state => state.setSelectedTopic);
  const isGenerating = useListeningStore(state => state.isGenerating);
  const setGenerating = useListeningStore(state => state.setGenerating);
  const selectedCategory = useListeningStore(state => state.selectedCategory);
  const setSelectedCategory = useListeningStore(state => state.setSelectedCategory);
  const selectedSubCategory = useListeningStore(state => state.selectedSubCategory);
  const setSelectedSubCategory = useListeningStore(state => state.setSelectedSubCategory);
  const favoriteScenarioIds = useListeningStore(state => state.favoriteScenarioIds);
  const toggleFavorite = useListeningStore(state => state.toggleFavorite);

  // Audio Player store — để kiểm tra có đang phát không
  const lastSession = useAudioPlayerStore(state => state.lastSession);
  const clearSession = useAudioPlayerStore(state => state.clearSession);
  const audioPlayerSetPlayerMode = useAudioPlayerStore(state => state.setPlayerMode);

  // ========================
  // Local state
  // ========================
  const [topicInput, setTopicInput] = useState('');
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [mode, setMode] = useState<'podcast' | 'radio'>('podcast');
  const [showTtsSettings, setShowTtsSettings] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [activeSpeaker, setActiveSpeaker] = useState<string | undefined>();

  // T-01: Radio playlist history state
  const [radioPlaylists, setRadioPlaylists] = useState<PlaylistSummary[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [showAllPlaylists, setShowAllPlaylists] = useState(false);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<Set<string>>(new Set());

  // ========================
  // Hooks
  // ========================
  const {showError, showWarning, showSuccess} = useToast();
  const {showLoading, hideLoading, showConfirm} = useDialog();
  const colors = useColors();
  const haptic = useHaptic();
  const insets = useInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  // ========================
  // Keyboard tracking — ẩn sticky footer khi mở keyboard
  // ========================
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  React.useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ========================
  // Tổng scenarios
  // ========================
  const totalScenarios = getTotalScenarios();

  // Sticky footer height tính toán
  const footerHeight = 56 + 32 + Math.max(insets.bottom, 16);

  // ========================
  // Lấy scenarios theo category + subcategory hiện tại (hiện tối đa 3)
  // ========================
  const currentScenarios = useMemo(() => {
    const category = TOPIC_CATEGORIES.find(c => c.id === selectedCategory);
    if (!category) {return [];}

    let scenarios: TopicScenario[] = [];
    if (selectedSubCategory) {
      const sub = category.subCategories?.find(s => s.id === selectedSubCategory);
      scenarios = sub?.scenarios ?? [];
    } else {
      // Lấy tất cả scenarios từ tất cả subcategories
      category.subCategories?.forEach(sub => {
        scenarios = [...scenarios, ...(sub.scenarios ?? [])];
      });
    }
    return scenarios.slice(0, 3); // Hiện tối đa 3 cards
  }, [selectedCategory, selectedSubCategory]);

  // Custom scenarios — lấy từ API khi chọn tab Tuỳ chỉnh
  const [customScenarios, setCustomScenarios] = useState<CustomScenario[]>([]);
  useEffect(() => {
    if (selectedCategory === 'custom') {
      customScenarioApi.list().then(setCustomScenarios).catch(() => {});
    }
  }, [selectedCategory]);

  // Khi user chọn scenario → xóa topicInput
  React.useEffect(() => {
    if (selectedTopic) {
      setTopicInput('');
    }
  }, [selectedTopic]);

  // T-01: Fetch radio playlists khi screen focus + mode = radio
  // Dùng useFocusEffect để re-fetch mỗi khi quay lại từ RadioScreen
  // → cập nhật itemCount sau khi xóa track, và loại bỏ playlist đã xóa
  useFocusEffect(
    useCallback(() => {
      if (mode === 'radio') {
        setIsLoadingPlaylists(true);
        radioApi
          .getPlaylists()
          .then(playlists => {
            console.log('📻 [Config] Nhận', playlists.length, 'playlists');
            setRadioPlaylists(playlists);
          })
          .catch(err => {
            console.warn('⚠️ [Config] Không thể tải playlists:', err?.message);
          })
          .finally(() => setIsLoadingPlaylists(false));
      }
    }, [mode]),
  );

  /**
   * Mục đích: Load playlist cũ và navigate sang RadioScreen để replay
   * Tham số đầu vào: playlistId (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào playlist card trong "Your Playlists"
   */
  const handleLoadPlaylist = useCallback(
    async (playlistId: string) => {
      try {
        haptic.medium();
        console.log('📻 [Config] Đang tải playlist:', playlistId);
        const detail = await radioApi.getPlaylistById(playlistId);
        // Navigate sang RadioScreen với dữ liệu playlist đã load
        navigation.navigate('Radio', {
          loadedPlaylist: {
            playlist: {
              id: detail.id,
              name: detail.name,
              description: detail.description ?? '',
              duration: 0, // Sẽ tính từ items
              trackCount: detail.items.length,
            },
            items: detail.items.map((item: any, idx: number) => ({
              id: item.id,
              topic: item.topic,
              conversation: item.conversation || [],
              duration: item.duration || 0,
              numSpeakers: item.num_speakers || 2,
              category: item.category || '',
              subCategory: item.sub_category || '',
              position: item.position ?? idx,
              audioUrl: item.audio_url || undefined,
              audioTimestamps: item.audio_timestamps || undefined,
            })),
          },
        });
      } catch (error: any) {
        console.error('❌ [Config] Lỗi load playlist:', error);
        showError('Không thể mở playlist', error?.message || 'Vui lòng thử lại');
      }
    },
    [haptic, navigation, showError],
  );

  // ========================
  // Business Logic
  // ========================

  /**
   * Mục đích: Lấy topic cuối cùng để gửi API (ưu tiên: selectedTopic > topicInput)
   * Tham số đầu vào: không
   * Tham số đầu ra: string | null
   * Khi nào sử dụng: Trước khi generate, xác định topic
   */
  const getFinalTopic = useCallback((): string | null => {
    if (selectedTopic) {
      return `${selectedTopic.name}: ${selectedTopic.description}`;
    }
    if (topicInput.trim()) {
      return topicInput.trim();
    }
    return null;
  }, [selectedTopic, topicInput]);

  /**
   * Mục đích: Thực hiện generate conversation
   * Tham số đầu vào: topic (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: handleGenerate gọi sau validation
   */
  const doGenerate = useCallback(async (topic: string) => {
    // Kiểm tra mạng
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      await fetch('https://www.google.com/generate_204', {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch {
      haptic.error();
      showError(
        'Không có kết nối mạng',
        'Vui lòng kiểm tra Wi-Fi hoặc dữ liệu di động 📶',
      );
      return;
    }

    try {
      setGenerating(true);
      setGeneratingStep(0);
      setActiveSpeaker(undefined);
      haptic.medium();

      const result = await listeningApi.generateConversation({
        ...config,
        topic,
      });

      // QUAN TRỌNG: Clear audio state cũ trước khi set conversation mới
      // Nếu không, PlayerScreen thấy audioUrl cũ → skip generate → phát audio bài cũ
      setAudioUrl(null);
      setTimestamps(null);
      setWordTimestamps(null);
      setCurrentExchangeIndex(0);
      try { await TrackPlayer.reset(); } catch {}

      setConversation(result);
      haptic.success();
      navigation.navigate('Player');
    } catch (error: any) {
      haptic.error();
      console.error('❌ [Listening] Lỗi tạo bài nghe:', error);
      showError(
        'Không thể tạo bài nghe',
        error?.message || 'Vui lòng kiểm tra kết nối mạng và thử lại',
      );
    } finally {
      setGenerating(false);
    }
  }, [config, haptic, showError, showLoading, hideLoading, setGenerating, setConversation, navigation]);

  /**
   * Mục đích: Xử lý nhấn "Bắt đầu nghe"
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn CTA button
   */
  const handleGenerate = useCallback(async () => {
    // Nếu Radio mode → navigate đến RadioScreen
    if (mode === 'radio') {
      haptic.light();
      navigation.navigate('Radio', {
        duration: config.durationMinutes,
        autoGenerate: true,
      });
      return;
    }

    const topic = getFinalTopic();
    if (!topic) {
      showWarning('Chưa chọn chủ đề', 'Vui lòng chọn kịch bản hoặc nhập chủ đề');
      return;
    }

    // Kiểm tra audio đang phát
    const globalIsPlaying = useAudioPlayerStore.getState().isPlaying;
    if (globalIsPlaying) {
      showConfirm(
        'Đang phát audio',
        'Bạn đang nghe "' + (lastSession?.title ?? 'bài nghe') + '". Tạo bài mới sẽ dừng bài hiện tại.',
        async () => {
          try {
            await TrackPlayer.reset();
          } catch {
            // Ignore
          }
          useAudioPlayerStore.getState().setPlayerMode('hidden');
          doGenerate(topic);
        },
      );
      return;
    }

    doGenerate(topic);
  }, [mode, getFinalTopic, haptic, showWarning, showConfirm, lastSession, doGenerate, navigation]);

  // Kiểm tra topic hợp lệ
  const hasValidTopic = !!selectedTopic || !!topicInput.trim();
  const canStart = mode === 'radio' || hasValidTopic;

  // #8: Parallax scroll value cho floating blobs
  const scrollY = useRef(new RNAnimated.Value(0)).current;
  // Detect light/dark cho floating blobs opacity
  const theme = useAppStore(state => state.theme);
  const isDark = theme !== 'light';

  return (
    <View className="flex-1" style={{backgroundColor: colors.background}}>
      {/* ======================== */}
      {/* GLASSMORPHISM BACKGROUND — Aurora mesh + floating blobs */}
      {/* Nguyên tắc P3: "Vibrant background — glass cần content đa sắc để blur" */}
      {/* ======================== */}
      {isLiquidGlassSupported && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* Lớp 1: Blue-to-indigo anchor gradient — opacity 70% */}
          <LinearGradient
            colors={['#1E3A8AB3', '#2563EB60', 'transparent', '#4338CA30']}
            locations={[0, 0.18, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
          {/* Lớp 2: Teal ambient glow — mạnh hơn (α=0.40) */}
          <LinearGradient
            colors={['transparent', '#0D948870', '#0F766E40', 'transparent']}
            locations={[0.1, 0.35, 0.55, 0.85]}
            start={{x: 0, y: 0.2}}
            end={{x: 1, y: 0.8}}
            style={StyleSheet.absoluteFill}
          />
          {/* Lớp 3: Indigo spot — góc dưới phải */}
          <LinearGradient
            colors={['transparent', '#6366F150']}
            start={{x: 0, y: 0.6}}
            end={{x: 1, y: 1}}
            style={[StyleSheet.absoluteFill, {top: '55%'}]}
          />
          {/* Lớp 4: White spotlight — top edge light */}
          <LinearGradient
            colors={['rgba(200,220,255,0.18)', 'transparent']}
            start={{x: 0.5, y: 0}}
            end={{x: 0.5, y: 0.3}}
            style={[StyleSheet.absoluteFill, {height: '30%'}]}
          />
          {/* Floating blobs — đốm sáng tạo depth (P2: multi-layer) */}
          {/* #8: Parallax — blobs di chuyển chậm hơn content */}
          <RNAnimated.View style={{
            position: 'absolute', top: '12%', left: '10%',
            width: 180, height: 180, borderRadius: 90,
            backgroundColor: isDark ? 'rgba(37,99,235,0.25)' : 'rgba(37,99,235,0.12)',
            transform: [{translateY: scrollY.interpolate({
              inputRange: [0, 500],
              outputRange: [0, -75],
              extrapolate: 'clamp',
            })}],
          }} />
          <RNAnimated.View style={{
            position: 'absolute', top: '40%', right: '5%',
            width: 140, height: 140, borderRadius: 70,
            backgroundColor: isDark ? 'rgba(13,148,136,0.20)' : 'rgba(13,148,136,0.10)',
            transform: [{translateY: scrollY.interpolate({
              inputRange: [0, 500],
              outputRange: [0, -50],
              extrapolate: 'clamp',
            })}],
          }} />
          <RNAnimated.View style={{
            position: 'absolute', bottom: '20%', left: '20%',
            width: 120, height: 120, borderRadius: 60,
            backgroundColor: isDark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.10)',
            transform: [{translateY: scrollY.interpolate({
              inputRange: [0, 500],
              outputRange: [0, -40],
              extrapolate: 'clamp',
            })}],
          }} />
        </View>
      )}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>
        <RNAnimated.ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{paddingBottom: footerHeight + 20}}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={RNAnimated.event(
            [{nativeEvent: {contentOffset: {y: scrollY}}}],
            {useNativeDriver: true},
          )}
          scrollEventThrottle={16}>

          {/* ======================== */}
          {/* HEADER: "Luyện Nghe" + gear icon */}
          {/* ======================== */}
          <View className="px-6 pt-safe-offset-4 mb-2">
            <View className="flex-row items-center justify-between">
              <View>
                <AppText className="text-2xl font-sans-bold" style={{color: colors.foreground}}>
                  Luyện Nghe
                </AppText>
                <AppText className="text-[15px] mt-0.5" style={{color: isDark ? colors.neutrals400 : colors.neutrals200}}>
                  {totalScenarios}+ kịch bản có sẵn
                </AppText>
              </View>
              <TouchableOpacity
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{backgroundColor: `${LISTENING_BLUE}15`}}
                onPress={() => {
                  haptic.light();
                  setShowTtsSettings(true);
                }}
                accessibilityLabel="Cài đặt giọng đọc"
                accessibilityRole="button">
                <Icon name="Settings" className="w-5 h-5" style={{color: LISTENING_BLUE}} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ======================== */}
          {/* TAB BAR: Podcast / Radio */}
          {/* ======================== */}
          <View className="px-6 mb-4">
            <View
              className="flex-row rounded-xl overflow-hidden"
              style={{
                backgroundColor: isDark ? colors.neutrals900 : colors.neutrals700,
                borderWidth: isDark ? 1 : 0,
                borderColor: isDark ? colors.border : 'transparent',
              }}>
              {MODES.map(m => {
                const isActive = mode === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    className="flex-1 flex-row items-center justify-center py-3"
                    style={{backgroundColor: isActive ? LISTENING_BLUE : 'transparent'}}
                    onPress={() => {
                      haptic.light();
                      setMode(m.id);
                    }}
                    disabled={isGenerating}
                    accessibilityLabel={`Chế độ ${m.label}${isActive ? ', đang chọn' : ''}`}
                    accessibilityRole="button">
                    <AppText className="text-sm mr-1.5">{m.icon}</AppText>
                    <AppText
                      className="text-base font-sans-bold"
                      style={{color: isActive ? '#FFFFFF' : colors.foreground}}>
                      {m.label}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ======================== */}
          {/* TOPIC SECTION: "Chủ đề" + inline picker (chỉ hiện khi Podcast) */}
          {/* ======================== */}
          {mode === 'podcast' && (
          <View className="px-6 mb-6">
            <SectionCard>
              {/* Top Row: Label + action buttons */}
              <View className="flex-row items-center justify-between mb-3">
                <AppText className="font-sans-semibold text-base" style={{color: colors.foreground}}>
                  Chủ đề
                </AppText>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{backgroundColor: isDark ? `${LISTENING_BLUE}15` : `${LISTENING_BLUE}10`}}
                    hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}
                    onPress={() => {
                      haptic.light();
                      setShowTopicModal(true);
                    }}
                    accessibilityLabel="Tìm kiếm chủ đề"
                    accessibilityRole="button">
                    <Icon name="Search" className="w-5 h-5" style={{color: LISTENING_BLUE}} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{backgroundColor: isDark ? `${LISTENING_BLUE}15` : `${LISTENING_BLUE}10`}}
                    hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}
                    onPress={() => {
                      haptic.light();
                      setSelectedCategory('favorites');
                      setShowTopicModal(true);
                    }}
                    accessibilityLabel="Chủ đề yêu thích"
                    accessibilityRole="button">
                    <Icon name="Heart" className="w-5 h-5" style={{color: LISTENING_BLUE}} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{backgroundColor: isDark ? `${LISTENING_BLUE}15` : `${LISTENING_BLUE}10`}}
                    hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}
                    onPress={() => {
                      haptic.light();
                      navigation.navigate('CustomScenarios');
                    }}
                    accessibilityLabel="Tạo chủ đề mới"
                    accessibilityRole="button">
                    <Icon name="Plus" className="w-5 h-5" style={{color: LISTENING_BLUE}} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Hiển thị topic đang chọn — để user biết đang chọn gì */}
              {selectedTopic && (
                <View className="flex-row items-center rounded-xl px-3 py-2 mb-3"
                  style={{backgroundColor: `${LISTENING_BLUE}10`, borderWidth: 1, borderColor: `${LISTENING_BLUE}25`}}>
                  <Icon name="Check" className="w-3.5 h-3.5" style={{color: LISTENING_BLUE, marginRight: 8}} />
                  <AppText className="text-[13px] flex-1" style={{color: colors.foreground}} numberOfLines={1}>
                    <AppText className="font-sans-bold" style={{color: LISTENING_BLUE}}>
                      {selectedTopic.name}
                    </AppText>
                  </AppText>
                  <TouchableOpacity
                    onPress={() => {
                      haptic.light();
                      setSelectedTopic(null);
                    }}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                    accessibilityLabel="Bỏ chọn chủ đề"
                    accessibilityRole="button">
                    <Icon name="X" className="w-3.5 h-3.5" style={{color: colors.neutrals400}} />
                  </TouchableOpacity>
                </View>
              )}

              {/* Category Tabs */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-2">
                <View className="flex-row gap-2">
                  {TOPIC_CATEGORIES.map(cat => {
                    const isActive = selectedCategory === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        className="flex-row items-center px-4 py-2.5 rounded-full border"
                        style={{
                          backgroundColor: isActive ? LISTENING_BLUE : 'transparent',
                          borderColor: isActive ? LISTENING_BLUE : colors.neutrals800,
                        }}
                        onPress={() => {
                          haptic.light();
                          setSelectedCategory(cat.id);
                          setSelectedSubCategory('');
                        }}
                        accessibilityLabel={`Danh mục ${cat.name}${isActive ? ', đang chọn' : ''}`}
                        accessibilityRole="button">
                        {cat.icon && (
                          <AppText className="text-[13px] mr-1">{cat.icon}</AppText>
                        )}
                        <AppText
                          className="text-[13px] font-sans-medium"
                          style={{color: isActive ? '#FFFFFF' : colors.foreground}}>
                          {cat.name}
                        </AppText>
                      </TouchableOpacity>
                    );
                  })}
                  {/* Tab Tuỳ chỉnh */}
                  {(() => {
                    const isActive = selectedCategory === 'custom';
                    return (
                      <TouchableOpacity
                        className="flex-row items-center px-4 py-2.5 rounded-full border"
                        style={{
                          backgroundColor: isActive ? LISTENING_BLUE : 'transparent',
                          borderColor: isActive ? LISTENING_BLUE : colors.neutrals800,
                        }}
                        onPress={() => {
                          haptic.light();
                          setSelectedCategory('custom');
                          setSelectedSubCategory('');
                        }}
                        accessibilityLabel={`Tuỳ chỉnh${isActive ? ', đang chọn' : ''}`}
                        accessibilityRole="button">
                        <AppText className="text-[13px] mr-1">✨</AppText>
                        <AppText
                          className="text-[13px] font-sans-medium"
                          style={{color: isActive ? '#FFFFFF' : colors.foreground}}>
                          Tuỳ chỉnh
                        </AppText>
                      </TouchableOpacity>
                    );
                  })()}
                </View>
              </ScrollView>

              {/* Subcategory Chips — ẩn khi tab Tuỳ chỉnh */}
              {selectedCategory !== 'custom' && (() => {
                const category = TOPIC_CATEGORIES.find(c => c.id === selectedCategory);
                if (!category?.subCategories?.length) {return null;}
                return (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-3">
                    <View className="flex-row gap-2">
                      {category.subCategories.map(sub => {
                        const isActive = selectedSubCategory === sub.id;
                        return (
                          <TouchableOpacity
                            key={sub.id}
                            className="px-4 py-2.5 rounded-full border"
                            style={{
                              backgroundColor: isActive ? `${LISTENING_BLUE}15` : 'transparent',
                              borderColor: isActive ? LISTENING_BLUE : colors.neutrals700,
                            }}
                            onPress={() => {
                              haptic.light();
                              setSelectedSubCategory(sub.id);
                            }}
                            accessibilityLabel={`${sub.name}${isActive ? ', đang chọn' : ''}`}
                            accessibilityRole="button">
                            <AppText
                              className="text-[13px] font-sans-medium"
                              style={{color: isActive ? LISTENING_BLUE : colors.neutrals300}}>
                              {sub.name}
                            </AppText>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                );
              })()}

              {/* Custom Scenarios — hiện khi tab Tuỳ chỉnh */}
              {selectedCategory === 'custom' ? (
                customScenarios.length === 0 ? (
                  <View className="items-center py-6">
                    <AppText className="text-2xl mb-2">✨</AppText>
                    <AppText className="text-sm" style={{color: colors.neutrals300}}>
                      Chưa có kịch bản tuỳ chỉnh
                    </AppText>
                    <AppText className="text-xs mt-1" style={{color: colors.neutrals300}}>
                      Mở Chọn chủ đề → Tuỳ chỉnh để tạo
                    </AppText>
                  </View>
                ) : (
                  customScenarios.slice(0, 3).map(cs => {
                    const isSelected = selectedTopic?.name === cs.name;
                    return (
                      <TouchableOpacity
                        key={cs.id}
                        className="rounded-xl px-4 py-3.5 mb-3"
                        style={{
                          backgroundColor: isSelected ? `${LISTENING_BLUE}15` : colors.neutrals900,
                          borderColor: isSelected ? LISTENING_BLUE : colors.border,
                          borderWidth: 1,
                        }}
                        onPress={() => {
                          haptic.light();
                          if (isSelected) {
                            setSelectedTopic(null);
                          } else {
                            setSelectedTopic(
                              {id: cs.id, name: cs.name, description: cs.description || ''},
                              'custom',
                              '',
                            );
                          }
                        }}
                        accessibilityLabel={`${cs.name}${isSelected ? ', đang chọn' : ''}`}
                        accessibilityRole="button">
                        <View className="flex-row items-start justify-between">
                          <View className="flex-1 mr-3">
                            <AppText
                              className="font-sans-bold text-[15px]"
                              style={{color: isSelected ? LISTENING_BLUE : colors.foreground}}>
                              {cs.name}
                            </AppText>
                            {cs.description ? (
                              <AppText
                                className="text-xs mt-0.5" style={{color: colors.neutrals300}}
                                numberOfLines={1}>
                                {cs.description}
                              </AppText>
                            ) : null}
                          </View>
                          {isSelected && (
                            <View
                              className="w-5 h-5 items-center justify-center rounded-full"
                              style={{backgroundColor: LISTENING_BLUE}}>
                              <Icon name="Check" className="w-3 h-3" style={{color: '#FFFFFF'}} />
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )
              ) : null}

              {/* Scenario Cards (2-3 cards) — ẩn khi tab Tuỳ chỉnh */}
              {selectedCategory !== 'custom' && currentScenarios.map(scenario => {
                const isSelected = selectedTopic?.id === scenario.id;
                const isFav = favoriteScenarioIds.includes(scenario.id);
                return (
                  <TouchableOpacity
                    key={scenario.id}
                    className="rounded-xl px-4 py-3.5 mb-3"
                    style={{
                      backgroundColor: isSelected
                        ? `${LISTENING_ORANGE}15`
                        : colors.neutrals900,
                      borderColor: isSelected ? LISTENING_ORANGE : colors.border,
                      borderWidth: 1,
                    }}
                    onPress={() => {
                      haptic.light();
                      setSelectedTopic(
                        isSelected ? null : scenario,
                        selectedCategory,
                        selectedSubCategory,
                      );
                    }}
                    accessibilityLabel={`${scenario.name}. ${scenario.description}${isSelected ? ', đang chọn' : ''}`}
                    accessibilityRole="button">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 mr-3">
                        <AppText
                          className="font-sans-bold text-[15px]" 
                          style={{color: isSelected ? LISTENING_ORANGE : colors.foreground}}>
                          {scenario.name}
                        </AppText>
                        <AppText
                          className="text-xs mt-0.5" style={{color: colors.neutrals400}}
                          numberOfLines={1}>
                          {scenario.description}
                        </AppText>
                      </View>
                      <TouchableOpacity
                        className="pt-0.5"
                        onPress={() => {
                          haptic.light();
                          toggleFavorite(scenario.id);
                        }}
                        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                        accessibilityLabel={isFav ? 'Bỏ yêu thích' : 'Yêu thích'}
                        accessibilityRole="button">
                        <Icon
                          name="Heart"
                          className="w-4 h-4"
                          style={{
                            color: isFav ? LISTENING_ORANGE : colors.neutrals400,
                          }}
                          fill={isFav ? LISTENING_ORANGE : 'none'}
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* "Xem tất cả" link */}
              <TouchableOpacity
                className="py-3 items-center"
                onPress={() => {
                  haptic.light();
                  setShowTopicModal(true);
                }}
                accessibilityLabel={`Xem tất cả kịch bản`}
                accessibilityRole="link">
                <AppText className="text-sm text-center" style={{color: LISTENING_BLUE}}>
                  Xem tất cả {totalScenarios} kịch bản →
                </AppText>
              </TouchableOpacity>

              {/* Divider "hoặc" */}
              <View className="flex-row items-center my-3">
                <View className="flex-1 h-[1px]" style={{backgroundColor: colors.border}} />
                <AppText className="text-xs mx-3" style={{color: colors.neutrals400}}>hoặc</AppText>
                <View className="flex-1 h-[1px]" style={{backgroundColor: colors.border}} />
              </View>

              {/* Free text input */}
                <TextInput
                className="rounded-xl px-4 py-3 text-[15px]"
                style={{color: colors.foreground, backgroundColor: colors.neutrals900, borderWidth: 1, borderColor: colors.neutrals800}}
                placeholder="Nhập chủ đề riêng..."
                placeholderTextColor={colors.neutrals400}
                value={topicInput}
                onChangeText={text => {
                  setTopicInput(text);
                  if (text.trim() && selectedTopic) {
                    setSelectedTopic(null);
                  }
                }}
                returnKeyType="done"
                editable={!isGenerating}
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Nhập chủ đề hội thoại tự do"
              />
            </SectionCard>
          </View>
          )}

          {/* ======================== */}
          {/* LEVEL + DURATION + SPEAKERS (merged — Option B) */}
          {/* ======================== */}
          {mode === 'podcast' && (
            <View className="px-6 mb-6">
              <SectionCard>
                {/* Level */}
                <AppText className="text-xs font-sans-medium mb-2 uppercase tracking-wider" style={{color: colors.neutrals400}}>
                  Level
                </AppText>
                <View className="flex-row gap-2 mb-4">
                  {LEVELS.map(level => {
                    const isActive = config.level === level.id;
                    return (
                      <TouchableOpacity
                        key={level.id}
                        className="flex-1 py-2.5 rounded-xl items-center border"
                        style={{
                          backgroundColor: isActive ? LISTENING_BLUE : 'transparent',
                          borderColor: isActive ? LISTENING_BLUE : colors.neutrals800,
                        }}
                        onPress={() => {
                          haptic.light();
                          setConfig({level: level.id});
                        }}
                        disabled={isGenerating}
                        accessibilityLabel={`Trình độ ${level.label}${isActive ? ', đang chọn' : ''}`}
                        accessibilityRole="button">
                        <AppText
                          className="text-[15px] font-sans-medium"
                          style={{color: isActive ? '#FFFFFF' : colors.foreground}}>
                          {level.label}
                        </AppText>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Separator */}
                <View className="h-[1px] mb-4" style={{backgroundColor: colors.border}} />

                {/* Duration + Speakers */}
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <DurationSelector
                      value={config.durationMinutes}
                      onChange={d => setConfig({durationMinutes: d})}
                      disabled={isGenerating}
                    />
                  </View>
                  <View className="flex-1">
                    <SpeakersSelector
                      value={config.numSpeakers ?? 2}
                      onChange={n => setConfig({numSpeakers: n})}
                      disabled={isGenerating}
                    />
                  </View>
                </View>
              </SectionCard>
            </View>
          )}

          {/* ======================== */}
          {/* RADIO MODE CONTENT */}
          {/* ======================== */}
          {mode === 'radio' && (
            <>
              {/* Radio Duration — preset pills */}
              <View className="px-6 mb-4">
                <SectionCard>
                  <AppText
                    className="text-xs font-sans-medium mb-1 uppercase tracking-wider"
                    style={{color: colors.neutrals400}}>
                    Duration
                  </AppText>
                  <View className="flex-row items-center mb-3">
                    <AppText
                      className="font-sans-semibold text-base"
                      style={{color: colors.foreground}}>
                      Chọn thời lượng
                    </AppText>
                    <Icon
                      name="Clock"
                      className="w-4 h-4 ml-2"
                      style={{color: colors.neutrals400}}
                    />
                  </View>
                  <View className="flex-row flex-wrap gap-2">
                    {[1, 30, 60, 120].map(min => {
                      const isActive = config.durationMinutes === min;
                      const label = min >= 60 ? `${min / 60}h` : `${min}'`;
                      return (
                        <TouchableOpacity
                          key={min}
                          className="items-center justify-center rounded-xl border"
                          style={{
                            width: '22%',
                            flexGrow: 1,
                            paddingVertical: 10,
                            backgroundColor: isActive
                              ? LISTENING_BLUE
                              : 'transparent',
                            borderColor: isActive
                              ? LISTENING_BLUE
                              : colors.neutrals800,
                          }}
                          onPress={() => {
                            haptic.light();
                            setConfig({durationMinutes: min});
                          }}
                          disabled={isGenerating}>
                          <AppText
                            className="text-sm font-sans-bold"
                            style={{
                              color: isActive ? '#FFFFFF' : colors.foreground,
                            }}>
                            {label}
                          </AppText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </SectionCard>
              </View>

              {/* T-01: Your Playlists — Lấy từ API */}
              <View className="px-6 mb-4">
                <SectionCard>
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <AppText
                        className="text-xs font-sans-medium uppercase tracking-wider"
                        style={{color: colors.neutrals400}}>
                        Your playlists
                      </AppText>
                    </View>
                    {radioPlaylists.length > 3 && (
                      <TouchableOpacity
                        onPress={() => {
                          haptic.light();
                          setShowAllPlaylists(prev => !prev);
                        }}>
                        <AppText
                          className="text-xs"
                          style={{color: LISTENING_BLUE}}>
                          {showAllPlaylists ? 'Thu gọn' : 'Xem tất cả'}
                        </AppText>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View className="flex-row items-center mb-3">
                    <AppText
                      className="font-sans-semibold text-base"
                      style={{color: colors.foreground}}>
                      Playlist của bạn
                    </AppText>
                    <View
                      className="rounded-full px-2 py-0.5 ml-2"
                      style={{backgroundColor: LISTENING_BLUE}}>
                      <AppText className="text-xs font-sans-bold text-white">
                        {radioPlaylists.length}
                      </AppText>
                    </View>
                  </View>

                  {/* Loading state */}
                  {isLoadingPlaylists && (
                    <View className="items-center py-6">
                      <AppText className="text-sm" style={{color: colors.neutrals400}}>
                        Đang tải playlists...
                      </AppText>
                    </View>
                  )}

                  {/* Playlist cards */}
                  {!isLoadingPlaylists && radioPlaylists.length > 0 && (
                    <View className="gap-2">
                      {(showAllPlaylists ? radioPlaylists : radioPlaylists.slice(0, 5)).map(pl => {
                        const isSelecting = selectedPlaylistIds.size > 0;
                        const isSelected = selectedPlaylistIds.has(pl.id);

                        const plCardBg = isSelected
                          ? (isDark ? '#1a2e4a' : '#e8f0fe')
                          : (isDark ? colors.background : '#FFFFFF');

                        const plCardBorder = isSelected ? LISTENING_BLUE : colors.neutrals800;

                        // Container-based border: Border trên Swipeable containerStyle.
                        // Card và gradient trong cùng bordered container → không gap.
                        const cardContent = (
                          <TouchableOpacity
                            className="flex-row items-center px-3 py-3"
                            style={{
                              backgroundColor: plCardBg,
                              ...(isSelecting ? {
                                borderWidth: 1,
                                borderColor: plCardBorder,
                                borderRadius: 12,
                              } : {}),
                            }}
                            onPress={() => {
                              if (isSelecting) {
                                // Multi-select mode: toggle
                                haptic.light();
                                setSelectedPlaylistIds(prev => {
                                  const next = new Set(prev);
                                  if (next.has(pl.id)) next.delete(pl.id);
                                  else next.add(pl.id);
                                  return next;
                                });
                              } else {
                                handleLoadPlaylist(pl.id);
                              }
                            }}
                            onLongPress={() => {
                              // Vào multi-select mode
                              haptic.medium();
                              setSelectedPlaylistIds(new Set([pl.id]));
                            }}
                            activeOpacity={0.7}
                            accessibilityLabel={`Mở playlist ${pl.name}`}
                            accessibilityRole="button">
                            {/* Checkbox khi đang multi-select */}
                            {isSelecting && (
                              <View
                                className={`w-6 h-6 rounded-lg border-2 items-center justify-center mr-2`}
                                style={{
                                  borderColor: isSelected ? LISTENING_BLUE : colors.neutrals500,
                                  backgroundColor: isSelected ? LISTENING_BLUE : 'transparent',
                                }}>
                                {isSelected && (
                                  <AppText className="text-white text-xs font-sans-bold">✓</AppText>
                                )}
                              </View>
                            )}
                            {/* Play icon */}
                            <View
                              className="w-10 h-10 rounded-full items-center justify-center mr-3"
                              style={{backgroundColor: `${LISTENING_BLUE}20`}}>
                              <Icon
                                name="Play"
                                className="w-5 h-5"
                                style={{color: LISTENING_BLUE}}
                              />
                            </View>
                            {/* Info */}
                            <View className="flex-1">
                              <AppText
                                className="font-sans-medium text-sm"
                                style={{color: colors.foreground}}
                                numberOfLines={1}>
                                Radio • {new Date(pl.created_at).toLocaleDateString('vi-VN', {
                                  day: '2-digit', month: '2-digit',
                                })} {new Date(pl.created_at).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit', minute: '2-digit', hour12: false,
                                })}
                              </AppText>
                              <AppText
                                className="text-xs mt-0.5"
                                style={{color: colors.neutrals400}}>
                                {`${pl.itemCount ?? 0} bài`}
                              </AppText>
                            </View>
                            <Icon
                              name="ChevronRight"
                              className="w-4 h-4"
                              style={{color: colors.neutrals500}}
                            />
                          </TouchableOpacity>
                        );

                        if (isSelecting) {
                          return <View key={pl.id}>{cardContent}</View>;
                        }

                        const swipeRef = React.createRef<any>();

                        /**
                         * Mục đích: Xử lý xóa playlist (gọi API + cập nhật state)
                         * Khi nào: Gọi khi user full-swipe hoặc nhấn nút Xóa
                         */
                        const handleDeletePlaylist = async () => {
                          try {
                            await radioApi.deletePlaylist(pl.id);
                            setRadioPlaylists(prev => prev.filter(p => p.id !== pl.id));
                            showSuccess('Đã xóa playlist');
                          } catch (err: any) {
                            showError('Lỗi xóa playlist: ' + (err?.message || ''));
                          }
                        };

                        return (
                          <Swipeable
                            key={pl.id}
                            ref={swipeRef}
                            overshootRight={false}
                            friction={2}
                            rightThreshold={40}
                            containerStyle={{
                              borderWidth: 1,
                              borderColor: plCardBorder,
                              borderRadius: 12,
                              overflow: 'hidden',
                            }}
                            onSwipeableOpen={() => {
                              Alert.alert(
                                'Xóa playlist',
                                `Bạn có chắc chắn muốn xóa playlist này?`,
                                [
                                  {
                                    text: 'Hủy',
                                    style: 'cancel',
                                    onPress: () => swipeRef.current?.close(),
                                  },
                                  {
                                    text: 'Xóa',
                                    style: 'destructive',
                                    onPress: handleDeletePlaylist,
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
                                        'Xóa playlist',
                                        `Bạn có chắc chắn muốn xóa playlist này?`,
                                        [
                                          {text: 'Hủy', style: 'cancel', onPress: () => swipeRef.current?.close()},
                                          {text: 'Xóa', style: 'destructive', onPress: handleDeletePlaylist},
                                        ],
                                      );
                                    }}>
                                    <LinearGradient
                                      colors={[plCardBg, '#DC262680', '#DC2626']}
                                      start={{x: 0, y: 0}}
                                      end={{x: 1, y: 0}}
                                      locations={[0, 0.35, 1]}
                                      style={{
                                        width: 80,
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
                                          className="w-9 h-9 rounded-full items-center justify-center mb-1"
                                          style={{backgroundColor: 'rgba(255,255,255,0.25)'}}>
                                          <Icon name="Trash2" className="w-4 h-4" style={{color: '#FFFFFF'}} />
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
                            {cardContent}
                          </Swipeable>
                        );
                      })}

                      {/* Nút xóa lô khi đang multi-select */}
                      {selectedPlaylistIds.size > 0 && (
                        <View className="flex-row items-center gap-2 mt-2">
                          <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
                            style={{backgroundColor: '#EF4444'}}
                            onPress={() => {
                              Alert.alert(
                                'Xóa playlist',
                                `Bạn có chắc chắn muốn xóa ${selectedPlaylistIds.size} playlist?`,
                                [
                                  {text: 'Hủy', style: 'cancel'},
                                  {
                                    text: 'Xóa',
                                    style: 'destructive',
                                    onPress: async () => {
                                      try {
                                        const ids = Array.from(selectedPlaylistIds);
                                        await radioApi.deletePlaylists(ids);
                                        setRadioPlaylists(prev => prev.filter(p => !selectedPlaylistIds.has(p.id)));
                                        setSelectedPlaylistIds(new Set());
                                        showSuccess(`Đã xóa ${ids.length} playlist`);
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
                              Xóa {selectedPlaylistIds.size} playlist
                            </AppText>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="py-3 px-4 rounded-xl"
                            style={{backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.surface}}
                            onPress={() => setSelectedPlaylistIds(new Set())}>
                            <AppText className="font-sans-medium text-sm" style={{color: colors.foreground}}>
                              Hủy
                            </AppText>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Empty state */}
                  {!isLoadingPlaylists && radioPlaylists.length === 0 && (
                    <View className="items-center py-8">
                      <AppText className="text-3xl mb-2">📻</AppText>
                      <AppText
                        className="text-sm text-center"
                        style={{color: colors.neutrals400}}>
                        Chưa có playlist nào.{'\n'}Nhấn "Tạo Radio playlist" để bắt đầu!
                      </AppText>
                    </View>
                  )}
                </SectionCard>
              </View>
            </>
          )}

        </RNAnimated.ScrollView>
      </KeyboardAvoidingView>

      {/* T-09: NowPlayingBar — mini player cho Radio khi đang ở ConfigScreen */}
      <NowPlayingBar
        onPress={() => {
          navigation.navigate('RadioScreen' as never);
        }}
      />

      {/* ======================== */}
      {/* STICKY FOOTER */}
      {/* ======================== */}
      {!keyboardVisible && (
        <View
          className="absolute bottom-0 left-0 right-0 px-6 pt-0"
          style={{paddingBottom: 8}}>
          {/* Footer gradient — chỉ dark mode, light mode tạo vạch xám */}
          {isDark && (
            <LinearGradient
              colors={[
                'transparent',
                `${colors.background}20`,
                `${colors.background}50`,
                `${colors.background}90`,
                `${colors.background}CC`,
                colors.background,
              ]}
              locations={[0, 0.15, 0.3, 0.5, 0.7, 1]}
              style={{
                position: 'absolute',
                top: -100,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          )}
          <View
            style={
              canStart || (mode as string) === 'radio'
                ? {
                    shadowColor: LISTENING_BLUE,
                    shadowOffset: {width: 0, height: 4},
                    shadowOpacity: 0.35,
                    shadowRadius: 12,
                    elevation: 8,
                  }
                : undefined
            }>
            <AppButton
              variant="primary"
              size="lg"
              className="w-full rounded-2xl"
              textClassname="font-sans-bold"
              style={{
                backgroundColor:
                  canStart || (mode as string) === 'radio'
                    ? LISTENING_BLUE
                    : isDark
                      ? colors.neutrals900
                      : `${LISTENING_BLUE}18`,
                // Disabled: border nhẹ để nhìn thấy nút
                borderWidth: canStart || (mode as string) === 'radio'
                  ? (isLiquidGlassSupported && isDark ? 1 : 0)
                  : 1.5,
                borderColor: canStart || (mode as string) === 'radio'
                  ? (isLiquidGlassSupported && isDark ? 'rgba(255,255,255,0.15)' : 'transparent')
                  : isDark
                    ? colors.glassBorder
                    : `${LISTENING_BLUE}30`,
              }}
              onPress={handleGenerate}
              disabled={isGenerating || (!canStart && (mode as string) !== 'radio')}
              loading={isGenerating}
              accessibilityLabel={
                (mode as string) === 'radio'
                  ? 'Tạo Radio playlist'
                  : canStart
                    ? 'Bắt đầu nghe'
                    : 'Chưa chọn chủ đề, không thể bắt đầu'
              }>
              {mode === 'radio' ? 'Tạo Radio playlist' : 'Bắt đầu nghe'}
            </AppButton>
          </View>
        </View>
      )}

      {/* ======================== */}
      {/* TopicPicker Full-screen Modal */}
      {/* ======================== */}
      <TopicPickerModal
        visible={showTopicModal}
        onClose={() => setShowTopicModal(false)}
        disabled={isGenerating}
        onManageCategory={(categoryId) => {
          // Đóng modal + navigate đến ManageCategoriesScreen
          setShowTopicModal(false);
          setTimeout(() => {
            navigation.navigate('ManageCategories' as never, { focusCategoryId: categoryId } as never);
          }, 300);
        }}
      />

      {/* TTS Settings Sheet */}
      <TtsSettingsSheet
        visible={showTtsSettings}
        onClose={() => setShowTtsSettings(false)}
        numSpeakers={config.numSpeakers ?? 2}
      />

      {/* Generating Overlay — thay showLoading() */}
      {isGenerating && (
        <View style={[StyleSheet.absoluteFill, {zIndex: 100}]}>
          <GeneratingScreen
            currentStep={generatingStep}
            activeSpeaker={activeSpeaker}
            onCancel={() => {
              setGenerating(false);
              haptic.error();
            }}
          />
        </View>
      )}
    </View>
  );
}

// ========================
// SectionCard — card wrapper với Liquid Glass effect
// ========================

interface SectionCardProps {
  children: React.ReactNode;
}

/**
 * Mục đích: Card container cho mỗi config section — dùng LiquidGlassView trên iOS 26+
 * Tham số đầu vào: children
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ConfigScreen → wrap mỗi section
 */
function SectionCard({children}: SectionCardProps) {
  const colors = useColors();
  const theme = useAppStore(state => state.theme);
  const isDark = theme !== 'light';

  // iOS 26+ → Liquid Glass effect với shadow, rim light, inner glow
  // L1: Border adapt light/dark — L5: Inner glow adapt
  if (isLiquidGlassSupported) {
    return (
      <View style={{
        // Shadow — nhẹ hơn trong light mode
        shadowColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.15)',
        shadowOffset: {width: 0, height: isDark ? 8 : 4},
        shadowOpacity: isDark ? 0.35 : 0.2,
        shadowRadius: isDark ? 16 : 12,
        elevation: isDark ? 8 : 4,
        borderRadius: 20,
      }}>
        <LiquidGlassView
          effect="regular"
          tintColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'}
          style={{
            borderRadius: 20,
            padding: 16,
            overflow: 'hidden',
            // L1: Rim light adaptive — dark = white tint, light = dark tint
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)',
            borderTopColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.60)',
            borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            // Glass bg — light mode dùng tint nhẹ hơn
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)',
          }}>
          {/* Inner glow — chỉ hiện trong dark mode, light mode bị tạo vạch xám */}
          {isDark && (
            <LinearGradient
              colors={['rgba(255,255,255,0.08)', 'transparent']}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 40,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }}
            />
          )}
          {children}
        </LiquidGlassView>
      </View>
    );
  }

  // Fallback — View thường với surfaceRaised
  return (
    <View
      className="rounded-[20px] p-4 overflow-hidden"
      style={{
        backgroundColor: colors.surfaceRaised,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}>
      {children}
    </View>
  );
}

