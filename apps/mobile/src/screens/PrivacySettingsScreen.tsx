import React, {useState} from 'react';
import {ScrollView, View, Pressable, Alert, Share, Platform, StyleSheet} from 'react-native';
import {AppText, Icon} from '@/components/ui';
import Switch from '@/components/ui/Switch';
import {useSettingsStore} from '@/store/useSettingsStore';
import {useColors} from '@/hooks/useColors';
import {useAppStore} from '@/store/useAppStore';
import LinearGradient from 'react-native-linear-gradient';

/**
 * Mục đích: Màn hình cài đặt quyền riêng tư — bám sát mockup ps_privacy
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Navigation từ MoreScreen → "Quyền riêng tư"
 *
 * Hi-fi ref: ps_privacy — Obsidian Glass style
 *   Card 1: "Dữ liệu" — Lưu bản ghi âm + Đồng bộ dữ liệu (divider) — title TRONG card
 *   Card 2: "Quản lý dữ liệu" — Xuất toàn bộ dữ liệu button — title TRONG card
 *   Card 3: "Vùng nguy hiểm" — Xóa tài khoản (red-tinted border)
 *
 * Colors: surface #141414, glassBorder rgba, bg #000000
 */
export default function PrivacySettingsScreen() {
  const privacy = useSettingsStore(state => state.privacy);
  const setSaveRecordings = useSettingsStore(state => state.setSaveRecordings);
  const setDataSync = useSettingsStore(state => state.setDataSync);
  const colors = useColors();
  const [isExporting, setIsExporting] = useState(false);
  const theme = useAppStore(state => state.theme);
  const isDark = theme !== 'light';

  /**
   * Mục đích: Xuất dữ liệu người dùng (GDPR compliance) và chia sẻ
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi user nhấn nút "Xuất dữ liệu"
   */
  const handleExportData = async () => {
    try {
      setIsExporting(true);
      console.log('📦 [Privacy] Đang xuất dữ liệu...');

      // TODO: Gọi API thực tế POST /api/user/export-data
      const exportData = {
        exportDate: new Date().toISOString(),
        settings: {
          audio: useSettingsStore.getState().audio,
          privacy: useSettingsStore.getState().privacy,
        },
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      await Share.share({
        message: jsonString,
        title: 'Dữ liệu StudyLanguage',
      });

      console.log('✅ [Privacy] Xuất dữ liệu thành công');
    } catch (error) {
      console.error('❌ [Privacy] Lỗi xuất dữ liệu:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View className="flex-1" style={{backgroundColor: colors.background}}>
      {/* Nền gradient emerald — tạo depth */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {isDark ? (
          <LinearGradient
            colors={['#064E3B65', '#05201515', 'transparent', '#10b98130']}
            locations={[0, 0.3, 0.6, 1]}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <LinearGradient
            colors={['#f0fdf410', 'transparent', '#ecfdf510']}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
        )}
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 40}}>
        {/* ========================================
         * Card 1: Dữ liệu — title TRONG card (ps_privacy mockup)
         * ======================================== */}
        <View className="px-4 pt-4">
          <View
            className="rounded-[20px] p-4"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: isDark ? colors.glassBorder : colors.border,
            }}>
            {/* Title — bold, trong card */}
            <AppText
              variant="label"
              style={{color: colors.foreground}}
              className="font-sans-semibold mb-4"
              raw>
              Dữ liệu
            </AppText>

            {/* Lưu bản ghi âm */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 mr-3">
                <Icon name="CircleCheck" className="w-5 h-5 mr-3" style={{color: colors.primary}} />
                <View className="flex-1">
                  <AppText
                    variant="body"
                    style={{color: colors.foreground}}
                    className="font-sans-semibold"
                    raw>
                    Lưu bản ghi âm
                  </AppText>
                  <AppText
                    variant="caption"
                    style={{color: colors.neutrals400}}
                    className="mt-0.5"
                    raw>
                    Lưu bản ghi để ôn tập sau
                  </AppText>
                </View>
              </View>
              <Switch
                value={privacy.saveRecordings}
                onValueChange={setSaveRecordings}
              />
            </View>

            {/* Divider — glassDivider cho dark mode */}
            <View
              className="my-4"
              style={{height: 1, backgroundColor: isDark ? colors.glassDivider : colors.border}}
            />

            {/* Đồng bộ dữ liệu */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 mr-3">
                <Icon name="RefreshCw" className="w-5 h-5 mr-3" style={{color: colors.primary}} />
                <View className="flex-1">
                  <AppText
                    variant="body"
                    style={{color: colors.foreground}}
                    className="font-sans-semibold"
                    raw>
                    Đồng bộ dữ liệu
                  </AppText>
                  <AppText
                    variant="caption"
                    style={{color: colors.neutrals400}}
                    className="mt-0.5"
                    raw>
                    Đồng bộ tiến trình qua các thiết bị
                  </AppText>
                </View>
              </View>
              <Switch
                value={privacy.dataSync}
                onValueChange={setDataSync}
              />
            </View>
          </View>
        </View>

        {/* ========================================
         * Card 2: Quản lý dữ liệu — title TRONG card
         * ======================================== */}
        <View className="px-4 mt-4">
          <View
            className="rounded-[20px] p-4"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: isDark ? colors.glassBorder : colors.border,
            }}>
            <AppText
              variant="label"
              style={{color: colors.foreground}}
              className="font-sans-semibold mb-3"
              raw>
              Quản lý dữ liệu
            </AppText>

            <Pressable
              onPress={handleExportData}
              disabled={isExporting}
              className="items-center py-3 rounded-xl active:opacity-80"
              style={{
                backgroundColor: isDark ? colors.neutrals900 : colors.neutrals700,
                opacity: isExporting ? 0.6 : 1,
              }}>
              <View className="flex-row items-center">
                <Icon
                  name={isExporting ? 'Loader' : 'Download'}
                  className="w-5 h-5 mr-2"
                  style={{color: colors.foreground}}
                />
                <AppText
                  variant="body"
                  style={{color: colors.foreground}}
                  className="font-sans-semibold"
                  raw>
                  {isExporting ? 'Đang xuất...' : 'Xuất toàn bộ dữ liệu'}
                </AppText>
              </View>
            </Pressable>
            <AppText
              variant="caption"
              style={{color: colors.neutrals400}}
              className="mt-2 text-center"
              raw>
              Tải xuống tất cả dữ liệu của bạn (GDPR)
            </AppText>
          </View>
        </View>

        {/* ========================================
         * Card 3: Vùng nguy hiểm — red-tinted border (ps_privacy mockup)
         * ======================================== */}
        <View className="px-4 mt-4">
          <View className="flex-row items-center mb-3">
            <Icon
              name="TriangleAlert"
              className="w-4 h-4 mr-1.5"
              style={{color: colors.error}}
            />
            <AppText
              variant="label"
              style={{color: colors.error}}
              className="font-sans-semibold"
              raw>
              Vùng nguy hiểm
            </AppText>
          </View>
          <Pressable
            onPress={() => {
              Alert.alert(
                'Xóa tài khoản',
                'Bạn có chắc chắn muốn xóa tài khoản? Tất cả dữ liệu sẽ bị xóa vĩnh viễn và KHÔNG THỂ khôi phục.',
                [
                  {text: 'Hủy', style: 'cancel'},
                  {
                    text: 'Xóa tài khoản',
                    style: 'destructive',
                    onPress: () => {
                      console.log('🗑️ [Privacy] User xác nhận xóa tài khoản');
                    },
                  },
                ],
              );
            }}
            className="items-center py-4 rounded-[20px] active:opacity-80"
            style={{
              backgroundColor: colors.error + '10',
              borderWidth: 1,
              borderColor: colors.error + '30',
            }}
            accessibilityLabel="Xóa tài khoản"
            accessibilityRole="button">
            <View className="flex-row items-center">
              <Icon
                name="Trash2"
                className="w-5 h-5 mr-2"
                style={{color: colors.error}}
              />
              <AppText
                variant="label"
                style={{color: colors.error}}
                className="font-sans-semibold"
                raw>
                Xóa tài khoản
              </AppText>
            </View>
          </Pressable>
          <AppText
            variant="caption"
            style={{color: colors.error}}
            className="mt-2 text-center"
            raw>
            Hành động này KHÔNG THỂ hoàn tác
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}
