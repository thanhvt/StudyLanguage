import React, {useRef, useCallback, useEffect} from 'react';
import {ScrollView, View, Pressable, StyleSheet, Animated, Platform} from 'react-native';
import {AppText, Icon} from '@/components/ui';
import {useAppStore, AccentColorId} from '@/store/useAppStore';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import LinearGradient from 'react-native-linear-gradient';
import {LiquidGlassView, isLiquidGlassSupported} from '@/utils/LiquidGlass';

/**
 * Mục đích: Config 6 accent colors — khớp với hi-fi ps_appearance screen
 * Hex values đồng bộ với mockup annotations
 */
const ACCENT_COLORS: {id: AccentColorId; hex: string; name: string}[] = [
  {id: 'ocean-scholar', hex: '#10b981', name: 'Emerald'},
  {id: 'royal-purple', hex: '#6366f1', name: 'Indigo'},
  {id: 'emerald-study', hex: '#f59e0b', name: 'Amber'},
  {id: 'rose-focus', hex: '#f43f5e', name: 'Rose'},
  {id: 'ocean-blue', hex: '#3b82f6', name: 'Blue'},
  {id: 'sunset-focus', hex: '#f97316', name: 'Orange'},
];

/**
 * Mục đích: Config theme options — CHỈ 2 mode (Sáng/Tối)
 * Đã bỏ "Tự động" theo yêu cầu user
 */
const THEME_OPTIONS = [
  {key: 'light' as const, label: 'Sáng', icon: 'Sun'},
  {key: 'dark' as const, label: 'Tối', icon: 'Moon'},
];

/**
 * Mục đích: Chỉ cho phép chọn Tiếng Anh hoặc Tiếng Việt
 */
const SUPPORTED_LANGUAGES = [
  {code: 'en' as const, nativeName: 'English', flag: '🇬🇧'},
  {code: 'vi' as const, nativeName: 'Tiếng Việt', flag: '🇻🇳'},
];

/**
 * Mục đích: Màn hình cài đặt giao diện — premium Obsidian Glass style
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Navigation từ MoreScreen → "Giao diện"
 *
 * V3 Enhancements:
 *   - Bỏ checkmark icon trên theme card + bỏ "Tự động" mode
 *   - Theme selection: scale + glow animation khi chọn
 *   - Accent colors: outer ring glow effect khi selected
 *   - Glassmorphism cards với inner glow gradient
 *   - Haptic feedback trên mọi interaction
 *   - Card sections: inner highlight gradient cho depth
 */
export default function AppearanceSettingsScreen() {
  const theme = useAppStore(state => state.theme);
  const accentColor = useAppStore(state => state.accentColor);
  const language = useAppStore(state => state.language);
  const setTheme = useAppStore(state => state.setTheme);
  const setAccentColor = useAppStore(state => state.setAccentColor);
  const setLanguage = useAppStore(state => state.setLanguage);
  const colors = useColors();
  const isDark = theme !== 'light';
  const haptic = useHaptic();

  // Tìm hex hiện tại cho accent color
  const currentAccentHex =
    ACCENT_COLORS.find(c => c.id === accentColor)?.hex || '#10b981';

  return (
    <View className="flex-1" style={{backgroundColor: colors.background}}>
      {/* Nền gradient emerald — tạo depth */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {isDark ? (
          <LinearGradient
            colors={['#064E3B65', '#05201515', 'transparent', '#10b98130']}
            locations={[0, 0.3, 0.6, 1]}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <LinearGradient
            colors={['#f0fdf420', 'transparent', '#ecfdf518']}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
        )}
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 40}}>
        {/* ========================================
         * Section 1: Chủ đề — CHỈ 2 mode: Sáng / Tối
         * Không có checkmark icon (yêu cầu user)
         * Selected = primary border glow + tinted bg + primary text
         * ======================================== */}
        <View className="px-4 pt-4">
          <View
            className="rounded-[20px] p-4 overflow-hidden"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: isDark ? colors.glassBorder : colors.border,
            }}>
            {/* Inner glow gradient — tạo depth cho card */}
            {isDark && (
              <LinearGradient
                colors={['rgba(255,255,255,0.04)', 'transparent']}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 60,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                }}
              />
            )}

            <View className="flex-row items-center mb-4">
              <Icon
                name="Palette"
                className="w-5 h-5 mr-2"
                style={{color: colors.neutrals300}}
              />
              <AppText
                variant="label"
                style={{color: colors.foreground}}
                className="font-sans-semibold"
                raw>
                Chủ đề
              </AppText>
            </View>

            {/* 2 theme cards — equal width, glow border khi selected */}
            <View className="flex-row gap-4">
              {THEME_OPTIONS.map(option => {
                const isSelected = theme === option.key;

                return (
                  <ThemeCard
                    key={option.key}
                    icon={option.icon}
                    label={option.label}
                    isSelected={isSelected}
                    isDark={isDark}
                    colors={colors}
                    onPress={() => {
                      haptic.light();
                      setTheme(option.key);
                    }}
                  />
                );
              })}
            </View>
          </View>
        </View>

        {/* ========================================
         * Section 2: Màu nhấn — compact single row + animated swatches
         * Bỏ hex labels, compact 6 circle 1 hàng
         * Selected: glow shadow + ring + scale animation
         * ======================================== */}
        <View className="px-4 mt-4">
          <View
            className="rounded-[20px] p-4 overflow-hidden"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: isDark ? colors.glassBorder : colors.border,
            }}>
            {isDark && (
              <LinearGradient
                colors={['rgba(255,255,255,0.04)', 'transparent']}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 60,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                }}
              />
            )}

            <AppText
              variant="label"
              style={{color: colors.foreground}}
              className="font-sans-semibold mb-4"
              raw>
              Màu nhấn
            </AppText>

            {/* 6 circles — 1 hàng ngang, đều nhau */}
            <View className="flex-row justify-between px-1">
              {ACCENT_COLORS.map(color => (
                <AnimatedColorSwatch
                  key={color.id}
                  color={color}
                  isSelected={accentColor === color.id}
                  isDark={isDark}
                  onPress={() => {
                    haptic.medium();
                    setAccentColor(color.id);
                  }}
                />
              ))}
            </View>

            {/* Tên màu selected — hiển thị bên dưới */}
            <View className="items-center mt-3">
              <AppText
                variant="caption"
                style={{color: currentAccentHex}}
                className="font-sans-semibold"
                raw>
                {ACCENT_COLORS.find(c => c.id === accentColor)?.name || 'Emerald'}
              </AppText>
            </View>
          </View>
        </View>

        {/* ========================================
         * Section 3: Ngôn ngữ — 2 language chips
         * ======================================== */}
        <View className="px-4 mt-4">
          <View
            className="rounded-[20px] p-4 overflow-hidden"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: isDark ? colors.glassBorder : colors.border,
            }}>
            {isDark && (
              <LinearGradient
                colors={['rgba(255,255,255,0.04)', 'transparent']}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 60,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                }}
              />
            )}

            <AppText
              variant="label"
              style={{color: colors.foreground}}
              className="font-sans-semibold mb-4"
              raw>
              Ngôn ngữ
            </AppText>

            <View className="flex-row gap-3">
              {SUPPORTED_LANGUAGES.map(lang => {
                const isSelected = language === lang.code;

                return (
                  <Pressable
                    key={lang.code}
                    onPress={() => {
                      haptic.light();
                      setLanguage(lang.code);
                    }}
                    className="flex-1 flex-row items-center justify-center py-3.5 rounded-2xl"
                    style={{
                      backgroundColor: isSelected
                        ? currentAccentHex + '15'
                        : isDark ? colors.neutrals900 : colors.neutrals700,
                      borderWidth: isSelected ? 1.5 : 1,
                      borderColor: isSelected
                        ? currentAccentHex
                        : isDark ? colors.glassBorder : colors.border,
                    }}
                    accessibilityLabel={`Ngôn ngữ ${lang.nativeName}${isSelected ? ', đang chọn' : ''}`}
                    accessibilityRole="button">
                    <AppText variant="body" className="mr-2" raw>
                      {lang.flag}
                    </AppText>
                    <AppText
                      variant="body"
                      style={{
                        color: isSelected
                          ? currentAccentHex
                          : colors.foreground,
                      }}
                      className="font-sans-medium"
                      raw>
                      {lang.nativeName}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* ========================================
         * Section 4: Live Preview — Liquid Glass button
         * iOS 26+: native LiquidGlassView effect
         * Fallback: simulated glassmorphism (gradient + shadow)
         * ======================================== */}
        <View className="px-4 mt-4">
          <View
            className="rounded-[20px] p-4 overflow-hidden"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: isDark ? colors.glassBorder : colors.border,
            }}>
            {isDark && (
              <LinearGradient
                colors={['rgba(255,255,255,0.04)', 'transparent']}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 60,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                }}
              />
            )}

            <AppText
              variant="label"
              style={{color: colors.foreground}}
              className="font-sans-semibold mb-4"
              raw>
              Live Preview
            </AppText>

            {/* Nội dung preview — text + nút glass */}
            <View
              className="rounded-2xl p-5"
              style={{
                backgroundColor: isDark ? colors.neutrals900 : colors.neutrals700,
                borderWidth: 1,
                borderColor: isDark ? colors.glassBorder : colors.border,
              }}>
              <AppText
                variant="body"
                style={{color: colors.foreground}}
                className="mb-4"
                raw>
                Xin chào! Đây là bản xem trước.
              </AppText>

              {/* === NÚT LIQUID GLASS === */}
              <GlassPreviewButton
                accentHex={currentAccentHex}
                isDark={isDark}
                colors={colors}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ========================================
// ThemeCard — animated card component cho Sáng/Tối
// ========================================

interface ThemeCardProps {
  icon: string;
  label: string;
  isSelected: boolean;
  isDark: boolean;
  colors: ReturnType<typeof useColors>;
  onPress: () => void;
}

/**
 * Mục đích: Card chọn theme với scale animation khi nhấn
 * Tham số đầu vào: icon, label, isSelected, isDark, colors, onPress
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Section "Chủ đề" trong AppearanceSettingsScreen
 */
function ThemeCard({icon, label, isSelected, isDark, colors, onPress}: ThemeCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  /**
   * Mục đích: Animation scale down → up khi nhấn
   * Tạo cảm giác "nhấn vào" premium
   */
  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View
      className="flex-1"
      style={{transform: [{scale: scaleAnim}]}}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="flex-row items-center justify-center gap-3 py-4 px-4 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: isSelected
            ? colors.primary + '15'
            : isDark ? colors.neutrals900 : colors.neutrals700,
          borderWidth: isSelected ? 1.5 : 1,
          borderColor: isSelected
            ? colors.primary
            : isDark ? colors.glassBorder : colors.border,
          // Glow shadow khi selected
          shadowColor: isSelected ? colors.primary : 'transparent',
          shadowOffset: {width: 0, height: 0},
          shadowOpacity: isSelected ? 0.3 : 0,
          shadowRadius: isSelected ? 12 : 0,
          elevation: isSelected ? 6 : 0,
        }}
        accessibilityLabel={`Chủ đề ${label}${isSelected ? ', đang chọn' : ''}`}
        accessibilityRole="button">
        <Icon
          name={icon as any}
          className="w-7 h-7"
          style={{
            color: isSelected
              ? colors.primary
              : colors.neutrals300,
          }}
        />
        <AppText
          variant="body"
          style={{
            color: isSelected
              ? colors.primary
              : colors.foreground,
          }}
          className="font-sans-semibold"
          raw>
          {label}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

// ========================================
// AnimatedColorSwatch — animated accent color circle
// ========================================

interface AnimatedColorSwatchProps {
  color: {id: AccentColorId; hex: string; name: string};
  isSelected: boolean;
  isDark: boolean;
  onPress: () => void;
}

/**
 * Mục đích: Circle màu accent với spring animations (RN Animated)
 * Tham số đầu vào: color, isSelected, isDark, onPress
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Section "Màu nhấn" trong AppearanceSettingsScreen
 *
 * Animation: selected → bounce scale 1.2→1.0 + glow shadow
 * Press → squish 0.85 → spring back
 */
function AnimatedColorSwatch({color, isSelected, isDark, onPress}: AnimatedColorSwatchProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;
  const ringAnim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;
  const isFirstMount = useRef(true);

  // Sync selected state với spring animations — skip mount
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (isSelected) {
      // Bounce: 1 → 1.2 → 1.0
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: false,
          speed: 40,
          bounciness: 12,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.0,
          useNativeDriver: false,
          speed: 20,
          bounciness: 8,
        }),
      ]).start();
      // Glow + ring fade in
      Animated.spring(glowAnim, {toValue: 1, useNativeDriver: false, speed: 12}).start();
      Animated.spring(ringAnim, {toValue: 1, useNativeDriver: false, speed: 14}).start();
    } else {
      // Fade out
      Animated.timing(scaleAnim, {toValue: 1, useNativeDriver: false, duration: 200}).start();
      Animated.spring(glowAnim, {toValue: 0, useNativeDriver: false, speed: 20}).start();
      Animated.spring(ringAnim, {toValue: 0, useNativeDriver: false, speed: 20}).start();
    }
  }, [isSelected, scaleAnim, glowAnim, ringAnim]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      useNativeDriver: false,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: false,
      speed: 30,
      bounciness: 10,
    }).start();
  }, [scaleAnim]);

  const circleSize = 42;

  // Interpolated values cho glow + ring
  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.7],
  });
  const shadowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 14],
  });
  const borderWidth = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 2.5],
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityLabel={`Màu ${color.name}${isSelected ? ', đang chọn' : ''}`}
      accessibilityRole="button"
      className="items-center">
      {/* Outer glow container — animated shadow */}
      <Animated.View
        style={{
          width: circleSize + 10,
          height: circleSize + 10,
          borderRadius: (circleSize + 10) / 2,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{scale: scaleAnim}],
          shadowColor: color.hex,
          shadowOffset: {width: 0, height: 0},
          shadowOpacity: shadowOpacity,
          shadowRadius: shadowRadius,
        }}>
        {/* Ring border — animated width */}
        <Animated.View
          style={{
            width: circleSize + 6,
            height: circleSize + 6,
            borderRadius: (circleSize + 6) / 2,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: borderWidth,
            borderColor: isDark ? '#ffffff' : '#000000',
          }}>
          {/* Color circle */}
          <View
            style={{
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
              backgroundColor: color.hex,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {isSelected && (
              <Icon
                name="Check"
                className="w-5 h-5"
                style={{color: '#ffffff'}}
              />
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

// ========================================
// GlassPreviewButton — Liquid Glass nút preview
// ========================================

interface GlassPreviewButtonProps {
  accentHex: string;
  isDark: boolean;
  colors: ReturnType<typeof useColors>;
}

/**
 * Mục đích: Nút "Bắt đầu" với hiệu ứng Liquid Glassmorphism
 * Tham số đầu vào: accentHex (màu accent hiện tại), isDark, colors
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Live Preview section trong AppearanceSettingsScreen
 *
 * iOS 26+: native LiquidGlassView — hiệu ứng glass thật (blur, refraction)
 * Fallback: Simulated glassmorphism — gradient overlay + shadow + glass bg
 */
function GlassPreviewButton({accentHex, isDark, colors}: GlassPreviewButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 10,
    }).start();
  }, [scaleAnim]);

  // iOS 26+ → Native Liquid Glass
  if (isLiquidGlassSupported) {
    return (
      <Animated.View style={{transform: [{scale: scaleAnim}]}}>
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
          {/* Shadow wrapper */}
          <View
            style={{
              shadowColor: accentHex,
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.5,
              shadowRadius: 16,
              elevation: 8,
              borderRadius: 16,
            }}>
            <LiquidGlassView
              effect="regular"
              tintColor={accentHex + '40'}
              style={{
                borderRadius: 16,
                paddingVertical: 16,
                paddingHorizontal: 24,
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
                // Rim light — sáng ở top
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.08)',
                borderTopColor: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.70)',
                borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                backgroundColor: accentHex + '25',
              }}>
              {/* Inner glow gradient */}
              <LinearGradient
                colors={[accentHex + '30', 'transparent']}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 30,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
              />
              <AppText
                variant="heading3"
                className="font-sans-bold"
                style={{color: isDark ? '#ffffff' : '#000000'}}
                raw>
                ✨ Bắt đầu
              </AppText>
            </LiquidGlassView>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  // Fallback — Simulated glassmorphism (iOS < 26 / Android)
  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <View
          className="rounded-2xl overflow-hidden"
          style={{
            // Outer glow — accent color hào quang
            shadowColor: accentHex,
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: isDark ? 0.6 : 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}>
          {/* Glass background — semi-transparent với accent tint */}
          <View
            className="items-center justify-center rounded-2xl overflow-hidden"
            style={{
              paddingVertical: 16,
              paddingHorizontal: 24,
              backgroundColor: isDark
                ? accentHex + '20'
                : accentHex + '15',
              // Rim light borders
              borderWidth: 1.5,
              borderColor: isDark ? accentHex + '40' : accentHex + '30',
              borderTopColor: isDark
                ? 'rgba(255,255,255,0.25)'
                : accentHex + '50',
            }}>
            {/* Inner glow gradient — accent tint */}
            <LinearGradient
              colors={[
                isDark ? accentHex + '35' : accentHex + '20',
                'transparent',
              ]}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 35,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }}
            />
            {/* Shimmer highlight — vệt sáng chéo */}
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.08)', 'transparent']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={StyleSheet.absoluteFill}
            />
            <AppText
              variant="heading3"
              className="font-sans-bold"
              style={{color: isDark ? '#ffffff' : '#000000'}}
              raw>
              ✨ Bắt đầu
            </AppText>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

