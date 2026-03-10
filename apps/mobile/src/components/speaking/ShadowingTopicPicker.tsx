import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import TopicPicker from '@/components/listening/TopicPicker';
import {useListeningStore} from '@/store/useListeningStore';
import {useShadowingStore} from '@/store/useShadowingStore';

// =======================
// Types
// =======================

interface ShadowingTopicPickerProps {
  /** Disabled state (khi đang loading) */
  disabled?: boolean;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Wrapper bridge TopicPicker (Listening) → useShadowingStore
 *   TopicPicker ghi vào useListeningStore, hook này sync ngược về Shadowing store
 * Tham số đầu vào: disabled
 * Tham số đầu ra: JSX.Element — TopicPicker component
 * Khi nào sử dụng:
 *   - ShadowingConfigScreen: section "Chọn chủ đề" — reuse TopicPicker UI
 *   - User chọn scenario → sync vào useShadowingStore.config.topic
 */
export default function ShadowingTopicPicker({
  disabled = false,
}: ShadowingTopicPickerProps) {
  // Đọc selected topic từ Listening store (TopicPicker ghi vào đây)
  const listeningTopic = useListeningStore(s => s.selectedTopic);

  // Ghi vào Shadowing store
  const setTopic = useShadowingStore(s => s.setTopic);

  /**
   * Mục đích: Sync topic từ Listening store → Shadowing store
   * Tham số đầu vào: không (reactive effect)
   * Tham số đầu ra: void
   * Khi nào sử dụng: Mỗi khi user chọn/bỏ chọn scenario trong TopicPicker
   */
  useEffect(() => {
    setTopic(listeningTopic ?? null);
  }, [listeningTopic, setTopic]);

  /**
   * Mục đích: Callback khi user chọn scenario (optional log/analytics)
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: TopicPicker → onScenarioSelected
   */
  const handleScenarioSelected = useCallback(() => {
    console.log('🔊 [ShadowingPicker] User đã chọn topic cho Shadowing');
  }, []);

  return (
    <View style={{flex: 1}}>
      <TopicPicker
        disabled={disabled}
        onScenarioSelected={handleScenarioSelected}
        showCategoryBadge={false}
      />
    </View>
  );
}
