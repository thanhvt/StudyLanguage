import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useAuthStore} from '@/store/useAuthStore';
import {useNotificationStore} from '@/store/useNotificationStore';
import {authService} from '@/services/supabase/auth';
import AuthStack from './AuthStack';
import MainStack from './MainTabNavigator';
import SplashScreen from '@/screens/SplashScreen';
import {MinimizedPlayer} from '@/components/listening';
import {CoachNotificationToast} from '@/components/speaking/CoachNotificationToast';
import {useLocalNotification} from '@/hooks/useLocalNotification';

// Thời gian tối thiểu hiển thị splash (ms) — đủ để animation chạy hết
const SPLASH_MIN_DURATION = 1500;

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
 *   6. MinimizedPlayer overlay trên MainStack khi có audio
 */
export default function RootNavigator() {
  const isInitialized = useAuthStore(state => state.isInitialized);
  const session = useAuthStore(state => state.session);
  const setUser = useAuthStore(state => state.setUser);
  const setSession = useAuthStore(state => state.setSession);
  const setInitialized = useAuthStore(state => state.setInitialized);

  // Notification toast state — phải khai báo TRƯỚC mọi early return để đảm bảo hooks order
  const queuedMessages = useNotificationStore(s => s.queuedMessages);
  const isAppActive = useNotificationStore(s => s.isAppActive);
  const [toastVisible, setToastVisible] = useState(false);

  // Local push notification — xin permission 1 lần khi app khởi động
  const {requestPermission} = useLocalNotification();

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
    // Sử dụng onAuthStateChange thay vì gọi getSession() riêng
    // onAuthStateChange phát ra event INITIAL_SESSION khi register callback
    // → không cần gọi getSession() thêm → tránh acquire lock 2 lần
    let isFirstEvent = true;

    const {data: subscription} = authService.onAuthStateChange(
      (newSession, newUser) => {
        if (isFirstEvent) {
          // Event đầu tiên = INITIAL_SESSION → thay thế initAuth()
          isFirstEvent = false;
          if (newSession) {
            console.log('✅ [Auth] Đã tìm thấy session, auto-login');
          } else {
            console.log('ℹ️ [Auth] Không có session, yêu cầu đăng nhập');
          }
          setSession(newSession);
          setUser(newUser);
          setInitialized();
        } else {
          // Các event sau = LOGIN/LOGOUT/TOKEN_REFRESH
          console.log('🔄 [Auth] State thay đổi:', newUser?.email ?? 'null');
          setSession(newSession);
          setUser(newUser);
        }
      },
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [setUser, setSession, setInitialized]);

  // Xin permission notification khi đã login + app sẵn sàng
  useEffect(() => {
    if (session) {
      requestPermission();
    }
  }, [session, requestPermission]);

  // Hiện toast khi có tin mới trong queue + user đang active
  useEffect(() => {
    if (queuedMessages.length > 0 && isAppActive) {
      setToastVisible(true);
    }
  }, [queuedMessages.length, isAppActive]);

  // Hiển thị Splash Screen cho đến khi auth đã check xong VÀ đủ thời gian tối thiểu
  if (!isInitialized || !splashDone) {
    return <SplashScreen />;
  }

  // Conditional render: Auth hoặc Main + Global Players overlay
  if (!session) {
    return <AuthStack />;
  }

  return (
    <View style={{flex: 1}}>
      <MainStack />
      {/* Global Player — luôn render, tự ẩn khi playerMode !== minimized */}
      <MinimizedPlayer />
      {/* Coach Notification Toast — hiện khi AI trả lời và user ở tab khác */}
      <CoachNotificationToast
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </View>
  );
}
