/**
 * ExchangeItem — Component render 1 exchange trong transcript
 *
 * Mục đích: Wrapper React.memo cho mỗi exchange, chứa useWordHighlight hook
 *   Giải quyết vấn đề: hooks không thể gọi trong .map() loop
 *   → tách thành component riêng → mỗi exchange có hook riêng
 * Tham số đầu vào: ExchangeItemProps
 * Tham số đầu ra: JSX.Element — 1 chat bubble
 * Khi nào sử dụng: PlayerScreen → exchanges.map() → <ExchangeItem />
 *   Flow: PlayerScreen → ExchangeItem (React.memo) → useWordHighlight → TappableTranscript
 */

import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {AppText} from '@/components/ui';
import {TappableTranscript} from '@/components/listening';
import {useWordHighlight} from '@/hooks/useWordHighlight';
import type {WordTimestamp} from '@/services/api/listening';

// Màu sắc Listening module
const LISTENING_BLUE = '#3B82F6';
const LISTENING_ORANGE = '#F97316';

interface ExchangeItemProps {
  /** Exchange data */
  exchange: {speaker: string; text: string; vietnamese?: string};
  /** Index trong danh sách exchanges */
  index: number;
  /** Có đang active (đang phát) không */
  isActive: boolean;
  /** Speaker chẵn (speaker 1) hay lẻ (speaker 2) */
  isEvenSpeaker: boolean;
  /** Đã bookmark chưa */
  isBookmarked: boolean;
  /** Tên hiển thị speaker */
  speakerDisplayName: string;
  /** Hiện bản dịch tiếng Việt không */
  showTranslation: boolean;
  /** Audio đang phát không */
  isPlaying: boolean;
  /** Tốc độ phát */
  playbackSpeed: number;
  /** Word timestamps cho câu này (từ Azure) */
  wordTimestamps?: WordTimestamp[];
  /** Callback khi tap vào exchange */
  onPress: (index: number) => void;
  /** Callback khi long press (bookmark) */
  onLongPress: (index: number) => void;
  /** Callback khi tap vào 1 từ (dictionary) */
  onWordPress: (word: string) => void;
  /** Callback onLayout (đo vị trí Y cho auto-scroll) */
  onLayout?: (index: number, y: number) => void;
  /** Màu foreground */
  foregroundColor: string;
  /** Màu glass hover */
  glassHoverColor: string;
  /** Màu neutrals 500 */
  neutrals500Color: string;
}

/**
 * Mục đích: Render 1 exchange chat bubble với word-level karaoke highlight
 * Tham số đầu vào: ExchangeItemProps
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: PlayerScreen → exchanges.map() → <ExchangeItem />
 */
const ExchangeItem = React.memo(function ExchangeItem({
  exchange,
  index,
  isActive,
  isEvenSpeaker,
  isBookmarked,
  speakerDisplayName,
  showTranslation,
  isPlaying,
  playbackSpeed,
  wordTimestamps,
  onPress,
  onLongPress,
  onWordPress,
  onLayout,
  foregroundColor,
  glassHoverColor,
  neutrals500Color,
}: ExchangeItemProps) {
  // Word-level karaoke highlight — chỉ chạy interval khi isActive + isPlaying
  const {currentWordIndex} = useWordHighlight({
    wordTimestamps,
    isActive,
    isPlaying,
    playbackSpeed,
  });

  return (
    <TouchableOpacity
      onPress={() => onPress(index)}
      onLongPress={() => onLongPress(index)}
      delayLongPress={400}
      activeOpacity={0.7}
      className="rounded-2xl p-4 border"
      onLayout={(e) => {
        onLayout?.(index, e.nativeEvent.layout.y);
      }}
      style={{
        backgroundColor: isActive
          ? `${LISTENING_BLUE}15`
          : isBookmarked
            ? `${LISTENING_ORANGE}08`
            : glassHoverColor,
        borderColor: isActive
          ? `${LISTENING_BLUE}40`
          : isBookmarked
            ? `${LISTENING_ORANGE}30`
            : 'transparent',
      }}>
      {/* Speaker label */}
      <View className="flex-row items-center mb-2">
        <View
          className="w-7 h-7 rounded-full items-center justify-center mr-2"
          style={{
            backgroundColor: isEvenSpeaker
              ? `${LISTENING_BLUE}20`
              : `${LISTENING_ORANGE}20`,
          }}>
          <AppText className="text-xs">
            {isEvenSpeaker ? '👤' : '👥'}
          </AppText>
        </View>
        <AppText
          className="text-sm font-sans-semibold"
          style={{color: isEvenSpeaker ? LISTENING_BLUE : LISTENING_ORANGE}}>
          {speakerDisplayName}
        </AppText>
        {isActive && (
          <View className="ml-auto flex-row items-end gap-0.5 h-3">
            <View className="w-0.5 h-1 rounded-full" style={{backgroundColor: LISTENING_BLUE}} />
            <View className="w-0.5 h-2 rounded-full" style={{backgroundColor: LISTENING_BLUE}} />
            <View className="w-0.5 h-3 rounded-full" style={{backgroundColor: LISTENING_BLUE}} />
            <View className="w-0.5 h-1.5 rounded-full" style={{backgroundColor: LISTENING_BLUE}} />
          </View>
        )}
        {isBookmarked && (
          <View className={isActive ? 'ml-1' : 'ml-auto'}>
            <AppText className="text-xs">⭐</AppText>
          </View>
        )}
      </View>

      {/* Nội dung tiếng Anh — karaoke highlight khi có wordTimestamps */}
      <TappableTranscript
        text={exchange.text}
        onWordPress={onWordPress}
        isActive={isActive}
        wordTimestamps={wordTimestamps}
        currentWordIndex={currentWordIndex}
      />

      {/* Bản dịch tiếng Việt */}
      {showTranslation && exchange.vietnamese && (
        <AppText className="text-sm mt-1 italic" style={{color: neutrals500Color}}>
          {exchange.vietnamese}
        </AppText>
      )}
    </TouchableOpacity>
  );
});

export default ExchangeItem;
