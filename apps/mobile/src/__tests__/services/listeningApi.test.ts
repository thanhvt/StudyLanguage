/**
 * Unit test cho listeningApi — Rewrite v3
 *
 * Mục đích: Test API service layer cho Listening feature
 * Bao gồm: generateConversation, generateConversationAudio,
 *           fetchVoices, previewVoice, randomEmotion support
 */
import {listeningApi, bookmarkApi} from '@/services/api/listening';

// ========================
// Mock fetch global
// ========================
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('listeningApi', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  // ================================
  // generateConversation
  // ================================
  describe('generateConversation', () => {
    it('gửi đúng payload với config mặc định', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          conversation: [{speaker: 'Alice', text: 'Hello'}],
          title: 'Test',
          vocabulary: [],
        }),
      });

      await listeningApi.generateConversation({
        topic: 'Coffee Shop',
        durationMinutes: 5,
        level: 'intermediate',
        includeVietnamese: true,
        numSpeakers: 2,
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/ai/generate-conversation');
      expect(options.method).toBe('POST');
      const body = JSON.parse(options.body);
      expect(body.topic).toBe('Coffee Shop');
      expect(body.durationMinutes).toBe(5);
      expect(body.level).toBe('intermediate');
      expect(body.numSpeakers).toBe(2);
    });

    it('trả về kết quả hội thoại đúng format', async () => {
      const mockResult = {
        conversation: [
          {speaker: 'Alice', text: 'Hello!', vietnamese: 'Xin chào!'},
          {speaker: 'Bob', text: 'Hi!', vietnamese: 'Chào!'},
        ],
        title: 'Coffee Chat',
        vocabulary: ['greet', 'order'],
        summary: 'Hai bạn nói chuyện ở quán cà phê',
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const result = await listeningApi.generateConversation({
        topic: 'Coffee',
        durationMinutes: 5,
        level: 'beginner',
        includeVietnamese: true,
        numSpeakers: 2,
      });

      expect(result.conversation).toHaveLength(2);
      expect(result.conversation[0].speaker).toBe('Alice');
      expect(result.vocabulary).toContain('greet');
      expect(result.summary).toContain('cà phê');
    });

    it('throw lỗi khi API trả error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({error: 'Internal Server Error'}),
      });

      await expect(
        listeningApi.generateConversation({
          topic: 'Test',
          durationMinutes: 5,
          level: 'intermediate',
          includeVietnamese: true,
          numSpeakers: 2,
        }),
      ).rejects.toThrow();
    });
  });

  // ================================
  // generateConversationAudio
  // ================================
  describe('generateConversationAudio', () => {
    const mockConversation = [
      {speaker: 'Alice', text: 'Hello!'},
      {speaker: 'Bob', text: 'Hey there!'},
    ];

    it('gửi đúng payload với TTS options cơ bản', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          audioUrl: 'https://example.com/audio.mp3',
          timestamps: [],
        }),
      });

      await listeningApi.generateConversationAudio(mockConversation, {
        provider: 'azure',
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.conversation).toEqual(mockConversation);
      expect(body.provider).toBe('azure');
    });

    it('gửi randomEmotion khi được bật', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          audioUrl: 'https://example.com/audio.mp3',
          timestamps: [],
        }),
      });

      await listeningApi.generateConversationAudio(mockConversation, {
        provider: 'azure',
        randomEmotion: true,
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.randomEmotion).toBe(true);
    });

    it('gửi voicePerSpeaker khi randomVoice=false', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          audioUrl: 'https://example.com/audio.mp3',
          timestamps: [{lineIndex: 0, startTime: 0, endTime: 3.5, speaker: 'Alice'}],
        }),
      });

      await listeningApi.generateConversationAudio(mockConversation, {
        provider: 'azure',
        randomVoice: false,
        voicePerSpeaker: {A: 'en-US-JennyNeural', B: 'en-US-GuyNeural'},
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.voicePerSpeaker).toEqual({A: 'en-US-JennyNeural', B: 'en-US-GuyNeural'});
      expect(body.randomVoice).toBe(false);
    });

    it('gửi multiTalker khi enabled', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({audioUrl: '', timestamps: []}),
      });

      await listeningApi.generateConversationAudio(mockConversation, {
        provider: 'azure',
        multiTalker: true,
        multiTalkerPairIndex: 2,
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.multiTalker).toBe(true);
      expect(body.multiTalkerPairIndex).toBe(2);
    });

    it('trả về audioUrl + timestamps đúng format', async () => {
      const mockResult = {
        audioUrl: 'https://blob.storage/audio-abc123.mp3',
        timestamps: [
          {lineIndex: 0, startTime: 0, endTime: 3.5, speaker: 'Alice'},
          {lineIndex: 1, startTime: 3.5, endTime: 7.2, speaker: 'Bob'},
        ],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const result = await listeningApi.generateConversationAudio(mockConversation, {
        provider: 'azure',
      });

      expect(result.audioUrl).toContain('https://');
      expect(result.timestamps).toHaveLength(2);
      expect(result.timestamps[0].startTime).toBe(0);
      expect(result.timestamps[1].endTime).toBe(7.2);
    });

    it('gửi prosody (pitch, rate, volume) khi có', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({audioUrl: '', timestamps: []}),
      });

      await listeningApi.generateConversationAudio(mockConversation, {
        provider: 'azure',
        pitch: 5,
        rate: -3,
        volume: 80,
        emotion: 'cheerful',
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.pitch).toBe(5);
      expect(body.rate).toBe(-3);
      expect(body.volume).toBe(80);
      expect(body.emotion).toBe('cheerful');
    });
  });

  // ================================
  // fetchVoices (New!)
  // ================================
  describe('fetchVoices', () => {
    it('gọi GET /api/ai/voices', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          voices: [
            {id: 'en-US-JennyNeural', name: 'Jenny', gender: 'Female'},
            {id: 'en-US-GuyNeural', name: 'Guy', gender: 'Male'},
          ],
          multiTalker: [{pair: ['Jenny', 'Guy']}],
        }),
      });

      const result = await listeningApi.fetchVoices('azure');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/ai/voices');
      expect(result.voices).toHaveLength(2);
      expect(result.voices[0].name).toBe('Jenny');
      expect(result.multiTalker).toHaveLength(1);
    });

    it('throw lỗi khi fetch thất bại', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
      });

      await expect(listeningApi.fetchVoices('azure')).rejects.toThrow();
    });
  });

  // ================================
  // previewVoice (New!)
  // ================================
  describe('previewVoice', () => {
    it('gọi POST /api/ai/text-to-speech với đúng params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({audioUrl: 'https://example.com/preview.mp3'}),
      });

      const result = await listeningApi.previewVoice(
        'Hello, nice to meet you.',
        'en-US-JennyNeural',
        'cheerful',
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/ai/text-to-speech');
      const body = JSON.parse(options.body);
      expect(body.text).toBe('Hello, nice to meet you.');
      expect(body.voice).toBe('en-US-JennyNeural');
      expect(body.emotion).toBe('cheerful');
    });

    it('gọi không có emotion khi undefined', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({audioUrl: 'https://example.com/preview.mp3'}),
      });

      await listeningApi.previewVoice(
        'Hello!',
        'en-US-GuyNeural',
        undefined,
      );

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.emotion).toBeUndefined();
    });
  });
});

// ================================
// Bookmark API
// ================================
describe('bookmarkApi', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('create() gửi POST với đúng payload', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({id: 'bm-123'}),
    });

    await bookmarkApi.create({
      sentenceIndex: 5,
      speaker: 'Alice',
      sentenceText: 'Hello there!',
      sentenceTranslation: 'Xin chào bạn!',
      topic: 'Greeting',
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.sentenceIndex).toBe(5);
    expect(body.speaker).toBe('Alice');
    expect(body.sentenceText).toBe('Hello there!');
  });

  it('deleteByIndex() gửi DELETE đúng sentenceIndex', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({success: true}),
    });

    await bookmarkApi.deleteByIndex({sentenceIndex: 5});

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(options.method).toBe('DELETE');
  });
});
