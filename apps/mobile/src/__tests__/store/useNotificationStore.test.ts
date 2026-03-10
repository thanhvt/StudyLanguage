/**
 * Unit tests cho useNotificationStore
 *
 * Mục đích: Test badge counts, queue, drain, throttle, settings, persist
 * Tham số đầu vào: không
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD, sau khi thay đổi notification store logic
 */

// =======================
// Mock MMKV
// =======================

jest.mock('react-native-mmkv', () => {
  const instances: Record<string, Map<string, string>> = {};
  return {
    MMKV: jest.fn().mockImplementation((config?: {id?: string}) => {
      const id = config?.id ?? 'default';
      if (!instances[id]) {
        instances[id] = new Map();
      }
      const storage = instances[id];
      return {
        getString: (key: string) => storage.get(key),
        set: (key: string, value: string) => storage.set(key, value),
        delete: (key: string) => storage.delete(key),
      };
    }),
  };
});

// Mock zustand persist — dùng memory storage
jest.mock('zustand/middleware', () => {
  const actual = jest.requireActual('zustand/middleware');
  return {
    ...actual,
    createJSONStorage: () => ({
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    }),
  };
});

import {useNotificationStore} from '@/store/useNotificationStore';

// =======================
// Reset store trước mỗi test
// =======================

beforeEach(() => {
  useNotificationStore.getState().reset();
});

// =======================
// Tests
// =======================

describe('useNotificationStore', () => {
  // ===== Badge Counts =====

  describe('Badge Counts', () => {
    it('incrementBadge tăng count cho tab', () => {
      const store = useNotificationStore.getState();

      store.incrementBadge('Speaking');
      expect(useNotificationStore.getState().badgeCounts.Speaking).toBe(1);

      store.incrementBadge('Speaking');
      expect(useNotificationStore.getState().badgeCounts.Speaking).toBe(2);
    });

    it('incrementBadge hoạt động cho nhiều tab', () => {
      const store = useNotificationStore.getState();

      store.incrementBadge('Speaking');
      store.incrementBadge('Listening');
      store.incrementBadge('Speaking');

      const counts = useNotificationStore.getState().badgeCounts;
      expect(counts.Speaking).toBe(2);
      expect(counts.Listening).toBe(1);
    });

    it('clearBadge xóa badge cho tab cụ thể', () => {
      const store = useNotificationStore.getState();

      store.incrementBadge('Speaking');
      store.incrementBadge('Speaking');
      store.incrementBadge('Listening');

      store.clearBadge('Speaking');

      const counts = useNotificationStore.getState().badgeCounts;
      expect(counts.Speaking).toBeUndefined();
      expect(counts.Listening).toBe(1);
    });

    it('clearBadge không lỗi khi tab không có badge', () => {
      const store = useNotificationStore.getState();
      expect(() => store.clearBadge('NonExistent')).not.toThrow();
    });
  });

  // ===== Queue =====

  describe('Queue Messages', () => {
    it('queueMessage thêm tin vào hàng đợi', () => {
      const store = useNotificationStore.getState();

      store.queueMessage({
        id: 'msg_1',
        text: 'Hello from AI',
        timestamp: Date.now(),
        sessionId: 'session_1',
      });

      expect(useNotificationStore.getState().queuedMessages).toHaveLength(1);
      expect(useNotificationStore.getState().queuedMessages[0].text).toBe('Hello from AI');
    });

    it('queue giới hạn tối đa 5 tin', () => {
      const store = useNotificationStore.getState();

      for (let i = 0; i < 7; i++) {
        store.queueMessage({
          id: `msg_${i}`,
          text: `Message ${i}`,
          timestamp: Date.now() + i,
          sessionId: 'session_1',
        });
      }

      const queue = useNotificationStore.getState().queuedMessages;
      expect(queue).toHaveLength(5);
      // Phải giữ 5 tin MỚI NHẤT (bỏ 2 tin cũ nhất)
      expect(queue[0].id).toBe('msg_2');
      expect(queue[4].id).toBe('msg_6');
    });

    it('drainQueue trả về tất cả tin và xóa queue', () => {
      const store = useNotificationStore.getState();

      store.queueMessage({
        id: 'msg_1',
        text: 'Tin 1',
        timestamp: Date.now(),
        sessionId: 'session_1',
      });
      store.queueMessage({
        id: 'msg_2',
        text: 'Tin 2',
        timestamp: Date.now(),
        sessionId: 'session_1',
      });

      const drained = store.drainQueue();
      expect(drained).toHaveLength(2);
      expect(useNotificationStore.getState().queuedMessages).toHaveLength(0);
    });

    it('clearQueueBySession chỉ xóa tin của session đó', () => {
      const store = useNotificationStore.getState();

      store.queueMessage({
        id: 'msg_1',
        text: 'Session 1',
        timestamp: Date.now(),
        sessionId: 'session_1',
      });
      store.queueMessage({
        id: 'msg_2',
        text: 'Session 2',
        timestamp: Date.now(),
        sessionId: 'session_2',
      });

      store.clearQueueBySession('session_1');

      const queue = useNotificationStore.getState().queuedMessages;
      expect(queue).toHaveLength(1);
      expect(queue[0].sessionId).toBe('session_2');
    });
  });

  // ===== Settings =====

  describe('Notification Settings', () => {
    it('có default settings hợp lệ', () => {
      const settings = useNotificationStore.getState().settings;

      expect(settings.enabled).toBe(true);
      expect(settings.sound).toBe(true);
      expect(settings.haptic).toBe(true);
      expect(settings.delaySeconds).toBe(10);
      expect(settings.showPreview).toBe(true);
    });

    it('updateSettings cập nhật 1 phần', () => {
      const store = useNotificationStore.getState();

      store.updateSettings({sound: false, delaySeconds: 30});

      const settings = useNotificationStore.getState().settings;
      expect(settings.sound).toBe(false);
      expect(settings.delaySeconds).toBe(30);
      // Các field khác giữ nguyên
      expect(settings.enabled).toBe(true);
      expect(settings.haptic).toBe(true);
    });

    it('updateSettings không xóa các settings cũ', () => {
      const store = useNotificationStore.getState();

      store.updateSettings({enabled: false});
      store.updateSettings({showPreview: false});

      const settings = useNotificationStore.getState().settings;
      expect(settings.enabled).toBe(false);
      expect(settings.showPreview).toBe(false);
    });
  });

  // ===== App State =====

  describe('App State', () => {
    it('setAppActive(true) set isAppActive và clear backgroundedAt', () => {
      const store = useNotificationStore.getState();

      store.setAppActive(false);
      expect(useNotificationStore.getState().isAppActive).toBe(false);
      expect(useNotificationStore.getState().backgroundedAt).not.toBeNull();

      store.setAppActive(true);
      expect(useNotificationStore.getState().isAppActive).toBe(true);
      expect(useNotificationStore.getState().backgroundedAt).toBeNull();
    });

    it('setCurrentTab cập nhật tab', () => {
      const store = useNotificationStore.getState();

      store.setCurrentTab('Speaking');
      expect(useNotificationStore.getState().currentTab).toBe('Speaking');

      store.setCurrentTab(null);
      expect(useNotificationStore.getState().currentTab).toBeNull();
    });
  });

  // ===== Throttle =====

  describe('Throttle', () => {
    it('setLastNotifiedAt cập nhật timestamp', () => {
      const store = useNotificationStore.getState();
      const now = Date.now();

      store.setLastNotifiedAt(now);
      expect(useNotificationStore.getState().lastNotifiedAt).toBe(now);
    });
  });

  // ===== Reset =====

  describe('Reset', () => {
    it('reset xóa tất cả state về mặc định', () => {
      const store = useNotificationStore.getState();

      // Thay đổi nhiều thứ
      store.incrementBadge('Speaking');
      store.queueMessage({
        id: 'msg_1',
        text: 'Test',
        timestamp: Date.now(),
        sessionId: 's1',
      });
      store.setActiveSession('session_123');
      store.updateSettings({enabled: false});

      // Reset
      store.reset();

      const state = useNotificationStore.getState();
      expect(state.badgeCounts).toEqual({});
      expect(state.queuedMessages).toHaveLength(0);
      expect(state.activeSessionId).toBeNull();
      expect(state.settings.enabled).toBe(true);
    });
  });
});
