import * as Keychain from 'react-native-keychain';

/**
 * Mục đích: Lưu trữ bảo mật sử dụng Keychain (iOS) / Keystore (Android)
 * Tham số đầu vào: key, value (string)
 * Tham số đầu ra: string | null
 * Khi nào sử dụng: Lưu trữ dữ liệu nhạy cảm (tokens, credentials, API keys)
 *   - Hiện tại: Supabase tự quản lý token qua MMKV
 *   - Tương lai: Có thể dùng cho custom tokens hoặc sensitive data
 */
export const secureStorage = {
  /**
   * Mục đích: Lưu giá trị bảo mật vào Keychain/Keystore
   * Tham số đầu vào: key (string), value (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: Cần lưu dữ liệu nhạy cảm
   */
  set: async (key: string, value: string): Promise<void> => {
    await Keychain.setGenericPassword(key, value, {service: key});
  },

  /**
   * Mục đích: Đọc giá trị bảo mật từ Keychain/Keystore
   * Tham số đầu vào: key (string)
   * Tham số đầu ra: string | null
   * Khi nào sử dụng: Cần đọc dữ liệu nhạy cảm đã lưu
   */
  get: async (key: string): Promise<string | null> => {
    const credentials = await Keychain.getGenericPassword({service: key});
    return credentials ? credentials.password : null;
  },

  /**
   * Mục đích: Xoá giá trị bảo mật khỏi Keychain/Keystore
   * Tham số đầu vào: key (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi đăng xuất hoặc cần xoá dữ liệu nhạy cảm
   */
  delete: async (key: string): Promise<void> => {
    await Keychain.resetGenericPassword({service: key});
  },
};
