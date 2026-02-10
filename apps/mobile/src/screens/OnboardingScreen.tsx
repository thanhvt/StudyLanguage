import React, {useRef, useState} from 'react';
import {
  View,
  FlatList,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {AppButton, AppText} from '@/components/ui';
import {useAppStore} from '@/store/useAppStore';

const {width} = Dimensions.get('window');

// Nội dung 3 slides onboarding
const SLIDES = [
  {
    id: '1',
    emoji: '🎧',
    title: 'Luyện Nghe',
    subtitle: 'Nghe hội thoại AI tạo theo chủ đề bạn chọn',
  },
  {
    id: '2',
    emoji: '🗣️',
    title: 'Luyện Nói',
    subtitle: 'Hội thoại với AI và nhận phản hồi phát âm',
  },
  {
    id: '3',
    emoji: '📖',
    title: 'Luyện Đọc',
    subtitle: 'Đọc bài viết phù hợp trình độ với từ vựng nổi bật',
  },
];

/**
 * Mục đích: Màn hình giới thiệu app cho người dùng mới (3 slides)
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
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const setIsFirstLaunch = useAppStore(state => state.setIsFirstLaunch);

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

  return (
    <View className="flex-1 bg-background">
      {/* Nút bỏ qua */}
      <View className="flex-row justify-end p-4 pt-safe-offset-4">
        <AppButton variant="ghost" onPress={handleSkip}>
          <AppText className="text-neutrals400 text-base">Bỏ qua</AppText>
        </AppButton>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {useNativeDriver: false},
        )}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View
            style={{width}}
            className="flex-1 items-center justify-center px-8">
            <View className="w-32 h-32 bg-neutrals900 rounded-full items-center justify-center mb-8">
              <AppText className="text-6xl">{item.emoji}</AppText>
            </View>
            <AppText
              variant={'heading1'}
              className="text-3xl font-sans-bold text-foreground text-center mb-4">
              {item.title}
            </AppText>
            <AppText className="text-neutrals400 text-center text-lg leading-7">
              {item.subtitle}
            </AppText>
          </View>
        )}
      />

      {/* Dots + Nút tiếp */}
      <View className="items-center pb-safe-offset-8 px-8">
        {/* Dots indicator */}
        <View className="flex-row mb-8 gap-2">
          {SLIDES.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={{
                  width: dotWidth,
                  opacity: dotOpacity,
                }}
                className="h-2 rounded-full bg-primary"
              />
            );
          })}
        </View>

        {/* Nút chính */}
        <AppButton
          variant="primary"
          className="w-full rounded-2xl"
          onPress={handleNext}>
          <AppText className="text-white font-sans-bold text-lg">
            {isLastSlide ? 'Bắt đầu' : 'Tiếp'}
          </AppText>
        </AppButton>
      </View>
    </View>
  );
}
