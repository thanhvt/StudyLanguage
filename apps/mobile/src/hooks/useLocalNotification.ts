import {useCallback, useEffect, useRef} from 'react';
import {Platform, AppState, type AppStateStatus} from 'react-native';
import notifee, {
  AuthorizationStatus,
  AndroidImportance,
  EventType,
  type Event,
} from '@notifee/react-native';
import {useNotificationStore} from '@/store/useNotificationStore';

// =======================
// Constants
// =======================

/** Channel ID cho Android — mỗi loại notification cần 1 channel riêng */
const CHANNEL_ID = 'coach-ai-response';

/** Channel name hiển thị trong Settings > Notifications trên Android */
const CHANNEL_NAME = 'AI Coach';

/** Channel description */
const CHANNEL_DESC = 'Thông báo khi AI Coach trả lời trong cuộc trò chuyện';

/** Thời gian chờ tối thiểu khi app background trước khi push local notification (ms) */
const BACKGROUND_NOTIFY_DELAY_MS = 10_000;

// =======================
// Hook
// =======================

/**
 * Mục đích: Wrapper hook cho @notifee/react-native — quản lý local push notification
 *   Xin permission, tạo channel, display notification, xử lý tap event
 * Tham số đầu vào: không
 * Tham số đầu ra: {
 *   requestPermission, displayNotification, cancelAll,
 *   hasPermission, scheduleBackgroundNotify
 * }
 * Khi nào sử dụng:
 *   - App khởi động → requestPermission() (1 lần)
 *   - useSessionPersist: app background + AI response → scheduleBackgroundNotify()
 *   - ConversationScreen: session kết thúc → cancelAll()
 */
export function useLocalNotification() {
  const channelCreatedRef = useRef(false);
  const backgroundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPermissionRef = useRef(false);

  // Notification store
  const activeSessionId = useNotificationStore(s => s.activeSessionId);

  // ===========================
  // Khởi tạo: tạo channel + lắng nghe notification events
  // ===========================

  useEffect(() => {
    /**
     * Mục đích: Tạo Android notification channel (chỉ cần 1 lần)
     * Tham số đầu vào: không
     * Tham số đầu ra: void
     * Khi nào sử dụng: Hook mount lần đầu
     */
    const setupChannel = async () => {
      if (Platform.OS === 'android' && !channelCreatedRef.current) {
        try {
          await notifee.createChannel({
            id: CHANNEL_ID,
            name: CHANNEL_NAME,
            description: CHANNEL_DESC,
            importance: AndroidImportance.HIGH,
            // Rung + âm thanh mặc định
            vibration: true,
            sound: 'default',
          });
          channelCreatedRef.current = true;
          console.log('✅ [Notifee] Đã tạo Android channel:', CHANNEL_ID);
        } catch (err) {
          console.error('❌ [Notifee] Lỗi tạo channel:', err);
        }
      }
    };

    setupChannel();

    /**
     * Mục đích: Lắng nghe khi user tap notification → navigate tới conversation
     * Tham số đầu vào: event (Event) từ notifee
     * Tham số đầu ra: void
     * Khi nào sử dụng: User tap notification từ notification tray
     */
    const unsubscribe = notifee.onForegroundEvent(({type, detail}: Event) => {
      if (type === EventType.PRESS) {
        console.log('📱 [Notifee] User tap notification:', detail.notification?.title);
        // Navigation sẽ được xử lý bởi CoachNotificationToast
        // hoặc deep link handler ở App level
      }

      if (type === EventType.DISMISSED) {
        console.log('🗑️ [Notifee] User dismiss notification');
      }
    });

    return () => {
      unsubscribe();
      if (backgroundTimerRef.current) {
        clearTimeout(backgroundTimerRef.current);
      }
    };
  }, []);

  // ===========================
  // Permission
  // ===========================

  /**
   * Mục đích: Xin quyền notification từ user (iOS hiện dialog, Android auto-grant <13)
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<boolean> — true nếu được cấp quyền
   * Khi nào sử dụng:
   *   - App khởi động lần đầu → hỏi permission
   *   - User bật notification trong Settings app → re-check
   *   - ConversationScreen mount → kiểm tra trước khi session bắt đầu
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const settings = await notifee.requestPermission();

      const granted =
        settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
        settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;

      hasPermissionRef.current = granted;

      if (granted) {
        console.log('✅ [Notifee] Quyền notification đã được cấp');
      } else {
        console.log('⚠️ [Notifee] Quyền notification bị từ chối');
      }

      return granted;
    } catch (err) {
      console.error('❌ [Notifee] Lỗi xin quyền:', err);
      return false;
    }
  }, []);

  /**
   * Mục đích: Kiểm tra quyền notification hiện tại (không hiện dialog)
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<boolean>
   * Khi nào sử dụng: Check trước khi schedule notification
   */
  const checkPermission = useCallback(async (): Promise<boolean> => {
    try {
      const settings = await notifee.getNotificationSettings();
      const granted =
        settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
        settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;
      hasPermissionRef.current = granted;
      return granted;
    } catch {
      return false;
    }
  }, []);

  // ===========================
  // Display Notification
  // ===========================

  /**
   * Mục đích: Hiển thị local notification ngay lập tức
   * Tham số đầu vào: title (string), body (string), data (optional Record)
   * Tham số đầu ra: Promise<string | null> — notification ID hoặc null nếu lỗi
   * Khi nào sử dụng:
   *   - AI trả lời khi app background > 10s → hiện notification
   *   - scheduleBackgroundNotify() gọi sau delay
   */
  const displayNotification = useCallback(
    async (
      title: string,
      body: string,
      data?: Record<string, string>,
    ): Promise<string | null> => {
      try {
        // Kiểm tra quyền
        const granted = await checkPermission();
        if (!granted) {
          console.warn('⚠️ [Notifee] Không có quyền, bỏ qua notification');
          return null;
        }

        const notificationId = await notifee.displayNotification({
          title,
          body,
          data: {
            ...data,
            sessionId: activeSessionId ?? '',
            type: 'coach-ai-response',
          },
          android: {
            channelId: CHANNEL_ID,
            // Small icon — dùng ic_launcher mặc định
            smallIcon: 'ic_launcher',
            // Tự xóa sau khi tap
            autoCancel: true,
            // Hiện trên lock screen
            visibility: 1, // PUBLIC
            pressAction: {
              id: 'default',
            },
          },
          ios: {
            // Badge count trên app icon
            foregroundPresentationOptions: {
              badge: true,
              sound: true,
              banner: true,
              list: true,
            },
          },
        });

        console.log('📬 [Notifee] Đã hiện notification:', title);
        return notificationId;
      } catch (err) {
        console.error('❌ [Notifee] Lỗi hiện notification:', err);
        return null;
      }
    },
    [activeSessionId, checkPermission],
  );

  // ===========================
  // Background Scheduling
  // ===========================

  /**
   * Mục đích: Schedule local notification khi app background + AI trả lời
   *   Chờ 10s sau khi background → nếu user chưa quay lại → hiện notification
   * Tham số đầu vào: message (string) — nội dung AI response
   * Tham số đầu ra: void
   * Khi nào sử dụng:
   *   - useSessionPersist: app vào background + có AI response trong queue
   *   - useNotificationThrottle: action = 'badge' → scheduleBackgroundNotify
   */
  const scheduleBackgroundNotify = useCallback(
    (message: string) => {
      // Xóa timer cũ nếu có
      if (backgroundTimerRef.current) {
        clearTimeout(backgroundTimerRef.current);
      }

      backgroundTimerRef.current = setTimeout(async () => {
        // Kiểm tra app vẫn đang background
        if (AppState.currentState !== 'active') {
          await displayNotification(
            '🗣️ Coach AI đã trả lời',
            message.length > 100
              ? message.substring(0, 100) + '...'
              : message,
          );
        }
      }, BACKGROUND_NOTIFY_DELAY_MS);

      console.log(`⏱️ [Notifee] Đã schedule background notify sau ${BACKGROUND_NOTIFY_DELAY_MS / 1000}s`);
    },
    [displayNotification],
  );

  // ===========================
  // Cancel
  // ===========================

  /**
   * Mục đích: Xóa tất cả notification đang hiện
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng:
   *   - User quay lại app → clear notification tray
   *   - Session kết thúc → cleanup
   */
  const cancelAll = useCallback(async () => {
    try {
      await notifee.cancelAllNotifications();
      console.log('🧹 [Notifee] Đã xóa tất cả notification');
    } catch (err) {
      console.error('❌ [Notifee] Lỗi xóa notification:', err);
    }
  }, []);

  /**
   * Mục đích: Lấy badge count trên app icon (iOS only)
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<number>
   * Khi nào sử dụng: Kiểm tra badge hiện tại trên app icon
   */
  const getBadgeCount = useCallback(async (): Promise<number> => {
    try {
      return await notifee.getBadgeCount();
    } catch {
      return 0;
    }
  }, []);

  /**
   * Mục đích: Set badge count trên app icon (iOS only)
   * Tham số đầu vào: count (number)
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: Cập nhật badge khi có tin mới hoặc user đã đọc
   */
  const setBadgeCount = useCallback(async (count: number) => {
    try {
      await notifee.setBadgeCount(count);
    } catch {
      // Android không hỗ trợ badge count chuẩn
    }
  }, []);

  return {
    requestPermission,
    checkPermission,
    displayNotification,
    scheduleBackgroundNotify,
    cancelAll,
    getBadgeCount,
    setBadgeCount,
  };
}
