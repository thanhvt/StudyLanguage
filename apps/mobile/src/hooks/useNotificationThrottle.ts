import {useCallback, useRef} from 'react';
import {useNotificationStore} from '@/store/useNotificationStore';
import {useHaptic} from '@/hooks/useHaptic';
import type {QueuedMessage} from '@/store/useNotificationStore';

// =======================
// Constants
// =======================

/** Chờ bao lâu sau khi app vào background trước khi notify (ms) */
const BACKGROUND_DELAY_MS = 10_000;

/** Khoảng cách tối thiểu giữa 2 notification (ms) */
const MIN_INTERVAL_MS = 30_000;

/** Số tin tối đa trong queue trước khi gộp */
const MAX_QUEUE_BEFORE_MERGE = 3;

// =======================
// Hook
// =======================

/**
 * Mục đích: Smart throttle cho AI notifications
 *   Debounce khi vừa background, cooldown giữa các notification, gộp nhiều tin
 * Tham số đầu vào: không
 * Tham số đầu ra: { shouldNotify, scheduleNotification, getDisplayText }
 * Khi nào sử dụng:
 *   - useConversationSession: AI trả lời → shouldNotify() → hiện toast/badge
 *   - CoachNotificationToast: getDisplayText() → nội dung toast
 */
export function useNotificationThrottle() {
  const haptic = useHaptic();
  const backgroundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Store selectors
  const settings = useNotificationStore(s => s.settings);
  const isAppActive = useNotificationStore(s => s.isAppActive);
  const backgroundedAt = useNotificationStore(s => s.backgroundedAt);
  const lastNotifiedAt = useNotificationStore(s => s.lastNotifiedAt);
  const currentTab = useNotificationStore(s => s.currentTab);
  const queuedMessages = useNotificationStore(s => s.queuedMessages);
  const setLastNotifiedAt = useNotificationStore(s => s.setLastNotifiedAt);
  const incrementBadge = useNotificationStore(s => s.incrementBadge);
  const queueMessage = useNotificationStore(s => s.queueMessage);

  /**
   * Mục đích: Kiểm tra có nên gửi notification không
   * Tham số đầu vào: không
   * Tham số đầu ra: 'toast' | 'badge' | 'queue' | 'skip'
   * Khi nào sử dụng: Khi AI response về → trước khi hiện toast
   *   'toast' — user ở app, tab khác → hiện floating toast
   *   'badge' — user ở background → chỉ tăng badge
   *   'queue' — quá nhiều tin → gộp vào queue
   *   'skip' — user đang xem ConversationScreen → không notify
   */
  const shouldNotify = useCallback((): 'toast' | 'badge' | 'queue' | 'skip' => {
    // Notification tắt
    if (!settings.enabled) return 'skip';

    // User đang ở ConversationScreen → không cần notify
    if (isAppActive && currentTab === 'Speaking') {
      // Có thể user đang ở SpeakingConfigScreen, nhưng nếu đang trong session
      // thì ConversationScreen sẽ tự show tin nhắn mới
      return 'skip';
    }

    const now = Date.now();

    // Cooldown — chưa đủ thời gian giữa 2 notification
    if (now - lastNotifiedAt < MIN_INTERVAL_MS) {
      return 'queue';
    }

    // User ở background
    if (!isAppActive) {
      // Vừa background < BACKGROUND_DELAY_MS → chờ thêm
      if (backgroundedAt && now - backgroundedAt < BACKGROUND_DELAY_MS) {
        return 'queue';
      }
      return 'badge';
    }

    // User ở foreground nhưng tab khác → toast
    return 'toast';
  }, [settings.enabled, isAppActive, currentTab, lastNotifiedAt, backgroundedAt]);

  /**
   * Mục đích: Schedule notification dựa trên kết quả shouldNotify
   * Tham số đầu vào: message — AI response message
   * Tham số đầu ra: 'toast' | 'badge' | 'queue' | 'skip' — action đã thực hiện
   * Khi nào sử dụng: useConversationSession → nhận AI response → scheduleNotification
   */
  const scheduleNotification = useCallback(
    (message: {text: string; sessionId: string}): 'toast' | 'badge' | 'queue' | 'skip' => {
      const action = shouldNotify();

      const queuedMsg: QueuedMessage = {
        id: `msg_${Date.now()}`,
        text: message.text,
        timestamp: Date.now(),
        sessionId: message.sessionId,
      };

      switch (action) {
        case 'toast':
          // Gộp nếu có nhiều tin chờ
          queueMessage(queuedMsg);
          incrementBadge('Speaking');
          setLastNotifiedAt(Date.now());
          if (settings.haptic) haptic.light();
          break;

        case 'badge':
          queueMessage(queuedMsg);
          incrementBadge('Speaking');
          setLastNotifiedAt(Date.now());
          break;

        case 'queue':
          queueMessage(queuedMsg);
          break;

        case 'skip':
          // Không làm gì — user đang xem
          break;
      }

      return action;
    },
    [shouldNotify, queueMessage, incrementBadge, setLastNotifiedAt, settings.haptic, haptic],
  );

  /**
   * Mục đích: Tạo text hiển thị cho toast (gộp nhiều tin)
   * Tham số đầu vào: không
   * Tham số đầu ra: { title, body, count } — nội dung cho toast
   * Khi nào sử dụng: CoachNotificationToast render → gọi getDisplayText
   */
  const getDisplayText = useCallback((): {
    title: string;
    body: string;
    count: number;
  } => {
    const count = queuedMessages.length;

    if (count === 0) {
      return {title: '', body: '', count: 0};
    }

    if (count === 1) {
      const msg = queuedMessages[0];
      return {
        title: '🗣️ Coach AI đã trả lời',
        body: settings.showPreview
          ? msg.text.substring(0, 80) + (msg.text.length > 80 ? '...' : '')
          : 'Tap để xem cuộc trò chuyện',
        count: 1,
      };
    }

    return {
      title: `🗣️ Coach AI đã trả lời ${count} tin`,
      body: settings.showPreview
        ? queuedMessages[count - 1].text.substring(0, 60) + '...'
        : 'Tap để xem cuộc trò chuyện',
      count,
    };
  }, [queuedMessages, settings.showPreview]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (backgroundTimerRef.current) {
      clearTimeout(backgroundTimerRef.current);
      backgroundTimerRef.current = null;
    }
  }, []);

  return {
    shouldNotify,
    scheduleNotification,
    getDisplayText,
    cleanup,
  };
}
