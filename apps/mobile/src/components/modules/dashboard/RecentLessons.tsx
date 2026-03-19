import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {AppText} from '@/components/ui';
import {useNavigation} from '@react-navigation/native';
import {useColors} from '@/hooks/useColors';

// Mock data — sẽ thay bằng API sau
const RECENT_ITEMS = [
  {
    id: '1',
    title: 'Coffee Shop Talk',
    emoji: '🎧',
    skill: 'listening' as const,
    timeAgo: '5 phút trước',
    duration: '15 phút',
  },
  {
    id: '2',
    title: 'Tech Pronunciation',
    emoji: '🗣️',
    skill: 'speaking' as const,
    timeAgo: '2 giờ trước',
    duration: '8 phút',
  },
];

/**
 * Mục đích: Widget danh sách bài học gần đây — glassmorphism
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Phần cuối Dashboard
 *   - Header: "🕐 Bài học gần đây" + "Xem tất cả →"
 *   - 2 items mặc định: emoji + title + time info + play icon
 *   - Glassmorphism card styling, hỗ trợ dark/light mode
 *   - "Xem tất cả" navigate tới History
 *   - Animated: mỗi lesson item xuất hiện staggered FadeInDown
 */
export default function RecentLessons() {
  const navigation = useNavigation();
  const colors = useColors();

  /**
   * Mục đích: Navigate tới History khi nhấn "Xem tất cả"
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi user nhấn link "Xem tất cả"
   */
  const handleViewAll = () => {
    navigation.navigate('History' as never);
  };

  /**
   * Mục đích: Xử lý khi user nhấn play trên 1 bài học
   * Tham số đầu vào: itemId (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi user nhấn nút play bên phải item
   */
  const handlePlay = (itemId: string) => {
    // TODO: Resume bài học cụ thể
  };

  return (
    <View className="px-4 py-2">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <AppText
          className="font-sans-bold text-base"
          style={{color: colors.foreground}}>
          🕐 BÀI HỌC GẦN ĐÂY
        </AppText>
        <TouchableOpacity onPress={handleViewAll} activeOpacity={0.7}>
          <AppText className="text-warning text-xs font-sans-semibold">
            Xem tất cả →
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Lesson items - glassmorphism + staggered animation */}
      <View className="gap-2">
        {RECENT_ITEMS.map((item, index) => (
          <Animated.View
            key={item.id}
            entering={FadeInDown.delay(index * 100).duration(400).springify()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.glassBg,
              borderWidth: 1,
              borderColor: colors.glassBorder,
              borderRadius: 12,
              padding: 12,
              gap: 10,
            }}>
            {/* Emoji icon */}
            <AppText className="text-lg">{item.emoji}</AppText>

            {/* Nội dung */}
            <View className="flex-1">
              <AppText
                className="font-sans-semibold text-[13px]"
                style={{color: colors.foreground}}>
                {item.title}
              </AppText>
              <AppText
                className="text-[11px] mt-0.5"
                style={{color: colors.neutrals400}}>
                {item.timeAgo} • {item.duration}
              </AppText>
            </View>

            {/* Play button */}
            <TouchableOpacity
              onPress={() => handlePlay(item.id)}
              activeOpacity={0.7}
              style={{
                width: 32,
                height: 32,
                backgroundColor: colors.glassBorderStrong,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <AppText className="text-warning text-sm">▶️</AppText>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}
