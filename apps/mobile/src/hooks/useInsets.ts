import {useAppStore} from '@/store/useAppStore';

/**
 * Mục đích: Lấy safe area insets đã được lưu trong store
 * Tham số đầu vào: không có
 * Tham số đầu ra: Insets (left, top, right, bottom)
 * Khi nào sử dụng: Các component cần biết khoảng cách safe area mà không dùng trực tiếp SafeAreaView
 */
export const useInsets = () => {
  const insets = useAppStore(state => state.insets);
  return insets;
};
