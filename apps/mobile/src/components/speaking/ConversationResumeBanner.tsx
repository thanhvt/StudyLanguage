import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {useNotificationStore} from '@/store/useNotificationStore';
import {SKILL_COLORS} from '@/config/skillColors';

// =======================
// Component
// =======================

/**
 * Mục đích: Banner nổi bật khi user quay lại Speaking tab và có active session
 *   Hiển thị "Session đang hoạt động — AI đã trả lời X tin"
 *   2 CTA: [Tiếp tục] / [Kết thúc]
 * Tham số đầu vào:
 *   - onResume: () => void — callback khi nhấn "Tiếp tục"
 *   - onEnd: () => void — callback khi nhấn "Kết thúc"
 *   - visible: boolean — hiện/ẩn
 * Tham số đầu ra: JSX.Element | null
 * Khi nào sử dụng:
 *   SpeakingConfigScreen hoặc SpeakingTabScreen → có active session → hiện banner
 */
export function ConversationResumeBanner({
  onResume,
  onEnd,
  visible,
}: {
  onResume: () => void;
  onEnd: () => void;
  visible: boolean;
}) {
  const colors = useColors();
  const speakingColor = SKILL_COLORS.speaking.dark;
  const queuedMessages = useNotificationStore(s => s.queuedMessages);
  const clearBadge = useNotificationStore(s => s.clearBadge);

  if (!visible) return null;

  const queueCount = queuedMessages.length;

  /**
   * Mục đích: Xử lý khi nhấn "Tiếp tục"
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User muốn quay lại AI Conversation
   */
  const handleResume = () => {
    clearBadge('Speaking');
    onResume();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `${speakingColor}10`,
          borderColor: `${speakingColor}30`,
        },
      ]}>
      {/* Indicator dot */}
      <View style={styles.headerRow}>
        <View style={[styles.liveDot, {backgroundColor: '#22c55e'}]} />
        <AppText
          style={{fontSize: 13, fontWeight: '700', color: colors.foreground}}
          raw>
          Session đang hoạt động
        </AppText>
      </View>

      {/* Message count */}
      {queueCount > 0 && (
        <AppText
          style={{
            fontSize: 12,
            color: colors.neutrals400,
            marginTop: 4,
            marginLeft: 18,
          }}
          raw>
          🗣️ AI đã trả lời {queueCount} tin nhắn khi bạn rời đi
        </AppText>
      )}

      {/* CTA buttons */}
      <View style={styles.ctaRow}>
        <TouchableOpacity
          style={[styles.ctaBtn, {backgroundColor: speakingColor}]}
          onPress={handleResume}
          activeOpacity={0.8}>
          <AppText
            style={{fontSize: 13, fontWeight: '700', color: '#FFFFFF'}}
            raw>
            ▶️ Tiếp tục
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ctaBtn, styles.ctaBtnOutline, {borderColor: colors.glassBorderStrong}]}
          onPress={onEnd}
          activeOpacity={0.7}>
          <AppText
            style={{fontSize: 13, fontWeight: '600', color: colors.neutrals400}}
            raw>
            ⏹️ Kết thúc
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
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  ctaBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
});
