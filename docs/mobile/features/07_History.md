# 📜 History Feature - Mobile

> **Module:** History  
> **Priority:** P1 (Core)  

---

## 1. Overview

Module lịch sử học tập với timeline view, filter theo skill, và sync across devices.

### 1.1 Key Features

| Feature | Description |
|---------|-------------|
| **Timeline View** | Grouped by date |
| **Filter by Skill** | Listening, Speaking, Reading |
| **Filter by Date Range** | Tuần này, Tháng này, Custom range (NEW ✨) |
| **Detail View** | Full session info |
| **Quick Actions** | Replay, practice again, swipe gestures |
| **Recent Lessons Panel** | Quick access từ skill pages (NEW ✨) |
| **Session Restoration** | Resume session từ audio player (NEW ✨) |
| **Persist Audio Data** | Lưu audio URL để replay không cần regenerate (NEW ✨) |
| **Analytics Dashboard** | Stats cards, heatmap, charts (NEW ✨) |
| **AI Insights** | Phân tích thói quen học tập (NEW ✨) |
| **Batch Actions** | Multi-select, delete nhiều sessions (NEW ✨) |
| **Export/Share** | Share session dạng image card hoặc PDF (NEW ✨) |

### 1.2 Analytics Features (NEW ✨)

Bổ sung các biểu đồ và thống kê chi tiết như web-v2:

| Feature | Description |
|---------|-------------|
| **Stats Cards** | Tổng quan hôm nay, tuần này, streak, tổng giờ học |
| **Weekly Heatmap** | Calendar contribution graph (giống GitHub) |
| **Progress Chart** | Line chart tiến trình theo tuần/tháng |
| **Skill Distribution** | Pie/donut chart phân bổ kỹ năng |
| **AI Insights** | Tips cá nhân hóa dựa trên dữ liệu học tập |
| **Pinned Items** | Ghim các session quan trọng lên đầu |

### 1.3 Recent Lessons Panel (NEW ✨)

Quick access panel hiển thị các bài học gần đây, tích hợp trực tiếp vào các skill pages.

| Feature | Description |
|---------|-------------|
| **Quick Access** | Hiển thị 5 bài học gần nhất theo skill type |
| **Authentication Check** | Yêu cầu đăng nhập để xem lịch sử |
| **Play Entry** | Phát lại bài học trực tiếp |
| **View All** | Link đến History page với filter |

**Authentication Flow:**
- **Guest**: Hiển thị CTA đăng nhập
- **Logged in**: Hiển thị danh sách bài học gần đây

### 1.4 Session Restoration (NEW ✨)

Cho phép resume session từ Global Audio Player hoặc Recent Lessons:

| Feature | Description |
|---------|-------------|
| **Resume from Player** | Click topic name trên player → Mở detail với transcript |
| **Persist Audio URL** | Lưu audio URL vào history để replay ngay |
| **Restore Config** | Khôi phục cấu hình session (mode, speakers, duration) |
| **Navigate to Page** | Tự động navigate về skill page tương ứng |

---

## 2. User Flows

### 2.1 History Navigation

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [Tab: History]  →  [Filter]  →  [Session Card]  →  [Detail]│
│                                      │              Replay  │
│                                      └─────────────────────►│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Filter Flow (NEW ✨)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [Skill Filter]  →  [Date Range]  →  [Sort Order]  →  [List]│
│  All/🎧/🗣️/📖    Week/Month/Custom  Newest/Oldest  Results│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Batch Actions Flow (NEW ✨)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [Long Press Card] → [Multi-Select Mode] → [Select Cards]   │
│                             │                               │
│                    [Batch Actions Bar]                      │
│                    [🗑️ Delete] [⭐ Favorite] [Cancel]       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---


## 4. Features Detail

### 4.1 Session Types & Visual Identity

| Type | Icon | Accent Color | Data Shown |
|------|------|-------------|------------|
| Listening | 🎧 | Blue/Indigo `#4F46E5` | Duration, comprehension %, bookmarks |
| Speaking | 🗣️ | Green `#16A34A` | Duration, score, sentences count |
| Reading | 📖 | Amber `#D97706` | Duration, quiz score, words read |

### 4.2 Quick Actions

| Action | Trigger | Description |
|--------|---------|-------------|
| Replay | Tap / Swipe | Play audio again (Listening) |
| Practice Again | Tap | Start new session with same config |
| Pin | Swipe right / Long press | Ghim lên đầu list |
| Favorite | Swipe right / Long press | Mark as important |
| Share | Long press | Export session data |
| Delete | Swipe left / Long press | Remove from history (confirm dialog) |

### 4.3 Sync Strategy

| Scenario | Behavior |
|----------|----------|
| Online | Sync immediately after session |
| Conflict | Latest timestamp wins |

### 4.4 Gestures (NEW ✨)

Consistent với Listening module gesture system:

| Context | Gesture | Action |
|---------|---------|--------|
| Session Card | Tap | Navigate to detail |
| Session Card | Long press | Quick Actions bottom sheet |
| Session Card | Swipe left | Delete (confirm) |
| Session Card | Swipe right | Pin/Favorite toggle |
| Detail view | Swipe down | Back to list |
| Detail transcript | Double tap | Quick bookmark |
| List | Pull down | Refresh data |

### 4.5 Animations & Transitions (NEW ✨)

| Element | Animation | Spec |
|---------|-----------|------|
| Card press | Scale down | `transform: scale(0.95)`, 150ms ease |
| Card tap | Haptic | Light impact feedback |
| Card delete | Slide + Fade | Slide left + opacity → 0, 300ms |
| Detail open | Shared element | Card → Full screen transition |
| Empty state | Fade in | Opacity 0 → 1, 500ms delay |
| Skeleton | Shimmer | Gradient pulse left → right, 1.5s loop |
| AI Insight | Slide up | Translate Y 20px → 0, 400ms fade-in |
| Pull refresh | Spring | Spring animation on release |

---

## 5. Technical Implementation

### 5.1 State Structure

```typescript
interface HistoryState {
  // Danh sách sessions
  sessions: Session[];
  
  // Bộ lọc kỹ năng
  filter: 'all' | 'listening' | 'speaking' | 'reading';
  
  // Bộ lọc thời gian (NEW ✨)
  dateRange: 'week' | 'month' | '3months' | 'custom';
  customDateStart?: Date;
  customDateEnd?: Date;
  
  // Sắp xếp (NEW ✨)
  sortOrder: 'newest' | 'oldest';
  
  // Tìm kiếm
  searchQuery: string;
  recentSearches: string[]; // NEW ✨
  
  // Phân trang
  page: number;
  hasMore: boolean;
  loading: boolean;
  
  // Chế độ chọn nhiều (NEW ✨)
  selectionMode: boolean;
  selectedIds: string[];
}

interface Session {
  id: string;
  type: 'listening' | 'speaking' | 'reading';
  title: string;
  date: Date;
  duration: number; // phút
  score?: number;
  config: SessionConfig;
  data: SessionData;
  isFavorite: boolean;
  isPinned?: boolean;
  syncStatus: 'synced' | 'pending' | 'error';
  audioUrl?: string; // Lưu audio URL để replay (NEW ✨)
}

interface UserStats {
  streak: number;
  totalHours: number;
  totalLessons: number;
  // Thống kê nâng cao (NEW ✨)
  averageScore: number;
  bestScore: number;
  trend: 'improving' | 'declining' | 'stable';
  weeklyData: { day: string; minutes: number }[];
  heatmapData: { date: string; count: number }[];
  skillDistribution: { skill: string; count: number }[];
  aiInsight: string;
}
```

### 5.2 Caching Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [SQLite Local DB]  ↔  [React Query Cache]  ↔  [UI]        │
│         │                                                   │
│         └── [Supabase Sync] (when online)                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Libraries (NEW ✨)

```typescript
react-native-gesture-handler   // Swipe actions trên session cards
react-native-reanimated        // Animations (skeleton, transitions)
react-native-haptic-feedback   // Haptic trên tap, swipe, long press
victory-native                 // Charts (progress, distribution)
react-native-view-shot         // Tạo share image card
react-native-share             // Share API
react-native-mmkv                     // Fast key-value storage (settings, recent searches)
```

---

## 6. Implementation Tasks

### MVP Phase
- [ ] History list screen
- [ ] Filter by skill type
- [ ] Session detail view (Listening, Speaking, Reading)
- [ ] Replay functionality
- [ ] Practice again action
- [ ] **Empty state UI** (NEW ✨)
- [ ] **Skeleton loading** (NEW ✨)
- [ ] **Pull-to-refresh** (NEW ✨)

### Enhanced Phase
- [ ] Search functionality with debounce
- [ ] **Search suggestions & recent searches** (NEW ✨)
- [ ] **Search result highlight** (NEW ✨)
- [ ] Favorites
- [ ] Quick actions (long press bottom sheet)
- [ ] **Swipe-to-action (delete/pin)** (NEW ✨)
- [ ] Infinite scroll pagination

- [ ] **Session restoration from audio player**
- [ ] **Persist audio URL in history**
- [ ] **Navigate to skill page from player**
- [ ] **Date range filter** (NEW ✨)
- [ ] **Sort order toggle** (NEW ✨)
- [ ] **Visual identity cards (accent colors)** (NEW ✨)
- [ ] **Card press animation + haptic** (NEW ✨)
- [ ] Stats cards implementation
- [ ] Pinned sessions
- [ ] **AI Insight card (gradient + action)** (NEW ✨)

### Advanced Phase
- [ ] **Batch actions (multi-select mode)** (NEW ✨)
- [ ] **Export/Share session (image card, PDF)** (NEW ✨)
- [ ] **Weekly activity heatmap** (NEW ✨)
- [ ] **Progress chart (line chart)** (NEW ✨)
- [ ] **Skill distribution chart** (NEW ✨)
- [ ] **Detail view shared element transition** (NEW ✨)

---

## 7. API Reference

> **Base URL:** `/api`  
> **Auth:** Tất cả endpoints yêu cầu `Authorization: Bearer <Supabase JWT>`

### 7.1 History Module (`/api/history`)

#### `GET /api/history`

> Lấy danh sách lịch sử học tập (paginated, filterable)

**Query Params:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `type` | enum | ❌ | `listening` \| `speaking` \| `reading` \| `writing` |
| `status` | enum | ❌ | `all` \| `pinned` \| `favorite` \| `deleted` |
| `search` | string | ❌ | Từ khóa tìm kiếm |
| `page` | number | ❌ | Trang hiện tại, default: 1 |
| `limit` | number | ❌ | Số bản ghi mỗi trang, default: 20 |
| `dateFrom` | string | ❌ | Ngày bắt đầu (YYYY-MM-DD) |
| `dateTo` | string | ❌ | Ngày kết thúc (YYYY-MM-DD) |

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "type": "listening",
      "title": "Business Meeting",
      "date": "2025-01-15T10:30:00Z",
      "duration": 5,
      "score": 85,
      "isPinned": false,
      "isFavorite": true
    }
  ],
  "total": 120,
  "page": 1,
  "limit": 20,
  "hasMore": true
}
```

---

#### `GET /api/history/stats`

> Lấy thống kê lịch sử học tập

**Response:**

```json
{
  "todayCount": 3,
  "weekCount": 15,
  "streak": 7,
  "heatmapData": [{ "date": "2025-01-15", "count": 3 }],
  "weeklyData": [{ "day": "Mon", "minutes": 45 }]
}
```

---

#### `GET /api/history/analytics?period=week`

> Lấy analytics data cho biểu đồ

**Query Params:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `period` | enum | ❌ | `week` \| `month` \| `year` |

**Response:**

```json
{
  "data": [{ "date": "2025-01-15", "sessions": 3, "minutes": 45 }],
  "summary": { "totalSessions": 42, "totalMinutes": 500, "averagePerDay": 6 }
}
```

---

#### `POST /api/history/batch-action`

> Batch action trên nhiều entries (multi-select mode)

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `ids` | string[] | ✅ | Danh sách ID entries |
| `action` | enum | ✅ | `delete` \| `pin` \| `unpin` \| `favorite` \| `unfavorite` |

---

#### `GET /api/history/:id`

> Lấy chi tiết một bản ghi lịch sử

---

#### `PATCH /api/history/:id/pin`

> Toggle trạng thái ghim (pin/unpin)

---

#### `PATCH /api/history/:id/favorite`

> Toggle trạng thái yêu thích (favorite/unfavorite)

---

#### `PATCH /api/history/:id/notes`

> Cập nhật ghi chú cho bản ghi

**Request Body:**

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `notes` | string | ✅ | Nội dung ghi chú (gửi "" để xóa) |

---

#### `POST /api/history/:id/export`

> Export session summary (text) để share

**Response:**

```json
{
  "summary": "📝 Session: Business Meeting\n⏱ Duration: 5 min\n🎯 Score: 85/100\n..."
}
```

---

#### `DELETE /api/history/:id`

> Soft delete (có thể phục hồi)

---

#### `POST /api/history/:id/restore`

> Khôi phục bản ghi đã xóa mềm

---

#### `DELETE /api/history/:id/permanent`

> Xóa vĩnh viễn (hard delete, KHÔNG thể phục hồi)

---

## 8. Related Documents

- [00_Mobile_Overview.md](../00_Mobile_Overview.md) - Project overview
- [00_Dashboard.md](00_Dashboard.md) - Visual identity consistency (accent colors)
- [02_Listening.md](02_Listening.md) - Gesture system reference
- [10_Native_Features.md](10_Native_Features.md) - Background audio, haptics
- [Architecture.md](../technical/Architecture.md) - Data sync
