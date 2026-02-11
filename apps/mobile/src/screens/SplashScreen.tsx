import React, {useEffect} from 'react';
import {View, Dimensions, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {AppText} from '@/components/ui';
import FloatingOrbs from '@/components/auth/FloatingOrbs';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// Các emoji skill nhảy múa
const DANCING_EMOJIS = ['🎧', '🗣️', '📖', '✨', '🌟'];

/**
 * Mục đích: Component emoji nhảy bounce riêng lẻ
 * Tham số đầu vào: emoji (string), delay (ms), index (vị trí)
 * Tham số đầu ra: JSX.Element - Animated emoji với bounce effect
 * Khi nào sử dụng: Hiển thị xung quanh logo trên SplashScreen
 */
function DancingEmoji({
  emoji,
  delay,
  angle,
  radius,
}: {
  emoji: string;
  delay: number;
  angle: number;
  radius: number;
}) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    // Hiện ra với bounce
    opacity.value = withDelay(delay, withSpring(1, {damping: 8}));
    scale.value = withDelay(
      delay,
      withSpring(1, {damping: 6, stiffness: 120}),
    );

    // Nhảy lên xuống liên tục - hiệu ứng "dancing"
    translateY.value = withDelay(
      delay + 300,
      withRepeat(
        withSequence(
          withTiming(-12, {duration: 400, easing: Easing.out(Easing.quad)}),
          withTiming(0, {duration: 400, easing: Easing.in(Easing.bounce)}),
          withTiming(-8, {duration: 300, easing: Easing.out(Easing.quad)}),
          withTiming(0, {duration: 300, easing: Easing.in(Easing.bounce)}),
          withTiming(0, {duration: 600}), // Nghỉ một chút
        ),
        -1,
        false,
      ),
    );

    // Xoay nhẹ qua lại
    rotate.value = withDelay(
      delay + 200,
      withRepeat(
        withSequence(
          withTiming(15, {duration: 500, easing: Easing.inOut(Easing.sin)}),
          withTiming(-15, {duration: 500, easing: Easing.inOut(Easing.sin)}),
          withTiming(0, {duration: 400}),
        ),
        -1,
        false,
      ),
    );
  }, [delay, translateY, opacity, scale, rotate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateY: translateY.value},
      {scale: scale.value},
      {rotate: `${rotate.value}deg`},
    ],
    opacity: opacity.value,
  }));

  // Tính vị trí xung quanh logo dựa trên góc
  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const y = Math.sin((angle * Math.PI) / 180) * radius;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x - 16,
          top: y - 16,
        },
        animatedStyle,
      ]}>
      <AppText className="text-2xl">{emoji}</AppText>
    </Animated.View>
  );
}

/**
 * Mục đích: Màn hình chờ khi khởi động app, hiển thị logo + animation sống động
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Hiển thị khi app khởi động, trước khi kiểm tra auth state
 *   - RootNavigator: hiển thị khi isInitialized = false trong authStore
 */
export default function SplashScreen() {
  // Animation values cho logo chính
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);

  // Glow ring
  const glowScale = useSharedValue(0.5);
  const glowOpacity = useSharedValue(0);

  // Text animations
  const titleTranslateY = useSharedValue(30);
  const titleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);

  // Shimmer effect cho title
  const shimmerTranslate = useSharedValue(-SCREEN_WIDTH);

  // Gradient background fade
  const bgOpacity = useSharedValue(0);

  useEffect(() => {
    // 1. Background gradient fade in
    bgOpacity.value = withTiming(1, {duration: 600});

    // 2. Logo bounce in (delay 400ms)
    logoOpacity.value = withDelay(
      400,
      withTiming(1, {duration: 400}),
    );
    logoScale.value = withDelay(
      400,
      withSpring(1, {damping: 6, stiffness: 100, mass: 1.2}),
    );

    // 3. Glow ring pulse animation (delay 600ms)
    glowOpacity.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(0.6, {duration: 1500, easing: Easing.inOut(Easing.sin)}),
          withTiming(0.15, {duration: 1500, easing: Easing.inOut(Easing.sin)}),
        ),
        -1,
        true,
      ),
    );
    glowScale.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(1.6, {duration: 1500, easing: Easing.inOut(Easing.sin)}),
          withTiming(1.0, {duration: 1500, easing: Easing.inOut(Easing.sin)}),
        ),
        -1,
        true,
      ),
    );

    // 4. Title slide up + fade in (delay 800ms)
    titleOpacity.value = withDelay(800, withTiming(1, {duration: 500}));
    titleTranslateY.value = withDelay(
      800,
      withSpring(0, {damping: 12, stiffness: 100}),
    );

    // 5. Subtitle slide up (delay 1000ms)
    subtitleOpacity.value = withDelay(1000, withTiming(1, {duration: 500}));
    subtitleTranslateY.value = withDelay(
      1000,
      withSpring(0, {damping: 12, stiffness: 100}),
    );

    // 6. Shimmer chạy qua title (delay 1300ms, lặp lại)
    shimmerTranslate.value = withDelay(
      1300,
      withRepeat(
        withTiming(SCREEN_WIDTH, {duration: 2000, easing: Easing.linear}),
        -1,
        false,
      ),
    );
  }, [
    bgOpacity,
    logoScale,
    logoOpacity,
    glowScale,
    glowOpacity,
    titleTranslateY,
    titleOpacity,
    subtitleTranslateY,
    subtitleOpacity,
    shimmerTranslate,
  ]);

  // Animated styles
  const bgAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{scale: logoScale.value}],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{scale: glowScale.value}],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{translateY: titleTranslateY.value}],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{translateY: subtitleTranslateY.value}],
  }));

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <Animated.View style={[StyleSheet.absoluteFill, bgAnimatedStyle]}>
        <LinearGradient
          colors={['#0a0a0a', '#0d1f12', '#071210', '#0a0a0a']}
          locations={[0, 0.3, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Floating Orbs - hạt sáng bay nền */}
      <FloatingOrbs count={10} />

      {/* Nội dung chính */}
      <View style={styles.content}>
        {/* Logo Container + Glow Ring + Dancing Emojis */}
        <View style={styles.logoContainer}>
          {/* Glow ring phía sau logo */}
          <Animated.View style={[styles.glowRing, glowAnimatedStyle]} />

          {/* Logo chính - bounce in */}
          <Animated.View style={[styles.logoBox, logoAnimatedStyle]}>
            <LinearGradient
              colors={['#4ade80', '#22c55e', '#16a34a']}
              style={styles.logoGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}>
              <AppText className="text-5xl">🎧</AppText>
            </LinearGradient>
          </Animated.View>

          {/* Emoji nhảy múa xung quanh logo */}
          {DANCING_EMOJIS.map((emoji, index) => (
            <DancingEmoji
              key={index}
              emoji={emoji}
              delay={1200 + index * 200}
              angle={index * 72 - 90} // Phân bố đều 360° / 5 = 72°
              radius={80}
            />
          ))}
        </View>

        {/* Tên App - slide up + shimmer */}
        <Animated.View style={titleAnimatedStyle}>
          <AppText
            variant={'heading1'}
            className="text-4xl font-sans-bold text-foreground text-center">
            StudyLanguage
          </AppText>
        </Animated.View>

        {/* Subtitle - slide up */}
        <Animated.View style={[{marginTop: 12}, subtitleAnimatedStyle]}>
          <AppText className="text-neutrals300 text-center text-lg">
            Học ngôn ngữ thông minh ✨
          </AppText>
        </Animated.View>

        {/* Loading dots animation */}
        <View style={styles.loadingContainer}>
          <LoadingDots />
        </View>
      </View>
    </View>
  );
}

/**
 * Mục đích: 3 dots animation loading phía dưới
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element - 3 dots nhảy tuần tự
 * Khi nào sử dụng: Hiển thị ở cuối SplashScreen khi đang loading
 */
function LoadingDots() {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const dotAnim = (sv: Animated.SharedValue<number>, delay: number) => {
      sv.value = withDelay(
        1500 + delay,
        withRepeat(
          withSequence(
            withTiming(-8, {duration: 300, easing: Easing.out(Easing.quad)}),
            withTiming(0, {duration: 300, easing: Easing.in(Easing.bounce)}),
            withTiming(0, {duration: 400}),
          ),
          -1,
          false,
        ),
      );
    };
    dotAnim(dot1, 0);
    dotAnim(dot2, 150);
    dotAnim(dot3, 300);
  }, [dot1, dot2, dot3]);

  const dotStyle1 = useAnimatedStyle(() => ({
    transform: [{translateY: dot1.value}],
  }));
  const dotStyle2 = useAnimatedStyle(() => ({
    transform: [{translateY: dot2.value}],
  }));
  const dotStyle3 = useAnimatedStyle(() => ({
    transform: [{translateY: dot3.value}],
  }));

  return (
    <View style={styles.dotsRow}>
      <Animated.View style={[styles.dot, {backgroundColor: '#4ade80'}, dotStyle1]} />
      <Animated.View style={[styles.dot, {backgroundColor: '#6366F1'}, dotStyle2]} />
      <Animated.View style={[styles.dot, {backgroundColor: '#fbbf24'}, dotStyle3]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  glowRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#4ade80',
    shadowColor: '#4ade80',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 30,
  },
  logoBox: {
    width: 96,
    height: 96,
    borderRadius: 28,
    overflow: 'hidden',
    // Shadow cho logo
    shadowColor: '#4ade80',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    marginTop: 48,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
