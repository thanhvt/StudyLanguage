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
import {AppButton, AppText, SectionCard} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useSkillColor} from '@/hooks/useSkillColor';
import {useSpeakingStore} from '@/store/useSpeakingStore';
import {useListeningStore} from '@/store/useListeningStore';
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

type NavProp = NativeStackNavigationProp<SpeakingStackParamList>;

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
            🎤 Practice Mode
          </AppText>
        </View>
        <View style={{width: 36}} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* ====== Section 1: Chủ đề — dùng TopicSelector dùng chung ====== */}
        <View style={styles.section}>
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
        <View style={styles.section}>
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

        <View style={{height: 100}} />
      </ScrollView>

      {/* CTA — Bắt đầu luyện tập */}
      <View style={[styles.footer, {borderTopColor: colors.surface}]}>
        <AppButton
          variant="primary"
          size="lg"
          className="w-full"
          style={{backgroundColor: canStart ? speakingColor : colors.neutrals400}}
          disabled={!canStart}
          loading={isGenerating}
          onPress={handleStart}>
          {isGenerating ? 'Đang tạo câu luyện...' : '🎤 Bắt đầu luyện tập'}
        </AppButton>
      </View>

      {/* TopicPicker Full-screen Modal */}
      <TopicPickerModal
        visible={showTopicModal}
        onClose={() => setShowTopicModal(false)}
        disabled={isGenerating}
      />
    </SafeAreaView>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },

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

  // Footer
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});
