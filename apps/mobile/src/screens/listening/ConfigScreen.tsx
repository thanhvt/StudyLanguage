import React, {useRef, useState, useCallback, useMemo} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Pressable,
} from 'react-native';
import {AppButton, AppText, Switch} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useListeningStore} from '@/store/useListeningStore';
import {listeningApi} from '@/services/api/listening';
import {useToast} from '@/components/ui/ToastProvider';
import {useDialog} from '@/components/ui/DialogProvider';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useInsets} from '@/hooks/useInsets';
import {getTotalScenarios, CATEGORIES, type TopicScenario} from '@/data/topic-data';
import {
  DurationSelector,
  SpeakersSelector,
  TopicPickerModal,
} from '@/components/listening';
import {useAudioPlayerStore} from '@/store/useAudioPlayerStore';
import TrackPlayer from 'react-native-track-player';

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

  // ========================
  // Hooks
  // ========================
  const {showError, showWarning} = useToast();
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
    const category = CATEGORIES.find(c => c.id === selectedCategory);
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

  // Khi user chọn scenario → xóa topicInput
  React.useEffect(() => {
    if (selectedTopic) {
      setTopicInput('');
    }
  }, [selectedTopic]);

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
      haptic.medium();
      const levelLabel = {beginner: 'Cơ bản', intermediate: 'Trung bình', advanced: 'Nâng cao'}[config.level] || config.level;
      const speakerCount = config.numSpeakers ?? 2;
      showLoading(
        'Đang tạo bài nghe...',
        `📝 ${topic}\n⏱ ${config.durationMinutes} phút · 👥 ${speakerCount} người · 🎯 ${levelLabel}`,
      );

      const result = await listeningApi.generateConversation({
        ...config,
        topic,
      });

      hideLoading();
      setConversation(result);
      haptic.success();
      navigation.navigate('Player');
    } catch (error: any) {
      hideLoading();
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
      navigation.navigate('Radio');
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

  return (
    <View className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{paddingBottom: footerHeight + 20}}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* ======================== */}
          {/* HEADER: "Luyện Nghe" + gear icon */}
          {/* ======================== */}
          <View className="px-6 pt-safe-offset-4 mb-5">
            <View className="flex-row items-center justify-between">
              <View>
                <AppText className="text-2xl font-sans-bold text-foreground">
                  Luyện Nghe
                </AppText>
                <AppText className="text-neutrals400 text-xs mt-0.5">
                  {totalScenarios}+ kịch bản có sẵn
                </AppText>
              </View>
              <TouchableOpacity
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{backgroundColor: `${LISTENING_BLUE}15`}}
                onPress={() => {
                  haptic.light();
                  // TODO: Mở TTS Settings Sheet
                }}
                accessibilityLabel="Cài đặt giọng đọc"
                accessibilityRole="button">
                <Icon name="Settings" className="w-5 h-5" style={{color: LISTENING_BLUE}} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ======================== */}
          {/* TOPIC SECTION: "Chủ đề" + inline picker */}
          {/* ======================== */}
          <View className="px-6 mb-4">
            <SectionCard accentColor={LISTENING_BLUE} shadowColor={LISTENING_BLUE}>
              {/* Top Row: Label + action buttons */}
              <View className="flex-row items-center justify-between mb-3">
                <AppText className="text-foreground font-sans-semibold text-base">
                  Chủ đề
                </AppText>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{backgroundColor: `${LISTENING_BLUE}15`}}
                    onPress={() => {
                      haptic.light();
                      setShowTopicModal(true);
                    }}
                    accessibilityLabel="Tìm kiếm chủ đề"
                    accessibilityRole="button">
                    <Icon name="Search" className="w-4 h-4" style={{color: LISTENING_BLUE}} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{backgroundColor: `${LISTENING_BLUE}15`}}
                    onPress={() => {
                      haptic.light();
                      // TODO: Show favorites filter
                    }}
                    accessibilityLabel="Chủ đề yêu thích"
                    accessibilityRole="button">
                    <Icon name="Heart" className="w-4 h-4" style={{color: LISTENING_BLUE}} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{backgroundColor: `${LISTENING_BLUE}15`}}
                    onPress={() => {
                      haptic.light();
                      navigation.navigate('CustomScenarios');
                    }}
                    accessibilityLabel="Tạo chủ đề mới"
                    accessibilityRole="button">
                    <Icon name="Plus" className="w-4 h-4" style={{color: LISTENING_BLUE}} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Category Tabs */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-2">
                <View className="flex-row gap-2">
                  {CATEGORIES.map(cat => {
                    const isActive = selectedCategory === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        className="flex-row items-center px-3 py-1.5 rounded-full border"
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
                          <AppText className="text-xs mr-1">{cat.icon}</AppText>
                        )}
                        <AppText
                          className="text-xs font-sans-medium"
                          style={{color: isActive ? '#FFFFFF' : colors.foreground}}>
                          {cat.name}
                        </AppText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Subcategory Chips */}
              {(() => {
                const category = CATEGORIES.find(c => c.id === selectedCategory);
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
                            className="px-3 py-1 rounded-lg border"
                            style={{
                              backgroundColor: isActive ? `${LISTENING_BLUE}15` : 'transparent',
                              borderColor: isActive ? LISTENING_BLUE : colors.neutrals800,
                            }}
                            onPress={() => {
                              haptic.light();
                              setSelectedSubCategory(sub.id);
                            }}
                            accessibilityLabel={`${sub.name}${isActive ? ', đang chọn' : ''}`}
                            accessibilityRole="button">
                            <AppText
                              className="text-xs"
                              style={{color: isActive ? LISTENING_BLUE : colors.neutrals400}}>
                              {sub.name}
                            </AppText>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                );
              })()}

              {/* Scenario Cards (2-3 cards) */}
              {currentScenarios.map(scenario => {
                const isSelected = selectedTopic?.id === scenario.id;
                const isFav = favoriteScenarioIds.includes(scenario.id);
                return (
                  <TouchableOpacity
                    key={scenario.id}
                    className="rounded-xl px-4 py-3 mb-2 border"
                    style={{
                      backgroundColor: isSelected
                        ? `${LISTENING_ORANGE}15`
                        : colors.neutrals900,
                      borderColor: isSelected ? LISTENING_ORANGE : 'transparent',
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
                          className="font-sans-bold text-sm"
                          style={{color: isSelected ? LISTENING_ORANGE : colors.foreground}}>
                          {scenario.name}
                        </AppText>
                        <AppText
                          className="text-neutrals400 text-xs mt-0.5"
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
                className="py-1"
                onPress={() => {
                  haptic.light();
                  setShowTopicModal(true);
                }}
                accessibilityLabel={`Xem tất cả kịch bản`}
                accessibilityRole="link">
                <AppText className="text-xs" style={{color: LISTENING_BLUE}}>
                  Xem tất cả {totalScenarios} kịch bản →
                </AppText>
              </TouchableOpacity>

              {/* Divider "hoặc" */}
              <View className="flex-row items-center my-3">
                <View className="flex-1 h-[1px] bg-border" />
                <AppText className="text-neutrals400 text-xs mx-3">hoặc</AppText>
                <View className="flex-1 h-[1px] bg-border" />
              </View>

              {/* Free text input */}
              <TextInput
                className="bg-neutrals900 rounded-xl px-4 py-3 text-sm border border-neutrals800"
                style={{color: colors.foreground}}
                placeholder="Nhập chủ đề riêng..."
                placeholderTextColor={colors.neutrals500}
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

          {/* ======================== */}
          {/* LEVEL SECTION */}
          {/* ======================== */}
          <View className="px-6 mb-4">
            <SectionCard>
              <AppText className="text-neutrals400 text-xs font-sans-medium mb-2 uppercase tracking-wider">
                Level
              </AppText>
              <View className="flex-row gap-2">
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
                        className="text-sm font-sans-medium"
                        style={{color: isActive ? '#FFFFFF' : colors.foreground}}>
                        {level.label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </SectionCard>
          </View>

          {/* ======================== */}
          {/* MODE SECTION: Podcast / Radio */}
          {/* ======================== */}
          <View className="px-6 mb-4">
            <SectionCard>
              <AppText className="text-neutrals400 text-xs font-sans-medium mb-2 uppercase tracking-wider">
                Mode
              </AppText>
              <View className="flex-row gap-2">
                {MODES.map(m => {
                  const isActive = mode === m.id;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl border"
                      style={{
                        backgroundColor: isActive ? LISTENING_BLUE : 'transparent',
                        borderColor: isActive ? LISTENING_BLUE : colors.neutrals800,
                      }}
                      onPress={() => {
                        haptic.light();
                        setMode(m.id);
                      }}
                      disabled={isGenerating}
                      accessibilityLabel={`Chế độ ${m.label}${isActive ? ', đang chọn' : ''}`}
                      accessibilityRole="button">
                      <AppText className="text-sm mr-1.5">{m.icon}</AppText>
                      <AppText
                        className="text-sm font-sans-medium"
                        style={{color: isActive ? '#FFFFFF' : colors.foreground}}>
                        {m.label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </SectionCard>
          </View>

          {/* ======================== */}
          {/* DURATION + SPEAKERS ROW */}
          {/* ======================== */}
          {mode === 'podcast' && (
            <View className="px-6 mb-4">
              <SectionCard>
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
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ======================== */}
      {/* STICKY FOOTER */}
      {/* ======================== */}
      {!keyboardVisible && (
        <View
          className="absolute bottom-0 left-0 right-0 px-6 pt-3 border-t border-border bg-background/95"
          style={{paddingBottom: Math.max(insets.bottom, 16)}}>
          <View
            style={
              canStart
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
              style={{backgroundColor: canStart ? LISTENING_BLUE : colors.neutrals700}}
              onPress={handleGenerate}
              disabled={isGenerating || !canStart}
              loading={isGenerating}
              accessibilityLabel={
                canStart
                  ? 'Bắt đầu nghe'
                  : 'Chưa chọn chủ đề, không thể bắt đầu'
              }>
              Bắt đầu nghe
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
      />
    </View>
  );
}

// ========================
// SectionCard — card wrapper theo Obsidian Glass style
// ========================

interface SectionCardProps {
  children: React.ReactNode;
  /** Màu accent cho left border indicator */
  accentColor?: string;
  /** Màu shadow riêng cho card */
  shadowColor?: string;
}

/**
 * Mục đích: Card container cho mỗi config section, tạo visual depth
 * Tham số đầu vào: children, accentColor (optional), shadowColor (optional)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ConfigScreen → wrap mỗi section
 */
function SectionCard({children, accentColor, shadowColor}: SectionCardProps) {
  return (
    <View
      className="bg-surface-raised rounded-2xl p-4 border border-border overflow-hidden"
      style={{
        shadowColor: shadowColor || '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: shadowColor ? 0.15 : 0.06,
        shadowRadius: shadowColor ? 8 : 4,
        elevation: 2,
      }}>
      {/* Left accent bar */}
      {accentColor && (
        <View
          className="absolute left-0 top-3 bottom-3 rounded-r-full"
          style={{
            width: 3,
            backgroundColor: accentColor,
            opacity: 0.6,
          }}
        />
      )}
      {children}
    </View>
  );
}
