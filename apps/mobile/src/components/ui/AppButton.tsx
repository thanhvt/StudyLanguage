import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import React, {JSX, ReactNode, useMemo} from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {useColors} from '@/hooks/useColors.ts';

interface AppButtonProps extends PressableProps {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'outline' | 'link';
  disabled?: boolean;
  loading?: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  textClassname?: string;
  children: ReactNode;
  icon?: JSX.Element;
  /** NativeWind className — giữ lại cho backward compat, merge vào style */
  className?: string;
}

// ========================
// Style maps — tương đương CVA buttonVariants nhưng dùng React Native style
// Tránh hoàn toàn NativeWind CssInterop → không bị mất NavigationContainer context
// ========================

/**
 * Mục đích: Parse className string (TailwindCSS) → React Native ViewStyle
 * Tham số đầu vào: className (string | undefined)
 * Tham số đầu ra: ViewStyle
 * Khi nào sử dụng: Backward compat — callers vẫn truyền className mà AppButton cần xử lý
 */
function parseClassNameToViewStyle(className?: string): ViewStyle {
  if (!className) return {};
  const style: ViewStyle = {};
  const classes = className.split(/\s+/);
  for (const cls of classes) {
    // Width
    if (cls === 'w-full') style.width = '100%';
    // Border radius
    else if (cls === 'rounded-full') style.borderRadius = 9999;
    else if (cls === 'rounded-3xl') style.borderRadius = 24;
    else if (cls === 'rounded-2xl') style.borderRadius = 16;
    else if (cls === 'rounded-xl') style.borderRadius = 12;
    else if (cls === 'rounded-lg') style.borderRadius = 8;
    else if (cls === 'rounded-md') style.borderRadius = 6;
    // Margin
    else if (cls === 'mt-2') style.marginTop = 8;
    else if (cls === 'mt-3') style.marginTop = 12;
    else if (cls === 'mt-4') style.marginTop = 16;
    else if (cls === 'mb-2') style.marginBottom = 8;
    else if (cls === 'mb-3') style.marginBottom = 12;
    else if (cls === 'mb-4') style.marginBottom = 16;
    // Padding override
    else if (cls === 'px-2') style.paddingHorizontal = 8;
    else if (cls === 'px-3') style.paddingHorizontal = 12;
    else if (cls === 'px-6') style.paddingHorizontal = 24;
    else if (cls === 'py-2') style.paddingVertical = 8;
    else if (cls === 'py-3') style.paddingVertical = 12;
  }
  return style;
}

/**
 * Mục đích: Parse textClassname string → React Native TextStyle
 * Tham số đầu vào: textClassname (string | undefined)
 * Tham số đầu ra: TextStyle
 * Khi nào sử dụng: Backward compat — callers truyền textClassname cho font weight/size
 */
function parseTextClassNameToStyle(textClassname?: string): TextStyle {
  if (!textClassname) return {};
  const style: TextStyle = {};
  const classes = textClassname.split(/\s+/);
  for (const cls of classes) {
    // Font family — theo tailwind.config.js fontFamily (SourceSans3)
    if (cls === 'font-sans-bold' || cls === 'font-bold') style.fontFamily = 'SourceSans3-Bold';
    else if (cls === 'font-sans-extrabold') style.fontFamily = 'SourceSans3-ExtraBold';
    else if (cls === 'font-sans-semibold' || cls === 'font-semibold') style.fontFamily = 'SourceSans3-SemiBold';
    else if (cls === 'font-sans-medium' || cls === 'font-medium') style.fontFamily = 'SourceSans3-Medium';
    else if (cls === 'font-sans-regular' || cls === 'font-normal') style.fontFamily = 'SourceSans3-Regular';
    else if (cls === 'font-sans-light') style.fontFamily = 'SourceSans3-Light';
    // Font size — theo tailwind.config.js fontSize
    else if (cls === 'text-xs') style.fontSize = 12;
    else if (cls === 'text-sm') style.fontSize = 13;
    else if (cls === 'text-base') style.fontSize = 14;
    else if (cls === 'text-md') style.fontSize = 16;
    else if (cls === 'text-lg') style.fontSize = 18;
    else if (cls === 'text-xl') style.fontSize = 20;
    else if (cls === 'text-2xl') style.fontSize = 24;
  }
  return style;
}

/**
 * Mục đích: Tính ViewStyle cho container button dựa trên variant + size + state
 * Tham số đầu vào: variant, size, isDisabled, isLoading, colors (theme)
 * Tham số đầu ra: ViewStyle
 * Khi nào sử dụng: AppButton render → style cho View container
 */
function getButtonStyle(
  variant: AppButtonProps['variant'],
  size: AppButtonProps['size'],
  isDisabled: boolean,
  isLoading: boolean,
  colors: ReturnType<typeof useColors>,
): ViewStyle {
  // Base — tương đương "flex-row items-center justify-center px-4 gap-2 rounded-xl"
  const base: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
    borderRadius: 12,
    overflow: 'hidden',
  };

  // Size — tương đương h-12 px-4, h-10 px-3, h-14 px-8, h-9 w-9
  const sizeStyles: Record<string, ViewStyle> = {
    default: {height: 48, paddingHorizontal: 16, paddingVertical: 8},
    sm: {height: 40, paddingHorizontal: 12},
    lg: {height: 56, paddingHorizontal: 32},
    icon: {height: 36, width: 36, paddingHorizontal: 0},
  };

  // Variant — tương đương bg-primary, bg-secondary, etc.
  const variantStyles: Record<string, ViewStyle> = {
    default: {
      backgroundColor: colors.neutrals800,
    },
    primary: {
      backgroundColor: colors.primary,
      // Shadow nhẹ
      shadowColor: colors.primary,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    secondary: {
      backgroundColor: colors.secondary,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.neutrals600, // neutrals600 thay vì 700 — tăng contrast trên OLED dark
    },
    link: {
      backgroundColor: 'transparent',
    },
  };

  // State — disabled / loading
  const stateStyle: ViewStyle = {};
  if (isDisabled) {
    stateStyle.opacity = 0.5;
  } else if (isLoading) {
    stateStyle.opacity = 0.8;
  }

  return {
    ...base,
    ...(sizeStyles[size || 'default'] || sizeStyles.default),
    ...(variantStyles[variant || 'default'] || variantStyles.default),
    ...stateStyle,
  };
}

/**
 * Mục đích: Tính TextStyle cho text bên trong button dựa trên variant + size + state
 * Tham số đầu vào: variant, size, isDisabled, colors (theme)
 * Tham số đầu ra: TextStyle
 * Khi nào sử dụng: AppButton render → style cho Text children
 */
function getTextStyle(
  variant: AppButtonProps['variant'],
  size: AppButtonProps['size'],
  isDisabled: boolean,
  colors: ReturnType<typeof useColors>,
): TextStyle {
  // Base — tương đương "font-sans-medium text-foreground"
  const base: TextStyle = {
    fontFamily: 'SourceSans3-Medium',
    color: colors.foreground,
    fontSize: 14,
  };

  // Size → font size
  // fontSize theo tailwind.config.js: xs=12, sm=13, base=14, md=16, lg=18
  const sizeStyles: Record<string, TextStyle> = {
    default: {},
    sm: {fontSize: 13},
    lg: {fontSize: 18},
    icon: {fontSize: 14},
  };

  // Variant → text color + font (SourceSans3 theo tailwind.config.js)
  const variantStyles: Record<string, TextStyle> = {
    default: {color: colors.foreground, fontFamily: 'SourceSans3-SemiBold'},
    primary: {color: colors.primaryForeground, fontFamily: 'SourceSans3-SemiBold'},
    secondary: {color: colors.secondaryForeground, fontFamily: 'SourceSans3-SemiBold'},
    ghost: {color: colors.foreground, fontFamily: 'SourceSans3-SemiBold'},
    outline: {color: colors.foreground, fontFamily: 'SourceSans3-SemiBold'},
    link: {color: colors.primary, fontFamily: 'SourceSans3-SemiBold', textDecorationLine: 'underline'},
  };

  // Disabled state
  const disabledStyle: TextStyle = {};
  if (isDisabled) {
    if (variant === 'primary') {
      disabledStyle.opacity = 0.5;
    } else {
      disabledStyle.color = colors.neutrals400;
    }
  }

  return {
    ...base,
    ...(sizeStyles[size || 'default'] || sizeStyles.default),
    ...(variantStyles[variant || 'default'] || variantStyles.default),
    ...disabledStyle,
  };
}

/**
 * Mục đích: Button component dùng chung cho toàn app với animation scale + opacity
 * Tham số đầu vào: AppButtonProps (variant, size, disabled, loading, icon, children, ...)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Mọi nơi cần button — chip gợi ý, CTA, header back, v.v.
 *
 * QUAN TRỌNG: Component này KHÔNG dùng NativeWind className vì CssInterop wrapper
 * gây lỗi "Couldn't find a navigation context" khi truy cập NavigationStateContext.
 * Thay vào đó dùng React Native StyleSheet + cssInterop={false} để bypass hoàn toàn.
 * Xem: react-native-css-interop/dist/runtime/wrap-jsx.js dòng 14-18
 */
export default function AppButton(props: AppButtonProps) {
  const {variant, size, className, disabled, loading, onPress, style, ...rest} =
    props;
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const colors = useColors();

  const isDisabled = disabled || loading;

  // Tính style cho container và text — memoize theo props thay đổi
  // Merge order: base → size → variant → state → className override
  const classNameStyle = useMemo(() => parseClassNameToViewStyle(className), [className]);
  const textClassStyle = useMemo(() => parseTextClassNameToStyle(props.textClassname), [props.textClassname]);

  const buttonStyle = useMemo(
    () => ({...getButtonStyle(variant, size, !!isDisabled, !!loading, colors), ...classNameStyle}),
    [variant, size, isDisabled, loading, colors, classNameStyle],
  );
  const textStyle = useMemo(
    () => ({...getTextStyle(variant, size, !!isDisabled, colors), ...textClassStyle}),
    [variant, size, isDisabled, colors, textClassStyle],
  );

  /**
   * Mục đích: Lấy màu icon theo variant
   * Tham số đầu vào: không có (dùng variant từ closure)
   * Tham số đầu ra: string (hex color)
   * Khi nào sử dụng: Render icon bên trong button
   */
  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primaryForeground;
      case 'ghost':
        return colors.foreground;
      case 'outline':
        return colors.foreground;
      case 'link':
        return colors.primary;
      default:
        return colors.foreground;
    }
  };

  /**
   * Mục đích: Lấy kích thước icon theo size variant
   * Tham số đầu vào: size (AppButtonProps['size'])
   * Tham số đầu ra: number (px)
   * Khi nào sử dụng: Render icon bên trong button
   */
  const getIconSize = (s: AppButtonProps['size']): number => {
    switch (s) {
      case 'sm':
        return 12;
      case 'lg':
        return 16;
      case 'icon':
        return 18;
      default:
        return 14;
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: scale.value}],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {damping: 15, stiffness: 300});
    if (variant === 'ghost' || variant === 'outline' || variant === 'link') {
      opacity.value = withTiming(0.7, {duration: 150});
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 15, stiffness: 300});
    opacity.value = withTiming(1, {duration: 150});
  };

  const handlePress = (event: any) => {
    if (loading || disabled) return;
    onPress?.(event);
  };

  // cssInterop={false} trên TẤT CẢ components → bypass NativeWind CssInterop hoàn toàn
  // Tránh lỗi NavigationStateContext khi CssInterop wrapper truy cập navigation context
  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        cssInterop={false}
        style={[buttonStyle, style as ViewStyle]}
        disabled={isDisabled}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...rest}
      >
        {loading && (
          <ActivityIndicator
            size="small"
            color={
              variant === 'ghost' || variant === 'outline' || variant === 'link'
                ? '#e85a5a'
                : '#ffffff'
            }
          />
        )}
        {!loading &&
          props.icon &&
          React.cloneElement(props.icon as any, {
            size: getIconSize(size),
            color: getIconColor(),
          })}
        <Text cssInterop={false} style={textStyle}>
          {props.children}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
