# 🚗 Special Modes - Test Scenarios

> **Module:** Special Modes (Car, Bedtime, Workout, Pocket)
> **Phase:** Advanced
> **Ref:** `docs/mobile/features/09_Special_Modes.md`

---

## Advanced Phase

### 1. Car Mode

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-SMOD-ADV-HP-001 | ✅ | Manual activate Car Mode | 1. Settings → Quick Settings<br>2. Toggle Car Mode ON | Car Mode UI: black BG, large text, minimal controls | 🟡 |
| MOB-SMOD-ADV-HP-002 | ✅ | Auto-detect Bluetooth | 1. Bật auto-detect<br>2. Kết nối car Bluetooth | Prompt "Bật Car Mode?" hiển thị | 🟡 |
| MOB-SMOD-ADV-HP-003 | ✅ | Auto-detect GPS speed | 1. Bật auto-detect<br>2. Speed > 30 km/h | Suggest "Bật Car Mode?" | 🟡 |
| MOB-SMOD-ADV-HP-004 | ✅ | Voice command "Next" | 1. Trong Car Mode<br>2. Nói "Next" | Chuyển sang bài tiếp, haptic confirm | 🟡 |
| MOB-SMOD-ADV-HP-005 | ✅ | Voice command "Pause" | 1. Nói "Dừng" hoặc "Pause" | Audio pause, voice confirm "Đã dừng" | 🟡 |
| MOB-SMOD-ADV-HP-006 | ✅ | Voice command "Volume up/down" | 1. Nói "Volume up" | Volume tăng 1 bước | 🟢 |
| MOB-SMOD-ADV-HP-007 | ✅ | Exit Car Mode | 1. Tap "Exit Car Mode" hoặc nói "Thoát" | Quay về UI bình thường | 🟡 |
| MOB-SMOD-ADV-HP-008 | ✅ | Speaking disabled in Car Mode | 1. Đang Car Mode<br>2. Thử vào Speaking | Speaking disabled, thông báo "Không hỗ trợ khi lái xe" | 🟡 |
| MOB-SMOD-ADV-EC-001 | ⚠️ | Screen off option | 1. Enable "Screen off" trong car mode | Screen tắt, audio tiếp tục, lock screen controls hoạt động | 🟡 |
| MOB-SMOD-ADV-EC-002 | ⚠️ | Bluetooth disconnect trong car mode | 1. Đang car mode<br>2. Mất kết nối BT | Audio chuyển speaker, car mode vẫn hoạt động | 🟡 |
| MOB-SMOD-ADV-ERR-001 | ❌ | Voice command không nhận diện | 1. Nói lệnh không hợp lệ | "Không hiểu, thử lại?" + list commands gợi ý | 🟡 |

### 2. Bedtime Mode

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-SMOD-ADV-HP-009 | ✅ | Activate Bedtime Mode | 1. Toggle Bedtime Mode ON | OLED black BG, amber text, low brightness | 🟡 |
| MOB-SMOD-ADV-HP-010 | ✅ | Sleep timer set 15 min | 1. Chọn Sleep Timer = 15 min<br>2. Start | Audio phát, countdown 15:00 hiển thị | 🟡 |
| MOB-SMOD-ADV-HP-011 | ✅ | Fade out last 5 min | 1. Bật "Fade out"<br>2. Timer còn 5 phút | Volume giảm dần trong 5 phút cuối | 🟡 |
| MOB-SMOD-ADV-HP-012 | ✅ | Auto-stop after timer | 1. Timer hết | Audio dừng, màn hình giữ black | 🟡 |
| MOB-SMOD-ADV-HP-013 | ✅ | Ambient sounds after stop | 1. Chọn ambient = "Rain"<br>2. Timer hết | Rain sound phát nhẹ sau bài học | 🟢 |
| MOB-SMOD-ADV-HP-014 | ✅ | Whisper AI voice | 1. Bật Bedtime Mode<br>2. Phát bài nghe | AI voice tone nhẹ hơn bình thường | 🟢 |
| MOB-SMOD-ADV-EC-003 | ⚠️ | Exit Bedtime Mode giữa chừng | 1. Tap "Exit" khi timer đang chạy | Confirm "Thoát Bedtime Mode?", timer cancel | 🟢 |
| MOB-SMOD-ADV-EC-004 | ⚠️ | Sleep timer + alarm conflict | 1. Timer set 30 min<br>2. Alarm rings at 15 min | Audio pause cho alarm, timer vẫn đếm | 🟡 |

### 3. Workout Mode

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-SMOD-ADV-HP-015 | ✅ | Activate Workout Mode | 1. Toggle Workout Mode ON | XL buttons (80px+), high contrast, simple controls | 🟡 |
| MOB-SMOD-ADV-HP-016 | ✅ | XL touch targets | 1. Tap Play/Pause/Next | Buttons ≥ 80px, dễ bấm khi tay ướt/đeo găng | 🟡 |
| MOB-SMOD-ADV-HP-017 | ✅ | Auto-playlist | 1. Start Workout Mode | Continuous play playlist: Quick Tips → Podcast Lite | 🟡 |
| MOB-SMOD-ADV-HP-018 | ✅ | Voice control trong workout | 1. Nói "Next" | Chuyển bài + haptic | 🟡 |
| MOB-SMOD-ADV-HP-019 | ✅ | Short lesson content | 1. Xem playlist | Lessons 3-10 min, phù hợp workout | 🟢 |
| MOB-SMOD-ADV-EC-005 | ⚠️ | Swipe gestures large area | 1. Swipe trên any part of screen | Large swipe detection area, easy gesture recognition | 🟢 |

### 4. Pocket Mode

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-SMOD-ADV-HP-020 | ✅ | Auto-detect pocket | 1. Bật auto-detect<br>2. Phone vào túi + đi bộ | Pocket mode auto-enable, screen black | 🟡 |
| MOB-SMOD-ADV-HP-021 | ✅ | Gesture: Swipe left = Previous | 1. Pocket mode ON<br>2. Swipe left (full screen) | Previous sentence + haptic feedback | 🟡 |
| MOB-SMOD-ADV-HP-022 | ✅ | Gesture: Swipe right = Next | 1. Swipe right | Next sentence + haptic | 🟡 |
| MOB-SMOD-ADV-HP-023 | ✅ | Gesture: Swipe up = Bookmark | 1. Swipe up | Save bookmark + haptic confirm | 🟡 |
| MOB-SMOD-ADV-HP-024 | ✅ | Gesture: Double tap = Play/Pause | 1. Double tap screen | Toggle play/pause + haptic | 🟡 |
| MOB-SMOD-ADV-HP-025 | ✅ | Haptic only feedback | 1. Thực hiện gesture bất kỳ | Haptic response cho mọi action (không cần nhìn) | 🟡 |
| MOB-SMOD-ADV-EC-006 | ⚠️ | Sensitivity levels | 1. Set sensitivity = High<br>2. Pocket mode | Auto-detect nhạy hơn (default Medium) | 🟢 |
| MOB-SMOD-ADV-EC-007 | ⚠️ | False positive pocket detect | 1. Phone trên bàn, proximity blocked | Không bật pocket mode khi không movement | 🟡 |

### 5. Quick Settings Panel

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-SMOD-ADV-HP-026 | ✅ | Toggle modes từ Quick Settings | 1. Settings → Quick Settings | 4 mode toggles hiển thị: Car/Bedtime/Workout/Pocket | 🟡 |
| MOB-SMOD-ADV-HP-027 | ✅ | Only 1 mode active at a time | 1. Bật Car Mode<br>2. Bật Bedtime Mode | Car Mode auto-off, Bedtime on (hoặc warning) | 🟡 |
| MOB-SMOD-ADV-EC-008 | ⚠️ | Mode detection settings | 1. Configure auto-detect per mode | Settings persist, detection behavior đúng theo config | 🟢 |
