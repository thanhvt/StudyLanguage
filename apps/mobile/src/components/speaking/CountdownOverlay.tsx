import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import {AppText} from '@/components/ui';
import {SKILL_COLORS} from '@/config/skillColors';

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
  /** Câu preview hiển thị bên dưới */
  sentencePreview?: string;
}

const {width, height} = Dimensions.get('window');

// =======================
// Component
// =======================

/**
 * Mục đích: Fullscreen overlay đếm ngược 3-2-1 trước khi ghi âm
 * Tham số đầu vào: visible, from (mặc định 3), onComplete, sentencePreview
 * Tham số đầu ra: JSX.Element — overlay với số lớn animated
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
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const speakingColor = SKILL_COLORS.speaking.dark;

  useEffect(() => {
    if (!visible) {
      setCount(from);
      return;
    }

    let current = from;
    setCount(current);

    // Animation cho mỗi số
    const animateNumber = () => {
      scale.value = 0.5;
      opacity.value = 0;

      scale.value = withSequence(
        withTiming(1.2, {duration: 200, easing: Easing.out(Easing.back(1.5))}),
        withTiming(1, {duration: 150}),
      );
      opacity.value = withSequence(
        withTiming(1, {duration: 150}),
        withTiming(1, {duration: 500}),
        withTiming(0, {duration: 150}),
      );
    };

    animateNumber();

    const interval = setInterval(() => {
      current -= 1;
      if (current <= 0) {
        clearInterval(interval);
        runOnJS(onComplete)();
        return;
      }
      runOnJS(setCount)(current);
      animateNumber();
    }, 900);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, from]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      {/* Số đếm ngược lớn */}
      <Animated.View style={animatedStyle}>
        <AppText
          variant="heading1"
          weight="bold"
          style={{fontSize: 120, color: speakingColor, textAlign: 'center'}}
          raw>
          {count}
        </AppText>
      </Animated.View>

      {/* Text hướng dẫn */}
      <AppText
        variant="heading3"
        weight="semibold"
        style={{color: '#FFFFFF', marginTop: 8}}
        raw>
        SẴN SÀNG
      </AppText>

      {/* Câu preview (nếu có) */}
      {sentencePreview && (
        <View style={styles.previewCard}>
          <AppText
            variant="body"
            style={{color: '#FFFFFF', textAlign: 'center', opacity: 0.8}}
            raw>
            {sentencePreview}
          </AppText>
        </View>
      )}
    </View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  previewCard: {
    marginTop: 40,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    maxWidth: '80%',
  },
});
