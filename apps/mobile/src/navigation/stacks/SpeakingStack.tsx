import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SpeakingConfigScreen from '@/screens/speaking/ConfigScreen';
import PracticeScreen from '@/screens/speaking/PracticeScreen';
import FeedbackScreen from '@/screens/speaking/FeedbackScreen';

export type SpeakingStackParamList = {
  Config: undefined;
  Practice: undefined;
  Feedback: undefined;
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
 */
export default function SpeakingStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Config" component={SpeakingConfigScreen} />
      <Stack.Screen name="Practice" component={PracticeScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
    </Stack.Navigator>
  );
}
