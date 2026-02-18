import React from 'react';
import {View, StyleSheet} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';

// =======================
// Types
// =======================

interface WaveformComparisonProps {
  /** Dữ liệu waveform AI mẫu (normalised 0-1) */
  aiWaveform: number[];
  /** Dữ liệu waveform user (normalised 0-1) */
  userWaveform: number[];
  /** Chiều cao chart */
  height?: number;
}

const BAR_WIDTH = 3;
const BAR_GAP = 1;

// =======================
// Component
// =======================

/**
 * Mục đích: So sánh waveform AI mẫu vs User recording
 * Tham số đầu vào: aiWaveform, userWaveform (mảng 0-1), height
 * Tham số đầu ra: JSX.Element — 2 waveform chồng lên nhau
 * Khi nào sử dụng:
 *   - ShadowingScreen: hiển thị sau khi user hoàn tất shadow
 *   - FeedbackScreen: so sánh visual pronunciation
 */
export default function WaveformComparison({
  aiWaveform,
  userWaveform,
  height = 60,
}: WaveformComparisonProps) {
  const colors = useColors();
  const speakingColor = SKILL_COLORS.speaking.dark;

  // Chuẩn hoá số lượng bars bằng nhau
  const maxBars = Math.max(aiWaveform.length, userWaveform.length, 1);
  const resample = (data: number[], target: number) => {
    if (data.length === 0) return Array(target).fill(0.1);
    if (data.length === target) return data;
    const result: number[] = [];
    for (let i = 0; i < target; i++) {
      const idx = (i / target) * data.length;
      const low = Math.floor(idx);
      const high = Math.min(low + 1, data.length - 1);
      const frac = idx - low;
      result.push(data[low] * (1 - frac) + data[high] * frac);
    }
    return result;
  };

  const aiBars = resample(aiWaveform, maxBars);
  const userBars = resample(userWaveform, maxBars);

  return (
    <View style={[styles.container, {backgroundColor: colors.surface}]}>
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, {backgroundColor: speakingColor}]} />
          <AppText variant="caption" className="text-neutrals400" raw>AI mẫu</AppText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, {backgroundColor: '#60A5FA'}]} />
          <AppText variant="caption" className="text-neutrals400" raw>Bạn</AppText>
        </View>
      </View>

      {/* Waveforms overlay */}
      <View style={[styles.waveformArea, {height}]}>
        {/* AI waveform (trên) */}
        <View style={[styles.waveformRow, {height: height / 2}]}>
          {aiBars.map((val, i) => (
            <View
              key={`ai-${i}`}
              style={{
                width: BAR_WIDTH,
                height: Math.max(2, val * (height / 2)),
                backgroundColor: speakingColor,
                borderRadius: 1,
                opacity: 0.7,
                alignSelf: 'flex-end',
              }}
            />
          ))}
        </View>
        {/* User waveform (dưới — lật) */}
        <View style={[styles.waveformRow, {height: height / 2}]}>
          {userBars.map((val, i) => (
            <View
              key={`user-${i}`}
              style={{
                width: BAR_WIDTH,
                height: Math.max(2, val * (height / 2)),
                backgroundColor: '#60A5FA',
                borderRadius: 1,
                opacity: 0.7,
                alignSelf: 'flex-start',
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  waveformArea: {
    flexDirection: 'column',
    overflow: 'hidden',
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: BAR_GAP,
  },
});
