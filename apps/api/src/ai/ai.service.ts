import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

/**
 * AI Service - Tích hợp OpenAI APIs
 *
 * Mục đích: Cung cấp các phương thức gọi OpenAI (GPT, Whisper, TTS)
 * Khi nào sử dụng: Được inject vào các controller/service cần AI
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Sinh văn bản bằng GPT
   *
   * Mục đích: Tạo nội dung hội thoại, bài đọc, câu hỏi, feedback
   * Tham số:
   *   - prompt: Yêu cầu gửi đến GPT
   *   - systemPrompt: Context/vai trò cho AI (optional)
   * Trả về: Văn bản được sinh ra
   */
  async generateText(
    prompt: string,
    systemPrompt?: string,
  ): Promise<string> {
    this.logger.log('Đang gọi GPT để sinh văn bản...');

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              systemPrompt ||
              'Bạn là trợ lý học tiếng Anh, giúp tạo nội dung học tập chất lượng cao.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const result = response.choices[0]?.message?.content || '';
      this.logger.log('Đã sinh văn bản thành công');
      return result;
    } catch (error) {
      this.logger.error('Lỗi khi gọi GPT:', error);
      throw error;
    }
  }

  /**
   * Sinh hội thoại học tiếng Anh
   *
   * Mục đích: Tạo kịch bản hội thoại theo chủ đề cho module Listening
   * Tham số:
   *   - topic: Chủ đề hội thoại
   *   - durationMinutes: Độ dài mong muốn
   *   - numSpeakers: Số người tham gia (mặc định 2)
   *   - keywords: Từ khóa cần có trong hội thoại (optional)
   * Trả về: JSON chứa script hội thoại
   */
  async generateConversation(
    topic: string,
    durationMinutes: number,
    numSpeakers: number = 2,
    keywords?: string,
  ): Promise<{ script: { speaker: string; text: string }[] }> {
    this.logger.log(`Đang sinh hội thoại về chủ đề: ${topic}`);

    const keywordsInstruction = keywords
      ? `Hãy sử dụng các từ khóa sau trong hội thoại: ${keywords}`
      : '';

    const prompt = `
Tạo một cuộc hội thoại tiếng Anh tự nhiên về chủ đề "${topic}".
- Số người tham gia: ${numSpeakers} (đặt tên là Person A, Person B, v.v.)
- Độ dài: khoảng ${durationMinutes} phút khi đọc bình thường
- Mức độ: Giao tiếp hàng ngày, dễ hiểu
${keywordsInstruction}

Trả về JSON theo format:
{
  "script": [
    { "speaker": "Person A", "text": "..." },
    { "speaker": "Person B", "text": "..." }
  ]
}

Chỉ trả về JSON, không có text khác.
`;

    const result = await this.generateText(prompt);

    try {
      // Parse JSON từ response
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Không tìm thấy JSON trong response');
      }
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error('Lỗi parse JSON:', error);
      throw new Error('Không thể parse kết quả hội thoại');
    }
  }

  /**
   * Chuyển giọng nói thành văn bản (Speech-to-Text)
   *
   * Mục đích: Transcribe audio của user để so sánh và chấm điểm
   * Tham số:
   *   - audioBuffer: File audio dạng Buffer
   *   - language: Ngôn ngữ (mặc định 'en')
   * Trả về: Văn bản được nhận dạng
   */
  async transcribeAudio(
    audioBuffer: Buffer,
    language: string = 'en',
  ): Promise<string> {
    this.logger.log('Đang transcribe audio bằng Whisper...');

    try {
      // Chuyển Buffer thành Uint8Array để tạo File
      const uint8Array = new Uint8Array(audioBuffer);
      const audioFile = new File([uint8Array], 'audio.webm', {
        type: 'audio/webm',
      });

      const response = await this.openai.audio.transcriptions.create({
        model: 'whisper-1',
        file: audioFile,
        language: language,
      });

      this.logger.log('Transcribe thành công');
      return response.text;
    } catch (error) {
      this.logger.error('Lỗi transcribe:', error);
      throw error;
    }
  }

  /**
   * Chuyển văn bản thành giọng nói (Text-to-Speech)
   *
   * Mục đích: Sinh audio cho hội thoại, phát âm mẫu
   * Tham số:
   *   - text: Văn bản cần đọc
   *   - voice: Giọng đọc (alloy, echo, fable, onyx, nova, shimmer)
   * Trả về: Audio buffer
   */
  async textToSpeech(
    text: string,
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'nova',
  ): Promise<Buffer> {
    this.logger.log(`Đang sinh audio TTS với giọng ${voice}...`);

    try {
      const response = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: voice,
        input: text,
      });

      // Chuyển response thành Buffer
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      this.logger.log('Sinh audio TTS thành công');
      return buffer;
    } catch (error) {
      this.logger.error('Lỗi TTS:', error);
      throw error;
    }
  }

  /**
   * Đánh giá phát âm của user
   *
   * Mục đích: So sánh transcript của user với mẫu và đưa ra feedback
   * Tham số:
   *   - originalText: Văn bản gốc (mẫu)
   *   - userTranscript: Văn bản user đọc (từ Whisper)
   * Trả về: Đánh giá chi tiết
   */
  async evaluatePronunciation(
    originalText: string,
    userTranscript: string,
  ): Promise<{
    overallScore: number;
    feedback: {
      wrongWords: { word: string; userSaid: string; suggestion: string }[];
      tips: string[];
      encouragement: string;
    };
  }> {
    this.logger.log('Đang đánh giá phát âm...');

    const prompt = `
So sánh văn bản gốc và văn bản user đọc, đánh giá phát âm:

VĂN BẢN GỐC:
"${originalText}"

USER ĐỌC:
"${userTranscript}"

Trả về JSON theo format:
{
  "overallScore": <điểm từ 0-10>,
  "feedback": {
    "wrongWords": [
      { "word": "<từ sai>", "userSaid": "<user nói>", "suggestion": "<gợi ý phát âm>" }
    ],
    "tips": ["<mẹo cải thiện 1>", "<mẹo 2>"],
    "encouragement": "<lời động viên>"
  }
}

Chỉ trả về JSON.
`;

    const result = await this.generateText(prompt);

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Không tìm thấy JSON');
      }
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error('Lỗi parse evaluation:', error);
      throw new Error('Không thể parse kết quả đánh giá');
    }
  }

  /**
   * Sinh audio cho toàn bộ hội thoại với nhiều giọng
   *
   * Mục đích: Tạo audio đầy đủ cho Listening module
   * Tham số:
   *   - conversation: Danh sách các câu với speaker
   * Trả về: Audio buffer đã ghép + timestamps cho mỗi câu
   */
  async generateConversationAudio(
    conversation: { speaker: string; text: string }[],
  ): Promise<{
    audioBuffer: Buffer;
    timestamps: { startTime: number; endTime: number }[];
  }> {
    this.logger.log(`Đang sinh audio cho ${conversation.length} câu hội thoại...`);

    const audioBuffers: Buffer[] = [];
    const timestamps: { startTime: number; endTime: number }[] = [];
    let currentTime = 0;

    // Map speakers to voices
    const speakerVoices: Record<string, 'nova' | 'onyx' | 'alloy' | 'shimmer'> = {};
    const availableVoices: ('nova' | 'onyx' | 'alloy' | 'shimmer')[] = ['nova', 'onyx', 'alloy', 'shimmer'];
    let voiceIndex = 0;

    for (const line of conversation) {
      // Gán giọng cho speaker nếu chưa có
      if (!speakerVoices[line.speaker]) {
        speakerVoices[line.speaker] = availableVoices[voiceIndex % availableVoices.length];
        voiceIndex++;
      }

      const voice = speakerVoices[line.speaker];

      try {
        // Sinh audio cho câu này
        const audioBuffer = await this.textToSpeech(line.text, voice);
        audioBuffers.push(audioBuffer);

        // Ước tính duration: ~150 words/minute avg for TTS
        const wordCount = line.text.split(/\s+/).length;
        const estimatedDuration = (wordCount / 150) * 60; // seconds
        const duration = Math.max(estimatedDuration, 1); // minimum 1 second

        timestamps.push({
          startTime: currentTime,
          endTime: currentTime + duration,
        });

        currentTime += duration + 0.3; // 0.3s gap between lines

        this.logger.log(`Sinh audio line ${audioBuffers.length}/${conversation.length} - voice: ${voice}`);
      } catch (error) {
        this.logger.error(`Lỗi sinh audio line ${audioBuffers.length + 1}:`, error);
        throw error;
      }
    }

    // Concatenate all audio buffers
    const combinedBuffer = Buffer.concat(audioBuffers);

    this.logger.log(`Hoàn thành sinh audio: ${combinedBuffer.length} bytes, ${timestamps.length} segments`);

    return {
      audioBuffer: combinedBuffer,
      timestamps,
    };
  }
}

