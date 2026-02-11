import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import {cn} from '@/utils';
import {useColors} from '@/hooks/useColors';

/**
 * Mục đích: Hiển thị placeholder loading với hiệu ứng shimmer
 * Tham số đầu vào:
 *   - variant: kiểu skeleton ('text' | 'circle' | 'card' | 'custom')
 *   - width/height: kích thước (number hoặc string)
 *   - lines: số dòng text (chỉ dùng khi variant='text')
 *   - className: custom class
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   - Khi data đang loading lần đầu (first load)
 *   - Style_Convention §3.1 yêu cầu dùng Skeleton thay vì spinner
 */

interface SkeletonProps {
  variant?: 'text' | 'circle' | 'card' | 'custom';
  width?: number | string;
  height?: number | string;
  lines?: number;
  className?: string;
  borderRadius?: number;
}

/**
 * Mục đích: Render 1 item shimmer đơn lẻ
 * Tham số đầu vào: style object + shimmer animation value
 * Tham số đầu ra: Animated.View với hiệu ứng shimmer
 * Khi nào sử dụng: Nội bộ component Skeleton
 */
function ShimmerItem({
  style,
  className,
  borderRadius,
}: {
  style?: any;
  className?: string;
  borderRadius?: number;
}) {
  const colors = useColors();
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, {duration: 1200, easing: Easing.inOut(Easing.ease)}),
      -1, // Lặp vô hạn
      true, // Đảo chiều
    );
  }, [shimmerValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmerValue.value, [0, 1], [0.3, 0.7]),
  }));

  return (
    <Animated.View
      style={[
        {
          backgroundColor: colors.neutrals700,
          borderRadius: borderRadius ?? 8,
        },
        style,
        animatedStyle,
      ]}
      className={cn(className)}
    />
  );
}

export default function Skeleton({
  variant = 'custom',
  width,
  height,
  lines = 3,
  className,
  borderRadius,
}: SkeletonProps) {
  // Variant: Circle (avatar, icon placeholder)
  if (variant === 'circle') {
    const size = typeof width === 'number' ? width : 48;
    return (
      <ShimmerItem
        style={{width: size, height: size, borderRadius: size / 2}}
        className={className}
      />
    );
  }

  // Variant: Card (full card placeholder)
  if (variant === 'card') {
    return (
      <View className={cn('overflow-hidden', className)}>
        <ShimmerItem
          style={{width: '100%', height: 120}}
          borderRadius={16}
          className="mb-3"
        />
        <ShimmerItem
          style={{width: '70%', height: 16}}
          className="mb-2"
        />
        <ShimmerItem
          style={{width: '50%', height: 12}}
        />
      </View>
    );
  }

  // Variant: Text (multiple lines placeholder)
  if (variant === 'text') {
    return (
      <View className={cn(className)}>
        {Array.from({length: lines}).map((_, i) => (
          <ShimmerItem
            key={i}
            style={{
              width: i === lines - 1 ? '60%' : '100%', // Dòng cuối ngắn hơn
              height: 14,
              marginBottom: i < lines - 1 ? 8 : 0,
            }}
          />
        ))}
      </View>
    );
  }

  // Variant: Custom (tự define kích thước)
  return (
    <ShimmerItem
      style={{
        width: width ?? '100%',
        height: height ?? 16,
      }}
      className={className}
      borderRadius={borderRadius}
    />
  );
}
