import React, {useState, useCallback} from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {AppText, AppButton} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {useInsets} from '@/hooks/useInsets';
import {useListeningStore} from '@/store/useListeningStore';
import {useToast} from '@/components/ui/ToastProvider';

// ========================
// Màu sắc
// ========================
const LISTENING_BLUE = '#2563EB';
const LISTENING_ORANGE = '#F97316';

// ========================
// Types
// ========================
interface CustomScenario {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

/**
 * Mục đích: Màn hình quản lý Custom Scenarios — tạo/xem/xóa kịch bản tùy chỉnh
 * Tham số đầu vào: navigation (React Navigation props)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ConfigScreen → nhấn nút "+" → navigate tới đây
 *   - CRUD kịch bản tùy chỉnh
 *   - Quick Use → set topic + navigate back
 *   - Swipe to delete (simulated with icon button)
 */
export default function CustomScenariosScreen({
  navigation,
}: {
  navigation: any;
}) {
  const [scenarios, setScenarios] = useState<CustomScenario[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const setSelectedTopic = useListeningStore(state => state.setSelectedTopic);

  const colors = useColors();
  const haptic = useHaptic();
  const insets = useInsets();
  const {showSuccess, showError} = useToast();

  // Lọc theo search query
  const filteredScenarios = scenarios.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  /**
   * Mục đích: Tạo scenario mới
   * Tham số đầu vào: không (dùng local state newName, newDesc)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User submit form "Tạo scenario mới"
   */
  const handleCreate = useCallback(() => {
    if (!newName.trim()) {return;}
    const newScenario: CustomScenario = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim() || 'Kịch bản tùy chỉnh',
      createdAt: new Date().toISOString(),
    };
    setScenarios(prev => [newScenario, ...prev]);
    setNewName('');
    setNewDesc('');
    setShowCreate(false);
    haptic.success();
    showSuccess('Đã tạo kịch bản', newScenario.name);
  }, [newName, newDesc, haptic, showSuccess]);

  /**
   * Mục đích: Quick Use — chọn scenario và quay lại ConfigScreen
   * Tham số đầu vào: scenario (CustomScenario)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Dùng ngay" trên 1 scenario card
   */
  const handleQuickUse = useCallback((scenario: CustomScenario) => {
    setSelectedTopic(
      {id: scenario.id, name: scenario.name, description: scenario.description},
      'custom',
      '',
    );
    haptic.medium();
    navigation.goBack();
  }, [setSelectedTopic, haptic, navigation]);

  /**
   * Mục đích: Xóa scenario
   * Tham số đầu vào: id (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút xóa trên 1 scenario
   */
  const handleDelete = useCallback((id: string) => {
    Alert.alert(
      'Xóa kịch bản?',
      'Hành động này không thể hoàn tác.',
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setScenarios(prev => prev.filter(s => s.id !== id));
            haptic.medium();
            showSuccess('Đã xóa kịch bản');
          },
        },
      ],
    );
  }, [haptic, showSuccess]);

  return (
    <View className="flex-1" style={{backgroundColor: colors.background}}>
      {/* Header */}
      <View className="px-6 pt-safe-offset-4 pb-3 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2"
          accessibilityLabel="Quay lại"
          accessibilityRole="button">
          <Icon name="ArrowLeft" className="w-6 h-6" style={{color: colors.foreground}} />
        </TouchableOpacity>
        <AppText className="font-sans-bold text-lg" style={{color: colors.foreground}}>
          Kịch bản tùy chỉnh
        </AppText>
        <TouchableOpacity
          onPress={() => {
            haptic.light();
            setShowCreate(true);
          }}
          className="p-2 -mr-2"
          accessibilityLabel="Tạo kịch bản mới"
          accessibilityRole="button">
          <Icon name="Plus" className="w-5 h-5" style={{color: LISTENING_BLUE}} />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View className="px-6 mb-4">
        <View className="flex-row items-center rounded-xl px-4 py-2.5" style={{backgroundColor: colors.neutrals900, borderWidth: 1, borderColor: colors.neutrals800}}>
          <Icon name="Search" className="w-4 h-4 mr-2" style={{color: colors.neutrals500}} />
          <TextInput
            className="flex-1 text-sm"
            style={{color: colors.foreground}}
            placeholder="Tìm kịch bản..."
            placeholderTextColor={colors.neutrals500}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Scenario list */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {filteredScenarios.length === 0 ? (
          <View className="items-center py-16">
            <AppText className="text-3xl mb-3">📝</AppText>
            <AppText className="text-sm text-center" style={{color: colors.neutrals400}}>
              {searchQuery ? 'Không tìm thấy kịch bản' : 'Chưa có kịch bản nào.\nNhấn + để tạo mới!'}
            </AppText>
          </View>
        ) : (
          <View className="gap-3 pb-6">
            {filteredScenarios.map(scenario => (
              <View
                key={scenario.id}
                className="rounded-xl p-4"
                style={{backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border}}>
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-3">
                    <AppText className="font-sans-bold text-sm" style={{color: colors.foreground}}>
                      {scenario.name}
                    </AppText>
                    <AppText className="text-xs mt-0.5" style={{color: colors.neutrals400}} numberOfLines={2}>
                      {scenario.description}
                    </AppText>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(scenario.id)}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    accessibilityLabel="Xóa kịch bản"
                    accessibilityRole="button">
                    <Icon name="Trash2" className="w-4 h-4 text-red-400" />
                  </TouchableOpacity>
                </View>
                {/* Action buttons */}
                <View className="flex-row gap-2 mt-3">
                  <TouchableOpacity
                    className="flex-1 py-2 rounded-lg items-center"
                    style={{borderWidth: 1, borderColor: colors.neutrals700}}
                    onPress={() => handleQuickUse(scenario)}
                    accessibilityLabel="Dùng ngay"
                    accessibilityRole="button">
                    <AppText className="text-xs font-sans-medium" style={{color: colors.foreground}}>
                      Dùng ngay
                    </AppText>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create form modal (mở từ bottom) */}
      {showCreate && (
        <View className="absolute inset-0 bg-black/50 justify-end">
          <View
            className="rounded-t-3xl p-6"
            style={{paddingBottom: Math.max(insets.bottom, 20), backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border}}>
            <AppText className="font-sans-bold text-lg mb-4" style={{color: colors.foreground}}>
              Tạo kịch bản mới
            </AppText>
            <TextInput
              className="rounded-xl px-4 py-3 text-sm mb-3"
              style={{color: colors.foreground, backgroundColor: colors.neutrals900, borderWidth: 1, borderColor: colors.neutrals800}}
              placeholder="Tên kịch bản..."
              placeholderTextColor={colors.neutrals500}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <TextInput
              className="rounded-xl px-4 py-3 text-sm mb-4"
              style={{color: colors.foreground, minHeight: 80, textAlignVertical: 'top', backgroundColor: colors.neutrals900, borderWidth: 1, borderColor: colors.neutrals800}}
              placeholder="Mô tả chi tiết (tuỳ chọn)..."
              placeholderTextColor={colors.neutrals500}
              value={newDesc}
              onChangeText={setNewDesc}
              multiline
              numberOfLines={3}
            />
            <View className="flex-row gap-3">
              <AppButton
                variant="outline"
                size="default"
                className="flex-1"
                onPress={() => setShowCreate(false)}>
                Hủy
              </AppButton>
              <AppButton
                variant="primary"
                size="default"
                className="flex-1"
                style={{backgroundColor: LISTENING_BLUE}}
                onPress={handleCreate}
                disabled={!newName.trim()}>
                Tạo
              </AppButton>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
