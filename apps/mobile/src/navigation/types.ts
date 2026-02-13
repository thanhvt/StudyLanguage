import {NavigatorScreenParams} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

// ===========================
// Auth Stack (chưa đăng nhập)
// ===========================
export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
};

// ===========================
// Main Tab Navigator (đã đăng nhập)
// ===========================
export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Profile: undefined;
};

// ===========================
// App Stack (màn hình con bên trong Main)
// ===========================
export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Settings: undefined;
  About: undefined;
  Listening: undefined;
  Reading: undefined;
  // TODO: Thêm Speaking route khi implement Speaking module
  // Demo screens (giữ cho development)
  ComponentsDemo: undefined;
};

// ===========================
// Screen Props Types
// ===========================
export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  NativeStackScreenProps<MainTabParamList, T>;

export type AppStackScreenProps<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T>;

// ===========================
// Global Navigation Types
// ===========================
declare global {
  namespace ReactNavigation {
    interface RootParamList extends AppStackParamList {}
  }
}
