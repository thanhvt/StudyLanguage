import React from 'react';
import {View, StyleSheet} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';

// =======================
// Types
// =======================

interface Badge {
  /** ID */
  id: string;
  /** Tên huy hiệu */
  name: string;
  /** Emoji icon */
  emoji: string;
  /** Mô tả điều kiện đạt */
  description: string;
  /** Đã đạt chưa */
  unlocked: boolean;
  /** Ngày đạt */
  unlockedAt?: string;
}

interface BadgeGridProps {
  /** Danh sách huy hiệu */
  badges: Badge[];
  /** Số cột */
  columns?: number;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Grid hiển thị huy hiệu thành tích
 * Tham số đầu vào: badges — Badge[], columns
 * Tham số đầu ra: JSX.Element — grid huy hiệu
 * Khi nào sử dụng:
 *   - ProgressDashboardScreen: thành tích user
 */
export default function BadgeGrid({badges, columns = 4}: BadgeGridProps) {
  const colors = useColors();
  const speakingColor = SKILL_COLORS.speaking.dark;

  const unlocked = badges.filter(b => b.unlocked).length;

  return (
    <View style={[styles.container, {backgroundColor: colors.surface}]}>
      <View style={styles.header}>
        <AppText variant="body" weight="semibold" className="text-foreground" raw>
          🏆 Huy hiệu
        </AppText>
        <AppText variant="bodySmall" className="text-neutrals400" raw>
          {unlocked}/{badges.length}
        </AppText>
      </View>

      <View style={styles.grid}>
        {badges.map(badge => (
          <View
            key={badge.id}
            style={[
              styles.badgeItem,
              {
                opacity: badge.unlocked ? 1 : 0.35,
                backgroundColor: badge.unlocked ? `${speakingColor}12` : 'rgba(150,150,150,0.06)',
              },
            ]}>
            <AppText variant="heading2" raw style={{fontSize: 28}}>
              {badge.emoji}
            </AppText>
            <AppText
              variant="caption"
              weight={badge.unlocked ? 'semibold' : 'regular'}
              className={badge.unlocked ? 'text-foreground' : 'text-neutrals400'}
              numberOfLines={2}
              style={{textAlign: 'center', marginTop: 4}}
              raw>
              {badge.name}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeItem: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
});
