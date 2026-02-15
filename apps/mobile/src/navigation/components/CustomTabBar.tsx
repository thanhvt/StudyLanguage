import React from 'react';
import {TouchableOpacity, View, StyleSheet, Platform, useWindowDimensions} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {
  Home,
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
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {SKILL_COLORS} from '@/config/skillColors';

// Cấu hình tab: tên, icon, màu đặc trưng
const TAB_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{size: number; color: string; strokeWidth?: number}>;
    activeColor: string;
    inactiveColor: string;
  }
> = {
  Home: {
    label: 'Trang chủ',
    icon: Home,
    activeColor: '#4ade80',
    inactiveColor: 'rgba(74, 222, 128, 0.35)',
  },
  Listening: {
    label: 'Nghe',
    icon: Headphones,
    activeColor: SKILL_COLORS.listening.dark,
    inactiveColor: 'rgba(99, 102, 241, 0.35)',
  },
  Speaking: {
    label: 'Nói',
    icon: MessageCircle,
    activeColor: SKILL_COLORS.speaking.dark,
    inactiveColor: 'rgba(74, 222, 128, 0.35)',
  },
  Reading: {
    label: 'Đọc',
    icon: BookOpen,
    activeColor: SKILL_COLORS.reading.dark,
    inactiveColor: 'rgba(251, 191, 36, 0.35)',
  },
  More: {
    label: 'Thêm',
    icon: Menu,
    activeColor: '#a3a3a3',
    inactiveColor: 'rgba(163, 163, 163, 0.35)',
  },
};

/**
 * Mục đích: Detect thiết bị iPad/tablet dựa trên kích thước màn hình
 * Tham số đầu vào: width (number)
 * Tham số đầu ra: boolean
 * Khi nào sử dụng: Scale icon size cho iPad để tránh bị mờ
 */
function useIsTablet() {
  const {width} = useWindowDimensions();
  return width >= 768; // iPad width breakpoint
}

/**
 * Mục đích: Animated tab item với 3 trạng thái + glassmorphism glow
 * Tham số đầu vào: routeName, isFocused, onPress, onLongPress
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Render mỗi tab trong CustomTabBar
 *   - Unfocus: icon màu dimmed tint, không glow, không dot
 *   - Focus: icon full color, GLASS glow circle (gradient border), dot, scale 1.1
 *   - Press: scale 0.85 bounce
 */
function AnimatedTabItem({
  routeName,
  isFocused,
  onPress,
  onLongPress,
  accessibilityLabel,
  testID,
}: {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityLabel?: string;
  testID?: string;
}) {
  const config = TAB_CONFIG[routeName] || TAB_CONFIG.Home;
  const IconComponent = config.icon;
  const isTablet = useIsTablet();

  // Kích thước icon responsive: iPad lớn hơn, nét hơn
  const iconSize = isTablet ? 28 : 22;
  const glowSize = isTablet ? 52 : 42;

  // Animated values
  const focusProgress = useSharedValue(isFocused ? 1 : 0);
  const pressScale = useSharedValue(1);

  // Cập nhật focus animation khi isFocused thay đổi
  React.useEffect(() => {
    focusProgress.value = withTiming(isFocused ? 1 : 0, {duration: 300});
  }, [isFocused, focusProgress]);

  // Animated style cho container (scale)
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{scale: pressScale.value}],
  }));

  // Animated style cho glassmorphism glow ring
  const glowStyle = useAnimatedStyle(() => ({
    opacity: focusProgress.value,
    transform: [{scale: 0.7 + focusProgress.value * 0.3}],
  }));

  // Animated style cho dot
  const dotStyle = useAnimatedStyle(() => ({
    opacity: focusProgress.value,
    transform: [{scale: focusProgress.value}],
  }));

  // Animated style cho icon scale khi focus
  const iconContainerStyle = useAnimatedStyle(() => ({
    transform: [{scale: 1 + focusProgress.value * 0.1}],
  }));

  /**
   * Mục đích: Xử lý nhấn + animation press
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi user nhấn vào tab
   */
  const handlePressIn = () => {
    pressScale.value = withSpring(0.85, {damping: 15, stiffness: 300});
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, {damping: 12, stiffness: 200});
  };

  // Xác định màu icon — active dùng strokeWidth dày hơn cho nét
  const iconColor = isFocused ? config.activeColor : config.inactiveColor;
  const labelColor = isFocused ? config.activeColor : '#5e5e5e';

  return (
    <Animated.View style={[styles.tabItem, containerStyle]}>
      <TouchableOpacity
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityState={isFocused ? {selected: true} : {}}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}>
        {/* Icon wrapper — glow chỉ bao quanh icon */}
        <View style={[styles.iconWrapper, {width: glowSize, height: glowSize}]}>
          {/* Glassmorphism glow ring — gradient border + translucent fill */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: glowSize,
                height: glowSize,
                borderRadius: glowSize / 2,
              },
              glowStyle,
            ]}>
            {/* Lớp ngoài: gradient border ring */}
            <LinearGradient
              colors={[
                `${config.activeColor}50`, // viền trên sáng hơn
                `${config.activeColor}15`, // viền dưới mờ hơn
              ]}
              start={{x: 0.5, y: 0}}
              end={{x: 0.5, y: 1}}
              style={{
                width: glowSize,
                height: glowSize,
                borderRadius: glowSize / 2,
                padding: 1.5, // chiều dày viền gradient
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {/* Lớp trong: fill bán trong suốt (frosted glass) */}
              <View
                style={{
                  flex: 1,
                  width: '100%',
                  borderRadius: glowSize / 2,
                  backgroundColor: `${config.activeColor}12`, // fill cực nhạt
                }}
              />
            </LinearGradient>
            {/* Lớp glow bên ngoài — shadow mềm */}
            <View
              style={{
                position: 'absolute',
                width: glowSize + 8,
                height: glowSize + 8,
                borderRadius: (glowSize + 8) / 2,
                top: -4,
                left: -4,
                backgroundColor: `${config.activeColor}08`, // glow rất nhẹ bên ngoài
              }}
            />
          </Animated.View>

          {/* Icon — strokeWidth dày hơn khi active cho nét hơn trên iPad */}
          <Animated.View style={iconContainerStyle}>
            <IconComponent
              size={iconSize}
              color={iconColor}
              strokeWidth={isFocused ? 2.2 : 1.8}
            />
          </Animated.View>
        </View>

        {/* Label */}
        <AppText
          style={[
            styles.label,
            {
              color: labelColor,
              fontSize: isTablet ? 12 : 10,
            },
          ]}
          numberOfLines={1}>
          {config.label}
        </AppText>

        {/* Dot indicator */}
        <Animated.View
          style={[
            styles.dot,
            {backgroundColor: config.activeColor},
            dotStyle,
          ]}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * Mục đích: Custom tab bar glassmorphism full-width cho bottom navigation
 * Tham số đầu vào: BottomTabBarProps (state, descriptors, navigation)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Được truyền vào Tab.Navigator qua tabBar prop
 *   - 5 tabs: Trang chủ, Nghe, Nói, Đọc, Thêm
 *   - Multi-layer glass gradient + Reanimated animations
 *   - Colored icons per skill, glassmorphism focus circle chỉ quanh icon
 */
const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  return (
    <View style={styles.container}>
      {/* Lớp 1: Base gradient — tạo depth */}
      <LinearGradient
        colors={['rgba(28,28,28,0.97)', 'rgba(8,8,8,0.95)']}
        style={StyleSheet.absoluteFill}
      />

      {/* Lớp 2: Highlight gradient ở top edge — giả lập ánh sáng phản chiếu */}
      <LinearGradient
        colors={[
          'rgba(255,255,255,0.06)', // ánh sáng nhẹ ở đỉnh
          'rgba(255,255,255,0.02)', // fade nhanh
          'transparent',
        ]}
        locations={[0, 0.3, 1]}
        style={[StyleSheet.absoluteFill, {height: 24}]}
      />

      {/* Top border — viền gradient sáng subtle */}
      <LinearGradient
        colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)', 'transparent']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.topBorder}
      />

      {/* Tab items */}
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
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <AnimatedTabItem
              key={route.key}
              routeName={route.name}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Container: full-width, không bo tròn, overflow hidden cho layers
  container: {
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    overflow: 'hidden',
  },
  // Top border mô phỏng viền glass sáng
  topBorder: {
    height: StyleSheet.hairlineWidth * 2,
  },
  tabRow: {
    flexDirection: 'row',
    paddingTop: 6,
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    width: '100%',
  },
  // Wrapper cho icon + glow = glow chỉ bao quanh icon
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  label: {
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  // Dot nhỏ dưới label
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});

export default CustomTabBar;
