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
import {AppButton, AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useSkillColor} from '@/hooks/useSkillColor';
import {useSpeakingStore} from '@/store/useSpeakingStore';
import {useListeningStore} from '@/store/useListeningStore';
import {speakingApi} from '@/services/api/speaking';
import {TopicPickerModal} from '@/components/listening';
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
// SectionCard — card wrapper
// =======================

/**
 * Mục đích: Card container cho mỗi config section
 * Tham số đầu vào: children
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ConfigScreen → wrap mỗi section (Chủ đề, Level)
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

        {/* ====== Section 1: Chủ đề (giống Listening ConfigScreen) ====== */}
        <View style={styles.section}>
          <SectionCard>
            {/* Top Row: Label + action buttons */}
            <View style={styles.topRow}>
              <AppText
                variant="body"
                weight="semibold"
                style={{color: colors.foreground}}>
                Chủ đề
              </AppText>
              <View style={styles.actionIcons}>
                {/* Tìm kiếm */}
                <TouchableOpacity
                  style={[styles.iconBtn, {backgroundColor: `${speakingColor}15`}]}
                  hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}
                  onPress={() => {
                    haptic.light();
                    setShowTopicModal(true);
                  }}
                  accessibilityLabel="Tìm kiếm chủ đề"
                  accessibilityRole="button">
                  <Icon name="Search" className="w-5 h-5" style={{color: speakingColor}} />
                </TouchableOpacity>
                {/* Yêu thích */}
                <TouchableOpacity
                  style={[styles.iconBtn, {backgroundColor: `${speakingColor}15`}]}
                  hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}
                  onPress={() => {
                    haptic.light();
                    setSelectedCategory('favorites');
                    setShowTopicModal(true);
                  }}
                  accessibilityLabel="Chủ đề yêu thích"
                  accessibilityRole="button">
                  <Icon name="Heart" className="w-5 h-5" style={{color: speakingColor}} />
                </TouchableOpacity>
                {/* Thêm mới */}
                <TouchableOpacity
                  style={[styles.iconBtn, {backgroundColor: `${speakingColor}15`}]}
                  hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}
                  onPress={() => {
                    haptic.light();
                    // Mở modal với tab custom
                    setSelectedCategory('custom');
                    setShowTopicModal(true);
                  }}
                  accessibilityLabel="Tạo chủ đề mới"
                  accessibilityRole="button">
                  <Icon name="Plus" className="w-5 h-5" style={{color: speakingColor}} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Hiển thị topic đang chọn — badge */}
            {selectedTopic && (
              <View
                style={[
                  styles.selectedBadge,
                  {backgroundColor: `${speakingColor}10`, borderColor: `${speakingColor}25`},
                ]}>
                <Icon name="Check" className="w-3.5 h-3.5" style={{color: speakingColor, marginRight: 8}} />
                <AppText
                  variant="caption"
                  style={{color: colors.foreground, flex: 1}}
                  numberOfLines={1}>
                  <AppText weight="bold" style={{color: speakingColor}}>
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

            {/* Category Tabs — pills ngang */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{marginBottom: 8}}>
              <View style={styles.pillRow}>
                {TOPIC_CATEGORIES.map(cat => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryPill,
                        {
                          backgroundColor: isActive ? speakingColor : 'transparent',
                          borderColor: isActive ? speakingColor : colors.neutrals800,
                        },
                      ]}
                      onPress={() => {
                        haptic.light();
                        setSelectedCategory(cat.id);
                        setSelectedSubCategory('');
                      }}
                      accessibilityLabel={`Danh mục ${cat.name}${isActive ? ', đang chọn' : ''}`}
                      accessibilityRole="button">
                      {cat.icon ? (
                        <AppText style={{fontSize: 13, marginRight: 4}}>{cat.icon}</AppText>
                      ) : null}
                      <AppText
                        style={{
                          fontSize: 13,
                          fontWeight: '500',
                          color: isActive ? '#FFFFFF' : colors.foreground,
                        }}>
                        {cat.name}
                      </AppText>
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
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{marginBottom: 12}}>
                  <View style={styles.pillRow}>
                    {category.subCategories.map(sub => {
                      const isActive = selectedSubCategory === sub.id;
                      return (
                        <TouchableOpacity
                          key={sub.id}
                          style={[
                            styles.subPill,
                            {
                              backgroundColor: isActive ? `${speakingColor}15` : 'transparent',
                              borderColor: isActive ? speakingColor : colors.neutrals700,
                            },
                          ]}
                          onPress={() => {
                            haptic.light();
                            setSelectedSubCategory(sub.id);
                          }}
                          accessibilityLabel={`${sub.name}${isActive ? ', đang chọn' : ''}`}
                          accessibilityRole="button">
                          <AppText
                            style={{
                              fontSize: 13,
                              fontWeight: '500',
                              color: isActive ? speakingColor : colors.neutrals300,
                            }}>
                            {sub.name}
                          </AppText>
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
                  style={[
                    styles.scenarioCard,
                    {
                      backgroundColor: isSelected ? `${speakingColor}15` : colors.neutrals900,
                      borderColor: isSelected ? speakingColor : colors.border,
                    },
                  ]}
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
                  <View style={styles.scenarioInner}>
                    <View style={{flex: 1, marginRight: 12}}>
                      <AppText
                        weight="bold"
                        style={{
                          fontSize: 15,
                          color: isSelected ? speakingColor : colors.foreground,
                        }}>
                        {scenario.name}
                      </AppText>
                      <AppText
                        style={{fontSize: 12, marginTop: 2, color: colors.neutrals400}}
                        numberOfLines={1}>
                        {scenario.description}
                      </AppText>
                    </View>
                    <TouchableOpacity
                      style={{paddingTop: 2}}
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
                        style={{color: isFav ? speakingColor : colors.neutrals400}}
                        fill={isFav ? speakingColor : 'none'}
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* "Xem tất cả" link */}
            <TouchableOpacity
              style={styles.viewAllLink}
              onPress={() => {
                haptic.light();
                setShowTopicModal(true);
              }}
              accessibilityLabel="Xem tất cả kịch bản"
              accessibilityRole="link">
              <AppText style={{fontSize: 14, textAlign: 'center', color: speakingColor}}>
                Xem tất cả {totalScenarios} kịch bản →
              </AppText>
            </TouchableOpacity>

            {/* Divider "hoặc" */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, {backgroundColor: colors.border}]} />
              <AppText style={{fontSize: 12, marginHorizontal: 12, color: colors.neutrals400}}>
                hoặc
              </AppText>
              <View style={[styles.dividerLine, {backgroundColor: colors.border}]} />
            </View>

            {/* Free text input */}
            <TextInput
              style={[
                styles.textInput,
                {
                  color: colors.foreground,
                  backgroundColor: colors.neutrals900,
                  borderColor: colors.neutrals800,
                },
              ]}
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
              accessibilityLabel="Nhập chủ đề luyện tập tự do"
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

  // Top Row (Chủ đề + icons)
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Selected topic badge
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
  },

  // Category pills
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  subPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },

  // Scenario cards
  scenarioCard: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  scenarioInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  // View all link
  viewAllLink: {
    paddingVertical: 12,
    alignItems: 'center',
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },

  // Text input
  textInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
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
