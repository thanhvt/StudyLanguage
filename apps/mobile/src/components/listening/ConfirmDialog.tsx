import React from 'react';
import {View, TouchableOpacity, Modal} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';

// ========================
// Màu sắc
// ========================
const WARNING_AMBER = '#fbbf24';
const LISTENING_ORANGE = '#F97316';

interface ConfirmDialogProps {
  /** Hiển thị dialog */
  visible: boolean;
  /** Tiêu đề */
  title: string;
  /** Mô tả */
  description: string;
  /** Callback khi hủy */
  onCancel: () => void;
  /** Callback khi xác nhận */
  onConfirm: () => void;
  /** Text nút hủy */
  cancelText?: string;
  /** Text nút xác nhận */
  confirmText?: string;
}

/**
 * Mục đích: Modal xác nhận hành động nguy hiểm (dừng audio, xóa data...)
 * Tham số đầu vào: visible, title, description, onCancel, onConfirm
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   - User nhấn "Bắt đầu nghe" khi đang có audio phát
 *   - User nhấn "Bài mới" trên PlayerScreen
 *   - User navigate away khi đang phát
 */
export default function ConfirmDialog({
  visible,
  title,
  description,
  onCancel,
  onConfirm,
  cancelText = 'Hủy',
  confirmText = 'Tiếp tục',
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent>
      <View className="flex-1 bg-black/60 items-center justify-center px-8">
        <View className="bg-surface-raised rounded-3xl p-6 w-full max-w-sm border border-border">
          {/* Warning icon */}
          <View className="items-center mb-4">
            <View
              className="w-14 h-14 rounded-full items-center justify-center"
              style={{backgroundColor: `${WARNING_AMBER}20`}}>
              <AppText className="text-3xl">⚠️</AppText>
            </View>
          </View>

          {/* Title */}
          <AppText className="text-foreground font-sans-bold text-xl text-center mb-2">
            {title}
          </AppText>

          {/* Description */}
          <AppText className="text-neutrals400 text-sm text-center mb-6 leading-5">
            {description}
          </AppText>

          {/* Actions */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl items-center border border-neutrals700"
              onPress={onCancel}
              activeOpacity={0.7}
              accessibilityLabel={cancelText}
              accessibilityRole="button">
              <AppText className="text-foreground font-sans-medium text-sm">
                {cancelText}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 py-3 rounded-xl items-center"
              style={{backgroundColor: LISTENING_ORANGE}}
              onPress={onConfirm}
              activeOpacity={0.7}
              accessibilityLabel={confirmText}
              accessibilityRole="button">
              <AppText className="text-white font-sans-bold text-sm">
                {confirmText}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
