import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MainTabParamList, AppStackParamList} from './types';
import HomeScreen from '@/screens/home';
import HistoryScreen from '@/screens/tabs/HistoryScreen';
import ProfileScreen from '@/screens/tabs/ProfileScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import AboutScreen from '@/screens/AboutScreen';
import CustomTabBar from '@/navigation/components/CustomTabBar';
import CustomScreenHeader from '@/navigation/components/ScreenHeader';
import ListeningStack from '@/navigation/stacks/ListeningStack';
import ReadingStack from '@/navigation/stacks/ReadingStack';
import SpeakingStack from '@/navigation/stacks/SpeakingStack';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * Mục đích: Bottom tab navigator chính của app (sau khi đăng nhập)
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Được render bên trong MainStack, hiển thị 3 tabs chính
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
        options={{title: 'HOME'}}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{title: 'HISTORY'}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{title: 'PROFILE'}}
      />
    </Tab.Navigator>
  );
}

/**
 * Mục đích: Stack navigator chính chứa tabs + các màn hình con (Settings, About...)
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: RootNavigator hiển thị khi user đã đăng nhập
 *   - MainTabs: tab navigator chính
 *   - Settings, About: push screen từ Profile tab
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
        name="Settings"
        component={SettingsScreen}
        options={{title: 'Cài đặt'}}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{title: 'Về ứng dụng'}}
      />
      <Stack.Screen
        name="Listening"
        component={ListeningStack}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Reading"
        component={ReadingStack}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Speaking"
        component={SpeakingStack}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}
