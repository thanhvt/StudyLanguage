import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';

/**
 * Key lưu trữ trong AsyncStorage — đánh dấu đã xem tour chưa
 */
const TOUR_SEEN_KEY = '@listening_player_tour_seen';

/**
 * Mục đích: Định nghĩa các bước walkthrough cho PlayerScreen
 * Tham số đầu vào: không
 * Tham số đầu ra: mảng TourStep
 * Khi nào sử dụng: Render nội dung tooltip cho từng bước tour
 */
export interface TourStep {
  /** ID duy nhất của bước */
  id: string;
  /** Tiêu đề tooltip */
  title: string;
  /** Nội dung hướng dẫn */
  body: string;
}

/** Danh sách các bước tour trên PlayerScreen */
export const PLAYER_TOUR_STEPS: TourStep[] = [
  {
    id: 'transcript',
    title: '📜 Transcript',
    body: 'Tap vào bất kỳ từ nào để tra nghĩa. Long press để bookmark câu.',
  },
  {
    id: 'playback',
    title: '▶️ Điều khiển phát',
    body: 'Play/Pause, nhảy câu. Tap tốc độ để thay đổi 0.5x → 2x.',
  },
  {
    id: 'speed',
    title: '⚡ Tốc độ',
    body: 'Tap để đổi tốc độ phát: 0.5x → 0.75x → 1x → 1.25x → 1.5x → 2x.',
  },
  {
    id: 'translation',
    title: '🇻🇳 Bản dịch',
    body: 'Bật/tắt bản dịch tiếng Việt hiện bên dưới mỗi câu.',
  },
  {
    id: 'pocket',
    title: '📱 Pocket Mode',
    body: 'Bỏ điện thoại vào túi, nghe thụ động. Tap giữa màn để pause, vuốt trái/phải để skip.',
  },
];

interface PlayerTourProps {
  /** Bước hiện tại đang highlight (ID) */
  activeStepId: string | null;
  /** Callback khi user nhấn "Tiếp" */
  onNext: () => void;
  /** Callback khi user nhấn "Bỏ qua" */
  onSkip: () => void;
  /** Children — component được bọc tooltip */
  children: React.ReactNode;
}

/**
 * Mục đích: Bọc 1 UI element trong tooltip walkthrough
 * Tham số đầu vào: activeStepId (bước hiện tại), stepId (ID của bước này), children
 * Tham số đầu ra: JSX.Element với tooltip nếu đang active
 * Khi nào sử dụng: PlayerScreen render — mỗi element quan trọng bọc trong TourTooltip
 */
export function TourTooltip({
  stepId,
  activeStepId,
  onNext,
  onSkip,
  stepIndex,
  totalSteps,
  children,
}: PlayerTourProps & {stepId: string; stepIndex: number; totalSteps: number}) {
  const colors = useColors();
  const step = PLAYER_TOUR_STEPS.find(s => s.id === stepId);
  const isActive = activeStepId === stepId;
  const isLastStep = stepIndex === totalSteps - 1;

  if (!step) {
    return <>{children}</>;
  }

  return (
    <Tooltip
      isVisible={isActive}
      content={
        <View>
          {/* Tiêu đề */}
          <AppText className="text-foreground font-sans-bold text-sm mb-1">
            {step.title}
          </AppText>
          {/* Nội dung hướng dẫn */}
          <AppText className="text-neutrals400 text-xs leading-4 mb-2">
            {step.body}
          </AppText>
          {/* Bước hiện tại / tổng */}
          <View className="flex-row items-center justify-between">
            <AppText className="text-neutrals500 text-xs">
              {stepIndex + 1}/{totalSteps}
            </AppText>
            <View className="flex-row gap-3">
              {/* Nút bỏ qua */}
              <AppText
                className="text-neutrals500 text-xs"
                onPress={onSkip}>
                Bỏ qua
              </AppText>
              {/* Nút tiếp / hoàn thành */}
              <AppText
                className="text-primary font-sans-bold text-xs"
                onPress={onNext}>
                {isLastStep ? '✅ Xong!' : 'Tiếp →'}
              </AppText>
            </View>
          </View>
        </View>
      }
      placement="bottom"
      onClose={onSkip}
      backgroundColor="rgba(0,0,0,0.5)"
      contentStyle={{
        backgroundColor: colors.surface || '#1a1a2e',
        borderRadius: 12,
        padding: 12,
        maxWidth: 280,
      }}
      arrowStyle={{
        borderBottomColor: colors.surface || '#1a1a2e',
      }}>
      {children}
    </Tooltip>
  );
}

/**
 * Mục đích: Hook quản lý trạng thái tour walkthrough
 * Tham số đầu vào: không
 * Tham số đầu ra: { currentStepId, stepIndex, isActive, nextStep, skipTour, startTour }
 * Khi nào sử dụng: PlayerScreen dùng hook này để điều khiển tour
 *   - Auto-start cho first-time user
 *   - nextStep() để chuyển bước
 *   - skipTour() để bỏ qua
 *   - startTour() để bắt đầu lại tour thủ công
 */
export function usePlayerTour() {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [tourSeen, setTourSeen] = useState<boolean>(true);

  // Kiểm tra xem user đã xem tour chưa
  useEffect(() => {
    const checkTourSeen = async () => {
      try {
        const seen = await AsyncStorage.getItem(TOUR_SEEN_KEY);
        if (!seen) {
          setTourSeen(false);
          // Delay 1.5s trước khi bắt đầu tour (chờ UI render xong)
          setTimeout(() => setCurrentStepIndex(0), 1500);
        }
      } catch {
        // Bỏ qua lỗi — không block UX
      }
    };
    checkTourSeen();
  }, []);

  /**
   * Mục đích: Chuyển tới bước tiếp theo hoặc kết thúc tour
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Tiếp →" hoặc "✅ Xong!"
   */
  const nextStep = () => {
    if (currentStepIndex < PLAYER_TOUR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Hoàn thành tour
      completeTour();
    }
  };

  /**
   * Mục đích: Bỏ qua và đánh dấu tour đã xem
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Bỏ qua"
   */
  const skipTour = () => {
    completeTour();
  };

  /**
   * Mục đích: Đánh dấu tour đã xong và lưu vào AsyncStorage
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Tour hoàn thành hoặc bị skip
   */
  const completeTour = async () => {
    setCurrentStepIndex(-1);
    setTourSeen(true);
    try {
      await AsyncStorage.setItem(TOUR_SEEN_KEY, 'true');
      console.log('✅ [PlayerTour] Đã đánh dấu tour đã xem');
    } catch {
      // Bỏ qua lỗi
    }
  };

  /**
   * Mục đích: Bắt đầu lại tour thủ công
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User muốn xem lại hướng dẫn từ ConfigScreen
   */
  const startTour = () => {
    setCurrentStepIndex(0);
  };

  return {
    /** ID bước hiện tại (null nếu tour không active) */
    currentStepId:
      currentStepIndex >= 0
        ? PLAYER_TOUR_STEPS[currentStepIndex]?.id || null
        : null,
    /** Index bước hiện tại */
    stepIndex: currentStepIndex,
    /** Tour có đang active không */
    isActive: currentStepIndex >= 0,
    /** Tour đã được xem chưa */
    tourSeen,
    /** Tổng số bước */
    totalSteps: PLAYER_TOUR_STEPS.length,
    /** Chuyển bước tiếp */
    nextStep,
    /** Bỏ qua tour */
    skipTour,
    /** Bắt đầu lại tour */
    startTour,
  };
}
