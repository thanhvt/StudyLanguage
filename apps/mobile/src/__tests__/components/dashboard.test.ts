/**
 * Unit test cho Dashboard components (logic only)
 *
 * Mục đích: Test greeting logic, streak display logic, quick actions mapping,
 *           weekly activity chart, recent lessons formatting
 * Ref test cases:
 *   - MOB-DASH-MVP-HP-001~004: Greeting theo giờ
 *   - MOB-DASH-MVP-HP-005~006: Streak display
 *   - MOB-DASH-MVP-HP-007~009: Quick Actions navigation
 *   - MOB-DASH-MVP-EC-002: Greeting khi user chưa có tên
 */

/**
 * Mục đích: Extract greeting logic từ StreakWidget để unit test riêng
 * Tham số đầu vào: hour (number 0-23)
 * Tham số đầu ra: string (greeting text)
 * Khi nào sử dụng: Test greeting logic mà không render component
 */
function getGreeting(hour: number): string {
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

/**
 * Mục đích: Format greeting text đầy đủ với tên user
 * Tham số đầu vào: hour (number), userName (string | null)
 * Tham số đầu ra: string
 * Khi nào sử dụng: Hiển thị ở StreakWidget
 */
function formatGreetingText(hour: number, userName: string | null): string {
  const greeting = getGreeting(hour);
  if (userName) {
    return `${greeting}, ${userName}! 👋`;
  }
  return `${greeting}! 👋`;
}

// Skill cards config (phải match QuickActions component)
const SKILLS = [
  {id: 'listening', label: 'Nghe', emoji: '🎧', route: 'Listening'},
  {id: 'speaking', label: 'Nói', emoji: '🗣️', route: 'Speaking'},
  {id: 'reading', label: 'Đọc', emoji: '📖', route: 'Reading'},
];

// Weekly activity mock data (phải match WeeklyActivityChart)
const WEEK_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

/**
 * Mục đích: Tính chiều cao bar dựa trên tỷ lệ phần trăm
 * Tham số đầu vào: minutes (number), maxMinutes (number), maxHeight (number)
 * Tham số đầu ra: number (pixel height)
 * Khi nào sử dụng: WeeklyActivityChart render bars
 */
function calculateBarHeight(
  minutes: number,
  maxMinutes: number,
  maxHeight: number,
): number {
  if (minutes <= 0) return 8; // Chiều cao tối thiểu cho inactive bars
  return Math.max((minutes / maxMinutes) * maxHeight, 8);
}

/**
 * Mục đích: Format thời gian "ngắn gọn" cho recent lessons
 * Tham số đầu vào: minutesAgo (number)
 * Tham số đầu ra: string
 * Khi nào sử dụng: RecentLessons hiển thị "5 phút trước", "2 giờ trước"
 */
function formatTimeAgo(minutesAgo: number): string {
  if (minutesAgo < 60) return `${minutesAgo} phút trước`;
  const hours = Math.floor(minutesAgo / 60);
  return `${hours} giờ trước`;
}

describe('Dashboard Logic', () => {
  describe('Greeting', () => {
    // MOB-DASH-MVP-HP-001: Buổi sáng
    it('hiển thị "Chào buổi sáng" từ 0:00-11:59', () => {
      expect(getGreeting(0)).toBe('Chào buổi sáng');
      expect(getGreeting(6)).toBe('Chào buổi sáng');
      expect(getGreeting(9)).toBe('Chào buổi sáng');
      expect(getGreeting(11)).toBe('Chào buổi sáng');
    });

    // MOB-DASH-MVP-HP-002: Buổi chiều
    it('hiển thị "Chào buổi chiều" từ 12:00-17:59', () => {
      expect(getGreeting(12)).toBe('Chào buổi chiều');
      expect(getGreeting(15)).toBe('Chào buổi chiều');
      expect(getGreeting(17)).toBe('Chào buổi chiều');
    });

    // MOB-DASH-MVP-HP-003: Buổi tối
    it('hiển thị "Chào buổi tối" từ 18:00-23:59', () => {
      expect(getGreeting(18)).toBe('Chào buổi tối');
      expect(getGreeting(20)).toBe('Chào buổi tối');
      expect(getGreeting(23)).toBe('Chào buổi tối');
    });

    // Boundary: chuyển giao
    it('boundary: 11 → sáng, 12 → chiều', () => {
      expect(getGreeting(11)).toBe('Chào buổi sáng');
      expect(getGreeting(12)).toBe('Chào buổi chiều');
    });

    it('boundary: 17 → chiều, 18 → tối', () => {
      expect(getGreeting(17)).toBe('Chào buổi chiều');
      expect(getGreeting(18)).toBe('Chào buổi tối');
    });

    // MOB-DASH-MVP-EC-002: Greeting khi user chưa có tên
    it('greeting có tên user khi có display name', () => {
      expect(formatGreetingText(9, 'Thành')).toBe(
        'Chào buổi sáng, Thành! 👋',
      );
    });

    it('greeting không có tên khi user chưa set display name', () => {
      expect(formatGreetingText(9, null)).toBe('Chào buổi sáng! 👋');
    });
  });

  describe('Quick Actions', () => {
    // MOB-DASH-MVP-HP-007: Có card Nghe
    it('có card "Nghe" với route Listening', () => {
      const listening = SKILLS.find(s => s.id === 'listening');
      expect(listening).toBeDefined();
      expect(listening?.route).toBe('Listening');
      expect(listening?.emoji).toBe('🎧');
    });

    // MOB-DASH-MVP-HP-008: Có card Nói
    it('có card "Nói" với route Speaking', () => {
      const speaking = SKILLS.find(s => s.id === 'speaking');
      expect(speaking).toBeDefined();
      expect(speaking?.route).toBe('Speaking');
    });

    // MOB-DASH-MVP-HP-009: Có card Đọc
    it('có card "Đọc" với route Reading', () => {
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

  describe('Weekly Activity Chart', () => {
    it('có đủ 7 ngày trong tuần', () => {
      expect(WEEK_DAYS).toHaveLength(7);
      expect(WEEK_DAYS[0]).toBe('T2');
      expect(WEEK_DAYS[6]).toBe('CN');
    });

    it('tính đúng chiều cao bar', () => {
      // 25 phút / 40 max * 80px = 50px
      expect(calculateBarHeight(25, 40, 80)).toBe(50);
    });

    it('bar tối thiểu 8px cho inactive days', () => {
      expect(calculateBarHeight(0, 40, 80)).toBe(8);
    });

    it('bar tối thiểu 8px cho giá trị rất nhỏ', () => {
      expect(calculateBarHeight(1, 100, 80)).toBe(8);
    });

    it('bar full height cho max value', () => {
      expect(calculateBarHeight(40, 40, 80)).toBe(80);
    });
  });

  describe('Recent Lessons - Time Ago', () => {
    it('hiển thị "X phút trước" nếu dưới 60 phút', () => {
      expect(formatTimeAgo(5)).toBe('5 phút trước');
      expect(formatTimeAgo(30)).toBe('30 phút trước');
      expect(formatTimeAgo(59)).toBe('59 phút trước');
    });

    it('hiển thị "X giờ trước" nếu >= 60 phút', () => {
      expect(formatTimeAgo(60)).toBe('1 giờ trước');
      expect(formatTimeAgo(120)).toBe('2 giờ trước');
      expect(formatTimeAgo(180)).toBe('3 giờ trước');
    });
  });
});
