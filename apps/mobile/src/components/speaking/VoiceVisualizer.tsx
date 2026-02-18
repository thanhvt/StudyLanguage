import React, {useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';

// =======================
// Constants
// =======================

/** Số thanh waveform */
const BAR_COUNT = 20;
/** Chiều rộng mỗi thanh (px) */
const BAR_WIDTH = 3;
/** Khoảng cách giữa các thanh (px) */
const BAR_GAP = 2;
/** Chiều cao tối thiểu (px) */
const MIN_HEIGHT = 4;
/** Chiều cao tối đa (px) */
const MAX_HEIGHT = 40;

// =======================
// Types
// =======================

interface VoiceVisualizerProps {
  /** Đang ghi âm hay không */
  isRecording: boolean;
  /** Mức âm lượng 0-1 (optional, dùng để scale bars) */
  audioLevel?: number;
  /** Chiều cao container */
  height?: number;
  /** Màu bars (mặc định dùng speaking color) */
  color?: string;
}

// =======================
// Sub-component: AnimatedBar
// =======================

/**
 * Mục đích: Render 1 thanh waveform animation
 * Tham số đầu vào: index, isRecording, color, audioLevel
 * Tham số đầu ra: JSX.Element (1 animated bar)
 * Khi nào sử dụng: Được VoiceVisualizer render cho mỗi bar
 */
function AnimatedBar({
  index,
  isRecording,
  color,
  audioLevel = 0.5,
}: {
  index: number;
  isRecording: boolean;
  color: string;
  audioLevel: number;
}) {
  const barHeight = useSharedValue(MIN_HEIGHT);

  useEffect(() => {
    if (isRecording) {
      // Mỗi bar có delay khác nhau → tạo hiệu ứng sóng
      const delay = (index % 5) * 60;
      const targetHeight = MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * audioLevel;

      barHeight.value = withDelay(
        delay,
        withRepeat(
          withTiming(targetHeight, {
            duration: 300 + Math.random() * 200,
            easing: Easing.inOut(Easing.ease),
          }),
          -1, // lặp vô hạn
          true, // reverse
        ),
      );
    } else {
      cancelAnimation(barHeight);
      barHeight.value = withTiming(MIN_HEIGHT, {duration: 200});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, audioLevel]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: barHeight.value,
  }));

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          backgroundColor: color,
          width: BAR_WIDTH,
          marginHorizontal: BAR_GAP / 2,
          borderRadius: BAR_WIDTH / 2,
        },
        animatedStyle,
      ]}
    />
  );
}

// =======================
// Component chính
// =======================

/**
 * Mục đích: Hiển thị waveform animation khi đang ghi âm
 * Tham số đầu vào: isRecording, audioLevel, height, color
 * Tham số đầu ra: JSX.Element — hàng các thanh waveform animated
 * Khi nào sử dụng:
 *   - PracticeScreen: khi user hold mic → hiện waveform
 *   - CoachSessionScreen: khi user đang nói → hiện waveform
 *   - ShadowingScreen: khi user đang shadow → hiện waveform
 */
export default function VoiceVisualizer({
  isRecording,
  audioLevel = 0.5,
  height = 50,
  color,
}: VoiceVisualizerProps) {
  const colors = useColors();
  const barColor = color || SKILL_COLORS.speaking.dark;

  return (
    <View style={[styles.container, {height}]}>
      {Array.from({length: BAR_COUNT}).map((_, i) => (
        <AnimatedBar
          key={i}
          index={i}
          isRecording={isRecording}
          color={barColor}
          audioLevel={audioLevel}
        />
      ))}
    </View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    minHeight: MIN_HEIGHT,
  },
});
