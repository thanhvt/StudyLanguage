import React from 'react';
import {View, Pressable} from 'react-native';
import {AppText} from '@/components/ui';

/**
 * Mục đích: Card hiển thị AI insight — gợi ý học tập cá nhân hóa
 * Tham số đầu vào:
 *   - insight: string — nội dung insight từ AI
 *   - actionLabel: string — text cho nút CTA
 *   - onAction: Callback khi tap CTA
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: HistoryScreen / AnalyticsScreen → hiển thị insight
 */

interface AIInsightCardProps {
  insight?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const AIInsightCard = React.memo(function AIInsightCard({
  insight = 'Bạn đang tiến bộ! Tuần này bạn đã học 30% nhiều hơn tuần trước. Tiếp tục duy trì thói quen học tập hàng ngày nhé!',
  actionLabel = 'Xem chi tiết →',
  onAction,
}: AIInsightCardProps) {
  return (
    <View
      className="mx-4 mb-4 p-5 rounded-2xl border border-primary/20 overflow-hidden"
      style={{
        // Gradient nền subtle — dùng primary tint
        backgroundColor: 'rgba(74, 222, 128, 0.05)',
        shadowColor: '#4ade80',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
      }}>
      {/* Accent bar top */}
      <View
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{backgroundColor: 'rgba(74, 222, 128, 0.3)'}}
      />

      {/* Header */}
      <View className="flex-row items-center gap-2 mb-3">
        <AppText className="text-lg">💡</AppText>
        <AppText className="text-primary font-sans-bold">
          AI Insight
        </AppText>
      </View>

      {/* Nội dung insight */}
      <AppText className="text-foreground text-sm leading-5 mb-4">
        {insight}
      </AppText>

      {/* CTA button */}
      {onAction && (
        <Pressable className="self-start active:scale-[0.95]" onPress={onAction}>
          <AppText className="text-primary text-sm font-sans-semibold">
            {actionLabel}
          </AppText>
        </Pressable>
      )}
    </View>
  );
});
