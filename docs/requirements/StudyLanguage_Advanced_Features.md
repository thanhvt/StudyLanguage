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

### 2.3. Smart Pause (Tạm dừng thông minh)
*Mục tiêu: App "hiểu" khi nào user đang bận.*

- **Ambient Voice Detection:** Tự động pause khi phát hiện user đang nói chuyện với người khác
- **Phone Call Handling:** Tự động pause khi có cuộc gọi đến, resume sau khi kết thúc
- **Notification Awareness:** Pause khi user đang xem notification quan trọng

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
8. **Screenshot Translate** - Có thể dùng app khác thay thế

---

## 7. YÊU CẦU KỸ THUẬT BỔ SUNG

### 7.1. AI/ML Requirements
- On-device speech recognition cho Voice Commands (giảm latency)
- Pronunciation scoring model (có thể dùng OpenAI Whisper + custom scoring)
- User behavior analysis cho Adaptive Learning

### 7.2. Storage Requirements
- Thêm table lưu learning history, streak data, achievements
- Audio cache cho learning
- User preferences sync

### 7.3. Third-party Integrations

- Email service (cho Weekly Report)

---

*Tài liệu này bổ sung cho User Requirements v3.1 và Passive Learning Features, tạo thành bộ tính năng hoàn chỉnh cho StudyLanguage App.*
