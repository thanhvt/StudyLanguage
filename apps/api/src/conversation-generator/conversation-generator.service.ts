/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';

/**
 * ConversationGeneratorService - Tích hợp Groq API với Llama 3.1
 *
 * Mục đích: Sinh hội thoại tiếng Anh cho việc học ngôn ngữ
 * Sử dụng Groq API với model Llama 3.1 (miễn phí, nhanh)
 * Khi nào sử dụng: Khi cần sinh kịch bản hội thoại để học tiếng Anh
 */
@Injectable()
export class ConversationGeneratorService {
  private readonly logger = new Logger(ConversationGeneratorService.name);
  private readonly groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  /**
   * Sinh hội thoại tiếng Anh theo chủ đề và thời lượng
   *
   * Mục đích: Tạo đoạn hội thoại tự nhiên để học tiếng Anh
   * Tham số đầu vào:
   *   - topic: Chủ đề hội thoại (vd: "ordering coffee", "job interview")
   *   - durationMinutes: Thời lượng hội thoại (5 | 10 | 15 phút)
   *   - level: Trình độ (beginner | intermediate | advanced)
   *   - includeVietnamese: Có thêm bản dịch tiếng Việt không
   * Tham số đầu ra: Object chứa script hội thoại
   * Luồng gọi: Controller -> Service -> Groq API -> Parse JSON
   *
   * Tính toán:
   *   - Tốc độ TTS: ~150 từ/phút
   *   - 5 phút = 750 từ = 10 lượt (mỗi lượt ~75 từ)
   *   - 10 phút = 1500 từ = 20 lượt (mỗi lượt ~75 từ)
   *   - 15 phút = 2250 từ = 30 lượt (mỗi lượt ~75 từ)
   */
  async generateConversation(options: {
    topic: string;
    durationMinutes?: number;
    level?: 'beginner' | 'intermediate' | 'advanced';
    numExchanges?: number;
    includeVietnamese?: boolean;
    keywords?: string;
  }): Promise<{
    script: {
      speaker: string;
      text: string;
      translation?: string;
      keyPhrases?: string[];
    }[];
    vocabulary: { word: string; meaning: string; example: string }[];
  }> {
    const {
      topic,
      durationMinutes = 5,
      level = 'intermediate',
      includeVietnamese = true,
      keywords,
    } = options;

    // Tính toán số lượt trao đổi dựa trên thời lượng
    // Mỗi người nói = durationMinutes lần → tổng = durationMinutes * 2
    const totalExchanges = options.numExchanges || durationMinutes * 2;
    const exchangesPerPerson = Math.ceil(totalExchanges / 2);
    const totalWords = durationMinutes * 150; // 150 từ/phút (tốc độ TTS)
    const maxTokens = Math.min(8000, totalWords * 4); // Buffer x4 vì có thêm translation + vocabulary

    this.logger.log(
      `Đang sinh hội thoại: "${topic}" - ${durationMinutes} phút - ${totalExchanges} lượt - Level: ${level}`,
    );

    const levelGuide = {
      beginner: 'Use simple vocabulary, short sentences, common phrases only.',
      intermediate:
        'Use everyday vocabulary, moderate sentence complexity, some idioms.',
      advanced:
        'Use sophisticated vocabulary, complex structures, idioms, and slang.',
    };

    const translationInstruction = includeVietnamese
      ? `- Include a "translation" field with Vietnamese translation for each turn`
      : `- Do NOT include "translation" field`;
    const keywordsInstruction = keywords
      ? `- Use the following keywords in the conversation: ${keywords}`
      : '';
    const prompt = `Generate a natural English conversation about "${topic}".

=== REQUIREMENTS ===
- Speakers: 2 (Person A and Person B)
- Target duration: ${durationMinutes} minutes (approximately ${totalWords} words total)
- Total exchanges: exactly ${totalExchanges} turns (Person A speaks ${exchangesPerPerson} times, Person B speaks ${exchangesPerPerson} times, alternating)
- Each turn: 3 to 4 sentences, approximately 60-80 words per turn
- Level: ${level.toUpperCase()} - ${levelGuide[level]}
- Tone: casual, everyday, natural
- DO NOT use one-word or one-sentence responses
- DO NOT write paragraph-length monologues either
- Each turn should feel like how real people talk: express a thought, add a detail, then ask or respond
- DO NOT repeat the same ideas or phrases across turns
- Include natural elements: opinions, questions, reactions, follow-ups
${translationInstruction}
${keywordsInstruction}
- Include 2-3 key phrases per turn that are useful to learn (in "keyPhrases" field)
- Include a "vocabulary" array with 5-8 useful words/phrases from the conversation

=== EXAMPLE OF GOOD TURN LENGTH ===
"I've been meaning to try this place for a while. A friend recommended their iced latte and said it was amazing. Do you come here often? I'm not sure what to order so I might need some help with the menu."

=== OUTPUT FORMAT ===
{
  "script": [
    {
      "speaker": "Person A",
      "text": "I've been meaning to try this place for a while...",
      "translation": "Tôi đã định thử quán này từ lâu rồi...",
      "keyPhrases": ["been meaning to - đã định làm gì đó", "for a while - từ lâu rồi"]
    }
  ],
  "vocabulary": [
    {
      "word": "grab a coffee",
      "meaning": "đi uống cà phê (cách nói informal)",
      "example": "Let's grab a coffee after work."
    }
  ]
}

RETURN ONLY VALID JSON, NO OTHER TEXT.`;

    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert English teacher creating conversations for Vietnamese learners. You always respond with valid JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: maxTokens,
      });

      const content = response.choices[0]?.message?.content || '';
      this.logger.log('Đã nhận response từ Groq API');

      // Parse JSON từ response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Không tìm thấy JSON trong response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Log thống kê để debug
      const scriptLength = parsed.script?.length || 0;
      const totalWordCount = parsed.script?.reduce(
        (sum: number, line: { text: string }) =>
          sum + line.text.split(/\s+/).length,
        0,
      ) || 0;
      this.logger.log(
        `Sinh hội thoại thành công: ${scriptLength} lượt, ${totalWordCount} từ / ${totalWords} mục tiêu, ${parsed.vocabulary?.length || 0} từ vựng`,
      );

      return parsed;
    } catch (error) {
      this.logger.error('Lỗi khi gọi Groq API:', error);
      throw error;
    }
  }

  /**
   * Sinh hội thoại theo kịch bản cụ thể (scenarios)
   *
   * Mục đích: Tạo hội thoại theo các tình huống phổ biến được định sẵn
   * Tham số đầu vào:
   *   - scenario: Loại kịch bản (restaurant, hotel, shopping, etc.)
   *   - customContext: Yêu cầu bổ sung (optional)
   * Tham số đầu ra: Hội thoại với scenario context
   * Luồng gọi: Controller chọn scenario -> Service generate
   */
  async generateScenarioConversation(
    scenario:
      | 'restaurant'
      | 'hotel'
      | 'shopping'
      | 'airport'
      | 'hospital'
      | 'job_interview'
      | 'phone_call'
      | 'small_talk',
    customContext?: string,
  ) {
    const scenarioPrompts: Record<string, { topic: string; context: string }> =
      {
        restaurant: {
          topic: 'Ordering food at a restaurant',
          context:
            'Customer ordering food, asking about menu, making special requests',
        },
        hotel: {
          topic: 'Checking into a hotel',
          context:
            'Guest checking in, asking about amenities, room service, checkout',
        },
        shopping: {
          topic: 'Shopping at a store',
          context:
            'Asking for prices, sizes, trying on clothes, making payment',
        },
        airport: {
          topic: 'At the airport',
          context:
            'Check-in, security, asking for directions, boarding announcements',
        },
        hospital: {
          topic: "At the doctor's office",
          context:
            'Describing symptoms, making appointments, understanding prescriptions',
        },
        job_interview: {
          topic: 'Job interview',
          context:
            'Answering common questions, discussing experience, salary negotiation',
        },
        phone_call: {
          topic: 'Making a phone call',
          context:
            'Calling customer service, making reservations, leaving messages',
        },
        small_talk: {
          topic: 'Casual small talk',
          context: 'Meeting someone new, discussing weather, hobbies, weekend plans',
        },
      };

    const selected = scenarioPrompts[scenario];
    const fullTopic = customContext
      ? `${selected.topic} - ${customContext}`
      : `${selected.topic} (${selected.context})`;

    return this.generateConversation({
      topic: fullTopic,
      durationMinutes: 5,
      level: 'intermediate',
    });
  }

  /**
   * Sinh hội thoại nâng cao với từ khóa và cấu trúc ngữ pháp cụ thể
   *
   * Mục đích: Luyện tập từ vựng và ngữ pháp cụ thể trong context hội thoại
   * Tham số đầu vào:
   *   - keywords: Danh sách từ vựng cần đưa vào hội thoại
   *   - grammarFocus: Cấu trúc ngữ pháp cần luyện (optional)
   *   - topic: Chủ đề hội thoại
   * Tham số đầu ra: Hội thoại có chứa keywords và grammar structures
   * Luồng gọi: User chọn vocabulary/grammar -> Generate conversation
   */
  async generatePracticeConversation(options: {
    keywords: string[];
    grammarFocus?: string;
    topic?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
  }) {
    const {
      keywords,
      grammarFocus,
      topic = 'daily life',
      level = 'intermediate',
    } = options;

    const keywordsStr = keywords.join(', ');
    const grammarInstruction = grammarFocus
      ? `Focus on this grammar structure: "${grammarFocus}". Use it multiple times naturally.`
      : '';

    const prompt = `
Generate a conversation about "${topic}" that includes these vocabulary words: ${keywordsStr}

${grammarInstruction}

Requirements:
- Use ALL the vocabulary words naturally in the conversation
- Level: ${level}
- 10-12 exchanges
- Include Vietnamese translations
- Highlight where each keyword is used

Return JSON format:
{
  "scenario": "Description",
  "script": [...],
  "vocabulary": [...],
  "grammarExamples": ["sentence using the grammar structure"]
}
`;

    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'You are an English teacher. Create conversations that teach specific vocabulary and grammar. Respond in valid JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      const content = response.choices[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Không tìm thấy JSON');

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error('Lỗi generate practice conversation:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra kết nối Groq API
   *
   * Mục đích: Health check để verify API key và connection
   * Tham số đầu vào: Không có
   * Tham số đầu ra: Object với status và thông tin model
   * Luồng gọi: Health check endpoint -> Service -> Groq API
   */
  async checkHealth(): Promise<{
    status: 'ok' | 'error';
    message: string;
    models?: string[];
  }> {
    try {
      // Thử gọi 1 request nhỏ để test connection
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: 'Say "OK"' }],
        max_tokens: 10,
      });

      if (response.choices[0]?.message?.content) {
        return {
          status: 'ok',
          message: 'Groq API đang hoạt động bình thường',
          models: [
            'llama-3.1-70b-versatile',
            'llama-3.1-8b-instant',
            'mixtral-8x7b-32768',
          ],
        };
      }

      return {
        status: 'error',
        message: 'Không nhận được response từ Groq',
      };
    } catch (error) {
      this.logger.error('Lỗi health check Groq:', error);
      return {
        status: 'error',
        message: `Không thể kết nối Groq: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // ============================================
  // CÁC METHODS MIGRATE TỪ OpenAI → Groq
  // ============================================

  /**
   * Sinh văn bản tổng quát bằng Groq
   *
   * Mục đích: Tạo nội dung bài đọc, câu hỏi, feedback
   * Tham số đầu vào:
   *   - prompt: Yêu cầu gửi đến LLM
   *   - systemPrompt: Context/vai trò cho AI (optional)
   * Tham số đầu ra: Văn bản được sinh ra (string)
   * Luồng gọi: Controller -> Service -> Groq API
   */
  async generateText(
    prompt: string,
    systemPrompt?: string,
  ): Promise<string> {
    this.logger.log('Đang gọi Groq để sinh văn bản...');

    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              systemPrompt ||
              'Bạn là trợ lý học tiếng Anh, giúp tạo nội dung học tập chất lượng cao.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.9,
        max_tokens: 4000,
      });

      const result = response.choices[0]?.message?.content || '';
      this.logger.log('Đã sinh văn bản thành công');
      return result;
    } catch (error) {
      this.logger.error('Lỗi khi gọi Groq generateText:', error);
      throw error;
    }
  }

  /**
   * Sinh hội thoại tương tác có chỗ trống cho user
   *
   * Mục đích: Tạo hội thoại với [YOUR_TURN] markers để user tham gia
   * Tham số đầu vào:
   *   - topic: Chủ đề hội thoại
   *   - contextDescription: Mô tả ngữ cảnh cuộc hội thoại (optional)
   * Tham số đầu ra: Script với isUserTurn markers + scenario
   * Luồng gọi: Listening InteractiveMode -> Controller -> Service -> Groq API
   */
  async generateInteractiveConversation(
    topic: string,
    contextDescription?: string,
  ): Promise<{
    script: { speaker: string; text: string; isUserTurn: boolean }[];
    scenario: string;
  }> {
    this.logger.log(`Đang sinh hội thoại tương tác về: ${topic}`);

    const contextInstr = contextDescription
      ? `Context: ${contextDescription}`
      : '';

    const prompt = `Create an interactive English conversation about "${topic}".
${contextInstr}

=== REQUIREMENTS ===
- 2 participants: AI Partner and YOU (the learner)
- Include 3-4 places where the learner participates (mark speaker = "YOU")
- For each YOU turn, suggest what to say in square brackets
- Make it natural, suitable for everyday communication
- Each AI Partner turn: 2-3 sentences, approximately 40-60 words
- Each YOU turn: Include a hint of what the learner should say

=== OUTPUT FORMAT ===
{
  "scenario": "Brief description of the situation in Vietnamese (VD: Bạn đang ở quầy check-in khách sạn)",
  "script": [
    { "speaker": "AI Partner", "text": "Hello! Welcome to our hotel. How can I help you?", "isUserTurn": false },
    { "speaker": "YOU", "text": "[Chào và nói bạn muốn đặt phòng]", "isUserTurn": true },
    { "speaker": "AI Partner", "text": "Sure! How many nights would you like to stay?", "isUserTurn": false }
  ]
}

RETURN ONLY VALID JSON, NO OTHER TEXT.`;

    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert English teacher creating interactive conversations for Vietnamese learners. You always respond with valid JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 4000,
      });

      const content = response.choices[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Không tìm thấy JSON');

      const parsed = JSON.parse(jsonMatch[0]);
      this.logger.log(
        `Sinh hội thoại tương tác thành công: ${parsed.script?.length || 0} lượt`,
      );
      return parsed;
    } catch (error) {
      this.logger.error('Lỗi generateInteractiveConversation:', error);
      throw error;
    }
  }

  /**
   * Tiếp tục hội thoại dựa trên input của user
   *
   * Mục đích: AI phản hồi tự nhiên + phát hiện lỗi ngữ pháp
   * Tham số đầu vào:
   *   - conversationHistory: Lịch sử hội thoại
   *   - userInput: Câu user vừa nói
   *   - topic: Chủ đề để giữ context
   * Tham số đầu ra: Câu phản hồi + corrections nếu có lỗi
   * Luồng gọi: Speaking/Listening InteractiveMode -> Controller -> Service -> Groq
   */
  async continueConversation(
    conversationHistory: { speaker: string; text: string }[],
    userInput: string,
    topic: string,
  ): Promise<{
    response: string;
    shouldEnd: boolean;
    corrections?: {
      original: string;
      correction: string;
      explanation: string;
    }[];
  }> {
    this.logger.log('Đang tiếp tục hội thoại...');

    const historyText = conversationHistory
      .map((line) => `${line.speaker}: ${line.text}`)
      .join('\n');

    const prompt = `You are in an English conversation about "${topic}".

History:
${historyText}

User just said: "${userInput}"

=== YOUR TASKS ===
1. Respond naturally with 1-2 sentences to continue the conversation
2. ANALYZE the user's sentence for grammar, vocabulary, or expression errors
3. If there are errors, list them in "corrections" array

=== ERROR DETECTION CRITERIA ===
- Tense errors: "I go yesterday" → "I went yesterday"
- Subject-verb agreement: "She don't" → "She doesn't"
- Wrong word usage for context
- Missing articles, prepositions, etc.

=== OUTPUT FORMAT ===
{
  "response": "Your natural response to continue the conversation",
  "shouldEnd": false,
  "corrections": [
    {
      "original": "I go to school yesterday",
      "correction": "I went to school yesterday",
      "explanation": "Use past tense 'went' for actions that happened in the past"
    }
  ]
}

If user's sentence has NO errors:
{
  "response": "Your response",
  "shouldEnd": false,
  "corrections": []
}

RETURN ONLY VALID JSON, NO OTHER TEXT.`;

    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'You are a friendly English speaking coach. Respond naturally and correct mistakes. Always respond with valid JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Không tìm thấy JSON');

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        response: parsed.response || content.trim(),
        shouldEnd: parsed.shouldEnd ?? false,
        corrections: parsed.corrections ?? [],
      };
    } catch (error) {
      this.logger.error('Lỗi continueConversation:', error);
      // Fallback nếu không parse được
      return { response: 'Could you please repeat that?', shouldEnd: false, corrections: [] };
    }
  }

  /**
   * Đánh giá phát âm của user - Word-by-word scoring
   *
   * Mục đích: So sánh transcript user vs mẫu, đưa ra feedback chi tiết
   * Tham số đầu vào:
   *   - originalText: Văn bản gốc (mẫu)
   *   - userTranscript: Văn bản user đọc (từ Whisper STT)
   * Tham số đầu ra: Đánh giá chi tiết với scores cho từng từ
   * Luồng gọi: Reading Feedback -> Controller -> Service -> Groq API
   */
  async evaluatePronunciation(
    originalText: string,
    userTranscript: string,
  ): Promise<{
    overallScore: number;
    fluency: number;
    pronunciation: number;
    pace: number;
    wordByWord: {
      word: string;
      correct: boolean;
      score: number;
      issue?: string;
    }[];
    patterns: string[];
    feedback: {
      wrongWords: { word: string; userSaid: string; suggestion: string }[];
      tips: string[];
      encouragement: string;
    };
  }> {
    this.logger.log('Đang đánh giá phát âm...');

    const prompt = `You are an expert English pronunciation evaluator. Analyze the user's reading in detail.

ORIGINAL TEXT (reference):
"${originalText}"

USER READ (Whisper transcript):
"${userTranscript}"

=== ANALYSIS REQUIREMENTS ===
1. Compare word by word: Score EVERY word in the original text
2. Detect patterns: Common pronunciation issues (e.g., /th/, /r/, /l/, final sounds)
3. Multi-dimensional scoring: Fluency, Pronunciation, Pace
4. Actionable tips: Specific improvement suggestions

=== OUTPUT FORMAT ===
{
  "overallScore": <0-100>,
  "fluency": <0-100>,
  "pronunciation": <0-100>,
  "pace": <0-100>,
  "wordByWord": [
    { "word": "hello", "correct": true, "score": 95 },
    { "word": "world", "correct": false, "score": 40, "issue": "pronounced as 'word'" }
  ],
  "patterns": [
    "Need to practice /th/ sound - currently pronouncing as /t/ or /d/",
    "Pay attention to -ed endings"
  ],
  "feedback": {
    "wrongWords": [
      { "word": "world", "userSaid": "word", "suggestion": "Curl tongue up for /r/ sound" }
    ],
    "tips": [
      "Read slower for clearer pronunciation",
      "Practice /θ/ by placing tongue between teeth"
    ],
    "encouragement": "Great job completing the reading! Keep practicing!"
  }
}

IMPORTANT:
- wordByWord MUST contain ALL words from original text
- Score: 90+ Excellent, 70-89 Good, 50-69 Fair, <50 Needs Work

RETURN ONLY VALID JSON, NO OTHER TEXT.`;

    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'You are a pronunciation evaluation expert. Analyze reading accuracy with detailed word-by-word scoring. Always respond with valid JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3, // Thấp hơn để đánh giá chính xác
        max_tokens: 4000,
      });

      const content = response.choices[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Không tìm thấy JSON');

      const parsed = JSON.parse(jsonMatch[0]);

      // Đảm bảo tất cả fields tồn tại với defaults
      return {
        overallScore: parsed.overallScore ?? 70,
        fluency: parsed.fluency ?? parsed.overallScore ?? 70,
        pronunciation: parsed.pronunciation ?? parsed.overallScore ?? 70,
        pace: parsed.pace ?? parsed.overallScore ?? 70,
        wordByWord: parsed.wordByWord ?? [],
        patterns: parsed.patterns ?? [],
        feedback: {
          wrongWords: parsed.feedback?.wrongWords ?? [],
          tips: parsed.feedback?.tips ?? [],
          encouragement:
            parsed.feedback?.encouragement ?? 'Tiếp tục luyện tập nhé!',
        },
      };
    } catch (error) {
      this.logger.error('Lỗi evaluatePronunciation:', error);
      throw new Error('Không thể đánh giá phát âm');
    }
  }
}
