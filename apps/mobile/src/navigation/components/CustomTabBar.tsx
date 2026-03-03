import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
  useWindowDimensions,
  useColorScheme,
} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {
  Home,
  Clock,
  Headphones,
  MessageCircle,
  BookOpen,
  Menu,
} from 'lucide-react-native';
import {AppText} from '@/components/ui';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useHaptic} from '@/hooks/useHaptic';
import {SKILL_COLORS} from '@/config/skillColors';

// ============================================================
// Cấu hình tab — Option C: Hybrid Floating + Active Expand
// ============================================================
const TAB_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{size: number; color: string; strokeWidth?: number}>;
    activeColor: string;
  }
> = {
  Home: {
    label: 'Trang chủ',
    icon: Home,
    activeColor: '#f97316',
  },
  History: {
    label: 'Lịch sử',
    icon: Clock,
    activeColor: '#14b8a6',
  },
  Listening: {
    label: 'Nghe',
    icon: Headphones,
    activeColor: SKILL_COLORS.listening.dark,
  },
  Speaking: {
    label: 'Nói',
    icon: MessageCircle,
    activeColor: SKILL_COLORS.speaking.dark,
  },
  Reading: {
    label: 'Đọc',
    icon: BookOpen,
    activeColor: SKILL_COLORS.reading.dark,
  },
  More: {
    label: 'Thêm',
    icon: Menu,
    activeColor: '#a3a3a3',
  },
};

/**
 * Mục đích: Detect thiết bị iPad/tablet
 * Tham số đầu vào: không có
 * Tham số đầu ra: boolean
 * Khi nào sử dụng: Responsive sizing cho iPad
 */
function useIsTablet() {
  const {width} = useWindowDimensions();
  return width >= 744;
}

/**
 * Mục đích: Animated tab item — Option C: Hybrid Expand
 *   Active: expand pill với icon + label, nền tinted nhẹ
 *   Inactive: icon only, compact
 * Tham số đầu vào: routeName, isFocused, isDark, onPress, onLongPress
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Render mỗi tab item trong CustomTabBar
 */
function AnimatedTabItem({
  routeName,
  isFocused,
  isDark,
  onPress,
  onLongPress,
  accessibilityLabel,
  testID,
}: {
  routeName: string;
  isFocused: boolean;
  isDark: boolean;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityLabel?: string;
  testID?: string;
}) {
  const config = TAB_CONFIG[routeName] || TAB_CONFIG.Home;
  const IconComponent = config.icon;
  const isTablet = useIsTablet();
  const haptic = useHaptic();

  // Pixel-aligned sizes — iPad lớn hơn đáng kể
  const iconSize = isTablet ? 28 : 22;

  // Animated values
  const pressScale = useSharedValue(1);
  const focusProgress = useSharedValue(isFocused ? 1 : 0);

  React.useEffect(() => {
    focusProgress.value = withTiming(isFocused ? 1 : 0, {duration: 300});
  }, [isFocused, focusProgress]);

  // Press scale
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{scale: pressScale.value}],
    // Active tab chiếm flex lớn hơn (expand effect) — iPad rộng hơn
    flex: interpolate(focusProgress.value, [0, 1], [1, isTablet ? 2.2 : 1.8]),
  }));

  // Pill tinted background - opacity animation
  const pillStyle = useAnimatedStyle(() => ({
    opacity: focusProgress.value,
    transform: [{scale: 0.8 + focusProgress.value * 0.2}],
  }));

  // Label opacity + translate — iPad luôn hiện label inactive
  const labelStyle = useAnimatedStyle(() => {
    if (isTablet) {
      // iPad: label luôn visible, chỉ bold/opacity thay đổi
      return {
        opacity: 0.5 + focusProgress.value * 0.5,
        maxWidth: 100,
        marginLeft: 8,
      };
    }
    // iPhone: label expand từ 0
    return {
      opacity: focusProgress.value,
      maxWidth: interpolate(focusProgress.value, [0, 1], [0, 100]),
      marginLeft: interpolate(focusProgress.value, [0, 1], [0, 6]),
    };
  });

  const handlePressIn = () => {
    pressScale.value = withSpring(0.9, {damping: 15, stiffness: 300});
  };
  const handlePressOut = () => {
    pressScale.value = withSpring(1, {damping: 12, stiffness: 200});
  };

  const handlePress = () => {
    haptic.light();
    onPress();
  };

  // Màu icon
  const inactiveColor = isDark ? '#6b7280' : '#9ca3af';
  const iconColor = isFocused ? config.activeColor : inactiveColor;
  const strokeWidth = isFocused ? 2.5 : 2;

  // Pill tinted bg — màu skill rất nhẹ
  const pillBgColor = isDark
    ? `${config.activeColor}25`
    : `${config.activeColor}18`;

  // iPad: label dùng màu khác cho active vs inactive
  const labelColor = isFocused ? config.activeColor : inactiveColor;

  return (
    <Animated.View style={[styles.tabItem, containerStyle]}>
      <TouchableOpacity
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityState={isFocused ? {selected: true} : {}}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        onPress={handlePress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}>
        {/* Pill container — icon + label ngang */}
        <View style={styles.pillWrapper}>
          {/* Tinted pill background — chỉ hiện khi active */}
          <Animated.View
            style={[
              styles.pillBg,
              {backgroundColor: pillBgColor, borderColor: `${config.activeColor}30`},
              pillStyle,
            ]}
          />

          {/* Icon */}
          <IconComponent
            size={iconSize}
            color={iconColor}
            strokeWidth={strokeWidth}
          />

          {/* Label — iPhone: expand khi active / iPad: luôn hiện */}
          <Animated.View style={[styles.labelContainer, labelStyle]}>
            <AppText
              style={[
                styles.label,
                {
                  color: labelColor,
                  fontSize: isTablet ? 14 : 11,
                  fontWeight: isFocused ? '700' : '500',
                },
              ]}
              numberOfLines={1}>
              {config.label}
            </AppText>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * Mục đích: Custom tab bar — Option C: Hybrid Floating + Active Expand
 *   Floating capsule, active tab expand thành pill có label
 *   Inactive = icon only, compact. 6 tabs fit tốt
 * Tham số đầu vào: BottomTabBarProps
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Truyền vào Tab.Navigator qua tabBar prop
 */
const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isTablet = useIsTablet();

  // iPad: rộng hơn, centered
  const maxWidth = isTablet ? 750 : undefined;

  return (
    <View
      style={[
        styles.outerContainer,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          // Dark mode: nền ngoài đồng nhất với pill → liền mạch
          backgroundColor: isDark ? '#191919' : 'transparent',
        },
      ]}>
      {/* Đường kẻ phân cách phía trên — chỉ dark mode */}
      {isDark && (
        <View style={{height: 0.5, backgroundColor: 'rgba(255,255,255,0.06)'}} />
      )}
      <View
        style={[
          styles.pillContainer,
          {
            width: '100%',
            backgroundColor: isDark ? '#191919' : '#FFFFFF',
            ...(isDark
              ? {}
              : {
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.08,
                  shadowRadius: 20,
                  elevation: 8,
                }),
            ...(maxWidth ? {maxWidth, alignSelf: 'center' as const} : {}),
          },
        ]}>
        <View style={styles.tabRow}>
          {state.routes.map((route, index) => {
            const {options} = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({type: 'tabLongPress', target: route.key});
            };

            return (
              <AnimatedTabItem
                key={route.key}
                routeName={route.name}
                isFocused={isFocused}
                isDark={isDark}
                onPress={onPress}
                onLongPress={onLongPress}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarButtonTestID}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  pillContainer: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  tabRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
  },
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    width: '100%',
  },
  // Pill wrapper — horizontal layout (icon + label)
  pillWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  // Tinted pill background — absolute, bo tròn
  pillBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 1,
  },
  // Label container — overflow hidden cho expand animation
  labelContainer: {
    overflow: 'hidden',
  },
  label: {
    textAlign: 'center',
  },
});

export default CustomTabBar;
