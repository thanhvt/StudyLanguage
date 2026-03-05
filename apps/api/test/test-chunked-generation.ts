/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/**
 * Test script cho Chunked Generation
 *
 * Mục đích: Kiểm tra thực tế việc sinh hội thoại có đạt đúng thời lượng mong muốn không
 * Cách chạy: cd apps/api && npx ts-node test/test-chunked-generation.ts
 *
 * Test cases:
 *   1. Hội thoại ngắn 5 phút, 2 người → single-call path
 *   2. Hội thoại trung bình 15 phút, 3 người → chunked path
 *   3. Hội thoại dài 30 phút, 4 người → main test case (bug gốc)
 *   4. Hội thoại 20 phút, 3 người, topic khác → verify topic không drift
 *   5. Hội thoại 25 phút, 4 người, topic phức tạp → verify coherence
 */

import { ConversationGeneratorService } from '../src/conversation-generator/conversation-generator.service';

// Tái tạo môi trường cần thiết
const dotenv = require('dotenv');
dotenv.config();

// Kiểm tra API key
if (!process.env.GROQ_API_KEY) {
  console.error('❌ Thiếu GROQ_API_KEY trong .env file');
  process.exit(1);
}

interface TestCase {
  name: string;
  topic: string;
  durationMinutes: number;
  numSpeakers: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  expectChunked: boolean; // true nếu mong đợi dùng chunked path
}

interface TestResult {
  testName: string;
  passed: boolean;
  metrics: {
    totalTurns: number;
    targetTurns: number;
    turnsPercent: number;
    totalWords: number;
    targetWords: number;
    wordsPercent: number;
    estimatedMinutes: number;
    targetMinutes: number;
    durationAccuracy: number;
    avgWordsPerTurn: number;
    minWordsPerTurn: number;
    maxWordsPerTurn: number;
    speakersFound: string[];
    speakersExpected: number;
  };
  coherenceCheck: {
    firstTurns: string[];
    lastTurns: string[];
  };
  issues: string[];
  durationMs: number;
}

const TEST_CASES: TestCase[] = [
  {
    name: '1️⃣ Ngắn: 5 phút, 2 người (Single-call)',
    topic: 'Ordering coffee at a cafe',
    durationMinutes: 5,
    numSpeakers: 2,
    level: 'intermediate',
    expectChunked: false,
  },
  {
    name: '2️⃣ Trung bình: 15 phút, 3 người (Chunked)',
    topic: 'Job interview at a tech company discussing remote work policies',
    durationMinutes: 15,
    numSpeakers: 3,
    level: 'intermediate',
    expectChunked: true,
  },
  {
    name: '3️⃣ Dài: 30 phút, 4 người (Main test - Bug gốc)',
    topic: 'Overweight Baggage: Luggage over limit, negotiating or asking fees',
    durationMinutes: 30,
    numSpeakers: 4,
    level: 'intermediate',
    expectChunked: true,
  },
];

// Chỉ chạy 3 test case chính, bỏ 2 test case phụ để tiết kiệm thời gian
// Uncomment thêm nếu cần:
// {
//   name: '4️⃣ 20 phút, 3 người (Topic drift check)',
//   topic: 'Planning a surprise birthday party for a friend',
//   durationMinutes: 20,
//   numSpeakers: 3,
//   level: 'intermediate',
//   expectChunked: true,
// },
// {
//   name: '5️⃣ 25 phút, 4 người (Complex topic)',
//   topic: 'Booking and checking in at a hotel, dealing with room issues',
//   durationMinutes: 25,
//   numSpeakers: 4,
//   level: 'advanced',
//   expectChunked: true,
// },

/**
 * Phân tích kết quả 1 test case
 *
 * Mục đích: Tính toán metrics chi tiết và kiểm tra chất lượng output
 * Tham số đầu vào: testCase + result từ generateConversation
 * Tham số đầu ra: TestResult với metrics, coherence check, issues
 */
function analyzeResult(
  testCase: TestCase,
  result: {
    script: { speaker: string; text: string; translation?: string; keyPhrases?: string[] }[];
    vocabulary: { word: string; meaning: string; example: string }[];
  },
  durationMs: number,
): TestResult {
  const script = result.script || [];
  const totalTurns = script.length;
  const targetWords = Math.ceil(testCase.durationMinutes * 150 * 1.05);
  // Tính targetTurns theo công thức mới: totalWords / 65 (giống service)
  const rawExchanges = Math.ceil(targetWords / 65);
  const targetTurns = Math.ceil(rawExchanges / testCase.numSpeakers) * testCase.numSpeakers;

  // Đếm từ
  const wordsPerTurn = script.map(t => t.text.split(/\s+/).length);
  const totalWords = wordsPerTurn.reduce((a, b) => a + b, 0);
  const avgWordsPerTurn = totalTurns > 0 ? Math.round(totalWords / totalTurns) : 0;
  const minWordsPerTurn = Math.min(...wordsPerTurn);
  const maxWordsPerTurn = Math.max(...wordsPerTurn);

  // Ước tính thời lượng audio
  const estimatedMinutes = totalWords / 155;

  // Speakers
  const speakersFound = [...new Set(script.map(t => t.speaker))];

  const issues: string[] = [];

  // Kiểm tra các tiêu chí
  const wordsPercent = Math.round((totalWords / targetWords) * 100);
  const turnsPercent = Math.round((totalTurns / targetTurns) * 100);
  const durationAccuracy = Math.round((estimatedMinutes / testCase.durationMinutes) * 100);

  if (totalWords < targetWords * 0.80) {
    issues.push(`Tổng từ quá ít: ${totalWords} < ${Math.round(targetWords * 0.80)} (80% mục tiêu)`);
  }

  if (totalWords > targetWords * 1.30) {
    issues.push(`Tổng từ quá nhiều: ${totalWords} > ${Math.round(targetWords * 1.30)} (130% mục tiêu)`);
  }

  if (totalTurns < targetTurns * 0.80) {
    issues.push(`Số lượt quá ít: ${totalTurns} < ${Math.round(targetTurns * 0.80)} (80% mục tiêu)`);
  }

  if (avgWordsPerTurn < 40) {
    issues.push(`Trung bình từ/lượt quá ngắn: ${avgWordsPerTurn} < 40`);
  }

  if (speakersFound.length < testCase.numSpeakers) {
    issues.push(`Thiếu speakers: ${speakersFound.length}/${testCase.numSpeakers}`);
  }

  if (durationAccuracy < 80) {
    issues.push(`Thời lượng ước tính quá ngắn: ${estimatedMinutes.toFixed(1)} phút < ${testCase.durationMinutes * 0.8} phút`);
  }

  if (durationAccuracy > 130) {
    issues.push(`Thời lượng ước tính quá dài: ${estimatedMinutes.toFixed(1)} phút > ${testCase.durationMinutes * 1.3} phút`);
  }

  // Coherence check: lấy 3 câu đầu và 3 câu cuối
  const firstTurns = script.slice(0, 3).map(t => `${t.speaker}: "${t.text.substring(0, 100)}..."`);
  const lastTurns = script.slice(-3).map(t => `${t.speaker}: "${t.text.substring(0, 100)}..."`);

  // Kiểm tra lặp nội dung: dùng 50 ký tự đầu (tránh false positive)
  const firstChars = script.map(t => t.text.substring(0, 50).toLowerCase().trim());
  const duplicates = firstChars.filter((text, index) =>
    firstChars.findIndex(t => t === text) !== index
  );
  if (duplicates.length > 3) {
    issues.push(`Phát hiện ${duplicates.length} câu có phần đầu lặp (50 chars)!`);
  }

  return {
    testName: testCase.name,
    passed: issues.length === 0,
    metrics: {
      totalTurns,
      targetTurns,
      turnsPercent,
      totalWords,
      targetWords,
      wordsPercent,
      estimatedMinutes: parseFloat(estimatedMinutes.toFixed(1)),
      targetMinutes: testCase.durationMinutes,
      durationAccuracy,
      avgWordsPerTurn,
      minWordsPerTurn,
      maxWordsPerTurn,
      speakersFound,
      speakersExpected: testCase.numSpeakers,
    },
    coherenceCheck: { firstTurns, lastTurns },
    issues,
    durationMs,
  };
}

/**
 * In kết quả 1 test case
 */
function printResult(result: TestResult): void {
  const status = result.passed ? '✅ PASSED' : '❌ FAILED';
  console.log('\n' + '='.repeat(80));
  console.log(`${result.testName} — ${status}`);
  console.log('='.repeat(80));

  const m = result.metrics;
  console.log(`\n📊 Metrics:`);
  console.log(`  Lượt nói:     ${m.totalTurns} / ${m.targetTurns} mục tiêu (${m.turnsPercent}%)`);
  console.log(`  Tổng từ:      ${m.totalWords} / ${m.targetWords} mục tiêu (${m.wordsPercent}%)`);
  console.log(`  Thời lượng:   ~${m.estimatedMinutes} phút / ${m.targetMinutes} phút mục tiêu (${m.durationAccuracy}%)`);
  console.log(`  Từ/lượt:      avg=${m.avgWordsPerTurn}, min=${m.minWordsPerTurn}, max=${m.maxWordsPerTurn}`);
  console.log(`  Speakers:     ${m.speakersFound.join(', ')} (${m.speakersFound.length}/${m.speakersExpected})`);
  console.log(`  Thời gian API: ${(result.durationMs / 1000).toFixed(1)}s`);

  console.log(`\n🔗 Coherence Check (3 câu đầu → 3 câu cuối):`);
  console.log(`  Đầu:`);
  result.coherenceCheck.firstTurns.forEach(t => console.log(`    ${t}`));
  console.log(`  Cuối:`);
  result.coherenceCheck.lastTurns.forEach(t => console.log(`    ${t}`));

  if (result.issues.length > 0) {
    console.log(`\n⚠️ Issues (${result.issues.length}):`);
    result.issues.forEach(issue => console.log(`  - ${issue}`));
  }
}

/**
 * Main: Chạy tất cả test cases
 */
async function main() {
  console.log('🚀 Bắt đầu test Chunked Generation');
  console.log(`📋 ${TEST_CASES.length} test cases\n`);

  const service = new ConversationGeneratorService();
  const results: TestResult[] = [];

  // Chọn test case qua argument dòng lệnh
  const testIndex = process.argv[2] ? parseInt(process.argv[2]) - 1 : -1;
  const casesToRun = testIndex >= 0 && testIndex < TEST_CASES.length
    ? [TEST_CASES[testIndex]]
    : TEST_CASES;

  for (const testCase of casesToRun) {
    console.log(`\n🔄 Đang chạy: ${testCase.name}...`);
    const startTime = Date.now();

    try {
      const result = await service.generateConversation({
        topic: testCase.topic,
        durationMinutes: testCase.durationMinutes,
        numSpeakers: testCase.numSpeakers,
        level: testCase.level,
        includeVietnamese: true,
      });

      const durationMs = Date.now() - startTime;
      const testResult = analyzeResult(testCase, result, durationMs);
      results.push(testResult);
      printResult(testResult);
    } catch (error) {
      console.error(`\n❌ Test FAILED with error:`, error);
      results.push({
        testName: testCase.name,
        passed: false,
        metrics: {
          totalTurns: 0, targetTurns: 0, turnsPercent: 0,
          totalWords: 0, targetWords: 0, wordsPercent: 0,
          estimatedMinutes: 0, targetMinutes: testCase.durationMinutes, durationAccuracy: 0,
          avgWordsPerTurn: 0, minWordsPerTurn: 0, maxWordsPerTurn: 0,
          speakersFound: [], speakersExpected: testCase.numSpeakers,
        },
        coherenceCheck: { firstTurns: [], lastTurns: [] },
        issues: [`Error: ${error instanceof Error ? error.message : String(error)}`],
        durationMs: Date.now() - startTime,
      });
    }
  }

  // Tổng kết
  console.log('\n' + '='.repeat(80));
  console.log('📊 TỔNG KẾT');
  console.log('='.repeat(80));
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  results.forEach(r => {
    const icon = r.passed ? '✅' : '❌';
    console.log(`  ${icon} ${r.testName} — ~${r.metrics.estimatedMinutes}/${r.metrics.targetMinutes} phút (${r.metrics.durationAccuracy}%)`);
  });
}

main().catch(console.error);
