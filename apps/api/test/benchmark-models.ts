/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/**
 * Benchmark: Llama 4 Maverick vs Llama 3.3-70b
 *
 * Mục đích: So sánh 2 model trên 5 tiêu chí: tốc độ, JSON reliability,
 *   chất lượng nội dung, tính tự nhiên, token usage
 * Cách chạy: cd apps/api && npx ts-node test/benchmark-models.ts
 * Tham số đầu vào: không có (hoặc number để chạy 1 test case cụ thể)
 * Tham số đầu ra: Bảng so sánh markdown trên console
 * Khi nào sử dụng: Khi muốn đánh giá model mới trước khi đổi production
 */

import Groq from 'groq-sdk';

// Tải cấu hình môi trường
const dotenv = require('dotenv');
dotenv.config();

if (!process.env.GROQ_API_KEY) {
  console.error('❌ Thiếu GROQ_API_KEY trong .env file');
  process.exit(1);
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ============================================
// CÁC MODEL CẦN SO SÁNH
// ============================================
const MODELS = [
  {
    id: 'llama-3.3-70b-versatile',
    shortName: 'Llama 3.3-70b',
    description: 'Model hiện tại (production)',
  },
  {
    id: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    shortName: 'Llama 4 Maverick',
    description: 'Model mới (MoE 128 experts)',
  },
];

// ============================================
// TEST CASES
// ============================================
interface TestCase {
  name: string;
  topic: string;
  durationMinutes: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  numSpeakers: number;
}

const TEST_CASES: TestCase[] = [
  {
    name: '1. Café (beginner, 2p)',
    topic: 'ordering coffee at a cafe',
    durationMinutes: 5,
    level: 'beginner',
    numSpeakers: 2,
  },
  {
    name: '2. Job Interview (intermediate, 2p)',
    topic: 'job interview at a tech company',
    durationMinutes: 5,
    level: 'intermediate',
    numSpeakers: 2,
  },
  {
    name: '3. Group Project (advanced, 3p)',
    topic: 'group project deadline discussion',
    durationMinutes: 5,
    level: 'advanced',
    numSpeakers: 3,
  },
  {
    name: '4. Apartment (intermediate, 2p)',
    topic: 'apartment hunting in NYC',
    durationMinutes: 5,
    level: 'intermediate',
    numSpeakers: 2,
  },
  {
    name: '5. Medical (beginner, 2p)',
    topic: 'medical appointment at the clinic',
    durationMinutes: 5,
    level: 'beginner',
    numSpeakers: 2,
  },
];

// ============================================
// KẾT QUẢ BENCHMARK
// ============================================
interface BenchmarkResult {
  model: string;
  testName: string;
  // Tốc độ
  responseTimeMs: number;
  // JSON reliability
  jsonParseSuccess: boolean;
  jsonError?: string;
  // Chất lượng nội dung
  totalTurns: number;
  totalWords: number;
  avgWordsPerTurn: number;
  speakerCount: number;
  speakersCorrect: boolean;
  vocabCount: number;
  hasTranslations: boolean;
  hasKeyPhrases: boolean;
  // Tính tự nhiên
  fillerWordsCount: number;
  idiomsCount: number;
  questionEndTurns: number; // Bao nhiêu lượt kết thúc bằng dấu ?
  naturalScore: number; // 0-100 điểm tự nhiên tổng hợp
  // Token usage
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  // Lỗi (nếu gặp)
  error?: string;
}

/**
 * Xây dựng prompt giống hệt production
 *
 * Mục đích: Đảm bảo benchmark công bằng - dùng cùng prompt cho cả 2 model
 * Tham số đầu vào: TestCase
 * Tham số đầu ra: prompt string
 * Khi nào sử dụng: Trước mỗi lần gọi API cho 1 test case
 */
function buildPrompt(tc: TestCase): string {
  const totalWords = Math.ceil(tc.durationMinutes * 150 * 1.05);
  const rawExchanges = Math.ceil(totalWords / 65);
  const totalExchanges = Math.ceil(rawExchanges / tc.numSpeakers) * tc.numSpeakers;
  const speakerNames = ['Sarah', 'Mike', 'Lisa', 'David'].slice(0, tc.numSpeakers);
  const speakerList = speakerNames.join(', ');
  const exchangesPerPerson = Math.ceil(totalExchanges / tc.numSpeakers);
  const speakerDistribution = speakerNames
    .map(name => `${name} speaks ${exchangesPerPerson} times`)
    .join(', ');

  const levelGuide: Record<string, string> = {
    beginner: 'Use simple vocabulary, short sentences, common phrases.',
    intermediate: 'Use everyday vocabulary, moderate sentence complexity. Include some idioms.',
    advanced: 'Use sophisticated vocabulary, complex structures, idioms, slang.',
  };

  return `Generate a natural English conversation about "${tc.topic}".

=== CRITICAL: TURN LENGTH REQUIREMENTS ===
⚠️ MINIMUM 60 words per turn. Each turn MUST contain AT LEAST 3 full sentences.
- Target: 60-80 words per turn (3-4 sentences)

=== NATURAL CONVERSATION STYLE ===
- Write like REAL people talk, not like a textbook dialogue
- Speakers DON'T always ask questions at the end of their turn
- Include natural transitions: agreeing, disagreeing, sharing stories

=== REQUIREMENTS ===
- Speakers: ${tc.numSpeakers} (${speakerList})
- Target: ${totalWords} words total, ${totalExchanges} turns (${speakerDistribution})
- Level: ${tc.level.toUpperCase()} - ${levelGuide[tc.level]}
- Include a "translation" field with Vietnamese translation for each turn
- Include 2-3 key phrases per turn in "keyPhrases" field
- Include a "vocabulary" array with 5-8 useful words

=== OUTPUT FORMAT ===
{
  "script": [
    {
      "speaker": "${speakerNames[0]}",
      "text": "...",
      "translation": "...",
      "keyPhrases": ["phrase 1", "phrase 2"]
    }
  ],
  "vocabulary": [
    { "word": "...", "meaning": "...", "example": "..." }
  ]
}

RETURN ONLY VALID JSON, NO OTHER TEXT.`;
}

/**
 * Phân tích tính tự nhiên của hội thoại
 *
 * Mục đích: Đánh giá xem hội thoại có tự nhiên không (filler words, idioms, đa dạng cấu trúc)
 * Tham số đầu vào: Mảng script
 * Tham số đầu ra: { fillerWordsCount, idiomsCount, questionEndTurns, naturalScore }
 * Khi nào sử dụng: Sau khi parse JSON thành công
 */
function analyzeNaturalness(script: { text: string }[]): {
  fillerWordsCount: number;
  idiomsCount: number;
  questionEndTurns: number;
  naturalScore: number;
} {
  // Filler words: dấu hiệu giao tiếp tự nhiên
  const fillerPatterns = /\b(you know|I mean|honestly|basically|actually|like|well|oh|hmm|right|anyway|so|um)\b/gi;
  // Idioms / phrasal verbs phổ biến
  const idiomPatterns = /\b(figure out|run into|hang in there|look forward|no-brainer|rip-off|check out|come up with|work out|end up|turn out|give up|show up|break down|catch up|keep up|put off|take off|bring up|go through|get along|look into)\b/gi;

  let fillerWordsCount = 0;
  let idiomsCount = 0;
  let questionEndTurns = 0;

  for (const turn of script) {
    const text = turn.text;
    const fillerMatches = text.match(fillerPatterns);
    if (fillerMatches) fillerWordsCount += fillerMatches.length;

    const idiomMatches = text.match(idiomPatterns);
    if (idiomMatches) idiomsCount += idiomMatches.length;

    // Kiểm tra kết thúc bằng câu hỏi
    if (text.trim().endsWith('?')) questionEndTurns++;
  }

  // Tính điểm tự nhiên (0-100)
  const totalTurns = script.length || 1;
  // Filler words: 1-3 trên mỗi 5 lượt là tự nhiên
  const fillerRatio = fillerWordsCount / totalTurns;
  const fillerScore = Math.min(30, fillerRatio * 100);

  // Idioms: có idiom = tốt
  const idiomScore = Math.min(25, idiomsCount * 8);

  // Đa dạng: không phải lượt nào cũng kết thúc bằng ? (tỉ lệ 30-50% là tốt nhất)
  const questionRatio = questionEndTurns / totalTurns;
  const diversityScore = questionRatio >= 0.2 && questionRatio <= 0.5 ? 25 : 10;

  // Độ dài đều: các lượt nên có độ dài đa dạng (std dev vừa phải)
  const wordCounts = script.map(t => t.text.split(/\s+/).length);
  const mean = wordCounts.reduce((a, b) => a + b, 0) / totalTurns;
  const variance = wordCounts.reduce((sum, wc) => sum + Math.pow(wc - mean, 2), 0) / totalTurns;
  const stdDev = Math.sqrt(variance);
  // Std dev 10-20 là tự nhiên (không quá đều, không quá khác biệt)
  const lengthScore = stdDev >= 8 && stdDev <= 25 ? 20 : 10;

  const naturalScore = Math.round(fillerScore + idiomScore + diversityScore + lengthScore);

  return { fillerWordsCount, idiomsCount, questionEndTurns, naturalScore };
}

/**
 * Chạy benchmark cho 1 model + 1 test case
 *
 * Mục đích: Gọi API, parse response, phân tích kết quả
 * Tham số đầu vào: modelId (string), testCase (TestCase)
 * Tham số đầu ra: BenchmarkResult
 * Khi nào sử dụng: Được gọi trong vòng lặp main
 */
async function runBenchmark(modelId: string, tc: TestCase): Promise<BenchmarkResult> {
  const prompt = buildPrompt(tc);
  const totalWords = Math.ceil(tc.durationMinutes * 150 * 1.05);
  const rawExchanges = Math.ceil(totalWords / 65);
  const totalExchanges = Math.ceil(rawExchanges / tc.numSpeakers) * tc.numSpeakers;
  const tokensPerTurn = 300; // Bao gồm translation
  const maxTokens = Math.min(32000, Math.max(4096, Math.ceil(totalExchanges * tokensPerTurn * 1.3) + 300));

  const startTime = Date.now();

  try {
    const response = await groq.chat.completions.create({
      model: modelId,
      messages: [
        {
          role: 'system',
          content: 'You are an expert English teacher creating conversations for Vietnamese learners. You always respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: maxTokens,
    });

    const responseTimeMs = Date.now() - startTime;
    const content = response.choices[0]?.message?.content || '';
    const usage = response.usage;

    // Parse JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        model: modelId,
        testName: tc.name,
        responseTimeMs,
        jsonParseSuccess: false,
        jsonError: 'Không tìm thấy JSON trong response',
        totalTurns: 0, totalWords: 0, avgWordsPerTurn: 0,
        speakerCount: 0, speakersCorrect: false,
        vocabCount: 0, hasTranslations: false, hasKeyPhrases: false,
        fillerWordsCount: 0, idiomsCount: 0, questionEndTurns: 0, naturalScore: 0,
        promptTokens: usage?.prompt_tokens || 0,
        completionTokens: usage?.completion_tokens || 0,
        totalTokens: usage?.total_tokens || 0,
      };
    }

    let parsed: any;
    try {
      const sanitized = jsonMatch[0]
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/\/\/.*$/gm, '');
      parsed = JSON.parse(sanitized);
    } catch (parseError) {
      return {
        model: modelId,
        testName: tc.name,
        responseTimeMs,
        jsonParseSuccess: false,
        jsonError: `JSON parse lỗi: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        totalTurns: 0, totalWords: 0, avgWordsPerTurn: 0,
        speakerCount: 0, speakersCorrect: false,
        vocabCount: 0, hasTranslations: false, hasKeyPhrases: false,
        fillerWordsCount: 0, idiomsCount: 0, questionEndTurns: 0, naturalScore: 0,
        promptTokens: usage?.prompt_tokens || 0,
        completionTokens: usage?.completion_tokens || 0,
        totalTokens: usage?.total_tokens || 0,
      };
    }

    // Phân tích kết quả
    const script = parsed.script || [];
    const totalTurns = script.length;
    const words = script.map((t: any) => (t.text || '').split(/\s+/).length);
    const totalWordCount = words.reduce((a: number, b: number) => a + b, 0);
    const avgWordsPerTurn = totalTurns > 0 ? Math.round(totalWordCount / totalTurns) : 0;
    const speakers = [...new Set(script.map((t: any) => t.speaker))] as string[];
    const vocabCount = parsed.vocabulary?.length || 0;
    const hasTranslations = script.length > 0 && script.every((t: any) => t.translation);
    const hasKeyPhrases = script.length > 0 && script.some((t: any) => t.keyPhrases?.length > 0);

    // Tính tự nhiên
    const naturalness = analyzeNaturalness(script);

    return {
      model: modelId,
      testName: tc.name,
      responseTimeMs,
      jsonParseSuccess: true,
      totalTurns,
      totalWords: totalWordCount,
      avgWordsPerTurn,
      speakerCount: speakers.length,
      speakersCorrect: speakers.length >= tc.numSpeakers,
      vocabCount,
      hasTranslations,
      hasKeyPhrases,
      ...naturalness,
      promptTokens: usage?.prompt_tokens || 0,
      completionTokens: usage?.completion_tokens || 0,
      totalTokens: usage?.total_tokens || 0,
    };
  } catch (error: any) {
    return {
      model: modelId,
      testName: tc.name,
      responseTimeMs: Date.now() - startTime,
      jsonParseSuccess: false,
      error: error?.message || String(error),
      totalTurns: 0, totalWords: 0, avgWordsPerTurn: 0,
      speakerCount: 0, speakersCorrect: false,
      vocabCount: 0, hasTranslations: false, hasKeyPhrases: false,
      fillerWordsCount: 0, idiomsCount: 0, questionEndTurns: 0, naturalScore: 0,
      promptTokens: 0, completionTokens: 0, totalTokens: 0,
    };
  }
}

/**
 * In bảng so sánh tổng hợp
 *
 * Mục đích: In kết quả dạng markdown table dễ đọc
 * Tham số đầu vào: Map<modelId, BenchmarkResult[]>
 * Tham số đầu ra: void (in ra console)
 * Khi nào sử dụng: Cuối cùng sau khi chạy hết benchmark
 */
function printComparisonTable(allResults: Map<string, BenchmarkResult[]>): void {
  console.log('\n' + '='.repeat(100));
  console.log('📊 BẢNG SO SÁNH TỔNG HỢP: Llama 3.3-70b vs Llama 4 Maverick');
  console.log('='.repeat(100));

  // Tính trung bình cho mỗi model
  for (const [modelId, results] of allResults) {
    const model = MODELS.find(m => m.id === modelId)!;
    const successResults = results.filter(r => r.jsonParseSuccess);
    const n = successResults.length;
    if (n === 0) {
      console.log(`\n🤖 ${model.shortName}: Tất cả test case thất bại!`);
      continue;
    }

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    console.log(`\n🤖 ${model.shortName} (${model.description})`);
    console.log(`${'─'.repeat(60)}`);
    console.log(`  JSON parse thành công: ${n}/${results.length}`);
    console.log(`  Tốc độ trung bình:    ${(avg(successResults.map(r => r.responseTimeMs)) / 1000).toFixed(1)}s`);
    console.log(`  Số lượt TB:           ${Math.round(avg(successResults.map(r => r.totalTurns)))}`);
    console.log(`  Tổng từ TB:           ${Math.round(avg(successResults.map(r => r.totalWords)))}`);
    console.log(`  Từ/lượt TB:           ${Math.round(avg(successResults.map(r => r.avgWordsPerTurn)))}`);
    console.log(`  Speakers đúng:        ${successResults.filter(r => r.speakersCorrect).length}/${n}`);
    console.log(`  Có translations:      ${successResults.filter(r => r.hasTranslations).length}/${n}`);
    console.log(`  Có keyPhrases:        ${successResults.filter(r => r.hasKeyPhrases).length}/${n}`);
    console.log(`  Filler words TB:      ${avg(successResults.map(r => r.fillerWordsCount)).toFixed(1)}`);
    console.log(`  Idioms TB:            ${avg(successResults.map(r => r.idiomsCount)).toFixed(1)}`);
    console.log(`  Điểm tự nhiên TB:     ${Math.round(avg(successResults.map(r => r.naturalScore)))}/100`);
    console.log(`  Tokens TB:            prompt=${Math.round(avg(successResults.map(r => r.promptTokens)))}, completion=${Math.round(avg(successResults.map(r => r.completionTokens)))}`);
  }

  // Bảng chi tiết từng test case
  console.log('\n\n📋 CHI TIẾT TỪNG TEST CASE:');
  console.log('─'.repeat(100));
  console.log(
    '| Test Case'.padEnd(38) +
    '| Model'.padEnd(24) +
    '| Thời gian'.padEnd(12) +
    '| Turns'.padEnd(8) +
    '| Từ'.padEnd(8) +
    '| Từ/lượt'.padEnd(10) +
    '| Natural'.padEnd(10) +
    '| JSON |'
  );
  console.log('|' + '─'.repeat(36) + '|' + '─'.repeat(22) + '|' + '─'.repeat(10) + '|' + '─'.repeat(6) + '|' + '─'.repeat(6) + '|' + '─'.repeat(8) + '|' + '─'.repeat(8) + '|' + '─'.repeat(6) + '|');

  for (const tc of TEST_CASES) {
    for (const model of MODELS) {
      const results = allResults.get(model.id) || [];
      const r = results.find(res => res.testName === tc.name);
      if (!r) continue;

      const jsonStatus = r.jsonParseSuccess ? '✅' : '❌';
      const time = r.jsonParseSuccess ? `${(r.responseTimeMs / 1000).toFixed(1)}s` : 'ERR';

      console.log(
        `| ${tc.name}`.padEnd(38) +
        `| ${model.shortName}`.padEnd(24) +
        `| ${time}`.padEnd(12) +
        `| ${r.totalTurns}`.padEnd(8) +
        `| ${r.totalWords}`.padEnd(8) +
        `| ${r.avgWordsPerTurn}`.padEnd(10) +
        `| ${r.naturalScore}/100`.padEnd(10) +
        `| ${jsonStatus}   |`
      );
    }
  }

  // Kết luận
  console.log('\n\n🏆 KẾT LUẬN:');
  console.log('─'.repeat(60));

  const model1Results = (allResults.get(MODELS[0].id) || []).filter(r => r.jsonParseSuccess);
  const model2Results = (allResults.get(MODELS[1].id) || []).filter(r => r.jsonParseSuccess);

  if (model1Results.length > 0 && model2Results.length > 0) {
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    const speed1 = avg(model1Results.map(r => r.responseTimeMs));
    const speed2 = avg(model2Results.map(r => r.responseTimeMs));
    const natural1 = avg(model1Results.map(r => r.naturalScore));
    const natural2 = avg(model2Results.map(r => r.naturalScore));
    const words1 = avg(model1Results.map(r => r.avgWordsPerTurn));
    const words2 = avg(model2Results.map(r => r.avgWordsPerTurn));
    const tokens1 = avg(model1Results.map(r => r.totalTokens));
    const tokens2 = avg(model2Results.map(r => r.totalTokens));

    console.log(`  Tốc độ:    ${speed1 < speed2 ? '🏆 ' + MODELS[0].shortName : '🏆 ' + MODELS[1].shortName} nhanh hơn (${(speed1/1000).toFixed(1)}s vs ${(speed2/1000).toFixed(1)}s)`);
    console.log(`  Tự nhiên:  ${natural1 > natural2 ? '🏆 ' + MODELS[0].shortName : '🏆 ' + MODELS[1].shortName} tự nhiên hơn (${Math.round(natural1)} vs ${Math.round(natural2)})`);
    console.log(`  Từ/lượt:   ${words1 > words2 ? '🏆 ' + MODELS[0].shortName : '🏆 ' + MODELS[1].shortName} chi tiết hơn (${Math.round(words1)} vs ${Math.round(words2)})`);
    console.log(`  Tokens:    ${tokens1 < tokens2 ? '🏆 ' + MODELS[0].shortName : '🏆 ' + MODELS[1].shortName} tiết kiệm hơn (${Math.round(tokens1)} vs ${Math.round(tokens2)})`);
    console.log(`  JSON:      ${MODELS[0].shortName}: ${model1Results.length}/${(allResults.get(MODELS[0].id) || []).length} | ${MODELS[1].shortName}: ${model2Results.length}/${(allResults.get(MODELS[1].id) || []).length}`);
  }
}

/**
 * Main: Chạy benchmark cho tất cả model x test cases
 *
 * Mục đích: Entry point — orchestrate toàn bộ benchmark
 * Tham số đầu vào: CLI arg (optional) — chỉ số test case (1-based)
 * Tham số đầu ra: void
 * Khi nào sử dụng: npx ts-node test/benchmark-models.ts [testCaseNumber]
 */
async function main() {
  console.log('🚀 BENCHMARK: Llama 3.3-70b vs Llama 4 Maverick');
  console.log(`📋 ${TEST_CASES.length} test cases × ${MODELS.length} models = ${TEST_CASES.length * MODELS.length} lần gọi API`);
  console.log('⏰ Ước tính: ~3-5 phút\n');

  // Chọn test case cụ thể qua CLI argument
  const testIndex = process.argv[2] ? parseInt(process.argv[2]) - 1 : -1;
  const casesToRun = testIndex >= 0 && testIndex < TEST_CASES.length
    ? [TEST_CASES[testIndex]]
    : TEST_CASES;

  const allResults = new Map<string, BenchmarkResult[]>();

  for (const model of MODELS) {
    allResults.set(model.id, []);
  }

  for (const tc of casesToRun) {
    console.log(`\n${'━'.repeat(80)}`);
    console.log(`📝 Test: ${tc.name}`);
    console.log(`   Topic: "${tc.topic}" | Level: ${tc.level} | Speakers: ${tc.numSpeakers}`);
    console.log(`${'━'.repeat(80)}`);

    for (const model of MODELS) {
      console.log(`\n  🤖 Đang test ${model.shortName}...`);

      const result = await runBenchmark(model.id, tc);
      allResults.get(model.id)!.push(result);

      if (result.jsonParseSuccess) {
        console.log(`     ✅ ${(result.responseTimeMs / 1000).toFixed(1)}s | ${result.totalTurns} lượt | ${result.totalWords} từ | ${result.avgWordsPerTurn} từ/lượt | Natural: ${result.naturalScore}/100`);
      } else {
        console.log(`     ❌ Lỗi: ${result.jsonError || result.error}`);
      }

      // Delay 2s giữa các model calls để tránh rate limit
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // In bảng so sánh
  printComparisonTable(allResults);
}

main().catch(console.error);
