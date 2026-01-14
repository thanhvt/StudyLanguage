/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
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
   *   - durationMinutes: Độ dài mong muốn (phút)
   *   - numSpeakers: Số người tham gia (mặc định 2)
   *   - keywords: Từ khóa cần có trong hội thoại (optional)
   * Trả về: JSON chứa script hội thoại
   *
   * Tính toán số từ:
   *   - Tốc độ TTS: khoảng 150-160 từ/phút
   *   - 5 phút ≈ 800 từ, 10 phút ≈ 1600 từ, 15 phút ≈ 2400 từ
   */
  async generateConversation(
    topic: string,
    durationMinutes: number,
    numSpeakers: number = 2,
    keywords?: string,
  ): Promise<{ script: { speaker: string; text: string }[] }> {
    this.logger.log(`Đang sinh hội thoại về chủ đề: ${topic}`);

    // Tính toán số từ mục tiêu dựa trên thời lượng
    // TTS đọc chậm hơn người thật: ~160 từ/phút
    const WORDS_PER_MINUTE = 160;
    const targetWordCount = durationMinutes * WORDS_PER_MINUTE;
    const minWordCount = Math.floor(targetWordCount * 0.95); // Ít nhất 95%
    const minExchanges = Math.max(10, durationMinutes * 4); // Ít nhất 4 lượt/phút
    const avgWordsPerTurn = Math.ceil(targetWordCount / minExchanges);

    const keywordsInstruction = keywords
      ? `Hãy sử dụng các từ khóa sau trong hội thoại: ${keywords}`
      : '';

    const prompt = `
Tạo một cuộc hội thoại tiếng Anh tự nhiên về chủ đề "${topic}".

=== YÊU CẦU BẮT BUỘC ===
- Số người tham gia: ${numSpeakers} (đặt tên là Person A, Person B, v.v.)
- Thời lượng mục tiêu: ${durationMinutes} phút
- TỔNG SỐ TỪ TỐI THIỂU: ${minWordCount} từ (QUAN TRỌNG - đây là yêu cầu bắt buộc!)
- Số lượt thoại: ít nhất ${minExchanges} lượt trao đổi
- Mỗi lượt nói trung bình: ${avgWordsPerTurn} từ (2-4 câu với chi tiết đầy đủ)
- Mức độ: Giao tiếp hàng ngày, dễ hiểu
${keywordsInstruction}

=== GỢI Ý ĐỂ ĐẠT ĐỦ THỜI LƯỢNG ===
- Thêm chi tiết mô tả, cảm xúc, lý do trong mỗi câu nói
- Sử dụng các câu hỏi follow-up để mở rộng hội thoại
- Thêm các tình huống bất ngờ hoặc thay đổi trong cuộc trò chuyện
- Mỗi người nói nên elaborate, không chỉ trả lời ngắn gọn

=== FORMAT TRẢ VỀ ===
{
  "script": [
    { "speaker": "Person A", "text": "..." },
    { "speaker": "Person B", "text": "..." }
  ]
}

CHỈ TRẢ VỀ JSON, KHÔNG CÓ TEXT KHÁC.
`;

    const result = await this.generateText(prompt);

    try {
      // Parse JSON từ response
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Không tìm thấy JSON trong response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Log số từ thực tế để debug
      const actualWordCount = parsed.script.reduce(
        (sum: number, line: { text: string }) =>
          sum + line.text.split(/\s+/).length,
        0,
      );
      this.logger.log(
        `Hội thoại sinh được: ${actualWordCount} từ / ${targetWordCount} mục tiêu`,
      );

      return parsed;
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
   * Sinh hội thoại tương tác có chỗ trống cho user
   *
   * Mục đích: Tạo hội thoại với [YOUR_TURN] markers để user tham gia
   * Tham số:
   *   - topic: Chủ đề hội thoại
   *   - contextDescription: Mô tả ngữ cảnh cuộc hội thoại
   * Trả về: Script với YOUR_TURN markers
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
      ? `Ngữ cảnh: ${contextDescription}`
      : '';

    const prompt = `
Tạo một cuộc hội thoại tiếng Anh TƯƠNG TÁC về chủ đề "${topic}".
${contextInstr}

Yêu cầu:
- 2 người tham gia: AI Partner và YOU (người học)
- Có 3-4 chỗ trống để người học tham gia nói (đánh dấu speaker = "YOU")
- Với mỗi phần của YOU, gợi ý nội dung nên nói trong ngoặc vuông
- Hội thoại tự nhiên, phù hợp giao tiếp hàng ngày

Trả về JSON:
{
  "scenario": "Mô tả ngắn ngữ cảnh (VD: Bạn đang ở quầy check-in khách sạn)",
  "script": [
    { "speaker": "AI Partner", "text": "Hello! Welcome to our hotel. How can I help you?", "isUserTurn": false },
    { "speaker": "YOU", "text": "[Chào và nói bạn muốn đặt phòng]", "isUserTurn": true },
    { "speaker": "AI Partner", "text": "Sure! How many nights would you like to stay?", "isUserTurn": false }
  ]
}

Chỉ trả về JSON.
`;

    const result = await this.generateText(prompt);

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Không tìm thấy JSON');
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error('Lỗi parse interactive conversation:', error);
      throw new Error('Không thể parse kết quả hội thoại tương tác');
    }
  }

  /**
   * Tiếp tục hội thoại dựa trên input của user
   *
   * Mục đích: AI phản hồi tự nhiên dựa trên câu user vừa nói
   * Tham số:
   *   - conversationHistory: Lịch sử hội thoại đến thời điểm hiện tại
   *   - userInput: Câu user vừa nói
   *   - topic: Chủ đề để giữ context
   * Trả về: Câu phản hồi tiếp theo của AI
   */
  async continueConversation(
    conversationHistory: { speaker: string; text: string }[],
    userInput: string,
    topic: string,
  ): Promise<{ response: string; shouldEnd: boolean }> {
    this.logger.log('Đang tiếp tục hội thoại...');

    const historyText = conversationHistory
      .map((line) => `${line.speaker}: ${line.text}`)
      .join('\n');

    const prompt = `
Bạn đang trong cuộc hội thoại tiếng Anh về "${topic}".

Lịch sử:
${historyText}

User vừa nói: "${userInput}"

Hãy phản hồi tự nhiên với 1-2 câu. Nếu hội thoại đã đến hồi kết tự nhiên, set shouldEnd = true.

Trả về JSON:
{ "response": "Câu phản hồi của bạn", "shouldEnd": false }

Chỉ trả về JSON.
`;

    const result = await this.generateText(prompt);

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Không tìm thấy JSON');
      return JSON.parse(jsonMatch[0]);
    } catch {
      // Fallback nếu không parse được
      return { response: result.trim(), shouldEnd: false };
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
    this.logger.log(
      `Đang sinh audio cho ${conversation.length} câu hội thoại...`,
    );

    const audioBuffers: Buffer[] = [];
    const timestamps: { startTime: number; endTime: number }[] = [];
    let currentTime = 0;

    // Map speakers to voices
    const speakerVoices: Record<string, 'nova' | 'onyx' | 'alloy' | 'shimmer'> =
      {};
    const availableVoices: ('nova' | 'onyx' | 'alloy' | 'shimmer')[] = [
      'nova',
      'onyx',
      'alloy',
      'shimmer',
    ];
    let voiceIndex = 0;

    for (const line of conversation) {
      // Gán giọng cho speaker nếu chưa có
      if (!speakerVoices[line.speaker]) {
        speakerVoices[line.speaker] =
          availableVoices[voiceIndex % availableVoices.length];
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

        this.logger.log(
          `Sinh audio line ${audioBuffers.length}/${conversation.length} - voice: ${voice}`,
        );
      } catch (error) {
        this.logger.error(
          `Lỗi sinh audio line ${audioBuffers.length + 1}:`,
          error,
        );
        throw error;
      }
    }

    // Concatenate all audio buffers
    const combinedBuffer = Buffer.concat(audioBuffers);

    this.logger.log(
      `Hoàn thành sinh audio: ${combinedBuffer.length} bytes, ${timestamps.length} segments`,
    );

    return {
      audioBuffer: combinedBuffer,
      timestamps,
    };
  }

  /**
   * Sinh audio cho hội thoại với progress callback (cho SSE)
   *
   * Mục đích: Tương tự generateConversationAudio nhưng emit progress events
   * Tham số:
   *   - conversation: Danh sách các câu với speaker
   *   - onProgress: Callback được gọi sau mỗi câu hoàn thành
   * Trả về: Audio buffer đã ghép + timestamps cho mỗi câu
   */
  async generateConversationAudioWithProgress(
    conversation: { speaker: string; text: string }[],
    onProgress: (event: {
      type: 'progress' | 'complete' | 'error';
      current?: number;
      total?: number;
      message?: string;
      audio?: string;
      timestamps?: { startTime: number; endTime: number }[];
    }) => void,
  ): Promise<void> {
    this.logger.log(
      `[SSE] Đang sinh audio cho ${conversation.length} câu hội thoại...`,
    );

    const audioBuffers: Buffer[] = [];
    const timestamps: { startTime: number; endTime: number }[] = [];
    let currentTime = 0;

    // Map speakers to voices
    const speakerVoices: Record<string, 'nova' | 'onyx' | 'alloy' | 'shimmer'> =
      {};
    const availableVoices: ('nova' | 'onyx' | 'alloy' | 'shimmer')[] = [
      'nova',
      'onyx',
      'alloy',
      'shimmer',
    ];
    let voiceIndex = 0;

    try {
      for (let i = 0; i < conversation.length; i++) {
        const line = conversation[i];

        // Gán giọng cho speaker nếu chưa có
        if (!speakerVoices[line.speaker]) {
          speakerVoices[line.speaker] =
            availableVoices[voiceIndex % availableVoices.length];
          voiceIndex++;
        }

        const voice = speakerVoices[line.speaker];

        // Emit progress event trước khi xử lý
        onProgress({
          type: 'progress',
          current: i + 1,
          total: conversation.length,
          message: `Đang sinh audio câu ${i + 1}/${conversation.length}`,
        });

        // Sinh audio cho câu này
        const audioBuffer = await this.textToSpeech(line.text, voice);
        audioBuffers.push(audioBuffer);

        // Ước tính duration: ~150 words/minute avg for TTS
        const wordCount = line.text.split(/\\s+/).length;
        const estimatedDuration = (wordCount / 150) * 60; // seconds
        const duration = Math.max(estimatedDuration, 1); // minimum 1 second

        timestamps.push({
          startTime: currentTime,
          endTime: currentTime + duration,
        });

        currentTime += duration + 0.3; // 0.3s gap between lines

        this.logger.log(
          `[SSE] Sinh audio line ${i + 1}/${conversation.length} - voice: ${voice}`,
        );
      }

      // Concatenate all audio buffers
      const combinedBuffer = Buffer.concat(audioBuffers);

      this.logger.log(
        `[SSE] Hoàn thành sinh audio: ${combinedBuffer.length} bytes`,
      );

      // Emit complete event với audio data
      onProgress({
        type: 'complete',
        current: conversation.length,
        total: conversation.length,
        message: 'Hoàn thành!',
        audio: combinedBuffer.toString('base64'),
        timestamps,
      });
    } catch (error) {
      this.logger.error('[SSE] Lỗi sinh audio:', error);
      onProgress({
        type: 'error',
        message: error instanceof Error ? error.message : 'Lỗi sinh audio',
      });
    }
  }
}
