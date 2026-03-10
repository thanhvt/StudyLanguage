import React from 'react';
import {View, TouchableOpacity, Pressable, StyleSheet, ActivityIndicator} from 'react-native';
import {AppText} from '@/components/ui';
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

      {/* Action buttons — manual Pressable để đảm bảo flex layout chính xác */}
      <View style={styles.actionRow}>
        {/* Nút Ghi lại (outline) */}
        <Pressable
          onPress={onReRecord}
          disabled={isSubmitting}
          style={[
            styles.actionBtn,
            {
              borderWidth: 1,
              borderColor: colors.neutrals600,
              backgroundColor: 'transparent',
              opacity: isSubmitting ? 0.5 : 1,
            },
          ]}>
          <Icon name="RefreshCw" className="w-4 h-4" style={{color: colors.foreground}} />
          <AppText style={{fontSize: 14, fontWeight: '600', color: colors.foreground, marginLeft: 6}}>
            Ghi lại
          </AppText>
        </Pressable>

        {/* Nút Gửi đánh giá (primary) */}
        <Pressable
          onPress={onSubmit}
          disabled={isSubmitting}
          style={[
            styles.actionBtn,
            {
              backgroundColor: speakingColor,
              opacity: isSubmitting ? 0.7 : 1,
            },
          ]}>
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Icon name="Send" className="w-4 h-4" style={{color: '#fff'}} />
              <AppText style={{fontSize: 14, fontWeight: '600', color: '#fff', marginLeft: 6}}>
                Gửi đánh giá
              </AppText>
            </>
          )}
        </Pressable>
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
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
  },
});
