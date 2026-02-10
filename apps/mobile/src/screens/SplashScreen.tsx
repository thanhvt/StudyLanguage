import React, {useEffect, useRef} from 'react';
import {View, Animated, Easing} from 'react-native';
import {AppText} from '@/components/ui';

/**
 * Mục đích: Màn hình chờ khi khởi động app, hiển thị logo + animation
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Hiển thị khi app khởi động, trước khi kiểm tra auth state
 *   - RootNavigator: hiển thị khi isInitialized = false trong authStore
 */
export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animation xuất hiện logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{scale: scaleAnim}],
        }}
        className="items-center">
        {/* Logo placeholder - icon ngôn ngữ */}
        <View className="w-24 h-24 bg-primary rounded-3xl items-center justify-center mb-6">
          <AppText className="text-5xl">🎧</AppText>
        </View>
        <AppText
          variant={'heading1'}
          className="text-3xl font-sans-bold text-foreground">
          StudyLanguage
        </AppText>
        <AppText className="text-neutrals400 mt-2 text-base">
          Học ngôn ngữ thông minh
        </AppText>
      </Animated.View>
    </View>
  );
}
