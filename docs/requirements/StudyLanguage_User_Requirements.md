# TÀI LIỆU YÊU CẦU NGƯỜI DÙNG (USER REQUIREMENTS DOCUMENT)
**Dự án:** App Luyện Thi Tiếng Anh Đa Nền Tảng (AI-Powered)
**Phiên bản:** 2.0 (Final)
**Ngày:** 10/01/2026

---

## 1. TỔNG QUAN & PHẠM VI (OVERVIEW & SCOPE)
*   **Mục tiêu:** Xây dựng hệ thống học tiếng Anh 4 kỹ năng (Nghe, Nói, Đọc, Viết) sử dụng công nghệ AI để tạo nội dung và phản hồi.
*   **Nền tảng:**
    *   **Web App:** Quản lý, học tập trên màn hình lớn.
    *   **Mobile App (iOS/Android):** Học tập mọi lúc mọi nơi.
*   **Quy mô người dùng:** < 20 người (Personal & Family use).
*   **Định hướng kiến trúc:** Monolith, tối ưu chi phí, dễ triển khai/bảo trì. **KHÔNG** sử dụng Microservices hay Kubernetes.

---

## 2. YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

### 2.1. Nhóm Tính năng Nền tảng (Core System)
*   **Đăng ký/Đăng nhập:** Cơ bản (Email/Password).
*   **Chế độ Giao diện (Theme):**
    *   Hỗ trợ **Light/Dark Mode**.
    *   Nút chuyển đổi rõ ràng trên cả Web & Mobile.
    *   Đồng bộ setting giữa các thiết bị (lưu preference vào DB).
*   **Đa ngôn ngữ (i18n):**
    *   Tùy chọn ngôn ngữ hiển thị: Tiếng Anh / Tiếng Việt.
*   **Nhạc nền (Background Music):**
    *   Tích hợp kho nhạc Lofi/Baroque nhẹ nhàng.
    *   **Smart Ducking:** Tự động giảm âm lượng khi phát bài nghe hoặc AI nói.

### 2.2. Nhóm Tính năng Kỹ năng (4 Skills)

#### A. Luyện Nghe (Listening) - "Smart Conversation"
1.  **Cấu hình:** User chọn Chủ đề, Thời lượng, Số người tham gia (Mặc định: 2), Keyworks (Tùy chọn).
2.  **Chế độ:**
    *   *Thụ động (Podcast):* AI tự tạo hội thoại và phát liên tục.
    *   *Tương tác (Interactive):* Tham gia vào hội thoại, AI dừng chờ user trả lời.
3.  **Output AI:** Audio hội thoại tự nhiên (TTS), Scirpt chạy chữ (Karaoke style).

#### B. Luyện Nói (Speaking) - "AI Coach"
1.  **Cấu hình:** Chủ đề, Thời lượng, Keywords.
2.  **Chuẩn bị:** AI sinh đoạn văn mẫu (Sample Script) để user luyện tập trước.
3.  **Luyện tập (Action):**
    *   Nút "Ghi âm" (Hold-to-record trên Mobile).
    *   Nút "AI Phát âm mẫu" để nghe giọng chuẩn.
4.  **Đánh giá (Feedback):**
    *   AI chấm điểm (Phát âm, Ngữ điệu).
    *   Chỉ rõ từ sai và cách sửa.
    *   Tính năng "Luyện lại" (Retry) để nói lại câu đó.

#### C. Luyện Đọc (Reading) - "Active Reading"
1.  **Cấu hình:** Chủ đề, Độ khó (Cơ bản/Nâng cao).
2.  **Nội dung:** AI sinh bài đọc (Article/Story).
3.  **Kiểm tra:** AI sinh 3-5 câu hỏi đọc hiểu (Trắc nghiệm/Tự luận).
4.  **Hỗ trợ:** Click vào từ vựng để tra nghĩa nhanh (Dictionary Lookup).

#### D. Luyện Viết (Writing) - "Writing Assistant"
1.  **Chế độ:** Viết theo chủ đề (Topic-based) hoặc Viết nhật ký (Daily Journal).
2.  **Thực hiện:** User nhập văn bản.
3.  **Sửa lỗi:** AI highlight lỗi ngữ pháp, từ vựng chưa hay.
4.  **Gợi ý:** AI đề xuất cách viết lại (Paraphrase) cho hay hơn, "Tây" hơn (Native-like).

---

## 3. TRẢI NGHIỆM NGƯỜI DÙNG (UX REQUIREMENTS)

*   **Mobile First Design:** Tối ưu hóa cho ngón tay cái (Thumb-friendly) trên React Native App. Các nút bấm chính (Record, Play) phải to, dễ thao tác.
*   **Minimalist Interface:** Tập trung vào nội dung học, giảm thiểu xao nhãng.
*   **Latency Perception:** Hiển thị Skeleton Loading hoặc Animation "AI is thinking..." thú vị trong lúc chờ AI generate nội dung (vì AI có thể mất 2-5s).
*   **Feedback Loop:** Rung nhẹ (Haptic Feedback) trên điện thoại khi chấm điểm hoặc hoàn thành bài học.

---

## 4. KIẾN TRÚC CÔNG NGHỆ & HẠ TẦNG (TECH STACK & INFRASTRUCTURE)

> **Lời khuyên từ Tech Lead:** Với quy mô < 20 người, chúng ta ưu tiên sự đơn giản, chi phí thấp (Cost-effective) và tốc độ phát triển (Development Speed). Việc dùng AWS EKS/K8s là thừa thãi và lãng phí tài nguyên cũng như công sức vận hành (Ops).

### 4.1. Application Stack
*   **Frontend Web:** **Next.js** (React).
    *   Ưu điểm: SEO tốt (nếu cần public sau này), Performance cao, Code cứng cáp.
*   **Mobile App:** **React Native** (Sử dụng framework **Expo**).
    *   Ưu điểm: Dùng chung logic JS/TS với Web, build nhanh cho iOS/Android, cộng đồng lớn.
*   **Backend:** **NestJS**.
    *   Ưu điểm: Kiến trúc module rõ ràng, TypeScript strict type (đồng bộ DTO với Frontend), dễ bảo trì.
*   **Database:** **PostgreSQL**.
    *   Ưu điểm: Ổn định, mạnh mẽ, hỗ trợ tốt JSON (nếu cần lưu config động của AI).
*   **AI Integration:** Sử dụng OpenAI API (GPT-4o-mini & Whisper & TTS) thông qua Backend (để bảo mật API Key).

### 4.2. Hạ tầng & Triển khai (Infrastructure & Deployment)
*   **Kiến trúc:** **Monolith Modular** (Một cục Backend nhưng code chia module rõ ràng). Không dùng Microservices.
*   **Containerization:** **Docker** & **Docker Compose**.
    *   Đóng gói Backend, DB vào các container để môi trường Dev và Prod giống hệt nhau.
*   **Môi trường (Environments):**
    *   **Dev:** Localhost (PC của bạn). Chạy Docker Compose up `db`, `backend`. Web/Mobile chạy `npm run dev`.
    *   **Production:** 01 VPS Linux (Ubuntu) - Cấu hình khoảng 2 CPU, 4GB RAM (Chi phí ~$20/tháng). Setup Docker Compose để chạy tất cả.
        *   Tùy chọn tiết kiệm hơn: Backend deploy lên **Render/Railway** (gói Hobby/Pro), Frontend deploy lên **Vercel** (Free for hobby).
*   **Không sử dụng:**
    *   Kubernetes (K8s), EKS: Quá phức tạp và đắt đỏ cho 20 user.
    *   AWS services phức tạp (RDS, ElastiCache) nếu muốn tiết kiệm. Cài DB trực tiếp trên VPS (có backup định kỳ) là đủ.

### 4.3. Caching & Performance
*   **Cache Strategy:** Sử dụng **Redis** (Optional).
    *   Mục đích: Cache các response của AI nếu user request lại cùng một chủ đề/keyword để tiết kiệm tiền AI API.
    *   Nếu không muốn cài Redis: Có thể dùng In-memory cache của NestJS cho scope nhỏ.

### 4.4. Yêu cầu Phi chức năng (Non-functional)
*   **Bảo mật:**
    *   JWT Authentication.
    *   Không lưu trữ Audio giọng nói user vĩnh viễn (xóa sau khi chấm điểm xong hoặc sau 24h) để tiết kiệm dung lượng ổ cứng VPS.
*   **Sao lưu (Backup):** Script tự động backup Database ra file dump mỗi ngày 1 lần.

---

## 5. TỔNG KẾT KHUYẾN NGHỊ

| Hạng mục | Công nghệ/Giải pháp | Lý do chọn |
| :--- | :--- | :--- |
| **Web** | Next.js + TailwindCSS | Chuẩn, đẹp, nhanh. |
| **Mobile** | React Native (Expo) | Cross-platform, tận dụng code JS. |
| **Backend** | NestJS | Cấu trúc chuẩn Enterprise, Type-safe. |
| **Database** | PostgreSQL | Quan hệ chặt chẽ, phổ biến. |
| **Server** | 1 VPS Linux (Docker Compose) | Đơn giản nhất, rẻ nhất, dễ kiểm soát. |
| **AI Model** | GPT-4o-mini + Whisper | Cân bằng tốt nhất giữa Giá/Chất lượng. |

*Tài liệu này dùng làm căn cứ "đặt hàng" chính thức cho đội ngũ phát triển.*
