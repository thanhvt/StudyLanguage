import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/components/ui';

/**
 * Mục đích: Placeholder cho tab History (sẽ triển khai đầy đủ ở Phase sau)
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Tab thứ 2 trong MainTabs, hiển thị lịch sử học tập
 */
export default function HistoryScreen() {
  return (
    <View className="flex-1 bg-background items-center justify-center p-8">
      <AppText className="text-4xl mb-4">📊</AppText>
      <AppText
        variant={'heading1'}
        className="text-xl font-sans-bold text-foreground text-center">
        Lịch sử học tập
      </AppText>
      <AppText className="text-neutrals400 text-center mt-2">
        Sẽ hiển thị lịch sử bài nghe, nói, đọc
      </AppText>
    </View>
  );
}
