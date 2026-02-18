import React, {useEffect} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

// =======================
// Types
// =======================

interface ConfettiAnimationProps {
  /** Hiển thị animation */
  visible: boolean;
  /** Thời gian hiển thị (ms) — mặc định 3000 */
  duration?: number;
}

interface ConfettiPiece {
  /** Vị trí X ban đầu (%) */
  x: number;
  /** Màu */
  color: string;
  /** Delay (ms) */
  delay: number;
  /** Kích thước */
  size: number;
}

const {width, height} = Dimensions.get('window');

const CONFETTI_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#F7DC6F',
  '#BB8FCE', '#82E0AA', '#F0B27A', '#FF69B4',
  '#00CED1', '#FFD700',
];

/**
 * Mục đích: Tạo danh sách confetti pieces random
 * Tham số đầu vào: count (number)
 * Tham số đầu ra: ConfettiPiece[]
 * Khi nào sử dụng: Khởi tạo component
 */
function generatePieces(count: number): ConfettiPiece[] {
  return Array.from({length: count}, (_, i) => ({
    x: Math.random() * 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: Math.random() * 600,
    size: 6 + Math.random() * 6,
  }));
}

// =======================
// Single Confetti Piece
// =======================

function Piece({piece}: {piece: ConfettiPiece}) {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      piece.delay,
      withTiming(height + 50, {duration: 2500, easing: Easing.linear}),
    );
    translateX.value = withDelay(
      piece.delay,
      withSequence(
        withTiming(30, {duration: 500}),
        withTiming(-30, {duration: 500}),
        withTiming(20, {duration: 500}),
        withTiming(-10, {duration: 500}),
        withTiming(0, {duration: 500}),
      ),
    );
    rotate.value = withDelay(
      piece.delay,
      withTiming(720, {duration: 2500}),
    );
    opacity.value = withDelay(
      2000 + piece.delay,
      withTiming(0, {duration: 500}),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      {translateY: translateY.value},
      {translateX: translateX.value},
      {rotate: `${rotate.value}deg`},
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: `${piece.x}%`,
          top: -20,
          width: piece.size,
          height: piece.size,
          backgroundColor: piece.color,
          borderRadius: piece.size > 9 ? 2 : piece.size / 2,
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
 * Mục đích: Animation confetti khi user đạt điểm cao
 * Tham số đầu vào: visible, duration (mặc định 3000ms)
 * Tham số đầu ra: JSX.Element — overlay confetti rơi
 * Khi nào sử dụng:
 *   - FeedbackScreen: khi overallScore >= 80 → trigger confetti
 *   - ShadowingScreen: hoàn tất shadow với điểm tốt
 */
export default function ConfettiAnimation({
  visible,
  duration = 3000,
}: ConfettiAnimationProps) {
  const pieces = React.useMemo(() => generatePieces(30), []);

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      {pieces.map((piece, i) => (
        <Piece key={i} piece={piece} />
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
