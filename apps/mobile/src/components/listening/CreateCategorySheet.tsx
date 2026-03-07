import React, {useCallback, useRef, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {customCategoryApi} from '@/services/api/customCategories';
import {useListeningStore} from '@/store/useListeningStore';

const LISTENING_BLUE = '#2563EB';
const MAX_NAME_LENGTH = 25;
const MAX_QUICK_SCENARIOS = 5;

/** Danh sách emoji phổ biến cho quick pick */
const POPULAR_EMOJIS = [
  '📂', '📚', '💼', '🏢', '🎯', '🌍', '✈️', '🍕',
  '🏋️', '🎵', '🎮', '🏥', '🛒', '🎬', '📱', '🚗',
  '🇯🇵', '🇺🇸', '🇬🇧', '🇰🇷', '🇫🇷', '🇩🇪', '🇪🇸', '🇮🇹',
  '💰', '🧑‍💻', '🎓', '🏠', '⚽', '🎨',
];

interface CreateCategorySheetProps {
  visible: boolean;
  onClose: () => void;
  /** Callback khi tạo thành công — trả về category ID mới */
  onCreated?: (categoryId: string) => void;
}

/**
 * Mục đích: Bottom sheet form tạo category mới (inline trong TopicPicker)
 * Tham số đầu vào: visible, onClose, onCreated
 * Tham số đầu ra: JSX.Element (Modal)
 * Khi nào sử dụng: User nhấn nút [➕] cuối category tabs
 *
 * Flow:
 *   1. Chọn emoji icon
 *   2. Nhập tên nhóm (bắt buộc, max 25 ký tự)
 *   3. (Tuỳ chọn) Nhập tên scenarios nhanh → chip list
 *   4. Nhấn "✅ Tạo nhóm" → gọi API → đóng sheet
 */
export function CreateCategorySheet({
  visible,
  onClose,
  onCreated,
}: CreateCategorySheetProps) {
  const colors = useColors();
  const haptic = useHaptic();
  const addCustomCategory = useListeningStore(s => s.addCustomCategory);

  // Form state
  const [selectedIcon, setSelectedIcon] = useState('📂');
  const [categoryName, setCategoryName] = useState('');
  const [scenarioNames, setScenarioNames] = useState<string[]>([]);
  const [currentScenario, setCurrentScenario] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showEmojiGrid, setShowEmojiGrid] = useState(false);

  const nameInputRef = useRef<TextInput>(null);
  const scenarioInputRef = useRef<TextInput>(null);
  /** EC-01: Lock chống double-tap (useRef nhanh hơn setState) */
  const isCreatingRef = useRef(false);

  /**
   * Mục đích: Reset form về trạng thái ban đầu
   * Khi nào sử dụng: Sau khi tạo thành công hoặc đóng sheet
   */
  const resetForm = useCallback(() => {
    setSelectedIcon('📂');
    setCategoryName('');
    setScenarioNames([]);
    setCurrentScenario('');
    setShowEmojiGrid(false);
  }, []);

  /**
   * Mục đích: Thêm tên scenario vào chip list
   * Tham số đầu vào: không (lấy từ currentScenario state)
   * Khi nào sử dụng: User nhấn [+] hoặc Enter trong ô scenario
   */
  const handleAddScenario = useCallback(() => {
    const trimmed = currentScenario.trim();
    if (!trimmed) return;
    if (scenarioNames.length >= MAX_QUICK_SCENARIOS) {
      Alert.alert('Giới hạn', `Tối đa ${MAX_QUICK_SCENARIOS} chủ đề khi tạo nhanh.`);
      return;
    }
    if (scenarioNames.includes(trimmed)) {
      Alert.alert('Trùng tên', 'Chủ đề này đã có trong danh sách.');
      return;
    }
    setScenarioNames(prev => [...prev, trimmed]);
    setCurrentScenario('');
    // Focus lại ô input để tiếp tục gõ
    setTimeout(() => scenarioInputRef.current?.focus(), 100);
  }, [currentScenario, scenarioNames]);

  /**
   * Mục đích: Xoá 1 scenario chip khỏi danh sách
   * Tham số đầu vào: index — vị trí chip cần xoá
   * Khi nào sử dụng: User nhấn ╳ trên chip
   */
  const handleRemoveScenario = useCallback((index: number) => {
    setScenarioNames(prev => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Mục đích: Gọi API tạo category + batch scenarios
   * Tham số đầu vào: không (lấy từ form state)
   * Tham số đầu ra: void (gọi onCreated callback)
   * Khi nào sử dụng: User nhấn "✅ Tạo nhóm"
   */
  const handleCreate = useCallback(async () => {
    const trimmedName = categoryName.trim();
    if (!trimmedName) return;
    // EC-01: Guard chống double-tap bằng ref (nhanh hơn setState)
    if (isCreatingRef.current) return;
    isCreatingRef.current = true;

    setIsCreating(true);
    try {
      const result = await customCategoryApi.create({
        name: trimmedName,
        icon: selectedIcon,
        scenarioNames: scenarioNames.length > 0 ? scenarioNames : undefined,
      });

      haptic.success();
      // Cập nhật store local ngay (optimistic)
      addCustomCategory(result.category);

      // Gọi callback → TopicPicker sẽ auto-scroll tới tab mới
      onCreated?.(result.category.id);
      resetForm();
      onClose();
    } catch (error: any) {
      console.error('📂 [CreateCategory] Lỗi:', error);
      const message =
        error?.response?.data?.message || 'Không thể tạo nhóm. Vui lòng thử lại.';
      Alert.alert('Lỗi', message);
    } finally {
      setIsCreating(false);
      isCreatingRef.current = false;
    }
  }, [
    categoryName,
    selectedIcon,
    scenarioNames,
    haptic,
    addCustomCategory,
    onCreated,
    onClose,
    resetForm,
  ]);

  const canCreate = categoryName.trim().length > 0 && !isCreating;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={() => { resetForm(); onClose(); }}>
      <Pressable
        className="flex-1 justify-end"
        style={{backgroundColor: 'rgba(0,0,0,0.5)'}}
        onPress={() => { resetForm(); onClose(); }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {/* onStartShouldSetResponder chặn touch event bubble lên Pressable backdrop → tránh close sheet */}
          <View
            className="rounded-t-3xl p-6 pb-10"
            onStartShouldSetResponder={() => true}
            style={{
              backgroundColor: colors.background,
              borderTopWidth: 1,
              borderColor: colors.glassBorderStrong,
              // Glassmorphism
              shadowColor: '#000',
              shadowOffset: {width: 0, height: -4},
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 10,
            }}>
            {/* Pill Handle */}
            <View className="items-center mb-4">
              <View
                className="rounded-full"
                style={{
                  width: 40, height: 5,
                  backgroundColor: colors.neutrals400,
                  opacity: 0.5,
                }}
              />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between mb-5">
              <TouchableOpacity onPress={onClose} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Icon name="X" className="w-5 h-5" style={{color: colors.neutrals500}} />
              </TouchableOpacity>
              <AppText className="text-lg font-sans-bold" style={{color: colors.foreground}}>
                Tạo nhóm chủ đề
              </AppText>
              <View style={{width: 20}} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {/* Icon + Tên nhóm — cùng hàng */}
              <View className="mb-4">
                <AppText className="text-sm font-sans-medium mb-2" style={{color: colors.neutrals500}}>
                  Tên nhóm:
                </AppText>
                <View className="flex-row items-center">
                  {/* Icon picker button */}
                  <TouchableOpacity
                    className="rounded-xl items-center justify-center mr-3"
                    style={{
                      width: 48, height: 48,
                      backgroundColor: showEmojiGrid ? `${LISTENING_BLUE}08` : colors.glassBg,
                      borderWidth: 1,
                      borderColor: showEmojiGrid ? LISTENING_BLUE : colors.glassBorderStrong,
                    }}
                    onPress={() => {
                      haptic.light();
                      setShowEmojiGrid(!showEmojiGrid);
                    }}>
                    <AppText className="text-2xl">{selectedIcon}</AppText>
                  </TouchableOpacity>

                  {/* Name input */}
                  <View
                    className="flex-1 flex-row items-center rounded-xl px-4"
                    style={{
                      backgroundColor: colors.glassBg,
                      borderWidth: 1,
                      borderColor: categoryName.trim().length > 0 ? LISTENING_BLUE : colors.glassBorderStrong,
                      height: 48,
                    }}>
                    <TextInput
                      ref={nameInputRef}
                      className="flex-1 text-base"
                      style={{color: colors.foreground}}
                      placeholder="VD: Business English"
                      placeholderTextColor={colors.neutrals500}
                      value={categoryName}
                      onChangeText={text => setCategoryName(text.slice(0, MAX_NAME_LENGTH))}
                      maxLength={MAX_NAME_LENGTH}
                      autoCapitalize="words"
                      autoCorrect={false}
                      returnKeyType="done"
                    />
                    <AppText
                      className="text-xs"
                      style={{color: categoryName.length >= MAX_NAME_LENGTH ? '#EF4444' : colors.neutrals400}}>
                      {categoryName.length}/{MAX_NAME_LENGTH}
                    </AppText>
                  </View>
                </View>
              </View>

              {/* Emoji Grid (toggle — hiện bên dưới hàng icon+tên) */}
              {showEmojiGrid && (
                <View className="flex-row flex-wrap mb-4 p-3 rounded-xl" style={{backgroundColor: colors.glassBg}}>
                  {POPULAR_EMOJIS.map((emoji, idx) => (
                    <TouchableOpacity
                      key={idx}
                      className="items-center justify-center mb-2"
                      style={{
                        width: '12.5%', height: 40,
                        borderRadius: 8,
                        backgroundColor: emoji === selectedIcon ? `${LISTENING_BLUE}15` : 'transparent',
                      }}
                      onPress={() => {
                        haptic.light();
                        setSelectedIcon(emoji);
                        setShowEmojiGrid(false);
                      }}>
                      <AppText className="text-xl">{emoji}</AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Thêm chủ đề ngay (tuỳ chọn) */}
              <View className="mb-4">
                <AppText className="text-sm font-sans-medium mb-2" style={{color: colors.neutrals500}}>
                  Thêm chủ đề ngay{' '}
                  <AppText className="text-xs" style={{color: colors.neutrals400}}>
                    (tuỳ chọn)
                  </AppText>
                </AppText>

                {/* Input row */}
                <View
                  className="flex-row items-center rounded-xl px-4"
                  style={{
                    backgroundColor: colors.glassBg,
                    borderWidth: 1,
                    borderColor: colors.glassBorderStrong,
                    height: 44,
                  }}>
                  <TextInput
                    ref={scenarioInputRef}
                    className="flex-1 text-sm"
                    style={{color: colors.foreground}}
                    placeholder="Tên chủ đề..."
                    placeholderTextColor={colors.neutrals500}
                    value={currentScenario}
                    onChangeText={setCurrentScenario}
                    returnKeyType="done"
                    onSubmitEditing={handleAddScenario}
                    editable={scenarioNames.length < MAX_QUICK_SCENARIOS}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      haptic.light();
                      handleAddScenario();
                    }}
                    disabled={!currentScenario.trim() || scenarioNames.length >= MAX_QUICK_SCENARIOS}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <View
                      className="rounded-lg items-center justify-center"
                      style={{
                        width: 32, height: 32,
                        backgroundColor: currentScenario.trim() ? LISTENING_BLUE : colors.glassBg,
                      }}>
                      <Icon
                        name="Plus"
                        className="w-4 h-4"
                        style={{color: currentScenario.trim() ? '#FFFFFF' : colors.neutrals400}}
                      />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Chip list */}
                {scenarioNames.length > 0 && (
                  <View className="flex-row flex-wrap mt-2">
                    {scenarioNames.map((name, idx) => (
                      <View
                        key={idx}
                        className="flex-row items-center rounded-full px-3 py-1.5 mr-2 mb-2"
                        style={{
                          backgroundColor: `${LISTENING_BLUE}12`,
                          borderWidth: 1,
                          borderColor: `${LISTENING_BLUE}30`,
                        }}>
                        <AppText className="text-xs font-sans-medium mr-1" style={{color: LISTENING_BLUE}}>
                          📝 {name}
                        </AppText>
                        <TouchableOpacity
                          onPress={() => handleRemoveScenario(idx)}
                          hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}>
                          <Icon name="X" className="w-3 h-3" style={{color: LISTENING_BLUE}} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {scenarioNames.length >= MAX_QUICK_SCENARIOS && (
                  <AppText className="text-xs mt-1" style={{color: colors.neutrals400}}>
                    Đã đạt tối đa {MAX_QUICK_SCENARIOS} chủ đề. Thêm tiếp ở Settings.
                  </AppText>
                )}
              </View>
            </ScrollView>

            {/* CTA Button */}
            <TouchableOpacity
              className="rounded-2xl py-4 items-center"
              style={{
                backgroundColor: canCreate ? LISTENING_BLUE : colors.glassBg,
                opacity: canCreate ? 1 : 0.5,
              }}
              onPress={handleCreate}
              disabled={!canCreate}
              activeOpacity={0.8}>
              <AppText
                className="text-base font-sans-bold"
                style={{
                  color: canCreate ? '#FFFFFF' : colors.neutrals400,
                }}>
                {isCreating
                  ? 'Đang tạo...'
                  : `✅ Tạo nhóm${scenarioNames.length > 0 ? ` (${scenarioNames.length} chủ đề)` : ''}`}
              </AppText>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
