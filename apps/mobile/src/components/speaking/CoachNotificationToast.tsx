import React, {useEffect, useRef} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {useNotificationStore} from '@/store/useNotificationStore';
import {useNotificationThrottle} from '@/hooks/useNotificationThrottle';

// =======================
// Constants
// =======================

/** Thời gian auto-dismiss (ms) */
const AUTO_DISMISS_MS = 5000;
/** Chiều cao toast */
const TOAST_HEIGHT = 72;
/** Ngưỡng swipe up để dismiss */
const SWIPE_THRESHOLD = -40;

// =======================
// Component
// =======================

/**
 * Mục đích: Custom floating toast khi AI trả lời và user ở tab khác
 *   Slide-in từ trên xuống, auto-dismiss 5s, tap → navigate ConversationScreen
 *   Swipe up để dismiss sớm. Gộp nhiều tin: "AI đã trả lời X tin"
 * Tham số đầu vào: visible (boolean), onDismiss (() => void)
 * Tham số đầu ra: JSX.Element | null
 * Khi nào sử dụng:
 *   AppNavigator level → render CoachNotificationToast
 *   useNotificationThrottle → action = 'toast' → setVisible(true)
 */
export function CoachNotificationToast({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {getDisplayText} = useNotificationThrottle();
  const clearBadge = useNotificationStore(s => s.clearBadge);
  const drainQueue = useNotificationStore(s => s.drainQueue);

  // Animation
  const translateY = useRef(new Animated.Value(-TOAST_HEIGHT - 20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Swipe gesture
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dy) > 10 && gesture.dy < 0,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < SWIPE_THRESHOLD) {
          handleDismiss();
        }
      },
    }),
  ).current;

  // Hiện/ẩn animation
  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      dismissTimer.current = setTimeout(() => {
        handleDismiss();
      }, AUTO_DISMISS_MS);
    }

    return () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  /**
   * Mục đích: Dismiss toast với animation
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Auto-dismiss hoặc swipe up
   */
  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -TOAST_HEIGHT - 20,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  /**
   * Mục đích: Tap toast → navigate tới ConversationScreen
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào toast
   */
  const handleTap = () => {
    handleDismiss();
    clearBadge('Speaking');
    drainQueue(); // Clear queue khi user đã tap
    // Navigate tới ConversationScreen — deep link
    navigation.navigate('Speaking', {screen: 'ConversationSession'});
  };

  if (!visible) return null;

  const displayText = getDisplayText();
  if (displayText.count === 0) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.glassBorderStrong,
          transform: [{translateY}],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={handleTap}
        activeOpacity={0.8}>
        {/* Icon */}
        <View style={[styles.iconContainer, {backgroundColor: '#E879F920'}]}>
          <AppText style={{fontSize: 22}} raw>
            🗣️
          </AppText>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <AppText
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: colors.foreground,
            }}
            raw>
            {displayText.title}
          </AppText>
          <AppText
            style={{
              fontSize: 12,
              color: colors.neutrals400,
              marginTop: 2,
            }}
            numberOfLines={1}
            raw>
            {displayText.body}
          </AppText>
        </View>

        {/* Badge count */}
        {displayText.count > 1 && (
          <View style={[styles.countBadge, {backgroundColor: '#E879F9'}]}>
            <AppText
              style={{fontSize: 10, fontWeight: '700', color: '#FFFFFF'}}
              raw>
              {displayText.count}
            </AppText>
          </View>
        )}
      </TouchableOpacity>

      {/* Swipe indicator */}
      <View style={[styles.swipeIndicator, {backgroundColor: colors.neutrals400}]} />
    </Animated.View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    zIndex: 9999,
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  swipeIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 6,
    opacity: 0.3,
  },
});
