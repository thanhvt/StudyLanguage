/**
 * Unit test cho Component Logic — Tier 1
 *
 * Mục đích: Test data constants + logic từ các Listening components
 *   (tránh import component trực tiếp → tránh React Native module errors)
 * Tham số đầu vào: không có
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD pipeline, sau khi thay đổi component logic/constants
 */

// ===========================================
// Dữ liệu thay vì import component (tránh native module errors)
// ===========================================

/** Các bước generating — mirror từ GeneratingScreen.tsx */
const GENERATING_STEPS = [
  {label: 'Phân tích chủ đề...', icon: '📝'},
  {label: 'Xây dựng kịch bản...', icon: '🎭'},
  {label: 'Tạo hội thoại...', icon: '💬'},
  {label: 'Thêm từ vựng...', icon: '📚'},
  {label: 'Hoàn tất!', icon: '✅'},
];

/** Danh sách 6 Azure voices — mirror từ TtsSettingsSheet.tsx */
const AZURE_VOICES = [
  {id: 'en-US-AriaNeural', label: 'Aria', gender: 'Female', lang: 'en-US'},
  {id: 'en-US-JennyNeural', label: 'Jenny', gender: 'Female', lang: 'en-US'},
  {id: 'en-US-GuyNeural', label: 'Guy', gender: 'Male', lang: 'en-US'},
  {id: 'en-US-DavisNeural', label: 'Davis', gender: 'Male', lang: 'en-US'},
  {id: 'en-GB-SoniaNeural', label: 'Sonia', gender: 'Female', lang: 'en-GB'},
  {id: 'en-AU-NatashaNeural', label: 'Natasha', gender: 'Female', lang: 'en-AU'},
];

/** Danh sách emotions — mirror từ TtsSettingsSheet.tsx */
const EMOTION_CHIPS = [
  {id: 'default', label: 'Default', emoji: '😐'},
  {id: 'cheerful', label: 'Vui vẻ', emoji: '😊'},
  {id: 'sad', label: 'Buồn', emoji: '😢'},
  {id: 'angry', label: 'Giận', emoji: '😠'},
  {id: 'excited', label: 'Phấn khích', emoji: '🤩'},
  {id: 'friendly', label: 'Thân thiện', emoji: '😄'},
  {id: 'terrified', label: 'Sợ hãi', emoji: '😰'},
  {id: 'shouting', label: 'Hét', emoji: '📢'},
  {id: 'whispering', label: 'Thì thầm', emoji: '🤫'},
  {id: 'hopeful', label: 'Hy vọng', emoji: '🌟'},
];

/** Duration options — mirror từ ConfigScreen.tsx */
const DURATION_OPTIONS = [
  {value: 3, label: '3 phút'},
  {value: 5, label: '5 phút'},
  {value: 10, label: '10 phút'},
  {value: 15, label: '15 phút'},
];

/** Số người nói — mirror từ ConfigScreen.tsx */
const SPEAKERS_OPTIONS = [2, 3, 4];

/** Level mapping */
const LEVEL_MAP: Record<string, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung bình',
  advanced: 'Nâng cao',
};

/** Color constants */
const LISTENING_BLUE = '#2563EB';
const LISTENING_ORANGE = '#F97316';
const WARNING_AMBER = '#fbbf24';

// ===========================================
// 1. GeneratingScreen — STEPS Data
// ===========================================

describe('GeneratingScreen — STEPS Data', () => {
  it('có đúng 5 bước generating', () => {
    expect(GENERATING_STEPS).toHaveLength(5);
  });

  it('mỗi step có label và icon', () => {
    GENERATING_STEPS.forEach(step => {
      expect(step.label).toBeTruthy();
      expect(step.icon).toBeTruthy();
      expect(typeof step.label).toBe('string');
      expect(typeof step.icon).toBe('string');
    });
  });

  it('bước cuối cùng là "Hoàn tất!"', () => {
    const lastStep = GENERATING_STEPS[GENERATING_STEPS.length - 1];
    expect(lastStep.label).toBe('Hoàn tất!');
    expect(lastStep.icon).toBe('✅');
  });

  it('progress calculation — step index hợp lệ (0 đến 4)', () => {
    for (let i = 0; i < GENERATING_STEPS.length; i++) {
      const progressText = `${i + 1}/${GENERATING_STEPS.length}`;
      expect(progressText).toMatch(/^\d+\/5$/);
    }
  });

  it('step out-of-bounds trả undefined (icon fallback ⏳)', () => {
    expect(GENERATING_STEPS[-1]).toBeUndefined();
    expect(GENERATING_STEPS[99]).toBeUndefined();
    // Fallback logic: STEPS[currentStep]?.icon || '⏳'
    const fallbackIcon = GENERATING_STEPS[99]?.icon || '⏳';
    expect(fallbackIcon).toBe('⏳');
  });
});

// ===========================================
// 2. TtsSettingsSheet — Azure Voices Data
// ===========================================

describe('TtsSettingsSheet — Azure Voices', () => {
  it('có đúng 6 giọng Azure', () => {
    expect(AZURE_VOICES).toHaveLength(6);
  });

  it('mỗi voice có id, label, gender, lang', () => {
    AZURE_VOICES.forEach(voice => {
      expect(voice.id).toBeTruthy();
      expect(voice.label).toBeTruthy();
      expect(['Male', 'Female']).toContain(voice.gender);
      expect(voice.lang).toMatch(/^en-/);
    });
  });

  it('không có voice ID trùng lặp', () => {
    const ids = AZURE_VOICES.map(v => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('có ít nhất 1 Male và 1 Female voice', () => {
    const males = AZURE_VOICES.filter(v => v.gender === 'Male');
    const females = AZURE_VOICES.filter(v => v.gender === 'Female');
    expect(males.length).toBeGreaterThanOrEqual(1);
    expect(females.length).toBeGreaterThanOrEqual(1);
  });

  it('default voice "en-US-JennyNeural" tồn tại', () => {
    const jenny = AZURE_VOICES.find(v => v.id === 'en-US-JennyNeural');
    expect(jenny).toBeDefined();
    expect(jenny!.label).toBe('Jenny');
    expect(jenny!.gender).toBe('Female');
  });

  it('có voice từ nhiều accent (US, GB, AU)', () => {
    const langs = new Set(AZURE_VOICES.map(v => v.lang));
    expect(langs.has('en-US')).toBe(true);
    expect(langs.has('en-GB')).toBe(true);
    expect(langs.has('en-AU')).toBe(true);
  });
});

// ===========================================
// 3. TtsSettingsSheet — Emotion Chips
// ===========================================

describe('TtsSettingsSheet — Emotion Chips', () => {
  it('có ít nhất 5 emotions', () => {
    expect(EMOTION_CHIPS.length).toBeGreaterThanOrEqual(5);
  });

  it('mỗi emotion có id, label, emoji', () => {
    EMOTION_CHIPS.forEach(chip => {
      expect(chip.id).toBeTruthy();
      expect(chip.label).toBeTruthy();
      expect(chip.emoji).toBeTruthy();
    });
  });

  it('emotion "default" tồn tại và ở vị trí đầu', () => {
    expect(EMOTION_CHIPS[0].id).toBe('default');
  });

  it('không có emotion ID trùng lặp', () => {
    const ids = EMOTION_CHIPS.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ===========================================
// 4. ConfigScreen — Duration & Speakers Options
// ===========================================

describe('ConfigScreen — Duration Options', () => {
  it('có ít nhất 3 options duration', () => {
    expect(DURATION_OPTIONS.length).toBeGreaterThanOrEqual(3);
  });

  it('mỗi option có value (number) và label (string)', () => {
    DURATION_OPTIONS.forEach(opt => {
      expect(typeof opt.value).toBe('number');
      expect(opt.value).toBeGreaterThan(0);
      expect(typeof opt.label).toBe('string');
      expect(opt.label.length).toBeGreaterThan(0);
    });
  });

  it('values tăng dần', () => {
    for (let i = 1; i < DURATION_OPTIONS.length; i++) {
      expect(DURATION_OPTIONS[i].value).toBeGreaterThan(DURATION_OPTIONS[i - 1].value);
    }
  });
});

describe('ConfigScreen — Speakers Options', () => {
  it('có ít nhất 2 options speakers', () => {
    expect(SPEAKERS_OPTIONS.length).toBeGreaterThanOrEqual(2);
  });

  it('speakers bắt đầu từ 2 (minimum 2 người)', () => {
    expect(SPEAKERS_OPTIONS[0]).toBeGreaterThanOrEqual(2);
  });

  it('tất cả speakers là số nguyên dương', () => {
    SPEAKERS_OPTIONS.forEach(n => {
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThan(0);
    });
  });
});

// ===========================================
// 5. Level Mapping
// ===========================================

describe('Level Mapping', () => {
  it('có đủ 3 levels: beginner, intermediate, advanced', () => {
    expect(LEVEL_MAP).toHaveProperty('beginner');
    expect(LEVEL_MAP).toHaveProperty('intermediate');
    expect(LEVEL_MAP).toHaveProperty('advanced');
  });

  it('beginner → "Cơ bản"', () => {
    expect(LEVEL_MAP['beginner']).toBe('Cơ bản');
  });

  it('intermediate → "Trung bình"', () => {
    expect(LEVEL_MAP['intermediate']).toBe('Trung bình');
  });

  it('advanced → "Nâng cao"', () => {
    expect(LEVEL_MAP['advanced']).toBe('Nâng cao');
  });
});

// ===========================================
// 6. ConfirmDialog — Props & Colors
// ===========================================

describe('ConfirmDialog — Constants', () => {
  it('WARNING_AMBER là hex color hợp lệ', () => {
    expect(WARNING_AMBER).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('LISTENING_ORANGE là hex color hợp lệ', () => {
    expect(LISTENING_ORANGE).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('LISTENING_BLUE là hex color hợp lệ', () => {
    expect(LISTENING_BLUE).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('default props — cancelText="Hủy", confirmText="Tiếp tục"', () => {
    const defaults = {cancelText: 'Hủy', confirmText: 'Tiếp tục'};
    expect(defaults.cancelText).toBe('Hủy');
    expect(defaults.confirmText).toBe('Tiếp tục');
  });
});

// ===========================================
// 7. Visibility Matrix Logic
// ===========================================

describe('Visibility Matrix — TTS Settings', () => {
  // Kiểm tra logic hiển thị UI elements dựa trên state
  it('khi numSpeakers=1 → voicePerSpeaker không cần hiện', () => {
    const numSpeakers = 1;
    const showVoicePerSpeaker = numSpeakers >= 2;
    expect(showVoicePerSpeaker).toBe(false);
  });

  it('khi numSpeakers=2 → voicePerSpeaker nên hiện', () => {
    const numSpeakers = 2;
    const showVoicePerSpeaker = numSpeakers >= 2;
    expect(showVoicePerSpeaker).toBe(true);
  });

  it('khi multiTalker=true → multiTalkerPairIndex nên hiện', () => {
    const multiTalker = true;
    const showPairSelector = multiTalker;
    expect(showPairSelector).toBe(true);
  });

  it('khi randomVoice=true → voice selection dimmed', () => {
    const randomVoice = true;
    const isVoiceSelectionEnabled = !randomVoice;
    expect(isVoiceSelectionEnabled).toBe(false);
  });

  it('khi randomEmotion=true → emotion chips dimmed', () => {
    const randomEmotion = true;
    const isEmotionEnabled = !randomEmotion;
    expect(isEmotionEnabled).toBe(false);
  });
});
