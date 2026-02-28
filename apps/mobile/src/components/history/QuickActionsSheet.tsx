import React from 'react';
import {View, Pressable, Modal} from 'react-native';
import {AppText} from '@/components/ui';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {HistoryEntry} from '@/services/api/history';
import {getTypeIcon, getAccentColor, type SkillType} from '@/utils/historyHelpers';

/**
 * Mục đích: Bottom sheet hiển thị quick actions khi long press card
 * Tham số đầu vào:
 *   - visible: boolean — hiển thị/ẩn
 *   - entry: HistoryEntry | null — entry đang được thao tác
 *   - onReplay: Callback phát lại
 *   - onPracticeAgain: Callback luyện lại
 *   - onPin: Callback ghim/bỏ ghim
 *   - onFavorite: Callback yêu thích
 *   - onShare: Callback chia sẻ
 *   - onDelete: Callback xóa
 *   - onClose: Callback đóng sheet
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: HistoryCard long press → hiển thị sheet
 */

interface QuickActionsSheetProps {
  visible: boolean;
  entry: HistoryEntry | null;
  onReplay?: (entry: HistoryEntry) => void;
  onPracticeAgain?: (entry: HistoryEntry) => void;
  onPin?: (id: string) => void;
  onFavorite?: (id: string) => void;
  onShare?: (entry: HistoryEntry) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

/**
 * Mục đích: Render một action item trong sheet
 * Tham số đầu vào: icon, label, onPress, variant
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: QuickActionsSheet → mỗi action row
 */
function ActionItem({
  icon,
  label,
  onPress,
  variant = 'default',
}: {
  icon: string;
  label: string;
  onPress?: () => void;
  variant?: 'default' | 'destructive';
}) {
  return (
    <Pressable
      className={`flex-row items-center gap-3 px-4 py-3.5 rounded-2xl active:scale-[0.97] ${
        variant === 'destructive' ? 'bg-red-500/5' : 'bg-neutrals900'
      }`}
      onPress={onPress}>
      <AppText className="text-base w-6 text-center">{icon}</AppText>
      <AppText
        className={`flex-1 font-sans-medium ${
          variant === 'destructive' ? 'text-red-400' : 'text-foreground'
        }`}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function QuickActionsSheet({
  visible,
  entry,
  onReplay,
  onPracticeAgain,
  onPin,
  onFavorite,
  onShare,
  onDelete,
  onClose,
}: QuickActionsSheetProps) {
  const insets = useSafeAreaInsets();

  if (!entry) {
    return null;
  }

  const icon = getTypeIcon(entry.type as SkillType);
  const accent = getAccentColor(entry.type as SkillType);
  const date = new Date(entry.createdAt).toLocaleDateString('vi-VN');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable
        className="flex-1"
        style={{backgroundColor: 'rgba(0, 0, 0, 0.50)'}}
        onPress={onClose}
      />

      {/* Sheet */}
      <View
        className="bg-background rounded-t-3xl"
        style={{
          paddingBottom: Math.max(insets.bottom, 16) + 24,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -4},
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 20,
        }}>
        {/* Handle bar */}
        <View className="items-center pt-4 mb-4">
          <View className="w-10 h-1 bg-neutrals600 rounded-full" />
        </View>

        {/* Header */}
        <View className="flex-row items-center justify-between px-6 mb-5">
          <AppText className="text-foreground font-sans-bold text-lg">
            ⚡ Quick Actions
          </AppText>
          <Pressable
            className="w-8 h-8 rounded-full bg-neutrals900 items-center justify-center active:scale-90"
            onPress={onClose}>
            <AppText className="text-neutrals400 text-sm">✕</AppText>
          </Pressable>
        </View>

        {/* Thông tin session */}
        <View
          className="mx-6 mb-5 p-4 rounded-2xl border border-border"
          style={{
            backgroundColor: '#171717',
            borderLeftWidth: 4,
            borderLeftColor: accent.border,
          }}>
          <View className="flex-row items-center gap-3">
            <View
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{backgroundColor: accent.bg}}>
              <AppText className="text-lg">{icon}</AppText>
            </View>
            <View className="flex-1">
              <AppText
                className="text-foreground font-sans-semibold"
                numberOfLines={1}>
                {entry.topic}
              </AppText>
              <AppText className="text-neutrals400 text-xs mt-0.5">
                {date} • {entry.durationMinutes || 5} phút
              </AppText>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="px-6 gap-2">
          {/* Phát lại — chỉ cho Listening */}
          {entry.type === 'listening' && (
            <ActionItem
              icon="▶️"
              label="Phát lại"
              onPress={() => {
                onReplay?.(entry);
                onClose();
              }}
            />
          )}

          {/* Luyện lại */}
          <ActionItem
            icon="🔄"
            label="Luyện lại"
            onPress={() => {
              onPracticeAgain?.(entry);
              onClose();
            }}
          />

          {/* Ghim / Bỏ ghim */}
          <ActionItem
            icon={entry.isPinned ? '📌' : '📍'}
            label={entry.isPinned ? 'Bỏ ghim' : 'Ghim'}
            onPress={() => {
              onPin?.(entry.id);
              onClose();
            }}
          />

          {/* Yêu thích */}
          <ActionItem
            icon={entry.isFavorite ? '💛' : '⭐'}
            label={entry.isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
            onPress={() => {
              onFavorite?.(entry.id);
              onClose();
            }}
          />

          {/* Chia sẻ */}
          <ActionItem
            icon="📤"
            label="Chia sẻ"
            onPress={() => {
              onShare?.(entry);
              onClose();
            }}
          />

          {/* Separator */}
          <View className="border-t border-border/30 my-1" />

          {/* Xóa */}
          <ActionItem
            icon="🗑️"
            label="Xóa"
            variant="destructive"
            onPress={() => {
              onDelete?.(entry.id);
              onClose();
            }}
          />
        </View>
      </View>
    </Modal>
  );
}
