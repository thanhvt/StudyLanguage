import React from 'react';
import {View, ViewStyle} from 'react-native';

/**
 * Mục đích: Wrapper component cho transition animation giữa HistoryCard → HistoryDetailScreen
 * Tham số đầu vào:
 *   - id: string — unique ID cho shared element (thường là entry.id)
 *   - children: ReactNode — nội dung cần animate
 *   - style?: ViewStyle
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   - HistoryCard → wrap card icon với SharedTransition
 *   - HistoryDetailScreen → wrap header card icon với cùng id
 *
 * Note: Đã chuyển từ react-native-shared-element (incompatible với RN 0.80)
 * sang wrapper View đơn giản.
 * Animation được xử lý bởi React Navigation native stack transition.
 * Khi có lib compatible (react-native-reanimated shared element), có thể nâng cấp.
 */

interface SharedTransitionProps {
  id: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function SharedTransition({children, style}: SharedTransitionProps) {
  // Hiện tại chỉ là wrapper View — animation được xử lý bởi native stack transition
  // Giữ API ổn định để dễ nâng cấp sau
  return <View style={style}>{children}</View>;
}
