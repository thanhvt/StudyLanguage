import React from 'react';
import {View, StyleSheet} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';

// =======================
// Types
// =======================

interface ContextBannerProps {
  /** Tên scenario / topic */
  title: string;
  /** Mô tả ngắn (optional) */
  description?: string;
  /** Mức độ khó */
  difficulty: 'easy' | 'medium' | 'hard';
  /** Accent color — mặc định orange cho Roleplay */
  accentColor?: string;
  /** Persona info (avatar + name) */
  persona?: {name: string; avatar?: string} | null;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Hiển thị banner context ở đầu ConversationScreen (Roleplay only)
 * Tham số đầu vào: title, description, difficulty, accentColor, persona
 * Tham số đầu ra: JSX.Element — horizontal banner với info + difficulty badge
 * Khi nào sử dụng:
 *   ConversationScreen → mode === 'roleplay' → hiện context banner phía dưới topbar
 *   Giúp user nhớ scenario đang chơi, persona, và mức khó
 */
export default function ContextBanner({
  title,
  description,
  difficulty,
  accentColor = '#F59E0B',
  persona,
}: ContextBannerProps) {
  const colors = useColors();

  const difficultyLabel: Record<string, string> = {
    easy: 'DỄ',
    medium: 'TRUNG BÌNH',
    hard: 'KHÓ',
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `${accentColor}10`,
          borderBottomColor: `${accentColor}20`,
        },
      ]}>
      {/* Persona Avatar */}
      {persona && (
        <View style={[styles.avatar, {backgroundColor: `${accentColor}20`}]}>
          <AppText style={{fontSize: 16}} raw>
            {persona.avatar || '🎭'}
          </AppText>
        </View>
      )}

      {/* Info */}
      <View style={{flex: 1}}>
        <AppText variant="bodySmall" weight="bold" style={{color: accentColor}} raw>
          {title}
        </AppText>
        {description ? (
          <AppText
            variant="caption"
            style={{color: colors.neutrals400, marginTop: 2}}
            numberOfLines={1}
            raw>
            {description}
          </AppText>
        ) : null}
        {persona && (
          <AppText
            variant="caption"
            style={{color: colors.neutrals400, marginTop: 1}}
            raw>
            Vai: {persona.name}
          </AppText>
        )}
      </View>

      {/* Difficulty Badge */}
      <View style={[styles.badge, {backgroundColor: `${accentColor}25`}]}>
        <Icon name="Zap" className="w-3 h-3" style={{color: accentColor}} />
        <AppText
          variant="caption"
          weight="bold"
          style={{color: accentColor, marginLeft: 3}}
          raw>
          {difficultyLabel[difficulty] || difficulty.toUpperCase()}
        </AppText>
      </View>
    </View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
