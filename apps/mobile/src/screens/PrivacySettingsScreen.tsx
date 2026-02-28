import React, {useState} from 'react';
import {ScrollView, View, Pressable, Alert, Share} from 'react-native';
import {AppText, Icon} from '@/components/ui';
import Switch from '@/components/ui/Switch';
import {useSettingsStore} from '@/store/useSettingsStore';
import {useColors} from '@/hooks/useColors';

/**
 * Mục đích: Màn hình cài đặt quyền riêng tư — Save Recordings, Data Sync, Export Data
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Navigation từ ProfileScreen → "Quyền riêng tư"
 *
 * Hi-fi ref: ps_privacy — 2 grouped cards:
 *   Card 1: "Dữ liệu" — Lưu bản ghi âm + Đồng bộ dữ liệu (divider)
 *   Card 2: "Quản lý dữ liệu" — Xuất toàn bộ dữ liệu button
 */
export default function PrivacySettingsScreen() {
  const privacy = useSettingsStore(state => state.privacy);
  const setSaveRecordings = useSettingsStore(state => state.setSaveRecordings);
  const setDataSync = useSettingsStore(state => state.setDataSync);
  const colors = useColors();
  const [isExporting, setIsExporting] = useState(false);

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

      console.log('✅ [Privacy] Đã chia sẻ file thành công');
    } catch (error) {
      console.error('❌ [Privacy] Lỗi xuất dữ liệu:', error);
      Alert.alert('Lỗi', 'Không thể xuất dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: 40}}>
      {/* ========================================
       * Card 1: Dữ liệu — Save Recordings + Data Sync (grouped)
       * Hi-fi: "Dữ liệu" section, 2 toggles in 1 card
       * ======================================== */}
      <View className="px-4 pt-4">
        <AppText variant="label" className="text-neutrals400 mb-3 uppercase" raw>
          Dữ liệu
        </AppText>
        <View
          className="p-4 rounded-2xl"
          style={{backgroundColor: colors.surface}}>
          {/* Lưu bản ghi âm */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 mr-3">
              <Icon name="CircleCheck" className="w-5 h-5 mr-3" style={{color: colors.primary}} />
              <View className="flex-1">
                <AppText variant="body" className="text-foreground font-sans-semibold" raw>
                  Lưu bản ghi âm
                </AppText>
                <AppText variant="caption" className="text-neutrals400 mt-0.5" raw>
                  Lưu bản ghi để ôn tập sau
                </AppText>
              </View>
            </View>
            <Switch
              value={privacy.saveRecordings}
              onValueChange={setSaveRecordings}
            />
          </View>

          {/* Divider */}
          <View
            className="my-4"
            style={{height: 1, backgroundColor: colors.neutrals800}}
          />

          {/* Đồng bộ dữ liệu — cùng card */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 mr-3">
              <Icon name="RefreshCw" className="w-5 h-5 mr-3" style={{color: colors.primary}} />
              <View className="flex-1">
                <AppText variant="body" className="text-foreground font-sans-semibold" raw>
                  Đồng bộ dữ liệu
                </AppText>
                <AppText variant="caption" className="text-neutrals400 mt-0.5" raw>
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
       * Card 2: Quản lý dữ liệu — Export button
       * Hi-fi: "Quản lý dữ liệu" section
       * ======================================== */}
      <View className="px-4 mt-6">
        <AppText variant="label" className="text-neutrals400 mb-3 uppercase" raw>
          Quản lý dữ liệu
        </AppText>
        <View
          className="p-4 rounded-2xl"
          style={{backgroundColor: colors.surface}}>
          <Pressable
            onPress={handleExportData}
            disabled={isExporting}
            className="items-center py-3 rounded-xl active:opacity-80"
            style={{
              backgroundColor: colors.neutrals800,
              opacity: isExporting ? 0.6 : 1,
            }}>
            <View className="flex-row items-center">
              <Icon
                name={isExporting ? 'Loader' : 'Download'}
                className="w-5 h-5 mr-2"
                style={{color: colors.foreground}}
              />
              <AppText variant="body" className="text-foreground font-sans-semibold" raw>
                {isExporting ? 'Đang xuất...' : 'Xuất toàn bộ dữ liệu'}
              </AppText>
            </View>
          </Pressable>
          <AppText variant="caption" className="text-neutrals400 mt-2 text-center" raw>
            Tải xuống tất cả dữ liệu của bạn (GDPR)
          </AppText>
        </View>
      </View>
    </ScrollView>
  );
}
