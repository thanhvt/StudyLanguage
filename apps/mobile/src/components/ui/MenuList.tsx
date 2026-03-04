import React from 'react';
import {JSX} from 'react';
import {Pressable, View} from 'react-native';
import Icon from '@/components/ui/Icon';
import AppText from '@/components/ui/AppText';
import {useColors} from '@/hooks/useColors';
import {useAppStore} from '@/store/useAppStore';

interface MenuListItem {
  title: string;
  value?: string | React.ReactNode;
  icon: () => JSX.Element;
  onPress?: () => void;
}

interface MenuListProps {
  data: MenuListItem[];
}

/**
 * Mục đích: Hiển thị danh sách menu items dạng row (icon + title + chevron)
 * Tham số đầu vào: data — mảng MenuListItem
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: MoreScreen → settings navigation
 *
 * Dùng useColors() để đảm bảo text rõ ràng trong dark/light mode
 * KHÔNG dùng NativeWind class cho color (text-foreground, bg-neutrals1000)
 * vì CSS variables không update đúng khi switch theme
 */
export default function MenuList(props: MenuListProps) {
  const colors = useColors();
  const theme = useAppStore(state => state.theme);
  const isDark = theme !== 'light';

  return (
    <View className="flex flex-col gap-2">
      {props.data.map((item, index) => (
        <Pressable
          onPress={item.onPress}
          key={index}
          className="flex flex-row gap-4 py-1 items-center active:opacity-70">
          {/* Icon container — explicit bg thay vì NativeWind class */}
          <View
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              backgroundColor: isDark ? colors.neutrals900 : colors.neutrals700,
              borderWidth: 1,
              borderColor: isDark ? colors.glassBorder : colors.border,
            }}>
            <item.icon />
          </View>
          <View className="flex-1">
            {/* Title — explicit foreground color */}
            <AppText
              variant="body"
              className="text-lg font-sans-regular"
              style={{color: colors.foreground}}
              raw>
              {item.title}
            </AppText>
          </View>
          <View className="flex-row items-center">
            {item.value !== undefined &&
              (typeof item.value === 'string' ? (
                <AppText
                  variant="caption"
                  style={{color: colors.neutrals300}}
                  raw>
                  {item.value}
                </AppText>
              ) : (
                item.value
              ))}
            <Icon
              name="ChevronRight"
              className="w-6"
              style={{color: colors.neutrals400}}
            />
          </View>
        </Pressable>
      ))}
    </View>
  );
}
