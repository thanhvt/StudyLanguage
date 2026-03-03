import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MainTabParamList, AppStackParamList} from './types';
import HomeScreen from '@/screens/home';
import MoreScreen from '@/screens/MoreScreen';
import AppearanceSettingsScreen from '@/screens/AppearanceSettingsScreen';
import AudioSettingsScreen from '@/screens/AudioSettingsScreen';
import PrivacySettingsScreen from '@/screens/PrivacySettingsScreen';
import AboutScreen from '@/screens/AboutScreen';
import FeedbackScreen from '@/screens/FeedbackScreen';
import CustomTabBar from '@/navigation/components/CustomTabBar';
import CustomScreenHeader from '@/navigation/components/ScreenHeader';
import ListeningStack from '@/navigation/stacks/ListeningStack';
import ReadingStack from '@/navigation/stacks/ReadingStack';
import SpeakingStack from '@/navigation/stacks/SpeakingStack';
import HistoryScreen from '@/screens/tabs/HistoryScreen';
import HistoryDetailScreen from '@/screens/history/HistoryDetailScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * Mục đích: Bottom tab navigator chính — 6 tabs (redesigned)
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Được render bên trong MainStack, hiển thị 6 tabs:
 *   - Trang chủ (Home) → Dashboard
 *   - Lịch sử (History) → HistoryScreen
 *   - Nghe (Listening) → ListeningStack
 *   - Nói (Speaking) → SpeakingStack
 *   - Đọc (Reading) → ReadingStack
 *   - Hồ sơ (Profile) → MoreScreen
 */
function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{title: 'Trang chủ'}}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{title: 'Lịch sử'}}
      />
      <Tab.Screen
        name="Listening"
        component={ListeningStack}
        options={{title: 'Nghe'}}
      />
      <Tab.Screen
        name="Speaking"
        component={SpeakingStack}
        options={{title: 'Nói'}}
      />
      <Tab.Screen
        name="Reading"
        component={ReadingStack}
        options={{title: 'Đọc'}}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{title: 'Hồ sơ'}}
      />
    </Tab.Navigator>
  );
}

/**
 * Mục đích: Stack navigator chính chứa tabs + các màn hình settings
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: RootNavigator hiển thị khi user đã đăng nhập
 *   - MainTabs: tab navigator chính (5 tabs)
 *   - AppearanceSettings, AudioSettings, PrivacySettings: push từ Profile tab
 *   - About: push từ Profile tab
 */
export default function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: props => <CustomScreenHeader {...props} />,
      }}>
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AppearanceSettings"
        component={AppearanceSettingsScreen}
        options={{title: 'Giao diện'}}
      />
      <Stack.Screen
        name="AudioSettings"
        component={AudioSettingsScreen}
        options={{title: 'Âm thanh'}}
      />
      <Stack.Screen
        name="PrivacySettings"
        component={PrivacySettingsScreen}
        options={{title: 'Quyền riêng tư'}}
      />
      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{title: 'Góp ý'}}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{title: 'Về ứng dụng'}}
      />
      <Stack.Screen
        name="HistoryDetail"
        component={HistoryDetailScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}
