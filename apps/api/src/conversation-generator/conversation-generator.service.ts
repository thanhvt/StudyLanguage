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
   * Sinh hội thoại tiếng Anh theo chủ đề và trình độ
   *
   * Mục đích: Tạo đoạn hội thoại tự nhiên để học tiếng Anh
   * Tham số đầu vào:
   *   - topic: Chủ đề hội thoại (vd: "ordering coffee", "job interview")
   *   - level: Trình độ (beginner | intermediate | advanced)
   *   - numExchanges: Số lượt trao đổi (mặc định 8-12)
   *   - includeVietnamese: Có thêm bản dịch tiếng Việt không
   * Tham số đầu ra: Object chứa script hội thoại với translations
   * Luồng gọi: Controller -> Service -> Groq API -> Parse JSON
   */
  async generateConversation(options: {
    topic: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
    numExchanges?: number;
    includeVietnamese?: boolean;
    speakers?: { name: string; description: string }[];
  }): Promise<{
    scenario: string;
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
      level = 'intermediate',
      numExchanges = 10,
      includeVietnamese = true,
      speakers = [
        { name: 'Alex', description: 'native English speaker' },
        { name: 'Minh', description: 'Vietnamese learning English' },
      ],
    } = options;

    this.logger.log(
      `Đang sinh hội thoại về "${topic}" - Level: ${level} - Exchanges: ${numExchanges}`,
    );

    const speakersInfo = speakers
      .map((s) => `- ${s.name} (${s.description})`)
      .join('\n');

    const translationInstruction = includeVietnamese
      ? `Include Vietnamese translation for each line in the "translation" field.`
      : `Do not include translations.`;

    const levelGuide = {
      beginner: 'Use simple vocabulary, short sentences, common phrases only.',
      intermediate:
        'Use everyday vocabulary, moderate sentence complexity, some idioms.',
      advanced:
        'Use sophisticated vocabulary, complex structures, idioms, and slang.',
    };

    const prompt = `
Generate a natural English conversation about "${topic}".

=== SPEAKERS ===
${speakersInfo}

=== REQUIREMENTS ===
- Level: ${level.toUpperCase()} - ${levelGuide[level]}
- Number of exchanges: ${numExchanges}
- Make it natural, realistic, and useful for language learning
- Include common expressions and phrases used in real life
- ${translationInstruction}
- Highlight 2-3 key phrases per exchange that are useful to learn

=== OUTPUT FORMAT (JSON ONLY) ===
{
  "scenario": "Brief description of the situation (in Vietnamese)",
  "script": [
    {
      "speaker": "Alex",
      "text": "Hey! Would you like to grab a coffee?",
      "translation": "Này! Bạn có muốn đi uống cà phê không?",
      "keyPhrases": ["grab a coffee - đi uống cà phê"]
    },
    {
      "speaker": "Minh", 
      "text": "Sure, that sounds great! Do you know any good places nearby?",
      "translation": "Chắc chắn rồi, nghe tuyệt đấy! Bạn có biết quán nào ngon gần đây không?",
      "keyPhrases": ["sounds great - nghe tuyệt", "nearby - gần đây"]
    }
  ],
  "vocabulary": [
    {
      "word": "grab",
      "meaning": "lấy nhanh, đi lấy (cách nói informal)",
      "example": "Let's grab lunch together."
    }
  ]
}

RETURN ONLY VALID JSON, NO OTHER TEXT.
`;

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
        max_tokens: 4000,
      });

      const content = response.choices[0]?.message?.content || '';
      this.logger.log('Đã nhận response từ Groq API');

      // Parse JSON từ response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Không tìm thấy JSON trong response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      this.logger.log(
        `Sinh hội thoại thành công: ${parsed.script?.length || 0} lượt thoại`,
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
      level: 'intermediate',
      numExchanges: 12,
      includeVietnamese: true,
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
}
