# 🗣️ Speaking Feature — Deep Analysis

## Part 1: Shadowing Mode — Technical Challenges

### Bài toán cốt lõi

Shadowing yêu cầu **đồng thời**: phát audio AI + ghi âm user + so sánh real-time — trên mobile device với tài nguyên hạn chế.

```
┌──────────────────────────────────────────────────┐
│  AI Audio Playback  ═══════════════════════►     │
│  User Recording     ───═══════════════════════►  │
│                        ↑ delay                   │
│  Real-time Compare     ◆──◆──◆──◆──◆ (scoring)  │
│  Text Highlight        ▓▓▓▓▓▓▓▓▓▓▓▓▓►           │
│                                                  │
│  4 luồng chạy đồng thời trên 1 device           │
└──────────────────────────────────────────────────┘
```

---

### Challenge 1: Audio Echo / Feedback Loop 🔊🔄

**Vấn đề:** Mic thu lại chính audio đang phát từ loa → AI nhận được tiếng AI, không phải tiếng user.

| Giải pháp | Mô tả | Khả thi? |
|-----------|--------|----------|
| **AEC (Acoustic Echo Cancellation)** | iOS/Android có built-in AEC trong audio session | ✅ Khả thi — iOS `AVAudioSession.Mode.voiceChat` tự bật AEC |
| **Headphone requirement** | Bắt buộc/khuyến khích tai nghe | ✅ Đơn giản nhưng giảm UX. Nên là "recommended", không "required" |
| **Volume ducking** | Giảm volume AI playback khi user đang nói | ⚠️ Workaround — không lý tưởng cho shadowing vì user cần nghe rõ mẫu |

**Giải pháp đề xuất:**
```
1. Detect headphone → dùng bình thường
2. Không headphone → bật iOS voiceChat mode (AEC) 
   + hiện toast khuyến khích dùng tai nghe
3. Fallback: volume AI giảm 30% khi recording active
```

---

### Challenge 2: Simultaneous Playback + Recording trên React Native 🎵🎤

**Vấn đề:** `react-native-audio-recorder-player` KHÔNG hỗ trợ phát và ghi đồng thời trên cùng instance.

| Giải pháp | Mô tả | Trade-off |
|-----------|--------|-----------|
| **TrackPlayer (playback) + AudioRecorder (record)** | 2 thư viện riêng biệt, mỗi cái 1 việc | ✅ Đề xuất — App đã có TrackPlayer cho Listening |
| **expo-av** | API thống nhất cho cả play + record | ⚠️ Khả thi nhưng cần Expo |
| **Native Module tự viết** | Custom native audio engine | ❌ Over-engineering cho MVP |

**Giải pháp đề xuất:**
```typescript
// Kiến trúc 2 track song song
const playback = useTrackPlayer();     // AI audio — đã có sẵn trong app
const recorder = useAudioRecorder();   // User voice — react-native-audio-recorder-player

// Sync bằng timestamp
const startShadowing = async () => {
  const playStartTime = Date.now();
  await playback.play(aiAudioUrl);
  
  // Delay control
  setTimeout(async () => {
    await recorder.startRecording();
  }, delayMs); // user config: 0-2000ms
};
```

**Lưu ý iOS Audio Session:**
```
⚠️ iOS chỉ cho phép 1 audio session category tại 1 thời điểm
→ Cần set category = "playAndRecord" (không phải "playback")
→ Config: AVAudioSession.setCategory(.playAndRecord, options: [.defaultToSpeaker, .allowBluetooth])
```

---

### Challenge 3: Real-time Comparison (Scoring) ⚡

**Vấn đề:** So sánh audio user vs AI **trong khi đang nói** → cần xử lý cực nhanh.

#### STT Provider cho Shadowing — Dùng gì?

App hiện có **3 STT provider**, mỗi cái phù hợp trường hợp khác:

| Provider | Model | Endpoint | Latency | Accuracy | Cost | Dùng cho |
|----------|-------|----------|---------|----------|------|----------|
| **Groq Whisper** | `whisper-large-v3-turbo` (fallback: `whisper-large-v3`) | `/speaking/transcribe` | ⚡ **Nhanh nhất** (~500ms-1s) | ⭐⭐⭐⭐ Tốt | 💚 Free tier rộng rãi | ✅ **Shadowing — đề xuất** |
| **OpenAI Whisper** | `whisper-1` | `/ai/transcribe` | 🐢 Chậm hơn (~1-3s) | ⭐⭐⭐⭐⭐ Chính xác nhất | 💛 $0.006/min | Reading Practice |
| **Azure Speech** | Azure STT | Chưa tích hợp STT | — | — | 💛 Tính theo giờ | Hiện chỉ dùng TTS |

> **Kết luận:** Shadowing dùng **Groq Whisper** (`whisper-large-v3-turbo`) — nhanh nhất, free, đã có sẵn endpoint `POST /speaking/transcribe` và endpoint combo `POST /speaking/transcribe-and-evaluate`.

#### Scoring Approaches

| Approach | Mô tả | Latency |
|----------|--------|---------|
| **On-device STT → text compare** | Whisper local hoặc iOS Speech → so sánh text | 500ms-2s |
| **Server-side real-time** | Stream audio lên server → WebSocket trả score | 200ms-1s (phụ thuộc mạng) |
| **Post-recording compare** | Ghi xong → gửi lên → nhận score (không real-time) | 2-5s |
| **Pitch/tempo on-device** | So sánh waveform characteristics locally, không cần STT | < 100ms |

#### Giải pháp đề xuất — 2 giai đoạn:

**Phase 1 (MVP): Post-recording compare**
```
├── User shadow xong → gửi audio lên server
├── Server: Groq Whisper STT (transcribe-and-evaluate combo endpoint)
├── Trả về score: rhythm, intonation, accuracy
└── ⏱️ Delay 2-5s nhưng đủ dùng, đơn giản implement
```

**Phase 2 (Advanced): Hybrid real-time** — _Chi tiết kỹ thuật bên dưới_
```
├── On-device: pitch contour extraction (react-native-audio-api)
├── So sánh pitch curve AI vs User → hiển thị visual real-time
├── Server: vẫn dùng Groq Whisper cho final scoring chi tiết
└── ⏱️ Visual feedback < 100ms, final score 2-3s
```

---

### Challenge 3b: Phase 2 Hybrid Real-time — Giải thích kỹ thuật 🔬

#### Pitch Contour Extraction là gì?

**Pitch contour** (đường cong cao độ) là biểu đồ thể hiện **tần số giọng nói thay đổi theo thời gian**. Nó phản ánh:
- **Intonation** (ngữ điệu): câu hỏi↗ vs câu trần thuật↘
- **Stress** (trọng âm): từ được nhấn mạnh có pitch cao hơn
- **Rhythm** (nhịp): khoảng cách giữa các peak/valley

```
Ví dụ pitch contour cho câu "How are YOU doing?"

AI (mẫu):     ╱──╲     ╱──╲         ╱──────╲     ╱╲
               How  are  YOU          doing    ?

User (tốt):   ╱──╲     ╱──╲         ╱──────╲     ╱╲   ← Match! ✅

User (xấu):   ──────── ──── ─────── ──────── ────    ← Monotone ❌
                                                       (pitch phẳng, không có lên xuống)
```

#### Cách hoạt động trên mobile?

```typescript
// react-native-audio-api (Web Audio API polyfill cho RN)
// Hoạt động hoàn toàn ON-DEVICE, không cần internet

// 1. Capture audio stream từ mic (realtime)
const audioContext = new AudioContext();          // Tạo audio processing context
const analyser = audioContext.createAnalyser();   // Tạo bộ phân tích tần số
analyser.fftSize = 2048;                          // Độ phân giải FFT

// 2. Mỗi frame (~16ms), extract pitch
const dataArray = new Float32Array(analyser.fftSize);
analyser.getFloatTimeDomainData(dataArray);
const currentPitch = autoCorrelate(dataArray, sampleRate);  // Thuật toán autocorrelation

// 3. So sánh pitch user vs pitch AI (đã pre-extract)
const similarity = comparePitchCurves(aiPitchCurve, userPitchCurve);
// → Kết quả: 0-100% match
// → Hiển thị real-time trên UI (đường cong chồng lên nhau)
```

#### Tại sao để Phase 2 mà không làm ngay MVP?

| Lý do | Chi tiết |
|-------|----------|
| 🔧 **Complexity cao** | Cần implement FFT + autocorrelation + pitch tracking on-device — đây là thuật toán DSP (Digital Signal Processing) phức tạp |
| 📱 **react-native-audio-api chưa stable** | Thư viện này vẫn đang active development, API có thể thay đổi |
| 🔋 **Performance concern** | Real-time FFT mỗi 16ms + so sánh + render UI = CPU intensive, cần optimize kỹ cho device yếu |
| 🎯 **MVP không cần** | Post-recording scoring (Phase 1) đã đủ để user trải nghiệm Shadowing. Visual real-time là "nice-to-have" |
| 📊 **Cần validate user demand** | Ship Phase 1 trước → đo lường user engagement → nếu user thích Shadowing → invest Phase 2 |
| 🧪 **Cần R&D** | Pitch comparison algorithm cần tuning: ngưỡng similarity, cách handle noise, microphone khác nhau... |

> **Tóm lại:** Phase 1 (post-recording) cho phép ship Shadowing **nhanh** với **ít risk**. Phase 2 (hybrid real-time) là enhancement giúp trải nghiệm "wow" hơn nhưng cần thêm 3-4 tuần R&D và chỉ nên làm khi đã validate user thực sự dùng Shadowing.

---

### Challenge 4: Delay Synchronization ⏱️

**Vấn đề:** User chỉnh delay 0-2s → phải sync chính xác vị trí text highlight + playback + recording.

```
Timeline (delay = 1s):

AI audio:    |████████████████████████|
             t=0                    t=10s

User record: |    |████████████████████████|
             t=0  t=1s                    t=11s
                  ↑ delay offset

Text highlight phải sync với AI audio,
Nhưng scoring phải align user audio với AI audio (bù delay)
```

**Giải pháp:**
```typescript
// Khi scoring, cắt bỏ delay offset từ user audio
const alignedUserAudio = trimStart(userAudioBuffer, delayMs);
// Hoặc server-side: gửi kèm delayMs metadata
await api.evaluateShadowing({
  aiAudioUrl,
  userAudioUri,
  delayMs,       // Server biết cần shift bao nhiêu
  speedRate,     // Tốc độ AI playback (0.5x-1.5x)
});
```

---

### Challenge 5: Performance trên thiết bị yếu 📱

| Concern | Impact | Mitigation |
|---------|--------|------------|
| CPU: 4 luồng đồng thời | Giật lag, UI freeze | Offload audio processing sang native thread (TrackPlayer đã làm) |
| Memory: buffer audio lớn | OOM trên device 2-3GB RAM | Giới hạn sentence length (max 30s), stream không buffer toàn bộ |
| Battery: mic + speaker + processing | Hao pin nhanh | Hiện cảnh báo "sử dụng nhiều pin", khuyến khích sạc |
| Nhiệt: CPU cao liên tục | Thermal throttling → lag | Auto-pause nếu device quá nóng (hiếm) |

---

### Tổng kết Technical — Roadmap đề xuất

| Phase | Scope | Effort | Risk |
|-------|-------|--------|------|
| **MVP** | TrackPlayer play + AudioRecorder record + post-recording scoring + delay control | 2-3 tuần | Thấp |
| **V1.1** | Text highlight sync + waveform visual comparison | 1-2 tuần | Trung bình |
| **V2** | Real-time pitch comparison on-device + streaming score | 3-4 tuần | Cao |

---

## Part 2: Conversation Coach vs Roleplay Mode — Tách hay Gộp?

### So sánh chi tiết

| Dimension | 💬 Conversation Coach | 🎭 Roleplay Mode |
|-----------|----------------------|-------------------|
| **Cấu trúc** | Open-ended, không kịch bản | Semi-structured, có scenario |
| **AI persona** | "Friendly coach" cố định | Thay đổi theo role (waiter, doctor, interviewer...) |
| **Kết thúc** | Timer (3-20 phút) | Số lượt turn (5-10) |
| **Feedback** | Inline (pronunciation alert, grammar fix) | Cuối session (overall feedback) |
| **Text input** | ✅ Có — voice hoặc text | ❌ Chủ yếu voice |
| **Suggested responses** | ✅ Có — cho beginner | ❌ Không (tự nghĩ) |
| **Timer** | ✅ Có countdown | ❌ Chỉ giới hạn turns |
| **Difficulty** | Feedback Mode (beginner/intermediate/advanced) | Difficulty filter (Easy/Medium/Hard) |
| **Setup flow** | Topic + Duration + Feedback Mode | Select Scenario + Difficulty |
| **Best for** | Daily practice, build confidence | Chuẩn bị tình huống thực tế |

### Phân tích chồng chéo (Overlap)

```
                    Coach              Roleplay
                 ┌─────────┐        ┌─────────┐
                 │  Timer   │        │Scenarios│
                 │  Text    │        │ Roles   │
                 │  Suggest │  CHUNG │ Turns   │
                 │  mode    │◄──────►│ Diff.   │
                 │          │ Multi- │         │
                 │          │ turn   │         │
                 │          │ Voice  │         │
                 │          │ STT    │         │
                 │          │ AI resp│         │
                 │          │ Pron.  │         │
                 └─────────┘ Alert  └─────────┘
```

**Overlap lớn:**
- Cả hai đều dùng multi-turn voice conversation
- Cùng API: `transcribe` + `continue-conversation` + `evaluate-pronunciation`
- Cùng UI pattern: chat bubble, voice input, AI response
- Cùng state machine: idle → recording → transcribing → ai_thinking → ai_responding → loop

**Khác biệt thực chất:** Chỉ là config/setup khác

---

### 🔥 Đề xuất: GỘP thành 1 mode — "AI Conversation"

> **Kết luận:** Nên gộp Coach + Roleplay thành **1 mode duy nhất** với **2 sub-modes** (config options).

#### Lý do gộp:

| # | Lý do | Giải thích |
|---|-------|-----------|
| 1 | **80% codebase giống nhau** | Cùng chat UI, cùng recording flow, cùng API — duplicate code = duplicate bugs |
| 2 | **User confusion** | User phải chọn giữa Coach/Roleplay mà không hiểu rõ khác gì → friction |
| 3 | **Dễ maintain** | 1 screen, 1 state machine, 1 set of tests |
| 4 | **Flexible hơn** | User có thể mix: "Coach mode nhưng với scenario restaurant" — hiện tại không được |
| 5 | **Ít screen hơn** | Giảm navigation complexity |

#### Thiết kế đề xuất — "AI Conversation" Mode

```
┌─────────────────────────────────────────────────────┐
│           AI Conversation - Setup Screen             │
├─────────────────────────────────────────────────────┤
│                                                      │
│  📝 Chủ đề: [_____________] hoặc [Chọn Scenario ▼]  │
│                                                      │
│  🎭 Chế độ:                                          │
│  ┌──────────────┐  ┌──────────────┐                  │
│  │ 💬 Free Talk │  │ 🎭 Roleplay  │                  │
│  │  (Coach)     │  │ (Scenario)   │                  │
│  └──────────────┘  └──────────────┘                  │
│                                                      │
│  ⏱️ Thời lượng: [5 phút ▼]  (Free Talk only)        │
│  📊 Feedback:   [Intermediate ▼]                     │
│  🎚️ Difficulty: [Medium ▼]   (Roleplay only)        │
│                                                      │
│  ─── Tùy chọn nâng cao ───                          │
│  ☑ Gợi ý câu trả lời (beginner)                     │
│  ☑ Sửa ngữ pháp inline                              │
│  ☑ Cảnh báo phát âm                                  │
│                                                      │
│  [          🎤 Bắt đầu hội thoại          ]          │
│                                                      │
└─────────────────────────────────────────────────────┘
```

#### State machine hợp nhất:

```typescript
interface AIConversationState {
  // Setup — gộp Coach + Roleplay config
  setup: {
    mode: 'free-talk' | 'roleplay';
    topic: string;
    scenario?: RoleplayScenario;    // Chỉ khi mode = roleplay
    duration?: number;               // Chỉ khi mode = free-talk (phút)
    maxTurns?: number;               // Chỉ khi mode = roleplay (5-10)
    feedbackMode: 'beginner' | 'intermediate' | 'advanced';
    difficulty?: 'easy' | 'medium' | 'hard'; // Chỉ khi mode = roleplay
    options: {
      showSuggestions: boolean;
      inlineGrammarFix: boolean;
      pronunciationAlert: boolean;
    };
  };

  // Session — CHUNG cho cả 2
  session: {
    isActive: boolean;
    messages: ConversationMessage[];
    remainingTime?: number;          // Free-talk timer
    currentTurn?: number;            // Roleplay turn counter
    inputMode: 'voice' | 'text';
  };

  // AI — CHUNG
  ai: {
    isThinking: boolean;
    isTranscribing: boolean;
  };
}
```

#### Kết thúc session — logic hợp nhất:

```
Free Talk:  Timer hết → hiện summary + overall feedback
Roleplay:   Đủ turns HOẶC AI.shouldEnd = true → hiện summary
Cả hai:     User bấm "Kết thúc" bất cứ lúc nào
```

#### File structure đề xuất:

| File hiện tại (tách) | File đề xuất (gộp) |
|----------------------|---------------------|
| `CoachSetupScreen.tsx` | `ConversationSetupScreen.tsx` |
| `CoachSessionScreen.tsx` | `ConversationSessionScreen.tsx` |
| `RoleplaySelectScreen.tsx` | → Tích hợp vào `ConversationSetupScreen` (scenario picker) |
| `RoleplaySessionScreen.tsx` | → Dùng chung `ConversationSessionScreen` |

---

### Tuy nhiên — khi nào nên TÁM lại?

| Nếu... | Thì... |
|---------|--------|
| Roleplay cần UI rất khác (ví dụ: visual scene, avatar đóng vai) | Tách riêng screen |
| Roleplay có scoring system riêng (ví dụ: chấm theo rubric scenario) | Tách logic scoring |
| Số lượng scenario > 20 và cần category/filter phức tạp | Tách scenario browser thành screen riêng |

> **Khuyến nghị:** Gộp cho MVP, nếu Roleplay phát triển phức tạp hơn (visual scenes, avatar...) thì tách sau. Hiện tại sự khác biệt chưa đủ lớn để justify 2 screens riêng.

---

## Tổng kết & Đề xuất cập nhật tài liệu

| Thay đổi | Mô tả |
|----------|-------|
| Gộp section 1.2 + 2.3 | Conversation Coach + Roleplay → **"AI Conversation"** với 2 sub-modes |
| Flow 2.2 + 2.3 | Gộp thành 1 flow chung với branch point ở setup |
| State 5.3 | Thay `ConversationCoachState` bằng `AIConversationState` hợp nhất |
| Implementation tasks | Gộp Coach tasks + Roleplay tasks thành 1 section |
| API | Không đổi — cùng endpoints |
