import React from 'react';
import {ScrollView, View} from 'react-native';
import {AppText} from '@/components/ui';
import Switch from '@/components/ui/Switch';
import SegmentedControl from '@/components/ui/SegmentedControl';
import {useSettingsStore} from '@/store/useSettingsStore';
import {useColors} from '@/hooks/useColors';

// Thời gian tự động xóa
const DELETE_OPTIONS = ['30 ngày', '60 ngày', '90 ngày'];
const DELETE_VALUES: (30 | 60 | 90)[] = [30, 60, 90];

/**
 * Mục đích: Màn hình cài đặt quyền riêng tư — Save Recordings, Auto-delete, Data Sync
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Navigation từ ProfileScreen → "Quyền riêng tư"
 */
export default function PrivacySettingsScreen() {
  const privacy = useSettingsStore(state => state.privacy);
  const setSaveRecordings = useSettingsStore(state => state.setSaveRecordings);
  const setAutoDeleteDays = useSettingsStore(state => state.setAutoDeleteDays);
  const setDataSync = useSettingsStore(state => state.setDataSync);
  const colors = useColors();

  // Tìm index auto-delete hiện tại
  const deleteIndex = DELETE_VALUES.indexOf(privacy.autoDeleteDays);

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: 40}}>
      {/* === Bản ghi âm === */}
      <View className="px-4 pt-4">
        <AppText variant="label" className="text-neutrals400 mb-3 uppercase" raw>
          Bản ghi âm
        </AppText>
        <View
          className="p-4 rounded-2xl"
          style={{backgroundColor: colors.neutrals900}}>
          {/* Lưu bản ghi âm */}
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

      {/* === Tự động xóa === */}
      {privacy.saveRecordings && (
        <View className="px-4 mt-6">
          <AppText variant="label" className="text-neutrals400 mb-3 uppercase" raw>
            Tự động xóa bản ghi
          </AppText>
          <SegmentedControl
            segments={DELETE_OPTIONS}
            selectedIndex={deleteIndex >= 0 ? deleteIndex : 1}
            onSelect={index => setAutoDeleteDays(DELETE_VALUES[index])}
          />
          <AppText variant="caption" className="text-neutrals500 mt-2 px-1" raw>
            Các bản ghi cũ hơn {privacy.autoDeleteDays} ngày sẽ tự động bị xóa
          </AppText>
        </View>
      )}

      {/* === Đồng bộ dữ liệu === */}
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
    </ScrollView>
  );
}
