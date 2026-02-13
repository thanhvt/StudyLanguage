import React, {useEffect, useRef} from 'react';
import {View, Animated} from 'react-native';

/**
 * Mục đích: Skeleton loading card khi đang tải lịch sử
 * Tham số đầu vào:
 *   - count: Số lượng skeleton cards hiển thị (mặc định 4)
 * Tham số đầu ra: JSX.Element — shimmer animated skeleton
 * Khi nào sử dụng: HistoryScreen → khi loading === true && entries rỗng
 */

interface HistoryCardSkeletonProps {
  count?: number;
}

/**
 * Mục đích: Một skeleton card đơn lẻ với shimmer animation
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: HistoryCardSkeleton render từng card
 */
function SkeletonCard() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Vòng lặp shimmer animation
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      className="bg-card rounded-xl mx-4 mb-3 p-4"
      style={{opacity, borderLeftWidth: 4, borderLeftColor: '#d1d5db'}}>
      {/* Hàng 1: Icon + Title */}
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-xl bg-muted" />
        <View className="flex-1 gap-2">
          <View className="h-4 bg-muted rounded w-3/4" />
          <View className="h-3 bg-muted rounded w-1/2" />
        </View>
      </View>

      {/* Hàng 2: Footer */}
      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border/30">
        <View className="h-3 bg-muted rounded w-24" />
        <View className="h-3 bg-muted rounded w-16" />
      </View>
    </Animated.View>
  );
}

export function HistoryCardSkeleton({count = 4}: HistoryCardSkeletonProps) {
  return (
    <View>
      {Array.from({length: count}).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}
