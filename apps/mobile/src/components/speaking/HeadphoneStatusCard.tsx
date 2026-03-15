import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';

// =======================
// Types
// =======================

interface HeadphoneStatusCardProps {
  /** Tai nghe có đang kết nối không */
  isConnected: boolean;
  /** Loại kết nối */
  connectionType: 'wired' | 'bluetooth' | 'none';
}

// =======================
// Component
// =======================

/**
 * Mục đích: Card hiển thị trạng thái kết nối tai nghe với animation mượt
 * Tham số đầu vào: isConnected, connectionType
 * Tham số đầu ra: JSX.Element — status card xanh (kết nối) hoặc vàng (chưa)
 * Khi nào sử dụng:
 *   - ShadowingConfigScreen: section "Tai nghe" ở cuối config
 *   - Cập nhật realtime qua useHeadphoneDetection hook
 */
export default function HeadphoneStatusCard({
  isConnected,
  connectionType,
}: HeadphoneStatusCardProps) {
  const colors = useColors();
  const haptic = useHaptic();

  // Animated value cho smooth transition giữa trạng thái
  const transitionAnim = useRef(new Animated.Value(isConnected ? 1 : 0)).current;
  // Flash animation khi vừa kết nối thành công
  const flashAnim = useRef(new Animated.Value(1)).current;
  // Ref theo dõi trạng thái trước đó
  const prevConnectedRef = useRef(isConnected);

  useEffect(() => {
    // Animate transition mượt mà
    Animated.timing(transitionAnim, {
      toValue: isConnected ? 1 : 0,
      duration: 400,
      useNativeDriver: false,
    }).start();

    // Phát hiện khi vừa cắm tai nghe (false → true)
    if (!prevConnectedRef.current && isConnected) {
      // Haptic feedback khi kết nối thành công
      haptic.success();

      // Flash animation — pulse 2 lần
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 0.6,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0.7,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();

      console.log('🎧 [HeadphoneStatusCard] Tai nghe vừa kết nối — hiệu ứng flash');
    }

    prevConnectedRef.current = isConnected;
  }, [isConnected, transitionAnim, flashAnim, haptic]);

  // Interpolate màu theo trạng thái (vàng → xanh)
  const bgColor = transitionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(245,158,11,0.08)', 'rgba(34,197,94,0.08)'],
  });

  const borderColor = transitionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(245,158,11,0.25)', 'rgba(34,197,94,0.25)'],
  });

  const indicatorColor = transitionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#f59e0b', '#22c55e'],
  });

  // Text mô tả
  const statusText = isConnected
    ? connectionType === 'bluetooth'
      ? 'Tai nghe Bluetooth đã kết nối'
      : 'Tai nghe có dây đã kết nối'
    : 'Chưa kết nối tai nghe';

  const statusIcon = isConnected ? '✅' : '⚠️';
  const headphoneIcon = isConnected ? '🎧' : '🔇';

  const tipText = isConnected
    ? 'Chất lượng ghi âm tốt nhất — không bị echo'
    : 'Khuyến nghị dùng tai nghe để tránh AI audio lọt vào mic';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
          opacity: flashAnim,
        },
      ]}>
      {/* Header */}
      <View style={styles.header}>
        <AppText style={{fontSize: 20}} raw>
          {headphoneIcon}
        </AppText>
        <View style={styles.headerText}>
          <View style={styles.statusRow}>
            <AppText
              style={{fontSize: 13, fontWeight: '600', color: colors.foreground}}
              raw>
              {statusText}
            </AppText>
            <AppText style={{fontSize: 14}} raw>
              {statusIcon}
            </AppText>
          </View>
          <AppText
            style={{fontSize: 11, color: colors.neutrals400, marginTop: 2}}
            raw>
            {tipText}
          </AppText>
        </View>
      </View>

      {/* Indicator dot */}
      <Animated.View
        style={[
          styles.indicator,
          {backgroundColor: indicatorColor},
        ]}
      />
    </Animated.View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
