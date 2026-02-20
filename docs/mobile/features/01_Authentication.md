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


## 4. Technical Implementation

### 4.1 Storage Strategy

| Data | Storage | Reason |
|------|---------|--------|
| Access Token | SecureStore | Encrypted, secure |
| Refresh Token | SecureStore | Encrypted, secure |
| User Profile | MMKV | Quick access |
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
- ✅ No sensitive data in MMKV
- ✅ HTTPS only for all API calls
- ✅ Session timeout after 30 days inactivity

---

## 7. Implementation Tasks

### MVP Phase
- [ ] Setup @react-native-google-signin
- [ ] Implement Google OAuth flow
- [ ] Create auth screens (Splash, Onboarding, Login)
- [ ] **Onboarding slides** (3 swipeable slides + Skip/Next/Get Started) (NEW ✨)
- [ ] Token storage with SecureStore
- [ ] Auto-relogin on app start
- [ ] **Auto-relogin loading state** (token check UX) (NEW ✨)
- [ ] **Error handling UI** (Toast cancelled, Alert + Retry network, Account not found) (NEW ✨)

### Enhanced Phase
- [ ] Session management UI

---

## 8. API Reference

> Authentication sử dụng **Supabase Auth** trực tiếp (không qua custom API controller)

### 8.1 Supabase Auth (Client SDK)

#### Google OAuth Sign-In

```typescript
// Luồng đăng nhập Google OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'studylanguage://auth/callback',
    queryParams: { access_type: 'offline', prompt: 'consent' }
  }
});
```

---

#### Session Management

```typescript
// Lấy session hiện tại
const { data: { session } } = await supabase.auth.getSession();

// Token refresh tự động
supabase.auth.onAuthStateChange((event, session) => {
  // event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED'
});

// Đăng xuất
await supabase.auth.signOut();
```

---

### 8.2 SupabaseAuthGuard (Server-side)

> Tất cả API endpoints (trừ `/feedback` POST) đều sử dụng `SupabaseAuthGuard`

**Header yêu cầu:**

```
Authorization: Bearer <Supabase JWT Access Token>
```

**Token claims:**

```json
{
  "sub": "user-uuid",
  "email": "user@gmail.com",
  "role": "authenticated",
  "iat": 1700000000,
  "exp": 1700003600
}
```

**Error responses:**

| Status | Mô tả |
|---|---|
| `401 Unauthorized` | Token thiếu hoặc hết hạn |
| `403 Forbidden` | Token không hợp lệ |

---

## 9. Related Documents

- [00_Mobile_Overview.md](../00_Mobile_Overview.md) - Project overview
- [08_Profile_Settings.md](08_Profile_Settings.md) - Settings for auth preferences
- [Architecture.md](../technical/Architecture.md) - Technical details
