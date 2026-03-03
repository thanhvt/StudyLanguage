# 🎨 Style Convention - Mobile

> **Module:** Design Convention  
> **Scope:** UI/UX Consistency Rules for React Native  
> **Reference:** [UI_Design_System.md](UI_Design_System.md)  
> **Master Source of Truth:** [Obsidian_Glass_Style_Guide.md](Obsidian_Glass_Style_Guide.md)

---

## 1. Component Usage Patterns

### 1.1 Decision Tree — Which Component to Use?

```
Need user action?
├── Single primary action → Primary Button
├── Secondary/cancel action → Secondary Button
├── Subtle/link-style action → Ghost Button
├── Icon-only action → Icon Button (44×44 min)
└── Destructive action → Primary Button (Error color)

Need to select from options?
├── 2-5 options, single select → Chips/Pills (e.g., Duration: 5 | 10 | 15)
├── 2-3 options, toggle → Segmented Control (e.g., Light | Dark | Auto)
├── Many options → Dropdown (e.g., Topic selector)
├── Binary on/off → Toggle Switch
└── Multiple select → Checkboxes

Need to show content?
├── Navigable item in a list → Session Card (with left accent border)
├── Feature entry point → Feature Card (icon + title + subtitle)
├── Detailed info → Detail Section (header + content block)
└── Inline feedback/tip → Alert Card (⚠️/✅/💡 prefixed)

Need user input?
├── Short text → Text Input (single line, 48px height)
├── Long text → TextArea (multi-line)
├── Numeric range → Slider (e.g., Speed: 0.5x — 2.0x)
└── Search → Search Input (🔍 icon prefix)

Need overlay/modal?
├── Settings/options panel → Bottom Sheet (drag handle, 24px top radius)
├── Confirmation (destructive) → Alert Dialog (centered modal)
├── Quick info (word lookup) → Popup/Tooltip
└── Multi-action context menu → Bottom Sheet (action list)
```

### 1.2 Button Variants Reference

| Variant | When to Use | Example |
|---------|-------------|---------|
| **Primary** | Main CTA, 1 per screen | "Bắt đầu nghe", "Tạo bài đọc" |
| **Secondary** | Cancel, alternative action | "Hủy", "Bỏ qua" |
| **Ghost** | Tertiary link-style action | "Xem tất cả →", "Learn More" |
| **Icon** | Toolbar actions, settings gear | ⚙️, 🔔, ⋮ |
| **Destructive** | Delete, logout | "Xóa", "Đăng xuất" |

> **Rule:** Maximum **1 Primary Button** visible per screen at a time. Other actions use Secondary or Ghost.

### 1.3 Card Types Reference

| Card Type | Left Accent? | When to Use | Example |
|-----------|-------------|-------------|---------|
| **Session Card** | ✅ Skill color | History list, recent lessons | 🎧 Coffee Shop Talk • 15 min |
| **Feature Card** | ❌ | Dashboard quick actions, topic selection | 🎧 Listening → |
| **Config Card** | ❌ | Settings sections, grouped options | Audio Settings section |
| **Alert/Tip Card** | ❌ | Inline feedback, pronunciation tips | ⚠️ "usually" → /ˈjuːʒuəli/ |
| **Stat Card** | ❌ | Stats overview, analytics metrics | 🔥 12 Streak |

**Session Card Accent Colors (Consistent Across App):**

| Skill | Color | Hex |
|-------|-------|-----|
| Listening | Indigo | `#6366F1` |
| Speaking | Green | `#4ade80` |
| Reading | Gold | `#fbbf24` |

### 1.4 Bottom Sheet vs Modal vs Alert

| Component | When to Use | Examples |
|-----------|-------------|---------|
| **Bottom Sheet** | Options, settings, multi-action menus | Advanced options, Quick actions, Speed control |
| **Alert Dialog** | Confirmations requiring explicit decision | Delete confirmation, Logout, Discard changes |
| **Alert.alert() (native)** | Confirmations **inside Modal/Sheet** | Delete inside TopicPicker, any action in bottom sheet |
| **Popup/Tooltip** | Quick contextual info, non-blocking | Dictionary popup, Pronunciation tip |
| **Toast/Snackbar** | Transient feedback, auto-dismiss | "Saved!", "Downloaded", "Error occurred" |

> [!CAUTION]
> **Alert.alert() vs showConfirm():** Custom `showConfirm()` (DialogProvider) renders ở app root. React Native `<Modal>` tạo native layer mới → custom Dialog hiển thị **DƯỚI** modal → user không thấy. Dùng `Alert.alert()` trong modal/sheet.

---

## 2. Screen Layout Patterns

### 2.1 Standard Screen Template

Every screen follows this vertical structure:

```
┌─────────────────────────────────┐
│  ← Title                    [⋮] │  ← Header (Navigation bar)
├─────────────────────────────────┤
│                                 │
│  [Content Area]                 │  ← ScrollView / FlatList
│  • Sections with headers        │
│  • Cards, inputs, lists         │
│                                 │
├─────────────────────────────────┤
│  [Primary CTA Button]          │  ← Fixed bottom (if needed)
└─────────────────────────────────┘
│ 🏠 │ 🎧 │ 📖 │ 🗣️ │ 📜 │ ⚙️ │  ← Tab Bar (6 tabs)
└─────────────────────────────────┘
```

**Rules:**
- Header: Always show back arrow `←` + screen title (left-aligned)
- Header right: Optional action icon(s) — max 2 icons
- Content: `24px` horizontal padding (use `xl` spacing token)
- Primary CTA: Fixed at bottom with `24px` padding when needed
- Safe area: Always respect device safe area insets

### 2.2 Config/Form Screen Template

Used by: Listening Config, Reading Config, Speaking Setup, Conversation Coach Setup

```
┌─────────────────────────────────┐
│  ← [Feature Name]           ⋮  │
├─────────────────────────────────┤
│                                 │
│  📝 Section Label              │  ← Section with emoji prefix
│  Description or helper text     │  ← Optional subtitle
│  ┌─────────────────────────┐   │
│  │ [Input / Selector]       │   │  ← Component (see §1.1)
│  └─────────────────────────┘   │
│                                 │
│  ⏱️ Section Label              │
│  ┌─────────────────────────┐   │
│  │ [Input / Selector]       │   │
│  └─────────────────────────┘   │
│                                 │
│  ▼ Advanced Options             │  ← Expandable (Bottom Sheet)
│                                 │
│  ┌─────────────────────────┐   │
│  │    [emoji] Primary CTA   │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

**Rules:**
- Each config section: Emoji icon + Label + optional helper text
- Section spacing: `20px` (`lg` token) between sections
- Advanced options: Collapsible → opens Bottom Sheet
- Primary CTA: Always at the bottom, full-width with `24px` horizontal margin

### 2.3 Player/Practice Screen Template

Used by: Listening Player, Speaking Practice, Shadowing, Reading Practice

```
┌─────────────────────────────────┐
│  ← [Session Title]     [timer] │
├─────────────────────────────────┤
│  📊 Score / Stats bar           │  ← Optional: score, streak, progress
├─────────────────────────────────┤
│                                 │
│  [Main Content Area]            │  ← Transcript, sentence, article
│  • Scrollable content           │
│  • Auto-scroll with highlight   │
│                                 │
├─────────────────────────────────┤
│  [Visualization]                │  ← Waveform, progress bar
│  [Playback / Record Controls]   │  ← Center-aligned, large touch targets
│                                 │
├─────────────────────────────────┤
│  [Action Bar]                   │  ← Save | Repeat | Speed | etc.
└─────────────────────────────────┘
```

**Rules:**
- Timer (if applicable): Right-aligned in header
- Main controls: Center of bottom area, large (80px mic button, 56px play/pause)
- Waveform: Always use Reanimated + Lottie for smooth animation
- Action bar: Secondary actions as icon buttons with labels

### 2.4 List Screen Template

Used by: History Timeline, Topic Selection, Scenario List, Search Results

```
┌─────────────────────────────────┐
│  [Title]                   [🔍] │
├─────────────────────────────────┤
│  [Filter Tabs / Chips]          │  ← Horizontal scroll if needed
│  [Sort / Date Range]            │  ← Optional secondary filters
├─────────────────────────────────┤
│                                 │
│  ─── Group Header ─────────── │  ← Date separator or category
│                                 │
│  ┌─────────────────────────┐   │
│  │ [List Item Card]         │   │  ← Consistent card style
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ [List Item Card]         │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

**Rules:**
- Filter tabs: Sticky at top, horizontal scroll
- Group headers: Date separators with `─── Label ───` pattern
- Card spacing: `8px` (`sm` token) between cards
- Pull-to-refresh: Always supported on list screens
- Swipe actions: Left = Delete (red), Right = Pin/Favorite (yellow)

### 2.5 Detail Screen Template

Used by: Session Detail (all types), About

```
┌─────────────────────────────────┐
│  ← [Item Title]             ⋮  │
├─────────────────────────────────┤
│                                 │
│  [Type Icon] [Type Label]       │  ← Session type identification
│  📅 Date • ⏱️ Duration          │  ← Metadata row
│                                 │
├─────────────────────────────────┤
│  📊 [Performance Section]       │  ← Scores, progress bars
├─────────────────────────────────┤
│  📝 [Content Section]           │  ← Transcript, quiz review, etc.
├─────────────────────────────────┤
│  [Action Buttons Row]           │  ← Replay, Retry, Share
└─────────────────────────────────┘
```

---

## 3. UX State Patterns

Every interactive screen **MUST** handle all 4 states. No exceptions.

### 3.1 Loading States

| Context | Pattern | Spec |
|---------|---------|------|
| **Full screen first load** | Skeleton Loading | Shimmer animation (left→right gradient), 3-4 skeleton cards |
| **Content generating (AI)** | Progress Indicator | Spinner + descriptive text ("Đang tạo bài nghe...") |
| **Pull-to-refresh** | Native RefreshControl | Platform default pull-to-refresh |
| **Inline loading** | Spinner | Small spinner next to the triggering element |
| **Button loading** | Disabled + Spinner | Replace button text with spinner, disable touch |

**Skeleton Pattern:**
```
┌─────────────────────────────┐
│▎░░░░░░░░░░░░░░░░░░░░       │  ← Title skeleton
│▎░░░░░░░░░░ • ░░░░░░░       │  ← Subtitle skeleton
└─────────────────────────────┘
```
- Shimmer: Left → right gradient pulse animation
- Duration: 1.5s loop
- Colors: `surface` → `surface-raised` → `surface`

### 3.2 Error States

| Context | Pattern | Spec |
|---------|---------|------|
| **Network error** | Full-screen error | Illustration + message + "Thử lại" button |
| **API error** | Toast/Snackbar | Red accent, auto-dismiss 4s, with retry action |
| **Form validation** | Inline error | Red text below input field |
| **Generation failure** | Alert card | Inline card with error message + retry |

**Full-screen Error Pattern:**
```
┌─────────────────────────────┐
│                             │
│        [🔌 Illustration]    │
│                             │
│   Không thể kết nối         │
│   Kiểm tra kết nối mạng     │
│                             │
│     [🔄 Thử lại]           │
│                             │
└─────────────────────────────┘
```

### 3.3 Empty States

| Context | Pattern | Spec |
|---------|---------|------|
| **No data yet** | Illustration + CTA | Lottie animation + motivational text + action buttons |
| **No search results** | Text + suggestion | "Không tìm thấy kết quả" + suggestion chips |
| **Filtered empty** | Contextual CTA | Skill-specific icon + "Bắt đầu [skill] ngay" button |
| **Guest/Not logged in** | Lock icon + Login CTA | 🔐 icon + "Đăng nhập để xem" |

**Rules:**
- Always include at least one actionable CTA
- Use Lottie animations for engaging empty states
- Fade-in animation when rendering empty state

### 3.4 Success Feedback

| Context | Pattern | Spec |
|---------|---------|------|
| **Score ≥ 90** | Confetti animation | Full-width confetti, 2s duration |
| **Score < 90** | Score animation | Animated counter (0 → score) |
| **Action completed** | Toast | Green accent, auto-dismiss 3s |
| **Record saved** | Toast + haptic | Success haptic + green toast |
| **Quiz correct** | Confetti + haptic | Mini confetti + success notification haptic |
| **Quiz incorrect** | Shake + haptic | Shake animation + warning haptic |

### 3.5 Confirmation Patterns

| Action | Pattern | Required? |
|--------|---------|-----------|
| Delete single item | Swipe + undo toast OR Alert dialog | Yes |
| Delete multiple items (batch) | Alert dialog with count | Yes |
| Logout | Alert dialog with data warning | Yes |
| Change playing audio | Alert dialog ("Bạn đang nghe...") | Yes |
| Discard unsaved changes | Alert dialog | Yes |
| Clear cache | Alert dialog | Yes |

---

## 4. Navigation Patterns

### 4.1 Stack Transitions

| Navigation Type | Transition | Example |
|----------------|------------|---------|
| Push (forward) | Slide from right | Home → Config → Player |
| Pop (back) | Slide to right | Player → Config |
| Modal present | Slide from bottom | Bottom Sheet, Popups |
| Modal dismiss | Slide to bottom | Close bottom sheet |
| Tab switch | Crossfade / None | Dashboard ↔ Listening ↔ Reading ↔ Speaking ↔ History ↔ Settings |

### 4.2 Header Patterns

| Screen Type | Left | Center | Right |
|-------------|------|--------|-------|
| Tab root screen | App logo or Tab title | — | Action icon(s) |
| Stack screen | ← Back | — | Action icon(s) |
| Modal/Sheet | — | Title | ✕ Close |

**Rules:**
- Back button: Always `← chevron` on iOS, `← arrow` on Android
- Max 2 action icons on the right side of header
- Title: Left-aligned (following iOS large title convention)

### 4.3 Tab Bar

```
┌──────────────────────────────────────────────────────────┐
│  🏠 Dashboard │ 🎧 Listening │ 📖 Reading │ 🗣️ Speaking │ 📜 History │ ⚙️ Settings │
└──────────────────────────────────────────────────────────┘
```

**Rules:**
- 6 tabs: Dashboard, Listening, Reading, Speaking, History, Settings
- Active tab: Primary color icon + label
- Inactive tab: `text-secondary` color
- Badge: Red dot for notifications (if applicable)
- Hide tab bar: On full-screen player/practice screens

### 4.4 Deep Linking & Back Behavior

| Context | Back Button Behavior |
|---------|---------------------|
| Config → Player → Feedback | Back goes to Config (skip Player) |
| History → Detail | Back goes to History list |
| Any → Bottom Sheet | Dismiss sheet (swipe down or back) |
| Notification tap | Navigate to relevant screen |
| Player active + navigate | Show compact/minimized player |

### 4.5 Gesture Navigation

| Gesture | Context | Action |
|---------|---------|--------|
| Swipe right from edge | Any stack screen | Go back |
| Swipe down | Bottom Sheet, Modal, Full-screen Player | Dismiss / Minimize |
| Swipe left on card | List item (History) | Delete action (red reveal) |
| Swipe right on card | List item (History) | Pin/Favorite (yellow reveal) |
| Long press on card | List item | Quick Actions bottom sheet |
| Pull down | Any scrollable list | Refresh data |
| Double tap | Player | Play/Pause toggle |
| Pinch | Reading article | Zoom text |

---

## 5. Responsive & Adaptive

### 5.1 Screen Size Handling

| Screen Size | Behavior |
|------------|----------|
| Small phones (< 375px) | Single column, reduced padding (12px), smaller type scale |
| Standard phones (375-414px) | Default layout, 16px padding |
| Large phones (> 414px) | Default layout, wider cards |
| Tablets | **Not primary target** — same phone layout centered, max-width 500px |

### 5.2 Orientation

| Orientation | Policy |
|-------------|--------|
| Portrait | **Primary** — all screens optimized for portrait |
| Landscape | Lock to portrait for most screens. Exception: Video/Full-screen player |

### 5.3 Dynamic Type / Accessibility Scaling

| Setting | Effect |
|---------|--------|
| System font small | Body: 14sp, Title: 18sp |
| System font default | Body: 16sp, Title: 20sp |
| System font large | Body: 18sp, Title: 24sp |

**Rules:**
- Always use `sp` (scaled pixels) for text, never fixed `px`
- Test all screens at 1.5x font scale
- Ensure touch targets remain ≥ 44pt/48dp even at large text

### 5.4 Safe Areas

- **Top:** Respect notch / Dynamic Island / status bar
- **Bottom:** Respect home indicator / navigation bar
- **Keyboard:** Use `KeyboardAvoidingView` or `react-native-keyboard-aware-scroll-view`

---

## 6. Do's & Don'ts Checklist

### ✅ Always Do

| Rule | Reason |
|------|--------|
| Use design tokens from `UI_Design_System.md` | Consistency across app |
| Handle all 4 UX states (Loading, Error, Empty, Success) | Professional feel |
| Use `xl` (24px) horizontal screen padding | Consistent spacing |
| Add haptic feedback on interactive elements | Native feel |
| Use skeleton loading for first-time data fetch | Perceived performance |
| Respect platform conventions (iOS vs Android) | User familiarity |
| Use accent border colors for skill identification | Visual consistency |
| Add animation with `react-native-reanimated` | Smooth 60fps |
| Provide undo option for destructive actions | Error recovery |
| Use Lottie for complex animations / empty states | Performance + quality |
| Test at large/small font scales | Accessibility |
| Include `accessibilityLabel` on all interactive elements | Screen reader support |

### ❌ Never Do

| Rule | Reason |
|------|--------|
| Hardcode colors, sizes, or spacing values | Use tokens instead |
| Create new components when similar exists in `ui/` | Avoid duplication |
| Use `Alert.alert()` for complex UI — use Bottom Sheet | Better UX |
| Use `showConfirm()` inside RN `<Modal>` | Dialog renders behind Modal → invisible. Dùng `Alert.alert()` |
| Use `variant="outline"` buttons on dark mode | Nearly invisible on OLED black → dùng `secondary` |
| Use `text-destructive` token for delete icons | Too dark → dùng explicit `#EF4444` |
| Use `paddingTop: insets.top` in pageSheet Modal | Double-counts safe area → dùng `paddingTop: 8` |
| Place more than 1 Primary Button visible at once | Confusing hierarchy |
| Skip empty/error/loading states | Looks broken |
| Use inline styles for recurring patterns | Maintainability |
| Mix Vietnamese and English in the same UI label | Consistency |
| Ignore safe area insets | Content hidden behind notch/home bar |
| Use fixed `px` for text sizes | Breaks accessibility |
| Show raw error messages to users | Poor UX |
| Block the main thread with heavy computation | Janky UI |
| Use more than 2 action icons in header | Cluttered |
| Import `@callstack/liquid-glass` directly | Crash iOS < 26 → dùng `@/utils/LiquidGlass` |

---

## 7. Quick Reference Card

### Color by Skill

| Skill | Emoji | Color | Hex |
|-------|-------|-------|-----|
| Listening | 🎧 | Indigo | `#6366F1` |
| Speaking | 🗣️ | Green | `#4ade80` |
| Reading | 📖 | Gold | `#fbbf24` |

### Standard Interactions

| Element | Press Effect | Haptic |
|---------|-------------|--------|
| Card tap | Scale 0.92x, spring (damping=15) | Light impact |
| Button tap | Scale 0.92x, spring (damping=15) | Light impact |
| Successful action | — | Success notification |
| Error / Warning | Shake animation | Warning notification |
| Destructive confirm | — | Heavy impact |
| Recording start | Pulsing animation | Continuous light |

### Spacing Tokens (Quick Ref)

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Icon padding, tight gaps |
| `sm` | 8px | Between related items, card spacing |
| `md` | 12px | Padding nhỏ trong cards |
| `base` | 16px | Standard padding (px-4, py-4) |
| `lg` | 20px | Section spacing |
| `xl` | 24px | Screen horizontal padding (px-6) |
| `2xl` | 32px | Khoảng cách section lớn |

---

## 8. Related Documents

- [Obsidian_Glass_Style_Guide.md](Obsidian_Glass_Style_Guide.md) — **🎯 Master source of truth** cho design tokens, colors, shadows, animations
- [UI_Design_System.md](UI_Design_System.md) — Design tokens (colors, typography, components)
- [00_Mobile_Overview.md](../00_Mobile_Overview.md) — Project overview
- [Architecture.md](../technical/Architecture.md) — Technical architecture

---

## 9. iOS Version-Specific Rules

### 9.1 iOS 26+ (LiquidGlass)

| Feature | iOS 26+ | iOS < 26 / Android |
|---------|---------|--------------------|
| Glass effect | `LiquidGlassView` native | `View` + `rgba(255,255,255,0.06)` borders |
| Import | `@/utils/LiquidGlass` (wrapper) | Same wrapper (fallback tự động) |
| Tab bar | Transparent glass | Solid `surfaceRaised` |
| Modal backdrop | System blur | `rgba(0,0,0,0.5)` overlay |

### 9.2 Platform-specific decisions

| Decision | iOS | Android |
|----------|-----|--------|
| Confirm trong Modal | `Alert.alert()` (native, luôn on top) | `Alert.alert()` (same) |
| Bottom sheet | `@gorhom/bottom-sheet` | Same |
| Haptic | `react-native-haptic-feedback` | Vibration API fallback |
| Status bar style | `light-content` always | Same |

> [!IMPORTANT]
> **Luôn** dùng `@/utils/LiquidGlass` wrapper thay vì import trực tiếp `@callstack/liquid-glass`. Import trực tiếp sẽ **crash** trên iOS < 26.

---

## 10. Dark Mode Visibility Rules

> Rút ra từ bug fixes thực tế. **Bắt buộc** cho tất cả features.

### 10.1 Minimum visibility trên OLED Black

| Element | ❌ Quá tối | ✅ Đúng |
|---------|-----------|--------|
| Delete icon | `text-destructive` | `style={{color: '#EF4444'}}` |
| Secondary button | `variant="outline"` | `variant="secondary"` |
| "Đã chọn" badge | `neutrals400` text | `foreground` + ✓ icon + accent name |
| Input border | `neutrals700` | `neutrals800` (consistency) |
| Cancel button | `variant="outline"` | `variant="secondary"` |

### 10.2 Selected state indicator pattern

```
✅ Chuẩn:
  ┌──────────────────────────────────────┐
  │  ✓   Topic Name đang chọn        X  │
  └──────────────────────────────────────┘
  Background: accent/10  |  Border: accent/25
  Icon ✓: accent color   |  Name: font-bold accent
  Nút X: neutrals400     |  Dismiss action
```
