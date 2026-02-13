# 📋 Listening — Manual Test Scripts (Device Thật)

> **Mục đích:** Step-by-step test scripts chi tiết cho QA chạy trên device thật.
> **Đối tượng:** QA tester (không cần biết code).
> **Thời gian:** ~60-90 phút / full run
> **Thiết bị:** iPhone + Android phone thật

---

## Quy ước

| Icon | Loại test |
|------|-----------|
| ✅ | Happy Path |
| ⚠️ | Edge Case |
| ❌ | Error State |

| Cột | Ý nghĩa |
|-----|---------|
| **P/F** | Pass / Fail |
| **Bug ID** | Nếu fail, ghi ticket ID |

---

## Flow 1: Configuration Screen

### MAN-LIS-001 ✅ Mở Listening từ Dashboard
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Mở app, login (nếu cần) | Dashboard hiện | | |
| 2 | Tap card **🎧 Luyện nghe** | Config screen mở, animation slide từ phải | | |
| 3 | Kiểm tra header | Title "Cấu hình bài nghe" hoặc tương đương | | |
| 4 | Kiểm tra sections hiện | Topic, Duration, Level, Speakers, Keywords | | |

### MAN-LIS-002 ✅ Chọn Topic từ TopicPicker
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Tap vào khu vực Topic | TopicPicker hiện (modal hoặc inline) | | |
| 2 | Scroll qua các categories (IT, Daily, Personal, ...) | Tab chuyển mượt, topics load đúng | | |
| 3 | Tap vào 1 subcategory | SubCategory expand hiện danh sách topics | | |
| 4 | Tap chọn 1 topic (VD: "Daily Stand-up Update") | Topic hiện tag selected, nút Bắt đầu enable | | |
| 5 | Kiểm tra text topic hiện ở Config screen | Tên topic hiển thị đúng | | |

### MAN-LIS-003 ✅ Chọn Duration Preset
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Tìm khu vực Duration trên Config screen | Hiện 3 pill: 5, 10, 15 + icon ✏️ | | |
| 2 | Tap pill **5** | Pill "5" highlighted (primary color) | | |
| 3 | Tap pill **10** | Pill "10" highlighted, "5" unhighlight | | |
| 4 | Tap pill **15** | Pill "15" highlighted | | |
| 5 | Kiểm tra haptic feedback | Mỗi tap có rung nhẹ (light haptic) | | |

### MAN-LIS-004 ✅ Custom Duration (Picker Sheet)
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Tap icon ✏️ (bút chì) bên cạnh pills | Bottom sheet picker mở, slide up smooth | | |
| 2 | Kiểm tra header sheet | "Chọn thời lượng" + subtitle "5 đến 60 phút" | | |
| 3 | Scroll danh sách | Giá trị 5-60 hiện, scroll mượt | | |
| 4 | Kiểm tra các giá trị phổ biến | 5, 10, 15 có badge "phổ biến" | | |
| 5 | Tap chọn **25** | Sheet đóng, badge "25 phút" hiện bên cạnh label | | |
| 6 | Tap ✏️ lại | Sheet mở, scroll tới 25 (đang selected) | | |
| 7 | Tap nút **X** đóng sheet | Sheet đóng, giá trị không đổi | | |
| 8 | Tap backdrop (vùng tối) | Sheet đóng | | |

### MAN-LIS-005 ✅ Chọn Level
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Tìm Level selector | 3 option: Beginner, Intermediate, Advanced | | |
| 2 | Tap **Beginner** | Beginner highlighted | | |
| 3 | Tap **Advanced** | Advanced highlighted, Beginner unhighlight | | |
| 4 | Default khi mới mở | Intermediate pre-selected | | |

### MAN-LIS-006 ✅ Chọn Speakers
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Tìm Speakers selector | Option 2, 3, 4 người | | |
| 2 | Tap **3** | Pill "3" highlighted | | |
| 3 | Tap **4** | Pill "4" highlighted | | |
| 4 | Default | 2 pre-selected | | |

### MAN-LIS-007 ✅ Nhập Keywords
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Tap vào Keywords input | Keyboard hiện | | |
| 2 | Gõ "coffee, meeting, deadline" | Text hiển thị đúng | | |
| 3 | Tap Done / Return | Keyboard đóng | | |
| 4 | Kiểm tra text vẫn hiện | "coffee, meeting, deadline" giữ nguyên | | |

### MAN-LIS-008 ✅ Start Generate (Happy Path)
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Đã chọn topic + config xong | Nút "Bắt đầu nghe" enabled | | |
| 2 | Tap **Bắt đầu nghe** | Loading spinner hiện, nút disabled | | |
| 3 | Đợi generate xong (~5-15 giây) | Tự chuyển sang PlayerScreen | | |
| 4 | Kiểm tra PlayerScreen | Transcript hiện danh sách câu hội thoại | | |

### MAN-LIS-009 ❌ Start khi chưa chọn Topic
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Mở Config screen mới (chưa chọn gì) | Nút "Bắt đầu" disabled HOẶC hiện validation | | |
| 2 | Tap nút (nếu enabled) | Toast/alert "Chọn topic trước" | | |
| 3 | Kiểm tra không có API call | Không loading spinner | | |

### MAN-LIS-010 ❌ Start khi mất mạng
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Tắt WiFi + Mobile Data | Thiết bị offline | | |
| 2 | Chọn topic + config xong | Nút Bắt đầu enabled | | |
| 3 | Tap **Bắt đầu** | Loading → Error toast "Cần kết nối mạng" | | |
| 4 | Bật WiFi lại | OK | | |
| 5 | Tap **Bắt đầu** lại | Generate thành công | | |

---

## Flow 2: Player Screen

### MAN-LIS-011 ✅ Kiểm tra Transcript hiển thị
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Từ Config → Generate thành công → PlayerScreen | Transcript hiện | | |
| 2 | Kiểm tra mỗi câu có **speaker name** | VD: "Person A", "Person B" | | |
| 3 | Kiểm tra mỗi câu có **text tiếng Anh** | Câu hội thoại hiển thị | | |
| 4 | Kiểm tra **bản dịch tiếng Việt** (nếu enabled) | Dòng phụ dưới text Anh | | |
| 5 | Scroll transcript | Scroll mượt, không giật | | |

### MAN-LIS-012 ✅ Tap vào câu trong Transcript
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Tap câu thứ 3 trong transcript | Câu 3 highlight | | |
| 2 | Tap câu thứ 1 | Câu 1 highlight, câu 3 unhighlight | | |
| 3 | Kiểm tra currentExchangeIndex cập nhật | Scroll position đúng | | |

### MAN-LIS-013 ✅ Bookmark câu (Long Press)
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Long press câu thứ 2 (~0.5 giây) | Icon ⭐ hiện, haptic medium | | |
| 2 | Long press câu thứ 5 | Câu 5 cũng bookmark, câu 2 vẫn bookmark | | |
| 3 | Long press lại câu thứ 2 | Bỏ bookmark (⭐ mất), haptic | | |
| 4 | Kiểm tra: câu 5 vẫn bookmark | ✅ | | |

### MAN-LIS-014 ✅ Speed Control
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Tìm nút Speed trên PlayerScreen | Hiện tốc độ hiện tại (VD: 1x) | | |
| 2 | Tap → chọn **0.5x** | Speed badge "0.5x" | | |
| 3 | Tap → chọn **1.5x** | Speed badge "1.5x" | | |
| 4 | Tap → chọn **2.0x** | Speed badge "2.0x" | | |
| 5 | Quay về **1.0x** | Speed bình thường | | |

### MAN-LIS-015 ✅ Vocabulary Section
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Scroll xuống dưới transcript | Kiểm tra section Vocabulary | | |
| 2 | Kiểm tra format | Hiện từ + nghĩa (VD: "hello — xin chào") | | |
| 3 | Tap vào 1 từ vựng | Dictionary popup hiện (nếu có) | | |

---

## Flow 3: Scenario Quick Generate

### MAN-LIS-016 ✅ Chọn Scenario chip
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Mở Config screen → scroll tới khu vực Scenarios | Hiện các chip: Restaurant, Hotel, Shopping, ... | | |
| 2 | Tap chip **Restaurant** | Loading → chuyển PlayerScreen | | |
| 3 | Kiểm tra transcript | Hội thoại liên quan đến nhà hàng | | |

### MAN-LIS-017 ✅ Scenario với Custom Context
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Nhập custom context trước khi chọn scenario | VD: "Nhà hàng Nhật, sushi" | | |
| 2 | Tap scenario **Restaurant** | Generate với context tùy chỉnh | | |
| 3 | Kiểm tra transcript | Hội thoại có liên quan đến sushi/Nhật | | |

---

## Flow 4: Audio & TTS (nếu đã tích hợp)

### MAN-LIS-018 ✅ Play Audio TTS
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Sau khi generate xong → PlayerScreen | Nút Play hiện | | |
| 2 | Tap ▶️ Play | Audio bắt đầu phát, progress bar chạy | | |
| 3 | Kiểm tra giọng đọc | Giọng rõ ràng, tự nhiên | | |
| 4 | Kiểm tra transcript highlight sync | Câu đang đọc highlight đúng | | |

### MAN-LIS-019 ✅ Pause & Resume
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Đang phát audio | Audio chạy | | |
| 2 | Tap ⏸️ Pause | Audio dừng đúng vị trí | | |
| 3 | Đợi 5 giây | Không tiếp tục phát | | |
| 4 | Tap ▶️ Play lại | Audio tiếp tục từ vị trí cũ | | |

### MAN-LIS-020 ⚠️ Background Audio
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Đang phát audio | OK | | |
| 2 | Nhấn Home button (minimize app) | Audio tiếp tục phát | | |
| 3 | Kiểm tra Lock Screen | Now Playing controls hiện | | |
| 4 | Tap Pause từ Lock Screen | Audio dừng | | |
| 5 | Mở lại app | PlayerScreen state đúng (paused) | | |

### MAN-LIS-021 ⚠️ Headphone/Bluetooth
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Kết nối tai nghe Bluetooth | OK | | |
| 2 | Phát audio | Audio qua Bluetooth | | |
| 3 | Ngắt Bluetooth | Audio pause (không phát loa ngoài) | | |
| 4 | Kết nối lại | Audio tiếp tục (hoặc cần tap Play) | | |

---

## Flow 5: Navigation & State

### MAN-LIS-022 ✅ Back từ Player → Config giữ state
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Config: Topic = "AI", Duration = 15, Level = Advanced | OK | | |
| 2 | Generate → Player | PlayerScreen hiện | | |
| 3 | Tap Back | Config screen hiện | | |
| 4 | Kiểm tra config | Topic = "AI", Duration = 15, Level = Advanced — giữ nguyên | | |

### MAN-LIS-023 ⚠️ Generate mới sau khi có conversation cũ
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Đã có conversation → Back về Config | OK | | |
| 2 | Đổi topic mới | Topic mới hiện | | |
| 3 | Tap "Bắt đầu" | Loading → conversation MỚI thay thế cũ | | |
| 4 | Kiểm tra transcript | Nội dung mới, không mix với cũ | | |

### MAN-LIS-024 ⚠️ Kill app → Mở lại
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Đang ở PlayerScreen (đã generate) | OK | | |
| 2 | Kill app (swipe up từ app switcher) | App đóng | | |
| 3 | Mở lại app | Về Dashboard (hoặc Config nếu có persist) | | |
| 4 | Navigate lại Listening | Config screen — state reset hoặc restore tùy persist | | |

---

## Flow 6: Dark Mode & Accessibility

### MAN-LIS-025 ✅ Dark mode — Config Screen
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Bật Dark mode (Settings hệ thống) | OK | | |
| 2 | Mở Listening Config screen | Background tối, text sáng | | |
| 3 | Kiểm tra tất cả pills/chips | Đọc được rõ ràng | | |
| 4 | Kiểm tra Duration picker sheet | Background tối, items đọc được | | |
| 5 | Kiểm tra Keywords input | Placeholder + text đọc được | | |

### MAN-LIS-026 ✅ Dark mode — Player Screen
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Mở PlayerScreen trong Dark mode | OK | | |
| 2 | Kiểm tra transcript text | Đọc được, speaker name phân biệt | | |
| 3 | Kiểm tra bản dịch tiếng Việt | Đọc được, có contrast rõ với text Anh | | |
| 4 | Kiểm tra bookmark icon ⭐ | Hiện rõ trên nền tối | | |

### MAN-LIS-027 ⚠️ VoiceOver / TalkBack (Accessibility)
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Bật VoiceOver (iOS) / TalkBack (Android) | OK | | |
| 2 | Navigate qua Config screen | Mỗi element đọc tên rõ ràng | | |
| 3 | Tap Duration pill → VoiceOver đọc | "10 phút, đang chọn" (hoặc tương đương) | | |
| 4 | Navigate PlayerScreen | Transcript câu đọc được | | |

---

## Bảng tổng kết

| Flow | Tests | Pass | Fail | Skip |
|------|:-----:|:----:|:----:|:----:|
| 1. Config Screen | 10 | | | |
| 2. Player Screen | 5 | | | |
| 3. Scenario | 2 | | | |
| 4. Audio & TTS | 4 | | | |
| 5. Navigation | 3 | | | |
| 6. Dark Mode & A11y | 3 | | | |
| **TOTAL** | **27** | | | |

---

## Thông tin test session

| Field | Value |
|-------|-------|
| **Ngày test** | |
| **Người test** | |
| **iOS Device** | |
| **iOS Version** | |
| **Android Device** | |
| **Android Version** | |
| **App Build** | |
| **Env** | Dev / Staging / Prod |

---

> [!IMPORTANT]
> **Trước khi test:** Đảm bảo device có kết nối mạng ổn định, pin > 50%.
> **Khi fail:** Chụp screenshot + ghi steps reproduce + device info → tạo bug ticket.
