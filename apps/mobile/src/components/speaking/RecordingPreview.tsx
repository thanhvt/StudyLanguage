import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import Icon from '@/components/ui/Icon';
import {VoiceVisualizer} from '@/components/speaking';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';

// =======================
// Types
// =======================

interface RecordingPreviewProps {
  /** URI file audio đã ghi */
  audioUri: string;
  /** Thời lượng ghi (seconds) */
  duration: number;
  /** Đang phát lại hay không */
  isPlaying: boolean;
  /** Khi nhấn phát lại */
  onPlayback: () => void;
  /** Khi nhấn "Ghi lại" */
  onReRecord: () => void;
  /** Khi nhấn "Gửi" / "Submit" */
  onSubmit: () => void;
  /** Đang xử lý gửi */
  isSubmitting?: boolean;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Hiển thị preview audio đã ghi trước khi submit
 * Tham số đầu vào: audioUri, duration, isPlaying, onPlayback, onReRecord, onSubmit
 * Tham số đầu ra: JSX.Element — card với waveform + 2 nút
 * Khi nào sử dụng:
 *   - PracticeScreen: sau khi user thả mic → hiện preview → chọn Ghi lại hoặc Gửi
 *   - CoachSessionScreen: có thể dùng nếu cần preview trước khi gửi
 */
export default function RecordingPreview({
  audioUri,
  duration,
  isPlaying,
  onPlayback,
  onReRecord,
  onSubmit,
  isSubmitting = false,
}: RecordingPreviewProps) {
  const colors = useColors();
  const speakingColor = SKILL_COLORS.speaking.dark;

  /**
   * Mục đích: Format seconds → mm:ss
   * Tham số đầu vào: s (number)
   * Tham số đầu ra: string
   * Khi nào sử dụng: Hiển thị thời lượng recording
   */
  const formatDuration = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <View style={[styles.container, {backgroundColor: colors.surface}]}>
      {/* Waveform + Play button */}
      <TouchableOpacity
        onPress={onPlayback}
        activeOpacity={0.7}
        style={styles.waveformRow}>
        <View style={[styles.playBtn, {backgroundColor: `${speakingColor}25`}]}>
          <Icon
            name={isPlaying ? 'Pause' : 'Play'}
            className="w-5 h-5"
            style={{color: speakingColor}}
          />
        </View>

        <View style={styles.waveformArea}>
          <VoiceVisualizer
            isRecording={isPlaying}
            height={30}
            color={speakingColor}
          />
        </View>

        <AppText
          variant="bodySmall"
          weight="semibold"
          style={{color: colors.foreground}}
          raw>
          {formatDuration(duration)}
        </AppText>
      </TouchableOpacity>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <AppButton
          variant="outline"
          size="sm"
          onPress={onReRecord}
          disabled={isSubmitting}
          icon={<Icon name="RefreshCw" className="w-4 h-4 text-foreground" />}>
          Ghi lại
        </AppButton>

        <AppButton
          variant="primary"
          size="sm"
          onPress={onSubmit}
          loading={isSubmitting}
          style={{backgroundColor: speakingColor, flex: 1}}>
          ✅ Gửi đánh giá
        </AppButton>
      </View>
    </View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 16,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformArea: {
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
