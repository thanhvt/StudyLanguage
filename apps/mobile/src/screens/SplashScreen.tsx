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
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {AppText} from '@/components/ui';
import FloatingOrbs from '@/components/auth/FloatingOrbs';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Các emoji bay vào từ ngoài rồi nhảy múa
const EMOJI_PARADE = [
  {emoji: '🎧', color: '#6366F1'},
  {emoji: '🗣️', color: '#4ade80'},
  {emoji: '📖', color: '#fbbf24'},
  {emoji: '🌟', color: '#22d3ee'},
  {emoji: '🚀', color: '#f472b6'},
  {emoji: '💡', color: '#a78bfa'},
];

// Các ký tự app name để animation wave
const APP_NAME_CHARS = 'StudyLanguage'.split('');

/**
 * Mục đích: Emoji bay vào từ bên ngoài rồi nhảy múa liên tục
 * Tham số đầu vào: emoji, delay, finalX, finalY, color
 * Tham số đầu ra: JSX.Element - 1 emoji animated
 * Khi nào sử dụng: SplashScreen - hiệu ứng parade emoji bay vào vị trí
 */
function ParadeEmoji({
  emoji,
  delay,
  finalX,
  finalY,
  color,
}: {
  emoji: string;
  delay: number;
  finalX: number;
  finalY: number;
  color: string;
}) {
  // Bay vào từ ngoài màn hình
  const translateX = useSharedValue(SCREEN_WIDTH + 50);
  const translateY = useSharedValue(-100);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);
  // Dành cho dancing sau khi đã vào vị trí
  const danceBounce = useSharedValue(0);

  useEffect(() => {
    // Giai đoạn 1: Bay vào vị trí (slow-motion spring)
    opacity.value = withDelay(delay, withTiming(1, {duration: 300}));
    translateX.value = withDelay(
      delay,
      withSpring(finalX, {damping: 8, stiffness: 40, mass: 1.5}), // slow-motion spring
    );
    translateY.value = withDelay(
      delay,
      withSpring(finalY, {damping: 8, stiffness: 40, mass: 1.5}),
    );
    scale.value = withDelay(
      delay,
      withSpring(1, {damping: 5, stiffness: 80}),
    );

    // Giai đoạn 2: Xoay 360° khi bay vào
    rotate.value = withDelay(
      delay,
      withTiming(720, {duration: 1200, easing: Easing.out(Easing.cubic)}),
    );

    // Giai đoạn 3: Dancing bounce liên tục (delay thêm để chờ bay vào xong)
    danceBounce.value = withDelay(
      delay + 1500,
      withRepeat(
        withSequence(
          // Nhảy lên
          withTiming(-18, {duration: 300, easing: Easing.out(Easing.quad)}),
          // Rơi xuống bounce
          withTiming(0, {duration: 300, easing: Easing.in(Easing.bounce)}),
          // Nhảy nhỏ
          withTiming(-10, {duration: 200, easing: Easing.out(Easing.quad)}),
          withTiming(0, {duration: 200, easing: Easing.in(Easing.bounce)}),
          // Nghỉ
          withTiming(0, {duration: 800}),
        ),
        -1,
        false,
      ),
    );
  }, [delay, finalX, finalY, translateX, translateY, scale, opacity, rotate, danceBounce]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value + danceBounce.value},
      {scale: scale.value},
      {rotate: `${rotate.value}deg`},
    ],
  }));

  return (
    <Animated.View
      style={[
        {position: 'absolute'},
        animStyle,
      ]}>
      {/* Vòng sáng sau emoji */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: color + '15',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: color,
          shadowOffset: {width: 0, height: 0},
          shadowOpacity: 0.4,
          shadowRadius: 12,
        }}>
        <AppText className="text-2xl">{emoji}</AppText>
      </View>
    </Animated.View>
  );
}

/**
 * Mục đích: 1 ký tự của app name với wave animation
 * Tham số đầu vào: char, index (để tính delay)
 * Tham số đầu ra: JSX.Element - 1 char animated
 * Khi nào sử dụng: SplashScreen - hiệu ứng wave text
 */
function WaveChar({char, index}: {char: string; index: number}) {
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const waveBounce = useSharedValue(0);

  useEffect(() => {
    const charDelay = 1800 + index * 80; // Mỗi ký tự cách nhau 80ms

    // Nhảy vào từ dưới lên
    opacity.value = withDelay(charDelay, withTiming(1, {duration: 200}));
    translateY.value = withDelay(
      charDelay,
      withSpring(0, {damping: 6, stiffness: 150}),
    );
    scale.value = withDelay(
      charDelay,
      withSpring(1, {damping: 8, stiffness: 120}),
    );

    // Wave bounce liên tục sau khi đã hiện
    waveBounce.value = withDelay(
      3000 + index * 120, // delay lệch nhau tạo hiệu ứng sóng
      withRepeat(
        withSequence(
          withTiming(-6, {duration: 300, easing: Easing.out(Easing.sin)}),
          withTiming(0, {duration: 300, easing: Easing.in(Easing.sin)}),
          withTiming(0, {duration: 1500}), // Nghỉ dài
        ),
        -1,
        false,
      ),
    );
  }, [index, translateY, opacity, scale, waveBounce]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {translateY: translateY.value + waveBounce.value},
      {scale: scale.value},
    ],
  }));

  return (
    <Animated.View style={animStyle}>
      <AppText
        variant={'heading1'}
        className="text-4xl font-sans-bold text-foreground">
        {char}
      </AppText>
    </Animated.View>
  );
}

/**
 * Mục đích: Logo chính với hiệu ứng flip 3D + pulse + bounce
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element - logo animated
 * Khi nào sử dụng: SplashScreen - logo trung tâm
 */
function AnimatedLogo() {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const glowScale = useSharedValue(0.5);
  const glowOpacity = useSharedValue(0);
  // Logo bounce nhẹ liên tục
  const bounce = useSharedValue(0);

  useEffect(() => {
    // Logo zoom in + bounce
    opacity.value = withDelay(600, withTiming(1, {duration: 400}));
    scale.value = withDelay(
      600,
      withSpring(1, {damping: 4, stiffness: 80, mass: 1.2}), // bouncy spring
    );

    // Flip 3D khi xuất hiện
    rotateY.value = withDelay(
      600,
      withTiming(360, {duration: 1000, easing: Easing.out(Easing.cubic)}),
    );

    // Glow ring pulse
    glowOpacity.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(0.7, {duration: 1200, easing: Easing.inOut(Easing.sin)}),
          withTiming(0.1, {duration: 1200, easing: Easing.inOut(Easing.sin)}),
        ),
        -1,
        true,
      ),
    );
    glowScale.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(1.8, {duration: 1200, easing: Easing.inOut(Easing.sin)}),
          withTiming(1.0, {duration: 1200, easing: Easing.inOut(Easing.sin)}),
        ),
        -1,
        true,
      ),
    );

    // Bounce nhẹ liên tục (breathing effect)
    bounce.value = withDelay(
      2000,
      withRepeat(
        withSequence(
          withTiming(-8, {duration: 800, easing: Easing.inOut(Easing.sin)}),
          withTiming(8, {duration: 800, easing: Easing.inOut(Easing.sin)}),
        ),
        -1,
        true,
      ),
    );
  }, [scale, opacity, rotateY, glowScale, glowOpacity, bounce]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {scale: scale.value},
      {rotateY: `${rotateY.value}deg`},
      {translateY: bounce.value},
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{scale: glowScale.value}],
  }));

  return (
    <View style={styles.logoArea}>
      {/* Glow ring 1 - xanh */}
      <Animated.View style={[styles.glowRing, glowStyle]} />
      {/* Glow ring 2 - tím (offset timing) */}
      <Animated.View
        style={[
          styles.glowRing,
          {borderColor: '#6366F1', shadowColor: '#6366F1'},
          glowStyle,
        ]}
      />

      {/* Logo chính */}
      <Animated.View style={[styles.logoBox, logoStyle]}>
        <LinearGradient
          colors={['#4ade80', '#22c55e', '#16a34a']}
          style={styles.logoGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          <AppText className="text-5xl">🎧</AppText>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

/**
 * Mục đích: 3 dots loading nhảy tuần tự stagger
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element - 3 dots bounce
 * Khi nào sử dụng: SplashScreen - loading indicator
 */
function LoadingDots() {
  const dots = [
    {color: '#4ade80', sv: useSharedValue(0), scaleSv: useSharedValue(1)},
    {color: '#6366F1', sv: useSharedValue(0), scaleSv: useSharedValue(1)},
    {color: '#fbbf24', sv: useSharedValue(0), scaleSv: useSharedValue(1)},
  ];

  useEffect(() => {
    dots.forEach((dot, i) => {
      const delay = 2500 + i * 200;
      // Bounce lên xuống
      dot.sv.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-14, {duration: 250, easing: Easing.out(Easing.quad)}),
            withTiming(0, {duration: 250, easing: Easing.in(Easing.bounce)}),
            withTiming(0, {duration: 500}),
          ),
          -1,
          false,
        ),
      );
      // Scale pulse
      dot.scaleSv.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1.5, {duration: 250}),
            withTiming(1, {duration: 250}),
            withTiming(1, {duration: 500}),
          ),
          -1,
          false,
        ),
      );
    });
  }, []);

  const dotStyles = dots.map(dot =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({
      transform: [
        {translateY: dot.sv.value},
        {scale: dot.scaleSv.value},
      ],
    })),
  );

  return (
    <View style={styles.dotsRow}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {backgroundColor: dot.color, shadowColor: dot.color, shadowOpacity: 0.6, shadowRadius: 6},
            dotStyles[i],
          ]}
        />
      ))}
    </View>
  );
}

/**
 * Mục đích: Subtitle với hiệu ứng typewriter (chữ hiện dần)
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: SplashScreen - subtitle phía dưới app name
 */
function AnimatedSubtitle() {
  const words = ['Học', 'ngôn ngữ', 'thông minh', '✨'];
  const wordAnimations = words.map(() => ({
    // eslint-disable-next-line react-hooks/rules-of-hooks
    opacity: useSharedValue(0),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    translateY: useSharedValue(15),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    scale: useSharedValue(0.5),
  }));

  useEffect(() => {
    wordAnimations.forEach((anim, i) => {
      const delay = 2800 + i * 300;
      anim.opacity.value = withDelay(delay, withTiming(1, {duration: 300}));
      anim.translateY.value = withDelay(
        delay,
        withSpring(0, {damping: 8, stiffness: 120}),
      );
      anim.scale.value = withDelay(
        delay,
        withSpring(1, {damping: 5, stiffness: 100}),
      );
    });
  }, []);

  const wordStyles = wordAnimations.map(anim =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({
      opacity: anim.opacity.value,
      transform: [
        {translateY: anim.translateY.value},
        {scale: anim.scale.value},
      ],
    })),
  );

  return (
    <View style={{flexDirection: 'row', gap: 6, marginTop: 12}}>
      {words.map((word, i) => (
        <Animated.View key={i} style={wordStyles[i]}>
          <AppText className="text-neutrals300 text-lg">{word}</AppText>
        </Animated.View>
      ))}
    </View>
  );
}

/**
 * Mục đích: Màn hình chờ khi khởi động app — nhiều hiệu ứng sống động, nhảy múa, in/out
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Hiển thị khi app khởi động, trước khi kiểm tra auth state
 *   - RootNavigator: hiển thị khi isInitialized = false trong authStore
 */
export default function SplashScreen() {
  const bgOpacity = useSharedValue(0);

  // Vị trí cuối cùng cho 6 emoji parade (xung quanh logo)
  const emojiPositions = [
    {x: -80, y: -60},
    {x: 70, y: -70},
    {x: -90, y: 30},
    {x: 80, y: 40},
    {x: -50, y: 90},
    {x: 60, y: 95},
  ];

  useEffect(() => {
    // Background fade in mượt
    bgOpacity.value = withTiming(1, {duration: 800, easing: Easing.out(Easing.cubic)});
  }, [bgOpacity]);

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <Animated.View style={[StyleSheet.absoluteFill, bgStyle]}>
        <LinearGradient
          colors={['#0a0a0a', '#0d1f12', '#0f0a1a', '#071210', '#0a0a0a']}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Floating Orbs nền */}
      <FloatingOrbs count={12} />

      {/* Nội dung chính */}
      <View style={styles.content}>
        {/* Logo + Emoji Parade */}
        <View style={styles.logoContainer}>
          {/* Logo chính với flip + glow */}
          <AnimatedLogo />

          {/* Emoji parade bay vào từ ngoài */}
          {EMOJI_PARADE.map((item, index) => (
            <ParadeEmoji
              key={index}
              emoji={item.emoji}
              color={item.color}
              delay={800 + index * 250}
              finalX={emojiPositions[index].x}
              finalY={emojiPositions[index].y}
            />
          ))}
        </View>

        {/* App Name - wave animation từng ký tự */}
        <View style={styles.appNameRow}>
          {APP_NAME_CHARS.map((char, index) => (
            <WaveChar key={index} char={char} index={index} />
          ))}
        </View>

        {/* Subtitle - typewriter effect */}
        <AnimatedSubtitle />

        {/* Loading dots */}
        <View style={styles.loadingContainer}>
          <LoadingDots />
        </View>
      </View>
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
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoArea: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
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
    shadowColor: '#4ade80',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 10,
  },
  logoGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    marginTop: 48,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
