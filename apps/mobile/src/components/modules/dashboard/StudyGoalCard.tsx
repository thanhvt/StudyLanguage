import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/components/ui';

/**
 * Mục đích: Widget compact hiển thị mục tiêu học tập hàng ngày + progress bar
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Phần sau StreakWidget trên Dashboard
 *   - 1 card: header "⏱️ Mục tiêu hôm nay" + "25/30 phút" (accent)
 *   - Progress bar 8px phía dưới, không text phụ
 */
export default function StudyGoalCard() {
  // TODO: Lấy từ API/settings khi backend ready
  const goalMinutes = 30;
  const completedMinutes = 25;
  const progress = Math.min(completedMinutes / goalMinutes, 1);

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

        {/* Progress bar */}
        <View className="h-2 bg-neutrals800 rounded-full overflow-hidden">
          <View
            className="h-full bg-warning rounded-full"
            style={{width: `${progress * 100}%`}}
          />
        </View>
      </View>
    </View>
  );
}
