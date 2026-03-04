import React, {useRef, useCallback} from 'react';
import {ScrollView, View, Pressable, StyleSheet, Animated} from 'react-native';
import {AppText, Icon} from '@/components/ui';
import {useAppStore, AccentColorId} from '@/store/useAppStore';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import LinearGradient from 'react-native-linear-gradient';

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
         * Section 2: Màu nhấn — circle swatches + glow ring
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
              className="font-sans-semibold mb-5"
              raw>
              Màu nhấn
            </AppText>

            <View className="flex-row flex-wrap justify-between">
              {ACCENT_COLORS.map(color => {
                const isSelected = accentColor === color.id;

                return (
                  <Pressable
                    key={color.id}
                    onPress={() => {
                      haptic.light();
                      setAccentColor(color.id);
                    }}
                    className="items-center mb-5"
                    style={{width: '30%'}}
                    accessibilityLabel={`Màu ${color.name}${isSelected ? ', đang chọn' : ''}`}
                    accessibilityRole="button">
                    {/* Glow ring cho selected — shadow hào quang */}
                    <View
                      className="w-14 h-14 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: color.hex,
                        // Glow effect khi selected
                        shadowColor: isSelected ? color.hex : 'transparent',
                        shadowOffset: {width: 0, height: 0},
                        shadowOpacity: isSelected ? 0.6 : 0,
                        shadowRadius: isSelected ? 10 : 0,
                        elevation: isSelected ? 8 : 0,
                        // Ring border
                        borderWidth: isSelected ? 3 : 0,
                        borderColor: isDark ? '#ffffff' : '#000000',
                      }}>
                      {isSelected && (
                        <Icon
                          name="Check"
                          className="w-5 h-5"
                          style={{color: '#ffffff'}}
                        />
                      )}
                    </View>
                    <AppText
                      variant="caption"
                      style={{
                        color: isSelected
                          ? color.hex
                          : colors.neutrals400,
                      }}
                      className="mt-2 font-sans-medium"
                      raw>
                      {color.hex}
                    </AppText>
                  </Pressable>
                );
              })}
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
         * Section 4: Live Preview — demo accent color realtime
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
              className="font-sans-semibold mb-3"
              raw>
              Live Preview
            </AppText>

            <View
              className="rounded-2xl p-4 flex-row items-center justify-between"
              style={{
                backgroundColor: isDark ? colors.neutrals900 : colors.neutrals700,
                borderWidth: 1,
                borderColor: isDark ? colors.glassBorder : colors.border,
              }}>
              <AppText
                variant="body"
                style={{color: colors.foreground}}
                className="flex-1 mr-3"
                raw>
                Xin chào! Đây là bản xem trước.
              </AppText>
              <View
                className="px-5 py-2.5 rounded-xl"
                style={{
                  backgroundColor: currentAccentHex,
                  // Nút glow effect
                  shadowColor: currentAccentHex,
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 4,
                }}>
                <AppText
                  variant="body"
                  className="font-sans-bold"
                  style={{color: '#000000'}}
                  raw>
                  Bắt đầu
                </AppText>
              </View>
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
