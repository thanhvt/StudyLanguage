import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';
import {apiClient} from '@/services/api/client';

// =======================
// Types
// =======================

interface CustomScenario {
  /** ID unique */
  id: string;
  /** Tên kịch bản */
  name: string;
  /** Mô tả */
  description: string;
  /** Số lần sử dụng */
  usageCount: number;
  /** Đã yêu thích */
  isFavorite: boolean;
  /** Ngày tạo */
  createdAt: string;
}

// =======================
// Screen
// =======================

/**
 * Mục đích: Quản lý Custom Scenarios cho Speaking (CRUD + Favorites)
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   ConfigScreen → navigate CustomScenarios
 *   User tạo/sửa/xóa kịch bản nói → chọn kịch bản → quay lại Config
 */
export default function CustomScenariosScreen() {
  const navigation = useNavigation<any>();
  const colors = useColors();
  const speakingColor = SKILL_COLORS.speaking.dark;

  // State
  const [scenarios, setScenarios] = useState<CustomScenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // =======================
  // Data fetching
  // =======================

  /**
   * Mục đích: Tải danh sách custom scenarios từ API
   * Tham số đầu vào: không
   * Tham số đầu ra: void (set state scenarios)
   * Khi nào sử dụng: Khi screen mount hoặc sau khi tạo/xóa scenario
   */
  const fetchScenarios = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/custom-scenarios');
      const data = response.data?.scenarios || response.data || [];
      setScenarios(
        data.map((s: any) => ({
          id: s.id,
          name: s.name || s.title,
          description: s.description || '',
          usageCount: s.usageCount || s.usage_count || 0,
          isFavorite: s.isFavorite || s.is_favorite || false,
          createdAt: s.createdAt || s.created_at || '',
        })),
      );
      console.log(`✅ [CustomScenarios] Đã tải ${data.length} kịch bản`);
    } catch (err) {
      console.error('❌ [CustomScenarios] Lỗi tải:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  // =======================
  // CRUD actions
  // =======================

  /**
   * Mục đích: Tạo kịch bản mới
   * Tham số đầu vào: không (lấy từ state newName, newDescription)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Lưu" trên form tạo mới
   */
  const handleCreate = async () => {
    if (!newName.trim()) return;

    try {
      setIsCreating(true);
      await apiClient.post('/custom-scenarios', {
        name: newName.trim(),
        description: newDescription.trim(),
        type: 'speaking',
      });
      console.log('✅ [CustomScenarios] Tạo mới thành công:', newName);
      setNewName('');
      setNewDescription('');
      setShowCreateForm(false);
      fetchScenarios();
    } catch (err) {
      console.error('❌ [CustomScenarios] Lỗi tạo:', err);
      Alert.alert('Lỗi', 'Không thể tạo kịch bản. Thử lại nhé!');
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Mục đích: Toggle yêu thích
   * Tham số đầu vào: id (string) — ID scenario
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap icon star
   */
  const handleToggleFavorite = async (id: string) => {
    try {
      await apiClient.patch(`/custom-scenarios/${id}/favorite`);
      setScenarios(prev =>
        prev.map(s => (s.id === id ? {...s, isFavorite: !s.isFavorite} : s)),
      );
      console.log('⭐ [CustomScenarios] Toggle favorite:', id);
    } catch (err) {
      console.error('❌ [CustomScenarios] Lỗi toggle favorite:', err);
    }
  };

  /**
   * Mục đích: Xóa kịch bản
   * Tham số đầu vào: id (string), name (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User swipe/long-press → xóa
   */
  const handleDelete = (id: string, name: string) => {
    Alert.alert('Xóa kịch bản?', `Bạn muốn xóa "${name}" không?`, [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/custom-scenarios/${id}`);
            setScenarios(prev => prev.filter(s => s.id !== id));
            console.log('🗑️ [CustomScenarios] Đã xóa:', name);
          } catch (err) {
            console.error('❌ [CustomScenarios] Lỗi xóa:', err);
          }
        },
      },
    ]);
  };

  /**
   * Mục đích: Chọn kịch bản để sử dụng
   * Tham số đầu vào: scenario (CustomScenario)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào scenario card → navigate về Config với topic
   */
  const handleSelectScenario = (scenario: CustomScenario) => {
    // Set topic rồi goBack
    navigation.navigate('Config', {topic: scenario.name});
  };

  // =======================
  // Render
  // =======================

  /**
   * Mục đích: Render 1 scenario card
   * Tham số đầu vào: item (CustomScenario)
   * Tham số đầu ra: JSX.Element
   * Khi nào sử dụng: FlatList renderItem
   */
  const renderScenarioCard = ({item}: {item: CustomScenario}) => (
    <TouchableOpacity
      onPress={() => handleSelectScenario(item)}
      onLongPress={() => handleDelete(item.id, item.name)}
      activeOpacity={0.7}
      style={[styles.card, {backgroundColor: colors.surface}]}>
      <View style={styles.cardHeader}>
        <View style={{flex: 1}}>
          <AppText variant="body" weight="semibold" raw>
            {item.name}
          </AppText>
          {item.description ? (
            <AppText
              variant="caption"
              className="text-neutrals400 mt-1"
              numberOfLines={2}
              raw>
              {item.description}
            </AppText>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={() => handleToggleFavorite(item.id)}
          style={styles.favBtn}>
          <Icon
            name={item.isFavorite ? 'Star' : 'Star'}
            className="w-5 h-5"
            style={{color: item.isFavorite ? '#F59E0B' : colors.neutrals400}}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardFooter}>
        <AppText variant="caption" className="text-neutrals400" raw>
          Đã dùng {item.usageCount} lần
        </AppText>
        <Icon
          name="ChevronRight"
          className="w-4 h-4"
          style={{color: colors.neutrals400}}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-4">
        <AppButton
          variant="ghost"
          size="icon"
          onPress={() => navigation.goBack()}
          icon={<Icon name="ArrowLeft" className="w-5 h-5 text-foreground" />}>
          {''}
        </AppButton>
        <View className="flex-1 items-center">
          <AppText variant="heading3" weight="bold">
            📋 Kịch bản tùy chỉnh
          </AppText>
        </View>
        <AppButton
          variant="ghost"
          size="icon"
          onPress={() => setShowCreateForm(!showCreateForm)}
          icon={
            <Icon
              name={showCreateForm ? 'X' : 'Plus'}
              className="w-5 h-5"
              style={{color: speakingColor}}
            />
          }>
          {''}
        </AppButton>
      </View>

      {/* Form tạo mới */}
      {showCreateForm && (
        <View style={[styles.createForm, {backgroundColor: colors.surface}]}>
          <AppInput
            label="Tên kịch bản"
            placeholder="VD: Đặt phòng khách sạn"
            value={newName}
            onChangeText={setNewName}
          />
          <AppInput
            label="Mô tả (tuỳ chọn)"
            placeholder="Tình huống cụ thể..."
            value={newDescription}
            onChangeText={setNewDescription}
            multiline
          />
          <AppButton
            variant="primary"
            size="sm"
            onPress={handleCreate}
            disabled={!newName.trim()}
            loading={isCreating}
            style={{backgroundColor: speakingColor, marginTop: 8}}>
            💾 Lưu kịch bản
          </AppButton>
        </View>
      )}

      {/* Danh sách scenarios */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={speakingColor} />
        </View>
      ) : (
        <FlatList
          data={scenarios}
          renderItem={renderScenarioCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center py-20">
              <AppText
                variant="body"
                className="text-neutrals400 text-center"
                raw>
                Chưa có kịch bản nào.{'\n'}Nhấn + để tạo mới!
              </AppText>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(150,150,150,0.15)',
  },
  favBtn: {
    padding: 4,
    marginLeft: 8,
  },
  createForm: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
});
