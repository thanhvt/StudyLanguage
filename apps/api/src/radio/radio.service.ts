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
 * Cấp độ mặc định cho Radio Mode — fix intermediate
 * Mục đích: Không cho user chọn, luôn dùng intermediate
 */
const RADIO_DEFAULT_LEVEL = 'intermediate';

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
  // Business - Kinh doanh
  { id: 'business-1', topic: 'Quarterly Business Review', category: 'business', subCategory: 'Meetings' },
  { id: 'business-2', topic: 'Client Pitch Presentation', category: 'business', subCategory: 'Meetings' },
  { id: 'business-3', topic: 'Budget Planning Meeting', category: 'business', subCategory: 'Finance' },
  { id: 'business-4', topic: 'Vendor Contract Negotiation', category: 'business', subCategory: 'Procurement' },
  { id: 'business-5', topic: 'Team Building Discussion', category: 'business', subCategory: 'HR' },
  // Academic - Học thuật
  { id: 'academic-1', topic: 'Study Group Discussion', category: 'academic', subCategory: 'Classroom' },
  { id: 'academic-2', topic: 'Research Paper Review', category: 'academic', subCategory: 'Research' },
  { id: 'academic-3', topic: 'University Admissions Interview', category: 'academic', subCategory: 'Admissions' },
  { id: 'academic-4', topic: 'Lab Experiment Briefing', category: 'academic', subCategory: 'Lab' },
  { id: 'academic-5', topic: 'Thesis Defense Preparation', category: 'academic', subCategory: 'Research' },
  // Travel - Du lịch
  { id: 'travel-1', topic: 'Booking a Hotel Room', category: 'travel', subCategory: 'Accommodation' },
  { id: 'travel-2', topic: 'Renting a Car Abroad', category: 'travel', subCategory: 'Transport' },
  { id: 'travel-3', topic: 'Navigating a Foreign City', category: 'travel', subCategory: 'Exploration' },
  { id: 'travel-4', topic: 'Ordering Food in a Local Restaurant', category: 'travel', subCategory: 'Dining' },
  { id: 'travel-5', topic: 'Dealing with Travel Insurance Claim', category: 'travel', subCategory: 'Emergencies' },
  // Health - Sức khỏe
  { id: 'health-1', topic: 'Visiting the Doctor for a Checkup', category: 'health', subCategory: 'Medical' },
  { id: 'health-2', topic: 'Discussing Workout Plans at the Gym', category: 'health', subCategory: 'Fitness' },
  { id: 'health-3', topic: 'Buying Medicine at the Pharmacy', category: 'health', subCategory: 'Medical' },
  { id: 'health-4', topic: 'Mental Health and Stress Management', category: 'health', subCategory: 'Wellness' },
  { id: 'health-5', topic: 'Emergency Room Visit', category: 'health', subCategory: 'Medical' },
  // Entertainment - Giải trí
  { id: 'entertainment-1', topic: 'Planning a Movie Night', category: 'entertainment', subCategory: 'Movies' },
  { id: 'entertainment-2', topic: 'Discussing a New TV Series', category: 'entertainment', subCategory: 'TV' },
  { id: 'entertainment-3', topic: 'Concert Ticket Booking', category: 'entertainment', subCategory: 'Music' },
  { id: 'entertainment-4', topic: 'Video Game Strategy Discussion', category: 'entertainment', subCategory: 'Gaming' },
  { id: 'entertainment-5', topic: 'Book Club Meeting', category: 'entertainment', subCategory: 'Reading' },
  // Food - Ẩm thực
  { id: 'food-1', topic: 'Ordering at a Restaurant', category: 'food', subCategory: 'Dining' },
  { id: 'food-2', topic: 'Cooking Class with a Chef', category: 'food', subCategory: 'Cooking' },
  { id: 'food-3', topic: 'Grocery Shopping for a Recipe', category: 'food', subCategory: 'Shopping' },
  { id: 'food-4', topic: 'Food Allergy Discussion', category: 'food', subCategory: 'Health' },
  { id: 'food-5', topic: 'Street Food Tour Guide', category: 'food', subCategory: 'Travel' },
  // Sports - Thể thao
  { id: 'sports-1', topic: 'Discussing a Football Match', category: 'sports', subCategory: 'Football' },
  { id: 'sports-2', topic: 'Joining a Running Club', category: 'sports', subCategory: 'Running' },
  { id: 'sports-3', topic: 'Tennis Lesson with a Coach', category: 'sports', subCategory: 'Tennis' },
  { id: 'sports-4', topic: 'Olympic Games Predictions', category: 'sports', subCategory: 'Events' },
  { id: 'sports-5', topic: 'Yoga and Meditation Class', category: 'sports', subCategory: 'Wellness' },
  // Culture - Văn hóa
  { id: 'culture-1', topic: 'Visiting a Museum Exhibition', category: 'culture', subCategory: 'Art' },
  { id: 'culture-2', topic: 'Cultural Differences in Workplace', category: 'culture', subCategory: 'Work' },
  { id: 'culture-3', topic: 'Traditional Festival Celebration', category: 'culture', subCategory: 'Festivals' },
  { id: 'culture-4', topic: 'Language Exchange Meetup', category: 'culture', subCategory: 'Language' },
  { id: 'culture-5', topic: 'Discussing History and Heritage', category: 'culture', subCategory: 'History' },
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
    // S-03 fix: Bao gồm 1 phút — đồng bộ với mobile DURATION_OPTIONS [1, 30, 60, 120]
    const durations = [1, 30, 60, 120];
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
    // Duration 1 phút → 1 track, còn lại mỗi bài ~7 phút
    if (totalDuration <= 1) return 1;
    const avgDurationPerTrack = 7;
    return Math.ceil(totalDuration / avgDurationPerTrack);
  }

  /**
   * Random số speakers cho Radio Mode
   *
   * Mục đích: Đa dạng hoá conversations với 2-4 speakers
   * Tham số đầu vào: không
   * Tham số đầu ra: number (2, 3, hoặc 4)
   * Khi nào sử dụng: Khi generate mỗi track trong playlist
   */
  getRandomSpeakerCount(): number {
    // 60% chance 2 speakers, 25% chance 3, 15% chance 4
    const rand = Math.random();
    if (rand < 0.60) return 2;
    if (rand < 0.85) return 3;
    return 4;
  }

  /**
   * Chọn ngẫu nhiên các topics từ danh sách scenarios
   *
   * Mục đích: Pick random không trùng lặp, hỗ trợ filter theo categories
   * Tham số đầu vào: count - Số topics cần chọn, categories - Filter theo categories (optional)
   * Tham số đầu ra: Mảng các scenario đã chọn
   * Khi nào sử dụng: generateRadioPlaylist() gọi để chọn topics
   */
  pickRandomTopics(count: number, categories?: string[]): typeof SCENARIOS {
    // Filter theo categories nếu có
    let pool = [...SCENARIOS];
    if (categories && categories.length > 0) {
      pool = pool.filter(s => categories.includes(s.category));
      // Fallback nếu filter quá ít
      if (pool.length < count) {
        this.logger.warn(`Chỉ có ${pool.length} scenarios cho categories [${categories.join(',')}], dùng tất cả`);
        pool = [...SCENARIOS];
      }
    }

    // Shuffle array using Fisher-Yates
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
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
   * T-17: Sinh smart topics bằng AI
   *
   * Mục đích: Dùng LLM để generate topics đa dạng, sáng tạo
   * Tham số đầu vào: count - Số topics cần sinh, categories - Filter (optional)
   * Tham số đầu ra: Mảng scenario tương thích với SCENARIOS format
   * Khi nào sử dụng: generateRadioPlaylist() gọi thay vì pickRandomTopics()
   */
  async generateSmartTopics(count: number, categories?: string[]): Promise<typeof SCENARIOS> {
    const categoryHint = categories?.length
      ? `Focus trên các lĩnh vực: ${categories.join(', ')}.`
      : 'Đa dạng các lĩnh vực: công nghệ, đời sống, kinh doanh, học thuật.';

    const prompt = `Generate ${count} chủ đề hội thoại tiếng Anh cho radio podcast.
${categoryHint}
Mỗi chủ đề phải thực tế, thú vị, và phù hợp cho người Việt luyện nghe.
Trả về JSON array, mỗi item có:
- "topic": tên chủ đề (tiếng Anh, ngắn gọn)
- "category": 1 trong [it, daily, personal, business, academic]
- "subCategory": phụ danh mục

Ví dụ: [{"topic":"Sprint Planning Meeting","category":"it","subCategory":"Agile"}]
CHỈ trả JSON, không giải thích.`;

    try {
      const response = await this.aiService.generateText(prompt);

      // Parse JSON từ response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Không parse được JSON từ AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('AI trả về mảng rỗng');
      }

      // Map thành format tương thích SCENARIOS
      return parsed.slice(0, count).map((item: any) => ({
        id: `smart-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        topic: item.topic || 'Random Conversation',
        category: item.category || 'daily',
        subCategory: item.subCategory || 'General',
      }));
    } catch (error) {
      this.logger.warn('generateSmartTopics lỗi, fallback:', error);
      throw error; // Để caller handle fallback
    }
  }

  /**
   * Generate Radio Playlist cho user
   *
   * Mục đích: Tạo playlist hoàn chỉnh (chỉ text, không audio)
   * Tham số đầu vào:
   *   - userId: ID của user
   *   - duration: Thời lượng đã chọn (phút)
   *   - categories: Filter theo categories (optional)
   * Tham số đầu ra: RadioPlaylistResult với playlist và items
   * Khi nào sử dụng: RadioController.generateRadioPlaylist() gọi
   */
  async generateRadioPlaylist(
    userId: string,
    duration: number,
    categories?: string[],
  ): Promise<RadioPlaylistResult> {
    this.logger.log(`Đang tạo Radio playlist ${duration} phút cho user ${userId}`);
    if (categories?.length) {
      this.logger.log(`Filter categories: [${categories.join(', ')}]`);
    }

    // Tính số bài cần generate
    const trackCount = this.calculateTrackCount(duration);
    const trackDuration = this.calculateTrackDuration(duration, trackCount);

    this.logger.log(`Sẽ generate ${trackCount} bài, mỗi bài ~${trackDuration} phút`);

    // T-17: Dùng AI smart topics thay vì hardcoded SCENARIOS
    let selectedTopics: typeof SCENARIOS;
    try {
      selectedTopics = await this.generateSmartTopics(trackCount, categories);
      this.logger.log(`AI sinh ${selectedTopics.length} topics thành công`);
    } catch (err) {
      this.logger.warn('AI smart topics thất bại, dùng random SCENARIOS:', err);
      selectedTopics = this.pickRandomTopics(trackCount, categories);
    }

    // Tạo playlist trong database trước
    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    const playlistName = `Radio ${dateStr} ${timeStr}`;

    const { data: playlist, error: playlistError } = await this.supabase
      .from('playlists')
      .insert({
        user_id: userId,
        name: playlistName,
        description: `${duration} phút • ${trackCount} bài`,
        duration: duration,
      })
      .select()
      .single();

    if (playlistError) {
      this.logger.error('Lỗi tạo playlist:', playlistError);
      throw new Error('Không thể tạo playlist');
    }

    // T-12: Generate conversations with concurrency limit
    // Batch 4 tại 1 thời điểm — tránh API rate limiting với 18 tracks
    const CONCURRENCY = 4;
    const items: RadioPlaylistItem[] = [];

    for (let batchStart = 0; batchStart < selectedTopics.length; batchStart += CONCURRENCY) {
      const batch = selectedTopics.slice(batchStart, batchStart + CONCURRENCY);
      this.logger.log(`Đang generate batch ${Math.floor(batchStart / CONCURRENCY) + 1}: tracks ${batchStart + 1}-${batchStart + batch.length}`);

      const batchPromises = batch.map(async (scenario, batchIdx) => {
        const globalIdx = batchStart + batchIdx;
        const numSpeakers = this.getRandomSpeakerCount();
        this.logger.log(`Generating track ${globalIdx + 1}/${trackCount}: ${scenario.topic} (${numSpeakers} speakers)`);

        // T-05: Level = intermediate (implicit trong prompt AI)
        const result = await this.aiService.generateConversation(
          scenario.topic,
          trackDuration,
          numSpeakers,
        );

        return { scenario, result, numSpeakers, position: globalIdx };
      });

      const settled = await Promise.allSettled(batchPromises);

      // Xử lý kết quả batch
      for (const outcome of settled) {
        if (outcome.status === 'rejected') {
          this.logger.error('Lỗi generate track:', outcome.reason);
          continue;
        }

        const { scenario, result, numSpeakers, position } = outcome.value;

        // Lưu vào playlist_items
        const { data: item, error: itemError } = await this.supabase
          .from('playlist_items')
          .insert({
            playlist_id: playlist.id,
            topic: scenario.topic,
            conversation: result.script,
            duration: trackDuration,
            num_speakers: numSpeakers,
            category: scenario.category,
            sub_category: scenario.subCategory,
            position,
          })
          .select()
          .single();

        if (itemError) {
          this.logger.error(`Lỗi lưu item ${position}:`, itemError);
          continue;
        }

        items.push({
          id: item.id,
          topic: scenario.topic,
          conversation: result.script,
          duration: trackDuration,
          numSpeakers,
          category: scenario.category,
          subCategory: scenario.subCategory,
          position,
        });
      }
    }

    // Sắp xếp theo position (vì Promise.allSettled có thể trả về không đúng thứ tự)
    items.sort((a, b) => a.position - b.position);

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
