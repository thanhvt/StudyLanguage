# 📋 Listening Enhanced — Manual Test Scripts (Sprint 2+3)

> **Mục đích:** Test scripts cho các tính năng Enhanced + Advanced của Listening
> **Đối tượng:** QA tester (device thật)
> **Thời gian:** ~60-90 phút / full run
> **Thiết bị:** iPhone / iPad + Android

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

## Flow 1: Global Player Modes (Sprint 2.1–2.4)

### MAN-ENH-001 ✅ Player Mode — Full → Compact
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Generate bài nghe → vào PlayerScreen | Full player hiện | | |
| 2 | Tap Back (quay về Config hoặc Dashboard) | CompactPlayer hiện ở bottom (mini bar) | | |
| 3 | Kiểm tra CompactPlayer | Hiện: tên bài, waveform animation, nút Play/Pause | | |
| 4 | Audio vẫn phát | ✅ Không bị dừng khi chuyển mode | | |
| 5 | Tap vào CompactPlayer | Navigate lại PlayerScreen (Full mode) | | |

### MAN-ENH-002 ✅ Player Mode — Compact → Minimized
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | CompactPlayer đang hiện | OK | | |
| 2 | Swipe down trên CompactPlayer | Chuyển thành MinimizedPlayer (FAB nhỏ) | | |
| 3 | Kiểm tra MinimizedPlayer | Nút tròn/pill nhỏ, có icon Play/Pause | | |
| 4 | Kéo MinimizedPlayer xung quanh màn hình | Draggable, snap vào các vị trí | | |
| 5 | Tap MinimizedPlayer | Quay lại Full player | | |

### MAN-ENH-003 ⚠️ Player Mode — Hidden
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Đang phát audio + ở Compact mode | OK | | |
| 2 | Stop audio hoàn toàn (nếu có nút) | Player ẩn, không hiện Compact/Minimized | | |
| 3 | Navigate qua app | Không thấy player ở bất kỳ screen nào | | |

---

## Flow 2: Session Restoration (Sprint 2.6)

### MAN-ENH-004 ✅ Banner "Tiếp tục nghe"
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Generate bài nghe + phát audio 1 phần | OK | | |
| 2 | Kill app (swipe up từ app switcher) | App đóng | | |
| 3 | Mở lại app → navigate tới Listening Config | Kiểm tra có banner "Tiếp tục nghe" | | |
| 4 | Banner hiện đúng info | Tên bài nghe (topic), thời lượng | | |
| 5 | Tap banner "Tiếp tục nghe" | Navigate tới PlayerScreen, audio resume | | |

### MAN-ENH-005 ⚠️ Session hết hạn
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Generate bài → đóng app | OK | | |
| 2 | Đợi lâu (hoặc clear AsyncStorage nếu dev mode) | Session cũ hết | | |
| 3 | Mở lại app → Config screen | Không hiện banner "Tiếp tục nghe" | | |

---

## Flow 3: TTS Emotion & Prosody (Sprint 2.7)

### MAN-ENH-006 ✅ Mở Advanced Options Sheet
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | ConfigScreen → tìm nút Advanced / ⚙️ | Nút hiện | | |
| 2 | Tap mở Advanced Options | Bottom sheet mở, slide up smooth | | |
| 3 | Kiểm tra sections | Có: Emotion, Pitch, Rate, Volume | | |

### MAN-ENH-007 ✅ Chọn Emotion Style
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Mở Advanced Options | Sheet mở | | |
| 2 | Kiểm tra Emotion pills | 6 options: Default, Cheerful, Sad, Angry, Fearful, Friendly | | |
| 3 | Tap **Cheerful** | Pill "Cheerful" highlighted | | |
| 4 | Tap **Angry** | Pill "Angry" highlighted, Cheerful unhighlight | | |
| 5 | Default khi mới mở | "Default" pre-selected | | |
| 6 | Generate bài → nghe audio | Giọng đọc có cảm xúc tương ứng (nếu backend hỗ trợ) | | |

### MAN-ENH-008 ✅ Prosody Sliders (Pitch / Rate / Volume)
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Mở Advanced Options | Sheet mở | | |
| 2 | Tìm slider **Pitch** | Slider hiện, giá trị default = 0% | | |
| 3 | Kéo Pitch sang phải (+20%) | Giá trị cập nhật "20%", haptic | | |
| 4 | Kéo Pitch sang trái (-15%) | Giá trị cập nhật "-15%" | | |
| 5 | Tìm slider **Rate** | Default = 0% | | |
| 6 | Kéo Rate lên +10% | Giá trị cập nhật | | |
| 7 | Tìm slider **TTS Volume** | Default = 100% | | |
| 8 | Kéo Volume xuống 50% | Giá trị cập nhật "50%" | | |
| 9 | Generate bài → nghe | Audio phản ánh pitch/rate/volume settings | | |

---

## Flow 4: Radio Mode (Sprint 2.8 + 3.3)

### MAN-ENH-009 ✅ Mở Radio Mode từ Config
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | ConfigScreen → tìm nút 📻 "Radio Mode" | Nút hiện ở footer | | |
| 2 | Tap nút Radio | Navigate tới RadioScreen | | |
| 3 | Kiểm tra header | "📻 Radio Mode" + nút Back | | |
| 4 | Kiểm tra Phase 1 UI | Tiêu đề "Nghe thụ động", 4 duration options | | |

### MAN-ENH-010 ✅ Chọn Duration trong Radio
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Kiểm tra 4 options | ⚡ 1 phút, 🎧 30 phút, 📻 60 phút, 🎵 120 phút | | |
| 2 | Default selection | 30 phút pre-selected (primary border) | | |
| 3 | Tap **1 phút** | Option "1 phút" highlighted, có ✓ check icon | | |
| 4 | Tap **120 phút** | Option "120 phút" highlighted | | |
| 5 | Kiểm tra haptic | Mỗi tap có rung nhẹ | | |

### MAN-ENH-011 ✅ Generate Radio Playlist
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Chọn 1 phút (để test nhanh) | Option "1 phút" selected | | |
| 2 | Tap **📻 Bắt đầu Radio** | Loading "🔄 Đang tạo playlist..." | | |
| 3 | Đợi generate xong (5-30s) | Toast "Playlist sẵn sàng!", Phase 2 hiện | | |
| 4 | Kiểm tra playlist header | Tên playlist, số bài, duration, mô tả | | |
| 5 | Kiểm tra track list | FlatList hiện danh sách tracks với: số thứ tự, topic, số câu, số người, category | | |

### MAN-ENH-012 ✅ Phát Track trong Radio
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Playlist đã sẵn sàng | Track list hiện | | |
| 2 | Tap track #1 | Loading spinner ở track #1, đang sinh audio | | |
| 3 | Audio sinh xong | Icon 🔊 hiện, audio bắt đầu phát | | |
| 4 | Track #1 highlight | Background primary/10, border primary/30 | | |
| 5 | Tap track #3 (skip) | Track #3 bắt đầu gen + phát, #1 unhighlight | | |

### MAN-ENH-013 ✅ Radio Continuous Playback (Auto-next)
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Phát track #1, đợi hết bài | Audio kết thúc | | |
| 2 | Auto chuyển track #2 | Tự động gen audio + phát track tiếp theo | | |
| 3 | FlatList auto-scroll | Scroll tới track đang phát | | |
| 4 | Phát hết playlist | Console log "Playlist đã phát hết", isPlaying = false | | |

### MAN-ENH-014 ✅ Tạo Playlist Mới
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Playlist đã hiện | OK | | |
| 2 | Tap **🔄 Tạo playlist mới** (bottom button) | Quay về Phase 1 (duration picker) | | |
| 3 | Chọn duration khác → Generate | Playlist MỚI với topics khác | | |

### MAN-ENH-015 ❌ Radio lỗi khi mất mạng
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Tắt WiFi + Mobile Data | Offline | | |
| 2 | Tap "Bắt đầu Radio" | Error toast "Không thể tạo playlist" | | |
| 3 | Kiểm tra UI | Nút retry hoặc error state hiện | | |
| 4 | Bật mạng lại → thử lại | Generate thành công | | |

---

## Flow 5: Pocket Mode (Sprint 3.1)

### MAN-ENH-016 ✅ Bật Pocket Mode
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Vào PlayerScreen (đã generate bài) | OK | | |
| 2 | Tìm nút 🌙 Moon ở header (góc phải) | Nút Moon hiện | | |
| 3 | Tap nút Moon | Màn hình chuyển ĐEN hoàn toàn, StatusBar ẩn | | |
| 4 | Kiểm tra visual | Toàn bộ màn hình đen, không có UI element nào | | |

### MAN-ENH-017 ✅ Gesture — Play/Pause (vùng giữa)
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Pocket Mode đang bật, audio đang phát | OK | | |
| 2 | Tap vào VÙNG GIỮA màn hình | Audio pause, haptic medium, flash "⏸ Tạm dừng" | | |
| 3 | Tap vào VÙNG GIỮA lần nữa | Audio resume, flash "▶️ Tiếp tục" | | |
| 4 | Text flash | Hiện rồi fade out trong ~1.2 giây | | |

### MAN-ENH-018 ✅ Gesture — Seek Back (vùng trên)
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Audio đang phát | OK | | |
| 2 | Tap vào VÙNG TRÊN (⅓ trên cùng) | Audio seek lùi 15 giây, flash "⏪ -15s" | | |
| 3 | Tap lại vùng trên | Lùi thêm 15 giây | | |
| 4 | Tap khi đang ở đầu bài (< 15s) | Seek về 0:00 (không crash) | | |

### MAN-ENH-019 ✅ Gesture — Seek Forward (vùng dưới)
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Audio đang phát | OK | | |
| 2 | Tap vào VÙNG DƯỚI (⅓ dưới cùng) | Audio seek tới 15 giây, flash "⏩ +15s" | | |
| 3 | Tap lại vùng dưới | Tiến thêm 15 giây | | |
| 4 | Tap khi gần cuối bài | Seek tới cuối (không crash) | | |

### MAN-ENH-020 ✅ Thoát Pocket Mode (Double-tap)
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Pocket Mode đang bật | Màn hình đen | | |
| 2 | Double-tap (2 tap nhanh) BẤT KỲ ĐÂU | Thoát Pocket Mode, PlayerScreen hiện lại | | |
| 3 | StatusBar hiện lại | ✅ | | |
| 4 | Audio vẫn tiếp tục | Không bị dừng khi thoát | | |
| 5 | Haptic khi thoát | Heavy haptic feedback | | |

### MAN-ENH-021 ⚠️ Pocket Mode — Bỏ túi thật
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Bật Pocket Mode + audio đang phát | OK | | |
| 2 | Bỏ điện thoại vào túi quần | Màn hình proximity sensor sẽ tắt | | |
| 3 | Nghe audio qua tai nghe | Audio phát liên tục, không bị gián đoạn | | |
| 4 | Lấy điện thoại ra | Màn hình đen (Pocket Mode), tap 2 lần để thoát | | |

---

## Flow 6: Custom Scenarios Backend Sync (Sprint 3.2)

### MAN-ENH-022 ✅ Tạo Custom Scenario mới
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | ConfigScreen → TopicPicker → tab Custom | Panel "✨ Tạo kịch bản mới" hiện | | |
| 2 | Nhập tên: "Interview tại Google" | Text hiện đúng | | |
| 3 | Nhập mô tả: "Phỏng vấn vị trí SWE" | Text hiện đúng | | |
| 4 | Tap **💾 Lưu lại** | Loading → Toast "Đã lưu kịch bản" | | |
| 5 | Scenario hiện trong danh sách "Đã lưu" | Tên + mô tả hiện đúng | | |
| 6 | Form reset (name + desc trống) | ✅ | | |

### MAN-ENH-023 ✅ Sử dụng Custom Scenario ngay
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Nhập tên: "Họp sprint" | OK | | |
| 2 | Tap **⚡ Sử dụng ngay** | onQuickUse callback gọi, form reset | | |
| 3 | Kiểm tra topic trong Config | Topic = "Họp sprint" | | |

### MAN-ENH-024 ✅ Tap Scenario đã lưu → Sử dụng
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Có scenario đã lưu trong danh sách | OK | | |
| 2 | Tap vào scenario | onQuickUse gọi với name + description | | |
| 3 | Topic field cập nhật | ✅ | | |

### MAN-ENH-025 ✅ Toggle Favorite
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Có scenario đã lưu | OK | | |
| 2 | Tap ☆ (unfavorited) | Đổi thành ⭐ (favorited), API gọi PATCH | | |
| 3 | Tap ⭐ lần nữa | Đổi lại ☆ (unfavorited) | | |

### MAN-ENH-026 ✅ Xoá Custom Scenario
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Có scenario đã lưu | OK | | |
| 2 | Tap icon 🗑️ | Dialog confirm "Xoá kịch bản?" hiện | | |
| 3 | Tap **Xoá** | Scenario biến mất, toast "Đã xoá" | | |
| 4 | Kiểm tra: scenario đã xoá không hiện lại | ✅ | | |

### MAN-ENH-027 ❌ Custom Scenarios offline
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Tắt mạng | Offline | | |
| 2 | Mở Custom Scenario panel | Danh sách không load (loading spinner hoặc trống) | | |
| 3 | Nhập tên → Tap "Lưu lại" | Toast error "Lỗi lưu kịch bản" | | |
| 4 | Bật mạng → thử lại | Lưu thành công | | |

---

## Flow 7: Audio Change Confirmation (Sprint 2.5)

### MAN-ENH-028 ⚠️ Confirm khi generate bài mới (đang phát)
| # | Bước | Expected | P/F | Bug ID |
|:-:|------|----------|:---:|--------|
| 1 | Đang phát audio từ bài trước | CompactPlayer hiện | | |
| 2 | Config screen → chọn topic mới → "Bắt đầu nghe" | Dialog confirm hiện | | |
| 3 | Dialog hỏi | "Bạn đang nghe bài cũ. Muốn tạo bài mới?" | | |
| 4 | Tap **Huỷ** | Dialog đóng, audio cũ vẫn phát | | |
| 5 | Tap **Đồng ý** | Audio cũ dừng, generate bài mới | | |

---

## Bảng tổng kết

| Flow | Tests | Pass | Fail | Skip |
|------|:-----:|:----:|:----:|:----:|
| 1. Global Player Modes | 3 | | | |
| 2. Session Restoration | 2 | | | |
| 3. TTS Emotion & Prosody | 3 | | | |
| 4. Radio Mode | 7 | | | |
| 5. Pocket Mode | 6 | | | |
| 6. Custom Scenarios | 6 | | | |
| 7. Audio Change Confirm | 1 | | | |
| **TOTAL** | **28** | | | |

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
> **Pocket Mode:** Nên test với tai nghe để kiểm tra trải nghiệm thật.
> **Radio Mode:** Test nhanh bằng 1 phút, test full bằng 30 phút.
> **Khi fail:** Chụp screenshot + ghi steps reproduce + device info → tạo bug ticket.
