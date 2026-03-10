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
  /** Danh sách sửa ngữ pháp (hiện tất cả trong 1 card) */
  corrections: GrammarCorrection[];
  /** Callback khi user nhấn "Đã hiểu" */
  onDismiss?: () => void;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Hiển thị inline card sửa lỗi ngữ pháp theo mockup —
 *   numbered list gom sai → đúng + explanation, "Đã hiểu ✓" button
 * Tham số đầu vào: corrections (mảng), onDismiss callback
 * Tham số đầu ra: JSX.Element — card grammar fix gộp
 * Khi nào sử dụng:
 *   ConversationScreen → AI trả lời kèm grammar corrections → insert card
 */
export default function GrammarFix({corrections, onDismiss}: GrammarFixProps) {
  const colors = useColors();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !corrections.length) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <View style={[styles.container, {backgroundColor: '#F59E0B10', borderColor: '#F59E0B25'}]}>
      {/* Header */}
      <View style={styles.header}>
        <AppText variant="body" weight="bold" style={{color: colors.foreground}} raw>
          📝 Sửa ngữ pháp
        </AppText>
      </View>

      {/* Numbered corrections list */}
      {corrections.map((gc, idx) => (
        <View key={`gc-${idx}`} style={styles.correctionItem}>
          {/* Số thứ tự + sai → đúng */}
          <AppText variant="body" raw>
            <AppText variant="body" weight="bold" style={{color: colors.foreground}} raw>
              {idx + 1}{' '}
            </AppText>
            <AppText variant="body" style={{textDecorationLine: 'line-through', color: '#EF4444'}} raw>
              {gc.original}
            </AppText>
            <AppText variant="body" style={{color: colors.foreground}} raw>
              {' → '}
            </AppText>
            <AppText variant="body" weight="bold" style={{color: '#22C55E'}} raw>
              {gc.correction}
            </AppText>
          </AppText>

          {/* Giải thích */}
          <AppText variant="caption" style={{color: colors.neutrals400, marginTop: 2, marginLeft: 16}} raw>
            {gc.explanation}
          </AppText>
        </View>
      ))}

      {/* Đã hiểu button */}
      <TouchableOpacity
        style={[styles.dismissBtn, {backgroundColor: '#22C55E20', borderColor: '#22C55E40'}]}
        onPress={handleDismiss}
        activeOpacity={0.7}>
        <AppText variant="bodySmall" weight="bold" style={{color: '#22C55E'}} raw>
          [Đã hiểu ✓]
        </AppText>
      </TouchableOpacity>
    </View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  header: {
    marginBottom: 10,
  },
  correctionItem: {
    marginBottom: 8,
  },
  dismissBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
});
