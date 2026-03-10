/**
 * Mục đích: Unit tests cho useTongueTwisterStore — state management
 * Tham số đầu vào: không có
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: npx jest --testPathPattern="tongueTwister" --verbose
 */

// Mock MMKV trước khi import store
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn().mockReturnValue(null),
    delete: jest.fn(),
  })),
}));

import {useTongueTwisterStore} from '../../store/useTongueTwisterStore';
import type {TongueTwister, SpeedRound} from '../../types/tongueTwister.types';

// =======================
// Mock Data
// =======================

const mockTwisters: TongueTwister[] = [
  {
    id: 'tt-1',
    text: 'She sells seashells by the seashore.',
    ipa: '/ʃi sɛlz siʃɛlz baɪ ðə siʃɔr/',
    targetPhonemes: ['/ʃ/', '/s/'],
    highlightWords: ['She', 'sells', 'seashells', 'seashore'],
    difficulty: 'easy',
  },
  {
    id: 'tt-2',
    text: 'The thirty-three thieves thought that they thrilled the throne.',
    ipa: '/ðə ˈθɜːrtiˈθriː θiːvz θɔːt ðæt ðeɪ θrɪld ðə θroʊn/',
    targetPhonemes: ['/θ/', '/ð/'],
    highlightWords: ['thirty-three', 'thieves', 'thought', 'thrilled', 'throne'],
    difficulty: 'medium',
  },
];

// =======================
// Tests
// =======================

describe('useTongueTwisterStore — Config', () => {
  beforeEach(() => {
    useTongueTwisterStore.getState().resetAll();
  });

  test('Initial config phải là null/null', () => {
    const {config} = useTongueTwisterStore.getState();
    expect(config.phonemeCategory).toBeNull();
    expect(config.level).toBeNull();
  });

  test('setPhonemeCategory cập nhật đúng', () => {
    useTongueTwisterStore.getState().setPhonemeCategory('th_sounds');
    expect(useTongueTwisterStore.getState().config.phonemeCategory).toBe('th_sounds');
  });

  test('setLevel cập nhật đúng', () => {
    useTongueTwisterStore.getState().setLevel('medium');
    expect(useTongueTwisterStore.getState().config.level).toBe('medium');
  });
});

describe('useTongueTwisterStore — Session', () => {
  beforeEach(() => {
    useTongueTwisterStore.getState().resetAll();
  });

  test('loadTwisters cập nhật session đúng', () => {
    useTongueTwisterStore.getState().loadTwisters(mockTwisters);
    const {session} = useTongueTwisterStore.getState();
    expect(session.twisters).toHaveLength(2);
    expect(session.currentIndex).toBe(0);
    expect(session.totalTwisters).toBe(2);
  });

  test('nextTwister tăng index', () => {
    useTongueTwisterStore.getState().loadTwisters(mockTwisters);
    useTongueTwisterStore.getState().nextTwister();
    expect(useTongueTwisterStore.getState().session.currentIndex).toBe(1);
  });

  test('nextTwister không vượt quá totalTwisters - 1', () => {
    useTongueTwisterStore.getState().loadTwisters(mockTwisters);
    useTongueTwisterStore.getState().nextTwister();
    useTongueTwisterStore.getState().nextTwister(); // index = 1, max = 1
    useTongueTwisterStore.getState().nextTwister(); // vẫn = 1
    expect(useTongueTwisterStore.getState().session.currentIndex).toBe(1);
  });

  test('prevTwister giảm index', () => {
    useTongueTwisterStore.getState().loadTwisters(mockTwisters);
    useTongueTwisterStore.getState().nextTwister(); // index = 1
    useTongueTwisterStore.getState().prevTwister(); // index = 0
    expect(useTongueTwisterStore.getState().session.currentIndex).toBe(0);
  });

  test('prevTwister không giảm dưới 0', () => {
    useTongueTwisterStore.getState().loadTwisters(mockTwisters);
    useTongueTwisterStore.getState().prevTwister(); // vẫn = 0
    expect(useTongueTwisterStore.getState().session.currentIndex).toBe(0);
  });

  test('nextTwister reset score và recording', () => {
    useTongueTwisterStore.getState().loadTwisters(mockTwisters);
    useTongueTwisterStore.getState().setScore(85, [], 'Tốt');
    useTongueTwisterStore.getState().nextTwister();
    const {score} = useTongueTwisterStore.getState();
    expect(score.pronunciation).toBeNull();
    expect(score.tip).toBeNull();
  });
});

describe('useTongueTwisterStore — Recording', () => {
  beforeEach(() => {
    useTongueTwisterStore.getState().resetAll();
  });

  test('startRecording set isRecording = true', () => {
    useTongueTwisterStore.getState().startRecording();
    expect(useTongueTwisterStore.getState().recording.isRecording).toBe(true);
  });

  test('stopRecording set isRecording = false + lưu audioUri', () => {
    useTongueTwisterStore.getState().startRecording();
    useTongueTwisterStore.getState().stopRecording('/path/to/audio.m4a');
    const {recording} = useTongueTwisterStore.getState();
    expect(recording.isRecording).toBe(false);
    expect(recording.audioUri).toBe('/path/to/audio.m4a');
  });

  test('clearRecording reset về initial', () => {
    useTongueTwisterStore.getState().startRecording();
    useTongueTwisterStore.getState().clearRecording();
    const {recording} = useTongueTwisterStore.getState();
    expect(recording.isRecording).toBe(false);
    expect(recording.audioUri).toBeNull();
  });
});

describe('useTongueTwisterStore — Score', () => {
  beforeEach(() => {
    useTongueTwisterStore.getState().resetAll();
  });

  test('setScore cập nhật đúng', () => {
    useTongueTwisterStore.getState().setScore(72, [{phoneme: '/θ/', word: 'think', isCorrect: true}], 'Tốt lắm');
    const {score} = useTongueTwisterStore.getState();
    expect(score.pronunciation).toBe(72);
    expect(score.phonemeHits).toHaveLength(1);
    expect(score.tip).toBe('Tốt lắm');
    expect(score.isLoading).toBe(false);
  });

  test('setScoreLoading toggle loading state', () => {
    useTongueTwisterStore.getState().setScoreLoading(true);
    expect(useTongueTwisterStore.getState().score.isLoading).toBe(true);
    useTongueTwisterStore.getState().setScoreLoading(false);
    expect(useTongueTwisterStore.getState().score.isLoading).toBe(false);
  });

  test('clearScore reset về initial', () => {
    useTongueTwisterStore.getState().setScore(72, [], 'Tip');
    useTongueTwisterStore.getState().clearScore();
    const {score} = useTongueTwisterStore.getState();
    expect(score.pronunciation).toBeNull();
    expect(score.tip).toBeNull();
  });
});

describe('useTongueTwisterStore — Speed Challenge', () => {
  beforeEach(() => {
    useTongueTwisterStore.getState().resetAll();
  });

  test('startSpeedChallenge khởi tạo 4 rounds', () => {
    useTongueTwisterStore.getState().startSpeedChallenge();
    const {speedChallenge} = useTongueTwisterStore.getState();
    expect(speedChallenge.isActive).toBe(true);
    expect(speedChallenge.currentRound).toBe(1);
    expect(speedChallenge.rounds).toHaveLength(4);
    expect(speedChallenge.rounds[0].status).toBe('active');
    expect(speedChallenge.rounds[1].status).toBe('locked');
    expect(speedChallenge.rounds[2].status).toBe('locked');
    expect(speedChallenge.rounds[3].status).toBe('locked');
  });

  test('completeRound (passed) → unlock next round', () => {
    useTongueTwisterStore.getState().startSpeedChallenge();
    // Đạt round 1 (passThreshold = 50%)
    useTongueTwisterStore.getState().completeRound(80, 110, 75);
    const {speedChallenge} = useTongueTwisterStore.getState();
    expect(speedChallenge.rounds[0].status).toBe('completed');
    expect(speedChallenge.rounds[0].score).toBe(80);
    expect(speedChallenge.rounds[1].status).toBe('active');
    expect(speedChallenge.currentRound).toBe(2);
    expect(speedChallenge.bestWPM).toBe(110);
  });

  test('completeRound (failed — accuracy < threshold) → tăng retryCount', () => {
    useTongueTwisterStore.getState().startSpeedChallenge();
    // Fail round 1 (accuracy 30 < threshold 50)
    useTongueTwisterStore.getState().completeRound(20, 50, 30);
    const {speedChallenge} = useTongueTwisterStore.getState();
    expect(speedChallenge.rounds[0].status).toBe('active'); // vẫn active
    expect(speedChallenge.retryCount).toBe(1);
    expect(speedChallenge.currentRound).toBe(1); // giữ nguyên
  });

  test('bestWPM giữ giá trị max', () => {
    useTongueTwisterStore.getState().startSpeedChallenge();
    useTongueTwisterStore.getState().completeRound(80, 120, 75);
    useTongueTwisterStore.getState().completeRound(85, 100, 70); // WPM thấp hơn
    expect(useTongueTwisterStore.getState().speedChallenge.bestWPM).toBe(120);
  });

  test('exitSpeedChallenge reset state', () => {
    useTongueTwisterStore.getState().startSpeedChallenge();
    useTongueTwisterStore.getState().exitSpeedChallenge();
    const {speedChallenge} = useTongueTwisterStore.getState();
    expect(speedChallenge.isActive).toBe(false);
  });
});

describe('useTongueTwisterStore — Level Progress', () => {
  beforeEach(() => {
    useTongueTwisterStore.getState().resetAll();
  });

  test('updateLevelProgress lưu score', () => {
    useTongueTwisterStore.getState().updateLevelProgress('th_sounds', 'easy', 85);
    const progress = useTongueTwisterStore.getState().levelProgress['th_sounds'];
    expect(progress.easy.avgScore).toBe(85);
    expect(progress.easy.completed).toBe(true);
  });

  test('updateLevelProgress giữ max score', () => {
    useTongueTwisterStore.getState().updateLevelProgress('th_sounds', 'easy', 85);
    useTongueTwisterStore.getState().updateLevelProgress('th_sounds', 'easy', 60); // thấp hơn
    const progress = useTongueTwisterStore.getState().levelProgress['th_sounds'];
    expect(progress.easy.avgScore).toBe(85); // giữ 85
  });

  test('completed = true khi score ≥ 70', () => {
    useTongueTwisterStore.getState().updateLevelProgress('sh_s', 'easy', 70);
    const progress = useTongueTwisterStore.getState().levelProgress['sh_s'];
    expect(progress.easy.completed).toBe(true);
  });

  test('completed = false khi score < 70', () => {
    useTongueTwisterStore.getState().updateLevelProgress('v_w', 'easy', 60);
    const progress = useTongueTwisterStore.getState().levelProgress['v_w'];
    expect(progress.easy.completed).toBe(false);
  });
});

describe('useTongueTwisterStore — Reset', () => {
  test('resetSession giữ levelProgress', () => {
    useTongueTwisterStore.getState().updateLevelProgress('th_sounds', 'easy', 85);
    useTongueTwisterStore.getState().loadTwisters(mockTwisters);
    useTongueTwisterStore.getState().resetSession();

    const state = useTongueTwisterStore.getState();
    expect(state.session.twisters).toHaveLength(0);
    expect(state.levelProgress['th_sounds'].easy.avgScore).toBe(85);
  });

  test('resetAll giữ levelProgress nhưng reset tất cả state khác', () => {
    useTongueTwisterStore.getState().setPhonemeCategory('sh_s');
    useTongueTwisterStore.getState().updateLevelProgress('sh_s', 'easy', 90);
    useTongueTwisterStore.getState().resetAll();

    const state = useTongueTwisterStore.getState();
    expect(state.config.phonemeCategory).toBeNull();
    expect(state.levelProgress['sh_s'].easy.avgScore).toBe(90);
  });
});
