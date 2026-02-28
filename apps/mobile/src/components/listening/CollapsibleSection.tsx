import React, {useState} from 'react';
import {LayoutAnimation, Platform, TouchableOpacity, UIManager, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useHaptic} from '@/hooks/useHaptic';

// Bật LayoutAnimation cho Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CollapsibleSectionProps {
  /** Tiêu đề section */
  title: string;
  /** Emoji hoặc icon prefix */
  icon?: string;
  /** Nội dung bên trong */
  children: React.ReactNode;
  /** Mở mặc định hay không */
  defaultExpanded?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Mục đích: Section có thể mở/đóng với animation mượt
 * Tham số đầu vào:
 *   - title: tiêu đề section
 *   - icon: emoji prefix
 *   - children: nội dung collapse
 *   - defaultExpanded: mở mặc định (false)
 *   - disabled: có disable không
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ConfigScreen → group optional configs (Keywords, VN toggle)
 */
export default function CollapsibleSection({
  title,
  icon,
  children,
  defaultExpanded = false,
  disabled = false,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const rotation = useSharedValue(defaultExpanded ? 1 : 0);
  const haptic = useHaptic();
  const colors = useColors();

  /**
   * Mục đích: Toggle mở/đóng section
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn header section
   */
  const toggle = () => {
    if (disabled) return;
    haptic.light();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => !prev);
    rotation.value = withSpring(expanded ? 0 : 1, {
      damping: 15,
      stiffness: 200,
    });
  };

  // Animation xoay chevron 0 → 180 độ
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${rotation.value * 180}deg`}],
  }));

  return (
    <View>
      <TouchableOpacity
        className="flex-row items-center justify-between py-3"
        onPress={toggle}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityLabel={`${title}, ${expanded ? 'đang mở' : 'đang đóng'}. Nhấn để ${expanded ? 'đóng' : 'mở'}`}
        accessibilityRole="button">
        <View className="flex-row items-center">
          {icon && <AppText className="mr-2 text-base">{icon}</AppText>}
          <AppText className="text-foreground font-sans-semibold text-base">
            {title}
          </AppText>
        </View>
        <Animated.View style={chevronStyle}>
          <Icon name="ChevronDown" className="w-5 h-5 text-neutrals400" />
        </Animated.View>
      </TouchableOpacity>

      {/* Nội dung collapsible */}
      {expanded && <View className="pb-2">{children}</View>}
    </View>
  );
}
