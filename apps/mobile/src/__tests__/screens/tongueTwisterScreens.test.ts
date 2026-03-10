/**
 * Mục đích: Unit tests cho Tongue Twister types, constants, và utility functions
 * Tham số đầu vào: không có
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: npx jest --testPathPattern="tongueTwister" --verbose
 */

import {
  PHONEME_CATEGORIES,
  LEVEL_CONFIGS,
  SPEED_ROUNDS_CONFIG,
  calculateWPM,
  calculateSpeedScore,
  isLevelUnlocked,
  formatTimerDisplay,
} from '../../types/tongueTwister.types';
import type {
  CategoryLevelProgress,
} from '../../types/tongueTwister.types';

// =======================
// PHONEME_CATEGORIES
// =======================

describe('Tongue Twister — Dữ liệu Phoneme Categories', () => {
  test('Phải có đúng 6 categories', () => {
    expect(PHONEME_CATEGORIES).toHaveLength(6);
  });

  test('Mỗi category phải có key, phonemePair, example, color, colorLight', () => {
    PHONEME_CATEGORIES.forEach(cat => {
      expect(cat.key).toBeTruthy();
      expect(cat.phonemePair).toContain('/');
      expect(cat.example).toBeTruthy();
      expect(cat.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(cat.colorLight).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  test('Keys phải unique', () => {
    const keys = PHONEME_CATEGORIES.map(c => c.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  test('Phải chứa các categories chính', () => {
    const keys = PHONEME_CATEGORIES.map(c => c.key);
    expect(keys).toContain('th_sounds');
    expect(keys).toContain('sh_s');
    expect(keys).toContain('r_l');
    expect(keys).toContain('v_w');
    expect(keys).toContain('ae_e');
    expect(keys).toContain('ee_i');
  });
});

// =======================
// LEVEL_CONFIGS
// =======================

describe('Tongue Twister — Dữ liệu Level Configs', () => {
  test('Phải có đúng 4 levels', () => {
    expect(LEVEL_CONFIGS).toHaveLength(4);
  });

  test('Levels phải theo thứ tự easy → medium → hard → extreme', () => {
    const levels = LEVEL_CONFIGS.map(l => l.level);
    expect(levels).toEqual(['easy', 'medium', 'hard', 'extreme']);
  });

  test('Easy phải có unlockThreshold = 0 (luôn unlock)', () => {
    expect(LEVEL_CONFIGS[0].unlockThreshold).toBe(0);
  });

  test('Các levels khác phải có unlockThreshold = 70', () => {
    LEVEL_CONFIGS.slice(1).forEach(config => {
      expect(config.unlockThreshold).toBe(70);
    });
  });
});

// =======================
// SPEED_ROUNDS_CONFIG
// =======================

describe('Tongue Twister — Dữ liệu Speed Challenge Rounds', () => {
  test('Phải có đúng 4 rounds', () => {
    expect(SPEED_ROUNDS_CONFIG).toHaveLength(4);
  });

  test('Tốc độ phải tăng dần: 0.8x → 1.0x → 1.2x → 1.5x', () => {
    const speeds = SPEED_ROUNDS_CONFIG.map(r => r.targetSpeed);
    expect(speeds).toEqual([0.8, 1.0, 1.2, 1.5]);
  });

  test('Target WPM phải tăng dần', () => {
    for (let i = 1; i < SPEED_ROUNDS_CONFIG.length; i++) {
      expect(SPEED_ROUNDS_CONFIG[i].targetWPM).toBeGreaterThan(
        SPEED_ROUNDS_CONFIG[i - 1].targetWPM,
      );
    }
  });

  test('Pass threshold phải giảm dần (dễ hơn ở rounds nhanh)', () => {
    // Round 1-2: 50%, Round 3: 45%, Round 4: 40%
    expect(SPEED_ROUNDS_CONFIG[0].passThreshold).toBe(50);
    expect(SPEED_ROUNDS_CONFIG[3].passThreshold).toBe(40);
  });
});

// =======================
// calculateWPM
// =======================

describe('Tongue Twister — calculateWPM', () => {
  test('Tính WPM cơ bản (100% accuracy)', () => {
    // 10 từ trong 30 giây = 20 WPM
    expect(calculateWPM(10, 30)).toBe(20);
  });

  test('Tính WPM với accuracy 50%', () => {
    // 10 từ, 30 giây, 50% accuracy = 5 correct / 30 * 60 = 10 WPM
    expect(calculateWPM(10, 30, 50)).toBe(10);
  });

  test('Duration = 0 → trả về 0 (tránh chia cho 0)', () => {
    expect(calculateWPM(10, 0)).toBe(0);
  });

  test('Duration âm → trả về 0', () => {
    expect(calculateWPM(10, -5)).toBe(0);
  });

  test('WPM phải là số nguyên', () => {
    const wpm = calculateWPM(7, 23, 80);
    expect(Number.isInteger(wpm)).toBe(true);
  });
});

// =======================
// calculateSpeedScore
// =======================

describe('Tongue Twister — calculateSpeedScore', () => {
  test('100% accuracy + đạt target WPM = 100 điểm', () => {
    expect(calculateSpeedScore(100, 150, 150)).toBe(100);
  });

  test('0% accuracy + 0 WPM = 0 điểm', () => {
    expect(calculateSpeedScore(0, 0, 100)).toBe(0);
  });

  test('Accuracy chiếm 70%, Speed chiếm 30%', () => {
    // Accuracy = 80, Speed = 50% target → 80*0.7 + 50*0.3 = 56 + 15 = 71
    const score = calculateSpeedScore(80, 50, 100);
    expect(score).toBe(71);
  });

  test('WPM vượt target → speed ratio capped ở 100%', () => {
    // Accuracy = 100, WPM = 200 (vượt target 100) → speed ratio = 1
    const score = calculateSpeedScore(100, 200, 100);
    expect(score).toBe(100); // 100*0.7 + 100*0.3 = 100
  });

  test('Score phải là số nguyên', () => {
    const score = calculateSpeedScore(73, 88, 100);
    expect(Number.isInteger(score)).toBe(true);
  });
});

// =======================
// isLevelUnlocked
// =======================

describe('Tongue Twister — isLevelUnlocked', () => {
  const mockProgress: CategoryLevelProgress = {
    easy: {avgScore: 85, completed: true},
    medium: {avgScore: 72, completed: true},
    hard: {avgScore: 45, completed: false},
    extreme: {avgScore: 0, completed: false},
  };

  test('Easy luôn unlocked (dù progress undefined)', () => {
    expect(isLevelUnlocked('easy', undefined)).toBe(true);
  });

  test('Medium unlocked khi Easy avgScore ≥ 70', () => {
    expect(isLevelUnlocked('medium', mockProgress)).toBe(true);
  });

  test('Hard unlocked khi Medium avgScore ≥ 70', () => {
    expect(isLevelUnlocked('hard', mockProgress)).toBe(true);
  });

  test('Extreme locked khi Hard avgScore < 70', () => {
    expect(isLevelUnlocked('extreme', mockProgress)).toBe(false);
  });

  test('Medium locked khi progress undefined', () => {
    expect(isLevelUnlocked('medium', undefined)).toBe(false);
  });

  test('Medium locked khi Easy score < 70', () => {
    const lowProgress: CategoryLevelProgress = {
      easy: {avgScore: 50, completed: false},
      medium: {avgScore: 0, completed: false},
      hard: {avgScore: 0, completed: false},
      extreme: {avgScore: 0, completed: false},
    };
    expect(isLevelUnlocked('medium', lowProgress)).toBe(false);
  });
});

// =======================
// formatTimerDisplay
// =======================

describe('Tongue Twister — formatTimerDisplay', () => {
  test('0 giây → 00:00.0', () => {
    expect(formatTimerDisplay(0)).toBe('00:00.0');
  });

  test('3.2 giây → 00:03.2', () => {
    expect(formatTimerDisplay(3.2)).toBe('00:03.2');
  });

  test('65.5 giây → 01:05.5', () => {
    expect(formatTimerDisplay(65.5)).toBe('01:05.5');
  });

  test('10 giây → 00:10.0', () => {
    expect(formatTimerDisplay(10)).toBe('00:10.0');
  });
});
