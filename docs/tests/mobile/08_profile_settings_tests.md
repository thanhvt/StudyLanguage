# 👤 Profile & Settings - Test Scenarios

> **Module:** Profile & Settings
> **Phase:** MVP → Enhanced
> **Ref:** `docs/mobile/features/08_Profile_Settings.md`

---

## MVP Phase

### 1. Profile Screen

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-PROF-MVP-HP-001 | ✅ | Hiển thị profile | 1. Tap Profile tab | Avatar, tên, email, stats (streak, time, words) | 🔴 |
| MOB-PROF-MVP-HP-002 | ✅ | Stats chính xác | 1. Hoàn thành lessons<br>2. Xem Profile | Streak, total time, words count cập nhật đúng | 🟡 |
| MOB-PROF-MVP-HP-003 | ✅ | Week activity chart | 1. Xem "This Week" section | 7 dots (M-S) + minutes per day, hiện tuần hiện tại | 🟡 |
| MOB-PROF-MVP-EC-001 | ⚠️ | Profile khi user mới (no data) | 1. User mới → Profile | Stats = 0, week chart empty, streak = 0 | 🟡 |

### 2. Theme Toggle

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-PROF-MVP-HP-004 | ✅ | Switch Dark mode | 1. Settings → Appearance → Dark | Toàn bộ app chuyển dark theme ngay lập tức | 🟡 |
| MOB-PROF-MVP-HP-005 | ✅ | Switch Light mode | 1. Settings → Appearance → Light | Toàn bộ app chuyển light theme | 🟡 |
| MOB-PROF-MVP-HP-006 | ✅ | Auto theme (follow system) | 1. Chọn "Auto"<br>2. Đổi system theme | App theme follow theo iOS/Android system setting | 🟡 |
| MOB-PROF-MVP-HP-007 | ✅ | Theme persist khi restart | 1. Set Dark mode<br>2. Kill & mở app | Vẫn Dark mode | 🟡 |

### 3. Logout

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-PROF-MVP-HP-008 | ✅ | Logout từ Profile | 1. Scroll xuống "Đăng xuất"<br>2. Tap<br>3. Confirm | Redirect Auth screen, token clear | 🔴 |
| (Cross-ref với MOB-AUTH-MVP-HP-010 → 012) | | | | | |

### 4. About Screen

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-PROF-MVP-HP-009 | ✅ | Mở About | 1. Settings → About | Version number, links (Terms, Privacy, Contact, Rate) | 🟢 |
| MOB-PROF-MVP-HP-010 | ✅ | Rate the App | 1. Tap "Rate the App" | Mở App Store / Play Store page | 🟢 |
| MOB-PROF-MVP-HP-011 | ✅ | Contact Support | 1. Tap "Contact Support" | Mở email client hoặc support form | 🟢 |

---

## Enhanced Phase

### 5. Appearance Settings (Full)

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-PROF-ENH-HP-001 | ✅ | Accent color picker | 1. Tap "Accent Color"<br>2. Chọn 🔵 Blue | Buttons, tabs, highlights đổi sang blue | 🟡 |
| MOB-PROF-ENH-HP-002 | ✅ | Font size change | 1. Chọn "Large" font size | Preview text update + toàn app text resize | 🟡 |
| MOB-PROF-ENH-HP-003 | ✅ | Language change | 1. Chọn "English" / "Tiếng Việt" | UI labels đổi ngôn ngữ | 🟡 |
| MOB-PROF-ENH-HP-004 | ✅ | Preview real-time | 1. Thay đổi bất kỳ appearance setting | Preview section cập nhật ngay | 🟢 |
| MOB-PROF-ENH-EC-001 | ⚠️ | Accent + Theme combo | 1. Set Dark + Orange accent | Contrast ratio vẫn đảm bảo AA (4.5:1) | 🟡 |

### 6. Avatar

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-PROF-ENH-HP-005 | ✅ | Change avatar (gallery) | 1. Tap avatar<br>2. Chọn "Gallery"<br>3. Pick ảnh | Avatar cập nhật, upload server | 🟡 |
| MOB-PROF-ENH-HP-006 | ✅ | Change avatar (camera) | 1. Tap avatar<br>2. Chọn "Camera"<br>3. Chụp ảnh | Avatar cập nhật từ camera | 🟡 |
| MOB-PROF-ENH-ERR-001 | ❌ | Camera permission denied | 1. Deny camera permission<br>2. Chọn Camera | Hướng dẫn bật quyền trong Settings | 🟡 |
| MOB-PROF-ENH-EC-002 | ⚠️ | Ảnh lớn (>10MB) | 1. Chọn ảnh rất lớn | Auto-compress trước upload, không fail | 🟡 |

### 7. Notification Settings

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-PROF-ENH-HP-007 | ✅ | Daily Reminder ON + Time | 1. Bật Daily Reminder<br>2. Set 19:00 | Notification push lúc 19:00 hàng ngày | 🟡 |
| MOB-PROF-ENH-HP-008 | ✅ | Streak Warning | 1. Bật Streak Warning<br>2. Set 21:00 | Push lúc 21:00 nếu chưa học hôm đó | 🟡 |
| MOB-PROF-ENH-HP-009 | ✅ | Quiet Hours | 1. Bật Quiet Hours: 22:00 - 07:00 | Không notification trong khoảng thời gian | 🟡 |
| MOB-PROF-ENH-HP-010 | ✅ | Disable all notifications | 1. Tắt hết notification toggles | Không push nào gửi | 🟡 |
| MOB-PROF-ENH-ERR-002 | ❌ | Push permission denied | 1. OS deny push permission | Hiện hướng dẫn bật trong OS Settings | 🟡 |

### 8. Audio Settings

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-PROF-ENH-HP-011 | ✅ | Background music ON + Volume | 1. Bật Background Music<br>2. Set volume 50% | Nhạc nền phát khi học, volume đúng level | 🟡 |
| MOB-PROF-ENH-HP-012 | ✅ | Music ducking | 1. Bật Music Ducking<br>2. Audio lesson phát | Nhạc nền volume giảm khi lesson audio phát | 🟡 |
| MOB-PROF-ENH-HP-013 | ✅ | Default playback speed | 1. Set speed = 1.2x | Tất cả listening sessions mặc định 1.2x | 🟡 |
| MOB-PROF-ENH-HP-014 | ✅ | Sound effects toggle | 1. Tắt Sound Effects | Không còn tiếng success/error sounds | 🟢 |
| MOB-PROF-ENH-HP-015 | ✅ | Auto-play audio | 1. Bật Auto-play<br>2. Hoàn thành 1 câu | Auto phát câu tiếp theo | 🟡 |
| MOB-PROF-ENH-HP-016 | ✅ | Hands-free mode | 1. Bật Hands-free | Lesson tự chạy, không cần tap | 🟡 |

### 9. Download & Storage

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-PROF-ENH-HP-017 | ✅ | Auto-download WiFi | 1. Bật Auto-download WiFi only<br>2. Connect WiFi | New lessons download tự động | 🟡 |
| MOB-PROF-ENH-HP-018 | ✅ | Storage breakdown | 1. Xem Storage section | Audio files: X MB, Transcripts: Y MB, Cache: Z MB | 🟢 |
| MOB-PROF-ENH-HP-019 | ✅ | Clear cache | 1. Tap "🗑️ Clear Cache" | Cache xóa, storage freed, confirm toast | 🟡 |
| MOB-PROF-ENH-HP-020 | ✅ | Max cached lessons | 1. Set max = 30 lessons<br>2. Download 31st | Oldest auto-remove hoặc warning "Đã đạt giới hạn" | 🟡 |

### 10. Privacy Settings

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-PROF-ENH-HP-021 | ✅ | Save recordings | 1. Bật "Save Recordings"<br>2. Practice speaking | Recordings lưu lại, có thể nghe lại | 🟡 |
| MOB-PROF-ENH-HP-022 | ✅ | Auto-delete recordings | 1. Set 30 days | Recordings > 30 ngày tự động xóa | 🟡 |
| MOB-PROF-ENH-HP-023 | ✅ | Export my data | 1. Tap "📤 Export My Data" | Download ZIP chứa profile + history + settings | 🟡 |
| MOB-PROF-ENH-HP-024 | ✅ | Delete all data | 1. Tap "🗑️ Delete All Data"<br>2. Confirm (gõ "DELETE") | Xóa hết data, logout, navigate Auth | 🔴 |
| MOB-PROF-ENH-ERR-003 | ❌ | Delete data thất bại | 1. Delete → server error | Error message, data KHÔNG bị xóa local | 🔴 |
| MOB-PROF-ENH-EC-003 | ⚠️ | Delete data confirmation UX | 1. Tap Delete All | Double confirm: dialog + gõ "DELETE" để chắc chắn | 🔴 |

### 11. Speaking Goal

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-PROF-ENH-HP-025 | ✅ | Display speaking goal | 1. Xem Profile | "🗣️ Speaking Goal: 8/10" hiển thị đúng | 🟢 |
| MOB-PROF-ENH-HP-026 | ✅ | Goal progress update | 1. Hoàn thành 1 speaking session<br>2. Back to Profile | Goal counter +1 | 🟡 |
