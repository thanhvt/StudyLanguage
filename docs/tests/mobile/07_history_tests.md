# 📜 History - Test Scenarios

> **Module:** History
> **Phase:** MVP → Enhanced → Advanced
> **Ref:** `docs/mobile/features/07_History.md`

---

## MVP Phase

### 1. History List Screen

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-MVP-HP-001 | ✅ | Mở History tab | 1. Tap History trong bottom nav | Timeline view hiển thị sessions grouped by date | 🔴 |
| MOB-HIS-MVP-HP-002 | ✅ | Session cards hiển thị đúng | 1. Xem list sessions | Mỗi card: icon skill, tên bài, thời gian, score/duration | 🔴 |
| MOB-HIS-MVP-HP-003 | ✅ | Tap session → Detail | 1. Tap vào 1 session card | Mở detail view: performance, transcript, settings used | 🔴 |
| MOB-HIS-MVP-HP-004 | ✅ | Pull to refresh | 1. Pull down list | Refresh animation → load data mới | 🟡 |

### 2. Filter by Skill

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-MVP-HP-005 | ✅ | Filter: All | 1. Tap "All" tab | Hiển thị tất cả sessions | 🟡 |
| MOB-HIS-MVP-HP-006 | ✅ | Filter: Listening only | 1. Tap 🎧 tab | Chỉ hiện sessions Listening, accent blue | 🟡 |
| MOB-HIS-MVP-HP-007 | ✅ | Filter: Speaking only | 1. Tap 🗣️ tab | Chỉ hiện sessions Speaking, accent green | 🟡 |
| MOB-HIS-MVP-HP-008 | ✅ | Filter: Reading only | 1. Tap 📖 tab | Chỉ hiện sessions Reading, accent amber | 🟡 |

### 3. Session Details

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-MVP-HP-009 | ✅ | Listening detail | 1. Tap listening session | Performance %, bookmarks, new words, transcript preview | 🟡 |
| MOB-HIS-MVP-HP-010 | ✅ | Speaking detail | 1. Tap speaking session | Score/100, word scores, sentences count, phoneme heatmap | 🟡 |
| MOB-HIS-MVP-HP-011 | ✅ | Reading detail | 1. Tap reading session | Quiz score X/Y, words read, quiz review (correct/wrong) | 🟡 |
| MOB-HIS-MVP-HP-012 | ✅ | Replay action | 1. Tap "▶️ Replay" trong detail | Audio phát lại, player mở | 🟡 |
| MOB-HIS-MVP-HP-013 | ✅ | Practice again | 1. Tap "🔄 Practice Again" | Start new session cùng config, navigate về skill page | 🟡 |

### 4. Empty State

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-MVP-HP-014 | ✅ | No history (user mới) | 1. User mới mở History | Lottie animation + "Chưa có lịch sử" + CTA buttons (🎧🗣️📖) | 🟡 |
| MOB-HIS-MVP-HP-015 | ✅ | Empty filtered view | 1. Filter speaking<br>2. No speaking sessions | "Chưa có bài Speaking nào" + CTA "Luyện nói ngay" | 🟡 |

### 5. Skeleton Loading

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-MVP-HP-016 | ✅ | Loading state | 1. Mở History (first load) | Shimmer skeleton: stats area + 3-4 card skeletons | 🟢 |
| MOB-HIS-MVP-EC-001 | ⚠️ | Slow network loading | 1. Throttle network → mở History | Skeleton hiển thị đủ lâu, không flash content | 🟢 |

---

## Enhanced Phase

### 6. Search

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-ENH-HP-001 | ✅ | Search history | 1. Tap 🔍<br>2. Gõ "coffee" | Results hiển thị sessions có "coffee" + text match highlight bold | 🟡 |
| MOB-HIS-ENH-HP-002 | ✅ | Search suggestions | 1. Tap 🔍 (trước khi gõ) | Hiện recent searches + phổ biến | 🟢 |
| MOB-HIS-ENH-HP-003 | ✅ | Search debounce 300ms | 1. Gõ nhanh "coff" | Chỉ search sau 300ms ngưng gõ, không mỗi ký tự | 🟡 |
| MOB-HIS-ENH-HP-004 | ✅ | Clear search | 1. Tap ✕ trong search input | Clear text, hiển thị full list | 🟢 |
| MOB-HIS-ENH-EC-002 | ⚠️ | Search không có kết quả | 1. Search "xyzabc" | "Không tìm thấy kết quả" message | 🟢 |

### 7. Quick Actions & Gestures

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-ENH-HP-005 | ✅ | Swipe left → Delete | 1. Swipe left trên session card | Red background reveal → confirm dialog → delete | 🟡 |
| MOB-HIS-ENH-HP-006 | ✅ | Swipe right → Pin/Favorite | 1. Swipe right | Yellow background → toggle pin/favorite | 🟡 |
| MOB-HIS-ENH-HP-007 | ✅ | Long press → Bottom sheet | 1. Long press session card | Bottom sheet: Replay, Practice again, Pin, Favorite, Share, Delete | 🟡 |
| MOB-HIS-ENH-HP-008 | ✅ | Card press animation | 1. Tap session card | Scale 0.95x + haptic light impact + navigate | 🟢 |

### 8. Date Range & Sort

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-ENH-HP-009 | ✅ | Filter: Tuần này | 1. Tap date dropdown → "Tuần này" | Chỉ hiện sessions 7 ngày gần nhất | 🟡 |
| MOB-HIS-ENH-HP-010 | ✅ | Filter: Custom range | 1. Tap "Custom range"<br>2. Pick start/end date | Sessions trong range hiển thị | 🟡 |
| MOB-HIS-ENH-HP-011 | ✅ | Sort: Mới nhất | 1. Sort dropdown → "Mới nhất" | Sessions sort desc by date | 🟡 |
| MOB-HIS-ENH-HP-012 | ✅ | Sort: Cũ nhất | 1. Sort dropdown → "Cũ nhất" | Sessions sort asc by date | 🟡 |

### 9. Visual Identity & Stats

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-ENH-HP-013 | ✅ | Accent colors đúng | 1. Xem list mixed sessions | Listening = blue border, Speaking = green, Reading = amber | 🟢 |
| MOB-HIS-ENH-HP-014 | ✅ | Stats cards overview | 1. Xem stats section | 🔥 Streak, ⏱️ Total time, 📚 Lessons count | 🟡 |
| MOB-HIS-ENH-HP-015 | ✅ | Filter stats update | 1. Filter → Listening only | Stats update: "12 sessions", average score, trend arrow | 🟡 |
| MOB-HIS-ENH-HP-016 | ✅ | Pinned sessions | 1. Pin 2 sessions<br>2. View list | Pinned sessions hiện section riêng ở đầu list | 🟢 |

### 10. Session Restoration

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-ENH-HP-017 | ✅ | Resume from audio player | 1. Tap topic name trên mini player | Mở detail view với transcript, có thể replay | 🟡 |
| MOB-HIS-ENH-HP-018 | ✅ | Persist audio URL | 1. Hoàn thành listening session<br>2. History detail → Replay | Replay trực tiếp từ saved URL, không cần regenerate | 🟡 |

### 11. AI Insight Card

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-ENH-HP-019 | ✅ | AI insight hiển thị | 1. Scroll đến AI Insight card | Gradient card + insight text + action button | 🟡 |
| MOB-HIS-ENH-EC-003 | ⚠️ | AI insight loading | 1. First time load | Skeleton cho insight card, fade-in khi ready | 🟢 |

### 12. Recent Lessons Panel

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-ENH-HP-020 | ✅ | Recent lessons khi logged in | 1. Vào Listening page<br>2. Xem "Bài nghe gần đây" | Max 5 entries, relative time, tap → play | 🟡 |
| MOB-HIS-ENH-HP-021 | ✅ | Recent lessons khi guest | 1. Guest mode → xem Recent panel | CTA "🔐 Đăng nhập để xem lịch sử" | 🟡 |
| MOB-HIS-ENH-HP-022 | ✅ | "Xem tất cả" link | 1. Tap "Xem tất cả lịch sử →" | Navigate đến History page với filter pre-set | 🟢 |

---

## Advanced Phase

### 13. Batch Actions

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-ADV-HP-001 | ✅ | Enter multi-select | 1. Long press bất kỳ card | Multi-select mode, checkboxes hiện ra | 🟡 |
| MOB-HIS-ADV-HP-002 | ✅ | Select multiple & delete | 1. Select 3 sessions<br>2. Tap "🗑️ Xóa (3)" | Confirm dialog → delete all selected | 🟡 |
| MOB-HIS-ADV-HP-003 | ✅ | Select all | 1. Tap "Chọn tất cả" | All visible cards selected | 🟢 |
| MOB-HIS-ADV-HP-004 | ✅ | Cancel multi-select | 1. Tap ✕ | Exit multi-select, checkboxes ẩn | 🟢 |

### 14. Export/Share

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-ADV-HP-005 | ✅ | Share session image card | 1. Detail → Tap "📱 Share Image" | ViewShot → OS share sheet, gradient card đẹp | 🟡 |
| MOB-HIS-ADV-HP-006 | ✅ | Export PDF | 1. Tap "📄 Export PDF" | PDF with session detail + transcript download | 🟡 |

### 15. Analytics Charts

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-ADV-HP-007 | ✅ | Weekly heatmap | 1. Xem Calendar heatmap | GitHub-style contribution graph, intensity = learning time | 🟡 |
| MOB-HIS-ADV-HP-008 | ✅ | Progress line chart | 1. Scroll đến Tuần này chart | Line chart tuần/tháng toggle, responsive | 🟡 |
| MOB-HIS-ADV-HP-009 | ✅ | Skill distribution chart | 1. Xem pie/donut chart | Phân bổ: Listening %, Speaking %, Reading % | 🟡 |
| MOB-HIS-ADV-EC-001 | ⚠️ | Charts với ít data (1-2 sessions) | 1. User mới, chỉ có 2 sessions | Charts vẫn render đúng, không empty/broken | 🟡 |

### 16. Sync

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-HIS-ENH-HP-023 | ✅ | Online sync | 1. Hoàn thành session online | Session sync ngay lên server | 🔴 |
| MOB-HIS-ENH-EC-004 | ⚠️ | Offline → Queue | 1. Hoàn thành session offline | Session lưu local, pending icon hiển thị | 🟡 |
| MOB-HIS-ENH-EC-005 | ⚠️ | Back online → Auto sync | 1. Có mạng lại | Pending sessions auto-sync, status update | 🟡 |
