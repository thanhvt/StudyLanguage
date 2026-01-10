# TÀI LIỆU YÊU CẦU NGƯỜI DÙNG (USER REQUIREMENTS DOCUMENT)
**Dự án:** App Luyện Thi Tiếng Anh Đa Nền Tảng (AI-Powered)
**Phiên bản:** 3.0 (Supabase & New UI)
**Ngày:** 10/01/2026

---

## 1. TỔNG QUAN & PHẠM VI (OVERVIEW & SCOPE)
*   **Mục tiêu:** Xây dựng hệ thống học tiếng Anh 4 kỹ năng (Nghe, Nói, Đọc, Viết) sử dụng công nghệ AI để tạo nội dung và phản hồi.
*   **Nền tảng:**
    *   **Web App:** Quản lý, học tập trên màn hình lớn.
    *   **Mobile App (iOS/Android):** Học tập mọi lúc mọi nơi.
*   **Quy mô người dùng:** < 20 người (Personal & Family use).
*   **Định hướng kiến trúc:** Tối ưu hóa cho phát triển nhanh (Rapid Development) sử dụng nền tảng **Supabase** (Backend-as-a-Service) kết hợp với Web/Mobile Frontend.

---

## 2. YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

### 2.1. Nhóm Tính năng Nền tảng (Core System)
*   **Đăng ký/Đăng nhập:**
    *   Sử dụng **Google Login** (Google OAuth) là phương thức chính: Nhanh, tiện lợi, không cần nhớ mật khẩu.
    *   Hỗ trợ thêm Magic Link (Gửi link đăng nhập qua Email) nếu muốn login trên thiết bị lạ.
*   **Giao diện & Chủ đề (UI & Themes):**
    *   Hỗ trợ chuyển đổi **Light/Dark Mode**.
    *   Nút chuyển đổi rõ ràng trên cả Web & Mobile.
    *   Đồng bộ setting giữa các thiết bị (lưu preference vào DB).
    *   Hệ thống cho phép người dùng chọn màu chủ đạo (Accent Color) theo sở thích, bao gồm bộ sưu tập "Green Nature":
        1.  **Fresh Greens** (Mặc định): Xanh lá tươi mát (#4caf50), năng động.
        2.  **Leafy Green Garden:** Vườn xanh thanh bình (#10b981).
        3.  **Cool Waters:** Nước biển mát lạnh (#2196f3).
        4.  **Bright Green:** Xanh sáng năng động (#84cc16).
        5.  **Green Harmony:** Hài hòa (#22c55e).
        6.  **Spring Green Harmony:** Mùa xuân tươi trẻ (#34d399).
*   **Đa ngôn ngữ (i18n):** Tiếng Anh / Tiếng Việt.
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

*   **Visual Delight (Thỏa mãn thị giác):**
    *   Giao diện phải "W.O.W" ngay từ lần đầu mở: Sử dụng **Glassmorphism** (hiệu ứng kính mờ) nhẹ nhàng cho các thẻ bài học.
    *   Các thành phần Interactive (Button, Card) phải có hiệu ứng Hover, Active, và Ripple mượt mà.
*   **Smooth Motion (Chuyển động mượt mà):**
    *   Sử dụng thư viện Animation (như **Framer Motion** cho Web, **Reanimated** cho Mobile).
    *   Chuyển trang (Page Transition) không bị giật cục.
    *   Hiệu ứng "confetti" (pháo giấy) khi hoàn thành bài học để kích thích dopamine.
*   **Mobile First Design:** Nút bấm to, thao tác vuốt (swipe) tự nhiên trên Mobile. Tối ưu hóa cho ngón tay cái (Thumb-friendly) trên React Native App. Các nút bấm chính (Record, Play) phải to, dễ thao tác.
*   **AI Interaction:**
    *   Không để user chờ trong im lặng: Hiển thị animation "sóng âm" hoặc "AI đang suy nghĩ" sinh động trong lúc chờ response (2-5s).
*   **Minimalist Interface:** Tập trung vào nội dung học, giảm thiểu xao nhãng.
*   **Latency Perception:** Hiển thị Skeleton Loading hoặc Animation "AI is thinking..." thú vị trong lúc chờ AI generate nội dung (vì AI có thể mất 2-5s).
*   **Feedback Loop:** Rung nhẹ (Haptic Feedback) trên điện thoại khi chấm điểm hoặc hoàn thành bài học.

---

## 4. KIẾN TRÚC CÔNG NGHỆ & HẠ TẦNG (TECH STACK & INFRASTRUCTURE)

> **Cập nhật:** Thay thế hạ tầng tự quản lý bằng **Supabase** để tối ưu chi phí vận hành và tốc độ phát triển cho quy mô cá nhân/gia đình.

### 4.1. Application Stack
*   **Frontend Web:** **Next.js 14+** (React).
    *   Styling: **TailwindCSS** + **Shadcn/ui** (Bộ component đẹp, hiện đại, dễ dàng custom theme).
*   **Frontend Mobile:** **React Native** (với **Expo**).
    *   Styling: **NativeWind** (Tailwind cho React Native).
*   **Backend Logic:** **NestJS** (Deploy serverless hoặc container nhỏ).
    *   Vai trò: Chỉ đóng vai trò "Nhạc trưởng" gọi OpenAI API, xử lý business logic phức tạp (chấm điểm, phân tích). Không cần lo việc kết nối DB hay Auth (Supabase lo).
*   **Platform (BaaS):** **Supabase**.
    *   **Database:** Supabase Postgres (Thay thế VPS Postgres tự cài).
    *   **Auth:** Supabase Auth (Quản lý User, Login Google/Email).
    *   **Storage:** Supabase Storage (Lưu file ghi âm của user, file audio AI sinh ra).
    *   **Realtime:** Supabase Realtime (Nếu cần tính năng chat/hội thoại thời gian thực mượt hơn).

### 4.2. Hạ tầng & Triển khai (Infrastructure & Deployment)
*   **Supabase Cloud:**
    *   Sử dụng gói **Free Tier** (Cực kỳ dư dả cho < 20 users): 500MB database, 1GB file storage, 50,000 monthly active users.
    *   Không cần cài đặt Docker, không cần quản lý VPS DB, có sẵn backup, bảo mật, dashboard quản lý dữ liệu trực quan.
*   **Backend Hosting:**
    *   **Vercel** (cho Next.js Web) - Free Tier.
    *   **Render/Railway** (cho NestJS API) - Gói rẻ nhất (~$5/tháng) vì server rất nhẹ, chỉ forward request AI.
*   **Tổng chi phí dự kiến:** ~$0 - $5/tháng (Chủ yếu trả tiền OpenAI API theo usage).

### 4.3. Caching & Performance
*   Tận dụng **Supabase Edge Function** hoặc Caching layer của Next.js để cache các nội dung đại trà, giảm tải API call.

### 4.4. Yêu cầu Phi chức năng (Security & Auth)
*   **Authentication Provider:**
    *   **Chỉ định:** Sử dụng **Supabase Auth** tích hợp **Google**.
    *   **Lý do:** Đây là giải pháp "Zero-friction" (không ma sát) nhất cho user cá nhân. Bấm 1 nút là vào học ngay, đồng bộ mọi thiết bị. Không cần nhớ pass.
    *   Quản lý user: Chủ dự án (bạn) có thể vào Dashboard Supabase để xem/xóa user, rất tiện lợi.

---

## 5. TỔNG KẾT KHUYẾN NGHỊ (FINAL STACK)

| Hạng mục | Công nghệ/Giải pháp | Lý do chọn (So với phương án cũ) |
| :--- | :--- | :--- |
| **Web** | Next.js, Tailwind, Shadcn/ui | Giữ nguyên. Thêm Shadcn/ui để đảm bảo đẹp & theme dễ chỉnh. |
| **Mobile** | React Native (Expo) | Giữ nguyên. |
| **Database** | **Supabase Postgres** | Không cần tự cài/quản lý DB docker nữa. Có UI sẵn. |
| **Auth** | **Supabase Auth (Google)** | Đăng nhập Google tiện lợi thay vì code JWT thủ công. |
| **Storage** | **Supabase Storage** | Lưu file Audio dễ dàng, không tốn ổ cứng VPS. |
| **Backend** | NestJS (Lightweight) | Vẫn giữ để gọi AI, nhưng code sẽ gọn hơn nhiều. |
| **AI** | OpenAI (GPT-4o/Whisper) | Giữ nguyên. |

*Phương án này giúp bạn tập trung hoàn toàn vào việc làm tính năng học tập (Logic & UI) thay vì mất thời gian setup server, database, login.*
