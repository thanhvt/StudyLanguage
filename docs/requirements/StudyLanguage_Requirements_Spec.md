# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) - APP WEB HỌC TIẾNG ANH (AI INTEGRATED)

**Ngày tạo:** 10/01/2026
**Người lập:** Team Phân tích (BA, Tech Lead, BrSE)
**Trạng thái:** DRAFT v1.0

---

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)
Xây dựng một Web Application hỗ trợ học tiếng Anh toàn diện (Nghe, Nói, Đọc, Viết) tích hợp AI để tạo nội dung động và phản hồi cá nhân hóa. Ứng dụng tập trung vào trải nghiệm người dùng (UX) với giao diện hiện đại và tính năng nhắc nhở học tập.

## 2. PHÂN TÍCH TỪ TEAM CHUYÊN GIA (EXPERT ANALYSIS & RECOMMENDATIONS)

### 2.1. Góc độ BA (Business Analyst)
*   **Làm rõ tính năng Đọc & Viết:** Yêu cầu ban đầu chưa chi tiết 2 kỹ năng này. Team đề xuất bổ sung flow tương tự Nghe/Nói:
    *   *Viết:* AI ra đề -> User viết -> AI chấm điểm ngữ pháp, từ vựng.
    *   *Đọc:* Hiển thị văn bản -> User đọc (thu âm) -> AI check phát âm HOẶC AI tạo câu hỏi đọc hiểu.
*   **Cơ chế Nhắc nhở (Reminder):** Web App hạn chế về Push Notification trên iOS (nếu không cài Home Screen). Đề xuất sử dụng Email Reminder hoặc trình duyệt Notification API + Telegram Bot integration (nếu cần chắc chắn 100%).
*   **Quản lý lịch sử:** Cần tính năng xem lại lịch sử các bài hội thoại/luyện tập để user thấy tiến bộ.

### 2.2. Góc độ Tech Lead
*   **Công nghệ AI:**
    *   *STT (Speech-to-Text):* Sử dụng Whisper (OpenAI) hoặc Browser Native API (Web Speech API - miễn phí nhưng kém chính xác hơn) -> Khuyến nghị Whisper cho chất lượng cao.
    *   *TTS (Text-to-Speech):* ElevenLabs (chất lượng cao, đắt) hoặc OpenAI TTS.
    *   *LLM:* GPT-4o-mini hoặc GPT-3.5-turbo để cân bằng chi phí/tốc độ phản hồi.
*   **Performance:** Xử lý media (audio) cần tối ưu, tránh lag khi load nhạc nền + voice cùng lúc.
*   **Mobile First:** Vì là "App Web", giao diện phải Responsive tuyệt đối, thao tác chạm/vuốt mượt mà trên mobile.

### 2.3. Góc độ BrSE (Cầu nối)
*   **Độ chính xác của Input:** Cần validate (kiểm tra) input của user (VD: thời lượng nhập vào không quá dài để tránh bill AI tăng cao, VD: tối đa 15 phút).
*   **Hỗ trợ đa ngôn ngữ:** Chuẩn bị file resource `i18n` ngay từ đầu để switch En/Vi dễ dàng.

---

## 3. CHI TIẾT YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

### 3.1. Cài đặt & Hệ thống (System & Settings)
| ID | Tính năng | Mô tả chi tiết | Ghi chú |
| :--- | :--- | :--- | :--- |
| **SYS_01** | **Chế độ Sáng/Tối (Theme)** | - Toggle switch trên Header/Menu.<br>- Lưu trạng thái vào LocalStorage/Database.<br>- Màu sắc phải đạt chuẩn tương phản. | UX: Smooth transition khi chuyển đổi. |
| **SYS_02** | **Đa ngôn ngữ (En/Vi)** | - Chuyển đổi ngôn ngữ hiển thị của giao diện.<br>- Mặc định: Tiếng Việt. | Sử dụng thư viện i18n. |
| **SYS_03** | **Nhạc nền (Background Music)** | - Global Audio Player (ẩn hoặc thu nhỏ).<br>- Playlist nhạc không lời (Lofi, Baroque).<br>- Tự động nhỏ lại (ducking) khi AI nói hoặc User đang luyện nghe. | Audio Ducking rất quan trọng cho trải nghiệm. |
| **SYS_04** | **Nhắc nhở học tập (Daily Reminder)** | - User cài đặt giờ nhắc (VD: 20:00).<br>- Hệ thống gửi thông báo (Web Push/Email).<br>- Nội dung nhắc nhở sinh bởi AI (VD: "Hey Thanh, hôm nay chưa luyện Speaking đấy!"). | Cần xin quyền Notification. |

### 3.2. Phân hệ Luyện Nghe (Listening Mode)
| ID | Tính năng | Input | Output & Luồng xử lý |
| :--- | :--- | :--- | :--- |
| **LIS_01** | **Setup Hội thoại** | - Chủ đề (Topic)<br>- Thời lượng (Duration)<br>- Từ khóa (Keywords - Optional)<br>- Số người (mặc định 2)<br>- Chế độ Tương tác (Nghe thụ động / Tham gia) | Form setting rõ ràng, dễ hiểu. |
| **LIS_02** | **Sinh nội dung (Generate)** | *Input từ LIS_01* | - AI sinh kịch bản hội thoại.<br>- Chuyển văn bản thành giọng nói (TTS) với các giọng khác nhau cho các nhân vật. |
| **LIS_03** | **Player phát hội thoại** | *Audio File* | - Play/Pause, Rewind 5s.<br>- Hiển thị Transcript (có thể ẩn/hiện).<br>- Highlight câu đang nói (Karaoke effect). |
| **LIS_04** | **Tương tác (Interactive)** | *User Voice* | - Nếu chọn chế độ "Tham gia": AI dừng lại ở lượt lời của User -> User nói -> AI phản hồi tiếp. |

### 3.3. Phân hệ Luyện Nói (Speaking Mode)
| ID | Tính năng | Input | Output & Luồng xử lý |
| :--- | :--- | :--- | :--- |
| **SPK_01** | **Setup Bài nói** | - Chủ đề, Thời lượng mong muốn, Từ khóa. |  |
| **SPK_02** | **Sinh bài mẫu** | *Input từ SPK_01* | - AI sinh đoạn văn mẫu (Sample Text) chuẩn native.<br>- Hiển thị văn bản cho User chuẩn bị. |
| **SPK_03** | **Ghi âm & Luyện tập** | *Microphone* | - Nút "Bắt đầu nói" -> Ghi âm.<br>- Nút "Kết thúc" -> Gửi audio lên server. |
| **SPK_04** | **Đánh giá (Evaluation)** | *User Audio* | - STT chuyển audio user thành text.<br>- AI so sánh Text gốc vs User Text.<br>- AI chấm điểm: Phát âm, Trôi chảy, Độ chính xác.<br>- AI đưa ra "Actionable Feedback" (Góp ý cụ thể để sửa). |
| **SPK_05** | **Công cụ hỗ trợ** | - | - Nút "Nghe AI đọc mẫu" (TTS chuẩn).<br>- Nút "Luyện lại" (Clear kết quả cũ, làm lại). |

### 3.4. *ĐỀ XUẤT MỚI* - Phân hệ Luyện Đọc & Viết (Reading & Writing)
*Team đề xuất thêm để đủ 4 kỹ năng theo yêu cầu số 9.*

*   **Reading:** AI sinh một bài báo/câu chuyện ngắn theo chủ đề -> Tạo 5 câu hỏi trắc nghiệm (Reading Comprehension) -> User làm bài -> AI giải thích đáp án.
*   **Writing:** User chọn chủ đề -> AI đưa ra dàn ý (outline) -> User viết đoạn văn -> AI sửa lỗi ngữ pháp (Grammar Correction) và gợi ý từ vựng nâng cao (Paraphrasing).

---

## 4. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

1.  **Performance:** Thời gian phản hồi của AI (Text generation) < 3s. Thời gian generate Audio < 5s cho câu đầu tiên (Streaming).
2.  **UI/UX:** Giao diện Dark Mode chuẩn, màu sắc dịu mắt. Font chữ dễ đọc (Inter/Roboto). Layout Mobile-first.
3.  **Scalability:** Thiết kế module AI tách biệt để dễ dàng thay đổi Model (VD: chuyển từ OpenAI sang Claude hoặc Local LLM sau này).
4.  **Security:** Không lưu trữ voice user quá thời gian cần thiết (Privacy).

## 5. UI FLOW CƠ BẢN (DRAFT)

*   **Home Screen:** Dashboard (Ngày liên tiếp, Biểu đồ kỹ năng) + Quick Start (4 nút to: Nghe, Nói, Đọc, Viết).
*   **Listening Screen:**
    *   Step 1: Popup/Modal nhập setting.
    *   Step 2: Giao diện Player (Hình ảnh sóng âm hoặc Avatar nhân vật đang nói).
*   **Speaking Screen:**
    *   Split Screen: Trên là Text mẫu, Dưới là nút Micro to + Sóng âm khi nói.
    *   Result Screen: Điểm số to rõ, highlight các từ phát âm sai màu đỏ.

---
**Ghi chú cho đội Dev:**
*   Nên dử dụng Next.js (React) + TailwindCSS để đảm bảo UI đẹp và nhanh.
*   Backend có thể dùng NestJS hoặc tích hợp trực tiếp Next.js API Routes (Serverless) để gọi AI.
