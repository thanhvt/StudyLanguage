import React from 'react';
import {ScrollView} from 'react-native';
import StreakWidget from '@/components/modules/dashboard/StreakWidget';
import QuickActions from '@/components/modules/dashboard/QuickActions';
import StudyGoalCard from '@/components/modules/dashboard/StudyGoalCard';

/**
 * Mục đích: Màn hình Dashboard chính - trang chủ của app
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Tab "Home" trong MainTabs, hiển thị sau khi đăng nhập
 *
 * Bao gồm:
 *   - StreakWidget: lời chào + streak học liên tiếp
 *   - QuickActions: 3 nút truy cập nhanh (Listening, Speaking, Reading)
 *   - StudyGoalCard: mục tiêu học tập hàng ngày + progress bar
 */
export default function HomeScreen() {
  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: 24}}>
      <StreakWidget />
      <QuickActions />
      <StudyGoalCard />
    </ScrollView>
  );
}

