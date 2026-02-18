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
}

// =======================
// Component
// =======================

/**
 * Mục đích: Hiển thị inline alert sửa lỗi phát âm giữa các chat bubbles
 * Tham số đầu vào: correction (word, IPA, tip), onPlaySample
 * Tham số đầu ra: JSX.Element — compact card với icon + text
 * Khi nào sử dụng:
 *   - CoachSessionScreen: sau khi AI phát hiện lỗi phát âm → insert card
 *   - RoleplaySessionScreen: inline pronunciation feedback
 */
export default function PronunciationAlert({
  correction,
  onPlaySample,
}: PronunciationAlertProps) {
  const colors = useColors();
  const alertColor = '#EA580C'; // Coral/orange cho pronunciation

  return (
    <View style={[styles.container, {backgroundColor: `${alertColor}12`}]}>
      <View style={styles.header}>
        <View style={[styles.iconBadge, {backgroundColor: `${alertColor}25`}]}>
          <Icon
            name="Volume2"
            className="w-3.5 h-3.5"
            style={{color: alertColor}}
          />
        </View>
        <AppText
          variant="caption"
          weight="bold"
          style={{color: alertColor}}
          raw>
          Sửa phát âm
        </AppText>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => onPlaySample?.(correction.word)}
          activeOpacity={0.7}>
          <AppText variant="body" weight="semibold" raw>
            <AppText
              variant="body"
              weight="bold"
              style={{color: alertColor}}
              raw>
              {correction.word}
            </AppText>
            {' → '}
            <AppText
              variant="body"
              style={{color: colors.foreground, opacity: 0.7}}
              raw>
              {correction.ipa}
            </AppText>
          </AppText>
        </TouchableOpacity>

        <AppText
          variant="caption"
          className="text-neutrals400 mt-1"
          raw>
          {correction.tip}
        </AppText>
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
    marginVertical: 4,
    padding: 10,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#EA580C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  iconBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginLeft: 28,
  },
});
