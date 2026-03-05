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

// Số thanh waveform — 16 thanh cho hiệu ứng đầy đặn giống mockup
const BAR_COUNT = 16;

// Màu mặc định cho 2 nửa waveform (xanh + cam)
const DEFAULT_COLOR_LEFT = '#2563EB';
const DEFAULT_COLOR_RIGHT = '#F97316';

interface WaveformVisualizerProps {
  /** Đang phát audio hay không */
  isPlaying: boolean;
  /** Màu nửa trái (mặc định: xanh) */
  colorLeft?: string;
  /** Màu nửa phải (mặc định: cam) */
  colorRight?: string;
  /** Chiều cao tối đa (px) */
  height?: number;
}

/**
 * Mục đích: Hiệu ứng waveform animation đồng bộ trạng thái audio
 * Tham số đầu vào: isPlaying (boolean), colorLeft, colorRight, height
 * Tham số đầu ra: JSX.Element — 16 thanh bar animated xanh/cam
 * Khi nào sử dụng: PlayerScreen → hiện trong control panel glassmorphism
 *   - isPlaying = true → bars nhún lên xuống ngẫu nhiên
 *   - isPlaying = false → bars tĩnh (chiều cao thấp)
 */
export default function WaveformVisualizer({
  isPlaying,
  colorLeft = DEFAULT_COLOR_LEFT,
  colorRight = DEFAULT_COLOR_RIGHT,
  height = 36,
}: WaveformVisualizerProps) {
  // Nửa đầu xanh, nửa sau cam
  const halfPoint = Math.floor(BAR_COUNT / 2);

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
          color={i < halfPoint ? colorLeft : colorRight}
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

  // Chiều cao tĩnh khi pause — mỗi bar khác nhau cho tự nhiên
  const staticHeights = [0.25, 0.4, 0.55, 0.35, 0.6, 0.3, 0.5, 0.45, 0.55, 0.35, 0.65, 0.4, 0.5, 0.3, 0.45, 0.55];
  const staticH = maxHeight * staticHeights[index % staticHeights.length];

  // Thời gian nhún khác nhau cho hiệu ứng tự nhiên, không đều
  const durations = [380, 420, 350, 460, 400, 440, 370, 410, 390, 430, 360, 450, 380, 420, 340, 470];
  const delays = [0, 60, 30, 90, 20, 70, 40, 100, 10, 80, 50, 110, 25, 75, 45, 95];

  useEffect(() => {
    if (isPlaying) {
      // Nhún lên xuống liên tục
      const minH = maxHeight * 0.12;
      const maxH = maxHeight * 0.92;
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
