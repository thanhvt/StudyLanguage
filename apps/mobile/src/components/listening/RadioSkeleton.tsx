/**
 * RadioSkeleton — Loading indicator cho RadioScreen khi đang generate
 *
 * Mục đích: Hiển thị SSE progress (track đang tạo, progress bar)
 * Tham số đầu vào: trackCount, progress (SSE data)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: RadioScreen khi có SSE progress data
 */
import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {LISTENING_BLUE} from '@/constants/listening';
import type {RadioProgressEvent} from '@/services/api/radioSSE';

interface RadioSkeletonProps {
  /** Số track đang tạo */
  trackCount?: number;
  /** T-13: SSE progress data */
  progress?: RadioProgressEvent | null;
}

/**
 * Mục đích: T-13 — Hiển thị chi tiết SSE progress khi AI đang tạo playlist
 * Tham số đầu vào: progress — SSE progress event
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: RadioScreen chỉ render khi có SSE data (sseProgress.total > 0)
 */
export default function RadioSkeleton({progress}: RadioSkeletonProps) {
  const colors = useColors();

  if (!progress || progress.total <= 0) return null;

  return (
    <View className="px-6 pt-4 items-center">
      {/* Progress bar */}
      <View
        className="w-full h-2 rounded-full overflow-hidden mb-3"
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
    </View>
  );
}
