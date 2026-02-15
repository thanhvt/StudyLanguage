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
import {BlurView, LiquidGlassView} from '@sbaiahmed1/react-native-blur';
import {SKILL_COLORS} from '@/config/skillColors';

// ============================================================
// Cấu hình tab: tên hiển thị, icon Lucide, màu đặc trưng
// ============================================================
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
 * Tham số đầu vào: không có (dùng useWindowDimensions)
 * Tham số đầu ra: boolean
 * Khi nào sử dụng: Scale icon size cho iPad cho nét hơn
 */
function useIsTablet() {
  const {width} = useWindowDimensions();
  return width >= 768;
}

/**
 * Mục đích: Glassmorphism focus ring — dùng LiquidGlassView trên iOS 26+,
 *           fallback BlurView circle trên iOS cũ / Android
 * Tham số đầu vào: activeColor, size, children (icon)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Bao quanh icon khi tab đang focused
 */
function GlassIconRing({
  activeColor,
  size,
  children,
}: {
  activeColor: string;
  size: number;
  children: React.ReactNode;
}) {
  // iOS 26+ → LiquidGlassView native
  if (Platform.OS === 'ios') {
    return (
      <LiquidGlassView
        glassType="clear"
        glassTintColor={activeColor}
        glassOpacity={0.6}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {children}
      </LiquidGlassView>
    );
  }

  // Android / fallback → BlurView circle + gradient border
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
      <BlurView
        blurType="dark"
        blurAmount={12}
        style={StyleSheet.absoluteFill}
      />
      {/* Gradient border ring */}
      <LinearGradient
        colors={[`${activeColor}40`, `${activeColor}10`]}
        style={[
          StyleSheet.absoluteFill,
          {borderRadius: size / 2, borderWidth: 1.5, borderColor: `${activeColor}30`},
        ]}
      />
      {children}
    </View>
  );
}

/**
 * Mục đích: Animated tab item — 3 trạng thái (unfocus, focus, press)
 *           Focus state dùng GlassIconRing (LiquidGlass / BlurView)
 * Tham số đầu vào: routeName, isFocused, onPress, onLongPress
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Render mỗi tab item trong CustomTabBar
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

  // Kích thước responsive: iPad lớn hơn, nét hơn
  const iconSize = isTablet ? 28 : 22;
  const glowSize = isTablet ? 52 : 42;

  // Animated values
  const focusProgress = useSharedValue(isFocused ? 1 : 0);
  const pressScale = useSharedValue(1);

  // Cập nhật focus animation
  React.useEffect(() => {
    focusProgress.value = withTiming(isFocused ? 1 : 0, {duration: 280});
  }, [isFocused, focusProgress]);

  // Scale container khi press
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{scale: pressScale.value}],
  }));

  // Opacity + scale cho glass ring
  const glowStyle = useAnimatedStyle(() => ({
    opacity: focusProgress.value,
    transform: [{scale: 0.7 + focusProgress.value * 0.3}],
  }));

  // Scale icon khi focus
  const iconContainerStyle = useAnimatedStyle(() => ({
    transform: [{scale: 1 + focusProgress.value * 0.1}],
  }));

  // Dot indicator animation
  const dotStyle = useAnimatedStyle(() => ({
    opacity: focusProgress.value,
    transform: [{scale: focusProgress.value}],
  }));

  /**
   * Mục đích: Press animation — scale down khi nhấn
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: onPressIn / onPressOut
   */
  const handlePressIn = () => {
    pressScale.value = withSpring(0.85, {damping: 15, stiffness: 300});
  };
  const handlePressOut = () => {
    pressScale.value = withSpring(1, {damping: 12, stiffness: 200});
  };

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
          {/* Glassmorphism ring — chỉ hiện khi focused */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: glowSize,
                height: glowSize,
              },
              glowStyle,
            ]}>
            <GlassIconRing activeColor={config.activeColor} size={glowSize}>
              {/* Trống — icon render bên ngoài ring để luôn sắc nét */}
              <View />
            </GlassIconRing>
          </Animated.View>

          {/* Icon — luôn render trên layer cao nhất */}
          <Animated.View style={iconContainerStyle}>
            <IconComponent
              size={iconSize}
              color={iconColor}
              strokeWidth={isFocused ? 2.5 : 1.8}
            />
          </Animated.View>
        </View>

        {/* Label */}
        <AppText
          style={[styles.label, {color: labelColor, fontSize: isTablet ? 12 : 10}]}
          numberOfLines={1}>
          {config.label}
        </AppText>

        {/* Dot indicator */}
        <Animated.View
          style={[styles.dot, {backgroundColor: config.activeColor}, dotStyle]}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * Mục đích: Custom tab bar glassmorphism full-width — native blur background
 * Tham số đầu vào: BottomTabBarProps (state, descriptors, navigation)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Được truyền vào Tab.Navigator qua tabBar prop
 *   - Background: BlurView native + LinearGradient overlay
 *   - Focus ring: LiquidGlassView (iOS 26+) / BlurView (fallback)
 *   - 5 tabs: Trang chủ, Nghe, Nói, Đọc, Thêm
 */
const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  return (
    <View style={styles.container}>
      {/* Lớp 1: Native blur background — glass thật sự */}
      <BlurView
        blurType="dark"
        blurAmount={20}
        style={StyleSheet.absoluteFill}
        reducedTransparencyFallbackColor="rgba(10,10,10,0.95)"
      />

      {/* Lớp 2: Gradient overlay — depth + ánh sáng phản chiếu ở đỉnh */}
      <LinearGradient
        colors={[
          'rgba(255,255,255,0.06)',
          'rgba(255,255,255,0.01)',
          'transparent',
        ]}
        locations={[0, 0.15, 1]}
        style={[StyleSheet.absoluteFill, {height: 20}]}
      />

      {/* Top border sáng — mô phỏng edge light */}
      <LinearGradient
        colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.03)', 'transparent']}
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
            navigation.emit({type: 'tabLongPress', target: route.key});
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
  // Full-width, không bo tròn, overflow hidden cho blur layers
  container: {
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    overflow: 'hidden',
  },
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
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});

export default CustomTabBar;
