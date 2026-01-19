# Hướng Dẫn Sử Dụng Skills, Agents & Workflows

> **Dành cho dự án StudyLanguage** - Cập nhật: 16/01/2026
> Tài liệu này hướng dẫn khi nào và cách sử dụng các thành phần AI trong workspace.

---

## 📊 Tổng Quan Tech Stack

| App | Công Nghệ |
|-----|-----------|
| **api** (Backend) | NestJS 11, TypeScript, Supabase, OpenAI, FFmpeg |
| **web** (Frontend) | Next.js 16, React 19, Tailwind CSS v4, Framer Motion, Radix UI |
| **mobile** | React Native |

---

# 🎯 PHẦN 1: SKILLS - Kỹ Năng Chuyên Môn

## 1.1 Skills Phù Hợp Với Dự Án

### ⭐ BACKEND SKILLS

| Skill | Độ Phù Hợp | Lý Do |
|-------|------------|-------|
| `nestjs-expert` | ⭐⭐⭐⭐⭐ | **BẮT BUỘC** - NestJS là framework chính |
| `api-patterns` | ⭐⭐⭐⭐⭐ | REST API design, pagination |
| `database-design` | ⭐⭐⭐⭐⭐ | Schema cho Supabase/PostgreSQL |
| `typescript-expert` | ⭐⭐⭐⭐⭐ | TypeScript là ngôn ngữ chính |
| `nodejs-best-practices` | ⭐⭐⭐⭐ | Async patterns, error handling |
| `vulnerability-scanner` | ⭐⭐⭐⭐ | Bảo mật API |
| `testing-patterns` | ⭐⭐⭐⭐ | Jest + Supertest |

### ⭐ FRONTEND SKILLS

| Skill | Độ Phù Hợp | Lý Do |
|-------|------------|-------|
| `nextjs-best-practices` | ⭐⭐⭐⭐⭐ | **BẮT BUỘC** - Next.js 16 App Router |
| `react-patterns` | ⭐⭐⭐⭐⭐ | React 19, Hooks |
| `tailwind-patterns` | ⭐⭐⭐⭐⭐ | Tailwind CSS v4 |
| `frontend-design` | ⭐⭐⭐⭐⭐ | UI/UX patterns |
| `ui-ux-pro-max` | ⭐⭐⭐⭐⭐ | 50+ design styles |
| `webapp-testing` | ⭐⭐⭐⭐ | Playwright, Jest |
| `seo-fundamentals` | ⭐⭐⭐⭐ | SEO cho trang public |
| `performance-profiling` | ⭐⭐⭐⭐ | Core Web Vitals |

### ⭐ SKILLS CHUNG

| Skill | Độ Phù Hợp | Lý Do |
|-------|------------|-------|
| `clean-code` | ⭐⭐⭐⭐⭐ | **TOÀN CỤC** - Mọi code |
| `i18n-localization` | ⭐⭐⭐⭐⭐ | App học ngôn ngữ cần đa ngôn ngữ! |
| `systematic-debugging` | ⭐⭐⭐⭐⭐ | Debug phức tạp |
| `brainstorming` | ⭐⭐⭐⭐ | Feature planning |
| `plan-writing` | ⭐⭐⭐⭐ | Task planning |
| `deployment-procedures` | ⭐⭐⭐⭐ | Deploy Railway/Vercel |
| `docker-expert` | ⭐⭐⭐ | Containerize API |
| `powershell-windows` | ⭐⭐⭐ | Dùng Windows |

---

## 1.2 Khi Nào Dùng Skill Nào?

### 📝 Bảng Tra Cứu Nhanh

| Tình Huống | Skill Cần Dùng | Ví Dụ Prompt |
|------------|----------------|--------------|
| **Tạo API endpoint mới** | `nestjs-expert`, `api-patterns` | "Tạo endpoint GET /lessons/:id với pagination" |
| **Thiết kế database schema** | `database-design` | "Thiết kế schema cho tính năng Playlist" |
| **Xây dựng UI component** | `react-patterns`, `tailwind-patterns` | "Tạo component AudioPlayer responsive" |
| **Tối ưu performance** | `performance-profiling` | "Tối ưu loading time trang Listening" |
| **Thêm đa ngôn ngữ** | `i18n-localization` | "Thêm tiếng Nhật cho app" |
| **Debug lỗi phức tạp** | `systematic-debugging` | "Debug lỗi audio không phát được" |
| **Review code** | `code-review-checklist` | "Review PR thêm tính năng Radio" |
| **Viết tests** | `testing-patterns`, `webapp-testing` | "Viết test cho AIService" |
| **Deploy production** | `deployment-procedures` | "Deploy API lên Railway" |

---

## 1.3 Cách Sử Dụng Skill

### Cách 1: Tự động (AI tự chọn skill phù hợp)
```
Prompt: "Tạo API endpoint cho tính năng lưu từ vựng"
→ AI tự động tải nestjs-expert, api-patterns
```

### Cách 2: Chỉ định rõ ràng
```
Prompt: "@[skills/nestjs-expert] Tạo guard xác thực JWT"
→ AI đọc và áp dụng skill được chỉ định
```

### Cách 3: Kết hợp nhiều skills
```
Prompt: "Thiết kế và implement tính năng Quiz với UI đẹp"
→ AI tự động kết hợp: database-design + nestjs-expert + react-patterns + ui-ux-pro-max
```

---

## 1.4 Ví Dụ Chi Tiết Sử Dụng Skill

### Ví Dụ 1: `nestjs-expert` - Tạo Module Mới

**Prompt:**
```
Tạo module Vocabulary với:
- CRUD endpoints cho từ vựng
- Liên kết với user và lesson
- Validation và error handling
```

**Kết quả:** AI sẽ tạo:
- `vocabulary.module.ts`
- `vocabulary.controller.ts`
- `vocabulary.service.ts`
- `dto/create-vocabulary.dto.ts`
- `dto/update-vocabulary.dto.ts`

---

### Ví Dụ 2: `ui-ux-pro-max` - Thiết Kế UI

**Prompt:**
```
Thiết kế trang Quiz với:
- Glassmorphism style
- Dark mode support
- Animations khi chọn đáp án
```

**Kết quả:** AI sẽ áp dụng:
- Color palette phù hợp
- Blur effects, gradients
- Framer Motion animations
- Dark/light theme switching

---

### Ví Dụ 3: `i18n-localization` - Đa Ngôn Ngữ

**Prompt:**
```
Thêm đa ngôn ngữ cho app với tiếng Việt, Anh, Nhật
```

**Kết quả:** AI sẽ:
- Setup next-intl hoặc react-i18next
- Tạo structure cho locale files
- Hướng dẫn extract hardcoded strings
- Xử lý RTL nếu cần

---

# 👤 PHẦN 2: AGENTS - Các Chuyên Gia AI

## 2.1 Danh Sách Agents Có Sẵn (16)

| Agent | Chức Năng | Khi Nào Dùng |
|-------|-----------|--------------|
| `orchestrator` | Điều phối multi-agent | Task phức tạp cần nhiều góc nhìn |
| `project-planner` | Lập kế hoạch dự án | Feature mới, refactor lớn |
| `frontend-specialist` | UI/UX + React/Next.js | Xây dựng giao diện web |
| `backend-specialist` | API + Database | Xây dựng backend, API |
| `mobile-developer` | React Native | Phát triển mobile app |
| `database-architect` | Schema design | Thiết kế database |
| `debugger` | Tìm và sửa bug | Debug lỗi phức tạp |
| `security-auditor` | Kiểm tra bảo mật | Audit security |
| `test-engineer` | Viết và chạy tests | Testing |
| `performance-optimizer` | Tối ưu hiệu năng | Performance issues |
| `devops-engineer` | CI/CD, deployment | Deploy, infrastructure |
| `documentation-writer` | Viết tài liệu | Documentation |
| `seo-specialist` | SEO optimization | SEO cho web |
| `penetration-tester` | Pentest | Security testing nâng cao |
| `explorer-agent` | Khảo sát codebase | Hiểu code mới |
| `game-developer` | Game logic | (Không dùng cho dự án này) |

---

## 2.2 Agents Phù Hợp Với StudyLanguage

### ⭐ SỬ DỤNG THƯỜNG XUYÊN

| Agent | Lý Do | Ví Dụ Sử Dụng |
|-------|-------|---------------|
| `backend-specialist` | API development với NestJS | Tạo endpoints, services |
| `frontend-specialist` | Web UI với Next.js | Tạo pages, components |
| `debugger` | Debug lỗi | Sửa lỗi audio, API errors |
| `project-planner` | Lập kế hoạch feature | Plan tính năng mới |
| `database-architect` | Supabase schema | Thiết kế tables |

### 🔄 SỬ DỤNG KHI CẦN

| Agent | Lý Do | Ví Dụ Sử Dụng |
|-------|-------|---------------|
| `mobile-developer` | React Native app | Phát triển mobile |
| `test-engineer` | Testing | Viết unit/e2e tests |
| `security-auditor` | Security review | Kiểm tra bảo mật API |
| `performance-optimizer` | Tối ưu | Cải thiện loading time |
| `devops-engineer` | Deployment | Deploy Railway/Vercel |

---

## 2.3 Cách Sử Dụng Agent

### Cách 1: Theo Gemini Mode

```
# Plan mode → project-planner agent
Prompt: "Plan tính năng Spaced Repetition cho vocabulary"

# Edit mode → orchestrator agent
Prompt: "Implement tính năng đã plan"

# Ask mode → Không agent cụ thể
Prompt: "Giải thích cách hoạt động của SSE trong app"
```

### Cách 2: Gọi trực tiếp

```
Prompt: "Với vai trò debugger, hãy phân tích lỗi 'Cannot read property audioUrl'"
```

### Cách 3: Multi-agent với Orchestrator

```
Prompt: "/orchestrate Thiết kế và implement tính năng Flashcard"
→ Orchestrator sẽ điều phối:
  - project-planner: Lên kế hoạch
  - database-architect: Thiết kế schema
  - backend-specialist: Implement API
  - frontend-specialist: Implement UI
```

---

## 2.4 Ví Dụ Chi Tiết Sử Dụng Agent

### Ví Dụ 1: `backend-specialist`

**Prompt:**
```
Với vai trò backend-specialist, tạo module Flashcard với:
- CRUD cho flashcard sets
- CRUD cho individual flashcards
- Spaced repetition algorithm
- Statistics tracking
```

**Agent sẽ:**
1. Đọc `@[skills/nestjs-expert]`
2. Đọc `@[skills/api-patterns]`
3. Tạo module structure
4. Implement với best practices

---

### Ví Dụ 2: `debugger`

**Prompt:**
```
Debug lỗi: "Runtime NotSupportedError: The element has no supported sources" 
khi phát audio trong listening-player.tsx
```

**Agent sẽ:**
1. Đọc `@[skills/systematic-debugging]`
2. Phân tích 4 giai đoạn: Observe → Hypothesize → Test → Fix
3. Kiểm tra audio generation, encoding, CSP policies
4. Đề xuất và implement fix

---

### Ví Dụ 3: `project-planner`

**Prompt:**
```
Plan tính năng Quiz Game cho vocabulary learning
```

**Agent sẽ:**
1. Giai đoạn ANALYSIS: Đặt câu hỏi Socratic
2. Giai đoạn PLANNING: Tạo `{task-slug}.md`
3. Giai đoạn SOLUTIONING: Thiết kế architecture
4. KHÔNG CODE cho đến khi user approve

---

# 🔄 PHẦN 3: WORKFLOWS - Quy Trình Làm Việc

## 3.1 Danh Sách Workflows (11)

| Slash Command | Mô Tả | Khi Nào Dùng |
|---------------|-------|--------------|
| `/brainstorm` | Brainstorming có cấu trúc | Khám phá ý tưởng, explore options |
| `/create` | Tạo app mới | Bắt đầu project/feature mới |
| `/debug` | Debug có hệ thống | Sửa bug phức tạp |
| `/deploy` | Deploy production | Đưa code lên production |
| `/enhance` | Cải thiện feature | Nâng cấp feature hiện có |
| `/orchestrate` | Điều phối multi-agent | Task phức tạp nhiều domain |
| `/plan` | Lập kế hoạch | Plan feature mới |
| `/preview` | Chạy dev server | Test local |
| `/status` | Xem tiến độ | Theo dõi progress |
| `/test` | Chạy tests | Testing |
| `/ui-ux-pro-max` | Thiết kế UI | Xây dựng UI đẹp |

---

## 3.2 Khi Nào Dùng Workflow Nào?

| Tình Huống | Workflow | Ví Dụ |
|------------|----------|-------|
| **Có ý tưởng mới, chưa rõ ràng** | `/brainstorm` | "Tôi muốn thêm gamification" |
| **Bắt đầu feature mới** | `/plan` hoặc `/create` | "Tạo tính năng Flashcard" |
| **Cải thiện feature đã có** | `/enhance` | "Cải thiện UI trang Listening" |
| **Task phức tạp, nhiều domain** | `/orchestrate` | "Redesign toàn bộ flow học" |
| **Sửa bug** | `/debug` | "Lỗi audio không phát" |
| **Thiết kế UI mới** | `/ui-ux-pro-max` | "Thiết kế trang Dashboard" |
| **Chạy test** | `/test` | "Test AIService" |
| **Deploy lên production** | `/deploy` | "Deploy lên Railway" |
| **Kiểm tra tiến độ** | `/status` | "Tiến độ task hiện tại" |
| **Chạy dev server** | `/preview` | "Start dev server" |

---

## 3.3 Cách Sử Dụng Workflow

### Cú pháp chung:
```
/workflow-name [mô tả công việc]
```

### Ví dụ thực tế:

```bash
# Brainstorm ý tưởng
/brainstorm Các cách gamify việc học từ vựng

# Tạo feature mới
/create Tính năng Quiz game cho vocabulary

# Debug lỗi
/debug Lỗi audio không phát trên Safari

# Deploy
/deploy API lên Railway production

# Thiết kế UI
/ui-ux-pro-max Thiết kế trang Vocabulary với dark mode
```

---

## 3.4 Ví Dụ Chi Tiết Sử Dụng Workflow

### Ví Dụ 1: `/brainstorm`

**Input:**
```
/brainstorm Gamification cho app học từ vựng
```

**Output:**
```
AI sẽ:
1. Đặt câu hỏi Socratic (mục đích, target users, scope)
2. Explore nhiều options (points, badges, leaderboards, streaks)
3. So sánh pros/cons
4. Đề xuất approach phù hợp nhất
5. KHÔNG implement, chỉ brainstorm
```

---

### Ví Dụ 2: `/plan`

**Input:**
```
/plan Tính năng Spaced Repetition cho Flashcard
```

**Output:**
```
AI sẽ:
1. Tạo file {task-slug}.md với:
   - Mô tả feature
   - Technical design
   - Task breakdown
   - Dependencies
   - Verification plan
2. YÊU CẦU user review trước khi implement
```

---

### Ví Dụ 3: `/debug`

**Input:**
```
/debug Lỗi "404 Not Found" khi gọi API /lessons/:id
```

**Output:**
```
AI sẽ:
1. Kích hoạt DEBUG mode
2. Thu thập evidence (logs, code)
3. Hypothesize nguyên nhân
4. Test từng hypothesis
5. Implement fix
6. Verify fix hoạt động
```

---

### Ví Dụ 4: `/orchestrate`

**Input:**
```
/orchestrate Xây dựng tính năng Speaking Practice với AI
```

**Output:**
```
AI sẽ điều phối nhiều agents:
1. project-planner: Lên kế hoạch tổng thể
2. database-architect: Schema cho speaking sessions
3. backend-specialist: 
   - API endpoints
   - OpenAI integration
   - Audio processing
4. frontend-specialist:
   - Recording UI
   - Playback UI
   - Feedback display
5. test-engineer: Viết tests
6. Synthesize kết quả từ tất cả agents
```

---

### Ví Dụ 5: `/ui-ux-pro-max`

**Input:**
```
/ui-ux-pro-max Thiết kế trang Vocabulary với:
- Glassmorphism style
- Dark mode
- Card layout cho từng từ vựng
- Search và filter
```

**Output:**
```
AI sẽ:
1. Áp dụng design intelligence (50+ styles)
2. Chọn color palette phù hợp
3. Chọn font pairing
4. Tạo component structure
5. Implement với Tailwind + Framer Motion
6. Đảm bảo responsive + accessible
```

---

# 🚀 PHẦN 4: BEST PRACTICES

## 4.1 Flow Làm Việc Khuyến Nghị

```mermaid
graph TD
    A[Ý tưởng mới] --> B{Rõ ràng chưa?}
    B -->|Chưa| C[/brainstorm]
    B -->|Rồi| D[/plan]
    D --> E{User approve?}
    E -->|No| D
    E -->|Yes| F{Phức tạp?}
    F -->|Yes| G[/orchestrate]
    F -->|No| H[Implement trực tiếp]
    G --> I[/test]
    H --> I
    I --> J{Pass?}
    J -->|No| K[/debug]
    K --> I
    J -->|Yes| L[/deploy]
```

## 4.2 Quy Tắc Vàng

1. **Luôn /plan trước khi implement feature lớn**
2. **Dùng /brainstorm khi chưa chắc chắn approach**
3. **Dùng /orchestrate cho task cross-domain**
4. **Dùng /debug thay vì tự fix lung tung**
5. **Luôn /test trước khi /deploy**

## 4.3 Mapping Nhanh

| Muốn làm gì? | Dùng gì? |
|--------------|----------|
| Học điều gì đó | Ask mode (không workflow) |
| Khám phá ý tưởng | `/brainstorm` |
| Tạo feature mới | `/plan` → `/create` |
| Sửa/cải thiện feature | `/enhance` |
| Thiết kế UI đẹp | `/ui-ux-pro-max` |
| Sửa bug | `/debug` |
| Task phức tạp | `/orchestrate` |
| Chạy test | `/test` |
| Deploy | `/deploy` |

---

# ❌ PHẦN 5: SKILLS KHÔNG CẦN THIẾT

| Skill | Lý Do |
|-------|-------|
| `vue-expert` | Không dùng Vue |
| `python-patterns` | Không dùng Python |
| `prisma-expert` | Dùng Supabase, không Prisma |
| `game-development` | Không phải game |
| `red-team-tactics` | Không cần pentest nâng cao |
| `bash-linux` | Dùng Windows |
| `mcp-builder` | Không xây MCP server |
| `threejs-mastery` | Không có 3D graphics |

---

> **Ghi chú:** Tài liệu này sẽ được cập nhật khi có thêm skills/agents/workflows mới.
