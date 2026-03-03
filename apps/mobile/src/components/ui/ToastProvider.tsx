/**
 * Mục đích: Wrapper hook cho react-native-toast-message — giữ nguyên API cũ
 * để 9 consumer files không cần thay đổi code
 * Tham số đầu vào: không
 * Tham số đầu ra: { showSuccess, showError, showWarning, showInfo, dismissAll }
 * Khi nào sử dụng: Mọi component cần hiển thị toast notification
 *   → import { useToast } from '@/components/ui/ToastProvider'
 */
import Toast from 'react-native-toast-message';

interface ToastExtraOptions {
  duration?: number;
  position?: 'top' | 'bottom';
  onPress?: () => void;
}

/**
 * Mục đích: Hook wrapper giữ backward-compatible API với hệ thống toast cũ
 * Tham số đầu vào: không
 * Tham số đầu ra: Object chứa các hàm showSuccess, showError, showWarning, showInfo, dismissAll
 * Khi nào sử dụng: Bất kỳ component nào cần hiển thị toast
 *   → const { showSuccess, showError } = useToast();
 *   → showSuccess('Tiêu đề', 'Nội dung chi tiết');
 */
export const useToast = () => ({
  /**
   * Mục đích: Hiển thị toast thành công (màu xanh emerald)
   * Tham số đầu vào: title (tiêu đề), message (nội dung phụ, optional), options (tùy chọn thêm)
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi hành động hoàn thành thành công (lưu bookmark, tạo kịch bản...)
   */
  showSuccess: (title: string, message?: string, options?: ToastExtraOptions) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: options?.position || 'top',
      visibilityTime: options?.duration || 4000,
      onPress: options?.onPress,
    });
  },

  /**
   * Mục đích: Hiển thị toast lỗi (màu đỏ rose)
   * Tham số đầu vào: title (tiêu đề lỗi), message (chi tiết lỗi, optional), options
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi có lỗi xảy ra (API fail, audio error...)
   */
  showError: (title: string, message?: string, options?: ToastExtraOptions) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: options?.position || 'top',
      visibilityTime: options?.duration || 5000,
      onPress: options?.onPress,
    });
  },

  /**
   * Mục đích: Hiển thị toast cảnh báo (màu vàng amber)
   * Tham số đầu vào: title (tiêu đề cảnh báo), message (chi tiết), options
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi cần cảnh báo người dùng (chưa chọn topic, thiếu input...)
   */
  showWarning: (title: string, message?: string, options?: ToastExtraOptions) => {
    Toast.show({
      type: 'warning',
      text1: title,
      text2: message,
      position: options?.position || 'top',
      visibilityTime: options?.duration || 4000,
      onPress: options?.onPress,
    });
  },

  /**
   * Mục đích: Hiển thị toast thông tin (màu primary)
   * Tham số đầu vào: title (tiêu đề), message (chi tiết), options
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi cần thông báo trạng thái (đang chuẩn bị audio, bỏ bookmark...)
   */
  showInfo: (title: string, message?: string, options?: ToastExtraOptions) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: options?.position || 'top',
      visibilityTime: options?.duration || 3000,
      onPress: options?.onPress,
    });
  },

  /**
   * Mục đích: Ẩn tất cả toast đang hiển thị
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi cần xóa sạch toast (navigate sang screen khác...)
   */
  dismissAll: () => {
    Toast.hide();
  },
});
