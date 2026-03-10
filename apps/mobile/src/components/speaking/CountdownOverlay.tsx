import React, {useEffect, useState, useRef} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSequence,
  withSpring,
  withRepeat,
  Easing,
  runOnJS,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import Svg, {Circle, Defs, RadialGradient, Stop, Rect} from 'react-native-svg';
import {AppText} from '@/components/ui';
import {SKILL_COLORS} from '@/config/skillColors';
import LinearGradient from 'react-native-linear-gradient';

// =======================
// Types
// =======================

interface CountdownOverlayProps {
  /** Bắt đầu đếm ngược */
  visible: boolean;
  /** Đếm từ bao nhiêu (mặc định 3) */
  from?: number;
  /** Callback khi đếm xong */
  onComplete: () => void;
  /** Câu preview hiển thị bên trên — centered */
  sentencePreview?: string;
}

const {width, height} = Dimensions.get('window');

// Kích thước vòng tròn progress
const RING_SIZE = 200;
const RING_STROKE = 5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Inner glow ring
const INNER_RING_SIZE = RING_SIZE - 30;
const INNER_RING_RADIUS = (INNER_RING_SIZE - 3) / 2;
const INNER_RING_CIRCUMFERENCE = 2 * Math.PI * INNER_RING_RADIUS;

// Animated Circle
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// =======================
// Component
// =======================

/**
 * Mục đích: Fullscreen overlay đếm ngược 3-2-1 trước khi ghi âm
 *   — Phiên bản v3: double-ring glow, particle pulse, glassmorphism card
 * Tham số đầu vào: visible, from (mặc định 3), onComplete, sentencePreview
 * Tham số đầu ra: JSX.Element — overlay với vòng tròn progress animated
 * Khi nào sử dụng:
 *   - PracticeScreen: trước khi bắt đầu recording → hiện countdown
 *   - ShadowingScreen: trước khi bắt đầu shadow → hiện countdown
 */
export default function CountdownOverlay({
  visible,
  from = 3,
  onComplete,
  sentencePreview,
}: CountdownOverlayProps) {
  const [count, setCount] = useState(from);
  const speakingColor = SKILL_COLORS.speaking.dark; // #4ade80

  // Animation values
  const numberScale = useSharedValue(0.5);
  const numberOpacity = useSharedValue(0);
  const ringProgress = useSharedValue(0); // 0→1 mỗi giây
  const innerRingProgress = useSharedValue(0);
  const glowPulse = useSharedValue(0); // 0→1 liên tục
  const overlayOpacity = useSharedValue(0);
  const cardSlideY = useSharedValue(-30);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      setCount(from);
      overlayOpacity.value = 0;
      cardOpacity.value = 0;
      return;
    }

    // Fade-in overlay + slide-in card
    overlayOpacity.value = withTiming(1, {duration: 250});
    cardOpacity.value = withTiming(1, {duration: 400, easing: Easing.out(Easing.cubic)});
    cardSlideY.value = withSpring(0, {damping: 15, stiffness: 120});

    // Glow pulse — breathing effect liên tục
    glowPulse.value = 0;
    glowPulse.value = withRepeat(
      withTiming(1, {duration: 1200, easing: Easing.inOut(Easing.sin)}),
      -1,
      true,
    );

    let current = from;
    setCount(current);

    // Animation cho mỗi số
    const animateNumber = () => {
      numberScale.value = 0.2;
      numberOpacity.value = 0;

      // Số — spring bounce vào mạnh hơn
      numberScale.value = withSpring(1, {
        damping: 10,
        stiffness: 250,
        mass: 0.6,
      });
      numberOpacity.value = withSequence(
        withTiming(1, {duration: 100}),
        withTiming(1, {duration: 550}),
        withTiming(0.3, {duration: 150}),
      );

      // Ring progress — outer: 0→1 trong 850ms
      ringProgress.value = 0;
      ringProgress.value = withTiming(1, {
        duration: 850,
        easing: Easing.linear,
      });

      // Inner ring — delay 100ms, slightly faster
      innerRingProgress.value = 0;
      setTimeout(() => {
        innerRingProgress.value = withTiming(1, {
          duration: 750,
          easing: Easing.out(Easing.cubic),
        });
      }, 100);
    };

    animateNumber();

    const interval = setInterval(() => {
      current -= 1;
      if (current <= 0) {
        clearInterval(interval);
        // Zoom-out effect trước khi gọi onComplete
        numberScale.value = withTiming(2, {duration: 200});
        numberOpacity.value = withTiming(0, {duration: 200});
        overlayOpacity.value = withTiming(0, {duration: 250}, () => {
          runOnJS(onComplete)();
        });
        return;
      }
      runOnJS(setCount)(current);
      animateNumber();
    }, 900);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, from]);

  // Animated styles
  const numberAnimStyle = useAnimatedStyle(() => ({
    transform: [{scale: numberScale.value}],
    opacity: numberOpacity.value,
  }));

  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{translateY: cardSlideY.value}],
  }));

  // Outer glow — breathing pulse
  const glowAnimStyle = useAnimatedStyle(() => {
    const scale = interpolate(glowPulse.value, [0, 1], [0.95, 1.1]);
    const opacity = interpolate(glowPulse.value, [0, 1], [0.15, 0.35]);
    return {
      opacity,
      transform: [{scale}],
    };
  });

  // Ring progress animated props
  const outerRingProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - ringProgress.value),
  }));

  const innerRingProps = useAnimatedProps(() => ({
    strokeDashoffset: INNER_RING_CIRCUMFERENCE * (1 - innerRingProgress.value),
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, overlayAnimStyle]}>
      {/* ======================== */}
      {/* Green ambient gradient — background glow */}
      {/* ======================== */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={['#14532D40', '#16A34A20', 'transparent', '#22C55E10', '#14532D30']}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          style={StyleSheet.absoluteFill}
        />
        {/* Radial glow center */}
        <LinearGradient
          colors={['#22C55E18', 'transparent']}
          start={{x: 0.5, y: 0.35}}
          end={{x: 0.5, y: 0.75}}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* ======================== */}
      {/* Sentence Preview Card — glassmorphism (phía trên, text căn giữa) */}
      {/* ======================== */}
      {sentencePreview && (
        <Animated.View style={[styles.previewCard, cardAnimStyle]}>
          <AppText
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#FFFFFF',
              lineHeight: 28,
              textAlign: 'center',
            }}>
            {sentencePreview}
          </AppText>
        </Animated.View>
      )}

      {/* ======================== */}
      {/* COUNTDOWN RING — double ring + glow + number */}
      {/* ======================== */}
      <View style={styles.ringContainer}>
        {/* Green glow behind ring — breathing pulse */}
        <Animated.View style={[styles.ringGlow, glowAnimStyle]} />

        {/* SVG Double Ring */}
        <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
          {/* ---- Outer ring ---- */}
          {/* Track nền */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={RING_STROKE}
          />
          {/* Progress animated */}
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke={speakingColor}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            animatedProps={outerRingProps}
            rotation="-90"
            origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
          />

          {/* ---- Inner ring (dimmer, thinner) ---- */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={INNER_RING_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={2}
          />
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={INNER_RING_RADIUS}
            fill="none"
            stroke={`${speakingColor}80`}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={INNER_RING_CIRCUMFERENCE}
            animatedProps={innerRingProps}
            rotation="-90"
            origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
          />

          {/* Outer decorative glow ring */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS + 10}
            fill="none"
            stroke={`${speakingColor}10`}
            strokeWidth={1.5}
          />
        </Svg>

        {/* Số countdown — giữa vòng tròn */}
        <Animated.View style={[styles.numberContainer, numberAnimStyle]}>
          <AppText
            style={{
              fontSize: 80,
              fontWeight: '800',
              color: '#FFFFFF',
              textAlign: 'center',
              includeFontPadding: false,
            }}>
            {count}
          </AppText>
        </Animated.View>
      </View>

      {/* ======================== */}
      {/* "Get ready..." text */}
      {/* ======================== */}
      <AppText
        style={{
          fontSize: 17,
          fontWeight: '600',
          color: speakingColor,
          marginTop: 24,
          letterSpacing: 0.5,
        }}>
        Get ready...
      </AppText>
    </Animated.View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.93)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  previewCard: {
    position: 'absolute',
    top: height * 0.11,
    left: 28,
    right: 28,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  ringContainer: {
    width: RING_SIZE + 50,
    height: RING_SIZE + 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringGlow: {
    position: 'absolute',
    width: RING_SIZE + 80,
    height: RING_SIZE + 80,
    borderRadius: (RING_SIZE + 80) / 2,
    backgroundColor: '#22C55E',
  },
  ringSvg: {
    position: 'absolute',
    top: 25,
    left: 25,
  },
  numberContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
