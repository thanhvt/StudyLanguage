/**
 * Unit test cho historyHelpers utilities
 *
 * Mục đích: Test các hàm tiện ích cho History module
 * Bao gồm:
 *   - getTypeIcon
 *   - getTypeLabel
 *   - getAccentColor
 *   - formatRelativeTime
 *   - formatDateGroup
 *   - groupEntriesByDate
 */
import {
  getTypeIcon,
  getTypeLabel,
  getAccentColor,
  formatRelativeTime,
  formatDateGroup,
  groupEntriesByDate,
} from '@/utils/historyHelpers';

describe('historyHelpers', () => {
  describe('getTypeIcon', () => {
    it('trả về 🎧 cho listening', () => {
      expect(getTypeIcon('listening')).toBe('🎧');
    });

    it('trả về 🗣️ cho speaking', () => {
      expect(getTypeIcon('speaking')).toBe('🗣️');
    });
  });

  describe('getTypeLabel', () => {
    it('trả về Nghe cho listening', () => {
      expect(getTypeLabel('listening')).toBe('Nghe');
    });

    it('trả về Nói cho speaking', () => {
      expect(getTypeLabel('speaking')).toBe('Nói');
    });
  });

  describe('getAccentColor', () => {
    it('listening trả về màu blue/indigo', () => {
      const color = getAccentColor('listening');
      expect(color.border).toBe('#4F46E5');
      expect(color.bg).toContain('79, 70, 229');
    });

    it('speaking trả về màu green', () => {
      const color = getAccentColor('speaking');
      expect(color.border).toBe('#16A34A');
    });
  });

  describe('formatRelativeTime', () => {
    it('dưới 1 phút → Vừa xong', () => {
      const now = new Date();
      expect(formatRelativeTime(now.toISOString())).toBe('Vừa xong');
    });

    it('5 phút trước', () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinAgo.toISOString())).toBe(
        '5 phút trước',
      );
    });

    it('3 giờ trước', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      expect(formatRelativeTime(threeHoursAgo.toISOString())).toBe(
        '3 giờ trước',
      );
    });

    it('2 ngày trước', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoDaysAgo.toISOString())).toBe(
        '2 ngày trước',
      );
    });

    it('hơn 7 ngày → format locale VN', () => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(twoWeeksAgo.toISOString());
      // Phải là ngày tháng dạng locale VN
      expect(result).not.toContain('trước');
    });
  });

  describe('formatDateGroup', () => {
    it('hôm nay → Hôm nay', () => {
      const now = new Date();
      expect(formatDateGroup(now.toISOString())).toBe('Hôm nay');
    });

    it('hôm qua → Hôm qua', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(formatDateGroup(yesterday.toISOString())).toBe('Hôm qua');
    });

    it('3 ngày trước → Tuần này', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(formatDateGroup(threeDaysAgo.toISOString())).toBe('Tuần này');
    });

    it('hơn 7 ngày → tháng năm', () => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const result = formatDateGroup(twoWeeksAgo.toISOString());
      // Phải chứa "tháng" hoặc format locale
      expect(result).not.toBe('Tuần này');
      expect(result).not.toBe('Hôm nay');
    });
  });

  describe('groupEntriesByDate', () => {
    it('nhóm entries theo ngày', () => {
      const now = new Date();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const entries = [
        {createdAt: now.toISOString(), id: '1'},
        {createdAt: now.toISOString(), id: '2'},
        {createdAt: yesterday.toISOString(), id: '3'},
      ];

      const sections = groupEntriesByDate(entries);

      expect(sections).toHaveLength(2);
      expect(sections[0].title).toBe('Hôm nay');
      expect(sections[0].data).toHaveLength(2);
      expect(sections[1].title).toBe('Hôm qua');
      expect(sections[1].data).toHaveLength(1);
    });

    it('trả mảng rỗng khi không có entries', () => {
      expect(groupEntriesByDate([])).toEqual([]);
    });
  });
});
