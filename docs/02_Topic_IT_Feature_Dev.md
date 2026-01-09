# Topic: IT Meeting - Product Feature Development
**Chủ đề**: Cuộc họp phát triển tính năng sản phẩm (Feature Development Meeting)
**Độ khó**: Intermediate - Advanced
**Thời lượng hội thoại ước tính**: 20-30 phút

---

## 1. Prompt Để Tạo Hội Thoại Mới (Dành cho Thành Brother tự luyện)
Copy đoạn prompt này ném vào ChatGPT/Claude để nó tạo ra các bài mới mỗi ngày:

> "Act as a scriptwriter for an English learning course for IT professionals. Write a realistic, 20-minute dialogue (approx. 2000 words) between a Product Owner (Sarah), a Backend Lead (Thanh), and a Frontend Dev (Mike).
>
> **Context**: They are discussing the implementation of a new [User Story: e.g., 'Google Login Integration' or 'Real-time Chat'].
> **Goal**: Clarify requirements, discuss technical challenges (API, database, security), and agree on the timeline.
> **Style**: Professional but casual tech workplace tone. Use idioms and phrasal verbs.
> **Requirement**: Include conflicts (e.g., PO wants it fast, Dev worries about technical debt).
> After the dialogue, list 20 key vocabulary/phrases with definitions and Vietnamese translation."

---

## 2. Kịch Bản Mẫu: "Implementing Two-Factor Authentication (2FA)"

### 📌 Context (Bối cảnh)
Team đang trong buổi **Sprint Planning**. Sarah (PO) muốn đẩy tính năng 2FA ra sớm để chiều lòng khách hàng Enterprise. Thành (Backend Lead) lo ngại về việc tích hợp với hệ thống Legacy User Service. Mike (Frontend) cần API Specs.

### 👥 Characters
- **Sarah (PO)**: Focus on value, timeline, user experience.
- **Thanh (You - Integration Lead)**: Focus on security, stability, architecture.
- **Mike (Frontend)**: Focus on UI screens, error handling, API response.

---

### 🎙️ PART 1: The Requirement (5 mins)

**Sarah**: Alright folks, let's get started. As you know, the big ticket item for this sprint is the **2FA (Two-Factor Authentication)** implementation. Our Enterprise clients are **breathing down my neck** for this. we need to ship an MVP by the end of the month.

**Thanh**: Hey Sarah. I’ve looked at the **PRD (Product Requirement Document)**. It looks straightforward on paper, but I have some concerns about the **backend integration**. Our current User Service is a bit of a **monolith**, and **decoupling** the auth logic might take longer than two weeks.

**Mike**: Connect to that, from the frontend side, are we using SMS, Email, or an Authenticator App (like Google Auth)? This impacts the UI flow significantly.

**Sarah**: Good point, Mike. For MVP, let's stick to **SMS OTP** (One-Time Password) since it's the most requested. We can add TOTP (Time-based One-Time Password) in Q2.

**Thanh**: Converting to SMS adds complexity. We need to integrate with a third-party provider like Twilio or AWS SNS. Have we **secured the budget** for that? Also, we need to handle **rate limiting** so bots don't drain our credits.

### 🎙️ PART 2: Technical Deep Dive (10 mins)

**Sarah**: Valid concerns, Thanh. Assume budget is approved. What’s the **technical overhead**?

**Thanh**: Well, first, I need to **refactor** the `LoginController`. Right now, it issues a JWT (JSON Web Token) immediately after password verification. I need to change that flow:
1. Verify password.
2. Generate a temporary "pre-auth" token.
3. Trigger SMS.
4. Verify OTP.
5. Finally issue the real Access Token.

**Mike**: Wait, Thanh. Does that mean the current login endpoint will change?

**Thanh**: Yes. It’s a **breaking change**. I’ll need to version the API. Let’s create `POST /api/v2/auth/login`.

**Mike**: Okay. So on the UI, I’ll need a multi-step form. Step 1: Username/Password. Step 2: Input OTP.
What about **error handling**? What if the SMS fails to deliver?

**Thanh**: Good catch. The backend will return a specific error code, say `OTP_SEND_FAILED`. You should show a "Resend OTP" button that enables after 30 seconds. I'll implement a **cooldown period** on the server side too.

**Sarah**: Sounds like a solid plan. But Thanh, regarding the **refactoring**, are we risking any **regression** on the existing users who don't enable 2FA?

**Thanh**: That's the **tricky part**. The system must support both flows simultaneously. I’ll use a **Feature Flag** to toggle this. We won't break existing users. But I'll need to write extensive **unit tests** and **integration tests**.

### 🎙️ PART 3: Estimation & Trade-offs (5 mins)

**Sarah**: Okay, so talking numbers. Can we fit this in Sprint 14?

**Mike**: Frontend needs about 3 days. 1 day for UI mockups, 2 days for implementation and connecting to the new API.

**Thanh**: Backend is heavier.
- Provider integration: 2 days.
- Refactoring Login Flow: 3 days.
- Testing & Security Audit: 2 days.
Total is 7 man-days. If I pull Dat into this, we can parallelize.

**Sarah**: That pushes us tight against the deadline. Is there anything we can **cut** from the scope?

**Thanh**: We could skip the "Remember this device for 30 days" feature for now. Every time they login, they ask for OTP. It’s annoying but safe.

**Sarah**: Agreed. Let's **descoped** the "Remember Device" feature. We will add it as a "fast follow" in the next sprint.

**Thanh**: Deal. I will update the **Swagger documentation** by tomorrow noon so Mike can start mocking the data.

**Mike**: Perfect. "Good chop", team! (Just kidding). Let's do this.

**Sarah**: Thanks everyone. Meeting adjourned.

---

## 3. Phân Tích Từ Vựng (Vocabulary Breakdown)

### General Tech/Business Idioms
- **"Breathing down my neck"**: (Thành ngữ) - Ý chỉ việc bị ai đó (sếp/khách hàng) hối thúc, kiểm soát gắt gao.
- **"Big ticket item"**: (Danh từ) - Hạng mục quan trọng nhất, lớn nhất.
- **"Fast follow"**: (Danh từ) - Một tính năng nhỏ được làm ngay sau khi tính năng chính release.

### Technical Terms (Chuyên ngành)
- **Technical Debt**: (Nợ kỹ thuật) - Code viết ẩu để chạy được nhanh, sau này phải sửa lại rất cực.
- **Monolith**: (Nguyên khối) - Kiến trúc phần mềm một cục, khó tách rời.
- **Refactor**: (Tái cấu trúc) - Viết lại code cho sạch/tốt hơn mà không đổi logic nghiệp vụ.
- **Breaking Change**: (Thay đổi phá vỡ) - Cập nhật mới làm hỏng code cũ (VD: đổi tên API field).
- **Regression**: (Hồi quy) - Lỗi xuất hiện ở tính năng cũ do code mới gây ra.
- **Happy Path**: (Luồng trơn tru) - Kịch bản người dùng dùng đúng, không lỗi.

### Câu "Thần Thánh" Nên Học Thuộc
1. *"I have some concerns about the backward compatibility."* (Tôi hơi lo về tính tương thích ngược.)
2. *"Can we descoped this feature to meet the deadline?"* (Chúng ta cắt bớt cái này để kịp tiến độ được không?)
3. *"Let's take this offline."* (Thôi cái này bàn riêng sau nhé - dùng khi tranh luận quá chi tiết trong họp chung.)

---
*Ghi chú cho huynh đệ Thành: Hãy dùng app Voice của ChatGPT, paste đoạn prompt ở phần 1 vào và bảo nó "Let's roleplay this", huynh đệ đóng vai Thanh. Cực phê!*
