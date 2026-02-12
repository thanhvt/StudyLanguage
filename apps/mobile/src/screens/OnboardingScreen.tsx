import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  FlatList,
  Dimensions,
  Animated as RNAnimated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  BounceIn,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {AppButton, AppText} from '@/components/ui';
import {useAppStore} from '@/store/useAppStore';
import FloatingOrbs from '@/components/auth/FloatingOrbs';

const {width, height} = Dimensions.get('window');

// Nội dung 3 slides onboarding
const SLIDES = [
  {
    id: '1',
    emoji: '🎧',
    title: 'Luyện Nghe',
    subtitle: 'Nghe hội thoại AI tạo theo\nchủ đề bạn chọn',
    color: '#6366F1',
    decorEmojis: ['🎵', '🎶', '🔊', '👂'],
    gradientColors: ['#0a0a0a', '#0f0a1e', '#0a0a0a'],
  },
  {
    id: '2',
    emoji: '🗣️',
    title: 'Luyện Nói',
    subtitle: 'Hội thoại với AI và\nnhận phản hồi phát âm',
    color: '#4ade80',
    decorEmojis: ['💬', '🎤', '💡', '🌟'],
    gradientColors: ['#0a0a0a', '#0d1f12', '#0a0a0a'],
  },
  {
    id: '3',
    emoji: '📖',
    title: 'Luyện Đọc',
    subtitle: 'Đọc bài viết phù hợp trình độ\nvới từ vựng nổi bật',
    color: '#fbbf24',
    decorEmojis: ['📚', '✏️', '🔍', '⭐'],
    gradientColors: ['#0a0a0a', '#1a1408', '#0a0a0a'],
  },
];

/**
 * Mục đích: Emoji trang trí nhảy múa xung quanh emoji chính
 * Tham số đầu vào: emoji, angle, radius, delay, color
 * Tham số đầu ra: JSX.Element - 1 emoji animated
 * Khi nào sử dụng: OnboardingScreen - mỗi slide có 4 emoji trang trí
 */
function DecorEmoji({
  emoji,
  angle,
  radius,
  delay,
  color,
  isActive,
}: {
  emoji: string;
  angle: number;
  radius: number;
  delay: number;
  color: string;
  isActive: boolean;
}) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);
  const bounce = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      // Pop in nhẹ nhàng
      opacity.value = withDelay(delay, withSpring(1, {damping: 10}));
      scale.value = withDelay(
        delay,
        withSpring(1, {damping: 8, stiffness: 80}),
      );
      // Xoay lắc nhẹ - giảm biên độ cho uyển chuyển
      rotate.value = withDelay(
        delay + 400,
        withRepeat(
          withSequence(
            withTiming(12, {duration: 500, easing: Easing.inOut(Easing.sin)}),
            withTiming(-12, {duration: 500, easing: Easing.inOut(Easing.sin)}),
            withTiming(0, {duration: 400}),
            withTiming(0, {duration: 1500}), // Nghỉ lâu hơn
          ),
          -1,
          false,
        ),
      );
      // Nhảy nhẹ - giảm amplitude
      bounce.value = withDelay(
        delay + 800,
        withRepeat(
          withSequence(
            withTiming(-6, {duration: 400, easing: Easing.out(Easing.quad)}),
            withTiming(0, {duration: 400, easing: Easing.in(Easing.bounce)}),
            withTiming(0, {duration: 2000}), // Nghỉ lâu hơn
          ),
          -1,
          false,
        ),
      );
    } else {
      // Fade out khi không active
      opacity.value = withTiming(0, {duration: 200});
      scale.value = withTiming(0, {duration: 200});
    }
  }, [isActive, delay, scale, opacity, rotate, bounce]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {scale: scale.value},
      {rotate: `${rotate.value}deg`},
      {translateY: bounce.value},
    ],
  }));

  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const y = Math.sin((angle * Math.PI) / 180) * radius;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x - 18,
          top: y - 18,
        },
        animStyle,
      ]}>
      <View
        style={[
          styles.decorCircle,
          {
            shadowColor: color,
          },
        ]}>
        <AppText className="text-xl">{emoji}</AppText>
      </View>
    </Animated.View>
  );
}

/**
 * Mục đích: Emoji chính của mỗi slide với bounce-in + breathing animation
 * Tham số đầu vào: emoji, color, isActive
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: OnboardingScreen - icon chính mỗi slide
 */
function MainEmojiIcon({
  emoji,
  color,
  isActive,
}: {
  emoji: string;
  color: string;
  isActive: boolean;
}) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const glowScale = useSharedValue(0.5);
  const glowOpacity = useSharedValue(0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      // Pop in mượt mà — giảm bouncy, tăng damping
      opacity.value = withDelay(200, withSpring(1, {damping: 10}));
      scale.value = withDelay(
        200,
        withSpring(1, {damping: 8, stiffness: 60, mass: 1}), // mượt hơn, ít giật
      );
      // Glow chậm, nhẹ nhàng — tăng duration
      glowOpacity.value = withDelay(
        600,
        withRepeat(
          withSequence(
            withTiming(0.5, {duration: 2500, easing: Easing.inOut(Easing.sin)}),
            withTiming(0.1, {duration: 2500, easing: Easing.inOut(Easing.sin)}),
          ),
          -1,
          true,
        ),
      );
      glowScale.value = withDelay(
        600,
        withRepeat(
          withSequence(
            withTiming(1.5, {duration: 2500, easing: Easing.inOut(Easing.sin)}),
            withTiming(1.0, {duration: 2500, easing: Easing.inOut(Easing.sin)}),
          ),
          -1,
          true,
        ),
      );
      // Breathing float — giảm amplitude, tăng duration cho uyển chuyển
      breathe.value = withDelay(
        1200, // chờ bounce xong rồi mới breathe
        withRepeat(
          withSequence(
            withTiming(-4, {duration: 1800, easing: Easing.inOut(Easing.sin)}),
            withTiming(4, {duration: 1800, easing: Easing.inOut(Easing.sin)}),
          ),
          -1,
          true,
        ),
      );
    } else {
      opacity.value = withTiming(0.3, {duration: 300});
      scale.value = withTiming(0.7, {duration: 300});
      glowOpacity.value = withTiming(0, {duration: 200});
    }
  }, [isActive, scale, opacity, glowScale, glowOpacity, breathe]);

  const mainStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{scale: scale.value}, {translateY: breathe.value}],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{scale: glowScale.value}],
  }));

  return (
    <View style={styles.mainEmojiContainer}>
      {/* Glow ring */}
      <Animated.View
        style={[
          styles.emojiGlowRing,
          {borderColor: color, shadowColor: color},
          ringStyle,
        ]}
      />
      {/* Icon chính */}
      <Animated.View style={mainStyle}>
        <View
          style={[
            styles.mainEmojiCircle,
            {
              backgroundColor: color + '15',
              shadowColor: color,
            },
          ]}>
          <AppText className="text-6xl">{emoji}</AppText>
        </View>
      </Animated.View>
    </View>
  );
}

/**
 * Mục đích: Nội dung 1 slide onboarding với đầy đủ animation
 * Tham số đầu vào: item (slide data), isActive
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: OnboardingScreen - render mỗi slide
 */
function SlideContent({
  item,
  isActive,
}: {
  item: (typeof SLIDES)[0];
  isActive: boolean;
}) {
  return (
    <View style={[styles.slideContainer, {width}]}>
      {/* Gradient nền riêng cho mỗi slide */}
      <LinearGradient
        colors={item.gradientColors as [string, string, string]}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating orbs cho mỗi slide */}
      <FloatingOrbs
        count={3}
        colors={[item.color, item.color + '80', '#ffffff20']}
      />

      <View style={styles.slideContent}>
        {/* Emoji chính + decor emojis */}
        <View style={styles.emojiArea}>
          <MainEmojiIcon
            emoji={item.emoji}
            color={item.color}
            isActive={isActive}
          />
          {/* 4 emoji trang trí xung quanh */}
          {item.decorEmojis.map((de, i) => (
            <DecorEmoji
              key={i}
              emoji={de}
              angle={i * 90 - 45} // 4 vị trí: -45, 45, 135, 225
              radius={85}
              delay={400 + i * 200}
              color={item.color}
              isActive={isActive}
            />
          ))}
        </View>

        {/* Title */}
        {isActive && (
          <Animated.View entering={FadeInDown.delay(300).springify().damping(6)}>
            <AppText
              variant={'heading1'}
              className="text-3xl font-sans-bold text-foreground text-center mb-4"
              style={{color: item.color}}>
              {item.title}
            </AppText>
          </Animated.View>
        )}

        {/* Subtitle */}
        {isActive && (
          <Animated.View entering={FadeInUp.delay(500).springify()}>
            <AppText className="text-neutrals300 text-center text-lg leading-7">
              {item.subtitle}
            </AppText>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

/**
 * Mục đích: Màn hình giới thiệu app cho người dùng mới (3 slides) - phiên bản sống động
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Hiển thị 1 lần khi user mở app lần đầu (isFirstLaunch = true)
 *   - AuthStack: route đầu tiên nếu isFirstLaunch = true
 *   - Sau khi hoàn thành → navigate tới LoginScreen
 */
export default function OnboardingScreen({
  navigation,
}: {
  navigation: any;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new RNAnimated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const setIsFirstLaunch = useAppStore(state => state.setIsFirstLaunch);

  // Animation cho nút chính
  const btnScale = useSharedValue(1);

  useEffect(() => {
    // Nút pulse nhẹ - thu hút chú ý
    btnScale.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(1.05, {duration: 800, easing: Easing.inOut(Easing.sin)}),
          withTiming(1, {duration: 800, easing: Easing.inOut(Easing.sin)}),
        ),
        -1,
        true,
      ),
    );
  }, [btnScale]);

  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [{scale: btnScale.value}],
  }));

  /**
   * Mục đích: Xử lý khi user scroll giữa các slides
   * Tham số đầu vào: NativeScrollEvent
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi FlatList scroll
   */
  const onMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  /**
   * Mục đích: Chuyển đến slide tiếp theo hoặc hoàn thành onboarding
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi user nhấn nút "Tiếp" hoặc "Bắt đầu"
   */
  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // Đánh dấu đã xem onboarding
      setIsFirstLaunch(false);
      navigation.replace('Login');
    }
  };

  /**
   * Mục đích: Bỏ qua onboarding, đi thẳng tới Login
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi user nhấn nút "Bỏ qua"
   */
  const handleSkip = () => {
    setIsFirstLaunch(false);
    navigation.replace('Login');
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;
  const currentColor = SLIDES[currentIndex].color;

  return (
    <View style={styles.container}>
      {/* Nút bỏ qua - fade in */}
      <Animated.View
        entering={FadeIn.delay(500).duration(500)}
        style={styles.skipContainer}>
        <AppButton variant="ghost" onPress={handleSkip}>
          <AppText className="text-neutrals400 text-base">Bỏ qua</AppText>
        </AppButton>
      </Animated.View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScroll={RNAnimated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {useNativeDriver: false},
        )}
        keyExtractor={item => item.id}
        renderItem={({item, index}) => (
          <SlideContent item={item} isActive={index === currentIndex} />
        )}
      />

      {/* Bottom: Dots + Nút */}
      <View style={styles.bottomSection}>
        {/* Dots indicator - animated */}
        <View style={styles.dotsContainer}>
          {SLIDES.map((slide, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 32, 10],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <RNAnimated.View
                key={index}
                style={{
                  width: dotWidth,
                  opacity: dotOpacity,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: slide.color,
                  shadowColor: slide.color,
                  shadowOffset: {width: 0, height: 0},
                  shadowOpacity: 0.5,
                  shadowRadius: 4,
                }}
              />
            );
          })}
        </View>

        {/* Nút chính - gradient + pulse */}
        <Animated.View style={[styles.buttonWrapper, btnAnimStyle]}>
          <LinearGradient
            colors={[currentColor, currentColor + 'CC']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.gradientButton}>
            <AppButton
              variant="ghost"
              className="w-full h-full rounded-2xl"
              onPress={handleNext}>
              <AppText className="text-black font-sans-bold text-lg">
                {isLastSlide ? '🚀 Bắt đầu' : 'Tiếp →'}
              </AppText>
            </AppButton>
          </LinearGradient>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  skipContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 56,
    paddingRight: 16,
  },
  slideContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emojiArea: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  mainEmojiContainer: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainEmojiCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  emojiGlowRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.6,
    shadowRadius: 25,
  },
  decorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 48,
    paddingHorizontal: 32,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
  },
  buttonWrapper: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#4ade80',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  gradientButton: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
