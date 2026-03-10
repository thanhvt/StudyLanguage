import React, {useState, useCallback} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
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
import {
  ShadowingTopicPicker,
  HeadphoneStatusCard,
  HeadphoneWarningModal,
} from '@/components/speaking';

// =======================
// Constants
// =======================

const SPEED_OPTIONS: ShadowingSpeed[] = [0.5, 0.75, 1.0, 1.25, 1.5];

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

  // Store
  const config = useShadowingStore(s => s.config);
  const setSpeed = useShadowingStore(s => s.setSpeed);
  const setDelay = useShadowingStore(s => s.setDelay);
  const setScoringMode = useShadowingStore(s => s.setScoringMode);
  const setHeadphones = useShadowingStore(s => s.setHeadphones);
  const startSession = useShadowingStore(s => s.startSession);

  // Headphone
  const {isConnected, connectionType} = useHeadphoneDetection();
  const [showHeadphoneWarning, setShowHeadphoneWarning] = useState(false);

  // Loading
  const [isLoading, setIsLoading] = useState(false);

  // Force start ref (Fix B3: tránh circular dep)
  const forceStartRef = React.useRef(false);

  // Sync headphone state
  React.useEffect(() => {
    setHeadphones(isConnected);
  }, [isConnected, setHeadphones]);

  /**
   * Mục đích: Logic bắt đầu Shadowing (validate + generate + navigate)
   * Tham số đầu vào: forceStart (boolean) — bỏ qua headphone check
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn CTA hoặc modal "Tiếp tục không tai nghe"
   */
  const doStart = useCallback(async (forceStart: boolean = false) => {
    if (!config.topic) {
      haptic.error();
      return;
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
        topicName: config.topic.name,
        topicDesc: config.topic.description,
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
    } finally {
      setIsLoading(false);
    }
  }, [config, isConnected, haptic, startSession, navigation]);

  /**
   * Mục đích: Xử lý nhấn CTA
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Bắt đầu Shadowing"
   */
  const handleStart = useCallback(() => {
    doStart(false);
  }, [doStart]);

  /**
   * Mục đích: Xử lý "Tiếp tục không tai nghe" (Fix B3/M5)
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: HeadphoneWarningModal → "Tiếp tục"
   */
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
        <AppText
          style={{fontSize: 18, fontWeight: '700', color: speakingColor}}
          raw>
          Shadowing
        </AppText>
        <View style={{width: 24}} />
      </View>

      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{paddingBottom: 120}}
        showsVerticalScrollIndicator={false}>

        {/* ===== SECTION 1 — Chọn nội dung (mockup format) ===== */}
        <View style={styles.section}>
          <AppText style={[styles.sectionLabel, {color: colors.neutrals400}]} raw>
            SECTION 1 - Chọn nội dung
          </AppText>
          <AppText style={[styles.sectionTitle, {color: colors.foreground}]} raw>
            Nội dung luyện tập
          </AppText>
          <View style={{height: 400}}>
            <ShadowingTopicPicker disabled={isLoading} />
          </View>
        </View>

        {/* ===== SECTION 2 — Tốc độ phát (mockup format) ===== */}
        <View style={styles.section}>
          <AppText style={[styles.sectionLabel, {color: colors.neutrals400}]} raw>
            SECTION 2 - Tốc độ phát
          </AppText>
          <AppText style={[styles.sectionTitle, {color: colors.foreground}]} raw>
            Tốc độ AI đọc
          </AppText>
          <View style={styles.speedRow}>
            {SPEED_OPTIONS.map(s => {
              const isActive = config.speed === s;
              return (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.speedPill,
                    {
                      backgroundColor: isActive ? `${speakingColor}15` : colors.glassBg,
                      borderColor: isActive ? speakingColor : colors.glassBorderStrong,
                    },
                  ]}
                  onPress={() => {
                    haptic.light();
                    setSpeed(s);
                  }}
                  disabled={isLoading}
                  activeOpacity={0.7}>
                  <AppText
                    style={{
                      fontSize: 14,
                      fontWeight: isActive ? '700' : '500',
                      color: isActive ? speakingColor : colors.foreground,
                    }}
                    raw>
                    {s}x
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ===== SECTION 3 — Độ trễ (SLIDER per mockup) ===== */}
        <View style={styles.section}>
          <AppText style={[styles.sectionLabel, {color: colors.neutrals400}]} raw>
            SECTION 3 - Độ trễ
          </AppText>
          <AppText style={[styles.sectionTitle, {color: colors.foreground}]} raw>
            Delay giữa AI và bạn
          </AppText>
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
            maximumTrackTintColor={colors.glassBorderStrong}
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
        </View>

        {/* ===== SECTION 4 — Chế độ chấm điểm (horizontal per mockup) ===== */}
        <View style={styles.section}>
          <AppText style={[styles.sectionLabel, {color: colors.neutrals400}]} raw>
            SECTION 4 - Chế độ chấm điểm
          </AppText>
          <View style={styles.scoringRow}>
            {([
              {
                mode: 'post-recording' as ScoringMode,
                title: 'Post-recording',
                desc: 'Chấm sau khi xong',
                icon: '📤',
              },
              {
                mode: 'realtime' as ScoringMode,
                title: 'Realtime',
                desc: 'So sánh đường cong pitch',
                icon: '⚡',
                beta: true,
              },
            ]).map(item => {
              const isActive = config.scoringMode === item.mode;
              return (
                <TouchableOpacity
                  key={item.mode}
                  style={[
                    styles.scoringCard,
                    {
                      backgroundColor: isActive ? `${speakingColor}10` : colors.glassBg,
                      borderColor: isActive ? speakingColor : colors.glassBorderStrong,
                    },
                  ]}
                  onPress={() => {
                    haptic.light();
                    setScoringMode(item.mode);
                  }}
                  disabled={isLoading}
                  activeOpacity={0.7}>
                  <AppText style={{fontSize: 16}} raw>{item.icon}</AppText>
                  <AppText
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? '700' : '600',
                      color: isActive ? speakingColor : colors.foreground,
                      marginTop: 4,
                    }}
                    raw>
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
        </View>

        {/* ===== SECTION 5 — Tai nghe (per mockup: radio style) ===== */}
        <View style={styles.section}>
          <AppText style={[styles.sectionLabel, {color: colors.neutrals400}]} raw>
            SECTION 5 - Tai nghe
          </AppText>
          <HeadphoneStatusCard
            isConnected={isConnected}
            connectionType={connectionType}
          />
        </View>
      </ScrollView>

      {/* ===== CTA Button ===== */}
      <View style={[styles.ctaContainer, {backgroundColor: colors.background, borderTopColor: colors.glassDivider}]}>
        <TouchableOpacity
          style={[
            styles.ctaButton,
            {
              backgroundColor: config.topic ? speakingColor : colors.neutrals700,
              opacity: isLoading ? 0.7 : 1,
            },
          ]}
          onPress={handleStart}
          disabled={!config.topic || isLoading}
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
    </SafeAreaView>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  speedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  speedPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  scoringRow: {
    flexDirection: 'row',
    gap: 10,
  },
  scoringCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  betaBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  ctaContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  ctaButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
