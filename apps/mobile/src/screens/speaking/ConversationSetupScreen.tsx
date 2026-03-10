import React, {useState, useCallback, useMemo} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppText, SectionCard} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useSpeakingStore} from '@/store/useSpeakingStore';
import {useListeningStore} from '@/store/useListeningStore';
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

type NavProp = NativeStackNavigationProp<SpeakingStackParamList>;

// =======================
// Constants
// =======================

const DURATIONS = [
  {label: "3'", value: 3},
  {label: "5'", value: 5},
  {label: "10'", value: 10},
  {label: "15'", value: 15},
  {label: "20'", value: 20},
];

const DIFFICULTIES = [
  {label: 'Easy', value: 'easy' as const},
  {label: 'Medium', value: 'medium' as const},
  {label: 'Hard', value: 'hard' as const},
];

const FEEDBACK_MODES = [
  {
    key: 'beginner' as const,
    icon: '🌱',
    label: 'Beginner',
  },
  {
    key: 'intermediate' as const,
    icon: '📊',
    label: 'Intermediate',
  },
  {
    key: 'advanced' as const,
    icon: '🎯',
    label: 'Advanced',
  },
];

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
  const [durationIndex, setDurationIndex] = useState(1); // Mặc định 5 phút
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [feedbackMode, setFeedbackMode] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [topicInput, setTopicInput] = useState('');
  const [showTopicModal, setShowTopicModal] = useState(false);

  // Màu accent theo mode
  const accentColor = getConversationColor(mode);

  // Tổng scenarios
  const totalScenarios = getTotalScenarios();

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
    setMode(newMode);
  }, [haptic]);

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
   * Mục đích: Bắt đầu conversation session
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn CTA "Bắt đầu"
   */
  const handleStart = useCallback(() => {
    if (!hasValidTopic) return;

    const topicName = selectedTopic?.name || topicInput.trim();
    const topicId = selectedTopic?.id || null;

    console.log('💬 [ConversationSetup] Bắt đầu session:', {
      mode,
      topicId,
      topicName,
      duration: mode === 'free-talk' ? DURATIONS[durationIndex].value : undefined,
      difficulty: mode === 'roleplay' ? difficulty : undefined,
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
      maxTurns: 8,
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
    durationIndex, difficulty, feedbackMode, navigation, setConversationSetup,
  ]);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <AppButton
          variant="ghost"
          size="icon"
          onPress={() => navigation.goBack()}
          icon={<Icon name="ArrowLeft" className="w-5 h-5 text-foreground" />}>
          {''}
        </AppButton>
        <View style={styles.headerCenter}>
          <AppText variant="heading3" weight="bold">
            AI Conversation
          </AppText>
        </View>
        <View style={{width: 36}} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Mode Toggle */}
        <View style={styles.section}>
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[
                styles.modeBtn,
                mode === 'free-talk' && {backgroundColor: `${CONVERSATION_COLORS.freeTalk.dark}20`, borderColor: CONVERSATION_COLORS.freeTalk.dark},
              ]}
              onPress={() => handleModeToggle('free-talk')}
              activeOpacity={0.7}>
              <AppText
                variant="body"
                weight={mode === 'free-talk' ? 'bold' : 'medium'}
                style={{color: mode === 'free-talk' ? CONVERSATION_COLORS.freeTalk.dark : colors.neutrals400}}
                raw>
                💬 Free Talk
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeBtn,
                mode === 'roleplay' && {backgroundColor: `${CONVERSATION_COLORS.roleplay.dark}20`, borderColor: CONVERSATION_COLORS.roleplay.dark},
              ]}
              onPress={() => handleModeToggle('roleplay')}
              activeOpacity={0.7}>
              <AppText
                variant="body"
                weight={mode === 'roleplay' ? 'bold' : 'medium'}
                style={{color: mode === 'roleplay' ? CONVERSATION_COLORS.roleplay.dark : colors.neutrals400}}
                raw>
                🎭 Roleplay
              </AppText>
              {mode === 'roleplay' && (
                <View style={[styles.activeBadge, {backgroundColor: CONVERSATION_COLORS.roleplay.dark}]}>
                  <AppText variant="caption" weight="bold" style={{color: '#000', fontSize: 9}} raw>
                    ACTIVE
                  </AppText>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 2: Chủ đề — dùng TopicSelector dùng chung */}
        <View style={styles.section}>
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
            />
          </SectionCard>
        </View>

        {/* Section 3: Duration (Free Talk) / Difficulty (Roleplay) */}
        <View style={styles.section}>
          <SectionCard>
            {mode === 'free-talk' ? (
              <>
                <AppText style={styles.sectionLabel}>Thời lượng</AppText>
                <View style={styles.optionRow}>
                  {DURATIONS.map((d, i) => (
                    <TouchableOpacity
                      key={d.value}
                      style={[styles.optionPill, {backgroundColor: i === durationIndex ? accentColor : 'transparent', borderColor: i === durationIndex ? accentColor : colors.neutrals800}]}
                      onPress={() => { haptic.light(); setDurationIndex(i); }}
                      activeOpacity={0.7}>
                      <AppText style={{fontSize: 15, fontWeight: i === durationIndex ? '700' : '500', color: i === durationIndex ? '#FFFFFF' : colors.foreground}}>{d.label}</AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <>
                <AppText style={styles.sectionLabel}>Mức độ khó</AppText>
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
              </>
            )}
          </SectionCard>
        </View>

        {/* Section 4: Feedback Mode */}
        <View style={styles.section}>
          <SectionCard>
            <AppText style={styles.sectionLabel}>Mức phản hồi</AppText>
            <View style={styles.feedbackRow}>
              {FEEDBACK_MODES.map(fm => (
                <TouchableOpacity
                  key={fm.key}
                  style={[
                    styles.feedbackCard,
                    {
                      backgroundColor: fm.key === feedbackMode ? `${accentColor}15` : colors.neutrals900,
                      borderColor: fm.key === feedbackMode ? accentColor : colors.border,
                      borderWidth: fm.key === feedbackMode ? 1.5 : 1,
                    },
                  ]}
                  onPress={() => { haptic.light(); setFeedbackMode(fm.key); }}
                  activeOpacity={0.7}>
                  <AppText style={{fontSize: 24, marginBottom: 4}} raw>{fm.icon}</AppText>
                  <AppText
                    variant="bodySmall"
                    weight={fm.key === feedbackMode ? 'bold' : 'medium'}
                    style={{color: fm.key === feedbackMode ? accentColor : colors.foreground}}
                    raw>
                    {fm.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </SectionCard>
        </View>

        <View style={{height: 100}} />
      </ScrollView>

      {/* CTA Button */}
      <View style={[styles.footer, {borderTopColor: colors.surface, backgroundColor: colors.background}]}>
        <AppButton
          variant="primary"
          size="lg"
          className="w-full"
          style={{backgroundColor: canStart ? accentColor : colors.neutrals400}}
          disabled={!canStart}
          onPress={handleStart}>
          {mode === 'free-talk' ? '🎤 Bắt đầu hội thoại' : '🎭 Bắt đầu Roleplay'}
        </AppButton>
      </View>

      {/* TopicPicker Full-screen Modal */}
      <TopicPickerModal
        visible={showTopicModal}
        onClose={() => setShowTopicModal(false)}
      />
    </SafeAreaView>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12},
  headerCenter: {flex: 1, alignItems: 'center'},
  scroll: {flex: 1, paddingHorizontal: 16},
  section: {marginBottom: 16},
  // Mode toggle
  modeToggle: {flexDirection: 'row', gap: 10},
  modeBtn: {flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: 'transparent'},
  activeBadge: {marginTop: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6},
  // Options
  sectionLabel: {fontSize: 11, fontWeight: '500', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8},
  optionRow: {flexDirection: 'row', gap: 8},
  optionPill: {paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, alignItems: 'center'},
  // Feedback
  feedbackRow: {flexDirection: 'row', gap: 10},
  feedbackCard: {flex: 1, paddingVertical: 16, paddingHorizontal: 12, borderRadius: 16, alignItems: 'center'},
  // Footer
  footer: {paddingHorizontal: 16, paddingBottom: 16, paddingTop: 12, borderTopWidth: 1},
});
