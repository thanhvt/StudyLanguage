import {supabase} from './client';
import type {User, Session} from '@supabase/supabase-js';

/**
 * Mục đích: Service quản lý xác thực người dùng qua Supabase
 * Tham số đầu vào: tùy hàm
 * Tham số đầu ra: tùy hàm (User, Session, error)
 * Khi nào sử dụng: LoginScreen (đăng nhập), App.tsx (auto-login), ProfileScreen (đăng xuất)
 *
 * Luồng Auth:
 *   1. Mở app → getSession() kiểm tra session đã lưu
 *   2. Nếu có session → auto-login, navigate đến Main
 *   3. Nếu không → hiển thị Login screen
 *   4. User nhấn "Continue with Google" → signInWithGoogle()
 *   5. Sau khi login thành công → onAuthStateChange cập nhật store
 */

export const authService = {
  /**
   * Mục đích: Đăng nhập bằng Google ID Token (native flow)
   * Tham số đầu vào: idToken (string) - Token từ @react-native-google-signin
   * Tham số đầu ra: { user, session } hoặc error
   * Khi nào sử dụng: Khi user nhấn nút "Continue with Google" trên LoginScreen
   */
  signInWithGoogle: async (idToken: string) => {
    const {data, error} = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) {
      console.error('Lỗi đăng nhập Google:', error.message);
      throw error;
    }

    return data;
  },

  /**
   * Mục đích: Đăng xuất người dùng
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi user nhấn nút Sign Out ở ProfileScreen/SettingsScreen
   */
  signOut: async () => {
    const {error} = await supabase.auth.signOut();
    if (error) {
      console.error('Lỗi đăng xuất:', error.message);
      throw error;
    }
  },

  /**
   * Mục đích: Lấy session hiện tại đã lưu trong bộ nhớ
   * Tham số đầu vào: không có
   * Tham số đầu ra: Session | null
   * Khi nào sử dụng: Khi app khởi động, kiểm tra đã đăng nhập chưa
   */
  getSession: async (): Promise<Session | null> => {
    const {
      data: {session},
    } = await supabase.auth.getSession();
    return session;
  },

  /**
   * Mục đích: Lấy user hiện tại
   * Tham số đầu vào: không có
   * Tham số đầu ra: User | null
   * Khi nào sử dụng: Hiển thị thông tin user ở Dashboard, ProfileScreen
   */
  getUser: async (): Promise<User | null> => {
    const {
      data: {user},
    } = await supabase.auth.getUser();
    return user;
  },

  /**
   * Mục đích: Lắng nghe thay đổi trạng thái auth (login/logout/token refresh)
   * Tham số đầu vào: callback function
   * Tham số đầu ra: Subscription (cần unsubscribe khi component unmount)
   * Khi nào sử dụng: App.tsx hoặc auth store - gọi 1 lần khi app khởi động
   */
  onAuthStateChange: (
    callback: (session: Session | null, user: User | null) => void,
  ) => {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session, session?.user ?? null);
    });
  },
};
