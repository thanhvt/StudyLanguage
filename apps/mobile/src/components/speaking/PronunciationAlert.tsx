import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';

// =======================
// Types
// =======================

export interface PronunciationCorrection {
  /** Từ gốc user nói sai */
  word: string;
  /** Phiên âm IPA đúng */
  ipa: string;
  /** Tip phát âm */
  tip: string;
}

interface PronunciationAlertProps {
  /** Thông tin sửa phát âm */
  correction: PronunciationCorrection;
  /** Khi user tap → nghe audio mẫu */
  onPlaySample?: (word: string) => void;
  /** Khi user nhấn "Thử lại" → focus mic */
  onReSpeak?: (word: string) => void;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Hiển thị inline alert phát âm theo mockup —
 *   card lớn với tiêu đề "PHÁT ÂM CẦN LƯU Ý", từ bold, IPA, tip, 2 buttons
 * Tham số đầu vào: correction (word, IPA, tip), onPlaySample, onReSpeak
 * Tham số đầu ra: JSX.Element — card alert phát âm
 * Khi nào sử dụng:
 *   ConversationScreen → sau message AI phát hiện lỗi phát âm → insert card inline
 */
export default function PronunciationAlert({
  correction,
  onPlaySample,
  onReSpeak,
}: PronunciationAlertProps) {
  const colors = useColors();
  const alertColor = '#EA580C'; // Amber/orange cho pronunciation

  return (
    <View style={[styles.container, {backgroundColor: `${alertColor}12`, borderColor: `${alertColor}20`}]}>
      {/* Header */}
      <View style={styles.header}>
        <AppText variant="caption" weight="bold" style={{color: alertColor}} raw>
          ⚠ PHÁT ÂM CẦN LƯU Ý
        </AppText>
      </View>

      {/* Từ + IPA */}
      <View style={styles.wordRow}>
        <AppText variant="heading3" weight="bold" style={{color: colors.foreground}} raw>
          "{correction.word}"
        </AppText>
        <AppText variant="body" style={{color: colors.neutrals400, marginLeft: 8}} raw>
          / {correction.ipa}/
        </AppText>
      </View>

      {/* Tip */}
      <AppText variant="bodySmall" style={{color: colors.neutrals400, marginTop: 6, lineHeight: 20}} raw>
        {correction.tip}
      </AppText>

      {/* 2 Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.actionBtn, {backgroundColor: `${alertColor}15`, borderColor: `${alertColor}30`}]}
          onPress={() => onPlaySample?.(correction.word)}
          activeOpacity={0.7}>
          <Icon name="Volume2" className="w-4 h-4" style={{color: alertColor}} />
          <AppText variant="bodySmall" weight="semibold" style={{color: alertColor, marginLeft: 6}} raw>
            Nghe phát âm chuẩn
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, {backgroundColor: colors.surface, borderColor: colors.glassBorder}]}
          onPress={() => onReSpeak?.(correction.word)}
          activeOpacity={0.7}>
          <Icon name="Mic" className="w-4 h-4" style={{color: colors.foreground}} />
          <AppText variant="bodySmall" weight="semibold" style={{color: colors.foreground, marginLeft: 6}} raw>
            Thử lại
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  header: {
    marginBottom: 8,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
});
