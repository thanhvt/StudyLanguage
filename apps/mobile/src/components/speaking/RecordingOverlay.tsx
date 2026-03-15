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
import {useAppStore} from '@/store/useAppStore';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// =======================
// Constants
// =======================

/** Ngưỡng vuốt xuống để trigger stop (gửi) */
const SWIPE_DOWN_THRESHOLD = 80;

/** Ngưỡng vuốt lên/trái để trigger cancel (hủy) */
const SWIPE_CANCEL_THRESHOLD = 100;

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
  /** Khi user nhấn Stop hoặc vuốt xuống */
  onStop: () => void;
  /** Khi user cancel (vuốt lên hoặc vuốt trái) */
  onCancel: () => void;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Hiển thị overlay dạng bottom-sheet khi user đang ghi âm
 *   Thiết kế theo mockup: glassmorphism background, waveform bar,
 *   mic button pulsing, timer mm:ss, status text, hint text
 * Tham số đầu vào: visible, duration, waveform, accentColor, onStop, onCancel
 * Tham số đầu ra: JSX.Element — bottom-half overlay với mic pulsing + waveform + timer
 * Khi nào sử dụng:
 *   ConversationScreen → user nhấn mic (tap-to-toggle) → hiện overlay
 *   User nhấn nút ■ hoặc vuốt xuống → onStop → transcribe
 *   User vuốt lên hoặc vuốt trái → onCancel → hủy ghi âm
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
  const theme = useAppStore(state => state.theme);
  const isDark = theme !== 'light';

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideY = useRef(new Animated.Value(0)).current;
  const slideX = useRef(new Animated.Value(0)).current;

  // Pulse animation cho mic icon
  useEffect(() => {
    if (!visible) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {toValue: 1.25, duration: 700, useNativeDriver: true}),
        Animated.timing(pulseAnim, {toValue: 1, duration: 700, useNativeDriver: true}),
      ]),
    );
    pulse.start();

    return () => pulse.stop();
  }, [visible, pulseAnim]);

  // Pan gesture: vuốt xuống → stop (gửi), vuốt lên/trái → cancel (hủy)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dy) > 10 || Math.abs(gs.dx) > 10,
      onPanResponderMove: (_, gs) => {
        // Cho phép kéo theo cả 2 trục
        if (gs.dy > 0) {
          slideY.setValue(gs.dy);
        }
        if (gs.dx < 0) {
          slideX.setValue(gs.dx);
        }
        if (gs.dy < 0) {
          slideY.setValue(gs.dy);
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > SWIPE_DOWN_THRESHOLD) {
          // Vuốt xuống → stop (gửi recording)
          onStop();
        } else if (gs.dy < -SWIPE_CANCEL_THRESHOLD || gs.dx < -SWIPE_CANCEL_THRESHOLD) {
          // Vuốt lên hoặc vuốt trái → cancel (hủy)
          onCancel();
        }

        // Reset vị trí
        Animated.parallel([
          Animated.spring(slideY, {toValue: 0, useNativeDriver: true}),
          Animated.spring(slideX, {toValue: 0, useNativeDriver: true}),
        ]).start();
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

  // Glassmorphism background theo theme
  const overlayBg = isDark ? 'rgba(15, 30, 20, 0.92)' : 'rgba(240, 247, 240, 0.95)';

  return (
    <View style={styles.overlay}>
      {/* Vùng dimmed phía trên — tap để stop */}
      <TouchableOpacity
        style={[styles.dimmedArea, {backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)'}]}
        activeOpacity={1}
        onPress={onStop}
        accessibilityLabel="Nhấn để dừng ghi âm"
      />

      {/* Bottom sheet — Recording panel */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.content,
          {
            backgroundColor: overlayBg,
            transform: [
              {translateY: slideY},
              {translateX: slideX},
            ],
          },
        ]}>

        {/* Waveform */}
        <View style={styles.waveformContainer}>
          {waveform.length > 0 ? (
            waveform.slice(-30).map((amp, i) => (
              <View
                key={i}
                style={[
                  styles.waveBar,
                  {
                    height: Math.max(4, amp * 44),
                    backgroundColor: accentColor,
                    opacity: 0.4 + amp * 0.6,
                  },
                ]}
              />
            ))
          ) : (
            // Placeholder bars
            Array.from({length: 24}).map((_, i) => (
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
                backgroundColor: `${accentColor}18`,
                transform: [{scale: pulseAnim}],
              },
            ]}
          />
          <TouchableOpacity
            style={[styles.micBtn, {backgroundColor: accentColor}]}
            onPress={onStop}
            activeOpacity={0.8}
            accessibilityLabel="Dừng ghi âm và gửi">
            <Icon name="Square" className="w-6 h-6" style={{color: '#000'}} />
          </TouchableOpacity>
        </View>

        {/* Timer */}
        <AppText
          variant="heading3"
          weight="bold"
          style={{color: accentColor, marginTop: 12}}
          raw>
          {formatTime(duration)}
        </AppText>

        {/* Status text */}
        <AppText
          variant="body"
          weight="medium"
          style={{color: accentColor, marginTop: 4}}
          raw>
          Đang ghi âm...
        </AppText>

        {/* Hint text — vuốt xuống để gửi + vuốt lên để hủy */}
        <AppText
          variant="caption"
          style={{color: isDark ? colors.neutrals400 : colors.neutrals500, marginTop: 16}}
          raw>
          ↓ Vuốt xuống để gửi  •  ↑ Vuốt lên để hủy
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
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  dimmedArea: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 44,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginBottom: 20,
    gap: 2,
    width: SCREEN_WIDTH * 0.65,
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
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  micBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
