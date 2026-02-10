import {AppColors, AppColorsLight} from '../config/colors';
import {useAppStore} from '@/store/useAppStore';

/**
 * Mục đích: Lấy bảng màu dựa trên theme hiện tại
 * Tham số đầu vào: không có
 * Tham số đầu ra: AppColors | AppColorsLight
 * Khi nào sử dụng: Mọi component cần truy cập màu theo theme (AppContent, custom navigators...)
 */
export function useColors() {
  const theme = useAppStore(state => state.theme);
  if (theme === 'light') return AppColorsLight;
  return AppColors;
}
