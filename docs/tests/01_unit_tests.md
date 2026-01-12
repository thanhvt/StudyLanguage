# UNIT TEST CASES
**Project:** StudyLanguage
**Module:** Core, 4 Skills, Utilities
**Updated:** 12/01/2026

---

## 1. UTILITIES & HOOKS (LOGIC)
*Mục tiêu: Đảm bảo variables và state logic hoạt động đúng.*

| ID | Function/Hook | Test Case Description | Input Data | Expected Output | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UT-HK-001** | `useAudioPlayer` | Play/Pause toggle logic | `isPlaying: false`, call `toggle()` | `isPlaying` becomes `true` | High |
| **UT-HK-002** | `useAudioPlayer` | Auto-stop when ended | Audio ends event trigger | `isPlaying` becomes `false`, progress resets (optional) | Medium |
| **UT-HK-003** | `usePreferences` | Sync theme change to LocalStorage | Call `setTheme('dark')` | `localStorage.getItem('theme')` is `'dark'` | High |
| **UT-HK-004** | `formatDuration` | Format thời gian hiển thị player | `65` | Returns `"01:05"` | Low |

---

## 2. UI COMPONENTS (RENDERING)
*Mục tiêu: Đảm bảo Component render đúng props và state.*

| ID | Component | Test Case Description | Props/State | Expected Output | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UT-CMP-001** | `<AudioPlayer />` | Render đúng progress bar | `duration=100`, `currentTime=50` | Progress Bar width = 50% | High |
| **UT-CMP-002** | `<DictionaryPopup />` | Hiển thị khi có từ được chọn | `word="hello"`, `isOpen=true` | Popup visible, contains text "hello" | High |
| **UT-CMP-003** | `<DictionaryPopup />` | Ẩn khi click outside | User click ra ngoài popup | `onClose` callback fired | Medium |
| **UT-CMP-004** | `<InteractiveListening />` | Hiển thị hội thoại User và AI | List messages `[{role: 'user'}, {role: 'ai'}]` | Render đủ 2 bubbles, đúng màu sắc role | High |
| **UT-CMP-005** | `<ThemeSwitcher />` | Render đúng icon theo mode | `mode='light'` | Show Moon icon (to switch to dark) | Low |
| **UT-CMP-006** | `<MusicControlBar />` | Ducking status visual | `isDucked=true` | Volume slider giảm hoặc icon thể hiện trạng thái "Ducking" | Medium |

---

## 3. BACKEND SERVICES (NESTJS)
*Mục tiêu: Đảm bảo logic xử lý dữ liệu backend đúng.*

| ID | Service/Function | Test Case Description | Input Data | Expected Output | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UT-BE-001** | `AuthService.validateUser` | Validate user tồn tại | Valid `googleId` | Returns User object | High |
| **UT-BE-002** | `SpeakingService.analyze` | Mock score calculation | Mock Whisper response | Returns JSON with `score` and `phonemes` | High |
| **UT-BE-003** | `DictionaryService.lookup` | Tra cứu từ điển cache | Word `"apple"` (exists in cache) | Returns result immediately without calling External API | High |
| **UT-BE-004** | `HistoryService.logActivity` | Log hoạt động mới vào DB | Activity DTO object | Record Created in DB, Returns ID | High |

---

## 4. SNAPSHOT TESTING
*Mục tiêu: Đảm bảo UI không bị thay đổi bất ngờ.*

| ID | Component | Test Case Description | Expected Result |
| :--- | :--- | :--- | :--- |
| **UT-SNAP-001** | `<ListeningPlayer />` | Snapshot Default State | Matches stored snapshot `listening-player.snap` |
| **UT-SNAP-002** | `<ProtectedRoute />` | Snapshot Redirect State | Matches stored snapshot (Redirect component) |
