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

### 9.1 Scenario Picker Redesign v2

> **Ref:** Redesigned `TopicPickerModal.tsx`, `TopicPicker.tsx`
> **Xem thêm:** `02A_listening_scenario_picker_manual_tests.md` (Manual, Smoke, Monkey, E2E)

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-LIS-ENH-HP-030 | ✅ | Mở modal có pill handle | 1. Tap "Chọn kịch bản" | Modal slide-up, pill handle 36×4px hiện ở top | 🟡 |
| MOB-LIS-ENH-HP-031 | ✅ | Tab "⭐ Yêu thích" empty state | 1. Tap tab "⭐ Yêu thích" (chưa star gì) | Hiện "Chưa có kịch bản yêu thích" + hướng dẫn | 🟡 |
| MOB-LIS-ENH-HP-032 | ✅ | Tab "⭐ Yêu thích" có items | 1. Star 3 scenarios<br>2. Tab "⭐ Yêu thích" | Hiện 3 items với category badge, tab badge count "3" | 🔴 |
| MOB-LIS-ENH-HP-033 | ✅ | Search debounce 300ms | 1. Gõ "interview" | Kết quả hiện sau ~300ms, có category badge trên mỗi item | 🟡 |
| MOB-LIS-ENH-HP-034 | ✅ | Animated chevron accordion | 1. Tap subcategory header | Chevron icon xoay 0→180° khi expand, 180→0° khi collapse | 🟢 |
| MOB-LIS-ENH-HP-035 | ✅ | Chọn scenario không auto-close | 1. Tap scenario item | Item highlight, footer hiện "✅ Xác nhận: {name}", modal KHÔNG tự đóng | 🔴 |
| MOB-LIS-ENH-HP-036 | ✅ | Nút "🎲 Gợi ý ngẫu nhiên" | 1. Mở modal (chưa chọn)<br>2. Tap "🎲 Gợi ý ngẫu nhiên" | Random scenario chọn, footer đổi sang Confirm, haptic medium | 🟡 |
| MOB-LIS-ENH-HP-037 | ✅ | Nút "✅ Xác nhận" đóng modal | 1. Chọn scenario<br>2. Tap "✅ Xác nhận" | Modal đóng, config.topic = scenario đã chọn, haptic success | 🔴 |
| MOB-LIS-ENH-HP-038 | ✅ | Tab "✨ Tuỳ chỉnh" inline form | 1. Tap tab "✨ Tuỳ chỉnh" | CustomScenarioInput hiện inline trong modal (không navigate ra) | 🔴 |
| MOB-LIS-ENH-HP-039 | ✅ | Star toggle haptic | 1. Tap ☆ trên scenario item | Star toggle + haptic light feedback | 🟢 |
| MOB-LIS-ENH-HP-040 | ✅ | Scale animation on press | 1. Nhấn scenario item | Item scale(0.97) khi press, scale(1) khi release | 🟢 |
| MOB-LIS-ENH-EC-006 | ⚠️ | Search ký tự đặc biệt | 1. Gõ `@#$%^&*()` | Không crash, hiện 0 results | 🟢 |
| MOB-LIS-ENH-EC-007 | ⚠️ | Toggle star 20 lần nhanh | 1. Tap star 20 lần liên tục | State cuối đúng (chẵn=off, lẻ=on), không crash | 🟡 |
| MOB-LIS-ENH-EC-008 | ⚠️ | Chuyển 5 tabs nhanh trong 3s | 1. Tap tất cả tabs nhanh | Tab cuối active đúng, không flicker | 🟡 |
| MOB-LIS-ENH-EC-009 | ⚠️ | Mở modal → đóng → mở → đóng 10 lần | 1. Tap "Chọn kịch bản" 10 lần | Modal hoạt động đúng, state giữ nguyên, không leak | 🔴 |
| MOB-LIS-ENH-EC-010 | ⚠️ | Star tất cả 140+ scenarios | 1. Star tất cả scenarios | Tab Yêu thích render 140+ items, scroll mượt | 🟡 |
| MOB-LIS-ENH-EC-011 | ⚠️ | Swipe down giữa animation accordion | 1. Mở accordion<br>2. Swipe down modal ngay | Modal đóng sạch, không crash | 🟡 |
| MOB-LIS-ENH-ERR-002 | ❌ | Custom "Sử dụng ngay" input rỗng | 1. Tab "Tuỳ chỉnh"<br>2. Không nhập gì<br>3. Tap "Sử dụng ngay" | Toast warning "Chưa nhập tên kịch bản" | 🟡 |

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

---

## Smoke Tests

> Kiểm tra nhanh sanity các feature chính — chạy TRƯỚC mỗi release (~5 phút)
> Chi tiết từng bước xem: `SMOKE_MONKEY_MANUAL_GUIDE.md`

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-LIS-SMK-001 | 🟢 | Mở ConfigScreen | Dashboard → Tap "Luyện nghe" | Render đầy đủ sections | 🔴 |
| MOB-LIS-SMK-002 | 🟢 | TopicPicker render | Scroll tới TopicPicker | 3 tabs hiện, scenarios load | 🔴 |
| MOB-LIS-SMK-003 | 🟢 | Chọn scenario | Tap 1 scenario bất kỳ | Topic auto-fill, highlight | 🔴 |
| MOB-LIS-SMK-004 | 🟢 | Search topic | Gõ "coffee" → filter | Chỉ hiện related scenarios | 🟡 |
| MOB-LIS-SMK-005 | 🟢 | Đổi duration | Tap "10 phút" | Chip highlight | 🟡 |
| MOB-LIS-SMK-006 | 🟢 | Custom duration | Tap Custom → nhập 7 | Duration = 7 | 🟡 |
| MOB-LIS-SMK-007 | 🟢 | Chọn speakers | Tap "3 Speakers" | Chip highlight | 🟡 |
| MOB-LIS-SMK-008 | 🟢 | Nhập keywords | Gõ "meeting, deadline" | Text hiện + counter | 🟡 |
| MOB-LIS-SMK-009 | 🟢 | Vietnamese toggle | Bật/tắt switch | Toggle mượt | 🟡 |
| MOB-LIS-SMK-010 | 🟢 | Start Listening | Config → Tap Start | Loading → Navigate | 🔴 |

---

## Monkey Tests

> Test chaos — tap lung tung, nhập bậy bạ. Mục đích: tìm crash & edge case.
> Chi tiết từng bước xem: `SMOKE_MONKEY_MANUAL_GUIDE.md`

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-LIS-MKY-001 | ⚠️ | Tap điên cuồng | Tap 20 lần/10s vào mọi nơi | Không crash, không freeze > 3s | 🔴 |
| MOB-LIS-MKY-002 | ⚠️ | Xoay màn hình | Xoay dọc↔ngang 5 lần | Layout không vỡ, data giữ | 🔴 |
| MOB-LIS-MKY-003 | ⚠️ | Switch app nhanh | Home → mở lại app 5 lần | Config không reset, không crash | 🔴 |
| MOB-LIS-MKY-004 | ⚠️ | Nhập emoji | Gõ ☕🔥💀 vào topic input | Không crash, hiện bình thường | 🟡 |
| MOB-LIS-MKY-005 | ⚠️ | Paste 500+ ký tự keywords | Paste text dài vào Keywords | Cắt ở 200 ký tự, không crash | 🟡 |
| MOB-LIS-MKY-006 | ⚠️ | Keyboard + scroll | Mở keyboard → scroll nhanh | Không crash, keyboard không che input | 🟡 |
| MOB-LIS-MKY-007 | ⚠️ | Back button liên tục | Tap back 10 lần nhanh | Chỉ về Dashboard, không crash | 🔴 |
| MOB-LIS-MKY-008 | ⚠️ | Interrupt generate | Start → ngay lập tức tap Back | Request cancel, không crash | 🔴 |
| MOB-LIS-MKY-009 | ⚠️ | Chọn/bỏ chọn liên tục | Tap 1 scenario 20 lần | State cuối cùng đúng | 🟡 |
| MOB-LIS-MKY-010 | ⚠️ | XSS/SQL injection | Nhập `<script>` và `'; DROP TABLE` | Hiện text bình thường, không execute | 🔴 |

---

## Manual Tests

> Test chi tiết trên device thật — UI/UX, animation, touch targets, accessibility.
> Chi tiết từng bước xem: `SMOKE_MONKEY_MANUAL_GUIDE.md`

### Config Screen UI

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-LIS-MNL-001 | ✅ | Full layout render | Scroll ConfigScreen top → bottom | Đủ sections: Topic, Duration, Speakers, Keywords, Vietnamese, Advanced, Start | 🔴 |
| MOB-LIS-MNL-002 | ✅ | SafeArea / notch | Mở trên iPhone có notch | Content không bị che | 🟡 |
| MOB-LIS-MNL-003 | ✅ | Scroll mượt | Scroll nhanh | ~60 FPS, không jank | 🟡 |
| MOB-LIS-MNL-004 | ✅ | Dark mode | Bật dark mode → mở app | Màu sắc đúng, text readable | 🟡 |

### TopicPicker

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-LIS-MNL-005 | ✅ | Category tabs | Tap IT → Daily → Personal | Tabs chuyển mượt, data load đúng | 🟡 |
| MOB-LIS-MNL-006 | ✅ | Accordion expand | Tap subcategory header | Expand/collapse animation | 🟡 |
| MOB-LIS-MNL-007 | ✅ | Select scenario | Tap scenario item | Highlight + config.topic cập nhật | 🔴 |
| MOB-LIS-MNL-008 | ✅ | Favorite ⭐ | Tap star icon | Star fill, lưu favorites | 🟢 |
| MOB-LIS-MNL-009 | ✅ | Search filter | Gõ "hotel" | Chỉ hiện match, categories khác ẩn | 🟡 |
| MOB-LIS-MNL-010 | ✅ | Search clear | Tap X clear | All scenarios hiện lại | 🟢 |

### Duration, Speakers, Keywords

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-LIS-MNL-011 | ✅ | Duration preset | Tap [5] [10] [15] lần lượt | Chỉ 1 selected, highlight đúng | 🟡 |
| MOB-LIS-MNL-012 | ✅ | Custom duration | Custom → gõ 25 | Duration = 25 | 🟡 |
| MOB-LIS-MNL-013 | ⚠️ | Duration boundary | Nhập 0 → min=1, nhập 99 → max=60 | Clamp đúng | 🟡 |
| MOB-LIS-MNL-014 | ✅ | Speakers chips | Tap 👤×2/3/4 | Chip highlight + label | 🟡 |
| MOB-LIS-MNL-015 | ✅ | Keywords multiline | Gõ nhiều dòng | Multiline OK, counter đếm | 🟡 |
| MOB-LIS-MNL-016 | ⚠️ | Keywords max 200 | Gõ 200+ ký tự | Cắt ở 200, counter "200/200" | 🟡 |

### Advanced Options & Full Flow

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-LIS-MNL-017 | ✅ | Open Advanced Options | Tap "Advanced Options" | Bottom sheet slide up mượt | 🟡 |
| MOB-LIS-MNL-018 | ✅ | Difficulty select | Tap "Advanced" | Chip highlight, lưu setting | 🟡 |
| MOB-LIS-MNL-019 | ✅ | Close sheet | Swipe down/tap backdrop | Sheet đóng, settings giữ | 🟡 |
| MOB-LIS-MNL-020 | ✅ | Full E2E flow | Config đầy đủ → Start | Loading → Player screen | 🔴 |
| MOB-LIS-MNL-021 | ❌ | Start không topic | Bỏ trống topic → Start | Validation error hiện | 🟡 |
| MOB-LIS-MNL-022 | ❌ | Start offline | Tắt mạng → Start | Error toast/dialog | 🔴 |
| MOB-LIS-MNL-023 | ✅ | Custom scenario Quick Use | Nhập tên + desc → Quick Use | Topic fill, ready | 🟡 |
| MOB-LIS-MNL-024 | ✅ | Custom scenario Save | Nhập → Save | Lưu local, hiện trong list | 🟡 |


---

## SMOKE TESTS (Chạy đầu tiên — 5 phút)

> **Mục đích:** Verify luồng nghe hoạt động end-to-end trước khi test chi tiết

| ID | Scenario | Steps | Expected | ✅/❌ |
|:---|:---------|:------|:---------|:------|
| SMK-L01 | Navigate Config | 1. Dashboard → "🎧 Luyện Nghe" | ConfigScreen: topic, duration, mode, speakers | 🔲 |
| SMK-L02 | Chọn config + Start | 1. Chọn topic, duration, mode<br>2. Tap Start | Loading → PlayerScreen hiện, audio bắt đầu | 🔲 |
| SMK-L03 | Play/Pause | 1. Tap ▶️ → ⏸️ → ▶️ | Audio play/pause/resume đúng | 🔲 |
| SMK-L04 | Seek bar | 1. Kéo seek bar đến 50% | Audio nhảy đến vị trí đó | 🔲 |
| SMK-L05 | Transcript highlight | 1. Quan sát transcript khi đang phát | Câu đang đọc highlight, auto-scroll | 🔲 |
| SMK-L06 | Tap từ → Dictionary | 1. Tap 1 từ trong transcript | Popup hiện: nghĩa VN, IPA, phát âm | 🔲 |
| SMK-L07 | Speed control | 1. Đổi speed 1x → 1.5x | Audio nhanh hơn, badge hiện "1.5x" | 🔲 |
| SMK-L08 | Back/Exit | 1. Tap ← hoặc X | Quay lại, audio dừng | 🔲 |

---

## MONKEY TESTS (Free-form — 10 phút thao tác ngẫu nhiên)

> **Mục đích:** Tìm crash, memory leak, UI glitch  
> **Hướng dẫn:** Thao tác nhanh, bất thường, không theo logic

| ID | Scenario | Thao tác | Quan sát | ✅/❌ |
|:---|:---------|:---------|:---------|:------|
| MNK-L01 | Spam play/pause | 1. Tap play/pause 20 lần nhanh (<0.3s/lần) | Không crash, state cuối cùng đúng | 🔲 |
| MNK-L02 | Spam tap từ | 1. Tap 15 từ khác nhau cực nhanh | Popup switch mượt, không crash, không leak audio | 🔲 |
| MNK-L03 | Kéo seek nhanh liên tục | 1. Kéo seek bar qua lại 10 lần nhanh | Audio nhảy đúng, không treo, không crash | 🔲 |
| MNK-L04 | Spam Start button | 1. Config xong<br>2. Tap Start 10 lần | 1 lần navigate, không duplicate | 🔲 |
| MNK-L05 | Tắt mạng giữa generate | 1. Tap Start<br>2. Tắt WiFi ngay | Error, không treo, retry khả dụng | 🔲 |
| MNK-L06 | Minimize app khi đang phát | 1. Audio đang phát<br>2. Home button<br>3. Mở lại | Audio tiếp tục hoặc pause đúng, UI correct | 🔲 |
| MNK-L07 | Cuộc gọi giữa phát | 1. Đang nghe<br>2. Nhận cuộc gọi<br>3. Cúp | Audio pause → resume, không lost position | 🔲 |
| MNK-L08 | Xoay device | 1. Đang phát<br>2. Xoay ngang → dọc | UI re-layout, player controls visible | 🔲 |
| MNK-L09 | Speed + seek + tap đồng thời | 1. Đổi speed + kéo seek + tap từ cùng lúc | Không crash, xử lý graceful | 🔲 |
| MNK-L10 | Nghe 20 phút liên tục | 1. Phát bài 20 phút không gián đoạn | Không chậm dần, memory ổn, timer đúng | 🔲 |
| MNK-L11 | Back giữa generate | 1. Tap Start (loading)<br>2. Tap Back ngay | Cancel/ignore, quay Config, không treo | 🔲 |
| MNK-L12 | Rút tai nghe giữa phát | 1. Đang phát qua tai nghe<br>2. Rút tai nghe | Audio pause, không phát loa ngoài bất ngờ | 🔲 |

---

## EDGE CASE TESTS (Listening)

| ID | Scenario | Steps | Expected Result | Severity | ✅/❌ |
|:---|:---------|:------|:----------------|:---------|:------|
| EC-L01 | Dark mode | 1. Bật dark mode<br>2. Full flow | Text đọc được, player controls visible, popup OK | 🟡 | 🔲 |
| EC-L02 | iPhone SE (màn nhỏ) | 1. Chạy iPhone SE | Player controls không bị cắt, text readable | 🟡 | 🔲 |
| EC-L03 | Bài nghe rất dài (30 phút) | 1. Duration 30 phút | Không lag, memory OK, timer đúng cuối bài | 🟡 | 🔲 |
| EC-L04 | Transcript 100+ câu | 1. Bài dài có 100+ câu | Scroll mượt, highlight chính xác | 🟡 | 🔲 |
| EC-L05 | Slow network (3G) | 1. Throttle 3G<br>2. Tạo bài | Loading lâu hơn nhưng không crash | 🟡 | 🔲 |
| EC-L06 | Audio buffer chưa sẵn sàng | 1. Tap play ngay khi mới load | Chờ buffer xong rồi phát, hoặc loading indicator | 🟡 | 🔲 |
| EC-L07 | Bluetooth switch giữa phát | 1. Đang phát speaker<br>2. Kết nối Bluetooth | Audio route sang Bluetooth mượt | 🟢 | 🔲 |
| EC-L08 | Low battery mode | 1. Bật low power mode<br>2. Phát audio | Audio vẫn phát, không bị throttle | 🟢 | 🔲 |

---

## CHECKLIST TRƯỚC KHI RELEASE (Listening)

| # | Hạng mục | Tiêu chí | Status |
|---|----------|----------|--------|
| 1 | Unit tests | All passed | ✅ |
| 2 | Smoke tests (8 items) | Tất cả PASS | 🔲 |
| 3 | Critical bugs (🔴) | 0 bugs | 🔲 |
| 4 | Functional tests | HP ✅ PASS | 🔲 |
| 5 | Monkey tests (10 phút) | Không crash | 🔲 |
| 6 | Dark mode | Đọc được hết | 🔲 |
| 7 | Background audio | Phát khi minimize | 🔲 |

---

## 📝 Bug Log (Ghi khi test)

| # | Ngày | Test ID | Mô tả bug | Severity | Device | Screenshot | Status |
|---|------|---------|-----------|----------|--------|------------|--------|
| 1 | | | | | | | |
| 2 | | | | | | | |

---

## 🔥 Smoke Tests (Critical Path)

> **Mục đích:** Kiểm tra nhanh các luồng quan trọng nhất trước mỗi bản build. Tổng thời gian: ~10 phút.
> **Khi nào chạy:** Trước mỗi release, sau mỗi PR merge vào main, hoặc sau khi sửa bug critical.

| # | Luồng | Steps tóm tắt | Pass Criteria | Thời gian |
|:--|:------|:---------------|:--------------|:----------|
| S-01 | **Config → Generate → Play** | Mở Listening → chọn topic → Start → audio phát | Audio phát thành công, transcript hiện | 2 phút |
| S-02 | **Player Controls** | Play → Pause → Skip → Speed 1.5x | Tất cả controls hoạt động, state đúng | 1 phút |
| S-03 | **Dictionary Popup** | Tap từ trong transcript → popup hiện → đóng popup | Popup hiện nghĩa + IPA, đóng mượt | 1 phút |
| S-04 | **Bookmark Sentence** | Long press câu → bookmark icon hiện → long press lại → bỏ bookmark | Toggle hoạt động, icon ⭐ đúng | 30 giây |
| S-05 | **Save Word** | Tap từ → Lưu từ → Toast xác nhận | Từ được lưu, toast "Đã lưu từ" hiện | 30 giây |
| S-06 | **Gestures** | Swipe left/right (skip), double tap (play/pause), swipe down (minimize) | Gesture + haptic hoạt động | 1 phút |
| S-07 | **Audio Generation** | Tạo bài mới → chờ audio sinh → auto-play | Loading → audio phát, timestamps sync | 2 phút |
| S-08 | **Error Recovery** | Tắt mạng → Start → xem error → bật mạng → Retry | Error hiện rõ ràng, retry thành công | 2 phút |

---

## 🐵 Monkey Tests (Random Chaos Testing)

> **Mục đích:** Kiểm tra app có crash/treo khi user thao tác bất quy tắc, nhanh, hoặc bất thường. Giả lập hành vi "người dùng vô thức" — tap lung tung, xoay màn hình, minimize liên tục.
> **Khi nào chạy:** Trước release, khi refactor lớn, hoặc khi nghi ngờ memory leak / race condition.

### MK-01: Rapid Tap Chaos (Player Screen)

| Bước | Hành động | Mục đích kiểm tra |
|:-----|:----------|:-------------------|
| 1 | Tạo bài nghe bất kỳ, vào PlayerScreen | Setup |
| 2 | Tap Play/Pause liên tục 20+ lần trong 5 giây | Race condition giữa play/pause commands |
| 3 | Tap Skip Forward nhanh 15 lần | Out-of-bounds index, undefined exchange |
| 4 | Tap Skip Back nhanh 15 lần khi ở câu đầu | Negative index handling |
| 5 | Tap Speed button liên tục xoay vòng 0.5→0.75→1→1.25→1.5→2→0.5... (10 vòng) | State consistency, audio rate change |

**Pass:** App không crash, state cuối cùng hợp lệ (play hoặc pause, index ≥ 0, speed trong khoảng hợp lệ).

### MK-02: Dictionary Popup Chaos

| Bước | Hành động | Mục đích kiểm tra |
|:-----|:----------|:-------------------|
| 1 | Tap 10 từ khác nhau liên tục (không chờ popup load xong) | Cancel request cũ, race condition API |
| 2 | Tap từ → popup đang loading → swipe down đóng → tap từ mới ngay | Cleanup state khi dismiss giữa chừng |
| 3 | Tap từ → popup hiện → tap "Lưu từ" 5 lần liên tiếp | Duplicate prevention trong savedWords |
| 4 | Tap từ không tồn tại (ví dụ: "asdqwezxc") → xem error → tap từ thật | Error → recovery flow |
| 5 | Mở popup → tắt mạng → tap 🔊 phát âm | Network error trong pronunciation |
| 6 | Tap vào số "123" hoặc dấu câu "..." trong transcript | Nên bỏ qua, không tra từ rỗng |

**Pass:** Không crash, không leak memory, popup state luôn consistent (loading/error/result), savedWords không trùng.

### MK-03: Navigation Chaos

| Bước | Hành động | Mục đích kiểm tra |
|:-----|:----------|:-------------------|
| 1 | Đang phát audio → tap Back → ngay lập tức mở lại Listening → Start | Audio cleanup, re-init TrackPlayer |
| 2 | Config → Start → loading... → tap Back liên tục | Cancel API mid-flight |
| 3 | Player → Home → Player → Config → Player (navigate nhanh) | Memory leak, duplicate listeners |
| 4 | Mở popup từ điển → rotate device (nếu cho phép) | Layout recalculation |
| 5 | Minimize app → đợi 5 phút → mở lại → tap play | State persistence sau background |

**Pass:** Không crash, không memory warning, audio cleanup đúng, navigation smooth.

### MK-04: Input Chaos (Config Screen)

| Bước | Hành động | Mục đích kiểm tra |
|:-----|:----------|:-------------------|
| 1 | Nhập topic = emoji "🎵🎶🎨" → Start | Unicode handling |
| 2 | Nhập topic = chuỗi 500 ký tự | Text truncation, UI overflow |
| 3 | Nhập keywords = `"; DROP TABLE conversations; --` | SQL injection (nếu proxy backend) |
| 4 | Chọn topic → chọn lại → chọn lại (flip-flop 20 lần) | Selection state consistency |
| 5 | Tap tất cả favorite stars nhanh (toggle 10 scenarios) | Array mutation race condition |

**Pass:** Không crash, input sanitized, state consistent sau chaos.

### MK-05: Audio Interruption Chaos

| Bước | Hành động | Mục đích kiểm tra |
|:-----|:----------|:-------------------|
| 1 | Đang phát → cắm/rút tai nghe 5 lần | Audio route switching |
| 2 | Đang phát → nhận cuộc gọi → reject → resume nhanh | Audio focus management |
| 3 | Đang phát → mở app khác phát nhạc → quay lại | Audio session conflict |
| 4 | Đang phát popup phát âm → tap từ mới → phát âm từ mới | Concurrent audio playback |
| 5 | Volume = 0 → play → seek → pause → volume max → play | Zero volume edge case |

**Pass:** Audio không leak, không phát 2 source cùng lúc, resume đúng vị trí.

---

## 🧪 E2E Test Scenarios (Full User Flow)

> **Mục đích:** Test luồng hoàn chỉnh từ đầu đến cuối, bao gồm API thật, audio thật, navigation thật.
> **Công cụ đề xuất:** Maestro / Detox
> **Khi nào chạy:** Trước release, CI/CD pipeline.

### E2E-LIS-001: Luồng hoàn chỉnh — Tạo → Nghe → Tra từ → Lưu

```
Steps:
  1. Mở app → Tap 🎧 "Luyện nghe"
  2. Chọn topic "Coffee Shop" từ TopicPicker
  3. Chọn duration = 5 phút
  4. Tap "Bắt đầu nghe"
  5. Đợi loading → audio bắt đầu phát
  6. Verify: transcript hiển thị, highlight sync
  7. Tap Pause → verify audio dừng
  8. Tap vào từ "coffee" trong transcript
  9. Verify: DictionaryPopup hiển thị nghĩa, IPA
  10. Tap "Lưu từ" → verify toast "Đã lưu"
  11. Đóng popup → tap Play → audio tiếp tục
  12. Tap Back → về Config screen

Expected: Toàn bộ flow không lỗi, state consistent.
```

### E2E-LIS-002: Luồng lỗi — Mất mạng giữa chừng

```
Steps:
  1. Mở Listening → Config → Start
  2. Đợi audio sinh xong, đang phát
  3. Tắt mạng (Airplane mode)
  4. Tap vào từ trong transcript → expect popup
  5. Popup hiện lỗi "Không tìm thấy" (vì API fail)
  6. Tap "Tìm trên Google" → browser mở (nếu cached)
  7. Bật mạng lại
  8. Tap từ khác → dictionary lookup thành công
  
Expected: App không crash khi mất mạng, recovery tự nhiên.
```

### E2E-LIS-003: Luồng Bookmark + Gesture

```
Steps:
  1. Tạo bài nghe → vào Player
  2. Long press câu 1 → verify ⭐ hiện
  3. Long press câu 3 → verify ⭐ hiện
  4. Swipe right → skip forward
  5. Swipe left → skip back
  6. Double tap → toggle play/pause 
  7. Swipe down → minimize
  8. Verify: audio vẫn phát khi minimized

Expected: Gestures + bookmark hoạt động đúng cùng lúc.
```

### E2E-LIS-004: Luồng Config đầy đủ — Advanced Options

```
Steps:
  1. Mở Listening Config
  2. Nhập topic thủ công: "Job Interview"
  3. Chọn duration = 10 phút
  4. Chọn speakers = 3
  5. Nhập keywords: "resume, salary, experience"
  6. Mở Advanced Options → chọn TTS = Azure → chọn voice
  7. Tap "Bắt đầu nghe"
  8. Verify: audio có 3 speakers, nội dung liên quan keywords

Expected: Config được gửi đúng, audio phản ánh config.
```

---

## 📋 Manual Test Checklist (Device thật)

> **Mục đích:** Checklist cho QA test trên device thật. Đánh dấu ✅/❌ và ghi note.
> **Devices tối thiểu:** iPhone SE + iPhone 15 (hoặc tương đương)

### Checklist A: Dictionary Popup — UI/UX Verification

| # | Kiểm tra | iPhone SE | iPhone 15 | Notes |
|:--|:---------|:---------:|:---------:|:------|
| A1 | Tap từ → popup hiện trong <500ms | ☐ | ☐ | |
| A2 | IPA hiển thị đúng font mono | ☐ | ☐ | VD: /ˈkɒfi/ |
| A3 | Part-of-speech badges có màu đúng (noun=blue, verb=green, adj=amber) | ☐ | ☐ | |
| A4 | Definitions có border-left + indent đúng | ☐ | ☐ | |
| A5 | Examples hiển thị italic, màu nhạt hơn | ☐ | ☐ | |
| A6 | Nút 🔊 phát âm: touch target ≥ 44px | ☐ | ☐ | Dùng ngón cái test |
| A7 | Nút "Lưu từ": touch target ≥ 44px, haptic success | ☐ | ☐ | |
| A8 | Popup scroll được nếu nội dung dài (từ có nhiều meanings) | ☐ | ☐ | Test từ "set", "run" |
| A9 | Swipe down đóng popup mượt | ☐ | ☐ | |
| A10 | Tap backdrop đóng popup | ☐ | ☐ | |
| A11 | Loading state hiện spinner + "Đang tra từ..." | ☐ | ☐ | |
| A12 | Error state hiện icon ⚠️ + message + Google fallback | ☐ | ☐ | Test từ "xyzabc" |
| A13 | Dark mode: popup background, text contrast đúng | ☐ | ☐ | |
| A14 | Popup không che mất thanh controls phía dưới | ☐ | ☐ | |
| A15 | Accessibility: VoiceOver đọc được nội dung popup | ☐ | ☐ | Bật VoiceOver |

### Checklist B: TappableTranscript — Touch Interaction

| # | Kiểm tra | iPhone SE | iPhone 15 | Notes |
|:--|:---------|:---------:|:---------:|:------|
| B1 | Tap chính xác từ (không tap nhầm từ bên cạnh) | ☐ | ☐ | Đặc biệt trên SE nhỏ |
| B2 | Tap opacity feedback nhìn thấy rõ (activeOpacity=0.6) | ☐ | ☐ | |
| B3 | Dấu câu (dấu chấm, phẩy) không tra từ | ☐ | ☐ | Tap "Hello," → tra "Hello" |
| B4 | Số (123) không tra từ | ☐ | ☐ | |
| B5 | Từ viết tắt (don't, I'm) tra đúng | ☐ | ☐ | |
| B6 | Text wrap đúng (không bị cắt giữa từ) | ☐ | ☐ | |
| B7 | Scroll transcript mượt với TappableTranscript (100+ từ) | ☐ | ☐ | FPS ≥ 55 |
| B8 | Active exchange highlight vẫn hoạt động | ☐ | ☐ | |
| B9 | Tap từ → popup → tap câu khác để seek → popup đóng | ☐ | ☐ | Interaction priority |
| B10 | Font size lớn (Accessibility) → touch targets vẫn đủ | ☐ | ☐ | Settings > Font Size > Large |

### Checklist C: Integration — Player × Dictionary × Bookmark

| # | Kiểm tra | iPhone SE | iPhone 15 | Notes |
|:--|:---------|:---------:|:---------:|:------|
| C1 | Đang play → tap từ → popup → audio vẫn phát | ☐ | ☐ | |
| C2 | Tap 🔊 phát âm → audio chính tạm dừng | ☐ | ☐ | |
| C3 | Long press câu đã bookmark → bỏ bookmark + đóng popup nếu mở | ☐ | ☐ | |
| C4 | Lưu từ 20 lần → savedWords không trùng | ☐ | ☐ | |
| C5 | Tạo bài mới → savedWords reset về rỗng | ☐ | ☐ | |
| C6 | Background mode: minimize → audio phát → mở lại → tap từ → popup OK | ☐ | ☐ | |
| C7 | Low battery warning popup → app vẫn hoạt động | ☐ | ☐ | |
| C8 | Đang tra từ (popup loading) → kill app → mở lại | ☐ | ☐ | No crash on restart |
| C9 | Lock screen → unlock → popup state giữ nguyên | ☐ | ☐ | |
| C10 | Notification banner → tap → quay lại → popup vẫn hoạt động | ☐ | ☐ | |

### Checklist D: Performance & Memory

| # | Kiểm tra | Pass Criteria | Notes |
|:--|:---------|:--------------|:------|
| D1 | Memory khi mở/đóng popup 50 lần | Không tăng > 20MB | Dùng Xcode Memory Graph |
| D2 | FPS transcript scroll (bài 20 phút, 100+ exchanges) | ≥ 55 FPS | Dùng React DevTools |
| D3 | API response time (dictionary lookup) | < 2 giây (cached < 200ms) | Kiểm tra console log |
| D4 | Thời gian mở popup | < 500ms từ tap đến visible | Stopwatch hoặc video |
| D5 | Bundle size impact từ DictionaryPopup | Không tăng > 10KB | `npx react-native-bundle-visualizer` |

---

## 📊 Unit Test Coverage Matrix

> **Tình trạng hiện tại:** 79/79 tests passed (13/02/2026)

| File | Tests | Status | Ref Test Cases |
|:-----|:------|:-------|:---------------|
| `useDictionary.test.ts` | 7 | ✅ | MOB-LIS-MVP-HP-014, EC-005 |
| `useListeningStore.test.ts` — Config | 7 | ✅ | HP-002, HP-003, HP-025, HP-026 |
| `useListeningStore.test.ts` — Topic | 4 | ✅ | HP-021 |
| `useListeningStore.test.ts` — Favorites | 3 | ✅ | HP-023 |
| `useListeningStore.test.ts` — Playback | 6 | ✅ | HP-007, HP-010, EC-002, EC-003 |
| `useListeningStore.test.ts` — Conversation | 2 | ✅ | HP-006 |
| `useListeningStore.test.ts` — Audio | 4 | ✅ | — |
| `useListeningStore.test.ts` — Saved Words | 5 | ✅ | HP-015 |
| `useListeningStore.test.ts` — TTS Provider | 7 | ✅ | ENH-HP-009, ENH-HP-010 |
| `useListeningStore.test.ts` — Bookmarks | 8 | ✅ | ENH-HP-008 |
| `useListeningStore.test.ts` — Reset/Defaults | 2 | ✅ | — |
| `listeningApi.test.ts` | 7 | ✅ | HP-006, ERR-002, ERR-003 |
| **Tổng** | **79** | **✅** | |

### Thiếu Unit Tests (cần bổ sung)

| Component | Cần test | Priority |
|:----------|:---------|:---------|
| `TappableTranscript` | Render đúng số từ, tap callback, ignore punctuation | P1 |
| `DictionaryPopup` integration | Open/close lifecycle, API call trigger, save word flow | P2 |
| `PlayerScreen` integration | selectedWord state, popup integration | P3 |


---

## 🔥 Smoke Test — Quick Verification (Legacy — xem phần chi tiết phía trên)

> Đã được thay thế bởi section **"🔥 Smoke Tests (Critical Path)"** phía trên.
> Giữ lại để tham khảo nhanh.

| # | Test Case | Steps | ☐ PASS? |
|---|-----------|-------|---------|
| SMK-LIS-001 | Mở ConfigScreen | Dashboard → Tap 🎧 Luyện nghe | ☐ |
| SMK-LIS-002 | Chọn topic + Start | Chọn topic bất kỳ → Chọn duration → Tap "Bắt đầu" | ☐ |
| SMK-LIS-003 | Audio phát được | Đợi generate → Audio bắt đầu phát → Nghe được tiếng | ☐ |
| SMK-LIS-004 | Play/Pause hoạt động | Tap ⏸️ → Audio dừng → Tap ▶️ → Audio tiếp | ☐ |
| SMK-LIS-005 | Transcript hiển thị | Scroll transcript → Chữ hiện → Highlight câu đang phát | ☐ |
| SMK-LIS-006 | Speed control | Tap speed → Chọn 1.5x → Audio nhanh hơn | ☐ |
| SMK-LIS-007 | Bookmark câu | Long press câu → ⭐ hiện ra → Toast xác nhận | ☐ |
| SMK-LIS-008 | Tap từ tra nghĩa | Tap từ trong transcript → Dictionary popup hiện | ☐ |
| SMK-LIS-009 | Back về config | Tap Back → Config screen hiện, không crash | ☐ |

---

## 🐵 Monkey Test — Random Interaction

> **Mục đích:** Phát hiện crash, freeze, memory leak bằng thao tác ngẫu nhiên.
> **Mindset:** "Như đứa trẻ 3 tuổi bấm lung tung" — không theo flow nào cả.
> **Thời gian:** 15-20 phút mỗi session
> **Cách report:** Nếu crash/freeze → ghi lại (1) thao tác cuối, (2) screenshot/recording, (3) device logs

### Config Screen Chaos

| ID | Kỹ thuật | Thao tác | Cần kiểm tra |
|:---|:---------|:---------|:-------------|
| MKY-LIS-001 | Rapid Tap | Tap "Bắt đầu" liên tục 15-20 lần cực nhanh | Không gọi API trùng, không crash, loading chỉ hiện 1 lần |
| MKY-LIS-002 | Fast Switch | Đổi topic liên tục: Coffee → Hotel → Airport → ... 10 lần trong 5s | Topic cuối cùng được giữ đúng, không lag |
| MKY-LIS-003 | Duration Spam | Chọn 5 → 10 → 15 → 5 → custom → 7 → 10 cực nhanh | Duration cuối đúng, config merge không lỗi |
| MKY-LIS-004 | Dismiss Spam | Mở TopicPicker → Đóng → Mở → Đóng 10 lần | Modal animation mượt, không memory leak |
| MKY-LIS-005 | Back Frenzy | Config → Tap Start → Lập tức tap Back → Lặp 5 lần | Không crash, API call cancel đúng, state clean |

### Player Screen Chaos

| ID | Kỹ thuật | Thao tác | Cần kiểm tra |
|:---|:---------|:---------|:-------------|
| MKY-LIS-006 | Play/Pause Spam | Tap play/pause 30 lần liên tục cực nhanh | Audio state đúng, không lỗi race condition |
| MKY-LIS-007 | Multi-gesture | Vừa swipe left, vừa tap transcript, vừa long press | Không crash, gesture không conflict |
| MKY-LIS-008 | Seek Crazy | Kéo seek bar qua lại liên tục 20 lần | Audio nhảy đúng, progress bar sync |
| MKY-LIS-009 | Bookmark Storm | Long press → nhả → long press câu khác → lặp 10 câu liên tiếp | Bookmark state đúng, API gọi đúng, ⭐ icon hiện đúng |
| MKY-LIS-010 | Dictionary Overload | Tap từ 1 → popup → tap từ 2 → tap từ 3 → 10 từ liên tục | Popup cập nhật, không leak, API không dồn |
| MKY-LIS-011 | Speed Cycling | Đổi speed: 0.5 → 0.75 → 1 → 1.25 → 1.5 → 2 → 0.5 liên tục | Audio speed đúng, display badge cập nhật |
| MKY-LIS-012 | Screen Rotation | Xoay ngang → dọc → ngang trong khi audio đang phát | Layout không vỡ, audio không dừng |
| MKY-LIS-013 | Interrupt Storm | Đang phát → Home → quay lại → Control Center → quay lại | Audio resume, state không mất |

---

## 📱 Manual Test on Device — Hardware & UX

> **Mục đích:** Test các tính năng cần device thật: audio, haptic, gesture, background.
> **Device yêu cầu:** iPhone (iOS 16+), Android (API 28+)
> **Pre-conditions:** Đăng nhập thành công, có kết nối mạng

### A. Audio Quality & Routing

| ID | Scenario | Steps trên Device | Expected | iOS | Android |
|:---|:---------|:-------------------|:---------|:----|:--------|
| DEV-LIS-001 | Phát qua loa ngoài | 1. Không cắm tai nghe<br>2. Play audio | Âm thanh rõ ràng qua loa ngoài | ☐ | ☐ |
| DEV-LIS-002 | Phát qua tai nghe có dây | 1. Cắm tai nghe 3.5mm/Lightning<br>2. Play audio | Âm thanh chuyển sang tai nghe | ☐ | ☐ |
| DEV-LIS-003 | Phát qua Bluetooth | 1. Kết nối AirPods/BT speaker<br>2. Play audio | Âm thanh route qua BT thiết bị | ☐ | ☐ |
| DEV-LIS-004 | Rút tai nghe → Pause | 1. Đang phát qua tai nghe<br>2. Rút tai nghe | Audio pause ngay. KHÔNG phát loa ngoài | ☐ | ☐ |
| DEV-LIS-005 | Volume control | 1. Đang phát<br>2. Nhấn nút volume +-<br>3. Dùng Control Center | Volume điều chỉnh đúng, không lag | ☐ | ☐ |

### B. Background & Lock Screen

| ID | Scenario | Steps trên Device | Expected | iOS | Android |
|:---|:---------|:-------------------|:---------|:----|:--------|
| DEV-LIS-006 | Background playback | 1. Đang phát audio<br>2. Nhấn Home button | Audio vẫn phát, app vào background | ☐ | ☐ |
| DEV-LIS-007 | Lock screen controls | 1. Đang phát → Lock screen<br>2. Kiểm tra Now Playing | Hiện: tên bài, progress, nút play/pause/next | ☐ | ☐ |
| DEV-LIS-008 | Notification Center | 1. Đang phát → kéo xuống Notification Center | Media controls hiện, tap play/pause hoạt động | ☐ | ☐ |
| DEV-LIS-009 | Cuộc gọi đến | 1. Đang phát<br>2. Nhận cuộc gọi<br>3. Cúp máy | Audio pause → resume sau cuộc gọi | ☐ | ☐ |
| DEV-LIS-010 | Alarm/Timer kêu | 1. Đang phát<br>2. Alarm kêu<br>3. Tắt alarm | Audio duck/pause → resume | ☐ | ☐ |

### C. Haptic & Gesture (cần cảm nhận tay)

| ID | Scenario | Steps trên Device | Expected | iOS | Android |
|:---|:---------|:-------------------|:---------|:----|:--------|
| DEV-LIS-011 | Long press haptic | 1. Long press câu transcript | Cảm nhận haptic medium (rung nhẹ) khi bookmark | ☐ | ☐ |
| DEV-LIS-012 | Swipe left/right | 1. Swipe left trên player area<br>2. Swipe right | Nhảy câu trước/sau + haptic light | ☐ | ☐ |
| DEV-LIS-013 | Double tap play/pause | 1. Double tap giữa player | Toggle play/pause + haptic | ☐ | ☐ |
| DEV-LIS-014 | Swipe down minimize | 1. Swipe down trên full player | Player minimize + spring animation | ☐ | ☐ |

### D. Network Edge Cases (cần tắt/bật mạng)

| ID | Scenario | Steps trên Device | Expected | iOS | Android |
|:---|:---------|:-------------------|:---------|:----|:--------|
| DEV-LIS-015 | Tắt mạng khi generate | 1. Tap Start → Đang loading<br>2. Bật Airplane mode | Hiện error toast, không crash, retry available | ☐ | ☐ |
| DEV-LIS-016 | Tắt mạng khi bookmark | 1. Long press bookmark câu<br>2. Tắt WiFi | ⭐ hiện (optimistic) → rollback khi API fail → toast lỗi | ☐ | ☐ |
| DEV-LIS-017 | Mạng yếu (3G) | 1. Chuyển sang 3G/Edge<br>2. Generate bài mới | Loading lâu hơn nhưng không timeout sớm | ☐ | ☐ |

### E. Memory & Performance

| ID | Scenario | Steps trên Device | Expected | iOS | Android |
|:---|:---------|:-------------------|:---------|:----|:--------|
| DEV-LIS-018 | Session dài 30 phút | 1. Generate bài 15 phút<br>2. Nghe hết | Không lag, memory không tăng quá 100MB | ☐ | ☐ |
| DEV-LIS-019 | Multiple sessions | 1. Generate bài 1 → nghe → back<br>2. Generate bài 2 → nghe → back<br>3. Lặp 5 lần | Không memory leak, mỗi session state clean | ☐ | ☐ |

---

## 🔄 E2E Test — Full User Flows

> **Mục đích:** Verify luồng end-to-end hoàn chỉnh của user.
> **Công cụ đề xuất:** Detox / Maestro (hoặc manual trên device)

### Flow 1: First-time Listening Session

```
Dashboard → Tap Luyện nghe → Chọn topic "Coffee Shop"
→ Chọn duration 10 min → Tap "Bắt đầu"
→ Đợi loading → Audio bắt đầu phát
→ Transcript hiện → Highlight sync
→ Tap pause → Tap play → Hoạt động đúng
→ Back → Config screen hiện
```

| Step | Expected | ☐ |
|------|----------|---|
| 1. Dashboard → Listening | ConfigScreen render | ☐ |
| 2. Chọn topic + duration | Config state cập nhật | ☐ |
| 3. Tap Start | Loading → API call → PlayerScreen | ☐ |
| 4. Audio phát | TrackPlayer track loaded, đang phát | ☐ |
| 5. Transcript sync | Highlight câu đúng theo timestamp | ☐ |
| 6. Pause/Play | Audio toggle chính xác | ☐ |
| 7. Back | Navigate về Config, audio dừng | ☐ |

### Flow 2: Bookmark Complete Flow

```
PlayerScreen → Long press câu 3 → ⭐ hiện, toast "Đã bookmark"
→ Long press câu 7 → ⭐ hiện
→ Long press câu 3 lần nữa → ⭐ mất, toast "Đã bỏ bookmark"
→ Verify: câu 7 vẫn còn ⭐, câu 3 không còn
```

| Step | Expected | ☐ |
|------|----------|---|
| 1. Long press câu 3 | ⭐ icon hiện, haptic, toast success | ☐ |
| 2. Long press câu 7 | ⭐ icon hiện, haptic, toast success | ☐ |
| 3. Long press câu 3 lại | ⭐ biến mất, toast "Đã bỏ" | ☐ |
| 4. Verify state | Câu 7 có ⭐, câu 3 không | ☐ |

### Flow 3: Dictionary + Save Word Flow

```
PlayerScreen → Tap từ "serendipity" → Popup hiện
→ Xem nghĩa VN, IPA → Tap Save → Toast "Đã lưu"
→ Tap từ khác "delightful" → Popup cập nhật
→ Đóng popup → Tiếp tục nghe
```

| Step | Expected | ☐ |
|------|----------|---|
| 1. Tap từ | DictionaryPopup hiện với nghĩa | ☐ |
| 2. Xem IPA + nghĩa | Dữ liệu hiển thị chính xác | ☐ |
| 3. Save từ | Toast confirm, từ vào savedWords | ☐ |
| 4. Tap từ khác | Popup cập nhật, không đóng rồi mở lại | ☐ |
| 5. Đóng popup | Audio tiếp tục (nếu đang phát) | ☐ |

### Flow 4: TTS Provider Switch

```
ConfigScreen → Chọn Azure TTS → Chọn voice "Jenny"
→ Start session → Audio phát bằng Azure voice
→ Back → Đổi sang OpenAI + voice "Alloy"
→ Start session mới → Audio phát bằng OpenAI voice
```

| Step | Expected | ☐ |
|------|----------|---|
| 1. Chọn Azure + Jenny | Store cập nhật ttsProvider/voice | ☐ |
| 2. Start → Audio | API body chứa ttsProvider: azure, voice: jenny | ☐ |
| 3. Đổi OpenAI + Alloy | Store cập nhật | ☐ |
| 4. Start lại | API body chứa ttsProvider: openai, voice: alloy | ☐ |

### Flow 5: Interrupted Session Recovery

```
PlayerScreen đang phát → Home button → Đợi 1 phút
→ Quay lại app → Audio resume
→ Lock screen → Dùng lock screen controls
→ Unlock → Quay lại app → State đúng
```

| Step | Expected | ☐ |
|------|----------|---|
| 1. Home → Background | Audio tiếp tục phát | ☐ |
| 2. Quay lại app | Audio vẫn phát, UI sync đúng vị trí | ☐ |
| 3. Lock screen controls | Play/Pause/Next hoạt động | ☐ |
| 4. Unlock → App | Progress bar, highlight text đúng | ☐ |

### Flow 6: Error Recovery

```
ConfigScreen → Tắt WiFi → Tap Start → Error toast
→ Bật WiFi → Tap Start → Generate thành công
→ Đang phát → Tắt WiFi → Audio vẫn phát (đã cache)
→ Từ điển: Tap từ → Error "Không có mạng"
```

| Step | Expected | ☐ |
|------|----------|---|
| 1. No WiFi + Start | Error toast, config giữ nguyên | ☐ |
| 2. WiFi on + Start | Generate thành công | ☐ |
| 3. WiFi off khi phát | Audio cache vẫn phát | ☐ |
| 4. Tap từ offline | Dictionary error toast | ☐ |


---

## 📊 Unit Test Coverage Summary

> **Cập nhật:** 2026-02-13 — **79/79 PASS** ✅

### Store Tests (`useListeningStore.test.ts`) — 50 tests

| Group | # Tests | Status | Covers |
|:---|:---|:---|:---|
| Config | 7 | ✅ | topic, duration, level, speakers, keywords, merge |
| Topic Selection | 4 | ✅ | setSelectedTopic, category, subcategory |
| Favorites | 3 | ✅ | toggleFavorite, multiple scenarios |
| Playback | 6 | ✅ | play/pause, exchangeIndex, speed, setPlaying |
| Conversation | 2 | ✅ | setConversation, null |
| Audio State | 4 | ✅ | audioUrl, generatingAudio, timestamps |
| Reset | 1 | ✅ | reset to defaults |
| Generating | 1 | ✅ | isGenerating state |
| Defaults | 1 | ✅ | initial state verification |
| Saved Words | 5 | ✅ | add, dedupe, remove, reset |
| TTS Provider | 7 | ✅ | provider set/toggle, voice set/null, defaults, reset |
| Bookmarks | 9 | ✅ | toggle add/remove, multiple, selective remove, setFromServer, reset |

### Hook Tests (`useDictionary.test.ts`) — 7 tests

| Group | # Tests | Status | Covers |
|:---|:---|:---|:---|
| Lookup success | 1 | ✅ | API call, result mapping |
| Loading state | 1 | ✅ | isLoading toggle |
| Error 404 | 1 | ✅ | Not found message |
| Network error | 1 | ✅ | Error message |
| Clear | 1 | ✅ | Reset state |
| Empty word | 1 | ✅ | Skip API call |
| Special chars | 1 | ✅ | Clean punctuation |

### API Tests (`listeningApi.test.ts`) — 22 tests

| Group | # Tests | Status | Covers |
|:---|:---|:---|:---|
| generateConversation | 5 | ✅ | mapping, clamping, vocabulary, errors |
| generateScenario | 3 | ✅ | scenario call, customContext |
| generateConversationAudio | 5 | ✅ | ttsProvider, voice, no-options, response, format |
| bookmarkApi | 9 | ✅ | create, getBySession, delete, deleteByIndex |

```bash
# Chạy toàn bộ Listening tests
cd apps/mobile && npx jest --testPathPatterns="useListeningStore|useDictionary|listeningApi" --verbose
```

---

## 🧪 Smoke Test Checklist (Real Device)

> **Mục đích:** Quick sanity check trước mỗi release — chạy trên device thật, mất **~10 phút**
> **Khi nào chạy:** Sau mỗi PR merge, trước khi build TestFlight/Internal

| # | Test | Steps | Pass Criteria | ⏱️ |
|:---|:---|:---|:---|:---|
| S-01 | App khởi động | Mở app | Splash → Dashboard trong <3s | 30s |
| S-02 | Config → Player flow | Dashboard → Luyện nghe → Chọn topic "Daily" → Bắt đầu nghe | Player mở, audio gen + phát thành công | 60s |
| S-03 | Play/Pause cơ bản | Player → Tap ▶️ → Tap ⏸️ | Audio phát → dừng đúng | 10s |
| S-04 | **Swipe L/R** | Player → Swipe trái → Swipe phải | Nhảy câu trước/tiếp, haptic có rung | 15s |
| S-05 | **Double Tap** | Player → Double tap vùng transcript | Toggle play/pause, haptic có rung | 10s |
| S-06 | **Long Press Bookmark** | Player → Long press 1 câu (~500ms) | Icon ⭐ xuất hiện, toast "Đã lưu bookmark" | 10s |
| S-07 | **TTS Provider chọn** | Advanced Options → Tap Azure → Xem voice list | List thay đổi: Jenny, Guy... (không phải Alloy, Nova) | 15s |
| S-08 | **Voice selection** | Advanced Options → Tắt Random → Chọn 1 voice | Voice highlighted với ✓, lưu lại khi close sheet | 10s |
| S-09 | Speed control | Player → Tap tốc độ 3 lần | Speed badge đổi: 1x → 1.25x → 1.5x | 10s |
| S-10 | Transcript highlight | Player → Phát audio → Theo dõi | Câu đang phát highlight xanh, auto-scroll | 15s |
| S-11 | Back navigation | Player → Tap ← | Confirm dialog → Config screen | 10s |
| S-12 | Dark mode | Settings → Dark mode → Vào Listening | Tất cả UI readable, contrast đủ | 15s |

**Pass/Fail:** ≥ 10/12 → PASS. S-02 hoặc S-03 FAIL → **BLOCK release**

---

## 🖐️ Manual Test Scripts (Real Device)

> **Mục đích:** Test chi tiết từng feature mới — chạy trên device thật, mất **~30 phút**
> **Khi nào chạy:** Khi implement feature mới hoặc fix bug liên quan

### Script M-01: Gesture — Swipe Navigation

**Precondition:** Mở PlayerScreen có audio đang phát, ≥ 5 câu hội thoại

| Step | Action | Expected | Check |
|:---|:---|:---|:---|
| 1 | Xem câu đang highlight (ghi nhớ index) | Highlight xanh ở 1 câu | ☐ |
| 2 | Đặt ngón tay lên vùng transcript, kéo sang **PHẢI** > 50px | Có visual feedback (translate nhẹ theo hướng swipe) | ☐ |
| 3 | Thả tay | Câu highlight nhảy lên câu **TIẾP THEO**, haptic rung nhẹ | ☐ |
| 4 | Kéo sang **TRÁI** > 50px + thả | Câu highlight quay lại câu **TRƯỚC**, haptic rung nhẹ | ☐ |
| 5 | Ở câu ĐẦU TIÊN → swipe trái | Không crash, giữ nguyên ở câu đầu | ☐ |
| 6 | Ở câu CUỐI CÙNG → swipe phải | Không crash, giữ nguyên ở câu cuối | ☐ |
| 7 | Swipe chéo (45 độ) | Không trigger action nào (threshold check) | ☐ |
| 8 | Swipe rất ngắn (~20px) | Không trigger, spring về vị trí cũ | ☐ |
| 9 | Swipe nhanh (flick) velocity > 300px/s | Trigger dù distance < threshold | ☐ |

### Script M-02: Gesture — Swipe Down Minimize

**Precondition:** Mở PlayerScreen

| Step | Action | Expected | Check |
|:---|:---|:---|:---|
| 1 | Kéo xuống > 80px trên vùng transcript | Visual feedback: opacity giảm nhẹ | ☐ |
| 2 | Thả tay | Toast hiện "🔽 Tính năng mini player sẽ sớm ra mắt!" | ☐ |
| 3 | Kéo xuống < 80px + thả | Không trigger, spring về bình thường | ☐ |
| 4 | Kéo ngang 100px rồi đổi hướng xuống | Gesture horizontal thắng (vì lock hướng ngang trước) | ☐ |

### Script M-03: Gesture — Double Tap Play/Pause

**Precondition:** Mở PlayerScreen có audio sẵn sàng

| Step | Action | Expected | Check |
|:---|:---|:---|:---|
| 1 | Audio đang PAUSE → Double tap transcript | Audio BẮT ĐẦU phát, haptic rung nhẹ | ☐ |
| 2 | Audio đang PLAY → Double tap transcript | Audio TẠM DỪNG, haptic rung nhẹ | ☐ |
| 3 | Single tap (1 lần) | KHÔNG toggle play/pause (chỉ double tap mới trigger) | ☐ |
| 4 | Triple tap nhanh | Chỉ trigger 1 lần double tap, không crash | ☐ |
| 5 | Double tap chậm (> 300ms giữa 2 tap) | KHÔNG trigger (quá vượt maxDuration) | ☐ |

### Script M-04: Sentence Bookmark (Long Press)

**Precondition:** Mở PlayerScreen có transcript ≥ 3 câu

| Step | Action | Expected | Check |
|:---|:---|:---|:---|
| 1 | Long press câu #2 (~500ms) | ⭐ Icon xuất hiện, toast "Đã lưu bookmark" | ☐ |
| 2 | Xem câu #2 | Có viền vàng/highlight đặc biệt (bookmarked style) | ☐ |
| 3 | Long press **lại** câu #2 | ⭐ Icon biến mất (toggle off), toast xác nhận | ☐ |
| 4 | Long press câu #1, #3, #5 | Cả 3 câu đều có ⭐, bookmark state đúng | ☐ |
| 5 | Short tap câu đã bookmark | Nhảy đến câu đó (seek), KHÔNG toggle bookmark | ☐ |
| 6 | Tạo bài mới (nhấn 🔄) | Bookmark state reset, không còn ⭐ nào | ☐ |

### Script M-05: TTS Provider Selection

**Precondition:** Mở ConfigScreen → Tuỳ chọn nâng cao

| Step | Action | Expected | Check |
|:---|:---|:---|:---|
| 1 | Mặc định | OpenAI 🤖 chip được chọn (highlight xanh) | ☐ |
| 2 | Tap Azure ☁️ | Azure chip highlight xanh, OpenAI deselect | ☐ |
| 3 | Xem phần giọng đọc | Voice list thay đổi: Jenny, Guy, Aria... | ☐ |
| 4 | Tap lại OpenAI | Voice list quay lại: Alloy, Echo, Fable... | ☐ |
| 5 | Chọn voice "Nova" → đổi sang Azure | Voice reset về null (vì Nova không có trong Azure) | ☐ |
| 6 | Đóng sheet → mở lại | Provider + voice vẫn giữ nguyên | ☐ |

### Script M-06: Voice Selection

**Precondition:** Mở Advanced Options, Random Voice = OFF

| Step | Action | Expected | Check |
|:---|:---|:---|:---|
| 1 | Danh sách 6 voices hiển thị | Mỗi voice có: emoji + label + mô tả | ☐ |
| 2 | Tap "Nova ⭐" | Nova highlight với ✓ checkmark, haptic rung | ☐ |
| 3 | Tap "Shimmer ✨" | Shimmer highlight, Nova deselect | ☐ |
| 4 | BẬT Random Voice toggle | Voice list ẨN (không hiện nữa) | ☐ |
| 5 | TẮT Random Voice toggle | Voice list HIỆN lại, voice trước đó vẫn selected | ☐ |
| 6 | Scroll danh sách (nếu cần) | Scroll mượt trong BottomSheet | ☐ |

---

## 🐒 Monkey Tests (Chaos Testing — Real Device)

> **Mục đích:** Phát hiện crash, memory leak, state corruption bằng cách thao tác ngẫu nhiên, bất thường
> **Mindset:** "Em bé 2 tuổi bấm lung tung" — làm mọi thứ KHÔNG theo luồng
> **Khi nào chạy:** Trước release, sau refactor lớn — mất **~15 phút**

### Monkey M-01: Gesture Chaos

| # | Chaos Action | Pass = Không xảy ra | ⏱️ |
|:---|:---|:---|:---|
| 1 | Swipe liên tục trái-phải 20 lần thật nhanh | ❌ Crash, ❌ UI đông cứng, ❌ index out of range | 30s |
| 2 | Double tap liên tục 10 lần trong 3 giây | ❌ Crash, ❌ audio state bị kẹt (không play được nữa) | 15s |
| 3 | Swipe trái + double tap CÙNG LÚC (2 ngón) | ❌ Crash, ❌ gesture conflict (cả 2 đều trigger) | 10s |
| 4 | Long press + swipe phải cùng lúc | ❌ Crash, chọn 1 action thắng (không cả 2) | 10s |
| 5 | Swipe xuống liên tục 10 lần | ❌ Crash, toast stack không bị tràn | 15s |
| 6 | Xoay màn hình ngang ↔ dọc khi đang swipe | ❌ Crash, UI layout đúng | 10s |
| 7 | Swipe trên vùng controls (bottom bar) | ❌ Gesture lấn sang controls, buttons vẫn hoạt động | 10s |

### Monkey M-02: TTS Settings Chaos

| # | Chaos Action | Pass = Không xảy ra | ⏱️ |
|:---|:---|:---|:---|
| 1 | Toggle OpenAI ↔ Azure 20 lần nhanh | ❌ Crash, voice list luôn đúng provider | 20s |
| 2 | Toggle Random Voice ON↔OFF 15 lần | ❌ Crash, voice list show/hide đúng | 15s |
| 3 | Chọn voice → đổi provider → đổi lại → chọn voice | Voice state nhất quán, không bị "dính" voice cũ | 15s |
| 4 | Mở AdvancedSheet → đóng → mở → đóng x10 | ❌ Crash, ❌ memory leak, animation mượt | 20s |
| 5 | Scroll voice list lên xuống rất nhanh | ❌ Crash, ❌ UI flicker | 10s |
| 6 | Tap tất cả 6 voices liên tục mỗi voice 1 lần | ❌ Crash, voice cuối cùng tap = selected | 15s |
| 7 | Disabled state: đang generate → tap mọi nút | Tất cả disabled, không trigger action nào | 15s |

### Monkey M-03: Bookmark Chaos

| # | Chaos Action | Pass = Không xảy ra | ⏱️ |
|:---|:---|:---|:---|
| 1 | Long press + thả + long press lại cùng câu x10 | ❌ Crash, bookmark toggle đúng (even=on, odd=off) | 20s |
| 2 | Long press 2 câu khác nhau CÙNG LÚC (2 ngón) | ❌ Crash, ít nhất 1 bookmark thành công | 10s |
| 3 | Bookmark tất cả câu (long press mỗi câu) | ❌ Crash, tất cả hiện ⭐ | 30s |
| 4 | Bookmark câu → Seek → Bookmark câu khác → Back | Bookmark state giữ nguyên (không mất) | 15s |
| 5 | Long press scroll đang cuộn nhanh | ❌ Crash, ❌ bookmark nhầm câu | 10s |

### Monkey M-04: Cross-Feature Chaos

| # | Chaos Action | Pass = Không xảy ra | ⏱️ |
|:---|:---|:---|:---|
| 1 | Swipe right → long press → double tap → swipe left | ❌ Crash, mỗi action thực thi đúng thứ tự | 15s |
| 2 | Đang phát audio → mở Advanced Options → đổi provider → đóng | Audio không dừng, settings saved | 15s |
| 3 | Config → chọn Azure → set voice → Start → Player | Audio generate (backend ignore TTS params chưa support) | 30s |
| 4 | Tạo bài mới → bookmark 3 câu → tạo bài mới lại | Bookmark reset, câu mới không có ⭐ | 30s |
| 5 | Kill app (force close) giữa lúc đang phát | Mở lại app không crash, state clean | 15s |
| 6 | Low memory warning → swipe gestures | Gesture vẫn hoạt động, app không bị kill | 10s |
| 7 | Notification banner dropdown khi đang swipe | Swipe cancel mượt, toast notification hiện đúng | 10s |

---

## 🔀 Exploratory Test Scenarios

> **Mục đích:** QA tự do khám phá các luồng không có trong test case — tư duy "phá phách"
> **Tips:** Ghi lại mọi hành vi bất thường vào note, kèm screenshot

### Hướng khám phá:

1. **Gesture + Scroll conflict:** Scroll transcript nhanh lên xuống rồi swipe ngang ngay → Xem scroll và gesture có conflict không
2. **Orientation changes:** Xoay ngang/dọc device khi đang ở Advanced Options sheet → Layout có vỡ không
3. **Accessibility:** Bật VoiceOver (iOS) / TalkBack (Android) → Điều hướng được qua gesture vùng player không
4. **Font size lớn:** Settings → Display → Largest text → Advanced Options → Voice list có bị cắt chữ không
5. **Dark mode transition:** Đổi dark↔light mode khi Advanced Options đang mở → Colors đổi real-time không
6. **Background → Foreground:** Phát audio → Home → Quay lại → Swipe gesture vẫn work?
7. **Multitask split screen (iPad):** Listening player trên split screen → Gesture vẫn nhận diện đúng?
8. **Network switch:** WiFi → 4G → Airplane → WiFi khi đang ở Advanced Options → Có crash không

