/**
 * Mục đích: Custom toast layout cho react-native-toast-message
 * Hỗ trợ Dark/Light mode, animation mượt mà, design nhất quán với app
 * Tham số đầu vào: ToastConfigParams từ library
 * Tham số đầu ra: toastConfig object truyền vào <Toast config={toastConfig} />
 * Khi nào sử dụng: App.tsx render <Toast config={toastConfig} />
 */
import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppColors, AppColorsLight} from '@/config/colors';
import {useAppStore} from '@/store/useAppStore';
import {icons} from 'lucide-react-native';
import type {ToastConfigParams} from 'react-native-toast-message';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
} from 'react-native-reanimated';

// Lấy màu tương ứng với theme hiện tại
const getColors = () => {
  const theme = useAppStore.getState().theme;
  return theme === 'light' ? AppColorsLight : AppColors;
};

// Cấu hình icon cho từng loại toast
const TOAST_ICONS = {
  success: 'CircleCheck',
  error: 'CircleX',
  warning: 'TriangleAlert',
  info: 'Info',
} as const;

/**
 * Mục đích: Lấy màu accent (icon, border tint) theo loại toast
 * Tham số đầu vào: type - loại toast, colors - bảng màu hiện tại
 * Tham số đầu ra: { iconColor, bgTint, borderTint }
 * Khi nào sử dụng: Render mỗi custom toast layout
 */
const getTypeColors = (type: string, colors: typeof AppColors) => {
  switch (type) {
    case 'success':
      return {
        iconColor: '#FFFFFF',
        textColor: '#FFFFFF',
        subtextColor: 'rgba(255,255,255,0.8)',
        closeColor: 'rgba(255,255,255,0.6)',
        bgTint: colors.success,
        borderTint: `${colors.success}CC`,
      };
    case 'error':
      return {
        iconColor: '#FFFFFF',
        textColor: '#FFFFFF',
        subtextColor: 'rgba(255,255,255,0.8)',
        closeColor: 'rgba(255,255,255,0.6)',
        bgTint: colors.error,
        borderTint: `${colors.error}CC`,
      };
    case 'warning':
      return {
        iconColor: '#FFFFFF',
        textColor: '#FFFFFF',
        subtextColor: 'rgba(255,255,255,0.85)',
        closeColor: 'rgba(255,255,255,0.6)',
        bgTint: colors.warning,
        borderTint: `${colors.warning}CC`,
      };
    case 'info':
    default:
      return {
        iconColor: '#FFFFFF',
        textColor: '#FFFFFF',
        subtextColor: 'rgba(255,255,255,0.8)',
        closeColor: 'rgba(255,255,255,0.6)',
        bgTint: colors.neutrals1000,
        borderTint: colors.neutrals800,
      };
  }
};

/**
 * Mục đích: Custom toast component tái sử dụng cho tất cả toast types
 * Tham số đầu vào: ToastConfigParams + type string
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Được gọi bởi toastConfig cho mỗi toast type
 */
const CustomToast = ({
  text1,
  text2,
  onPress,
  hide,
  type,
}: ToastConfigParams<any> & {type: string}) => {
  const colors = getColors();
  const typeColors = getTypeColors(type, colors);
  const iconName = TOAST_ICONS[type as keyof typeof TOAST_ICONS] || 'Info';
  const LucideIcon = icons[iconName as keyof typeof icons];

  return (
    <Animated.View
      entering={SlideInUp.springify().damping(18).stiffness(140)}
      exiting={FadeOut.duration(200)}
      style={[
        styles.container,
        {
          backgroundColor: typeColors.bgTint,
          borderColor: typeColors.borderTint,
        },
      ]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={styles.touchable}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <LucideIcon
            size={20}
            color={typeColors.iconColor}
          />
        </View>

        {/* Nội dung */}
        <View style={styles.content}>
          {text1 ? (
            <Animated.Text
              entering={FadeIn.delay(50).duration(200)}
              style={[styles.title, {color: typeColors.textColor}]}
              numberOfLines={2}>
              {text1}
            </Animated.Text>
          ) : null}
          {text2 ? (
            <Animated.Text
              entering={FadeIn.delay(100).duration(200)}
              style={[styles.message, {color: typeColors.subtextColor}]}
              numberOfLines={3}>
              {text2}
            </Animated.Text>
          ) : null}
        </View>

        {/* Nút đóng */}
        <TouchableOpacity
          onPress={() => hide()}
          style={styles.closeButton}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <icons.X size={16} color={typeColors.closeColor} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * Mục đích: Config object truyền vào <Toast config={toastConfig} />
 * Định nghĩa layout cho 4 loại toast: success, error, warning, info
 * Tham số đầu vào: không
 * Tham số đầu ra: Record<string, (params) => JSX.Element>
 * Khi nào sử dụng: App.tsx → <Toast config={toastConfig} />
 */
export const toastConfig = {
  success: (params: ToastConfigParams<any>) => (
    <CustomToast {...params} type="success" />
  ),
  error: (params: ToastConfigParams<any>) => (
    <CustomToast {...params} type="error" />
  ),
  warning: (params: ToastConfigParams<any>) => (
    <CustomToast {...params} type="warning" />
  ),
  info: (params: ToastConfigParams<any>) => (
    <CustomToast {...params} type="info" />
  ),
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    // Shadow nhẹ nhàng, tạo cảm giác nổi
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    // Giới hạn max width cho tablet
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  closeButton: {
    marginLeft: 8,
    padding: 2,
  },
});
