/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { StorageService } from '../storage/storage.service';
import ffmpeg from 'fluent-ffmpeg';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as ffprobeInstaller from '@ffprobe-installer/ffprobe';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { randomUUID } from 'crypto';

// Set path cho ffmpeg và ffprobe
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

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

  constructor(private readonly storageService: StorageService) {
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
        temperature: 0.9,
        max_tokens: 4000, // Tăng lên để hội thoại dài không bị cắt giữa chừng
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
    // Cấu hình cho hội thoại DÀI và CHI TIẾT
    const WORDS_PER_MINUTE = 300; // Mục tiêu cao để sinh nhiều nội dung
    const targetWordCount = durationMinutes * WORDS_PER_MINUTE;
    const minWordCount = Math.floor(targetWordCount * 1.1); // Thêm 10% buffer
    const minExchanges = Math.max(30, durationMinutes * 10); // 10 lượt/phút - nhiều trao đổi
    const avgWordsPerTurn = Math.max(
      40,
      Math.ceil(targetWordCount / minExchanges),
    ); // Ít nhất 25 từ/lượt

    const keywordsInstruction = keywords
      ? `Hãy sử dụng các từ khóa sau trong hội thoại: ${keywords}`
      : '';

    // Random seed để đảm bảo mỗi lần sinh ra hội thoại khác nhau
    const randomSeed = `[Seed: ${Date.now()}-${Math.random().toString(36).substring(2, 8)}]`;

    const prompt = `
${randomSeed}
Tạo một cuộc hội thoại tiếng Anh tự nhiên về chủ đề "${topic}".
Lưu ý: Hãy sáng tạo nội dung độc đáo, không lặp lại các đoạn hội thoại trước đó.

=== YÊU CẦU BẮT BUỘC ===
- Số người tham gia: ${numSpeakers} (đặt tên là Person A, Person B, v.v.)
- Thời lượng mục tiêu: ${durationMinutes} phút
- TỔNG SỐ TỪ TỐI THIỂU: ${minWordCount} từ (QUAN TRỌNG - đây là yêu cầu bắt buộc!)
- Số lượt thoại: ít nhất ${minExchanges} lượt trao đổi
- MỖI LƯỢT NÓI: tối thiểu ${avgWordsPerTurn} từ (3-5 câu đầy đủ, chi tiết)
- Mức độ: Giao tiếp hàng ngày, dễ hiểu
${keywordsInstruction}

=== YÊU CẦU VỀ ĐỘ DÀI MỖI CÂU ===
- KHÔNG được trả lời ngắn gọn kiểu "Yes", "No", "Okay"
- Mỗi lượt nói PHẢI có ít nhất 3 câu hoàn chỉnh
- Thêm lý do, giải thích, cảm xúc, chi tiết trong mỗi phản hồi
- Sử dụng các câu hỏi follow-up để mở rộng hội thoại
- Thêm các tình huống bất ngờ, thay đổi chủ đề phụ trong cuộc trò chuyện

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

      let parsed;
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        // Thử repair JSON bị truncated
        this.logger.warn('JSON bị lỗi, đang thử repair...');
        const repaired = this.repairTruncatedJson(jsonMatch[0]);
        parsed = JSON.parse(repaired);
      }

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
   * Text-to-Speech trả về PCM format (raw audio)
   * PCM 24kHz, 16-bit, signed, little-endian
   * Dùng cho việc concat audio (PCM không có header nên concat đơn giản)
   */
  async textToSpeechPcm(
    text: string,
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'nova',
  ): Promise<Buffer> {
    try {
      const response = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: voice,
        input: text,
        response_format: 'pcm', // Raw PCM: 24kHz, 16-bit, signed, little-endian
      });

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      this.logger.error('Lỗi TTS PCM:', error);
      throw error;
    }
  }

  /**
   * Đánh giá phát âm của user - Enhanced với word-by-word scoring
   *
   * Mục đích: So sánh transcript của user với mẫu và đưa ra feedback chi tiết
   * Tham số:
   *   - originalText: Văn bản gốc (mẫu)
   *   - userTranscript: Văn bản user đọc (từ Whisper)
   * Trả về: Đánh giá chi tiết với word-by-word scores
   */
  async evaluatePronunciation(
    originalText: string,
    userTranscript: string,
  ): Promise<{
    overallScore: number;
    fluency: number;
    pronunciation: number;
    pace: number;
    wordByWord: { word: string; correct: boolean; score: number; issue?: string }[];
    patterns: string[];
    feedback: {
      wrongWords: { word: string; userSaid: string; suggestion: string }[];
      tips: string[];
      encouragement: string;
    };
  }> {
    this.logger.log('Đang đánh giá phát âm (enhanced)...');

    const prompt = `
Bạn là chuyên gia đánh giá phát âm tiếng Anh. Hãy phân tích CHI TIẾT việc đọc của user.

VĂN BẢN GỐC (reference):
"${originalText}"

USER ĐỌC (transcript từ Whisper):
"${userTranscript}"

=== YÊU CẦU PHÂN TÍCH CHI TIẾT ===

1. **So sánh từng từ**: Đánh giá TỪNG TỪ trong văn bản gốc
2. **Phát hiện patterns**: Nhận diện các lỗi phát âm phổ biến (VD: /th/, /r/, /l/, âm cuối...)
3. **Đánh giá đa chiều**: Fluency (trôi chảy), Pronunciation (phát âm), Pace (tốc độ)
4. **Gợi ý cải thiện**: Tips cụ thể và actionable

Trả về JSON theo format CHÍNH XÁC sau:
{
  "overallScore": <điểm tổng 0-100>,
  "fluency": <điểm trôi chảy 0-100>,
  "pronunciation": <điểm phát âm 0-100>,
  "pace": <điểm tốc độ 0-100>,
  "wordByWord": [
    { "word": "hello", "correct": true, "score": 95 },
    { "word": "world", "correct": false, "score": 40, "issue": "phát âm thành 'word'" }
  ],
  "patterns": [
    "Cần luyện âm /th/ - đang phát âm thành /t/ hoặc /d/",
    "Chú ý âm cuối các từ có đuôi -ed"
  ],
  "feedback": {
    "wrongWords": [
      { "word": "world", "userSaid": "word", "suggestion": "Lưỡi cong lên khi phát âm /r/" }
    ],
    "tips": [
      "Đọc chậm hơn để rõ ràng từng từ",
      "Thực hành âm /θ/ bằng cách đặt lưỡi giữa hai hàm răng"
    ],
    "encouragement": "Tốt lắm! Bạn đã hoàn thành bài đọc. Tiếp tục luyện tập nhé!"
  }
}

LƯU Ý QUAN TRỌNG:
- wordByWord PHẢI chứa TẤT CẢ các từ trong văn bản gốc (không bỏ sót)
- Nếu Whisper transcribe sai hoàn toàn, vẫn phải list từng từ và đánh giá
- Score 0-100: 90+ = Excellent, 70-89 = Good, 50-69 = Fair, <50 = Needs Work

CHỈ TRẢ VỀ JSON, KHÔNG CÓ TEXT KHÁC.
`;

    const result = await this.generateText(prompt);

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Không tìm thấy JSON');
      }
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Ensure all required fields exist with defaults
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
          encouragement: parsed.feedback?.encouragement ?? 'Tiếp tục luyện tập nhé!',
        },
      };
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
   * Helper: Repair JSON bị truncated (bị cắt giữa chừng)
   *
   * Mục đích: Khi OpenAI response bị cắt, JSON không đóng đúng
   * Tham số: json - JSON string bị lỗi
   * Trả về: JSON string đã được repair
   * Khi nào sử dụng: Khi JSON.parse() thất bại
   */
  private repairTruncatedJson(json: string): string {
    let repaired = json.trim();

    // Loại bỏ item cuối nếu đang viết dở (không có closing brace)
    // Ví dụ: ...}, {"speaker": "Person A", "text": "Hello...
    // Tìm item cuối cùng đang viết dở và xóa nó
    const lastCompleteItemIndex = repaired.lastIndexOf('}');
    const lastOpeningBrace = repaired.lastIndexOf('{"');

    if (lastOpeningBrace > lastCompleteItemIndex) {
      // Có item đang viết dở -> cắt bỏ
      repaired = repaired.substring(0, lastOpeningBrace);
      // Xóa dấu phẩy thừa nếu có
      repaired = repaired.replace(/,\s*$/, '');
    }

    // Đếm số brackets chưa đóng
    let openBraces = 0;
    let openBrackets = 0;
    let inString = false;
    let escapeNext = false;

    for (const char of repaired) {
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '{') openBraces++;
        if (char === '}') openBraces--;
        if (char === '[') openBrackets++;
        if (char === ']') openBrackets--;
      }
    }

    // Thêm closing brackets còn thiếu
    repaired += ']'.repeat(Math.max(0, openBrackets));
    repaired += '}'.repeat(Math.max(0, openBraces));

    this.logger.log(`Đã repair JSON: thêm ${openBrackets}] và ${openBraces}}`);
    return repaired;
  }

  /**
   * Helper: Xóa file tạm an toàn
   */
  private cleanupTempFiles(files: string[]) {
    files.forEach((file) => {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
        } catch (e) {
          console.warn(`Không thể xóa file tạm ${file}:`, e);
        }
      }
    });
  }

  /**
   * Helper: Merge nhiều buffer PCM thành 1 file MP3
   * PCM là raw audio nên Buffer.concat hoạt động hoàn hảo
   * Sau đó dùng ffmpeg encode sang MP3
   */
  private async mergeAudiosFromPcm(pcmBuffers: Buffer[]): Promise<Buffer> {
    if (pcmBuffers.length === 0) return Buffer.from([]);

    // PCM là raw data, concat đơn giản
    const combinedPcm = Buffer.concat(pcmBuffers);
    this.logger.log(`Combined PCM size: ${combinedPcm.length} bytes`);

    const tempDir = os.tmpdir();
    const sessionId = randomUUID();
    const inputPath = path.join(tempDir, `${sessionId}_input.pcm`);
    const outputPath = path.join(tempDir, `${sessionId}_output.mp3`);

    // Ghi PCM ra file
    fs.writeFileSync(inputPath, combinedPcm);

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(inputPath)
        .inputOptions([
          '-f',
          's16le', // Format: signed 16-bit little-endian
          '-ar',
          '24000', // Sample rate: 24kHz (OpenAI TTS default)
          '-ac',
          '1', // Channels: mono
        ])
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .output(outputPath)
        .on('error', (err: Error) => {
          this.logger.error('Lỗi khi encode PCM to MP3:', err);
          this.cleanupTempFiles([inputPath, outputPath]);
          reject(err);
        })
        .on('end', () => {
          try {
            const mp3Buffer = fs.readFileSync(outputPath);
            this.logger.log(`Encode MP3 thành công: ${mp3Buffer.length} bytes`);
            this.cleanupTempFiles([inputPath, outputPath]);
            resolve(mp3Buffer);
          } catch (e) {
            this.cleanupTempFiles([inputPath, outputPath]);
            reject(e);
          }
        })
        .run();
    });
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
    audioUrl?: string;
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
        // Sinh audio cho câu này (PCM format)
        const audioBuffer = await this.textToSpeechPcm(line.text, voice);
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

    // Merge PCM buffers và encode sang MP3
    const combinedBuffer = await this.mergeAudiosFromPcm(audioBuffers);

    this.logger.log(
      `Hoàn thành sinh audio: ${combinedBuffer.length} bytes, ${timestamps.length} segments`,
    );

    // Upload lên Supabase Storage
    let audioUrl: string | undefined;
    try {
      audioUrl = await this.storageService.uploadAudio(combinedBuffer);
      this.logger.log(`Đã upload audio: ${audioUrl}`);
    } catch (error) {
      this.logger.error('Lỗi upload audio:', error);
      // Không throw error nếu upload fail, vẫn trả về base64
    }

    return {
      audioBuffer: combinedBuffer,
      timestamps,
      audioUrl,
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
  /**
   * Sinh audio cho hội thoại với progress callback (cho SSE)
   * Và upload lên Supabase Storage để lưu trữ vĩnh viễn
   *
   * Mục đích: Tương tự generateConversationAudio nhưng emit progress events
   * Tham số:
   *   - conversation: Danh sách các câu với speaker
   *   - onProgress: Callback được gọi sau mỗi câu hoàn thành
   *   - shouldUpload: Có upload lên Storage không (default: true)
   * Trả về: Audio buffer đã ghép + timestamps + audioUrl (nếu upload)
   */
  async generateConversationAudioWithProgress(
    conversation: { speaker: string; text: string }[],
    onProgress: (event: {
      type: 'progress' | 'complete' | 'error';
      current?: number;
      total?: number;
      message?: string;
      audio?: string;
      audioUrl?: string; // URL audio đã upload lên Storage
      timestamps?: { startTime: number; endTime: number }[];
    }) => void,
    shouldUpload: boolean = true,
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

        // Sinh audio cho câu này (PCM format)
        const audioBuffer = await this.textToSpeechPcm(line.text, voice);
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

      // Merge PCM buffers và encode sang MP3
      const combinedBuffer = await this.mergeAudiosFromPcm(audioBuffers);

      this.logger.log(
        `[SSE] Hoàn thành sinh audio: ${combinedBuffer.length} bytes`,
      );

      // Upload audio lên Supabase Storage nếu cần
      let audioUrl: string | undefined;
      if (shouldUpload) {
        try {
          onProgress({
            type: 'progress',
            current: conversation.length,
            total: conversation.length,
            message: 'Đang upload audio lên cloud...',
          });

          audioUrl = await this.storageService.uploadAudio(combinedBuffer);
          this.logger.log(`[SSE] Đã upload audio: ${audioUrl}`);
        } catch (uploadError) {
          this.logger.error('[SSE] Lỗi upload audio:', uploadError);
          // Không throw error - vẫn trả về audio base64, chỉ không có URL persistent
        }
      }

      // Emit complete event với audio data và URL
      onProgress({
        type: 'complete',
        current: conversation.length,
        total: conversation.length,
        message: 'Hoàn thành!',
        audio: combinedBuffer.toString('base64'),
        audioUrl,
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
