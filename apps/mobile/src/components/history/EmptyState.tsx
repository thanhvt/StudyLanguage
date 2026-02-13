import React from 'react';
import {View, Pressable} from 'react-native';
import {AppText} from '@/components/ui';
import {useNavigation} from '@react-navigation/native';

/**
 * Mục đích: Hiển thị trạng thái trống khi chưa có lịch sử
 * Tham số đầu vào:
 *   - filterType: Loại filter đang active (để custom message)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: HistoryScreen → khi entries.length === 0 && !loading
 */

interface EmptyStateProps {
  filterType?: string;
}

export function EmptyState({filterType}: EmptyStateProps) {
  const navigation = useNavigation<any>();

  /**
   * Mục đích: Lấy message và CTA dựa trên filter đang chọn
   * Tham số đầu vào: filterType từ props
   * Tham số đầu ra: Object {emoji, title, subtitle, ctas}
   * Khi nào sử dụng: Render phần nội dung EmptyState
   */
  const getContent = () => {
    switch (filterType) {
      case 'listening':
        return {
          emoji: '🎧',
          title: 'Chưa có bài nghe nào',
          subtitle: 'Bắt đầu luyện nghe để theo dõi tiến trình!',
          ctas: [{icon: '🎧', label: 'Luyện nghe ngay', skill: 'Listening'}],
        };
      case 'speaking':
        return {
          emoji: '🗣️',
          title: 'Chưa có bài nói nào',
          subtitle: 'Bắt đầu luyện nói để cải thiện phát âm!',
          ctas: [{icon: '🗣️', label: 'Luyện nói ngay', skill: 'Speaking'}],
        };
      case 'reading':
        return {
          emoji: '📖',
          title: 'Chưa có bài đọc nào',
          subtitle: 'Bắt đầu đọc để mở rộng vốn từ!',
          ctas: [{icon: '📖', label: 'Bắt đầu đọc', skill: 'Reading'}],
        };
      default:
        return {
          emoji: '📚',
          title: 'Chưa có lịch sử học tập',
          subtitle: 'Bắt đầu bài học đầu tiên để theo dõi tiến trình!',
          ctas: [
            {icon: '🎧', label: 'Bắt đầu nghe', skill: 'Listening'},
            {icon: '🗣️', label: 'Bắt đầu nói', skill: 'Speaking'},
            {icon: '📖', label: 'Bắt đầu đọc', skill: 'Reading'},
          ],
        };
    }
  };

  const content = getContent();

  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      {/* Emoji lớn */}
      <View className="w-20 h-20 rounded-2xl bg-card border border-border/30 items-center justify-center mb-5">
        <AppText className="text-4xl">{content.emoji}</AppText>
      </View>

      {/* Title */}
      <AppText className="text-foreground font-sans-bold text-lg text-center mb-2">
        {content.title}
      </AppText>

      {/* Subtitle */}
      <AppText className="text-neutrals400 text-center text-sm mb-8 leading-5">
        {content.subtitle}
      </AppText>

      {/* CTA Buttons */}
      <View className="gap-3 w-full">
        {content.ctas.map(cta => (
          <Pressable
            key={cta.skill}
            className="flex-row items-center justify-center gap-2 bg-primary/10 border border-primary/20 rounded-xl py-3 px-6 active:scale-[0.97]"
            onPress={() => navigation.navigate(cta.skill)}>
            <AppText className="text-base">{cta.icon}</AppText>
            <AppText className="text-primary font-sans-semibold">
              {cta.label}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
