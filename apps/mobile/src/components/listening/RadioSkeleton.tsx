/**
 * RadioSkeleton — Loading indicator cho RadioScreen khi đang generate
 *
 * Mục đích: Hiển thị trạng thái generating rõ ràng cho user
 * Tham số đầu vào: trackCount (số track đang tạo)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: RadioScreen state='generating'
 */
import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';

const LISTENING_BLUE = '#2563EB';

/**
 * Mục đích: T-27 — Hiển thị trạng thái AI đang tạo playlist
 * Tham số đầu vào: trackCount — số lượng tracks đang tạo
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: radioState === 'generating' trong RadioScreen
 */
export default function RadioSkeleton({trackCount = 4}: {trackCount?: number}) {
  const colors = useColors();

  return (
    <View className="px-6 pt-6 items-center">
      {/* Spinner */}
      <ActivityIndicator size="large" color={LISTENING_BLUE} />

      {/* Mô tả rõ ràng */}
      <AppText
        className="text-sm font-sans-medium mt-4 text-center"
        style={{color: colors.foreground}}>
        AI đang tạo {trackCount} hội thoại...
      </AppText>
    </View>
  );
}
