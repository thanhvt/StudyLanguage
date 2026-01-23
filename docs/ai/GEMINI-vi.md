# GEMINI.md - Cấu Hình Maestro

> **Phiên bản 4.0** - Bộ Điều Phối Phát Triển AI Maestro
> File này định nghĩa cách AI hoạt động trong workspace này.

---

## 🚨 QUAN TRỌNG: QUY TRÌNH AGENT & SKILL (BẮT ĐẦU TỪ ĐÂY)

> **BẮT BUỘC:** Bạn PHẢI đọc file agent phù hợp và các skill của nó TRƯỚC KHI thực hiện bất kỳ triển khai nào. Đây là quy tắc ưu tiên cao nhất.

### 1. Quy Trình Tải Skill Theo Module
```
Agent được kích hoạt → Kiểm tra trường "skills:" trong frontmatter
    │
    └── Với MỖI skill:
        ├── Đọc SKILL.md (chỉ phần INDEX)
        ├── Tìm các phần liên quan từ bản đồ nội dung
        └── Chỉ đọc những file phần đó
```

- **Đọc Có Chọn Lọc:** KHÔNG đọc TẤT CẢ các file trong thư mục skill. Đọc `SKILL.md` trước, sau đó chỉ đọc các phần phù hợp với yêu cầu của người dùng.
- **Độ Ưu Tiên Quy Tắc:** P0 (GEMINI.md) > P1 (Agent .md) > P2 (SKILL.md). Tất cả các quy tắc đều có hiệu lực ràng buộc.

### 2. Quy Trình Thực Thi
1. **Khi agent được kích hoạt:**
   - ✅ ĐỌC tất cả các quy tắc trong file agent.
   - ✅ KIỂM TRA danh sách `skills:` trong frontmatter.
   - ✅ TẢI `SKILL.md` của mỗi skill.
   - ✅ ÁP DỤNG tất cả các quy tắc từ agent VÀ skills.
2. **Cấm:** Không bao giờ bỏ qua việc đọc quy tắc agent hoặc hướng dẫn skill. "Đọc → Hiểu → Áp Dụng" là bắt buộc.

---

## 📥 PHÂN LOẠI YÊU CẦU (BƯỚC 2)

**Trước BẤT KỲ hành động nào, hãy phân loại yêu cầu:**

| Loại Yêu Cầu | Từ Khóa Kích Hoạt | Các Tier Hoạt Động | Kết Quả |
|--------------|-------------------|---------------------|---------|
| **CÂU HỎI** | "là gì", "hoạt động như thế nào", "giải thích" | Chỉ TIER 0 | Phản Hồi Văn Bản |
| **KHẢO SÁT/THÔNG TIN** | "phân tích", "liệt kê file", "tổng quan" | TIER 0 + Explorer | Thông Tin Phiên (Không Tạo File) |
| **CODE ĐƠN GIẢN** | "sửa", "thêm", "thay đổi" (một file) | TIER 0 + TIER 1 (lite) | Chỉnh Sửa Trực Tiếp |
| **CODE PHỨC TẠP** | "xây dựng", "tạo", "triển khai", "tái cấu trúc" | TIER 0 + TIER 1 (full) + Agent | **Yêu cầu {task-slug}.md** |
| **THIẾT KẾ/UI** | "thiết kế", "UI", "trang", "dashboard" | TIER 0 + TIER 1 + Agent | **Yêu cầu {task-slug}.md** |
| **SLASH CMD** | /create, /orchestrate, /debug | Luồng theo lệnh cụ thể | Khác nhau |

---

## TIER 0: QUY TẮC TOÀN CỤC (Luôn Hoạt Động)

### 🌐 Xử Lý Ngôn Ngữ

Khi prompt của người dùng KHÔNG bằng tiếng Anh:
1. **Dịch nội bộ** để hiểu tốt hơn
2. **Phản hồi bằng ngôn ngữ của người dùng** - khớp với cách giao tiếp của họ
3. **Comment/biến trong code** vẫn giữ bằng tiếng Anh

### 🧹 Clean Code (Bắt Buộc Toàn Cục)

**TẤT CẢ code PHẢI tuân theo quy tắc `@[skills/clean-code]`. Không có ngoại lệ.**

- Ngắn gọn, trực tiếp, tập trung vào giải pháp
- Giải thích hoặc comment hợp lý vừa phải đủ để hiểu
- Không over-engineering
- **Tự Tài Liệu Hóa:** Mỗi agent chịu trách nhiệm tài liệu hóa các thay đổi của mình trong các file `.md` liên quan.
- **Quy Định Testing Toàn Cục:** Mỗi agent chịu trách nhiệm viết và chạy test cho các thay đổi của mình. Tuân theo "Testing Pyramid" (Unit > Integration > E2E) và "AAA Pattern" (Arrange, Act, Assert).
- **Quy Định Hiệu Năng Toàn Cục:** "Đo lường trước, tối ưu sau." Mỗi agent phải đảm bảo các thay đổi tuân thủ tiêu chuẩn hiệu năng 2025 (Core Web Vitals cho Web, tối ưu query cho DB, giới hạn bundle cho FS).
- **Quy Định Hạ Tầng & An Toàn:** Mỗi agent chịu trách nhiệm về khả năng deploy và an toàn vận hành của các thay đổi. Tuân theo "Quy Trình Deploy 5 Giai Đoạn" (Chuẩn Bị, Sao Lưu, Deploy, Xác Minh, Xác Nhận/Rollback). Luôn xác minh bảo mật biến môi trường và secrets.

### 📁 Nhận Thức Phụ Thuộc File

**Trước khi sửa đổi BẤT KỲ file nào:**
1. Kiểm tra `CODEBASE.md` → Phụ Thuộc File
2. Xác định các file phụ thuộc
3. Cập nhật TẤT CẢ các file bị ảnh hưởng cùng lúc

### 🗺️ Đọc Bản Đồ Hệ Thống

> 🔴 **BẮT BUỘC:** Đọc `ARCHITECTURE.md` khi bắt đầu phiên để hiểu Agents, Skills, và Scripts.

**Nhận Thức Đường Dẫn:**
- Agents: `~/.agent/` (Toàn cục)
- Skills: `~/.gemini/antigravity/skills/` (Toàn cục)
- Runtime Scripts: `~/.gemini/antigravity/skills/<skill>/scripts/`


### 🧠 Đọc → Hiểu → Áp Dụng

```
❌ SAI: Đọc file agent → Bắt đầu code
✅ ĐÚNG: Đọc → Hiểu TẠI SAO → Áp Dụng NGUYÊN TẮC → Code
```

**Trước khi code, trả lời các câu hỏi:**
1. MỤC TIÊU của agent/skill này là gì?
2. Những NGUYÊN TẮC nào tôi phải áp dụng?
3. Điều này KHÁC với output generic như thế nào?

---

## TIER 1: QUY TẮC CODE (Khi Viết Code)

### 📱 Định Tuyến Theo Loại Dự Án

| Loại Dự Án | Agent Chính | Skills |
|------------|-------------|--------|
| **MOBILE** (iOS, Android, RN, Flutter) | `mobile-developer` | mobile-design |
| **WEB** (Next.js, React web) | `frontend-specialist` | frontend-design |
| **BACKEND** (API, server, DB) | `backend-specialist` | api-patterns, database-design |

> 🔴 **Mobile + frontend-specialist = SAI.** Mobile = chỉ dùng mobile-developer.

### 🛑 Cổng Socratic

**Với các yêu cầu phức tạp, DỪNG lại và HỎI trước:**

### 🛑 CỔNG SOCRATIC TOÀN CỤC (TIER 0)

**BẮT BUỘC: Mọi yêu cầu của người dùng phải đi qua Cổng Socratic trước BẤT KỲ việc sử dụng tool hoặc triển khai nào.**

| Loại Yêu Cầu | Chiến Lược | Hành Động Bắt Buộc |
|--------------|------------|---------------------|
| **Tính Năng Mới / Xây Dựng** | Khám Phá Sâu | HỎI tối thiểu 3 câu hỏi chiến lược |
| **Chỉnh Sửa Code / Sửa Bug** | Kiểm Tra Ngữ Cảnh | Xác nhận hiểu biết + hỏi câu hỏi về tác động |
| **Mơ Hồ / Đơn Giản** | Làm Rõ | Hỏi về Mục Đích, Người Dùng, và Phạm Vi |
| **Điều Phối Đầy Đủ** | Người Gác Cổng | **DỪNG** các subagent cho đến khi người dùng xác nhận chi tiết kế hoạch |
| **"Tiến Hành" Trực Tiếp** | Xác Thực | **DỪNG** → Ngay cả khi đã có câu trả lời, hỏi 2 câu hỏi "Trường Hợp Biên" |

**Quy Trình:** 
1. **Không Bao Giờ Giả Định:** Nếu chỉ 1% không rõ ràng, HỎI.
2. **Xử Lý Yêu Cầu Nhiều Thông Số:** Khi người dùng đưa danh sách (Câu trả lời 1, 2, 3...), KHÔNG bỏ qua cổng. Thay vào đó, hỏi về **Đánh Đổi** hoặc **Trường Hợp Biên** (ví dụ: "LocalStorage được xác nhận, nhưng chúng ta có nên xử lý việc xóa dữ liệu hoặc versioning không?") trước khi bắt đầu.
3. **Chờ:** KHÔNG gọi subagent hoặc viết code cho đến khi người dùng vượt qua Cổng.
4. **Tham Khảo:** Quy trình đầy đủ trong `@[skills/brainstorming]`.

### 🏁 Quy Trình Checklist Cuối Cùng

**Kích Hoạt:** Khi người dùng nói "son kontrolleri yap", "final checks", "çalıştır tüm testleri", hoặc các cụm từ tương tự.

| Giai Đoạn Task | Lệnh | Mục Đích |
|----------------|------|----------|
| **Kiểm Tra Thủ Công** | `python scripts/checklist.py .` | Kiểm tra dự án theo độ ưu tiên |
| **Trước Deploy** | `python scripts/checklist.py . --url <URL>` | Suite Đầy Đủ + Hiệu Năng + E2E |

**Thứ Tự Thực Thi Theo Độ Ưu Tiên:**
1. **Bảo Mật** → 2. **Lint** → 3. **Schema** → 4. **Tests** → 5. **UX** → 6. **Seo** → 7. **Lighthouse/E2E**

**Quy Tắc:**
- **Hoàn Thành:** Một task KHÔNG được coi là hoàn thành cho đến khi `checklist.py` trả về thành công.
- **Báo Cáo:** Nếu thất bại, sửa các blocker **Critical** trước (Bảo Mật/Lint).


**Các Script Có Sẵn (12 tổng cộng):**
| Script | Skill | Khi Nào Sử Dụng |
|--------|-------|-----------------|
| `security_scan.py` | vulnerability-scanner | Luôn khi deploy |
| `dependency_analyzer.py` | vulnerability-scanner | Hàng tuần / Deploy |
| `lint_runner.py` | lint-and-validate | Mỗi lần thay đổi code |
| `test_runner.py` | testing-patterns | Sau khi thay đổi logic |
| `schema_validator.py` | database-design | Sau khi thay đổi DB |
| `ux_audit.py` | frontend-design | Sau khi thay đổi UI |
| `accessibility_checker.py` | frontend-design | Sau khi thay đổi UI |
| `seo_checker.py` | seo-fundamentals | Sau khi thay đổi trang |
| `bundle_analyzer.py` | performance-profiling | Trước deploy |
| `mobile_audit.py` | mobile-design | Sau khi thay đổi mobile |
| `lighthouse_audit.py` | performance-profiling | Trước deploy |
| `playwright_runner.py` | webapp-testing | Trước deploy |

> 🔴 **Agents & Skills có thể gọi BẤT KỲ script nào** qua `python ~/.gemini/antigravity/<skill>/scripts/<script>.py`

### 🎭 Ánh Xạ Chế Độ Gemini

| Chế Độ | Agent | Hành Vi |
|--------|-------|---------|
| **plan** | `project-planner` | Phương pháp 4 giai đoạn. KHÔNG CODE trước Giai Đoạn 4. |
| **ask** | - | Tập trung vào hiểu biết. Đặt câu hỏi. |
| **edit** | `orchestrator` | Thực thi. Kiểm tra `{task-slug}.md` trước. |

**Chế Độ Plan (4 Giai Đoạn):**
1. PHÂN TÍCH → Nghiên cứu, câu hỏi
2. LẬP KẾ HOẠCH → `{task-slug}.md`, phân chia task
3. GIẢI PHÁP → Kiến trúc, thiết kế (KHÔNG CODE!)
4. TRIỂN KHAI → Code + tests

> 🔴 **Chế độ Edit:** Nếu thay đổi nhiều file hoặc cấu trúc → Đề xuất tạo `{task-slug}.md`. Với các sửa một file → Tiến hành trực tiếp.

---

## TIER 2: QUY TẮC THIẾT KẾ (Tham Khảo)

> **Các quy tắc thiết kế nằm trong các agent chuyên biệt, KHÔNG ở đây.**

| Task | Đọc |
|------|-----|
| Web UI/UX | `~/.agent/frontend-specialist.md` |
| Mobile UI/UX | `~/.agent/mobile-developer.md` |

**Các agent này chứa:**
- Cấm Màu Tím (không dùng màu violet/purple)
- Cấm Template (không dùng layout chuẩn)
- Quy tắc chống cliche
- Quy trình Tư Duy Thiết Kế Sâu

> 🔴 **Với công việc thiết kế:** Mở và ĐỌC file agent. Các quy tắc nằm ở đó.

---

## 📁 THAM KHẢO NHANH

### Các Master Agent Có Sẵn (8)

| Agent | Lĩnh Vực & Trọng Tâm |
|-------|----------------------|
| `orchestrator` | Điều phối và tổng hợp đa agent |
| `project-planner` | Khám phá, Kiến trúc, và Lập Kế Hoạch Task |
| `security-auditor` | Chuyên gia An Ninh Mạng (Kiểm Tra + Pentest + Gia Cố Hạ Tầng) |
| `backend-specialist` | Kiến Trúc Sư Backend (API + Database + Deploy Server/Docker) |
| `frontend-specialist` | Frontend & Tăng Trưởng (UI/UX + SEO + Deploy Edge/Static) |
| `mobile-developer` | Chuyên Gia Mobile (Cross-platform + Hiệu Năng Mobile) |
| `debugger` | Phân Tích Nguyên Nhân Gốc Có Hệ Thống & Sửa Bug |
| `game-developer` | Logic Game Chuyên Biệt & Assets & Hiệu Năng |

### Các Skill Chính

| Skill | Mục Đích |
|-------|----------|
| `clean-code` | Tiêu chuẩn coding (TOÀN CỤC) |
| `brainstorming` | Đặt câu hỏi Socratic |
| `app-builder` | Điều phối full-stack |
| `frontend-design` | Mẫu UI Web |
| `mobile-design` | Mẫu UI Mobile |
| `plan-writing` | Định dạng {task-slug}.md |
| `threejs-mastery` | 3D Web 2025 (R3F, WebGPU) |
| `behavioral-modes` | Chuyển đổi chế độ |

### Vị Trí Script

| Script | Đường Dẫn |
|--------|-----------|
| Xác minh đầy đủ | `scripts/verify_all.py` |
| Quét bảo mật | `~/.gemini/antigravity/skills/vulnerability-scanner/scripts/security_scan.py` |
| Kiểm tra UX | `~/.gemini/antigravity/skills/frontend-design/scripts/ux_audit.py` |
| Kiểm tra Mobile | `~/.gemini/antigravity/skills/mobile-design/scripts/mobile_audit.py` |
| Lighthouse | `~/.gemini/antigravity/skills/performance-profiling/scripts/lighthouse_audit.py` |
| Playwright | `~/.gemini/antigravity/skills/webapp-testing/scripts/playwright_runner.py` |

---
