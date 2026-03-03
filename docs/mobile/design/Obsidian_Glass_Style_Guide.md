# 🎨 Obsidian Glass — Dark Premium Design Style Guide

> **Style Name:** Obsidian Glass  
> **Inspired by:** iOS 18 Settings, Spotify Premium, Arc Browser, Linear App  
> **Target:** React Native + NativeWind v4  
> **Created:** 2026-02-14

---

## 1. Triết lý thiết kế

### 1.1 Nguyên tắc cốt lõi

| Nguyên tắc | Mô tả | Ví dụ |
|:---:|---|---|
| **OLED-first** | Pure black (#000) làm nền, tiết kiệm pin, tạo chiều sâu tối đa | Background: `#000000`, không dùng dark gray làm nền chính |
| **Layered Depth** | Các lớp surface nổi lên từ nền đen bằng subtle elevation | `#0a0a0a` → `#171717` → `#1c1c1c` → modal overlay |
| **Muted Luxe** | Màu accent nhẹ nhàng, không bao giờ full saturation | Primary: `#4ade80` (green 400, không dùng `#00ff00`) |
| **Micro-motion** | Animation nhỏ, nhanh tạo cảm giác "alive" | Spring scale `0.92` khi nhấn, `300ms` transitions |
| **Content-first** | UI phải "biến mất", nội dung phải nổi bật | Border: 1px `#262626` — vừa đủ thấy, không lấn át |

### 1.2 Cảm giác mục tiêu

> Khi user mở app, họ phải cảm nhận: **"Đây là app premium"** — không phải prototype, không phải MVP.  
> Mọi pixel phải có mục đích. Mọi animation phải mượt. Mọi spacing phải đồng nhất.

---

## 2. Hệ thống màu sắc

### 2.1 Core Palette — Dark Mode (Primary)

```
Background Layers (tạo chiều sâu):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#000000  ████████  background       OLED pure black (base)
#0a0a0a  ████████  surface          Card nền, container
#171717  ████████  surface-raised   Card nổi, elevated element
#1c1c1c  ████████  neutrals900      Input field background
#1d1d1d  ████████  neutrals800      Viền nhẹ, separator

Neutral Scale (text & UI elements):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#111111  ████████  neutrals1000     Deepest surface
#262626  ████████  border           Card borders, dividers
#414240  ████████  neutrals700      Disabled state
#4d4d4d  ████████  neutrals600      Handle bars, subtle UI
#5e5e5e  ████████  neutrals500      Placeholder text
#6e6e6e  ████████  neutrals400      Secondary text, hints
#7a7a7a  ████████  neutrals300      Caption, subtitles
#858585  ████████  neutrals200      Medium emphasis text
#949494  ████████  neutrals100      Labels
#fafafa  ████████  foreground       Primary text (near-white)
```

### 2.2 Accent Colors

```
Brand & Status:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#4ade80  ████████  primary          Mint green — CTA, toggles ON, success
#007BFF  ████████  secondary        Blue — links, secondary actions
#f87171  ████████  error            Soft red — errors, destructive
#fbbf24  ████████  warning          Warm amber — warnings
#6366F1  ████████  skill-listening  Indigo — Listening module accent
#4ade80  ████████  skill-speaking   Green — Speaking module accent
#fbbf24  ████████  skill-reading    Gold — Reading module accent
```

### 2.3 Transparent Overlays — Glassmorphism

```css
/* Background overlay cho modal/bottom-sheet */
backdrop: rgba(0, 0, 0, 0.50)         /* Modal overlay */

/* Accent glow (dưới CTA button) */
glow: rgba(74, 222, 128, 0.35)        /* Primary glow, shadowOpacity=0.35 */

/* Accent tinting (selected state background) */
selected-bg: rgba(74, 222, 128, 0.10) /* 10% opacity primary */
selected-border: rgba(74, 222, 128, 0.30) /* 30% opacity, viền selected */

/* Chip/Tag accent (mỗi chip có accent riêng) */
chip-bg: {accentColor}15              /* 15 hex = ~8% opacity */
chip-border: {accentColor}            /* Solid color khi selected */
```

### 2.4 Core Palette — Light Mode

```
Background Layers:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#ffffff  ████████  background       Pure white base
#f5f5f5  ████████  surface          Light gray surface
#ffffff  ████████  surface-raised   White cards (+ shadow phân biệt)
#f2f2f2  ████████  neutrals900      Input background
#dddddd  ████████  neutrals800      Light borders

Neutrals:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#e5e5e5  ████████  border
#171717  ████████  foreground       Dark text

Accents (softer versions):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#22c55e  ████████  primary          Deeper green for contrast
#2D9CDB  ████████  secondary
#4F46E5  ████████  skill-listening  Deeper indigo
```

### 2.5 Nguyên tắc sử dụng màu

> [!IMPORTANT]
> **KHÔNG BAO GIỜ:**
> - Dùng full white `#ffffff` làm text trên dark mode (quá sáng) → dùng `#fafafa`
> - Dùng pure gray borders `#808080` (quá rõ) → dùng `#262626`
> - Dùng saturated neon colors (chói mắt) → dùng pastel/muted variants
> - Dùng purple/violet làm accent (rule riêng dự án) → dùng indigo `#6366F1` thay thế

---

## 3. Typography

### 3.1 Font Family

```
Primary:    SF Pro (iOS) / Roboto (Android)
Monospace:  SF Mono (iOS) / Roboto Mono (Android)

NativeWind mappings:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
font-sans-regular    →  SystemFont 400
font-sans-medium     →  SystemFont 500
font-sans-semibold   →  SystemFont 600
font-sans-bold       →  SystemFont 700
```

### 3.2 Type Scale

| Token | Size | Line Height | Weight | Dùng cho |
|-------|:----:|:-----------:|:------:|----------|
| `heading1` | 24sp | 32 | Bold (700) | Screen titles: "Luyện Nghe" |
| `heading2` | 20sp | 28 | SemiBold (600) | Section titles trong sheets |
| `label` | 16sp | 24 | SemiBold (600) | Section labels: "🎯 Trình độ" |
| `body` | 16sp | 24 | Regular (400) | Toggle text, voice names |
| `body-small` | 14sp | 20 | Regular (400) | Descriptions, secondary text |
| `caption` | 12sp | 16 | Regular (400) | Hints, info text, subtitles |
| `overline` | 10sp | 14 | Medium (500) | Tags, badges |

### 3.3 Quy tắc

```
Foreground text:          #fafafa (font-sans-regular / medium / semibold / bold)
Secondary text:           neutrals400 (#6e6e6e)
Placeholder:              neutrals500 (#5e5e5e)
Disabled text:            neutrals600 (#4d4d4d)
Accent text (selected):   primary (#4ade80) hoặc skill color
Info/hint text:           neutrals500 + italic (optional)
```

---

## 4. Spacing System

### 4.1 Base Unit: 4px

Tất cả spacing là bội số của 4px:

```
Token     Value    Dùng cho
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
xs        4px      Icon gaps nhỏ
sm        8px      Giữa icon & text, inline gaps
md        12px     Padding nhỏ trong cards
base      16px     Standard padding (px-4, py-4)
lg        20px     Section spacing
xl        24px     Screen horizontal padding (px-6)
2xl       32px     Khoảng cách section lớn
3xl       48px     Safe area offsets
```

### 4.2 Screen Layout

```
┌────────────────────────────────────────┐
│         Safe Area Top                  │  → padding-top: safe-offset-4 (16px + safeArea)
│                                        │
│  ← px-6 (24px) →                ← →   │  → Horizontal padding: 24px cả hai bên
│                                        │
│  ┌─── Section Card ──────────────┐     │
│  │  p-4 (16px) padding nội       │     │  → Card internal padding: 16px
│  │                                │     │
│  │  gap-3 (12px) giữa elements   │     │  → Gap giữa các phần tử: 12px
│  └────────────────────────────────┘     │
│                                        │
│  mb-4 (16px) giữa sections            │  → Section bottom margin: 16px
│                                        │
│  ┌─── Section Card ──────────────┐     │
│  │  ...                           │     │
│  └────────────────────────────────┘     │
│                                        │
│         Safe Area Bottom               │  → padding-bottom: safe-offset-6
└────────────────────────────────────────┘
```

### 4.3 Bottom Sheet Layout

```
┌──────────────── Bottom Sheet ────────────────┐
│  pt-4 (16px) top padding                     │
│  ┌── Handle ──┐                              │
│  │ w-10 h-1   │  centered, neutrals600       │  → 40×4px, rounded-full
│  └────────────┘                              │
│  mb-4 (16px) sau handle                      │
│  ┌── Header ────────────────── ✕ ──┐         │
│  │ text-lg font-sans-bold          │  X icon │  → 18sp bold + X button
│  └─────────────────────────────────┘         │
│  mb-5 (20px) sau header                      │
│  px-6 (24px) horizontal padding              │
│                                              │
│  ┌── Section ────────────────────┐           │
│  │ mb-6 (24px) giữa sections    │           │  → Section bottom: 24px
│  │ mb-3 (12px) label → content  │           │  → Label to content: 12px
│  └───────────────────────────────┘           │
│                                              │
│  pb-safe-offset-6                            │  → Bottom safe area + 24px
└──────────────────────────────────────────────┘
```

---

## 5. Border Radius System

```
Token          Value    Dùng cho
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
rounded-full   9999px   Handle bar, badges, avatars, pills
rounded-3xl    24px     Bottom sheet top corners
rounded-2xl    16px     Cards, buttons lớn, input fields, toggles
rounded-xl     12px     Chips nhỏ hơn, text inputs
rounded-lg     8px      Tags, small badges
```

### Nguyên tắc

> [!TIP]
> - Containers lớn → `rounded-2xl` (16px)
> - Bottom sheets → `rounded-t-3xl` (24px top only)
> - Pills/chips nhỏ → `rounded-xl` (12px)
> - Circular elements → `rounded-full`
> - **KHÔNG BAO GIỜ** dưới `rounded-lg` (8px) cho interactive elements

---

## 6. Shadow & Elevation

### 6.1 Shadow Levels (iOS)

```typescript
// Level 1 — Subtle (section cards)
{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
}

// Level 2 — Medium (buttons, floating actions)
{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 8,
  elevation: 4,
}

// Level 3 — Strong (bottom sheets, modals)
{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.15,
  shadowRadius: 16,
  elevation: 20,
}

// Level 4 — Glow (CTA buttons — colored shadow)
{
  shadowColor: '#4ade80', // hoặc accent color
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.35,
  shadowRadius: 12,
  elevation: 8,
}

// Level 5 — Accent section cards (skill-specific glow)
{
  shadowColor: '#6366F1', // skill accent
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 2,
}
```

### 6.2 Nguyên tắc

- Dark mode: shadow **không thấy rõ** trên nền đen → dựa vào **surface color layers** tạo depth
- Colored shadows (glow) chỉ dùng cho **CTA buttons** và **accent section cards**
- Light mode: shadow **quan trọng hơn** vì surfaces đều trắng → dùng gray shadows

---

## 7. Components — Chi tiết

### 7.1 Section Card

```
┌─────────────────────────────────────┐
│  ▎ (optional accent bar, left 3px)  │
│                                     │
│  ● Label text           (accentColor)
│                                     │
│  [Content inside]                   │
│                                     │
└─────────────────────────────────────┘

Background:  surface-raised (#171717 dark / #ffffff light)
Border:      1px border (#262626 dark / #e5e5e5 light)
Radius:      rounded-2xl (16px)
Padding:     p-4 (16px)
Shadow:      Level 1 (subtle)

Optional accent bar:
  Position:  absolute left, top-3 bottom-3
  Width:     3px
  Color:     {skillAccent} at 60% opacity
  Radius:    rounded-r-full
```

### 7.2 Chip / Pill Selector

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   🌱 emoji   │   │   🌿 emoji   │   │   🌳 emoji   │
│   Label      │   │   Label      │   │   Label      │
└──────────────┘   └──────────────┘   └──────────────┘
   (default)         (SELECTED)          (default)

Default state:
  Background:    transparent
  Border:        1px neutrals800 (#1d1d1d)
  Text color:    foreground (#fafafa)
  Text weight:   regular (400)

Selected state:
  Background:    {accentColor}15 (~8% opacity tint)
  Border:        1px {accentColor} (solid)
  Text color:    {accentColor}
  Text weight:   bold (700)

Animation:
  onPressIn:     scale → 0.92 (spring: damping=15, stiffness=300)
  onPressOut:    scale → 1.0 (spring: damping=12, stiffness=200)

Layout:
  Padding:       py-3 (12px vertical)
  Radius:        rounded-2xl (16px)
  Flex:          flex-1 (equal width distribution)
  Gap:           gap-3 (12px) giữa các chips
  Emoji size:    text-lg (18sp) + mb-1 (4px)
  Label size:    text-sm (14sp)
```

### 7.3 Toggle Row

```
┌──────────────────────────────────────────────────┐
│  🎲 Title text                         [  ●══] │
│     Subtitle / description                       │
└──────────────────────────────────────────────────┘

Background:     neutrals900 (#1c1c1c)
Border:         none (hoặc border-transparent)
Radius:         rounded-2xl (16px)
Padding:        px-4 py-3 (16px horizontal, 12px vertical)

Title:          foreground (#fafafa), regular weight
                Có emoji prefix
Subtitle:       neutrals400 (#6e6e6e), text-xs (12sp)
                mt-0.5 (2px) dưới title

Toggle (Switch):
  ON track:     primary (#4ade80)
  OFF track:    neutrals600 (#4d4d4d)
  Thumb:        white
  Size:         iOS system size (51×31pt)
```

### 7.4 Voice Item Card

```
UNSELECTED:
┌──────────────────────────────────────────────────┐
│  👩 emoji   Jenny                                │
│             Nữ US, đa năng                       │
└──────────────────────────────────────────────────┘

SELECTED:
┌──────────────────────────────────────────────────┐
│  👩 emoji   Jenny (primary color)      ✓ check  │
│             Nữ US, đa năng                       │
└──────────────────────────────────────────────────┘

UNSELECTED:
  Background:   neutrals900 (#1c1c1c)
  Border:       1px transparent
  Radius:       rounded-2xl (16px)

SELECTED:
  Background:   primary/10 (10% green tint → rgba(74,222,128,0.1))
  Border:       1px primary/30 (30% green border)
  Name color:   primary (#4ade80)
  Check icon:   ✓ primary, w-5 h-5 (20px)

Layout:
  Padding:      px-4 py-3
  Emoji:        text-lg (18sp), mr-3 (12px right margin)
  Name:         foreground, font-sans-semibold
  Description:  neutrals400, text-xs (12sp)
  Gap:          gap-2 (8px) giữa các voice items
```

### 7.5 Speaker Voice Picker (Per-speaker)

```
┌──────────────────────────────────────────────────┐
│  👤 Speaker A                    Jenny (Nữ)  ▼  │
├──────────────────────────────────────────────────┤
│  EXPANDED: (dropdown nội dung)                   │
│  ┌────────────────────────────────────────┐      │
│  │ 💃 Aria    ● (selected radio)         │      │
│  │ 👩 Jenny                               │      │
│  │ 👧 Sara                                │      │
│  │ 👩‍💼 Jane                               │      │
│  │ ...                                    │      │
│  └────────────────────────────────────────┘      │
└──────────────────────────────────────────────────┘

Header row:
  Background:   neutrals900 (#1c1c1c)
  Border:       1px neutrals800 khi collapsed, primary/30 khi expanded
  Radius:       rounded-2xl
  Speaker icon: 👤 emoji, text-base
  Speaker name: foreground, font-sans-medium
  Selected voice: neutrals300, font text nhỏ hơn
  Chevron:      ▼ icon, neutrals400

Expanded list:
  Animation:    height 0 → auto, spring 300ms
  Items:        Voice items giống §7.4 nhưng compact hơn (py-2)
  Max height:   200px (scrollable nếu vượt)
```

### 7.6 CTA Button (Sticky Footer)

```
┌──────────────────────────────────────────────────┐
│     🎧 Bắt đầu nghe                             │
└──────────────────────────────────────────────────┘

Normal (enabled + valid topic):
  Background:    primary (#4ade80)
  Text:          primaryForeground (#000000), 16sp, bold
  Radius:        rounded-2xl (16px)
  Height:        56px
  Shadow:        Level 4 — Glow (green shadow, opacity 0.35)

Disabled:
  Background:    neutrals700 (#414240)
  Text:          neutrals400
  Shadow:        none
  Opacity:       1.0 (KHÔNG dùng opacity trên toàn button, chỉ đổi màu)

Loading:
  Show spinner   thay thế text
  Background:    primary (giữ nguyên)

Footer container:
  Border-top:    1px border (#262626)
  Background:    background/95 (95% opacity, subtle blur effect)
  Padding:       px-6 pt-3, pb = max(safeBottom, 16px)
```

### 7.7 Info/Hint Text

```
ℹ️ Hệ thống tự gán giọng xen kẽ nam/nữ cho mỗi speaker

Color:       neutrals500 (#5e5e5e)
Size:        text-xs (12sp)
Margin:      mt-1 (4px top), px-1 (4px horizontal)
Emoji:       ℹ️ prefix
```

---

## 8. Glassmorphism Effect

### 8.1 Khi nào dùng

| Dùng | Không dùng |
|------|-----------|
| Modal/sheet backdrops | Regular cards |
| Sticky footer (subtle) | Inline toggles |
| Overlay menus | List items |

### 8.2 Implementation

```typescript
// Bottom sheet backdrop
<Pressable
  style={{ backgroundColor: 'rgba(0, 0, 0, 0.50)' }}
  className="flex-1"
  onPress={onClose}
/>

// Bottom sheet container
<View
  className="bg-background rounded-t-3xl"
  style={{
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  }}
>

// Sticky footer (frosted glass)
<View
  className="bg-background/95 border-t border-border"
  style={{
    // iOS: thêm BlurView nếu muốn real blur
    // Android: fallback sang solid background/95
  }}
>
```

---

## 9. Animation Patterns

### 9.1 Micro-interactions

```typescript
// Chip press animation (spring)
const handlePressIn = () => {
  scale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
};
const handlePressOut = () => {
  scale.value = withSpring(1, { damping: 12, stiffness: 200 });
};

// Collapsible section expand
const expandAnimation = withTiming(isExpanded ? 1 : 0, {
  duration: 250,
  easing: Easing.bezier(0.4, 0, 0.2, 1),
});

// Chevron rotation
const rotateStyle = useAnimatedStyle(() => ({
  transform: [{ rotate: `${interpolate(expandAnim.value, [0, 1], [0, 180])}deg` }],
}));

// Switch toggle (iOS native, không cần custom)
// React Native Switch component tự animate
```

### 9.2 Transition Timing

```
Action              Duration    Easing                      Khi nào
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Button press        spring      damping=15, stiff=300       Nhấn giữ chip/button
Button release      spring      damping=12, stiff=200       Thả chip/button
Expand/Collapse     250ms       bezier(0.4, 0, 0.2, 1)     Mở/đóng section
Modal appear        300ms       slide (native)              Sheet/Modal mở
Modal dismiss       200ms       slide (native)              Sheet/Modal đóng
Fade in             200ms       ease-out                    Content xuất hiện
Fade out            150ms       ease-in                     Content biến mất
Haptic              instant     light/medium/success/error  Feedback cảm ứng
```

### 9.3 Haptic Feedback Pattern

```
Action                  Haptic Type     Khi nào
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tap chip/option         light           Chọn level, voice, toggle
Start generate          medium          Nhấn CTA "Bắt đầu"
Generate success        success         Nhận kết quả thành công
Generate error          error           API lỗi
Toggle ON/OFF           light           Bật/tắt switch
Long press              medium          Long press bookmark
```

---

## 10. Icon System

### 10.1 Library

```
Primary:  lucide-react-native (Lucide Icons)
Size:     w-5 h-5 (20px) standard, w-6 h-6 (24px) header actions
Color:    neutrals400 for UI icons, primary for accent states
Stroke:   2px (default Lucide)
```

### 10.2 Common Icons

```
X           → Close button (header)
ChevronRight → Navigation / "xem thêm"
ChevronDown → Expand indicator
Check       → Selected state
Plus        → Add action
Search      → Search input
Mic         → Audio recording
Volume2     → Audio playback
Bookmark    → Save/bookmark
Settings    → Advanced options
```

### 10.3 Emoji Usage

```
Dùng emoji cho:
  ✅ Section labels    → "🎯 Trình độ", "🔊 Giọng đọc"
  ✅ Level chips       → 🌱 🌿 🌳
  ✅ Voice identifiers → 👩 👨 💃 🕺
  ✅ Feature badges    → 🎧 🗣️ 📖
  ✅ Toggle prefixes   → 🎲 🇻🇳 🎭
  ✅ Info hints        → ℹ️

KHÔNG dùng emoji cho:
  ❌ Navigation icons  → Dùng Lucide icons
  ❌ Action buttons    → Dùng Lucide icons
  ❌ Decorative chỉ    → Phải có ý nghĩa ngữ cảnh
```

---

## 11. Accessibility

### 11.1 Contrast Ratios

```
Element                     Foreground    Background    Ratio    Pass?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Primary text                #fafafa       #000000       19.8:1   ✅ AAA
Secondary text              #6e6e6e       #000000       4.6:1    ✅ AA
Primary on black            #4ade80       #000000       10.5:1   ✅ AAA
Caption text                #5e5e5e       #1c1c1c       2.5:1    ⚠️ Decorative only
Placeholder                 #5e5e5e       #1c1c1c       2.5:1    ⚠️ AA Large
Selected accent on tint     #4ade80       #171717       8.7:1    ✅ AAA
```

### 11.2 Touch Targets

```
Minimum size:     44×44pt (iOS) / 48×48dp (Android)
Chips:            py-3 (12px) + text → ≥44pt ✅
Toggle rows:      py-3 (12px) + text → ≥44pt ✅
Voice items:      py-3 (12px) + text → ≥44pt ✅
Close button:     w-6 h-6 + hit area 44px ✅
```

### 11.3 Accessibility Labels

```typescript
// Quy tắc:
// 1. Mô tả rõ trạng thái hiện tại
// 2. Dùng tiếng Việt (ngôn ngữ app)
// 3. accessibilityRole phù hợp

<Pressable
  accessibilityLabel={`Trình độ ${level.label}${isSelected ? ', đang chọn' : ''}`}
  accessibilityRole="button"
/>

<TouchableOpacity
  accessibilityLabel={`Giọng ngẫu nhiên, ${randomVoice ? 'bật' : 'tắt'}`}
  accessibilityRole="switch"
/>

<TouchableOpacity
  accessibilityLabel={`Giọng ${voice.label}${isSelected ? ', đang chọn' : ''}`}
  accessibilityRole="button"
/>
```

---

## 12. Responsive & Adaptive

### 12.1 Screen Size Handling

```
Small (<375px width — iPhone SE):
  px-4 (16px) thay vì px-6
  Chips có thể wrap 2 hàng nếu text dài
  Voice list: không giới hạn, scroll tự nhiên

Medium (375-428px — iPhone 14/15):
  px-6 (24px) standard
  3 chips ngang vừa đủ

Large (>428px — iPhone Pro Max, iPad):
  px-6 (24px) giữ nguyên (không stretch quá)
  Có thể thêm max-width: 500px cho content
```

### 12.2 Dark/Light Mode Switching

```
Nguyên tắc:
  1. Tất cả colors phải dùng CSS variables (NativeWind)
  2. KHÔNG hardcode hex trong JSX ngoại trừ:
     - Accent colors cụ thể cho from logic (level colors, skill colors)
     - Transparent overlay values
  3. Hardcoded colors phải check isDark:
     const isDark = colors.background === '#000000';
     const accent = isDark ? item.accentDark : item.accentLight;
```

---

## 13. Anti-Patterns — Những điều TUYỆT ĐỐI KHÔNG LÀM

> [!CAUTION]

| ❌ Anti-pattern | ✅ Thay thế |
|----------------|-------------|
| Flat gray cards không có depth | Dùng surface layers + 1px border |
| White text trên light gray | Đảm bảo 4.5:1 contrast |
| Buttons với opacity khi disabled | Đổi backgroundColor & textColor |
| Multiple font families | 1 system font duy nhất |
| Hard drop shadows trong dark mode | Dùng surface color tạo depth |
| Inconsistent border radius | Dùng design tokens (rounded-2xl, rounded-xl) |
| Neon/saturated accent colors | Pastel/muted variants (e.g. green-400 không phải green-500) |
| Padding < 12px cho interactive | Minimum py-3 (12px) cho touch targets |
| Random animation durations | Dùng timing tokens từ §9.2 |
| Purple/violet colors | Dùng indigo (#6366F1) thay thế |

---

## 14. Code Template — React Native + NativeWind

### 14.1 Section Card

```tsx
function SectionCard({ children, accentColor, shadowColor }) {
  return (
    <View
      className="bg-surface-raised rounded-2xl p-4 border border-border overflow-hidden"
      style={{
        shadowColor: shadowColor || '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: shadowColor ? 0.15 : 0.06,
        shadowRadius: shadowColor ? 8 : 4,
        elevation: 2,
      }}>
      {accentColor && (
        <View
          className="absolute left-0 top-3 bottom-3 rounded-r-full"
          style={{ width: 3, backgroundColor: accentColor, opacity: 0.6 }}
        />
      )}
      {children}
    </View>
  );
}
```

### 14.2 Animated Chip

```tsx
function Chip({ emoji, label, accentColor, selected, onPress }) {
  const scale = useSharedValue(1);
  const colors = useColors();
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle} className="flex-1">
      <Pressable
        className="py-3 rounded-2xl items-center border"
        style={{
          backgroundColor: selected ? `${accentColor}15` : undefined,
          borderColor: selected ? accentColor : colors.neutrals800,
        }}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12, stiffness: 200 });
        }}>
        <AppText className="text-lg mb-1">{emoji}</AppText>
        <AppText
          className={`text-sm ${selected ? 'font-sans-bold' : 'text-foreground'}`}
          style={selected ? { color: accentColor } : undefined}>
          {label}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}
```

### 14.3 Toggle Row

```tsx
function ToggleRow({ emoji, title, subtitle, value, onValueChange, disabled }) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between bg-neutrals900 rounded-2xl px-4 py-3"
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityLabel={`${title}, ${value ? 'bật' : 'tắt'}`}
      accessibilityRole="switch">
      <View className="flex-1 mr-3">
        <AppText className="text-foreground">{emoji} {title}</AppText>
        {subtitle && (
          <AppText className="text-neutrals400 text-xs mt-0.5">{subtitle}</AppText>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      />
    </TouchableOpacity>
  );
}
```

---

## 15. iOS 26+ LiquidGlass vs Obsidian Glass Fallback

### 15.1 Chiến lược phân nhánh

```
┌─────────────────────────────────────────────────────────────┐
│  ios >= 26 (WWDC 2025)         │  ios < 26 / Android       │
├────────────────────────────────┼───────────────────────────┤
│  @callstack/liquid-glass       │  Obsidian Glass fallback   │
│  LiquidGlassView native       │  View + rgba borders       │
│  effect: 'clear' | 'regular'  │  backgroundColor + border  │
│  tintColor, colorScheme        │  Manual color tokens       │
│  Blur + vibrancy tự động       │  rgba(255,255,255,0.06)   │
└────────────────────────────────┴───────────────────────────┘
```

### 15.2 Import pattern (bắt buộc)

```typescript
// ❌ KHÔNG BAO GIỜ import trực tiếp — crash trên iOS < 26
import { LiquidGlassView } from '@callstack/liquid-glass';

// ✅ LUÔN dùng wrapper an toàn
import { LiquidGlassView, isLiquidGlassSupported } from '@/utils/LiquidGlass';

// ✅ Trong component:
{isLiquidGlassSupported ? (
  <LiquidGlassView effect="clear" tintColor={accent} />
) : (
  <View style={{
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  }} />
)}
```

### 15.3 LiquidGlass wrapper (`utils/LiquidGlass.ts`)

| Export | Mô tả |
|--------|--------|
| `isLiquidGlassSupported` | `boolean` — `true` trên iOS 26+, `false` mọi nơi khác |
| `LiquidGlassView` | Component — native glass iOS 26+, fallback `View` trên iOS <26/Android |

> [!CAUTION]
> `@callstack/liquid-glass` sử dụng TurboModules. Trên iOS < 26, `TurboModuleRegistry.getEnforcing()` sẽ **crash app** nếu import trực tiếp. Luôn dùng `@/utils/LiquidGlass`.

---

## 16. Dark Mode — Bẫy thường gặp (Lessons Learned)

> [!IMPORTANT]
> Các quy tắc dưới đây được rút ra từ các bug thực tế đã fix. **Bắt buộc** tuân thủ cho tất cả features.

### 16.1 Màu sắc bị "nuốt" trên nền đen

| ❌ Sai | ✅ Đúng | Lý do |
|--------|---------|-------|
| `text-destructive` cho icon xoá | `style={{color: '#EF4444'}}` | `destructive` token quá tối trên OLED black |
| `variant="outline"` cho button phụ | `variant="secondary"` | Outline border gần như vô hình trên dark bg |
| `neutrals400` cho "đã chọn" text | `colors.foreground` + accent name | Người dùng không nhận ra đã chọn gì |
| `colors.neutrals700` cho viền input | `colors.neutrals800` | Consistency với theme tokens |

### 16.2 Minimum contrast cho Dark Mode

```
Element                  Minimum    Dark Mode Implementation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Primary text             #fafafa    Luôn dùng colors.foreground
Selected indicator       #FFFFFF    Text trắng + accent color cho tên
Icon hành động (xoá)     #EF4444    Explicit hex, KHÔNG dùng token
Badge/tag active         #fff bg    Icon ✓ + viền accent + text trắng
Placeholder text         #5e5e5e    neutrals500 (AA Large pass)
Disabled text            #4d4d4d    neutrals600 (decorative only)
```

### 16.3 Button variants và Dark Mode

```
Trường hợp                        Variant nên dùng
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CTA chính (1 per screen)          primary
Hành động phụ cạnh primary        secondary (KHÔNG outline)
Huỷ / Cancel                      secondary
Link-style, xem thêm              ghost
Xoá / Destructive                 primary + error color
Nút trong bottom sheet form       secondary (Huỷ) + primary (Submit)
```

> [!WARNING]
> `variant="outline"` **gần như vô hình** trên dark mode OLED. Chỉ dùng khi nền sáng hơn `#262626` (ví dụ light mode).

---

## 17. Glassmorphism — Nguyên tắc áp dụng

### 17.1 Subtle glass borders (Obsidian Glass)

```css
/* Border glass nhẹ — tạo hiệu ứng light reflection trên dark bg */
borderWidth: 1
borderColor: rgba(255, 255, 255, 0.06)    /* glass edge */

/* CÓ THỂ dùng cho: */
✅ Search bar
✅ Category tabs (inactive state)
✅ Accordion section headers
✅ Card containers

/* KHÔNG dùng cho: */
❌ Text elements
❌ Icon buttons nhỏ
❌ Dividers (dùng colors.border thay)
```

### 17.2 Selected state glow

```typescript
// Selected item cần 3 thuộc tính:
{
  backgroundColor: `${accentColor}15`,     // ~8% tint
  borderWidth: 1,
  borderColor: accentColor,                 // Solid accent
  // Tuỳ chọn: shadow glow
  shadowColor: accentColor,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
}
```

### 17.3 Selected indicator badge pattern

```
❌ Cũ (khó nhìn):
  "Đã chọn" text nhỏ, neutrals400 → gần như vô hình

✅ Mới (rõ ràng):
  ┌─ ✓ icon + foreground text + accent topic name ─┐
  │  ✓ Tên topic đang chọn                     X   │
  └──────────────────────────────────────────────────┘
  - Icon ✓ màu accent (border viền + icon)
  - Text tên topic: font-sans-bold + accent color
  - Nút X để bỏ chọn nhanh
  - Background: accent/10 + border accent/25
```

### 17.4 Typography hierarchy trong Glass panels

```
Cấp 1 — Section header:    text-xs, uppercase, tracking-wider, neutrals400
Cấp 2 — Item name:         text-[15px], font-sans-bold, foreground
Cấp 3 — Item description:  text-xs, neutrals400, numberOfLines={1}
Cấp 4 — Badge/tag:         text-[10px], uppercase, accent color
```

---

## 18. Modal & Alert — Layering Rules

### 18.1 PageSheet Modal padding

```
❌ Sai:  paddingTop: insets.top     → thừa ~59px trên notch iPhone
✅ Đúng: paddingTop: 8             → pageSheet đã có offset built-in

Lý do: RN Modal presentationStyle="pageSheet" tạo sheet cách top ~20px.
Thêm insets.top sẽ double-count safe area → header "Chọn chủ đề" cách top quá xa.
```

### 18.2 Confirm dialog trong Modal

```
❌ Sai:  showConfirm() / custom Dialog
  → DialogProvider render ở app root
  → RN Modal tạo native layer mới
  → Dialog hiển thị DƯỚI modal → user không thấy

✅ Đúng: Alert.alert() (native iOS/Android)
  → Native alert LUÔN render trên mọi Modal layer
  → Style theo system theme (không bị dark custom dialog)
  → Có style: 'destructive' cho nút xoá (iOS đỏ tự động)
```

```typescript
// Pattern chuẩn cho xoá item bên trong Modal:
Alert.alert(
  'Xoá kịch bản?',
  `Bạn có chắc muốn xoá "${name}"?`,
  [
    { text: 'Huỷ', style: 'cancel' },
    {
      text: 'Xoá',
      style: 'destructive',
      onPress: async () => { /* delete logic */ },
    },
  ],
);
```

### 18.3 Khi nào dùng gì?

| Ngữ cảnh | Component | Lý do |
|-----------|-----------|-------|
| Confirm trong **Modal/Sheet** | `Alert.alert()` | Native, luôn trên top layer |
| Confirm ở **root screen** | `showConfirm()` hoặc `Alert.alert()` | Cả hai đều OK |
| Form phức tạp | `Bottom Sheet` | UX tốt hơn Alert |
| Thông báo nhanh | `Toast` (showSuccess/showError) | Auto-dismiss, không block |

---

## 19. API Data Shape — Quy tắc Frontend ↔ Backend

> [!WARNING]
> API trả wrapper object, KHÔNG phải raw data. Luôn extract đúng field.

```typescript
// ❌ Sai — backend trả { success, scenarios, count }
const response = await apiClient.get('/custom-scenarios');
return response.data as CustomScenario[];  // response.data = wrapper!

// ✅ Đúng — extract .scenarios
const response = await apiClient.get('/custom-scenarios');
const data = response.data as any;
return (data?.scenarios ?? data ?? []) as CustomScenario[];

// ✅ Cho create — extract .scenario (singular)
const result = response.data as any;
return (result?.scenario ?? result) as CustomScenario;
```

---

## 20. Checklist cho Designer / Developer (Updated)

Khi áp dụng style này vào bất kỳ màn hình nào, check:

### Nền tảng
- [ ] Background = `#000000` (OLED black), không phải dark gray
- [ ] Cards dùng `surface-raised` (#171717), có 1px border `#262626`
- [ ] Import `LiquidGlassView` từ `@/utils/LiquidGlass` (KHÔNG trực tiếp)
- [ ] Kiểm tra `isLiquidGlassSupported` trước khi dùng glass effect

### Typography & Colors
- [ ] Tất cả text dùng system font (SF Pro / Roboto)
- [ ] Primary text ≥ 4.5:1 contrast ratio
- [ ] Selected text dùng `foreground` + `accent` cho tên (KHÔNG neutrals400)
- [ ] Icon destructive dùng `#EF4444` explicit (KHÔNG `text-destructive` token)
- [ ] Accent colors dùng muted variants (400 shade, không 500+)
- [ ] No purple/violet — dùng indigo thay thế

### Components
- [ ] Button phụ: `secondary` (KHÔNG `outline` trên dark mode)
- [ ] Interactive elements ≥ 44pt touch target
- [ ] Spring animation cho press states (scale 0.92)
- [ ] Haptic feedback cho mọi interaction
- [ ] Glass borders: `rgba(255,255,255,0.06)` cho search bar, tabs, accordion
- [ ] NativeWind margin: nếu View/Icon có cả `className="mr-*"` VÀ inline `style={{}}` → chuyển margin vào inline style

### Layout
- [ ] Consistent spacing (bội số 4px)
- [ ] PageSheet Modal: `paddingTop: 8` (KHÔNG `insets.top`)
- [ ] Bottom sheets: `rounded-t-3xl` + handle bar
- [ ] Selected states: 10% accent tint + accent border

### UX
- [ ] Confirm dialog trong Modal → dùng `Alert.alert()` (native)
- [ ] Emoji prefix cho section labels
- [ ] Disabled states: đổi màu, KHÔNG dùng opacity
- [ ] Empty state cho mọi list/grid
- [ ] Auto-select sau khi tạo mới (topic, scenario, etc.)
- [ ] Selected badge hiển thị rõ: ✓ icon + accent name + nút X

