import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AiService } from '../ai/ai.service';

/**
 * Interface cho kết quả generate radio playlist
 */
export interface RadioPlaylistResult {
  playlist: {
    id: string;
    name: string;
    description: string;
    duration: number;
    trackCount: number;
  };
  items: RadioPlaylistItem[];
}

/**
 * Interface cho mỗi item trong radio playlist
 */
export interface RadioPlaylistItem {
  id: string;
  topic: string;
  conversation: { speaker: string; text: string }[];
  duration: number;
  numSpeakers: number;
  category: string;
  subCategory: string;
  position: number;
}

/**
 * Danh sách scenarios có sẵn để pick random
 * Copy từ topic-data.ts để sử dụng ở backend
 */
const SCENARIOS = [
  // IT - Công nghệ
  { id: 'it-1', topic: 'Daily Stand-up Update', category: 'it', subCategory: 'Agile Ceremonies' },
  { id: 'it-2', topic: 'Sprint Planning - Estimation', category: 'it', subCategory: 'Agile Ceremonies' },
  { id: 'it-3', topic: 'Sprint Retrospective', category: 'it', subCategory: 'Agile Ceremonies' },
  { id: 'it-6', topic: 'Database Schema Review', category: 'it', subCategory: 'Technical Discussions' },
  { id: 'it-7', topic: 'API Contract Negotiation', category: 'it', subCategory: 'Technical Discussions' },
  { id: 'it-10', topic: 'Fixing a Critical Bug', category: 'it', subCategory: 'Technical Discussions' },
  { id: 'it-17', topic: 'Performance Bottleneck Analysis', category: 'it', subCategory: 'Performance' },
  { id: 'it-21', topic: 'Monolith vs Microservices', category: 'it', subCategory: 'Architecture' },
  { id: 'it-26', topic: 'SQL vs NoSQL', category: 'it', subCategory: 'Database' },
  { id: 'it-31', topic: 'CI/CD Pipeline Design', category: 'it', subCategory: 'DevOps' },
  // Daily - Sinh tồn hàng ngày
  { id: 'daily-1', topic: 'Check-in & Seat Selection at Airport', category: 'daily', subCategory: 'Airport' },
  { id: 'daily-5', topic: 'Missed Connection Flight', category: 'daily', subCategory: 'Airport' },
  { id: 'daily-6', topic: 'Lost Luggage Report', category: 'daily', subCategory: 'Airport' },
  { id: 'daily-21', topic: 'Asking for Location in Supermarket', category: 'daily', subCategory: 'Shopping' },
  { id: 'daily-29', topic: 'Return & Refund', category: 'daily', subCategory: 'Shopping' },
  { id: 'daily-41', topic: 'Asking for Directions', category: 'daily', subCategory: 'Street' },
  { id: 'daily-43', topic: 'Taking the Subway/Metro', category: 'daily', subCategory: 'Street' },
  { id: 'daily-50', topic: 'Asking for Recommendations', category: 'daily', subCategory: 'Street' },
  { id: 'daily-57', topic: 'Hotel Check-in', category: 'daily', subCategory: 'Street' },
  // Personal - Đời sống cá nhân
  { id: 'personal-1', topic: 'Catching Up with Old Friends', category: 'personal', subCategory: 'Friends' },
  { id: 'personal-3', topic: 'Planning a Trip with Friends', category: 'personal', subCategory: 'Friends' },
  { id: 'personal-4', topic: 'Discussing Movies/Series', category: 'personal', subCategory: 'Friends' },
  { id: 'personal-11', topic: 'Sports Talk', category: 'personal', subCategory: 'Friends' },
  { id: 'personal-21', topic: 'First Date', category: 'personal', subCategory: 'Family' },
  { id: 'personal-28', topic: 'Talking to Parents', category: 'personal', subCategory: 'Family' },
  { id: 'personal-32', topic: 'Medical Appointment', category: 'personal', subCategory: 'Family' },
  { id: 'personal-36', topic: 'Job Interview (HR Round)', category: 'personal', subCategory: 'Family' },
  { id: 'personal-37', topic: 'Salary Negotiation', category: 'personal', subCategory: 'Family' },
];

/**
 * RadioService - Service xử lý Radio Mode
 *
 * Mục đích: Generate playlist nghe thụ động tự động với random topics
 * Tham số đầu vào: userId, duration (optional)
 * Tham số đầu ra: RadioPlaylistResult
 * Khi nào sử dụng: Được inject vào RadioController
 */
@Injectable()
export class RadioService {
  private readonly logger = new Logger(RadioService.name);
  private readonly supabase: SupabaseClient;

  constructor(private readonly aiService: AiService) {
    // Khởi tạo Supabase client
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  /**
   * Sinh thời lượng ngẫu nhiên cho Radio playlist
   *
   * Mục đích: Random 1 trong 3 giá trị 30/60/120 phút
   * Trả về: Số phút được chọn
   */
  generateRandomDuration(): number {
    const durations = [30, 60, 120];
    const randomIndex = Math.floor(Math.random() * durations.length);
    return durations[randomIndex];
  }

  /**
   * Tính số bài cần thiết dựa trên thời lượng
   *
   * Mục đích: Ước tính số tracks cho playlist
   * Tham số: totalDuration - Tổng thời lượng (phút)
   * Trả về: Số bài
   */
  calculateTrackCount(totalDuration: number): number {
    // Mỗi bài trung bình 5-10 phút, lấy avg = 7 phút
    const avgDurationPerTrack = 7;
    return Math.ceil(totalDuration / avgDurationPerTrack);
  }

  /**
   * Chọn ngẫu nhiên các topics từ danh sách scenarios
   *
   * Mục đích: Pick random không trùng lặp
   * Tham số: count - Số topics cần chọn
   * Trả về: Mảng các scenario đã chọn
   */
  pickRandomTopics(count: number): typeof SCENARIOS {
    // Shuffle array using Fisher-Yates
    const shuffled = [...SCENARIOS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }

  /**
   * Ước tính duration cho mỗi bài dựa trên tổng thời lượng và số bài
   *
   * Mục đích: Phân bổ thời lượng hợp lý cho từng track
   * Tham số: totalDuration, trackCount
   * Trả về: Duration cho mỗi track (phút)
   */
  calculateTrackDuration(totalDuration: number, trackCount: number): number {
    // Mỗi track từ 5-10 phút
    const avgDuration = Math.floor(totalDuration / trackCount);
    return Math.min(Math.max(avgDuration, 5), 10);
  }

  /**
   * Generate Radio Playlist cho user
   *
   * Mục đích: Tạo playlist hoàn chỉnh (chỉ text, không audio)
   * Tham số:
   *   - userId: ID của user
   *   - duration: Thời lượng đã chọn (phút)
   * Trả về: RadioPlaylistResult với playlist và items
   */
  async generateRadioPlaylist(
    userId: string,
    duration: number,
  ): Promise<RadioPlaylistResult> {
    this.logger.log(`Đang tạo Radio playlist ${duration} phút cho user ${userId}`);

    // Tính số bài cần generate
    const trackCount = this.calculateTrackCount(duration);
    const trackDuration = this.calculateTrackDuration(duration, trackCount);

    this.logger.log(`Sẽ generate ${trackCount} bài, mỗi bài ~${trackDuration} phút`);

    // Pick random topics
    const selectedTopics = this.pickRandomTopics(trackCount);

    // Tạo playlist trong database trước
    const now = new Date();
    const playlistName = `📻 Radio - ${now.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    const { data: playlist, error: playlistError } = await this.supabase
      .from('playlists')
      .insert({
        user_id: userId,
        name: playlistName,
        description: `Auto-generated • ${duration} phút • ${trackCount} bài`,
      })
      .select()
      .single();

    if (playlistError) {
      this.logger.error('Lỗi tạo playlist:', playlistError);
      throw new Error('Không thể tạo playlist');
    }

    // Generate conversations cho từng topic (text-only, không TTS)
    const items: RadioPlaylistItem[] = [];

    for (let i = 0; i < selectedTopics.length; i++) {
      const scenario = selectedTopics[i];
      this.logger.log(`Generating track ${i + 1}/${trackCount}: ${scenario.topic}`);

      try {
        // Gọi AI Service để generate conversation (chỉ text)
        const result = await this.aiService.generateConversation(
          scenario.topic,
          trackDuration,
          2, // 2 speakers
        );

        // Lưu vào playlist_items
        const { data: item, error: itemError } = await this.supabase
          .from('playlist_items')
          .insert({
            playlist_id: playlist.id,
            topic: scenario.topic,
            conversation: result.script,
            duration: trackDuration,
            num_speakers: 2,
            category: scenario.category,
            sub_category: scenario.subCategory,
            position: i,
          })
          .select()
          .single();

        if (itemError) {
          this.logger.error(`Lỗi lưu item ${i}:`, itemError);
          continue;
        }

        items.push({
          id: item.id,
          topic: scenario.topic,
          conversation: result.script,
          duration: trackDuration,
          numSpeakers: 2,
          category: scenario.category,
          subCategory: scenario.subCategory,
          position: i,
        });
      } catch (error) {
        this.logger.error(`Lỗi generate track ${i}:`, error);
        // Tiếp tục với track tiếp theo
      }
    }

    this.logger.log(`Hoàn thành Radio playlist: ${items.length}/${trackCount} tracks`);

    return {
      playlist: {
        id: playlist.id,
        name: playlistName,
        description: playlist.description,
        duration,
        trackCount: items.length,
      },
      items,
    };
  }
}
