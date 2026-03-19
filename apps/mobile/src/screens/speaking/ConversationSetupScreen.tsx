import React, {useState, useCallback, useMemo, useRef, useEffect} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
  Animated as RNAnimated,
  LayoutAnimation,
  UIManager,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {AppText, SectionCard} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useInsets} from '@/hooks/useInsets';
import {useSpeakingStore} from '@/store/useSpeakingStore';
import {useListeningStore} from '@/store/useListeningStore';
import {useAppStore} from '@/store/useAppStore';
import {TopicPickerModal} from '@/components/listening';
import {TopicSelector} from '@/components/topic';
import {CONVERSATION_COLORS, getConversationColor} from '@/config/skillColors';
import {getPersonaForScenario, getDefaultPersona} from '@/config/conversationPersonas';
import type {SpeakingStackParamList} from '@/navigation/stacks/SpeakingStack';
import {
  getTotalScenarios,
  TOPIC_CATEGORIES,
  type TopicScenario,
} from '@/data/topic-data';
import {isLiquidGlassSupported, LiquidGlassView} from '@/utils/LiquidGlass';
import {enhanceApi} from '@/services/api/enhance';
import {canEnhanceToday, incrementEnhanceCount} from '@/utils/enhanceRateLimit';

type NavProp = NativeStackNavigationProp<SpeakingStackParamList>;

// =======================
// Màu sắc Speaking-specific (Green identity)
// =======================
const SPEAKING_GREEN = '#16A34A';

// =======================
// Constants
// =======================

const DURATIONS = [
  {label: "5'", value: 5},
  {label: "7'", value: 7},
  {label: "10'", value: 10},
  {label: "15'", value: 15},
  {label: "20'", value: 20},
  {label: '∞', value: 0},
];

const DIFFICULTIES = [
  {label: 'Easy', value: 'easy' as const},
  {label: 'Medium', value: 'medium' as const},
  {label: 'Hard', value: 'hard' as const},
];

/**
 * Mục đích: Derive feedbackMode từ difficulty — mapping 1:1
 * Tham số đầu vào: difficulty ('easy' | 'medium' | 'hard')
 * Tham số đầu ra: 'beginner' | 'intermediate' | 'advanced'
 * Khi nào sử dụng: handleStart() — trước khi set conversationSetup
 */
const deriveFeedbackMode = (
  difficulty: 'easy' | 'medium' | 'hard',
): 'beginner' | 'intermediate' | 'advanced' => {
  const mapping = {
    easy: 'beginner' as const,
    medium: 'intermediate' as const,
    hard: 'advanced' as const,
  };
  return mapping[difficulty];
};

// =======================
// Screen
// =======================

/**
 * Mục đích: Màn hình setup thống nhất cho AI Conversation (Free Talk + Roleplay)
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   SpeakingHomeScreen → "AI Conversation" card → navigate ConversationSetup
 *   User chọn mode, topic, config → nhấn CTA → navigate ConversationSession
 */
export default function ConversationSetupScreen() {
  const navigation = useNavigation<NavProp>();
  const colors = useColors();
  const haptic = useHaptic();
  const insets = useInsets();

  // Theme detection
  const theme = useAppStore(state => state.theme);
  const isDark = theme !== 'light';

  // Parallax scroll value
  const scrollY = useRef(new RNAnimated.Value(0)).current;

  // Store
  const {setConversationSetup} = useSpeakingStore();

  // Listening store — chia sẻ topic/category/favorites
  const selectedTopic = useListeningStore(s => s.selectedTopic);
  const setSelectedTopic = useListeningStore(s => s.setSelectedTopic);
  const selectedCategory = useListeningStore(s => s.selectedCategory);
  const setSelectedCategory = useListeningStore(s => s.setSelectedCategory);
  const selectedSubCategory = useListeningStore(s => s.selectedSubCategory);
  const setSelectedSubCategory = useListeningStore(s => s.setSelectedSubCategory);
  const favoriteScenarioIds = useListeningStore(s => s.favoriteScenarioIds);
  const toggleFavorite = useListeningStore(s => s.toggleFavorite);

  // Local state
  const [mode, setMode] = useState<'free-talk' | 'roleplay'>('free-talk');
  const [durationIndex, setDurationIndex] = useState(0); // Mặc định 5 phút
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [topicInput, setTopicInput] = useState('');
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Keyboard tracking — ẩn sticky footer khi mở keyboard
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

  // Màu accent theo mode
  const accentColor = getConversationColor(mode);

  // Tổng scenarios
  const totalScenarios = getTotalScenarios();

  // Sticky footer height tính toán
  const footerHeight = 56 + 32 + Math.max(insets.bottom, 16);

  // Lấy scenarios theo category + subcategory hiện tại (max 3)
  const currentScenarios = useMemo(() => {
    const category = TOPIC_CATEGORIES.find(c => c.id === selectedCategory);
    if (!category) return [];
    let scenarios: TopicScenario[] = [];
    if (selectedSubCategory) {
      const sub = category.subCategories?.find(s => s.id === selectedSubCategory);
      scenarios = sub?.scenarios ?? [];
    } else {
      category.subCategories?.forEach(sub => {
        scenarios = [...scenarios, ...(sub.scenarios ?? [])];
      });
    }
    return scenarios.slice(0, 3);
  }, [selectedCategory, selectedSubCategory]);

  // Khi user chọn scenario → xóa topicInput
  React.useEffect(() => {
    if (selectedTopic) setTopicInput('');
  }, [selectedTopic]);

  // Derived
  const hasValidTopic = !!selectedTopic || !!topicInput.trim();
  const canStart = hasValidTopic;

  /**
   * Mục đích: Toggle mode giữa Free Talk và Roleplay
   * Tham số đầu vào: newMode ('free-talk' | 'roleplay')
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap toggle button
   */
  const handleModeToggle = useCallback((newMode: 'free-talk' | 'roleplay') => {
    haptic.light();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMode(newMode);
  }, [haptic]);

  /**
   * Mục đích: Render nội dung bên trong segmented control
   * Tham số đầu vào: không
   * Tham số đầu ra: JSX.Element
   * Khi nào sử dụng: Được gọi bởi cả LiquidGlassView và View fallback
   */
  const renderSegmentedButtons = useCallback(() => (
    <View style={styles.segmentedInner}>
      {/* Free Talk tab */}
      <TouchableOpacity
        style={[
          styles.segmentedBtn,
          mode === 'free-talk' && [
            styles.segmentedBtnActive,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : '#FFFFFF',
              ...(isDark ? {} : {
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.12,
                shadowRadius: 6,
                elevation: 3,
              }),
            },
          ],
        ]}
        onPress={() => handleModeToggle('free-talk')}
        activeOpacity={0.7}
        accessibilityLabel="Chế độ Free Talk"
        accessibilityRole="tab"
        accessibilityState={{selected: mode === 'free-talk'}}>
        <AppText
          variant="body"
          weight={mode === 'free-talk' ? 'bold' : 'semibold'}
          style={{
            color: mode === 'free-talk'
              ? CONVERSATION_COLORS.freeTalk.dark
              : isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
          }}
          raw>
          💬 Free Talk
        </AppText>
      </TouchableOpacity>

      {/* Roleplay tab */}
      <TouchableOpacity
        style={[
          styles.segmentedBtn,
          mode === 'roleplay' && [
            styles.segmentedBtnActive,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : '#FFFFFF',
              ...(isDark ? {} : {
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.12,
                shadowRadius: 6,
                elevation: 3,
              }),
            },
          ],
        ]}
        onPress={() => handleModeToggle('roleplay')}
        activeOpacity={0.7}
        accessibilityLabel="Chế độ Roleplay"
        accessibilityRole="tab"
        accessibilityState={{selected: mode === 'roleplay'}}>
        <AppText
          variant="body"
          weight={mode === 'roleplay' ? 'bold' : 'semibold'}
          style={{
            color: mode === 'roleplay'
              ? CONVERSATION_COLORS.roleplay.dark
              : isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
          }}
          raw>
          🎭 Roleplay
        </AppText>
      </TouchableOpacity>
    </View>
  ), [mode, isDark, handleModeToggle]);

  /**
   * Mục đích: Xử lý thay đổi text input — xoá selectedTopic nếu có text
   * Tham số đầu vào: text (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: TopicSelector → onTopicInputChange callback
   */
  const handleTopicInputChange = useCallback((text: string) => {
    setTopicInput(text);
    if (text.trim() && selectedTopic) setSelectedTopic(null);
  }, [selectedTopic, setSelectedTopic]);

  /**
   * Mục đích: Gọi AI mở rộng keyword ngắn thành scenario 12-16 từ
   * Tham số đầu vào: không (đọc topicInput từ state)
   * Tham số đầu ra: void (cập nhật topicInput với kết quả)
   * Khi nào sử dụng: TopicSelector → user bấm nút ✨ → onEnhanceScenario
   */
  const handleEnhanceScenario = useCallback(async () => {
    if (!topicInput.trim() || isEnhancing) return;
    const allowed = await canEnhanceToday();
    if (!allowed) {
      Alert.alert('Giới hạn', 'Bạn đã dùng hết 10 lần enhance hôm nay. Hãy thử lại vào ngày mai nhé!');
      return;
    }
    setIsEnhancing(true);
    try {
      const context = mode === 'roleplay' ? 'conversation_roleplay' : 'conversation_free_talk';
      const enhanced = await enhanceApi.enhanceScenario(topicInput.trim(), context);
      setTopicInput(enhanced);
      if (selectedTopic) setSelectedTopic(null);
      await incrementEnhanceCount();
      haptic.success();
    } catch (err) {
      console.error('❌ [Enhance] Lỗi enhance scenario:', err);
      haptic.error();
    } finally {
      setIsEnhancing(false);
    }
  }, [topicInput, isEnhancing, mode, selectedTopic, setSelectedTopic, haptic]);

  /**
   * Mục đích: Bắt đầu conversation session
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn CTA "Bắt đầu"
   */
  const handleStart = useCallback(() => {
    if (!hasValidTopic) return;

    const topicName = selectedTopic?.name || topicInput.trim();
    const topicId = selectedTopic?.id || null;

    // Tự động derive feedbackMode từ difficulty
    const feedbackMode = deriveFeedbackMode(difficulty);

    console.log('💬 [ConversationSetup] Bắt đầu session:', {
      mode,
      topicId,
      topicName,
      duration: mode === 'free-talk' ? DURATIONS[durationIndex].value : undefined,
      difficulty,
      feedbackMode,
    });

    setConversationSetup({
      mode,
      topicId,
      topicName: topicName || '',
      topicDescription: selectedTopic?.description || '',
      // CR-05 FIX: Tải persona từ mapping thay vì hardcode null
      persona: mode === 'roleplay'
        ? getPersonaForScenario(topicId ?? topicName ?? '')
          ?? getDefaultPersona(topicName ?? 'Roleplay')
        : null,
      difficulty,
      durationMinutes: DURATIONS[durationIndex].value,
      // Cải thiện 3: maxTurns dynamic — liên kết với duration
      maxTurns: DURATIONS[durationIndex].value === 0
        ? 999                                      // Unlimited → không giới hạn turns
        : DURATIONS[durationIndex].value * 2,       // 5 phút → 10 turns, 10 phút → 20 turns
      feedbackMode,
      options: {
        showSuggestions: feedbackMode === 'beginner' && mode === 'free-talk',
        inlineGrammarFix: true,
        pronunciationAlert: true,
      },
    });

    navigation.navigate('ConversationSession');
  }, [
    mode, hasValidTopic, selectedTopic, topicInput,
    durationIndex, difficulty, navigation, setConversationSetup,
  ]);

  return (
    <View className="flex-1" style={{backgroundColor: colors.background}}>
      {/* ======================== */}
      {/* GLASSMORPHISM BACKGROUND — Aurora mesh + floating blobs (Green palette) */}
      {/* ======================== */}
      {isLiquidGlassSupported && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* Lớp 1: Green-to-dark anchor gradient */}
          <LinearGradient
            colors={['#14532DB3', '#16A34A60', 'transparent', '#15803D30']}
            locations={[0, 0.18, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
          {/* Lớp 2: Emerald ambient glow */}
          <LinearGradient
            colors={['transparent', '#05966970', '#04785740', 'transparent']}
            locations={[0.1, 0.35, 0.55, 0.85]}
            start={{x: 0, y: 0.2}}
            end={{x: 1, y: 0.8}}
            style={StyleSheet.absoluteFill}
          />
          {/* Lớp 3: Lime spot — góc dưới phải */}
          <LinearGradient
            colors={['transparent', '#22C55E50']}
            start={{x: 0, y: 0.6}}
            end={{x: 1, y: 1}}
            style={[StyleSheet.absoluteFill, {top: '55%'}]}
          />
          {/* Lớp 4: White spotlight — top edge */}
          <LinearGradient
            colors={['rgba(200,255,220,0.18)', 'transparent']}
            start={{x: 0.5, y: 0}}
            end={{x: 0.5, y: 0.3}}
            style={[StyleSheet.absoluteFill, {height: '30%'}]}
          />
          {/* Floating blobs — parallax */}
          <RNAnimated.View style={{
            position: 'absolute', top: '12%', left: '10%',
            width: 180, height: 180, borderRadius: 90,
            backgroundColor: isDark ? 'rgba(22,163,74,0.25)' : 'rgba(22,163,74,0.12)',
            transform: [{translateY: scrollY.interpolate({
              inputRange: [0, 500],
              outputRange: [0, -75],
              extrapolate: 'clamp',
            })}],
          }} />
          <RNAnimated.View style={{
            position: 'absolute', top: '40%', right: '5%',
            width: 140, height: 140, borderRadius: 70,
            backgroundColor: isDark ? 'rgba(5,150,105,0.20)' : 'rgba(5,150,105,0.10)',
            transform: [{translateY: scrollY.interpolate({
              inputRange: [0, 500],
              outputRange: [0, -50],
              extrapolate: 'clamp',
            })}],
          }} />
          <RNAnimated.View style={{
            position: 'absolute', bottom: '20%', left: '20%',
            width: 120, height: 120, borderRadius: 60,
            backgroundColor: isDark ? 'rgba(34,197,94,0.18)' : 'rgba(34,197,94,0.10)',
            transform: [{translateY: scrollY.interpolate({
              inputRange: [0, 500],
              outputRange: [0, -40],
              extrapolate: 'clamp',
            })}],
          }} />
        </View>
      )}

      <RNAnimated.ScrollView
        className="flex-1"
        contentContainerStyle={{paddingBottom: footerHeight + 20}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={RNAnimated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: true},
        )}
        scrollEventThrottle={16}>

        {/* ======================== */}
        {/* HEADER: Title + Back button */}
        {/* ======================== */}
        <View className="px-6 pt-safe-offset-4 mb-2">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              accessibilityLabel="Quay lại"
              accessibilityRole="button">
              <Icon name="ArrowLeft" className="w-6 h-6" style={{color: colors.foreground}} />
            </TouchableOpacity>
            <View className="flex-1 items-center">
              <AppText className="text-2xl font-sans-bold" style={{color: colors.foreground}}>
                AI Conversation
              </AppText>
            </View>
            <View style={{width: 24}} />
          </View>
        </View>

        {/* Mode Toggle — iOS Segmented Control style */}
        <View className="px-6 mb-4">
          {/* Container: Glass trên iOS 26, solid fallback */}
          {isLiquidGlassSupported ? (
            <LiquidGlassView
              effect="regular"
              style={styles.segmentedContainer}>
              {renderSegmentedButtons()}
            </LiquidGlassView>
          ) : (
            <View style={[
              styles.segmentedContainer,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              },
            ]}>
              {renderSegmentedButtons()}
            </View>
          )}
        </View>

        {/* Section 2: Chủ đề — dùng TopicSelector dùng chung */}
        <View className="px-6 mb-4">
          <SectionCard>
            <TopicSelector
              accentColor={accentColor}
              label={mode === 'free-talk' ? 'Chủ đề' : 'Kịch bản'}
              selectedTopic={selectedTopic}
              selectedCategory={selectedCategory}
              selectedSubCategory={selectedSubCategory}
              currentScenarios={currentScenarios}
              favoriteScenarioIds={favoriteScenarioIds}
              totalScenarios={totalScenarios}
              topicInput={topicInput}
              inputAccessibilityLabel="Nhập chủ đề hội thoại tự do"
              onSelectTopic={setSelectedTopic}
              onSelectCategory={setSelectedCategory}
              onSelectSubCategory={setSelectedSubCategory}
              onTopicInputChange={handleTopicInputChange}
              onToggleFavorite={toggleFavorite}
              onOpenTopicModal={() => setShowTopicModal(true)}
              onEnhanceScenario={handleEnhanceScenario}
              isEnhancing={isEnhancing}
            />
          </SectionCard>
        </View>

        {/* Section 3: Duration (Free Talk only) */}
        {mode === 'free-talk' && (
          <View className="px-6 mb-4">
            <SectionCard>
              <AppText style={styles.sectionLabel}>Thời lượng</AppText>
              {/* Cải thiện 5: Tooltip gợi ý */}
              <AppText style={{fontSize: 11, color: colors.neutrals400, marginBottom: 10, marginTop: -4}}>💡 Gợi ý: 5-10 phút cho luyện tập hàng ngày</AppText>
              <View style={styles.optionRow}>
                {DURATIONS.map((d, i) => (
                  <TouchableOpacity
                    key={d.value}
                    style={[styles.optionPill, {
                      backgroundColor: i === durationIndex ? accentColor : 'transparent',
                      borderColor: i === durationIndex ? accentColor : colors.neutrals800,
                      ...(d.value === 0 ? {paddingHorizontal: 14} : {}),
                    }]}
                    onPress={() => { haptic.light(); setDurationIndex(i); }}
                    activeOpacity={0.7}>
                    <AppText style={{
                      fontSize: d.value === 0 ? 18 : 15,
                      fontWeight: i === durationIndex ? '700' : '500',
                      color: i === durationIndex ? '#FFFFFF' : colors.foreground,
                    }}>{d.label}</AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </SectionCard>
          </View>
        )}

        {/* Section 4: Mức độ — thống nhất cho cả Free Talk & Roleplay */}
        <View className="px-6 mb-6">
          <SectionCard>
            <AppText style={styles.sectionLabel}>Mức độ</AppText>
            <AppText
              variant="caption"
              style={{color: colors.neutrals400, marginBottom: 10, marginTop: -4}}
              raw>
              Ảnh hưởng đến độ khó ngôn ngữ và mức hỗ trợ từ AI
            </AppText>
            <View style={styles.optionRow}>
              {DIFFICULTIES.map(d => (
                <TouchableOpacity
                  key={d.value}
                  style={[styles.optionPill, {flex: 1, backgroundColor: d.value === difficulty ? accentColor : 'transparent', borderColor: d.value === difficulty ? accentColor : colors.neutrals800}]}
                  onPress={() => { haptic.light(); setDifficulty(d.value); }}
                  activeOpacity={0.7}>
                  <AppText style={{fontSize: 15, fontWeight: d.value === difficulty ? '700' : '500', color: d.value === difficulty ? '#FFFFFF' : colors.foreground}}>{d.label}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          </SectionCard>
        </View>

      </RNAnimated.ScrollView>

      {/* ======================== */}
      {/* STICKY FOOTER — CTA Button */}
      {/* ======================== */}
      {!keyboardVisible && (
        <View
          className="absolute bottom-0 left-0 right-0 px-6 pt-0"
          style={{paddingBottom: 8}}>
          {/* Footer gradient — chỉ dark mode */}
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
              canStart
                ? {
                    shadowColor: SPEAKING_GREEN,
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
                backgroundColor: canStart
                  ? accentColor
                  : isDark
                    ? colors.neutrals900
                    : `${SPEAKING_GREEN}18`,
                borderWidth: canStart ? 0 : 1.5,
                borderColor: canStart
                  ? 'transparent'
                  : isDark
                    ? colors.glassBorder
                    : `${SPEAKING_GREEN}30`,
              }}
              disabled={!canStart}
              onPress={handleStart}
              accessibilityLabel={
                canStart ? 'Bắt đầu hội thoại' : 'Chưa chọn chủ đề, không thể bắt đầu'
              }>
              {mode === 'free-talk' ? '🎤 Bắt đầu hội thoại' : '🎭 Bắt đầu Roleplay'}
            </AppButton>
          </View>
        </View>
      )}

      {/* TopicPicker Full-screen Modal */}
      <TopicPickerModal
        visible={showTopicModal}
        onClose={() => setShowTopicModal(false)}
      />
    </View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  // Mode toggle
  // Segmented Control — kiểu iOS native
  segmentedContainer: {
    borderRadius: 14,
    padding: 3,
    overflow: 'hidden',
  },
  segmentedInner: {
    flexDirection: 'row',
    gap: 3,
  },
  segmentedBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedBtnActive: {
    // Nền + shadow được set động theo isDark
  },
  // Options
  sectionLabel: {fontSize: 11, fontWeight: '500', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8},
  optionRow: {flexDirection: 'row', gap: 8},
  optionPill: {paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, alignItems: 'center'},
});
