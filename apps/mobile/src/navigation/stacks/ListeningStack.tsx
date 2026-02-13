import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ListeningConfigScreen from '@/screens/listening/ConfigScreen';
import ListeningPlayerScreen from '@/screens/listening/PlayerScreen';
import RadioScreen from '@/screens/listening/RadioScreen';

export type ListeningStackParamList = {
  Config: undefined;
  Player: undefined;
  Radio: undefined;
};

const Stack = createNativeStackNavigator<ListeningStackParamList>();

/**
 * Mục đích: Navigation stack cho Listening feature
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Được navigate tới từ Dashboard QuickActions hoặc MainStack
 *   - Config → Player (sau khi generate thành công)
 *   - Config → Radio (chuyển sang Radio Mode)
 *   - Player → Config (nút quay lại / bài mới)
 */
export default function ListeningStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Config" component={ListeningConfigScreen} />
      <Stack.Screen name="Player" component={ListeningPlayerScreen} />
      <Stack.Screen name="Radio" component={RadioScreen} />
    </Stack.Navigator>
  );
}

