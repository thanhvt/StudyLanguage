import React, {useState, useCallback, useMemo} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {SKILL_COLORS} from '@/config/skillColors';
import {useShadowingStore} from '@/store/useShadowingStore';
import type {ShadowingSpeed, ScoringMode} from '@/store/useShadowingStore';
import {useHeadphoneDetection} from '@/hooks/useHeadphoneDetection';
import {speakingApi} from '@/services/api/speaking';
import {useListeningStore} from '@/store/useListeningStore';
import {TopicPickerModal} from '@/components/listening';
import {
  HeadphoneStatusCard,
  HeadphoneWarningModal,
} from '@/components/speaking';
import {
  getTotalScenarios,
  TOPIC_CATEGORIES,
  type TopicScenario,
} from '@/data/topic-data';

// =======================
// Constants
// =======================

const SPEED_OPTIONS: ShadowingSpeed[] = [0.5, 0.75, 1.0, 1.25, 1.5];

// =======================
// SectionCard — card wrapper giống Listening ConfigScreen
// =======================

/**
 * Mục đích: Card container cho mỗi config section
 * Tham số đầu vào: children
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ShadowingConfigScreen → wrap mỗi section
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
// Component
// =======================

/**
 * Mục đích: Màn hình cấu hình Shadowing Mode
 * Tham số đầu vào: không (đọc từ navigation route)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   - SpeakingHomeScreen → nhấn "Shadowing" → navigate tới đây
 *   - User thiết lập topic, speed, delay, scoring mode, headphone
 *   - Nhấn CTA → generate sentences → navigate ShadowingSession
 */
export default function ShadowingConfigScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const colors = useColors();
  const haptic = useHaptic();
  const speakingColor = SKILL_COLORS.speaking.dark;

  // Store — Shadowing
  const config = useShadowingStore(s => s.config);
  const setSpeed = useShadowingStore(s => s.setSpeed);
  const setDelay = useShadowingStore(s => s.setDelay);
  const setScoringMode = useShadowingStore(s => s.setScoringMode);
  const setHeadphones = useShadowingStore(s => s.setHeadphones);
  const startSession = useShadowingStore(s => s.startSession);
  const setTopic = useShadowingStore(s => s.setTopic);

  // Store — Listening (chia sẻ topic/category/favorites)
  const selectedTopic = useListeningStore(s => s.selectedTopic);
  const setSelectedTopic = useListeningStore(s => s.setSelectedTopic);
  const selectedCategory = useListeningStore(s => s.selectedCategory);
  const setSelectedCategory = useListeningStore(s => s.setSelectedCategory);
  const selectedSubCategory = useListeningStore(s => s.selectedSubCategory);
  const setSelectedSubCategory = useListeningStore(s => s.setSelectedSubCategory);
  const favoriteScenarioIds = useListeningStore(s => s.favoriteScenarioIds);
  const toggleFavorite = useListeningStore(s => s.toggleFavorite);

  // Headphone
  const {isConnected, connectionType} = useHeadphoneDetection();
  const [showHeadphoneWarning, setShowHeadphoneWarning] = useState(false);

  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [topicInput, setTopicInput] = useState('');
  const [showTopicModal, setShowTopicModal] = useState(false);

  // Force start ref (Fix B3: tránh circular dep)
  const forceStartRef = React.useRef(false);

  // Sync headphone state
  React.useEffect(() => {
    setHeadphones(isConnected);
  }, [isConnected, setHeadphones]);

  // Sync selectedTopic → shadowing store
  React.useEffect(() => {
    if (selectedTopic) {
      setTopic(selectedTopic);
      setTopicInput('');
    }
  }, [selectedTopic, setTopic]);

  // Tổng scenarios
  const totalScenarios = getTotalScenarios();

  // Scenarios theo category + subcategory (max 3)
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

  // Derived
  const hasValidTopic = !!selectedTopic || !!topicInput.trim();

  /**
   * Mục đích: Logic bắt đầu Shadowing (validate + generate + navigate)
   * Tham số đầu vào: forceStart (boolean) — bỏ qua headphone check
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn CTA hoặc modal "Tiếp tục không tai nghe"
   */
  const doStart = useCallback(async (forceStart: boolean = false) => {
    const topicName = selectedTopic?.name || topicInput.trim();
    const topicDesc = selectedTopic?.description || '';
    if (!topicName) {
      haptic.error();
      return;
    }

    // Sync topic vào shadowing store nếu dùng custom input
    if (!selectedTopic && topicInput.trim()) {
      setTopic({id: 'custom', name: topicInput.trim(), description: ''});
    }

    // Check headphone (Fix B3: không tạo vòng lặp)
    if (!isConnected && !forceStart) {
      setShowHeadphoneWarning(true);
      return;
    }

    haptic.medium();
    setIsLoading(true);

    try {
      // Generate sentences
      const sentences = await speakingApi.generateShadowingSentences({
        topicName,
        topicDesc,
        level: 'intermediate',
        count: 8,
      });

      // TTS cho câu đầu tiên
      if (sentences.length > 0 && !sentences[0].audioUrl) {
        const audio = await speakingApi.generateShadowingTTS(
          sentences[0].text,
          config.speed,
        );
        sentences[0].audioUrl = audio;
      }

      const shadowingSentences = sentences.map(s => ({
        ...s,
        duration: 0,
      }));

      startSession(shadowingSentences);
      navigation.navigate('ShadowingSession');
    } catch (err) {
      console.error('❌ [ShadowingConfig] Lỗi bắt đầu:', err);
      haptic.error();
      const {Alert} = require('react-native');
      Alert.alert(
        'Không thể tạo nội dung',
        'Vui lòng kiểm tra kết nối mạng và thử lại.',
        [
          {text: 'Hủy', style: 'cancel'},
          {text: 'Thử lại', onPress: () => doStart(forceStart)},
        ],
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedTopic, topicInput, config.speed, isConnected, haptic, startSession, navigation, setTopic]);

  const handleStart = useCallback(() => { doStart(false); }, [doStart]);

  const handleContinueWithoutHeadphone = useCallback(() => {
    setShowHeadphoneWarning(false);
    doStart(true);
  }, [doStart]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Icon name="ArrowLeft" className="w-6 h-6" style={{color: colors.foreground}} />
        </TouchableOpacity>
        <AppText style={{fontSize: 18, fontWeight: '700', color: speakingColor}} raw>
          Shadowing
        </AppText>
        <View style={{width: 24}} />
      </View>

      <ScrollView
        style={{flex: 1, paddingHorizontal: 16}}
        contentContainerStyle={{paddingBottom: 120}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* ===== SECTION 1 — Chọn nội dung (inline topic picker giống Listening) ===== */}
        <View style={styles.section}>
          <SectionCard>
            {/* Top Row: Label + action buttons */}
            <View style={styles.topRow}>
              <AppText variant="body" weight="semibold" style={{color: colors.foreground}}>
                Nội dung luyện tập
              </AppText>
              <View style={styles.actionIcons}>
                <TouchableOpacity
                  style={[styles.iconBtn, {backgroundColor: `${speakingColor}15`}]}
                  hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}
                  onPress={() => { haptic.light(); setShowTopicModal(true); }}>
                  <Icon name="Search" className="w-5 h-5" style={{color: speakingColor}} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconBtn, {backgroundColor: `${speakingColor}15`}]}
                  hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}
                  onPress={() => { haptic.light(); setSelectedCategory('favorites'); setShowTopicModal(true); }}>
                  <Icon name="Heart" className="w-5 h-5" style={{color: speakingColor}} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconBtn, {backgroundColor: `${speakingColor}15`}]}
                  hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}
                  onPress={() => { haptic.light(); setSelectedCategory('custom'); setShowTopicModal(true); }}>
                  <Icon name="Plus" className="w-5 h-5" style={{color: speakingColor}} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Selected topic badge */}
            {selectedTopic && (
              <View style={[styles.selectedBadge, {backgroundColor: `${speakingColor}10`, borderColor: `${speakingColor}25`}]}>
                <Icon name="Check" className="w-3.5 h-3.5" style={{color: speakingColor, marginRight: 8}} />
                <AppText variant="caption" style={{color: colors.foreground, flex: 1}} numberOfLines={1}>
                  <AppText weight="bold" style={{color: speakingColor}}>{selectedTopic.name}</AppText>
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
                      style={[styles.categoryPill, {backgroundColor: isActive ? speakingColor : 'transparent', borderColor: isActive ? speakingColor : colors.neutrals800}]}
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
                          style={[styles.subPill, {backgroundColor: isActive ? `${speakingColor}15` : 'transparent', borderColor: isActive ? speakingColor : colors.neutrals700}]}
                          onPress={() => { haptic.light(); setSelectedSubCategory(sub.id); }}>
                          <AppText style={{fontSize: 13, fontWeight: '500', color: isActive ? speakingColor : colors.neutrals300}}>{sub.name}</AppText>
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
                  style={[styles.scenarioCard, {backgroundColor: isSelected ? `${speakingColor}15` : colors.neutrals900, borderColor: isSelected ? speakingColor : colors.border}]}
                  onPress={() => { haptic.light(); setSelectedTopic(isSelected ? null : scenario, selectedCategory, selectedSubCategory); }}>
                  <View style={styles.scenarioInner}>
                    <View style={{flex: 1, marginRight: 12}}>
                      <AppText weight="bold" style={{fontSize: 15, color: isSelected ? speakingColor : colors.foreground}}>{scenario.name}</AppText>
                      <AppText style={{fontSize: 12, marginTop: 2, color: colors.neutrals400}} numberOfLines={1}>{scenario.description}</AppText>
                    </View>
                    <TouchableOpacity
                      style={{paddingTop: 2}}
                      onPress={() => { haptic.light(); toggleFavorite(scenario.id); }}
                      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                      <Icon name="Heart" className="w-4 h-4" style={{color: isFav ? speakingColor : colors.neutrals400}} fill={isFav ? speakingColor : 'none'} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* "Xem tất cả" link */}
            <TouchableOpacity
              style={styles.viewAllLink}
              onPress={() => { haptic.light(); setShowTopicModal(true); }}>
              <AppText style={{fontSize: 14, textAlign: 'center', color: speakingColor}}>
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
                if (text.trim()) setTopic({id: 'custom', name: text.trim(), description: ''});
              }}
              returnKeyType="done"
              editable={!isLoading}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Nhập chủ đề luyện tập tự do"
            />
          </SectionCard>
        </View>

        {/* ===== SECTION 2 — Tốc độ phát ===== */}
        <View style={styles.section}>
          <SectionCard>
            <AppText style={[styles.sectionLabel, {color: colors.neutrals400}]} raw>Tốc độ AI đọc</AppText>
            <View style={styles.speedRow}>
              {SPEED_OPTIONS.map(s => {
                const isActive = config.speed === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.speedPill,
                      {
                        backgroundColor: isActive ? speakingColor : 'transparent',
                        borderColor: isActive ? speakingColor : colors.neutrals800,
                      },
                    ]}
                    onPress={() => { haptic.light(); setSpeed(s); }}
                    disabled={isLoading}
                    activeOpacity={0.7}>
                    <AppText
                      style={{fontSize: 14, fontWeight: isActive ? '700' : '500', color: isActive ? '#FFFFFF' : colors.foreground}}
                      raw>
                      {s}x
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </SectionCard>
        </View>

        {/* ===== SECTION 3 — Độ trễ (SLIDER) ===== */}
        <View style={styles.section}>
          <SectionCard>
            <AppText style={[styles.sectionLabel, {color: colors.neutrals400}]} raw>Delay giữa AI và bạn</AppText>
            <AppText style={{fontSize: 16, fontWeight: '700', color: speakingColor, textAlign: 'center', marginBottom: 8}} raw>
              {config.delay.toFixed(1)}s
            </AppText>
            <Slider
              style={{width: '100%', height: 40}}
              minimumValue={0}
              maximumValue={2.0}
              step={0.1}
              value={config.delay}
              onValueChange={val => setDelay(Math.round(val * 10) / 10)}
              minimumTrackTintColor={speakingColor}
              maximumTrackTintColor={colors.neutrals800}
              thumbTintColor={speakingColor}
              disabled={isLoading}
            />
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <AppText style={{fontSize: 11, color: colors.neutrals400}} raw>0s</AppText>
              <AppText style={{fontSize: 11, color: colors.neutrals400}} raw>2.0s</AppText>
            </View>
            <AppText style={{fontSize: 11, color: colors.neutrals500, marginTop: 4}} raw>
              Delay 0s = nói đồng thời. Increase nếu cần thêm thời gian.
            </AppText>
          </SectionCard>
        </View>

        {/* ===== SECTION 4 — Chế độ chấm điểm ===== */}
        <View style={styles.section}>
          <SectionCard>
            <AppText style={[styles.sectionLabel, {color: colors.neutrals400}]} raw>Chế độ chấm điểm</AppText>
            <View style={styles.scoringRow}>
              {([
                {mode: 'post-recording' as ScoringMode, title: 'Post-recording', desc: 'Chấm sau khi xong', icon: '📤'},
                {mode: 'realtime' as ScoringMode, title: 'Realtime', desc: 'So sánh đường cong pitch', icon: '⚡', beta: true},
              ]).map(item => {
                const isActive = config.scoringMode === item.mode;
                return (
                  <TouchableOpacity
                    key={item.mode}
                    style={[styles.scoringCard, {backgroundColor: isActive ? `${speakingColor}10` : colors.neutrals900, borderColor: isActive ? speakingColor : colors.border}]}
                    onPress={() => { haptic.light(); setScoringMode(item.mode); }}
                    disabled={isLoading}
                    activeOpacity={0.7}>
                    <AppText style={{fontSize: 16}} raw>{item.icon}</AppText>
                    <AppText style={{fontSize: 13, fontWeight: isActive ? '700' : '600', color: isActive ? speakingColor : colors.foreground, marginTop: 4}} raw>
                      {item.title}
                    </AppText>
                    {item.beta && (
                      <View style={[styles.betaBadge, {backgroundColor: '#f59e0b20'}]}>
                        <AppText style={{fontSize: 8, fontWeight: '700', color: '#f59e0b'}} raw>Beta</AppText>
                      </View>
                    )}
                    <AppText style={{fontSize: 10, color: colors.neutrals400, marginTop: 2, textAlign: 'center'}} raw>
                      {item.desc}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </SectionCard>
        </View>

        {/* ===== SECTION 5 — Tai nghe ===== */}
        <View style={styles.section}>
          <SectionCard>
            <AppText style={[styles.sectionLabel, {color: colors.neutrals400}]} raw>Tai nghe</AppText>
            <HeadphoneStatusCard
              isConnected={isConnected}
              connectionType={connectionType}
            />
          </SectionCard>
        </View>
      </ScrollView>

      {/* ===== CTA Button ===== */}
      <View style={[styles.ctaContainer, {backgroundColor: colors.background, borderTopColor: colors.border}]}>
        <TouchableOpacity
          style={[
            styles.ctaButton,
            {
              backgroundColor: hasValidTopic ? speakingColor : colors.neutrals700,
              opacity: isLoading ? 0.7 : 1,
            },
          ]}
          onPress={handleStart}
          disabled={!hasValidTopic || isLoading}
          activeOpacity={0.8}>
          <AppText style={{fontSize: 16, fontWeight: '700', color: '#FFFFFF'}} raw>
            {isLoading ? '⏳ Đang chuẩn bị...' : '◀)) Bắt đầu Shadowing'}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Headphone Warning Modal */}
      <HeadphoneWarningModal
        visible={showHeadphoneWarning}
        onClose={() => setShowHeadphoneWarning(false)}
        onContinueWithout={handleContinueWithoutHeadphone}
      />

      {/* TopicPicker Full-screen Modal */}
      <TopicPickerModal
        visible={showTopicModal}
        onClose={() => setShowTopicModal(false)}
        disabled={isLoading}
      />
    </SafeAreaView>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12},
  section: {marginBottom: 16},
  // Topic section
  topRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12},
  actionIcons: {flexDirection: 'row', alignItems: 'center', gap: 8},
  iconBtn: {width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center'},
  selectedBadge: {flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12, borderWidth: 1},
  pillRow: {flexDirection: 'row', gap: 8},
  categoryPill: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 1},
  subPill: {paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 1},
  scenarioCard: {borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 8, borderWidth: 1},
  scenarioInner: {flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between'},
  viewAllLink: {paddingVertical: 12, alignItems: 'center'},
  dividerRow: {flexDirection: 'row', alignItems: 'center', marginVertical: 12},
  dividerLine: {flex: 1, height: 1},
  textInput: {borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, borderWidth: 1},
  // Labels
  sectionLabel: {fontSize: 13, fontWeight: '700', marginBottom: 10},
  // Speed
  speedRow: {flexDirection: 'row', gap: 8},
  speedPill: {paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1},
  // Scoring
  scoringRow: {flexDirection: 'row', gap: 10},
  scoringCard: {flex: 1, alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 14},
  betaBadge: {paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 2},
  // CTA
  ctaContainer: {padding: 16, borderTopWidth: 1},
  ctaButton: {borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center'},
});
