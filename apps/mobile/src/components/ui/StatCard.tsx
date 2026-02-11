import React from 'react';
import {View} from 'react-native';
import {cn} from '@/utils';
import {AppText, Icon} from '@/components/ui';
import {useColors} from '@/hooks/useColors';

/**
 * Mục đích: Card hiển thị 1 thống kê (metric) theo dạng compact
 * Tham số đầu vào:
 *   - icon: tên icon hoặc emoji
 *   - value: giá trị thống kê (string hoặc number)
 *   - label: nhãn mô tả
 *   - trend: xu hướng tăng/giảm (optional)
 *   - className: custom class
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   - Dashboard stats overview (🔥 12 Streak, 📚 45 bài...)
 *   - Style_Convention §1.3 StatCard
 */

interface StatCardProps {
  icon?: string;
  emoji?: string;
  value: string | number;
  label: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  className?: string;
}

export default function StatCard({
  icon,
  emoji,
  value,
  label,
  trend,
  className,
}: StatCardProps) {
  const colors = useColors();

  /**
   * Mục đích: Lấy màu sắc cho indicator xu hướng
   * Tham số đầu vào: direction
   * Tham số đầu ra: hex color
   * Khi nào sử dụng: Nội bộ StatCard, khi hiển thị trend
   */
  const getTrendColor = () => {
    if (!trend) return colors.neutrals300;
    switch (trend.direction) {
      case 'up':
        return colors.success;
      case 'down':
        return colors.error;
      default:
        return colors.neutrals300;
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up':
        return 'TrendingUp';
      case 'down':
        return 'TrendingDown';
      default:
        return 'Minus';
    }
  };

  return (
    <View
      className={cn(
        'p-md rounded-card',
        className,
      )}
      style={{backgroundColor: colors.surfaceRaised}}
    >
      {/* Icon hoặc Emoji */}
      <View className="flex-row items-center justify-between mb-sm">
        {emoji ? (
          <AppText variant="body" raw>{emoji}</AppText>
        ) : icon ? (
          <Icon
            name={icon}
            className="w-5 h-5 text-neutrals300"
          />
        ) : null}

        {/* Trend indicator */}
        {trend && (
          <View className="flex-row items-center gap-1">
            <Icon
              name={getTrendIcon()!}
              className="w-3.5 h-3.5"
              style={{color: getTrendColor()}}
            />
            <AppText
              variant="caption"
              weight="medium"
              style={{color: getTrendColor()}}
              raw
            >
              {trend.value}
            </AppText>
          </View>
        )}
      </View>

      {/* Giá trị */}
      <AppText variant="title" weight="bold" className="text-foreground mb-0.5" raw>
        {String(value)}
      </AppText>

      {/* Nhãn */}
      <AppText variant="caption" className="text-neutrals300" raw>
        {label}
      </AppText>
    </View>
  );
}
