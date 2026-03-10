import React, {useEffect, useRef, useCallback} from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  PanResponder,
} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// =======================
// Types
// =======================

interface RecordingOverlayProps {
  /** Đang visible? */
  visible: boolean;
  /** Thời lượng ghi âm (seconds) */
  duration: number;
  /** Waveform data (0-1 amplitude values) */
  waveform?: number[];
  /** Accent color */
  accentColor?: string;
  /** Khi user nhấn Stop */
  onStop: () => void;
  /** Khi user cancel (kéo trái) */
  onCancel: () => void;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Hiển thị overlay khi user đang ghi âm (hold mic button)
 * Tham số đầu vào: visible, duration, waveform, accentColor, onStop, onCancel
 * Tham số đầu ra: JSX.Element — fullscreen overlay với mic pulsing + waveform + timer
 * Khi nào sử dụng:
 *   ConversationScreen → user nhấn giữ mic → hiện overlay
 *   User thả tay → onStop → transcribe
 *   User kéo trái → onCancel → hủy ghi âm
 */
export default function RecordingOverlay({
  visible,
  duration,
  waveform = [],
  accentColor = '#10B981',
  onStop,
  onCancel,
}: RecordingOverlayProps) {
  const colors = useColors();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideX = useRef(new Animated.Value(0)).current;

  // Pulse animation cho mic icon
  useEffect(() => {
    if (!visible) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {toValue: 1.2, duration: 600, useNativeDriver: true}),
        Animated.timing(pulseAnim, {toValue: 1, duration: 600, useNativeDriver: true}),
      ]),
    );
    pulse.start();

    return () => pulse.stop();
  }, [visible, pulseAnim]);

  // Slide cancellation gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 10,
      onPanResponderMove: (_, gs) => {
        if (gs.dx < 0) {
          slideX.setValue(gs.dx);
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -100) {
          // Kéo đủ xa → cancel
          onCancel();
        }
        Animated.spring(slideX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  /**
   * Mục đích: Format seconds → mm:ss
   * Tham số đầu vào: sec (number)
   * Tham số đầu ra: string
   * Khi nào sử dụng: Timer display
   */
  const formatTime = useCallback((sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, []);

  if (!visible) return null;

  return (
    <View style={[styles.overlay, {backgroundColor: `${colors.background}E6`}]}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.content, {transform: [{translateX: slideX}]}]}>

        {/* Timer */}
        <AppText variant="heading3" weight="bold" style={{color: '#EF4444'}} raw>
          ● {formatTime(duration)}
        </AppText>

        {/* Waveform */}
        <View style={styles.waveformContainer}>
          {waveform.length > 0 ? (
            waveform.slice(-30).map((amp, i) => (
              <View
                key={i}
                style={[
                  styles.waveBar,
                  {
                    height: Math.max(4, amp * 40),
                    backgroundColor: accentColor,
                    opacity: 0.4 + amp * 0.6,
                  },
                ]}
              />
            ))
          ) : (
            // Placeholder bars
            Array.from({length: 20}).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.waveBar,
                  {
                    height: 4 + Math.random() * 20,
                    backgroundColor: `${accentColor}40`,
                  },
                ]}
              />
            ))
          )}
        </View>

        {/* Pulsing Mic Button */}
        <View style={styles.micContainer}>
          <Animated.View
            style={[
              styles.micPulse,
              {
                backgroundColor: `${accentColor}15`,
                transform: [{scale: pulseAnim}],
              },
            ]}
          />
          <TouchableOpacity
            style={[styles.micBtn, {backgroundColor: accentColor}]}
            onPress={onStop}
            activeOpacity={0.8}>
            <Icon name="Square" className="w-6 h-6" style={{color: '#000'}} />
          </TouchableOpacity>
        </View>

        {/* Cancel hint */}
        <AppText
          variant="caption"
          style={{color: colors.neutrals400, marginTop: 16}}
          raw>
          ← Kéo trái để hủy
        </AppText>
      </Animated.View>
    </View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  content: {
    alignItems: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginVertical: 24,
    gap: 2,
    width: SCREEN_WIDTH * 0.7,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  micContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micPulse: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  micBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
