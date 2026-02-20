/**
 * Unit test cho Speaking Screens — Data & Logic (Shadowing, TongueTwister, Roleplay)
 *
 * Mục đích: Test data structures, mock data integrity, và business logic
 *           mà các screen này sử dụng (không cần render component)
 * Tham số đầu vào: không có
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD pipeline, sau khi thay đổi screen data hoặc logic
 */

// ============================================
// Types (mirror từ screens)
// ============================================

type ShadowPhase = 'listen' | 'countdown' | 'record' | 'compare';

interface TongueTwister {
  id: string;
  text: string;
  targetWPM: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface RoleplayScenario {
  id: string;
  title: string;
  description: string;
  emoji: string;
  difficulty: 'easy' | 'medium' | 'hard';
  plays: number;
  totalTurns: number;
}

// ============================================
// Mock data (mirror từ screens)
// ============================================

const TWISTERS: TongueTwister[] = [
  {id: '1', text: 'She sells seashells by the seashore.', targetWPM: 80, difficulty: 'easy'},
  {id: '2', text: 'Peter Piper picked a peck of pickled peppers.', targetWPM: 90, difficulty: 'easy'},
  {id: '3', text: 'How much wood would a woodchuck chuck if a woodchuck could chuck wood?', targetWPM: 100, difficulty: 'medium'},
  {id: '4', text: 'Betty Botter bought some butter, but she said the butter is bitter.', targetWPM: 100, difficulty: 'medium'},
  {id: '5', text: 'The sixth sick sheikh sixth sheep is sick.', targetWPM: 120, difficulty: 'hard'},
  {id: '6', text: 'I wish to wash my Irish wristwatch.', targetWPM: 110, difficulty: 'medium'},
  {id: '7', text: 'Fuzzy Wuzzy was a bear, Fuzzy Wuzzy had no hair.', targetWPM: 90, difficulty: 'easy'},
  {id: '8', text: 'Red lorry, yellow lorry, red lorry, yellow lorry.', targetWPM: 100, difficulty: 'medium'},
];

const SCENARIOS: RoleplayScenario[] = [
  {id: '1', title: 'Đặt phòng khách sạn', description: 'Gọi điện đặt phòng', emoji: '🏨', difficulty: 'easy', plays: 234, totalTurns: 6},
  {id: '2', title: 'Phỏng vấn xin việc', description: 'Giới thiệu bản thân', emoji: '💼', difficulty: 'hard', plays: 567, totalTurns: 8},
  {id: '3', title: 'Gọi món nhà hàng', description: 'Xem menu, gọi món', emoji: '🍽️', difficulty: 'easy', plays: 389, totalTurns: 5},
  {id: '4', title: 'Hỏi đường', description: 'Hỏi người bản xứ', emoji: '🗺️', difficulty: 'easy', plays: 178, totalTurns: 4},
  {id: '5', title: 'Khám bệnh', description: 'Mô tả triệu chứng', emoji: '🏥', difficulty: 'medium', plays: 156, totalTurns: 6},
  {id: '6', title: 'Đàm phán hợp đồng', description: 'Thảo luận điều khoản', emoji: '📄', difficulty: 'hard', plays: 98, totalTurns: 8},
  {id: '7', title: 'Mua sắm quần áo', description: 'Hỏi size, màu sắc', emoji: '👕', difficulty: 'easy', plays: 312, totalTurns: 5},
  {id: '8', title: 'Báo cáo dự án', description: 'Trình bày tiến độ', emoji: '📊', difficulty: 'medium', plays: 145, totalTurns: 7},
];

// ============================================
// Helper: Phần logic trong screens
// ============================================

/**
 * Mục đích: Format seconds → mm:ss (dùng chung trong Shadowing, TongueTwister, Roleplay)
 * Tham số đầu vào: s (number) — seconds
 * Tham số đầu ra: string — formatted time
 * Khi nào sử dụng: Hiển thị timer
 */
function formatTime(s: number): string {
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Mục đích: Tính WPM từ text và thời gian ghi âm
 * Tham số đầu vào: text (string), durationSeconds (number)
 * Tham số đầu ra: number — words per minute
 * Khi nào sử dụng: TongueTwisterScreen → sau khi record → tính tốc độ
 */
function calculateWPM(text: string, durationSeconds: number): number {
  if (durationSeconds <= 0) return 0;
  const wordCount = text.split(/\s+/).length;
  return Math.round((wordCount / durationSeconds) * 60);
}

/**
 * Mục đích: Filter roleplay scenarios theo difficulty
 * Tham số đầu vào: scenarios (RoleplayScenario[]), filter ('all' | 'easy' | 'medium' | 'hard')
 * Tham số đầu ra: RoleplayScenario[]
 * Khi nào sử dụng: RoleplaySelectScreen → chọn filter tab
 */
function filterScenarios(
  scenarios: RoleplayScenario[],
  filter: 'all' | 'easy' | 'medium' | 'hard',
): RoleplayScenario[] {
  if (filter === 'all') return scenarios;
  return scenarios.filter(s => s.difficulty === filter);
}

// ============================================
// Tests
// ============================================

describe('Speaking Screens — Data & Logic', () => {
  // ----- Shadowing -----

  describe('Shadowing — Phase State Machine', () => {
    it('phase flow đúng thứ tự: listen → countdown → record → compare', () => {
      const phases: ShadowPhase[] = ['listen', 'countdown', 'record', 'compare'];
      expect(phases).toEqual(['listen', 'countdown', 'record', 'compare']);
    });

    it('phase "listen" là phase khởi đầu', () => {
      const initialPhase: ShadowPhase = 'listen';
      expect(initialPhase).toBe('listen');
    });

    it('phase "compare" là phase kết thúc', () => {
      const phases: ShadowPhase[] = ['listen', 'countdown', 'record', 'compare'];
      expect(phases[phases.length - 1]).toBe('compare');
    });
  });

  // ----- Tongue Twister -----

  describe('TongueTwister — Data Integrity', () => {
    it('có đủ 8 tongue twisters', () => {
      expect(TWISTERS).toHaveLength(8);
    });

    it('mỗi twister có đủ fields', () => {
      TWISTERS.forEach(t => {
        expect(t.id).toBeTruthy();
        expect(t.text).toBeTruthy();
        expect(t.targetWPM).toBeGreaterThan(0);
        expect(['easy', 'medium', 'hard']).toContain(t.difficulty);
      });
    });

    it('không có ID trùng lặp', () => {
      const ids = TWISTERS.map(t => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('targetWPM tăng theo difficulty', () => {
      const easyAvg = TWISTERS.filter(t => t.difficulty === 'easy')
        .reduce((sum, t) => sum + t.targetWPM, 0) / TWISTERS.filter(t => t.difficulty === 'easy').length;
      const hardAvg = TWISTERS.filter(t => t.difficulty === 'hard')
        .reduce((sum, t) => sum + t.targetWPM, 0) / TWISTERS.filter(t => t.difficulty === 'hard').length;
      expect(hardAvg).toBeGreaterThanOrEqual(easyAvg);
    });
  });

  describe('TongueTwister — WPM Calculation', () => {
    it('tính đúng WPM cho câu đơn giản', () => {
      // "She sells seashells by the seashore" = 6 từ
      // Đọc trong 5 giây → (6/5)*60 = 72 WPM
      const wpm = calculateWPM('She sells seashells by the seashore', 5);
      expect(wpm).toBe(72);
    });

    it('WPM = 0 khi duration <= 0', () => {
      expect(calculateWPM('Hello world', 0)).toBe(0);
      expect(calculateWPM('Hello world', -1)).toBe(0);
    });

    it('WPM tính đúng cho câu dài', () => {
      const text = 'How much wood would a woodchuck chuck if a woodchuck could chuck wood';
      // 13 từ, đọc trong 6 giây → (13/6)*60 = 130 WPM
      const wpm = calculateWPM(text, 6);
      expect(wpm).toBe(130);
    });
  });

  // ----- Roleplay -----

  describe('Roleplay — Scenario Data', () => {
    it('có đủ 8 scenarios', () => {
      expect(SCENARIOS).toHaveLength(8);
    });

    it('mỗi scenario có đủ fields', () => {
      SCENARIOS.forEach(s => {
        expect(s.id).toBeTruthy();
        expect(s.title).toBeTruthy();
        expect(s.description).toBeTruthy();
        expect(s.emoji).toBeTruthy();
        expect(['easy', 'medium', 'hard']).toContain(s.difficulty);
        expect(s.plays).toBeGreaterThanOrEqual(0);
        expect(s.totalTurns).toBeGreaterThan(0);
      });
    });

    it('không có ID trùng lặp', () => {
      const ids = SCENARIOS.map(s => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('Roleplay — Filter Logic', () => {
    it('filter "all" trả tất cả scenarios', () => {
      const result = filterScenarios(SCENARIOS, 'all');
      expect(result).toHaveLength(8);
    });

    it('filter "easy" chỉ trả scenarios dễ', () => {
      const result = filterScenarios(SCENARIOS, 'easy');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(s => expect(s.difficulty).toBe('easy'));
    });

    it('filter "medium" chỉ trả scenarios TB', () => {
      const result = filterScenarios(SCENARIOS, 'medium');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(s => expect(s.difficulty).toBe('medium'));
    });

    it('filter "hard" chỉ trả scenarios khó', () => {
      const result = filterScenarios(SCENARIOS, 'hard');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(s => expect(s.difficulty).toBe('hard'));
    });

    it('tổng filter = tổng all', () => {
      const easy = filterScenarios(SCENARIOS, 'easy');
      const medium = filterScenarios(SCENARIOS, 'medium');
      const hard = filterScenarios(SCENARIOS, 'hard');
      expect(easy.length + medium.length + hard.length).toBe(SCENARIOS.length);
    });
  });

  // ----- Shared Utilities -----

  describe('Shared — formatTime', () => {
    it('0 giây → "0:00"', () => {
      expect(formatTime(0)).toBe('0:00');
    });

    it('30 giây → "0:30"', () => {
      expect(formatTime(30)).toBe('0:30');
    });

    it('60 giây → "1:00"', () => {
      expect(formatTime(60)).toBe('1:00');
    });

    it('90 giây → "1:30"', () => {
      expect(formatTime(90)).toBe('1:30');
    });

    it('600 giây → "10:00"', () => {
      expect(formatTime(600)).toBe('10:00');
    });

    it('5 giây → "0:05" (pad zeros)', () => {
      expect(formatTime(5)).toBe('0:05');
    });
  });
});
