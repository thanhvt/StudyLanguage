import {Platform} from 'react-native';

/**
 * Mục đích: Wrapper hook cho haptic feedback
 * Tham số đầu vào: không có
 * Tham số đầu ra: object với các method haptic (light, medium, heavy, success, warning, error)
 * Khi nào sử dụng:
 *   - Button press, switch toggle, card tap
 *   - Style_Convention §6 "Always Do" — Haptic khi interactive
 *
 * NOTE: Cần install react-native-haptic-feedback trước khi sử dụng bản đầy đủ
 * Hiện tại sử dụng stub — chỉ log trên Android (không có haptic engine)
 */

// Kiểu haptic feedback
type HapticType =
  | 'impactLight'
  | 'impactMedium'
  | 'impactHeavy'
  | 'notificationSuccess'
  | 'notificationWarning'
  | 'notificationError'
  | 'selection';

// Fallback function khi chưa install react-native-haptic-feedback
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const noopTrigger = (_type: HapticType) => {
  // Stub: không làm gì cho đến khi install package
  if (__DEV__) {
    console.log('🔔 [Haptic] Stub trigger:', _type);
  }
};

let triggerFn: (type: HapticType) => void = noopTrigger;

// Thử load react-native-haptic-feedback nếu đã install
try {
  // Dynamic import để tránh crash khi chưa install
  const HapticFeedback = require('react-native-haptic-feedback').default;
  if (HapticFeedback) {
    triggerFn = (type: HapticType) => {
      HapticFeedback.trigger(type, {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    };
  }
} catch {
  // Package chưa install — dùng stub
  if (__DEV__) {
    console.log('⚠️ [Haptic] react-native-haptic-feedback chưa install, dùng stub');
  }
}

/**
 * Mục đích: Hook cung cấp haptic feedback cho UI interactions
 * Tham số đầu vào: không có
 * Tham số đầu ra: object { light, medium, heavy, success, warning, error, selection }
 * Khi nào sử dụng: Mọi component cần haptic feedback (buttons, switches, cards...)
 */
export function useHaptic() {
  return {
    /** Nhẹ — dùng cho selection, toggle */
    light: () => triggerFn('impactLight'),

    /** Vừa — dùng cho button press */
    medium: () => triggerFn('impactMedium'),

    /** Mạnh — dùng cho destructive actions */
    heavy: () => triggerFn('impactHeavy'),

    /** Thành công — dùng sau save/submit thành công */
    success: () => triggerFn('notificationSuccess'),

    /** Cảnh báo — dùng khi validation fail */
    warning: () => triggerFn('notificationWarning'),

    /** Lỗi — dùng khi action fail */
    error: () => triggerFn('notificationError'),

    /** Selection — dùng khi scroll picker, segment change */
    selection: () => triggerFn('selection'),
  };
}
