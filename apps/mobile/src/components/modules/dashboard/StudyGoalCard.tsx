import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/components/ui';

/**
 * Mục đích: Widget hiển thị mục tiêu học tập hàng ngày + tiến độ
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Phần cuối Dashboard HomeScreen
 *   - Hiện tại dùng mock data
 *   - Sau sẽ kết nối API để lấy tiến độ thực
 */
export default function StudyGoalCard() {
  // TODO: Lấy từ API/settings khi backend ready
  const goalMinutes = 30;
  const completedMinutes = 12;
  const progress = Math.min(completedMinutes / goalMinutes, 1);

  return (
    <View className="px-6 py-4">
      <AppText className="text-foreground font-sans-bold text-lg mb-3">
        Mục tiêu hôm nay
      </AppText>

      <View className="bg-neutrals900 rounded-2xl p-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <AppText className="text-2xl mr-2">🎯</AppText>
            <AppText className="text-foreground font-sans-semibold">
              {completedMinutes}/{goalMinutes} phút
            </AppText>
          </View>
          <AppText className="text-primary font-sans-bold">
            {Math.round(progress * 100)}%
          </AppText>
        </View>

        {/* Progress bar */}
        <View className="h-2 bg-neutrals800 rounded-full overflow-hidden">
          <View
            className="h-full bg-primary rounded-full"
            style={{width: `${progress * 100}%`}}
          />
        </View>

        <AppText className="text-neutrals400 text-sm mt-2">
          Còn {goalMinutes - completedMinutes} phút nữa để hoàn thành
        </AppText>
      </View>
    </View>
  );
}
