import {create} from 'zustand';
import type {User, Session} from '@supabase/supabase-js';

// ===========================
// Interface cho Auth Store
// ===========================
interface AuthState {
  // Trạng thái
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Hành động
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setInitialized: () => void;
  reset: () => void;
}

/**
 * Mục đích: Store quản lý trạng thái xác thực người dùng
 * Tham số đầu vào: không có
 * Tham số đầu ra: AuthState (trạng thái + hành động)
 * Khi nào sử dụng:
 *   - RootNavigator: quyết định hiển thị AuthStack hay MainTabs
 *   - LoginScreen: cập nhật user sau khi đăng nhập
 *   - ProfileScreen: đọc thông tin user, đăng xuất
 *   - API client: lấy access token từ session
 *
 * Lưu ý: Không persist store này vì Supabase tự quản lý session persistence
 */
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isInitialized: false,

  setUser: (user) => set({user}),
  setSession: (session) => set({session}),
  setIsLoading: (isLoading) => set({isLoading}),
  setInitialized: () => set({isInitialized: true, isLoading: false}),
  reset: () => set({user: null, session: null, isLoading: false}),
}));
