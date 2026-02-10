# 🏠 Dashboard Feature - Mobile

> **Module:** Dashboard  
> **Priority:** P0 (Core)  
> **Phase:** MVP → Enhanced

---

## 1. Overview

Module trang chủ hiển thị tổng quan tiến trình học tập, gợi ý bài học tiếp theo, và quick access đến 3 skills. Thiết kế tối giản, thoáng, phù hợp mobile.

### 1.1 Dashboard Views

| View | Condition | Key Elements |
|------|-----------|--------------|
| **Auth Dashboard** | User đã đăng nhập | Greeting, Streak, Quick Actions |
| **Guest Dashboard** | Chưa đăng nhập | Hero banner, CTA Login, Quick Actions (demo) |

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

### 2.2 Guest User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [App Launch] → [Splash] → [Guest Dashboard]                  │
│                              │                              │
│                    ┌─────────┼──────────┐                   │
│                    │         │          │                    │
│              [Hero CTA] [Quick Actions] [Features]          │
│              (Login)    (Demo mode)     (Why us?)           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. UI Mockups

### 3.1 Auth Dashboard - Main Screen

```
┌─────────────────────────────────┐
│  📚 StudyLanguage            🔔  │
├─────────────────────────────────┤
│                                 │
│  Chào buổi sáng, Thành! 👋     │
│  🔥 12 ngày liên tiếp           │
│  🗣️ Speaking: 8/10 câu (NEW ✨) │
│                                 │
├─────────────────────────────────┤

│                                 │
├─────────────────────────────────┤

├─────────────────────────────────┤
│  📚 Bắt đầu luyện tập          │
│  ┌────────┐┌────────┐┌────────┐│
│  │ 🎧     ││ 🗣️     ││ 📖     ││
│  │ Nghe   ││ Nói    ││ Đọc    ││
│  └────────┘└────────┘└────────┘│
│                                 │
└─────────────────────────────────┘
│ 🏠  │  📜  │  📚  │  👤  │
└─────────────────────────────────┘
```

**Specs:**
- Greeting: Dynamic theo thời gian (Sáng/Chiều/Tối)
- Streak: Inline với greeting, icon 🔥

- Quick Actions: 3 skill cards, equal width, tap to navigate

### 3.2 Guest Dashboard

```
┌─────────────────────────────────┐
│  📚 StudyLanguage            ⋮  │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │  ✨ AI-Powered Learning  │   │
│  │                         │   │
│  │  Chào mừng bạn! 👋      │   │
│  │                         │   │
│  │  Bắt đầu học tiếng Anh  │   │
│  │  với AI ngay hôm nay.   │   │
│  │                         │   │
│  │  [🔑 Đăng nhập]         │   │
│  │  [Dùng thử miễn phí]    │   │
│  └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│  📚 Chọn kỹ năng luyện tập     │
│  ┌────────┐┌────────┐┌────────┐│
│  │ 🎧     ││ 🗣️     ││ 📖     ││
│  │ Nghe   ││ Nói    ││ Đọc    ││
│  └────────┘└────────┘└────────┘│
│                                 │
├─────────────────────────────────┤
│  💡 Tại sao chọn chúng tôi?    │
│  ┌─────────────────────────┐   │
│  │ 🤖 AI Thông minh        │   │
│  │ 📱 Học mọi lúc mọi nơi  │   │
│  │ 📚 Nội dung đa dạng     │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

**Specs:**
- Hero card: Gradient background, prominent CTA
- Quick Actions: Same layout as auth, nhưng navigate đến demo/login
- Features list: 3 selling points

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

### MVP Phase
- [ ] Dashboard screen layout (auth/guest views)
- [ ] Greeting component (time-based)
- [ ] Streak display (inline)

- [ ] Quick Actions (3 skill cards)
- [ ] Guest Dashboard hero + CTA
- [ ] Navigate to skill pages

### Enhanced Phase

- [ ] Pull-to-refresh stats
- [ ] Animated transitions


---

## 7. Related Documents

- [00_Mobile_Overview.md](../00_Mobile_Overview.md) - Project overview
- [01_Authentication.md](01_Authentication.md) - Auth flows
- [07_History.md](07_History.md) - Learning data source
- [Architecture.md](../technical/Architecture.md) - Data flow
