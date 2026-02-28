# 👤 Profile & Settings Feature - Mobile

> **Module:** Profile & Settings  

---

## 1. Overview

Module quản lý hồ sơ người dùng và cài đặt ứng dụng.

### 1.1 Key Areas

| Area | Description |
|------|-------------|
| **Profile** | User info, statistics |
| **Appearance** | Theme, font, language |
| **Audio** | Voice, speed, music |
| **Privacy** | Data, recordings |

---


## 3. Settings Details

### 3.1 Appearance Options

| Setting | Options | Default |
|---------|---------|---------|
| Theme | Light / Dark / Auto | Auto |
| Accent Color | 6 colors | Green |
| Language | English / Vietnamese | Vietnamese |

### 3.2 Audio Options

| Setting | Options | Default |
|---------|---------|---------|
| Background Music | ON/OFF + Volume | ON, 50% |
| Music Ducking | ON/OFF | ON |
| Sound Effects | ON/OFF | ON |
| Auto-play | ON/OFF | ON |
| AI Voice | Config in Listening | - |

### 3.3 Privacy Options

| Setting | Options | Default |
|---------|---------|---------|
| Save Recordings | ON/OFF | ON |
| Data Sync | ON/OFF | ON |

---

## 4. Technical Implementation

### 4.1 Storage

```typescript
// MMKV keys
const SETTINGS_KEYS = {
  THEME: '@settings/theme',
  ACCENT_COLOR: '@settings/accentColor',
  LANGUAGE: '@settings/language',

  AUDIO: '@settings/audio',
  PRIVACY: '@settings/privacy',
};
```

### 4.2 State Structure

```typescript
interface SettingsState {
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    accentColor: string;
    language: 'en' | 'vi';
  };
  
  audio: {
    backgroundMusic: { enabled: boolean; volume: number };
    musicDucking: boolean;
    soundEffects: boolean;
    autoPlay: boolean;
  };
  
  privacy: {
    saveRecordings: boolean;
    dataSync: boolean;
  };
}
```

---

## 5. Implementation Tasks

### Profile
- [ ] Profile screen with user info
- [ ] Basic stats display
- [ ] Week activity chart component (dots + minutes)
- [ ] Speaking goal display (e.g. 8/10)

### Appearance
- [ ] Theme toggle (Light/Dark/Auto)
- [ ] Full appearance settings
- [ ] Accent color picker (6 colors)

### Audio
- [ ] Audio settings (Music, SFX, Auto-play)

### Privacy & Data
- [ ] Privacy settings
- [ ] Export data

### Account
- [ ] Logout functionality
- [ ] About screen

---

## 6. API Reference

> **Base URL:** `/api`  
> **Auth:** Tất cả endpoints yêu cầu `Authorization: Bearer <Supabase JWT>` (trừ Feedback submit)

### 6.1 User Module (`/api/user`)

#### `GET /api/user/stats`

> Lấy stats tổng quan cho Dashboard/Profile

**Response:**

```json
{
  "streak": 7,
  "totalMinutes": 500,
  "level": "intermediate",
  "goals": { "daily": 30, "completed": 25 },
  "totalSessions": 42
}
```

---

#### `GET /api/user/word-of-the-day`

> Lấy từ vựng của ngày hôm nay

**Response:**

```json
{
  "success": true,
  "word": {
    "word": "serendipity",
    "ipa": "/ˌsɛr.ənˈdɪp.ɪ.ti/",
    "meaning": "Sự tình cờ may mắn",
    "example": "Finding that book was pure serendipity."
  }
}
```

---

#### `GET /api/user/last-session`

> Lấy session cuối cùng để hiển thị "Continue Last Lesson"

**Response:** Session object hoặc `null`


---

#### `GET /api/user/gamification`

> Lấy dữ liệu XP, level, badges, goals

**Response:**

```json
{
  "xp": 1250,
  "level": 5,
  "badges": [{ "id": "streak_7", "name": "7-Day Streak", "unlockedAt": "..." }],
  "dailyGoal": { "target": 10, "completed": 8 }
}
```

---

#### `POST /api/user/gamification/check-badge`

> Kiểm tra và unlock badges mới sau mỗi lesson

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `totalSessions` | number | ❌ | Tổng số sessions đã hoàn thành |
| `totalMinutes` | number | ❌ | Tổng số phút học |
| `streak` | number | ❌ | Streak hiện tại |

**Response:**

```json
{
  "newBadges": [{ "id": "first_50", "name": "50 Sessions", "icon": "🏆" }]
}
```

---

#### `GET /api/user/settings`

> Lấy settings đồng bộ từ server

**Response:**

```json
{
  "settings": {
    "theme": "dark",
    "fontSize": "medium",
    "ttsProvider": "azure",
    "notifications": true
  }
}
```

---

#### `PUT /api/user/settings`

> Sync settings lên server (overwrite)

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `settings` | object | ✅ | JSON object chứa toàn bộ settings |

---

#### `POST /api/user/export-data`

> Export toàn bộ data (GDPR compliance)

**Response:** JSON chứa tất cả data của user




### 6.3 Feedback Module (`/api/feedback`)

#### `POST /api/feedback`

> Gửi góp ý/phản hồi (🔓 không yêu cầu auth)

**Request Body:** `CreateFeedbackDto` (type, message, rating, contactEmail...)

---

#### `GET /api/feedback`

> Lấy danh sách feedback của user (🔒 yêu cầu auth)

---

### 6.4 Sync Module (`/api/sync`)

#### `POST /api/sync/queue`

> Upload và process offline action queue

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `actions` | `SyncActionDto[]` | ✅ | Danh sách actions cần sync |

**SyncActionDto:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `id` | string | ✅ | ID unique của action |
| `type` | enum | ✅ | `CREATE` \| `UPDATE` \| `DELETE` |
| `table` | string | ✅ | Tên table (e.g., `history`, `bookmarks`) |
| `data` | object | ✅ | Data để sync |
| `timestamp` | string | ✅ | ISO timestamp khi action xảy ra |

---

#### `GET /api/sync/status`

> Kiểm tra sync status và timestamp cuối

**Response:**

```json
{ "lastSync": "2025-01-15T10:30:00Z", "serverTime": "2025-01-15T10:35:00Z" }
```

---

## 7. Related Documents

- [00_Mobile_Overview.md](../00_Mobile_Overview.md) - Project overview
- [01_Authentication.md](01_Authentication.md) - Login/Logout
- [10_Native_Features.md](10_Native_Features.md) - Native features
