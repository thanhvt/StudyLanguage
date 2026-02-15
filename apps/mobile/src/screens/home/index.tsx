import React from 'react';
import {ScrollView} from 'react-native';
import StreakWidget from '@/components/modules/dashboard/StreakWidget';
import StudyGoalCard from '@/components/modules/dashboard/StudyGoalCard';
import QuickActions from '@/components/modules/dashboard/QuickActions';
import WeeklyActivityChart from '@/components/modules/dashboard/WeeklyActivityChart';
import RecentLessons from '@/components/modules/dashboard/RecentLessons';

/**
 * Mục đích: Màn hình Dashboard chính - trang chủ của app (redesigned)
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Tab "Home" trong MainTabs, hiển thị sau khi đăng nhập
 *
 * Layout theo mockup mới:
 *   1. StreakWidget: greeting inline + streak text + 3 stat pills
 *   2. StudyGoalCard: mục tiêu học tập compact + progress bar
 *   3. QuickActions: 3 skill cards nằm ngang (Nghe, Nói, Đọc)
 *   4. WeeklyActivityChart: biểu đồ cột hoạt động tuần
 *   5. RecentLessons: danh sách bài học gần đây
 */
export default function HomeScreen() {
  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: 24}}>
      <StreakWidget />
      <StudyGoalCard />
      <QuickActions />
      <WeeklyActivityChart />
      <RecentLessons />
    </ScrollView>
  );
}
