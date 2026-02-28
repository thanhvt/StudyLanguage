import React from 'react';
import {View, Pressable, ScrollView} from 'react-native';
import {AppText} from '@/components/ui';
import {getTypeIcon, getAccentColor, formatRelativeTime, type SkillType} from '@/utils/historyHelpers';
import type {HistoryEntry} from '@/services/api/history';

/**
 * Mục đích: Panel hiển thị các bài học gần đây có thể phát lại nhanh
 * Tham số đầu vào:
 *   - entries: HistoryEntry[] — danh sách 5-10 entries gần nhất
 *   - onPress: Callback khi tap card (navigate/replay)
 *   - onReplay: Callback khi tap nút replay
 * Tham số đầu ra: JSX.Element | null
 * Khi nào sử dụng: HistoryScreen → phía trên timeline list
 *
 * Tính năng:
 *   - Horizontal scroll danh sách compact cards
 *   - Mỗi card có icon skill, topic, thời gian, nút replay
 *   - Tối đa 8 entries, compact layout
 */

interface RecentLessonsPanelProps {
  entries: HistoryEntry[];
  onPress?: (entry: HistoryEntry) => void;
  onReplay?: (entry: HistoryEntry) => void;
}

export const RecentLessonsPanel = React.memo(function RecentLessonsPanel({
  entries,
  onPress,
  onReplay,
}: RecentLessonsPanelProps) {
  // Lấy tối đa 8 entries gần nhất
  const recentEntries = entries.slice(0, 8);

  if (recentEntries.length === 0) {
    return null;
  }

  return (
    <View className="mb-4">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 mb-3">
        <View className="flex-row items-center gap-2">
          <AppText className="text-sm">🕐</AppText>
          <AppText className="text-foreground font-sans-semibold">
            Bài học gần đây
          </AppText>
        </View>
        <AppText className="text-neutrals400 text-xs">
          {recentEntries.length} bài
        </AppText>
      </View>

      {/* Horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: 16, gap: 12}}>
        {recentEntries.map(entry => {
          const accent = getAccentColor(entry.type as SkillType);
          const icon = getTypeIcon(entry.type as SkillType);
          const timeAgo = formatRelativeTime(entry.createdAt);

          return (
            <Pressable
              key={entry.id}
              className="bg-surface-raised rounded-2xl border border-border overflow-hidden active:scale-[0.95]"
              style={{
                width: 160,
                borderTopWidth: 3,
                borderTopColor: accent.border,
              }}
              onPress={() => onPress?.(entry)}>
              <View className="p-3">
                {/* Icon + Type */}
                <View className="flex-row items-center gap-2 mb-2">
                  <View
                    className="w-8 h-8 rounded-lg items-center justify-center"
                    style={{backgroundColor: accent.bg}}>
                    <AppText className="text-sm">{icon}</AppText>
                  </View>
                  <AppText className="text-neutrals400 text-[10px] font-sans-medium">
                    {timeAgo}
                  </AppText>
                </View>

                {/* Topic */}
                <AppText
                  className="text-foreground text-sm font-sans-medium mb-2"
                  numberOfLines={2}>
                  {entry.topic}
                </AppText>

                {/* Replay button */}
                <Pressable
                  className="flex-row items-center justify-center gap-1 py-1.5 rounded-lg"
                  style={{backgroundColor: accent.bg}}
                  onPress={() => onReplay?.(entry)}>
                  <AppText className="text-xs">🔄</AppText>
                  <AppText className="text-xs font-sans-medium" style={{color: accent.text}}>
                    Luyện lại
                  </AppText>
                </Pressable>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
});
