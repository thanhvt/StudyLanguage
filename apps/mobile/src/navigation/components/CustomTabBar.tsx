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
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {LiquidGlassView, isLiquidGlassSupported} from '@/utils/LiquidGlass';
import {useHaptic} from '@/hooks/useHaptic';
import {SKILL_COLORS} from '@/config/skillColors';

// ============================================================
// Cấu hình tab: tên hiển thị, icon Lucide, màu đặc trưng
// Fix #3: Home dùng orange (#f97316) thay vì green trùng Speaking
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
    activeColor: '#f97316', // Fix #3: Orange — distinct identity, warm welcoming
  },
  History: {
    label: 'Lịch sử',
    icon: Clock,
    activeColor: '#14b8a6', // Teal — distinct, history/timeline feel
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
 * Mục đích: Detect thiết bị iPad/tablet dựa trên kích thước màn hình
 * Tham số đầu vào: không có (dùng useWindowDimensions)
 * Tham số đầu ra: boolean
 * Khi nào sử dụng: Scale icon size cho iPad cho nét hơn
 * Fix #10: Threshold >= 744 để bắt iPad Mini portrait (744px)
 */
function useIsTablet() {
  const {width} = useWindowDimensions();
  return width >= 744; // Fix #10: iPad Mini portrait = 744px
}

/**
 * Mục đích: Glassmorphism focus ring — dùng LiquidGlassView trên iOS 26+,
 *           fallback gradient circle trên iOS cũ / Android
 * Tham số đầu vào: activeColor, size, isDark, children (icon)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Bao quanh icon khi tab đang focused
 */
function GlassIconRing({
  activeColor,
  size,
  isDark,
  children,
}: {
  activeColor: string;
  size: number;
  isDark: boolean;
  children: React.ReactNode;
}) {
  // iOS 26+ → LiquidGlassView native
  // Fix #1: Dynamic colorScheme thay vì hardcode "dark"
  if (isLiquidGlassSupported) {
    return (
      <LiquidGlassView
        effect="clear"
        tintColor={activeColor}
        colorScheme={isDark ? 'dark' : 'light'}
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

  // Android / iOS < 26 fallback → gradient border ring
  // Fix #11: Dùng theme-aware background thay vì solid dark
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: isDark ? 'rgba(20,20,20,0.7)' : 'rgba(255,255,255,0.7)',
      }}>
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
  const haptic = useHaptic(); // Fix #6: Haptic feedback

  // Fix A: Pixel-aligned sizes — tránh sub-pixel rendering gây blur
  // Dùng số chẵn để stroke SVG khớp pixel grid
  const iconSizeBase = isTablet ? 36 : 24;
  // Fix B: Focused icon to hơn ở native resolution thay vì scale transform
  const iconSize = isFocused ? iconSizeBase + (isTablet ? 4 : 2) : iconSizeBase;
  const glowSize = isTablet ? 64 : 44;

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

  // Fix B: Không dùng animated scale cho icon — tránh blur do rasterization
  // Icon size thay đổi trực tiếp (native resolution) khi focus/unfocus
  const iconContainerStyle = useAnimatedStyle(() => ({
    opacity: 0.85 + focusProgress.value * 0.15, // Subtle brightness boost khi focused
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

  /**
   * Mục đích: Xử lý nhấn tab — gọi onPress + haptic feedback
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi user nhấn vào tab item
   * Fix #6: Thêm haptic feedback khi chuyển tab
   */
  const handlePress = () => {
    haptic.light(); // Fix #6: Haptic feedback nhẹ khi chuyển tab
    onPress();
  };

  // Fix #5: Inactive icon dùng neutral gray thay vì opacity-based color
  const inactiveIconColor = isDark ? '#6b7280' : '#9ca3af';
  const iconColor = isFocused ? config.activeColor : inactiveIconColor;

  // Fix #5: Label inactive cũng neutral gray, tăng contrast
  const inactiveLabelColor = isDark ? '#6b7280' : '#9ca3af';
  const labelColor = isFocused ? config.activeColor : inactiveLabelColor;

  // Fix A: Stroke width pixel-aligned — dùng số nguyên hoặc .5 để khớp pixel grid
  // Số lẻ (1.8, 2.2) gây anti-aliasing blur trên SVG
  const strokeWidth = isTablet
    ? (isFocused ? 3 : 2.5)
    : (isFocused ? 2.5 : 2);

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
            <GlassIconRing activeColor={config.activeColor} size={glowSize} isDark={isDark}>
              {/* Trống — icon render bên ngoài ring để luôn sắc nét */}
              <View />
            </GlassIconRing>
          </Animated.View>

          {/* Icon — render trên layer cao nhất, không dùng scale transform */}
          {/* Fix B: collapsable={false} tránh layer merging gây mất nét */}
          <Animated.View
            style={iconContainerStyle}
            collapsable={false}
            renderToHardwareTextureAndroid={true}>
            <IconComponent
              size={iconSize}
              color={iconColor}
              strokeWidth={strokeWidth}
            />
          </Animated.View>
        </View>

        {/* Label — Fix #7: Active bold 700 vs Inactive 500 */}
        <AppText
          style={[
            styles.label,
            {
              color: labelColor,
              fontWeight: isFocused ? '700' : '500',
              fontSize: isTablet
                ? (isFocused ? 14 : 13)
                : (isFocused ? 11 : 10),
            },
          ]}
          numberOfLines={1}>
          {config.label}
        </AppText>

        {/* Dot indicator — Fix #9: Tăng 4px → 5px */}
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
 *   - Background: LiquidGlassView (iOS 26+) / Gradient blur fallback
 *   - Focus ring: LiquidGlassView (iOS 26+) / Gradient border (fallback)
 *   - 6 tabs: Trang chủ, Lịch sử, Nghe, Nói, Đọc, Thêm
 */
const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  // Fix #8: Dùng useSafeAreaInsets thay hardcode paddingBottom
  const insets = useSafeAreaInsets();
  // Fix #1 + #2: Detect dark/light mode
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Fix #11: Background gradient colors theo theme
  const fallbackBgColor = isDark
    ? 'rgba(10,10,10,0.95)'
    : 'rgba(245,245,245,0.92)';

  // Fix #11: Top gradient overlay theo theme
  const gradientOverlayColors = isDark
    ? ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.01)', 'transparent']
    : ['rgba(0,0,0,0.04)', 'rgba(0,0,0,0.01)', 'transparent'];

  // Fix #11: Top border colors theo theme
  const topBorderColors = isDark
    ? ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.03)', 'transparent']
    : ['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.02)', 'transparent'];

  return (
    <View
      style={[
        styles.container,
        // Fix #8: Dynamic paddingBottom dựa trên safe area
        {paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 8)},
      ]}>
      {/* Lớp 1: Native glass/blur background */}
      {/* Fix #1: Dynamic colorScheme | Fix #2 + #11: Theme-aware fallback */}
      {isLiquidGlassSupported ? (
        <LiquidGlassView
          effect="regular"
          colorScheme={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, {backgroundColor: fallbackBgColor}]} />
      )}

      {/* Lớp 2: Gradient overlay — depth + ánh sáng phản chiếu ở đỉnh */}
      {/* Fix #11: Gradient colors dynamic theo theme */}
      <LinearGradient
        colors={gradientOverlayColors}
        locations={[0, 0.15, 1]}
        style={[StyleSheet.absoluteFill, {height: 20}]}
      />

      {/* Top border sáng — mô phỏng edge light */}
      {/* Fix #11: Border colors dynamic theo theme */}
      <LinearGradient
        colors={topBorderColors}
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
  );
};

const styles = StyleSheet.create({
  // Full-width, không bo tròn, overflow hidden cho blur layers
  // Fix #8: paddingBottom được set dynamic inline thay vì hardcode
  container: {
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
    marginTop: 2,
    textAlign: 'center',
  },
  // Fix #9: Dot indicator tăng 4px → 5px
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },
});

export default CustomTabBar;
