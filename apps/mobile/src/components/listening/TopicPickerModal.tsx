import React, {useState} from 'react';
import {Modal, ScrollView, TouchableOpacity, View} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import TopicPicker from './TopicPicker';
import CustomScenarioInput from './CustomScenarioInput';
import {useListeningStore} from '@/store/useListeningStore';
import {useHaptic} from '@/hooks/useHaptic';
import {useColors} from '@/hooks/useColors';
import {getRandomScenario} from '@/data/topic-data';

const LISTENING_BLUE = '#2563EB';

interface TopicPickerModalProps {
  /** Modal có đang visible không */
  visible: boolean;
  /** Callback đóng modal */
  onClose: () => void;
  /** Disabled khi đang generate */
  disabled?: boolean;
}

/**
 * Mục đích: Full-screen modal chứa TopicPicker — redesigned v2
 * Tham số đầu vào:
 *   - visible: boolean hiện/ẩn modal
 *   - onClose: callback đóng modal
 *   - disabled: có disable không
 * Tham số đầu ra: JSX.Element (Modal)
 * Khi nào sử dụng: ConfigScreen → nhấn "Chọn kịch bản >" → mở modal này
 *   - Pill handle cho swipe gesture
 *   - Tabs: ⭐ Yêu thích, 💻 IT, 🌍 Daily, 👤 Personal, ✨ Tuỳ chỉnh
 *   - Tab "Tuỳ chỉnh" → render CustomScenarioInput inline (không navigate ra)
 *   - Sticky footer: "🎲 Gợi ý ngẫu nhiên" khi chưa chọn, "✅ Xác nhận: {name}" khi đã chọn
 *   - Chọn scenario KHÔNG auto-close — user phải nhấn Confirm
 */
export default function TopicPickerModal({
  visible,
  onClose,
  disabled = false,
}: TopicPickerModalProps) {
  const insets = useSafeAreaInsets();
  const haptic = useHaptic();
  const colors = useColors();
  const selectedTopic = useListeningStore(state => state.selectedTopic);
  const selectedCategory = useListeningStore(state => state.selectedCategory);
  const setSelectedTopic = useListeningStore(state => state.setSelectedTopic);
  const setSelectedCategory = useListeningStore(state => state.setSelectedCategory);
  const setSelectedSubCategory = useListeningStore(state => state.setSelectedSubCategory);

  // Kiểm tra tab "Tuỳ chỉnh" đang active
  const isCustomTab = selectedCategory === 'custom';

  /**
   * Mục đích: Xử lý quick use từ CustomScenarioInput
   * Tham số đầu vào: name, description (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: Tab Tuỳ chỉnh → CustomScenarioInput → "Sử dụng ngay"
   */
  const handleCustomQuickUse = (name: string, description: string) => {
    setSelectedTopic(
      {id: `custom-${Date.now()}`, name, description},
      'custom',
      '',
    );
    haptic.success();
    onClose();
  };

  /**
   * Mục đích: Chọn random scenario → select + keep modal open
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "🎲 Gợi ý ngẫu nhiên" khi chưa chọn scenario
   */
  const handleRandomScenario = () => {
    haptic.medium();
    const random = getRandomScenario();
    if (random) {
      setSelectedTopic(random.scenario, random.category.id, random.subCategory.id);
      setSelectedCategory(random.category.id);
      setSelectedSubCategory(random.subCategory.id);
    }
  };

  /**
   * Mục đích: Xác nhận chọn scenario → đóng modal
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút "✅ Xác nhận" ở sticky footer
   */
  const handleConfirm = () => {
    haptic.success();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View
        className="flex-1"
        style={{paddingTop: 8, backgroundColor: colors.background}}
        >

        {/* ======================== */}
        {/* Header — X trái, Title giữa, ✓ phải (khi đã chọn) */}
        {/* ======================== */}
        <View className="flex-row items-center justify-between px-6 py-3">
          {/* Nút X đóng — bên trái */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityLabel="Đóng danh sách kịch bản"
            accessibilityRole="button"
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Icon name="X" className="w-6 h-6" style={{color: colors.neutrals400}} />
          </TouchableOpacity>

          {/* Title — giữa */}
          <AppText className="font-sans-bold text-lg" style={{color: colors.foreground}}>
            Chọn chủ đề
          </AppText>

          {/* Nút ✓ xác nhận — bên phải, chỉ hiện khi đã chọn topic */}
          {selectedTopic ? (
            <TouchableOpacity
              onPress={handleConfirm}
              activeOpacity={0.7}
              accessibilityLabel="Xác nhận chọn kịch bản"
              accessibilityRole="button"
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Icon name="Check" className="w-6 h-6 text-primary" />
            </TouchableOpacity>
          ) : (
            <View style={{width: 24}} />
          )}
        </View>

        {/* ======================== */}
        {/* Content — TopicPicker hoặc CustomScenarioInput */}
        {/* ======================== */}
        <ScrollView
          className="flex-1 px-6 pt-2"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 100}}>
          <TopicPicker
            disabled={disabled}
            showCategoryBadge={true}
          />

          {/* Tab "Tuỳ chỉnh" → inline CustomScenarioInput */}
          {isCustomTab && (
            <View className="mt-2">
              <CustomScenarioInput
                onQuickUse={handleCustomQuickUse}
                disabled={disabled}
              />
            </View>
          )}
        </ScrollView>

        {/* ======================== */}
        {/* Sticky Footer — luôn hiện CTA */}
        {/* ======================== */}
        <View
          className="px-6 pt-3"
          style={{paddingBottom: Math.max(insets.bottom, 16)}}>
          {selectedTopic ? (
            // Đã chọn → nút Xác nhận — Primary CTA
            <TouchableOpacity
              className="rounded-2xl py-4 items-center"
              style={{
                backgroundColor: LISTENING_BLUE,
                shadowColor: LISTENING_BLUE,
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.35,
                shadowRadius: 12,
                elevation: 8,
              }}
              onPress={handleConfirm}
              activeOpacity={0.8}
              accessibilityLabel={`Xác nhận chọn ${selectedTopic.name}`}
              accessibilityRole="button">
              <AppText className="font-sans-bold text-base" style={{color: '#FFFFFF'}}>
                Xác nhận: {selectedTopic.name.length > 25 ? selectedTopic.name.slice(0, 25) + '...' : selectedTopic.name}
              </AppText>
            </TouchableOpacity>
          ) : (
            // Chưa chọn → nút Gợi ý ngẫu nhiên — Secondary
            <TouchableOpacity
              className="rounded-2xl py-4 items-center"
              style={{
                borderWidth: 1.5,
                borderColor: `${LISTENING_BLUE}30`,
                backgroundColor: `${LISTENING_BLUE}12`,
              }}
              onPress={handleRandomScenario}
              activeOpacity={0.8}
              accessibilityLabel="Gợi ý kịch bản ngẫu nhiên"
              accessibilityRole="button">
              <AppText className="font-sans-bold text-base" style={{color: LISTENING_BLUE}}>
                🎲 Gợi ý ngẫu nhiên
              </AppText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
