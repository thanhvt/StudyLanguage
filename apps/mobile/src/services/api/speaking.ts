import {apiClient} from './client';
import type {TopicScenario} from '@/data/topic-data';

// =======================
// Types cho Speaking API
// =======================

/** Cấu hình sinh câu practice — topic lấy từ TopicPicker (reuse Listening) */
export interface SpeakingConfig {
  /** Kịch bản đã chọn từ TopicPicker (null nếu chưa chọn) */
  topic: TopicScenario | null;
  /** Trình độ: beginner / intermediate / advanced */
  level: 'beginner' | 'intermediate' | 'advanced';
}

/** Một câu practice */
export interface Sentence {
  /** ID duy nhất cho mỗi câu */
  id: string;
  /** Nội dung câu tiếng Anh */
  text: string;
  /** Phiên âm IPA */
  ipa: string;
  /** URL audio mẫu từ Azure TTS */
  audioUrl: string;
  /** Độ khó: easy / medium / hard */
  difficulty: 'easy' | 'medium' | 'hard';
}

/** Điểm cho từng từ */
export interface WordScore {
  /** Từ gốc */
  word: string;
  /** Điểm 0-100 */
  score: number;
  /** Phiên âm IPA của từ */
  phonemes: string;
  /** Các lỗi cụ thể */
  issues: string[];
}

/** Điểm cho từng phoneme (dùng cho heatmap) */
export interface PhonemeScore {
  /** Ký hiệu phoneme, ví dụ '/θ/' */
  phoneme: string;
  /** Độ chính xác 0-100 */
  accuracy: number;
  /** Tổng số lần user thử phát âm */
  totalAttempts: number;
}

/** Kết quả đánh giá phát âm từ AI */
export interface FeedbackResult {
  /** Điểm tổng 0-100 */
  overallScore: number;
  /** Xếp loại: A+, A, B+, B, C+, C, D, F */
  grade: string;
  /** Điểm trôi chảy 0-100 */
  fluency: number;
  /** Điểm phát âm 0-100 */
  pronunciation: number;
  /** Điểm tốc độ 0-100 */
  pace: number;
  /** Điểm từng từ */
  wordByWord: WordScore[];
  /** Bản đồ nhiệt phoneme — thanh gradient cho từng âm */
  phonemeHeatmap: PhonemeScore[];
  /** Patterns lỗi phát âm */
  patterns: string[];
  /** Feedback chi tiết */
  feedback: {
    wrongWords: {word: string; userSaid: string; suggestion: string}[];
    tips: string[];
    encouragement: string;
  };
  /** URL audio AI đã sửa phát âm (Voice Clone) */
  aiCorrectedAudioUrl: string | null;
}

// =======================
// Helpers
// =======================

/**
 * Mục đích: Tính grade từ điểm tổng (0-100)
 * Tham số đầu vào: score (number) — điểm 0-100
 * Tham số đầu ra: string — grade letter (A+, A, B+, B, C+, C, D, F)
 * Khi nào sử dụng: evaluatePronunciation → fallback khi API không trả grade
 */
export function calculateGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

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
        ? parsed.map((s: any, index: number) => ({
            id: s.id || `sentence-${index + 1}`,
            text: s.text || s.sentence || s,
            ipa: s.ipa || '',
            audioUrl: s.audioUrl || '',
            difficulty: s.difficulty || 'medium',
          }))
        : [];
    }
    // Fallback: split theo dòng
    return text
      .split('\n')
      .map(l => l.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, '').trim())
      .filter(l => l.length > 5)
      .map((l, i) => ({id: `sentence-${i + 1}`, text: l, ipa: '', audioUrl: '', difficulty: 'medium' as const}));
  } catch {
    console.error('❌ [Speaking] Lỗi parse sentences');
    return [{id: 'fallback-1', text: 'Hello, how are you today?', ipa: '/həˈloʊ haʊ ɑːr juː təˈdeɪ/', audioUrl: '', difficulty: 'easy'}];
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
   * Mục đích: Sinh danh sách câu practice theo topic (scenario) + level
   * Tham số đầu vào: config (SpeakingConfig) — topic scenario + level
   * Tham số đầu ra: Promise<Sentence[]>
   * Khi nào sử dụng: User nhấn "Bắt đầu luyện tập" sau khi chọn config
   *   PracticeConfigScreen → onPress → generateSentences → navigate PracticeSession
   */
  generateSentences: async (config: SpeakingConfig): Promise<Sentence[]> => {
    const topicName = config.topic?.name || 'General English';
    const topicDesc = config.topic?.description || '';
    const prompt = `Bạn là một giáo viên tiếng Anh. Hãy tạo 10 câu tiếng Anh ở trình độ ${config.level} về chủ đề "${topicName}" (${topicDesc}) để người học luyện phát âm.

Yêu cầu:
- Mỗi câu dài 5-15 từ (TỐI ĐA 20 từ — tránh câu quá dài gây tốn tài nguyên thiết bị)
- Tăng dần độ khó
- Có từ vựng phổ biến trong chủ đề
- ${config.level === 'beginner' ? 'Dùng câu đơn giản, từ vựng cơ bản A1-A2' : config.level === 'intermediate' ? 'Câu trung bình, B1-B2, có âm khó' : 'Câu phức tạp, C1-C2, connected speech, idioms'}
- Kèm phiên âm IPA cho mỗi câu

Trả về JSON array: [{"text": "câu tiếng Anh", "ipa": "/phiên âm IPA/", "difficulty": "easy|medium|hard"}]
CHỈ TRẢ VỀ JSON, KHÔNG TEXT KHÁC.`;

    console.log('🗣️ [Speaking] Sinh câu practice cho:', topicName);

    const response = await apiClient.post('/ai/generate-text', {
      prompt,
      systemPrompt: 'Bạn là AI tạo nội dung luyện phát âm tiếng Anh. Trả về JSON thuần túy, kèm IPA.',
    }, {timeout: 60000}); // 60s — API AI sinh text cần thời gian xử lý

    const sentences = parseSentences(response.data?.text || '');

    // Gap Fix: Lọc câu quá dài (>25 từ ≈ >30s khi đọc) để tránh OOM trên device yếu
    const MAX_WORDS_PER_SENTENCE = 25;
    const filtered = sentences.filter(s => {
      const wordCount = s.text.split(/\s+/).length;
      if (wordCount > MAX_WORDS_PER_SENTENCE) {
        console.warn(`⚠️ [Speaking] Bỏ câu quá dài (${wordCount} từ):`, s.text.substring(0, 40));
        return false;
      }
      return true;
    });

    console.log(`✅ [Speaking] Đã sinh ${filtered.length} câu practice (lọc ${sentences.length - filtered.length} câu quá dài)`);
    return filtered;
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
      grade: data.grade ?? calculateGrade(data.overallScore ?? 0),
      fluency: data.fluency ?? data.overallScore ?? 0,
      pronunciation: data.pronunciation ?? data.overallScore ?? 0,
      pace: data.pace ?? data.overallScore ?? 0,
      wordByWord: (data.wordByWord ?? []).map((w: any) => ({
        word: w.word,
        score: w.score ?? 0,
        phonemes: w.phonemes ?? '',
        issues: w.issues ?? (w.issue ? [w.issue] : []),
      })),
      phonemeHeatmap: (data.phonemeHeatmap ?? []).map((p: any) => ({
        phoneme: p.phoneme,
        accuracy: p.accuracy ?? 0,
        totalAttempts: p.totalAttempts ?? 1,
      })),
      patterns: data.patterns ?? [],
      feedback: {
        wrongWords: data.feedback?.wrongWords ?? [],
        tips: data.feedback?.tips ?? [],
        encouragement: data.feedback?.encouragement ?? 'Tiếp tục luyện tập nhé!',
      },
      aiCorrectedAudioUrl: data.aiCorrectedAudioUrl ?? null,
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
   * Mục đích: Gửi tin nhắn user → AI trả lời + sửa lỗi (Free Talk & Roleplay)
   * Tham số đầu vào:
   *   - conversationHistory: {speaker, text}[] — lịch sử hội thoại
   *   - userInput: string — câu user vừa nói/gõ
   *   - topic: string — chủ đề hội thoại
   *   - mode: 'free-talk' | 'roleplay' — loại conversation
   *   - persona?: ScenarioPersona — thông tin persona (Roleplay only)
   *   - difficulty?: string — độ khó (Roleplay only)
   *   - feedbackMode?: string — mức phản hồi
   * Tham số đầu ra: Promise<ConversationResponse>
   * Khi nào sử dụng: ConversationScreen → user gửi tin → gọi API → nhận phản hồi
   */
  continueConversation: async (
    conversationHistory: {speaker: string; text: string}[],
    userInput: string,
    topic: string,
    options?: {
      mode?: 'free-talk' | 'roleplay';
      persona?: {name: string; role: string; systemPrompt: string};
      difficulty?: 'easy' | 'medium' | 'hard';
      feedbackMode?: 'beginner' | 'intermediate' | 'advanced';
    },
  ): Promise<{
    response: string;
    shouldEnd: boolean;
    corrections?: {original: string; correction: string; explanation: string}[];
    suggestedResponses?: string[];
    pronunciationFeedback?: {word: string; ipa: string; tip: string};
  }> => {
    console.log('🗣️ [Conversation] Gửi tin nhắn cho AI...');
    console.log('  Mode:', options?.mode ?? 'free-talk');
    console.log('  Input:', userInput.substring(0, 50));

    const response = await apiClient.post(
      '/conversation-generator/continue-conversation',
      {
        conversationHistory,
        userInput,
        topic,
        mode: options?.mode ?? 'free-talk',
        ...(options?.persona && {persona: options.persona}),
        ...(options?.difficulty && {difficulty: options.difficulty}),
        ...(options?.feedbackMode && {feedbackMode: options.feedbackMode}),
      },
    );

    const data = response.data;
    console.log('✅ [Conversation] AI trả lời:', data?.response?.substring(0, 50));

    return {
      response: data?.response || "That's interesting! Can you tell me more?",
      shouldEnd: data?.shouldEnd ?? false,
      corrections: data?.corrections ?? [],
      suggestedResponses: data?.suggestedResponses ?? [],
      pronunciationFeedback: data?.pronunciationFeedback ?? null,
    };
  },

  /**
   * Mục đích: Sinh audio TTS cho câu trả lời của AI
   * Tham số đầu vào: text (string), provider ('openai'|'azure'), voiceId (string), speed (number)
   * Tham số đầu ra: Promise<string> — base64 audio hoặc audio URL
   * Khi nào sử dụng: Sau khi AI trả lời → TTS → phát audio
   */
  generateConversationAudio: async (
    text: string,
    provider: 'openai' | 'azure' = 'openai',
    voiceId: string = 'en-US-JennyNeural',
    speed: number = 1.0,
  ): Promise<string> => {
    console.log('🗣️ [Conversation] Sinh audio cho AI response... | provider:', provider);

    const response = await apiClient.post('/ai/generate-conversation-audio', {
      text,
      voice: voiceId,
      ...(provider && {provider}),
      ...(speed !== 1.0 && {speed}),
    });

    console.log('✅ [Conversation] Audio sinh thành công');
    return response.data?.audio || response.data?.audioUrl || '';
  },

  /**
   * Mục đích: Kiểm tra phát âm inline (realtime trong conversation)
   * Tham số đầu vào: userAudioUri (string), userTranscript (string)
   * Tham số đầu ra: Promise<PronunciationInlineResult | null>
   * Khi nào sử dụng: ConversationScreen → sau khi user nói → check phát âm inline
   */
  evaluatePronunciationInline: async (
    userTranscript: string,
  ): Promise<{word: string; ipa: string; tip: string} | null> => {
    console.log('🗣️ [Conversation] Kiểm tra phát âm inline...');

    try {
      const response = await apiClient.post('/speaking/evaluate-pronunciation-inline', {
        userTranscript,
      });

      const data = response.data;
      if (data?.hasPronunciationIssue) {
        console.log('⚠️ [Conversation] Phát hiện lỗi phát âm:', data.word);
        return {
          word: data.word,
          ipa: data.ipa,
          tip: data.tip,
        };
      }
      console.log('✅ [Conversation] Phát âm OK');
      return null;
    } catch (err) {
      console.error('❌ [Conversation] Lỗi kiểm tra phát âm:', err);
      return null;
    }
  },

  /**
   * Mục đích: Kiểm tra ngữ pháp inline (realtime trong conversation)
   * Tham số đầu vào: userText (string)
   * Tham số đầu ra: Promise<GrammarInlineResult[]>
   * Khi nào sử dụng: ConversationScreen → sau khi transcribe → check grammar
   */
  checkGrammarInline: async (
    userText: string,
  ): Promise<{original: string; correction: string; explanation: string}[]> => {
    console.log('🗣️ [Conversation] Kiểm tra ngữ pháp inline...');

    try {
      const response = await apiClient.post('/speaking/check-grammar-inline', {
        userText,
      });

      const data = response.data;
      const corrections = data?.corrections ?? [];
      if (corrections.length > 0) {
        console.log(`⚠️ [Conversation] Phát hiện ${corrections.length} lỗi ngữ pháp`);
      } else {
        console.log('✅ [Conversation] Ngữ pháp OK');
      }
      return corrections;
    } catch (err) {
      console.error('❌ [Conversation] Lỗi kiểm tra ngữ pháp:', err);
      return [];
    }
  },

  /**
   * Mục đích: Sinh tổng kết session (AI Feedback + stats)
   * Tham số đầu vào:
   *   - messages: {role, text}[] — toàn bộ hội thoại
   *   - mode: 'free-talk' | 'roleplay'
   *   - totalTime: number — tổng thời gian session (seconds)
   * Tham số đầu ra: Promise<SessionSummaryData>
   * Khi nào sử dụng: ConversationScreen → kết thúc → gọi để sinh summary
   */
  generateSessionSummary: async (
    messages: {role: string; text: string}[],
    mode: 'free-talk' | 'roleplay',
    totalTime: number,
  ): Promise<{
    overallScore: number;
    grade: string;
    pronunciationIssues: {word: string; accuracy: number; ipa: string}[];
    grammarFixes: {original: string; correction: string}[];
    aiFeedback: string;
  }> => {
    console.log('🗣️ [Conversation] Sinh tổng kết session...');

    try {
      const response = await apiClient.post('/speaking/generate-summary', {
        messages,
        mode,
        totalTime,
      });

      const data = response.data;
      console.log('✅ [Conversation] Tổng kết:', data?.overallScore);

      return {
        overallScore: data?.overallScore ?? 70,
        grade: data?.grade ?? 'B',
        pronunciationIssues: data?.pronunciationIssues ?? [],
        grammarFixes: data?.grammarFixes ?? [],
        aiFeedback: data?.aiFeedback ?? 'Bạn đã làm tốt! Hãy tiếp tục luyện tập nhé!',
      };
    } catch (err) {
      console.error('❌ [Conversation] Lỗi sinh tổng kết:', err);
      return {
        overallScore: 0,
        grade: 'N/A',
        pronunciationIssues: [],
        grammarFixes: [],
        aiFeedback: 'Không thể tạo tổng kết. Vui lòng thử lại.',
      };
    }
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

  // ============================================
  // CROSS-CUTTING FEATURE APIs (C2-C4)
  // ============================================

  /**
   * Mục đích: Lấy cài đặt TTS từ server
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<TtsSettingsResponse>
   * Khi nào sử dụng: SpeakingTtsSheet mount → load saved settings
   */
  getTtsSettings: async () => {
    console.log('⚙️ [TTS] Lấy cài đặt TTS...');
    try {
      const response = await apiClient.get('/speaking/tts-settings');
      console.log('✅ [TTS] Lấy cài đặt thành công');
      return response.data?.ttsSettings ?? null;
    } catch (err) {
      console.error('❌ [TTS] Lỗi lấy cài đặt:', err);
      return null;
    }
  },

  /**
   * Mục đích: Lưu cài đặt TTS lên server
   * Tham số đầu vào: settings (Partial TTS config)
   * Tham số đầu ra: Promise<boolean>
   * Khi nào sử dụng: SpeakingTtsSheet → nhấn "Lưu cài đặt"
   */
  updateTtsSettings: async (settings: {
    voiceId?: string;
    speed?: number;
    emotion?: string;
    autoEmotion?: boolean;
    pitch?: number;
    randomVoice?: boolean;
  }): Promise<boolean> => {
    console.log('⚙️ [TTS] Lưu cài đặt TTS...');
    try {
      await apiClient.put('/speaking/tts-settings', settings);
      console.log('✅ [TTS] Lưu cài đặt thành công');
      return true;
    } catch (err) {
      console.error('❌ [TTS] Lỗi lưu cài đặt:', err);
      return false;
    }
  },

  /**
   * Mục đích: Lấy daily speaking goal
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<DailyGoalData>
   * Khi nào sử dụng: ProgressDashboardScreen mount → hiển thị Daily Goal Card
   */
  getDailyGoal: async () => {
    console.log('🎯 [Gamification] Lấy daily goal...');
    try {
      const response = await apiClient.get('/speaking/daily-goal');
      return response.data?.dailyGoal ?? {target: 10, completed: 0, streak: 0, isCompleted: false, progress: 0};
    } catch (err) {
      console.error('❌ [Gamification] Lỗi lấy daily goal:', err);
      return {target: 10, completed: 0, streak: 0, isCompleted: false, progress: 0};
    }
  },

  /**
   * Mục đích: Cập nhật mục tiêu hàng ngày
   * Tham số đầu vào: target (number) — 1-100
   * Tham số đầu ra: Promise<boolean>
   * Khi nào sử dụng: ProgressDashboardScreen → edit dialog → save
   */
  updateDailyGoal: async (target: number): Promise<boolean> => {
    console.log('🎯 [Gamification] Cập nhật daily goal:', target);
    try {
      await apiClient.put('/speaking/daily-goal', {target});
      console.log('✅ [Gamification] Cập nhật thành công');
      return true;
    } catch (err) {
      console.error('❌ [Gamification] Lỗi cập nhật:', err);
      return false;
    }
  },

  /**
   * Mục đích: Lấy progress data (radar, calendar, weak sounds, weekly report)
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<ProgressData>
   * Khi nào sử dụng: ProgressDashboardScreen mount → load all progress data
   */
  getProgress: async () => {
    console.log('📈 [Dashboard] Lấy progress data...');
    try {
      const response = await apiClient.get('/speaking/progress');
      return response.data?.progress ?? null;
    } catch (err) {
      console.error('❌ [Dashboard] Lỗi lấy progress:', err);
      return null;
    }
  },

  /**
   * Mục đích: Lấy danh sách badges
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<BadgesData>
   * Khi nào sử dụng: ProgressDashboardScreen → Badge Grid section
   */
  getBadges: async () => {
    console.log('🏅 [Gamification] Lấy badges...');
    try {
      const response = await apiClient.get('/speaking/badges');
      return response.data ?? {badges: [], totalUnlocked: 0, totalBadges: 0, currentStreak: 0};
    } catch (err) {
      console.error('❌ [Gamification] Lỗi lấy badges:', err);
      return {badges: [], totalUnlocked: 0, totalBadges: 0, currentStreak: 0};
    }
  },

  /**
   * Mục đích: Lấy lịch sử ghi âm speaking
   * Tham số đầu vào: mode (filter), page, limit
   * Tham số đầu ra: Promise<RecordingHistoryResponse>
   * Khi nào sử dụng: RecordingHistoryScreen mount → load danh sách recordings
   */
  getRecordingHistory: async (mode?: string, page: number = 1, limit: number = 20) => {
    console.log('📂 [History] Lấy lịch sử ghi âm... mode:', mode, 'page:', page);
    try {
      const params: Record<string, string> = {page: String(page), limit: String(limit)};
      if (mode && mode !== 'all') params.mode = mode;
      const response = await apiClient.get('/speaking/recording-history', {params});
      return response.data ?? {entries: [], totalCount: 0, hasMore: false};
    } catch (err) {
      console.error('❌ [History] Lỗi lấy lịch sử:', err);
      return {entries: [], totalCount: 0, hasMore: false};
    }
  },

  // ============================================
  // SHADOWING MODE APIs
  // ============================================

  /**
   * Mục đích: Sinh danh sách câu cho Shadowing Mode theo topic + level
   * Tham số đầu vào: config { topicName, topicDesc, level, count }
   * Tham số đầu ra: Promise<ShadowingSentenceRaw[]>
   * Khi nào sử dụng: ShadowingConfigScreen → nhấn "Bắt đầu Shadowing" → generate câu
   */
  generateShadowingSentences: async (config: {
    topicName: string;
    topicDesc: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    count: number;
  }): Promise<Sentence[]> => {
    console.log('🔊 [Shadowing] Sinh câu shadowing cho:', config.topicName);

    const prompt = `Bạn là giáo viên tiếng Anh chuyên về luyện nói (Shadowing). Hãy tạo ${config.count} câu tiếng Anh ở trình độ ${config.level} về chủ đề "${config.topicName}" (${config.topicDesc}) để người học luyện shadowing.

Yêu cầu cho Shadowing:
- Mỗi câu dài 8-20 từ (đủ dài để luyện rhythm)
- Có connected speech, linking sounds
- Tăng dần độ khó về tốc độ và phức tạp
- ${config.level === 'beginner' ? 'Câu đơn giản A1-A2, nhịp chậm, ít linked sounds' : config.level === 'intermediate' ? 'Câu B1-B2, nhiều linked sounds, stress patterns rõ ràng' : 'Câu C1-C2, connected speech, weak forms, fast rhythm'}
- Kèm phiên âm IPA đầy đủ cho mỗi câu

Trả về JSON array: [{"text": "câu tiếng Anh", "ipa": "/phiên âm IPA/", "difficulty": "easy|medium|hard"}]
CHỈ TRẢ VỀ JSON, KHÔNG TEXT KHÁC.`;

    const response = await apiClient.post('/ai/generate-text', {
      prompt,
      systemPrompt: 'Bạn là AI tạo nội dung luyện Shadowing. Tập trung vào rhythm, intonation, connected speech. Trả về JSON thuần túy.',
    }, {timeout: 60000}); // 60s — API AI sinh text cần thời gian xử lý

    const sentences = parseSentences(response.data?.text || '');

    // Gap Fix: Lọc câu quá dài (>30 từ ≈ >30s) — Shadowing cần câu vừa phải để luyện rhythm
    const MAX_SHADOWING_WORDS = 30;
    const filtered = sentences.filter(s => {
      const wordCount = s.text.split(/\s+/).length;
      if (wordCount > MAX_SHADOWING_WORDS) {
        console.warn(`⚠️ [Shadowing] Bỏ câu quá dài (${wordCount} từ):`, s.text.substring(0, 40));
        return false;
      }
      return true;
    });

    console.log(`✅ [Shadowing] Đã sinh ${filtered.length} câu shadowing (lọc ${sentences.length - filtered.length} câu quá dài)`);
    return filtered;
  },

  /**
   * Mục đích: Combo endpoint: upload audio user → transcribe (Groq Whisper) → evaluate shadowing
   * Tham số đầu vào: audioUri, originalText, speed, delayMs (optional, future-proofing)
   * Tham số đầu ra: Promise<ShadowingEvalResult> — rhythm, intonation, accuracy, tips
   * Khi nào sử dụng: ShadowingSessionScreen → Phase 2 kết thúc → gửi audio → nhận score
   *   Flow: auto-stop recording → evaluateShadowingWithAudio → navigate FeedbackScreen
   * Lưu ý:
   *   - delayMs hiện tại chỉ là metadata (server dùng text-based scoring)
   *   - Khi Phase 2 (real-time pitch comparison), server sẽ dùng delayMs để align audio
   */
  evaluateShadowingWithAudio: async (
    audioUri: string,
    originalText: string,
    speed: number = 1.0,
    delayMs: number = 0,
  ): Promise<{
    rhythm: number;
    intonation: number;
    accuracy: number;
    overall: number;
    tips: string[];
    wordIssues: {word: string; score: number; issue?: string; ipa?: string}[];
    transcript: string;
  }> => {
    console.log('🔊 [Shadowing] Đánh giá shadowing...');
    console.log('  Câu mẫu:', originalText.substring(0, 40));
    console.log('  Tốc độ:', speed, '| Delay:', delayMs, 'ms');

    try {
      // Dùng combo endpoint transcribe-and-evaluate
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);
      formData.append('originalText', originalText);
      formData.append('speed', String(speed));
      // Future-proofing: gửi delayMs metadata cho Phase 2 audio alignment
      formData.append('delayMs', String(delayMs));

      const response = await apiClient.post(
        '/speaking/transcribe-and-evaluate',
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
          timeout: 30000,
        },
      );

      const data = response.data;
      console.log('✅ [Shadowing] Đánh giá xong:', data?.overall ?? data?.overallScore);

      return {
        rhythm: data?.rhythm ?? data?.pace ?? 70,
        intonation: data?.intonation ?? data?.fluency ?? 70,
        accuracy: data?.accuracy ?? data?.pronunciation ?? 70,
        overall: data?.overall ?? data?.overallScore ?? 70,
        tips: data?.tips ?? data?.feedback?.tips ?? [],
        wordIssues: (data?.wordIssues ?? data?.wordByWord ?? []).map((w: any) => ({
          word: w.word,
          score: w.score ?? 0,
          issue: w.issue ?? w.issues?.[0],
          ipa: w.ipa ?? w.phonemes,
        })),
        transcript: data?.transcript ?? data?.text ?? '',
      };
    } catch (err) {
      console.error('❌ [Shadowing] Lỗi đánh giá:', err);
      throw err;
    }
  },

  /**
   * Mục đích: TTS cho shadowing câu mẫu (có speed control)
   * Tham số đầu vào: text, speed (0.5-1.5)
   * Tham số đầu ra: Promise<string> — base64 audio
   * Khi nào sử dụng: ShadowingSessionScreen → Phase 1 (Preview) → phát câu mẫu
   */
  generateShadowingTTS: async (
    text: string,
    speed: number = 1.0,
  ): Promise<string> => {
    console.log('🔊 [Shadowing] Sinh TTS cho:', text.substring(0, 30), '| speed:', speed);

    const response = await apiClient.post('/ai/text-to-speech', {
      text,
      provider: 'azure',
      speed,
    });

    console.log('✅ [Shadowing] TTS thành công');
    return response.data?.audio || '';
  },

  // ============================================
  // TONGUE TWISTER APIs
  // ============================================

  /**
   * Mục đích: Lấy danh sách tongue twisters theo phoneme category + level
   * Tham số đầu vào: category (PhonemeCategory), level (TwisterLevel)
   * Tham số đầu ra: Promise<TongueTwister[]>
   * Khi nào sử dụng: TongueTwisterSelectScreen → nhấn "Bắt đầu" → fetch twisters
   */
  getTongueTwisters: async (
    category: string,
    level: string,
  ): Promise<any[]> => {
    console.log(`👅 [TongueTwister] Lấy twisters: ${category} / ${level}`);

    try {
      const response = await apiClient.get('/speaking/tongue-twisters', {
        params: {category, level},
      });

      const twisters = response.data?.twisters ?? response.data ?? [];
      console.log(`✅ [TongueTwister] Nhận ${twisters.length} twisters`);
      return twisters;
    } catch (err) {
      console.error('❌ [TongueTwister] Lỗi lấy twisters, dùng fallback:', err);

      // Fallback: sinh bằng AI nếu backend chưa có data
      const phonemeMap: Record<string, {pair: string; examples: string}> = {
        th_sounds: {pair: '/θ/ vs /ð/', examples: 'think, this, that, thirty'},
        sh_s: {pair: '/ʃ/ vs /s/', examples: 'she, sells, seashells, sure'},
        r_l: {pair: '/r/ vs /l/', examples: 'right, light, really, lily'},
        v_w: {pair: '/v/ vs /w/', examples: 'vine, wine, very, well'},
        ae_e: {pair: '/æ/ vs /ɛ/', examples: 'bat, bet, cat, het'},
        ee_i: {pair: '/iː/ vs /ɪ/', examples: 'sheep, ship, feet, fit'},
      };

      const info = phonemeMap[category] || {pair: category, examples: ''};
      const prompt = `Tạo 5 tongue twisters tiếng Anh ở mức ${level} tập trung vào cặp âm ${info.pair}.

Yêu cầu:
- Mỗi câu 6-15 từ
- Chứa nhiều từ có âm ${info.pair} (ví dụ: ${info.examples})
- ${level === 'easy' ? 'Câu đơn giản, lặp lại' : level === 'medium' ? 'Câu trung bình, cấu trúc phức tạp hơn' : level === 'hard' ? 'Câu khó, tốc độ nhanh' : 'Câu cực khó, kết hợp nhiều âm'}
- Kèm IPA transcription

Trả về JSON: [{"id":"1","text":"câu","ipa":"/ipa/","targetPhonemes":["/θ/","/ð/"],"highlightWords":["word1","word2"],"difficulty":"${level}"}]
CHỈ JSON.`;

      const aiResponse = await apiClient.post('/ai/generate-text', {
        prompt,
        systemPrompt: 'Bạn tạo tongue twisters cho luyện phát âm. Trả JSON thuần túy.',
      });

      try {
        const text = aiResponse.data?.text || '';
        const clean = text.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
        const jsonMatch = clean.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return Array.isArray(parsed) ? parsed.map((t: any, i: number) => ({
            id: t.id || `tt-${i + 1}`,
            text: t.text || '',
            ipa: t.ipa || '',
            targetPhonemes: t.targetPhonemes || [],
            highlightWords: t.highlightWords || [],
            difficulty: t.difficulty || level,
          })) : [];
        }
      } catch {
        console.error('❌ [TongueTwister] Lỗi parse AI response');
      }

      // Ultimate fallback
      return [
        {id: 'fb-1', text: 'She sells seashells by the seashore.', ipa: '/ʃi sɛlz siʃɛlz baɪ ðə siʃɔr/', targetPhonemes: ['/ʃ/', '/s/'], highlightWords: ['She', 'sells', 'seashells', 'seashore'], difficulty: level},
      ];
    }
  },

  /**
   * Mục đích: Lấy level progress cho 1 phoneme category
   * Tham số đầu vào: category (string)
   * Tham số đầu ra: Promise<CategoryLevelProgress | null>
   * Khi nào sử dụng: TongueTwisterSelectScreen → mount → check unlock status
   */
  getLevelProgress: async (category: string) => {
    console.log(`👅 [TongueTwister] Lấy level progress: ${category}`);
    try {
      const response = await apiClient.get('/speaking/level-progress', {
        params: {category},
      });
      return response.data?.levels ?? null;
    } catch (err) {
      console.error('❌ [TongueTwister] Lỗi lấy level progress:', err);
      return null;
    }
  },

  /**
   * Mục đích: Cập nhật level progress sau khi hoàn thành practice
   * Tham số đầu vào: category, level, score
   * Tham số đầu ra: Promise<string[] | null> — danh sách levels mới unlock
   * Khi nào sử dụng: TongueTwisterPracticeScreen → user đạt score → cập nhật progress
   */
  updateLevelProgress: async (category: string, level: string, score: number) => {
    console.log(`👅 [TongueTwister] Cập nhật progress: ${category}/${level} = ${score}`);
    try {
      const response = await apiClient.put('/speaking/level-progress', {
        category,
        level,
        score,
      });
      return response.data?.unlocked ?? null;
    } catch (err) {
      console.error('❌ [TongueTwister] Lỗi cập nhật progress:', err);
      return null;
    }
  },

  // ============================================
  // TONGUE TWISTER — LEADERBOARD & BADGES APIs
  // ============================================

  /**
   * Mục đích: Lấy bảng xếp hạng Speed Challenge cho 1 phoneme category
   * Tham số đầu vào: category (string) — phoneme category key
   * Tham số đầu ra: Promise<LeaderboardEntry[]>
   * Khi nào sử dụng: SpeedChallengeScreen → nhấn "🏆 Leaderboard" → hiện danh sách
   */
  getLeaderboard: async (category: string): Promise<{
    entries: {rank: number; userId: string; displayName: string; avatar: string; wpm: number; accuracy: number; createdAt: string}[];
    userRank: number | null;
    totalEntries: number;
  }> => {
    console.log(`🏆 [Leaderboard] Lấy bảng xếp hạng: ${category}`);
    try {
      const response = await apiClient.get('/speaking/leaderboard', {
        params: {category, limit: 20},
      });
      return response.data ?? {entries: [], userRank: null, totalEntries: 0};
    } catch (err) {
      console.error('❌ [Leaderboard] Lỗi lấy leaderboard:', err);
      return {entries: [], userRank: null, totalEntries: 0};
    }
  },

  /**
   * Mục đích: Gửi score Speed Challenge lên leaderboard
   * Tham số đầu vào: data { category, wpm, accuracy, twisterId }
   * Tham số đầu ra: Promise<{rank, isNewRecord, badgesEarned}>
   * Khi nào sử dụng: SpeedChallengeScreen → kết thúc → submit score
   */
  submitLeaderboardScore: async (data: {
    category: string;
    wpm: number;
    accuracy: number;
    twisterId: string;
  }): Promise<{
    rank: number;
    isNewRecord: boolean;
    badgesEarned: {id: string; name: string; icon: string}[];
  }> => {
    console.log(`🏆 [Leaderboard] Gửi score: WPM=${data.wpm}, Accuracy=${data.accuracy}`);
    try {
      const response = await apiClient.post('/speaking/leaderboard', data);
      const result = response.data ?? {};
      console.log(`✅ [Leaderboard] Rank: #${result.rank}, New Record: ${result.isNewRecord}`);
      return {
        rank: result.rank ?? 0,
        isNewRecord: result.isNewRecord ?? false,
        badgesEarned: result.badgesEarned ?? [],
      };
    } catch (err) {
      console.error('❌ [Leaderboard] Lỗi gửi score:', err);
      return {rank: 0, isNewRecord: false, badgesEarned: []};
    }
  },

  /**
   * Mục đích: Lấy danh sách badges Tongue Twister của user
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<TongueTwisterBadgeData>
   * Khi nào sử dụng: SpeedChallengeScreen → badge grid section
   */
  getTongueTwisterBadges: async (): Promise<{
    badges: {id: string; name: string; icon: string; description: string; isUnlocked: boolean; unlockedAt: string | null; requirement: string}[];
    totalUnlocked: number;
    totalBadges: number;
  }> => {
    console.log('🏅 [Badges] Lấy badges Tongue Twister...');
    try {
      const response = await apiClient.get('/speaking/tongue-twister-badges');
      return response.data ?? {badges: [], totalUnlocked: 0, totalBadges: 0};
    } catch (err) {
      console.error('❌ [Badges] Lỗi lấy badges:', err);
      // Fallback: danh sách badges mặc định
      return {
        badges: [
          {id: 'speed-100', name: 'Tốc độ 100', icon: '⚡', description: 'Đạt 100 WPM', isUnlocked: false, unlockedAt: null, requirement: '100 WPM'},
          {id: 'speed-150', name: 'Tốc độ Âm thanh', icon: '🚀', description: 'Đạt 150 WPM', isUnlocked: false, unlockedAt: null, requirement: '150 WPM'},
          {id: 'perfect-score', name: 'Hoàn hảo', icon: '💎', description: 'Điểm phát âm 100%', isUnlocked: false, unlockedAt: null, requirement: '100% accuracy'},
          {id: 'streak-7', name: 'Kiên trì 7 ngày', icon: '🔥', description: 'Luyện 7 ngày liên tiếp', isUnlocked: false, unlockedAt: null, requirement: '7-day streak'},
          {id: 'all-phonemes', name: 'Master Phát âm', icon: '👑', description: 'Hoàn thành tất cả phoneme', isUnlocked: false, unlockedAt: null, requirement: 'All categories'},
        ],
        totalUnlocked: 0,
        totalBadges: 5,
      };
    }
  },
};

