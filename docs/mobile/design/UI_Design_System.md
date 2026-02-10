# 🎨 UI Design System - Mobile

> **Module:** Design System  
> **Scope:** React Native + NativeWind

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

Accent Colors (6 options):
┌──────────────────────────────────────────────────────────────┐
│  🟢 Green   │  🔵 Blue   │  🟣 Purple │  🟠 Orange │  🔴 Red  │
│  #22c55e   │  #3b82f6  │  #a855f7  │  #f97316  │  #ef4444 │
│             │           │           │           │          │
│  🩷 Pink    │           │           │           │          │
│  #ec4899   │           │           │           │          │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Semantic Colors

| Color | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| Background | #ffffff | #0a0a0a | App background |
| Surface | #f5f5f5 | #171717 | Cards, sheets |
| Border | #e5e5e5 | #262626 | Dividers |
| Text Primary | #171717 | #fafafa | Main text |
| Text Secondary | #737373 | #a3a3a3 | Secondary text |
| Success | #22c55e | #4ade80 | Correct, success |
| Warning | #f59e0b | #fbbf24 | Warnings |
| Error | #ef4444 | #f87171 | Errors |

### 2.3 OLED Optimization (Dark Mode)

```
Background:     #000000 (pure black - pixels off)
Surface:        #0a0a0a 
Surface Raised: #171717
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
| xs | 4px | Tight spacing |
| sm | 8px | Between related items |
| md | 16px | Standard padding |
| lg | 24px | Section spacing |
| xl | 32px | Large spacing |
| 2xl | 48px | Section breaks |

### 4.2 Screen Padding

```
┌─────────────────────────────────┐
│←─ 16px ─→              ←─ 16px ─→│
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │       Content           │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘

Standard horizontal padding: 16px
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
Primary Button:
┌─────────────────────────────────┐
│         Start Learning          │
└─────────────────────────────────┘
Height: 48px (touch target)
Border Radius: 12px
Background: primary-500
Text: white, 16sp, semibold

Secondary Button:
┌─────────────────────────────────┐
│           Cancel                │
└─────────────────────────────────┘
Height: 48px
Border: 1px primary-500
Background: transparent
Text: primary-500

Ghost Button:
         Learn More →
Height: 44px
Background: transparent
Text: primary-500

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
- See [Style_Convention.md §1.2](Style_Convention.md#12-button-variants-reference) for full decision matrix

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
[  Topic 1  ] [  Topic 2  ] [  Topic 3  ]

Selected:
Background: primary-500
Text: white

Unselected:
Background: surface
Border: 1px border
Text: text-primary

Height: 36px
Padding: 8px 16px
Border Radius: 18px
```

**Usage Guidance:**
- Use for: Single-select from 2-5 options (e.g., Duration: 5 | 10 | 15 min, Level: Beginner | Intermediate | Advanced)
- For binary on/off, use Toggle Switch instead
- For 2-3 segment options that are part of a control, use Segmented Control (e.g., Light | Dark | Auto)
- Horizontal scroll when options exceed screen width

---

## 7. Icons 🖼️

### 7.1 Icon Library

| Platform | Library |
|----------|---------|
| iOS | SF Symbols (via react-native-sfsymbols) |
| Android | Material Symbols |
| Cross-platform | Lucide Icons (fallback) |

### 7.2 Icon Sizes

| Size | Value | Usage |
|------|-------|-------|
| xs | 16px | Inline, badges |
| sm | 20px | Buttons, inputs |
| md | 24px | Tab bar, navigation |
| lg | 32px | Feature icons |
| xl | 48px | Empty states |

### 7.3 Feature Icons

| Feature | Icon | Color |
|---------|------|-------|
| Listening | 🎧 headphones | Blue |
| Speaking | 🗣️ waveform | Orange |
| Reading | 📖 book-open | Green |

---

## 8. Animation 🎬

### 8.1 Timing

| Type | Duration | Easing |
|------|----------|--------|
| Micro | 150ms | ease-out |
| Small | 250ms | ease-in-out |
| Medium | 350ms | ease-in-out |
| Large | 500ms | spring |

### 8.2 Common Animations

```typescript
// Button press
scale: 0.97
duration: 100ms

// Card hover/press
scale: 0.98
duration: 150ms

// Page transition
translateX: 0 → screen-width
duration: 300ms
easing: ease-in-out

// Modal appear
translateY: screen-height → 0
opacity: 0 → 1
duration: 350ms

// Swipe card
rotate: 0 → ±15deg
translateX: 0 → ±screen-width
duration: 300ms
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

| Level | shadowOffset | shadowRadius | shadowOpacity |
|-------|--------------|--------------|---------------|
| sm | 0, 1 | 2 | 0.05 |
| md | 0, 2 | 4 | 0.08 |
| lg | 0, 4 | 8 | 0.12 |
| xl | 0, 8 | 16 | 0.16 |

### 9.2 Elevation (Android)

| Level | elevation |
|-------|-----------|
| sm | 2 |
| md | 4 |
| lg | 8 |
| xl | 16 |

---

## 10. Dark Mode 🌙

### 10.1 Color Mapping

| Element | Light | Dark |
|---------|-------|------|
| Background | #ffffff | #000000 |
| Surface | #f5f5f5 | #0a0a0a |
| Surface Raised | #ffffff | #171717 |
| Text Primary | #171717 | #fafafa |
| Text Secondary | #737373 | #a3a3a3 |
| Border | #e5e5e5 | #262626 |
| Primary | #22c55e | #4ade80 |

### 10.2 Dark Mode Guidelines

- ✅ Use pure black (#000000) for OLED
- ✅ Reduce contrast slightly (not pure white text)
- ✅ Use colored shadows cautiously
- ❌ Don't invert images
- ❌ Don't use dark shadows on dark surfaces

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

- [Style_Convention.md](Style_Convention.md) - **Usage patterns, screen templates, UX states, navigation rules**
- [00_Mobile_Overview.md](../00_Mobile_Overview.md) - Project overview
- [Architecture.md](../technical/Architecture.md) - Technical implementation
- [Roadmap.md](../technical/Roadmap.md) - Development timeline
