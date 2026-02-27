# 07 — TTS Settings (Cài đặt giọng đọc)

> Bottom sheet cấu hình giọng đọc Azure TTS cho Listening feature.  
> Mở từ: Config Screen → icon gear / "Cài đặt giọng" button.

---

## 1. Tổng quan

| Thuộc tính | Giá trị |
|------------|---------|
| **Component** | `TtsSettingsSheet` (Bottom Sheet) |
| **Provider** | Azure TTS (duy nhất, hardcoded) |
| **Trigger** | Config Screen → tap gear icon |
| **Store** | `useListeningStore` |
| **Persist** | Không (session-specific), trừ `favoriteScenarioIds` |

### Mục đích

Cho phép user tùy chỉnh giọng đọc AI trước khi generate bài nghe. 80% users sẽ dùng default → UI tổ chức theo priority: Voice → Emotion → Toggles → Advanced (collapsed).

---

## 2. Mockup tham chiếu

### State A — 2 Speakers + Voice per Speaker

> Hiện khi `numSpeakers ≥ 2` AND `multiTalker = OFF` AND `randomVoice = OFF`

![TTS — 2 Speaker Voice Assignment](/Users/thanhvuqlud/ThanhData/CODE/StudyLanguage/docs/mobile/features/listening/7a_TTS_VoicePerSpeaker.png)

### State B — Multi-talker ON

> Hiện khi `multiTalker = ON`. Voice list bị dim, pair picker thay thế.

![TTS — Multi-talker Pair Picker](/Users/thanhvuqlud/ThanhData/CODE/StudyLanguage/docs/mobile/features/listening/7b_TTS_MultiTalker.png)

### State C — Full Overview

> Tổng quan tất cả sections, Nâng cao expanded.

![TTS — Full Overview](/Users/thanhvuqlud/ThanhData/CODE/StudyLanguage/docs/mobile/features/listening/7c_TTS_FullOverview.png)

---

## 3. Cấu trúc UI (layout top → bottom)

### 3.1 Header

| Element | Chi tiết |
|---------|----------|
| Title | `"Cài đặt giọng đọc"` |
| Close button | `X` icon, top-right |
| Badge | `"Azure TTS"` — blue pill, read-only |

### 3.2 Giọng đọc — Voice List

**6 Azure voices** hiển thị dạng vertical list:

| # | Avatar | ID | Label | Mô tả | Gender |
|---|--------|-----|-------|-------|--------|
| 1 | **J** green | `en-US-JennyNeural` | Jenny | Nữ US, tự nhiên | Female |
| 2 | **G** purple | `en-US-GuyNeural` | Guy | Nam US, chuyên nghiệp | Male |
| 3 | **D** orange | `en-US-DavisNeural` | Davis | Nam US, ấm áp | Male |
| 4 | **A** pink | `en-US-AriaNeural` | Aria | Nữ US, biểu cảm | Female |
| 5 | **S** cyan | `en-GB-SoniaNeural` | Sonia | Nữ British | Female |
| 6 | **N** gold | `en-AU-NatashaNeural` | Natasha | Nữ Aussie | Female |

**Mỗi row bao gồm:**
- Circle avatar (letter initial + color)
- Tên voice + subtitle mô tả
- **Play preview** button (▶) — nghe thử giọng
- **Selected** state: blue checkmark + `"SELECTED"` label

**Default:** Jenny (`en-US-JennyNeural`)

**Conditional visibility:**

| Điều kiện | Voice List |
|-----------|-----------|
| `multiTalker = OFF` | ✅ Hiện bình thường |
| `multiTalker = ON` | ⚫ Dimmed + overlay text `"Multi-talker sử dụng giọng cặp đôi"` |
| `randomVoice = ON` | ⚫ Dimmed (vì API tự chọn random, không cần user chọn) |

### 3.3 Phân giọng cho từng Speaker

> Chỉ hiện khi: `numSpeakers ≥ 2` AND `multiTalker = OFF` AND `randomVoice = OFF`

| Element | Chi tiết |
|---------|----------|
| Label | `"Phân giọng cho từng speaker"` |
| Speaker A row | Blue icon 🔊 + `"Speaker A"` + dropdown chọn voice |
| Speaker B row | Orange icon 🔊 + `"Speaker B"` + dropdown chọn voice |

**Logic:**
- Dropdown list = 6 voices ở trên
- Default: Speaker A → Jenny, Speaker B → Guy
- Lưu vào `voicePerSpeaker: Record<string, string>` (mapping `speakerLabel → voiceId`)
- Nếu user chọn cùng 1 voice cho cả 2 speakers → cho phép (không validate)

### 3.4 Cảm xúc — Emotion Chips

**Horizontal scroll** chips:

| Emotion | Azure Value | Default |
|---------|-------------|---------|
| Cheerful | `cheerful` | ✅ Selected |
| Neutral | `neutral` | |
| Sad | `sad` | |
| Excited | `excited` | |
| Calm | `calm` | |
| Angry | `angry` | |

- Store: `ttsEmotion: string` (default: `'default'`)
- Chip selected = blue filled, unselected = outlined gray

### 3.5 Toggles

#### 3.5.1 Giọng ngẫu nhiên (`randomVoice`)

| Thuộc tính | Giá trị |
|------------|---------|
| Label | `"Giọng ngẫu nhiên"` |
| Default | `true` (ON) |
| Store | `randomVoice: boolean` |
| Action | `setRandomVoice(value)` |

**Khi ON:**
- API tự random voice cho mỗi speaker
- Voice list → dimmed (user không cần chọn)
- "Phân giọng cho từng speaker" → ẩn

**Khi OFF:**
- User chọn voice thủ công từ list
- Nếu `numSpeakers ≥ 2` → hiện "Phân giọng cho từng speaker"

#### 3.5.2 Cảm xúc ngẫu nhiên (`randomEmotion`)

| Thuộc tính | Giá trị |
|------------|---------|
| Label | `"Cảm xúc ngẫu nhiên"` |
| Default | `false` (OFF) |
| Store | (cần thêm field `randomEmotion: boolean`) |
| Action | (cần thêm `setRandomEmotion(value)`) |

**Khi ON:**
- API tự random emotion
- Emotion chips → dimmed

#### 3.5.3 Multi-talker (`multiTalker`)

| Thuộc tính | Giá trị |
|------------|---------|
| Label | `"Multi-talker (2 người)"` |
| Subtitle | `"Hệ thống tự gán giọng xen kẽ"` |
| Default | `false` (OFF) |
| Store | `multiTalker: boolean` |
| Action | `setMultiTalker(value)` |

**Khi ON:**
- Voice list → dimmed với overlay `"Multi-talker sử dụng giọng cặp đôi"`
- "Giọng ngẫu nhiên" toggle → disabled (dimmed)
- "Phân giọng cho speaker" → ẩn
- Hiện **Pair Picker** (xem 3.6)

**Khi OFF:**
- UI quay lại bình thường

### 3.6 Multi-talker Pair Picker

> Chỉ hiện khi `multiTalker = ON`

**2 pill buttons ngang hàng:**

| Pair | Voices | Index | Azure Model |
|------|--------|-------|-------------|
| `"Ava & Andrew"` | Ava (Female) + Andrew (Male) | `0` | MultilingualNeural (DragonHD) |
| `"Ava & Steffan"` | Ava (Female) + Steffan (Male) | `1` | MultilingualNeural (DragonHD) |

- Selected = blue filled pill
- Unselected = gray outlined pill
- Default: `multiTalkerPairIndex = 0` (Ava & Andrew)
- Store: `multiTalkerPairIndex: number`
- Mô tả nhỏ bên dưới: `"Hệ thống tự gán giọng nam nữ xen kẽ cho từng speaker"`

### 3.7 Nâng cao — Advanced (Collapsible)

| Thuộc tính | Giá trị |
|------------|---------|
| Label | `"Nâng cao"` |
| Default | **Collapsed** (chevron ▼) |
| Expanded | Hiện Pitch + Rate sliders |

#### Pitch Slider

| Thuộc tính | Giá trị |
|------------|---------|
| Label | `"Pitch"` với icon 🎵 |
| Range | **-20%** → **+20%** |
| Default | `0%` |
| Step | `1` |
| Store | `ttsPitch: number` (range: -20 → +20) |
| Clamp | `Math.max(-20, Math.min(20, value))` |

#### Rate Slider

| Thuộc tính | Giá trị |
|------------|---------|
| Label | `"Rate"` với icon ⏱ |
| Range | **-20%** → **+20%** |
| Default | `0%` |
| Step | `1` |
| Store | `ttsRate: number` (range: -20 → +20) |
| Clamp | `Math.max(-20, Math.min(20, value))` |

> [!IMPORTANT]
> Pitch/Rate dùng **Azure SSML percentage format** (-20% → +20%), KHÔNG dùng multiplier (0.5 → 2.0). Code hiện tại đã đúng.

---

## 4. State Machine — Conditional UI

```
┌─────────────────────────────────────────────────┐
│                   TTS SETTINGS                  │
│                                                 │
│  ┌─────────────────────────────┐                │
│  │ randomVoice?                │                │
│  │  ON → dim voice list        │                │
│  │       ẩn speaker assignment │                │
│  │  OFF → show voice list      │                │
│  │        numSpeakers ≥ 2?     │                │
│  │         YES → show speaker  │                │
│  │               assignment    │                │
│  │         NO → hide speaker   │                │
│  │              assignment     │                │
│  └─────────────────────────────┘                │
│                                                 │
│  ┌─────────────────────────────┐                │
│  │ multiTalker?                │                │
│  │  ON → dim voice list        │                │
│  │       dim randomVoice       │                │
│  │       ẩn speaker assignment │                │
│  │       show pair picker      │                │
│  │  OFF → normal               │                │
│  └─────────────────────────────┘                │
│                                                 │
│  ┌─────────────────────────────┐                │
│  │ randomEmotion?              │                │
│  │  ON → dim emotion chips     │                │
│  │  OFF → show emotion chips   │                │
│  └─────────────────────────────┘                │
└─────────────────────────────────────────────────┘
```

### Decision Table — Visibility Matrix

| Condition | Voice List | Speaker Assign | Pair Picker | Emotion Chips |
|-----------|-----------|----------------|-------------|---------------|
| `random=OFF, multi=OFF, speakers=1` | ✅ Active | ❌ Hidden | ❌ Hidden | ✅ Active |
| `random=OFF, multi=OFF, speakers=2` | ✅ Active | ✅ Shown | ❌ Hidden | ✅ Active |
| `random=ON, multi=OFF` | ⚫ Dimmed | ❌ Hidden | ❌ Hidden | ✅ Active |
| `random=*, multi=ON` | ⚫ Dimmed + overlay | ❌ Hidden | ✅ Shown | ✅ Active |
| `randomEmotion=ON` | (unchanged) | (unchanged) | (unchanged) | ⚫ Dimmed |

---

## 5. Store State & Actions

### State (trong `useListeningStore`)

```typescript
// Đã có ✅
randomVoice: boolean;              // default: true
voicePerSpeaker: Record<string, string>; // default: {}
multiTalker: boolean;              // default: false
multiTalkerPairIndex: number;      // default: 0
ttsEmotion: string;                // default: 'default'
ttsPitch: number;                  // default: 0 (range: -20 → +20)
ttsRate: number;                   // default: 0 (range: -20 → +20)
ttsVolume: number;                 // default: 100 (range: 0 → 100)

// Cần thêm ⚠️
randomEmotion: boolean;            // default: false — toggle "Cảm xúc ngẫu nhiên"
```

### Actions (trong `useListeningStore`)

```typescript
// Đã có ✅
setRandomVoice: (value: boolean) => void;
setVoicePerSpeaker: (map: Record<string, string>) => void;
setMultiTalker: (value: boolean) => void;
setMultiTalkerPairIndex: (index: number) => void;
setTtsEmotion: (emotion: string) => void;
setTtsPitch: (pitch: number) => void;    // clamp -20 → +20
setTtsRate: (rate: number) => void;      // clamp -20 → +20
setTtsVolume: (volume: number) => void;  // clamp 0 → 100

// Cần thêm ⚠️
setRandomEmotion: (value: boolean) => void;
```

> [!WARNING]
> **Thiếu `randomEmotion` trong store** — Cần thêm field + action + initial state vào `useListeningStore.ts`.

---

## 6. API Integration

### 6.1 Lấy danh sách voices

```
GET /api/ai/voices?provider=azure
```

**Response:**
```json
{
  "voices": [
    { "id": "en-US-AvaMultilingualNeural", "name": "Ava", "gender": "Female" },
    { "id": "en-US-JennyNeural", "name": "Jenny", "gender": "Female" },
    { "id": "en-US-GuyNeural", "name": "Guy", "gender": "Male" }
  ],
  "multiTalker": [
    { "pair": ["Andrew", "Ava"], "index": 0 },
    { "pair": ["Steffan", "Ava"], "index": 1 }
  ]
}
```

> [!IMPORTANT]
> Voice list nên fetch từ API thay vì hardcode. Multi-talker pairs cũng từ API → UI pair picker tự render dựa trên data.

### 6.2 Generate audio với TTS options

```
POST /api/ai/generate-conversation-audio
```

**TTS-related fields trong body:**

| Field | Type | Mô tả | Lấy từ Store |
|-------|------|-------|-------------|
| `voice` | `string` | Voice ID chung (1 speaker) | `voicePerSpeaker` hoặc selected voice |
| `emotion` | `string` | Emotion style | `ttsEmotion` |
| `randomVoice` | `boolean` | Random voice | `randomVoice` |
| `randomEmotion` | `boolean` | Random emotion | `randomEmotion` |
| `multiTalker` | `boolean` | Multi-talker mode | `multiTalker` |
| `multiTalkerPairIndex` | `number` | Pair index | `multiTalkerPairIndex` |
| `voicePerSpeaker` | `Record<string, string>` | Speaker → Voice map | `voicePerSpeaker` |
| `pitch` | `string` | Pitch % (e.g. `"+10%"`) | `ttsPitch` → format `"+X%"` |
| `rate` | `string` | Rate % (e.g. `"-5%"`) | `ttsRate` → format `"+X%"` |

> [!NOTE]
> **Pitch/Rate formatting:** Store lưu number (-20 → +20), API nhận string (`"+10%"`, `"-5%"`). Cần convert khi gọi API:
> ```typescript
> const pitchStr = ttsPitch >= 0 ? `+${ttsPitch}%` : `${ttsPitch}%`;
> const rateStr = ttsRate >= 0 ? `+${ttsRate}%` : `${ttsRate}%`;
> ```

---

## 7. Interaction Specs

### 7.1 Mở sheet
- Trigger: Config Screen → tap gear icon
- Animation: slide up from bottom, backdrop blur overlay
- Height: ~85% screen height (scrollable)

### 7.2 Đóng sheet
- Tap `X` button
- Tap backdrop
- Swipe down
- Settings auto-save → không cần nút "Lưu"

### 7.3 Voice preview
- Tap `▶` button trên voice row
- Phát 1 câu sample (`"Hello, how are you today?"`)
- Gọi: `POST /api/ai/text-to-speech` với voice ID + current emotion
- Progress: show loading spinner trên play button

### 7.4 Toggle side-effects

| Toggle | Side effect |
|--------|------------|
| `randomVoice` ON | Dim voice list, hide speaker assign |
| `randomVoice` OFF | Restore voice list |
| `multiTalker` ON | Dim voice list + randomVoice toggle, show pair picker, hide speaker assign |
| `multiTalker` OFF | Restore all |
| `randomEmotion` ON | Dim emotion chips |
| `randomEmotion` OFF | Restore emotion chips |

### 7.5 Nâng cao expand/collapse
- Tap section header → toggle expand/collapse
- Animation: smooth height transition 200ms
- Chevron rotate: ▼ collapsed → ▲ expanded

---

## 8. Implementation Checklist

### UI Components
- [ ] `TtsSettingsSheet` — main bottom sheet component
- [ ] `VoiceListSection` — 6 voice cards với play preview
- [ ] `SpeakerAssignmentSection` — 2 dropdowns cho Speaker A/B
- [ ] `EmotionChipsSection` — horizontal scroll chips
- [ ] `ToggleSection` — 3 toggles (random voice, random emotion, multi-talker)
- [ ] `MultiTalkerPairPicker` — 2 pill buttons cho pair selection
- [ ] `AdvancedSection` — collapsible Pitch/Rate sliders

### Store Updates
- [ ] Thêm `randomEmotion: boolean` vào `ListeningState`
- [ ] Thêm `setRandomEmotion` action
- [ ] Thêm `randomEmotion` vào `initialState` (default: `false`)
- [ ] Update tests cho `randomEmotion`

### API Integration
- [ ] Fetch voice list từ `GET /api/ai/voices?provider=azure`
- [ ] Cache voice list (không cần fetch mỗi lần mở sheet)
- [ ] Voice preview: `POST /api/ai/text-to-speech`
- [ ] Map store state → API request body khi generate

### Conditional UI Logic
- [ ] Voice list dim khi `randomVoice=ON` hoặc `multiTalker=ON`
- [ ] Speaker assignment show/hide dựa trên `numSpeakers` + toggles
- [ ] Pair picker show/hide dựa trên `multiTalker`
- [ ] Emotion chips dim khi `randomEmotion=ON`
- [ ] `randomVoice` toggle disabled khi `multiTalker=ON`

### Testing
- [ ] Unit test: toggle state combinations (6 combinations)
- [ ] Unit test: voice per speaker mapping
- [ ] Unit test: pitch/rate clamping (-20 → +20)
- [ ] Unit test: multi-talker pair index
- [ ] Component test: conditional visibility matrix
- [ ] E2E: open sheet → change voice → preview → close → generate

---

## 9. Edge Cases

| Case | Expected behavior |
|------|------------------|
| Voice API trả về 0 voices | Hiện message `"Không tải được danh sách giọng"` + retry button |
| Voice preview thất bại | Show toast error, không crash |
| Multi-talker ON + numSpeakers = 1 | Vẫn cho bật, API xử lý (1 speaker thì dùng voice đầu tiên trong pair) |
| Pitch/Rate > 20 hoặc < -20 | Clamp tại boundary |
| User chọn cùng voice cho cả 2 speakers | Cho phép, không validate |
| Sheet đóng giữa chừng preview đang phát | Stop audio preview |
| Offline mode | Disable voice preview, hiện tooltip "Cần internet để nghe thử" |
