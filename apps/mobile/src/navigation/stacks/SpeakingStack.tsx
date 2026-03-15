import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SpeakingHomeScreen from '@/screens/speaking/SpeakingHomeScreen';
import SpeakingConfigScreen from '@/screens/speaking/ConfigScreen';
import PracticeScreen from '@/screens/speaking/PracticeScreen';
import FeedbackScreen from '@/screens/speaking/FeedbackScreen';
import ConversationSetupScreen from '@/screens/speaking/ConversationSetupScreen';
import CoachSetupScreen from '@/screens/speaking/CoachSetupScreen';
import CoachSessionScreen from '@/screens/speaking/CoachSessionScreen';
import ConversationScreen from '@/screens/speaking/ConversationScreen';
import SessionSummaryScreen from '@/screens/speaking/SessionSummaryScreen';
import CustomScenariosScreen from '@/screens/speaking/CustomScenariosScreen';
import ShadowingConfigScreen from '@/screens/speaking/ShadowingConfigScreen';
import ShadowingSessionScreen from '@/screens/speaking/ShadowingSessionScreen';
import ShadowingFeedbackScreen from '@/screens/speaking/ShadowingFeedbackScreen';
import ShadowingSessionSummaryScreen from '@/screens/speaking/ShadowingSessionSummaryScreen';
import RoleplaySelectScreen from '@/screens/speaking/RoleplaySelectScreen';
import RoleplaySessionScreen from '@/screens/speaking/RoleplaySessionScreen';
import ProgressDashboardScreen from '@/screens/speaking/ProgressDashboardScreen';
import RecordingHistoryScreen from '@/screens/speaking/RecordingHistoryScreen';

export type SpeakingStackParamList = {
  // === Màn hình chính ===
  SpeakingHome: undefined;

  // === Practice Mode Flow ===
  PracticeConfig: undefined;
  PracticeSession: undefined;
  Feedback: undefined;

  // === AI Conversation Flow ===
  ConversationSetup: undefined;
  ConversationSession: undefined;
  SessionSummary: undefined;

  // === Cac mode khác ===
  CustomScenarios: undefined;
  ShadowingConfig: undefined;
  ShadowingSession: undefined;
  ShadowingFeedback: undefined;
  ShadowingSessionSummary: undefined;
  RoleplaySelect: undefined;
  RoleplaySession: {title: string; totalTurns: number; emoji: string};

  ProgressDashboard: undefined;
  RecordingHistory: undefined;

  // === Backward-compatible aliases ===
  Config: undefined;
  Practice: undefined;
  CoachSetup: undefined;
  CoachSession: undefined;
};

const Stack = createNativeStackNavigator<SpeakingStackParamList>();

/**
 * Mục đích: Navigation stack cho Speaking feature
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Được navigate tới từ Dashboard QuickActions hoặc MainStack
 *   - SpeakingHome → PracticeConfig → PracticeSession → Feedback
 *   - SpeakingHome → ConversationSetup → ConversationSession → SessionSummary
 *   - SpeakingHome → ShadowingConfig → ShadowingSession → ShadowingFeedback → ShadowingSessionSummary

 */
export default function SpeakingStack() {
  return (
    <Stack.Navigator
      initialRouteName="SpeakingHome"
      screenOptions={{headerShown: false}}>
      {/* Màn hình chính */}
      <Stack.Screen name="SpeakingHome" component={SpeakingHomeScreen} />

      {/* Practice Mode */}
      <Stack.Screen name="PracticeConfig" component={SpeakingConfigScreen} />
      <Stack.Screen name="PracticeSession" component={PracticeScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />

      {/* AI Conversation */}
      <Stack.Screen name="ConversationSetup" component={ConversationSetupScreen} />
      <Stack.Screen name="CoachSetup" component={CoachSetupScreen} />
      <Stack.Screen name="CoachSession" component={CoachSessionScreen} />
      <Stack.Screen name="ConversationSession" component={ConversationScreen} />
      <Stack.Screen name="SessionSummary" component={SessionSummaryScreen} />

      {/* Các mode khác */}
      <Stack.Screen name="CustomScenarios" component={CustomScenariosScreen} />
      <Stack.Screen name="ShadowingConfig" component={ShadowingConfigScreen} />
      <Stack.Screen name="ShadowingSession" component={ShadowingSessionScreen} />
      <Stack.Screen name="ShadowingFeedback" component={ShadowingFeedbackScreen} />
      <Stack.Screen name="ShadowingSessionSummary" component={ShadowingSessionSummaryScreen} />
      <Stack.Screen name="RoleplaySelect" component={RoleplaySelectScreen} />
      <Stack.Screen name="RoleplaySession" component={RoleplaySessionScreen} />

      <Stack.Screen name="ProgressDashboard" component={ProgressDashboardScreen} />
      <Stack.Screen name="RecordingHistory" component={RecordingHistoryScreen} />

      {/* Legacy routes — backward compat (sẽ xóa sau khi migration xong) */}
      <Stack.Screen name="Config" component={SpeakingConfigScreen} />
      <Stack.Screen name="Practice" component={PracticeScreen} />
    </Stack.Navigator>
  );
}
