import React, {useEffect, useState} from 'react';
import {View, LayoutChangeEvent} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import {AppText} from '@/components/ui';

interface MarqueeTextProps {
  /** Nội dung text hiển thị */
  text: string;
  /** Tốc độ cuộn (pixels/giây) — mặc định 30 */
  speed?: number;
  /** Khoảng cách giữa 2 lần lặp text (px) — mặc định 80 */
  gap?: number;
  /** Style cho text */
  textClassName?: string;
  /** Màu chữ */
  textColor?: string;
  /** Font size (mặc định 14) */
  fontSize?: number;
}

/**
 * Mục đích: Hiển thị text chạy (marquee) khi text dài hơn container.
 *   Nếu text ngắn → hiển thị bình thường, căn giữa.
 *   Nếu text dài → cuộn liên tục từ phải sang trái.
 * Tham số đầu vào: text (string), speed, gap, textClassName, textColor, fontSize
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: PlayerScreen header title → text dài cần cuộn
 */
export default function MarqueeText({
  text,
  speed = 30,
  gap = 80,
  textClassName = 'font-sans-bold text-base',
  textColor = '#FFFFFF',
  fontSize = 16,
}: MarqueeTextProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const translateX = useSharedValue(0);

  // Kiểm tra text có cần cuộn không
  const shouldScroll = textWidth > containerWidth && containerWidth > 0;

  /**
   * Mục đích: Khởi động animation cuộn khi text overflow
   * Tham số đầu vào: shouldScroll, textWidth, containerWidth, speed, gap
   * Tham số đầu ra: void (cập nhật translateX shared value)
   * Khi nào sử dụng: textWidth hoặc containerWidth thay đổi
   */
  useEffect(() => {
    if (!shouldScroll) {
      cancelAnimation(translateX);
      translateX.value = 0;
      return;
    }

    // Tổng khoảng cách di chuyển: text width + gap
    const totalDistance = textWidth + gap;
    // Thời gian di chuyển dựa trên tốc độ
    const duration = (totalDistance / speed) * 1000;

    translateX.value = 0;
    translateX.value = withRepeat(
      withTiming(-totalDistance, {
        duration,
        easing: Easing.linear,
      }),
      -1, // Lặp vô hạn
      false, // Không đảo chiều
    );

    return () => {
      cancelAnimation(translateX);
    };
  }, [shouldScroll, textWidth, containerWidth, speed, gap, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }));

  /**
   * Mục đích: Đo kích thước container
   * Tham số đầu vào: LayoutChangeEvent
   * Tham số đầu ra: void (set containerWidth)
   * Khi nào sử dụng: View container onLayout
   */
  const onContainerLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  /**
   * Mục đích: Đo kích thước text thực tế
   * Tham số đầu vào: LayoutChangeEvent
   * Tham số đầu ra: void (set textWidth)
   * Khi nào sử dụng: Text hidden onLayout
   */
  const onTextLayout = (e: LayoutChangeEvent) => {
    setTextWidth(e.nativeEvent.layout.width);
  };

  // Text ngắn → hiển thị bình thường, căn giữa
  if (!shouldScroll) {
    return (
      <View
        style={{overflow: 'hidden', flex: 1}}
        onLayout={onContainerLayout}>
        <AppText
          className={textClassName}
          style={{color: textColor, fontSize, textAlign: 'center'}}
          numberOfLines={1}
          onLayout={onTextLayout}>
          {text}
        </AppText>
      </View>
    );
  }

  // Text dài → marquee cuộn
  return (
    <View
      style={{overflow: 'hidden', flex: 1}}
      onLayout={onContainerLayout}>
      {/* Text ẩn để đo kích thước */}
      <AppText
        style={{position: 'absolute', opacity: 0, fontSize}}
        onLayout={onTextLayout}>
        {text}
      </AppText>

      {/* Animated container — 2 bản text nối nhau */}
      <Animated.View
        style={[
          {flexDirection: 'row', alignItems: 'center'},
          animatedStyle,
        ]}>
        {/* Bản 1 */}
        <AppText
          className={textClassName}
          style={{color: textColor, fontSize}}
          numberOfLines={1}>
          {text}
        </AppText>
        {/* Gap giữa 2 bản */}
        <View style={{width: gap}} />
        {/* Bản 2 — tạo hiệu ứng cuộn liên tục */}
        <AppText
          className={textClassName}
          style={{color: textColor, fontSize}}
          numberOfLines={1}>
          {text}
        </AppText>
      </Animated.View>
    </View>
  );
}
