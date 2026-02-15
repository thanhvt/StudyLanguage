import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {AppText} from '@/components/ui';
import {useNavigation} from '@react-navigation/native';

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
 * Mục đích: Widget danh sách bài học gần đây trên Dashboard
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Phần cuối Dashboard
 *   - Header: "🕐 Bài học gần đây" + "Xem tất cả →"
 *   - 2 items mặc định: emoji + title + time info + play icon
 *   - Mock data tĩnh, nối API sau
 *   - "Xem tất cả" navigate tới History
 */
export default function RecentLessons() {
  const navigation = useNavigation();

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
    console.log('▶️ Phát lại bài học:', itemId);
  };

  return (
    <View className="px-4 py-2">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <AppText className="text-foreground font-sans-bold text-base">
          🕐 BÀI HỌC GẦN ĐÂY
        </AppText>
        <TouchableOpacity onPress={handleViewAll} activeOpacity={0.7}>
          <AppText className="text-warning text-xs font-sans-semibold">
            Xem tất cả →
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Lesson items */}
      <View className="gap-2">
        {RECENT_ITEMS.map(item => (
          <View
            key={item.id}
            className="flex-row items-center bg-neutrals900 rounded-xl p-3 border border-neutrals800"
            style={{gap: 10}}>
            {/* Emoji icon */}
            <AppText className="text-lg">{item.emoji}</AppText>

            {/* Nội dung */}
            <View className="flex-1">
              <AppText className="text-foreground font-sans-semibold text-[13px]">
                {item.title}
              </AppText>
              <AppText className="text-neutrals400 text-[11px] mt-0.5">
                {item.timeAgo} • {item.duration}
              </AppText>
            </View>

            {/* Play button */}
            <TouchableOpacity
              onPress={() => handlePlay(item.id)}
              activeOpacity={0.7}
              className="w-8 h-8 bg-warning/20 rounded-full items-center justify-center">
              <AppText className="text-warning text-sm">▶️</AppText>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}
