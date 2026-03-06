/**
 * RadioTrackSheet — Bottom Sheet hiển thị transcript cho Radio track
 *
 * Mục đích: Mở sheet 70% khi user tap track, hiện transcript chat bubble
 *   + progress bar + play/pause/speed controls
 * Tham số đầu vào: RadioTrackSheetProps
 * Tham số đầu ra: JSX.Element (Bottom Sheet)
 * Khi nào sử dụng: RadioScreen → tap track → mở sheet
 */
import React, {useCallback, useMemo, useRef} from 'react';
import {View, TouchableOpacity, ActivityIndicator} from 'react-native';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useRadioPlayer} from '@/hooks/useRadioPlayer';
import {useRadioStore} from '@/store/useRadioStore';
import {useProgress} from 'react-native-track-player';
import {formatTime} from '@/utils/formatTime';
import {LISTENING_BLUE} from '@/constants/listening';
import type {RadioPlaylistItem} from '@/services/api/radio';

const LISTENING_ORANGE = '#F97316';

interface RadioTrackSheetProps {
  /** Track đang hiện trong sheet (null = đóng sheet) */
  track: RadioPlaylistItem | null;
  /** Index của track trong playlist */
  trackIndex: number;
  /** Đang phát audio không */
  isPlaying: boolean;
  /** Đang loading audio không */
  isLoading: boolean;
  /** Callback đóng sheet */
  onClose: () => void;
}

/**
 * Mục đích: Bottom sheet transcript cho Radio Mode
 * Tham số đầu vào: RadioTrackSheetProps
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: RadioScreen mở khi user tap vào track
 */
export default function RadioTrackSheet({
  track,
  trackIndex,
  isPlaying,
  isLoading,
  onClose,
}: RadioTrackSheetProps) {
  const colors = useColors();
  const haptic = useHaptic();
  const {togglePlay, skip, previous, setSpeed} = useRadioPlayer();
  const playbackSpeed = useRadioStore(s => s.playbackSpeed);
  const progress = useProgress(500);
  const sheetRef = useRef<BottomSheet>(null);

  // Snap points: 70% màn hình
  const snapPoints = useMemo(() => ['70%'], []);

  // Đóng sheet
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Cycle speed
  const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const handleSpeedCycle = useCallback(async () => {
    const currentIdx = SPEED_OPTIONS.indexOf(playbackSpeed);
    const nextIdx = (currentIdx + 1) % SPEED_OPTIONS.length;
    haptic.light();
    await setSpeed(SPEED_OPTIONS[nextIdx]);
  }, [playbackSpeed, setSpeed, haptic]);

  // Progress percent
  const progressPercent =
    progress.duration > 0 ? (progress.position / progress.duration) * 100 : 0;

  if (!track) return null;

  const exchanges = track.conversation || [];

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={handleClose}
      handleIndicatorStyle={{backgroundColor: colors.neutrals400, width: 40}}
      backgroundStyle={{
        backgroundColor: colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
      style={{
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -4},
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      }}>
      {/* Header */}
      <View className="px-5 pb-3 border-b" style={{borderColor: colors.glassBorder}}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <AppText
              className="font-sans-bold text-base"
              style={{color: colors.foreground}}
              numberOfLines={1}>
              {track.topic}
            </AppText>
            <AppText className="text-xs mt-0.5" style={{color: colors.neutrals400}}>
              {exchanges.length} câu • {track.numSpeakers} người •{' '}
              Track {trackIndex + 1}
            </AppText>
          </View>
          <TouchableOpacity
            onPress={handleClose}
            className="p-2 -mr-2"
            accessibilityLabel="Đóng"
            accessibilityRole="button">
            <Icon name="X" className="w-5 h-5" style={{color: colors.neutrals400}} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Transcript */}
      <BottomSheetScrollView
        contentContainerStyle={{padding: 16, paddingBottom: 120}}
        showsVerticalScrollIndicator={false}>
        {exchanges.map((exchange, index) => {
          const isEven = index % 2 === 0;
          return (
            <View
              key={index}
              className="rounded-2xl p-3.5 mb-2.5"
              style={{
                backgroundColor: isEven
                  ? `${LISTENING_BLUE}10`
                  : `${LISTENING_ORANGE}10`,
              }}>
              {/* Speaker */}
              <View className="flex-row items-center mb-1.5">
                <View
                  className="w-6 h-6 rounded-full items-center justify-center mr-1.5"
                  style={{
                    backgroundColor: isEven
                      ? `${LISTENING_BLUE}20`
                      : `${LISTENING_ORANGE}20`,
                  }}>
                  <AppText className="text-[10px]">
                    {isEven ? '👤' : '👥'}
                  </AppText>
                </View>
                <AppText
                  className="text-xs font-sans-semibold"
                  style={{color: isEven ? LISTENING_BLUE : LISTENING_ORANGE}}>
                  {exchange.speaker}
                </AppText>
              </View>
              {/* Text */}
              <AppText
                className="text-sm leading-5"
                style={{color: colors.foreground}}>
                {exchange.text}
              </AppText>
            </View>
          );
        })}
      </BottomSheetScrollView>

      {/* Footer: Progress + Controls */}
      <View
        className="absolute bottom-0 left-0 right-0 px-5 pt-3"
        style={{
          paddingBottom: 34,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.glassBorder,
        }}>
        {/* Progress bar */}
        <View className="mb-3">
          <View
            className="h-1.5 rounded-full overflow-hidden"
            style={{backgroundColor: `${LISTENING_BLUE}20`}}>
            <View
              className="h-full rounded-full"
              style={{
                width: `${Math.min(progressPercent, 100)}%`,
                backgroundColor: LISTENING_BLUE,
              }}
            />
          </View>
          <View className="flex-row justify-between mt-1">
            <AppText className="text-[10px]" style={{color: colors.neutrals400}}>
              {formatTime(progress.position)}
            </AppText>
            <AppText className="text-[10px]" style={{color: colors.neutrals400}}>
              {formatTime(progress.duration)}
            </AppText>
          </View>
        </View>

        {/* Controls */}
        <View className="flex-row items-center justify-between">
          {/* Speed */}
          <TouchableOpacity
            onPress={handleSpeedCycle}
            className="rounded-lg px-2.5 py-1"
            style={{backgroundColor: `${LISTENING_BLUE}15`}}
            accessibilityLabel={`Tốc độ ${playbackSpeed}x`}>
            <AppText
              className="text-xs font-sans-bold"
              style={{color: playbackSpeed !== 1.0 ? LISTENING_BLUE : colors.neutrals400}}>
              {playbackSpeed}x
            </AppText>
          </TouchableOpacity>

          {/* Previous */}
          <TouchableOpacity
            onPress={() => { haptic.light(); previous(); }}
            className="p-2"
            accessibilityLabel="Bài trước">
            <Icon name="SkipBack" className="w-5 h-5" style={{color: colors.foreground}} />
          </TouchableOpacity>

          {/* Play/Pause */}
          <TouchableOpacity
            onPress={() => { haptic.medium(); togglePlay(); }}
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{backgroundColor: LISTENING_BLUE}}
            accessibilityLabel={isPlaying ? 'Tạm dừng' : 'Phát'}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon
                name={isPlaying ? 'Pause' : 'Play'}
                className="w-5 h-5"
                style={{color: '#FFFFFF'}}
              />
            )}
          </TouchableOpacity>

          {/* Next */}
          <TouchableOpacity
            onPress={() => { haptic.light(); skip(); }}
            className="p-2"
            accessibilityLabel="Bài tiếp">
            <Icon name="SkipForward" className="w-5 h-5" style={{color: colors.foreground}} />
          </TouchableOpacity>

          {/* Placeholder cân bằng */}
          <View style={{width: 44}} />
        </View>
      </View>
    </BottomSheet>
  );
}
