import React, {useState, useEffect, useCallback} from 'react';
import {TextInput, TouchableOpacity, View, ActivityIndicator} from 'react-native';
import {AppText, AppButton} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useToast} from '@/components/ui/ToastProvider';
import {useDialog} from '@/components/ui/DialogProvider';
import {customScenarioApi, CustomScenario} from '@/services/api/customScenarios';

interface CustomScenarioInputProps {
  /** Callback khi user muốn dùng ngay 1 scenario */
  onQuickUse: (name: string, description: string) => void;
  /** Callback khi user nhấn nút đóng panel */
  onClose?: () => void;
  disabled?: boolean;
}

/**
 * Mục đích: Component tạo và quản lý kịch bản tuỳ chỉnh (sync backend)
 * Tham số đầu vào:
 *   - onQuickUse: callback khi user nhấn "Sử dụng ngay"
 *   - onClose: callback đóng panel (nút X)
 *   - disabled: có disable không
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: TopicPicker → tab "Custom" → hiện component này
 *   - Load danh sách từ backend khi mount
 *   - CRUD sync realtime với server
 */
export default function CustomScenarioInput({
  onQuickUse,
  onClose,
  disabled = false,
}: CustomScenarioInputProps) {
  const colors = useColors();
  const {showSuccess, showWarning, showError} = useToast();
  const {showConfirm} = useDialog();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [savedScenarios, setSavedScenarios] = useState<CustomScenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Mục đích: Load danh sách custom scenarios từ backend
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Component mount + sau mỗi thao tác CRUD
   */
  const loadScenarios = useCallback(async () => {
    try {
      const data = await customScenarioApi.list();
      setSavedScenarios(data);
    } catch (error) {
      console.log('⚠️ [CustomScenario] Lỗi load danh sách:', error);
      // Không show error toast — có thể user chưa đăng nhập
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScenarios();
  }, [loadScenarios]);

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
   * Mục đích: Lưu scenario qua backend API
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "💾 Lưu lại"
   */
  const handleSave = async () => {
    if (!name.trim()) {
      showWarning('Chưa nhập tên', 'Nhập tên kịch bản để lưu vào bộ sưu tập');
      return;
    }
    try {
      setIsSaving(true);
      const created = await customScenarioApi.create({
        name: name.trim(),
        description: description.trim(),
      });
      setSavedScenarios(prev => [created, ...prev]);
      showSuccess('Đã lưu kịch bản', `"${name.trim()}" đã được thêm vào bộ sưu tập`);
      setName('');
      setDescription('');
    } catch (error) {
      console.error('❌ [CustomScenario] Lỗi lưu:', error);
      showError('Lỗi lưu kịch bản', 'Vui lòng thử lại sau');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Mục đích: Xoá 1 saved scenario qua backend API
   * Tham số đầu vào: id (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn biểu tượng 🗑️ trên scenario đã lưu
   */
  const handleDelete = (id: string) => {
    const scenario = savedScenarios.find(s => s.id === id);
    showConfirm(
      'Xoá kịch bản?',
      `Bạn có chắc muốn xoá "${scenario?.name || 'kịch bản này'}"?`,
      async () => {
        try {
          await customScenarioApi.delete(id);
          setSavedScenarios(prev => prev.filter(s => s.id !== id));
          showSuccess('Đã xoá', 'Kịch bản đã được xoá');
        } catch (error) {
          console.error('❌ [CustomScenario] Lỗi xoá:', error);
          showError('Lỗi xoá kịch bản', 'Vui lòng thử lại');
        }
      },
    );
  };

  /**
   * Mục đích: Toggle favorite cho 1 saved scenario qua backend API
   * Tham số đầu vào: id (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn biểu tượng ⭐ trên scenario đã lưu
   */
  const handleToggleFavorite = async (id: string) => {
    try {
      const updated = await customScenarioApi.toggleFavorite(id);
      setSavedScenarios(prev =>
        prev.map(s => (s.id === id ? updated : s)),
      );
    } catch (error) {
      console.error('❌ [CustomScenario] Lỗi toggle favorite:', error);
    }
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
          style={{color: colors.foreground}}
          placeholder="Tên kịch bản..."
          placeholderTextColor={colors.neutrals500}
          value={name}
          onChangeText={setName}
          editable={!disabled && !isSaving}
          maxLength={100}
          accessibilityLabel="Nhập tên kịch bản tuỳ chỉnh"
        />

        <TextInput
          className="border border-neutrals700 rounded-xl px-4 py-2.5 text-base mb-3 min-h-[60px]"
          style={{color: colors.foreground, textAlignVertical: 'top'}}
          placeholder="Mô tả chi tiết kịch bản..."
          placeholderTextColor={colors.neutrals500}
          value={description}
          onChangeText={setDescription}
          editable={!disabled && !isSaving}
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
            disabled={disabled || !name.trim() || isSaving}
            accessibilityLabel="Sử dụng kịch bản ngay mà không lưu">
            ⚡ Sử dụng ngay
          </AppButton>
          <AppButton
            variant="outline"
            className="flex-1 rounded-xl"
            onPress={handleSave}
            disabled={disabled || !name.trim() || isSaving}
            loading={isSaving}
            accessibilityLabel="Lưu kịch bản vào bộ sưu tập">
            💾 Lưu lại
          </AppButton>
        </View>
      </View>

      {/* Danh sách đã lưu */}
      {isLoading ? (
        <View className="items-center py-4">
          <ActivityIndicator size="small" />
          <AppText className="text-neutrals400 text-xs mt-2">
            Đang tải kịch bản...
          </AppText>
        </View>
      ) : savedScenarios.length > 0 ? (
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
      ) : null}
    </View>
  );
}
