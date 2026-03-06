import React, {useCallback, useEffect, useState} from 'react';
import {
  ActionSheetIOS,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {customCategoryApi, type CustomCategory} from '@/services/api/customCategories';
import {customScenarioApi, type CustomScenario} from '@/services/api/customScenarios';
import {useListeningStore} from '@/store/useListeningStore';
import {SafeAreaView} from 'react-native-safe-area-context';

const LISTENING_BLUE = '#2563EB';
const MAX_CATEGORIES = 10;
const MAX_NAME_LENGTH = 25;

/** Emoji grid cho edit */
const POPULAR_EMOJIS = [
  '📂', '📚', '💼', '🏢', '🎯', '🌍', '✈️', '🍕',
  '🏋️', '🎵', '🎮', '🏥', '🛒', '🎬', '📱', '🚗',
  '🇯🇵', '🇺🇸', '🇬🇧', '🇰🇷', '🇫🇷', '🇩🇪', '🇪🇸', '🇮🇹',
  '💰', '🧑‍💻', '🎓', '🏠', '⚽', '🎨',
];

/**
 * Mục đích: Màn hình quản lý nhóm chủ đề trong Settings (full RUD)
 * Tham số đầu vào: navigation props (focusCategoryId optional)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   - Settings > "📂 Quản lý nhóm chủ đề" menu item
 *   - TopicPicker > "⚙️ Quản lý nhóm này →" deeplink
 */
export default function ManageCategoriesScreen({navigation, route}: any) {
  const colors = useColors();
  const haptic = useHaptic();

  // Store
  const customCategories = useListeningStore(s => s.customCategories);
  const setCustomCategories = useListeningStore(s => s.setCustomCategories);
  const updateCustomCategoryInStore = useListeningStore(s => s.updateCustomCategory);
  const removeCustomCategoryFromStore = useListeningStore(s => s.removeCustomCategory);

  // Số scenarios trong Other (category_id = null)
  const [otherCount, setOtherCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Edit sheet state
  const [editCategory, setEditCategory] = useState<CustomCategory | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('📂');
  const [showEditEmojis, setShowEditEmojis] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Manage scenarios state
  const [manageCategoryId, setManageCategoryId] = useState<string | null>(null);
  const [manageCategoryName, setManageCategoryName] = useState('');
  const [categoryScenarios, setCategoryScenarios] = useState<CustomScenario[]>([]);
  const [isScenariosLoading, setIsScenariosLoading] = useState(false);

  /**
   * Mục đích: Refresh data từ API
   * Khi nào sử dụng: Component mount, sau CRUD actions
   */
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await customCategoryApi.list();
      setCustomCategories(res.categories);
      setOtherCount(res.otherCount);
    } catch (err) {
      console.error('📂 [ManageCategories] Lỗi refresh:', err);
    } finally {
      setIsLoading(false);
    }
  }, [setCustomCategories]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // EC-14: Auto-scroll/highlight category nếu có focusCategoryId từ deeplink
  useEffect(() => {
    const focusId = route?.params?.focusCategoryId;
    if (focusId && customCategories.length > 0) {
      // Tìm category và scroll nếu có
      const found = customCategories.find(c => c.id === focusId);
      if (found) {
        // Mở context menu cho category đó
        setTimeout(() => showCategoryMenu(found), 500);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customCategories.length]);

  // ========================
  // Edit Category
  // ========================

  /**
   * Mục đích: Mở sheet sửa category
   * Tham số đầu vào: category (CustomCategory)
   * Khi nào sử dụng: User nhấn [⋯] > "✏️ Sửa" trên category row
   */
  const handleOpenEdit = useCallback((category: CustomCategory) => {
    setEditCategory(category);
    setEditName(category.name);
    setEditIcon(category.icon);
    setShowEditEmojis(false);
  }, []);

  /**
   * Mục đích: Lưu thay đổi category (tên/icon)
   * Khi nào sử dụng: User nhấn "💾 Lưu" trong edit sheet
   */
  const handleSaveEdit = useCallback(async () => {
    if (!editCategory || !editName.trim()) return;
    setIsSaving(true);
    try {
      const res = await customCategoryApi.update(editCategory.id, {
        name: editName.trim(),
        icon: editIcon,
      });
      haptic.success();
      updateCustomCategoryInStore(editCategory.id, res.category);
      setEditCategory(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể cập nhật. Thử lại.';
      Alert.alert('Lỗi', msg);
    } finally {
      setIsSaving(false);
    }
  }, [editCategory, editName, editIcon, haptic, updateCustomCategoryInStore]);

  // ========================
  // Delete Category
  // ========================

  /**
   * Mục đích: Xoá category với dialog confirm (Keep/Delete scenarios)
   * Tham số đầu vào: category (CustomCategory)
   * Khi nào sử dụng: User nhấn [⋯] > "🗑️ Xoá" trên category row
   */
  const handleDelete = useCallback((category: CustomCategory) => {
    Alert.alert(
      `Xoá nhóm "${category.icon} ${category.name}"?`,
      `Nhóm có ${category.scenarioCount} chủ đề bên trong.`,
      [
        {text: 'Huỷ', style: 'cancel'},
        {
          text: 'Giữ chủ đề (→ Other)',
          onPress: async () => {
            try {
              await customCategoryApi.delete(category.id, true);
              haptic.success();
              removeCustomCategoryFromStore(category.id);
              refreshData();
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xoá. Thử lại.');
            }
          },
        },
        {
          text: 'Xoá tất cả',
          style: 'destructive',
          onPress: async () => {
            try {
              await customCategoryApi.delete(category.id, false);
              haptic.success();
              removeCustomCategoryFromStore(category.id);
              refreshData();
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xoá. Thử lại.');
            }
          },
        },
      ],
    );
  }, [haptic, removeCustomCategoryFromStore, refreshData]);

  // ========================
  // Manage Scenarios in Category
  // ========================

  /**
   * Mục đích: Mở sheet quản lý scenarios trong 1 category
   * Tham số đầu vào: categoryId, categoryName
   * Khi nào sử dụng: User nhấn [⋯] > "📋 Quản lý chủ đề"
   */
  const handleOpenManageScenarios = useCallback(async (categoryId: string, name: string) => {
    setManageCategoryId(categoryId);
    setManageCategoryName(name);
    setIsScenariosLoading(true);
    try {
      const data = await customScenarioApi.list(categoryId);
      setCategoryScenarios(data);
    } catch (err) {
      console.error('📂 [ManageScenarios] Lỗi load:', err);
    } finally {
      setIsScenariosLoading(false);
    }
  }, []);

  /**
   * Mục đích: Xoá scenario khỏi category
   * Tham số đầu vào: scenarioId
   * Khi nào sử dụng: User nhấn [⋯] > "🗑️ Xoá" trên scenario row
   */
  const handleDeleteScenario = useCallback((scenarioId: string, name: string) => {
    Alert.alert('Xoá chủ đề?', `"${name}" sẽ bị xoá vĩnh viễn.`, [
      {text: 'Huỷ', style: 'cancel'},
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          try {
            await customScenarioApi.delete(scenarioId);
            haptic.success();
            setCategoryScenarios(prev => prev.filter(s => s.id !== scenarioId));
            refreshData();
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể xoá.');
          }
        },
      },
    ]);
  }, [haptic, refreshData]);

  /**
   * Mục đích: Di chuyển scenario sang category khác
   * Tham số đầu vào: scenarioId
   * Khi nào sử dụng: User nhấn [⋯] > "📂 Chuyển nhóm"
   */
  const handleMoveScenario = useCallback((scenarioId: string, scenarioName: string) => {
    // Tạo danh sách targets: Other + các category khác (trừ current)
    const targets = [
      { label: '📂 Other', id: null as string | null },
      ...customCategories
        .filter(c => c.id !== manageCategoryId)
        .map(c => ({ label: `${c.icon} ${c.name}`, id: c.id as string | null })),
    ];

    /**
     * Mục đích: Thực hiện di chuyển scenario sang category mới
     * Tham số đầu vào: targetCategoryId (null = Other)
     * Khi nào sử dụng: User chọn category đích trong ActionSheet/Alert
     */
    const doMove = async (targetCategoryId: string | null) => {
      try {
        await customScenarioApi.move(scenarioId, targetCategoryId);
        haptic.success();
        setCategoryScenarios(prev => prev.filter(s => s.id !== scenarioId));
        refreshData();
      } catch (err) {
        Alert.alert('Lỗi', 'Không thể di chuyển.');
      }
    };

    // EC-10: iOS dùng ActionSheetIOS (không giới hạn buttons), Android dùng Alert (max 3)
    if (Platform.OS === 'ios') {
      const options = ['Huỷ', ...targets.map(t => t.label)];
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: `Chuyển "${scenarioName}" sang nhóm`,
          options,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            doMove(targets[buttonIndex - 1].id);
          }
        },
      );
    } else {
      // Android: nếu quá 3 targets → chia thành 2 bước
      if (targets.length <= 2) {
        // Đủ chỗ cho Cancel + 2 targets → dùng Alert bình thường
        Alert.alert(
          `Chuyển "${scenarioName}" sang nhóm`, '',
          [
            { text: 'Huỷ', style: 'cancel' },
            ...targets.map(t => ({ text: t.label, onPress: () => doMove(t.id) })),
          ],
        );
      } else {
        // Quá nhiều targets → bước 1: chọn "Other" hoặc "Nhóm khác"
        Alert.alert(
          `Chuyển "${scenarioName}"`, 'Chọn đích đến:',
          [
            { text: 'Huỷ', style: 'cancel' },
            { text: '📂 Other', onPress: () => doMove(null) },
            {
              text: `📋 Chọn nhóm... (${targets.length - 1})`,
              onPress: () => {
                // Bước 2: chọn từ danh sách categories
                const catTargets = targets.filter(t => t.id !== null);
                if (catTargets.length <= 2) {
                  Alert.alert('Chọn nhóm', '', [
                    { text: 'Huỷ', style: 'cancel' },
                    ...catTargets.map(t => ({ text: t.label, onPress: () => doMove(t.id) })),
                  ]);
                } else {
                  // Tiếp tục chia nhỏ nếu cần (max 10 categories → max 5 bước)
                  const chunk = catTargets.slice(0, 2);
                  const remaining = catTargets.slice(2);
                  Alert.alert('Chọn nhóm (1)', '', [
                    { text: 'Huỷ', style: 'cancel' },
                    ...chunk.map(t => ({ text: t.label, onPress: () => doMove(t.id) })),
                    ...(remaining.length > 0 ? [{
                      text: `Xem thêm... (${remaining.length})`,
                      onPress: () => {
                        Alert.alert('Chọn nhóm (2)', '', [
                          { text: 'Huỷ', style: 'cancel' },
                          ...remaining.map(t => ({ text: t.label, onPress: () => doMove(t.id) })),
                        ]);
                      },
                    }] : []),
                  ]);
                }
              },
            },
          ],
        );
      }
    }
  }, [customCategories, manageCategoryId, haptic, refreshData]);

  // ========================
  // Render Context Menu cho Category
  // ========================
  const showCategoryMenu = useCallback((category: CustomCategory) => {
    Alert.alert(
      `${category.icon} ${category.name}`,
      '',
      [
        {text: 'Huỷ', style: 'cancel'},
        {text: '✏️ Sửa tên và icon', onPress: () => handleOpenEdit(category)},
        {text: `📋 Quản lý chủ đề (${category.scenarioCount})`, onPress: () => handleOpenManageScenarios(category.id, `${category.icon} ${category.name}`)},
        {text: '🗑️ Xoá nhóm', style: 'destructive', onPress: () => handleDelete(category)},
      ],
    );
  }, [handleOpenEdit, handleOpenManageScenarios, handleDelete]);

  // ========================
  // Render Scenario Context Menu
  // ========================
  const showScenarioMenu = useCallback((scenario: CustomScenario) => {
    Alert.alert(
      `📝 ${scenario.name}`,
      '',
      [
        {text: 'Huỷ', style: 'cancel'},
        {text: '📂 Chuyển nhóm', onPress: () => handleMoveScenario(scenario.id, scenario.name)},
        {text: '🗑️ Xoá', style: 'destructive', onPress: () => handleDeleteScenario(scenario.id, scenario.name)},
      ],
    );
  }, [handleMoveScenario, handleDeleteScenario]);

  return (
    <SafeAreaView className="flex-1" style={{backgroundColor: colors.background}}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Icon name="ChevronLeft" className="w-6 h-6" style={{color: colors.foreground}} />
        </TouchableOpacity>
        <AppText className="text-lg font-sans-bold ml-3 flex-1" style={{color: colors.foreground}}>
          Quản lý nhóm chủ đề
        </AppText>
      </View>

      {/* Counter */}
      <View className="px-5 mb-4">
        <View
          className="rounded-xl px-4 py-3"
          style={{backgroundColor: colors.glassBg, borderWidth: 1, borderColor: colors.glassBorderStrong}}>
          <AppText className="text-sm" style={{color: colors.neutrals400}}>
            📊 Đã dùng{' '}
            <AppText className="font-sans-bold" style={{color: LISTENING_BLUE}}>
              {customCategories.length}/{MAX_CATEGORIES}
            </AppText>
            {' '}nhóm
          </AppText>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Other (mặc định, locked) */}
        <View
          className="rounded-xl px-4 py-3.5 mb-3 flex-row items-center"
          style={{
            backgroundColor: colors.glassBg,
            borderWidth: 1,
            borderColor: colors.glassBorderStrong,
          }}>
          <AppText className="text-lg mr-3">📂</AppText>
          <View className="flex-1">
            <AppText className="text-sm font-sans-bold" style={{color: colors.foreground}}>
              Other (mặc định)
            </AppText>
            <AppText className="text-xs" style={{color: colors.neutrals400}}>
              {otherCount} chủ đề
            </AppText>
          </View>
          <View className="rounded-full px-2 py-1" style={{backgroundColor: colors.glassBg}}>
            <AppText className="text-xs" style={{color: colors.neutrals400}}>🔒</AppText>
          </View>
        </View>

        {/* User Categories */}
        {customCategories.map(category => (
          <View
            key={category.id}
            className="rounded-xl px-4 py-3.5 mb-3 flex-row items-center"
            style={{
              backgroundColor: colors.glassBg,
              borderWidth: 1,
              borderColor: colors.glassBorderStrong,
            }}>
            <AppText className="text-lg mr-3">{category.icon}</AppText>
            <View className="flex-1">
              <AppText className="text-sm font-sans-bold" style={{color: colors.foreground}}>
                {category.name}
              </AppText>
              <AppText className="text-xs" style={{color: colors.neutrals400}}>
                {category.scenarioCount} chủ đề
              </AppText>
            </View>
            {/* Context menu button */}
            <TouchableOpacity
              onPress={() => showCategoryMenu(category)}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Icon name="Ellipsis" className="w-5 h-5" style={{color: colors.neutrals400}} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Empty state */}
        {customCategories.length === 0 && (
          <View className="items-center py-10">
            <AppText className="text-3xl mb-2">📂</AppText>
            <AppText className="text-sm" style={{color: colors.neutrals500}}>
              Chưa có nhóm chủ đề nào
            </AppText>
            <AppText className="text-xs mt-1" style={{color: colors.neutrals400}}>
              Tạo nhóm mới bằng nút ➕ trong mục Chọn chủ đề
            </AppText>
          </View>
        )}
      </ScrollView>

      {/* ============ Edit Category Modal ============ */}
      <Modal visible={!!editCategory} animationType="slide" transparent onRequestClose={() => setEditCategory(null)}>
        <View className="flex-1 justify-end" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View className="rounded-t-3xl p-6 pb-10" style={{backgroundColor: colors.background, borderTopWidth: 1, borderColor: colors.glassBorderStrong}}>
              <View className="items-center mb-4">
                <View className="rounded-full" style={{width: 40, height: 5, backgroundColor: colors.neutrals400, opacity: 0.5}} />
              </View>
              <AppText className="text-lg font-sans-bold text-center mb-5" style={{color: colors.foreground}}>
                Sửa nhóm chủ đề
              </AppText>

              {/* Icon */}
              <View className="flex-row items-center mb-4">
                <AppText className="text-sm font-sans-medium mr-3" style={{color: colors.neutrals500}}>Icon:</AppText>
                <TouchableOpacity
                  className="rounded-xl items-center justify-center"
                  style={{width: 48, height: 48, backgroundColor: colors.glassBg, borderWidth: 1, borderColor: colors.glassBorderStrong}}
                  onPress={() => setShowEditEmojis(!showEditEmojis)}>
                  <AppText className="text-2xl">{editIcon}</AppText>
                </TouchableOpacity>
              </View>

              {showEditEmojis && (
                <View className="flex-row flex-wrap mb-4 p-3 rounded-xl" style={{backgroundColor: colors.glassBg}}>
                  {POPULAR_EMOJIS.map((emoji, idx) => (
                    <TouchableOpacity
                      key={idx}
                      className="items-center justify-center mb-2"
                      style={{width: '12.5%', height: 40, borderRadius: 8, backgroundColor: emoji === editIcon ? `${LISTENING_BLUE}15` : 'transparent'}}
                      onPress={() => { setEditIcon(emoji); setShowEditEmojis(false); }}>
                      <AppText className="text-xl">{emoji}</AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Name */}
              <View className="mb-5">
                <AppText className="text-sm font-sans-medium mb-2" style={{color: colors.neutrals500}}>Tên nhóm:</AppText>
                <View className="flex-row items-center rounded-xl px-4" style={{backgroundColor: colors.glassBg, borderWidth: 1, borderColor: colors.glassBorderStrong, height: 48}}>
                  <TextInput
                    className="flex-1 text-base"
                    style={{color: colors.foreground}}
                    value={editName}
                    onChangeText={t => setEditName(t.slice(0, MAX_NAME_LENGTH))}
                    maxLength={MAX_NAME_LENGTH}
                  />
                  <AppText className="text-xs" style={{color: editName.length >= MAX_NAME_LENGTH ? '#EF4444' : colors.neutrals400}}>
                    {editName.length}/{MAX_NAME_LENGTH}
                  </AppText>
                </View>
              </View>

              {/* Buttons */}
              <View className="flex-row">
                <TouchableOpacity
                  className="flex-1 rounded-2xl py-3.5 items-center mr-2"
                  style={{backgroundColor: colors.glassBg, borderWidth: 1, borderColor: colors.glassBorderStrong}}
                  onPress={() => setEditCategory(null)}>
                  <AppText className="text-sm font-sans-medium" style={{color: colors.foreground}}>Huỷ</AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 rounded-2xl py-3.5 items-center ml-2"
                  style={{backgroundColor: editName.trim() ? LISTENING_BLUE : colors.glassBg, opacity: editName.trim() ? 1 : 0.5}}
                  onPress={handleSaveEdit}
                  disabled={!editName.trim() || isSaving}>
                  <AppText className="text-sm font-sans-bold" style={{color: editName.trim() ? '#FFF' : colors.neutrals400}}>
                    {isSaving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ============ Manage Scenarios Modal ============ */}
      <Modal visible={!!manageCategoryId} animationType="slide" transparent onRequestClose={() => setManageCategoryId(null)}>
        <View className="flex-1 justify-end" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <View className="rounded-t-3xl p-6 pb-10" style={{backgroundColor: colors.background, borderTopWidth: 1, borderColor: colors.glassBorderStrong, maxHeight: '70%'}}>
            <View className="items-center mb-4">
              <View className="rounded-full" style={{width: 40, height: 5, backgroundColor: colors.neutrals400, opacity: 0.5}} />
            </View>

            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity onPress={() => setManageCategoryId(null)} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Icon name="X" className="w-5 h-5" style={{color: colors.neutrals500}} />
              </TouchableOpacity>
              <AppText className="text-base font-sans-bold" style={{color: colors.foreground}}>
                {manageCategoryName}
              </AppText>
              <View style={{width: 20}} />
            </View>

            {isScenariosLoading ? (
              <View className="items-center py-8">
                <AppText className="text-sm" style={{color: colors.neutrals400}}>Đang tải...</AppText>
              </View>
            ) : categoryScenarios.length === 0 ? (
              <View className="items-center py-8">
                <AppText className="text-2xl mb-2">📝</AppText>
                <AppText className="text-sm" style={{color: colors.neutrals500}}>Không có chủ đề nào</AppText>
              </View>
            ) : (
              <FlatList
                data={categoryScenarios}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                  <View
                    className="flex-row items-center px-4 py-3 rounded-xl mb-2"
                    style={{backgroundColor: colors.glassBg, borderWidth: 1, borderColor: colors.glassBorderStrong}}>
                    <View className="flex-1">
                      <AppText className="text-sm font-sans-medium" style={{color: colors.foreground}} numberOfLines={1}>
                        📝 {item.name}
                      </AppText>
                      {item.description ? (
                        <AppText className="text-xs mt-0.5" style={{color: colors.neutrals400}} numberOfLines={1}>
                          {item.description}
                        </AppText>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      onPress={() => showScenarioMenu(item)}
                      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                      <Icon name="Ellipsis" className="w-4 h-4" style={{color: colors.neutrals400}} />
                    </TouchableOpacity>
                  </View>
                )}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
