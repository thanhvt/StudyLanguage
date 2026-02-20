# 🔍 PLAN: Review Code Listening × Test Cases

> **Ngày tạo:** 2026-02-19
> **Mục tiêu:** Review toàn bộ code chức năng Listening đối chiếu với 270+ test cases
> **Link plan chi tiết:** Xem artifact implementation_plan.md

---

## Scope

- **6 test docs** (270+ test cases): Functional, Smoke, Monkey, Manual, Enhanced, E2E
- **4 unit test files** hiện tại: 128/128 PASS
- **19 source files**: 16 components + 3 screens

## Phases

### Phase 1: Review Code × Unit Tests ✅ (đang thực hiện)
- Đối chiếu store/API/hook tests với test case IDs
- Bổ sung tests thiếu cho store (~5 tests)

### Phase 2: Viết Unit Tests mới (~31 tests)
| Component | Tests | Priority |
|-----------|:-----:|:--------:|
| TappableTranscript | ~8 | P1 |
| usePlayerGestures | ~10 | P1 |
| CompactPlayer | ~5 | P2 |
| Store gaps | ~5 | P2 |
| API gaps | ~3 | P3 |

### Phase 3: Logic Review
- ConfigScreen logic vs Config test cases
- PlayerScreen logic vs Player test cases
- RadioScreen logic vs Radio test cases

### Phase 4: Verify
- Run all 128 + 31 = ~159 tests
- Tạo code-to-testcase mapping checklist

## Estimated Time
- Code review + unit test writing: ~2-3 giờ
- Manual testing trên device: ~3 giờ (anh zai thực hiện)
