/**
 * RadioSkeleton — Loading indicator cho RadioScreen khi đang generate
 *
 * Mục đích: Hiển thị trạng thái generating với SSE progress hoặc fallback spinner
 * Tham số đầu vào: trackCount, progress (optional SSE data)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: RadioScreen state='generating'
 */
import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {LISTENING_BLUE} from '@/constants/listening';
import type {RadioProgressEvent} from '@/services/api/radioSSE';

interface RadioSkeletonProps {
  /** Số track đang tạo */
  trackCount?: number;
  /** T-13: SSE progress data (nếu có) */
  progress?: RadioProgressEvent | null;
}

/**
 * Mục đích: T-27 + T-13 — Hiển thị trạng thái AI đang tạo playlist
 * Tham số đầu vào: trackCount — số lượng tracks, progress — SSE progress event
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: radioState === 'generating' trong RadioScreen
 */
export default function RadioSkeleton({trackCount = 4, progress}: RadioSkeletonProps) {
  const colors = useColors();

  // T-13: Có SSE progress → hiện chi tiết
  const hasProgress = progress && progress.total > 0;

  return (
    <View className="px-6 pt-6 items-center">
      {hasProgress ? (
        <>
          {/* Progress bar */}
          <View
            className="w-full h-2 rounded-full overflow-hidden mb-4"
            style={{backgroundColor: `${LISTENING_BLUE}20`}}>
            <View
              className="h-full rounded-full"
              style={{
                backgroundColor: LISTENING_BLUE,
                width: `${progress.percent}%`,
              }}
            />
          </View>

          {/* Thông tin track đang tạo */}
          <AppText
            className="text-sm font-sans-bold text-center"
            style={{color: LISTENING_BLUE}}>
            🎙 Track {progress.trackIndex + 1}/{progress.total}
          </AppText>
          <AppText
            className="text-xs font-sans-medium mt-1 text-center"
            numberOfLines={1}
            style={{color: colors.foreground}}>
            {progress.topic}
          </AppText>

          {/* Đếm */}
          <AppText
            className="text-xs mt-2 text-center"
            style={{color: colors.neutrals400}}>
            Đã tạo: {progress.trackIndex + 1} — Còn lại: {progress.total - progress.trackIndex - 1}
          </AppText>
        </>
      ) : (
        <>
          {/* Fallback: Spinner khi chưa có SSE */}
          <ActivityIndicator size="large" color={LISTENING_BLUE} />
          <AppText
            className="text-sm font-sans-medium mt-4 text-center"
            style={{color: colors.foreground}}>
            AI đang tạo {trackCount} hội thoại...
          </AppText>
        </>
      )}
    </View>
  );
}
