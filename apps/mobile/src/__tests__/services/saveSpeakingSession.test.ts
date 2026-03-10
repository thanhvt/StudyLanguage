/**
 * Mục đích: Unit tests cho saveSpeakingSession helper — auto-save history
 * Tham số đầu vào: Không (test suite)
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD, pre-commit, sau khi thay đổi saveSpeakingSession logic
 *
 * Luồng:
 *   jest.mock('createEntry') → gọi saveSpeakingSession(mode, data) → verify params
 */

import {
  saveSpeakingSession,
  type PracticeSessionData,
  type ConversationSessionData,
  type ShadowingSessionData,
  type TongueTwisterSessionData,
} from '@/services/speaking/saveSpeakingSession';
import {createEntry} from '@/services/api/history';

// Mock API
jest.mock('@/services/api/history', () => ({
  createEntry: jest.fn().mockResolvedValue({
    success: true,
    entry: {id: 'test-id'},
    message: 'Đã lưu',
  }),
}));

const mockCreateEntry = createEntry as jest.MockedFunction<typeof createEntry>;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// =======================
// Practice Mode Tests
// =======================
describe('saveSpeakingSession — Practice Mode', () => {
  const basePracticeData: PracticeSessionData = {
    topic: 'Test Topic',
    sentences: [
      {text: 'Hello world', ipa: '/həˈloʊ wɜːrld/'},
      {text: 'Good morning', ipa: '/ɡʊd ˈmɔːrnɪŋ/'},
    ],
    scores: [
      {sentenceIndex: 0, overallScore: 85, grade: 'B+'},
      {sentenceIndex: 1, overallScore: 92, grade: 'A'},
    ],
    durationSeconds: 120,
    audioUri: '/tmp/recording.m4a',
  };

  it('gọi createEntry với type "speaking" và mode "practice"', async () => {
    await saveSpeakingSession('practice', basePracticeData);

    expect(mockCreateEntry).toHaveBeenCalledTimes(1);
    const params = mockCreateEntry.mock.calls[0][0];
    expect(params.type).toBe('speaking');
    expect(params.mode).toBe('practice');
  });

  it('tính avgScore đúng từ nhiều sentences', async () => {
    await saveSpeakingSession('practice', basePracticeData);

    const params = mockCreateEntry.mock.calls[0][0];
    const content = params.content as any;
    // (85 + 92) / 2 = 88.5 → Math.round = 89
    expect(content.avgScore).toBe(89);
  });

  it('truyền topic, audioUrl, durationMinutes đúng', async () => {
    await saveSpeakingSession('practice', basePracticeData);

    const params = mockCreateEntry.mock.calls[0][0];
    expect(params.topic).toBe('Test Topic');
    expect(params.audioUrl).toBe('/tmp/recording.m4a');
    expect(params.durationMinutes).toBe(2); // 120s = 2 phút
  });

  it('keywords chứa score trung bình', async () => {
    await saveSpeakingSession('practice', basePracticeData);

    const params = mockCreateEntry.mock.calls[0][0];
    expect(params.keywords).toContain('score:89');
    expect(params.keywords).toContain('practice');
    expect(params.keywords).toContain('pronunciation');
  });

  it('scores rỗng → avgScore = 0', async () => {
    const emptyData = {...basePracticeData, scores: []};
    await saveSpeakingSession('practice', emptyData);

    const content = (mockCreateEntry.mock.calls[0][0].content as any);
    expect(content.avgScore).toBe(0);
    expect(content.completedSentences).toBe(0);
  });

  it('content.totalSentences và completedSentences đúng', async () => {
    await saveSpeakingSession('practice', basePracticeData);

    const content = (mockCreateEntry.mock.calls[0][0].content as any);
    expect(content.totalSentences).toBe(2);
    expect(content.completedSentences).toBe(2);
  });

  it('audioUri undefined → audioUrl không truyền', async () => {
    const noAudio = {...basePracticeData, audioUri: undefined};
    await saveSpeakingSession('practice', noAudio);

    const params = mockCreateEntry.mock.calls[0][0];
    expect(params.audioUrl).toBeUndefined();
  });
});

// =======================
// AI Conversation Tests
// =======================
describe('saveSpeakingSession — AI Conversation', () => {
  const baseConvData: ConversationSessionData = {
    topic: 'Ordering Food',
    subMode: 'roleplay',
    messages: [
      {role: 'assistant', content: 'Welcome!', timestamp: '2025-01-01T00:00:00Z'},
      {role: 'user', content: 'I want pizza', timestamp: '2025-01-01T00:00:05Z'},
      {role: 'assistant', content: 'Great choice!'},
    ],
    pronunciationAlerts: [{word: 'pizza', ipa: '/piːtsə/', tip: 'Nhấn "ts"'}],
    grammarCorrections: [{wrong: 'I want', correct: "I'd like", explanation: 'Lịch sự hơn'}],
    summary: {totalTurns: 1, score: 78, aiNotes: 'Good effort'},
    durationSeconds: 300,
    persona: {name: 'Tony', role: 'Waiter'},
    difficulty: 'medium',
  };

  it('roleplay → mode "conversation-roleplay"', async () => {
    await saveSpeakingSession('conversation-roleplay', baseConvData);

    const params = mockCreateEntry.mock.calls[0][0];
    expect(params.mode).toBe('conversation-roleplay');
  });

  it('freetalk → mode "conversation-freetalk"', async () => {
    const freeTalk = {...baseConvData, subMode: 'free-talk' as const};
    await saveSpeakingSession('conversation-freetalk', freeTalk);

    const params = mockCreateEntry.mock.calls[0][0];
    expect(params.mode).toBe('conversation-freetalk');
  });

  it('lưu messages, pronunciationAlerts, grammarCorrections trong content', async () => {
    await saveSpeakingSession('conversation-roleplay', baseConvData);

    const content = (mockCreateEntry.mock.calls[0][0].content as any);
    expect(content.messages).toHaveLength(3);
    expect(content.pronunciationAlerts).toHaveLength(1);
    expect(content.grammarCorrections).toHaveLength(1);
    expect(content.summary.score).toBe(78);
  });

  it('totalTurns đếm chỉ user messages', async () => {
    await saveSpeakingSession('conversation-roleplay', baseConvData);

    const content = (mockCreateEntry.mock.calls[0][0].content as any);
    // 1 user message trong 3 tổng → totalTurns = 1
    expect(content.totalTurns).toBe(1);
  });

  it('keywords chứa persona name và difficulty', async () => {
    await saveSpeakingSession('conversation-roleplay', baseConvData);

    const params = mockCreateEntry.mock.calls[0][0];
    expect(params.keywords).toContain('Tony');
    expect(params.keywords).toContain('medium');
    expect(params.keywords).toContain('conversation');
  });

  it('persona undefined → keywords không chứa undefined', async () => {
    const noPersData = {...baseConvData, persona: undefined};
    await saveSpeakingSession('conversation-freetalk', noPersData);

    const params = mockCreateEntry.mock.calls[0][0];
    expect(params.keywords).not.toContain('undefined');
  });

  it('messages rỗng → content.totalTurns = 0', async () => {
    const emptyMsg = {...baseConvData, messages: []};
    await saveSpeakingSession('conversation-roleplay', emptyMsg);

    const content = (mockCreateEntry.mock.calls[0][0].content as any);
    expect(content.totalTurns).toBe(0);
  });

  it('durationMinutes tính đúng từ 300s', async () => {
    await saveSpeakingSession('conversation-roleplay', baseConvData);

    const params = mockCreateEntry.mock.calls[0][0];
    expect(params.durationMinutes).toBe(5); // 300s = 5 phút
  });
});

// =======================
// Shadowing Mode Tests
// =======================
describe('saveSpeakingSession — Shadowing', () => {
  const baseShadowData: ShadowingSessionData = {
    topic: 'Business English',
    sentences: [
      {text: 'Let me explain', ipa: '/lɛt mi ɪkˈspleɪn/'},
    ],
    scores: [
      {sentenceIndex: 0, rhythm: 75, intonation: 80, accuracy: 85, overall: 80, tips: ['Luyện nhịp']},
    ],
    speed: 1.0,
    durationSeconds: 45,
  };

  it('mode "shadowing" và topic đúng', async () => {
    await saveSpeakingSession('shadowing', baseShadowData);

    const params = mockCreateEntry.mock.calls[0][0];
    expect(params.mode).toBe('shadowing');
    expect(params.topic).toBe('Business English');
  });

  it('content chứa rhythm, intonation, accuracy, speed', async () => {
    await saveSpeakingSession('shadowing', baseShadowData);

    const content = (mockCreateEntry.mock.calls[0][0].content as any);
    expect(content.scores[0].rhythm).toBe(75);
    expect(content.scores[0].intonation).toBe(80);
    expect(content.scores[0].accuracy).toBe(85);
    expect(content.speed).toBe(1.0);
    expect(content.avgOverall).toBe(80);
  });

  it('keywords chứa speed và score', async () => {
    await saveSpeakingSession('shadowing', baseShadowData);

    const params = mockCreateEntry.mock.calls[0][0];
    expect(params.keywords).toContain('speed:1x');
    expect(params.keywords).toContain('score:80');
  });

  it('durationMinutes minimum 1 cho session ngắn', async () => {
    await saveSpeakingSession('shadowing', baseShadowData);

    const params = mockCreateEntry.mock.calls[0][0];
    // H07: 45s → Math.ceil(0.75) = 1
    expect(params.durationMinutes).toBe(1);
  });

  it('H07: durationMinutes dùng Math.ceil — 100s → 2 (không phải 2 với round)', async () => {
    const data100s = {...baseShadowData, durationSeconds: 100};
    await saveSpeakingSession('shadowing', data100s);

    const params = mockCreateEntry.mock.calls[0][0];
    // 100s = 1.667min → Math.ceil = 2, Math.round = 2 (same ở đây nhưng 61s khác biệt)
    expect(params.durationMinutes).toBe(2);
  });

  it('H07: 61s → durationMinutes = 2 (ceil), không phải 1 (round)', async () => {
    const data61s = {...baseShadowData, durationSeconds: 61};
    await saveSpeakingSession('shadowing', data61s);

    const params = mockCreateEntry.mock.calls[0][0];
    // 61s = 1.0167 phút → Math.ceil = 2, Math.round sẽ = 1
    expect(params.durationMinutes).toBe(2);
  });

  it('scores rỗng → avgOverall = 0', async () => {
    const emptyScores = {...baseShadowData, scores: []};
    await saveSpeakingSession('shadowing', emptyScores);

    const content = (mockCreateEntry.mock.calls[0][0].content as any);
    expect(content.avgOverall).toBe(0);
  });
});

// =======================
// Tongue Twister Tests
// =======================
describe('saveSpeakingSession — Tongue Twister', () => {
  const baseTTData: TongueTwisterSessionData = {
    phonemeCategory: 'th-vs-s',
    level: 'easy',
    twisters: [
      {text: 'She sells seashells', ipa: '/ʃiː sɛlz/', targetPhonemes: ['/ʃ/', '/s/']},
    ],
    scores: [
      {twisterIndex: 0, pronunciation: 72, tip: 'Lưỡi đặt sau răng'},
    ],
    durationSeconds: 60,
  };

  it('topic tự generate "Tongue Twister: {category}"', async () => {
    await saveSpeakingSession('tongue-twister', baseTTData);

    const params = mockCreateEntry.mock.calls[0][0];
    expect(params.topic).toBe('Tongue Twister: th-vs-s');
    expect(params.mode).toBe('tongue-twister');
  });

  it('content chứa phonemeCategory, level, scores', async () => {
    await saveSpeakingSession('tongue-twister', baseTTData);

    const content = (mockCreateEntry.mock.calls[0][0].content as any);
    expect(content.phonemeCategory).toBe('th-vs-s');
    expect(content.level).toBe('easy');
    expect(content.avgScore).toBe(72);
    expect(content.totalTwisters).toBe(1);
  });

  it('keywords chứa phonemeCategory, level, score', async () => {
    await saveSpeakingSession('tongue-twister', baseTTData);

    const params = mockCreateEntry.mock.calls[0][0];
    expect(params.keywords).toContain('th-vs-s');
    expect(params.keywords).toContain('easy');
    expect(params.keywords).toContain('score:72');
  });

  it('speedChallenge data lưu WPM trong keywords', async () => {
    const withSpeed: TongueTwisterSessionData = {
      ...baseTTData,
      speedChallenge: {
        rounds: [{round: 1, speed: 1.0, wpm: 120, accuracy: 85}],
        bestWPM: 120,
      },
    };
    await saveSpeakingSession('tongue-twister', withSpeed);

    const params = mockCreateEntry.mock.calls[0][0];
    expect(params.keywords).toContain('wpm:120');
  });

  it('không có speedChallenge → không có wpm trong keywords', async () => {
    await saveSpeakingSession('tongue-twister', baseTTData);

    const params = mockCreateEntry.mock.calls[0][0];
    expect(params.keywords).not.toContain('wpm');
  });
});

// =======================
// Edge Cases & Error Handling
// =======================
describe('saveSpeakingSession — Edge Cases', () => {
  it('EC-H01: API lỗi → không throw, chỉ console.error', async () => {
    mockCreateEntry.mockRejectedValueOnce(new Error('Network Error'));

    // Không throw
    await expect(
      saveSpeakingSession('practice', {
        topic: 'Test',
        sentences: [],
        scores: [],
        durationSeconds: 0,
      }),
    ).resolves.toBeUndefined();

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[SpeakingHistory] Lỗi'),
      'practice',
      expect.any(Error),
    );
  });

  it('EC-H03: scores rỗng → avgScore = 0 (không NaN/division by zero)', async () => {
    await saveSpeakingSession('practice', {
      topic: 'Empty',
      sentences: [],
      scores: [],
      durationSeconds: 0,
    });

    const content = (mockCreateEntry.mock.calls[0][0].content as any);
    expect(content.avgScore).toBe(0);
    expect(Number.isNaN(content.avgScore)).toBe(false);
  });

  it('EC-H04: durationSeconds = 0 → durationMinutes = 1 (minimum)', async () => {
    await saveSpeakingSession('practice', {
      topic: 'Quick',
      sentences: [],
      scores: [],
      durationSeconds: 0,
    });

    const params = mockCreateEntry.mock.calls[0][0];
    expect(params.durationMinutes).toBe(1);
  });

  it('EC-H05: durationSeconds rất lớn (3600s = 1h) → durationMinutes = 60', async () => {
    await saveSpeakingSession('practice', {
      topic: 'Long',
      sentences: [],
      scores: [],
      durationSeconds: 3600,
    });

    const params = mockCreateEntry.mock.calls[0][0];
    expect(params.durationMinutes).toBe(60);
  });

  it('Unknown mode → fallback với topic "Unknown Speaking Session"', async () => {
    await saveSpeakingSession('future-mode' as any, {
      topic: 'Test',
      sentences: [],
      scores: [],
      durationSeconds: 30,
    } as any);

    const params = mockCreateEntry.mock.calls[0][0];
    expect(params.topic).toBe('Unknown Speaking Session');
    expect(params.mode).toBe('future-mode');
  });

  it('durationSeconds âm → durationMinutes vẫn = 1 (Math.max guard)', async () => {
    await saveSpeakingSession('practice', {
      topic: 'Negative',
      sentences: [],
      scores: [],
      durationSeconds: -100,
    });

    const params = mockCreateEntry.mock.calls[0][0];
    expect(params.durationMinutes).toBe(1);
  });

  it('tất cả mode đều set type = "speaking"', async () => {
    const modes = ['practice', 'conversation-freetalk', 'conversation-roleplay', 'shadowing', 'tongue-twister'];
    const datas = [
      {topic: 'T', sentences: [], scores: [], durationSeconds: 60},
      {topic: 'T', subMode: 'free-talk', messages: [], durationSeconds: 60},
      {topic: 'T', subMode: 'roleplay', messages: [], durationSeconds: 60},
      {topic: 'T', sentences: [], scores: [], speed: 1, durationSeconds: 60},
      {phonemeCategory: 'th', level: 'easy', twisters: [], scores: [], durationSeconds: 60},
    ];

    for (let i = 0; i < modes.length; i++) {
      await saveSpeakingSession(modes[i], datas[i] as any);
      expect(mockCreateEntry.mock.calls[i][0].type).toBe('speaking');
    }
  });

  it('H08: Unknown mode → fallback serialize an toàn', async () => {
    const weirdData = {topic: 'Test', durationSeconds: 30, nested: {a: 1, b: [2, 3]}};
    await saveSpeakingSession('new-mode' as any, weirdData as any);

    const params = mockCreateEntry.mock.calls[0][0];
    expect(params.content).toEqual(expect.objectContaining({
      topic: 'Test',
      durationSeconds: 30,
      nested: {a: 1, b: [2, 3]},
    }));
  });
});
