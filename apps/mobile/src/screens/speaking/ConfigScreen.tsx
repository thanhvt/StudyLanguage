import React, {useState, useCallback, useMemo, useRef} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
  Animated as RNAnimated,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {AppButton, AppText, SectionCard} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useSkillColor} from '@/hooks/useSkillColor';
import {useInsets} from '@/hooks/useInsets';
import {useSpeakingStore} from '@/store/useSpeakingStore';
import {useListeningStore} from '@/store/useListeningStore';
import {useAppStore} from '@/store/useAppStore';
import {speakingApi} from '@/services/api/speaking';
import {TopicPickerModal} from '@/components/listening';
import {TopicSelector} from '@/components/topic';
import Icon from '@/components/ui/Icon';
import type {SpeakingStackParamList} from '@/navigation/stacks/SpeakingStack';
import {
  getTotalScenarios,
  TOPIC_CATEGORIES,
  type TopicScenario,
} from '@/data/topic-data';
import {isLiquidGlassSupported} from '@/utils/LiquidGlass';

type NavProp = NativeStackNavigationProp<SpeakingStackParamList>;

// =======================
// Màu sắc Speaking-specific (Green identity)
// =======================
const SPEAKING_GREEN = '#16A34A';
const SPEAKING_GREEN_LIGHT = '#4ade80';

// =======================
// Level Data — giống Listening
// =======================

const LEVELS = [
  {id: 'beginner' as const, label: 'Cơ bản'},
  {id: 'intermediate' as const, label: 'Trung bình'},
  {id: 'advanced' as const, label: 'Nâng cao'},
];

// =======================
// PracticeConfigScreen
// =======================

/**
 * Mục đích: Màn hình cấu hình Practice Mode — inline topic picker + level pills
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   SpeakingHomeScreen → Practice card → PracticeConfig
 *   User chọn scenario hoặc nhập topic + chọn level → nhấn "Bắt đầu" → sinh câu → navigate PracticeSession
 */
export default function SpeakingConfigScreen() {
  const navigation = useNavigation<NavProp>();
  const colors = useColors();
  const speakingColor = useSkillColor('speaking');
  const haptic = useHaptic();
  const insets = useInsets();

  // Theme detection — cho floating blobs opacity
  const theme = useAppStore(state => state.theme);
  const isDark = theme !== 'light';

  // Parallax scroll value cho floating blobs
  const scrollY = useRef(new RNAnimated.Value(0)).current;

  // Zustand — Speaking store
  const {config, setConfig, setSentences, setGenerating, setError, isGenerating} =
    useSpeakingStore();

  // Zustand — Listening store (chia sẻ topic/category/favorites data)
  const selectedTopic = useListeningStore(s => s.selectedTopic);
  const setSelectedTopic = useListeningStore(s => s.setSelectedTopic);
  const selectedCategory = useListeningStore(s => s.selectedCategory);
  const setSelectedCategory = useListeningStore(s => s.setSelectedCategory);
  const selectedSubCategory = useListeningStore(s => s.selectedSubCategory);
  const setSelectedSubCategory = useListeningStore(s => s.setSelectedSubCategory);
  const favoriteScenarioIds = useListeningStore(s => s.favoriteScenarioIds);
  const toggleFavorite = useListeningStore(s => s.toggleFavorite);

  // Local state
  const [topicInput, setTopicInput] = useState('');
  const [showTopicModal, setShowTopicModal] = useState(false);

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

  // Derived state
  const hasValidTopic = !!selectedTopic || !!topicInput.trim();
  const canStart = hasValidTopic && config.level;

  /**
   * Mục đích: Lấy topic cuối cùng (ưu tiên: selectedTopic > topicInput)
   * Tham số đầu vào: không
   * Tham số đầu ra: {name, description} | null
   * Khi nào sử dụng: Trước khi generate sentences
   */
  const getFinalTopic = useCallback((): {name: string; description: string} | null => {
    if (selectedTopic) {
      return {name: selectedTopic.name, description: selectedTopic.description};
    }
    if (topicInput.trim()) {
      return {name: topicInput.trim(), description: ''};
    }
    return null;
  }, [selectedTopic, topicInput]);

  /**
   * Mục đích: Sinh câu practice rồi navigate tới PracticeSession
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "🎤 Bắt đầu luyện tập"
   */
  const handleStart = useCallback(async () => {
    const topic = getFinalTopic();
    if (!topic) return;

    setConfig({topic: selectedTopic ?? {id: 'custom', name: topic.name, description: topic.description}});
    setGenerating(true);
    setError(null);

    try {
      console.log('🗣️ [PracticeConfig] Sinh câu practice cho:', topic.name);
      const sentences = await speakingApi.generateSentences({
        topic: {id: selectedTopic?.id ?? 'custom', name: topic.name, description: topic.description},
        level: config.level,
      });

      if (!sentences.length) {
        setError('Không sinh được câu luyện tập. Thử lại nhé!');
        return;
      }

      setSentences(sentences);
      console.log(`✅ [PracticeConfig] Đã sinh ${sentences.length} câu`);
      navigation.navigate('PracticeSession');
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Lỗi sinh câu luyện tập';
      console.error('❌ [PracticeConfig] Lỗi:', message);
      setError(message);
    } finally {
      setGenerating(false);
    }
  }, [getFinalTopic, selectedTopic, config.level, setConfig, setSentences, setGenerating, setError, navigation]);

  /**
   * Mục đích: Chọn level và trigger haptic feedback
   * Tham số đầu vào: level ('beginner' | 'intermediate' | 'advanced')
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào 1 level pill
   */
  const handleLevelSelect = useCallback(
    (level: 'beginner' | 'intermediate' | 'advanced') => {
      haptic.light();
      setConfig({level});
    },
    [haptic, setConfig],
  );

  /**
   * Mục đích: Xử lý thay đổi text input topic — xoá selectedTopic nếu có text
   * Tham số đầu vào: text (string) — giá trị người dùng nhập
   * Tham số đầu ra: void
   * Khi nào sử dụng: TopicSelector → onTopicInputChange callback
   */
  const handleTopicInputChange = useCallback((text: string) => {
    setTopicInput(text);
    if (text.trim() && selectedTopic) {
      setSelectedTopic(null);
    }
  }, [selectedTopic, setSelectedTopic]);

  return (
    <View className="flex-1" style={{backgroundColor: colors.background}}>
      {/* ======================== */}
      {/* GLASSMORPHISM BACKGROUND — Aurora mesh + floating blobs (Green palette) */}
      {/* ======================== */}
      {isLiquidGlassSupported && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* Lớp 1: Green-to-dark anchor gradient — opacity 70% */}
          <LinearGradient
            colors={['#14532DB3', '#16A34A60', 'transparent', '#15803D30']}
            locations={[0, 0.18, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
          {/* Lớp 2: Emerald ambient glow — mạnh hơn (α=0.40) */}
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
          {/* Lớp 4: White spotlight — top edge light */}
          <LinearGradient
            colors={['rgba(200,255,220,0.18)', 'transparent']}
            start={{x: 0.5, y: 0}}
            end={{x: 0.5, y: 0.3}}
            style={[StyleSheet.absoluteFill, {height: '30%'}]}
          />
          {/* Floating blobs — đốm sáng tạo depth (parallax) */}
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
                🎤 Practice Mode
              </AppText>
            </View>
            <View style={{width: 24}} />
          </View>
        </View>

        {/* ====== Section 1: Chủ đề — dùng TopicSelector dùng chung ====== */}
        <View className="px-6 mb-4">
          <SectionCard>
            <TopicSelector
              accentColor={speakingColor}
              label="Chủ đề"
              selectedTopic={selectedTopic}
              selectedCategory={selectedCategory}
              selectedSubCategory={selectedSubCategory}
              currentScenarios={currentScenarios}
              favoriteScenarioIds={favoriteScenarioIds}
              totalScenarios={totalScenarios}
              topicInput={topicInput}
              inputEditable={!isGenerating}
              inputAccessibilityLabel="Nhập chủ đề luyện tập tự do"
              onSelectTopic={setSelectedTopic}
              onSelectCategory={setSelectedCategory}
              onSelectSubCategory={setSelectedSubCategory}
              onTopicInputChange={handleTopicInputChange}
              onToggleFavorite={toggleFavorite}
              onOpenTopicModal={() => setShowTopicModal(true)}
            />
          </SectionCard>
        </View>

        {/* ====== Section 2: Level (simple pills — giống Listening) ====== */}
        <View className="px-6 mb-6">
          <SectionCard>
            <AppText
              style={{
                fontSize: 11,
                fontWeight: '500',
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: colors.neutrals400,
                marginBottom: 8,
              }}>
              Level
            </AppText>
            <View style={styles.levelRow}>
              {LEVELS.map(level => {
                const isActive = config.level === level.id;
                return (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.levelPill,
                      {
                        backgroundColor: isActive ? speakingColor : 'transparent',
                        borderColor: isActive ? speakingColor : colors.neutrals800,
                      },
                    ]}
                    onPress={() => handleLevelSelect(level.id)}
                    disabled={isGenerating}
                    accessibilityLabel={`Trình độ ${level.label}${isActive ? ', đang chọn' : ''}`}
                    accessibilityRole="button">
                    <AppText
                      style={{
                        fontSize: 15,
                        fontWeight: '500',
                        color: isActive ? '#FFFFFF' : colors.foreground,
                      }}>
                      {level.label}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
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
                  ? speakingColor
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
              loading={isGenerating}
              onPress={handleStart}
              accessibilityLabel={
                canStart
                  ? 'Bắt đầu luyện tập'
                  : 'Chưa chọn chủ đề, không thể bắt đầu'
              }>
              {isGenerating ? 'Đang tạo câu luyện...' : '🎤 Bắt đầu luyện tập'}
            </AppButton>
          </View>
        </View>
      )}

      {/* TopicPicker Full-screen Modal */}
      <TopicPickerModal
        visible={showTopicModal}
        onClose={() => setShowTopicModal(false)}
        disabled={isGenerating}
      />
    </View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  // Level pills
  levelRow: {
    flexDirection: 'row',
    gap: 8,
  },
  levelPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
});
