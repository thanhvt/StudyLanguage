/**
 * Mục đích: Wrapper an toàn cho @callstack/liquid-glass
 *   - Trên iOS 26+: import thật từ thư viện, dùng LiquidGlassView native
 *   - Trên iOS < 26 hoặc Android: fallback về View thường, isLiquidGlassSupported = false
 *   - Tránh crash TurboModuleRegistry.getEnforcing() trên iOS < 26
 *
 * Tham số đầu vào: không (module export)
 * Tham số đầu ra: { LiquidGlassView, isLiquidGlassSupported }
 * Khi nào sử dụng: Import thay cho '@callstack/liquid-glass' trực tiếp
 *   CustomTabBar.tsx, ConfigScreen.tsx, hoặc bất kỳ nơi nào cần glass effect
 */

import {View, type ViewProps} from 'react-native';

// Biến lưu kết quả check — chỉ chạy 1 lần
let _isSupported = false;
let _LiquidGlassView: React.ComponentType<any> = View;

try {
  // Import động — nếu TurboModule không tồn tại sẽ throw
  const liquidGlass = require('@callstack/liquid-glass');
  _isSupported = liquidGlass.isLiquidGlassSupported ?? false;
  if (liquidGlass.LiquidGlassView) {
    _LiquidGlassView = liquidGlass.LiquidGlassView;
  }
} catch (e) {
  // iOS < 26 hoặc Android: TurboModule không tồn tại → fallback
  console.log('ℹ️ [LiquidGlass] Không hỗ trợ trên thiết bị này — dùng View fallback');
  _isSupported = false;
  _LiquidGlassView = View;
}

/**
 * Mục đích: Flag cho biết thiết bị có hỗ trợ Liquid Glass hay không
 * Tham số đầu vào: không
 * Tham số đầu ra: boolean
 * Khi nào sử dụng: Kiểm tra trước khi dùng LiquidGlassView
 */
export const isLiquidGlassSupported: boolean = _isSupported;

/**
 * Mục đích: Component LiquidGlassView an toàn
 *   - iOS 26+: native LiquidGlassView với hiệu ứng glass
 *   - iOS < 26 / Android: View thường (không crash)
 * Tham số đầu vào: ViewProps + effect, tintColor, colorScheme, interactive
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Bất kỳ nơi nào muốn hiệu ứng glass
 */
export const LiquidGlassView: React.ComponentType<
  ViewProps & {
    effect?: 'clear' | 'regular' | 'none';
    tintColor?: string;
    colorScheme?: 'light' | 'dark' | 'system';
    interactive?: boolean;
  }
> = _LiquidGlassView;
