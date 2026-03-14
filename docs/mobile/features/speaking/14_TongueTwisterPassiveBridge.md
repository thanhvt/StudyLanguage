# 14. Tongue Twister — Passive Bridge

> **Status:** 🟡 Planned  
> **Priority:** Design Decision  
> **Dependencies:** `05_TongueTwisterMode.md`, `11_AudioFeedback.md`  
> **Affects:** Passive session flow, Tongue Twister navigation

---

## 1. Overview

Tongue Twister **KHÔNG** được chuyển thành passive mode (xem [phân tích chi tiết](../../../../.gemini/antigravity/brain/b7b72ee1-4c1f-4e22-a608-37d340a2b655/speaking_passive_learning_analysis.md#8-deep-dive-tongue-twister--giữ-nguyên-hay-cải-tiến-khuyến-nghị-8)). Tuy nhiên, nó đóng vai trò **cầu nối giữa thế giới passive và active** — giúp user sửa điểm yếu phát hiện trong passive sessions.

### Vai trò trong hệ sinh thái

```
┌─────────────────────────────────────────────────────┐
│                                                      │
│  🎧 PASSIVE MODE (đi đường, rảnh)                   │
│     AI Conversation / Audio Drill / Auto Shadow      │
│              │                                       │
│              ├─ Phát hiện: user yếu âm /θ/, /ʃ/     │
│              │                                       │
│              ▼                                       │
│  ┌──────────────────────────────┐                   │
│  │ 🌉 BRIDGE (gợi ý)           │                   │
│  │ "Bạn hay sai âm /θ/.        │                   │
│  │  Muốn luyện Tongue Twister  │                   │
│  │  cho âm này không?"         │                   │
│  └──────────┬───────────────────┘                   │
│              │                                       │
│              ▼                                       │
│  👅 ACTIVE MODE (ngồi rảnh)                         │
│     Tongue Twister — /θ/ category                   │
│              │                                       │
│              ├─ Luyện chuyên sâu → cải thiện        │
│              │                                       │
│              ▼                                       │
│  🎧 PASSIVE MODE (kiểm tra lại)                     │
│     "Âm /θ/ đã cải thiện từ 45% → 72%!"            │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 2. Bridge Features

### 2.1 Post-Session Recommendation

Sau mỗi passive session (Audio Drill, Auto Shadow, Auto-Listen), AI phân tích weak sounds và gợi ý:

```
[Session Summary Screen]
    │
    ├─ Điểm tổng: 82/100
    ├─ Thời gian: 15 phút
    │
    ├─ ── Điểm yếu phát âm ──────────────
    │   🔴 /θ/ — 45% (3/7 lần sai)
    │   🟡 /ʃ/ — 68% (2/5 lần sai)
    │   🟢 /r/ — 92% (OK)
    │
    ├─ ┌──────────────────────────────────┐
    │  │ 👅 Luyện âm yếu với Tongue      │
    │  │    Twister?                       │
    │  │                                   │
    │  │ [🎯 Luyện /θ/]  [🎯 Luyện /ʃ/] │
    │  │                                   │
    │  │ [Bỏ qua]                         │
    │  └──────────────────────────────────┘
    │
    └─ Tap "Luyện /θ/" → Navigate đến Tongue Twister
        → Auto-select category: /θ/ vs /ð/
        → Auto-select level phù hợp
```

### 2.2 Audio Bridge (trong passive mode)

Nếu feedback detail = "detailed", AI có thể gợi ý bằng giọng nói ở cuối session:

```
AI: "Phiên luyện hôm nay đạt 82 điểm trung bình. 
     Bạn hay sai âm 'th' trong các từ think, three, through. 
     Khi nào rảnh, hãy thử luyện Tongue Twister cho âm này nhé!"
```

### 2.3 Dashboard Integration

Trên Speaking Progress Dashboard, hiện Weak Sounds → link đến Tongue Twister:

```
── Weak Sounds ────────────────────────────────
🔴 /θ/ — 45%  [👅 Luyện]
🟡 /ʃ/ — 68%  [👅 Luyện]  
🟢 /r/ — 92%
🟢 /l/ — 88%
────────────────────────────────────────────────
```

---

## 3. Weak Sound Tracking

### 3.1 Data Collection

Mỗi passive session, collect phoneme accuracy:

```typescript
interface PhonemeAttempt {
  phoneme: string;      // VD: '/θ/'
  word: string;         // VD: 'three'
  isCorrect: boolean;   // Phát âm đúng?
  sessionType: 'audioDrill' | 'autoListen' | 'autoShadow';
  timestamp: number;
}
```

### 3.2 Aggregation

```typescript
interface WeakSoundStats {
  phoneme: string;
  accuracy: number;          // 0-100 (%)
  totalAttempts: number;
  recentTrend: 'improving' | 'stable' | 'declining';
  lastPracticed?: number;    // Lần cuối luyện Tongue Twister
  suggestedLevel: 'easy' | 'medium' | 'hard';
}

/**
 * Mục đích: Tính toán weak sounds từ lịch sử
 * Tham số đầu vào: attempts (PhonemeAttempt[]), windowDays (number)
 * Tham số đầu ra: WeakSoundStats[] — sorted by accuracy asc
 * Khi nào: Sau mỗi passive session kết thúc
 */
function calculateWeakSounds(
  attempts: PhonemeAttempt[], 
  windowDays = 14
): WeakSoundStats[] {
  // Lọc theo thời gian
  const recent = filterByWindow(attempts, windowDays);
  
  // Group by phoneme
  const grouped = groupBy(recent, 'phoneme');
  
  // Tính accuracy cho mỗi phoneme
  return Object.entries(grouped).map(([phoneme, records]) => ({
    phoneme,
    accuracy: Math.round(
      (records.filter(r => r.isCorrect).length / records.length) * 100
    ),
    totalAttempts: records.length,
    recentTrend: calculateTrend(records),
    suggestedLevel: getSuggestedLevel(records),
  }))
  .filter(s => s.accuracy < 85) // Chỉ hiện phonemes cần cải thiện
  .sort((a, b) => a.accuracy - b.accuracy);
}
```

---

## 4. Navigation Deep Link

Khi user tap "Luyện /θ/", navigate với params:

```typescript
// Navigation params
navigation.navigate('TongueTwister', {
  // Auto-select category
  preselectedCategory: 'th-sounds', // /θ/ vs /ð/
  
  // Auto-select level dựa trên accuracy
  preselectedLevel: weakSound.suggestedLevel,
  
  // Tracking origin
  source: 'passive_bridge',
  sourceSessionId: lastSessionId,
});
```

---

## 5. Feedback Loop — Sau khi luyện Tongue Twister

Khi user hoàn thành Tongue Twister session từ bridge:

```typescript
// Cập nhật weak sound stats
onTongueTwisterComplete(results: TongueTwisterResults) {
  // Lưu lần luyện cuối
  updateWeakSoundLastPracticed(results.phonemeCategory, Date.now());
  
  // Hiện improvement (nếu có)
  if (results.accuracy > previousAccuracy) {
    showToast(`Âm ${phoneme} cải thiện: ${prev}% → ${results.accuracy}%! 🎉`);
  }
}
```

---

## 6. Files to Create/Modify

### New Files

| File | Mô tả |
|------|--------|
| `src/utils/weakSoundTracker.ts` | Phoneme tracking logic |
| `src/components/speaking/WeakSoundBridge.tsx` | Bridge recommendation card |

### Modified Files

| File | Thay đổi |
|------|----------|
| `src/screens/speaking/SessionSummaryScreen.tsx` | Thêm Tongue Twister recommendation |
| `src/screens/speaking/SpeedChallengeScreen.tsx` | Accept preselected category/level params |
| `src/screens/speaking/ProgressDashboardScreen.tsx` | Weak sounds → Tongue Twister link |
| `src/store/useSpeakingStore.ts` | Thêm phoneme tracking state |

---

## 7. Implementation Phases

### Phase 1: Tracking (2 ngày)
- [ ] `weakSoundTracker.ts` — collect + aggregate
- [ ] Store integration
- [ ] Dashboard weak sounds improvement

### Phase 2: Bridge UI (2 ngày)
- [ ] `WeakSoundBridge.tsx` — recommendation card
- [ ] Session summary integration
- [ ] Deep link to Tongue Twister

### Phase 3: Feedback Loop (1 ngày)
- [ ] Post-Tongue Twister improvement tracking
- [ ] Trend visualization

---

## 8. Tài liệu liên quan

- [05_TongueTwisterMode.md](05_TongueTwisterMode.md) — Tongue Twister base feature
- [08_AudioDrill.md](08_AudioDrill.md) — Provides phoneme data
- [11_AudioFeedback.md](11_AudioFeedback.md) — Audio bridge suggestion
- [06_CrossCuttingFeatures.md](06_CrossCuttingFeatures.md) — Gamification & Progress
