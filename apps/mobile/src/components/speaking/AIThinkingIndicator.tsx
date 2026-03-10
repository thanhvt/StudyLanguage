import React, {useEffect, useRef} from 'react';
import {View, Animated, StyleSheet} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';

// =======================
// Types
// =======================

interface AIThinkingIndicatorProps {
  /** Tên persona (Roleplay only) — nếu null → "AI" */
  personaName?: string | null;
  /** Accent color — mặc định emerald */
  accentColor?: string;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Hiển thị typing indicator khi AI đang xử lý (3 dots animation)
 * Tham số đầu vào: personaName, accentColor
 * Tham số đầu ra: JSX.Element — 3 dots pulsing + "đang trả lời..."
 * Khi nào sử dụng:
 *   ConversationScreen → ai.isThinking === true → hiện indicator
 *   Roleplay: hiển thị tên persona + "đang trả lời"
 *   Free Talk: hiển thị "AI đang suy nghĩ"
 */
export default function AIThinkingIndicator({
  personaName,
  accentColor = '#10B981',
}: AIThinkingIndicatorProps) {
  const colors = useColors();
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  // Staggered pulse animation cho 3 dots
  useEffect(() => {
    const createPulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {toValue: 1, duration: 400, useNativeDriver: true}),
          Animated.timing(dot, {toValue: 0.3, duration: 400, useNativeDriver: true}),
        ]),
      );

    const anim1 = createPulse(dot1, 0);
    const anim2 = createPulse(dot2, 200);
    const anim3 = createPulse(dot3, 400);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);

  const label = personaName
    ? `${personaName} đang trả lời`
    : 'AI đang suy nghĩ';

  return (
    <View style={styles.container}>
      <View style={[styles.bubble, {backgroundColor: colors.surface}]}>
        {/* 3 dots */}
        <View style={styles.dotsRow}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: accentColor,
                  opacity: dot,
                },
              ]}
            />
          ))}
        </View>

        {/* Label */}
        <AppText
          variant="caption"
          style={{color: colors.neutrals400, marginLeft: 8}}
          raw>
          {label}...
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
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  bubble: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
