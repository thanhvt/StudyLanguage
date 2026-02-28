import React from 'react';
import {View, Pressable, Modal} from 'react-native';
import {AppText} from '@/components/ui';

/**
 * Mục đích: Dialog xác nhận xóa bản ghi lịch sử
 * Tham số đầu vào:
 *   - visible: boolean — hiển thị/ẩn dialog
 *   - title: string — tiêu đề bản ghi sắp xóa
 *   - count: number — số lượng cần xóa (batch mode)
 *   - onConfirm: Callback xác nhận xóa
 *   - onCancel: Callback hủy
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   - HistoryCard swipe left → delete → hiện dialog
 *   - BatchActionBar → delete → hiện dialog
 */

interface DeleteConfirmDialogProps {
  visible: boolean;
  title?: string;
  count?: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  visible,
  title,
  count = 1,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  const isBatch = count > 1;
  const heading = isBatch
    ? `Xóa ${count} bản ghi?`
    : '🗑️ Xóa bản ghi?';

  const description = isBatch
    ? `Bạn có chắc muốn xóa ${count} bản ghi đã chọn? Bạn có thể khôi phục trong 30 ngày.`
    : `Bạn có chắc muốn xóa "${title || 'bản ghi này'}"? Bạn có thể khôi phục trong 30 ngày.`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      {/* Backdrop */}
      <Pressable
        className="flex-1 items-center justify-center"
        style={{backgroundColor: 'rgba(0, 0, 0, 0.50)'}}
        onPress={onCancel}>
        {/* Dialog */}
        <View
          className="bg-surface-raised rounded-2xl mx-8 p-6 border border-border"
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 20,
            maxWidth: 340,
            width: '100%',
          }}
          // Ngăn tap truyền qua dialog tới backdrop
          onStartShouldSetResponder={() => true}>
          {/* Tiêu đề */}
          <AppText className="text-foreground font-sans-bold text-lg text-center mb-2">
            {heading}
          </AppText>

          {/* Mô tả */}
          <AppText className="text-neutrals400 text-sm text-center mb-6 leading-5">
            {description}
          </AppText>

          {/* Buttons */}
          <View className="flex-row gap-3">
            {/* Nút Hủy */}
            <Pressable
              className="flex-1 py-3 rounded-2xl bg-neutrals900 border border-border items-center active:scale-[0.95]"
              onPress={onCancel}>
              <AppText className="text-foreground font-sans-semibold">
                Hủy
              </AppText>
            </Pressable>

            {/* Nút Xóa */}
            <Pressable
              className="flex-1 py-3 rounded-2xl bg-red-500/90 items-center active:scale-[0.95]"
              style={{
                shadowColor: '#f87171',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={onConfirm}>
              <AppText className="text-white font-sans-bold">
                🗑️ Xóa
              </AppText>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
