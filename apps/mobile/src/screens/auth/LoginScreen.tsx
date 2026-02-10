import React, {useEffect, useState} from 'react';
import {Alert, View} from 'react-native';
import {AppButton, AppText} from '@/components/ui';
import {useAuthStore} from '@/store/useAuthStore';
import {authService} from '@/services/supabase/auth';
import Icon from '@/components/ui/Icon';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import Config from 'react-native-config';

/**
 * Mục đích: Màn hình đăng nhập chỉ bằng Google OAuth (theo web-v2 pattern)
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Khi user chưa đăng nhập, hiển thị trong AuthStack
 *   - AuthStack: hiển thị sau Onboarding (hoặc trực tiếp nếu không phải lần đầu)
 *   - Sau khi login thành công → RootNavigator tự chuyển sang MainTabs
 *
 * Luồng:
 *   1. User nhấn "Continue with Google"
 *   2. GoogleSignin.signIn() → lấy idToken
 *   3. authService.signInWithGoogle(idToken) → Supabase tạo session
 *   4. onAuthStateChange listener trong RootNavigator cập nhật authStore
 *   5. RootNavigator render MainTabs thay vì AuthStack
 */
export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAuthStore(state => state.setUser);
  const setSession = useAuthStore(state => state.setSession);

  useEffect(() => {
    // Cấu hình Google Sign-In với Web Client ID từ .env
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });
    console.log('🔧 [Login] Google Sign-In đã cấu hình');
  }, []);

  /**
   * Mục đích: Xử lý đăng nhập bằng Google
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi user nhấn nút "Continue with Google"
   */
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      console.log('🔑 [Login] Bắt đầu Google Sign-In...');

      // Kiểm tra Google Play Services (Android)
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

      // Mở Google Sign-In popup
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;

      if (!idToken) {
        throw new Error('Không nhận được ID token từ Google');
      }

      console.log('✅ [Login] Đã nhận idToken, gửi tới Supabase...');

      // Gửi idToken cho Supabase để tạo session
      const {user, session} = await authService.signInWithGoogle(idToken);

      if (user && session) {
        console.log('✅ [Login] Đăng nhập thành công:', user.email);
        setUser(user);
        setSession(session);
      }
    } catch (error: any) {
      console.error('❌ [Login] Lỗi đăng nhập:', error);

      // Xử lý các lỗi cụ thể của Google Sign-In
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('ℹ️ [Login] User đã huỷ đăng nhập');
        return; // Không hiện alert khi user tự huỷ
      }

      if (error?.code === statusCodes.IN_PROGRESS) {
        console.log('ℹ️ [Login] Đang xử lý đăng nhập...');
        return;
      }

      if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert(
          'Lỗi',
          'Google Play Services không khả dụng. Vui lòng cập nhật.',
        );
        return;
      }

      Alert.alert(
        'Lỗi đăng nhập',
        error?.message || 'Không thể đăng nhập bằng Google. Vui lòng thử lại.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background items-center justify-center px-8">
      {/* Logo */}
      <View className="items-center mb-12">
        <View className="w-20 h-20 bg-primary rounded-3xl items-center justify-center mb-6">
          <AppText className="text-4xl">🎧</AppText>
        </View>
        <AppText
          variant={'heading1'}
          className="text-3xl font-sans-bold text-foreground text-center">
          Welcome Back
        </AppText>
        <AppText className="text-neutrals400 text-center mt-2 text-base">
          Đăng nhập để tiếp tục hành trình học tập
        </AppText>
      </View>

      {/* Nút Google Sign-In */}
      <View className="w-full gap-4">
        <AppButton
          variant="outline"
          className="w-full rounded-2xl py-4"
          onPress={handleGoogleSignIn}
          disabled={isLoading}>
          <View className="flex-row items-center justify-center gap-3">
            <Icon name="Globe" className="w-5 h-5 text-foreground" />
            <AppText className="text-foreground font-sans-semibold text-base">
              {isLoading ? 'Đang đăng nhập...' : 'Continue with Google'}
            </AppText>
          </View>
        </AppButton>
      </View>

      {/* Footer */}
      <View className="absolute bottom-0 pb-safe-offset-8 px-8">
        <AppText className="text-neutrals500 text-center text-xs leading-5">
          Bằng việc đăng nhập, bạn đồng ý với{'\n'}
          Điều khoản sử dụng & Chính sách bảo mật
        </AppText>
      </View>
    </View>
  );
}
