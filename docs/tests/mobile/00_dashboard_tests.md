# 🏠 Dashboard - Test Scenarios

> **Module:** Dashboard
> **Phase:** MVP → Enhanced
> **Ref:** `docs/mobile/features/00_Dashboard.md`

---

## MVP Phase

### 1. Greeting Logic

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-DASH-MVP-HP-001 | ✅ | Hiển thị greeting buổi sáng | 1. Mở app lúc 06:00-11:59 | Greeting = "Good morning, {name}! ☀️" | 🟡 |
| MOB-DASH-MVP-HP-002 | ✅ | Hiển thị greeting buổi chiều | 1. Mở app lúc 12:00-17:59 | Greeting = "Good afternoon, {name}! 🌤️" | 🟡 |
| MOB-DASH-MVP-HP-003 | ✅ | Hiển thị greeting buổi tối | 1. Mở app lúc 18:00-21:59 | Greeting = "Good evening, {name}! 🌙" | 🟡 |
| MOB-DASH-MVP-HP-004 | ✅ | Hiển thị greeting đêm khuya | 1. Mở app lúc 22:00-05:59 | Greeting = "Still studying, {name}? 🦉" | 🟡 |
| MOB-DASH-MVP-EC-001 | ⚠️ | Greeting khi tên user rất dài | 1. Set tên = 50+ ký tự<br>2. Mở Dashboard | Text không bị tràn, truncate hoặc wrap hợp lý | 🟢 |
| MOB-DASH-MVP-EC-002 | ⚠️ | Greeting khi user chưa có tên | 1. Login với account không có display name | Fallback hiển thị "Good morning!" (không có tên) | 🟡 |

### 2. Streak Display

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-DASH-MVP-HP-005 | ✅ | Hiển thị streak hiện tại | 1. User có streak = 7<br>2. Mở Dashboard | Hiển thị "🔥 7 day streak" với fire animation | 🟡 |
| MOB-DASH-MVP-HP-006 | ✅ | Streak = 0 (user mới) | 1. User mới chưa học bài nào<br>2. Mở Dashboard | Hiển thị "🔥 0 days" hoặc CTA "Start your streak!" | 🟡 |
| MOB-DASH-MVP-EC-001 | ⚠️ | Streak reset khi qua ngày | 1. User có streak = 5<br>2. Không học ngày hôm qua<br>3. Mở Dashboard | Streak = 0, hiển thị thông báo "Streak lost! Start again 💪" | 🟡 |
| MOB-DASH-MVP-EC-002 | ⚠️ | Streak milestone (7/30/100 ngày) | 1. User đạt streak = 7 | Hiển thị badge/animation đặc biệt cho milestone | 🟢 |

### 3. Quick Actions

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-DASH-MVP-HP-007 | ✅ | Tap "Luyện nghe" | 1. Tap nút 🎧 Luyện nghe | Navigate đến Listening screen, không delay | 🔴 |
| MOB-DASH-MVP-HP-008 | ✅ | Tap "Luyện nói" | 1. Tap nút 🗣️ Luyện nói | Navigate đến Speaking screen | 🔴 |
| MOB-DASH-MVP-HP-009 | ✅ | Tap "Luyện đọc" | 1. Tap nút 📖 Luyện đọc | Navigate đến Reading screen | 🔴 |
| MOB-DASH-MVP-HP-010 | ✅ | Quick action có haptic feedback | 1. Tap bất kỳ Quick Action | Có light haptic khi tap | 🟢 |

### 4. Guest vs Auth Dashboard

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-DASH-MVP-HP-011 | ✅ | Dashboard khi đã login | 1. Login thành công<br>2. Xem Dashboard | Hiện greeting + tên, streak, stats, Quick Actions | 🔴 |
| MOB-DASH-MVP-HP-012 | ✅ | Dashboard khi là guest | 1. Bỏ qua login<br>2. Xem Dashboard | Hiện nút "Đăng nhập" / CTA, không hiện streak/stats cá nhân | 🔴 |
| MOB-DASH-MVP-ERR-001 | ❌ | Dashboard khi API lỗi | 1. Tắt mạng<br>2. Mở Dashboard | Hiện cached data (nếu có) hoặc error state rõ ràng + Retry button | 🔴 |

---

## Enhanced Phase

### 5. Today's Progress

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-DASH-ENH-HP-001 | ✅ | Hiển thị tiến độ hôm nay | 1. Hoàn thành 2 bài Listening<br>2. Quay về Dashboard | Stats cập nhật real-time: thời gian học, số bài | 🟡 |
| MOB-DASH-ENH-HP-002 | ✅ | Continue last session | 1. Có session dang dở<br>2. Mở Dashboard | Hiện card "Continue: {lesson name}" với progress bar | 🟡 |
| MOB-DASH-ENH-EC-001 | ⚠️ | Không có session hôm nay | 1. Chưa học gì hôm nay<br>2. Mở Dashboard | Stats hiện "0 min today" + motivation message | 🟢 |
