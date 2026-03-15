import React, {useState, useEffect, useRef} from 'react';
import {View, StyleSheet, TouchableOpacity, Modal, Switch} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';
import {useShadowingStore} from '@/store/useShadowingStore';

// =======================
// Types
// =======================

interface HeadphoneWarningModalProps {
  /** Modal có đang hiển thị */
  visible: boolean;
  /** Callback đóng modal */
  onClose: () => void;
  /** Callback "Tiếp tục không tai nghe" */
  onContinueWithout: () => void;
  /** Trạng thái kết nối tai nghe hiện tại — dùng để auto-dismiss */
  headphoneConnected?: boolean;
  /** Callback khi tai nghe cắm vào giữa lúc modal đang mở → auto start session */
  onAutoStart?: () => void;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Modal cảnh báo khi user chưa kết nối tai nghe (per mockup 23)
 * Tham số đầu vào: visible, onClose, onContinueWithout
 * Tham số đầu ra: JSX.Element — modal overlay
 * Khi nào sử dụng:
 *   - ShadowingConfigScreen: nhấn "Bắt đầu" khi chưa có tai nghe
 *   - ShadowingSessionScreen: phát hiện ngắt tai nghe giữa chừng
 */
export default function HeadphoneWarningModal({
  visible,
  onClose,
  onContinueWithout,
  headphoneConnected,
  onAutoStart,
}: HeadphoneWarningModalProps) {
  const colors = useColors();
  const speakingColor = SKILL_COLORS.speaking.dark;

  // Volume ducking toggle — đọc/ghi từ store
  const volumeDucking = useShadowingStore(s => s.config.volumeDucking);
  const setVolumeDucking = useShadowingStore(s => s.setVolumeDucking);

  // Ref theo dõi trạng thái trước đó
  const prevConnectedRef = useRef(headphoneConnected);

  /**
   * Mục đích: Auto-dismiss modal khi tai nghe được cắm vào giữa lúc modal đang mở
   * Tham số đầu vào: headphoneConnected, visible
   * Tham số đầu ra: void (gọi onClose + onAutoStart)
   * Khi nào sử dụng: User mở modal warning → cắm tai nghe → modal tự đóng + bắt đầu session
   */
  useEffect(() => {
    if (
      visible &&
      headphoneConnected &&
      !prevConnectedRef.current
    ) {
      // Tai nghe vừa cắm vào khi modal đang mở → auto-dismiss
      console.log('🎧 [HeadphoneWarningModal] Tai nghe cắm vào → tự đóng modal + auto start');
      onClose();
      // Delay nhỏ để modal animation hoàn tất rồi mới start
      if (onAutoStart) {
        setTimeout(() => onAutoStart(), 300);
      }
    }
    prevConnectedRef.current = headphoneConnected;
  }, [headphoneConnected, visible, onClose, onAutoStart]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {backgroundColor: colors.surface},
          ]}>
          {/* Icon — headphone SVG (per mockup 23: 60px pink icon) */}
          <View style={[styles.iconContainer, {backgroundColor: `${speakingColor}15`}]}>
            <Icon name="Headphones" className="w-10 h-10" style={{color: speakingColor}} />
          </View>

          {/* Title */}
          <AppText
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.foreground,
              textAlign: 'center',
              marginTop: 16,
            }}
            raw>
            Khuyến nghị tai nghe
          </AppText>

          {/* Description */}
          <AppText
            style={{
              fontSize: 13,
              color: colors.neutrals400,
              textAlign: 'center',
              marginTop: 8,
              lineHeight: 20,
              paddingHorizontal: 8,
            }}
            raw>
            Shadowing Mode ghi âm đồng thời khi AI phát. Không có tai nghe sẽ
            khiến micro thu tiếng loa, giảm chất lượng chấm điểm.
          </AppText>

          {/* AEC info bullet (per mockup 23) */}
          <View
            style={[
              styles.infoBullet,
              {backgroundColor: `${speakingColor}08`, borderColor: `${speakingColor}20`},
            ]}>
            <AppText style={{fontSize: 12, color: colors.neutrals300, lineHeight: 18}} raw>
              ℹ️ Chế độ AEC (Echo Cancellation) sẽ được bật tự động
            </AppText>
          </View>

          {/* Volume ducking toggle (per mockup 23: "Giảm âm lượng AI 30%" + ON toggle) */}
          <View
            style={[
              styles.duckingRow,
              {backgroundColor: colors.glassBg, borderColor: colors.glassBorderStrong},
            ]}>
            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6}}>
              <Icon name="Volume1" className="w-4 h-4" style={{color: colors.neutrals300}} />
              <AppText style={{fontSize: 13, color: colors.foreground, fontWeight: '600'}} raw>
                Giảm âm lượng AI 30%
              </AppText>
            </View>
            <Switch
              value={volumeDucking}
              onValueChange={setVolumeDucking}
              trackColor={{false: colors.neutrals700, true: `${speakingColor}60`}}
              thumbColor={volumeDucking ? speakingColor : colors.neutrals400}
            />
          </View>

          {/* Buttons (per mockup 23: primary "Kết nối tai nghe" + outline "Tiếp tục không tai nghe") */}
          <View style={styles.buttons}>
            {/* Primary: Đã kết nối → đóng modal */}
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                {backgroundColor: speakingColor},
              ]}
              onPress={onClose}
              activeOpacity={0.7}>
              <Icon name="Headphones" className="w-4 h-4" style={{color: '#FFFFFF', marginRight: 6}} />
              <AppText
                style={{fontSize: 14, fontWeight: '700', color: '#FFFFFF'}}
                raw>
                Kết nối tai nghe
              </AppText>
            </TouchableOpacity>

            {/* Secondary: Tiếp tục không tai nghe */}
            <TouchableOpacity
              style={[
                styles.button,
                styles.secondaryButton,
                {borderColor: colors.glassBorderStrong},
              ]}
              onPress={onContinueWithout}
              activeOpacity={0.7}>
              <AppText
                style={{fontSize: 14, fontWeight: '600', color: colors.neutrals300}}
                raw>
                Tiếp tục không tai nghe →
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBullet: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginTop: 14,
    width: '100%',
  },
  duckingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 10,
    width: '100%',
  },
  buttons: {
    width: '100%',
    marginTop: 20,
    gap: 10,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryButton: {},
  secondaryButton: {
    borderWidth: 1,
  },
});
