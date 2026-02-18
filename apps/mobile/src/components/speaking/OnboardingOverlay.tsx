import React, {useState} from 'react';
import {View, Pressable, Dimensions, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
  SlideInDown,
} from 'react-native-reanimated';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import {SKILL_COLORS} from '@/config/skillColors';

// =======================
// Types
// =======================

interface OnboardingStep {
  /** Emoji icon */
  emoji: string;
  /** Tiêu đề */
  title: string;
  /** Mô tả */
  description: string;
}

interface OnboardingOverlayProps {
  /** Hiển thị overlay */
  visible: boolean;
  /** Callback khi hoàn tất */
  onComplete: () => void;
}

// =======================
// Data
// =======================

const STEPS: OnboardingStep[] = [
  {
    emoji: '🎙️',
    title: 'Luyện phát âm',
    description: 'Nghe AI đọc mẫu, nhấn giữ mic để ghi âm. AI sẽ chấm điểm từng từ của bạn.',
  },
  {
    emoji: '🎧',
    title: 'Chế độ Shadowing',
    description: 'Nghe câu mẫu rồi lặp lại. So sánh waveform và nhận điểm chi tiết.',
  },
  {
    emoji: '🎭',
    title: 'Roleplay thực tế',
    description: 'Đóng vai trong các tình huống thực tế như đặt phòng, phỏng vấn, gọi món.',
  },
  {
    emoji: '👅',
    title: 'Tongue Twister',
    description: 'Thử thách đọc nhanh + đúng. Xem tốc độ WPM và cải thiện mỗi ngày.',
  },
  {
    emoji: '📈',
    title: 'Theo dõi tiến độ',
    description: 'Xem biểu đồ, huy hiệu, và điểm yếu cần cải thiện.',
  },
];

const {width} = Dimensions.get('window');

// =======================
// Component
// =======================

/**
 * Mục đích: Overlay hướng dẫn sử dụng lần đầu cho Speaking
 * Tham số đầu vào: visible, onComplete
 * Tham số đầu ra: JSX.Element — fullscreen overlay với step-by-step
 * Khi nào sử dụng:
 *   - ConfigScreen: lần đầu mở Speaking → hiện onboarding
 *   - Khi user nhấn "Hướng dẫn" trong settings
 */
export default function OnboardingOverlay({visible, onComplete}: OnboardingOverlayProps) {
  const speakingColor = SKILL_COLORS.speaking.dark;
  const [currentStep, setCurrentStep] = useState(0);

  if (!visible) return null;

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  /**
   * Mục đích: Chuyển sang step tiếp theo hoặc hoàn tất
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap "Tiếp" hoặc "Bắt đầu"
   */
  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  /**
   * Mục đích: Bỏ qua onboarding
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Bỏ qua"
   */
  const handleSkip = () => {
    onComplete();
  };

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={styles.overlay}>
      <Animated.View
        entering={SlideInDown.springify().damping(18)}
        style={styles.card}>
        {/* Skip */}
        <Pressable onPress={handleSkip} style={styles.skipBtn}>
          <AppText variant="bodySmall" className="text-neutrals400" raw>
            Bỏ qua
          </AppText>
        </Pressable>

        {/* Emoji */}
        <AppText variant="heading1" raw style={{fontSize: 56, textAlign: 'center', marginBottom: 16}}>
          {step.emoji}
        </AppText>

        {/* Title */}
        <AppText variant="heading2" weight="bold" raw style={{textAlign: 'center', color: '#FFFFFF', marginBottom: 8}}>
          {step.title}
        </AppText>

        {/* Description */}
        <AppText variant="body" raw style={{textAlign: 'center', color: 'rgba(255,255,255,0.7)', marginBottom: 24, lineHeight: 22}}>
          {step.description}
        </AppText>

        {/* Dots */}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === currentStep ? speakingColor : 'rgba(255,255,255,0.2)',
                  width: i === currentStep ? 20 : 6,
                },
              ]}
            />
          ))}
        </View>

        {/* Button */}
        <AppButton
          variant="primary"
          size="lg"
          style={{backgroundColor: speakingColor, marginTop: 24, width: '100%'}}
          onPress={handleNext}>
          {isLast ? '🚀 Bắt đầu luyện tập!' : 'Tiếp →'}
        </AppButton>
      </Animated.View>
    </Animated.View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 24,
  },
  card: {
    width: width - 48,
    padding: 32,
    borderRadius: 24,
    backgroundColor: 'rgba(30,30,50,0.95)',
    alignItems: 'center',
  },
  skipBtn: {
    position: 'absolute',
    top: 14,
    right: 18,
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
