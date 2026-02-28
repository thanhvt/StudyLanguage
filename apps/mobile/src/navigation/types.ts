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
  Listening: undefined;
  Speaking: undefined;
  Reading: undefined;
  More: undefined;
};

// ===========================
// App Stack (màn hình con bên trong Main)
// ===========================
export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Settings: undefined;
  AppearanceSettings: undefined;
  AudioSettings: undefined;
  PrivacySettings: undefined;
  Feedback: undefined;
  About: undefined;
  // History detail — xem chi tiết bản ghi lịch sử
  HistoryDetail: {entryId: string};
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
