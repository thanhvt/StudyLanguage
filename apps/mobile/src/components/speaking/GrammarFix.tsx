import React, {useState} from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';

// =======================
// Types
// =======================

export interface GrammarCorrection {
  /** Câu gốc user nói */
  original: string;
  /** Câu đã sửa */
  correction: string;
  /** Giải thích lỗi ngữ pháp */
  explanation: string;
}

interface GrammarFixProps {
  /** Thông tin sửa ngữ pháp */
  correction: GrammarCorrection;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Hiển thị inline card sửa lỗi ngữ pháp giữa các chat bubbles
 * Tham số đầu vào: correction (original, corrected, explanation)
 * Tham số đầu ra: JSX.Element — expandable card
 * Khi nào sử dụng:
 *   - CoachSessionScreen: AI phát hiện lỗi ngữ pháp → insert card
 *   - RoleplaySessionScreen: inline grammar correction
 */
export default function GrammarFix({correction}: GrammarFixProps) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);
  const fixColor = '#3B82F6'; // Blue cho grammar

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
      style={[styles.container, {backgroundColor: `${fixColor}10`}]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconBadge, {backgroundColor: `${fixColor}20`}]}>
          <Icon
            name="PenLine"
            className="w-3.5 h-3.5"
            style={{color: fixColor}}
          />
        </View>
        <AppText
          variant="caption"
          weight="bold"
          style={{color: fixColor}}
          raw>
          Sửa ngữ pháp
        </AppText>
        <View style={{flex: 1}} />
        <Icon
          name={expanded ? 'ChevronUp' : 'ChevronDown'}
          className="w-4 h-4"
          style={{color: fixColor, opacity: 0.6}}
        />
      </View>

      {/* Nội dung chính: original → corrected */}
      <View style={styles.content}>
        <AppText variant="bodySmall" raw>
          <AppText
            variant="bodySmall"
            style={{textDecorationLine: 'line-through', color: '#EF4444'}}
            raw>
            {correction.original}
          </AppText>
          {' → '}
          <AppText
            variant="bodySmall"
            weight="semibold"
            style={{color: '#22C55E'}}
            raw>
            {correction.correction}
          </AppText>
        </AppText>
      </View>

      {/* Giải thích (expandable) */}
      {expanded && (
        <View style={[styles.explanation, {backgroundColor: `${fixColor}08`}]}>
          <AppText
            variant="caption"
            className="text-neutrals400"
            raw>
            💡 {correction.explanation}
          </AppText>
        </View>
      )}
    </TouchableOpacity>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 4,
    padding: 10,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  iconBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginLeft: 28,
  },
  explanation: {
    marginTop: 8,
    marginLeft: 28,
    padding: 8,
    borderRadius: 8,
  },
});
