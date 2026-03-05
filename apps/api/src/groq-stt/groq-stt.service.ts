/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';

/**
 * Kết quả transcribe từ Groq Whisper
 *
 * Mục đích: Định nghĩa cấu trúc dữ liệu trả về sau khi transcribe
 * Khi nào sử dụng: Return type cho các method transcribe
 */
export interface TranscribeResult {
  /** Văn bản đã transcribe */
  text: string;
  /** Ngôn ngữ phát hiện được */
  language?: string;
  /** Thời lượng audio (giây) */
  duration?: number;
  /** Model đã sử dụng */
  model: string;
}

/**
 * Cấu hình transcribe
 *
 * Mục đích: Cho phép tùy chỉnh hành vi transcribe
 * Khi nào sử dụng: Truyền khi gọi transcribe() hoặc transcribeBuffer()
 */
export interface TranscribeOptions {
  /** Model Whisper: 'whisper-large-v3-turbo' (nhanh) hoặc 'whisper-large-v3' (chính xác) */
  model?: 'whisper-large-v3-turbo' | 'whisper-large-v3';
  /** Gợi ý ngôn ngữ (ISO 639-1, ví dụ: 'en', 'vi') */
  language?: string;
  /** Prompt gợi ý cho Whisper (giúp nhận diện chính xác hơn) */
  prompt?: string;
  /** Định dạng response: 'json' | 'text' | 'verbose_json' */
  responseFormat?: 'json' | 'text' | 'verbose_json';
}

/**
 * GroqSttService — Tích hợp Groq Whisper API cho Speech-to-Text
 *
 * Mục đích: Chuyển đổi audio thành text sử dụng Whisper model trên Groq
 * Tham số đầu vào: Audio buffer hoặc file + TranscribeOptions
 * Tham số đầu ra: TranscribeResult (text, language, duration)
 * Khi nào sử dụng:
 *   - SpeakingService.transcribeAudio() → delegate cho GroqSttService
 *   - POST /speaking/transcribe → upload audio → transcribe
 *   - POST /speaking/transcribe-and-evaluate → combo flow
 */
@Injectable()
export class GroqSttService {
  private readonly logger = new Logger(GroqSttService.name);
  private readonly groq: Groq;
  private isConfigured = false;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        'Thiếu GROQ_API_KEY trong .env — Groq STT sẽ không hoạt động',
      );
      this.groq = new Groq({ apiKey: '' });
      return;
    }

    this.groq = new Groq({ apiKey });
    this.isConfigured = true;
    this.logger.log('Groq STT đã khởi tạo thành công');
  }

  /**
   * Kiểm tra service đã được cấu hình chưa
   *
   * Mục đích: Guard check trước khi gọi API
   * Tham số đầu vào: Không
   * Tham số đầu ra: boolean
   * Khi nào sử dụng: Gọi ở đầu mỗi method public
   */
  checkConfigured(): boolean {
    return this.isConfigured;
  }

  /**
   * Transcribe audio từ Buffer
   *
   * Mục đích: Chuyển audio buffer thành text
   * Tham số đầu vào:
   *   - audioBuffer: Buffer chứa dữ liệu audio
   *   - fileName: Tên file gốc (cần để xác định mime type)
   *   - options: TranscribeOptions (model, language, prompt)
   * Tham số đầu ra: TranscribeResult
   * Khi nào sử dụng:
   *   - SpeakingController nhận file upload → gọi transcribeBuffer
   *   - SpeakingService combo flow transcribe + evaluate
   */
  async transcribeBuffer(
    audioBuffer: Buffer,
    fileName: string = 'recording.m4a',
    options: TranscribeOptions = {},
  ): Promise<TranscribeResult> {
    if (!this.isConfigured) {
      throw new Error('Groq STT chưa được cấu hình (thiếu GROQ_API_KEY)');
    }

    const model = options.model || 'whisper-large-v3-turbo';
    const language = options.language || 'en';

    this.logger.log(
      `Đang transcribe audio (${(audioBuffer.length / 1024).toFixed(1)}KB, model: ${model}, lang: ${language})`,
    );

    try {
      // Tạo File object từ Buffer để gửi cho Groq API
      // Chuyển Buffer → Uint8Array (ArrayBuffer) để tương thích với File constructor
      const arrayBuffer = audioBuffer.buffer.slice(
        audioBuffer.byteOffset,
        audioBuffer.byteOffset + audioBuffer.byteLength,
      ) as ArrayBuffer;
      const file = new File([new Uint8Array(arrayBuffer)], fileName, {
        type: this.getMimeType(fileName),
      });

      const response = await this.groq.audio.transcriptions.create({
        file,
        model,
        language,
        ...(options.prompt && { prompt: options.prompt }),
        response_format: options.responseFormat || 'verbose_json',
      });

      // Xử lý response dựa trên format
      let text: string;
      let duration: number | undefined;
      let detectedLanguage: string | undefined;

      if (typeof response === 'string') {
        text = response;
      } else {
        text = (response as any).text || '';
        duration = (response as any).duration;
        detectedLanguage = (response as any).language;
      }

      this.logger.log(
        `Transcribe thành công: "${text.substring(0, 80)}..." (${duration ? duration.toFixed(1) + 's' : 'N/A'})`,
      );

      return {
        text: text.trim(),
        language: detectedLanguage || language,
        duration,
        model,
      };
    } catch (error) {
      this.logger.error('Lỗi transcribe audio:', error);

      // Nếu model turbo lỗi, thử fallback sang v3
      if (model === 'whisper-large-v3-turbo') {
        this.logger.log('Đang thử fallback sang whisper-large-v3...');
        return this.transcribeBuffer(audioBuffer, fileName, {
          ...options,
          model: 'whisper-large-v3',
        });
      }

      throw error;
    }
  }

  /**
   * Lấy MIME type từ tên file
   *
   * Mục đích: Xác định content type cho audio file upload
   * Tham số đầu vào: fileName (string)
   * Tham số đầu ra: MIME type string
   * Khi nào sử dụng: Trước khi tạo File object cho Groq API
   */
  private getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeMap: Record<string, string> = {
      mp3: 'audio/mpeg',
      mp4: 'audio/mp4',
      m4a: 'audio/m4a',
      wav: 'audio/wav',
      webm: 'audio/webm',
      ogg: 'audio/ogg',
      flac: 'audio/flac',
    };
    return mimeMap[ext || ''] || 'audio/mpeg';
  }

  /**
   * Lấy danh sách models Whisper có sẵn
   *
   * Mục đích: Trả về thông tin các model STT có thể sử dụng
   * Tham số đầu vào: Không
   * Tham số đầu ra: Mảng object { id, name, description }
   * Khi nào sử dụng: API endpoint để mobile hiển thị lựa chọn model
   */
  getAvailableModels(): { id: string; name: string; description: string }[] {
    return [
      {
        id: 'whisper-large-v3-turbo',
        name: 'Whisper V3 Turbo',
        description: 'Nhanh hơn, phù hợp cho real-time. 400 req/min.',
      },
      {
        id: 'whisper-large-v3',
        name: 'Whisper V3',
        description: 'Chính xác hơn, phù hợp cho đánh giá phát âm. 300 req/min.',
      },
    ];
  }
}
