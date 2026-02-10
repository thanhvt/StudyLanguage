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
| **Auth Dashboard** | User đã đăng nhập | Greeting, Streak, Quick Actions, Study Goal, Next Lesson |
| **Guest Dashboard** | Chưa đăng nhập | Hero banner, CTA Login, Quick Actions (demo) |

### 1.2 Widget Selection (Mobile-Optimized)

Chỉ giữ các widget phù hợp mobile, loại bỏ chart phức tạp:

| Widget | MVP | Enhanced | Lý do |
|--------|-----|----------|-------|
| **Greeting + Streak** | ✅ | ✅ | Nhẹ, motivating |
| **Quick Actions** (3 skills) | ✅ | ✅ | Navigation chính |
| **Study Time Goal** | ✅ | ✅ | Progress circle đơn giản |
| **Next Lesson Card** | ✅ | ✅ | Gợi ý cá nhân hóa |
| **Streak Calendar** | ❌ | ✅ | Heatmap phức tạp → Enhanced |
| **Weekly Activity Chart** | ❌ | ✅ | Bar chart → Enhanced |
| **Skill Radar Chart** | ❌ | ❌ | Quá phức tạp cho mobile |

---

## 2. User Flows

### 2.1 Auth User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [App Launch] → [Splash] → [Dashboard]                       │
│                              │                              │
│                    ┌─────────┼─────────┐                    │
│                    │         │         │                     │
│              [Next Lesson] [Quick] [Study Goal]              │
│                    │       Actions    │                      │
│                    ↓         ↓        ↓                     │
│              [Listening] [Speaking] [Reading]                 │
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
│                                 │
├─────────────────────────────────┤
│  📊 Mục tiêu hôm nay            │
│  ┌─────────────────────────┐   │
│  │     ╭──────╮            │   │
│  │     │ 25   │  25/30 phút│   │
│  │     │ phút │  ████████░░│   │
│  │     ╰──────╯            │   │
│  │   Còn 5 phút nữa! 💪    │   │
│  └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│  🎯 Tiếp tục học                │
│  ┌─────────────────────────┐   │
│  │ 🎧 Coffee Shop Talk     │   │
│  │ Listening • 15 phút      │   │
│  │ Chưa hoàn thành          │   │
│  │           [▶️ Tiếp tục]  │   │
│  └─────────────────────────┘   │
│                                 │
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
- Study Goal: Progress circle + progress bar
- Next Lesson: Card với resume action
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

### 4.2 Study Time Goal

| Element | Description |
|---------|-------------|
| Progress Circle | Animated ring (0% → current%) |
| Current/Goal | Ví dụ: 25/30 phút |
| Motivational text | Thay đổi theo progress |
| Daily reset | Reset lúc 00:00 |

**Motivational Messages:**

| Progress | Message |
|----------|---------|
| 0% | Bắt đầu nào! 🚀 |
| 1-49% | Đang tiến bộ! 💪 |
| 50-89% | Sắp đạt mục tiêu! 🎯 |
| 90-99% | Còn chút nữa thôi! 🔥 |
| 100% | Hoàn thành! Tuyệt vời! 🎉 |

### 4.3 Next Lesson Card

| Element | Description |
|---------|-------------|
| Icon | Skill icon (🎧/🗣️/📖) |
| Title | Lesson title |
| Skill + Duration | Ví dụ: "Listening • 15 phút" |
| Status | "Chưa hoàn thành" / "Mới" |
| CTA | "Tiếp tục" hoặc "Bắt đầu" |

**Logic chọn Next Lesson:**
1. Bài chưa hoàn thành gần nhất
2. Nếu không có → gợi ý bài mới theo skill ít luyện nhất
3. Nếu first-time → gợi ý Listening (dễ nhất)

### 4.4 Quick Actions

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
    totalMinutesToday: number;
    dailyGoalMinutes: number; // default: 30
    level: string;
  };
  
  // Next lesson
  nextLesson: {
    id: string;
    title: string;
    skill: 'listening' | 'speaking' | 'reading';
    duration: number; // minutes
    isNew: boolean;
    progress?: number; // 0-100
  } | null;
  
  // Loading
  loading: boolean;
}
```

### 5.2 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/user/stats` | GET | Streak, total minutes, level |
| `/api/user/next-lesson` | GET | Gợi ý bài học tiếp theo |
| `/api/user/daily-goal` | GET/PUT | Get/Set mục tiêu hàng ngày |

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
react-native-svg          // Progress circle
react-native-reanimated   // Animations
react-native-haptic-feedback // Tap feedback
```

---

## 6. Implementation Tasks

### MVP Phase
- [ ] Dashboard screen layout (auth/guest views)
- [ ] Greeting component (time-based)
- [ ] Streak display (inline)
- [ ] Study Time Goal (progress circle + bar)
- [ ] Next Lesson Card (resume/start)
- [ ] Quick Actions (3 skill cards)
- [ ] Guest Dashboard hero + CTA
- [ ] Navigate to skill pages

### Enhanced Phase
- [ ] Streak Calendar (heatmap view)
- [ ] Weekly Activity Chart (bar chart)
- [ ] Pull-to-refresh stats
- [ ] Animated transitions
- [ ] Personalized lesson suggestions

---

## 7. Related Documents

- [00_Mobile_Overview.md](../00_Mobile_Overview.md) - Project overview
- [01_Authentication.md](01_Authentication.md) - Auth flows
- [07_History.md](07_History.md) - Learning data source
- [Architecture.md](../technical/Architecture.md) - Data flow
