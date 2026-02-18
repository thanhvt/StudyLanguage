import React, {useEffect, useState} from 'react';
import {View, ScrollView, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';
import RadarChart from '@/components/speaking/RadarChart';
import CalendarHeatmap from '@/components/speaking/CalendarHeatmap';
import BadgeGrid from '@/components/speaking/BadgeGrid';
import DailyGoalCard from '@/components/speaking/DailyGoalCard';
import WeakSoundsCard from '@/components/speaking/WeakSoundsCard';

const speakingColor = SKILL_COLORS.speaking.dark;

// =======================
// Mock Data
// =======================

const MOCK_RADAR = [
  {label: 'Phát âm', value: 72},
  {label: 'Trôi chảy', value: 65},
  {label: 'Ngữ pháp', value: 80},
  {label: 'Từ vựng', value: 58},
  {label: 'Tốc độ', value: 70},
];

const MOCK_CALENDAR = (() => {
  const data = [];
  const today = new Date();
  for (let i = 0; i < 49; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    data.push({
      date: d.toISOString().split('T')[0],
      minutes: Math.random() > 0.3 ? Math.floor(Math.random() * 40) + 1 : 0,
    });
  }
  return data;
})();

const MOCK_BADGES = [
  {id: '1', name: 'Khởi đầu', emoji: '🌱', description: 'Hoàn thành phiên đầu tiên', unlocked: true, unlockedAt: '2026-01-15'},
  {id: '2', name: '7 ngày liên tiếp', emoji: '🔥', description: 'Luyện 7 ngày liền', unlocked: true, unlockedAt: '2026-01-22'},
  {id: '3', name: 'Score 90+', emoji: '🌟', description: 'Đạt 90+ điểm', unlocked: true, unlockedAt: '2026-02-01'},
  {id: '4', name: 'Coach Master', emoji: '🤖', description: 'Hoàn thành 10 phiên coach', unlocked: false},
  {id: '5', name: '30 ngày', emoji: '💎', description: 'Streak 30 ngày', unlocked: false},
  {id: '6', name: 'Hoàn hảo', emoji: '💯', description: 'Score 100 điểm', unlocked: false},
  {id: '7', name: 'Tốc độ', emoji: '⚡', description: 'Vượt mục tiêu WPM', unlocked: true, unlockedAt: '2026-02-10'},
  {id: '8', name: 'Đa sĩ', emoji: '🎭', description: 'Hoàn thành 5 roleplay', unlocked: false},
];

const MOCK_WEAK_SOUNDS = [
  {sound: 'θ', example: 'think', avgScore: 42, attempts: 15},
  {sound: 'ð', example: 'this', avgScore: 48, attempts: 12},
  {sound: 'ʒ', example: 'vision', avgScore: 55, attempts: 8},
  {sound: 'ɹ', example: 'right', avgScore: 60, attempts: 20},
];

// =======================
// Screen
// =======================

/**
 * Mục đích: Dashboard tổng quan tiến độ Speaking
 * Tham số đầu vào: không
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   ConfigScreen → navigate ProgressDashboard
 *   Hiển thị: daily goal, radar, calendar, badges, weak sounds
 */
export default function ProgressDashboardScreen() {
  const navigation = useNavigation<any>();
  const colors = useColors();
  const [loading, setLoading] = useState(true);

  // Giả lập load data
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={speakingColor} />
        <AppText variant="body" className="text-neutrals400 mt-4" raw>
          Đang tải dữ liệu...
        </AppText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-3">
        <AppButton
          variant="ghost" size="icon"
          onPress={() => navigation.goBack()}
          icon={<Icon name="ArrowLeft" className="w-5 h-5 text-foreground" />}>
          {''}
        </AppButton>
        <View className="flex-1 items-center">
          <AppText variant="heading3" weight="bold">📈 Tiến độ</AppText>
        </View>
        <View className="w-9" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 32}}>

        {/* Daily Goal */}
        <DailyGoalCard
          currentMinutes={22}
          goalMinutes={30}
          sentencesDone={15}
          sessionsDone={3}
        />

        {/* Radar Chart */}
        <View className="mx-4 mb-3">
          <AppText variant="body" weight="semibold" className="text-foreground mb-2" raw>
            🎯 Kỹ năng tổng quan
          </AppText>
        </View>
        <RadarChart data={MOCK_RADAR} size={220} />

        {/* Calendar Heatmap */}
        <CalendarHeatmap data={MOCK_CALENDAR} weeks={7} />

        {/* Weak Sounds */}
        <WeakSoundsCard sounds={MOCK_WEAK_SOUNDS} />

        {/* Badges */}
        <BadgeGrid badges={MOCK_BADGES} />

        {/* Stats summary */}
        <View
          style={{
            marginHorizontal: 16,
            padding: 14,
            borderRadius: 16,
            backgroundColor: colors.surface,
          }}>
          <AppText variant="body" weight="semibold" className="text-foreground mb-3" raw>
            📊 Thống kê tổng
          </AppText>
          {[
            {label: 'Tổng phiên', value: '47', icon: '🔄'},
            {label: 'Tổng phút luyện', value: '384', icon: '⏱️'},
            {label: 'Điểm TB', value: '74', icon: '🎯'},
            {label: 'Câu đã luyện', value: '215', icon: '📝'},
            {label: 'Streak dài nhất', value: '12 ngày', icon: '🔥'},
          ].map((stat, i) => (
            <View
              key={stat.label}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 6,
                borderBottomWidth: i < 4 ? 0.5 : 0,
                borderBottomColor: 'rgba(150,150,150,0.12)',
              }}>
              <AppText variant="bodySmall" className="text-neutrals400" raw>
                {stat.icon} {stat.label}
              </AppText>
              <AppText variant="bodySmall" weight="semibold" className="text-foreground" raw>
                {stat.value}
              </AppText>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
