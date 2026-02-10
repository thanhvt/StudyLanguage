# 📖 Reading - Test Scenarios

> **Module:** Reading
> **Phase:** MVP → Enhanced
> **Ref:** `docs/mobile/features/04_Reading.md`

---

## MVP Phase

### 1. Configuration Screen

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-READ-MVP-HP-001 | ✅ | Mở Reading screen | 1. Tap 📖 Luyện đọc từ Dashboard | Config screen: Topic, Level, Length hiển thị | 🔴 |
| MOB-READ-MVP-HP-002 | ✅ | Chọn config & bắt đầu | 1. Chọn topic + level<br>2. Tap "Start Reading" | AI generate article → Article view hiển thị | 🔴 |
| MOB-READ-MVP-ERR-001 | ❌ | API generate article lỗi | 1. Start → server timeout | Error + Retry, config giữ nguyên | 🔴 |

### 2. Article View

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-READ-MVP-HP-003 | ✅ | Hiển thị article | 1. Article load xong | Tiêu đề, nội dung, font rõ ràng, dễ đọc | 🔴 |
| MOB-READ-MVP-HP-004 | ✅ | Scroll article | 1. Swipe up/down | Scroll mượt, không lag với bài dài | 🟡 |
| MOB-READ-MVP-HP-005 | ✅ | Font size control | 1. Tap font size button<br>2. Chọn Large | Text tăng size, re-render mượt | 🟡 |

### 3. Tap-to-Translate

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-READ-MVP-HP-006 | ✅ | Tap từ → Dictionary popup | 1. Tap vào từ "unprecedented" | Popup: nghĩa VN, IPA, type (noun/verb), nút 🔊 | 🔴 |
| MOB-READ-MVP-HP-007 | ✅ | Nghe phát âm từ | 1. Tap từ<br>2. Tap 🔊 trong popup | TTS phát âm từ đó | 🟡 |
| MOB-READ-MVP-HP-008 | ✅ | Save từ | 1. Tap từ<br>2. Tap "Save" | Từ lưu vào Saved Words, toast confirm | 🟡 |
| MOB-READ-MVP-HP-009 | ✅ | Dismiss popup | 1. Tap bên ngoài popup | Popup đóng smooth | 🟢 |
| MOB-READ-MVP-EC-001 | ⚠️ | Tap từ khi popup đang mở | 1. Tap từ A → popup mở<br>2. Tap từ B | Popup switch sang từ B, không mở 2 popup | 🟡 |
| MOB-READ-MVP-EC-002 | ⚠️ | Tap từ có ký tự đặc biệt | 1. Tap "don't" hoặc "it's" | Popup tra cả từ gốc: "don't" → do not | 🟡 |
| MOB-READ-MVP-EC-003 | ⚠️ | Tap từ viết hoa | 1. Tap "United" (đầu câu) | Tra đúng nghĩa, không bị ảnh hưởng uppercase | 🟡 |

### 4. Reading Practice (Quiz)

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-READ-MVP-HP-010 | ✅ | Start quiz sau đọc bài | 1. Đọc xong article<br>2. Tap "Take Quiz" | Quiz screen: câu hỏi comprehension + answer choices | 🔴 |
| MOB-READ-MVP-HP-011 | ✅ | Chọn đáp án & submit | 1. Chọn đáp án A<br>2. Tap "Submit" | Kết quả hiển thị: ✅ Correct / ❌ Wrong + giải thích | 🔴 |
| MOB-READ-MVP-HP-012 | ✅ | Quiz score summary | 1. Hoàn thành tất cả câu hỏi | Summary: X/Y correct, overall %, review wrong answers | 🟡 |
| MOB-READ-MVP-EC-004 | ⚠️ | Đổi đáp án trước khi submit | 1. Chọn A → chọn B → Submit | Hệ thống ghi nhận B là đáp án cuối | 🟡 |

---

## Enhanced Phase

### 5. Focus Mode

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-READ-ENH-HP-001 | ✅ | Bật Focus Mode | 1. Tap "Focus Mode" toggle | Background dimmed, chỉ highlight 1 đoạn đang đọc | 🟡 |
| MOB-READ-ENH-HP-002 | ✅ | Navigate paragraphs | 1. Trong Focus Mode<br>2. Swipe lên/xuống | Di chuyển spotlight qua đoạn trước/sau | 🟡 |
| MOB-READ-ENH-HP-003 | ✅ | Exit Focus Mode | 1. Tap toggle hoặc zoom out | Trở về view bình thường | 🟢 |

### 6. Reading Practice - AI Analysis

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-READ-ENH-HP-004 | ✅ | Read aloud practice | 1. Tap microphone trong reading mode<br>2. Đọc to đoạn văn | Audio ghi → AI analyze pronunciation, fluency | 🟡 |
| MOB-READ-ENH-HP-005 | ✅ | AI feedback cho reading | 1. Hoàn thành read aloud | Score: pronunciation + fluency + highlighted errors | 🟡 |
| MOB-READ-ENH-ERR-001 | ❌ | Mic permission denied khi read aloud | 1. Deny mic<br>2. Tap mic button | Hướng dẫn bật quyền, không crash | 🔴 |

### 7. Display Settings

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-READ-ENH-HP-006 | ✅ | Đổi font size | 1. Settings → Small/Medium/Large | Text resize real-time, preview hiển thị | 🟡 |
| MOB-READ-ENH-HP-007 | ✅ | Theme trong Reading | 1. Chọn Dark/Light/Sepia | Background & text color thay đổi theo theme | 🟡 |
| MOB-READ-ENH-HP-008 | ✅ | Line spacing | 1. Adjust line spacing slider | Text re-layout với spacing mới | 🟢 |
| MOB-READ-ENH-EC-001 | ⚠️ | Settings persist khi quay lại | 1. Set font Large + Dark theme<br>2. Exit & re-enter Reading | Settings vẫn giữ nguyên | 🟡 |

### 8. TTS Auto-read

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-READ-ENH-HP-009 | ✅ | Bật auto-read article | 1. Tap 🔊 "Auto-read" | TTS đọc to bài viết, highlight theo câu đang đọc | 🟡 |
| MOB-READ-ENH-HP-010 | ✅ | Pause/Resume auto-read | 1. Tap pause → resume | TTS dừng → tiếp tục từ chỗ dừng | 🟡 |
| MOB-READ-ENH-EC-002 | ⚠️ | Auto-read với bài dài (3000+ từ) | 1. Bật auto-read cho bài rất dài | Không crash, memory ổn định, smooth scroll theo | 🟡 |

### 9. Gestures

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-READ-ENH-HP-011 | ✅ | Long press word → Highlight & Save | 1. Long press từ "climate" | Từ highlight vàng + popup option: Save / Highlight Only | 🟡 |
| MOB-READ-ENH-HP-012 | ✅ | Pinch to zoom | 1. Pinch in/out trên article | Text zoom in/out mượt | 🟢 |
