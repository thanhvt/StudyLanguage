# 🎧 Listening Feature - Mobile

> **Module:** Listening  
> **Priority:** P0 (Core)  

---

## 1. Overview

Module nghe hiểu với AI-generated conversations, tối ưu cho học trên di chuyển với background playback.

### 1.1 Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **Podcast Mode** | Nghe thụ động, có transcript | Commute, Workout |
| **Radio Mode** | Continuous playlists với duration options | Background learning |

### 1.2 Custom Scenarios

Cho phép user tạo và quản lý scenario riêng để luyện nghe theo chủ đề cá nhân.

| Feature | Description |
|---------|-------------|
| **Create** | Tạo scenario với tên + mô tả chi tiết |
| **Quick Use** | Dùng ngay không lưu vào database |
| **Save** | Lưu vào database để dùng lại |
| **Favorite** | Đánh dấu yêu thích |
| **Delete** | Xóa scenario đã lưu |

### 1.3 Global Audio Player

Audio player persistent, hoạt động xuyên suốt các trang. Chỉ có **2 chế độ**:

| Mode | Description | Context |
|------|-------------|---------|
| **Full** | Full controls (play/pause, seek, speed) + hiển thị transcript đầy đủ | Listening page detail (trang chính) |
| **Minimized** | Floating panel nhỏ hiển thị khi user rời khỏi trang Listening page detail | Mọi trang khác trong app |

**Chi tiết Minimized mode:**
- **Trigger:** Tự động kích hoạt khi user navigate/rời khỏi trang Listening page detail
- **Chiều rộng:** ~1/3 đến 1/4 chiều ngang màn hình
- **Chiều cao:** Vừa phải, dạng border panel nhỏ (kiểu FAB mở rộng)
- **Nội dung hiển thị:**
  - Tên bài đang phát (dạng **marquee / chữ chạy** nếu quá dài)
  - Thời gian thực tế / thời gian tổng (VD: `2:15 / 5:00`)
  - Nút **Pause/Play**
  - Nút **Thoát** (dừng phát và đóng panel)
- **Vị trí:** Floating, không che khuất nội dung chính

**Features:**
- Persist playback across page navigation
- Confirmation dialog khi đổi audio đang phát
- Lưu user preferences (speed, mute)
- Session restoration: Resume từ player hoặc recent lessons

### 1.4 Radio Mode

| Feature | Description |
|---------|-------------|
| **Duration Options** | 1, 5, 10, 15, 20, 30 phút |
| **Progress Tracking** | Hiển thị progress khi đang generate playlist |
| **Immediate Playback** | Phát ngay sau khi generate hoặc chọn existing playlist |

### 1.6 TTS Provider Settings

Cấu hình nâng cao cho giọng đọc AI (Web-v2 parity):

| Feature | Description |
|---------|-------------|
| **Provider** | Azure TTS (duy nhất) |
| **Voice** | Chọn giọng đọc Azure (Jenny, Guy, Ava, Andrew...) |
| **Emotion** | Cảm xúc giọng đọc (Cheerful, Sad, Angry...) |
| **Multi-talker** | Chế độ 2 người nói |
| **Advanced** | Pitch, Rate |
| **Randomize** | Ngẫu nhiên giọng đọc và/hoặc cảm xúc mỗi bài nghe |

### 1.7 Background Playback Requirements

Yêu cầu âm thanh vẫn phát khi người dùng rời khỏi app (passive listening):

| Requirement | Description |
|-------------|-------------|
| **Background Play** | Âm thanh tiếp tục phát khi người dùng minimize app hoặc chuyển sang app khác |
| **Lock Screen** | Hiển thị controls (Play/Pause/Next/Previous) trên lock screen |
| **Auto-Pause on Call** | Tự động tạm dừng khi có cuộc gọi đến (incoming/outgoing call) |
| **Auto-Resume after Call** | Tự động phát lại khi cuộc gọi kết thúc |
| **Duck on Other Audio** | Khi app khác phát âm thanh: tạm dừng hoặc giảm volume (ducking) |
| **Resume after Duck** | Tự động phát lại khi app khác dừng phát âm thanh |
| **Headphone Unplug** | Tự động tạm dừng khi rút tai nghe (safety) |
| **Bluetooth Connect** | Tiếp tục phát khi kết nối Bluetooth headphone/car audio |

#### Audio Interruption Flow

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  [Đang phát bài nghe]                                        │
│         │                                                    │
│         ├── Cuộc gọi đến ──► [PAUSE] ──► Cuộc gọi kết thúc  │
│         │                                  ──► [AUTO RESUME] │
│         │                                                    │
│         ├── App khác phát ──► [PAUSE/DUCK] ──► App khác dừng │
│         │                                  ──► [AUTO RESUME] │
│         │                                                    │
│         ├── Rút tai nghe ──► [PAUSE] (không tự phát lại)     │
│         │                                                    │
│         └── Minimize app ──► [TIẾP TỤC PHÁT] ✅              │
│                                                              │
│  Platform: Track Player xử lý native audio focus tự động     │
│  iOS: AVAudioSession category .playback                      │
│  Android: AudioFocus với AUDIOFOCUS_GAIN                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Ducking vs Pause Strategy

| Interruption Type | Strategy | Lý do |
|-------------------|----------|-------|
| Phone call | **Pause + Resume** | Cuộc gọi quan trọng, cần im lặng hoàn toàn |
| Navigation app (Google Maps) | **Duck volume 30%** | Chỉ announce ngắn, có thể nghe cùng lúc |
| Video/Music app | **Pause + Resume** | Cả 2 là audio chính, không nên mix |
| Notification sound | **Duck volume 50%** | Rất ngắn, không cần pause |
| Siri/Google Assistant | **Pause + Resume** | Cần im lặng để nhận diện giọng nói |

---

## 2. User Flows

### 2.1 Main Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [Home]  →  [Config Screen]  →  [Generating]  →  [Player]   │
│             (Topic, Duration,      (AI)          (Listen)  │
│              Mode, Speakers)                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Pocket Mode Flow (Walking/Driving)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [Player Active]  →  [Motion Detected]  →  [Pocket Mode]    │
│                       (Gyroscope)           (Black screen) │
│                                               (Gestures)   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---


## 4. Features Detail

### 4.1 Playback Controls

| Control | Action | Gesture |
|---------|--------|---------|
| Play/Pause | Toggle playback | Tap center / Double tap |
| Seek | Jump to position | Drag progress bar |
| Speed | Change playback rate | Tap speed button |

### 4.2 Transcript Features

| Feature | Description |
|---------|-------------|
| Auto-scroll | Script tự cuộn theo audio |
| Highlight | Từ đang phát được highlight |
| Tap word | Tra từ điển popup |
| Long press | Save sentence to bookmarks |
| Swipe sentence | Repeat that sentence |

### 4.3 Background Audio

| Feature | Description |
|---------|-------------|
| Minimize app | Audio continues |
| Lock screen | Controls available |
| Bluetooth | Works with headphones |
| Notification | Persistent player notification |
| Auto-pause | Pause on call/another audio |


---

## 5. Technical Implementation

### 5.1 Libraries

```typescript
react-native-track-player // Professional audio playback & background controls
@react-native-community/slider // Progress bar
react-native-fs           // Robust file system access
notifee                   // Advanced media notifications
react-native-reanimated   // Waveform animation
```

### 5.2 State Structure

```typescript
interface ListeningState {
  // Config
  config: {
    topic: string;
    duration: number;
    mode: 'podcast';
    speakers: number;
    keywords?: string[];
  };
  
  // Player
  player: {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    speed: number;
    loopStart?: number;
    loopEnd?: number;
  };
  
  // Content
  content: {
    title: string;
    transcript: TranscriptLine[];
    audioUrl: string;
    isDownloaded: boolean;
  };
}
```

### 5.3 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [Config]  →  [API: Generate]  →  [Cache Audio]  →  [Play]  │
│                    │                   │                    │
│                    └── Azure TTS ──────┘                    │
│                                                             │
│ [Player Events]  →  [Update State]  →  [Update UI]         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 Custom Scenarios State

```typescript
interface CustomScenario {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  createdAt: Date;
}

// Hook: useCustomScenarios
interface CustomScenariosHook {
  scenarios: CustomScenario[];
  loading: boolean;
  error: string | null;
  
  // Actions
  createScenario: (name: string, description: string) => Promise<CustomScenario>;
  deleteScenario: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}
```

### 5.5 Global Audio Player State

```typescript
type PlayerMode = 'full' | 'minimized';

interface AudioPlayerState {
  // Audio data
  audioUrl: string | null;
  title: string;
  subtitle: string;
  timestamps: ConversationTimestamp[];
  
  // Playback state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: PlaybackSpeed; // 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2
  volume: number;
  isMuted: boolean;
  
  // UI state
  isVisible: boolean;
  mode: PlayerMode;
  showChangeConfirm: boolean;
  pendingAudio: AudioData | null;
}

// Store: useAudioPlayerStore (Zustand with persist)
// Persists: volume, speed, isMuted
// Store: useAudioPlayerStore (Zustand with persist)
```

### 5.6 TTS Settings State

```typescript
interface TtsSettings {
  provider: 'azure';
  voice?: string;
  emotion?: string; // Azure only
  
  // Randomization
  randomVoice: boolean;
  randomEmotion: boolean;
  
  // Audio params
  pitch?: number; // 0.5 - 2.0
  rate?: number;  // 0.5 - 2.0
  volume?: number;// 0.0 - 1.0
  
  // Multi-speaker
  multiTalker?: boolean;
  multiTalkerPairIndex?: number;
}
```

---

## 6. Gestures System

| Context | Gesture | Action |
|---------|---------|--------|
| Player | Swipe left | Previous sentence |
| Player | Swipe right | Next sentence |
| Player | Swipe down | Minimize player |
| Player | Double tap | Play/Pause |
| Transcript | Long press | Save bookmark |
| Pocket Mode | Swipe up | Save to bookmarks |

---

## 7. Implementation Tasks

### Config & Generation
- [ ] Config screen with topic, duration, mode
- [ ] Generate conversation via API

### Audio Player
- [ ] Basic audio player with play/pause/seek
- [ ] Speed control (0.5x - 2.0x)
- [ ] Waveform Visualizer — Animated bars khi đang phát, tích hợp trong progress bar

### Transcript
- [ ] Transcript display with auto-scroll
- [ ] Translation toggle — Bật/tắt bản dịch tiếng Việt (🇻🇳 button)
- [ ] Tappable Transcript — Tap từng từ trong transcript → DictionaryPopup tra nghĩa

### Global Audio Player
- [ ] Global Audio Player - Minimized mode (floating panel)
- [ ] Cross-tab MinimizedPlayer — `useFocusEffect` tự chuyển minimized mode (floating panel) khi screen blur
- [ ] Swipe-down minimize — Swipe down trên PlayerScreen → minimized mode (floating panel) + goBack

### Bookmarks & Vocabulary
- [ ] Bookmark sentences
- [ ] Saved Words viewer — Tab "Từ vựng" trong History, persist qua MMKV
- [ ] Sentence Bookmarks viewer — Hiển thị trong VocabularyTab, API getAll()

### Custom Scenarios
- [ ] Custom Scenarios UI
- [ ] Custom Scenarios CRUD

### Radio Mode
- [ ] Radio mode (playlists)
- [ ] Radio Mode: 1-min duration option
- [ ] Radio Mode: Progress tracking UI

### TTS Settings
- [ ] TTS Provider Settings UI
- [ ] Azure TTS Integration
- [ ] Multi-talker logic
- [ ] TTS Prosody Controls — Emotion, Pitch, Rate, Volume cho Azure TTS

### Background Audio & Session
- [ ] Background audio
- [ ] Lock screen controls
- [ ] Audio change confirmation dialog — ConfigScreen `handleGenerate()` kiểm tra audio đang phát
- [ ] Session restoration from player
- [ ] Session restoration fix — Persist conversation data để "Tiếp tục nghe" hoạt động sau reload
- [ ] Topic picker subcategory highlight

### Player Gestures & UX
- [ ] Player Gestures — Swipe L/R (skip), swipe down (minimize), double-tap (play/pause) + haptic feedback
- [ ] Pocket mode with gestures
- [ ] Walkthrough Tour — 5-step interactive tour cho first-time users

---

## 8. API Reference

> **Base URL:** `/api`  
> **Auth:** Tất cả endpoints yêu cầu `Authorization: Bearer <Supabase JWT>` (trừ khi ghi chú khác)

### 8.1 AI Module (`/api/ai`)

#### `POST /api/ai/generate-conversation`

> Sinh kịch bản hội thoại theo chủ đề (AI)

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `topic` | string | ✅ | Chủ đề hội thoại |
| `durationMinutes` | number | ✅ | Thời lượng (phút) |
| `numSpeakers` | number | ❌ | Số người nói, default: 2 |
| `keywords` | string | ❌ | Từ khóa gợi ý |

**Response:**

```json
{
  "script": [
    { "speaker": "Alex", "text": "Have you heard about..." },
    { "speaker": "Sarah", "text": "Yes, I think..." }
  ]
}
```

---

#### `POST /api/ai/transcribe`

> Chuyển audio thành text (Whisper STT)

**Request:** `multipart/form-data`

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `audio` | File | ✅ | File audio cần transcribe |

**Response:**

```json
{ "text": "I want to go for a walk today" }
```

---

#### `POST /api/ai/text-to-speech`

> Chuyển text thành audio (Azure TTS)

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `text` | string | ✅ | Text cần chuyển thành audio |
| `voice` | string | ❌ | Voice ID |
| `provider` | enum | ❌ | `azure` (mặc định) |
| `emotion` | string | ❌ | Emotion cho Azure (cheerful, sad...) |
| `randomVoice` | boolean | ❌ | Random giọng nói |
| `randomEmotion` | boolean | ❌ | Random cảm xúc |
| `pitch` | string | ❌ | Pitch adjustment (Azure) |
| `rate` | string | ❌ | Tốc độ đọc (Azure) |
| `volume` | string | ❌ | Âm lượng (Azure) |

**Response:**

```json
{
  "audio": "<base64-encoded-audio>",
  "contentType": "audio/mpeg",
  "wordTimestamps": [{ "word": "hello", "offset": 0, "duration": 500 }]
}
```

> `wordTimestamps` luôn có (Azure TTS)

---

#### `POST /api/ai/generate-conversation-audio`

> Sinh audio cho toàn bộ hội thoại với nhiều giọng

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `conversation` | `{ speaker, text }[]` | ✅ | Danh sách câu hội thoại |
| `provider` | enum | ❌ | azure (mặc định) |
| `voice` | string | ❌ | Voice ID chung |
| `emotion` | string | ❌ | Emotion cho Azure |
| `randomVoice` | boolean | ❌ | Random giọng cho từng speaker |
| `randomEmotion` | boolean | ❌ | Random emotion |
| `multiTalker` | boolean | ❌ | Dùng multi-talker Azure voice pair |
| `multiTalkerPairIndex` | number | ❌ | Index của cặp giọng |
| `voicePerSpeaker` | `Record<string, string>` | ❌ | Map speaker → voice ID |
| `pitch` | string | ❌ | Pitch adjustment |
| `rate` | string | ❌ | Tốc độ đọc |
| `volume` | string | ❌ | Âm lượng |

**Response:**

```json
{
  "audio": "<base64>",
  "contentType": "audio/mpeg",
  "timestamps": [{ "startTime": 0, "endTime": 3500 }],
  "wordTimestamps": [...],
  "audioUrl": "https://supabase-storage-url/..."
}
```

---

#### `POST /api/ai/generate-conversation-audio-sse`

> Sinh audio với SSE progress updates (streaming)

**Request Body:** Giống `generate-conversation-audio`

**Response:** SSE stream với events:

```
data: { "type": "progress", "current": 1, "total": 5, "speaker": "Alex" }
data: { "type": "complete", "audio": "<base64>", "timestamps": [...] }
data: { "type": "error", "message": "..." }
```

---

#### `GET /api/ai/voices?provider=azure`

> Lấy danh sách voices khả dụng

**Query Params:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `provider` | enum | ❌ | `azure` (mặc định) |

**Response:**

```json
{
  "voices": [{ "id": "en-US-AvaMultilingualNeural", "name": "Ava", "gender": "Female" }],
  "multiTalker": [{ "pair": ["Andrew", "Ava"], "index": 0 }]
}
```

---

#### `POST /api/ai/generate-interactive-conversation`

> Sinh hội thoại tương tác với [YOUR TURN] markers

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `topic` | string | ✅ | Chủ đề hội thoại |
| `contextDescription` | string | ❌ | Mô tả ngữ cảnh bổ sung |

**Response:**

```json
{
  "scenario": "At a restaurant",
  "script": [
    { "speaker": "Waiter", "text": "Welcome! Table for two?", "isUserTurn": false },
    { "speaker": "You", "text": "[YOUR TURN]", "isUserTurn": true }
  ]
}
```

---

#### `POST /api/ai/continue-conversation`

> AI tiếp tục hội thoại dựa trên user input

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `conversationHistory` | `{ speaker, text }[]` | ✅ | Lịch sử hội thoại |
| `userInput` | string | ✅ | Câu user vừa nói |
| `topic` | string | ✅ | Chủ đề hội thoại |

**Response:**

```json
{
  "response": "That's a great point! However...",
  "shouldEnd": false
}
```

---

### 8.2 Conversation Generator (`/api/conversation-generator`)

> Module dùng Groq LLM cho text generation

#### `POST /api/conversation-generator/generate`

> Sinh hội thoại theo chủ đề tự do (Groq)

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `topic` | string | ✅ | Chủ đề hội thoại |
| `durationMinutes` | number | ❌ | Thời lượng (5-15 phút), default: 5 |
| `level` | enum | ❌ | `beginner` \| `intermediate` \| `advanced` |
| `includeVietnamese` | boolean | ❌ | Bao gồm bản dịch tiếng Việt |
| `numSpeakers` | number | ❌ | Số người nói (2-4), default: 2 |
| `keywords` | string | ❌ | Từ khóa gợi ý (max 200 chars) |

---

#### `GET /api/conversation-generator/scenario?type=restaurant`

> Sinh hội thoại theo kịch bản có sẵn

**Query Params:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `type` | enum | ✅ | `restaurant` \| `hotel` \| `shopping` \| `airport` \| `hospital` \| `job_interview` \| `phone_call` \| `small_talk` |
| `customContext` | string | ❌ | Yêu cầu bổ sung cho kịch bản |

---

#### `POST /api/conversation-generator/practice`

> Sinh hội thoại luyện tập từ vựng và ngữ pháp

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `keywords` | string[] | ✅ | Danh sách từ vựng cần luyện |
| `grammarFocus` | string | ❌ | Cấu trúc ngữ pháp |
| `topic` | string | ❌ | Chủ đề, default: daily life |
| `level` | enum | ❌ | `beginner` \| `intermediate` \| `advanced` |

---

#### `POST /api/conversation-generator/generate-text`

> Sinh văn bản tổng quát (bài đọc, câu hỏi) bằng Groq

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `prompt` | string | ✅ | Prompt gửi đến AI |
| `systemPrompt` | string | ❌ | System prompt (vai trò AI) |

**Response:**

```json
{ "text": "Generated text content..." }
```

---

#### `POST /api/conversation-generator/generate-interactive`

> Sinh hội thoại tương tác (Groq) — tương tự `/ai/generate-interactive-conversation`

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `topic` | string | ✅ | Chủ đề |
| `contextDescription` | string | ❌ | Mô tả ngữ cảnh |

---

#### `POST /api/conversation-generator/continue-conversation`

> AI phản hồi hội thoại + phát hiện lỗi ngữ pháp (Groq)

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `conversationHistory` | `{ speaker, text }[]` | ✅ | Lịch sử hội thoại |
| `userInput` | string | ✅ | Câu user vừa nói |
| `topic` | string | ✅ | Chủ đề |

---

#### `POST /api/conversation-generator/evaluate-pronunciation`

> Đánh giá phát âm chi tiết từng từ (Groq)

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `originalText` | string | ✅ | Văn bản gốc (mẫu) |
| `userTranscript` | string | ✅ | Transcript từ Whisper |

---

#### `GET /api/conversation-generator/health`

> Kiểm tra trạng thái Groq API

**Response:**

```json
{ "status": "ok" }
```

---

### 8.3 Radio Module (`/api/radio`)

#### `GET /api/radio/preview`

> Lấy preview thông tin Radio playlist trước khi tạo

**Response:**

```json
{
  "success": true,
  "data": {
    "duration": 30,
    "trackCount": 10,
    "estimatedTime": "~30 giây"
  }
}
```

---

#### `POST /api/radio/generate`

> Tạo Radio playlist mới 🔒

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `duration` | number | ✅ | Thời lượng: `1` \| `30` \| `60` \| `120` phút |

**Response:**

```json
{
  "success": true,
  "data": { "id": "...", "items": [...], "duration": 30 }
}
```

---

### 8.4 Playlists Module (`/api/playlists`)

#### `GET /api/playlists`

> Lấy danh sách playlists của user

**Response:**

```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "My Playlist", "description": "...", "itemCount": 5 }
  ]
}
```

---

#### `POST /api/playlists`

> Tạo playlist mới

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `name` | string | ✅ | Tên playlist |
| `description` | string | ❌ | Mô tả |

---

#### `GET /api/playlists/:id`

> Lấy chi tiết playlist kèm items

---

#### `PUT /api/playlists/:id`

> Cập nhật tên/mô tả playlist

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `name` | string | ❌ | Tên mới |
| `description` | string | ❌ | Mô tả mới |

---

#### `DELETE /api/playlists/:id`

> Xóa playlist

---

#### `POST /api/playlists/:id/items`

> Thêm item vào playlist

**Request Body:** `AddPlaylistItemDto` (topic, conversation, duration, numSpeakers...)

---

#### `DELETE /api/playlists/:id/items/:itemId`

> Xóa item khỏi playlist

---

#### `PUT /api/playlists/:id/reorder`

> Sắp xếp lại items trong playlist

**Request Body:**

```json
{ "items": [{ "id": "item-uuid", "position": 0 }, { "id": "item-uuid-2", "position": 1 }] }
```

---

#### `PUT /api/playlists/:id/items/:itemId/audio`

> Cập nhật audio URL cho item

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `audioUrl` | string | ✅ | URL audio trên Supabase Storage |
| `audioTimestamps` | `{ startTime, endTime }[]` | ❌ | Timestamps từng câu |

---

### 8.5 Listen Later Module (`/api/listen-later`)

#### `GET /api/listen-later`

> Lấy danh sách Nghe Sau

---

#### `POST /api/listen-later`

> Thêm item vào Nghe Sau

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `topic` | string | ✅ | Chủ đề |
| `conversation` | `{ speaker, text }[]` | ✅ | Nội dung hội thoại |
| `duration` | number | ✅ | Thời lượng (phút) |
| `numSpeakers` | number | ✅ | Số người nói |
| `category` | string | ❌ | Phân loại |
| `subCategory` | string | ❌ | Phân loại phụ |
| `audioUrl` | string | ❌ | URL audio đã sinh |
| `audioTimestamps` | array | ❌ | Timestamps |

---

#### `PATCH /api/listen-later/:id/audio`

> Cập nhật audio cho item Nghe Sau

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `audioUrl` | string | ✅ | URL audio |
| `audioTimestamps` | `{ startTime, endTime }[]` | ❌ | Timestamps |

---

#### `DELETE /api/listen-later/:id`

> Xóa item khỏi Nghe Sau

---

#### `DELETE /api/listen-later`

> Xóa tất cả items trong Nghe Sau

---

### 8.6 Bookmarks Module (`/api/bookmarks`)

#### `POST /api/bookmarks`

> Tạo bookmark câu mới (long press transcript)

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `historyEntryId` | string | ❌ | ID session liên quan |
| `sentenceIndex` | number | ✅ | Vị trí câu trong transcript |
| `speaker` | string | ✅ | Người nói |
| `sentenceText` | string | ✅ | Nội dung câu tiếng Anh |
| `sentenceTranslation` | string | ❌ | Bản dịch tiếng Việt |
| `topic` | string | ❌ | Chủ đề bài nghe |

**Response:**

```json
{
  "success": true,
  "bookmark": { "id": "uuid", "sentenceIndex": 3, "sentenceText": "..." },
  "alreadyExists": false
}
```

---

#### `GET /api/bookmarks?page=1&limit=20`

> Lấy danh sách bookmarks (paginated)

---

#### `GET /api/bookmarks/session/:historyEntryId`

> Lấy bookmarks theo session cụ thể

---

#### `DELETE /api/bookmarks/:id`

> Xóa bookmark theo ID

---

#### `POST /api/bookmarks/remove-by-index`

> Toggle bookmark off theo sentence index

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `historyEntryId` | string | ❌ | ID session |
| `sentenceIndex` | number | ✅ | Vị trí câu cần bỏ bookmark |

---

### 8.7 Lessons Module (`/api/lessons`)

#### `POST /api/lessons`

> Tạo lesson mới (lưu bài học vào database)

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `type` | enum | ✅ | `listening` \| `speaking` \| `reading` \| `writing` |
| `topic` | string | ✅ | Chủ đề bài học |
| `content` | any | ✅ | Nội dung bài học (conversation, article...) |
| `durationMinutes` | number | ❌ | Thời lượng |
| `numSpeakers` | number | ❌ | Số speaker |
| `keywords` | string | ❌ | Từ khóa |
| `mode` | enum | ❌ | `passive` \| `interactive` |
| `status` | enum | ❌ | `draft` \| `completed` |

**Response:**

```json
{ "success": true, "lesson": { "id": "uuid", "type": "listening", "topic": "...", "createdAt": "..." } }
```

---

#### `PATCH /api/lessons/:id/audio`

> Cập nhật audio URL và timestamps cho lesson

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `audioUrl` | string | ✅ | URL audio trên Supabase Storage |
| `audioTimestamps` | `{ startTime, endTime }[]` | ❌ | Timestamps từng câu |

**Response:**

```json
{ "success": true, "message": "Đã lưu audio URL" }
```

---

### 8.8 Custom Scenarios Module (`/api/custom-scenarios`)

#### `GET /api/custom-scenarios`

> Lấy danh sách custom scenarios của user

---

#### `POST /api/custom-scenarios`

> Tạo custom scenario mới

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `name` | string | ✅ | Tên scenario |
| `description` | string | ❌ | Mô tả |
| `category` | string | ❌ | Phân loại |

---

#### `PATCH /api/custom-scenarios/:id`

> Cập nhật custom scenario

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `name` | string | ❌ | Tên mới |
| `description` | string | ❌ | Mô tả mới |
| `isFavorite` | boolean | ❌ | Đánh dấu yêu thích |

---

#### `PATCH /api/custom-scenarios/:id/favorite`

> Toggle trạng thái favorite

---

#### `DELETE /api/custom-scenarios/:id`

> Xóa custom scenario

---

## 9. Related Documents

- [00_Mobile_Overview.md](../00_Mobile_Overview.md) - Project overview
- [10_Native_Features.md](10_Native_Features.md) - Gestures
- [09_Special_Modes.md](09_Special_Modes.md) - Pocket mode, Car mode
- [Architecture.md](../technical/Architecture.md) - Audio handling
