# 🎧 Listening - Test Scenarios

> **Module:** Listening
> **Phase:** MVP → Enhanced → Advanced
> **Ref:** `docs/mobile/features/02_Listening.md`

---

## MVP Phase

### 1. Configuration Screen

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-LIS-MVP-HP-001 | ✅ | Mở Listening config screen | 1. Tap 🎧 Luyện nghe từ Dashboard | Config screen hiển thị: Topic, Duration, Mode, Speakers | 🔴 |
| MOB-LIS-MVP-HP-002 | ✅ | Chọn topic | 1. Tap "Topic"<br>2. Chọn "Coffee Shop" | Topic được chọn, hiển thị tag/chip selected | 🔴 |
| MOB-LIS-MVP-HP-003 | ✅ | Chọn duration | 1. Tap duration options<br>2. Chọn "10 min" | Duration = 10 min, hiển thị selected state | 🟡 |
| MOB-LIS-MVP-HP-004 | ✅ | Chọn mode (Podcast/Interactive/Radio) | 1. Tap mode selector<br>2. Chọn "Interactive" | Mode = Interactive, UI cập nhật mô tả mode | 🔴 |
| MOB-LIS-MVP-HP-005 | ✅ | Chọn số speakers | 1. Chọn speakers = 2 | Speakers = 2, voice auto-assigned | 🟡 |
| MOB-LIS-MVP-HP-006 | ✅ | Start session | 1. Cấu hình xong<br>2. Tap "Start" | Loading spinner → Audio player mở ra, bắt đầu phát | 🔴 |
| MOB-LIS-MVP-ERR-001 | ❌ | Start khi thiếu config | 1. Không chọn topic<br>2. Tap "Start" | Hiện validation "Chọn topic trước khi bắt đầu" | 🟡 |
| MOB-LIS-MVP-ERR-002 | ❌ | Start khi mất mạng | 1. Tắt mạng<br>2. Tap "Start" | Hiện error "Cần kết nối mạng để tạo bài nghe" | 🔴 |
| MOB-LIS-MVP-ERR-003 | ❌ | API tạo bài timeout | 1. Start → server timeout | Hiện error + Retry button, config giữ nguyên | 🔴 |

### 2. Audio Player – Core Controls

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-LIS-MVP-HP-007 | ✅ | Play/Pause toggle | 1. Tap ▶️ Play<br>2. Tap ⏸️ Pause | Audio phát → dừng đúng vị trí | 🔴 |
| MOB-LIS-MVP-HP-008 | ✅ | Seek bar kéo | 1. Kéo seek bar đến 2:30 | Audio nhảy đến 2:30, progress bar cập nhật | 🔴 |
| MOB-LIS-MVP-HP-009 | ✅ | Previous/Next sentence | 1. Tap ⏩ Next<br>2. Tap ⏪ Previous | Nhảy đến câu tiếp/trước, highlight text cập nhật | 🔴 |
| MOB-LIS-MVP-HP-010 | ✅ | Speed control | 1. Tap speed button<br>2. Chọn 1.5x | Audio phát nhanh hơn, speed badge hiển thị "1.5x" | 🟡 |
| MOB-LIS-MVP-HP-011 | ✅ | Hiển thị thời gian đúng | 1. Audio đang phát | Current time / Total time hiển thị chính xác (mm:ss) | 🟡 |
| MOB-LIS-MVP-EC-001 | ⚠️ | Seek đến cuối bài | 1. Kéo seek bar đến cuối | Audio dừng, hiện "Bài nghe kết thúc" hoặc auto next | 🟡 |
| MOB-LIS-MVP-EC-002 | ⚠️ | Speed 0.5x / 2.0x extreme | 1. Chọn speed = 0.5x<br>2. Chọn speed = 2.0x | Audio vẫn rõ ràng, không méo tiếng ở 0.5x hoặc 2.0x | 🟡 |
| MOB-LIS-MVP-EC-003 | ⚠️ | Tap play nhiều lần liên tục | 1. Tap play/pause 10 lần nhanh | Không crash, state cuối cùng đúng (play or pause) | 🔴 |

### 3. Transcript Karaoke Highlight

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-LIS-MVP-HP-012 | ✅ | Text highlight sync | 1. Play audio<br>2. Quan sát transcript | Câu đang đọc được highlight, auto-scroll theo | 🟡 |
| MOB-LIS-MVP-HP-013 | ✅ | Tap vào câu trong transcript | 1. Tap 1 câu bất kỳ | Audio nhảy đến câu đó, highlight cập nhật | 🟡 |
| MOB-LIS-MVP-EC-004 | ⚠️ | Transcript rất dài (100+ câu) | 1. Bài nghe 20 phút | Scroll mượt, không lag, highlight vẫn chính xác | 🟡 |

### 4. Dictionary Popup

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-LIS-MVP-HP-014 | ✅ | Tap từ để tra nghĩa | 1. Tap từ "serendipity" trong transcript | Popup hiển thị: nghĩa VN, IPA, nút phát âm 🔊 | 🟡 |
| MOB-LIS-MVP-HP-015 | ✅ | Save từ vào danh sách | 1. Tap từ<br>2. Tap "Save" trong popup | Từ lưu vào Saved Words, hiện confirm toast | 🟡 |
| MOB-LIS-MVP-HP-016 | ✅ | Nghe phát âm từ | 1. Tap từ<br>2. Tap 🔊 trong popup | Phát âm TTS của từ đó, audio chính pause (nếu đang phát) | 🟡 |
| MOB-LIS-MVP-EC-005 | ⚠️ | Tap từ khi popup đang mở | 1. Tap từ A<br>2. Không đóng, tap từ B | Popup cập nhật sang từ B, animation mượt | 🟢 |

---

## Enhanced Phase

### 5. Player Modes (Full/Compact/Minimized)

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-LIS-ENH-HP-001 | ✅ | Full Player | 1. Tap vào minimized player | Player mở rộng full screen: transcript, controls, waveform | 🟡 |
| MOB-LIS-ENH-HP-002 | ✅ | Minimized Player | 1. Swipe down từ Full player | Player thu nhỏ thành mini bar ở bottom, audio tiếp tục | 🔴 |
| MOB-LIS-ENH-HP-003 | ✅ | Navigate khi mini player | 1. Mini player đang phát<br>2. Chuyển sang History tab | Mini player vẫn hiện, audio không dừng | 🔴 |
| MOB-LIS-ENH-EC-001 | ⚠️ | Compact → Full transition mượt | 1. Tap mini player nhiều lần | Animation smooth, không flickering | 🟢 |

### 6. Gestures

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-LIS-ENH-HP-004 | ✅ | Swipe left = Previous sentence | 1. Swipe left trên player | Nhảy câu trước + haptic light | 🟡 |
| MOB-LIS-ENH-HP-005 | ✅ | Swipe right = Next sentence | 1. Swipe right trên player | Nhảy câu tiếp + haptic light | 🟡 |
| MOB-LIS-ENH-HP-006 | ✅ | Swipe down = Minimize | 1. Swipe down trên full player | Minimize player + animation spring | 🟡 |
| MOB-LIS-ENH-HP-007 | ✅ | Double tap = Play/Pause | 1. Double tap trên player | Toggle play/pause + haptic | 🟡 |
| MOB-LIS-ENH-HP-008 | ✅ | Long press sentence = Bookmark | 1. Long press câu trong transcript | Câu được bookmark, icon ⭐ hiện ra | 🟡 |

### 7. TTS Provider Settings

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-LIS-ENH-HP-009 | ✅ | Chọn TTS provider (OpenAI/Azure) | 1. Settings → TTS Provider<br>2. Chọn Azure | Bài nghe mới dùng Azure voice | 🟡 |
| MOB-LIS-ENH-HP-010 | ✅ | Chọn voice cho speaker | 1. Settings → Voice Selection<br>2. Chọn voice "Alloy" | Audio phát bằng voice đã chọn | 🟡 |
| MOB-LIS-ENH-HP-011 | ✅ | Random voice toggle | 1. Bật "Random voice"<br>2. Start session | Mỗi lần tạo bài có voice khác nhau | 🟢 |
| MOB-LIS-ENH-HP-012 | ✅ | Preview voice | 1. Tap 🔊 bên cạnh tên voice | Nghe sample 3-5s của voice đó | 🟡 |
| MOB-LIS-ENH-EC-002 | ⚠️ | Azure voice không khả dụng | 1. Chọn Azure<br>2. Azure service lỗi | Fallback về OpenAI, hiện toast thông báo | 🟡 |

### 8. Background Playback

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-LIS-ENH-HP-013 | ✅ | Minimize app → Audio tiếp tục | 1. Đang phát audio<br>2. Home button | Audio vẫn phát, lock screen controls hiện | 🔴 |
| MOB-LIS-ENH-HP-014 | ✅ | Lock screen controls | 1. Tắt màn hình<br>2. Xem lock screen | Hiện now playing: title, progress, play/pause/next | 🔴 |
| MOB-LIS-ENH-HP-015 | ✅ | Cuộc gọi đến → Pause → Resume | 1. Đang phát<br>2. Có cuộc gọi đến<br>3. Kết thúc cuộc gọi | Audio auto-pause → Auto-resume sau cuộc gọi | 🔴 |
| MOB-LIS-ENH-HP-016 | ✅ | Rút tai nghe → Pause | 1. Đang phát qua tai nghe<br>2. Rút tai nghe | Audio pause ngay (không phát loa ngoài) | 🔴 |
| MOB-LIS-ENH-HP-017 | ✅ | Bluetooth connect → Tiếp tục | 1. Kết nối Bluetooth headset<br>2. Đang phát | Audio route tự động sang Bluetooth | 🟡 |
| MOB-LIS-ENH-EC-003 | ⚠️ | App bị OS kill | 1. Đang phát background<br>2. OS kill app (low memory) | Audio dừng, khi mở lại có thể resume | 🟡 |
| MOB-LIS-ENH-EC-004 | ⚠️ | Notification sound → Duck volume | 1. Đang phát<br>2. Nhận notification | Volume giảm 50% trong lúc notification, tự khôi phục | 🟡 |

### 9. Custom Scenarios

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-LIS-ENH-HP-018 | ✅ | Tạo custom scenario | 1. Tap "Create Scenario"<br>2. Nhập tên + mô tả<br>3. Save | Scenario mới hiện trong danh sách | 🟡 |
| MOB-LIS-ENH-HP-019 | ✅ | Favorite scenario | 1. Tap ⭐ trên scenario card | Scenario thêm vào Favorites, sort lên đầu | 🟢 |
| MOB-LIS-ENH-HP-020 | ✅ | Delete scenario | 1. Swipe left trên scenario<br>2. Confirm delete | Scenario xóa khỏi list, undo toast 3s | 🟡 |
| MOB-LIS-ENH-EC-005 | ⚠️ | Tên scenario trùng | 1. Tạo scenario cùng tên | Cho phép (thêm timestamp) hoặc warning | 🟢 |
| MOB-LIS-ENH-ERR-001 | ❌ | Tạo scenario với input rỗng | 1. Không nhập gì<br>2. Tap Save | Validation "Nhập tên scenario", nút Save disabled | 🟡 |

---

## Advanced Phase

### 10. A-B Loop

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-LIS-ADV-HP-001 | ✅ | Set A-B Loop | 1. Long press set point A<br>2. Long press set point B | Audio lặp đi lặp lại đoạn A→B | 🟡 |
| MOB-LIS-ADV-HP-002 | ✅ | Clear A-B Loop | 1. Tap "Clear Loop" | Trở về phát bình thường | 🟡 |

### 11. Offline Playback

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-LIS-ADV-HP-003 | ✅ | Download bài nghe | 1. Tap ⬇️ Download trên lesson | Download progress hiển thị, save offline | 🟡 |
| MOB-LIS-ADV-HP-004 | ✅ | Phát bài đã download offline | 1. Tắt mạng<br>2. Mở bài đã download | Audio phát bình thường từ local storage | 🔴 |
| MOB-LIS-ADV-EC-001 | ⚠️ | Download bị gián đoạn | 1. Bắt đầu download<br>2. Mất mạng giữa chừng | Hiện retry, resume download khi có mạng lại | 🟡 |
| MOB-LIS-ADV-EC-002 | ⚠️ | Storage đầy | 1. Storage device gần đầy<br>2. Download bài | Hiện warning "Không đủ dung lượng" | 🟡 |
