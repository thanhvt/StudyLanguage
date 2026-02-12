import React from 'react';
import {View} from 'react-native';
import {cn} from '@/utils';
import {AppText} from '@/components/ui';
import AppButton from './AppButton';

/**
 * Mục đích: Hiển thị trạng thái trống (no data) với illustration + CTA
 * Tham số đầu vào:
 *   - emoji: icon/emoji đại diện
 *   - title: tiêu đề trạng thái
 *   - message: mô tả chi tiết
 *   - actionLabel: text nút CTA
 *   - onAction: callback khi nhấn CTA
 *   - className: custom class
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   - Khi danh sách/collection rỗng
 *   - Style_Convention §3.3 yêu cầu bắt buộc
 */

interface EmptyStateProps {
  emoji?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  emoji = '📭',
  title,
  message,
  actionLabel,
  onAction,
  className,
  icon,
}: EmptyStateProps) {
  return (
    <View className={cn('flex-1 items-center justify-center px-md py-xl', className)}>
      {/* Icon hoặc Emoji */}
      {icon ? (
        <View className="mb-lg">{icon}</View>
      ) : (
        <AppText variant="display3" className="text-6xl mb-lg" raw>
          {emoji}
        </AppText>
      )}

      {/* Tiêu đề */}
      <AppText
        variant="heading2"
        weight="semibold"
        className="text-foreground text-center mb-sm"
        raw
      >
        {title}
      </AppText>

      {/* Mô tả */}
      {message && (
        <AppText
          variant="body"
          className="text-neutrals200 text-center leading-5 mb-lg"
          raw
        >
          {message}
        </AppText>
      )}

      {/* Nút hành động */}
      {actionLabel && onAction && (
        <AppButton variant="primary" onPress={onAction}>
          {actionLabel}
        </AppButton>
      )}
    </View>
  );
}
