/**
 * TrackPulse — Hiệu ứng pulse cho track đang phát
 *
 * Mục đích: T-28 — Animated pulse ring quanh track icon để chỉ báo đang phát
 * Tham số đầu vào: isActive (đang phát hay không), size (kích thước)
 * Tham số đầu ra: JSX.Element — wrapping content với pulse rings
 * Khi nào sử dụng: RadioScreen track item / NowPlayingBar
 */
import React, {useEffect, useRef} from 'react';
import {Animated, View, Easing} from 'react-native';
import {LISTENING_BLUE} from '@/constants/listening';

/**
 * Mục đích: Component pulse animation bao quanh children
 * Tham số đầu vào: isActive, size, children
 * Tham số đầu ra: JSX.Element — pulse rings + children
 * Khi nào sử dụng: Wrap quanh track icon trong RadioScreen
 */
export default function TrackPulse({
  isActive,
  size = 40,
  children,
}: {
  isActive: boolean;
  size?: number;
  children: React.ReactNode;
}) {
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isActive) {
      pulse1.setValue(0);
      pulse2.setValue(0);
      return;
    }

    const createPulse = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );

    const a1 = createPulse(pulse1, 0);
    const a2 = createPulse(pulse2, 500);
    a1.start();
    a2.start();

    return () => {
      a1.stop();
      a2.stop();
    };
  }, [isActive, pulse1, pulse2]);

  const scale1 = pulse1.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.6],
  });
  const opacity1 = pulse1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0],
  });
  const scale2 = pulse2.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.4],
  });
  const opacity2 = pulse2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0],
  });

  return (
    <View style={{width: size, height: size, alignItems: 'center', justifyContent: 'center'}}>
      {isActive && (
        <>
          <Animated.View
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: LISTENING_BLUE,
              transform: [{scale: scale1}],
              opacity: opacity1,
            }}
          />
          <Animated.View
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: LISTENING_BLUE,
              transform: [{scale: scale2}],
              opacity: opacity2,
            }}
          />
        </>
      )}
      {children}
    </View>
  );
}
