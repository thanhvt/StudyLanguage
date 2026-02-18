import React from 'react';
import {View, StyleSheet} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';

// =======================
// Types
// =======================

interface WeakSound {
  /** Âm yếu */
  sound: string;
  /** Ví dụ từ */
  example: string;
  /** Điểm trung bình cho âm này */
  avgScore: number;
  /** Số lần luyện */
  attempts: number;
}

interface WeakSoundsCardProps {
  /** Top âm yếu */
  sounds: WeakSound[];
}

// =======================
// Component
// =======================

/**
 * Mục đích: Hiển thị âm phát âm yếu nhất để user tập trung cải thiện
 * Tham số đầu vào: sounds — WeakSound[]
 * Tham số đầu ra: JSX.Element — danh sách âm yếu + gợi ý
 * Khi nào sử dụng:
 *   - ProgressDashboardScreen: điểm yếu cần cải thiện
 */
export default function WeakSoundsCard({sounds}: WeakSoundsCardProps) {
  const colors = useColors();
  const speakingColor = SKILL_COLORS.speaking.dark;

  if (!sounds || sounds.length === 0) return null;

  /**
   * Mục đích: Lấy màu theo score
   * Tham số đầu vào: score (0-100)
   * Tham số đầu ra: string
   * Khi nào sử dụng: Tô màu điểm
   */
  const getScoreColor = (score: number) => {
    if (score >= 70) return '#facc15';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.surface}]}>
      <AppText variant="body" weight="semibold" className="mb-3 text-foreground" raw>
        ⚠️ Âm cần cải thiện
      </AppText>

      {sounds.map((s, i) => (
        <View
          key={s.sound}
          style={[styles.row, i < sounds.length - 1 && styles.rowBorder]}>
          <View style={[styles.soundBadge, {backgroundColor: `${getScoreColor(s.avgScore)}18`}]}>
            <AppText variant="body" weight="bold" style={{color: getScoreColor(s.avgScore)}} raw>
              /{s.sound}/
            </AppText>
          </View>

          <View style={styles.info}>
            <AppText variant="bodySmall" className="text-foreground" raw>
              vd: "{s.example}"
            </AppText>
            <AppText variant="caption" className="text-neutrals400" raw>
              {s.attempts} lần luyện
            </AppText>
          </View>

          <View style={styles.scoreArea}>
            <AppText variant="body" weight="bold" style={{color: getScoreColor(s.avgScore)}} raw>
              {s.avgScore}
            </AppText>
            <View style={[styles.miniBar, {backgroundColor: `${speakingColor}12`}]}>
              <View
                style={[
                  styles.miniBarFill,
                  {
                    width: `${s.avgScore}%`,
                    backgroundColor: getScoreColor(s.avgScore),
                  },
                ]}
              />
            </View>
          </View>
        </View>
      ))}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  rowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(150,150,150,0.12)',
  },
  soundBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  info: {
    flex: 1,
  },
  scoreArea: {
    alignItems: 'flex-end',
    minWidth: 50,
  },
  miniBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
  miniBarFill: {
    height: 4,
    borderRadius: 2,
  },
});
