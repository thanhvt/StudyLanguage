import React, {useEffect, useMemo} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';

// =======================
// Types
// =======================

interface FireworksAnimationProps {
  /** Hiển thị animation */
  visible: boolean;
}

interface Particle {
  /** Tâm nổ X (%) */
  burstX: number;
  /** Tâm nổ Y (%) */
  burstY: number;
  /** Góc bay ra (radian) */
  angle: number;
  /** Khoảng cách bay (px) */
  distance: number;
  /** Màu */
  color: string;
  /** Delay trước khi nổ (ms) */
  delay: number;
  /** Kích thước particle */
  size: number;
}

const {width: SCREEN_W, height: SCREEN_H} = Dimensions.get('window');

// Màu pháo hoa rực rỡ
const FIREWORK_COLORS = [
  '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF',
  '#FF69B4', '#00CED1', '#FF8C00', '#DA70D6',
  '#FFD700', '#00FF7F', '#FF4500', '#7B68EE',
];

// Số điểm nổ (bursts) và số particle mỗi burst
const NUM_BURSTS = 5;
const PARTICLES_PER_BURST = 12;

/**
 * Mục đích: Tạo danh sách particle cho hiệu ứng pháo hoa
 * Tham số đầu vào: không có
 * Tham số đầu ra: Particle[] — danh sách particles với tọa độ, góc, màu random
 * Khi nào sử dụng: Khởi tạo FireworksAnimation component
 */
function generateParticles(): Particle[] {
  const particles: Particle[] = [];

  for (let burst = 0; burst < NUM_BURSTS; burst++) {
    // Mỗi burst có tâm nổ random
    const burstX = 15 + Math.random() * 70; // 15-85% width
    const burstY = 10 + Math.random() * 50; // 10-60% height
    const burstDelay = burst * 500 + Math.random() * 300; // Nổ lần lượt
    const burstColorBase = Math.floor(Math.random() * FIREWORK_COLORS.length);

    for (let p = 0; p < PARTICLES_PER_BURST; p++) {
      const angle = (p / PARTICLES_PER_BURST) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      particles.push({
        burstX,
        burstY,
        angle,
        distance: 40 + Math.random() * 80,
        color: FIREWORK_COLORS[(burstColorBase + p) % FIREWORK_COLORS.length],
        delay: burstDelay + Math.random() * 100,
        size: 3 + Math.random() * 4,
      });
    }
  }

  return particles;
}

// =======================
// Single Particle
// =======================

/**
 * Mục đích: Render 1 particle pháo hoa bay ra từ tâm nổ
 * Tham số đầu vào: particle (Particle)
 * Tham số đầu ra: JSX.Element — Animated View
 * Khi nào sử dụng: Được render bên trong FireworksAnimation
 */
function FireworkParticle({particle}: {particle: Particle}) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Nổ: opacity 0 → 1, rồi bay ra + fade out
    opacity.value = withDelay(
      particle.delay,
      withSequence(
        withTiming(1, {duration: 100}),
        withDelay(600, withTiming(0, {duration: 800})),
      ),
    );
    progress.value = withDelay(
      particle.delay,
      withTiming(1, {duration: 1200, easing: Easing.out(Easing.cubic)}),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tọa độ tâm nổ tính theo px
  const centerX = (particle.burstX / 100) * SCREEN_W;
  const centerY = (particle.burstY / 100) * SCREEN_H;

  const animStyle = useAnimatedStyle(() => {
    const dx = Math.cos(particle.angle) * particle.distance * progress.value;
    const dy = Math.sin(particle.angle) * particle.distance * progress.value;
    // Trọng lực nhẹ
    const gravity = progress.value * progress.value * 30;

    return {
      transform: [
        {translateX: centerX + dx - particle.size / 2},
        {translateY: centerY + dy + gravity - particle.size / 2},
        // Thu nhỏ dần
        {scale: interpolate(progress.value, [0, 0.3, 1], [0, 1.2, 0.3])},
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 0,
          top: 0,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
          // Glow effect
          shadowColor: particle.color,
          shadowOffset: {width: 0, height: 0},
          shadowOpacity: 0.8,
          shadowRadius: 4,
        },
        animStyle,
      ]}
    />
  );
}

// =======================
// Trail Line (đường bay lên trước khi nổ)
// =======================

/**
 * Mục đích: Render đường sáng bay lên trước khi pháo hoa nổ
 * Tham số đầu vào: burstX, burstY (%), delay (ms), color
 * Tham số đầu ra: JSX.Element — Animated trail line
 * Khi nào sử dụng: Từng burst có 1 trail bay lên
 */
function TrailLine({burstX, burstY, delay, color}: {burstX: number; burstY: number; delay: number; color: string}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    // Bay lên trước burst delay
    const trailStart = Math.max(0, delay - 400);
    progress.value = withDelay(
      trailStart,
      withSequence(
        withTiming(1, {duration: 400, easing: Easing.out(Easing.quad)}),
        withTiming(0, {duration: 100}),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const endX = (burstX / 100) * SCREEN_W;
  const endY = (burstY / 100) * SCREEN_H;
  const startY = SCREEN_H + 20;

  const animStyle = useAnimatedStyle(() => {
    const currentY = interpolate(progress.value, [0, 1], [startY, endY]);
    return {
      transform: [
        {translateX: endX - 1},
        {translateY: currentY},
      ],
      opacity: interpolate(progress.value, [0, 0.2, 0.8, 1], [0, 1, 0.8, 0]),
      height: interpolate(progress.value, [0, 0.5, 1], [0, 20, 4]),
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 0,
          top: 0,
          width: 2,
          borderRadius: 1,
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: {width: 0, height: 0},
          shadowOpacity: 0.6,
          shadowRadius: 3,
        },
        animStyle,
      ]}
    />
  );
}

// =======================
// Component
// =======================

/**
 * Mục đích: Animation pháo hoa khi user đạt điểm >= 85
 * Tham số đầu vào: visible (boolean)
 * Tham số đầu ra: JSX.Element — overlay pháo hoa nổ
 * Khi nào sử dụng:
 *   - FeedbackScreen: khi overallScore >= 85 → trigger fireworks
 */
export default function FireworksAnimation({visible}: FireworksAnimationProps) {
  const particles = useMemo(() => generateParticles(), []);

  // Tạo danh sách bursts unique cho trail lines
  const bursts = useMemo(() => {
    const seen = new Map<string, {burstX: number; burstY: number; delay: number; color: string}>();
    particles.forEach(p => {
      const key = `${p.burstX.toFixed(1)}-${p.burstY.toFixed(1)}`;
      if (!seen.has(key)) {
        seen.set(key, {burstX: p.burstX, burstY: p.burstY, delay: p.delay, color: p.color});
      }
    });
    return Array.from(seen.values());
  }, [particles]);

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      {/* Trail lines — bay lên trước */}
      {bursts.map((burst, i) => (
        <TrailLine
          key={`trail-${i}`}
          burstX={burst.burstX}
          burstY={burst.burstY}
          delay={burst.delay}
          color={burst.color}
        />
      ))}
      {/* Particles — nổ ra */}
      {particles.map((particle, i) => (
        <FireworkParticle key={`fw-${i}`} particle={particle} />
      ))}
    </View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    pointerEvents: 'none',
  },
});
