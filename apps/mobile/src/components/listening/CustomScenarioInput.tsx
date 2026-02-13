import React, {useState} from 'react';
import {TextInput, TouchableOpacity, View} from 'react-native';
import {AppText, AppButton} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useToast} from '@/components/ui/ToastProvider';
import {useDialog} from '@/components/ui/DialogProvider';

/** Custom scenario item */
interface CustomScenarioItem {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  createdAt: number;
}

interface CustomScenarioInputProps {
  /** Callback khi user muốn dùng ngay 1 scenario */
  onQuickUse: (name: string, description: string) => void;
  /** Callback khi user nhấn nút đóng panel */
  onClose?: () => void;
  disabled?: boolean;
}

/**
 * Mục đích: Component tạo và quản lý kịch bản tuỳ chỉnh
 * Tham số đầu vào:
 *   - onQuickUse: callback khi user nhấn "Sử dụng ngay"
 *   - onClose: callback đóng panel (nút X)
 *   - disabled: có disable không
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: TopicPicker → tab "Custom" → hiện component này
 *   - User tạo scenario mới (tên + mô tả)
 *   - "Sử dụng ngay" → dùng không lưu
 *   - "Lưu lại" → lưu vào local (tạm thời, chờ backend)
 */
export default function CustomScenarioInput({
  onQuickUse,
  onClose,
  disabled = false,
}: CustomScenarioInputProps) {
  const colors = useColors();
  const {showSuccess, showWarning} = useToast();
  const {showConfirm} = useDialog();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  // Stub: lưu local state (chưa có DB)
  const [savedScenarios, setSavedScenarios] = useState<CustomScenarioItem[]>(
    [],
  );

  /**
   * Mục đích: Dùng ngay scenario mà không lưu
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "⚡ Sử dụng ngay"
   */
  const handleQuickUse = () => {
    if (!name.trim()) {
      showWarning('Chưa nhập tên', 'Nhập tên kịch bản để sử dụng ngay');
      return;
    }
    onQuickUse(name.trim(), description.trim());
    setName('');
    setDescription('');
  };

  /**
   * Mục đích: Lưu scenario vào local (stub cho tương lai)
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "💾 Lưu lại"
   */
  const handleSave = () => {
    if (!name.trim()) {
      showWarning('Chưa nhập tên', 'Nhập tên kịch bản để lưu vào bộ sưu tập');
      return;
    }
    const newScenario: CustomScenarioItem = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      isFavorite: false,
      createdAt: Date.now(),
    };
    setSavedScenarios(prev => [newScenario, ...prev]);
    showSuccess('Đã lưu kịch bản', `"${name.trim()}" đã được thêm vào bộ sưu tập`);
    setName('');
    setDescription('');
  };

  /**
   * Mục đích: Xoá 1 saved scenario
   * Tham số đầu vào: id (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn biểu tượng 🗑️ trên scenario đã lưu
   */
  const handleDelete = (id: string) => {
    const scenario = savedScenarios.find(s => s.id === id);
    showConfirm(
      'Xoá kịch bản?',
      `Bạn có chắc muốn xoá "${scenario?.name || 'kịch bản này'}"?`,
      () => {
        setSavedScenarios(prev => prev.filter(s => s.id !== id));
      },
    );
  };

  /**
   * Mục đích: Toggle favorite cho 1 saved scenario
   * Tham số đầu vào: id (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn biểu tượng ⭐ trên scenario đã lưu
   */
  const handleToggleFavorite = (id: string) => {
    setSavedScenarios(prev =>
      prev.map(s => (s.id === id ? {...s, isFavorite: !s.isFavorite} : s)),
    );
  };

  return (
    <View>
      {/* Form tạo mới */}
      <View className="bg-neutrals900 rounded-2xl p-4 mb-4">
        {/* Header có nút đóng */}
        <View className="flex-row items-center justify-between mb-3">
          <AppText className="text-foreground font-sans-semibold text-sm">
            ✨ Tạo kịch bản mới
          </AppText>
          {onClose && (
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              accessibilityLabel="Đóng panel tạo kịch bản"
              accessibilityRole="button"
              className="p-1.5 rounded-full bg-neutrals800">
              <Icon name="X" className="w-4 h-4 text-neutrals400" />
            </TouchableOpacity>
          )}
        </View>

        <TextInput
          className="border border-neutrals700 rounded-xl px-4 py-2.5 text-base mb-2"
          style={{color: '#1a1a1a'}}
          placeholder="Tên kịch bản..."
          placeholderTextColor={colors.neutrals500}
          value={name}
          onChangeText={setName}
          editable={!disabled}
          maxLength={100}
          accessibilityLabel="Nhập tên kịch bản tuỳ chỉnh"
        />

        <TextInput
          className="border border-neutrals700 rounded-xl px-4 py-2.5 text-base mb-3 min-h-[60px]"
          style={{color: '#1a1a1a', textAlignVertical: 'top'}}
          placeholder="Mô tả chi tiết kịch bản..."
          placeholderTextColor={colors.neutrals500}
          value={description}
          onChangeText={setDescription}
          editable={!disabled}
          multiline
          numberOfLines={2}
          maxLength={300}
          accessibilityLabel="Mô tả chi tiết kịch bản tuỳ chỉnh"
        />

        <View className="flex-row gap-2">
          <AppButton
            variant="primary"
            className="flex-1 rounded-xl"
            onPress={handleQuickUse}
            disabled={disabled || !name.trim()}
            accessibilityLabel="Sử dụng kịch bản ngay mà không lưu">
            ⚡ Sử dụng ngay
          </AppButton>
          <AppButton
            variant="outline"
            className="flex-1 rounded-xl"
            onPress={handleSave}
            disabled={disabled || !name.trim()}
            accessibilityLabel="Lưu kịch bản vào bộ sưu tập">
            💾 Lưu lại
          </AppButton>
        </View>
      </View>

      {/* Danh sách đã lưu */}
      {savedScenarios.length > 0 && (
        <View>
          <AppText className="text-neutrals400 text-xs mb-2">
            Đã lưu ({savedScenarios.length})
          </AppText>
          {savedScenarios.map(scenario => (
            <TouchableOpacity
              key={scenario.id}
              className="flex-row items-center bg-neutrals900 rounded-xl px-4 py-3 mb-1.5"
              onPress={() =>
                onQuickUse(scenario.name, scenario.description)
              }
              activeOpacity={0.7}>
              <View className="flex-1 mr-3">
                <AppText className="text-foreground text-sm font-sans-medium">
                  {scenario.name}
                </AppText>
                {scenario.description ? (
                  <AppText
                    className="text-neutrals400 text-xs mt-0.5"
                    numberOfLines={1}>
                    {scenario.description}
                  </AppText>
                ) : null}
              </View>

              {/* Favorite */}
              <TouchableOpacity
                onPress={() => handleToggleFavorite(scenario.id)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                className="mr-2">
                <AppText
                  className={
                    scenario.isFavorite ? 'text-warning' : 'text-neutrals600'
                  }>
                  {scenario.isFavorite ? '⭐' : '☆'}
                </AppText>
              </TouchableOpacity>

              {/* Delete */}
              <TouchableOpacity
                onPress={() => handleDelete(scenario.id)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Icon name="Trash2" className="w-4 h-4 text-destructive" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
