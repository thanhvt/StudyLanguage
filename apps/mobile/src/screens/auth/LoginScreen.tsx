import React, {useEffect, useState} from 'react';
import {Alert, View, Dimensions, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  FadeInDown,
  FadeInUp,
  BounceIn,
  ZoomIn,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {AppButton, AppText} from '@/components/ui';
import {useAuthStore} from '@/store/useAuthStore';
import {authService} from '@/services/supabase/auth';
import Icon from '@/components/ui/Icon';
import FloatingOrbs from '@/components/auth/FloatingOrbs';
import {SKILL_COLORS, SKILL_LABELS} from '@/config/skillColors';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import Config from 'react-native-config';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// Dữ liệu 2 skill badges
const SKILL_BADGES = [
  {emoji: '🎧', label: SKILL_LABELS.listening, color: SKILL_COLORS.listening.dark, delay: 600},
  {emoji: '🗣️', label: SKILL_LABELS.speaking, color: SKILL_COLORS.speaking.dark, delay: 800},
];

/**
 * Mục đích: Badge hiển thị 1 skill với bounce-in animation
 * Tham số đầu vào: emoji, label, color, delay
 * Tham số đầu ra: JSX.Element - badge tròn với icon + text
 * Khi nào sử dụng: Hiển thị 3 badges trên LoginScreen
 */
function SkillBadge({
  emoji,
  label,
  color,
  delay,
}: {
  emoji: string;
  label: string;
  color: string;
  delay: number;
}) {
  const scale = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Bounce in
    opacity.value = withDelay(delay, withTiming(1, {duration: 300}));
    scale.value = withDelay(
      delay,
      withSpring(1, {damping: 5, stiffness: 120, mass: 0.8}),
    );

    // Nhảy nhẹ liên tục sau khi hiện
    translateY.value = withDelay(
      delay + 600,
      withRepeat(
        withSequence(
          withTiming(-6, {duration: 600, easing: Easing.out(Easing.quad)}),
          withTiming(0, {duration: 600, easing: Easing.in(Easing.bounce)}),
          withTiming(0, {duration: 1000}), // Nghỉ
        ),
        -1,
        false,
      ),
    );
  }, [delay, scale, translateY, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{scale: scale.value}, {translateY: translateY.value}],
  }));

  return (
    <Animated.View style={[styles.skillBadge, animStyle]}>
      <View
        style={[
          styles.skillIcon,
          {
            backgroundColor: color + '20',
            shadowColor: color,
            shadowOpacity: 0.5,
            shadowRadius: 10,
            shadowOffset: {width: 0, height: 0},
          },
        ]}>
        <AppText className="text-2xl">{emoji}</AppText>
      </View>
      <AppText
        className="text-foreground text-xs font-sans-medium mt-2 text-center"
        style={{color: color}}>
        {label}
      </AppText>
    </Animated.View>
  );
}

/**
 * Mục đích: Nút Google Sign-In dạng capsule cao cấp với glow pulse
 * Tham số đầu vào: onPress, isLoading
 * Tham số đầu ra: JSX.Element - nút đăng nhập premium
 * Khi nào sử dụng: LoginScreen - nút đăng nhập chính
 */
function GoogleSignInButton({
  onPress,
  isLoading,
}: {
  onPress: () => void;
  isLoading: boolean;
}) {
  const glowOpacity = useSharedValue(0.3);
  const btnScale = useSharedValue(1);

  useEffect(() => {
    // Viền xanh glow nhấp nháy nhẹ
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.9, {duration: 1800, easing: Easing.inOut(Easing.sin)}),
        withTiming(0.3, {duration: 1800, easing: Easing.inOut(Easing.sin)}),
      ),
      -1,
      true,
    );
  }, [glowOpacity]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.googleButtonOuter,
        glowStyle,
      ]}>
      <LinearGradient
        colors={['#4ade80', '#22c55e']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.googleGradientBtn}>
        <AppButton
          variant="ghost"
          className="w-full h-full rounded-2xl"
          onPress={onPress}
          disabled={isLoading}>
          <View className="flex-row items-center justify-center gap-3">
            <AppText className="text-2xl">🔐</AppText>
            <AppText className="text-black font-sans-bold text-lg">
              {isLoading ? 'Đang đăng nhập...' : 'Continue with Google'}
            </AppText>
          </View>
        </AppButton>
      </LinearGradient>
    </Animated.View>
  );
}

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

  // Animation values cho toàn bộ content
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(40);
  const logoGlow = useSharedValue(0.3);

  useEffect(() => {
    // Cấu hình Google Sign-In với Web Client ID và iOS Client ID từ .env
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT_ID,
      iosClientId: Config.GOOGLE_IOS_CLIENT_ID,
      offlineAccess: true,
    });



    // Entry animation cho toàn bộ content
    contentOpacity.value = withDelay(200, withTiming(1, {duration: 600}));
    contentTranslateY.value = withDelay(
      200,
      withSpring(0, {damping: 14, stiffness: 80}),
    );

    // Logo glow pulse
    logoGlow.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(0.7, {duration: 2000, easing: Easing.inOut(Easing.sin)}),
          withTiming(0.2, {duration: 2000, easing: Easing.inOut(Easing.sin)}),
        ),
        -1,
        true,
      ),
    );
  }, [contentOpacity, contentTranslateY, logoGlow]);

  /**
   * Mục đích: Xử lý đăng nhập bằng Google
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi user nhấn nút "Continue with Google"
   */
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);


      // Kiểm tra Google Play Services (Android)
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

      // Mở Google Sign-In popup
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;

      if (!idToken) {
        throw new Error('Không nhận được ID token từ Google');
      }



      // Gửi idToken cho Supabase để tạo session
      const {user, session} = await authService.signInWithGoogle(idToken);

      if (user && session) {

        setUser(user);
        setSession(session);
      }
    } catch (error: any) {


      // Xử lý các lỗi cụ thể của Google Sign-In
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        return; // Không hiện alert khi user tự huỷ
      }

      if (error?.code === statusCodes.IN_PROGRESS) {
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

  // Animated styles
  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{translateY: contentTranslateY.value}],
  }));

  const logoGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: logoGlow.value,
  }));

  return (
    <View style={styles.container}>
      {/* Gradient Background - consistency với Splash */}
      <LinearGradient
        colors={['#0a0a0a', '#0d1f12', '#071210', '#0a0a0a']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating Orbs - ít hơn splash (6 thay vì 10) */}
      <FloatingOrbs count={6} />

      {/* Nội dung chính - slide up from bottom */}
      <Animated.View style={[styles.content, contentAnimStyle]}>
        {/* Logo + Welcome */}
        <View style={styles.heroSection}>
          {/* Logo với glow effect */}
          <Animated.View style={[styles.loginLogoBox, logoGlowStyle]}>
            <LinearGradient
              colors={['#4ade80', '#22c55e', '#16a34a']}
              style={styles.loginLogoGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}>
              <AppText className="text-5xl">🎧</AppText>
            </LinearGradient>
          </Animated.View>

          {/* Welcome Text */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <AppText
              variant={'heading1'}
              className="text-3xl font-sans-bold text-foreground text-center">
              Welcome Back
            </AppText>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <AppText className="text-neutrals300 text-center mt-3 text-base leading-6">
              Đăng nhập để tiếp tục{'\n'}hành trình học tập 🚀
            </AppText>
          </Animated.View>
        </View>

        {/* Skill Badges - stagger bounce in */}
        <View style={styles.badgesRow}>
          {SKILL_BADGES.map((badge, index) => (
            <SkillBadge key={index} {...badge} />
          ))}
        </View>

        {/* Google Sign-In Button với shimmer */}
        <Animated.View
          entering={FadeInUp.delay(1200).springify()}
          style={styles.buttonContainer}>
          <GoogleSignInButton
            onPress={handleGoogleSignIn}
            isLoading={isLoading}
          />
        </Animated.View>

        {/* Footer */}
        <Animated.View
          entering={FadeInUp.delay(1500).duration(800)}
          style={styles.footer}>
          <AppText className="text-neutrals500 text-center text-xs leading-5">
            Bằng việc đăng nhập, bạn đồng ý với{'\n'}
            Điều khoản sử dụng & Chính sách bảo mật
          </AppText>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Login luôn dùng OLED black
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loginLogoBox: {
    width: 88,
    height: 88,
    borderRadius: 26,
    overflow: 'hidden',
    marginBottom: 24,
    // Glow shadow
    shadowColor: SKILL_COLORS.speaking.dark,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 25,
    elevation: 10,
  },
  loginLogoGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 48,
  },
  skillBadge: {
    alignItems: 'center',
    width: 80,
  },
  skillIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 24,
  },
  googleButtonOuter: {
    width: '100%',
    borderRadius: 18,
    // Glow shadow xung quanh nút
    shadowColor: SKILL_COLORS.speaking.dark,
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  googleGradientBtn: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    paddingBottom: 40,
    paddingHorizontal: 32,
  },
});
