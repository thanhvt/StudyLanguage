import React, {useCallback, useState} from 'react';
import {View, ScrollView, StyleSheet, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import Icon from '@/components/ui/Icon';
import {PhonemeCard, LevelPill} from '@/components/speaking';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useTongueTwisterStore} from '@/store/useTongueTwisterStore';
import {speakingApi} from '@/services/api/speaking';
import {
  PHONEME_CATEGORIES,
  LEVEL_CONFIGS,
  isLevelUnlocked,
} from '@/types/tongueTwister.types';
import type {PhonemeCategory, TwisterLevel} from '@/types/tongueTwister.types';
import type {SpeakingStackParamList} from '@/navigation/stacks/SpeakingStack';

type NavProp = NativeStackNavigationProp<SpeakingStackParamList>;

// =======================
// Screen
// =======================

/**
 * Mục đích: Màn hình chọn Phoneme Category + Level cho Tongue Twister
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   - SpeakingHomeScreen → Tongue Twister card → navigate TongueTwisterSelect
 *   - User chọn phoneme + level → nhấn "Bắt đầu" → fetch twisters → navigate Practice
 */
export default function TongueTwisterSelectScreen() {
  const navigation = useNavigation<NavProp>();
  const colors = useColors();
  const haptic = useHaptic();

  // Store
  const {
    config,
    setPhonemeCategory,
    setLevel,
    loadTwisters,
    levelProgress,
  } = useTongueTwisterStore();

  // Local state
  const [isLoading, setIsLoading] = useState(false);

  // Kiểm tra có thể bắt đầu hay chưa
  const canStart = config.phonemeCategory !== null && config.level !== null;

  /**
   * Mục đích: Xử lý khi user chọn phoneme category
   * Tham số đầu vào: category (PhonemeCategory)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào 1 PhonemeCard
   */
  const handlePhonemeSelect = useCallback(
    (category: PhonemeCategory) => {
      haptic.light();
      setPhonemeCategory(category);
    },
    [haptic, setPhonemeCategory],
  );

  /**
   * Mục đích: Xử lý khi user chọn level
   * Tham số đầu vào: level (TwisterLevel)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào 1 LevelPill (đã unlock)
   */
  const handleLevelSelect = useCallback(
    (level: TwisterLevel) => {
      haptic.light();
      setLevel(level);
    },
    [haptic, setLevel],
  );

  /**
   * Mục đích: Fetch tongue twisters rồi navigate tới Practice
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "👅 Bắt đầu luyện tập"
   */
  const handleStart = useCallback(async () => {
    if (!config.phonemeCategory || !config.level) return;

    setIsLoading(true);
    try {
      console.log(`👅 [TongueTwisterSelect] Lấy twisters: ${config.phonemeCategory} / ${config.level}`);

      // Gọi API lấy tongue twisters theo category + level
      const twisters = await speakingApi.getTongueTwisters(
        config.phonemeCategory,
        config.level,
      );

      if (!twisters || twisters.length === 0) {
        Alert.alert('Thông báo', 'Không tìm được tongue twister cho lựa chọn này. Thử category khác nhé!');
        return;
      }

      loadTwisters(twisters);
      console.log(`✅ [TongueTwisterSelect] Đã load ${twisters.length} twisters`);

      navigation.navigate('TongueTwisterPractice', {
        phonemeCategory: config.phonemeCategory,
        level: config.level,
      });
    } catch (err: any) {
      console.error('❌ [TongueTwisterSelect] Lỗi lấy twisters:', err);
      Alert.alert('Lỗi', 'Không thể tải tongue twisters. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [config.phonemeCategory, config.level, loadTwisters, navigation]);

  // Lấy progress cho category đang chọn
  const currentProgress = config.phonemeCategory
    ? levelProgress[config.phonemeCategory]
    : undefined;

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
            Tongue Twister 👅
          </AppText>
        </View>
        <View style={{width: 36}} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <AppText
          variant="heading2"
          weight="bold"
          className="text-foreground mb-1">
          Chọn âm luyện tập
        </AppText>
        <AppText
          variant="bodySmall"
          className="text-neutrals400 mb-4">
          Chọn cặp âm bạn muốn luyện và độ khó
        </AppText>

        {/* Phoneme Grid — 2 cột */}
        <View style={styles.phonemeGrid}>
          {PHONEME_CATEGORIES.map((phoneme, _idx) => (
            <View key={phoneme.key} style={styles.phonemeGridItem}>
              <PhonemeCard
                phoneme={phoneme}
                isSelected={config.phonemeCategory === phoneme.key}
                onPress={() => handlePhonemeSelect(phoneme.key)}
              />
            </View>
          ))}
        </View>

        {/* Level Section */}
        <AppText
          variant="heading3"
          weight="bold"
          className="text-foreground mt-6 mb-3">
          Level
        </AppText>
        <View style={styles.levelRow}>
          {LEVEL_CONFIGS.map(levelConfig => (
            <LevelPill
              key={levelConfig.level}
              level={levelConfig.level}
              label={levelConfig.label}
              emoji={levelConfig.emoji}
              isUnlocked={isLevelUnlocked(levelConfig.level, currentProgress)}
              isSelected={config.level === levelConfig.level}
              onPress={() => handleLevelSelect(levelConfig.level)}
            />
          ))}
        </View>

        <View style={{height: 100}} />
      </ScrollView>

      {/* CTA */}
      <View style={[styles.footer, {borderTopColor: colors.surface}]}>
        <AppButton
          variant="primary"
          size="lg"
          className="w-full"
          style={{backgroundColor: canStart ? '#eab308' : colors.neutrals400}}
          disabled={!canStart}
          loading={isLoading}
          onPress={handleStart}>
          {isLoading ? 'Đang tải...' : '👅 Bắt đầu luyện tập'}
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
  scrollContent: {
    paddingTop: 8,
  },
  phonemeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  phonemeGridItem: {
    width: '48%',
  },
  // UI-05 FIX: Thêm gap giữa các level pills
  levelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});
