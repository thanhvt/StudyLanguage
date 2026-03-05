import {apiClient} from './client';

// =======================
// Types cho Speaking API
// =======================

/** Cấu hình sinh câu practice */
export interface SpeakingConfig {
  /** Chủ đề luyện nói */
  topic: string;
  /** Trình độ: beginner / intermediate / advanced */
  level: 'beginner' | 'intermediate' | 'advanced';
}

/** Một câu practice */
export interface Sentence {
  /** Nội dung câu tiếng Anh */
  text: string;
  /** Phiên âm IPA (nếu có) */
  ipa?: string;
  /** Độ khó: easy / medium / hard */
  difficulty?: string;
}

/** Điểm cho từng từ */
export interface WordScore {
  /** Từ gốc */
  word: string;
  /** Điểm 0-100 */
  score: number;
  /** Đúng hay sai */
  correct: boolean;
  /** Mô tả lỗi (nếu có) */
  issue?: string;
}

/** Kết quả đánh giá phát âm từ AI */
export interface FeedbackResult {
  /** Điểm tổng 0-100 */
  overallScore: number;
  /** Điểm trôi chảy 0-100 */
  fluency: number;
  /** Điểm phát âm 0-100 */
  pronunciation: number;
  /** Điểm tốc độ 0-100 */
  pace: number;
  /** Điểm từng từ */
  wordByWord: WordScore[];
  /** Patterns lỗi phát âm */
  patterns: string[];
  /** Feedback chi tiết */
  feedback: {
    wrongWords: {word: string; userSaid: string; suggestion: string}[];
    tips: string[];
    encouragement: string;
  };
}

// =======================
// Helpers
// =======================

/**
 * Mục đích: Parse JSON response từ AI generate-text (có thể kèm markdown fence)
 * Tham số đầu vào: text (string) — raw AI response
 * Tham số đầu ra: Sentence[] — danh sách câu practice
 * Khi nào sử dụng: Sau khi gọi generate-text để sinh câu practice
 */
function parseSentences(text: string): Sentence[] {
  try {
    // Bỏ markdown code fence nếu có
    const clean = text.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
    const jsonMatch = clean.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return Array.isArray(parsed)
        ? parsed.map((s: any) => ({
            text: s.text || s.sentence || s,
            ipa: s.ipa,
            difficulty: s.difficulty,
          }))
        : [];
    }
    // Fallback: split theo dòng
    return text
      .split('\n')
      .map(l => l.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, '').trim())
      .filter(l => l.length > 5)
      .map(l => ({text: l}));
  } catch {
    console.error('❌ [Speaking] Lỗi parse sentences');
    return [{text: 'Hello, how are you today?'}];
  }
}

// =======================
// API Service
// =======================

/**
 * Mục đích: Service gọi API backend cho Speaking feature
 * Khi nào sử dụng:
 *   - ConfigScreen: generateSentences → tạo câu practice
 *   - PracticeScreen: transcribeAudio + playAISample
 *   - FeedbackScreen: evaluatePronunciation → chấm điểm
 */
export const speakingApi = {
  /**
   * Mục đích: Sinh danh sách câu practice theo topic + level
   * Tham số đầu vào: config (SpeakingConfig) — topic, level
   * Tham số đầu ra: Promise<Sentence[]>
   * Khi nào sử dụng: User nhấn "Bắt đầu luyện tập" sau khi chọn config
   *   ConfigScreen → onPress → generateSentences → navigate PracticeScreen
   */
  generateSentences: async (config: SpeakingConfig): Promise<Sentence[]> => {
    const prompt = `Bạn là một giáo viên tiếng Anh. Hãy tạo 6 câu tiếng Anh ở trình độ ${config.level} về chủ đề "${config.topic}" để người học luyện phát âm.

Yêu cầu:
- Mỗi câu dài 5-15 từ
- Tăng dần độ khó
- Có từ vựng phổ biến trong chủ đề
- ${config.level === 'beginner' ? 'Dùng câu đơn giản, từ vựng cơ bản' : config.level === 'intermediate' ? 'Dùng câu phức hợp, từ vựng đa dạng' : 'Dùng idioms, phrasal verbs, từ vựng chuyên sâu'}

Trả về JSON array: [{"text": "câu tiếng Anh", "difficulty": "easy|medium|hard"}]
CHỈ TRẢ VỀ JSON, KHÔNG TEXT KHÁC.`;

    console.log('🗣️ [Speaking] Sinh câu practice cho:', config.topic);

    const response = await apiClient.post('/ai/generate-text', {
      prompt,
      systemPrompt: 'Bạn là AI tạo nội dung luyện phát âm tiếng Anh. Trả về JSON thuần túy.',
    });

    const sentences = parseSentences(response.data?.text || '');
    console.log(`✅ [Speaking] Đã sinh ${sentences.length} câu practice`);
    return sentences;
  },

  /**
   * Mục đích: Upload audio ghi âm → Whisper STT → text
   * Tham số đầu vào: audioUri (string) — đường dẫn file audio trên device
   * Tham số đầu ra: Promise<string> — text đã transcribe
   * Khi nào sử dụng: Sau khi user thả nút mic (PracticeScreen)
   *   PracticeScreen → onPressOut → transcribeAudio → evaluatePronunciation
   */
  transcribeAudio: async (audioUri: string): Promise<string> => {
    console.log('🗣️ [Speaking] Đang transcribe audio:', audioUri);

    // Đọc file audio thành base64 rồi tạo FormData
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);

    const response = await apiClient.post('/speaking/transcribe', formData, {
      headers: {'Content-Type': 'multipart/form-data'},
      timeout: 30000,
    });

    const text = response.data?.text || '';
    console.log('✅ [Speaking] Transcribe xong:', text.substring(0, 50));
    return text;
  },

  /**
   * Mục đích: Gửi text gốc + user transcript → AI chấm điểm chi tiết
   * Tham số đầu vào: originalText (string), userTranscript (string)
   * Tham số đầu ra: Promise<FeedbackResult>
   * Khi nào sử dụng: Sau transcribe, trước khi hiện FeedbackScreen
   *   PracticeScreen → transcribe xong → evaluatePronunciation → navigate Feedback
   */
  evaluatePronunciation: async (
    originalText: string,
    userTranscript: string,
  ): Promise<FeedbackResult> => {
    console.log('🗣️ [Speaking] Đánh giá phát âm...');
    console.log('  Mẫu:', originalText.substring(0, 40));
    console.log('  User:', userTranscript.substring(0, 40));

    const response = await apiClient.post('/ai/evaluate-pronunciation', {
      originalText,
      userTranscript,
    });

    const data = response.data;
    console.log('✅ [Speaking] Đánh giá xong, điểm:', data.overallScore);

    return {
      overallScore: data.overallScore ?? 0,
      fluency: data.fluency ?? data.overallScore ?? 0,
      pronunciation: data.pronunciation ?? data.overallScore ?? 0,
      pace: data.pace ?? data.overallScore ?? 0,
      wordByWord: (data.wordByWord ?? []).map((w: any) => ({
        word: w.word,
        score: w.score ?? 0,
        correct: w.correct ?? w.score >= 85,
        issue: w.issue,
      })),
      patterns: data.patterns ?? [],
      feedback: {
        wrongWords: data.feedback?.wrongWords ?? [],
        tips: data.feedback?.tips ?? [],
        encouragement: data.feedback?.encouragement ?? 'Tiếp tục luyện tập nhé!',
      },
    };
  },

  /**
   * Mục đích: Lấy audio phát âm mẫu từ AI TTS
   * Tham số đầu vào: text (string), provider ('openai'|'azure'), voiceId (string), speed (number)
   * Tham số đầu ra: Promise<string> — base64 audio
   * Khi nào sử dụng: User nhấn 🔊 trên PracticeScreen
   *   PracticeScreen → nút "Nghe mẫu" → playAISample → phát audio
   */
  playAISample: async (
    text: string,
    provider: 'openai' | 'azure' = 'openai',
    voiceId?: string,
    speed: number = 1.0,
  ): Promise<string> => {
    console.log('🗣️ [Speaking] Lấy audio mẫu cho:', text.substring(0, 30), '| provider:', provider);

    const response = await apiClient.post('/ai/text-to-speech', {
      text,
      provider,
      ...(voiceId && {voice: voiceId}),
      ...(speed !== 1.0 && {speed}),
    });

    console.log('✅ [Speaking] Nhận audio mẫu thành công');
    return response.data?.audio || '';
  },

  /**
   * Mục đích: Lấy thống kê speaking của user
   * Tham số đầu vào: không có
   * Tham số đầu ra: Promise<SpeakingStats>
   * Khi nào sử dụng: Hiển thị ở ConfigScreen hoặc Profile
   */
  getStats: async () => {
    console.log('🗣️ [Speaking] Lấy thống kê...');
    const response = await apiClient.get('/speaking/stats');
    return response.data?.stats ?? {
      totalSessions: 0,
      totalMinutes: 0,
      thisWeekSessions: 0,
      recentTopics: [],
    };
  },

  /**
   * Mục đích: Gửi tin nhắn user → AI Coach trả lời + sửa lỗi
   * Tham số đầu vào:
   *   - conversationHistory: {speaker, text}[] — lịch sử hội thoại
   *   - userInput: string — câu user vừa nói/gõ
   *   - topic: string — chủ đề hội thoại
   * Tham số đầu ra: Promise<CoachResponse> — AI response + grammar corrections
   * Khi nào sử dụng: CoachSessionScreen → user gửi tin → gọi API → nhận phản hồi
   */
  continueConversation: async (
    conversationHistory: {speaker: string; text: string}[],
    userInput: string,
    topic: string,
  ): Promise<{
    response: string;
    shouldEnd: boolean;
    corrections?: {original: string; correction: string; explanation: string}[];
  }> => {
    console.log('🗣️ [Coach] Gửi tin nhắn cho AI Coach...');
    console.log('  Input:', userInput.substring(0, 50));

    const response = await apiClient.post(
      '/conversation-generator/continue-conversation',
      {
        conversationHistory,
        userInput,
        topic,
      },
    );

    const data = response.data;
    console.log('✅ [Coach] AI trả lời:', data?.response?.substring(0, 50));

    return {
      response: data?.response || "That's interesting! Can you tell me more?",
      shouldEnd: data?.shouldEnd ?? false,
      corrections: data?.corrections ?? [],
    };
  },

  /**
   * Mục đích: Sinh audio TTS cho câu trả lời của AI Coach
   * Tham số đầu vào: text (string), provider ('openai'|'azure'), voiceId (string), speed (number)
   * Tham số đầu ra: Promise<string> — base64 audio hoặc audio URL
   * Khi nào sử dụng: Sau khi AI Coach trả lời → TTS → phát audio
   */
  generateCoachAudio: async (
    text: string,
    provider: 'openai' | 'azure' = 'openai',
    voiceId: string = 'en-US-JennyNeural',
    speed: number = 1.0,
  ): Promise<string> => {
    console.log('🗣️ [Coach] Sinh audio cho AI response... | provider:', provider);

    const response = await apiClient.post('/ai/generate-conversation-audio', {
      text,
      voice: voiceId,
      ...(provider && {provider}),
      ...(speed !== 1.0 && {speed}),
    });

    console.log('✅ [Coach] Audio sinh thành công');
    return response.data?.audio || response.data?.audioUrl || '';
  },

  /**
   * Mục đích: Gửi audio user → AI Clone & sửa phát âm → trả về bản corrected
   * Tham số đầu vào:
   *   - audioUri (string) — đường dẫn file audio user trên device
   *   - originalText (string) — câu gốc user đọc
   * Tham số đầu ra: Promise<{ correctedAudioUrl, improvements }>
   * Khi nào sử dụng: FeedbackScreen → sau khi có score → gọi để tạo AI corrected version
   */
  cloneAndCorrectVoice: async (
    audioUri: string,
    originalText: string,
  ): Promise<{
    correctedAudioUrl: string;
    improvements: {phoneme: string; before: string; after: string}[];
  }> => {
    console.log('🎭 [VoiceClone] Đang gửi audio để AI sửa...');

    try {
      // Gửi audio file lên server
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);
      formData.append('text', originalText);

      const response = await apiClient.post('/ai/clone-and-correct', formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });

      const data = response.data;
      console.log('✅ [VoiceClone] Nhận bản sửa thành công');

      return {
        correctedAudioUrl: data?.correctedAudioUrl || data?.audio || '',
        improvements: data?.improvements || [],
      };
    } catch (err) {
      console.error('❌ [VoiceClone] Lỗi clone voice:', err);
      // Fallback: dùng TTS bình thường nếu clone API chưa sẵn sàng
      const fallbackAudio = await apiClient.post('/ai/text-to-speech', {
        text: originalText,
        provider: 'openai',
      });
      return {
        correctedAudioUrl: fallbackAudio.data?.audio || '',
        improvements: [],
      };
    }
  },
};
