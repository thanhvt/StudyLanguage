import React from 'react';
import {View, Pressable, ScrollView} from 'react-native';
import {AppText} from '@/components/ui';
import {getAccentColor, type SkillType} from '@/utils/historyHelpers';

/**
 * Mục đích: Thanh pills filter theo loại bài học (All/Nghe/Nói/Đọc)
 * Tham số đầu vào:
 *   - activeType: Loại đang active ('all' | 'listening' | ...)
 *   - onChange: Callback khi chọn filter
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: HistoryScreen → phía trên StatsBar
 */

interface FilterPillsProps {
  activeType: string;
  onChange: (type: 'all' | 'listening' | 'speaking' | 'reading') => void;
}

const FILTERS: {key: 'all' | SkillType; icon: string; label: string}[] = [
  {key: 'all', icon: '📋', label: 'Tất cả'},
  {key: 'listening', icon: '🎧', label: 'Nghe'},
  {key: 'speaking', icon: '🗣️', label: 'Nói'},
  {key: 'reading', icon: '📖', label: 'Đọc'},
];

export function FilterPills({activeType, onChange}: FilterPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{paddingHorizontal: 16, gap: 8}}
      className="mb-4">
      {FILTERS.map(filter => {
        const isActive = activeType === filter.key;
        const accent =
          filter.key !== 'all' ? getAccentColor(filter.key) : null;

        return (
          <Pressable
            key={filter.key}
            className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full border ${
              isActive ? 'border-transparent' : 'border-border/50 bg-card'
            }`}
            style={
              isActive
                ? {
                    backgroundColor: accent?.bg || 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 1,
                    borderColor: accent?.border || '#6366F1',
                  }
                : undefined
            }
            onPress={() => onChange(filter.key)}>
            <AppText className="text-sm">{filter.icon}</AppText>
            <AppText
              className={`text-sm font-sans-medium ${
                isActive ? '' : 'text-neutrals400'
              }`}
              style={isActive ? {color: accent?.text || '#6366F1'} : undefined}>
              {filter.label}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
