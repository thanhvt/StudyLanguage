import { toast } from 'sonner';

/**
 * Các hàm tiện ích để hiển thị toast notifications
 * 
 * Mục đích: Cung cấp API đơn giản để hiển thị thông báo cho người dùng
 * Tham số đầu vào: message (string) - Nội dung thông báo
 * Tham số đầu ra: Toast ID (string | number)
 * Khi nào sử dụng: Bất cứ khi nào cần hiển thị thông báo cho người dùng
 */

/**
 * Hiển thị thông báo thành công
 * @param message Nội dung thông báo
 * @param description Mô tả chi tiết (tùy chọn)
 */
export const showSuccess = (message: string, description?: string) => {
  return toast.success(message, {
    description,
  });
};

/**
 * Hiển thị thông báo lỗi
 * @param message Nội dung thông báo lỗi
 * @param description Mô tả chi tiết (tùy chọn)
 */
export const showError = (message: string, description?: string) => {
  return toast.error(message, {
    description,
  });
};

/**
 * Hiển thị thông báo cảnh báo
 * @param message Nội dung cảnh báo
 * @param description Mô tả chi tiết (tùy chọn)
 */
export const showWarning = (message: string, description?: string) => {
  return toast.warning(message, {
    description,
  });
};

/**
 * Hiển thị thông báo thông tin
 * @param message Nội dung thông tin
 * @param description Mô tả chi tiết (tùy chọn)
 */
export const showInfo = (message: string, description?: string) => {
  return toast.info(message, {
    description,
  });
};

/**
 * Hiển thị toast khi đang loading rồi update kết quả
 * @param promise Promise cần theo dõi
 * @param messages Object chứa các message cho từng trạng thái
 */
export const showPromise = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: Error) => string);
  }
) => {
  return toast.promise(promise, messages);
};

/**
 * Hiển thị toast với action button
 * @param message Nội dung thông báo
 * @param action Object chứa label và onClick handler
 */
export const showWithAction = (
  message: string,
  action: {
    label: string;
    onClick: () => void;
  },
  description?: string
) => {
  return toast(message, {
    description,
    action: {
      label: action.label,
      onClick: action.onClick,
    },
  });
};

/**
 * Đóng một toast cụ thể
 * @param toastId ID của toast cần đóng
 */
export const dismissToast = (toastId?: string | number) => {
  toast.dismiss(toastId);
};

/**
 * Đóng tất cả toast
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};

// Re-export toast để có thể sử dụng trực tiếp nếu cần
export { toast };
