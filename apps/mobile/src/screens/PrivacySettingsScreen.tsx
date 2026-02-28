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
      // Tạm thời dùng mock data từ local stores
      const exportData = {
        exportDate: new Date().toISOString(),
        settings: {
          audio: useSettingsStore.getState().audio,
          privacy: useSettingsStore.getState().privacy,
        },
      };

      // Chia sẻ dữ liệu qua Share API
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
      {/* === Bản ghi âm (Save Recordings) === */}
      <View className="px-4 pt-4">
        <AppText variant="label" className="text-neutrals400 mb-3 uppercase" raw>
          Bản ghi âm
        </AppText>
        <View
          className="p-4 rounded-2xl"
          style={{backgroundColor: colors.neutrals900}}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <AppText variant="body" className="text-foreground" raw>
                Lưu bản ghi âm
              </AppText>
              <AppText variant="caption" className="text-neutrals400 mt-0.5" raw>
                Lưu lại các bản ghi khi luyện nói để nghe lại sau
              </AppText>
            </View>
            <Switch
              value={privacy.saveRecordings}
              onValueChange={setSaveRecordings}
            />
          </View>
        </View>
      </View>

      {/* === Đồng bộ dữ liệu (Data Sync) === */}
      <View className="px-4 mt-6">
        <AppText variant="label" className="text-neutrals400 mb-3 uppercase" raw>
          Đồng bộ
        </AppText>
        <View
          className="p-4 rounded-2xl"
          style={{backgroundColor: colors.neutrals900}}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <AppText variant="body" className="text-foreground" raw>
                Đồng bộ dữ liệu
              </AppText>
              <AppText variant="caption" className="text-neutrals400 mt-0.5" raw>
                Tự động đồng bộ tiến trình học giữa các thiết bị
              </AppText>
            </View>
            <Switch
              value={privacy.dataSync}
              onValueChange={setDataSync}
            />
          </View>
        </View>
      </View>

      {/* === Xuất dữ liệu (Export Data — GDPR) === */}
      <View className="px-4 mt-6">
        <AppText variant="label" className="text-neutrals400 mb-3 uppercase" raw>
          Dữ liệu của bạn
        </AppText>
        <Pressable
          onPress={handleExportData}
          disabled={isExporting}
          className="p-4 rounded-2xl flex-row items-center justify-between active:opacity-80"
          style={{
            backgroundColor: colors.neutrals900,
            opacity: isExporting ? 0.6 : 1,
          }}>
          <View className="flex-1 mr-3">
            <AppText variant="body" className="text-foreground" raw>
              {isExporting ? 'Đang xuất...' : 'Xuất dữ liệu'}
            </AppText>
            <AppText variant="caption" className="text-neutrals400 mt-0.5" raw>
              Tải xuống toàn bộ dữ liệu học tập của bạn (JSON)
            </AppText>
          </View>
          <Icon
            name={isExporting ? 'Loader' : 'Download'}
            className="w-5 h-5 text-primary"
          />
        </Pressable>
      </View>
    </ScrollView>
  );
}
