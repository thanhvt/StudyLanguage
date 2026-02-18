# 👤 Profile & Settings Feature - Mobile

> **Module:** Profile & Settings  
> **Priority:** P1 (Core)  
> **Phase:** MVP

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

## 2. UI Mockups

### 2.1 Profile Screen

```
┌─────────────────────────────────┐
│  👤 Profile                 ⚙️  │
├─────────────────────────────────┤
│                                 │
│         [Avatar]                │
│      Thành Vũ Trịnh             │
│  thanhvt1.ho@gmail.com          │
│                                 │
├─────────────────────────────────┤
│  📊 Statistics                  │
│  ┌─────────┬─────────┬────────┐│
│  │ 🔥 Streak│ ⏱️ Time │ 📚 Words││
│  │  7 days │ 3.5 hrs │  156   ││
│  └─────────┴─────────┴────────┘│
│  🗣️ Speaking Goal: 8/10 (NEW ✨) │
├─────────────────────────────────┤
│  📈 This Week                   │
│  ┌─────────────────────────┐   │
│  │  M  T  W  T  F  S  S    │   │
│  │  ●  ●  ●  ●  ○  ○  ○    │   │
│  │ 15 20 10 25           min│   │
│  └─────────────────────────┘   │
├─────────────────────────────────┤
│  ⚙️ Settings                    │
│  › Appearance                   │
│  › Audio Settings               │
│  › Privacy                      │
│  › About                        │
├─────────────────────────────────┤
│  🚪 Đăng xuất                   │
└─────────────────────────────────┘
```

**Specs:**
- Avatar: Tap to change (camera/gallery)
- Stats: Quick overview cards
- Week view: Activity dots + minutes
- Settings: Navigation list

### 2.2 Appearance Settings

```
┌─────────────────────────────────┐
│  ← Appearance               ✓  │
├─────────────────────────────────┤
│                                 │
│  🎨 Theme                       │
│  ┌─────────────────────────┐   │
│  │ [☀️ Light] [🌙 Dark] [📱 Auto]│
│  └─────────────────────────┘   │
│                                 │
│  🎨 Accent Color                │
│  ┌─────────────────────────┐   │
│  │ 🟢 🔵 🟣 🟠 🔴 🩷       │   │
│  │  ●                       │   │
│  └─────────────────────────┘   │
│                                 │
│  🔤 Font Size                   │
│  ┌─────────────────────────┐   │
│  │ Small  [Medium]  Large  │   │
│  └─────────────────────────┘   │
│                                 │
│  Preview:                       │
│  ┌─────────────────────────┐   │
│  │ The quick brown fox     │   │
│  │ jumps over the lazy dog │   │
│  └─────────────────────────┘   │
│                                 │
│  🌐 Language                    │
│  ┌─────────────────────────┐   │
│  │ [English] [Tiếng Việt]  │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### 2.3 Audio Settings

```
┌─────────────────────────────────┐
│  ← Audio Settings           ✓  │
├─────────────────────────────────┤
│                                 │
│  🎵 Background Music            │
│  ┌─────────────────────────┐   │
│  │ [ON]                    │   │
│  │ 🎵 Lofi Study Chill     │   │
│  │ [⏮️] [⏯️] [⏭️] [🔀]      │   │
│  │ Volume: ────●────────    │   │
│  └─────────────────────────┘   │
│  › Chi tiết: 10_Native_Features │
│                                 │
│  🔉 Smart Ducking               │
│  ┌─────────────────────────┐   │
│  │ [ON]                    │   │
│  │ Tự giảm nhạc khi lesson │   │
│  │ audio đang phát          │   │
│  └─────────────────────────┘   │
│                                 │
│  🔊 Sound Effects               │
│  ┌─────────────────────────┐   │
│  │ [ON]                    │   │
│  │ Success/Error sounds    │   │
│  └─────────────────────────┘   │
│                                 │
│  ⚡ Default Playback Speed      │
│  ┌─────────────────────────┐   │
│  │ 0.5 0.8 [1.0] 1.2 1.5 2.0 │   │
│  └─────────────────────────┘   │
│                                 │
│  🤖 Auto-play Audio             │
│  ┌─────────────────────────┐   │
│  │ [ON]                    │   │
│  │ Auto play next sentence │   │
│  └─────────────────────────┘   │
│                                 │
│  🙌 Hands-free Mode             │
│  ┌─────────────────────────┐   │
│  │ [OFF]                   │   │
│  │ Complete lesson without │   │
│  │ touching screen         │   │
│  └─────────────────────────┘   │
│                                 │
│  🗣️ AI Voice Settings           │
│  [ Configure in Listening > ]   │
│                                 │
└─────────────────────────────────┘
```

### 2.4 Privacy Settings

```
┌─────────────────────────────────┐
│  ← Privacy                  ✓  │
├─────────────────────────────────┤
│                                 │
│  🎤 Save Recordings             │
│  ┌─────────────────────────┐   │
│  │ [ON]                    │   │
│  │ Keep speaking practice  │   │
│  │ recordings for review   │   │
│  └─────────────────────────┘   │
│                                 │
│  🗑️ Auto-delete Recordings      │
│  ┌─────────────────────────┐   │
│  │ After: [30] [60] [90] days│  │
│  │              ●           │   │
│  └─────────────────────────┘   │
│                                 │
│  ☁️ Data Sync                   │
│  ┌─────────────────────────┐   │
│  │ [ON]                    │   │
│  │ Sync progress across    │   │
│  │ all your devices        │   │
│  └─────────────────────────┘   │
│                                 │
│                                 │
│  ┌─────────────────────────┐   │
│  │   📤 Export My Data     │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │   🗑️ Delete All Data    │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### 2.5 About Screen

```
┌─────────────────────────────────┐
│  ← About                       │
├─────────────────────────────────┤
│                                 │
│         📚                      │
│    StudyLanguage               │
│    Version 1.0.0               │
│                                 │
├─────────────────────────────────┤
│                                 │
│  › Terms of Service             │
│  › Privacy Policy               │
│  › Licenses                     │
│  › Contact Support              │
│  › Rate the App                 │
│                                 │
├─────────────────────────────────┤
│                                 │
│  Made with ❤️ for learning      │
│  © 2026 StudyLanguage           │
│                                 │
└─────────────────────────────────┘
```

### 2.6 Logout Confirmation

```
┌─────────────────────────────────┐
│                                 │
│         Đăng xuất?              │
│                                 │
│  Bạn có chắc muốn đăng xuất    │
│  khỏi tài khoản?                │
│                                 │
│  Dữ liệu chưa sync sẽ bị mất.   │
│                                 │
│  [Hủy]         [Đăng xuất]     │
│                                 │
└─────────────────────────────────┘
```

---

## 3. Settings Details

### 3.1 Appearance Options

| Setting | Options | Default |
|---------|---------|---------|
| Theme | Light / Dark / Auto | Auto |
| Accent Color | 6 colors | Green |
| Font Size | Small / Medium / Large | Medium |
| Language | English / Vietnamese | Vietnamese |

### 3.2 Audio Options

| Setting | Options | Default |
|---------|---------|---------|
| Background Music | ON/OFF + Volume | ON, 50% |
| Music Ducking | ON/OFF | ON |
| Sound Effects | ON/OFF | ON |
| Playback Speed | 0.5x - 2.0x | 1.0x |
| Auto-play | ON/OFF | ON |
| Hands-free | ON/OFF | OFF |
| AI Voice | Config in Listening | - |

### 3.3 Privacy Options

| Setting | Options | Default |
|---------|---------|---------|
| Save Recordings | ON/OFF | ON |
| Auto-delete | 30/60/90 days | 60 days |
| Data Sync | ON/OFF | ON |

---

## 4. Technical Implementation

### 4.1 Storage

```typescript
// AsyncStorage keys
const SETTINGS_KEYS = {
  THEME: '@settings/theme',
  ACCENT_COLOR: '@settings/accentColor',
  FONT_SIZE: '@settings/fontSize',
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
    fontSize: 'small' | 'medium' | 'large';
    language: 'en' | 'vi';
  };
  

  
  audio: {
    backgroundMusic: { enabled: boolean; volume: number };
    musicDucking: boolean;
    soundEffects: boolean; // NEW ✨
    playbackSpeed: number; // 0.5 - 2.0
    autoPlay: boolean; // NEW ✨
    handsFree: boolean; // NEW ✨
  };
  
  privacy: {
    saveRecordings: boolean;
    autoDeleteDays: 30 | 60 | 90;
    dataSync: boolean;
  };
}
```

---

## 5. Implementation Tasks

### MVP Phase
- [ ] Profile screen with user info
- [ ] Basic stats display
- [ ] **Week activity chart component** (dots + minutes) (NEW ✨)
- [ ] Theme toggle (Light/Dark)
- [ ] Logout functionality
- [ ] About screen

### Enhanced Phase
- [ ] Full appearance settings
- [ ] **Accent color picker** (6 colors) (NEW ✨)
- [ ] **Avatar change** (camera/gallery picker) (NEW ✨)
- [ ] **Speaking goal display** (e.g. 8/10) (NEW ✨)

- [ ] Audio settings (Music, SFX, Speed)
- [ ] Auto-play & Hands-free logic

- [ ] Privacy settings
- [ ] Export/Delete data

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

#### `PATCH /api/user/profile`

> Cập nhật thông tin profile

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `displayName` | string | ❌ | Tên hiển thị mới |
| `avatarUrl` | string | ❌ | URL avatar mới |

---

#### `POST /api/user/avatar`

> Upload ảnh avatar (multipart form-data)

**Request:** `multipart/form-data`

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `avatar` | File | ✅ | File ảnh avatar |

**Response:**

```json
{ "avatarUrl": "https://supabase-storage-url/avatars/user-id.jpg" }
```

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

---

#### `DELETE /api/user/delete-account`

> ⚠️ Xóa account và toàn bộ data (KHÔNG THỂ hoàn tác)

**Response:**

```json
{ "success": true, "message": "Tài khoản đã được xóa vĩnh viễn" }
```

---

### 6.2 Notifications Module (`/api/notifications`)

#### `POST /api/notifications/register-device`

> Đăng ký FCM/APNs token cho push notification

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `token` | string | ✅ | FCM/APNs device token |
| `platform` | enum | ✅ | `ios` \| `android` |

---

#### `POST /api/notifications/send`

> Gửi push notification (internal/admin)

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `userId` | string | ✅ | ID user nhận notification |
| `title` | string | ✅ | Tiêu đề |
| `body` | string | ✅ | Nội dung |
| `data` | object | ❌ | Data payload tùy chỉnh |

---

#### `DELETE /api/notifications/unregister`

> Xóa device token khi user logout

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `token` | string | ✅ | Token cần xóa |

---

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
- [10_Native_Features.md](10_Native_Features.md) - Notifications
