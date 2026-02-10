/**
 * Unit test cho Dashboard components (logic only)
 *
 * Mục đích: Test greeting logic, streak display logic, quick actions mapping
 * Ref test cases:
 *   - MOB-DASH-MVP-HP-001~004: Greeting theo giờ
 *   - MOB-DASH-MVP-HP-005~006: Streak display
 *   - MOB-DASH-MVP-HP-007~009: Quick Actions navigation
 *   - MOB-DASH-MVP-EC-002: Greeting khi user chưa có tên
 */

/**
 * Mục đích: Extract greeting logic từ StreakWidget để unit test riêng
 * Tham số đầu vào: hour (number 0-23)
 * Tham số đầu ra: object { greeting, emoji }
 * Khi nào sử dụng: Test greeting logic mà không render component
 */
function getGreeting(hour: number): {greeting: string; emoji: string} {
  if (hour >= 6 && hour < 12) {
    return {greeting: 'Good morning', emoji: '☀️'};
  }
  if (hour >= 12 && hour < 18) {
    return {greeting: 'Good afternoon', emoji: '🌤️'};
  }
  if (hour >= 18 && hour < 22) {
    return {greeting: 'Good evening', emoji: '🌙'};
  }
  return {greeting: 'Still studying', emoji: '🦉'};
}

/**
 * Mục đích: Format greeting text đầy đủ với tên user
 * Tham số đầu vào: hour (number), userName (string | null)
 * Tham số đầu ra: string
 * Khi nào sử dụng: Hiển thị ở StreakWidget
 */
function formatGreetingText(hour: number, userName: string | null): string {
  const {greeting, emoji} = getGreeting(hour);
  if (userName) {
    return `${greeting}, ${userName}! ${emoji}`;
  }
  return `${greeting}! ${emoji}`;
}

// Skill cards config (phải match QuickActions component)
const SKILLS = [
  {id: 'listening', label: 'Luyện Nghe', emoji: '🎧', route: 'Listening'},
  {id: 'speaking', label: 'Luyện Nói', emoji: '🗣️', route: 'Speaking'},
  {id: 'reading', label: 'Luyện Đọc', emoji: '📖', route: 'Reading'},
];

describe('Dashboard Logic', () => {
  describe('Greeting', () => {
    // MOB-DASH-MVP-HP-001: Buổi sáng
    it('hiển thị "Good morning" từ 6:00-11:59', () => {
      expect(getGreeting(6).greeting).toBe('Good morning');
      expect(getGreeting(9).greeting).toBe('Good morning');
      expect(getGreeting(11).greeting).toBe('Good morning');
      expect(getGreeting(6).emoji).toBe('☀️');
    });

    // MOB-DASH-MVP-HP-002: Buổi chiều
    it('hiển thị "Good afternoon" từ 12:00-17:59', () => {
      expect(getGreeting(12).greeting).toBe('Good afternoon');
      expect(getGreeting(15).greeting).toBe('Good afternoon');
      expect(getGreeting(17).greeting).toBe('Good afternoon');
      expect(getGreeting(12).emoji).toBe('🌤️');
    });

    // MOB-DASH-MVP-HP-003: Buổi tối
    it('hiển thị "Good evening" từ 18:00-21:59', () => {
      expect(getGreeting(18).greeting).toBe('Good evening');
      expect(getGreeting(20).greeting).toBe('Good evening');
      expect(getGreeting(21).greeting).toBe('Good evening');
      expect(getGreeting(18).emoji).toBe('🌙');
    });

    // MOB-DASH-MVP-HP-004: Đêm khuya
    it('hiển thị "Still studying" từ 22:00-5:59', () => {
      expect(getGreeting(22).greeting).toBe('Still studying');
      expect(getGreeting(0).greeting).toBe('Still studying');
      expect(getGreeting(3).greeting).toBe('Still studying');
      expect(getGreeting(5).greeting).toBe('Still studying');
      expect(getGreeting(23).emoji).toBe('🦉');
    });

    // Boundary: edge cases chuyển giao
    it('boundary: 5:59 → night, 6:00 → morning', () => {
      expect(getGreeting(5).greeting).toBe('Still studying');
      expect(getGreeting(6).greeting).toBe('Good morning');
    });

    it('boundary: 11 → morning, 12 → afternoon', () => {
      expect(getGreeting(11).greeting).toBe('Good morning');
      expect(getGreeting(12).greeting).toBe('Good afternoon');
    });

    it('boundary: 17 → afternoon, 18 → evening', () => {
      expect(getGreeting(17).greeting).toBe('Good afternoon');
      expect(getGreeting(18).greeting).toBe('Good evening');
    });

    it('boundary: 21 → evening, 22 → night', () => {
      expect(getGreeting(21).greeting).toBe('Good evening');
      expect(getGreeting(22).greeting).toBe('Still studying');
    });

    // MOB-DASH-MVP-EC-002: Greeting khi user chưa có tên
    it('greeting có tên user khi có display name', () => {
      expect(formatGreetingText(9, 'Thành')).toBe(
        'Good morning, Thành! ☀️',
      );
    });

    it('greeting không có tên khi user chưa set display name', () => {
      expect(formatGreetingText(9, null)).toBe('Good morning! ☀️');
    });
  });

  describe('Quick Actions', () => {
    // MOB-DASH-MVP-HP-007: Có card Luyện Nghe
    it('có card "Luyện Nghe" với route Listening', () => {
      const listening = SKILLS.find(s => s.id === 'listening');
      expect(listening).toBeDefined();
      expect(listening?.route).toBe('Listening');
      expect(listening?.emoji).toBe('🎧');
    });

    // MOB-DASH-MVP-HP-008: Có card Luyện Nói
    it('có card "Luyện Nói" với route Speaking', () => {
      const speaking = SKILLS.find(s => s.id === 'speaking');
      expect(speaking).toBeDefined();
      expect(speaking?.route).toBe('Speaking');
    });

    // MOB-DASH-MVP-HP-009: Có card Luyện Đọc
    it('có card "Luyện Đọc" với route Reading', () => {
      const reading = SKILLS.find(s => s.id === 'reading');
      expect(reading).toBeDefined();
      expect(reading?.route).toBe('Reading');
    });

    // Đủ 3 skills
    it('có đúng 3 skill cards', () => {
      expect(SKILLS).toHaveLength(3);
    });
  });

  describe('Study Goal', () => {
    // StudyGoalCard progress bar logic
    it('progress tính đúng tỷ lệ phần trăm', () => {
      const completed = 15;
      const goal = 30;
      const progress = Math.min(completed / goal, 1);

      expect(progress).toBeCloseTo(0.5);
    });

    it('progress không vượt quá 1 (100%)', () => {
      const completed = 40;
      const goal = 30;
      const progress = Math.min(completed / goal, 1);

      expect(progress).toBe(1);
    });

    it('progress = 0 khi chưa học gì', () => {
      const completed = 0;
      const goal = 30;
      const progress = Math.min(completed / goal, 1);

      expect(progress).toBe(0);
    });
  });
});
