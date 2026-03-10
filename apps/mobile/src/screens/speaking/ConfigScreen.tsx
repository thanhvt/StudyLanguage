import React, {useState, useCallback} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useSkillColor} from '@/hooks/useSkillColor';
import {useSpeakingStore} from '@/store/useSpeakingStore';
import {useListeningStore} from '@/store/useListeningStore';
import {speakingApi} from '@/services/api/speaking';
import TopicPicker from '@/components/listening/TopicPicker';
import Icon from '@/components/ui/Icon';
import type {SpeakingStackParamList} from '@/navigation/stacks/SpeakingStack';

type NavProp = NativeStackNavigationProp<SpeakingStackParamList>;

// =======================
// Level Cards Data
// =======================

const LEVELS = [
  {
    key: 'beginner' as const,
    icon: '🌱',
    title: 'Cơ bản',
    desc: 'Câu ngắn, từ vựng A1-A2',
    gradient: '#22C55E',
  },
  {
    key: 'intermediate' as const,
    icon: '🌿',
    title: 'Trung bình',
    desc: 'Câu trung bình, B1-B2',
    gradient: '#3B82F6',
  },
  {
    key: 'advanced' as const,
    icon: '🌳',
    title: 'Nâng cao',
    desc: 'Connected speech, C1-C2',
    gradient: '#F59E0B',
  },
];

// =======================
// LevelCard Component
// =======================

interface LevelCardProps {
  icon: string;
  title: string;
  desc: string;
  isSelected: boolean;
  accentColor: string;
  onPress: () => void;
}

/**
 * Mục đích: Render 1 level card (Beginner/Intermediate/Advanced)
 * Tham số đầu vào: icon, title, desc, isSelected, accentColor, onPress
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: PracticeConfigScreen → Level selection grid
 */
function LevelCard({icon, title, desc, isSelected, accentColor, onPress}: LevelCardProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[
        styles.levelCard,
        {
          backgroundColor: isSelected ? `${accentColor}15` : colors.surface,
          borderColor: isSelected ? accentColor : colors.surface,
          borderWidth: isSelected ? 1.5 : 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Trình độ ${title}: ${desc}${isSelected ? ', đang chọn' : ''}`}>
      <AppText style={styles.levelIcon} raw>{icon}</AppText>
      <AppText
        variant="body"
        weight={isSelected ? 'bold' : 'semibold'}
        style={{color: isSelected ? accentColor : colors.foreground}}
        raw>
        {title}
      </AppText>
      <AppText
        variant="caption"
        style={{color: colors.neutrals400, marginTop: 2, textAlign: 'center'}}
        raw>
        {desc}
      </AppText>

      {/* Check badge khi selected */}
      {isSelected && (
        <View style={[styles.checkBadge, {backgroundColor: accentColor}]}>
          <AppText style={{color: '#FFF', fontSize: 10}} raw>✓</AppText>
        </View>
      )}
    </TouchableOpacity>
  );
}

// =======================
// PracticeConfigScreen
// =======================

/**
 * Mục đích: Màn hình cấu hình Practice Mode — chọn topic (TopicPicker) + level
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   SpeakingHomeScreen → Practice card → PracticeConfig
 *   User chọn scenario + level → nhấn "Bắt đầu" → sinh câu → navigate PracticeSession
 */
export default function SpeakingConfigScreen() {
  const navigation = useNavigation<NavProp>();
  const colors = useColors();
  const speakingColor = useSkillColor('speaking');
  const haptic = useHaptic();

  // Zustand stores
  const {config, setConfig, setSentences, setGenerating, setError, isGenerating} =
    useSpeakingStore();
  const selectedTopic = useListeningStore(s => s.selectedTopic);

  // Local state cho section toggle
  const [showTopicPicker, setShowTopicPicker] = useState(true);

  // Derived state
  const hasSelectedTopic = selectedTopic !== null;
  const canStart = hasSelectedTopic && config.level;

  /**
   * Mục đích: Sinh câu practice rồi navigate tới PracticeSession
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "🎤 Bắt đầu luyện tập"
   *   PracticeConfigScreen → onPress → generateSentences → PracticeSession
   */
  const handleStart = useCallback(async () => {
    if (!selectedTopic) return;

    // Cập nhật speaking store với topic đã chọn từ TopicPicker
    setConfig({topic: selectedTopic});
    setGenerating(true);
    setError(null);

    try {
      console.log('🗣️ [PracticeConfig] Sinh câu practice cho:', selectedTopic.name);
      const sentences = await speakingApi.generateSentences({
        topic: selectedTopic,
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
  }, [selectedTopic, config.level, setConfig, setSentences, setGenerating, setError, navigation]);

  /**
   * Mục đích: Chọn level và trigger haptic feedback
   * Tham số đầu vào: level ('beginner' | 'intermediate' | 'advanced')
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào 1 level card
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
            Practice Mode
          </AppText>
        </View>
        <View style={{width: 36}} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* ====== Chọn chủ đề ====== */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowTopicPicker(!showTopicPicker)}
            activeOpacity={0.7}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <AppText variant="body" weight="bold" style={{color: colors.foreground}} raw>
                📋 Chọn chủ đề
              </AppText>
              {/* Badge hiện topic đã chọn */}
              {selectedTopic && (
                <View style={[styles.selectedBadge, {backgroundColor: `${speakingColor}15`}]}>
                  <AppText variant="caption" weight="semibold" style={{color: speakingColor}} raw>
                    {selectedTopic.name}
                  </AppText>
                </View>
              )}
            </View>
            <Icon
              name={showTopicPicker ? 'ChevronUp' : 'ChevronDown'}
              className="w-4 h-4"
              style={{color: colors.neutrals400}}
            />
          </TouchableOpacity>

          {/* TopicPicker — reuse từ Listening module */}
          {showTopicPicker && (
            <View style={styles.topicPickerContainer}>
              <TopicPicker
                disabled={isGenerating}
                showCategoryBadge={true}
              />
            </View>
          )}
        </View>

        {/* ====== Chọn trình độ ====== */}
        <View style={styles.section}>
          <AppText variant="body" weight="bold" style={{color: colors.foreground, marginBottom: 12}} raw>
            📊 Trình độ
          </AppText>

          <View style={styles.levelGrid}>
            {LEVELS.map(level => (
              <LevelCard
                key={level.key}
                icon={level.icon}
                title={level.title}
                desc={level.desc}
                isSelected={config.level === level.key}
                accentColor={level.gradient}
                onPress={() => handleLevelSelect(level.key)}
              />
            ))}
          </View>
        </View>

        {/* Tip card */}
        <View style={[styles.tipCard, {backgroundColor: `${speakingColor}12`}]}>
          <AppText variant="bodySmall" weight="semibold" raw>
            💡 Mẹo luyện nói hiệu quả
          </AppText>
          <AppText variant="caption" style={{color: colors.neutrals400, marginTop: 4}} raw>
            Chọn chủ đề quen thuộc để bắt đầu. AI sẽ sinh 10 câu tăng dần độ khó.
            Giữ nút mic và đọc rõ ràng từng từ.
          </AppText>
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
    paddingBottom: 12,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedBadge: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topicPickerContainer: {
    minHeight: 300,
  },
  levelGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  levelCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    position: 'relative',
  },
  levelIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});
