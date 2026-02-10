# 🔐 Authentication Feature - Mobile

> **Module:** Authentication  
> **Priority:** P0 (Core)  
> **Phase:** MVP

---

## 1. Overview

Hệ thống xác thực cho mobile app sử dụng **Google OAuth** là phương thức đăng nhập duy nhất. Yêu cầu người dùng có tài khoản Gmail.

### 1.1 Auth Methods

| Method | Priority | Use Case |
|--------|----------|----------|
| **Google OAuth** | Primary | Đăng nhập nhanh, yêu cầu Google account |
| **Auto-Relogin** | Background | Token refresh tự động |

---

## 2. User Flows

### 2.1 First Launch Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [Splash Screen]  →  [Onboarding 1-3]  →  [Auth Screen]     │
│   (Logo + Anim)      (3 slides)           (Login options)  │
│        │                  │                    │            │
│        └──── 1-2s ────────┴───── swipe ───────┘            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Google OAuth Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [Tap Google]  →  [WebView OAuth]  →  [Callback]  →  [Home]  │
│                      │                   │                  │
│                      └── Google UI ──────┘                  │
│                                                             │
│  Technical:                                                 │
│  - @react-native-google-signin + Supabase Auth              │
│  - Token → SecureStore                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```



---

## 3. UI Mockups

### 3.1 Splash Screen

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│                                 │
│         📚                      │
│    StudyLanguage               │
│                                 │
│        [Loading...]             │
│                                 │
│                                 │
│                                 │
└─────────────────────────────────┘
```

**Specs:**
- Duration: 1-2 giây
- Logo animation: Scale up + fade in
- Background: Brand gradient

### 3.2 Onboarding Screens

```
┌─────────────────────────────────┐     ┌─────────────────────────────────┐
│                                 │     │                                 │
│         🎓                      │     │    🎧 🗣️ 📖                    │
│                                 │     │                                 │
│   Xin chào!                    │     │   3 Kỹ năng với AI             │
│                                 │     │                                 │
│   Sẵn sàng học tiếng Anh?      │     │   Listening • Speaking          │
│                                 │     │   Reading                       │
│                                 │     │                                 │
│         ○ ○ ○                   │     │         ○ ● ○                   │
│                                 │     │                                 │
│       [Tiếp tục →]              │     │       [Tiếp tục →]              │
└─────────────────────────────────┘     └─────────────────────────────────┘

┌─────────────────────────────────┐
│                                 │
│         🌍                      │
│                                 │
│   Học mọi lúc, mọi nơi         │
│                                 │
│   Online & Offline             │
│   Sync mọi thiết bị             │
│                                 │
│         ○ ○ ●                   │
│                                 │
│     [Bắt đầu ngay →]            │
└─────────────────────────────────┘
```

**Specs:**
- Swipeable PageView
- Skip button (optional)
- Dot indicators

### 3.3 Auth Screen

```
┌─────────────────────────────────┐
│                                 │
│         📚                      │
│    StudyLanguage               │
│                                 │
│                                 │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │  🔵 Tiếp tục với Google │   │
│  └─────────────────────────┘   │
│                                 │
│  ─────────────────────────────  │
│           Chính sách            │
│                                 │
└─────────────────────────────────┘
```

**Specs:**
- Google button: Primary, prominent, là nút đăng nhập duy nhất
- Policy links at bottom

---

## 4. Technical Implementation

### 4.1 Storage Strategy

| Data | Storage | Reason |
|------|---------|--------|
| Access Token | SecureStore | Encrypted, secure |
| Refresh Token | SecureStore | Encrypted, secure |
| User Profile | AsyncStorage | Quick access |
| Auth State | Zustand (memory) | Fast UI updates |

### 4.2 Libraries

```typescript
// Required packages
@react-native-google-signin/google-signin // OAuth flows
react-native-keychain    // Token storage (Keychain/Keystore)
@supabase/supabase-js    // Auth provider
```

### 4.3 Auth Context Structure

```typescript
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  
  // Actions
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}
```

### 4.4 Token Management

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ [App Start]  →  [Check Token]  →  [Valid?]  →  [Home]      │
│                       │              │                      │
│                       │         [Expired?]                  │
│                       │              │                      │
│                       └──────►  [Refresh]  →  [Home]       │
│                                    │                        │
│                               [Fail?]                       │
│                                    │                        │
│                               [Login Screen]                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Error Handling

| Error | UI Response |
|-------|-------------|
| Google OAuth cancelled | Toast: "Đã hủy đăng nhập" |
| Network error | Alert + Retry button |
| Account not found | Create account option |

---

## 6. Security Considerations

### 6.1 Best Practices
- ✅ Tokens stored in SecureStore (encrypted)
- ✅ No sensitive data in AsyncStorage
- ✅ HTTPS only for all API calls
- ✅ Session timeout after 30 days inactivity

---

## 7. Implementation Tasks

### MVP Phase
- [ ] Setup @react-native-google-signin
- [ ] Implement Google OAuth flow
- [ ] Create auth screens (Splash, Onboarding, Login)
- [ ] Token storage with SecureStore
- [ ] Auto-relogin on app start

### Enhanced Phase
- [ ] Session management UI

---

## 8. Related Documents

- [00_Mobile_Overview.md](../00_Mobile_Overview.md) - Project overview
- [08_Profile_Settings.md](08_Profile_Settings.md) - Settings for auth preferences
- [Architecture.md](../technical/Architecture.md) - Technical details
