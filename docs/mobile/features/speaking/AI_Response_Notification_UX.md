# 🔔 AI Response Notification — UX Design & Implementation Guide

> **Module:** Speaking → Conversation Coach  
> **Section:** 1.9 Background Audio cho Coach  
> **Priority:** P1 (Enhancement)  
> **Created:** 2026-02-26  

---

## 1. Tổng quan

Khi user đang trong **Conversation Coach mode** và **minimize app** hoặc chuyển screen, cần có cơ chế thông báo để user biết AI đã phản hồi và quay lại tiếp tục session.

### Quyết định thiết kế

> [!IMPORTANT]
> API phản hồi đủ nhanh (< 3 giây) nên **KHÔNG CẦN Push Notification từ server**. Thay vào đó, tập trung vào **Session Persist** + **In-app notification** + **Smart throttling**.

### Ưu tiên triển khai

| Ưu tiên | Feature | Mô tả | Độ khó |
|---------|---------|-------|--------|
| **P0** | Session Persist | Giữ session khi chuyển app, resume khi quay lại | Trung bình |
| **P2** | Smart Throttling | Chỉ notify khi user rời > 10s, gộp nhiều response | Thấp |
| **P3** | In-app Badge | Badge "X tin nhắn mới" khi quay lại app/screen | Thấp |

> ~~**P1 — Push Notification từ server**~~ → **Loại bỏ** vì API response đủ nhanh, không cần server-side push.

---

## 2. P0 — Session Persist

### Mục tiêu

Giữ nguyên state của Conversation Coach session khi user chuyển app hoặc chuyển screen, resume mượt mà khi quay lại.

### Yêu cầu

| Yêu cầu | Mô tả |
|----------|-------|
| **State preservation** | Toàn bộ `ConversationCoachState` được lưu khi app background |
| **Timer pause** | Countdown timer tạm dừng khi background, resume khi foreground |
| **Message queue** | Nếu AI response về trong lúc background → queue lại, hiển thị khi resume |
| **Auto-save** | Session auto-save transcript khi app bị kill bất ngờ |
| **Max idle time** | Session tự kết thúc nếu user rời > 15 phút |

### Technical Approach

```typescript
// Pseudo-code: Session Persist
import { AppState } from 'react-native';
import { useMMKVStorage } from 'react-native-mmkv';

/**
 * Mục đích: Lắng nghe AppState để pause/resume session
 * Tham số đầu vào: sessionId - ID của coach session hiện tại
 * Tham số đầu ra: Không có (side effect: persist/restore state)
 * Khi nào sử dụng: Mount trong CoachSessionScreen
 */
function useSessionPersist(sessionId: string) {
  const [persistedSession, setPersistedSession] = useMMKVStorage('coach_session');
  
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        // Lưu state hiện tại vào MMKV
        setPersistedSession({
          ...currentSession,
          pausedAt: Date.now(),
          remainingTime: timerRef.current,
        });
        // Tạm dừng timer
        pauseTimer();
      }
      
      if (state === 'active') {
        // Khôi phục session
        const saved = persistedSession;
        if (saved && saved.sessionId === sessionId) {
          const idleTime = Date.now() - saved.pausedAt;
          
          if (idleTime > 15 * 60 * 1000) {
            // Rời quá 15 phút → kết thúc session, lưu transcript
            autoEndSession(saved);
          } else {
            // Resume bình thường
            restoreSession(saved);
            resumeTimer(saved.remainingTime);
          }
        }
      }
    });
    
    return () => subscription.remove();
  }, [sessionId]);
}
```

### Resume UX khi quay lại

```
┌─────────────────────────────────────────┐
│  💬 Coach Session — Resumed             │
│                                         │
│  ╭───────────────────────────╮         │
│  │ 🤖 AI (2 phút trước)      │         │  ← Timestamp relative
│  │ That's a great point!     │         │
│  ╰───────────────────────────╯         │
│                                         │
│  ── Tin nhắn mới ──────────────────    │  ← Divider rõ ràng
│                                         │     Auto-scroll tới đây
│  ╭───────────────────────────╮         │
│  │ 🤖 AI                     │         │
│  │ I was also wondering...   │         │
│  ╰───────────────────────────╯         │
│                                         │
│  ⏱️ Còn 3:42 — Session resumed         │  ← Timer tiếp tục
│                                         │
│  ┌───────────────────────────┐         │
│  │  🎤 Giữ để nói...         │         │
│  └───────────────────────────┘         │
└─────────────────────────────────────────┘
```

| Rule | Mô tả | Lý do |
|------|--------|-------|
| Auto-scroll | Scroll đến tin nhắn mới nhất | User thấy ngay AI đã nói gì |
| "Tin nhắn mới" divider | Dòng phân cách giữa cũ và mới | Rõ ràng đâu đã đọc, đâu là mới |
| Timestamp relative | Hiện "X phút trước" trên tin cũ | Context thời gian |
| Timer resume | Tiếp tục đếm ngược, **không reset** | Session continuity |
| Fade-in animation | Nhẹ nhàng khi resume | Không gây disoriented |

---

## 3. P2 — Smart Throttling

### Mục tiêu

Tránh spam notification khi có nhiều AI response liên tiếp. Chỉ notify khi thực sự cần thiết.

### Logic Flow

```
AI Response xong
     │
     ▼
┌─────────────────┐
│ User trong app   │──YES──→ Tầng 1: In-App Toast
│ cùng screen?    │
└────────┬────────┘
         │ NO
         ▼
┌──────────────────────┐
│ User trong app       │──YES──→ Tầng 2: Toast + Badge trên tab
│ khác screen?         │
└────────┬─────────────┘
         │ NO (app background)
         ▼
┌──────────────────────┐
│ Rời app < 10 giây?   │──YES──→ ĐỢI (chờ user quay lại)
└────────┬─────────────┘
         │ NO (> 10s)
         ▼
┌──────────────────────┐
│ Đã notify trong      │──YES──→ GỘP (update count, không gửi mới)
│ 30s gần đây?         │
└────────┬─────────────┘
         │ NO
         ▼
   Hiển thị In-App Badge + Queue message
```

### Config

```typescript
// Cấu hình throttling
const NOTIFICATION_CONFIG = {
  // Thời gian chờ trước khi notify (user rời app)
  BACKGROUND_DELAY_MS: 10_000,    // 10 giây
  
  // Khoảng cách tối thiểu giữa 2 notification
  MIN_INTERVAL_MS: 30_000,        // 30 giây
  
  // Số message tối đa gộp trước khi notify
  MAX_QUEUE_BEFORE_NOTIFY: 5,
  
  // Thời gian toast tự biến mất
  TOAST_AUTO_DISMISS_MS: 5_000,   // 5 giây
};
```

### Anti-Spam Rules

| Rule | Mô tả |
|------|--------|
| **Debounce 10s** | Chỉ notify nếu user rời > 10s |
| **Gộp notification** | Nhiều response → 1 notification "AI đã trả lời 3 lần" |
| **Cooldown 30s** | Tối thiểu 30s giữa 2 lần notify |
| **Max queue** | Sau 5 message chưa đọc → ngưng notify, chờ user quay lại |

---

## 4. P3 — In-App Badge

### Mục tiêu

Khi user ở trong app nhưng khác screen (ví dụ tab Listening, Settings...), hiển thị badge để nhắc có tin nhắn mới từ Coach.

### 4.1 Toast Notification (In-App)

Khi AI response đến mà user đang ở **screen khác trong app**:

```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐  │
│  │ 🗣️  Coach AI đã trả lời          │  │  ← Floating toast
│  │     Tap để tiếp tục hội thoại →  │  │     Slide down từ trên
│  └───────────────────────────────────┘  │     Auto dismiss sau 5s
│                                         │
│        ┌─────────────────────┐          │
│        │  Current Screen     │          │
│        │  (Listening, etc.)  │          │
│        └─────────────────────┘          │
│                                         │
│  ┌─────┬─────┬─────┬─────┬─────┐      │
│  │Home │Listen│Speak│Read │More │      │
│  │     │      │ 🔴  │     │     │      │  ← Badge dot trên tab
│  └─────┴─────┴─────┴─────┴─────┘      │
└─────────────────────────────────────────┘
```

### Toast UX Rules

| Rule | Mô tả | Lý do |
|------|--------|-------|
| Slide-in animation | Trượt xuống từ top, subtle bounce | Nhẹ nhàng, không giật mình |
| Auto dismiss 5s | Tự biến mất sau 5 giây | Không block nội dung |
| Tap to navigate | Tap → navigate thẳng về Coach session | Friction-free |
| Swipe to dismiss | Vuốt lên để tắt sớm | User kiểm soát |
| Haptic | Light impact khi toast xuất hiện | Nhận biết không intrusive |
| Không stack | 3 response → 1 toast "AI đã trả lời 3 tin" | Tránh spam |

### 4.2 Badge trên Tab Bar

| Element | Behavior |
|---------|----------|
| **Badge dot** | Chấm đỏ nhỏ (8px) trên icon tab Speaking |
| **Badge count** | Nếu > 1 tin → hiện số (ví dụ: `3`) |
| **Clear** | Badge biến mất khi user quay lại Coach screen |
| **Persistent** | Badge giữ nguyên cho đến khi user xem tin |

### 4.3 Resume Banner (khi quay lại screen)

Khi user navigate quay lại Speaking tab mà có session đang active:

```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐  │
│  │ 🟢 Session đang hoạt động         │  │  ← Banner nổi bật
│  │    AI đã trả lời 2 tin nhắn mới  │  │
│  │    [Tiếp tục]    [Kết thúc]      │  │
│  └───────────────────────────────────┘  │
│                                         │
│        Speaking Main Screen             │
└─────────────────────────────────────────┘
```

---

## 5. Notification 3 tầng — Tổng hợp

| Tầng | Trigger | UI Element | Behavior |
|------|---------|------------|----------|
| **Tầng 1** | User cùng screen Coach | Tin nhắn mới xuất hiện trực tiếp | Real-time, không cần notification |
| **Tầng 2** | User trong app, khác screen | Toast + Badge dot trên tab | Auto dismiss 5s, tap to resume |
| **Tầng 3** | User rời app (background) | In-app badge khi quay lại | Queue messages, hiện divider "tin mới" |

---

## 6. User Settings

User phải kiểm soát được notification:

```
⚙️ Coach Notifications
├── Thông báo AI trả lời        [🔵 ON/OFF]    ← Master toggle
├── Âm thanh                     [🔵 ON/OFF]
├── Rung (Haptic)                [⚪ ON/OFF]
├── Chờ trước khi thông báo
│   ├── ◉ 5 giây
│   ├── ○ 10 giây (mặc định)
│   ├── ○ 30 giây
│   └── ○ Không bao giờ
└── Preview nội dung             [🔵 ON/OFF]    ← Hiện/ẩn content trong toast
```

---

## 7. Anti-Patterns cần tránh

| ❌ Đừng làm | ✅ Nên làm | Lý do |
|-------------|-----------|-------|
| Notify mỗi AI response | Gộp + throttle | Notification fatigue |
| "AI is waiting for you!" (guilt-trip) | "AI đã trả lời 💬" (neutral) | Tôn trọng user |
| Mở app vào Home screen | Deep link vào Coach session | Giảm friction |
| Reset timer khi resume | Tiếp tục đếm ngược | Consistency |
| Gửi notification ngay khi minimize | Đợi > 10s | User có thể quay lại ngay |
| Âm thanh notification lớn | Soft chime hoặc silent | Context học tập |
| Stack nhiều toast | Gộp thành "AI đã trả lời 3 tin" | Tránh overwhelm |

---

## 8. Metrics đo hiệu quả

| Metric | Mục đích | Target |
|--------|----------|--------|
| Session resume rate | % session bị interrupt được resume | > 70% |
| Time to resume | Thời gian từ lúc quay lại → bắt đầu nói | < 3s |
| Toast tap rate | % user tap toast để quay lại Coach | > 40% |
| Session completion rate | % session hoàn thành (so với trước khi có feature) | Tăng 15%+ |
| Notification opt-out rate | % user tắt notification | < 20% |

---

## 9. Implementation Checklist

### P0 — Session Persist
- [ ] `useSessionPersist.ts` — AppState listener, persist/restore via MMKV
- [ ] Timer pause/resume logic trong `CoachSessionScreen`
- [ ] Message queue khi background — hiển thị khi resume
- [ ] "Tin nhắn mới" divider + auto-scroll
- [ ] Auto-end session sau 15 phút idle
- [ ] Auto-save transcript khi app bị kill

### P2 — Smart Throttling
- [ ] `useNotificationThrottle.ts` — debounce + cooldown logic
- [ ] Notification config constants
- [ ] Gộp multiple responses thành 1 notification
- [ ] Max queue limit (5 messages)

### P3 — In-App Badge
- [ ] Toast component (`CoachNotificationToast.tsx`)
- [ ] Badge dot trên Speaking tab trong Tab Bar
- [ ] Badge count (hiện số tin chưa đọc)
- [ ] Resume banner khi quay lại Speaking screen
- [ ] Clear badge khi user xem tin
- [ ] Haptic feedback khi toast xuất hiện

### Settings
- [ ] Coach notification settings trong Profile/Settings screen
- [ ] Master toggle, sound, haptic, delay options
- [ ] Persist settings via MMKV

---

## 10. Tài liệu liên quan

- [03_Speaking.md](../03_Speaking.md) — Feature spec gốc (Section 1.9)
- [08_Profile_Settings.md](../08_Profile_Settings.md) — Settings UI
- [10_Native_Features.md](../10_Native_Features.md) — Haptic feedback specs
