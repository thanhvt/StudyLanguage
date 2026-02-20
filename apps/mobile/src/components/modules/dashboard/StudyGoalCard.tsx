import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import {AppText} from '@/components/ui';

/**
 * Mục đích: Widget compact hiển thị mục tiêu học tập hàng ngày + progress bar animated
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Phần sau StreakWidget trên Dashboard
 *   - 1 card: header "⏱️ Mục tiêu hôm nay" + "25/30 phút" (accent)
 *   - Progress bar 8px phía dưới, animate width từ 0 → target
 */
export default function StudyGoalCard() {
  // TODO: Lấy từ API/settings khi backend ready
  const goalMinutes = 30;
  const completedMinutes = 25;
  const progress = Math.min(completedMinutes / goalMinutes, 1);

  // Animated progress bar: chạy từ 0% → target%
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    // Delay 400ms để đợi FadeInDown parent hoàn thành
    progressWidth.value = withDelay(400, withTiming(progress, {duration: 800}));
  }, [progress, progressWidth]);

  /**
   * Mục đích: Style animated cho progress bar width
   * Tham số đầu vào: progressWidth shared value
   * Tham số đầu ra: animated style object {width}
   * Khi nào sử dụng: Render progress bar với animate mượt
   */
  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  return (
    <View className="px-4 py-2">
      <View className="bg-neutrals900 rounded-2xl px-4 py-3 border border-neutrals800">
        {/* Header row */}
        <View className="flex-row items-center justify-between mb-2">
          <AppText className="text-foreground font-sans-semibold text-sm">
            ⏱️ Mục tiêu hôm nay
          </AppText>
          <AppText className="text-warning font-sans-bold text-sm">
            {completedMinutes}/{goalMinutes} phút
          </AppText>
        </View>

        {/* Progress bar - animated */}
        <View className="h-2 bg-neutrals800 rounded-full overflow-hidden">
          <Animated.View
            className="h-full bg-warning rounded-full"
            style={progressBarStyle}
          />
        </View>
      </View>
    </View>
  );
}
