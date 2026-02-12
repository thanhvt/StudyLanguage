import React, {useEffect} from 'react';
import {View, Dimensions, StyleSheet, Image} from 'react-native';
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
import {SKILL_COLORS} from '@/config/skillColors';
import {useColors} from '@/hooks/useColors';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// Ảnh app icon (brain with headphones)
const APP_ICON = require('../../assets/app_icon.png');

// Các emoji bay vào nhẹ nhàng xung quanh logo
const EMOJI_PARADE = [
  {emoji: '🎧', color: SKILL_COLORS.listening.dark},
  {emoji: '📖', color: SKILL_COLORS.reading.dark},
  {emoji: '🚀', color: '#f472b6'},
  {emoji: '💡', color: '#a78bfa'},
  {emoji: '🗣️', color: SKILL_COLORS.speaking.dark},
];

// Ký tự app name cho wave animation
const APP_NAME_CHARS = 'StudyLanguage'.split('');

/**
 * Mục đích: Emoji bay vào nhẹ nhàng rồi lơ lửng xung quanh logo
 * Tham số đầu vào: emoji, delay, finalX, finalY, color
 * Tham số đầu ra: JSX.Element - 1 emoji animated
 * Khi nào sử dụng: SplashScreen - hiệu ứng emoji bay vào vị trí rồi lơ lửng
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
  const translateY = useSharedValue(-80);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);
  // Lơ lửng nhẹ nhàng sau khi vào vị trí
  const floatY = useSharedValue(0);

  useEffect(() => {
    // Giai đoạn 1: Bay vào vị trí (chậm rãi, nhẹ nhàng)
    opacity.value = withDelay(delay, withTiming(1, {duration: 600}));
    translateX.value = withDelay(
      delay,
      withSpring(finalX, {damping: 18, stiffness: 25, mass: 1.2}),
    );
    translateY.value = withDelay(
      delay,
      withSpring(finalY, {damping: 18, stiffness: 25, mass: 1.2}),
    );
    scale.value = withDelay(
      delay,
      withSpring(1, {damping: 12, stiffness: 60}),
    );

    // Giai đoạn 2: Xoay nhẹ khi bay vào
    rotate.value = withDelay(
      delay,
      withTiming(360, {duration: 2500, easing: Easing.out(Easing.cubic)}),
    );

    // Giai đoạn 3: Lơ lửng nhẹ nhàng liên tục
    floatY.value = withDelay(
      delay + 2500,
      withRepeat(
        withSequence(
          withTiming(-8, {duration: 1200, easing: Easing.inOut(Easing.sin)}),
          withTiming(8, {duration: 1200, easing: Easing.inOut(Easing.sin)}),
        ),
        -1,
        true,
      ),
    );
  }, [delay, finalX, finalY, translateX, translateY, scale, opacity, rotate, floatY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value + floatY.value},
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
      {/* Vòng sáng mờ sau emoji */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: color + '12',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: color,
          shadowOffset: {width: 0, height: 0},
          shadowOpacity: 0.3,
          shadowRadius: 16,
        }}>
        <AppText className="text-2xl">{emoji}</AppText>
      </View>
    </Animated.View>
  );
}

/**
 * Mục đích: 1 ký tự của app name với wave animation mượt mà
 * Tham số đầu vào: char, index (để tính delay)
 * Tham số đầu ra: JSX.Element - 1 char animated
 * Khi nào sử dụng: SplashScreen - hiệu ứng wave text chậm rãi
 */
function WaveChar({char, index}: {char: string; index: number}) {
  const translateY = useSharedValue(40);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const waveBounce = useSharedValue(0);

  useEffect(() => {
    const charDelay = 2200 + index * 100;

    // Nhẹ nhàng hiện lên từ dưới
    opacity.value = withDelay(charDelay, withTiming(1, {duration: 400}));
    translateY.value = withDelay(
      charDelay,
      withSpring(0, {damping: 14, stiffness: 70}),
    );
    scale.value = withDelay(
      charDelay,
      withSpring(1, {damping: 12, stiffness: 80}),
    );

    // Wave nhẹ nhàng liên tục sau khi đã hiện
    waveBounce.value = withDelay(
      4000 + index * 150,
      withRepeat(
        withSequence(
          withTiming(-4, {duration: 600, easing: Easing.inOut(Easing.sin)}),
          withTiming(4, {duration: 600, easing: Easing.inOut(Easing.sin)}),
          withTiming(0, {duration: 400, easing: Easing.inOut(Easing.sin)}),
          withTiming(0, {duration: 2000}), // Nghỉ dài
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
 * Mục đích: Logo chính với app icon thật, vòng sáng 3 lớp đẹp mắt
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element - logo animated premium
 * Khi nào sử dụng: SplashScreen - logo trung tâm với glow rings đẹp
 */
function AnimatedLogo() {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  // 3 vòng sáng đồng tâm - pulse lệch pha
  const ring1Scale = useSharedValue(0.6);
  const ring1Opacity = useSharedValue(0);
  const ring2Scale = useSharedValue(0.6);
  const ring2Opacity = useSharedValue(0);
  const ring3Scale = useSharedValue(0.6);
  const ring3Opacity = useSharedValue(0);
  // Breathing nhẹ nhàng
  const breathe = useSharedValue(0);

  useEffect(() => {
    // Logo fade in + scale mượt (không bouncy)
    opacity.value = withDelay(
      600,
      withTiming(1, {duration: 800, easing: Easing.out(Easing.cubic)}),
    );
    scale.value = withDelay(
      600,
      withSpring(1, {damping: 18, stiffness: 40, mass: 1}),
    );

    // Vòng sáng 1 (trong cùng) - amber ấm
    ring1Opacity.value = withDelay(
      1200,
      withRepeat(
        withSequence(
          withTiming(0.5, {duration: 2500, easing: Easing.inOut(Easing.sin)}),
          withTiming(0.1, {duration: 2500, easing: Easing.inOut(Easing.sin)}),
        ),
        -1,
        true,
      ),
    );
    ring1Scale.value = withDelay(
      1200,
      withRepeat(
        withSequence(
          withTiming(1.3, {duration: 2500, easing: Easing.inOut(Easing.sin)}),
          withTiming(0.9, {duration: 2500, easing: Easing.inOut(Easing.sin)}),
        ),
        -1,
        true,
      ),
    );

    // Vòng sáng 2 (giữa) - xanh lá primary
    ring2Opacity.value = withDelay(
      1600,
      withRepeat(
        withSequence(
          withTiming(0.45, {duration: 3000, easing: Easing.inOut(Easing.sin)}),
          withTiming(0.08, {duration: 3000, easing: Easing.inOut(Easing.sin)}),
        ),
        -1,
        true,
      ),
    );
    ring2Scale.value = withDelay(
      1600,
      withRepeat(
        withSequence(
          withTiming(1.5, {duration: 3000, easing: Easing.inOut(Easing.sin)}),
          withTiming(1.0, {duration: 3000, easing: Easing.inOut(Easing.sin)}),
        ),
        -1,
        true,
      ),
    );

    // Vòng sáng 3 (ngoài cùng) - cyan mát
    ring3Opacity.value = withDelay(
      2000,
      withRepeat(
        withSequence(
          withTiming(0.35, {duration: 3500, easing: Easing.inOut(Easing.sin)}),
          withTiming(0.05, {duration: 3500, easing: Easing.inOut(Easing.sin)}),
        ),
        -1,
        true,
      ),
    );
    ring3Scale.value = withDelay(
      2000,
      withRepeat(
        withSequence(
          withTiming(1.8, {duration: 3500, easing: Easing.inOut(Easing.sin)}),
          withTiming(1.1, {duration: 3500, easing: Easing.inOut(Easing.sin)}),
        ),
        -1,
        true,
      ),
    );

    // Breathing nhẹ nhàng lên xuống
    breathe.value = withDelay(
      2500,
      withRepeat(
        withSequence(
          withTiming(-5, {duration: 1800, easing: Easing.inOut(Easing.sin)}),
          withTiming(5, {duration: 1800, easing: Easing.inOut(Easing.sin)}),
        ),
        -1,
        true,
      ),
    );
  }, [
    scale, opacity,
    ring1Scale, ring1Opacity,
    ring2Scale, ring2Opacity,
    ring3Scale, ring3Opacity,
    breathe,
  ]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {scale: scale.value},
      {translateY: breathe.value},
    ],
  }));

  const ring1Style = useAnimatedStyle(() => ({
    opacity: ring1Opacity.value,
    transform: [{scale: ring1Scale.value}],
  }));

  const ring2Style = useAnimatedStyle(() => ({
    opacity: ring2Opacity.value,
    transform: [{scale: ring2Scale.value}],
  }));

  const ring3Style = useAnimatedStyle(() => ({
    opacity: ring3Opacity.value,
    transform: [{scale: ring3Scale.value}],
  }));

  return (
    <View style={styles.logoArea}>
      {/* Vòng sáng 3 - ngoài cùng - cyan */}
      <Animated.View
        style={[
          styles.glowRing,
          styles.ring3,
          ring3Style,
        ]}
      />
      {/* Vòng sáng 2 - giữa - xanh lá */}
      <Animated.View
        style={[
          styles.glowRing,
          styles.ring2,
          ring2Style,
        ]}
      />
      {/* Vòng sáng 1 - trong cùng - amber */}
      <Animated.View
        style={[
          styles.glowRing,
          styles.ring1,
          ring1Style,
        ]}
      />

      {/* Logo chính - app icon thật */}
      <Animated.View style={[styles.logoIconWrapper, logoStyle]}>
        <View style={styles.logoIconContainer}>
          <Image
            source={APP_ICON}
            style={styles.logoIcon}
            resizeMode="cover"
          />
        </View>
        {/* Viền glow bên ngoài icon */}
        <View style={styles.logoIconGlow} />
      </Animated.View>
    </View>
  );
}

/**
 * Mục đích: 3 dots loading với animation mượt mà
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element - 3 dots pulse nhẹ nhàng
 * Khi nào sử dụng: SplashScreen - loading indicator
 */
function LoadingDots() {
  const dots = [
    {color: SKILL_COLORS.speaking.dark, sv: useSharedValue(0), scaleSv: useSharedValue(1)},
    {color: SKILL_COLORS.listening.dark, sv: useSharedValue(0), scaleSv: useSharedValue(1)},
    {color: SKILL_COLORS.reading.dark, sv: useSharedValue(0), scaleSv: useSharedValue(1)},
  ];

  useEffect(() => {
    dots.forEach((dot, i) => {
      const delay = 3000 + i * 300;
      // Lơ lửng nhẹ nhàng
      dot.sv.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-10, {duration: 500, easing: Easing.inOut(Easing.sin)}),
            withTiming(0, {duration: 500, easing: Easing.inOut(Easing.sin)}),
            withTiming(0, {duration: 800}),
          ),
          -1,
          false,
        ),
      );
      // Scale pulse nhẹ
      dot.scaleSv.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1.3, {duration: 500, easing: Easing.inOut(Easing.sin)}),
            withTiming(1, {duration: 500, easing: Easing.inOut(Easing.sin)}),
            withTiming(1, {duration: 800}),
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
            {
              backgroundColor: dot.color,
              shadowColor: dot.color,
              shadowOpacity: 0.5,
              shadowRadius: 8,
            },
            dotStyles[i],
          ]}
        />
      ))}
    </View>
  );
}

/**
 * Mục đích: Subtitle tiếng Anh với hiệu ứng typewriter mượt mà
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: SplashScreen - subtitle "Learn Smarter ✨"
 */
function AnimatedSubtitle() {
  const words = ['Learn', 'Smarter', '✨'];
  const wordAnimations = words.map(() => ({
    // eslint-disable-next-line react-hooks/rules-of-hooks
    opacity: useSharedValue(0),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    translateY: useSharedValue(20),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    scale: useSharedValue(0.7),
  }));

  useEffect(() => {
    wordAnimations.forEach((anim, i) => {
      const delay = 3500 + i * 400;
      anim.opacity.value = withDelay(
        delay,
        withTiming(1, {duration: 500, easing: Easing.out(Easing.cubic)}),
      );
      anim.translateY.value = withDelay(
        delay,
        withSpring(0, {damping: 14, stiffness: 60}),
      );
      anim.scale.value = withDelay(
        delay,
        withSpring(1, {damping: 10, stiffness: 70}),
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
    <View style={{flexDirection: 'row', gap: 8, marginTop: 14}}>
      {words.map((word, i) => (
        <Animated.View key={i} style={wordStyles[i]}>
          <AppText className="text-neutrals300 text-lg">{word}</AppText>
        </Animated.View>
      ))}
    </View>
  );
}

/**
 * Mục đích: Màn hình splash premium khi khởi động app
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Hiển thị khi app khởi động, trước khi kiểm tra auth state
 *   - RootNavigator: hiển thị khi isInitialized = false trong authStore
 */
export default function SplashScreen() {
  const bgOpacity = useSharedValue(0);

  // Vị trí cuối cùng cho 5 emoji xung quanh logo (hình tròn đều)
  const emojiPositions = [
    {x: -85, y: -55},   // trên trái
    {x: 75, y: -65},    // trên phải
    {x: -95, y: 35},    // giữa trái
    {x: 85, y: 45},     // giữa phải
    {x: 0, y: 100},     // dưới giữa
  ];

  useEffect(() => {
    // Background fade in mượt
    bgOpacity.value = withTiming(1, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [bgOpacity]);

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Gradient nền tối */}
      <Animated.View style={[StyleSheet.absoluteFill, bgStyle]}>
        <LinearGradient
          colors={['#0a0a0a', '#0d1f12', '#0f0a1a', '#071210', '#0a0a0a']}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Floating orbs nền */}
      <FloatingOrbs count={10} />

      {/* Nội dung chính */}
      <View style={styles.content}>
        {/* Logo + Emoji */}
        <View style={styles.logoContainer}>
          {/* Logo chính với glow rings 3 lớp */}
          <AnimatedLogo />

          {/* Emoji bay vào nhẹ nhàng */}
          {EMOJI_PARADE.map((item, index) => (
            <ParadeEmoji
              key={index}
              emoji={item.emoji}
              color={item.color}
              delay={1200 + index * 350}
              finalX={emojiPositions[index].x}
              finalY={emojiPositions[index].y}
            />
          ))}
        </View>

        {/* App Name - wave animation mượt */}
        <View style={styles.appNameRow}>
          {APP_NAME_CHARS.map((char, index) => (
            <WaveChar key={index} char={char} index={index} />
          ))}
        </View>

        {/* Subtitle tiếng Anh */}
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
    backgroundColor: '#000000', // Splash luôn dùng OLED black, không theo theme
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  logoArea: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 3 vòng sáng đồng tâm
  glowRing: {
    position: 'absolute',
    borderWidth: 1.5,
    shadowOffset: {width: 0, height: 0},
  },
  ring1: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderColor: SKILL_COLORS.reading.dark + '40',
    shadowColor: SKILL_COLORS.reading.dark,
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  ring2: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderColor: SKILL_COLORS.speaking.dark + '35',
    shadowColor: SKILL_COLORS.speaking.dark,
    shadowOpacity: 0.5,
    shadowRadius: 25,
  },
  ring3: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderColor: '#22d3ee25',
    shadowColor: '#22d3ee',
    shadowOpacity: 0.3,
    shadowRadius: 30,
  },
  // Logo icon wrapper - KHÔNG có overflow hidden
  logoIconWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a', // Splash-specific dark surface
  },
  logoIcon: {
    width: 110,
    height: 110,
  },
  logoIconGlow: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 2,
    borderColor: SKILL_COLORS.speaking.dark + '40',
    shadowColor: SKILL_COLORS.speaking.dark,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 15,
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
    gap: 12,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
