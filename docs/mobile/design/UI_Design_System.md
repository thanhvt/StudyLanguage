# 🎨 UI Design System - Mobile

> **Module:** Design System  
> **Scope:** React Native + NativeWind  
> **Master Reference:** [Obsidian_Glass_Style_Guide.md](Obsidian_Glass_Style_Guide.md) — Source of truth cho tất cả design tokens

---

## 1. Overview

Design system cho mobile app, đảm bảo consistency và native feel trên cả iOS và Android.

---

## 2. Color System 🎨

### 2.1 Brand Colors

```
Primary (Green Nature):
┌─────────────────────────────────────────────────────────────┐
│  50   │  100  │  200  │  300  │  400  │  500  │  600  │ 700 │
│ #f0fdf4│#dcfce7│#bbf7d0│#86efac│#4ade80│#22c55e│#16a34a│#15803d│
└─────────────────────────────────────────────────────────────┘

Accent Colors (6 options — ❌ KHÔNG dùng Purple/Violet):
┌──────────────────────────────────────────────────────────────┐
│  🟢 Green   │  🔵 Blue   │  🔷 Indigo │  🟠 Orange │  🔴 Red  │
│  #22c55e   │  #3b82f6  │  #6366F1  │  #f97316  │  #ef4444 │
│             │           │           │           │          │
│  🩷 Pink    │           │           │           │          │
│  #ec4899   │           │           │           │          │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Semantic Colors

| Color | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| Background | #ffffff | #000000 | App background (OLED pure black) |
| Surface | #f5f5f5 | #0a0a0a | Cards, containers |
| Surface Raised | #ffffff | #171717 | Elevated cards, sheets |
| Border | #e5e5e5 | #262626 | Dividers |
| Text Primary | #171717 | #fafafa | Main text |
| Text Secondary | #737373 | #6e6e6e | Secondary text |
| Success | #22c55e | #4ade80 | Correct, success |
| Warning | #f59e0b | #fbbf24 | Warnings |
| Error | #ef4444 | #f87171 | Errors |

### 2.3 OLED Optimization (Dark Mode)

```
Background:     #000000 (pure black - pixels off, OLED-first)
Surface:        #0a0a0a (card nền, container)
Surface Raised: #171717 (card nổi, elevated element)
Neutrals900:    #1c1c1c (input field background)
Neutrals800:    #1d1d1d (viền nhẹ, separator)
```

---

## 3. Typography 🔤

### 3.1 Font Family

| Platform | Primary | Mono |
|----------|---------|------|
| iOS | SF Pro | SF Mono |
| Android | Roboto | Roboto Mono |

### 3.2 Type Scale

| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| Display | 32sp | 40 | Bold | Hero titles |
| Title 1 | 28sp | 36 | Bold | Page titles |
| Title 2 | 24sp | 32 | SemiBold | Section titles |
| Title 3 | 20sp | 28 | SemiBold | Card titles |
| Body | 16sp | 24 | Regular | Main content |
| Body Small | 14sp | 20 | Regular | Secondary text |
| Caption | 12sp | 16 | Regular | Labels, hints |
| Overline | 10sp | 14 | Medium | Tags, badges |

### 3.3 Dynamic Type Support

```typescript
// React Native
const fontSizes = {
  small: {
    body: 14,
    title: 18,
  },
  medium: {
    body: 16,
    title: 20,
  },
  large: {
    body: 18,
    title: 24,
  },
};
```

---

## 4. Spacing System 📐

### 4.1 Base Unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps nhỏ |
| sm | 8px | Giữa icon & text, inline gaps |
| md | 12px | Padding nhỏ trong cards |
| base | 16px | Standard padding (px-4, py-4) |
| lg | 20px | Section spacing |
| xl | 24px | Screen horizontal padding (px-6) |
| 2xl | 32px | Khoảng cách section lớn |
| 3xl | 48px | Safe area offsets |

### 4.2 Screen Padding

```
┌─────────────────────────────────┐
│←─ 24px ─→              ←─ 24px ─→│
│  ┌─────────────────────────┐   │
│  │  p-4 (16px) nội bộ      │   │
│  │       Content           │   │
│  │  gap-3 (12px) giữa items│   │
│  └─────────────────────────┘   │
│  mb-4 (16px) giữa sections    │
└─────────────────────────────────┘

Standard horizontal padding: 24px (px-6)
Card internal padding: 16px (p-4)
Safe area insets: Respected on notched devices
```

---

## 5. Touch Targets 👆

### 5.1 Minimum Sizes

| Platform | Minimum Size | Recommended |
|----------|--------------|-------------|
| iOS | 44pt × 44pt | 48pt × 48pt |
| Android | 48dp × 48dp | 56dp × 56dp |

### 5.2 Spacing Between Targets

```
Minimum: 8px between interactive elements
Recommended: 12px for comfortable tapping
```

### 5.3 Thumb Zone

```
┌─────────────────────────────────┐
│      HARD TO REACH              │ ← Settings, back button
│        (stretch)                │
├─────────────────────────────────┤
│      OK TO REACH                │ ← Content area
│       (natural)                 │
├─────────────────────────────────┤
│      EASY TO REACH              │ ← Primary CTAs
│    (thumb's natural arc)        │ ← Tab bar
└─────────────────────────────────┘
         [  HOME  ]
```

---

## 6. Components 🧩

### 6.1 Buttons

```
Primary Button (CTA):
┌─────────────────────────────────┐
│     🎧 Bắt đầu nghe            │
└─────────────────────────────────┘
Height: 56px
Border Radius: 16px (rounded-2xl)
Background: primary (#4ade80)
Text: #000000, 16sp, bold
Shadow: Glow (green shadow, opacity 0.35)

Disabled:
Background: neutrals700 (#414240)
Text: neutrals400
Shadow: none
Opacity: 1.0 (KHÔNG dùng opacity, chỉ đổi màu)

Secondary Button:
┌─────────────────────────────────┐
│           Cancel                │
└─────────────────────────────────┘
Height: 48px
Border: 1px primary
Background: transparent
Text: primary

Ghost Button:
         Learn More →
Height: 44px
Background: transparent
Text: primary

Icon Button:
    ┌────┐
    │ ⚙️ │
    └────┘
Size: 44px × 44px
Border Radius: 22px (circle)
```

**Usage Guidance:**
- **Primary:** Main CTA on the screen (max 1 visible at a time). E.g., "Bắt đầu nghe", "Tạo bài đọc"
- **Secondary:** Cancel or alternative actions alongside Primary. E.g., "Hủy", "Bỏ qua"
- **Ghost:** Tertiary actions, links, or "View All →" navigation
- **Icon:** Toolbar/header actions (⚙️, 🔔, ⋮). Always 44×44 minimum
- **Destructive variant:** Use Primary style with Error color for delete/logout
- **Outline variant ⚠️:** Nearly **invisible on dark mode OLED** — avoid on dark backgrounds, use `secondary` instead
- See [Style_Convention.md §1.2](Style_Convention.md#12-button-variants-reference) for full decision matrix

> [!WARNING]
> **Dark Mode đặc biệt:** `variant="outline"` cực kỳ khó nhìn trên nền #000000. Luôn dùng `variant="secondary"` cho button phụ trên dark mode.

### 6.2 Cards

```
Feature Card:
┌─────────────────────────────────┐
│  🎧  Listening                  │
│  Smart Conversation             │
│                          →      │
└─────────────────────────────────┘
Padding: 16px
Border Radius: 16px
Shadow: subtle
Background: surface

Session Card:
┌─────────────────────────────────┐
│ 🎧 Coffee Shop Talk         ⭐  │
│ 09:30 • 15 min • 80%            │
│ Podcast mode                    │
└─────────────────────────────────┘
Padding: 12px 16px
Border Radius: 12px
```

**Usage Guidance:**
- **Feature Card:** Dashboard quick actions, topic/scenario selection grids
- **Session Card:** History timeline items. Use left accent border for skill identification (🎧 Blue `#4F46E5`, 🗣️ Green `#16A34A`, 📖 Amber `#D97706`)
- **Stat Card:** Horizontal layout for metrics display (streak, time, count)
- **Alert/Tip Card:** Inline AI feedback, pronunciation corrections
- Card press: Apply `scale(0.95)` 150ms + haptic light impact
- See [Style_Convention.md §1.3](Style_Convention.md#13-card-types-reference) for full reference

### 6.3 Input Fields

```
Text Input:
┌─────────────────────────────────┐
│ 🔍  Search vocabulary...        │
└─────────────────────────────────┘
Height: 48px
Padding: 12px 16px
Border Radius: 12px
Border: 1px border color

Focused:
┌─────────────────────────────────┐
│ 🔍  Search vocabulary...        │
└─────────────────────────────────┘
Border: 2px primary-500
```

### 6.4 Bottom Sheets

```
┌─────────────────────────────────┐
│              ━━━━━              │ ← Drag handle
│  Sheet Title                    │
├─────────────────────────────────┤
│                                 │
│  Content area                   │
│                                 │
│                                 │
│      [Primary Action]           │
│                                 │
└─────────────────────────────────┘
Border Radius (top): 24px
Handle: 36px × 4px, centered
```

**Usage Guidance:**
- Use for: Advanced config options, action menus (long-press), speed selector, filter options
- **Not for:** Simple yes/no confirmations (use Alert Dialog instead)
- Dismiss: Swipe down or tap backdrop
- See [Style_Convention.md §1.4](Style_Convention.md#14-bottom-sheet-vs-modal-vs-alert) for Bottom Sheet vs Modal vs Alert decision guide

### 6.5 Toggle Switch

```
OFF:  ○─────────
ON:   ─────────●

Track: 52px × 32px, border-radius: 16px
Thumb: 28px circle
```

### 6.6 Progress Bar

```
┌─────────────────────────────────┐
│ [████████████░░░░░░░░] 60%     │
└─────────────────────────────────┘
Height: 8px
Border Radius: 4px
Track: border color
Fill: primary gradient
```

### 6.7 Chips/Pills

```
[  🌱 Topic 1  ] [  🌿 Topic 2  ] [  🌳 Topic 3  ]

Selected:
Background: {accentColor} at 8% opacity
Border: 1px {accentColor} (solid)
Text: {accentColor}, bold (700)

Unselected:
Background: transparent
Border: 1px neutrals800 (#1d1d1d)
Text: foreground (#fafafa), regular (400)

Padding: py-3 (12px vertical)
Border Radius: 16px (rounded-2xl)
Flex: flex-1 (equal width distribution)
Gap: 12px giữa các chips

Animation:
  onPressIn: scale → 0.92 (spring: damping=15, stiffness=300)
  onPressOut: scale → 1.0 (spring: damping=12, stiffness=200)
```

**Usage Guidance:**
- Use for: Single-select from 2-5 options (e.g., Duration: 5 | 10 | 15 min, Level: Beginner | Intermediate | Advanced)
- For binary on/off, use Toggle Switch instead
- For 2-3 segment options that are part of a control, use Segmented Control (e.g., Light | Dark | Auto)
- Horizontal scroll when options exceed screen width

---

## 7. Icons 🖼️

### 7.1 Icon Library

| Library | Usage |
|---------|---------|
| **Lucide Icons** (lucide-react-native) | Primary — cross-platform, consistent style |

```
Size:     w-5 h-5 (20px) standard, w-6 h-6 (24px) header actions
Color:    neutrals400 for UI icons, primary for accent states
Stroke:   2px (default Lucide)
```

### 7.2 Icon Sizes

| Size | Value | Usage |
|------|-------|-------|
| xs | 16px | Inline, badges |
| sm | 20px | Buttons, inputs |
| md | 24px | Tab bar, navigation |
| lg | 32px | Feature icons |
| xl | 48px | Empty states |

### 7.3 Feature / Skill Colors

| Feature | Emoji | Color | Hex |
|---------|-------|-------|-----|
| Listening | 🎧 | Indigo | `#6366F1` |
| Speaking | 🗣️ | Green | `#4ade80` |
| Reading | 📖 | Gold | `#fbbf24` |

---

## 8. Animation 🎬

### 8.1 Timing

| Action | Duration | Easing | Khi nào |
|--------|----------|--------|--------|
| Button/Card press | spring | damping=15, stiff=300 | Nhấn giữ chip/button/card |
| Button/Card release | spring | damping=12, stiff=200 | Thả chip/button/card |
| Expand/Collapse | 250ms | bezier(0.4, 0, 0.2, 1) | Mở/đóng section |
| Modal appear | 300ms | slide (native) | Sheet/Modal mở |
| Modal dismiss | 200ms | slide (native) | Sheet/Modal đóng |
| Fade in | 200ms | ease-out | Content xuất hiện |
| Fade out | 150ms | ease-in | Content biến mất |

### 8.2 Common Animations

```typescript
// Chip/Card/Button press animation (spring — scale 0.92)
const handlePressIn = () => {
  scale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
};
const handlePressOut = () => {
  scale.value = withSpring(1, { damping: 12, stiffness: 200 });
};

// Page transition
translateX: 0 → screen-width
duration: 300ms
easing: ease-in-out

// Modal appear
translateY: screen-height → 0
opacity: 0 → 1
duration: 300ms

// Collapsible expand
withTiming(isExpanded ? 1 : 0, {
  duration: 250,
  easing: Easing.bezier(0.4, 0, 0.2, 1),
});
```

### 8.3 Reduce Motion Support

```typescript
import { useReducedMotion } from 'react-native-reanimated';

const reduceMotion = useReducedMotion();
const duration = reduceMotion ? 0 : 300;
```

---

## 9. Shadows & Elevation 🌫️

### 9.1 Shadow Levels (iOS)

| Level | shadowOffset | shadowRadius | shadowOpacity | Dùng cho |
|-------|--------------|--------------|---------------|----------|
| sm (subtle) | 0, 2 | 4 | 0.06 | Section cards |
| md (medium) | 0, 4 | 8 | 0.12 | Buttons, floating actions |
| lg (strong) | 0, -4 | 16 | 0.15 | Bottom sheets, modals |
| xl (glow) | 0, 4 | 12 | 0.35 | CTA buttons (colored shadow) |

### 9.2 Elevation (Android)

| Level | elevation |
|-------|-----------|
| sm | 2 |
| md | 4 |
| lg | 20 |
| xl | 8 |

---

## 10. Dark Mode 🌙

### 10.1 Color Mapping

| Element | Light | Dark |
|---------|-------|------|
| Background | #ffffff | #000000 |
| Surface | #f5f5f5 | #0a0a0a |
| Surface Raised | #ffffff | #171717 |
| Text Primary | #171717 | #fafafa |
| Text Secondary | #737373 | #6e6e6e |
| Border | #e5e5e5 | #262626 |
| Primary | #22c55e | #4ade80 |

### 10.2 Dark Mode Guidelines

- ✅ Use pure black (#000000) for OLED
- ✅ Reduce contrast slightly (not pure white text)
- ✅ Use colored shadows cautiously
- ✅ Use `#EF4444` explicit hex for destructive icons (KHOÂNG `text-destructive`)
- ✅ Use `variant="secondary"` cho button phụ (KHÔNG `outline`)
- ✅ Selected badge: ✓ icon + `foreground` text + `accent` name (KHÔNG `neutrals400`)
- ❌ Don't invert images
- ❌ Don't use dark shadows on dark surfaces
- ❌ Don't use `variant="outline"` buttons (invisible on OLED)
- ❌ Don't use `text-destructive` token for icons (too dim)

---

## 11. Platform Specifics 📱

### 11.1 iOS Specifics

| Element | iOS Style |
|---------|-----------|
| Navigation | Large title collapsing |
| Back button | < chevron + title |
| Action sheet | Bottom sheet with blur |
| Picker | Wheel picker |
| Switch | UISwitch style |

### 11.2 Android Specifics

| Element | Android Style |
|---------|---------------|
| Navigation | Material toolbar |
| Back button | Arrow icon |
| Action sheet | Bottom sheet dialog |
| Picker | Dropdown/Dialog |
| Switch | Material switch |

### 11.3 iOS 26+ (LiquidGlass)

| Feature | iOS 26+ | iOS < 26 / Android |
|---------|---------|--------------------|
| Glass effect | `LiquidGlassView` native (blur + vibrancy) | `View` + glassmorphism fallback |
| Import | `@/utils/LiquidGlass` wrapper (BẮt buộc) | Same wrapper (fallback tự động) |
| Border glass | Tự động từ native | `rgba(255,255,255,0.06)` border |

> [!CAUTION]
> **KHOÂNG BAO GIờ** import trực tiếp `@callstack/liquid-glass` — sẽ **crash** trên iOS < 26 do TurboModule không tồn tại. Luôn dùng `@/utils/LiquidGlass`.

### 11.4 Modal & Alert Layering

| Pattern | Khi dùng | Ghi chú |
|---------|----------|--------|
| `Alert.alert()` native | Confirm/Delete **bên trong Modal/Sheet** | Luôn render trên mọi native layer |
| `showConfirm()` (DialogProvider) | Confirm ở **root screen** | Render ở app root — không dùng trong Modal |
| Bottom Sheet | Form phức tạp | UX tốt hơn Alert |
| Toast | Feedback nhanh | Auto-dismiss, không block |

> [!WARNING]
> **PageSheet Modal padding:** Dùng `paddingTop: 8` thay vì `insets.top`. `presentationStyle="pageSheet"` đã có built-in top offset — `insets.top` sẽ double-count (~59px thừa).

---

## 12. Accessibility ♿

### 12.1 Requirements

| Requirement | Standard |
|-------------|----------|
| Color contrast | WCAG AA (4.5:1 text, 3:1 UI) |
| Touch targets | Minimum 44pt/48dp |
| Labels | All interactive elements |
| Screen reader | Full VoiceOver/TalkBack support |

### 12.2 Implementation

```typescript
// Accessible button
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Start listening practice"
  accessibilityRole="button"
  accessibilityState={{ disabled: false }}
>
  <Text>Start</Text>
</TouchableOpacity>
```

---

## 13. NativeWind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        surface: {
          light: '#f5f5f5',
          dark: '#0a0a0a',
        },
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
        'sheet': '24px',
      },
    },
  },
};
```

---

## 14. Related Documents

- [Obsidian_Glass_Style_Guide.md](Obsidian_Glass_Style_Guide.md) — **🎯 Master source of truth** cho design tokens, colors, shadows, animations
- [Style_Convention.md](Style_Convention.md) — Usage patterns, screen templates, UX states, navigation rules
- [00_Mobile_Overview.md](../00_Mobile_Overview.md) — Project overview
- [Architecture.md](../technical/Architecture.md) — Technical implementation
