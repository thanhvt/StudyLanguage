/**
 * System test cho Listening Feature — Tier 5
 *
 * Mục đích: Test end-to-end data flow — full config → generate → play → bookmark
 * Tham số đầu vào: không có
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD pipeline, pre-deployment verification
 */
import {useListeningStore} from '@/store/useListeningStore';
import {getRandomScenario, getTotalScenarios} from '@/data/topic-data';

// Mock apiClient
jest.mock('@/services/api/client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

import {listeningApi, bookmarkApi} from '@/services/api/listening';
import {apiClient} from '@/services/api/client';

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Listening System Tests', () => {
  beforeEach(() => {
    useListeningStore.getState().reset();
    jest.clearAllMocks();
  });

  // ================================
  // 1. Full Config → Generate → Play Flow
  // ================================
  describe('Full Config → Generate → Play', () => {
    it('complete pipeline: config → conversation → audio → store update', async () => {
      // Step 1: Config
      useListeningStore.getState().setConfig({
        topic: 'Job Interview',
        durationMinutes: 10,
        level: 'advanced',
        numSpeakers: 2,
        includeVietnamese: true,
      });

      // Step 2: Generate Conversation
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          script: [
            {speaker: 'Interviewer', text: 'Tell me about yourself.', translation: 'Hãy giới thiệu bản thân bạn.'},
            {speaker: 'Candidate', text: 'I have 5 years of experience.', translation: 'Tôi có 5 năm kinh nghiệm.'},
            {speaker: 'Interviewer', text: 'What are your strengths?', translation: 'Điểm mạnh của bạn là gì?'},
          ],
          title: 'Job Interview Practice',
          vocabulary: [{word: 'experience', meaning: 'kinh nghiệm', example: 'I have experience'}],
          summary: 'Phỏng vấn xin việc',
        },
      });

      const config = useListeningStore.getState().config;
      const convResult = await listeningApi.generateConversation(config);
      useListeningStore.getState().setConversation(convResult);

      // Verify: Conversation saved
      expect(useListeningStore.getState().conversation).not.toBeNull();
      expect(useListeningStore.getState().conversation!.conversation).toHaveLength(3);

      // Step 3: Generate Audio
      const mockAudioData = {
        audioUrl: 'https://blob.storage/interview-audio-001.mp3',
        timestamps: [
          {lineIndex: 0, startTime: 0, endTime: 4.2, speaker: 'Interviewer'},
          {lineIndex: 1, startTime: 4.2, endTime: 9.1, speaker: 'Candidate'},
          {lineIndex: 2, startTime: 9.1, endTime: 13.5, speaker: 'Interviewer'},
        ],
      };

      mockApiClient.post.mockResolvedValueOnce({data: mockAudioData});

      const audioResult = await listeningApi.generateConversationAudio(
        convResult.conversation.map(c => ({speaker: c.speaker, text: c.text})),
        {provider: 'azure'},
      );
      useListeningStore.getState().setAudioUrl(audioResult.audioUrl);
      useListeningStore.getState().setTimestamps(audioResult.timestamps);

      // Verify: Audio data saved
      expect(useListeningStore.getState().audioUrl).toContain('interview-audio');
      expect(useListeningStore.getState().timestamps).toHaveLength(3);
      expect(useListeningStore.getState().timestamps[0].startTime).toBe(0);
      expect(useListeningStore.getState().timestamps[2].endTime).toBe(13.5);

      // Step 4: Play
      useListeningStore.getState().setPlaying(true);
      expect(useListeningStore.getState().isPlaying).toBe(true);

      // Step 5: Navigate to exchange
      useListeningStore.getState().setCurrentExchangeIndex(1);
      expect(useListeningStore.getState().currentExchangeIndex).toBe(1);
    });
  });

  // ================================
  // 2. Config Change → Regenerate
  // ================================
  describe('Config change → regenerate → new data', () => {
    it('thay đổi config → generate mới → data updated', async () => {
      // Initial config
      useListeningStore.getState().setConfig({topic: 'Coffee'});

      // Generate 1
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          script: [{speaker: 'A', text: 'Hi'}],
          title: 'V1',
          vocabulary: [],
        },
      });
      const result1 = await listeningApi.generateConversation(useListeningStore.getState().config);
      useListeningStore.getState().setConversation(result1);
      expect(useListeningStore.getState().conversation!.title).toBe('V1');

      // Change config
      useListeningStore.getState().setConfig({topic: 'Travel', level: 'beginner'});

      // Generate 2
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          script: [{speaker: 'A', text: 'Where?'}],
          title: 'V2',
          vocabulary: [],
        },
      });
      const result2 = await listeningApi.generateConversation(useListeningStore.getState().config);
      useListeningStore.getState().setConversation(result2);

      // Old conversation replaced
      expect(useListeningStore.getState().conversation!.title).toBe('V2');
    });
  });

  // ================================
  // 3. Concurrent Operations
  // ================================
  describe('Concurrent bookmark + saved word operations', () => {
    it('bookmark và saveWord đồng thời không conflict', () => {
      useListeningStore.getState().toggleBookmark(0);
      useListeningStore.getState().addSavedWord('experience');
      useListeningStore.getState().toggleBookmark(2);
      useListeningStore.getState().addSavedWord('interview');

      expect(useListeningStore.getState().bookmarkedIndexes).toEqual([0, 2]);
      expect(useListeningStore.getState().savedWords).toEqual(['experience', 'interview']);
    });

    it('unbookmark không ảnh hưởng savedWords', () => {
      useListeningStore.getState().toggleBookmark(0);
      useListeningStore.getState().addSavedWord('hello');
      useListeningStore.getState().toggleBookmark(0);

      expect(useListeningStore.getState().bookmarkedIndexes).not.toContain(0);
      expect(useListeningStore.getState().savedWords).toContain('hello');
    });
  });

  // ================================
  // 4. Reset Mid-Session
  // ================================
  describe('Store reset mid-session recovery', () => {
    it('reset xóa tất cả data nhưng không crash', () => {
      useListeningStore.getState().setConfig({topic: 'Test', durationMinutes: 15});
      useListeningStore.getState().setPlaying(true);
      useListeningStore.getState().setPlaybackSpeed(1.5);
      useListeningStore.getState().toggleBookmark(3);
      useListeningStore.getState().addSavedWord('test');
      useListeningStore.getState().setAudioUrl('https://example.com/audio.mp3');

      useListeningStore.getState().reset();

      const state = useListeningStore.getState();
      expect(state.config.topic).toBe('');
      expect(state.isPlaying).toBe(false);
      expect(state.playbackSpeed).toBe(1);
      expect(state.bookmarkedIndexes).toEqual([]);
      expect(state.savedWords).toEqual([]);
      expect(state.audioUrl).toBeNull();
      expect(state.conversation).toBeNull();
    });

    it('sau reset có thể tạo session mới', () => {
      useListeningStore.getState().setConfig({topic: 'Old'});
      useListeningStore.getState().reset();

      useListeningStore.getState().setConfig({topic: 'New', level: 'beginner'});
      expect(useListeningStore.getState().config.topic).toBe('New');
      expect(useListeningStore.getState().config.level).toBe('beginner');
    });
  });

  // ================================
  // 5. Multi-talker + Voice E2E
  // ================================
  describe('Multi-talker + voice per speaker E2E', () => {
    it('full voice configuration → API payload correct', async () => {
      useListeningStore.getState().setRandomVoice(false);
      useListeningStore.getState().setVoicePerSpeaker({
        Interviewer: 'en-US-GuyNeural',
        Candidate: 'en-US-JennyNeural',
      });
      useListeningStore.getState().setMultiTalker(true);
      useListeningStore.getState().setMultiTalkerPairIndex(1);
      useListeningStore.getState().setTtsPitch(3);
      useListeningStore.getState().setTtsRate(-2);
      useListeningStore.getState().setTtsVolume(90);
      useListeningStore.getState().setTtsEmotion('friendly');

      mockApiClient.post.mockResolvedValueOnce({
        data: {audioUrl: '', timestamps: []},
      });

      const state = useListeningStore.getState();
      await listeningApi.generateConversationAudio(
        [{speaker: 'Interviewer', text: 'Hi'}, {speaker: 'Candidate', text: 'Hey'}],
        {
          provider: 'azure',
          randomVoice: state.randomVoice,
          voicePerSpeaker: state.voicePerSpeaker,
          multiTalker: state.multiTalker,
          multiTalkerPairIndex: state.multiTalkerPairIndex,
          pitch: state.ttsPitch,
          rate: state.ttsRate,
          volume: state.ttsVolume,
          emotion: state.ttsEmotion,
        },
      );

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/ai/generate-conversation-audio',
        expect.objectContaining({
          randomVoice: false,
          multiTalker: true,
          multiTalkerPairIndex: 1,
          pitch: 3,
          rate: -2,
          volume: 90,
          emotion: 'friendly',
        }),
        expect.anything(),
      );
    });
  });

  // ================================
  // 6. TTS Prosody Full Flow
  // ================================
  describe('TTS prosody full cycle', () => {
    it('set → clamp → read → API', async () => {
      useListeningStore.getState().setTtsPitch(-50);
      useListeningStore.getState().setTtsRate(100);
      useListeningStore.getState().setTtsVolume(-10);

      const state = useListeningStore.getState();
      expect(state.ttsPitch).toBe(-20);
      expect(state.ttsRate).toBe(20);
      expect(state.ttsVolume).toBe(0);

      mockApiClient.post.mockResolvedValueOnce({
        data: {audioUrl: '', timestamps: []},
      });

      await listeningApi.generateConversationAudio(
        [{speaker: 'A', text: 'Test'}],
        {
          provider: 'azure',
          pitch: state.ttsPitch,
          rate: state.ttsRate,
          volume: state.ttsVolume,
        },
      );

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/ai/generate-conversation-audio',
        expect.objectContaining({
          pitch: -20,
          rate: 20,
          volume: 0,
        }),
        expect.anything(),
      );
    });
  });
});
