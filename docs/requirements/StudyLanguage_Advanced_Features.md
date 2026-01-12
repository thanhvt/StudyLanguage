# TÀI LIỆU TÍNH NĂNG NÂNG CAO
**(Advanced Features for Maximum User Convenience)**

**Dự án:** App Luyện Thi Tiếng Anh Đa Nền Tảng  
**Giai đoạn:** Phase 3 (Sau khi hoàn thành Phase 2 - Passive Learning)  
**Trọng tâm:** Cá nhân hóa trải nghiệm, tối đa hóa sự tiện lợi và engagement

---

## 1. AI SMART COACH - HỌC CÁ NHÂN HÓA

### 1.1. Adaptive Learning Path (Lộ trình học thích ứng)
*Mục tiêu: Mỗi người học có lộ trình riêng, không ai giống ai.*

| Tính năng | Mô tả | Nền tảng |
|-----------|-------|----------|
| **Dynamic Difficulty** | AI tự động điều chỉnh độ khó dựa trên performance thực tế | Mobile & Web |
| **Skill Gap Analysis** | Phân tích điểm yếu từng kỹ năng (Listening/Speaking/Reading/Writing) | Web Dashboard |
| **Personalized Curriculum** | Tự động sinh bài học bổ sung cho các kỹ năng yếu | Mobile & Web |

**Cơ chế hoạt động:**
- User nói sai phát âm nhiều → AI tự động giảm tốc độ, thêm bài luyện âm cơ bản
- User làm tốt → Tự động nâng level, thêm từ vựng nâng cao
- Tracking: Lưu lại lịch sử performance để phân tích trend dài hạn

### 1.2. Weakness Detector (Phát hiện điểm yếu)
*Mục tiêu: Không lãng phí thời gian học những gì đã giỏi.*

- **Pattern Recognition:** AI phân tích các lỗi thường gặp (VD: hay sai thì quá khứ, phát âm "th", "r"...)
- **Auto-Generate Exercises:** Tự động tạo bài tập chữa cháy dựa trên điểm yếu
- **Weekly Weakness Report:** Báo cáo tuần tóm tắt các điểm cần cải thiện

### 1.3. Gamification & Motivation System
*Mục tiêu: Duy trì động lực học tập dài hạn.*

| Thành phần | Mô tả |
|------------|-------|
| **Learning Streak** | Đếm số ngày học liên tục, mất streak nếu nghỉ 1 ngày |
| **XP Points** | Điểm kinh nghiệm cho mỗi bài học hoàn thành |
| **Achievement Badges** | Huy hiệu đặc biệt (VD: "7-Day Warrior", "Pronunciation Master") |
| **Level System** | Từ Beginner → Intermediate → Advanced với visual progress |
| **Milestone Celebrations** | Animation confetti khi đạt milestone quan trọng |

---

## 2. VOICE-FIRST EXPERIENCE (TRẢI NGHIỆM ĐIỀU KHIỂN BẰNG GIỌNG NÓI)

### 2.1. Voice Commands (Lệnh thoại)
*Mục tiêu: Học mà không cần chạm điện thoại.*

**Nền tảng:** [Mobile Only]

| Lệnh | Hành động |
|------|-----------|
| "Hey Study, next" | Chuyển sang bài/câu tiếp theo |
| "Hey Study, repeat" | Phát lại câu vừa rồi |
| "Hey Study, slower" | Giảm tốc độ phát âm |
| "Hey Study, save this" | Lưu từ/câu vào danh sách ôn tập |
| "Hey Study, translate" | Dịch câu hiện tại sang tiếng Việt |
| "Hey Study, pause/play" | Tạm dừng hoặc tiếp tục |

**Lưu ý kỹ thuật:**
- Sử dụng on-device speech recognition để giảm latency
- Wake word "Hey Study" phải nhận diện chính xác, tránh false positive
- Có âm thanh phản hồi (beep) khi nhận lệnh thành công

### 2.2. Car Mode (Chế độ lái xe)
*Mục tiêu: An toàn tuyệt đối khi học trong xe.*

**Nền tảng:** [Mobile Only]

- **Auto-Activate:** Tự động bật khi kết nối Bluetooth xe hơi
- **UI:** Màn hình đen hoàn toàn hoặc chỉ hiện waveform đơn giản
- **Interaction:** 100% bằng giọng nói, không cần nhìn màn hình
- **Content:** Chỉ phát nội dung Listening, không yêu cầu Speaking (tránh mất tập trung)
- **Smart Volume:** Tự động điều chỉnh âm lượng theo tiếng ồn xe

### 2.3. Smart Pause (Tạm dừng thông minh)
*Mục tiêu: App "hiểu" khi nào user đang bận.*

- **Ambient Voice Detection:** Tự động pause khi phát hiện user đang nói chuyện với người khác
- **Phone Call Handling:** Tự động pause khi có cuộc gọi đến, resume sau khi kết thúc
- **Notification Awareness:** Pause khi user đang xem notification quan trọng

---

## 3. CONTEXT-AWARE LEARNING (HỌC THEO NGỮ CẢNH)

### 3.1. Location-based Content (Nội dung theo vị trí)
*Mục tiêu: Đúng nội dung, đúng lúc, đúng nơi.*

**Nền tảng:** [Mobile Only]

| Ngữ cảnh | Nội dung gợi ý |
|----------|----------------|
| **Sáng sớm (Commute)** | Tin tức ngắn, từ vựng nhanh, podcast nhẹ nhàng |
| **Buổi trưa (Lunch break)** | Bài đọc ngắn, quiz nhanh 5 phút |
| **Chiều tối (Way home)** | Ôn tập từ đã học trong ngày |
| **Tối (At home)** | Bài học dài hơn, Writing practice, Speaking practice |
| **Cuối tuần** | Nội dung giải trí: Phim, bài hát, truyện ngắn tiếng Anh |

### 3.2. Calendar Integration (Tích hợp lịch)
*Mục tiêu: Chuẩn bị trước cho các sự kiện quan trọng.*

**Nền tảng:** [Mobile & Web]

- **Meeting Prep:** Phát hiện lịch họp tiếng Anh → Gợi ý từ vựng chuyên ngành trước buổi họp
- **Travel Mode:** Phát hiện chuyến bay quốc tế → Gợi ý từ vựng sân bay, khách sạn, du lịch
- **Smart Scheduling:** Gợi ý thời điểm học tốt nhất dựa trên lịch trống

### 3.3. Screenshot Translate (Dịch từ ảnh chụp)
*Mục tiêu: Học từ mọi nơi trong cuộc sống.*

**Nền tảng:** [Mobile Only]

- User chụp màn hình bất kỳ văn bản tiếng Anh nào (email, app, web)
- Share vào StudyLanguage App
- AI sẽ:
  - Dịch toàn bộ nội dung
  - Highlight từ vựng nâng cao
  - Giải thích ngữ pháp phức tạp
  - Option: Lưu từ mới vào bộ flashcard

---

## 4. SOCIAL & ACCOUNTABILITY (XÃ HỘI & TRÁCH NHIỆM)

### 4.1. Family Leaderboard (Bảng xếp hạng gia đình)
*Mục tiêu: Tạo động lực cạnh tranh lành mạnh trong gia đình.*

**Nền tảng:** [Mobile & Web]

- Bảng xếp hạng theo tuần: Điểm XP, Streak, Số bài hoàn thành
- **Family Challenges:** Thử thách gia đình (VD: "Cả nhà cùng học 7 ngày liên tục")
- **Encouragement System:** Gửi "cheer" (cổ vũ) cho thành viên khác
- Phù hợp với target group < 20 users (gia đình + bạn bè)

### 4.2. Smart Notification (Thông báo thông minh)
*Mục tiêu: Nhắc nhở đúng lúc, không spam.*

**Nền tảng:** [Mobile Only]

| Loại thông báo | Thời điểm |
|----------------|-----------|
| **Daily Reminder** | Dựa trên thói quen học (VD: user hay học 8h tối → nhắc 7:55) |
| **Streak Warning** | Cảnh báo trước 2 giờ khi sắp mất streak |
| **Achievement Celebration** | Khi đạt milestone mới |
| **Personalized Tip** | Gợi ý dựa trên điểm yếu (1 lần/tuần) |

**Nguyên tắc:**
- Tối đa 2 notification/ngày
- Cho phép user tùy chỉnh hoàn toàn
- Không gửi vào giờ ngủ (22:00 - 07:00)

### 4.3. Progress Report (Báo cáo tiến độ)
*Mục tiêu: Nhìn lại hành trình học tập.*

**Nền tảng:** [Email + Web Dashboard]

- **Weekly Summary Email:** Gửi vào Chủ nhật
  - Số phút học
  - Từ vựng mới
  - Điểm số trung bình
  - So sánh với tuần trước
  - Điểm cần cải thiện
- **Monthly Deep Report:** Phân tích chi tiết hơn trên Web Dashboard
- **Year in Review:** Tổng kết cuối năm (giống Spotify Wrapped)

---

## 5. IMMERSIVE LEARNING TOOLS (CÔNG CỤ HỌC NHẬP VAI)

### 5.1. Conversation Roleplay (Đóng vai hội thoại)
*Mục tiêu: Luyện tập tình huống thực tế.*

**Nền tảng:** [Mobile & Web]

| Scenario | Mô tả |
|----------|-------|
| **Restaurant** | AI đóng vai waiter, user gọi món |
| **Job Interview** | AI đóng vai HR, user trả lời phỏng vấn |
| **Doctor Visit** | AI đóng vai bác sĩ, user mô tả triệu chứng |
| **Hotel Check-in** | AI đóng vai lễ tân, user đặt phòng |
| **Airport** | AI đóng vai nhân viên hải quan, user trả lời câu hỏi |

**Flow:**
1. User chọn scenario + độ khó
2. AI giới thiệu bối cảnh
3. Bắt đầu hội thoại tự nhiên (voice-to-voice)
4. AI đánh giá và cho feedback sau khi kết thúc

### 5.2. Pronunciation Comparison (So sánh phát âm)
*Mục tiêu: Thấy rõ sự khác biệt giữa giọng mình và giọng chuẩn.*

**Nền tảng:** [Mobile & Web]

- **Waveform Comparison:** Hiển thị sóng âm của AI vs User cạnh nhau
- **Phoneme Breakdown:** Phân tích từng âm tiết, highlight chỗ sai
- **Slow-mo Playback:** Phát chậm lại để nghe rõ sự khác biệt
- **Target Sound Practice:** Drill các âm khó (th, r, l, v...) với bài tập chuyên biệt

### 5.3. Vocabulary Network (Mạng lưới từ vựng)
*Mục tiêu: Học từ vựng theo cụm, không học lẻ.*

**Nền tảng:** [Web Focus, Mobile View]

- **Mind Map Visualization:** Hiển thị từ vựng dạng mạng lưới liên kết
- **Related Words:** Học "travel" → Tự động gợi ý "destination", "journey", "itinerary"...
- **Collocations:** Hiển thị các cụm từ đi kèm (VD: "make a decision", không phải "do a decision")
- **Word Family:** Noun → Verb → Adjective → Adverb (VD: success → succeed → successful → successfully)

---

## 6. ĐỘ ƯU TIÊN TRIỂN KHAI (IMPLEMENTATION PRIORITY)

### Phase 3.1 (Ưu tiên cao - High Impact, Medium Effort)
1. ✅ **Voice Commands** - Tăng convenience đáng kể
2. ✅ **Learning Streak + Gamification** - Tăng retention
3. ✅ **Adaptive Learning Path** - Cá nhân hóa trải nghiệm

### Phase 3.2 (Ưu tiên trung bình)
4. **Conversation Roleplay** - Tăng engagement
5. **Smart Notification** - Nhắc nhở thông minh
6. **Progress Report** - Tạo accountability

### Phase 3.3 (Ưu tiên thấp - Nice to have)
7. **Car Mode** - Specialized use case
8. **Calendar Integration** - Cần permission phức tạp
9. **Screenshot Translate** - Có thể dùng app khác thay thế

---

## 7. YÊU CẦU KỸ THUẬT BỔ SUNG

### 7.1. AI/ML Requirements
- On-device speech recognition cho Voice Commands (giảm latency)
- Pronunciation scoring model (có thể dùng OpenAI Whisper + custom scoring)
- User behavior analysis cho Adaptive Learning

### 7.2. Storage Requirements
- Thêm table lưu learning history, streak data, achievements
- Audio cache cho offline learning
- User preferences sync

### 7.3. Third-party Integrations
- Calendar API (Google Calendar, Apple Calendar)
- Push notification service (Firebase Cloud Messaging)
- Email service (cho Weekly Report)

---

*Tài liệu này bổ sung cho User Requirements v3.1 và Passive Learning Features, tạo thành bộ tính năng hoàn chỉnh cho StudyLanguage App.*
