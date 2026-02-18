import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ReadingConfigScreen from '@/screens/reading/ConfigScreen';
import ArticleScreen from '@/screens/reading/ArticleScreen';
import PracticeScreen from '@/screens/reading/PracticeScreen';

export type ReadingStackParamList = {
  Config: undefined;
  Article: undefined;
  Practice: undefined;
};

const Stack = createNativeStackNavigator<ReadingStackParamList>();

/**
 * Mục đích: Navigation stack cho Reading feature
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Được navigate tới từ Dashboard QuickActions hoặc MainStack
 *   - Config → Article (sau khi generate thành công)
 *   - Article → Practice (user chọn luyện đọc)
 *   - Article → Config (nút quay lại / bài mới)
 */
export default function ReadingStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Config" component={ReadingConfigScreen} />
      <Stack.Screen name="Article" component={ArticleScreen} />
      <Stack.Screen name="Practice" component={PracticeScreen} />
    </Stack.Navigator>
  );
}

