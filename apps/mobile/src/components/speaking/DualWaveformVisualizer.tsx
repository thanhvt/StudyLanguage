import React, {useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';

// =======================
// Constants
// =======================

/** Số thanh trong mỗi track */
const BAR_COUNT = 24;
/** Chiều rộng mỗi thanh */
const BAR_WIDTH = 3;
/** Khoảng cách thanh */
const BAR_GAP = 1.5;

// =======================
// Types
// =======================

interface DualWaveformVisualizerProps {
  /** Dữ liệu amplitude AI (0-1) — real-time hoặc pre-calculated */
  aiData: number[];
  /** Dữ liệu amplitude User (0-1) — real-time từ mic metering */
  userData: number[];
  /** AI đang phát */
  isAIPlaying: boolean;
  /** User đang ghi âm */
  isUserRecording: boolean;
  /** Chiều cao mỗi track (px) */
  trackHeight?: number;
  /** Màu track AI — mặc định purple-pink */
  aiColor?: string;
  /** Màu track User — mặc định green */
  userColor?: string;
}

// =======================
// Sub-component: AnimatedBar
// =======================

/**
 * Mục đích: Render 1 thanh waveform với animation
 * Tham số đầu vào: index, isActive, color, amplitude, maxHeight
 * Tham số đầu ra: Animated.View — 1 bar
 * Khi nào sử dụng: DualWaveformVisualizer render BAR_COUNT bars cho mỗi track
 */
function AnimatedBar({
  index,
  isActive,
  color,
  amplitude,
  maxHeight,
}: {
  index: number;
  isActive: boolean;
  color: string;
  amplitude: number;
  maxHeight: number;
}) {
  const barHeight = useSharedValue(4);

  // Timing khác nhau cho mỗi bar → hiệu ứng tự nhiên
  const durations = [350, 400, 320, 430, 380, 410, 340, 450, 360, 420, 330, 440, 370, 390, 310, 460, 380, 400, 350, 430, 370, 410, 340, 450];

  useEffect(() => {
    if (isActive && amplitude > 0.05) {
      // Scale amplitude thành chiều cao
      const targetH = Math.max(4, amplitude * maxHeight * 0.9);
      barHeight.value = withDelay(
        (index % 6) * 30, // Delay lệch nhau
        withRepeat(
          withSequence(
            withTiming(targetH, {
              duration: durations[index % durations.length],
              easing: Easing.bezier(0.4, 0, 0.2, 1),
            }),
            withTiming(targetH * 0.3, {
              duration: durations[index % durations.length],
              easing: Easing.bezier(0.4, 0, 0.2, 1),
            }),
          ),
          -1,
          true,
        ),
      );
    } else {
      cancelAnimation(barHeight);
      barHeight.value = withTiming(4, {duration: 200});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, amplitude]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: barHeight.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: BAR_WIDTH,
          borderRadius: BAR_WIDTH / 2,
          backgroundColor: color,
          opacity: isActive ? 1 : 0.3,
          marginHorizontal: BAR_GAP / 2,
        },
        animatedStyle,
      ]}
    />
  );
}

// =======================
// Component
// =======================

/**
 * Mục đích: Dual waveform visualization — AI track (trên) + User track (dưới)
 * Tham số đầu vào: aiData, userData, isAIPlaying, isUserRecording, trackHeight, colors
 * Tham số đầu ra: JSX.Element — 2 waveform tracks với legend
 * Khi nào sử dụng:
 *   - ShadowingSessionScreen Phase 2 (Shadow): hiển thị song song AI + User waveform
 *   - ShadowingFeedbackScreen: so sánh waveform overlay
 */
export default function DualWaveformVisualizer({
  aiData,
  userData,
  isAIPlaying,
  isUserRecording,
  trackHeight = 50,
  aiColor = '#E879F9', // Purple-pink
  userColor = '#4ADE80', // Green
}: DualWaveformVisualizerProps) {
  const colors = useColors();

  /**
   * Mục đích: Lấy amplitude cho thanh thứ i từ data array
   * Tham số đầu vào: data (number[]), barIndex (number)
   * Tham số đầu ra: number (0-1)
   * Khi nào sử dụng: Map data array sang BAR_COUNT bars
   */
  const getAmplitude = (data: number[], barIndex: number): number => {
    if (data.length === 0) return 0;
    // Map barIndex → data index (resampling)
    const dataIndex = Math.floor((barIndex / BAR_COUNT) * data.length);
    return data[Math.min(dataIndex, data.length - 1)] ?? 0;
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.surface}]}>
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, {backgroundColor: aiColor}]} />
          <AppText
            variant="caption"
            style={{color: colors.neutrals400}}
            raw>
            AI mẫu
          </AppText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, {backgroundColor: userColor}]} />
          <AppText
            variant="caption"
            style={{color: colors.neutrals400}}
            raw>
            Bạn
          </AppText>
        </View>
      </View>

      {/* AI Track (trên) — bars hướng xuống */}
      <View
        style={[
          styles.track,
          {height: trackHeight, justifyContent: 'flex-end'},
        ]}>
        {Array.from({length: BAR_COUNT}).map((_, i) => (
          <AnimatedBar
            key={`ai-${i}`}
            index={i}
            isActive={isAIPlaying}
            color={aiColor}
            amplitude={getAmplitude(aiData, i)}
            maxHeight={trackHeight}
          />
        ))}
      </View>

      {/* Divider */}
      <View
        style={[
          styles.divider,
          {backgroundColor: colors.glassDivider},
        ]}
      />

      {/* User Track (dưới) — bars hướng lên */}
      <View
        style={[
          styles.track,
          {height: trackHeight, justifyContent: 'flex-start'},
        ]}>
        {Array.from({length: BAR_COUNT}).map((_, i) => (
          <AnimatedBar
            key={`user-${i}`}
            index={i}
            isActive={isUserRecording}
            color={userColor}
            amplitude={getAmplitude(userData, i)}
            maxHeight={trackHeight}
          />
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
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    marginVertical: 4,
    opacity: 0.3,
  },
});
