import React from 'react';
import {View, StyleSheet} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';

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
 * Mục đích: Card hiển thị trạng thái kết nối tai nghe
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

  // Màu theo trạng thái
  const statusColor = isConnected ? '#22c55e' : '#f59e0b';
  const bgColor = isConnected ? '#22c55e15' : '#f59e0b15';
  const borderColor = isConnected ? '#22c55e40' : '#f59e0b40';

  // Text mô tả
  const statusText = isConnected
    ? connectionType === 'bluetooth'
      ? 'Tai nghe Bluetooth đã kết nối'
      : 'Tai nghe có dây đã kết nối'
    : 'Chưa kết nối tai nghe';

  const statusIcon = isConnected ? '✅' : '⚠️';
  const headphoneIcon = isConnected
    ? connectionType === 'bluetooth'
      ? '🎧'
      : '🎧'
    : '🔇';

  const tipText = isConnected
    ? 'Chất lượng ghi âm tốt nhất — không bị echo'
    : 'Khuyến nghị dùng tai nghe để tránh AI audio lọt vào mic';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
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
      <View
        style={[
          styles.indicator,
          {backgroundColor: statusColor},
        ]}
      />
    </View>
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
