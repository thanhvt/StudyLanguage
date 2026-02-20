# 📱 CONSOLIDATED DEVICE TEST CHECKLIST

> **Mục đích:** Checklist tổng hợp để test trên iPad/device thật cho tất cả chức năng (trừ Listening/Reading/Speaking)
> **Thời gian ước tính:** ~50 phút
> **Ngày tạo:** 2026-02-19
> **Thiết bị:** iPad (connected) / iPhone

---

## 🔧 Pre-conditions

- [ ] App đã build và cài trên device
- [ ] Account đã đăng nhập
- [ ] WiFi ổn định
- [ ] Volume không bị mute

---

## PART A: SMOKE TEST (~5 phút)

> Nhanh nhất — chạy sau mỗi build để verify app không hỏng

| # | Feature | Test Case | Steps | ✅/❌ |
|---|---------|-----------|-------|------|
| S1 | App Launch | App khởi động | Cold start → Splash → Home | ☐ |
| S2 | Splash | Splash screen | Logo/animation → tự chuyển | ☐ |
| S3 | Auth | Đăng nhập Google | Tap Sign in → Auth flow → Dashboard | ☐ |
| S4 | Auth | Session persist | Kill app → mở lại → không cần login | ☐ |
| S5 | Dashboard | Dashboard render | Hiện cards: Listening, Speaking, Reading | ☐ |
| S6 | Dashboard | Navigate Listening | Tap 🎧 → ConfigScreen | ☐ |
| S7 | Dashboard | Navigate Speaking | Tap 🗣️ → ConfigScreen | ☐ |
| S8 | Dashboard | Navigate Reading | Tap 📖 → ConfigScreen | ☐ |
| S9 | Dashboard | Bottom tabs | Tap History/Profile → screen đúng | ☐ |
| S10 | History | History list | Tab History → danh sách sessions | ☐ |
| S11 | Profile | Profile info | Tab Profile → tên + email + avatar | ☐ |
| S12 | Profile | Settings | Tap Settings → các options hiện | ☐ |
| S13 | Auth | Đăng xuất | Profile → Logout → Login screen | ☐ |

---

## PART B: DASHBOARD (~5 phút)

| # | ID | Test Case | Steps | Expected | ✅/❌ |
|---|:---|-----------|-------|----------|------|
| D1 | MVP-HP-001~004 | Greeting đúng theo giờ | Mở app | Greeting phù hợp buổi sáng/chiều/tối/khuya | ☐ |
| D2 | MVP-HP-005 | Streak hiển thị | Xem Dashboard | 🔥 streak count + animation | ☐ |
| D3 | MVP-HP-010 | Haptic feedback | Tap Quick Action | Có light haptic khi tap | ☐ |
| D4 | MVP-HP-011 | Dashboard login | Đã login → Dashboard | Greeting + tên, streak, Quick Actions | ☐ |
| D5 | MVP-ERR-001 | Dashboard offline | Tắt mạng → Dashboard | Cached data hoặc error + Retry | ☐ |
| D6 | ENH-HP-002 | Continue session | Có session dang dở | Card "Continue" với progress bar | ☐ |

---

## PART C: AUTHENTICATION (~5 phút)

| # | ID | Test Case | Steps | Expected | ✅/❌ |
|---|:---|-----------|-------|----------|------|
| A1 | MVP-HP-001 | Splash screen | Kill → mở lần đầu | Splash 1-2s, fade out mượt | ☐ |
| A2 | MVP-HP-002 | Onboarding flow | Lần đầu mở app | 3 slides → Get Started → Auth | ☐ |
| A3 | MVP-EC-001 | Onboarding 1 lần | Hoàn thành → kill → mở lại | Vào thẳng app, không hiện onboarding | ☐ |
| A4 | MVP-HP-004 | Google login | Tap Continue with Google | Auth OK → Dashboard + avatar + tên | ☐ |
| A5 | MVP-ERR-001 | Hủy Google OAuth | Tap Cancel khi chọn account | Quay về Auth, không crash | ☐ |
| A6 | MVP-EC-001 | Double-tap login | Tap nhanh 2 lần | Chỉ 1 lần trigger, nút disabled | ☐ |
| A7 | MVP-HP-008 | Auto re-login | Login → Kill → Mở lại | Tự vào Dashboard | ☐ |
| A8 | MVP-HP-010~012 | Logout flow | Profile → Đăng xuất → Confirm | Dialog → Auth screen, token clear | ☐ |

---

## PART D: HISTORY (~10 phút)

| # | ID | Test Case | Steps | Expected | ✅/❌ |
|---|:---|-----------|-------|----------|------|
| H1 | MVP-HP-001 | Mở History | Tap History tab | SectionList grouped by date | ☐ |
| H2 | MVP-HP-002 | Session cards | Xem list | Card: border color, icon, topic, timestamp | ☐ |
| H3 | MVP-HP-004 | Pull to refresh | Pull down | Refresh animation → data reload | ☐ |
| H4 | MVP-HP-005~008 | Filter pills | Tap 🎧/🗣️/📖/📋 | List thay đổi, pill highlight đúng | ☐ |
| H5 | MVP-HP-014 | Empty state | User mới hoặc filter trống | Icon + "Chưa có..." + CTA buttons | ☐ |
| H6 | MVP-HP-017 | Stats bar | Xem stats row | 🔥 Streak, 📚 Hôm nay, 📈 Tuần này | ☐ |
| H7 | MVP-ERR-001 | API lỗi | Server down hoặc tắt mạng | Banner đỏ + error message | ☐ |
| H8 | ENH-HP-001 | Search | Tap 🔍 → gõ text | Results hiện, debounce hoạt động | ☐ |
| H9 | ENH-HP-005 | Swipe left delete | Swipe left card | Red background → 🗑️ Xóa | ☐ |
| H10 | ENH-HP-006 | Swipe right pin | Swipe right card | Yellow → 📌 Ghim | ☐ |
| H11 | ENH-HP-008 | Card press | Tap card | Scale 0.97x feedback | ☐ |
| H12 | ENH-HP-016 | Pagination | Scroll tới cuối | "Đang tải thêm..." spinner | ☐ |
| H13 | — | Dark mode | Toggle dark → History | Text/bg/border đúng theme | ☐ |
| H14 | — | Scroll perf | Scroll nhanh 20+ entries | Không jank, FPS ≥ 55 | ☐ |

---

## PART E: PROFILE & SETTINGS (~10 phút)

| # | ID | Test Case | Steps | Expected | ✅/❌ |
|---|:---|-----------|-------|----------|------|
| P1 | MVP-HP-001 | Profile screen | Tap Profile tab | Avatar, tên, email, stats | ☐ |
| P2 | MVP-HP-002 | Stats chính xác | Hoàn thành lessons → Profile | Streak, time, words cập nhật | ☐ |
| P3 | MVP-HP-003 | Week activity | Xem "This Week" | 7 dots (M-S) + minutes | ☐ |
| P4 | MVP-HP-004~006 | Theme toggle | Settings → Appearance → Dark/Light/Auto | Toàn app chuyển theme | ☐ |
| P5 | MVP-HP-007 | Theme persist | Set Dark → Kill → mở lại | Vẫn Dark | ☐ |
| P6 | MVP-HP-009 | About screen | Settings → About | Version, links hiện | ☐ |
| P7 | ENH-HP-011 | Background music | Settings → Audio → Bật BG Music | Nhạc nền phát khi học | ☐ |
| P8 | ENH-HP-013 | Playback speed | Set speed = 1.2x | Listening sessions default 1.2x | ☐ |
| P9 | ENH-HP-014 | Sound effects | Tắt Sound Effects | Không còn tiếng success/error | ☐ |
| P10 | ENH-HP-019 | Clear cache | Settings → Storage → Clear Cache | Cache xóa, toast confirm | ☐ |
| P11 | ENH-HP-021 | Save recordings | Bật Save Recordings → practice | Recordings lưu, nghe lại OK | ☐ |
| P12 | ENH-HP-024 | Delete all data | Tap Delete All → gõ "DELETE" | Xóa hết, logout, Auth screen | ☐ |

---

## PART F: NATIVE FEATURES — Enhanced (~10 phút)

| # | ID | Test Case | Steps | Expected | ✅/❌ |
|---|:---|-----------|-------|----------|------|
| N1 | ENH-HP-001 | Pull down refresh | Pull down bất kỳ list | Refresh animation → reload | ☐ |
| N2 | ENH-HP-002 | Swipe back | Swipe từ cạnh trái | Navigate back, mượt | ☐ |
| N3 | ENH-HP-009 | Haptic: button tap | Tap bất kỳ button | Light haptic feedback | ☐ |
| N4 | ENH-HP-010 | Haptic: toggle | Toggle setting switch | Selection haptic | ☐ |
| N5 | ENH-EC-001 | Haptic OFF | Settings → Tắt Haptic | Không haptic nào trigger | ☐ |
| N6 | ENH-HP-022 | Background play | Phát audio → Home button | Audio tiếp tục | ☐ |
| N7 | ENH-HP-023 | Lock screen player | Tắt màn hình | Lock screen controls hiện | ☐ |
| N8 | ENH-HP-025 | Call interrupt | Đang phát → cuộc gọi đến → cúp | Pause → Auto-resume | ☐ |
| N9 | ENH-HP-026 | Headphone unplug | Rút tai nghe đang phát | Pause ngay | ☐ |
| N10 | ENH-HP-028 | Offline indicator | Tắt mạng | Banner "⚠️ Offline Mode" | ☐ |
| N11 | ENH-HP-029 | Play offline | Offline → mở bài đã download | Audio phát OK | ☐ |
| N12 | ENH-HP-030 | Cached history | Offline → History | Cached data hiển thị | ☐ |

---

## PART G: CROSS-MODULE STRESS (~5 phút)

| # | Test Case | Steps | Expected | ✅/❌ |
|---|-----------|-------|----------|------|
| X1 | Navigation stress | Dashboard → Listening → Play → Home → Speaking | Audio dừng khi chuyển | ☐ |
| X2 | Back stack | Start → Back → Start → Back (loop 5x) | No crash, no stack | ☐ |
| X3 | Multi-tab nav | History → tap → Back → Profile → Home | Smooth | ☐ |
| X4 | Tab switch preserve | Scroll History → tab khác → quay lại | Scroll position giữ | ☐ |
| X5 | App background | Đang dùng → Home → mở lại | State intact | ☐ |
| X6 | Lock/unlock | Sử dụng → lock → unlock | Không re-mount, state OK | ☐ |

---

## ✅ KẾT QUẢ TỔNG HỢP

| Part | Items | PASS | FAIL | Notes |
|------|-------|------|------|-------|
| A: Smoke | 13 | _ | _ | |
| B: Dashboard | 6 | _ | _ | |
| C: Auth | 8 | _ | _ | |
| D: History | 14 | _ | _ | |
| E: Profile | 12 | _ | _ | |
| F: Native | 12 | _ | _ | |
| G: Cross-Module | 6 | _ | _ | |
| **TOTAL** | **71** | **_** | **_** | |

### Thông tin Test

| Item | Value |
|------|-------|
| **Tester:** | |
| **Ngày:** | |
| **Device:** | |
| **Build:** | |
| **Critical bugs:** | |

### Bug Log

| # | Part | Item | Mô tả | Severity | Screenshot |
|---|------|------|-------|----------|------------|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

> 📸 Tip: Dùng screen recording (Settings → Control Center → Screen Recording) để capture bugs
