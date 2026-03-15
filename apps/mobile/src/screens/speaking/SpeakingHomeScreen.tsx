import React, {useCallback, useRef, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {Circle} from 'react-native-svg';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useSkillColor} from '@/hooks/useSkillColor';
import SpeakingTtsSheet from '@/components/speaking/SpeakingTtsSheet';
import OnboardingOverlay from '@/components/speaking/OnboardingOverlay';
import type {SpeakingStackParamList} from '@/navigation/stacks/SpeakingStack';

type NavProp = NativeStackNavigationProp<SpeakingStackParamList>;

// =======================
// Mode Cards Data — theo spec NAV-01
// =======================

const MODE_CARDS = [
  {
    key: 'practice',
    icon: '🎤',
    title: 'Practice',
    subtitle: 'Luyện từng câu',
    gradient: ['#3B82F6', '#06B6D4'] as [string, string],
    route: 'PracticeConfig' as const,
  },
  {
    key: 'shadowing',
    icon: '🔊',
    title: 'Shadowing',
    subtitle: 'Nhại theo AI',
    gradient: ['#8B5CF6', '#EC4899'] as [string, string],
    route: 'ShadowingConfig' as const,
  },
  {
    key: 'conversation',
    icon: '💬',
    title: 'AI Conversation',
    subtitle: 'Hội thoại với AI',
    gradient: ['#10B981', '#14B8A6'] as [string, string],
    route: 'ConversationSetup' as const,
  },
];

// =======================
// ModeCard Component
// =======================

interface ModeCardProps {
  icon: string;
  title: string;
  subtitle: string;
  gradient: [string, string];
  onPress: () => void;
  delay: number;
}

/**
 * Mục đích: Render 1 mode card với gradient background và fade-in animation
 * Tham số đầu vào: icon, title, subtitle, gradient colors, onPress, animation delay
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: SpeakingHomeScreen → 3 mode cards trong grid
 */
function ModeCard({icon, title, subtitle, gradient, onPress, delay}: ModeCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const haptic = useHaptic();

  useEffect(() => {
    // Fade-in staggered animation (NAV-NF02)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, delay]);

  const handlePress = useCallback(() => {
    // Haptic feedback khi tap (NAV-NF03)
    haptic.light();
    onPress();
  }, [haptic, onPress]);

  return (
    <Animated.View
      style={[
        styles.modeCard,
        {
          opacity: fadeAnim,
          transform: [{scale: scaleAnim}],
        },
      ]}>
      <TouchableOpacity
        style={styles.modeCardInner}
        onPress={handlePress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${title} - ${subtitle}`}>
        {/* Real LinearGradient (B1 fix) */}
        <LinearGradient
          colors={gradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[StyleSheet.absoluteFill, {borderRadius: 20}]}
        />

        {/* Nội dung card */}
        <View style={styles.modeCardContent}>
          <AppText style={styles.modeCardIcon} raw>{icon}</AppText>
          <AppText variant="body" weight="bold" style={styles.modeCardTitle} raw>
            {title}
          </AppText>
          <AppText variant="bodySmall" style={styles.modeCardSubtitle} raw>
            {subtitle}
          </AppText>

          {/* Arrow indicator — góc phải dưới (B3 fix) */}
          <AppText style={styles.modeCardArrow} raw>→</AppText>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// =======================
// DailyGoalWidget — Mini version cho Home
// =======================

interface DailyGoalWidgetProps {
  completed: number;
  target: number;
  streak: number;
  onDashboardPress: () => void;
}

/**
 * Mục đích: Widget Daily Goal trên Speaking Home (progress ring + streak + link)
 * Tham số đầu vào: completed, target, streak, onDashboardPress
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: SpeakingHomeScreen — hiển thị tiến độ hàng ngày (NAV-02, NAV-03)
 */
function DailyGoalWidget({completed, target, streak, onDashboardPress}: DailyGoalWidgetProps) {
  const colors = useColors();
  const speakingColor = useSkillColor('speaking');
  const progress = Math.min(completed / target, 1);

  // SVG đúng chuẩn (B2 fix)
  const size = 76;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <TouchableOpacity
      style={[styles.dailyGoalContainer, {backgroundColor: colors.surface}]}
      onPress={onDashboardPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Mục tiêu hàng ngày: ${completed} trên ${target} câu. ${streak} ngày liên tục. Chạm để xem dashboard.`}>
      {/* SVG Progress Ring (B2 fix) */}
      <View style={styles.progressRing}>
        <Svg width={size} height={size}>
          {/* Track nền */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`${speakingColor}20`}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress arc */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={speakingColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        {/* Số ở giữa */}
        <View style={[StyleSheet.absoluteFill, {alignItems: 'center', justifyContent: 'center'}]}>
          <AppText variant="heading3" weight="bold" style={{color: speakingColor}} raw>
            {completed}/{target}
          </AppText>
        </View>
      </View>

      {/* Thông tin bên phải */}
      <View style={styles.dailyGoalInfo}>
        <AppText variant="body" weight="bold" style={{color: colors.foreground}} raw>
          Daily Goal
        </AppText>
        <AppText variant="bodySmall" style={{color: colors.foreground, marginTop: 2}} raw>
          🔥 {streak} ngày liên tục
        </AppText>
        <AppText
          variant="bodySmall"
          weight="semibold"
          style={{color: speakingColor, marginTop: 6}}
          raw>
          Xem Dashboard →
        </AppText>
      </View>
    </TouchableOpacity>
  );
}

// =======================
// SpeakingHomeScreen
// =======================

/**
 * Mục đích: Điểm vào duy nhất của module Speaking — chọn MODE luyện tập
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Tab Bar → Speaking tab → SpeakingHome
 *   - Hiển thị 3 mode cards (NAV-01)
 *   - Hiển thị Daily Goal (NAV-02)
 *   - Tap ⚙️ → TTS Settings Bottom Sheet (NAV-04)
 *   - KHÔNG hiển thị topics/scenarios (NAV-05)
 */
export default function SpeakingHomeScreen() {
  const navigation = useNavigation<NavProp>();
  const colors = useColors();
  const haptic = useHaptic();
  const [showTtsSettings, setShowTtsSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);

  // TODO: Lấy từ API hoặc local storage sau — hiện dùng mock data
  const dailyGoalData = {
    completed: 5,
    target: 10,
    streak: 7,
  };

  /**
   * Mục đích: Navigate tới mode tương ứng khi user tap card
   * Tham số đầu vào: route name từ mode card
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap 1 trong 4 mode cards
   */
  const handleModePress = useCallback(
    (route: keyof SpeakingStackParamList) => {
      navigation.navigate(route as any);
    },
    [navigation],
  );

  /**
   * Mục đích: Mở TTS Settings Bottom Sheet
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap ⚙️ icon trên header (NAV-04)
   */
  const handleSettingsPress = useCallback(() => {
    haptic.light();
    setShowTtsSettings(true);
  }, [haptic]);

  /**
   * Mục đích: Navigate tới Progress Dashboard
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap "Xem Dashboard →" trên DailyGoalWidget (NAV-03)
   */
  const handleDashboardPress = useCallback(() => {
    navigation.navigate('ProgressDashboard');
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header: "Speaking" + ⚙️ */}
        <View style={styles.header}>
          <AppText variant="heading1" weight="bold" style={{color: colors.foreground}} raw>
            Speaking
          </AppText>
          <TouchableOpacity
            onPress={handleSettingsPress}
            style={[styles.settingsButton, {backgroundColor: colors.surface}]}
            accessibilityRole="button"
            accessibilityLabel="Cài đặt giọng AI">
            <AppText style={styles.settingsIcon} raw>⚙️</AppText>
          </TouchableOpacity>
        </View>

        {/* Daily Goal Widget */}
        <DailyGoalWidget
          completed={dailyGoalData.completed}
          target={dailyGoalData.target}
          streak={dailyGoalData.streak}
          onDashboardPress={handleDashboardPress}
        />

        {/* Section Title */}
        <AppText
          variant="body"
          weight="semibold"
          style={[styles.sectionTitle, {color: colors.foreground}]}
          raw>
          Chế độ luyện tập
        </AppText>

        {/* Mode Cards Grid — 2×2 */}
        <View style={styles.modeGrid}>
          {MODE_CARDS.map((card, index) => (
            <ModeCard
              key={card.key}
              icon={card.icon}
              title={card.title}
              subtitle={card.subtitle}
              gradient={card.gradient}
              delay={index * 100}
              onPress={() => handleModePress(card.route)}
            />
          ))}
        </View>
      </ScrollView>

      {/* TTS Settings Bottom Sheet — overlay, không rời Home (NAV-04) */}
      <SpeakingTtsSheet
        visible={showTtsSettings}
        onClose={() => setShowTtsSettings(false)}
      />

      {/* Onboarding Overlay (NAV-07) */}
      <OnboardingOverlay
        visible={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
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
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  dailyGoalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 20,
    gap: 16,
  },
  progressRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyGoalInfo: {
    flex: 1,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 14,
  },
  modeCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modeCardInner: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modeCardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  modeCardIcon: {
    fontSize: 28,
  },
  modeCardTitle: {
    fontSize: 17,
    color: '#FFFFFF',
    marginTop: 8,
  },
  modeCardSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  modeCardArrow: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    alignSelf: 'flex-end',
  },
});
