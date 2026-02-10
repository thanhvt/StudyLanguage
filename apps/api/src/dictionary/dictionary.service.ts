import { Injectable, Logger, NotFoundException } from '@nestjs/common';

/**
 * Interface cho kết quả tra từ
 */
export interface DictionaryResult {
  word: string;
  ipa: string | null;
  audio: string | null;
  meanings: {
    partOfSpeech: string;
    definitions: { definition: string; example?: string }[];
  }[];
}

/**
 * Cache entry
 */
interface CacheEntry {
  data: DictionaryResult;
  expiry: number;
}

/**
 * DictionaryService - Proxy tới Free Dictionary API
 *
 * Mục đích: Tra từ điển Anh-Anh với IPA, nghĩa, ví dụ
 * Tham số đầu vào: word (string)
 * Tham số đầu ra: DictionaryResult
 * Khi nào sử dụng: Được inject vào DictionaryController
 *
 * API bên ngoài: https://api.dictionaryapi.dev/api/v2/entries/en/{word}
 */
@Injectable()
export class DictionaryService {
  private readonly logger = new Logger(DictionaryService.name);
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 phút

  /**
   * Tra từ điển
   *
   * Mục đích: Gọi Free Dictionary API, transform và cache kết quả
   * @param word - Từ cần tra
   * @returns DictionaryResult với ipa, meanings, audio
   * Khi nào sử dụng: GET /dictionary/lookup?word=...
   */
  async lookup(word: string): Promise<DictionaryResult> {
    const normalizedWord = word.trim().toLowerCase();

    // Kiểm tra cache
    const cached = this.cache.get(normalizedWord);
    if (cached && cached.expiry > Date.now()) {
      this.logger.log(`[DictionaryService] Cache hit: "${normalizedWord}"`);
      return cached.data;
    }

    try {
      // Gọi Free Dictionary API
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(normalizedWord)}`;
      this.logger.log(`[DictionaryService] Đang tra từ: "${normalizedWord}"`);

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          throw new NotFoundException(`Không tìm thấy từ: "${word}"`);
        }
        throw new Error(`Dictionary API lỗi: ${response.status}`);
      }

      const data = await response.json();
      const result = this.transformResponse(data, normalizedWord);

      // Lưu cache
      this.cache.set(normalizedWord, {
        data: result,
        expiry: Date.now() + this.CACHE_TTL,
      });

      // Dọn cache cũ (giữ tối đa 500 entries)
      if (this.cache.size > 500) {
        this.cleanupCache();
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`[DictionaryService] Lỗi tra từ "${word}":`, error);
      throw new NotFoundException(`Không thể tra từ: "${word}"`);
    }
  }

  /**
   * Transform response từ Free Dictionary API
   *
   * Mục đích: Chuyển đổi raw API response thành format chuẩn
   * @param data - Raw response từ API
   * @param word - Từ đã tra
   * @returns DictionaryResult
   * Khi nào sử dụng: Được gọi bởi lookup()
   */
  private transformResponse(data: any[], word: string): DictionaryResult {
    const entry = data[0];

    // Lấy IPA (ưu tiên US pronunciation)
    let ipa: string | null = null;
    let audio: string | null = null;

    if (entry.phonetics && entry.phonetics.length > 0) {
      for (const phonetic of entry.phonetics) {
        if (phonetic.text) {
          ipa = phonetic.text;
        }
        if (phonetic.audio && !audio) {
          audio = phonetic.audio;
        }
      }
    }
    // Fallback cho phonetic chung
    if (!ipa && entry.phonetic) {
      ipa = entry.phonetic;
    }

    // Transform meanings
    const meanings = (entry.meanings || []).map((m: any) => ({
      partOfSpeech: m.partOfSpeech || 'unknown',
      definitions: (m.definitions || []).slice(0, 3).map((d: any) => ({
        definition: d.definition,
        example: d.example || undefined,
      })),
    }));

    return {
      word: entry.word || word,
      ipa,
      audio,
      meanings,
    };
  }

  /**
   * Dọn cache entries hết hạn
   *
   * Mục đích: Tránh memory leak do cache quá nhiều
   * Khi nào sử dụng: Khi cache > 500 entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry < now) {
        this.cache.delete(key);
      }
    }
  }
}
