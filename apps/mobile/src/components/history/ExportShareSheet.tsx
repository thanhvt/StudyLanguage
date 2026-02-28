import React, {useCallback} from 'react';
import {View, Pressable, Modal, Platform} from 'react-native';
import {AppText} from '@/components/ui';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Share from 'react-native-share';
import type {HistoryEntry} from '@/services/api/history';
import {getTypeIcon, getTypeLabel, type SkillType} from '@/utils/historyHelpers';

/**
 * Mục đích: Bottom sheet cho Export/Share bản ghi sử dụng react-native-share
 * Tham số đầu vào:
 *   - visible: boolean — hiển thị/ẩn
 *   - entry: HistoryEntry | null — entry cần export
 *   - onClose: Callback đóng sheet
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: HistoryDetailScreen / QuickActions → Share
 *
 * Tính năng:
 *   - Share text/link qua native share dialog (react-native-share)
 *   - Share riêng lẻ qua WhatsApp, Telegram, Twitter...
 *   - Copy to clipboard
 *   - Export as screenshot (future)
 */

interface ExportShareSheetProps {
  visible: boolean;
  entry: HistoryEntry | null;
  onClose: () => void;
}

export function ExportShareSheet({
  visible,
  entry,
  onClose,
}: ExportShareSheetProps) {
  const insets = useSafeAreaInsets();

  if (!entry) return null;

  const icon = getTypeIcon(entry.type as SkillType);
  const typeLabel = getTypeLabel(entry.type as SkillType);
  const date = new Date(entry.createdAt).toLocaleDateString('vi-VN');

  /**
   * Mục đích: Tạo summary text từ entry để chia sẻ
   * Tham số đầu vào: entry từ props
   * Tham số đầu ra: string — text summary
   * Khi nào sử dụng: handleShare, handleShareSocial
   */
  const generateSummary = useCallback((): string => {
    const lines = [
      `${icon} Bài ${typeLabel}: ${entry.topic}`,
      `📅 Ngày: ${date}`,
      `⏱ Thời lượng: ${entry.durationMinutes || 5} phút`,
    ];

    if (entry.keywords) {
      lines.push(`🔑 Từ khóa: ${entry.keywords}`);
    }

    lines.push('', '📱 StudyLanguage — Ứng dụng học ngôn ngữ');

    return lines.join('\n');
  }, [entry, icon, typeLabel, date]);

  /**
   * Mục đích: Chia sẻ qua react-native-share (full feature share dialog)
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Tap "Chia sẻ"
   */
  const handleShare = useCallback(async () => {
    try {
      const message = generateSummary();
      await Share.open({
        title: `${icon} ${entry.topic}`,
        message,
        subject: `StudyLanguage — ${entry.topic}`,
      });
      console.log('✅ [ExportShare] Đã chia sẻ qua react-native-share');
      onClose();
    } catch (err: any) {
      // User dismiss = không phải lỗi thực tế
      if (err?.message !== 'User did not share') {
        console.error('❌ [ExportShare] Lỗi chia sẻ:', err);
      }
    }
  }, [entry, generateSummary, icon, onClose]);

  /**
   * Mục đích: Chia sẻ qua social network cụ thể
   * Tham số đầu vào: social — social network identifier
   * Tham số đầu ra: void
   * Khi nào sử dụng: Tap icon social
   */
  const handleShareSocial = useCallback(
    async (social: string) => {
      try {
        const message = generateSummary();
        await Share.shareSingle({
          title: `${icon} ${entry.topic}`,
          message,
          social: social as any,
        });
        console.log(`✅ [ExportShare] Đã chia sẻ qua ${social}`);
        onClose();
      } catch (err: any) {
        if (err?.message !== 'User did not share') {
          console.error(`❌ [ExportShare] Lỗi chia sẻ qua ${social}:`, err);
        }
      }
    },
    [entry, generateSummary, icon, onClose],
  );

  /**
   * Mục đích: Copy text vào clipboard
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Tap "Sao chép"
   */
  const handleCopy = useCallback(async () => {
    try {
      const Clipboard = require('@react-native-clipboard/clipboard').default;
      const text = generateSummary();
      Clipboard.setString(text);
      console.log('✅ [ExportShare] Đã sao chép');
      onClose();
    } catch (err) {
      console.error('❌ [ExportShare] Lỗi copy:', err);
    }
  }, [generateSummary, onClose]);

  // Social sharing options
  const socialOptions = [
    {key: Share.Social?.WHATSAPP, icon: '💬', label: 'WhatsApp'},
    {key: Share.Social?.TELEGRAM, icon: '✈️', label: 'Telegram'},
    ...(Platform.OS === 'ios'
      ? [{key: Share.Social?.INSTAGRAM, icon: '📸', label: 'Instagram'}]
      : []),
  ].filter(item => item.key);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable
        className="flex-1"
        style={{backgroundColor: 'rgba(0, 0, 0, 0.50)'}}
        onPress={onClose}
      />

      {/* Sheet */}
      <View
        className="bg-background rounded-t-3xl"
        style={{
          paddingBottom: Math.max(insets.bottom, 16) + 24,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -4},
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 20,
        }}>
        {/* Handle bar */}
        <View className="items-center pt-4 mb-4">
          <View className="w-10 h-1 bg-neutrals600 rounded-full" />
        </View>

        {/* Header */}
        <View className="flex-row items-center justify-between px-6 mb-5">
          <AppText className="text-foreground font-sans-bold text-lg">
            📤 Chia sẻ & Export
          </AppText>
          <Pressable
            className="w-8 h-8 rounded-full bg-neutrals900 items-center justify-center active:scale-90"
            onPress={onClose}>
            <AppText className="text-neutrals400 text-sm">✕</AppText>
          </Pressable>
        </View>

        {/* Preview card */}
        <View className="mx-6 mb-5 p-4 bg-neutrals900 rounded-2xl border border-border">
          <AppText className="text-foreground font-sans-semibold mb-2" numberOfLines={1}>
            {icon} {entry.topic}
          </AppText>
          <AppText className="text-neutrals400 text-xs">
            {typeLabel} • {date} • {entry.durationMinutes || 5} phút
          </AppText>
        </View>

        {/* Primary Share Button */}
        <View className="px-6 mb-4">
          <Pressable
            className="flex-row items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary/10 border border-primary/20 active:scale-[0.97]"
            onPress={handleShare}>
            <AppText className="text-base">
              {Platform.OS === 'ios' ? '📤' : '🔗'}
            </AppText>
            <AppText className="text-primary font-sans-bold">
              Chia sẻ
            </AppText>
          </Pressable>
        </View>

        {/* Social Sharing Row */}
        {socialOptions.length > 0 && (
          <View className="px-6 mb-4">
            <AppText className="text-neutrals400 text-xs font-sans-semibold uppercase tracking-wider mb-3">
              Chia sẻ nhanh
            </AppText>
            <View className="flex-row gap-3">
              {socialOptions.map(social => (
                <Pressable
                  key={social.key}
                  className="flex-1 items-center gap-1.5 py-3 rounded-2xl bg-neutrals900 border border-border active:scale-[0.95]"
                  onPress={() => handleShareSocial(social.key!)}>
                  <AppText className="text-xl">{social.icon}</AppText>
                  <AppText className="text-neutrals400 text-[10px] font-sans-medium">
                    {social.label}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Other Actions */}
        <View className="px-6 gap-2">
          <Pressable
            className="flex-row items-center gap-3 px-4 py-3.5 rounded-2xl bg-neutrals900 active:scale-[0.97]"
            onPress={handleCopy}>
            <AppText className="text-base w-6 text-center">📋</AppText>
            <AppText className="flex-1 text-foreground font-sans-medium">
              Sao chép nội dung
            </AppText>
          </Pressable>

          <Pressable
            className="flex-row items-center gap-3 px-4 py-3.5 rounded-2xl bg-neutrals900 opacity-50"
            disabled>
            <AppText className="text-base w-6 text-center">📸</AppText>
            <AppText className="flex-1 text-neutrals400 font-sans-medium">
              Export ảnh (Sắp ra mắt)
            </AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
