import React, {useState, useCallback, useMemo} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useSpeakingStore} from '@/store/useSpeakingStore';
import {useListeningStore} from '@/store/useListeningStore';
import {TopicPickerModal} from '@/components/listening';
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
// SectionCard — card wrapper giống Listening ConfigScreen
// =======================

/**
 * Mục đích: Card container cho mỗi config section
 * Tham số đầu vào: children
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ConversationSetupScreen → wrap mỗi section
 */
function SectionCard({children}: {children: React.ReactNode}) {
  const colors = useColors();
  return (
    <View
      style={{
        borderRadius: 20,
        padding: 16,
        overflow: 'hidden',
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

        {/* Section 2: Chủ đề — inline picker giống Listening */}
        <View style={styles.section}>
          <SectionCard>
            {/* Top Row: Label + action buttons */}
            <View style={styles.topRow}>
              <AppText
                variant="body"
                weight="semibold"
                style={{color: colors.foreground}}>
                {mode === 'free-talk' ? 'Chủ đề' : 'Kịch bản'}
              </AppText>
              <View style={styles.actionIcons}>
                <TouchableOpacity
                  style={[styles.iconBtn, {backgroundColor: `${accentColor}15`}]}
                  hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}
                  onPress={() => {
                    haptic.light();
                    setShowTopicModal(true);
                  }}
                  accessibilityLabel="Tìm kiếm chủ đề"
                  accessibilityRole="button">
                  <Icon name="Search" className="w-5 h-5" style={{color: accentColor}} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconBtn, {backgroundColor: `${accentColor}15`}]}
                  hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}
                  onPress={() => {
                    haptic.light();
                    setSelectedCategory('favorites');
                    setShowTopicModal(true);
                  }}
                  accessibilityLabel="Chủ đề yêu thích"
                  accessibilityRole="button">
                  <Icon name="Heart" className="w-5 h-5" style={{color: accentColor}} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconBtn, {backgroundColor: `${accentColor}15`}]}
                  hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}
                  onPress={() => {
                    haptic.light();
                    setSelectedCategory('custom');
                    setShowTopicModal(true);
                  }}
                  accessibilityLabel="Tạo chủ đề mới"
                  accessibilityRole="button">
                  <Icon name="Plus" className="w-5 h-5" style={{color: accentColor}} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Selected topic badge */}
            {selectedTopic && (
              <View style={[styles.selectedBadge, {backgroundColor: `${accentColor}10`, borderColor: `${accentColor}25`}]}>
                <Icon name="Check" className="w-3.5 h-3.5" style={{color: accentColor, marginRight: 8}} />
                <AppText variant="caption" style={{color: colors.foreground, flex: 1}} numberOfLines={1}>
                  <AppText weight="bold" style={{color: accentColor}}>
                    {selectedTopic.name}
                  </AppText>
                </AppText>
                <TouchableOpacity
                  onPress={() => { haptic.light(); setSelectedTopic(null); }}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                  <Icon name="X" className="w-3.5 h-3.5" style={{color: colors.neutrals400}} />
                </TouchableOpacity>
              </View>
            )}

            {/* Category Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 8}}>
              <View style={styles.pillRow}>
                {TOPIC_CATEGORIES.map(cat => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryPill, {backgroundColor: isActive ? accentColor : 'transparent', borderColor: isActive ? accentColor : colors.neutrals800}]}
                      onPress={() => { haptic.light(); setSelectedCategory(cat.id); setSelectedSubCategory(''); }}>
                      {cat.icon ? <AppText style={{fontSize: 13, marginRight: 4}}>{cat.icon}</AppText> : null}
                      <AppText style={{fontSize: 13, fontWeight: '500', color: isActive ? '#FFFFFF' : colors.foreground}}>{cat.name}</AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Subcategory Chips */}
            {(() => {
              const category = TOPIC_CATEGORIES.find(c => c.id === selectedCategory);
              if (!category?.subCategories?.length) return null;
              return (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 12}}>
                  <View style={styles.pillRow}>
                    {category.subCategories.map(sub => {
                      const isActive = selectedSubCategory === sub.id;
                      return (
                        <TouchableOpacity
                          key={sub.id}
                          style={[styles.subPill, {backgroundColor: isActive ? `${accentColor}15` : 'transparent', borderColor: isActive ? accentColor : colors.neutrals700}]}
                          onPress={() => { haptic.light(); setSelectedSubCategory(sub.id); }}>
                          <AppText style={{fontSize: 13, fontWeight: '500', color: isActive ? accentColor : colors.neutrals300}}>{sub.name}</AppText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              );
            })()}

            {/* Scenario Cards (max 3) */}
            {currentScenarios.map(scenario => {
              const isSelected = selectedTopic?.id === scenario.id;
              const isFav = favoriteScenarioIds.includes(scenario.id);
              return (
                <TouchableOpacity
                  key={scenario.id}
                  style={[styles.scenarioCard, {backgroundColor: isSelected ? `${accentColor}15` : colors.neutrals900, borderColor: isSelected ? accentColor : colors.border}]}
                  onPress={() => { haptic.light(); setSelectedTopic(isSelected ? null : scenario, selectedCategory, selectedSubCategory); }}>
                  <View style={styles.scenarioInner}>
                    <View style={{flex: 1, marginRight: 12}}>
                      <AppText weight="bold" style={{fontSize: 15, color: isSelected ? accentColor : colors.foreground}}>{scenario.name}</AppText>
                      <AppText style={{fontSize: 12, marginTop: 2, color: colors.neutrals400}} numberOfLines={1}>{scenario.description}</AppText>
                    </View>
                    <TouchableOpacity
                      style={{paddingTop: 2}}
                      onPress={() => { haptic.light(); toggleFavorite(scenario.id); }}
                      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                      <Icon name="Heart" className="w-4 h-4" style={{color: isFav ? accentColor : colors.neutrals400}} fill={isFav ? accentColor : 'none'} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* "Xem tất cả" link */}
            <TouchableOpacity
              style={styles.viewAllLink}
              onPress={() => { haptic.light(); setShowTopicModal(true); }}>
              <AppText style={{fontSize: 14, textAlign: 'center', color: accentColor}}>
                Xem tất cả {totalScenarios} kịch bản →
              </AppText>
            </TouchableOpacity>

            {/* Divider "hoặc" */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, {backgroundColor: colors.border}]} />
              <AppText style={{fontSize: 12, marginHorizontal: 12, color: colors.neutrals400}}>hoặc</AppText>
              <View style={[styles.dividerLine, {backgroundColor: colors.border}]} />
            </View>

            {/* Free text input */}
            <TextInput
              style={[styles.textInput, {color: colors.foreground, backgroundColor: colors.neutrals900, borderColor: colors.neutrals800}]}
              placeholder="Nhập chủ đề riêng..."
              placeholderTextColor={colors.neutrals400}
              value={topicInput}
              onChangeText={text => {
                setTopicInput(text);
                if (text.trim() && selectedTopic) setSelectedTopic(null);
              }}
              returnKeyType="done"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Nhập chủ đề hội thoại tự do"
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
  // Topic section header
  topRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12},
  actionIcons: {flexDirection: 'row', alignItems: 'center', gap: 8},
  iconBtn: {width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center'},
  // Selected topic badge
  selectedBadge: {flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12, borderWidth: 1},
  // Pills
  pillRow: {flexDirection: 'row', gap: 8},
  categoryPill: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 1},
  subPill: {paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 1},
  // Scenario cards
  scenarioCard: {borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 8, borderWidth: 1},
  scenarioInner: {flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between'},
  // View all + divider
  viewAllLink: {paddingVertical: 12, alignItems: 'center'},
  dividerRow: {flexDirection: 'row', alignItems: 'center', marginVertical: 12},
  dividerLine: {flex: 1, height: 1},
  textInput: {borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, borderWidth: 1},
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
