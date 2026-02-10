# 📱 Native Features - Test Scenarios

> **Module:** Native Mobile Features
> **Phase:** Enhanced → Advanced
> **Ref:** `docs/mobile/features/10_Native_Features.md`

---

## Enhanced Phase

### 1. Gesture System

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-NAT-ENH-HP-001 | ✅ | Pull down refresh | 1. Pull down bất kỳ list screen | Refresh animation → data reload | 🟡 |
| MOB-NAT-ENH-HP-002 | ✅ | Swipe from edge = Back | 1. Swipe từ cạnh trái màn hình | Navigate back, animation mượt | 🟡 |
| MOB-NAT-ENH-HP-003 | ✅ | Long press list item | 1. Long press session/word/item | Options bottom sheet hiển thị | 🟡 |
| MOB-NAT-ENH-HP-004 | ✅ | Speaking: Long press mic | 1. Long press 🎤 | Recording start + haptic medium | 🔴 |
| MOB-NAT-ENH-HP-005 | ✅ | Speaking: Swipe up cancel | 1. Đang recording<br>2. Swipe up | Cancel recording + haptic warning | 🟡 |
| MOB-NAT-ENH-HP-006 | ✅ | Reading: Tap word | 1. Tap từ trong article | Dictionary popup | 🟡 |
| MOB-NAT-ENH-HP-007 | ✅ | Reading: Long press word | 1. Long press từ | Highlight + save option | 🟡 |
| MOB-NAT-ENH-HP-008 | ✅ | Reading: Pinch to zoom | 1. Pinch in/out trên article | Text zoom smooth | 🟢 |

### 2. Haptic Feedback

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-NAT-ENH-HP-009 | ✅ | Button tap = Light impact | 1. Tap bất kỳ button | Light haptic feedback | 🟢 |
| MOB-NAT-ENH-HP-010 | ✅ | Toggle switch = Selection | 1. Toggle setting switch | Selection haptic | 🟢 |
| MOB-NAT-ENH-HP-011 | ✅ | Correct answer = Success | 1. Trả lời quiz đúng | Success notification haptic | 🟡 |
| MOB-NAT-ENH-HP-012 | ✅ | Wrong answer = Error | 1. Trả lời quiz sai | Error notification haptic | 🟡 |
| MOB-NAT-ENH-HP-013 | ✅ | Recording start = Medium | 1. Bắt đầu ghi âm | Medium impact haptic | 🟡 |
| MOB-NAT-ENH-HP-014 | ✅ | Perfect score = Heavy | 1. Đạt score 100 | Heavy impact + confetti | 🟢 |
| MOB-NAT-ENH-HP-015 | ✅ | Badge unlock = Heavy + Success | 1. Unlock badge mới | Heavy impact + success notification | 🟢 |
| MOB-NAT-ENH-HP-016 | ✅ | Countdown tick = Selection | 1. Countdown 3→2→1 trước recording | Selection haptic mỗi số | 🟢 |
| MOB-NAT-ENH-EC-001 | ⚠️ | Haptic OFF setting | 1. Tắt Haptic Feedback trong Settings | Không haptic nào trigger | 🟢 |

### 3. Push Notifications

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-NAT-ENH-HP-017 | ✅ | Daily reminder push | 1. Bật Daily Reminder 19:00<br>2. Chờ 19:00 | Push "Sẵn sàng học chưa? 💪" hiển thị | 🟡 |
| MOB-NAT-ENH-HP-018 | ✅ | Streak warning push | 1. Chưa học hôm nay<br>2. 21:00 | Push "2 giờ nữa mất streak! 🔥" | 🟡 |
| MOB-NAT-ENH-HP-019 | ✅ | Achievement push | 1. Đạt 7 ngày streak | Instant push "🎉 7 ngày liên tục!" | 🟡 |
| MOB-NAT-ENH-HP-020 | ✅ | Tap notification → Open app | 1. Tap push notification | App mở đúng screen liên quan (Profile/Listening) | 🟡 |
| MOB-NAT-ENH-HP-021 | ✅ | Quiet Hours respected | 1. Set Quiet 22:00-07:00<br>2. Trigger at 23:00 | Notification queued, hiện sau 07:00 | 🟡 |
| MOB-NAT-ENH-ERR-001 | ❌ | Push permission denied | 1. Deny push permission | App hoạt động bình thường, settings hiện warning | 🟡 |

### 4. Background Audio

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-NAT-ENH-HP-022 | ✅ | Background play khi minimize | 1. Phát audio<br>2. Home button | Audio tiếp tục | 🔴 |
| MOB-NAT-ENH-HP-023 | ✅ | Lock screen player | 1. Tắt màn hình | Lock screen: track info + play/pause/next | 🔴 |
| MOB-NAT-ENH-HP-024 | ✅ | Android notification player | 1. Android: minimize app | Foreground service notification: track + controls | 🔴 |
| MOB-NAT-ENH-HP-025 | ✅ | Audio interruption: Call | 1. Đang phát<br>2. Cuộc gọi đến<br>3. Kết thúc | Pause → Auto-resume | 🔴 |
| MOB-NAT-ENH-HP-026 | ✅ | Audio interruption: Headphone unplug | 1. Rút tai nghe | Pause ngay (không phát loa ngoài) | 🔴 |
| MOB-NAT-ENH-HP-027 | ✅ | Audio interruption: Navigation (Maps) | 1. Google Maps nói direction | Duck volume 30% → tự khôi phục | 🟡 |
| (Cross-ref MOB-LIS-ENH-HP-013 → 017) | | | | | |

### 5. Offline Mode

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-NAT-ENH-HP-028 | ✅ | Offline indicator | 1. Tắt mạng | Banner "⚠️ Offline Mode" + giới hạn features listed | 🟡 |
| MOB-NAT-ENH-HP-029 | ✅ | Play downloaded offline | 1. Offline<br>2. Mở bài đã download | Audio phát bình thường | 🔴 |
| MOB-NAT-ENH-HP-030 | ✅ | View cached history | 1. Offline<br>2. Mở History | Cached data hiển thị | 🟡 |
| MOB-NAT-ENH-HP-031 | ✅ | Download manager UI | 1. Settings → Download | List downloaded: ✅/⏳/☐, storage bar, breakdown | 🟡 |
| MOB-NAT-ENH-HP-032 | ✅ | Download progress | 1. Start download lesson | Progress bar: "Downloading... 45%" | 🟡 |
| MOB-NAT-ENH-HP-033 | ✅ | Auto-download WiFi only | 1. Bật auto-download WiFi<br>2. Connect WiFi | New lessons auto-download | 🟡 |
| MOB-NAT-ENH-ERR-002 | ❌ | Retry connection | 1. Offline<br>2. Tap "Thử kết nối lại" | Check network, update banner nếu online | 🟡 |
| MOB-NAT-ENH-EC-002 | ⚠️ | Sync queue khi back online | 1. Hoàn thành session offline<br>2. Bật mạng | Pending sessions auto-sync | 🟡 |
| MOB-NAT-ENH-EC-003 | ⚠️ | Generate content offline | 1. Offline → Start new listening | Error "Cần kết nối mạng để tạo bài mới" | 🟡 |
| MOB-NAT-ENH-EC-004 | ⚠️ | Speaking practice offline | 1. Offline → Speaking | Error "Luyện nói cần kết nối để gửi AI" | 🟡 |

---

## Advanced Phase

### 6. iOS Widgets

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-NAT-ADV-HP-001 | ✅ | Small Widget (2x2) | 1. Add widget iOS | Streak + word count hiển thị, tap → open app | 🟡 |
| MOB-NAT-ADV-HP-002 | ✅ | Medium Widget (4x2) | 1. Add medium widget | Streak + Word of Day + "Continue lesson" link | 🟡 |
| MOB-NAT-ADV-HP-003 | ✅ | Large Widget (4x4) | 1. Add large widget | Streak + Word of Day + week chart + continue link | 🟡 |
| MOB-NAT-ADV-HP-004 | ✅ | Widget tap actions | 1. Tap "Continue lesson" | App mở ở last lesson position | 🟡 |
| MOB-NAT-ADV-HP-005 | ✅ | Widget data refresh | 1. Hoàn thành lesson<br>2. Check widget | Widget cập nhật streak/word count | 🟡 |
| MOB-NAT-ADV-EC-001 | ⚠️ | Widget khi not logged in | 1. Logout<br>2. Check widget | Widget hiện "Login to see stats" | 🟡 |
| MOB-NAT-ADV-EC-002 | ⚠️ | Widget follows system theme | 1. Đổi system dark/light | Widget theme match system | 🟢 |

### 7. Android Widgets

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-NAT-ADV-HP-006 | ✅ | Resizable widget | 1. Add widget<br>2. Resize | Widget adapt content theo size | 🟡 |
| MOB-NAT-ADV-HP-007 | ✅ | Live data update | 1. Chờ 30 min sau learning | Widget refresh data (30 min interval) | 🟡 |

### 8. Voice Wake Word

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-NAT-ADV-HP-008 | ✅ | "Hey Study" activation | 1. Nói "Hey Study" | App listen → visual indicator → ready for command | 🟡 |
| MOB-NAT-ADV-HP-009 | ✅ | Voice command: "Next" | 1. "Hey Study" → "Next" | Execute action + haptic + toast confirm | 🟡 |
| MOB-NAT-ADV-HP-010 | ✅ | Voice command: "Home" | 1. "Hey Study" → "Trang chủ" | Navigate to Dashboard | 🟡 |
| MOB-NAT-ADV-EC-003 | ⚠️ | Wake word false trigger | 1. Nói phrase tương tự | Không trigger, high accuracy threshold | 🟡 |
| MOB-NAT-ADV-ERR-001 | ❌ | Mic permission for voice | 1. Deny mic → try voice | Hướng dẫn bật mic permission | 🟡 |

### 9. Deep Linking

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-NAT-ADV-HP-011 | ✅ | URL scheme open app | 1. Open `studylanguage://listening` | App mở → Listening screen | 🟡 |
| MOB-NAT-ADV-HP-012 | ✅ | Deep link specific lesson | 1. Open `studylanguage://listening/123` | App mở lesson #123 | 🟡 |
| MOB-NAT-ADV-HP-013 | ✅ | Universal link web → app | 1. Tap `https://studylanguage.app/lesson/123` | App mở (nếu installed) hoặc web fallback | 🟡 |
| MOB-NAT-ADV-HP-014 | ✅ | Notification deep link | 1. Push notification tap | Navigate đến correct section (History, Profile) | 🟡 |
| MOB-NAT-ADV-EC-004 | ⚠️ | Invalid deep link | 1. Open `studylanguage://invalid` | App mở Dashboard (fallback), không crash | 🟡 |

### 10. Rich Notifications (iOS)

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-NAT-ADV-HP-015 | ✅ | Rich notification expand | 1. Long press notification | Expanded view: Word of Day + IPA + buttons | 🟡 |
| MOB-NAT-ADV-HP-016 | ✅ | Rich notification action: Pronounce | 1. Tap "🔊 Pronounce" button | TTS phát âm từ đó (background) | 🟡 |
| MOB-NAT-ADV-HP-017 | ✅ | Rich notification action: Save | 1. Tap "💾 Save" button | Từ lưu vào Saved Words, notification dismiss | 🟡 |

### 11. Lock Screen Controls

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-NAT-ADV-HP-018 | ✅ | Lock screen Now Playing | 1. Phát audio → Lock screen | Track title, progress, artwork | 🔴 |
| MOB-NAT-ADV-HP-019 | ✅ | Lock screen Play/Pause | 1. Tap play/pause trên lock screen | Audio toggle | 🔴 |
| MOB-NAT-ADV-HP-020 | ✅ | Lock screen Skip | 1. Tap next/previous | Next/previous sentence | 🟡 |
| (Cross-ref MOB-LIS-ENH-HP-014) | | | | | |
