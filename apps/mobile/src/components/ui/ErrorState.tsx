import React from 'react';
import {View} from 'react-native';
import {cn} from '@/utils';
import {AppText} from '@/components/ui';
import AppButton from './AppButton';

/**
 * Mục đích: Hiển thị trạng thái lỗi toàn màn hình với nút retry
 * Tham số đầu vào:
 *   - emoji: icon/emoji lỗi
 *   - title: tiêu đề lỗi
 *   - message: mô tả chi tiết lỗi
 *   - onRetry: callback khi nhấn retry
 *   - retryLabel: text nút retry
 *   - className: custom class
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   - Khi API trả về lỗi hoặc kết nối thất bại
 *   - Style_Convention §3.2 yêu cầu bắt buộc
 */

interface ErrorStateProps {
  emoji?: string;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  icon?: React.ReactNode;
}

export default function ErrorState({
  emoji = '😵',
  title = 'Đã xảy ra lỗi',
  message = 'Không thể tải dữ liệu. Vui lòng thử lại.',
  onRetry,
  retryLabel = 'Thử lại',
  className,
  icon,
}: ErrorStateProps) {
  return (
    <View className={cn('flex-1 items-center justify-center px-md py-xl', className)}>
      {/* Icon hoặc Emoji */}
      {icon ? (
        <View className="mb-lg">{icon}</View>
      ) : (
        <AppText variant="title" className="text-6xl mb-lg" raw>
          {emoji}
        </AppText>
      )}

      {/* Tiêu đề */}
      <AppText
        variant="heading"
        weight="semibold"
        className="text-foreground text-center mb-sm"
        raw
      >
        {title}
      </AppText>

      {/* Mô tả lỗi */}
      {message && (
        <AppText
          variant="body"
          className="text-neutrals200 text-center leading-5 mb-lg"
          raw
        >
          {message}
        </AppText>
      )}

      {/* Nút retry */}
      {onRetry && (
        <AppButton variant="primary" onPress={onRetry}>
          {retryLabel}
        </AppButton>
      )}
    </View>
  );
}
