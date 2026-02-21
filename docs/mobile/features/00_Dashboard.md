# 🏠 Dashboard Feature - Mobile

> **Module:** Dashboard  
> **Priority:** P0 (Core)  

---

## 1. Overview

Module trang chủ hiển thị tổng quan tiến trình học tập, và quick access đến 3 skills. Thiết kế tối giản, thoáng, phù hợp mobile.

### 1.1 Dashboard Views

| View | Condition | Key Elements |
|------|-----------|--------------|
| **Auth Dashboard** | User đã đăng nhập | Greeting, Streak, Quick Actions |

### 1.2 Widget Selection (Mobile-Optimized)

Chỉ giữ các widget phù hợp mobile, loại bỏ chart phức tạp:

| Widget | MVP | Enhanced | Lý do |
|--------|-----|----------|-------|
| **Greeting + Streak** | ✅ | ✅ | Nhẹ, motivating |
| **Quick Actions** (3 skills) | ✅ | ✅ | Navigation chính |


---

## 2. User Flows

### 2.1 Auth User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [App Launch] → [Splash] → [Dashboard]                       │
│                              │                              │
│                              │                              │
│                       [Quick Actions]                       │
│                              ↓                              │
│              [Listening] [Speaking] [Reading]               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---


## 4. Features Detail

### 4.1 Greeting Logic

| Time Range | Greeting |
|-----------|----------|
| 05:00 - 11:59 | Chào buổi sáng ☀️ |
| 12:00 - 17:59 | Chào buổi chiều 🌤️ |
| 18:00 - 21:59 | Chào buổi tối 🌙 |
| 22:00 - 04:59 | Chào khuya 🌃 |



### 4.2 Quick Actions

| Skill | Icon | Color | Navigate To |
|-------|------|-------|-------------|
| Nghe | 🎧 | Blue/Indigo | `/listening` |
| Nói | 🗣️ | Green | `/speaking` |
| Đọc | 📖 | Amber | `/reading` |

**Interaction:**
- Tap: Navigate to skill page
- Animation: Scale press effect (0.95x)
- Haptic: Light impact on tap

---

## 5. Technical Implementation

### 5.1 State Structure

```typescript
interface DashboardState {
  // User stats
  stats: {
    streak: number;

  
  // Loading
  loading: boolean;
}
```

### 5.2 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/user/stats` | GET | Streak, total minutes, level |


### 5.3 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [App Launch] → [Fetch Stats] → [Cache] → [Render Dashboard] │
│                     │                                       │
│               [TanStack Query]                              │
│               staleTime: 5min                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 Libraries

```typescript

react-native-reanimated   // Animations
react-native-haptic-feedback // Tap feedback
```

---

## 6. Implementation Tasks

### Dashboard Layout
- [ ] Dashboard screen layout (auth/guest views)
- [ ] Greeting component (time-based)
- [ ] Streak display (inline)
- [ ] Guest Dashboard hero + CTA

### Quick Actions
- [ ] Quick Actions (3 skill cards)
- [ ] Navigate to skill pages

### Animations & Polish
- [ ] Pull-to-refresh stats
- [ ] Animated transitions


---

## 7. API Reference

> **Base URL:** `/api`  
> **Auth:** Tất cả endpoints yêu cầu `Authorization: Bearer <Supabase JWT>`

### 7.1 User Module (`/api/user`)

#### `GET /api/user/stats`

> Lấy stats tổng quan cho Dashboard widgets

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

> Lấy từ vựng hàng ngày cho Word of Day widget

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

> Lấy session cuối cùng cho "Continue Last Lesson" card

**Response:**

```json
{
  "id": "uuid",
  "type": "listening",
  "title": "Business Meeting",
  "date": "2025-01-15T10:30:00Z",
  "duration": 5,
  "progress": 60
}
```

> Trả về `null` nếu chưa có session nào

---

## 8. Related Documents

- [00_Mobile_Overview.md](../00_Mobile_Overview.md) - Project overview
- [01_Authentication.md](01_Authentication.md) - Auth flows
- [07_History.md](07_History.md) - Learning data source
- [Architecture.md](../technical/Architecture.md) - Data flow
