import React, {useEffect, useMemo} from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

/**
 * Mục đích: Tạo các hạt sáng (orbs) bay lơ lửng làm background effect
 * Tham số đầu vào:
 *   - count: số lượng orbs (mặc định 8)
 *   - colors: mảng màu sắc cho orbs
 * Tham số đầu ra: JSX.Element - các Animated.View orbs
 * Khi nào sử dụng:
 *   - SplashScreen: tạo hiệu ứng nền sống động
 *   - LoginScreen: tái sử dụng làm background particles
 */

// Cấu hình cho từng orb
interface OrbConfig {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  moveRangeX: number;
  moveRangeY: number;
}

// Màu sắc mặc định - lấy từ skill colors
const DEFAULT_COLORS = [
  '#4ade80', // primary green
  '#6366F1', // skill listening - indigo
  '#fbbf24', // skill reading - amber
  '#22d3ee', // cyan accent
  '#f472b6', // pink accent
  '#a78bfa', // violet accent
];

/**
 * Mục đích: Tạo cấu hình ngẫu nhiên cho các orbs
 * Tham số đầu vào: count (số lượng), colors (mảng màu)
 * Tham số đầu ra: OrbConfig[] - mảng cấu hình cho từng orb
 * Khi nào sử dụng: Được gọi 1 lần khi component mount (useMemo)
 */
function generateOrbConfigs(count: number, colors: string[]): OrbConfig[] {
  return Array.from({length: count}, (_, i) => ({
    x: Math.random() * SCREEN_WIDTH * 0.8 + SCREEN_WIDTH * 0.1,
    y: Math.random() * SCREEN_HEIGHT * 0.7 + SCREEN_HEIGHT * 0.1,
    size: Math.random() * 16 + 8, // 8-24px
    color: colors[i % colors.length],
    delay: Math.random() * 2000,
    duration: 3000 + Math.random() * 4000, // 3-7s mỗi cycle
    moveRangeX: 20 + Math.random() * 40, // 20-60px di chuyển
    moveRangeY: 20 + Math.random() * 40,
  }));
}

/**
 * Mục đích: Render 1 orb riêng lẻ với animation riêng
 * Tham số đầu vào: OrbConfig
 * Tham số đầu ra: JSX.Element - 1 Animated.View tròn có glow
 * Khi nào sử dụng: Được gọi bởi FloatingOrbs cho mỗi orb
 */
function SingleOrb({config}: {config: OrbConfig}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.1);
  const scale = useSharedValue(0.6);

  useEffect(() => {
    // Animation di chuyển ngang - lặp vô hạn
    translateX.value = withDelay(
      config.delay,
      withRepeat(
        withSequence(
          withTiming(config.moveRangeX, {
            duration: config.duration,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(-config.moveRangeX, {
            duration: config.duration,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1, // lặp vô hạn
        true,
      ),
    );

    // Animation di chuyển dọc - lặp vô hạn (offset timing khác)
    translateY.value = withDelay(
      config.delay + 500,
      withRepeat(
        withSequence(
          withTiming(-config.moveRangeY, {
            duration: config.duration * 1.2,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(config.moveRangeY, {
            duration: config.duration * 1.2,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        true,
      ),
    );

    // Animation nhấp nháy opacity
    opacity.value = withDelay(
      config.delay,
      withRepeat(
        withSequence(
          withTiming(0.35, {duration: 2000, easing: Easing.inOut(Easing.sin)}),
          withTiming(0.1, {duration: 2000, easing: Easing.inOut(Easing.sin)}),
        ),
        -1,
        true,
      ),
    );

    // Animation phồng xẹp nhẹ
    scale.value = withDelay(
      config.delay + 300,
      withRepeat(
        withSequence(
          withTiming(1.2, {duration: 3000, easing: Easing.inOut(Easing.sin)}),
          withTiming(0.6, {duration: 3000, easing: Easing.inOut(Easing.sin)}),
        ),
        -1,
        true,
      ),
    );
  }, [config, translateX, translateY, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
      {scale: scale.value},
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: config.x,
          top: config.y,
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: config.color,
          // Tạo hiệu ứng glow bằng shadow
          shadowColor: config.color,
          shadowOffset: {width: 0, height: 0},
          shadowOpacity: 0.8,
          shadowRadius: config.size,
        },
        animatedStyle,
      ]}
    />
  );
}

interface FloatingOrbsProps {
  count?: number;
  colors?: string[];
}

export default function FloatingOrbs({
  count = 8,
  colors = DEFAULT_COLORS,
}: FloatingOrbsProps) {
  // Tạo cấu hình 1 lần, không re-generate
  const orbConfigs = useMemo(
    () => generateOrbConfigs(count, colors),
    [count, colors],
  );

  return (
    <>
      {orbConfigs.map((config, index) => (
        <SingleOrb key={index} config={config} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({});
