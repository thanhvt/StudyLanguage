# 🔐 Authentication - Test Scenarios

> **Module:** Authentication
> **Phase:** MVP → Enhanced
> **Ref:** `docs/mobile/features/01_Authentication.md`

---

## MVP Phase

### 1. First Launch & Onboarding

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-AUTH-MVP-HP-001 | ✅ | Splash screen hiển thị | 1. Kill app hoàn toàn<br>2. Mở app lần đầu | Splash screen với logo hiển thị 1-2s, fade out mượt | 🟡 |
| MOB-AUTH-MVP-HP-002 | ✅ | Onboarding flow hoàn chỉnh | 1. Mở app lần đầu<br>2. Swipe qua 3 onboarding slides<br>3. Tap "Get Started" | Chuyển đến Auth screen. Onboarding chỉ hiện 1 lần | 🟡 |
| MOB-AUTH-MVP-HP-003 | ✅ | Skip onboarding | 1. Mở app lần đầu<br>2. Tap "Skip" | Chuyển thẳng đến Auth screen | 🟡 |
| MOB-AUTH-MVP-EC-001 | ⚠️ | Onboarding không hiện lại | 1. Hoàn thành onboarding<br>2. Kill & mở lại app | Vào thẳng app (nếu đã login) hoặc Auth (nếu chưa) | 🟡 |

### 2. Google OAuth Login

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-AUTH-MVP-HP-004 | ✅ | Login Google thành công | 1. Tap "Continue with Google"<br>2. Chọn tài khoản Google<br>3. Cho phép quyền | Redirect về Dashboard. Avatar & tên hiển thị đúng | 🔴 |
| MOB-AUTH-MVP-HP-005 | ✅ | Login lần đầu - tạo profile | 1. Login với Google account mới | Tự động tạo profile trên backend, hiển thị Dashboard | 🔴 |
| MOB-AUTH-MVP-HP-006 | ✅ | Login lần sau - user cũ | 1. Login với account đã có | Load data cũ (history, settings, streak) đúng | 🔴 |
| MOB-AUTH-MVP-ERR-001 | ❌ | User hủy Google OAuth | 1. Tap "Continue with Google"<br>2. Tap "Cancel" / Dismiss picker | Quay về Auth screen, không crash, hiện message thân thiện | 🔴 |
| MOB-AUTH-MVP-ERR-002 | ❌ | Login khi mất mạng | 1. Tắt WiFi & Data<br>2. Tap "Continue with Google" | Hiện error "Không có kết nối mạng" + icon cảnh báo | 🔴 |
| MOB-AUTH-MVP-ERR-003 | ❌ | Google server error | 1. Google OAuth trả về lỗi server | Hiện error "Đăng nhập thất bại, thử lại sau" + Retry button | 🔴 |
| MOB-AUTH-MVP-EC-001 | ⚠️ | Double-tap nút login | 1. Tap "Continue with Google" 2 lần liên tiếp | Chỉ trigger 1 lần, nút disabled khi đang loading | 🟡 |

### 3. Token Management

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-AUTH-MVP-HP-007 | ✅ | Token lưu vào SecureStore | 1. Login thành công | Access token & refresh token lưu trong SecureStore (không MMKV) | 🔴 |
| MOB-AUTH-MVP-HP-008 | ✅ | Auto re-login khi mở lại app | 1. Login thành công<br>2. Kill app<br>3. Mở lại app | Tự động login, vào thẳng Dashboard, không cần chọn Google lại | 🔴 |
| MOB-AUTH-MVP-HP-009 | ✅ | Token refresh tự động | 1. Access token hết hạn<br>2. App gọi API | Tự động dùng refresh token để lấy access token mới, không logout user | 🔴 |
| MOB-AUTH-MVP-ERR-004 | ❌ | Token refresh thất bại | 1. Refresh token cũng hết hạn<br>2. App gọi API | Logout user, redirect về Auth screen, message "Phiên đăng nhập hết hạn" | 🔴 |
| MOB-AUTH-MVP-EC-002 | ⚠️ | App upgrade không mất token | 1. Login thành công<br>2. Update app version<br>3. Mở lại | Vẫn giữ login state, không bị logout | 🔴 |

### 4. Logout

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-AUTH-MVP-HP-010 | ✅ | Logout thành công | 1. Vào Profile<br>2. Tap "Đăng xuất"<br>3. Confirm dialog | Token xóa, redirect Auth screen, cached data clear | 🔴 |
| MOB-AUTH-MVP-HP-011 | ✅ | Confirm dialog khi logout | 1. Tap "Đăng xuất" | Hiện dialog "Bạn có chắc muốn đăng xuất? Dữ liệu chưa sync sẽ bị mất." | 🟡 |
| MOB-AUTH-MVP-HP-012 | ✅ | Cancel logout | 1. Tap "Đăng xuất"<br>2. Tap "Hủy" | Quay về Profile, vẫn logged in | 🟡 |
| MOB-AUTH-MVP-ERR-005 | ❌ | Logout khi mất mạng | 1. Tắt mạng<br>2. Logout | Local token xóa, chuyển Auth screen. Sync lại khi có mạng | 🟡 |

---

## Enhanced Phase

### 5. Guest Mode

| ID | Type | Scenario | Steps | Expected Result | Severity |
|:---|:-----|:---------|:------|:----------------|:---------|
| MOB-AUTH-ENH-HP-001 | ✅ | Vào app không login | 1. Mở app<br>2. Tap "Tiếp tục không đăng nhập" | Vào Dashboard guest mode, Quick Actions vẫn hoạt động | 🟡 |
| MOB-AUTH-ENH-HP-002 | ✅ | Guest → login chuyển đổi | 1. Sử dụng app ở guest mode<br>2. Login Google | Data guest (nếu có) merge vào account | 🟡 |
| MOB-AUTH-ENH-EC-001 | ⚠️ | Guest bị hạn chế tính năng | 1. Vào guest mode<br>2. Tap History | Hiện CTA "Đăng nhập để xem lịch sử" thay vì blank | 🟡 |
