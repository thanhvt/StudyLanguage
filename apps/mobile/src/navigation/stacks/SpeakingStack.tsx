import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SpeakingConfigScreen from '@/screens/speaking/ConfigScreen';
import PracticeScreen from '@/screens/speaking/PracticeScreen';
import FeedbackScreen from '@/screens/speaking/FeedbackScreen';
import CoachSetupScreen from '@/screens/speaking/CoachSetupScreen';
import CoachSessionScreen from '@/screens/speaking/CoachSessionScreen';
import CustomScenariosScreen from '@/screens/speaking/CustomScenariosScreen';
import ShadowingScreen from '@/screens/speaking/ShadowingScreen';
import RoleplaySelectScreen from '@/screens/speaking/RoleplaySelectScreen';
import RoleplaySessionScreen from '@/screens/speaking/RoleplaySessionScreen';
import TongueTwisterScreen from '@/screens/speaking/TongueTwisterScreen';
import ProgressDashboardScreen from '@/screens/speaking/ProgressDashboardScreen';
import RecordingHistoryScreen from '@/screens/speaking/RecordingHistoryScreen';

export type SpeakingStackParamList = {
  Config: undefined;
  Practice: undefined;
  Feedback: undefined;
  CoachSetup: undefined;
  CoachSession: undefined;
  CustomScenarios: undefined;
  Shadowing: undefined;
  RoleplaySelect: undefined;
  RoleplaySession: {title: string; totalTurns: number; emoji: string};
  TongueTwister: undefined;
  ProgressDashboard: undefined;
  RecordingHistory: undefined;
};

const Stack = createNativeStackNavigator<SpeakingStackParamList>();

/**
 * Mục đích: Navigation stack cho Speaking feature
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Được navigate tới từ Dashboard QuickActions hoặc MainStack
 *   - Config → Practice (sau khi generate sentences thành công)
 *   - Practice → Feedback (sau khi ghi âm + AI đánh giá)
 *   - Feedback → Practice (luyện lại / câu tiếp)
 *   - Config → CoachSetup → CoachSession (coach mode flow)
 */
export default function SpeakingStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Config" component={SpeakingConfigScreen} />
      <Stack.Screen name="Practice" component={PracticeScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
      <Stack.Screen name="CoachSetup" component={CoachSetupScreen} />
      <Stack.Screen name="CoachSession" component={CoachSessionScreen} />
      <Stack.Screen name="CustomScenarios" component={CustomScenariosScreen} />
      <Stack.Screen name="Shadowing" component={ShadowingScreen} />
      <Stack.Screen name="RoleplaySelect" component={RoleplaySelectScreen} />
      <Stack.Screen name="RoleplaySession" component={RoleplaySessionScreen} />
      <Stack.Screen name="TongueTwister" component={TongueTwisterScreen} />
      <Stack.Screen name="ProgressDashboard" component={ProgressDashboardScreen} />
      <Stack.Screen name="RecordingHistory" component={RecordingHistoryScreen} />
    </Stack.Navigator>
  );
}

