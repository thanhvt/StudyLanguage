# 🐛 NativeWind: Tất cả className styles biến mất

## Triệu chứng
- Toàn bộ `className` styling không apply (bg, text, padding, margin, rounded...)
- Chỉ thấy emoji/icon, text không hiển thị (dark text trên dark background)
- Inline `style={{}}` vẫn hoạt động bình thường
- SplashScreen (dùng StyleSheet.create) render đúng, nhưng HomeScreen (dùng className) bị trống
- Metro bundle thành công, không báo lỗi

## Nguyên nhân gốc

### 1. Ghost dependency `react-native-css-interop` (pnpm monorepo)

**Đây là nguyên nhân phổ biến nhất.**

pnpm có thể giữ lại bản cũ `react-native-css-interop` trong `apps/mobile/node_modules/`, shadowing bản mới từ NativeWind.

```
apps/mobile/node_modules/react-native-css-interop → v0.1.22 ❌ (React 19 FAIL)
root/node_modules/.pnpm/.../react-native-css-interop → v0.2.1 ✅ (React 19 OK)
```

v0.1.22 + React 19 = JSX runtime silently drops ALL className → zero styles.

#### Cách kiểm tra nhanh (30 giây)
```bash
# Từ apps/mobile/
node -e "const p = require(require.resolve('react-native-css-interop/package.json', {paths: [process.cwd()]})); console.log('Version:', p.version, '| Path:', require.resolve('react-native-css-interop', {paths: [process.cwd()]}))"
```

Nếu version là `0.1.x` hoặc path trỏ về `apps/mobile/node_modules/` → **ghost dependency!**

#### Fix ngay (1 phút)
```bash
# Xóa ghost dependency
rm -rf node_modules/react-native-css-interop

# Verify đúng version
node -e "console.log(require(require.resolve('react-native-css-interop/package.json', {paths: [process.cwd()]})).version)"
# Phải hiện 0.2.1 hoặc cao hơn

# Restart Metro
npx react-native start --reset-cache
```

### 2. metro.config.js: withNativeWind bị override bởi mergeConfig

```js
// ❌ SAI — mergeConfig có thể override NativeWind resolver/transformer
module.exports = mergeConfig(
  withNativeWind(getDefaultConfig(__dirname), { input: '...' }),
  customConfig,
);

// ✅ ĐÚNG — NativeWind wrap SAU CÙNG
const baseConfig = mergeConfig(getDefaultConfig(__dirname), customConfig);
module.exports = withNativeWind(baseConfig, {
  input: './src/config/global.css',
  forceWriteFileSystem: true, // bypass virtual modules (Metro v0.82+)
});
```

### 3. CSS ordering trong global.css

```css
/* ❌ SAI — @tailwind bị override bởi CSS variables */
:root { --color-primary: 34 197 94; }
@tailwind base;

/* ✅ ĐÚNG — @tailwind trước */
@tailwind base;
@tailwind components;
@tailwind utilities;
:root { --color-primary: 34 197 94; }
```

## Checklist debug nhanh

1. **Kiểm tra version css-interop** → ghost dependency?
2. **Kiểm tra metro.config.js** → withNativeWind wrap cuối?
3. **Kiểm tra global.css** → @tailwind trước CSS variables?
4. **Clear cache** → `npx react-native start --reset-cache`
5. **Kiểm tra css-interop cache** → `ls -la node_modules/.pnpm/react-native-css-interop@*/node_modules/react-native-css-interop/.cache/`

## Version compatibility

| NativeWind | css-interop | React | React Native | Status |
|-----------|------------|-------|-------------|--------|
| 4.1.23 | 0.1.22 | 18.x | 0.73-0.76 | ✅ |
| 4.1.23 | 0.1.22 | 19.x | 0.80+ | ❌ FAIL |
| 4.2.1 | 0.2.1 | 18-19.x | 0.73-0.80+ | ✅ |

## Phòng tránh

Mỗi khi chạy `pnpm install`, thêm/xóa package, hoặc pull code mới — chạy lệnh check nhanh:

```bash
# Từ apps/mobile/
ls node_modules/react-native-css-interop 2>/dev/null && echo "⚠️ GHOST DEPENDENCY! Chạy: rm -rf node_modules/react-native-css-interop" || echo "✅ OK — không có ghost dependency"
```

Hoặc thêm vào `postinstall` script trong `apps/mobile/package.json`:

```json
{
  "scripts": {
    "postinstall": "rm -rf node_modules/react-native-css-interop 2>/dev/null; echo '✅ NativeWind ghost dep cleaned'"
  }
}
```

> **Lưu ý:** Ghost dependency xuất hiện do pnpm hoisting — nó copy `react-native-css-interop` vào `apps/mobile/node_modules/` thay vì chỉ dùng symlink từ root. Bản local này có thể gây conflict cache với bản chính trong `.pnpm/`.

## Ngày phát hiện
- 2026-02-12 — Lần 1: Ghost dep v0.1.22 + React 19 → silent fail
- 2026-02-13 — Lần 2: Ghost dep v0.2.1 (đúng version nhưng local copy gây cache conflict)
- 2026-02-14 — Lần 3: Ghost dep v0.2.1 tái xuất. **Đã thêm `postinstall` script vào package.json để tự động dọn.**
