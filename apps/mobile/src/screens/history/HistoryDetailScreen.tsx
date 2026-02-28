import React, {useCallback, useEffect, useState} from 'react';
import {View, ScrollView, Pressable, TextInput} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {AppText} from '@/components/ui';
import {historyApi} from '@/services/api/history';
import type {HistoryEntry} from '@/services/api/history';
import {
  getTypeIcon,
  getAccentColor,
  getTypeLabel,
  type SkillType,
} from '@/utils/historyHelpers';

/**
 * Mục đích: Màn hình chi tiết session — hiển thị thông tin đầy đủ của 1 bản ghi
 * Tham số đầu vào: route.params.entryId — ID bản ghi cần xem
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: HistoryScreen → tap card → navigate tới HistoryDetail
 *
 * Tính năng:
 *   - Header card với accent bar, badges, date/duration
 *   - Quick action buttons (Phát lại, Luyện lại, Chia sẻ, Ghi chú)
 *   - Nội dung chi tiết theo loại:
 *     + Listening: audio player mini, transcript, bookmarks
 *     + Speaking: conversation replay, score breakdown
 *     + Reading: article preview, quiz results
 *   - User notes (editable)
 *   - Pin/Favorite toggles
 */
export default function HistoryDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const entryId = route.params?.entryId as string;

  // State
  const [entry, setEntry] = useState<HistoryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  // ==========================================
  // Fetch data
  // ==========================================

  /**
   * Mục đích: Tải chi tiết entry từ API
   * Tham số đầu vào: entryId từ route params
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi màn hình mount
   */
  useEffect(() => {
    const fetchEntry = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('🔍 [HistoryDetail] Đang tải chi tiết:', entryId);
        const data = await historyApi.getHistoryEntry(entryId);
        setEntry(data);
        setNotes(data.userNotes || '');
        console.log('✅ [HistoryDetail] Đã tải:', data.topic);
      } catch (err: any) {
        const message = err?.message || 'Lỗi tải chi tiết bản ghi';
        console.error('❌ [HistoryDetail] Lỗi:', message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (entryId) {
      fetchEntry();
    }
  }, [entryId]);

  // ==========================================
  // Handlers
  // ==========================================

  /**
   * Mục đích: Lưu ghi chú người dùng
   * Tham số đầu vào: notes từ state
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap "Lưu" sau khi sửa ghi chú
   */
  const handleSaveNotes = useCallback(async () => {
    if (!entry) return;
    setSavingNotes(true);
    try {
      await historyApi.updateNotes(entry.id, notes);
      setEditingNotes(false);
      console.log('✅ [HistoryDetail] Đã lưu ghi chú');
    } catch (err) {
      console.error('❌ [HistoryDetail] Lỗi lưu ghi chú:', err);
    } finally {
      setSavingNotes(false);
    }
  }, [entry, notes]);

  /**
   * Mục đích: Toggle pin
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: Tap nút Pin trong header
   */
  const handleTogglePin = useCallback(async () => {
    if (!entry) return;
    setEntry({...entry, isPinned: !entry.isPinned});
    try {
      await historyApi.togglePin(entry.id);
    } catch (err) {
      setEntry({...entry}); // Revert
      console.error('❌ [HistoryDetail] Lỗi toggle pin:', err);
    }
  }, [entry]);

  /**
   * Mục đích: Toggle favorite
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: Tap nút Favorite trong header
   */
  const handleToggleFavorite = useCallback(async () => {
    if (!entry) return;
    setEntry({...entry, isFavorite: !entry.isFavorite});
    try {
      await historyApi.toggleFavorite(entry.id);
    } catch (err) {
      setEntry({...entry}); // Revert
      console.error('❌ [HistoryDetail] Lỗi toggle favorite:', err);
    }
  }, [entry]);

  // ==========================================
  // Loading / Error states
  // ==========================================

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center" style={{paddingTop: insets.top}}>
        <AppText className="text-neutrals400">Đang tải...</AppText>
      </View>
    );
  }

  if (error || !entry) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-8" style={{paddingTop: insets.top}}>
        <AppText className="text-2xl mb-3">😥</AppText>
        <AppText className="text-foreground font-sans-bold text-lg text-center mb-2">
          Không tìm thấy bản ghi
        </AppText>
        <AppText className="text-neutrals400 text-sm text-center mb-4">
          {error || 'Bản ghi có thể đã bị xóa'}
        </AppText>
        <Pressable
          className="px-6 py-3 bg-primary/10 border border-primary/20 rounded-2xl active:scale-[0.95]"
          onPress={() => navigation.goBack()}>
          <AppText className="text-primary font-sans-semibold">← Quay lại</AppText>
        </Pressable>
      </View>
    );
  }

  // ==========================================
  // Derived data
  // ==========================================

  const accent = getAccentColor(entry.type as SkillType);
  const icon = getTypeIcon(entry.type as SkillType);
  const typeLabel = getTypeLabel(entry.type as SkillType);
  const dateFormatted = new Date(entry.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // ==========================================
  // Render
  // ==========================================

  return (
    <View className="flex-1 bg-background" style={{paddingTop: insets.top}}>
      {/* Header Navigation */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          className="flex-row items-center gap-2 active:scale-95"
          onPress={() => navigation.goBack()}>
          <AppText className="text-lg">←</AppText>
          <AppText className="text-foreground font-sans-medium">Quay lại</AppText>
        </Pressable>

        {/* Pin + Favorite buttons */}
        <View className="flex-row gap-2">
          <Pressable
            className={`w-10 h-10 rounded-full items-center justify-center border ${
              entry.isPinned ? 'bg-amber-500/10 border-amber-500/30' : 'bg-surface-raised border-border'
            } active:scale-90`}
            onPress={handleTogglePin}>
            <AppText className="text-lg">{entry.isPinned ? '📌' : '📍'}</AppText>
          </Pressable>
          <Pressable
            className={`w-10 h-10 rounded-full items-center justify-center border ${
              entry.isFavorite ? 'bg-amber-500/10 border-amber-500/30' : 'bg-surface-raised border-border'
            } active:scale-90`}
            onPress={handleToggleFavorite}>
            <AppText className="text-lg">{entry.isFavorite ? '⭐' : '☆'}</AppText>
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 40}}>
        {/* Header Card */}
        <View
          className="mx-4 mb-4 p-5 bg-surface-raised rounded-2xl border border-border overflow-hidden"
          style={{
            borderLeftWidth: 4,
            borderLeftColor: accent.border,
            shadowColor: accent.border,
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 2,
          }}>
          {/* Token + Title */}
          <View className="flex-row items-center gap-3 mb-3">
            <View
              className="w-12 h-12 rounded-xl items-center justify-center"
              style={{backgroundColor: accent.bg}}>
              <AppText className="text-2xl">{icon}</AppText>
            </View>
            <View className="flex-1">
              <AppText className="text-foreground font-sans-bold text-lg" numberOfLines={2}>
                {entry.topic}
              </AppText>
              <AppText className="text-sm mt-0.5" style={{color: accent.text}}>
                {typeLabel}
              </AppText>
            </View>
          </View>

          {/* Meta info */}
          <View className="flex-row flex-wrap gap-3 mt-1">
            <View className="flex-row items-center gap-1.5">
              <AppText className="text-xs">📅</AppText>
              <AppText className="text-neutrals400 text-xs">{dateFormatted}</AppText>
            </View>
            {entry.durationMinutes && (
              <View className="flex-row items-center gap-1.5">
                <AppText className="text-xs">⏱</AppText>
                <AppText className="text-neutrals400 text-xs">{entry.durationMinutes} phút</AppText>
              </View>
            )}
            {entry.numSpeakers && (
              <View className="flex-row items-center gap-1.5">
                <AppText className="text-xs">👥</AppText>
                <AppText className="text-neutrals400 text-xs">{entry.numSpeakers} người</AppText>
              </View>
            )}
          </View>

          {/* Keywords */}
          {entry.keywords && (
            <View className="mt-3 pt-3 border-t border-border/30">
              <AppText className="text-neutrals400 text-xs">
                🔑 {entry.keywords}
              </AppText>
            </View>
          )}
        </View>

        {/* Quick Actions Row */}
        <View className="flex-row mx-4 mb-4 gap-2">
          {entry.type === 'listening' && (
            <Pressable className="flex-1 flex-row items-center justify-center gap-1.5 py-3 bg-surface-raised rounded-2xl border border-border active:scale-[0.95]">
              <AppText className="text-sm">▶️</AppText>
              <AppText className="text-foreground text-sm font-sans-medium">Phát lại</AppText>
            </Pressable>
          )}
          <Pressable className="flex-1 flex-row items-center justify-center gap-1.5 py-3 bg-surface-raised rounded-2xl border border-border active:scale-[0.95]">
            <AppText className="text-sm">🔄</AppText>
            <AppText className="text-foreground text-sm font-sans-medium">Luyện lại</AppText>
          </Pressable>
          <Pressable className="flex-1 flex-row items-center justify-center gap-1.5 py-3 bg-surface-raised rounded-2xl border border-border active:scale-[0.95]">
            <AppText className="text-sm">📤</AppText>
            <AppText className="text-foreground text-sm font-sans-medium">Chia sẻ</AppText>
          </Pressable>
        </View>

        {/* ============================== */}
        {/* Content — Listening Detail */}
        {/* ============================== */}
        {entry.type === 'listening' && (
          <View className="mx-4 gap-4">
            {/* Audio Player Mini */}
            {entry.audioUrl && (
              <View className="p-4 bg-surface-raised rounded-2xl border border-border">
                <View className="flex-row items-center gap-3 mb-3">
                  <AppText className="text-sm">🎵</AppText>
                  <AppText className="text-foreground font-sans-semibold">Audio</AppText>
                </View>
                <View className="flex-row items-center gap-3">
                  <Pressable className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center active:scale-90">
                    <AppText>▶️</AppText>
                  </Pressable>
                  <View className="flex-1 h-1 bg-neutrals700 rounded-full">
                    <View className="w-1/3 h-full bg-primary rounded-full" />
                  </View>
                  <AppText className="text-neutrals400 text-xs">
                    {entry.durationMinutes || 5}:00
                  </AppText>
                </View>
              </View>
            )}

            {/* Thông tin bổ sung */}
            <View className="p-4 bg-surface-raised rounded-2xl border border-border">
              <View className="flex-row items-center gap-3 mb-3">
                <AppText className="text-sm">📊</AppText>
                <AppText className="text-foreground font-sans-semibold">Chi tiết bài nghe</AppText>
              </View>
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <AppText className="text-neutrals400 text-sm">Thời lượng</AppText>
                  <AppText className="text-foreground text-sm font-sans-medium">
                    {entry.durationMinutes || 5} phút
                  </AppText>
                </View>
                <View className="flex-row justify-between">
                  <AppText className="text-neutrals400 text-sm">Số người</AppText>
                  <AppText className="text-foreground text-sm font-sans-medium">
                    {entry.numSpeakers || 2} người
                  </AppText>
                </View>
                {entry.mode && (
                  <View className="flex-row justify-between">
                    <AppText className="text-neutrals400 text-sm">Chế độ</AppText>
                    <AppText className="text-foreground text-sm font-sans-medium">
                      {entry.mode}
                    </AppText>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* ============================== */}
        {/* Content — Speaking Detail */}
        {/* ============================== */}
        {entry.type === 'speaking' && (
          <View className="mx-4 gap-4">
            {/* Chế độ luyện */}
            <View className="p-4 bg-surface-raised rounded-2xl border border-border">
              <View className="flex-row items-center gap-3 mb-3">
                <AppText className="text-sm">🗣️</AppText>
                <AppText className="text-foreground font-sans-semibold">Chi tiết bài nói</AppText>
              </View>
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <AppText className="text-neutrals400 text-sm">Chế độ</AppText>
                  <AppText className="text-foreground text-sm font-sans-medium">
                    {entry.mode === 'interactive' ? 'Hội thoại AI' : 'Luyện phát âm'}
                  </AppText>
                </View>
                <View className="flex-row justify-between">
                  <AppText className="text-neutrals400 text-sm">Thời lượng</AppText>
                  <AppText className="text-foreground text-sm font-sans-medium">
                    {entry.durationMinutes || 5} phút
                  </AppText>
                </View>
              </View>
            </View>

            {/* Score placeholder */}
            <View className="p-4 bg-surface-raised rounded-2xl border border-border">
              <View className="flex-row items-center gap-3 mb-3">
                <AppText className="text-sm">🎯</AppText>
                <AppText className="text-foreground font-sans-semibold">Kết quả</AppText>
              </View>
              <AppText className="text-neutrals400 text-sm">
                Đánh giá chi tiết sẽ hiển thị khi có dữ liệu từ AI
              </AppText>
            </View>
          </View>
        )}

        {/* ============================== */}
        {/* Content — Reading Detail */}
        {/* ============================== */}
        {entry.type === 'reading' && (
          <View className="mx-4 gap-4">
            <View className="p-4 bg-surface-raised rounded-2xl border border-border">
              <View className="flex-row items-center gap-3 mb-3">
                <AppText className="text-sm">📖</AppText>
                <AppText className="text-foreground font-sans-semibold">Chi tiết bài đọc</AppText>
              </View>
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <AppText className="text-neutrals400 text-sm">Thời lượng đọc</AppText>
                  <AppText className="text-foreground text-sm font-sans-medium">
                    {entry.durationMinutes || 5} phút
                  </AppText>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ============================== */}
        {/* User Notes Section */}
        {/* ============================== */}
        <View className="mx-4 mt-4">
          <View className="p-4 bg-surface-raised rounded-2xl border border-border">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-3">
                <AppText className="text-sm">📝</AppText>
                <AppText className="text-foreground font-sans-semibold">Ghi chú</AppText>
              </View>
              {!editingNotes && (
                <Pressable onPress={() => setEditingNotes(true)}>
                  <AppText className="text-primary text-sm font-sans-medium">Sửa</AppText>
                </Pressable>
              )}
            </View>

            {editingNotes ? (
              <View>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Thêm ghi chú cá nhân..."
                  placeholderTextColor="#5e5e5e"
                  className="bg-neutrals900 border border-border rounded-xl px-4 py-3 text-foreground font-sans min-h-[80]"
                  multiline
                  textAlignVertical="top"
                  autoFocus
                />
                <View className="flex-row gap-2 mt-3">
                  <Pressable
                    className="flex-1 py-2.5 rounded-xl bg-neutrals900 border border-border items-center active:scale-[0.95]"
                    onPress={() => {
                      setEditingNotes(false);
                      setNotes(entry.userNotes || '');
                    }}>
                    <AppText className="text-neutrals400 font-sans-medium text-sm">Hủy</AppText>
                  </Pressable>
                  <Pressable
                    className="flex-1 py-2.5 rounded-xl bg-primary items-center active:scale-[0.95]"
                    onPress={handleSaveNotes}
                    disabled={savingNotes}>
                    <AppText className="text-black font-sans-bold text-sm">
                      {savingNotes ? 'Đang lưu...' : 'Lưu'}
                    </AppText>
                  </Pressable>
                </View>
              </View>
            ) : (
              <AppText className="text-neutrals400 text-sm leading-5">
                {notes || 'Chưa có ghi chú. Tap "Sửa" để thêm.'}
              </AppText>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
