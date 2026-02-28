import React from 'react';
import {Linking, Pressable, ScrollView, View} from 'react-native';
import {AppText, Icon} from '@/components/ui';
import {useColors} from '@/hooks/useColors';

/**
 * Mục đích: Component hiển thị 1 row thông tin có icon + nhãn + giá trị + link ngoài
 * Tham số đầu vào: icon (string), label (string), value (string), url (string, tuỳ chọn)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Trong AboutScreen để hiển thị các mục thông tin + liên hệ
 */
interface InfoRowProps {
  icon: string;
  label: string;
  value?: string;
  url?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({icon, label, value, url}) => {
  const colors = useColors();

  /**
   * Mục đích: Mở URL bên ngoài khi nhấn vào row
   * Tham số đầu vào: không có (dùng url từ props)
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi user nhấn vào row có url
   */
  const handlePress = () => {
    if (url) {
      Linking.openURL(url).catch(err =>
        console.error('❌ [About] Không mở được URL:', err),
      );
    }
  };

  return (
    <Pressable
      onPress={url ? handlePress : undefined}
      disabled={!url}
      className="flex-row items-center py-3.5 px-4 active:opacity-80"
      style={{opacity: url ? 1 : 0.8}}>
      <Icon name={icon as any} className="w-5 h-5 text-neutrals400 mr-3" />
      <AppText variant="body" className="text-foreground flex-1" raw>
        {label}
      </AppText>
      {value && (
        <AppText variant="caption" className="text-neutrals500 mr-2" raw>
          {value}
        </AppText>
      )}
      {url && (
        <Icon name="ChevronRight" className="w-4 h-4 text-neutrals600" />
      )}
    </Pressable>
  );
};

/**
 * Mục đích: Màn hình "Giới thiệu" — hiển thị thông tin app, version, links, liên hệ
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Navigation từ ProfileScreen → "Về ứng dụng"
 */
export default function AboutScreen() {
  const colors = useColors();

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: 40}}>
      {/* === App Branding === */}
      <View className="items-center pt-8 pb-6">
        <View
          className="w-16 h-16 rounded-2xl items-center justify-center mb-3"
          style={{backgroundColor: colors.primary + '20'}}>
          <AppText
            variant="heading2"
            style={{color: colors.primary}}
            raw>
            SL
          </AppText>
        </View>
        <AppText variant="heading3" className="text-foreground" raw>
          StudyLanguage
        </AppText>
        <AppText variant="caption" className="text-neutrals500 mt-1" raw>
          Phiên bản 1.0.0 (Build 42)
        </AppText>
      </View>

      {/* === Thông tin (Info Links) === */}
      <View className="px-4">
        <AppText variant="label" className="text-neutrals400 mb-2 uppercase" raw>
          Thông tin
        </AppText>
        <View className="rounded-2xl overflow-hidden" style={{backgroundColor: colors.surface}}>
          <InfoRow
            icon="FileText"
            label="Điều khoản sử dụng"
            url="https://studylanguage.app/terms"
          />
          <View className="mx-4" style={{height: 1, backgroundColor: colors.neutrals800}} />
          <InfoRow
            icon="Lock"
            label="Chính sách bảo mật"
            url="https://studylanguage.app/privacy"
          />
          <View className="mx-4" style={{height: 1, backgroundColor: colors.neutrals800}} />
          <InfoRow
            icon="BookOpen"
            label="Giấy phép mã nguồn mở"
            url="https://studylanguage.app/licenses"
          />
          <View className="mx-4" style={{height: 1, backgroundColor: colors.neutrals800}} />
          <InfoRow
            icon="Star"
            label="Đánh giá trên App Store"
            url="https://apps.apple.com/app/studylanguage"
          />
        </View>
      </View>

      {/* === Liên hệ (Contact) === */}
      <View className="px-4 mt-6">
        <AppText variant="label" className="text-neutrals400 mb-2 uppercase" raw>
          Liên hệ
        </AppText>
        <View className="rounded-2xl overflow-hidden" style={{backgroundColor: colors.surface}}>
          <InfoRow
            icon="Globe"
            label="Website"
            value="studylanguage.app"
            url="https://studylanguage.app"
          />
          <View className="mx-4" style={{height: 1, backgroundColor: colors.neutrals800}} />
          <InfoRow
            icon="Mail"
            label="Email hỗ trợ"
            value="support@studylanguage.app"
            url="mailto:support@studylanguage.app"
          />
        </View>
      </View>

      {/* === Credits === */}
      <View className="items-center mt-8 px-4">
        <AppText variant="caption" className="text-neutrals600" raw>
          Phát triển bởi ThanhVT
        </AppText>
        <AppText variant="caption" className="text-neutrals600 mt-1" raw>
          Made with ❤️ in Vietnam
        </AppText>
      </View>
    </ScrollView>
  );
}
