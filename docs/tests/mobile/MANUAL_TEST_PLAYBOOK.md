# 📱 MANUAL TEST PLAYBOOK — Device Testing

> **Mục đích:** Test trên device thật những tính năng không thể test bằng emulator.
> **Đối tượng:** QA, Dev, hoặc bất kỳ ai có device thật.
> **Tại sao cần device thật:** Haptic, Bluetooth, microphone, background audio, lock screen, đều KHÔNG hoạt động đúng trên simulator.

---

## 1. Pre-conditions

### Device Requirements

| Platform | Min OS | Recommended Device |
|----------|--------|--------------------|
| iOS | 16.0+ | iPhone 13 trở lên |
| Android | API 28+ (9.0) | Pixel 6 hoặc Samsung S22+ |

### Setup
- [ ] App đã build và cài trên device
- [ ] Account đã đăng nhập
- [ ] WiFi ổn định
- [ ] Có tai nghe (dây hoặc Bluetooth)
- [ ] Volume không bị mute
- [ ] Microphone permission granted

---

## 2. Test Flows — Listening

### Flow A: Audio Routing (15 phút)

```
Mục tiêu: Verify audio phát đúng qua các output khác nhau
```

| Step | Hành động | Verify | ☐ |
|------|----------|--------|---|
| A1 | Generate + Play (không cắm gì) | Nghe qua loa ngoài rõ ràng | ☐ |
| A2 | Cắm tai nghe → Play | Nghe qua tai nghe, loa ngoài tắt | ☐ |
| A3 | Đang phát → Rút tai nghe | Audio PAUSE ngay. Không tự phát loa ngoài | ☐ |
| A4 | Cắm lại tai nghe → Play | Tiếp tục qua tai nghe | ☐ |
| A5 | Kết nối AirPods/BT → Play | Audio route qua Bluetooth | ☐ |
| A6 | Đang phát BT → Tắt BT | Audio chuyển loa ngoài (hoặc pause) | ☐ |
| A7 | Volume +/- hardware buttons | Volume thay đổi, không lag | ☐ |

### Flow B: Background & Lock Screen (10 phút)

```
Mục tiêu: Audio tiếp tục khi app vào background
```

| Step | Hành động | Verify | ☐ |
|------|----------|--------|---|
| B1 | Đang phát → Home button | Audio vẫn phát | ☐ |
| B2 | Control Center → Media widget | Hiện tên bài, progress, controls | ☐ |
| B3 | Control Center Pause → Play | Audio toggle chính xác | ☐ |
| B4 | Lock screen → Now Playing | Controls hiện trên lock screen | ☐ |
| B5 | Lock screen → Next/Prev | Nhảy câu chính xác | ☐ |
| B6 | Mở lại app | UI sync đúng: progress, highlight | ☐ |
| B7 | Đợi 5 phút ở background → quay lại | Audio vẫn đang phát, state đúng | ☐ |

### Flow C: Interrupts (10 phút)

```
Mục tiêu: App xử lý ngắt đúng (cuộc gọi, alarm, notification)
```

| Step | Hành động | Verify | ☐ |
|------|----------|--------|---|
| C1 | Đang phát → Nhận cuộc gọi | Audio auto-pause | ☐ |
| C2 | Cúp máy | Audio auto-resume | ☐ |
| C3 | Đang phát → Alarm kêu | Audio duck hoặc pause | ☐ |
| C4 | Tắt alarm | Audio resume | ☐ |
| C5 | Đang phát → Notification sound | Audio duck nhẹ rồi phục hồi | ☐ |

### Flow D: Haptic & Gesture (5 phút)

```
Mục tiêu: Cảm nhận haptic feedback bằng tay
```

| Step | Hành động | Verify (cảm nhận bằng tay) | ☐ |
|------|----------|---------------------------|---|
| D1 | Long press câu → Bookmark | Rung nhẹ (medium impact) | ☐ |
| D2 | Long press câu đã bookmark | Rung nhẹ (light impact) | ☐ |
| D3 | Swipe left/right | Rung rất nhẹ mỗi swipe | ☐ |
| D4 | Double tap | Rung nhẹ toggle | ☐ |

---

## 3. Test Flows — Speaking

### Flow E: Microphone Recording (15 phút)

```
Mục tiêu: Verify ghi âm hoạt động qua các input khác nhau
```

| Step | Hành động | Verify | ☐ |
|------|----------|--------|---|
| E1 | Giữ 🎤 → Nói 5s → Thả (built-in mic) | Waveform hiện, upload OK | ☐ |
| E2 | Cắm tai nghe mic → Ghi âm | Ghi qua mic tai nghe | ☐ |
| E3 | AirPods → Ghi âm | Ghi qua BT mic | ☐ |
| E4 | Nói thật to | Waveform phản ánh, không distort | ☐ |
| E5 | Nói thật nhỏ | Waveform nhỏ, AI vẫn nhận | ☐ |
| E6 | Im lặng 5s | Score thấp, thông báo phù hợp | ☐ |
| E7 | Nói tiếng Việt | AI xử lý, score thấp, tips OK | ☐ |
| E8 | Môi trường ồn | AI xử lý, có thể mention noise | ☐ |

### Flow F: Haptic Speaking (5 phút)

| Step | Hành động | Verify (cảm nhận bằng tay) | ☐ |
|------|----------|---------------------------|---|
| F1 | Long press 🎤 → Bắt đầu ghi | Rung medium khi start recording | ☐ |
| F2 | Thả 🎤 → Kết thúc ghi | Rung light khi stop | ☐ |
| F3 | Score ≥85 hiện | Rung success (nặng hơn) | ☐ |
| F4 | Score <70 hiện | Rung warning (nhẹ hơn) | ☐ |

---

## 4. Test Flows — Cross-Module

### Flow G: Navigation Stress (5 phút)

| Step | Hành động | Verify | ☐ |
|------|----------|--------|---|
| G1 | Dashboard → Listening → Play → Home → Speaking | Audio Listening dừng khi chuyển Speaking | ☐ |
| G2 | Starting session → Back → Start → Back (loop 5x) | No crash, no screen stack | ☐ |
| G3 | History tab → Tap session → Back → Profile → Home | Navigation smooth | ☐ |

---

## 5. Kết quả Test

### Summary

| Item | Kết quả |
|------|---------|
| **Tester:** | |
| **Ngày:** | |
| **iOS Device:** | |
| **Android Device:** | |
| **Build:** | |
| **PASS / Total:** | ___ / ___ |
| **Critical bugs:** | |

### Bug Log

| # | Flow | Step | Device | Mô tả | Severity | Screenshot |
|---|------|------|--------|-------|----------|------------|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |

> 📸 Tip: Dùng screen recording (iOS: Settings → Control Center → Screen Recording) để capture bugs dễ reproduce hơn.
