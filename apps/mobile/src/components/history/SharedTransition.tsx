import React from 'react';
import {View} from 'react-native';
import {SharedElement} from 'react-navigation-shared-element';

/**
 * Mục đích: Wrapper component cho SharedElement transition giữa HistoryCard → HistoryDetailScreen
 * Tham số đầu vào:
 *   - id: string — unique ID cho shared element (thường là entry.id)
 *   - children: ReactNode — nội dung cần animate
 *   - style?: ViewStyle
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   - HistoryCard → wrap card container với SharedTransition
 *   - HistoryDetailScreen → wrap header card với cùng id
 *
 * Cách dùng:
 * ```tsx
 * // Trong HistoryCard
 * <SharedTransition id={`history-card-${entry.id}`}>
 *   <View className="...">...</View>
 * </SharedTransition>
 *
 * // Trong HistoryDetailScreen
 * <SharedTransition id={`history-card-${entry.id}`}>
 *   <View className="...">Header card...</View>
 * </SharedTransition>
 * ```
 */

interface SharedTransitionProps {
  id: string;
  children: React.ReactNode;
  style?: any;
}

export function SharedTransition({id, children, style}: SharedTransitionProps) {
  return (
    <SharedElement id={id} style={style}>
      <View>{children}</View>
    </SharedElement>
  );
}

/**
 * Mục đích: Hỗ trợ SharedElement config cho react-navigation
 * Tham số đầu vào: navigation, route
 * Tham số đầu ra: SharedElementConfig[]
 * Khi nào sử dụng: HistoryDetailScreen.sharedElements
 *
 * Cấu hình shared element transition animations:
 *   - Card container: scale + fade
 *   - Card icon: move + scale
 */
export const historyDetailSharedElements = (
  route: any,
  _otherRoute: any,
  _showing: boolean,
) => {
  const {entryId} = route.params || {};
  if (!entryId) return [];

  return [
    {
      id: `history-card-${entryId}`,
      animation: 'move' as const,
      resize: 'clip' as const,
      align: 'auto' as const,
    },
    {
      id: `history-icon-${entryId}`,
      animation: 'move' as const,
      resize: 'clip' as const,
    },
  ];
};
