import React, {useState, useEffect} from 'react';
import {View, TouchableOpacity, Dimensions} from 'react-native';
import {MMKV} from 'react-native-mmkv';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';

// ============================================
// TYPES & CONSTANTS
// ============================================

interface OnboardingOverlayProps {
  /** Hiển thị overlay */
  visible: boolean;
  /** Callback đóng overlay */
  onComplete: () => void;
}

/** MMKV storage cho onboarding flag — wrap try/catch phòng trường hợp MMKV fail */
let onboardingStorage: MMKV | null = null;
try {
  onboardingStorage = new MMKV({id: 'speaking-onboarding'});
} catch (err) {
  console.error('⚠️ [Onboarding] Không thể khởi tạo MMKV:', err);
}
const ONBOARDING_KEY = 'speaking-onboarding-completed';

/** 5 bước onboarding Speaking */
const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    emoji: '🎤',
    title: 'Chào mừng đến Speaking!',
    description: 'Luyện phát âm tiếng Anh với AI. Nghe mẫu, ghi âm, nhận phản hồi chi tiết.',
  },
  {
    id: 'modes',
    emoji: '📋',
    title: 'Nhiều chế độ luyện tập',
    description: 'Luyện câu, hội thoại AI, Shadowing — mỗi mode giúp bạn cải thiện khác nhau.',
  },
  {
    id: 'recording',
    emoji: '🎙️',
    title: 'Nhấn giữ để ghi âm',
    description: 'Nhấn giữ nút mic để bắt đầu ghi. Thả ra khi xong. AI sẽ đánh giá ngay!',
  },
  {
    id: 'feedback',
    emoji: '📊',
    title: 'Phản hồi chi tiết',
    description: 'Xem điểm phát âm, trôi chảy, tốc độ. Heatmap phoneme cho bạn biết âm nào cần cải thiện.',
  },
  {
    id: 'progress',
    emoji: '🏆',
    title: 'Theo dõi tiến trình',
    description: 'Dashboard, streak, badges — luyện tập mỗi ngày để đạt mục tiêu!',
  },
];

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * Mục đích: Overlay hướng dẫn sử dụng Speaking module (5 bước)
 * Tham số đầu vào: OnboardingOverlayProps (visible, onComplete)
 * Tham số đầu ra: JSX.Element | null
 * Khi nào sử dụng: Speaking Home mount lần đầu → kiểm tra MMKV flag → hiển thị
 */
export default function OnboardingOverlay({visible, onComplete}: OnboardingOverlayProps) {
  const colors = useColors();
  const haptic = useHaptic();
  const [currentStep, setCurrentStep] = useState(0);

  // Kiểm tra đã hoàn thành onboarding chưa
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const completed = onboardingStorage?.getBoolean(ONBOARDING_KEY);
    if (!completed && visible) {
      setShouldShow(true);
    }
  }, [visible]);

  if (!shouldShow) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const isLast = currentStep === ONBOARDING_STEPS.length - 1;
  const {width: screenWidth} = Dimensions.get('window');

  /**
   * Mục đích: Chuyển bước tiếp theo hoặc hoàn thành
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Tiếp theo" hoặc "Bắt đầu"
   */
  const handleNext = () => {
    haptic.light();
    if (isLast) {
      // Đánh dấu đã hoàn thành + đóng
      onboardingStorage?.set(ONBOARDING_KEY, true);
      setShouldShow(false);
      onComplete();
      console.log('✅ [Onboarding] Hoàn thành onboarding');
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  /**
   * Mục đích: Bỏ qua onboarding — không hiện lại
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Bỏ qua"
   */
  const handleSkip = () => {
    haptic.light();
    onboardingStorage?.set(ONBOARDING_KEY, true);
    setShouldShow(false);
    onComplete();
    console.log('⏩ [Onboarding] Bỏ qua onboarding');
  };

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
    }}>
      <View style={{
        width: screenWidth * 0.85,
        backgroundColor: colors.background,
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
      }}>
        {/* Step indicator dots */}
        <View style={{flexDirection: 'row', gap: 6, marginBottom: 24}}>
          {ONBOARDING_STEPS.map((_, idx) => (
            <View
              key={idx}
              style={{
                width: idx === currentStep ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: idx === currentStep ? '#22C55E' : colors.neutrals400 + '40',
              }}
            />
          ))}
        </View>

        {/* Emoji icon */}
        <View style={{
          width: 70,
          height: 70,
          borderRadius: 20,
          backgroundColor: '#22C55E15',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}>
          <AppText variant="heading1" style={{fontSize: 36}}>
            {step.emoji}
          </AppText>
        </View>

        {/* Title */}
        <AppText
          variant="heading3"
          weight="bold"
          style={{textAlign: 'center', marginBottom: 10}}>
          {step.title}
        </AppText>

        {/* Description */}
        <AppText
          variant="body"
          style={{color: colors.neutrals400, textAlign: 'center', lineHeight: 22, marginBottom: 28}}>
          {step.description}
        </AppText>

        {/* Action buttons */}
        <View style={{flexDirection: 'row', gap: 12, width: '100%'}}>
          {/* Bỏ qua */}
          {!isLast && (
            <TouchableOpacity
              onPress={handleSkip}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 14,
                backgroundColor: colors.surface,
                alignItems: 'center',
              }}>
              <AppText variant="body" weight="semibold" style={{color: colors.neutrals400}}>
                Bỏ qua
              </AppText>
            </TouchableOpacity>
          )}

          {/* Tiếp theo / Bắt đầu */}
          <TouchableOpacity
            onPress={handleNext}
            style={{
              flex: isLast ? undefined : 1,
              ...(isLast && {width: '100%'}),
              padding: 14,
              borderRadius: 14,
              backgroundColor: '#22C55E',
              alignItems: 'center',
            }}>
            <AppText variant="body" weight="bold" style={{color: '#FFF'}}>
              {isLast ? '🚀 Bắt đầu!' : 'Tiếp theo →'}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Step counter */}
        <AppText
          variant="caption"
          style={{color: colors.neutrals400, marginTop: 16}}>
          {currentStep + 1}/{ONBOARDING_STEPS.length}
        </AppText>
      </View>
    </View>
  );
}
