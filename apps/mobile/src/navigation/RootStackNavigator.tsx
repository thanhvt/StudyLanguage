import React, {useEffect} from 'react';
import {useAuthStore} from '@/store/useAuthStore';
import {authService} from '@/services/supabase/auth';
import AuthStack from './AuthStack';
import MainStack from './MainTabNavigator';
import SplashScreen from '@/screens/SplashScreen';

/**
 * Mục đích: Navigator gốc quyết định hiển thị Auth hay Main dựa trên trạng thái đăng nhập
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: App.tsx render component này bên trong NavigationContainer
 *
 * Luồng:
 *   1. App khởi động → hiển thị SplashScreen
 *   2. Kiểm tra Supabase session đã lưu
 *   3. Nếu có session → setUser, setSession → hiển thị MainStack
 *   4. Nếu không có session → hiển thị AuthStack (Onboarding/Login)
 *   5. Lắng nghe onAuthStateChange để cập nhật realtime
 */
export default function RootNavigator() {
  const isInitialized = useAuthStore(state => state.isInitialized);
  const session = useAuthStore(state => state.session);
  const setUser = useAuthStore(state => state.setUser);
  const setSession = useAuthStore(state => state.setSession);
  const setInitialized = useAuthStore(state => state.setInitialized);

  useEffect(() => {
    // Kiểm tra session đã lưu khi app khởi động
    const initAuth = async () => {
      try {
        console.log('🔐 [Auth] Đang kiểm tra session...');
        const existingSession = await authService.getSession();

        if (existingSession) {
          console.log('✅ [Auth] Đã tìm thấy session, auto-login');
          setUser(existingSession.user);
          setSession(existingSession);
        } else {
          console.log('ℹ️ [Auth] Không có session, yêu cầu đăng nhập');
        }
      } catch (error) {
        console.error('❌ [Auth] Lỗi kiểm tra session:', error);
      } finally {
        setInitialized();
      }
    };

    initAuth();

    // Lắng nghe thay đổi auth state (login/logout/token refresh)
    const {data: subscription} = authService.onAuthStateChange(
      (newSession, newUser) => {
        console.log('🔄 [Auth] State thay đổi:', newUser?.email ?? 'null');
        setSession(newSession);
        setUser(newUser);
      },
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [setUser, setSession, setInitialized]);

  // Hiển thị Splash Screen trong khi kiểm tra auth
  if (!isInitialized) {
    return <SplashScreen />;
  }

  // Conditional render: Auth hoặc Main
  return session ? <MainStack /> : <AuthStack />;
}
