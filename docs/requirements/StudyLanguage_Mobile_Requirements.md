# TÀI LIỆU YÊU CẦU CHI TIẾT - PHIÊN BẢN MOBILE
**(Comprehensive Mobile Requirements Document)**

**Dự án:** App Luyện Thi Tiếng Anh - Mobile App (iOS/Android)  
**Phiên bản:** 1.0  
**Ngày:** 12/01/2026  
**Nền tảng:** React Native với Expo

---

## 1. TỔNG QUAN (OVERVIEW)

### 1.1. Mục tiêu Mobile App
Xây dựng ứng dụng mobile hoàn chỉnh cho phép người dùng:
- **Học mọi lúc, mọi nơi:** Tối ưu cho việc học trong thời gian chết (di chuyển, xe bus, trước khi ngủ)
- **Trải nghiệm mượt mà:** Tương tác tự nhiên với gestures, voice commands, offline mode
- **Đồng bộ liền mạch:** Sync hoàn hảo với Web App

### 1.2. Đặc điểm Mobile-First
| Nguyên tắc | Mô tả |
|------------|-------|
| **Thumb-Friendly** | Các nút bấm chính nằm trong vùng ngón tay cái dễ chạm |
| **Offline-First** | Hoạt động tốt ngay cả khi mất mạng |
| **Battery-Optimized** | Tối ưu pin, không drain battery khi chạy nền |
| **Fast Loading** | Skeleton loading, progressive image loading |
| **Native Feel** | Sử dụng haptic feedback, native transitions |

### 1.3. Quy mô \u0026 Target Users
- **Số lượng users:** < 20 người (Personal \u0026 Family)
- **Độ tuổi:** 10+ (Phù hợp mọi lứa tuổi)
- **Use cases chính:** 
  - Học trên đường đi làm (commute)
  - Học trước khi ngủ (bedtime)
  - Học trong lúc nghỉ trưa (lunch break)
  - Học kết hợp tập gym, chạy bộ (workout)

---

## 2. KIẾN TRÚC KỸ THUẬT MOBILE (MOBILE TECH STACK)

### 2.1. Core Framework
- **React Native:** Chạy cả iOS \u0026 Android từ 1 codebase
- **Expo:** Managed workflow, dễ build \u0026 deploy
- **Expo Router:** File-based routing (giống Next.js)

### 2.2. UI \u0026 Styling
- **NativeWind:** Tailwind CSS cho React Native
- **Reanimated:** Animation library hiệu năng cao
- **Gesture Handler:** Xử lý cử chỉ chạm, vuốt mượt mà
- **Haptic Feedback:** Expo Haptics cho phản hồi rung

### 2.3. State Management \u0026 Data
- **TanStack Query (React Query):** Cache \u0026 sync data
- **Zustand:** Global state management (nhẹ hơn Redux)
- **AsyncStorage:** Local storage cho settings
- **SQLite:** Offline database (nội dung đã tải)

### 2.4. Audio \u0026 Media
- **Expo AV:** Play/Record audio
- **Expo Speech:** Text-to-Speech local (fallback)
- **Background Audio:** Expo Audio để nghe khi app minimize

### 2.5. Native Features
- **Expo Notifications:** Push notifications
- **Expo Calendar:** Tích hợp lịch
- **Expo File System:** Quản lý file download
- **Expo Sensors:** Phát hiện chuyển động (car mode)
- **Expo Location:** Location-based content
- **Expo Linking:** Deep linking

### 2.6. Backend Integration
- **Supabase JS Client:** Kết nối Supabase (Auth, DB, Storage)
- **OpenAI API:** Gọi qua NestJS backend
- **Axios:** HTTP client

---

## 3. YÊU CẦU CHỨC NĂNG MOBILE (MOBILE FUNCTIONAL REQUIREMENTS)

### 3.1. Authentication (Xác thực)

#### A. Đăng nhập Google (Primary Method)
- **UI Flow:**
  1. Splash screen với logo \u0026 animation
  2. Welcome screen: "Bắt đầu học tiếng Anh"
  3. Nút "Tiếp tục với Google" (lớn, nổi bật)
  4. Tự động chuyển qua Home khi đăng nhập thành công

- **Technical:**
  - Sử dụng Expo AuthSession + Supabase Auth
  - Google OAuth flow trong WebView
  - Lưu token vào Secure Storage (Expo SecureStore)

#### B. Magic Link (Email)
- Nhập email → Nhận link → Click vào email → Auto login
- Phù hợp khi thiết bị lạ không có Google account đã login

#### C. Biometric Login (Vân tay/Face ID)
- **Mục tiêu:** Đăng nhập nhanh sau lần đầu tiên
- Sử dụng Expo Local Authentication
- Option trong Settings: "Bật đăng nhập bằng vân tay"

#### D. Auto-Relogin
- Token lưu trong SecureStore, tự động login khi mở app
- Không yêu cầu login lại trừ khi token expire

---

### 3.2. Home Screen (Màn hình chính)

#### A. Layout
```
┌─────────────────────────────────┐
│  👤 [Avatar]    🔔 [Notif]  ⚙️  │
│                                 │
│  Xin chào, Thành! 👋            │
│  Hôm nay bạn muốn học gì?       │
│                                 │
│  ┌───────────────────────────┐ │
│  │  🎧  Listening            │ │
│  │  Smart Conversation       │ │
│  └───────────────────────────┘ │
│  ┌───────────────────────────┐ │
│  │  🗣️  Speaking             │ │
│  │  AI Pronunciation Coach   │ │
│  └───────────────────────────┘ │
│  ┌───────────────────────────┐ │
│  │  📖  Reading              │ │
│  │  Active Reading Practice  │ │
│  └───────────────────────────┘ │
│  ┌───────────────────────────┐ │
│  │  ✍️  Writing              │ │
│  │  AI Writing Assistant     │ │
│  └───────────────────────────┘ │
│                                 │
│  📊 Tiến độ hôm nay: 🔥 15 phút │
└─────────────────────────────────┘
  [🏠]  [📜]  [📚]  [👤]
```

#### B. Navigation
- **Bottom Tab Bar:** Home / History / Vocabulary / Profile
- Icons lớn, có label
- Active state rõ ràng (màu sắc, animation)

#### C. Quick Actions
- **Learning Streak:** Hiển thị số ngày học liên tục (🔥 7 days)
- **Continue Learning:** Nút lớn để tiếp tục bài học dở
- **Daily Challenge:** Thử thách hằng ngày (VD: "Học 20 phút")

---

### 3.3. Listening Module (Mobile Version)

#### A. Configuration Screen
**Mục tiêu:** Cấu hình nhanh, đơn giản hơn Web

- **Topic:** Dropdown select (Cuộc sống hằng ngày, Du lịch, Công việc...)
- **Duration:** Slider (5 - 60 phút) với preset (5, 10, 15, 20, 30)
- **Mode:** Toggle switch "Podcast" vs "Interactive"
- **Number of Speakers:** Stepper (2/3/4 người)
- **Keywords (Optional):** Text input, có gợi ý thông minh

**UI Notes:**
- Sử dụng Bottom Sheet cho advanced options
- Preview: Hiển thị tóm tắt config trước khi generate

#### B. Player Interface

**Podcast Mode (Passive):**
```
┌─────────────────────────────────┐
│  ← Coffee Shop Talk         ⋮  │
├─────────────────────────────────┤
│                                 │
│     🌊 [Waveform Animation]    │
│                                 │
│    ────●────────────── 12:30   │
│     5:30                 15:00 │
│                                 │
│     [⏪] [⏸️ PAUSE] [⏩]        │
│                                 │
├─────────────────────────────────┤
│  A: Hi, can I order a coffee?  │
│  B: Sure! What size would...   │
│     [Karaoke-style scrolling]  │
├─────────────────────────────────┤
│  🔖 Save  |  🔁 Repeat  | ⚡ x1.0│
└─────────────────────────────────┘
```

**Interactive Mode:**
- Thêm nút Microphone để user trả lời
- AI sẽ pause \u0026 chờ user nói
- Feedback realtime nếu phát âm sai

**Tính năng chính:**
- **Playback Speed:** 0.5x, 0.75x, 1.0x, 1.25x, 1.5x
- **A-B Loop:** Chọn đoạn để lặp lại
- **Save Sentence:** Long press vào câu → Lưu vào Bookmarks
- **Auto-scroll Script:** Script tự cuộn theo audio
- **Background Play:** Nghe khi minimize app hoặc lock screen

#### C. Lock Screen Controls
**Khi app chạy nền:**
- Hiển thị media player trên lock screen
- Có nút Play/Pause, Next, Previous
- Hiển thị title \u0026 thumbnail
- Tích hợp với Bluetooth headphone controls

#### D. Pocket Mode (Đi bộ/Tàu xe)
**Mục tiêu:** Học khi không thể nhìn màn hình

- **Auto-detect:** Tự động bật khi phát hiện chuyển động (Gyroscope)
- **UI:** Màn hình tối (black screen) hoặc hiển thị 1 từ lớn
- **Gestures:**
  - Swipe left: Previous sentence
  - Swipe right: Next sentence
  - Double tap: Play/Pause
  - Swipe up: Save to bookmarks
- **Voice Commands:**
  - "Next" / "Tiếp theo"
  - "Repeat" / "Lặp lại"
  - "Save" / "Lưu"

#### E. Offline Support
- **Pre-download:** User có thể download bài nghe trước khi mất mạng
- **Storage:** Lưu trong local storage, tối đa 50 bài
- **Sync:** Tự động tải bài mới khi có WiFi

---

### 3.4. Speaking Module (Mobile Version)

#### A. Practice Screen
```
┌─────────────────────────────────┐
│  ← Pronunciation Practice  💬  │
├─────────────────────────────────┤
│  Topic: Technology Vocabulary   │
│  📊 Current Score: 85/100       │
├─────────────────────────────────┤
│                                 │
│  "Artificial Intelligence       │
│   is revolutionizing the way    │
│   we live and work."            │
│                                 │
│  🔊 [Nghe AI phát âm mẫu]       │
│                                 │
├─────────────────────────────────┤
│                                 │
│         🎤                      │
│     [Giữ để ghi âm]             │
│                                 │
│   ⚪ Ready to record           │
│                                 │
└─────────────────────────────────┘
```

**Recording UX:**
- **Hold-to-record:** Giữ nút mic để ghi, thả ra để dừng
- **Visual feedback:** Vòng tròn nở to khi đang ghi, waveform animation
- **Haptic:** Rung nhẹ khi bắt đầu \u0026 kết thúc ghi âm
- **Countdown:** Đếm ngược 3-2-1 trước khi ghi (có thể tắt)

#### B. Feedback Screen
```
┌─────────────────────────────────┐
│  ← Pronunciation Result     ✅  │
├─────────────────────────────────┤
│                                 │
│      🎯 Score: 88/100           │
│   [████████░░] Great job!       │
│                                 │
├─────────────────────────────────┤
│  Phân tích chi tiết:            │
│                                 │
│  ✅ Artificial (95/100)         │
│  ✅ Intelligence (90/100)       │
│  ⚠️ Revolutionizing (75/100)   │
│  ✅ Live (92/100)               │
│                                 │
│  💡 Lời khuyên:                 │
│  "Âm /ʃ/ trong 'revolutionizing'│
│   cần nhấn mạnh hơn"            │
│                                 │
├─────────────────────────────────┤
│  🔊 Nghe lại giọng của bạn      │
│  🔊 So sánh với AI              │
│                                 │
│  [🔁 Luyện lại]  [➡️ Tiếp theo]│
└─────────────────────────────────┘
```

**Tính năng:**
- **Waveform Comparison:** Hiển thị sóng âm AI vs User
- **Phoneme Breakdown:** Highlight từng âm tiết
- **Improvement Tips:** Gợi ý cách cải thiện từng âm
- **Progress Tracking:** Lưu lại các lần thử để xem progress

#### C. Conversation Roleplay
**Scenarios:** Restaurant, Airport, Hotel, Job Interview, Doctor

**Flow:**
```
1. User chọn scenario + level (Easy/Medium/Hard)
2. AI giới thiệu tình huống bằng voice
3. AI nói câu đầu tiên (VD: "Hi, table for two?")
4. User trả lời bằng voice
5. AI phản hồi dựa trên câu trả lời
6. Tiếp tục hội thoại 5-10 lượt
7. AI đánh giá overall performance
```

**UI Tips:**
- Hiển thị subtitle AI nói gì (có thể tắt cho khó hơn)
- Timer: Giới hạn thời gian suy nghĩ (10-15s)
- Hints: Nút "Gợi ý" nếu user không biết nói gì

---

### 3.5. Reading Module (Mobile Version)

#### A. Article View
**Tối ưu cho màn hình nhỏ:**

```
┌─────────────────────────────────┐
│  ← Climate Change           🔊  │
├─────────────────────────────────┤
│  📖 Reading Time: ~5 minutes    │
│  📊 Level: Intermediate         │
├─────────────────────────────────┤
│                                 │
│  Climate change is one of the   │
│  most pressing issues facing    │
│  our planet today. Scientists   │
│  around the world warn that...  │
│                                 │
│  [Swipe up để scroll]           │
│                                 │
└─────────────────────────────────┘
```

**Interactive Features:**
- **Tap to translate:** Tap vào từ → Popup nghĩa
- **Highlight:** Long press → Highlight text
- **Listen mode:** AI đọc bài cho user nghe
- **Font size:** Pinch to zoom text
- **Night mode:** Auto chuyển màu khi tối

#### B. Dictionary Lookup
**Popup khi tap vào từ:**
```
┌─────────────────────────────────┐
│  pressing  /ˈpres.ɪŋ/      ❌  │
├─────────────────────────────────┤
│  adjective                      │
│  Khẩn cấp, cấp bách             │
│                                 │
│  📝 Example:                    │
│  "This is a pressing matter"    │
│                                 │
│  [🔊 Phát âm]  [💾 Lưu từ]      │
└─────────────────────────────────┘
```

**Saved Words:**
- Tự động thêm vào Vocabulary list
- Spaced repetition reminder sau 1/3/7 ngày

#### C. Comprehension Quiz
**Bottom sheet slide up:**
```
┌─────────────────────────────────┐
│  📝 Reading Quiz (3/5)          │
├─────────────────────────────────┤
│  What is the main topic of      │
│  the article?                   │
│                                 │
│  ⚪ Climate solutions           │
│  🔵 Climate change impact       │
│  ⚪ Scientific research         │
│  ⚪ Government policies         │
│                                 │
│         [Kiểm tra]              │
└─────────────────────────────────┘
```

**Instant Feedback:**
- Đúng: Confetti animation + haptic
- Sai: Shake animation + giải thích

---

### 3.6. Writing Module (Mobile Version)

#### A. Writing Input
**Tối ưu keyboard:**
```
┌─────────────────────────────────┐
│  ← Daily Journal            💾  │
├─────────────────────────────────┤
│  📅 12/01/2026                  │
│  📝 Word count: 0/200           │
├─────────────────────────────────┤
│                                 │
│  [Viết về ngày hôm nay...]      │
│                                 │
│                                 │
│                                 │
│  [Keyboard]                     │
│                                 │
│                                 │
└─────────────────────────────────┘
```

**Features:**
- **Voice input:** Nút mic để dictate (voice-to-text)
- **Writing prompts:** Gợi ý đề tài nếu user không biết viết gì
- **Auto-save:** Tự động lưu mỗi 10 giây
- **Word counter:** Real-time word count

#### B. AI Correction View
```
┌─────────────────────────────────┐
│  ← Review \u0026 Corrections    ✅  │
├─────────────────────────────────┤
│  📊 Score: 82/100               │
│  ✅ 15 từ đúng | ⚠️ 3 lỗi       │
├─────────────────────────────────┤
│  [Original] [Corrected]         │
│                                 │
│  I go to school yesterday.      │
│  ────────── ⚠️                  │
│  💡 "go" → "went" (Past tense)  │
│                                 │
│  The weather is very good.      │
│  ────────────── ⚠️             │
│  💡 "good" → "nice" (Better)    │
│                                 │
│  [Xem gợi ý viết lại]           │
└─────────────────────────────────┘
```

**Paraphrase Suggestions:**
- AI gợi ý cách viết "Tây" hơn
- User có thể tap để thay thế
- Học được cách diễn đạt tự nhiên hơn

---

### 3.7. Vocabulary Module

#### A. Word List
```
┌─────────────────────────────────┐
│  📚 My Vocabulary           🔍  │
├─────────────────────────────────┤
│  [All] [New] [Learning] [Master]│
├─────────────────────────────────┤
│  ┌───────────────────────────┐ │
│  │  pressing                 │ │
│  │  /ˈpres.ɪŋ/ - Khẩn cấp    │ │
│  │  📖 From: Climate Article │ │
│  │  🕐 2 giờ trước           │ │
│  └───────────────────────────┘ │
│  ┌───────────────────────────┐ │
│  │  revolutionize            │ │
│  │  /ˌrev.əˈluː.ʃən.aɪz/     │ │
│  │  📖 From: Technology      │ │
│  │  🕐 1 ngày trước          │ │
│  └───────────────────────────┘ │
│                                 │
│         Swipe to review         │
└─────────────────────────────────┘
```

#### B. Flashcard Review
**Swipe interaction:**
```
┌─────────────────────────────────┐
│              (5/20)             │
│                                 │
│                                 │
│                                 │
│        Revolutionize            │
│                                 │
│      [Tap để xem nghĩa]         │
│                                 │
│                                 │
│                                 │
│  ← Chưa nhớ          Đã nhớ →  │
└─────────────────────────────────┘
```

- Swipe left: Chưa nhớ (sẽ review lại sớm hơn)
- Swipe right: Đã nhớ (review sau vài ngày)
- Tap: Flip card để xem nghĩa

#### C. Spaced Repetition
- **Algorithm:** Leitner system
- **Notification:** Nhắc ôn từ đúng lúc
- **Streak:** Số ngày review liên tục

---

### 3.8. History Module (Mobile Version)

#### A. Timeline View
```
┌─────────────────────────────────┐
│  📜 Lịch sử học tập         🔍  │
├─────────────────────────────────┤
│  [All] [🎧] [🗣️] [📖] [✍️]    │
├─────────────────────────────────┤
│  📅 Hôm nay                     │
│  ┌───────────────────────────┐ │
│  │ 🎧 Coffee Shop Talk   ⭐  │ │
│  │ 09:30 • 15 min • 80%      │ │
│  └───────────────────────────┘ │
│  ┌───────────────────────────┐ │
│  │ 🗣️ Tech Pronunciation     │ │
│  │ 10:15 • 8 min • 85/100    │ │
│  └───────────────────────────┘ │
│                                 │
│  📅 Hôm qua                     │
│  [Load more activities...]      │
└─────────────────────────────────┘
```

**Tap vào item:** Mở detail view
**Long press:** Quick actions (Delete, Star, Share)

#### B. Detail View
- Replay audio/reading
- View transcript/feedback
- Practice again với config cũ
- Export/Share

---

### 3.9. Profile \u0026 Settings

#### A. Profile Screen
```
┌─────────────────────────────────┐
│  👤 Profile                 ⚙️  │
├─────────────────────────────────┤
│      [Avatar]                   │
│    Thành Vũ Trịnh               │
│  thanhvt1.ho@gmail.com          │
├─────────────────────────────────┤
│  📊 Statistics                  │
│  ┌─────────┬─────────┬────────┐│
│  │ 🔥 Streak│ ⏱️ Time │ 📚 Words││
│  │   7 days│ 3.5 hrs│   156  ││
│  └─────────┴─────────┴────────┘│
├─────────────────────────────────┤
│  ⚙️ Settings                    │
│  › Appearance                   │
│  › Notifications                │
│  › Download \u0026 Storage          │
│  › Audio Settings               │
│  › Privacy                      │
│  › About                        │
├─────────────────────────────────┤
│  🚪 Đăng xuất                   │
└─────────────────────────────────┘
```

#### B. Settings Details

**Appearance:**
- Theme: Light / Dark / Auto
- Accent Color: 6 options Green Nature
- Font Size: Small / Medium / Large
- Language: English / Tiếng Việt

**Notifications:**
- Daily Reminder: Time picker
- Streak Warning: ON/OFF
- Achievement: ON/OFF
- Quiet Hours: 22:00 - 07:00

**Download \u0026 Storage:**
- Auto-download on WiFi: ON/OFF
- Max cached lessons: Slider (10-50)
- Clear cache: Button
- Storage used: 450MB / 2GB

**Audio Settings:**
- Background Music: ON/OFF + Volume slider
- Music Ducking: ON/OFF
- Playback Speed Default: Dropdown
- Voice: Select AI voice (alloy, nova, onyx)

**Privacy:**
- Save recordings: ON/OFF
- Auto-delete after: 30/60/90 days
- Data sync: ON/OFF

---

## 4. TÍNH NĂNG ĐẶC THÙ MOBILE (MOBILE-SPECIFIC FEATURES)

### 4.1. Gestures (Cử chỉ)

| Context | Gesture | Action |
|---------|---------|--------|
| **Player** | Swipe left | Previous sentence |
| **Player** | Swipe right | Next sentence |
| **Player** | Swipe down | Minimize player |
| **Player** | Double tap | Play/Pause |
| **Player** | Long press sentence | Save bookmark |
| **Flashcard** | Swipe left | Not mastered |
| **Flashcard** | Swipe right | Mastered |
| **Reading** | Pinch | Zoom text |
| **Anywhere** | Pull down | Refresh |

### 4.2. Voice Commands

**Wake word:** "Hey Study" hoặc "OK Study"

| Command | Action |
|---------|--------|
| "Next" | Câu/bài tiếp theo |
| "Repeat" | Lặp lại |
| "Slower" | Giảm tốc độ |
| "Faster" | Tăng tốc độ |
| "Save" | Lưu bookmark |
| "Translate" | Dịch sang tiếng Việt |
| "Pause" / "Play" | Tạm dừng/Tiếp tục |
| "What does [word] mean?" | Tra từ |

**Technical:**
- Sử dụng Expo Speech Recognition
- Offline mode: On-device recognition (limited)
- Online mode: Cloud-based (accurate hơn)

### 4.3. Widgets

#### A. iOS Widgets
**Small Widget (2x2):**
```
┌──────────────┐
│ StudyLanguage│
│ 🔥 Streak: 7 │
│ 📚 156 words │
│ [Tap to open]│
└──────────────┘
```

**Medium Widget (4x2):**
```
┌────────────────────────────┐
│ StudyLanguage   🔥 7 days  │
│ ─────────────────────────  │
│ 💡 Word of the Day:        │
│ "Serendipity" - May mắn   │
│ ─────────────────────────  │
│ [Continue lesson →]        │
└────────────────────────────┘
```

#### B. Android Widgets
- Tương tự iOS nhưng customize được nhiều hơn
- Live data update mỗi 30 phút

### 4.4. Lock Screen Integration

#### A. iOS Lock Screen (iOS 16+)
- **Live Activities:** Hiển thị progress bài học đang học
- **Lock Screen Widget:** Streak counter, Word of the day

#### B. Android Lock Screen
- **Media controls:** Play/Pause/Next khi nghe podcast
- **Notification persistent:** Bài học đang dở

### 4.5. Notifications

#### A. Push Notifications
| Type | Timing | Content |
|------|--------|---------|
| **Daily Reminder** | 19:00 (customizable) | "Đã sẵn sàng học chưa? 💪" |
| **Streak Warning** | 21:00 | "2 giờ nữa mất streak! 🔥" |
| **Achievement** | Instant | "Chúc mừng! 🎉 7 ngày liên tục!" |
| **Review Reminder** | 10:00 | "15 từ cần ôn tập hôm nay" |
| **Personalized Tip** | Weekly | "Mẹo: Luyện phát âm 'th' mỗi ngày" |

**Best Practices:**
- Tối đa 2 notification/ngày
- Không gửi trong giờ ngủ (22:00-07:00)
- User có thể tùy chỉnh hoàn toàn

#### B. Local Notifications
- Reminder khi download xong bài
- Warning khi storage đầy
- Congratulations khi hoàn thành bài

### 4.6. Background Modes

#### A. Background Audio
- Nghe podcast khi minimize app
- Nghe khi màn hình tắt
- Tích hợp với car Bluetooth

#### B. Background Sync
- Tự động sync progress khi có mạng
- Upload recordings khi connected WiFi
- Download lessons khi idle + WiFi

### 4.7. Offline Mode

#### A. Offline Capabilities
✅ **Hoạt động offline:**
- Nghe bài đã download
- Xem history đã cache
- Review vocabulary đã lưu
- Đọc reading materials đã cache

❌ **Không hoạt động offline:**
- Generate bài mới (cần AI)
- Speaking practice (cần AI scoring)
- Real-time translation

#### B. Download Manager
```
┌─────────────────────────────────┐
│  📥 Downloaded Lessons      ✅  │
├─────────────────────────────────┤
│  Auto-download on WiFi: ON      │
│  Max storage: 500MB             │
├─────────────────────────────────┤
│  ✅ Coffee Shop (15 MB)         │
│  ✅ Tech Talk (12 MB)           │
│  ⏳ Airport Guide (8 MB)        │
│  [ ] Climate Change (10 MB)     │
│                                 │
│  Storage: 35 MB / 500 MB        │
│                                 │
│  [Download All New Lessons]     │
└─────────────────────────────────┘
```

### 4.8. Haptic Feedback

| Event | Haptic Type |
|-------|-------------|
| Button tap | Light impact |
| Toggle switch | Selection feedback |
| Correct answer | Success notification |
| Wrong answer | Error notification |
| Achievement unlock | Heavy impact |
| Recording start | Medium impact |
| Recording end | Light impact |

**Technical:** Expo Haptics

### 4.9. Special Modes

#### A. Car Mode (Lái xe an toàn)
**Auto-activate when:**
- Kết nối Bluetooth xe
- Tốc độ di chuyển \u003e 30 km/h (GPS)

**Features:**
- UI tối giản (black screen hoặc minimal)
- 100% voice control
- Chỉ phát Listening (không Speaking)
- Auto volume adjust theo ambient noise

#### B. Bedtime Mode (Trước khi ngủ)
**Manual activate via toggle**

**Features:**
- Ultra-dark UI (OLED black)
- Amber/Red text color (không ức chế melatonin)
- Softer AI voice (whisper mode)
- Sleep timer (15/30/45/60 min)
- Fade-out trong 5 phút cuối
- Auto-switch to ambient sound cuối cùng

#### C. Workout Mode (Tập gym/Chạy bộ)
**Features:**
- Hands-free (voice commands only)
- Shorter lessons (5-10 min)
- High-energy topics
- Sweat-proof UI (large buttons)

---

## 5. TRẢI NGHIỆM NGƯỜI DÙNG MOBILE (MOBILE UX)

### 5.1. Performance Optimization

#### A. Fast Loading
- **Splash screen:** Tối đa 1-2 giây
- **Skeleton loading:** Cho content chưa load
- **Progressive image:** Load thumbnail trước, HD sau
- **Code splitting:** Lazy load screens không dùng ngay

#### B. Animation Budget
- Mượt 60 FPS (sử dụng Reanimated)
- Transition nhẹ nhàng, không quá fancy
- Reduce motion cho accessibility

#### C. Battery Optimization
- Tắt GPS khi không cần
- Giảm background refresh
- Optimize audio encoding
- Dark mode tiết kiệm pin (OLED)

### 5.2. Accessibility

#### A. Screen Reader
- Tất cả button có label rõ ràng
- Image có alt text
- Proper heading hierarchy

#### B. Font Size
- Support Dynamic Type (iOS)
- Support system font scaling (Android)
- Minimum touch target: 44x44 pt

#### C. Color Contrast
- Đạt WCAG AA standard
- Dark mode contrast tốt
- Color-blind friendly

### 5.3. One-Handed Use

#### A. Thumb Zone
```
┌─────────────────────────────────┐
│  [Secondary actions]       🟢  │ ← Easy
│                            🟢  │
│                                 │
│  [Content area]            🟡  │ ← OK
│                            🟡  │
│                                 │
│                                 │
│  [Primary actions]         🔴  │ ← Hard
│  [Bottom Nav]              🟢  │ ← Easy
└─────────────────────────────────┘
```

**Principle:**
- Primary actions ở dưới (vùng dễ chạm)
- Secondary actions ở trên
- Bottom nav luôn accessible

#### B. Reachability
- Support iOS Reachability mode
- Important actions không quá xa ngón cái

### 5.4. Error Handling

#### A. Network Errors
```
┌─────────────────────────────────┐
│                                 │
│         📡                      │
│                                 │
│    Không có kết nối mạng        │
│                                 │
│  Một số tính năng bị giới hạn   │
│  Bạn vẫn có thể:                │
│  • Xem bài đã download          │
│  • Ôn từ vựng                   │
│                                 │
│       [Thử lại]                 │
│                                 │
└─────────────────────────────────┘
```

#### B. Permission Errors
- Microphone denied → Giải thích tại sao cần + link Settings
- Notification denied → Soft prompt trước khi yêu cầu

#### C. AI Errors
- Timeout → Retry option
- Generation failed → Fallback content

### 5.5. Onboarding

#### A. First Launch
```
Screen 1: Welcome
  "Xin chào! Sẵn sàng học tiếng Anh?"

Screen 2: 4 Skills
  "Luyện cả 4 kỹ năng với AI"

Screen 3: Anywhere
  "Học mọi lúc, mọi nơi - Online \u0026 Offline"

Screen 4: Login
  [Tiếp tục với Google]
```

#### B. Feature Discovery
- Tooltips nhẹ nhàng cho tính năng mới
- "Swipe tutorial" khi vào player lần đầu
- "Voice command tutorial" khi enable

---

## 6. BẢO MẬT \u0026 PRIVACY

### 6.1. Data Storage
- **Sensitive data:** Lưu trong SecureStore (encrypted)
- **Audio recordings:** Local file system (có thể xóa)
- **Sync data:** Supabase (encrypted in transit \u0026 at rest)

### 6.2. Permissions

| Permission | When to ask | Why |
|------------|-------------|-----|
| **Microphone** | Khi vào Speaking lần đầu | Ghi âm phát âm |
| **Notifications** | Sau 3 bài học | Nhắc nhở học tập |
| **Location** | Khi enable location-based | Nội dung theo ngữ cảnh |
| **Calendar** | Khi enable integration | Meeting prep |
| **Photo** | Khi dùng Screenshot Translate | OCR từ ảnh |

**Best Practice:** Explain before ask

### 6.3. Data Retention
- User có quyền xóa mọi dữ liệu
- Auto-delete recordings sau X ngày (customizable)
- Export data option

---

## 7. TESTING \u0026 QUALITY ASSURANCE

### 7.1. Device Testing Matrix

| Category | Devices |
|----------|---------|
| **iOS** | iPhone SE (small), iPhone 14 Pro (notch), iPhone 14 Pro Max (large) |
| **Android** | Galaxy S22 (flagship), Pixel 6 (stock), Redmi Note 11 (budget) |
| **OS Version** | iOS 15+ / Android 10+ |

### 7.2. Test Scenarios

#### A. Functional Tests
- ✅ Login flow hoạt động
- ✅ Generate \u0026 play audio
- ✅ Recording \u0026 AI scoring
- ✅ Offline mode
- ✅ Background audio
- ✅ Push notifications
- ✅ Sync giữa devices

#### B. Performance Tests
- App launch time \u003c 2s
- Screen transition smooth (60fps)
- Audio playback no lag
- Battery drain \u003c 5%/hour (passive listening)

#### C. Edge Cases
- Mất mạng giữa chừng
- Battery thấp
- Storage đầy
- Interrupt bởi phone call
- Multiple device login

---

## 8. DEPLOYMENT \u0026 DISTRIBUTION

### 8.1. Build Process
- **Expo EAS Build:** Cloud build service
- **iOS:** Archive \u0026 upload to TestFlight → App Store
- **Android:** Generate AAB → Google Play Console

### 8.2. Version Control
- **Semantic versioning:** 1.0.0 (Major.Minor.Patch)
- **OTA Updates:** Expo Updates cho JS changes (không cần review)
- **Native updates:** Phải qua store review

### 8.3. Release Channels
- **Dev:** Internal testing
- **Beta:** TestFlight (iOS) / Internal track (Android)
- **Production:** Public release

### 8.4. App Store Listing

**iOS App Store:**
- Category: Education
- Age rating: 4+
- Keywords: english learning, AI tutor, pronunciation
- Screenshots: 6.5\" \u0026 5.5\" devices

**Google Play:**
- Category: Education \u003e Languages
- Content rating: Everyone
- Feature graphic required

---

## 9. ANALYTICS \u0026 MONITORING

### 9.1. Usage Analytics
**Track:**
- Daily/Monthly active users
- Session duration
- Feature usage (Listening vs Speaking vs Reading vs Writing)
- Completion rate
- Retention (D1, D7, D30)

**Tools:** Expo Analytics hoặc Firebase Analytics

### 9.2. Error Tracking
**Track:**
- Crashes
- API errors
- Audio playback failures
- AI generation timeouts

**Tools:** Sentry

### 9.3. Performance Monitoring
- App start time
- Screen load time
- API response time
- Audio latency

**Tools:** Firebase Performance

---

## 10. PHÂN GIAI ĐOẠN TRIỂN KHAI (ROADMAP)

### Phase 1: MVP (4-6 tuần)
| Week | Deliverable |
|------|-------------|
| W1-2 | Setup project, Auth, Navigation, UI foundation |
| W3 | Listening module (basic player) |
| W4 | Speaking module (basic recording + feedback) |
| W5 | Reading \u0026 Writing modules |
| W6 | Polish, Testing, Beta release |

**MVP Features:**
- ✅ Google Login
- ✅ 4 Skills basic functionality
- ✅ History timeline
- ✅ Basic offline support
- ✅ Light/Dark mode

### Phase 2: Enhanced UX (3-4 tuần)
- ✅ Offline mode advanced (download manager)
- ✅ Vocabulary system + flashcards
- ✅ Notifications
- ✅ Widgets
- ✅ Background audio
- ✅ Gestures \u0026 Voice commands

### Phase 3: Advanced Features (4-6 tuần)
- ✅ Car mode
- ✅ Bedtime mode
- ✅ Conversation roleplay
- ✅ Learning streak + Gamification
- ✅ Family leaderboard
- ✅ Calendar integration
- ✅ Screenshot translate

---

## 11. KẾT LUẬN

Tài liệu này định nghĩa **đầy đủ** yêu cầu cho phiên bản Mobile của ứng dụng StudyLanguage, đảm bảo:

✅ **Tính đầy đủ:** Bao gồm toàn bộ tính năng từ Web + Tính năng đặc thù Mobile
✅ **Tính rõ ràng:** UI mockup, flow chi tiết cho từng module
✅ **Tối ưu Mobile:** Gestures, voice, offline, battery-friendly
✅ **Trải nghiệm cao cấp:** Animation, haptic, notification thông minh
✅ **Khả thi kỹ thuật:** Công nghệ phù hợp (React Native, Expo, Supabase)

**Mục tiêu cuối cùng:** 
Người dùng có thể học tiếng Anh hiệu quả **mọi lúc, mọi nơi** với trải nghiệm Mobile đẳng cấp, mượt mà, và tiện lợi tối đa.

---

**Thầy Thành review và góp ý để đệ tử hoàn thiện thêm! 🚀**
