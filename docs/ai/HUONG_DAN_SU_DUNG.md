# Hướng Dẫn Sử Dụng Skills, Agents và Workflows cho StudyLanguage

> **Dự án StudyLanguage** - Ứng dụng học ngôn ngữ với AI
>
> **Tech Stack:** Next.js 16 (Web) + NestJS 11 (API) + React Native (Mobile) + Supabase + TypeScript + Tailwind v4

---

## 📋 Mục Lục

1. [Bảng Tra Cứu Nhanh (Quick Reference)](#-bảng-tra-cứu-nhanh)
2. [Skills (43 công cụ)](#-skills-hệ-thống-công-cụ-chuyên-biệt)
3. [Agents (16 trợ lý ảo)](#-agents-các-trợ-lý-ảo-chuyên-môn)
4. [Workflows (11 quy trình)](#-workflows-các-quy-trình-chuẩn)

---

## 📊 Bảng Tra Cứu Nhanh

### Theo Loại Công Việc
| Công việc | Agent đề xuất | Workflow |
|-----------|---------------|----------|
| **Thiết kế UI chuyên nghiệp** | `@frontend-specialist` | `/ui-ux-pro-max` |
| **Làm Mobile App** | `@mobile-developer` | `/create` (chọn template mobile) |
| **Tạo API Backend** | `@backend-specialist` | `/create` (chọn template api) |
| **Sửa lỗi/Debug** | `@debugger` | `/debug` |
| **Khám phá Project mới** | `@explorer-agent` | `/status` |
| **Bảo mật/Security Audit** | `@security-auditor` | - |
| **Deploy App** | `@devops-engineer` | `/deploy` |
| **Feature phức tạp** | `@orchestrator` | `/orchestrate` |
| **SEO/Content** | `@seo-specialist` | - |

---

## 🧠 Skills: Hệ Thống Công Cụ Chuyên Biệt

Skills được các agents tự động load khi cần thiết.

### 📱 Frontend & Mobile
- `ui-ux-pro-max`: Thư viện 50 styles, 21 palettes, 50 fonts.
- `mobile-design`: Nguyên lý thiết kế React Native/Flutter (Touch, Gestures).
- `i18n-localization`: Đa ngôn ngữ, RTL support.
- `frontend-design`, `react-patterns`, `tailwind-patterns`.

### 🛠 Backend & Architecture
- `nestjs-expert`: Chuyên gia NestJS modules, DI, Guards.
- `database-design`: Thiết kế Schema tối ưu.
- `prisma-expert`: ORM & Migrations.
- `api-patterns`: REST/GraphQL design standards.
- `architecture`: Các mẫu thiết kế hệ thống (Decision making).

### 🛡 Security & DevOps
- `security-auditor`: Kiểm tra lỗ hổng bảo mật (OWASP).
- `docker-expert`: Containerization & Optimization.
- `deployment-procedures`: CI/CD & Production release.
- `systematic-debugging`: Quy trình tìm lỗi khoa học.

### 🚀 Productivity
- `app-builder`: Templates tạo dự án (CLI, Monorepo, SaaS...).
- `plan-writing`: Viết kế hoạch task chi tiết.
- `brainstorming`: Kỹ thuật đặt câu hỏi Socratic.

---

## 🤖 Agents: Các Trợ Lý Ảo Chuyên Môn

Hệ thống có **16 agents** chia thành các nhóm sau:

### 🌟 Core Development (Đội ngũ nòng cốt)
1. **`frontend-specialist`**: UI/UX, React, Next.js, Tailwind.
2. **`backend-specialist`**: API, Database logic, Auth, NestJS.
3. **`mobile-developer`**: React Native, iOS/Android native features.
4. **`database-architect`**: SQL, Schema optimization, Migrations.

### 🛡 Security & Operations (Bảo vệ & Vận hành)
5. **`security-auditor`**: Defensive security, audit lỗ hổng.
6. **`penetration-tester`**: Offensive security (Red Team), giả lập tấn công.
7. **`devops-engineer`**: Deployment, Server, CI/CD pipelines.
8. **`test-engineer`**: Viết Unit/E2E tests, TDD.

### 🔭 Analysis & Planning (Phân tích & Kế hoạch)
9. **`project-planner`**: Lên kế hoạch, chia nhỏ task, quản lý dependencies.
10. **`explorer-agent`**: Audit codebase, tìm hiểu kiến trúc dự án lạ.
11. **`debugger`**: Chuyên gia sửa lỗi, tìm nguyên nhân gốc rễ (Root Cause Analysis).
12. **`performance-optimizer`**: Tối ưu tốc độ, Web Vitals, Bundle size.

### 🧩 Specialized (Chuyên môn hẹp)
13. **`seo-specialist`**: SEO & GEO (tối ưu cho AI search engines).
14. **`game-developer`**: Làm game (Unity, WebGL, Canvas).
15. **`orchestrator`**: Điều phối nhiều agent cho task cực lớn.
16. **`documentation-writer`**: Viết tài liệu kỹ thuật (Chỉ dùng khi được yêu cầu).

---

## 🔄 Workflows: Các Quy Trình Chuẩn

Sử dụng lệnh `/command` để bắt đầu quy trình.

### 🛠 Development Workflows
1. **`/ui-ux-pro-max`** ⭐: Quy trình thiết kế UI chuẩn mực (Search style -> Apply).
2. **`/create`**: Tạo ứng dụng/module mới (Interactive wizard).
3. **`/enhance`**: Cải tiến code hiện có (Refactor, Add feature).
4. **`/debug`**: Kích hoạt chế độ debug hệ thống.
5. **`/test`**: Chạy và viết test tự động.

### 📅 Planning & Management Workflows
6. **`/brainstorm`**: Tìm ý tưởng, làm rõ yêu cầu (Socratic method).
7. **`/plan`**: Lên kế hoạch implementation chi tiết (ra file `implementation_plan.md`).
8. **`/orchestrate`**: Điều phối task phức tạp cần nhiều chuyên gia (FE + BE + Sec).
9. **`/deploy`**: Quy trình deploy an toàn lên Production.
10. **`/status`**: Kiểm tra trạng thái dự án và các tác vụ đang chạy.
11. **`/preview`**: Quản lý preview server (Dev server).

---

## 💡 Mẹo Sử Dụng Cho StudyLanguage

1. **Khởi đầu ngày làm việc:** Dùng `/status` để xem lại tình trạng.
2. **Khi gặp lỗi lạ:** Đừng tự sửa mò, hãy gọi `@debugger` hoặc dùng `/debug`.
3. **Khi cần UI mới:** Luôn dùng `/ui-ux-pro-max` để có design đẹp, tránh "design của lập trình viên".
4. **Khi cần bảo mật:** Trước khi release tính năng thanh toán/auth, hãy gọi `@security-auditor` để review.
5. **Khi bí ý tưởng:** Dùng `/brainstorm` để AI gợi ý các tính năng Gamification hay.
