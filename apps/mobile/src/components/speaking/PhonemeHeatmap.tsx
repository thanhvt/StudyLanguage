import React from 'react';
import {View, StyleSheet} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';

// =======================
// Types
// =======================

interface WordScore {
  /** Từ */
  word: string;
  /** Điểm 0-100 */
  score: number;
  /** Lỗi cụ thể (nếu có) */
  issue?: string;
}

interface PhonemeHeatmapProps {
  /** Danh sách từ + điểm */
  words: WordScore[];
}

// =======================
// Helpers
// =======================

/**
 * Mục đích: Lấy màu dựa trên điểm (gradient xanh→vàng→đỏ)
 * Tham số đầu vào: score (0-100)
 * Tham số đầu ra: string — hex color
 * Khi nào sử dụng: Tô màu nền cho mỗi ô từ
 */
function getHeatColor(score: number): string {
  if (score >= 90) return '#22c55e';
  if (score >= 80) return '#4ade80';
  if (score >= 70) return '#a3e635';
  if (score >= 60) return '#facc15';
  if (score >= 50) return '#f59e0b';
  if (score >= 40) return '#fb923c';
  return '#ef4444';
}

/**
 * Mục đích: Lấy opacity dựa trên score
 * Tham số đầu vào: score (0-100)
 * Tham số đầu ra: number (0.3-1.0)
 * Khi nào sử dụng: Tô opacity cho ô heatmap
 */
function getHeatOpacity(score: number): number {
  return 0.3 + (score / 100) * 0.7;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Hiển thị heatmap phát âm từng từ (giống bảng nhiệt)
 * Tham số đầu vào: words — {word, score, issue}[]
 * Tham số đầu ra: JSX.Element — grid heatmap
 * Khi nào sử dụng:
 *   - FeedbackScreen: thay thế/bổ sung word-by-word section
 *   - ShadowingScreen: hiển thị kết quả shadow
 */
export default function PhonemeHeatmap({words}: PhonemeHeatmapProps) {
  const colors = useColors();

  if (!words || words.length === 0) return null;

  return (
    <View style={[styles.container, {backgroundColor: colors.surface}]}>
      <AppText variant="body" weight="semibold" className="mb-3 text-foreground" raw>
        🔥 Bản đồ phát âm
      </AppText>

      <View style={styles.grid}>
        {words.map((w, i) => {
          const heatColor = getHeatColor(w.score);
          return (
            <View
              key={`${w.word}-${i}`}
              style={[
                styles.cell,
                {backgroundColor: `${heatColor}${Math.round(getHeatOpacity(w.score) * 255).toString(16).padStart(2, '0')}`},
              ]}>
              <AppText
                variant="body"
                weight="medium"
                style={{color: w.score >= 60 ? '#1a1a2e' : '#FFFFFF'}}
                raw>
                {w.word}
              </AppText>
              <AppText
                variant="caption"
                weight="bold"
                style={{color: w.score >= 60 ? '#1a1a2e' : '#FFFFFF', opacity: 0.8}}
                raw>
                {w.score}
              </AppText>
            </View>
          );
        })}
      </View>

      {/* Color scale */}
      <View style={styles.scale}>
        <AppText variant="caption" className="text-neutrals400" raw>Yếu</AppText>
        <View style={styles.gradient}>
          {['#ef4444', '#fb923c', '#f59e0b', '#facc15', '#a3e635', '#4ade80', '#22c55e'].map(
            (c, i) => (
              <View key={i} style={{flex: 1, height: 6, backgroundColor: c}} />
            ),
          )}
        </View>
        <AppText variant="caption" className="text-neutrals400" raw>Tốt</AppText>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cell: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 50,
  },
  scale: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  gradient: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },
});
