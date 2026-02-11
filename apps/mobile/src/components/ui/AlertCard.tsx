import React from 'react';
import {View} from 'react-native';
import {cn} from '@/utils';
import {AppText, Icon} from '@/components/ui';
import {useColors} from '@/hooks/useColors';

/**
 * Mục đích: Card thông báo inline (tip, warning, success, info)
 * Tham số đầu vào:
 *   - type: loại alert ('info' | 'success' | 'warning' | 'error')
 *   - title: tiêu đề (optional)
 *   - message: nội dung thông báo
 *   - className: custom class
 *   - closable: có thể đóng (optional)
 *   - onClose: callback khi đóng
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   - Inline feedback/tip trong form, settings
 *   - Style_Convention §1.3 AlertCard
 */

interface AlertCardProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  className?: string;
  closable?: boolean;
  onClose?: () => void;
}

/**
 * Mục đích: Lấy config (icon, color) theo type
 * Tham số đầu vào: type, colors palette
 * Tham số đầu ra: object {icon, color, bgColor}
 * Khi nào sử dụng: Nội bộ AlertCard
 */
function getAlertConfig(type: string, colors: any) {
  switch (type) {
    case 'success':
      return {
        icon: 'CircleCheck',
        color: colors.success,
        bgColor: colors.success + '14', // 8% opacity
      };
    case 'warning':
      return {
        icon: 'TriangleAlert',
        color: colors.warning,
        bgColor: colors.warning + '14',
      };
    case 'error':
      return {
        icon: 'CircleX',
        color: colors.error,
        bgColor: colors.error + '14',
      };
    case 'info':
    default:
      return {
        icon: 'Info',
        color: colors.primary,
        bgColor: colors.primary + '14',
      };
  }
}

export default function AlertCard({
  type = 'info',
  title,
  message,
  className,
  closable = false,
  onClose,
}: AlertCardProps) {
  const colors = useColors();
  const config = getAlertConfig(type, colors);

  return (
    <View
      className={cn(
        'flex-row p-md rounded-card',
        className,
      )}
      style={{backgroundColor: config.bgColor}}
    >
      {/* Icon */}
      <View className="mr-3 mt-0.5">
        <Icon
          name={config.icon}
          className="w-5 h-5"
          style={{color: config.color}}
        />
      </View>

      {/* Nội dung */}
      <View className="flex-1">
        {title && (
          <AppText
            variant="body"
            weight="semibold"
            className="text-foreground mb-1"
            raw
          >
            {title}
          </AppText>
        )}
        <AppText
          variant="bodySmall"
          className="text-neutrals100 leading-5"
          raw
        >
          {message}
        </AppText>
      </View>

      {/* Nút đóng */}
      {closable && onClose && (
        <View className="ml-2">
          <Icon
            name="X"
            className="w-4 h-4 text-neutrals300"
            onPress={onClose}
          />
        </View>
      )}
    </View>
  );
}
