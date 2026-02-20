# TÀI LIỆU TÍNH NĂNG MỞ RỘNG: HỌC THỤ ĐỘNG & TRẢI NGHIỆM DI ĐỘNG
**(Enhanced Passive Learning & Mobile Experience Features)**

**Dự án:** App Luyện Thi Tiếng Anh Đa Nền Tảng
**Giai đoạn:** Phase 2 (Sau khi hoàn thành các chức năng cốt lõi)
**Trọng tâm:** Tối ưu hóa cho việc học trong "thời gian chết" (di chuyển, xe bus, trước khi ngủ) mà không cần nhìn màn hình (Eyes-free) hoặc không cần chạm tay nhiều (Hands-free).

---

## 1. PHÂN BỐ NỀN TẢNG (PLATFORM STRATEGY)

Do đặc thù của việc học thụ động là diễn ra khi người dùng không ngồi cố định, **90% các tính năng này sẽ hoạt động trên Mobile App**. Web App chủ yếu đóng vai trò cấu hình hoặc xem lại dữ liệu chuyên sâu.

| Nhóm Tính Năng | Mobile App (iOS/Android) | Web App (Desktop) | Lý do |
| :--- | :--- | :--- | :--- |
| **Smart Listening** | **Chính (Core)** | Phụ (Nghe khi làm việc) | Người dùng nghe khi di chuyển. |
| **Pocket/Gesture Mode** | **Duy nhất** | Không | Web dùng chuột, không cần chế độ này. |
| **Headphone Controls** | **Duy nhất** | Không | Web ít dùng nút tai nghe để điều khiển sâu. |
| **Bedtime Mode** | **Chính** | Không | Người dùng không ôm laptop lên giường ngủ. |
| **Widget/Lockscreen** | **Duy nhất** | Không | Đặc thù hệ điều hành Mobile. |
| **Cấu hình Content** | Có | **Chính (Core)** | Cài đặt sở thích trên Web nhanh & tiện hơn. |

---

## 2. CHI TIẾT TÍNH NĂNG (FEATURE SPECIFICATIONS)

### 2.1. Trải nghiệm Nghe Thông Minh (Smart Audio Experience)
*Mục tiêu: Biến ứng dụng thành một đài Radio cá nhân, không cần chọn bài thủ công.*

#### A. Smart Playlist Generator (Tạo Playlist Thông Minh) - [Mobile & Web]
*   **Mô tả:** Thay vì nghe 1 bài hội thoại lặp lại, hệ thống mix nội dung thành luồng âm thanh liên tục (30-60 phút).
*   **Cấu trúc Playlist mẫu:**
    1.  Intro chào mừng & Tóm tắt thời tiết/tin ngắn (tạo cảm giác thân thuộc).
    2.  **Bài hội thoại mới (Main Lesson).**
    3.  Nhạc thư giãn (Break) - 1 phút.
    4.  **Ôn tập từ vựng cũ (Spaced Repetition Review)** - Audio flashcard.
    5.  **Tin tức tóm tắt (Daily News Brief):** AI tóm tắt tin tức user quan tâm (Bóng đá, Tech) thành tiếng Anh đơn giản.
*   **Hành vi:**
    *   **Mobile:** Tự động tải trước (Pre-load) khi có WiFi.

#### B. Shadowing Gaps (Khoảng lặng thông minh) - [Mobile Focus]
*   **Mô tả:** Chế độ luyện nói nhại lại mà không cần bấm Pause.
*   **Cơ chế:**
    *   AI đọc câu A.
    *   *Silence (Im lặng)*: Độ dài = (Thời lượng câu A) x 1.5.
    *   AI đọc câu B.
*   **Setting:** User có thể bật/tắt chế độ này ngay trên màn hình Player.

---

### 2.2. Tương tác & Điều khiển (Interaction & Controls)
*Mục tiêu: Điều khiển ứng dụng khi điện thoại đang trong túi quần hoặc đang đi bộ.*

#### A. Headphone Key Mapping (Điều khiển bằng Tai nghe) - [Mobile Only]
Tận dụng nút bấm trên tai nghe (Wired hoặc Bluetooth) để học mà không cần lôi điện thoại ra.
*   **Bấm 1 lần:** Play / Pause.
*   **Bấm 2 lần:** Next (Qua bài/câu tiếp theo).
*   **Bấm 3 lần (Quan trọng):** "Mark to Review" (Lưu lại câu/từ vựng hiện tại vào danh sách "Cần xem lại").
    *   *Feedback:* Có âm thanh "Ting" nhẹ để báo đã lưu thành công.
    *   Về nhà user mở Web/App ra sẽ thấy danh sách các từ đã mark lúc đi đường.

#### B. Pocket Mode (Chế độ Túi quần/Đi bộ) - [Mobile Only]
Giao diện tối giản khi phát hiện người dùng đang di chuyển.
*   **UI:** Màn hình đen hoặc tối giản tối đa. Chỉ hiện 1 từ vựng hoặc câu đang đọc với Font chữ cực lớn (High contrast).
*   **Gestures (Cử chỉ):** Bỏ qua các nút bấm nhỏ, sử dụng vuốt toàn màn hình.
    *   Vuốt Trái/Phải: Back/Next.
    *   Chạm 2 ngón: Play/Pause.
    *   Vuốt lên: Đánh dấu (Save).
*   **Lợi ích:** An toàn khi đi bộ, không cần nhìn chăm chú vào màn hình.

---

### 2.3. Chế độ Trước khi ngủ (Bedtime / Sleep Mode)
*Mục tiêu: Học nhẹ nhàng để đi vào giấc ngủ, tránh ánh sáng xanh.*

*   **Nền tảng:** **[Mobile Only]**
*   **Ultra-Dark UI:** Giao diện chuyển sang nền đen tuyệt đối (OLED Black), chữ chuyển màu **Amber (Hổ phách)** hoặc **Đỏ sẫm** để không gây ức chế Melatonin (hormone gây buồn ngủ).
*   **Soothing Voice (Giọng ru):** AI tự động chuyển sang Tone giọng trầm, chậm, nhẹ nhàng hơn (Whisper style).
*   **Smart Sleep Timer:**
    *   Hẹn giờ tắt (ví dụ 30 phút).
    *   **Fade Core:** 5 phút cuối cùng, âm lượng giảm dần về 0.
    *   Nội dung chuyển dần từ Hội thoại -> Nhạc không lời/White Noise trong những phút cuối.

---

### 2.4. Học Thụ động qua Màn hình khóa (Passive Reading)
*Mục tiêu: Tận dụng mỗi lần rút điện thoại ra xem giờ.*

*   **Nền tảng:** **[Mobile Only]** (iOS Widgets / Android Widgets & Lockscreen).
*   **Tính năng:** Widget hiển thị "Word of the Commute" (Từ vựng của chuyến đi).
    *   Mỗi 30 phút (hoặc mỗi lần mở máy) hiển thị 1 từ vựng/câu mẫu trong bài học đang dở dang.
    *   User chỉ cần nhìn lướt qua (Glance) là học được, không cần mở App.

---

### 2.5. Cấu hình & Dữ liệu (Configuration & Data)

#### A. Web Dashboard (Trung tâm điều khiển) - [Web Focus]
*   Dù học trên Mobile, nhưng việc *setup* playlist nên làm trên Web cho nhanh.
*   **Content Preferences:** Chọn chủ đề tin tức (Tech, Health, Sport) để AI chuẩn bị bài nghe Daily News.
*   **Review Marked Items:** Xem lại danh sách các từ vựng đã bấm "Mark" (Bấm 3 lần tai nghe) trong ngày. Tại đây user có thể edit, thêm ghi chú chi tiết.

#### B. Sync Architecture (Cơ chế đồng bộ)
*   **Position Sync:** Đang nghe dở trên Web ở công ty -> Mở Mobile App trên xe bus nghe tiếp đúng đoạn đó.
*   **Pre-fetch:** Mobile App tự động tải trước (Prefetch) 1 Playlist vào buổi sáng (khi có Wifi nhà) để sẵn sàng cho chuyến đi.
