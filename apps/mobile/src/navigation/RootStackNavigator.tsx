import React, {useEffect, useState} from 'react';
import {useAuthStore} from '@/store/useAuthStore';
import {authService} from '@/services/supabase/auth';
import AuthStack from './AuthStack';
import MainStack from './MainTabNavigator';
import SplashScreen from '@/screens/SplashScreen';

// Thời gian tối thiểu hiển thị splash (ms) — đủ để animation chạy hết
const SPLASH_MIN_DURATION = 25000;

/**
 * Mục đích: Navigator gốc quyết định hiển thị Auth hay Main dựa trên trạng thái đăng nhập
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: App.tsx render component này bên trong NavigationContainer
 *
 * Luồng:
 *   1. App khởi động → hiển thị SplashScreen tối thiểu 2.5s
 *   2. Kiểm tra Supabase session đã lưu (song song với splash)
 *   3. Sau khi cả 2 điều kiện thỏa (auth checked + 2.5s) → chuyển scene
 *   4. Nếu có session → MainStack, không → AuthStack
 *   5. Lắng nghe onAuthStateChange để cập nhật realtime
 */
export default function RootNavigator() {
  const isInitialized = useAuthStore(state => state.isInitialized);
  const session = useAuthStore(state => state.session);
  const setUser = useAuthStore(state => state.setUser);
  const setSession = useAuthStore(state => state.setSession);
  const setInitialized = useAuthStore(state => state.setInitialized);

  // Đảm bảo splash hiển thị đủ lâu để user thấy animation
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('⏱️ [Splash] Đã hết thời gian tối thiểu hiển thị');
      setSplashDone(true);
    }, SPLASH_MIN_DURATION);
    return () => clearTimeout(timer);
  }, []);

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

  // Hiển thị Splash Screen cho đến khi auth đã check xong VÀ đủ thời gian tối thiểu
  if (!isInitialized || !splashDone) {
    return <SplashScreen />;
  }

  // Conditional render: Auth hoặc Main
  return session ? <MainStack /> : <AuthStack />;
}
