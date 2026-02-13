import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';

// Số thanh waveform
const BAR_COUNT = 5;

interface WaveformVisualizerProps {
  /** Đang phát audio hay không */
  isPlaying: boolean;
  /** Màu thanh waveform (primary color) */
  color?: string;
  /** Chiều cao tối đa (px) */
  height?: number;
}

/**
 * Mục đích: Hiệu ứng waveform animation đồng bộ trạng thái audio
 * Tham số đầu vào: isPlaying (boolean), color, height
 * Tham số đầu ra: JSX.Element — 5 thanh bar animated
 * Khi nào sử dụng: PlayerScreen → hiện bên cạnh progress bar khi đang phát
 *   - isPlaying = true → 5 bars nhún lên xuống ngẫu nhiên
 *   - isPlaying = false → bars tĩnh (chiều cao thấp)
 */
export default function WaveformVisualizer({
  isPlaying,
  color = '#10b981',
  height = 24,
}: WaveformVisualizerProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        height,
        gap: 2,
      }}>
      {Array.from({length: BAR_COUNT}, (_, i) => (
        <WaveformBar
          key={i}
          index={i}
          isPlaying={isPlaying}
          color={color}
          maxHeight={height}
        />
      ))}
    </View>
  );
}

// ============================================
// WaveformBar — Từng thanh riêng lẻ có animation riêng
// ============================================

interface WaveformBarProps {
  index: number;
  isPlaying: boolean;
  color: string;
  maxHeight: number;
}

/**
 * Mục đích: Render 1 thanh waveform với animation nhún lên/xuống
 * Tham số đầu vào: index (để tạo delay khác nhau), isPlaying, color, maxHeight
 * Tham số đầu ra: Animated.View — 1 bar
 * Khi nào sử dụng: WaveformVisualizer render BAR_COUNT thanh này
 */
function WaveformBar({index, isPlaying, color, maxHeight}: WaveformBarProps) {
  const barHeight = useSharedValue(4);

  // Chiều cao tĩnh khi pause — mỗi bar khác nhau cho đẹp
  const staticHeights = [0.3, 0.5, 0.4, 0.6, 0.35];
  const staticH = maxHeight * staticHeights[index % staticHeights.length];

  // Thời gian nhún khác nhau tạo hiệu ứng tự nhiên
  const durations = [400, 350, 450, 380, 420];
  const delays = [0, 80, 40, 120, 60];

  useEffect(() => {
    if (isPlaying) {
      // Nhún lên xuống liên tục
      const minH = maxHeight * 0.15;
      const maxH = maxHeight * 0.9;
      barHeight.value = withDelay(
        delays[index % delays.length],
        withRepeat(
          withSequence(
            withTiming(maxH, {
              duration: durations[index % durations.length],
              easing: Easing.bezier(0.4, 0, 0.2, 1),
            }),
            withTiming(minH, {
              duration: durations[index % durations.length],
              easing: Easing.bezier(0.4, 0, 0.2, 1),
            }),
          ),
          -1, // Lặp vô hạn
          true, // Reverse
        ),
      );
    } else {
      // Về trạng thái tĩnh
      barHeight.value = withTiming(staticH, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [isPlaying, maxHeight, barHeight, index, staticH]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: barHeight.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 3,
          borderRadius: 2,
          backgroundColor: color,
          opacity: isPlaying ? 1 : 0.5,
        },
        animatedStyle,
      ]}
    />
  );
}
