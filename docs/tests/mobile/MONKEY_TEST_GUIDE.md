# 🐵 MONKEY TEST GUIDE — Hướng dẫn Test Ngẫu nhiên

> **Triết lý:** "Nếu đứa trẻ 3 tuổi bấm lung tung mà app không crash, thì app đầy đủ robust."
> **Mục đích:** Tìm crash, freeze, memory leak, race condition bằng thao tác random.
> **Thời gian:** 20-30 phút mỗi session

---

## 1. Mindset & Nguyên tắc

### ✅ NÊN làm
- Bấm nhanh, bấm nhiều, bấm lung tung
- Đổi config liên tục rồi start
- Vừa swipe vừa tap vừa long press
- Xoay màn hình giữa chừng
- Bật/tắt airplane mode random
- Nhấn Home → quay lại → nhấn Home
- Kéo seek bar qua lại điên cuồng
- Mở/đóng modal liên tục

### ❌ KHÔNG CẦN
- Theo bất kỳ flow nào
- Đọc UI text
- Suy nghĩ logic

### 📝 ĐẶC BIỆT CHÚ Ý
- App **crash** (tắt đột ngột)
- App **freeze** (không phản hồi >3s)
- App **flicker** (UI nhấp nháy)
- **Memory warning** từ OS
- **Audio glitch** (méo tiếng, echo)
- **Navigation stack** (màn hình bị stack chồng)

---

## 2. Kỹ thuật Monkey Test

| # | Tên kỹ thuật | Mô tả | Mục tiêu |
|---|-------------|-------|----------|
| 1 | **Rapid Tap** | Tap cùng 1 nút 15-30 lần cực nhanh | Race condition, double API call |
| 2 | **Fast Switch** | Đổi qua lại giữa các options rất nhanh | State management bugs |
| 3 | **Dismiss Spam** | Mở/đóng modal/popup liên tục | Memory leak, animation crash |
| 4 | **Multi-gesture** | Kết hợp nhiều gesture cùng lúc | Gesture conflict |
| 5 | **Interrupt** | Home → back → lock → unlock → back | Background/foreground transition |
| 6 | **Network Toggle** | Bật/tắt airplane mode random | Error handling, recovery |
| 7 | **Screen Rotation** | Xoay ngang-dọc trong khi tương tác | Layout crash |
| 8 | **Back Frenzy** | Tap back ngay sau khi start action | Cancel/cleanup logic |
| 9 | **Seek Crazy** | Kéo slider/seek bar điên cuồng | Audio sync, progress bar |
| 10 | **Long Press Everywhere** | Long press mọi element trên screen | Unexpected context menu, crash |

---

## 3. Checklist theo Module

### 🎧 Listening Module (10 phút)

| # | Thao tác | Kết quả | Bug? |
|---|---------|---------|------|
| 1 | Tap Start 20 lần nhanh | ☐ OK ☐ BUG | |
| 2 | Đổi topic 10 lần trong 5s | ☐ OK ☐ BUG | |
| 3 | Duration: 5→10→15→custom→7→5 nhanh | ☐ OK ☐ BUG | |
| 4 | Mở TopicPicker → đóng → mở 10 lần | ☐ OK ☐ BUG | |
| 5 | Play/Pause 30 lần cực nhanh | ☐ OK ☐ BUG | |
| 6 | Seek bar kéo qua lại 20 lần | ☐ OK ☐ BUG | |
| 7 | Long press 10 câu liên tục | ☐ OK ☐ BUG | |
| 8 | Tap 10 từ liên tục (dictionary) | ☐ OK ☐ BUG | |
| 9 | Speed: 0.5→1→2→0.75→1.5 cycling | ☐ OK ☐ BUG | |
| 10 | Start → lập tức Back → lặp 5 lần | ☐ OK ☐ BUG | |

### 🗣️ Speaking Module (10 phút)

| # | Thao tác | Kết quả | Bug? |
|---|---------|---------|------|
| 1 | Tap Start Practice 15 lần nhanh | ☐ OK ☐ BUG | |
| 2 | Tap 🎤 nhanh 20 lần (không giữ) | ☐ OK ☐ BUG | |
| 3 | Giữ mic 2s → thả → giữ 1s → thả × 10 | ☐ OK ☐ BUG | |
| 4 | Swipe left/right 20 lần nhanh | ☐ OK ☐ BUG | |
| 5 | Retry → Record → Retry → Record loop | ☐ OK ☐ BUG | |
| 6 | Đang loading feedback → tap Back | ☐ OK ☐ BUG | |
| 7 | Đổi topic vòng tròn 10 lần | ☐ OK ☐ BUG | |
| 8 | Xoay màn hình khi đang ghi âm | ☐ OK ☐ BUG | |

### 📖 Reading Module (5 phút)

| # | Thao tác | Kết quả | Bug? |
|---|---------|---------|------|
| 1 | Tap Start 10 lần nhanh | ☐ OK ☐ BUG | |
| 2 | Scroll lên xuống cực nhanh | ☐ OK ☐ BUG | |
| 3 | Back → Start → Back → Start × 5 | ☐ OK ☐ BUG | |
| 4 | Xoay màn hình khi đang đọc | ☐ OK ☐ BUG | |

### 🔀 Cross-Module (5 phút)

| # | Thao tác | Kết quả | Bug? |
|---|---------|---------|------|
| 1 | Listening → Home → Speaking → Home → Reading nhanh | ☐ OK ☐ BUG | |
| 2 | Đang phát audio Listening → chuyển sang Speaking | ☐ OK ☐ BUG | |
| 3 | Tab History → Profile → Home → History loop | ☐ OK ☐ BUG | |
| 4 | Background → Foreground 10 lần nhanh | ☐ OK ☐ BUG | |

---

## 4. Bug Report Template

Khi phát hiện bug, ghi thông tin:

```
🐛 BUG REPORT
━━━━━━━━━━━━━
Module:     [Listening/Speaking/Reading/Cross]
Kỹ thuật:   [Rapid Tap / Fast Switch / ...]
Thao tác:   [Mô tả ngắn bạn đang làm gì]
Kết quả:    [Crash / Freeze / UI glitch / ...]
Device:     [iPhone 15 / Pixel 6 / ...]
OS:         [iOS 17.2 / Android 14]
Build:      [v1.0.0-beta.3]
Screenshot: [Có/Không]
Reproduce:  [Luôn / Thỉnh thoảng / 1 lần]
```

---

## 5. Kết quả Session

| Thông tin | Giá trị |
|-----------|---------|
| **Tester:** | |
| **Ngày:** | |
| **Device:** | |
| **Build:** | |
| **Thời gian:** | ___ phút |
| **Crash count:** | |
| **Freeze count:** | |
| **UI bugs:** | |
| **Đánh giá tổng:** | ☐ Stable ☐ Minor bugs ☐ Major issues |
