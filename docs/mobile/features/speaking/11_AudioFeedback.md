# 11. Audio Feedback — Cross-Cutting Passive Feature

> **Status:** 🟡 Planned  
> **Priority:** P1  
> **Dependencies:** `09_BackgroundAudio.md`  
> **Affects:** Practice Mode, AI Conversation, Shadowing Mode, Audio Drill

---

## 1. Overview

Audio Feedback là tính năng **cross-cutting** — thay thế tất cả visual feedback bằng **giọng nói AI** khi user ở Hands-Free mode. Đây không phải feature riêng biệt, mà là một **lớp phủ (overlay)** trên các mode hiện có.

### Nguyên tắc cốt lõi

> **"Tai nghe + giọng nói = giao diện chính"**

| Hiện tại (Visual) | Passive (Audio) |
|---|---|
| Score hiện trên màn hình: "85/100" | AI nói: "Tám lăm điểm" |
| Word-by-word highlight xanh/đỏ | AI nói: "Từ 'through' chưa chuẩn" |
| Phoneme heatmap | AI nói: "Âm thờ cần lưỡi giữa hai hàm răng" |
| Confetti animation ≥90 | AI nói: "Xuất sắc! Gần như hoàn hảo!" |
| Swipe to next | Auto-next hoặc voice command |
| Tips card | AI đọc tips |

---

## 2. Feedback Script Templates

### 2.1 Score Feedback

```typescript
/**
 * Mục đích: Tạo script TTS cho điểm số
 * Tham số đầu vào: score (number), detail ('simple' | 'detailed')
 * Tham số đầu ra: string — text cho TTS đọc
 * Khi nào: Sau mỗi lần evaluate xong trong passive mode
 */
function generateScoreFeedback(score: number, detail: FeedbackDetail): string {
  // Điểm
  const scoreText = `${score} điểm.`;
  
  // Nhận xét theo mức
  const comment = getScoreComment(score);
  
  if (detail === 'simple') {
    return `${scoreText} ${comment}`;
  }
  
  // Chi tiết hơn
  return `${scoreText} ${comment}`;
}

function getScoreComment(score: number): string {
  if (score >= 95) return 'Tuyệt vời! Phát âm gần như hoàn hảo!';
  if (score >= 85) return 'Rất tốt! Chỉ cần chỉnh nhẹ vài chỗ.';
  if (score >= 75) return 'Khá ổn! Cần luyện thêm một vài từ.';
  if (score >= 60) return 'Được rồi, nhưng cần cải thiện thêm.';
  return 'Cần luyện thêm nhiều. Đừng nản nhé!';
}
```

### 2.2 Word-Level Feedback

```typescript
interface WordFeedback {
  word: string;
  score: number;
  ipa?: string;
  suggestion?: string;
}

/**
 * Mục đích: Tạo script TTS cho từng từ sai
 * Tham số đầu vào: words (WordFeedback[]), maxWords (number)
 * Tham số đầu ra: string
 * Khi nào: Khi feedback detail = 'detailed' và có từ sai
 */
function generateWordFeedback(words: WordFeedback[], maxWords = 3): string {
  // Chỉ nói top N từ sai nhất (tránh feedback quá dài)
  const wrongWords = words
    .filter(w => w.score < 70)
    .sort((a, b) => a.score - b.score)
    .slice(0, maxWords);
  
  if (wrongWords.length === 0) {
    return 'Tất cả từ đều phát âm tốt!';
  }
  
  const parts = wrongWords.map(w => {
    if (w.suggestion) {
      return `Từ "${w.word}": ${w.suggestion}`;
    }
    return `Từ "${w.word}" cần chỉnh lại`;
  });
  
  return `Cần chú ý: ${parts.join('. ')}.`;
}
```

### 2.3 Pronunciation Tip

```typescript
/**
 * Mục đích: Tạo script TTS cho tip phát âm
 * Tham số đầu vào: phoneme (string), tip (string)
 * Tham số đầu ra: string
 * Khi nào: Khi phát hiện lỗi phoneme cụ thể
 */
function generatePhoneTip(phoneme: string, tip: string): string {
  return `Mẹo: âm ${phoneme}, ${tip}`;
}

// Ví dụ
const PHONEME_TIPS: Record<string, string> = {
  '/θ/': 'đặt đầu lưỡi giữa hai hàm răng, thổi hơi nhẹ',
  '/ð/': 'giống âm thờ nhưng rung thanh quản',
  '/ʃ/': 'môi hơi tròn, lưỡi uốn lên gần vòm miệng',
  '/r/': 'cuốn lưỡi ra sau, không chạm vòm miệng',
  '/l/': 'đầu lưỡi chạm lợi sau răng cửa trên',
};
```

### 2.4 Complete Feedback Assembly

```typescript
interface FeedbackConfig {
  detail: 'simple' | 'detailed';
  includeWordFeedback: boolean;
  includeTip: boolean;
  maxWordErrors: number;
}

/**
 * Mục đích: Ghép tất cả feedback thành 1 script TTS hoàn chỉnh
 * Tham số đầu vào: result (EvaluationResult), config (FeedbackConfig)
 * Tham số đầu ra: string — toàn bộ script cho TTS đọc
 * Khi nào: Sau evaluate, trước khi phát audio feedback
 */
function assembleFeedbackScript(result: EvaluationResult, config: FeedbackConfig): string {
  const parts: string[] = [];
  
  // 1. Điểm + nhận xét
  parts.push(generateScoreFeedback(result.overallScore, config.detail));
  
  // 2. Từ sai (nếu detailed)
  if (config.includeWordFeedback && result.wordScores) {
    parts.push(generateWordFeedback(result.wordScores, config.maxWordErrors));
  }
  
  // 3. Tip phát âm (nếu có phoneme issue)
  if (config.includeTip && result.phonemeIssue) {
    const tip = PHONEME_TIPS[result.phonemeIssue];
    if (tip) {
      parts.push(generatePhoneTip(result.phonemeIssue, tip));
    }
  }
  
  // 4. Kết
  if (result.overallScore >= 80) {
    parts.push('Câu tiếp theo.');
  } else {
    parts.push('Thử lại nhé.');
  }
  
  return parts.join(' ');
}
```

---

## 3. Feedback Levels (User Config)

User có thể chọn mức độ chi tiết:

| Level | Nội dung đọc | Thời lượng ~  | Use case |
|-------|-------------|-------------|----------|
| **Minimal** | Chỉ score + tốt/cần cải thiện | ~2s | Luyện nhanh, không muốn nghe dài |
| **Standard** | Score + top 2 từ sai + nhận xét | ~5s | Mặc định |
| **Detailed** | Score + tất cả từ sai + tip + IPA | ~10s | Luyện kỹ, muốn hiểu sâu |

```typescript
// Config trong store
interface PassiveFeedbackSettings {
  level: 'minimal' | 'standard' | 'detailed';
  ttsSpeed: number;       // 0.8 - 1.2 cho feedback (mặc định 1.0)
  pauseBetweenParts: number; // ms pause giữa các phần (mặc định 300)
}
```

---

## 4. TTS Voice cho Feedback

| Yếu tố | Giá trị | Lý do |
|---------|---------|-------|
| **Giọng** | Khác giọng AI mẫu | Phân biệt "AI coach" vs "AI đọc câu" |
| **Ngôn ngữ** | Tiếng Việt | Feedback bằng ngôn ngữ mẹ đẻ dễ hiểu hơn |
| **Tốc độ** | 1.0x - 1.1x | Rõ ràng, không quá nhanh |
| **Tone** | Friendly, encouraging | Không harsh — user cần động lực |

```typescript
const FEEDBACK_TTS_CONFIG = {
  voice: 'vi-VN-HoaiMyNeural',  // Azure VN voice
  rate: '1.0',
  pitch: '+5%',                  // Hơi cao hơn = friendly
  emotion: 'friendly',
};
```

---

## 5. Context-Specific Feedback

Mỗi mode có feedback hơi khác:

### 5.1 Practice Mode / Audio Drill

```
"85 điểm. Khá tốt! Từ 'thought' chưa chuẩn, 
cần đặt lưỡi giữa hai hàm răng cho âm thờ. Câu tiếp theo."
```

### 5.2 AI Conversation

```
"Nhắc nhẹ: từ 'three' nên phát âm là thờ-ri, 
không phải phờ-ri. Tiếp tục nhé!"
→ Rồi AI tiếp tục hội thoại bình thường
```

### 5.3 Shadowing Auto Mode

```
"Nhịp điệu: 78 điểm. Ngữ điệu: 85 điểm. Chính xác: 90 điểm. 
Tổng: 84 điểm. Cần theo sát nhịp hơn ở giữa câu. Câu tiếp theo."
```

---

## 6. Files to Create/Modify

### New Files

| File | Mô tả |
|------|--------|
| `src/utils/audioFeedback.ts` | Script generation functions |
| `src/hooks/useAudioFeedback.ts` | Hook phát audio feedback |
| `src/constants/phonemeTips.ts` | Danh sách tips cho từng phoneme |

### Modified Files

| File | Thay đổi |
|------|----------|
| `src/screens/speaking/FeedbackScreen.tsx` | Thêm audio feedback khi `isHandsFreeMode` |
| `src/screens/speaking/PracticeScreen.tsx` | Integrate audio feedback |
| `src/store/useSpeakingStore.ts` | Thêm `passiveFeedbackSettings` |

---

## 7. Edge Cases

| Case | Xử lý |
|------|-------|
| Feedback script quá dài (> 15s) | Truncate, chỉ nói top 2 từ sai |
| TTS fail | Fallback: phát beep + auto-next |
| User interrupt feedback (bắt đầu nói) | Stop feedback → ghi âm user |
| Nhiều phoneme issue cùng lúc | Chỉ nói issue quan trọng nhất |

---

## 8. Implementation

### Phase 1: Core (2-3 ngày)
- [ ] `audioFeedback.ts` — script generation
- [ ] `useAudioFeedback.ts` — TTS integration
- [ ] `phonemeTips.ts` — tip database
- [ ] Store updates

### Phase 2: Integration (2 ngày)
- [ ] Practice Mode integration
- [ ] AI Conversation integration
- [ ] Audio Drill integration

### Phase 3: Polish (1 ngày)
- [ ] Feedback level settings UI
- [ ] TTS voice tuning
- [ ] Timing/pause optimization

---

## 9. Tài liệu liên quan

- [08_AudioDrill.md](08_AudioDrill.md) — Audio Drill uses audio feedback
- [10_AutoListenMode.md](10_AutoListenMode.md) — Auto-Listen uses audio feedback
- [12_ShadowingAutoMode.md](12_ShadowingAutoMode.md) — Auto Shadow uses audio feedback
