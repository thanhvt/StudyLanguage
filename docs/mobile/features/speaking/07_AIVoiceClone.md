# 07. AI Voice Clone — Requirements Spec

> **Status:** 🟡 Planned  
> **Priority:** P2  
> **Dependencies:** `speakingApi.cloneAndCorrectVoice` (fallback có sẵn)

---

## 1. Overview

AI Voice Clone cho phép user nghe lại bản ghi của mình **được sửa phát âm** bằng AI, giữ nguyên giọng nói gốc nhưng sửa các lỗi phát âm. Tạo trải nghiệm "before vs after" trực quan.

### User Value
- Nghe được mình phát âm đúng vs sai → tự điều chỉnh
- Motivation tăng khi thấy "after" version nghe đúng hơn
- Hỗ trợ shadowing khi user có thể shadow chính giọng mình

---

## 2. User Flow

```
FeedbackScreen → [🎤 Nghe bản sửa] → API call → Loading...
  → VoiceCloneReplaySheet (bottom sheet)
    → Toggle: [Original] / [Corrected]
    → Waveform comparison (dual track)
    → Word highlights: red (sai) → green (đúng)
    → [🔄 Thử nói lại] → redirect Practice
```

---

## 3. API Requirements

### 3.1 Endpoint: `POST /api/speaking/voice-clone`

**Request:**
```json
{
  "audioUri": "string (file URI)",
  "originalText": "string",
  "targetPhonemes": ["string"] // optional
}
```

**Response:**
```json
{
  "correctedAudio": "base64",
  "corrections": [
    {
      "word": "think",
      "originalPhoneme": "/θɪnk/",
      "correctedPhoneme": "/θɪŋk/",
      "startMs": 1200,
      "endMs": 1600
    }
  ],
  "improvementScore": 85
}
```

### 3.2 AI Provider Options

| Provider | Ưu điểm | Nhược điểm | Chi phí |
|---|---|---|---|
| **ElevenLabs Voice Cloning** | Chất lượng cao, realtime | Đắt, cần 30s voice sample | $0.30/min |
| **Azure Custom Neural Voice** | Enterprise-grade | Setup phức tạp | $24/1M chars |
| **OpenAI TTS + modify** | Đơn giản nhất | Không clone được giọng gốc | $15/1M chars |
| **Coqui.ai (Open source)** | Free, self-host | Cần GPU, quality thấp hơn | Free (GPU cost) |

> **Recommendation:** Bắt đầu với OpenAI TTS (fallback hiện tại), sau đó upgrade lên ElevenLabs khi có budget.

---

## 4. UI Components

### 4.1 VoiceCloneReplaySheet (Bottom Sheet)

```
┌─────────────────────────────┐
│  🎤 Before vs After         │
│  ─────────────────────────  │
│  [▶ Original]  [▶ Corrected]│
│                              │
│  ┌─ Waveform ─────────────┐ │
│  │ ██▓░░▓██▓░░▓██         │ │
│  │ Original    ^^^^error   │ │
│  └────────────────────────┘ │
│  ┌─ Waveform ─────────────┐ │
│  │ ██▓██▓██▓██▓██         │ │
│  │ Corrected (smooth)     │ │
│  └────────────────────────┘ │
│                              │
│  Words: [think✅][the❌→✅]  │
│                              │
│  Improvement: +15 points     │
│  [🔄 Thử nói lại]           │
└─────────────────────────────┘
```

### 4.2 Required Components
- `VoiceCloneReplaySheet.tsx` — Bottom sheet with dual audio player
- `WaveformComparison.tsx` — Side-by-side waveform visualization
- `CorrectionHighlight.tsx` — Word-level correction display

---

## 5. Store (Zustand)

```typescript
interface VoiceCloneState {
  isLoading: boolean;
  originalAudioUri: string | null;
  correctedAudioBase64: string | null;
  corrections: Correction[];
  improvementScore: number;
  isPlayingOriginal: boolean;
  isPlayingCorrected: boolean;
}
```

---

## 6. Implementation Phases

### Phase 1 (MVP) — 2-3 ngày
- [ ] Bottom sheet UI cơ bản
- [ ] Integrate existing `cloneAndCorrectVoice` fallback API
- [ ] Before/After toggle player
- [ ] Word correction list

### Phase 2 (Enhancement) — 1 tuần
- [ ] Real voice cloning API integration (ElevenLabs/Azure)
- [ ] Dual waveform comparison
- [ ] Animated word highlight sync
- [ ] Improvement score animation

### Phase 3 (Polish) — 2-3 ngày
- [ ] A/B speed control
- [ ] Export/Share comparison
- [ ] History of cloned audio

---

## 7. Edge Cases

| Case | Xử lý |
|---|---|
| Audio quá ngắn (<1s) | Hiện toast "Ghi âm quá ngắn" |
| API timeout (>30s) | Timeout + retry button |
| No corrections needed | Hiện "🎉 Phát âm hoàn hảo!" |
| Network offline | Cache last result + show offline toast |
| Provider quota exceeded | Fallback sang OpenAI TTS |

---

## 8. Test Cases

- [ ] TC-01: Voice clone request gửi đúng audioUri + text
- [ ] TC-02: Before/After toggle phát đúng audio track
- [ ] TC-03: Word highlights match correction data
- [ ] TC-04: Loading state hiện khi API đang xử lý
- [ ] TC-05: Error state khi API fail
- [ ] TC-06: Retry nói lại navigate đúng screen
