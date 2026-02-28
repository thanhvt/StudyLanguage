import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/components/ui';
import {HistoryCard} from './HistoryCard';
import type {HistoryEntry} from '@/services/api/history';

/**
 * Mục đích: Section hiển thị các bài học đã ghim (pinned) ở đầu danh sách
 * Tham số đầu vào:
 *   - entries: HistoryEntry[] — danh sách entries đã filter isPinned=true
 *   - onPress: Callback khi tap card
 *   - onDelete: Callback khi swipe left
 *   - onPin: Callback khi swipe right (bỏ ghim)
 *   - onLongPress: Callback khi long press
 *   - selectionMode: boolean — đang ở chế độ chọn nhiều
 *   - selectedIds: string[] — danh sách IDs đang được chọn
 *   - onToggleSelect: Callback toggle chọn
 * Tham số đầu ra: JSX.Element | null
 * Khi nào sử dụng: HistoryScreen → phía trên SectionList, hiển thị khi có bài ghim
 */

interface PinnedSectionProps {
  entries: HistoryEntry[];
  onPress?: (entry: HistoryEntry) => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
  onLongPress?: (entry: HistoryEntry) => void;
  selectionMode?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
}

export const PinnedSection = React.memo(function PinnedSection({
  entries,
  onPress,
  onDelete,
  onPin,
  onLongPress,
  selectionMode = false,
  selectedIds = [],
  onToggleSelect,
}: PinnedSectionProps) {
  // Lọc entries đã ghim
  const pinnedEntries = entries.filter(e => e.isPinned);

  // Không hiển thị nếu không có bài ghim
  if (pinnedEntries.length === 0) {
    return null;
  }

  return (
    <View className="mb-2">
      {/* Section header */}
      <View className="px-4 py-2">
        <AppText className="text-neutrals400 font-sans-semibold text-xs uppercase tracking-wider">
          ─── 📌 Đã ghim ({pinnedEntries.length}) ───
        </AppText>
      </View>

      {/* Danh sách cards đã ghim */}
      {pinnedEntries.map(entry => (
        <HistoryCard
          key={entry.id}
          entry={entry}
          onPress={onPress}
          onDelete={onDelete}
          onPin={onPin}
          onLongPress={onLongPress}
          selectionMode={selectionMode}
          isSelected={selectedIds.includes(entry.id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </View>
  );
});
