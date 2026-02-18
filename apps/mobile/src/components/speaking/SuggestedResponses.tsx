import React from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import AppButton from '@/components/ui/AppButton';
import {SKILL_COLORS} from '@/config/skillColors';

// =======================
// Types
// =======================

interface SuggestedResponsesProps {
  /** Danh sách gợi ý trả lời */
  suggestions: string[];
  /** Khi user chọn 1 gợi ý */
  onSelect: (suggestion: string) => void;
  /** Đang disabled (vd: khi đang ghi âm) */
  disabled?: boolean;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Hiển thị hàng chip gợi ý trả lời cho Coach beginner mode
 * Tham số đầu vào: suggestions (string[]), onSelect callback, disabled
 * Tham số đầu ra: JSX.Element — horizontal scrollable chip list
 * Khi nào sử dụng:
 *   - CoachSessionScreen: khi feedback mode = beginner → hiện gợi ý
 *   - User tap chip → auto-fill text input hoặc auto-submit
 */
export default function SuggestedResponses({
  suggestions,
  onSelect,
  disabled = false,
}: SuggestedResponsesProps) {
  const speakingColor = SKILL_COLORS.speaking.dark;

  if (!suggestions.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {suggestions.map((suggestion, index) => (
          <AppButton
            key={`${suggestion}-${index}`}
            variant="outline"
            size="sm"
            onPress={() => onSelect(suggestion)}
            disabled={disabled}
            style={[
              styles.chip,
              {borderColor: `${speakingColor}40`},
            ]}>
            {suggestion}
          </AppButton>
        ))}
      </ScrollView>
    </View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  scrollContent: {
    gap: 8,
  },
  chip: {
    borderRadius: 20,
  },
});
