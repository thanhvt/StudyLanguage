import React from 'react';
import {View, TouchableOpacity, Modal, StyleSheet, ScrollView} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';

// =======================
// Types
// =======================

interface IPAPopupProps {
  /** Hiển thị popup */
  visible: boolean;
  /** Đóng popup */
  onClose: () => void;
  /** Từ cần xem IPA */
  word: string;
  /** Phiên âm IPA */
  ipa: string;
  /** Phát audio mẫu */
  onPlaySample?: (word: string) => void;
  /** Mẹo phát âm */
  tips?: string[];
}

// =======================
// Component
// =======================

/**
 * Mục đích: Popup xem chi tiết phiên âm IPA của 1 từ
 * Tham số đầu vào: visible, onClose, word, ipa, onPlaySample, tips
 * Tham số đầu ra: JSX.Element — modal bottom sheet
 * Khi nào sử dụng:
 *   - PracticeScreen: user tap vào 1 từ → xem IPA + nghe mẫu
 *   - FeedbackScreen: tap vào từ bị sai → xem IPA chi tiết
 */
export default function IPAPopup({
  visible,
  onClose,
  word,
  ipa,
  onPlaySample,
  tips = [],
}: IPAPopupProps) {
  const colors = useColors();
  const speakingColor = SKILL_COLORS.speaking.dark;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}>
        <View style={{flex: 1}} />
        <TouchableOpacity activeOpacity={1}>
          <View style={[styles.sheet, {backgroundColor: colors.surface}]}>
            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.header}>
              <AppText variant="heading3" weight="bold" raw>
                {word}
              </AppText>
              <TouchableOpacity onPress={onClose}>
                <Icon name="X" className="w-5 h-5" style={{color: colors.foreground}} />
              </TouchableOpacity>
            </View>

            {/* IPA */}
            <View style={[styles.ipaCard, {backgroundColor: `${speakingColor}12`}]}>
              <AppText
                variant="heading2"
                weight="semibold"
                style={{color: speakingColor, textAlign: 'center'}}
                raw>
                {ipa}
              </AppText>
            </View>

            {/* Nút phát mẫu */}
            {onPlaySample && (
              <TouchableOpacity
                onPress={() => onPlaySample(word)}
                style={[styles.playBtn, {backgroundColor: speakingColor}]}
                activeOpacity={0.7}>
                <Icon name="Volume2" className="w-5 h-5" style={{color: '#FFFFFF'}} />
                <AppText
                  variant="body"
                  weight="semibold"
                  style={{color: '#FFFFFF', marginLeft: 8}}
                  raw>
                  Nghe phát âm
                </AppText>
              </TouchableOpacity>
            )}

            {/* Tips */}
            {tips.length > 0 && (
              <ScrollView style={styles.tipsSection} showsVerticalScrollIndicator={false}>
                <AppText
                  variant="bodySmall"
                  weight="bold"
                  className="text-foreground mb-2"
                  raw>
                  💡 Mẹo phát âm
                </AppText>
                {tips.map((tip, index) => (
                  <View key={index} style={styles.tipRow}>
                    <AppText variant="bodySmall" className="text-neutrals400" raw>
                      • {tip}
                    </AppText>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ipaCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  tipsSection: {
    maxHeight: 150,
    marginBottom: 8,
  },
  tipRow: {
    marginBottom: 6,
  },
});
