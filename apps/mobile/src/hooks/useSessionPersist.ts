import {useEffect, useRef, useCallback} from 'react';
import {AppState, type AppStateStatus} from 'react-native';
import {MMKV} from 'react-native-mmkv';
import {useSpeakingStore} from '@/store/useSpeakingStore';
import {useNotificationStore} from '@/store/useNotificationStore';
import {useLocalNotification} from '@/hooks/useLocalNotification';

// =======================
// Constants
// =======================

/** Thời gian idle tối đa (ms) — nếu app background > 15 phút → auto-end session */
const MAX_IDLE_MS = 15 * 60 * 1000;

/** Key MMKV để lưu session state khi background */
const PERSIST_KEY = 'conversation_session_persist';

/** MMKV instance cho session persist */
const persistMMKV = new MMKV({id: 'session-persist'});

// =======================
// Types
// =======================

/** Dữ liệu lưu vào MMKV khi app background */
interface PersistedSession {
  /** Thời gian còn lại (ms) */
  remainingTimeMs: number;
  /** Thời điểm pause */
  pausedAt: number;
  /** Session ID */
  sessionId: string;
  /** Số tin nhắn tại thời điểm background */
  messageCount: number;
}

// =======================
// Hook
// =======================

/**
 * Mục đích: Lưu/khôi phục AI Conversation session khi app background/foreground
 *   P0: Session Persist — user minimize app → lưu state → quay lại → resume
 * Tham số đầu vào: không
 * Tham số đầu ra: { isPaused, newMessagesCount }
 * Khi nào sử dụng:
 *   ConversationScreen mount → useSessionPersist()
 *   App background → auto-save session state
 *   App foreground → check idle time → resume hoặc auto-end
 */
export function useSessionPersist() {
  const prevAppState = useRef<AppStateStatus>(AppState.currentState);
  const pauseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Speaking store
  const conversationSession = useSpeakingStore(s => s.conversationSession);
  const endConversation = useSpeakingStore(s => s.endConversation);

  // Notification store
  const setAppActive = useNotificationStore(s => s.setAppActive);
  const activeSessionId = useNotificationStore(s => s.activeSessionId);
  const setActiveSession = useNotificationStore(s => s.setActiveSession);
  const queuedMessages = useNotificationStore(s => s.queuedMessages);

  // Local push notification
  const {scheduleBackgroundNotify, cancelAll} = useLocalNotification();

  /**
   * Mục đích: Lưu session state vào MMKV
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: App vào background + có active conversation
   */
  const persistSession = useCallback(() => {
    if (!conversationSession?.isActive) return;

    const data: PersistedSession = {
      remainingTimeMs: (conversationSession.remainingTime ?? 0) * 1000,
      pausedAt: Date.now(),
      sessionId: activeSessionId ?? `session_${Date.now()}`,
      messageCount: conversationSession.messages?.length ?? 0,
    };

    persistMMKV.set(PERSIST_KEY, JSON.stringify(data));
    console.log('💾 [SessionPersist] Đã lưu session state:', data.sessionId);
  }, [conversationSession, activeSessionId]);

  /**
   * Mục đích: Khôi phục session state từ MMKV
   * Tham số đầu vào: không
   * Tham số đầu ra: PersistedSession | null
   * Khi nào sử dụng: App quay lại foreground
   */
  const restoreSession = useCallback((): PersistedSession | null => {
    try {
      const raw = persistMMKV.getString(PERSIST_KEY);
      if (!raw) return null;

      const data: PersistedSession = JSON.parse(raw);
      return data;
    } catch (err) {
      console.error('❌ [SessionPersist] Lỗi khôi phục session:', err);
      return null;
    }
  }, []);

  /**
   * Mục đích: Xóa session persist data
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Session kết thúc hoặc user dismiss
   */
  const clearPersist = useCallback(() => {
    persistMMKV.delete(PERSIST_KEY);
    console.log('🧹 [SessionPersist] Xóa session persist data');
  }, []);

  // ===== AppState handler =====
  useEffect(() => {
    /**
     * Mục đích: Xử lý khi app chuyển background/foreground
     * Tham số đầu vào: nextState (AppStateStatus)
     * Tham số đầu ra: void
     * Khi nào sử dụng: React Native AppState event
     */
    const handleAppState = (nextState: AppStateStatus) => {
      const prevState = prevAppState.current;
      prevAppState.current = nextState;

      // App vào background
      if (
        prevState === 'active' &&
        (nextState === 'background' || nextState === 'inactive')
      ) {
        console.log('📱 [SessionPersist] App vào background');
        setAppActive(false);

        // Lưu session nếu đang active
        if (conversationSession?.isActive) {
          persistSession();

          // Schedule local push notification nếu có tin chưa đọc trong queue
          if (queuedMessages.length > 0) {
            const lastMsg = queuedMessages[queuedMessages.length - 1];
            scheduleBackgroundNotify(lastMsg.text);
          }
        }
      }

      // App quay lại foreground
      if (
        (prevState === 'background' || prevState === 'inactive') &&
        nextState === 'active'
      ) {
        console.log('📱 [SessionPersist] App quay lại foreground');
        setAppActive(true);

        // Xóa notification khi user quay lại app
        cancelAll();

        // Kiểm tra idle time
        const persisted = restoreSession();
        if (persisted) {
          const idleDuration = Date.now() - persisted.pausedAt;

          if (idleDuration > MAX_IDLE_MS) {
            // Idle quá lâu → auto-end session
            console.log(
              `⏱️ [SessionPersist] Idle ${Math.round(idleDuration / 60000)} phút > 15 phút → auto-end`,
            );
            endConversation();
            clearPersist();
            setActiveSession(null);
          } else {
            // Resume session — timer sẽ tự resume trong ConversationScreen
            console.log(
              `✅ [SessionPersist] Resume session sau ${Math.round(idleDuration / 1000)}s idle`,
            );
            // Không clear persist — để ConversationScreen xử lý
          }
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, [conversationSession, persistSession, restoreSession, clearPersist, endConversation, setAppActive, setActiveSession, queuedMessages, scheduleBackgroundNotify, cancelAll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) {
        clearInterval(pauseTimerRef.current);
      }
    };
  }, []);

  return {
    persistSession,
    restoreSession,
    clearPersist,
  };
}
