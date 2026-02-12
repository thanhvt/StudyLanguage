import React from 'react';
import {Pressable, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {cn} from '@/utils';
import {AppText, Icon} from '@/components/ui';
import type {IconName} from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';

/**
 * Mục đích: Card hiển thị feature/quick action trên Dashboard
 * Tham số đầu vào:
 *   - icon: tên icon từ lucide-react-native
 *   - title: tiêu đề feature
 *   - subtitle: mô tả ngắn
 *   - onPress: callback khi nhấn
 *   - iconColor: màu icon (mặc định: primary)
 *   - className: custom class
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   - Dashboard quick actions (Listening, Speaking, Reading...)
 *   - Style_Convention §1.3 FeatureCard
 */

interface FeatureCardProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress: () => void;
  iconColor?: string;
  className?: string;
  disabled?: boolean;
}

export default function FeatureCard({
  icon,
  title,
  subtitle,
  onPress,
  iconColor,
  className,
  disabled = false,
}: FeatureCardProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  // Animation: scale 0.95x khi nhấn, 150ms — theo UI_Design_System §7
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  /**
   * Mục đích: Xử lý nhấn xuống (press in)
   * Tham số đầu vào: không có
   * Tham số đầu ra: không có
   * Khi nào sử dụng: Khi người dùng chạm vào card
   */
  const handlePressIn = () => {
    scale.value = withSpring(0.95, {damping: 15, stiffness: 300});
  };

  /**
   * Mục đích: Xử lý nhả tay (press out)
   * Tham số đầu vào: không có
   * Tham số đầu ra: không có
   * Khi nào sử dụng: Khi người dùng nhả tay khỏi card
   */
  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 15, stiffness: 300});
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={animatedStyle}
        className={cn(
          'flex-row items-center p-md rounded-card',
          disabled && 'opacity-50',
          className,
        )}
      >
        {/* Icon bên trái */}
        <View
          className="w-12 h-12 rounded-xl items-center justify-center mr-md"
          style={{backgroundColor: (iconColor ?? colors.primary) + '1A'}} // 10% opacity
        >
          <Icon
            name={icon}
            className="w-6 h-6"
            style={{color: iconColor ?? colors.primary}}
          />
        </View>

        {/* Nội dung */}
        <View className="flex-1">
          <AppText variant="body" weight="semibold" className="text-foreground" raw>
            {title}
          </AppText>
          {subtitle && (
            <AppText variant="bodySmall" className="text-neutrals200 mt-0.5" raw>
              {subtitle}
            </AppText>
          )}
        </View>

        {/* Mũi tên phải */}
        <Icon
          name="ChevronRight"
          className="w-5 h-5 text-neutrals300"
        />
      </Animated.View>
    </Pressable>
  );
}
