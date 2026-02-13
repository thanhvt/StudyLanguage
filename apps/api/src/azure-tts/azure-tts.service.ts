/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { StorageService } from '../storage/storage.service';

// ============================================
// TYPES & INTERFACES
// ============================================

/**
 * Cấu hình TTS cho Azure Speech Service
 *
 * Mục đích: Định nghĩa các tuỳ chọn giọng, cảm xúc, SSML
 * Khi nào sử dụng: Truyền khi gọi textToSpeech hoặc generateConversationAudio
 */
export interface AzureTtsOptions {
  /** Tên giọng Azure (ví dụ: 'en-US-AriaNeural') */
  voice?: string;
  /** Phong cách cảm xúc (ví dụ: 'cheerful', 'sad', 'angry') */
  emotion?: string;
  /** Mức độ cảm xúc (0.5 - 2.0) */
  emotionDegree?: number;
  /** Điều chỉnh cao độ (ví dụ: '+10%', '-5%', 'high') */
  pitch?: string;
  /** Điều chỉnh tốc độ (ví dụ: '+20%', '-10%', 'fast') */
  rate?: string;
  /** Điều chỉnh âm lượng (ví dụ: '+10%', 'loud') */
  volume?: string;
  /** Chọn giọng ngẫu nhiên */
  randomVoice?: boolean;
  /** Chọn cảm xúc ngẫu nhiên */
  randomEmotion?: boolean;
  /** Map giọng cho từng speaker (speakerLabel → voiceId). Mobile gửi khi user chọn thủ công */
  voicePerSpeaker?: Record<string, string>;
}

/**
 * Timestamp cho từng từ trong audio
 *
 * Mục đích: Hỗ trợ highlight từ khi đang phát audio
 * Khi nào sử dụng: Frontend nhận để sync highlight với audio.currentTime
 */
export interface WordTimestamp {
  /** Từ được đọc */
  word: string;
  /** Thời điểm bắt đầu (giây) */
  startTime: number;
  /** Thời điểm kết thúc (giây) */
  endTime: number;
}

/**
 * Kết quả TTS bao gồm audio + word timestamps
 */
export interface AzureTtsResult {
  /** Audio buffer (WAV/MP3) */
  audioBuffer: Buffer;
  /** Word-level timestamps cho highlight */
  wordTimestamps: WordTimestamp[];
}

/**
 * Kết quả TTS cho toàn bộ hội thoại
 */
export interface AzureConversationAudioResult {
  /** Audio buffer đã merge */
  audioBuffer: Buffer;
  /** Timestamps theo câu (sentence-level) */
  timestamps: { startTime: number; endTime: number }[];
  /** Word timestamps theo câu (mỗi phần tử là array word timestamps cho 1 câu) */
  wordTimestamps: WordTimestamp[][];
  /** URL audio trên Supabase Storage */
  audioUrl?: string;
}

// ============================================
// DANH SÁCH GIỌNG VÀ CẢM XÚC AZURE
// ============================================

/** Giọng tiếng Anh (en-US) hỗ trợ emotion styles */
const AZURE_VOICES = {
  female: [
    { name: 'en-US-AriaNeural', displayName: 'Aria', styles: ['angry', 'chat', 'cheerful', 'customerservice', 'empathetic', 'excited', 'friendly', 'hopeful', 'narration-professional', 'newscast-casual', 'newscast-formal', 'sad', 'shouting', 'terrified', 'unfriendly', 'whispering'] },
    { name: 'en-US-JennyNeural', displayName: 'Jenny', styles: ['angry', 'assistant', 'chat', 'cheerful', 'customerservice', 'excited', 'friendly', 'hopeful', 'newscast', 'sad', 'shouting', 'terrified', 'unfriendly', 'whispering'] },
    { name: 'en-US-SaraNeural', displayName: 'Sara', styles: ['angry', 'cheerful', 'excited', 'friendly', 'hopeful', 'sad', 'shouting', 'terrified', 'unfriendly', 'whispering'] },
    { name: 'en-US-JaneNeural', displayName: 'Jane', styles: ['angry', 'cheerful', 'excited', 'friendly', 'hopeful', 'sad', 'shouting', 'terrified', 'unfriendly', 'whispering'] },
    { name: 'en-US-NancyNeural', displayName: 'Nancy', styles: ['angry', 'cheerful', 'excited', 'friendly', 'hopeful', 'sad', 'shouting', 'terrified', 'unfriendly', 'whispering'] },
  ],
  male: [
    { name: 'en-US-GuyNeural', displayName: 'Guy', styles: ['angry', 'cheerful', 'excited', 'friendly', 'hopeful', 'newscast', 'sad', 'shouting', 'terrified', 'unfriendly', 'whispering'] },
    { name: 'en-US-DavisNeural', displayName: 'Davis', styles: ['angry', 'chat', 'cheerful', 'excited', 'friendly', 'hopeful', 'sad', 'shouting', 'terrified', 'unfriendly', 'whispering'] },
    { name: 'en-US-TonyNeural', displayName: 'Tony', styles: ['angry', 'cheerful', 'excited', 'friendly', 'hopeful', 'sad', 'shouting', 'terrified', 'unfriendly', 'whispering'] },
    { name: 'en-US-JasonNeural', displayName: 'Jason', styles: ['angry', 'cheerful', 'excited', 'friendly', 'hopeful', 'sad', 'shouting', 'terrified', 'unfriendly', 'whispering'] },
  ],
};

/** Multi-talker voices (preview) */
const MULTI_TALKER_VOICES = [
  { name: 'en-US-MultiTalker-Ava-Andrew:DragonHDLatestNeural', speakers: ['Ava', 'Andrew'] },
  { name: 'en-US-MultiTalker-Ava-Steffan:DragonHDLatestNeural', speakers: ['Ava', 'Steffan'] },
];

/** Cảm xúc phù hợp cho conversation thông thường */
const CONVERSATION_EMOTIONS = ['chat', 'cheerful', 'excited', 'friendly', 'hopeful'];

// ============================================
// SERVICE
// ============================================

/**
 * AzureTtsService - Tích hợp Azure Speech Service
 *
 * Mục đích: Cung cấp TTS với emotions, SSML, word timestamps, multi-talker
 * Tham số đầu vào: Text + AzureTtsOptions
 * Tham số đầu ra: Audio buffer + word timestamps
 * Khi nào sử dụng: Được gọi từ TtsProviderService khi provider = 'azure'
 */
@Injectable()
export class AzureTtsService {
  private readonly logger = new Logger(AzureTtsService.name);
  private speechConfig: sdk.SpeechConfig | null = null;

  constructor(private readonly storageService: StorageService) {
    this.initSpeechConfig();
  }

  /**
   * Khởi tạo cấu hình Azure Speech
   *
   * Mục đích: Tạo SpeechConfig từ env vars
   * Tham số đầu vào: Không
   * Tham số đầu ra: Không (set this.speechConfig)
   * Khi nào sử dụng: Constructor gọi 1 lần duy nhất
   */
  private initSpeechConfig(): void {
    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;

    if (!key || !region) {
      this.logger.warn(
        'Thiếu AZURE_SPEECH_KEY hoặc AZURE_SPEECH_REGION trong .env - Azure TTS sẽ không hoạt động',
      );
      return;
    }

    this.speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
    // Mặc định output format: MP3 128kbps
    this.speechConfig.speechSynthesisOutputFormat =
      sdk.SpeechSynthesisOutputFormat.Audio16Khz128KBitRateMonoMp3;

    this.logger.log(`Azure Speech đã khởi tạo - Region: ${region}`);
  }

  /**
   * Kiểm tra Azure Speech đã được cấu hình chưa
   *
   * Mục đích: Guard check trước khi gọi API
   * Tham số đầu vào: Không
   * Tham số đầu ra: boolean
   * Khi nào sử dụng: Gọi ở đầu mỗi method public
   */
  isConfigured(): boolean {
    return this.speechConfig !== null;
  }

  // ============================================
  // SSML BUILDER
  // ============================================

  /**
   * Xây dựng SSML từ text và options
   *
   * Mục đích: Tạo SSML string với voice, emotion, pitch, rate, volume
   * Tham số đầu vào:
   *   - text: Văn bản cần đọc
   *   - options: AzureTtsOptions (voice, emotion, pitch, rate, volume...)
   * Tham số đầu ra: SSML string hoàn chỉnh
   * Khi nào sử dụng: Được gọi nội bộ bởi textToSpeech và các method khác
   */
  buildSSML(text: string, options: AzureTtsOptions = {}): string {
    const voice = options.randomVoice
      ? this.getRandomVoice()
      : options.voice || 'en-US-AriaNeural';

    const emotion = options.randomEmotion
      ? this.getRandomEmotion(voice)
      : options.emotion;

    // Escape ký tự đặc biệt XML
    const escapedText = this.escapeXml(text);

    // Xây dựng phần prosody (pitch, rate, volume)
    let prosodyAttrs = '';
    if (options.pitch) prosodyAttrs += ` pitch="${options.pitch}"`;
    if (options.rate) prosodyAttrs += ` rate="${options.rate}"`;
    if (options.volume) prosodyAttrs += ` volume="${options.volume}"`;

    // Xây dựng nội dung bên trong voice tag
    let innerContent = escapedText;

    // Bọc trong express-as nếu có emotion
    if (emotion) {
      const degreeAttr = options.emotionDegree
        ? ` styledegree="${options.emotionDegree}"`
        : '';
      innerContent = `<mstts:express-as style="${emotion}"${degreeAttr}>${innerContent}</mstts:express-as>`;
    }

    // Bọc trong prosody nếu có tuỳ chỉnh
    if (prosodyAttrs) {
      innerContent = `<prosody${prosodyAttrs}>${innerContent}</prosody>`;
    }

    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US"><voice name="${voice}">${innerContent}</voice></speak>`;
  }

  /**
   * Xây dựng SSML cho hội thoại nhiều người nói
   *
   * Mục đích: Tạo SSML với nhiều voice tags cho conversation
   * Tham số đầu vào:
   *   - conversation: Array { speaker, text, emotion? }
   *   - options: AzureTtsOptions chung
   *   - voiceMap: Map speaker → voice name
   * Tham số đầu ra: SSML string với nhiều voice tags
   * Khi nào sử dụng: generateConversationAudio gọi khi gen audio nhiều giọng
   */
  buildConversationSSML(
    conversation: { speaker: string; text: string; emotion?: string }[],
    options: AzureTtsOptions = {},
    voiceMap: Record<string, string> = {},
  ): string {
    let voicesContent = '';

    for (const line of conversation) {
      const voice = voiceMap[line.speaker] || options.voice || 'en-US-AriaNeural';
      const emotion = line.emotion || (options.randomEmotion ? this.getRandomEmotion(voice) : options.emotion);
      const escapedText = this.escapeXml(line.text);

      let innerContent = escapedText;

      if (emotion) {
        const degreeAttr = options.emotionDegree
          ? ` styledegree="${options.emotionDegree}"`
          : '';
        innerContent = `<mstts:express-as style="${emotion}"${degreeAttr}>${innerContent}</mstts:express-as>`;
      }

      // Thêm prosody nếu có
      let prosodyAttrs = '';
      if (options.pitch) prosodyAttrs += ` pitch="${options.pitch}"`;
      if (options.rate) prosodyAttrs += ` rate="${options.rate}"`;
      if (options.volume) prosodyAttrs += ` volume="${options.volume}"`;

      if (prosodyAttrs) {
        innerContent = `<prosody${prosodyAttrs}>${innerContent}</prosody>`;
      }

      // Thêm break 300ms giữa các câu
      voicesContent += `<voice name="${voice}">${innerContent}</voice><break time="300ms"/>`;
    }

    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">${voicesContent}</speak>`;
  }

  /**
   * Xây dựng SSML cho Multi-talker (DragonHD)
   *
   * Mục đích: Tạo SSML dùng 1 multi-talker voice với nhiều role
   * Tham số đầu vào:
   *   - conversation: Array { speaker, text }
   *   - voicePairIndex: Index của cặp giọng (0 = Ava-Andrew, 1 = Ava-Steffan)
   * Tham số đầu ra: SSML string multi-talker
   * Khi nào sử dụng: generateMultiTalkerAudio gọi để gen conversation 1-shot
   */
  buildMultiTalkerSSML(
    conversation: { speaker: string; text: string }[],
    voicePairIndex = 0,
  ): string {
    const voicePair = MULTI_TALKER_VOICES[voicePairIndex] || MULTI_TALKER_VOICES[0];
    const speakerRoles: Record<string, string> = {};
    let roleIndex = 0;

    let innerContent = '';

    for (const line of conversation) {
      // Gán role cho speaker (speaker đầu = role đầu, speaker sau = role sau)
      if (!speakerRoles[line.speaker]) {
        speakerRoles[line.speaker] = voicePair.speakers[roleIndex % voicePair.speakers.length];
        roleIndex++;
      }

      const role = speakerRoles[line.speaker];
      const escapedText = this.escapeXml(line.text);
      innerContent += `<mstts:express-as role="${role}">${escapedText}</mstts:express-as>`;
    }

    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US"><voice name="${voicePair.name}">${innerContent}</voice></speak>`;
  }

  // ============================================
  // TEXT-TO-SPEECH METHODS
  // ============================================

  /**
   * Chuyển văn bản thành giọng nói (single text)
   *
   * Mục đích: TTS cho 1 câu/đoạn text với voice + emotion + SSML controls
   * Tham số đầu vào:
   *   - text: Văn bản cần đọc
   *   - options: AzureTtsOptions
   * Tham số đầu ra: Buffer chứa audio (MP3)
   * Khi nào sử dụng: Gọi từ TtsProviderService.textToSpeech khi provider = 'azure'
   */
  async textToSpeech(
    text: string,
    options: AzureTtsOptions = {},
  ): Promise<Buffer> {
    if (!this.speechConfig) {
      throw new Error('Azure Speech chưa được cấu hình. Kiểm tra AZURE_SPEECH_KEY và AZURE_SPEECH_REGION.');
    }

    this.logger.log(`Đang sinh audio Azure TTS - voice: ${options.voice || 'auto'}, emotion: ${options.emotion || 'none'}`);

    const ssml = this.buildSSML(text, options);
    return this.synthesizeFromSSML(ssml);
  }

  /**
   * Chuyển văn bản thành giọng nói + word timestamps
   *
   * Mục đích: TTS kèm thông tin timing từng từ để highlight
   * Tham số đầu vào:
   *   - text: Văn bản cần đọc
   *   - options: AzureTtsOptions
   * Tham số đầu ra: AzureTtsResult (audio buffer + word timestamps)
   * Khi nào sử dụng: Khi cần highlight từ trên frontend
   */
  async textToSpeechWithTimestamps(
    text: string,
    options: AzureTtsOptions = {},
  ): Promise<AzureTtsResult> {
    if (!this.speechConfig) {
      throw new Error('Azure Speech chưa được cấu hình. Kiểm tra AZURE_SPEECH_KEY và AZURE_SPEECH_REGION.');
    }

    this.logger.log(`Đang sinh audio Azure TTS + word timestamps`);

    const ssml = this.buildSSML(text, options);
    return this.synthesizeWithTimestamps(ssml);
  }

  /**
   * Sinh audio cho toàn bộ hội thoại (multi-voice, multi-emotion)
   *
   * Mục đích: Tạo audio đầy đủ cho module Listening với nhiều giọng
   * Tham số đầu vào:
   *   - conversation: Array { speaker, text, emotion? }
   *   - options: AzureTtsOptions chung
   * Tham số đầu ra: AzureConversationAudioResult
   * Khi nào sử dụng: Gọi từ TtsProviderService.generateConversationAudio
   */
  async generateConversationAudio(
    conversation: { speaker: string; text: string; emotion?: string }[],
    options: AzureTtsOptions = {},
  ): Promise<AzureConversationAudioResult> {
    if (!this.speechConfig) {
      throw new Error('Azure Speech chưa được cấu hình.');
    }

    this.logger.log(`Đang sinh audio conversation ${conversation.length} câu...`);

    // Gán giọng cho mỗi speaker
    const voiceMap = this.assignVoicesToSpeakers(conversation, options);

    // Sinh audio từng câu với word timestamps
    const allResults: AzureTtsResult[] = [];
    const sentenceTimestamps: { startTime: number; endTime: number }[] = [];
    let currentTime = 0;

    for (let i = 0; i < conversation.length; i++) {
      const line = conversation[i];
      const voice = voiceMap[line.speaker];
      const emotion = line.emotion || (options.randomEmotion ? this.getRandomEmotion(voice) : options.emotion);

      const lineOptions: AzureTtsOptions = {
        ...options,
        voice,
        emotion,
        randomVoice: false, // Đã gán rồi
        randomEmotion: false,
      };

      try {
        const result = await this.textToSpeechWithTimestamps(line.text, lineOptions);
        allResults.push(result);

        // Tính duration từ word timestamps
        const lastWord = result.wordTimestamps[result.wordTimestamps.length - 1];
        const duration = lastWord ? lastWord.endTime : 1;

        sentenceTimestamps.push({
          startTime: currentTime,
          endTime: currentTime + duration,
        });

        currentTime += duration + 0.3; // 300ms gap

        this.logger.log(
          `Sinh audio câu ${i + 1}/${conversation.length} - voice: ${voice}, emotion: ${emotion || 'none'}`,
        );
      } catch (error) {
        this.logger.error(`Lỗi sinh audio câu ${i + 1}:`, error);
        throw error;
      }
    }

    // Merge tất cả audio buffers
    const combinedBuffer = Buffer.concat(allResults.map((r) => r.audioBuffer));

    // Adjust word timestamps theo offset từng câu
    const allWordTimestamps: WordTimestamp[][] = allResults.map((result, i) => {
      const offset = sentenceTimestamps[i].startTime;
      return result.wordTimestamps.map((wt) => ({
        word: wt.word,
        startTime: wt.startTime + offset,
        endTime: wt.endTime + offset,
      }));
    });

    // Upload lên Supabase
    let audioUrl: string | undefined;
    try {
      audioUrl = await this.storageService.uploadAudio(combinedBuffer);
      this.logger.log(`Đã upload audio Azure TTS: ${audioUrl}`);
    } catch (error) {
      this.logger.error('Lỗi upload audio Azure TTS:', error);
    }

    this.logger.log(
      `Hoàn thành conversation audio: ${combinedBuffer.length} bytes, ${sentenceTimestamps.length} segments`,
    );

    return {
      audioBuffer: combinedBuffer,
      timestamps: sentenceTimestamps,
      wordTimestamps: allWordTimestamps,
      audioUrl,
    };
  }

  /**
   * Sinh audio conversation bằng Multi-talker (DragonHD, 1-shot)
   *
   * Mục đích: Gen toàn bộ conversation trong 1 API call, giữ context tự nhiên
   * Tham số đầu vào:
   *   - conversation: Array { speaker, text }
   *   - voicePairIndex: Chọn cặp giọng (0 hoặc 1)
   * Tham số đầu ra: AzureConversationAudioResult
   * Khi nào sử dụng: Khi user chọn mode "Multi-talker" trên frontend
   */
  async generateMultiTalkerAudio(
    conversation: { speaker: string; text: string }[],
    voicePairIndex = 0,
  ): Promise<AzureConversationAudioResult> {
    if (!this.speechConfig) {
      throw new Error('Azure Speech chưa được cấu hình.');
    }

    this.logger.log(`Đang sinh multi-talker audio cho ${conversation.length} câu (DragonHD)...`);

    const ssml = this.buildMultiTalkerSSML(conversation, voicePairIndex);

    try {
      const result = await this.synthesizeWithTimestamps(ssml);

      // Ước tính sentence timestamps từ word timestamps
      const sentenceTimestamps = this.estimateSentenceTimestamps(
        conversation,
        result.wordTimestamps,
      );

      // Phân chia word timestamps theo câu
      const wordTimestampsBySentence = this.splitWordTimestampsBySentence(
        conversation,
        result.wordTimestamps,
      );

      // Upload
      let audioUrl: string | undefined;
      try {
        audioUrl = await this.storageService.uploadAudio(result.audioBuffer);
        this.logger.log(`Đã upload multi-talker audio: ${audioUrl}`);
      } catch (error) {
        this.logger.error('Lỗi upload multi-talker audio:', error);
      }

      return {
        audioBuffer: result.audioBuffer,
        timestamps: sentenceTimestamps,
        wordTimestamps: wordTimestampsBySentence,
        audioUrl,
      };
    } catch (error) {
      this.logger.error('Lỗi multi-talker synthesis:', error);
      // Fallback về single-voice mode
      this.logger.warn('Fallback về single-voice mode...');
      return this.generateConversationAudio(conversation);
    }
  }

  // ============================================
  // CORE SYNTHESIS HELPERS
  // ============================================

  /**
   * Tổng hợp audio từ SSML (không có timestamps)
   *
   * Mục đích: Core method gọi Azure SDK để synthesis
   * Tham số đầu vào: ssml - SSML string
   * Tham số đầu ra: Buffer audio
   * Khi nào sử dụng: textToSpeech gọi
   */
  private async synthesizeFromSSML(ssml: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      // Tạo AudioConfig để output vào stream thay vì file
      const pushStream = sdk.AudioOutputStream.createPullStream();
      const audioConfig = sdk.AudioConfig.fromStreamOutput(pushStream);
      const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig!, audioConfig);

      synthesizer.speakSsmlAsync(
        ssml,
        (result) => {
          synthesizer.close();
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            const audioData = result.audioData;
            resolve(Buffer.from(audioData));
          } else {
            const errorDetail = result.errorDetails || 'Không rõ lỗi';
            reject(new Error(`Azure TTS thất bại: ${errorDetail}`));
          }
        },
        (error) => {
          synthesizer.close();
          reject(new Error(`Azure TTS lỗi: ${error}`));
        },
      );
    });
  }

  /**
   * Tổng hợp audio từ SSML + thu thập word timestamps
   *
   * Mục đích: Core method gọi Azure SDK + capture word boundary events
   * Tham số đầu vào: ssml - SSML string
   * Tham số đầu ra: AzureTtsResult (audio + timestamps)
   * Khi nào sử dụng: textToSpeechWithTimestamps và generateConversationAudio gọi
   */
  private async synthesizeWithTimestamps(ssml: string): Promise<AzureTtsResult> {
    return new Promise((resolve, reject) => {
      const pushStream = sdk.AudioOutputStream.createPullStream();
      const audioConfig = sdk.AudioConfig.fromStreamOutput(pushStream);
      const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig!, audioConfig);

      const wordTimestamps: WordTimestamp[] = [];

      // Lắng nghe sự kiện word boundary để lấy timestamps
      synthesizer.wordBoundary = (_, event) => {
        // Chỉ thu thập word boundaries (không lấy punctuation)
        if (event.boundaryType === sdk.SpeechSynthesisBoundaryType.Word) {
          wordTimestamps.push({
            word: event.text,
            // Chuyển từ ticks (100ns) sang giây
            startTime: event.audioOffset / 10000000,
            endTime: (event.audioOffset + event.duration) / 10000000,
          });
        }
      };

      synthesizer.speakSsmlAsync(
        ssml,
        (result) => {
          synthesizer.close();
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            resolve({
              audioBuffer: Buffer.from(result.audioData),
              wordTimestamps,
            });
          } else {
            const errorDetail = result.errorDetails || 'Không rõ lỗi';
            reject(new Error(`Azure TTS thất bại: ${errorDetail}`));
          }
        },
        (error) => {
          synthesizer.close();
          reject(new Error(`Azure TTS lỗi: ${error}`));
        },
      );
    });
  }

  // ============================================
  // VOICE & EMOTION HELPERS
  // ============================================

  /**
   * Lấy giọng ngẫu nhiên
   *
   * Mục đích: Random voice từ danh sách voices có emotions
   * Tham số đầu vào: Không
   * Tham số đầu ra: Tên giọng Azure
   * Khi nào sử dụng: Khi user chọn "Random voice"
   */
  getRandomVoice(gender?: 'male' | 'female'): string {
    const voices = gender
      ? AZURE_VOICES[gender]
      : [...AZURE_VOICES.female, ...AZURE_VOICES.male];
    const random = voices[Math.floor(Math.random() * voices.length)];
    return random.name;
  }

  /**
   * Lấy emotion ngẫu nhiên phù hợp với voice
   *
   * Mục đích: Random emotion từ danh sách styles mà voice đó hỗ trợ
   * Tham số đầu vào: voiceName - Tên giọng Azure
   * Tham số đầu ra: Tên emotion style
   * Khi nào sử dụng: Khi user chọn "Random emotion"
   */
  getRandomEmotion(voiceName: string): string {
    const allVoices = [...AZURE_VOICES.female, ...AZURE_VOICES.male];
    const voice = allVoices.find((v) => v.name === voiceName);

    if (voice) {
      // Ưu tiên emotions phù hợp conversation
      const conversationStyles = voice.styles.filter((s) =>
        CONVERSATION_EMOTIONS.includes(s),
      );
      const pool = conversationStyles.length > 0 ? conversationStyles : voice.styles;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    // Fallback: trả về emotion mặc định
    return CONVERSATION_EMOTIONS[Math.floor(Math.random() * CONVERSATION_EMOTIONS.length)];
  }

  /**
   * Gán giọng cho mỗi speaker trong conversation
   *
   * Mục đích: Đảm bảo mỗi speaker có giọng riêng biệt
   * Tham số đầu vào:
   *   - conversation: Array { speaker, text }
   *   - options: AzureTtsOptions
   * Tham số đầu ra: Record<speaker, voiceName>
   * Khi nào sử dụng: generateConversationAudio gọi trước khi gen audio
   */
  private assignVoicesToSpeakers(
    conversation: { speaker: string; text: string }[],
    options: AzureTtsOptions = {},
  ): Record<string, string> {
    const voiceMap: Record<string, string> = {};
    const uniqueSpeakers = [...new Set(conversation.map((c) => c.speaker))];

    // Ưu tiên 1: Dùng voicePerSpeaker map nếu mobile gửi (per-speaker selection)
    if (options.voicePerSpeaker && Object.keys(options.voicePerSpeaker).length > 0) {
      for (const speaker of uniqueSpeakers) {
        // Dùng voice đã chọn, fallback random nếu speaker không có trong map
        voiceMap[speaker] = options.voicePerSpeaker[speaker] || this.getRandomVoice();
      }
      this.logger.log(`Gán voice theo voicePerSpeaker map: ${JSON.stringify(voiceMap)}`);
      return voiceMap;
    }

    // Ưu tiên 2: Nếu có voice cụ thể, dùng cho tất cả
    if (options.voice && !options.randomVoice) {
      for (const speaker of uniqueSpeakers) {
        voiceMap[speaker] = options.voice;
      }
      return voiceMap;
    }

    // Xen kẽ nam-nữ cho tự nhiên
    const femaleVoices = [...AZURE_VOICES.female];
    const maleVoices = [...AZURE_VOICES.male];
    let fIdx = 0;
    let mIdx = 0;

    for (let i = 0; i < uniqueSpeakers.length; i++) {
      if (i % 2 === 0 && fIdx < femaleVoices.length) {
        voiceMap[uniqueSpeakers[i]] = femaleVoices[fIdx].name;
        fIdx++;
      } else if (mIdx < maleVoices.length) {
        voiceMap[uniqueSpeakers[i]] = maleVoices[mIdx].name;
        mIdx++;
      } else {
        // Fallback nếu hết giọng
        voiceMap[uniqueSpeakers[i]] = this.getRandomVoice();
      }
    }

    return voiceMap;
  }

  /**
   * Ước tính sentence timestamps từ word timestamps (cho multi-talker)
   *
   * Mục đích: Phân chia word timestamps thành sentence-level timestamps
   * Tham số đầu vào: conversation, wordTimestamps
   * Tham số đầu ra: Array { startTime, endTime } cho mỗi câu
   * Khi nào sử dụng: generateMultiTalkerAudio gọi sau khi synthesis
   */
  private estimateSentenceTimestamps(
    conversation: { speaker: string; text: string }[],
    wordTimestamps: WordTimestamp[],
  ): { startTime: number; endTime: number }[] {
    const sentenceTimestamps: { startTime: number; endTime: number }[] = [];
    let wordIdx = 0;

    for (const line of conversation) {
      const wordCount = line.text.split(/\s+/).filter(Boolean).length;
      const startWordIdx = wordIdx;
      const endWordIdx = Math.min(wordIdx + wordCount - 1, wordTimestamps.length - 1);

      if (startWordIdx < wordTimestamps.length) {
        sentenceTimestamps.push({
          startTime: wordTimestamps[startWordIdx]?.startTime || 0,
          endTime: wordTimestamps[endWordIdx]?.endTime || 0,
        });
      } else {
        // Ước tính nếu hết word timestamps
        const lastEnd = sentenceTimestamps[sentenceTimestamps.length - 1]?.endTime || 0;
        sentenceTimestamps.push({
          startTime: lastEnd + 0.3,
          endTime: lastEnd + 0.3 + wordCount * 0.4,
        });
      }

      wordIdx += wordCount;
    }

    return sentenceTimestamps;
  }

  /**
   * Phân chia word timestamps theo câu (cho multi-talker)
   *
   * Mục đích: Tách flat array thành 2D array theo conversation lines
   * Tham số đầu vào: conversation, wordTimestamps
   * Tham số đầu ra: WordTimestamp[][] - mỗi phần tử là words của 1 câu
   * Khi nào sử dụng: generateMultiTalkerAudio gọi
   */
  private splitWordTimestampsBySentence(
    conversation: { speaker: string; text: string }[],
    wordTimestamps: WordTimestamp[],
  ): WordTimestamp[][] {
    const result: WordTimestamp[][] = [];
    let wordIdx = 0;

    for (const line of conversation) {
      const wordCount = line.text.split(/\s+/).filter(Boolean).length;
      const sentenceWords = wordTimestamps.slice(wordIdx, wordIdx + wordCount);
      result.push(sentenceWords);
      wordIdx += wordCount;
    }

    return result;
  }

  // ============================================
  // UTILITY
  // ============================================

  /**
   * Escape ký tự đặc biệt XML cho SSML
   *
   * Mục đích: Tránh lỗi parse SSML khi text chứa &, <, >, "
   * Tham số đầu vào: text - văn bản gốc
   * Tham số đầu ra: text đã escape
   * Khi nào sử dụng: buildSSML và buildConversationSSML gọi
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Lấy danh sách tất cả voices khả dụng
   *
   * Mục đích: Frontend hiển thị dropdown chọn voice
   * Tham số đầu vào: Không
   * Tham số đầu ra: Array { name, displayName, gender, styles }
   * Khi nào sử dụng: API endpoint /ai/azure-voices
   */
  getAvailableVoices(): { name: string; displayName: string; gender: string; styles: string[] }[] {
    return [
      ...AZURE_VOICES.female.map((v) => ({ ...v, gender: 'female' })),
      ...AZURE_VOICES.male.map((v) => ({ ...v, gender: 'male' })),
    ];
  }

  /**
   * Lấy danh sách multi-talker voices
   *
   * Mục đích: Frontend hiển thị option multi-talker
   * Tham số đầu vào: Không
   * Tham số đầu ra: Array { name, speakers }
   * Khi nào sử dụng: API endpoint /ai/azure-voices
   */
  getMultiTalkerVoices(): typeof MULTI_TALKER_VOICES {
    return MULTI_TALKER_VOICES;
  }
}
