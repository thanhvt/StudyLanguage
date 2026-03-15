import React from 'react';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';

// =======================
// Types
// =======================

interface ScenarioCardProps {
  /** Tên kịch bản */
  title: string;
  /** Mô tả ngắn */
  description: string;
  /** Icon/Emoji */
  emoji: string;
  /** Số lượt chơi */
  plays?: number;
  /** Độ khó */
  difficulty?: 'easy' | 'medium' | 'hard';
  /** Khi tap */
  onPress: () => void;
  /** Đã được chọn */
  selected?: boolean;
}

const DIFFICULTY_MAP = {
  easy: {label: 'Dễ', color: '#22c55e'},
  medium: {label: 'Trung bình', color: '#f59e0b'},
  hard: {label: 'Khó', color: '#ef4444'},
};

// =======================
// Component
// =======================

/**
 * Mục đích: Card hiển thị 1 kịch bản roleplay
 * Tham số đầu vào: title, description, emoji, plays, difficulty, onPress, selected
 * Tham số đầu ra: JSX.Element — card tap-able
 * Khi nào sử dụng:
 *   - RoleplaySelectScreen: danh sách kịch bản
 *   - RoleplaySelectScreen: danh sách kịch bản
 */
export default function ScenarioCard({
  title,
  description,
  emoji,
  plays,
  difficulty,
  onPress,
  selected = false,
}: ScenarioCardProps) {
  const colors = useColors();
  const speakingColor = SKILL_COLORS.speaking.dark;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderWidth: selected ? 2 : 0,
          borderColor: selected ? speakingColor : 'transparent',
        },
      ]}>
      {/* Icon + Content */}
      <View style={styles.row}>
        <View style={[styles.emojiBox, {backgroundColor: `${speakingColor}15`}]}>
          <AppText variant="heading2" raw>{emoji}</AppText>
        </View>
        <View style={styles.content}>
          <AppText variant="body" weight="semibold" className="text-foreground" raw>
            {title}
          </AppText>
          <AppText
            variant="caption"
            className="text-neutrals400 mt-1"
            numberOfLines={2}
            raw>
            {description}
          </AppText>
        </View>
        <Icon name="ChevronRight" className="w-4 h-4" style={{color: colors.neutrals400}} />
      </View>

      {/* Footer: difficulty + plays */}
      {(difficulty || plays !== undefined) && (
        <View style={styles.footer}>
          {difficulty && (
            <View style={[styles.badge, {backgroundColor: `${DIFFICULTY_MAP[difficulty].color}15`}]}>
              <AppText
                variant="caption"
                weight="semibold"
                style={{color: DIFFICULTY_MAP[difficulty].color}}
                raw>
                {DIFFICULTY_MAP[difficulty].label}
              </AppText>
            </View>
          )}
          {plays !== undefined && (
            <AppText variant="caption" className="text-neutrals400" raw>
              🔥 {plays} lượt
            </AppText>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(150,150,150,0.12)',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
});
