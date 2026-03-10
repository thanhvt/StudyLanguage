import {create} from 'zustand';
import {persist, createJSONStorage, type StateStorage} from 'zustand/middleware';
import {MMKV} from 'react-native-mmkv';
import type {ConversationMessage} from '@/store/useSpeakingStore';

// =======================
// MMKV Storage
// =======================

/** MMKV instance riêng cho notification — tránh conflict với speaking store */
const notificationMMKV = new MMKV({id: 'notification-store'});

/**
 * Mục đích: Bridge MMKV → Zustand persist storage
 * Tham số đầu vào: không
 * Tham số đầu ra: StateStorage
 * Khi nào sử dụng: Zustand persist middleware tự gọi
 */
const mmkvStorage: StateStorage = {
  getItem: (name: string) => notificationMMKV.getString(name) ?? null,
  setItem: (name: string, value: string) => notificationMMKV.set(name, value),
  removeItem: (name: string) => notificationMMKV.delete(name),
};

// =======================
// Types
// =======================

/** Cấu hình thông báo của user */
export interface NotificationSettings {
  /** Bật/tắt thông báo chung */
  enabled: boolean;
  /** Âm thanh khi có thông báo */
  sound: boolean;
  /** Rung khi có thông báo */
  haptic: boolean;
  /** Chờ bao lâu trước khi thông báo (giây): 5, 10, 30, hoặc -1 = never */
  delaySeconds: number;
  /** Hiện nội dung tin nhắn trong toast */
  showPreview: boolean;
}

/** Tin nhắn đang chờ (đã nhận khi user ở background/screen khác) */
export interface QueuedMessage {
  id: string;
  text: string;
  timestamp: number;
  sessionId: string;
}

/** State của notification store */
interface NotificationState {
  /** Badge count cho mỗi tab (ví dụ: { Speaking: 3 }) */
  badgeCounts: Record<string, number>;
  /** Danh sách tin nhắn AI trả lời khi user không nhìn */
  queuedMessages: QueuedMessage[];
  /** Timestamp lần notify gần nhất — dùng cho throttle */
  lastNotifiedAt: number;
  /** Session ID đang active (null = không có session nào) */
  activeSessionId: string | null;
  /** Cài đặt thông báo của user */
  settings: NotificationSettings;
  /** User đang ở tab nào */
  currentTab: string | null;
  /** App đang ở foreground hay background */
  isAppActive: boolean;
  /** Thời điểm app vào background */
  backgroundedAt: number | null;
}

/** Actions của notification store */
interface NotificationActions {
  /** Tăng badge count cho 1 tab */
  incrementBadge: (tab: string) => void;
  /** Xóa badge count cho 1 tab (khi user navigate vào tab đó) */
  clearBadge: (tab: string) => void;
  /** Thêm tin nhắn vào hàng đợi */
  queueMessage: (msg: QueuedMessage) => void;
  /** Lấy hết tin nhắn ra khỏi hàng đợi (và trả về) */
  drainQueue: () => QueuedMessage[];
  /** Xóa tin nhắn theo sessionId */
  clearQueueBySession: (sessionId: string) => void;
  /** Cập nhật timestamp gần nhất */
  setLastNotifiedAt: (ts: number) => void;
  /** Set active session */
  setActiveSession: (id: string | null) => void;
  /** Cập nhật cài đặt notification */
  updateSettings: (partial: Partial<NotificationSettings>) => void;
  /** Set tab hiện tại */
  setCurrentTab: (tab: string | null) => void;
  /** Set app active state */
  setAppActive: (active: boolean) => void;
  /** Reset toàn bộ */
  reset: () => void;
}

// =======================
// Default values
// =======================

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  sound: true,
  haptic: true,
  delaySeconds: 10,
  showPreview: true,
};

const INITIAL_STATE: NotificationState = {
  badgeCounts: {},
  queuedMessages: [],
  lastNotifiedAt: 0,
  activeSessionId: null,
  settings: DEFAULT_SETTINGS,
  currentTab: null,
  isAppActive: true,
  backgroundedAt: null,
};

// =======================
// Store
// =======================

/**
 * Mục đích: Zustand store quản lý notification state cho AI Conversation
 *   Badge counts, queued messages, throttle timestamps, user settings
 * Tham số đầu vào: không
 * Tham số đầu ra: NotificationState & NotificationActions
 * Khi nào sử dụng:
 *   - useSessionPersist: queue messages khi app background
 *   - useNotificationThrottle: check throttle trước khi notify
 *   - CustomTabBar: đọc badgeCounts để hiện badge dot
 *   - ConversationScreen: drainQueue khi user quay lại
 */
export const useNotificationStore = create<NotificationState & NotificationActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      /**
       * Mục đích: Tăng badge count cho 1 tab
       * Tham số đầu vào: tab (string) — tên tab (ví dụ: 'Speaking')
       * Tham số đầu ra: void
       * Khi nào sử dụng: AI trả lời khi user ở tab khác
       */
      incrementBadge: (tab: string) => {
        set(state => ({
          badgeCounts: {
            ...state.badgeCounts,
            [tab]: (state.badgeCounts[tab] || 0) + 1,
          },
        }));
      },

      /**
       * Mục đích: Xóa badge count cho 1 tab
       * Tham số đầu vào: tab (string)
       * Tham số đầu ra: void
       * Khi nào sử dụng: User navigate vào tab → clear badge
       */
      clearBadge: (tab: string) => {
        set(state => {
          const newCounts = {...state.badgeCounts};
          delete newCounts[tab];
          return {badgeCounts: newCounts};
        });
      },

      /**
       * Mục đích: Thêm tin nhắn vào hàng đợi
       * Tham số đầu vào: msg (QueuedMessage)
       * Tham số đầu ra: void
       * Khi nào sử dụng: AI response khi user background — queue lại
       */
      queueMessage: (msg: QueuedMessage) => {
        const MAX_QUEUE = 5;
        set(state => {
          const newQueue = [...state.queuedMessages, msg];
          // Giới hạn queue size — bỏ tin cũ nhất nếu vượt quá
          if (newQueue.length > MAX_QUEUE) {
            newQueue.splice(0, newQueue.length - MAX_QUEUE);
          }
          return {queuedMessages: newQueue};
        });
      },

      /**
       * Mục đích: Lấy hết tin nhắn ra khỏi hàng đợi
       * Tham số đầu vào: không
       * Tham số đầu ra: QueuedMessage[] — danh sách tin đã drain
       * Khi nào sử dụng: ConversationScreen resume → drain → hiện divider
       */
      drainQueue: () => {
        const messages = get().queuedMessages;
        set({queuedMessages: []});
        return messages;
      },

      /**
       * Mục đích: Xóa tin nhắn theo sessionId
       * Tham số đầu vào: sessionId (string)
       * Tham số đầu ra: void
       * Khi nào sử dụng: Session kết thúc → cleanup queue
       */
      clearQueueBySession: (sessionId: string) => {
        set(state => ({
          queuedMessages: state.queuedMessages.filter(m => m.sessionId !== sessionId),
        }));
      },

      setLastNotifiedAt: (ts: number) => set({lastNotifiedAt: ts}),

      setActiveSession: (id: string | null) => set({activeSessionId: id}),

      updateSettings: (partial: Partial<NotificationSettings>) => {
        set(state => ({
          settings: {...state.settings, ...partial},
        }));
      },

      setCurrentTab: (tab: string | null) => set({currentTab: tab}),

      setAppActive: (active: boolean) => {
        set({
          isAppActive: active,
          backgroundedAt: active ? null : Date.now(),
        });
      },

      reset: () => set(INITIAL_STATE),
    }),
    {
      name: 'notification-store',
      storage: createJSONStorage(() => mmkvStorage),
      // Chỉ persist settings + activeSessionId — không persist queue/badge (volatile)
      partialize: (state) => ({
        settings: state.settings,
        activeSessionId: state.activeSessionId,
      }),
    },
  ),
);
