import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ListeningConfigScreen from '@/screens/listening/ConfigScreen';
import ListeningPlayerScreen from '@/screens/listening/PlayerScreen';
import RadioScreen from '@/screens/listening/RadioScreen';
import CustomScenariosScreen from '@/screens/listening/CustomScenariosScreen';
import BookmarksVocabularyScreen from '@/screens/listening/BookmarksVocabularyScreen';

export type ListeningStackParamList = {
  Config: undefined;
  Player: undefined;
  Radio: undefined;
  CustomScenarios: undefined;
  BookmarksVocabulary: undefined;
};

const Stack = createNativeStackNavigator<ListeningStackParamList>();

/**
 * Mục đích: Navigation stack cho Listening feature
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Được navigate tới từ Dashboard QuickActions hoặc MainStack
 *   - Config → Player (sau khi generate thành công)
 *   - Config → Radio (chuyển sang Radio Mode)
 *   - Config → CustomScenarios (CRUD kịch bản tùy chỉnh)
 *   - Player → BookmarksVocabulary (xem từ vựng + bookmarks)
 */
export default function ListeningStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Config" component={ListeningConfigScreen} />
      <Stack.Screen name="Player" component={ListeningPlayerScreen} />
      <Stack.Screen name="Radio" component={RadioScreen} />
      <Stack.Screen name="CustomScenarios" component={CustomScenariosScreen} />
      <Stack.Screen name="BookmarksVocabulary" component={BookmarksVocabularyScreen} />
    </Stack.Navigator>
  );
}

