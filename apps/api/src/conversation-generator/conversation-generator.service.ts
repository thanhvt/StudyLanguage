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

  // Ngưỡng số lượt để chuyển sang chunked generation
  // Dưới ngưỡng này → dùng single-call (5 phút, ~12-14 lượt)
  // Trên ngưỡng → chia chunks (10+ phút)
  // Giảm từ 40→20 vì single-call không ổn định với >20 lượt
  private readonly CHUNK_THRESHOLD_TURNS = 20;

  // Buffer 5%: bù cho sai lệch nhỏ giữa ước tính và thực tế
  // (Giảm từ 15% xuống 5% vì prompt cải tiến giờ sinh đúng 60-80 từ/lượt)
  private readonly WORDS_BUFFER_PERCENT = 1.05;

  // Tốc độ nói ước tính của TTS (từ/phút)
  private readonly TTS_WORDS_PER_MINUTE = 150;

  // Số lượt tối đa mỗi chunk (LLM xử lý tốt nhất ở mức này)
  private readonly MAX_TURNS_PER_CHUNK = 30;

  // Số lần retry tối đa cho mỗi chunk
  private readonly MAX_CHUNK_RETRIES = 2;

  /**
   * Sinh hội thoại tiếng Anh theo chủ đề và thời lượng
   *
   * Mục đích: Tạo đoạn hội thoại tự nhiên để học tiếng Anh
   * Tham số đầu vào:
   *   - topic: Chủ đề hội thoại (vd: "ordering coffee", "job interview")
   *   - durationMinutes: Thời lượng hội thoại (5-30 phút)
   *   - level: Trình độ (beginner | intermediate | advanced)
   *   - includeVietnamese: Có thêm bản dịch tiếng Việt không
   * Tham số đầu ra: Object chứa script hội thoại
   * Luồng gọi: Controller -> Service -> Groq API -> Parse JSON
   *
   * Tính toán:
   *   - Tốc độ TTS: ~150 từ/phút + buffer 5%
   *   - totalExchanges = totalWords / 65 (avg words/turn)
   *   - Nếu <= 20 lượt → single-call
   *   - Nếu > 20 lượt → chunked generation (chia 2-4 chunks)
   */
  async generateConversation(options: {
    topic: string;
    durationMinutes?: number;
    level?: 'beginner' | 'intermediate' | 'advanced';
    includeVietnamese?: boolean;
    keywords?: string;
    numSpeakers?: number;
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
      durationMinutes: rawDuration = 5,
      level = 'intermediate',
      includeVietnamese = true,
      keywords,
      numSpeakers: rawSpeakers = 2,
    } = options;

    // === Defensive validation (DTO đã validate, nhưng guard cho direct calls) ===
    if (!topic || topic.trim().length < 3) {
      throw new Error('Topic phải có ít nhất 3 ký tự');
    }
    const numSpeakers = Math.min(Math.max(rawSpeakers, 2), 4);
    const durationMinutes = Math.min(Math.max(rawDuration, 3), 30);

    // Buffer 5%: bù cho sai lệch nhỏ giữa ước tính và thực tế
    const totalWords = Math.ceil(
      durationMinutes * this.TTS_WORDS_PER_MINUTE * this.WORDS_BUFFER_PERCENT,
    );

    // Tính toán số lượt trao đổi dựa trên tổng số từ mục tiêu
    // LLM với prompt cải tiến sinh ~65 từ/lượt → totalExchanges = totalWords / 65
    // Làm tròn lên bội số numSpeakers để round-robin đều
    const rawExchanges = Math.ceil(totalWords / 65);
    const totalExchanges = Math.ceil(rawExchanges / numSpeakers) * numSpeakers;
    const exchangesPerPerson = Math.ceil(totalExchanges / numSpeakers);

    // Tạo danh sách tên thật cho speakers theo số lượng
    const allSpeakerNames = ['Sarah', 'Mike', 'Lisa', 'David'];
    const speakerNames = allSpeakerNames.slice(0, numSpeakers);

    this.logger.log(
      `Đang sinh hội thoại: "${topic}" - ${durationMinutes} phút - ${numSpeakers} người - ${totalExchanges} lượt - ${totalWords} từ (có buffer) - Level: ${level}`,
    );

    // === ROUTING: Chọn single-call hoặc chunked generation ===
    if (totalExchanges > this.CHUNK_THRESHOLD_TURNS) {
      this.logger.log(
        `Hội thoại dài (${totalExchanges} lượt > ${this.CHUNK_THRESHOLD_TURNS}) → sử dụng Chunked Generation`,
      );
      return this.generateChunkedConversation({
        topic,
        durationMinutes,
        level,
        includeVietnamese,
        keywords,
        numSpeakers,
        totalExchanges,
        totalWords,
        speakerNames,
        exchangesPerPerson,
      });
    }

    // === SINGLE-CALL PATH: Hội thoại ngắn (5-10 phút) ===
    this.logger.log(
      `Hội thoại ngắn (${totalExchanges} lượt <= ${this.CHUNK_THRESHOLD_TURNS}) → sử dụng Single-call`,
    );
    return this.generateSingleCallConversation({
      topic,
      durationMinutes,
      level,
      includeVietnamese,
      keywords,
      numSpeakers,
      totalExchanges,
      totalWords,
      speakerNames,
      exchangesPerPerson,
    });
  }

  /**
   * Sinh hội thoại ngắn bằng 1 lần gọi LLM (logic gốc)
   *
   * Mục đích: Xử lý hội thoại <= 40 lượt, không cần chia chunks
   * Tham số đầu vào: Các thông số đã tính toán từ generateConversation
   * Tham số đầu ra: Script hội thoại hoàn chỉnh + vocabulary
   * Khi nào sử dụng: Khi totalExchanges <= CHUNK_THRESHOLD_TURNS
   */
  private async generateSingleCallConversation(params: {
    topic: string;
    durationMinutes: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    includeVietnamese: boolean;
    keywords?: string;
    numSpeakers: number;
    totalExchanges: number;
    totalWords: number;
    speakerNames: string[];
    exchangesPerPerson: number;
  }): Promise<{
    script: { speaker: string; text: string; translation?: string; keyPhrases?: string[] }[];
    vocabulary: { word: string; meaning: string; example: string }[];
  }> {
    const {
      topic, durationMinutes, level, includeVietnamese, keywords,
      numSpeakers, totalExchanges, totalWords, speakerNames, exchangesPerPerson,
    } = params;

    const speakerList = speakerNames.join(', ');
    const speakerDistribution = speakerNames
      .map(name => `${name} speaks ${exchangesPerPerson} times`)
      .join(', ');

    /**
     * Ước tính max_tokens dựa trên cấu trúc output thực tế
     *
     * Cấu trúc mỗi turn:
     *   - speaker + JSON keys: ~15 tokens
     *   - text (60-80 words): ~100 tokens
     *   - translation (tiếng Việt): ~100 tokens (nếu có)
     *   - keyPhrases (2-3 items): ~40 tokens
     *   → Tổng: ~255 tokens/turn (có translation) hoặc ~155 tokens/turn (không translation)
     */
    const tokensPerTurn = includeVietnamese ? 300 : 180;
    const vocabularyTokens = 300;
    const estimatedTokens = totalExchanges * tokensPerTurn + vocabularyTokens;
    const bufferedTokens = Math.ceil(estimatedTokens * 1.3);
    const maxTokens = Math.min(32000, Math.max(4096, bufferedTokens));

    const levelGuide = {
      beginner: 'Use simple vocabulary, short sentences, common phrases. Speak clearly and slowly.',
      intermediate: 'Use everyday vocabulary, moderate sentence complexity. Include some idioms and phrasal verbs naturally.',
      advanced: 'Use sophisticated vocabulary, complex structures, idioms, slang, and domain-specific jargon when relevant to the topic. Include contractions, filler words ("you know", "I mean", "honestly"), and natural speech patterns.',
    };

    // Hướng dẫn phong cách hội thoại theo level
    const levelStyleGuide = {
      beginner: '',
      intermediate: `- Occasionally use common idioms and phrasal verbs (e.g., "figure out", "run into", "hang in there")`,
      advanced: `- Use slang and colloquial expressions naturally (e.g., "that's a rip-off", "no-brainer", "the whole nine yards")
- Include some domain-specific terms related to "${topic}"
- Use filler words sparingly for realism ("honestly", "you know", "I mean", "basically")`,
    };

    const translationInstruction = includeVietnamese
      ? `- Include a "translation" field with Vietnamese translation for each turn`
      : `- Do NOT include "translation" field`;
    const keywordsInstruction = keywords
      ? `- Use the following keywords in the conversation: ${keywords}`
      : '';
    const prompt = `Generate a natural English conversation about "${topic}".

=== CRITICAL: TURN LENGTH REQUIREMENTS ===
⚠️ MINIMUM 60 words per turn. Each turn MUST contain AT LEAST 3 full sentences.
- Target: 60-80 words per turn (3-4 sentences)
- NEVER write turns shorter than 50 words

❌ BAD (too short, robotic):
"I'd like a coffee please. What do you recommend? I'll take that one."

✅ GOOD (65 words, natural, sounds like a real person):
"Oh man, I've been dying to try this place! My coworker wouldn't stop raving about their iced latte. I usually go for something sweet, like a caramel macchiato, but I'm feeling adventurous today. What's your usual order? I'm totally lost looking at this menu, there are way too many options."

=== NATURAL CONVERSATION STYLE ===
- Write like REAL people talk, not like a textbook dialogue
- Speakers DON'T always ask questions at the end of their turn
- Sometimes a speaker just shares a story, gives an opinion, or reacts emotionally — without prompting
- Include natural transitions: agreeing, disagreeing, interrupting, changing angles on the same topic
- Vary turn patterns: some turns share personal anecdotes, some express frustration/excitement, some give advice
- Avoid making every single turn follow the same structure
${levelStyleGuide[level] || ''}

=== REQUIREMENTS ===
- Speakers: ${numSpeakers} (${speakerList})
- Target duration: ${durationMinutes} minutes (approximately ${totalWords} words total)
- Total exchanges: exactly ${totalExchanges} turns (${speakerDistribution}, alternating in round-robin order)
- Level: ${level.toUpperCase()} - ${levelGuide[level]}
- Tone: casual, everyday, natural — like friends or colleagues chatting
- Stay on topic: "${topic}"
- DO NOT repeat the same ideas or phrases across turns
${translationInstruction}
${keywordsInstruction}
- Include 2-3 key phrases per turn that are useful to learn (in "keyPhrases" field)
- Include a "vocabulary" array with 5-8 useful words/phrases from the conversation

=== OUTPUT FORMAT ===
{
  "script": [
    {
      "speaker": "${speakerNames[0]}",
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

    this.logger.log(
      `Prompt input (maxTokens: ${maxTokens}, estimated: ${estimatedTokens}): `,
      prompt,
    );

    const callGroqAndParse = async () => {
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
      const finishReason = response.choices[0]?.finish_reason;
      this.logger.log(
        `Đã nhận response từ Groq API (finish_reason: ${finishReason}, content length: ${content.length})`,
      );

      if (finishReason === 'length') {
        throw new Error(
          `Response bị cắt ngang do hết max_tokens (${maxTokens}). Cần tăng maxTokens hoặc giảm độ dài hội thoại.`,
        );
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Không tìm thấy JSON trong response');
      }

      // Sanitize JSON trước khi parse (LLM đôi khi thêm trailing comma, comment)
      const rawJson = jsonMatch[0];
      const sanitized = rawJson
        .replace(/,\s*([}\]])/g, '$1')   // trailing commas
        .replace(/\/\/.*$/gm, '');        // inline comments

      try {
        return JSON.parse(sanitized);
      } catch (parseError) {
        throw new Error(`JSON parse lỗi: ${parseError instanceof Error ? parseError.message : String(parseError)}. Raw (200 chars): ${rawJson.substring(0, 200)}`);
      }
    };

    try {
      let parsed = await callGroqAndParse();
      parsed = this.validateAndNormalizeSpeakers(parsed, speakerNames, numSpeakers);

      const uniqueSpeakers = [...new Set(
        (parsed.script || []).map((line: { speaker: string }) => line.speaker),
      )];

      if (uniqueSpeakers.length < numSpeakers) {
        this.logger.warn(
          `LLM trả ${uniqueSpeakers.length} speakers, yêu cầu ${numSpeakers}. Đang retry 1 lần...`,
        );
        try {
          let retryParsed = await callGroqAndParse();
          retryParsed = this.validateAndNormalizeSpeakers(retryParsed, speakerNames, numSpeakers);
          const retryUniqueSpeakers = [...new Set(
            (retryParsed.script || []).map((line: { speaker: string }) => line.speaker),
          )];
          if (retryUniqueSpeakers.length >= numSpeakers) {
            this.logger.log(`Retry thành công: ${retryUniqueSpeakers.length} speakers`);
            parsed = retryParsed;
          } else {
            this.logger.warn(
              `Retry vẫn thiếu speakers (${retryUniqueSpeakers.length}/${numSpeakers}). Sử dụng kết quả tốt nhất.`,
            );
            if (retryUniqueSpeakers.length > uniqueSpeakers.length) {
              parsed = retryParsed;
            }
          }
        } catch (retryError) {
          this.logger.warn('Retry thất bại, dùng kết quả ban đầu:', retryError);
        }
      }

      const scriptLength = parsed.script?.length || 0;
      const totalWordCount = parsed.script?.reduce(
        (sum: number, line: { text: string }) =>
          sum + line.text.split(/\s+/).length,
        0,
      ) || 0;
      const finalSpeakers = [...new Set(
        (parsed.script || []).map((line: { speaker: string }) => line.speaker),
      )];
      this.logger.log(
        `Sinh hội thoại thành công: ${scriptLength} lượt, ${totalWordCount} từ / ${totalWords} mục tiêu, ${parsed.vocabulary?.length || 0} từ vựng, ${finalSpeakers.length}/${numSpeakers} speakers`,
      );

      return parsed;
    } catch (error) {
      this.logger.error('Lỗi khi gọi Groq API:', error);
      throw error;
    }
  }

  /**
   * Chuẩn hóa tên speaker trong script về đúng danh sách yêu cầu
   *
   * Mục đích: Fix trường hợp LLM đổi tên (Dave → David, Alex → Lisa)
   * Tham số đầu vào:
   *   - parsed: Object đã parse từ JSON response (chứa script[])
   *   - expectedNames: Danh sách tên đúng (['Sarah', 'Mike', 'Lisa', 'David'])
   *   - numSpeakers: Số speakers yêu cầu
   * Tham số đầu ra: Object đã chuẩn hóa tên speaker
   * Khi nào sử dụng: Sau khi parse JSON từ Groq API, trước khi validate số speakers
   */
  private validateAndNormalizeSpeakers(
    parsed: any,
    expectedNames: string[],
    numSpeakers: number,
  ): any {
    if (!parsed.script || !Array.isArray(parsed.script)) {
      return parsed;
    }

    // Lấy danh sách unique speakers trong response
    const responseSpeakers = [...new Set(
      parsed.script.map((line: { speaker: string }) => line.speaker),
    )] as string[];

    // Tạo mapping: tên trong response → tên đúng (fuzzy match)
    const nameMapping: Record<string, string> = {};

    for (const responseName of responseSpeakers) {
      // Kiểm tra exact match trước
      if (expectedNames.includes(responseName)) {
        nameMapping[responseName] = responseName;
        continue;
      }

      // Fuzzy match: tìm tên gần giống nhất (3 ký tự đầu giống hoặc substring)
      const matched = expectedNames.find(expected => {
        const rLower = responseName.toLowerCase();
        const eLower = expected.toLowerCase();
        // Tên bắt đầu giống nhau (ít nhất 3 ký tự)
        if (rLower.substring(0, 3) === eLower.substring(0, 3)) return true;
        // Chứa nhau
        if (rLower.includes(eLower) || eLower.includes(rLower)) return true;
        return false;
      });

      if (matched) {
        nameMapping[responseName] = matched;
        this.logger.log(`Chuẩn hóa tên speaker: "${responseName}" → "${matched}"`);
      } else {
        // Không match → gán tên chưa dùng
        const usedNames = Object.values(nameMapping);
        const availableName = expectedNames.find(n => !usedNames.includes(n));
        if (availableName) {
          nameMapping[responseName] = availableName;
          this.logger.log(`Ánh xạ tên speaker mới: "${responseName}" → "${availableName}"`);
        } else {
          // Hết tên → giữ nguyên
          nameMapping[responseName] = responseName;
        }
      }
    }

    // Apply mapping lên script
    parsed.script = parsed.script.map((line: { speaker: string; [key: string]: any }) => ({
      ...line,
      speaker: nameMapping[line.speaker] || line.speaker,
    }));

    return parsed;
  }

  // ============================================
  // CHUNKED GENERATION METHODS
  // ============================================

  /**
   * Gọi Groq API và parse response JSON (helper dùng chung)
   *
   * Mục đích: Tách logic gọi API + parse thành method reusable
   * Tham số đầu vào:
   *   - prompt: Nội dung prompt gửi đến LLM
   *   - maxTokens: Giới hạn số tokens cho response
   *   - temperature: Độ sáng tạo (0-1)
   * Tham số đầu ra: Object đã parse từ JSON response
   * Khi nào sử dụng: Được gọi bởi generateChunk và generateStoryOutline
   */
  private async callGroqAndParseJson(
    prompt: string,
    maxTokens: number,
    temperature = 0.8,
  ): Promise<any> {
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
      temperature,
      max_tokens: maxTokens,
    });

    const content = response.choices[0]?.message?.content || '';
    const finishReason = response.choices[0]?.finish_reason;
    this.logger.log(
      `Groq response (finish_reason: ${finishReason}, content length: ${content.length})`,
    );

    if (finishReason === 'length') {
      throw new Error(
        `Response bị cắt ngang do hết max_tokens (${maxTokens})`,
      );
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Không tìm thấy JSON trong response');
    }

    // Sanitize JSON trước khi parse (LLM đôi khi thêm trailing comma, comment)
    const rawJson = jsonMatch[0];
    const sanitized = rawJson
      .replace(/,\s*([}\]])/g, '$1')   // trailing commas
      .replace(/\/\/.*$/gm, '');        // inline comments

    try {
      return JSON.parse(sanitized);
    } catch (parseError) {
      throw new Error(`JSON parse lỗi: ${parseError instanceof Error ? parseError.message : String(parseError)}. Raw (200 chars): ${rawJson.substring(0, 200)}`);
    }
  }

  /**
   * Sinh story outline (dàn ý) cho toàn bộ cuộc hội thoại
   *
   * Mục đích: Tạo "xương sống" cho conversation, chia thành các phases
   *   với plotPoints cụ thể để đảm bảo nội dung liền mạch, không trôi topic
   * Tham số đầu vào:
   *   - topic: Chủ đề hội thoại
   *   - numChunks: Số phases/chunks cần chia
   *   - speakerNames: Danh sách tên speakers
   *   - level: Trình độ
   *   - durationMinutes: Thời lượng tổng
   * Tham số đầu ra: Mảng các PhaseOutline, mỗi phần có plotPoints và mustAvoidTopics
   * Khi nào sử dụng: Bước đầu tiên của chunked generation, trước khi sinh chunks
   */
  private async generateStoryOutline(params: {
    topic: string;
    numChunks: number;
    speakerNames: string[];
    level: string;
    durationMinutes: number;
    turnsPerChunk: number[];
  }): Promise<{
    phases: {
      phaseNumber: number;
      title: string;
      plotPoints: string[];
      emotionalArc: string;
      mustIncludeTopics: string[];
      mustAvoidTopics: string[];
    }[];
  }> {
    const { topic, numChunks, speakerNames, level, durationMinutes, turnsPerChunk } = params;

    const prompt = `Create a detailed conversation outline about "${topic}" for ${speakerNames.length} speakers (${speakerNames.join(', ')}).
The conversation is ${durationMinutes} minutes long, level: ${level}, divided into ${numChunks} phases.

For EACH phase, provide:
1. A short title describing the phase focus
2. 3-4 specific plot points (concrete events/actions, NOT generic statements)
3. Emotional arc (how speakers feel during this phase)
4. Key topics that MUST be discussed in this phase
5. Topics that MUST NOT be discussed yet (save for later phases)

=== IMPORTANT RULES ===
- ALL phases must stay focused on the main topic: "${topic}"
- Each phase should explore a DIFFERENT ASPECT of the topic
- Plot points must be SPECIFIC and ACTIONABLE (not vague like "they discuss the topic")
- The phases should tell a story with a clear arc: setup → development → climax → resolution
- Phase ${numChunks} must wrap up the conversation naturally

=== OUTPUT FORMAT ===
{
  "phases": [
    {
      "phaseNumber": 1,
      "title": "Short descriptive title",
      "targetTurns": ${turnsPerChunk[0]},
      "plotPoints": ["specific event 1", "specific event 2", "specific event 3"],
      "emotionalArc": "curious → worried → determined",
      "mustIncludeTopics": ["topic A", "topic B"],
      "mustAvoidTopics": ["topic C (save for phase 2)", "topic D (save for phase 3)"]
    }
  ]
}

RETURN ONLY VALID JSON, NO OTHER TEXT.`;

    this.logger.log(`Đang sinh story outline cho "${topic}" (${numChunks} phases)...`);

    try {
      const parsed = await this.callGroqAndParseJson(prompt, 2000, 0.7);

      if (!parsed.phases || !Array.isArray(parsed.phases) || parsed.phases.length < numChunks) {
        this.logger.warn(
          `Outline chỉ có ${parsed.phases?.length || 0} phases, cần ${numChunks}. Tạo outline mặc định.`,
        );
        return this.buildDefaultOutline(params);
      }

      this.logger.log(
        `Sinh outline thành công: ${parsed.phases.length} phases - ${parsed.phases.map((p: any) => p.title).join(' → ')}`,
      );
      return parsed;
    } catch (error) {
      this.logger.warn('Lỗi sinh outline, sử dụng outline mặc định:', error);
      return this.buildDefaultOutline(params);
    }
  }

  /**
   * Tạo outline mặc định khi LLM không sinh được
   *
   * Mục đích: Fallback đảm bảo luôn có outline để chunked generation hoạt động
   * Tham số đầu vào: Các tham số giống generateStoryOutline
   * Tham số đầu ra: PhaseOutline mặc định với 4 phases tiêu chuẩn
   * Khi nào sử dụng: Khi generateStoryOutline thất bại hoặc trả kết quả không hợp lệ
   */
  private buildDefaultOutline(params: {
    topic: string;
    numChunks: number;
    turnsPerChunk: number[];
  }): {
    phases: {
      phaseNumber: number;
      title: string;
      plotPoints: string[];
      emotionalArc: string;
      mustIncludeTopics: string[];
      mustAvoidTopics: string[];
    }[];
  } {
    const { topic, numChunks, turnsPerChunk } = params;
    const defaultPhases = [
      {
        title: `Introduction - Setting up the situation about "${topic}"`,
        emotionalArc: 'curious → interested → engaged',
        plotPoints: [
          `Introduce the situation related to "${topic}"`,
          'Speakers share their initial thoughts and experiences',
          'Identify the main challenge or question',
        ],
      },
      {
        title: `Development - Exploring different aspects of "${topic}"`,
        emotionalArc: 'engaged → concerned → brainstorming',
        plotPoints: [
          'Discuss specific details and challenges',
          'Share personal experiences or advice',
          'Consider different options or approaches',
        ],
      },
      {
        title: `Climax - Dealing with the main challenge of "${topic}"`,
        emotionalArc: 'nervous → hopeful → determined',
        plotPoints: [
          'Face the main challenge directly',
          'Negotiate or work through the problem',
          'Find potential solutions together',
        ],
      },
      {
        title: `Resolution - Wrapping up "${topic}"`,
        emotionalArc: 'relieved → satisfied → optimistic',
        plotPoints: [
          'Reach a conclusion or resolution',
          'Share lessons learned',
          'Look forward and make future plans',
        ],
      },
    ];

    return {
      phases: defaultPhases.slice(0, numChunks).map((phase, i) => ({
        phaseNumber: i + 1,
        title: phase.title,
        plotPoints: phase.plotPoints,
        emotionalArc: phase.emotionalArc,
        mustIncludeTopics: [],
        mustAvoidTopics: [],
        targetTurns: turnsPerChunk[i],
      })),
    };
  }

  /**
   * Validate kết quả 1 chunk sau khi sinh
   *
   * Mục đích: Kiểm tra chunk có đạt yêu cầu về số lượt, số từ không
   * Tham số đầu vào:
   *   - script: Mảng các lượt nói trong chunk
   *   - targetTurns: Số lượt mục tiêu cho chunk này
   *   - targetWordsPerTurn: Số từ trung bình mục tiêu mỗi lượt (mặc định 65)
   * Tham số đầu ra: Object validation với isValid, actualTurns, actualWords, avgWordsPerTurn
   * Khi nào sử dụng: Sau khi sinh mỗi chunk, trước khi quyết định retry hay chấp nhận
   */
  private validateChunk(
    script: { speaker: string; text: string }[],
    targetTurns: number,
  ): {
    isValid: boolean;
    actualTurns: number;
    totalWords: number;
    avgWordsPerTurn: number;
    issues: string[];
  } {
    const actualTurns = script.length;
    const totalWords = script.reduce(
      (sum, line) => sum + line.text.split(/\s+/).length,
      0,
    );
    const avgWordsPerTurn = actualTurns > 0 ? Math.round(totalWords / actualTurns) : 0;
    const issues: string[] = [];

    // Kiểm tra số lượt (cho phép sai lệch 10%)
    if (actualTurns < targetTurns * 0.9) {
      issues.push(
        `Thiếu lượt: ${actualTurns}/${targetTurns} (cần >= ${Math.ceil(targetTurns * 0.9)})`,
      );
    }

    // Kiểm tra số từ trung bình mỗi lượt (tối thiểu 40 từ - LLM thường sinh 35-50)
    if (avgWordsPerTurn < 40) {
      issues.push(
        `Từ/lượt quá ít: ${avgWordsPerTurn} (cần >= 40)`,
      );
    }

    const isValid = issues.length === 0;
    return { isValid, actualTurns, totalWords, avgWordsPerTurn, issues };
  }

  /**
   * Tạo tóm tắt nội dung đã sinh từ các chunks trước
   *
   * Mục đích: Tạo "TOPICS ALREADY COVERED" để truyền vào prompt chunk tiếp theo
   *   nhằm tránh LLM lặp lại nội dung
   * Tham số đầu vào: allPreviousTurns - tất cả lượt nói đã sinh từ các chunks trước
   * Tham số đầu ra: String tóm tắt ngắn gọn (8-10 câu đại diện)
   * Khi nào sử dụng: Trước khi sinh chunk 2, 3, 4 — truyền vào buildChunkPrompt
   */
  private buildPreviousSummary(
    allPreviousTurns: { speaker: string; text: string }[],
  ): string {
    if (allPreviousTurns.length === 0) return '';

    // Lấy 8-10 lượt tiêu biểu trải đều qua conversation
    const maxSamples = Math.min(10, allPreviousTurns.length);
    const step = Math.max(1, Math.floor(allPreviousTurns.length / maxSamples));
    const keyTurns: string[] = [];

    for (let i = 0; i < allPreviousTurns.length && keyTurns.length < maxSamples; i += step) {
      const turn = allPreviousTurns[i];
      // Cắt ngắn text để không chiếm quá nhiều tokens
      const shortText = turn.text.length > 100
        ? turn.text.substring(0, 100) + '...'
        : turn.text;
      keyTurns.push(`- ${turn.speaker}: "${shortText}"`);
    }

    return keyTurns.join('\n');
  }

  /**
   * Sinh 1 chunk hội thoại với context từ chunks trước
   *
   * Mục đích: Gọi LLM sinh 1 phần hội thoại (20-30 lượt) với context bridge
   *   đảm bảo nội dung liền mạch và không lặp
   * Tham số đầu vào:
   *   - phase: Outline phase hiện tại (plotPoints, mustAvoidTopics)
   *   - chunkIndex: Số thứ tự chunk (0-based)
   *   - previousTurns: 5-8 lượt cuối chunk trước (context bridge)
   *   - previousSummary: Tóm tắt nội dung đã nói
   *   - speakerNames, level, includeVietnamese, keywords, topic
   * Tham số đầu ra: Mảng các lượt nói cho chunk này
   * Khi nào sử dụng: Được gọi bởi generateChunkedConversation cho mỗi chunk
   */
  private async generateChunk(params: {
    topic: string;
    phase: {
      phaseNumber: number;
      title: string;
      plotPoints: string[];
      emotionalArc: string;
      mustIncludeTopics: string[];
      mustAvoidTopics: string[];
    };
    chunkIndex: number;
    totalChunks: number;
    targetTurns: number;
    previousTurns: { speaker: string; text: string }[];
    previousSummary: string;
    speakerNames: string[];
    level: string;
    includeVietnamese: boolean;
    keywords?: string;
  }): Promise<{ speaker: string; text: string; translation?: string; keyPhrases?: string[] }[]> {
    const {
      topic, phase, chunkIndex, totalChunks, targetTurns,
      previousTurns, previousSummary, speakerNames, level,
      includeVietnamese, keywords,
    } = params;

    const speakerList = speakerNames.join(', ');
    const isFirstChunk = chunkIndex === 0;
    const isLastChunk = chunkIndex === totalChunks - 1;

    const levelGuide: Record<string, string> = {
      beginner: 'Use simple vocabulary, short sentences, common phrases. Speak clearly and slowly.',
      intermediate: 'Use everyday vocabulary, moderate sentence complexity. Include some idioms and phrasal verbs naturally.',
      advanced: 'Use sophisticated vocabulary, complex structures, idioms, slang, and domain-specific jargon when relevant to the topic. Include contractions, filler words ("you know", "I mean", "honestly"), and natural speech patterns.',
    };

    // Hướng dẫn phong cách hội thoại theo level
    const levelStyleGuide: Record<string, string> = {
      beginner: '',
      intermediate: `- Occasionally use common idioms and phrasal verbs (e.g., "figure out", "run into", "hang in there")`,
      advanced: `- Use slang and colloquial expressions naturally (e.g., "that's a rip-off", "no-brainer", "the whole nine yards")
- Include some domain-specific terms related to "${topic}"
- Use filler words sparingly for realism ("honestly", "you know", "I mean", "basically")`,
    };

    // Context bridge: 5-8 lượt cuối chunk trước
    const contextBridge = previousTurns.length > 0
      ? `=== PREVIOUS CONTEXT (continue naturally from here) ===\n${previousTurns.map(t => `${t.speaker}: "${t.text}"`).join('\n')}\n\n`
      : '';

    // Tóm tắt nội dung đã nói (tránh lặp)
    const summarySection = previousSummary
      ? `=== TOPICS ALREADY COVERED (DO NOT REPEAT these ideas) ===\n${previousSummary}\n\n`
      : '';

    // Instruction đặc biệt cho chunk đầu và chunk cuối
    const positionInstruction = isFirstChunk
      ? '- This is the OPENING of the conversation. Start naturally with greetings or introducing the topic.'
      : isLastChunk
        ? '- This is the FINAL part. Wrap up the conversation naturally with conclusions, lessons learned, or future plans.'
        : '- This is the MIDDLE of the conversation. Continue naturally from the previous context.';

    const translationInstruction = includeVietnamese
      ? `- Include a "translation" field with Vietnamese translation for each turn`
      : `- Do NOT include "translation" field`;

    const keywordsInstruction = keywords
      ? `- Try to use these keywords naturally: ${keywords}`
      : '';

    const mustAvoidSection = phase.mustAvoidTopics.length > 0
      ? `- DO NOT discuss these topics yet (they are for later phases): ${phase.mustAvoidTopics.join(', ')}`
      : '';

    const prompt = `${isFirstChunk ? `Generate` : `Continue`} a natural English conversation about "${topic}".

${contextBridge}${summarySection}=== YOUR TASK: Phase ${phase.phaseNumber}/${totalChunks} - "${phase.title}" ===
Generate exactly ${targetTurns} turns for this phase.

Plot points to cover in this phase:
${phase.plotPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Emotional arc: ${phase.emotionalArc}

=== CRITICAL: TURN LENGTH REQUIREMENTS ===
⚠️ MINIMUM 60 words per turn. Each turn MUST contain AT LEAST 3 full sentences.
- Target: 60-80 words per turn (3-4 sentences)
- NEVER write turns shorter than 50 words

❌ BAD (too short, robotic):
"I think we should check the weight first. Let me help you with that."

✅ GOOD (65 words, natural and detailed):
"I've been meaning to check the weight limit for this airline, but I completely forgot until now. Last time I flew economy, the limit was around 23 kilos, and I barely made it. I packed way too many souvenirs this time though, so I'm genuinely worried. Fingers crossed they don't charge me an arm and a leg for the extra weight."

=== NATURAL CONVERSATION STYLE ===
- Write like REAL people talk, not like a textbook dialogue
- Speakers DON'T always ask questions at the end of their turn
- Sometimes a speaker just shares a story, gives an opinion, or reacts emotionally — without being prompted
- Include natural transitions: agreeing, disagreeing, jumping in with a related thought, sharing personal experiences
- Vary turn patterns: some turns are anecdotes, some are reactions, some are advice, some are complaints
- Avoid repetitive structures — not every turn should follow "opinion + detail + question"
${levelStyleGuide[level] || levelGuide.intermediate}

=== REQUIREMENTS ===
- Speakers: ${speakerNames.length} (${speakerList}), alternating in round-robin order
- Level: ${level.toUpperCase()} - ${levelGuide[level] || levelGuide.intermediate}
- Tone: casual, everyday, natural — like friends or colleagues chatting
${positionInstruction}
- MUST stay focused on the main topic: "${topic}"
- MUST cover ALL the plot points listed above
- DO NOT repeat ideas, phrases, or sentences from previous phases
${translationInstruction}
${keywordsInstruction}
${mustAvoidSection}
- Include 2-3 key phrases per turn in "keyPhrases" field

=== OUTPUT FORMAT ===
{
  "script": [
    {
      "speaker": "${speakerNames[0]}",
      "text": "[MINIMUM 60 words here - express thought, add details, ask question]",
      ${includeVietnamese ? '"translation": "...",' : ''}
      "keyPhrases": ["phrase 1", "phrase 2"]
    }
  ]
}

RETURN ONLY VALID JSON, NO OTHER TEXT.`;

    // Ước tính maxTokens cho chunk này (tăng buffer cho Vietnamese translation)
    const tokensPerTurn = includeVietnamese ? 300 : 180;
    const maxTokens = Math.min(20000, Math.max(4096, Math.ceil(targetTurns * tokensPerTurn * 1.3)));

    this.logger.log(
      `Đang sinh chunk ${chunkIndex + 1}/${totalChunks}: "${phase.title}" - ${targetTurns} lượt (maxTokens: ${maxTokens})`,
    );

    const parsed = await this.callGroqAndParseJson(prompt, maxTokens);

    if (!parsed.script || !Array.isArray(parsed.script)) {
      throw new Error(`Chunk ${chunkIndex + 1}: Response không có script array`);
    }

    return parsed.script;
  }

  /**
   * Điều phối toàn bộ flow Chunked Generation
   *
   * Mục đích: Orchestrate việc sinh hội thoại dài bằng cách:
   *   1. Sinh story outline
   *   2. Sinh từng chunk với context bridge
   *   3. Validate + retry mỗi chunk
   *   4. Merge tất cả chunks + sinh vocabulary
   * Tham số đầu vào: Các tham số đã tính toán từ generateConversation
   * Tham số đầu ra: Script hội thoại hoàn chỉnh + vocabulary
   * Khi nào sử dụng: Khi totalExchanges > CHUNK_THRESHOLD_TURNS (hội thoại 15-30 phút)
   */
  private async generateChunkedConversation(params: {
    topic: string;
    durationMinutes: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    includeVietnamese: boolean;
    keywords?: string;
    numSpeakers: number;
    totalExchanges: number;
    totalWords: number;
    speakerNames: string[];
    exchangesPerPerson: number;
  }): Promise<{
    script: { speaker: string; text: string; translation?: string; keyPhrases?: string[] }[];
    vocabulary: { word: string; meaning: string; example: string }[];
  }> {
    const {
      topic, durationMinutes, level, includeVietnamese, keywords,
      numSpeakers, totalExchanges, totalWords, speakerNames,
    } = params;

    // === Bước 1: Tính toán chunks ===
    const numChunks = Math.ceil(totalExchanges / this.MAX_TURNS_PER_CHUNK);
    const baseTurns = Math.floor(totalExchanges / numChunks);
    const remainder = totalExchanges % numChunks;

    // Phân bổ lượt đều cho mỗi chunk, chunk đầu nhận phần dư
    // Làm tròn theo numSpeakers để round-robin đều
    const turnsPerChunk = Array.from({ length: numChunks }, (_, i) => {
      const raw = baseTurns + (i < remainder ? 1 : 0);
      // Làm tròn xuống bội số của numSpeakers để round-robin đều
      return Math.max(numSpeakers, Math.floor(raw / numSpeakers) * numSpeakers);
    });

    this.logger.log(
      `Chunked Generation: ${numChunks} chunks, lượt/chunk: [${turnsPerChunk.join(', ')}], tổng: ${turnsPerChunk.reduce((a, b) => a + b, 0)}`,
    );

    // === Bước 2: Sinh story outline ===
    const outline = await this.generateStoryOutline({
      topic,
      numChunks,
      speakerNames,
      level,
      durationMinutes,
      turnsPerChunk,
    });

    // === Bước 3: Sinh từng chunk ===
    const allTurns: { speaker: string; text: string; translation?: string; keyPhrases?: string[] }[] = [];
    let totalRetries = 0;

    for (let i = 0; i < numChunks; i++) {
      // Delay 1.5s giữa các chunk API calls để tránh rate limit Groq
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      const phase = outline.phases[i];
      const targetTurns = turnsPerChunk[i];

      // Context bridge: lấy 6 lượt cuối từ allTurns
      const contextSize = Math.min(6, allTurns.length);
      const previousTurns = allTurns.slice(-contextSize);

      // Tóm tắt nội dung đã sinh
      const previousSummary = this.buildPreviousSummary(allTurns);

      let chunkScript: { speaker: string; text: string; translation?: string; keyPhrases?: string[] }[] = [];
      let bestChunkScript = chunkScript;
      let bestValidation = { isValid: false, actualTurns: 0, totalWords: 0, avgWordsPerTurn: 0, issues: ['Chưa sinh'] };

      // Sinh chunk + validate + retry
      for (let retry = 0; retry <= this.MAX_CHUNK_RETRIES; retry++) {
        try {
          chunkScript = await this.generateChunk({
            topic,
            phase,
            chunkIndex: i,
            totalChunks: numChunks,
            targetTurns,
            previousTurns,
            previousSummary,
            speakerNames,
            level,
            includeVietnamese,
            keywords,
          });

          // Chuẩn hóa tên speakers
          const tempParsed = { script: chunkScript };
          const normalized = this.validateAndNormalizeSpeakers(tempParsed, speakerNames, numSpeakers);
          chunkScript = normalized.script;

          // Validate chunk
          const validation = this.validateChunk(chunkScript, targetTurns);

          this.logger.log(
            `Chunk ${i + 1}/${numChunks} (retry ${retry}): ${validation.actualTurns} lượt, ${validation.totalWords} từ, ${validation.avgWordsPerTurn} từ/lượt${validation.isValid ? ' ✅' : ' ❌ ' + validation.issues.join(', ')}`,
          );

          // Lưu kết quả tốt nhất (nhiều lượt nhất)
          if (validation.actualTurns > bestValidation.actualTurns) {
            bestChunkScript = chunkScript;
            bestValidation = validation;
          }

          if (validation.isValid) {
            break; // Chunk đạt yêu cầu, không cần retry
          }

          if (retry < this.MAX_CHUNK_RETRIES) {
            totalRetries++;
            this.logger.warn(
              `Chunk ${i + 1} chưa đạt, retry ${retry + 1}/${this.MAX_CHUNK_RETRIES}: ${validation.issues.join(', ')}`,
            );
          }
        } catch (error) {
          this.logger.error(`Lỗi sinh chunk ${i + 1} (retry ${retry}):`, error);
          if (retry === this.MAX_CHUNK_RETRIES && bestChunkScript.length === 0) {
            throw new Error(`Không thể sinh chunk ${i + 1} sau ${this.MAX_CHUNK_RETRIES + 1} lần thử`);
          }
        }
      }

      // Sử dụng kết quả tốt nhất, cắt bớt nếu vượt quá số lượt mục tiêu
      // Làm tròn xuống bội số numSpeakers để round-robin đều
      const maxTurns = Math.ceil(targetTurns * 1.15); // Cho phép vượt 15%
      const trimmedTurns = bestChunkScript.length > maxTurns
        ? bestChunkScript.slice(0, Math.floor(maxTurns / numSpeakers) * numSpeakers)
        : bestChunkScript;

      if (trimmedTurns.length < bestChunkScript.length) {
        this.logger.log(
          `Cắt bớt chunk ${i + 1}: ${bestChunkScript.length} → ${trimmedTurns.length} lượt (giới hạn ${maxTurns})`,
        );
      }

      allTurns.push(...trimmedTurns);

      this.logger.log(
        `Chunk ${i + 1}/${numChunks} hoàn thành: +${trimmedTurns.length} lượt, tổng: ${allTurns.length} lượt`,
      );
    }

    // === Bước 4: Sinh vocabulary riêng ===
    const vocabulary = await this.generateVocabularyFromScript(allTurns, topic, level);

    // === Bước 5: Final validation ===
    const finalWordCount = allTurns.reduce(
      (sum, line) => sum + line.text.split(/\s+/).length,
      0,
    );
    const finalSpeakers = [...new Set(allTurns.map(t => t.speaker))];
    const estimatedDuration = (finalWordCount / this.TTS_WORDS_PER_MINUTE).toFixed(1);

    this.logger.log(
      `🎉 Chunked Generation hoàn thành: ${allTurns.length} lượt, ${finalWordCount} từ / ${totalWords} mục tiêu (${Math.round(finalWordCount / totalWords * 100)}%), ` +
      `~${estimatedDuration} phút ước tính, ${finalSpeakers.length}/${numSpeakers} speakers, ${totalRetries} retries`,
    );

    return { script: allTurns, vocabulary };
  }

  /**
   * Sinh vocabulary từ script đã hoàn thành
   *
   * Mục đích: Tạo danh sách từ vựng hữu ích từ nội dung hội thoại đã sinh
   * Tham số đầu vào:
   *   - script: Toàn bộ script hội thoại
   *   - topic: Chủ đề
   *   - level: Trình độ
   * Tham số đầu ra: Mảng 5-8 từ vựng với nghĩa và ví dụ
   * Khi nào sử dụng: Bước cuối của chunked generation, sau khi đã có script hoàn chỉnh
   */
  private async generateVocabularyFromScript(
    script: { speaker: string; text: string }[],
    topic: string,
    level: string,
  ): Promise<{ word: string; meaning: string; example: string }[]> {
    // Lấy 10 câu tiêu biểu để trích xuất từ vựng
    const step = Math.max(1, Math.floor(script.length / 10));
    const sampleSentences = [];
    for (let i = 0; i < script.length && sampleSentences.length < 10; i += step) {
      sampleSentences.push(script[i].text);
    }

    const prompt = `Extract 5-8 useful vocabulary words/phrases from this English conversation about "${topic}" (level: ${level}).

Sample sentences from the conversation:
${sampleSentences.map((s, i) => `${i + 1}. "${s}"`).join('\n')}

For each word/phrase, provide:
- The word or phrase in English
- Vietnamese meaning
- An example sentence using it

=== OUTPUT FORMAT ===
{
  "vocabulary": [
    {
      "word": "overweight baggage",
      "meaning": "hành lý quá ký (vượt giới hạn cân nặng)",
      "example": "My overweight baggage cost me an extra $50 at the airport."
    }
  ]
}

RETURN ONLY VALID JSON, NO OTHER TEXT.`;

    try {
      const parsed = await this.callGroqAndParseJson(prompt, 1500, 0.7);
      return parsed.vocabulary || [];
    } catch (error) {
      this.logger.warn('Lỗi sinh vocabulary, trả mảng rỗng:', error);
      return [];
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
