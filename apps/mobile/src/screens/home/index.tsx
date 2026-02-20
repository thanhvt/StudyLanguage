import React, {useCallback, useState} from 'react';
import {RefreshControl} from 'react-native';
import Animated, {FadeInDown} from 'react-native-reanimated';
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
 *
 * Tính năng Enhanced:
 *   - Pull-to-refresh: kéo xuống để làm mới dữ liệu thống kê
 *   - Animated transitions: các widget xuất hiện staggered FadeInDown
 */
export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Mục đích: Xử lý pull-to-refresh để làm mới dữ liệu thống kê
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi user kéo xuống ở Dashboard
   *   - Hiện tại simulate delay 1.5s (mock data)
   *   - Sau này sẽ gọi API refresh stats thực tế
   */
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: Gọi API refresh stats khi backend ready
    // Ví dụ: await Promise.all([refetchStats(), refetchLessons()])
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <Animated.ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: 24}}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#F59E0B"
          colors={['#F59E0B']}
        />
      }>
      {/* Staggered FadeInDown: mỗi widget delay thêm 100ms */}
      <Animated.View entering={FadeInDown.delay(0).duration(500)}>
        <StreakWidget />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <StudyGoalCard />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <QuickActions />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(500)}>
        <WeeklyActivityChart />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(500)}>
        <RecentLessons />
      </Animated.View>
    </Animated.ScrollView>
  );
}
