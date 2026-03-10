import React from 'react';
import {View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useColors} from '@/hooks/useColors';
import {useAppStore} from '@/store/useAppStore';
import {LiquidGlassView, isLiquidGlassSupported} from '@/utils/LiquidGlass';

// =======================
// Props
// =======================

interface SectionCardProps {
  children: React.ReactNode;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Card container dùng chung cho tất cả config sections — hỗ trợ Liquid Glass trên iOS 26+
 * Tham số đầu vào: children (React.ReactNode)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   - ListeningConfigScreen → wrap sections (Topic, Level, Duration, ...)
 *   - SpeakingConfigScreen → wrap sections (Topic, Level)
 *   - ShadowingConfigScreen → wrap sections (Topic, Speed, Delay, ...)
 *   - ConversationSetupScreen → wrap sections (Topic, Duration, Feedback, ...)
 */
export default function SectionCard({children}: SectionCardProps) {
  const colors = useColors();
  const theme = useAppStore(state => state.theme);
  const isDark = theme !== 'light';

  // iOS 26+ → Liquid Glass effect với shadow, rim light, inner glow
  if (isLiquidGlassSupported) {
    return (
      <View style={{
        // Shadow — nhẹ hơn trong light mode
        shadowColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.15)',
        shadowOffset: {width: 0, height: isDark ? 8 : 4},
        shadowOpacity: isDark ? 0.35 : 0.2,
        shadowRadius: isDark ? 16 : 12,
        elevation: isDark ? 8 : 4,
        borderRadius: 20,
      }}>
        <LiquidGlassView
          effect="regular"
          tintColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'}
          style={{
            borderRadius: 20,
            padding: 16,
            overflow: 'hidden',
            // Rim light adaptive — dark = white tint, light = dark tint
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)',
            borderTopColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.60)',
            borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            // Glass bg — light mode dùng tint nhẹ hơn
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)',
          }}>
          {/* Inner glow — chỉ hiện trong dark mode */}
          {isDark && (
            <LinearGradient
              colors={['rgba(255,255,255,0.08)', 'transparent']}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 40,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }}
            />
          )}
          {children}
        </LiquidGlassView>
      </View>
    );
  }

  // Fallback — View thường với surfaceRaised
  return (
    <View
      className="rounded-[20px] p-4 overflow-hidden"
      style={{
        backgroundColor: colors.surfaceRaised,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}>
      {children}
    </View>
  );
}
