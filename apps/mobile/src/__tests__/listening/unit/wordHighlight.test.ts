/**
 * Unit Tests cho Word Highlight Feature — TDD (Tests First)
 *
 * Mục đích: Kiểm tra hàm findCurrentWordIndex (binary search) và các edge cases
 * Tham số đầu vào: WordTimestamp[], position (number)
 * Tham số đầu ra: index (number) — vị trí từ đang nói
 * Khi nào sử dụng: Chạy trước khi implement useWordHighlight hook
 */

// ============================================
// TYPE DEFINITION (sẽ move sang file riêng khi implement)
// ============================================

interface WordTimestamp {
  word: string;
  startTime: number;
  endTime: number;
}

// ============================================
// HÀM CẦN TEST (sẽ implement sau)
// ============================================

/**
 * Mục đích: Tìm index của từ đang được nói tại thời điểm `position`
 * Tham số đầu vào:
 *   - timestamps: mảng WordTimestamp đã sắp xếp theo startTime
 *   - position: vị trí audio hiện tại (giây)
 * Tham số đầu ra: index (number), -1 nếu không tìm thấy
 * Khi nào sử dụng: Được gọi mỗi 80ms bởi useWordHighlight hook
 */
function findCurrentWordIndex(
  timestamps: WordTimestamp[],
  position: number,
): number {
  if (!timestamps.length) return -1;

  let lo = 0;
  let hi = timestamps.length - 1;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const ts = timestamps[mid];

    if (position < ts.startTime) {
      hi = mid - 1;
    } else if (position > ts.endTime) {
      lo = mid + 1;
    } else {
      // position >= startTime && position <= endTime
      return mid;
    }
  }

  return -1; // Đang ở khoảng lặng giữa 2 từ
}

/**
 * Mục đích: Tìm từ đang nói, nếu ở khoảng lặng thì giữ từ trước đó
 * Tham số đầu vào:
 *   - timestamps: mảng WordTimestamp
 *   - position: vị trí audio hiện tại (giây)
 *   - lastIndex: index từ trước đó (để giữ highlight khi ở gap)
 * Tham số đầu ra: index (number)
 * Khi nào sử dụng: Wrapper trên findCurrentWordIndex, xử lý gap case
 */
function findCurrentWordIndexWithFallback(
  timestamps: WordTimestamp[],
  position: number,
  lastIndex: number,
): number {
  const exactIndex = findCurrentWordIndex(timestamps, position);

  // Nếu tìm thấy chính xác → trả về
  if (exactIndex !== -1) return exactIndex;

  // Nếu ở khoảng lặng → giữ từ trước đó (nếu hợp lệ)
  if (lastIndex >= 0 && lastIndex < timestamps.length) {
    // Chỉ giữ nếu position chưa vượt quá từ tiếp theo
    const nextIndex = lastIndex + 1;
    if (nextIndex < timestamps.length && position < timestamps[nextIndex].startTime) {
      return lastIndex;
    }
  }

  return -1;
}

// ============================================
// FIXTURES — Dữ liệu test chuẩn
// ============================================

/** Câu đơn giản: "Hello how are you today" */
const SIMPLE_SENTENCE: WordTimestamp[] = [
  {word: 'Hello', startTime: 0.0, endTime: 0.35},
  {word: 'how', startTime: 0.40, endTime: 0.55},
  {word: 'are', startTime: 0.58, endTime: 0.70},
  {word: 'you', startTime: 0.73, endTime: 0.88},
  {word: 'today', startTime: 0.92, endTime: 1.25},
];

/** Câu với contraction: "I don't think he's coming" */
const CONTRACTION_SENTENCE: WordTimestamp[] = [
  {word: 'I', startTime: 0.0, endTime: 0.08},
  {word: "don't", startTime: 0.12, endTime: 0.38},
  {word: 'think', startTime: 0.42, endTime: 0.65},
  {word: "he's", startTime: 0.70, endTime: 0.88},
  {word: 'coming', startTime: 0.92, endTime: 1.20},
];

/** Câu với từ lặp: "I think I should go and I will" */
const REPEATED_WORDS: WordTimestamp[] = [
  {word: 'I', startTime: 0.0, endTime: 0.08},
  {word: 'think', startTime: 0.12, endTime: 0.35},
  {word: 'I', startTime: 0.40, endTime: 0.48},
  {word: 'should', startTime: 0.52, endTime: 0.78},
  {word: 'go', startTime: 0.82, endTime: 0.98},
  {word: 'and', startTime: 1.02, endTime: 1.15},
  {word: 'I', startTime: 1.20, endTime: 1.28},
  {word: 'will', startTime: 1.32, endTime: 1.55},
];

/** Câu dài thực tế (~65 từ, duration ~28s) */
const LONG_SENTENCE: WordTimestamp[] = Array.from({length: 65}, (_, i) => ({
  word: `word${i}`,
  startTime: i * 0.42,
  endTime: i * 0.42 + 0.35,
}));

// ============================================
// TESTS
// ============================================

describe('findCurrentWordIndex — Binary Search', () => {
  // ========================
  // Cơ bản: Tìm từ chính xác
  // ========================
  describe('Tìm từ chính xác', () => {
    it('trả về index 0 khi position nằm trong từ đầu tiên', () => {
      expect(findCurrentWordIndex(SIMPLE_SENTENCE, 0.15)).toBe(0);
    });

    it('trả về index cuối khi position nằm trong từ cuối', () => {
      expect(findCurrentWordIndex(SIMPLE_SENTENCE, 1.10)).toBe(4);
    });

    it('trả về index giữa khi position nằm trong từ giữa câu', () => {
      expect(findCurrentWordIndex(SIMPLE_SENTENCE, 0.60)).toBe(2); // "are"
    });

    it('match chính xác tại startTime', () => {
      expect(findCurrentWordIndex(SIMPLE_SENTENCE, 0.40)).toBe(1); // "how"
    });

    it('match chính xác tại endTime', () => {
      expect(findCurrentWordIndex(SIMPLE_SENTENCE, 0.55)).toBe(1); // "how"
    });
  });

  // ========================
  // Khoảng lặng (Gap)
  // ========================
  describe('Khoảng lặng giữa 2 từ', () => {
    it('trả về -1 khi position ở gap giữa 2 từ', () => {
      // Gap giữa "Hello" (end 0.35) và "how" (start 0.40)
      expect(findCurrentWordIndex(SIMPLE_SENTENCE, 0.37)).toBe(-1);
    });

    it('trả về -1 khi position trước từ đầu tiên', () => {
      const withOffset: WordTimestamp[] = [
        {word: 'hello', startTime: 0.5, endTime: 0.8},
      ];
      expect(findCurrentWordIndex(withOffset, 0.2)).toBe(-1);
    });

    it('trả về -1 khi position sau từ cuối cùng', () => {
      expect(findCurrentWordIndex(SIMPLE_SENTENCE, 2.0)).toBe(-1);
    });
  });

  // ========================
  // Mảng rỗng / đặc biệt
  // ========================
  describe('Mảng rỗng và trường hợp đặc biệt', () => {
    it('trả về -1 khi timestamps rỗng', () => {
      expect(findCurrentWordIndex([], 0.5)).toBe(-1);
    });

    it('xử lý mảng 1 phần tử — match', () => {
      const single: WordTimestamp[] = [{word: 'hello', startTime: 0.0, endTime: 0.5}];
      expect(findCurrentWordIndex(single, 0.25)).toBe(0);
    });

    it('xử lý mảng 1 phần tử — miss', () => {
      const single: WordTimestamp[] = [{word: 'hello', startTime: 0.0, endTime: 0.5}];
      expect(findCurrentWordIndex(single, 0.8)).toBe(-1);
    });

    it('xử lý position = 0', () => {
      expect(findCurrentWordIndex(SIMPLE_SENTENCE, 0.0)).toBe(0);
    });

    it('xử lý position âm', () => {
      expect(findCurrentWordIndex(SIMPLE_SENTENCE, -0.5)).toBe(-1);
    });
  });

  // ========================
  // Từ lặp (Duplicate words)
  // ========================
  describe('Từ lặp — 3 chữ "I" ở vị trí khác nhau', () => {
    it('tìm đúng "I" đầu tiên (index 0)', () => {
      expect(findCurrentWordIndex(REPEATED_WORDS, 0.04)).toBe(0);
    });

    it('tìm đúng "I" thứ 2 (index 2)', () => {
      expect(findCurrentWordIndex(REPEATED_WORDS, 0.44)).toBe(2);
    });

    it('tìm đúng "I" thứ 3 (index 6)', () => {
      expect(findCurrentWordIndex(REPEATED_WORDS, 1.24)).toBe(6);
    });

    it('không nhầm "I" thứ 2 với "I" thứ 1', () => {
      // Position 0.04 → chỉ match word[0], KHÔNG match word[2] hay word[6]
      const result = findCurrentWordIndex(REPEATED_WORDS, 0.04);
      expect(result).toBe(0);
      expect(REPEATED_WORDS[result].startTime).toBeLessThanOrEqual(0.04);
      expect(REPEATED_WORDS[result].endTime).toBeGreaterThanOrEqual(0.04);
    });
  });

  // ========================
  // Performance: Câu dài
  // ========================
  describe('Performance — 65 từ (~30s audio)', () => {
    it('tìm từ giữa câu dài nhanh (< 1ms)', () => {
      const start = Date.now();
      const result = findCurrentWordIndex(LONG_SENTENCE, 13.5);
      const elapsed = Date.now() - start;

      expect(result).toBeGreaterThan(-1);
      expect(elapsed).toBeLessThan(5); // Phải < 5ms
    });

    it('tìm từ cuối câu dài', () => {
      const lastWord = LONG_SENTENCE[LONG_SENTENCE.length - 1];
      const result = findCurrentWordIndex(LONG_SENTENCE, lastWord.startTime + 0.1);
      expect(result).toBe(LONG_SENTENCE.length - 1);
    });

    it('chạy 1000 lần tìm kiếm liên tiếp trong < 50ms', () => {
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        const pos = Math.random() * 27; // Phạm vi 0-27s
        findCurrentWordIndex(LONG_SENTENCE, pos);
      }
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(50);
    });
  });

  // ========================
  // Floating point precision
  // ========================
  describe('Floating point precision — boundary cases', () => {
    it('không bỏ sót từ tại chính xác boundary startTime', () => {
      // Mỗi startTime là boundary chính xác
      SIMPLE_SENTENCE.forEach((ts, i) => {
        expect(findCurrentWordIndex(SIMPLE_SENTENCE, ts.startTime)).toBe(i);
      });
    });

    it('không bỏ sót từ tại chính xác boundary endTime', () => {
      SIMPLE_SENTENCE.forEach((ts, i) => {
        expect(findCurrentWordIndex(SIMPLE_SENTENCE, ts.endTime)).toBe(i);
      });
    });

    it('xử lý giá trị float precision edge (0.1 + 0.2 ≈ 0.3)', () => {
      const tricky: WordTimestamp[] = [
        {word: 'test', startTime: 0.1 + 0.2, endTime: 0.5}, // 0.30000000000000004
      ];
      // Tìm ở position 0.35 — nằm trong range
      expect(findCurrentWordIndex(tricky, 0.35)).toBe(0);
    });
  });
});

// ============================================
// TESTS CHO findCurrentWordIndexWithFallback
// ============================================

describe('findCurrentWordIndexWithFallback — Xử lý gap', () => {
  it('trả về exact index khi tìm thấy chính xác', () => {
    expect(findCurrentWordIndexWithFallback(SIMPLE_SENTENCE, 0.15, -1)).toBe(0);
  });

  it('giữ lastIndex khi ở gap giữa 2 từ', () => {
    // Gap giữa "Hello" (end 0.35) và "how" (start 0.40)
    // lastIndex = 0 (vẫn ở "Hello")
    expect(findCurrentWordIndexWithFallback(SIMPLE_SENTENCE, 0.37, 0)).toBe(0);
  });

  it('KHÔNG giữ lastIndex nếu đã vượt quá từ tiếp theo', () => {
    // position = 0.60, lastIndex = 0 (Hello) → vượt quá "how" rồi
    // Phải tìm word mới, trả -1 vì 0.60 nằm trong "are" → trả exact
    expect(findCurrentWordIndexWithFallback(SIMPLE_SENTENCE, 0.60, 0)).toBe(2);
  });

  it('trả về -1 khi position sau từ cuối cùng và không có lastIndex hợp lệ', () => {
    expect(findCurrentWordIndexWithFallback(SIMPLE_SENTENCE, 2.0, -1)).toBe(-1);
  });

  it('giữ từ cuối khi ở gap SAU từ cuối (silence tail)', () => {
    // position = 1.30, từ cuối "today" endTime = 1.25, lastIndex = 4
    // Không có từ tiếp theo → giữ từ cuối? Không, vì không có nextIndex
    expect(findCurrentWordIndexWithFallback(SIMPLE_SENTENCE, 1.30, 4)).toBe(-1);
  });

  it('hoạt động với mảng rỗng', () => {
    expect(findCurrentWordIndexWithFallback([], 0.5, -1)).toBe(-1);
  });
});

// ============================================
// SMOKE TESTS — Kịch bản thực tế
// ============================================

describe('Smoke Tests — Kịch bản mô phỏng phát audio', () => {
  it('mô phỏng phát audio câu 5 từ ở tốc độ 1x — tất cả từ đều được highlight', () => {
    const highlightedWords: number[] = [];
    let lastIdx = -1;

    // Mô phỏng polling 80ms từ 0 đến 1.5s
    for (let t = 0; t <= 1.5; t += 0.08) {
      const idx = findCurrentWordIndexWithFallback(SIMPLE_SENTENCE, t, lastIdx);
      if (idx !== -1 && idx !== lastIdx) {
        highlightedWords.push(idx);
        lastIdx = idx;
      }
    }

    // Phải highlight đủ 5 từ theo thứ tự
    expect(highlightedWords).toEqual([0, 1, 2, 3, 4]);
  });

  it('mô phỏng phát audio ở tốc độ 2x — vẫn highlight đủ từ', () => {
    const highlightedWords: number[] = [];
    let lastIdx = -1;

    // Tốc độ 2x: position tăng 2x nhanh hơn, polling vẫn 80ms
    for (let realTime = 0; realTime <= 0.75; realTime += 0.08) {
      const audioPosition = realTime * 2; // 2x speed
      const idx = findCurrentWordIndexWithFallback(SIMPLE_SENTENCE, audioPosition, lastIdx);
      if (idx !== -1 && idx !== lastIdx) {
        highlightedWords.push(idx);
        lastIdx = idx;
      }
    }

    // Có thể bỏ sót 1 từ ngắn ở 2x speed → chấp nhận minimum 3/5 từ
    expect(highlightedWords.length).toBeGreaterThanOrEqual(3);
    // Thứ tự phải tăng dần
    for (let i = 1; i < highlightedWords.length; i++) {
      expect(highlightedWords[i]).toBeGreaterThan(highlightedWords[i - 1]);
    }
  });

  it('mô phỏng seek — nhảy từ giây 0 đến giây 0.8', () => {
    // Trước seek: đang ở từ 0
    const before = findCurrentWordIndex(SIMPLE_SENTENCE, 0.15);
    expect(before).toBe(0);

    // Sau seek: nhảy đến giữa câu
    const after = findCurrentWordIndex(SIMPLE_SENTENCE, 0.80);
    expect(after).toBe(3); // "you"
  });

  it('mô phỏng pause/resume — highlight giữ nguyên khi pause', () => {
    // Đang phát → pause tại position 0.60
    const pauseIdx = findCurrentWordIndex(SIMPLE_SENTENCE, 0.60);
    expect(pauseIdx).toBe(2); // "are"

    // Resume → position vẫn 0.60 → cùng từ
    const resumeIdx = findCurrentWordIndex(SIMPLE_SENTENCE, 0.60);
    expect(resumeIdx).toBe(pauseIdx);
  });

  it('mô phỏng conversation 30 phút — 4500 từ, tìm kiếm chính xác', () => {
    // Tạo dataset lớn: 4500 từ, mỗi từ 0.4s
    const bigConversation: WordTimestamp[] = Array.from({length: 4500}, (_, i) => ({
      word: `w${i}`,
      startTime: i * 0.42,
      endTime: i * 0.42 + 0.35,
    }));

    // Tìm từ ở khoảng phút thứ 15 — chọn position nằm chính xác trong 1 word
    const targetIdx = 2142; // ~phút 15
    const targetPos = bigConversation[targetIdx].startTime + 0.1; // Chắc chắn nằm trong word
    const idx = findCurrentWordIndex(bigConversation, targetPos);
    expect(idx).toBe(targetIdx);
    expect(bigConversation[idx].startTime).toBeLessThanOrEqual(targetPos);
    expect(bigConversation[idx].endTime).toBeGreaterThanOrEqual(targetPos);
  });
});

// ============================================
// EDGE CASE TESTS — Contractions & đặc biệt
// ============================================

describe('Edge Cases — Contractions, Azure word splitting', () => {
  it('Azure trả contraction "don\'t" nguyên khối → tìm thấy bình thường', () => {
    const idx = findCurrentWordIndex(CONTRACTION_SENTENCE, 0.25);
    expect(idx).toBe(1);
    expect(CONTRACTION_SENTENCE[idx].word).toBe("don't");
  });

  it('Azure tách "don\'t" thành ["don", "\'t"] → vẫn tìm bằng position', () => {
    // Kịch bản: Azure tách thành 2 token
    const splitContraction: WordTimestamp[] = [
      {word: 'I', startTime: 0.0, endTime: 0.08},
      {word: 'don', startTime: 0.12, endTime: 0.25},
      {word: "'t", startTime: 0.26, endTime: 0.38},
      {word: 'think', startTime: 0.42, endTime: 0.65},
    ];

    // Position 0.20 → match "don" (index 1)
    expect(findCurrentWordIndex(splitContraction, 0.20)).toBe(1);
    // Position 0.30 → match "'t" (index 2)
    expect(findCurrentWordIndex(splitContraction, 0.30)).toBe(2);
  });

  it('xử lý timestamps chồng chéo nhau (overlap — lỗi Azure hiếm gặp)', () => {
    const overlapping: WordTimestamp[] = [
      {word: 'hello', startTime: 0.0, endTime: 0.40},
      {word: 'world', startTime: 0.35, endTime: 0.70}, // Overlap 0.35-0.40!
    ];

    // Position 0.37 nằm trong CẢ 2 → binary search trả 1 trong 2
    const idx = findCurrentWordIndex(overlapping, 0.37);
    expect(idx).toBeGreaterThanOrEqual(0); // Chấp nhận 0 hoặc 1
    expect(idx).toBeLessThanOrEqual(1);
  });

  it('xử lý timestamps có gap lớn (>1s silence giữa câu)', () => {
    const withLargeGap: WordTimestamp[] = [
      {word: 'first', startTime: 0.0, endTime: 0.35},
      // Gap 2 giây!
      {word: 'second', startTime: 2.50, endTime: 2.85},
    ];

    // Giữa gap → -1
    expect(findCurrentWordIndex(withLargeGap, 1.5)).toBe(-1);
    // Sau gap → match "second"
    expect(findCurrentWordIndex(withLargeGap, 2.60)).toBe(1);
  });
});
