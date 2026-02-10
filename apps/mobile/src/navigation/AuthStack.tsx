import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthStackParamList} from './types';
import OnboardingScreen from '@/screens/OnboardingScreen';
import LoginScreen from '@/screens/auth/LoginScreen';
import {useAppStore} from '@/store/useAppStore';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Mục đích: Navigator cho luồng xác thực (chưa đăng nhập)
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: RootNavigator hiển thị khi user chưa đăng nhập
 *   - Nếu isFirstLaunch = true → bắt đầu từ Onboarding
 *   - Nếu isFirstLaunch = false → bắt đầu từ Login
 */
export default function AuthStack() {
  const isFirstLaunch = useAppStore(state => state.isFirstLaunch);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
      initialRouteName={isFirstLaunch ? 'Onboarding' : 'Login'}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
