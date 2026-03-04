import {useColors} from '@/hooks/useColors';
import {useAppStore} from '@/store/useAppStore';
import {TouchableOpacity, View} from 'react-native';
import {ChevronLeft} from 'lucide-react-native';
import {AppText} from '@/components/ui';
import React from 'react';
import {NativeStackHeaderProps} from '@react-navigation/native-stack';

/**
 * Mục đích: Custom navigation header cho settings screens
 * Tham số đầu vào: NativeStackHeaderProps (navigation, route, options, back)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Stack.Navigator screenOptions — header cho settings sub-screens
 *
 * QUAN TRỌNG: Dùng useColors() + inline style thay vì NativeWind class
 * vì CSS variables (bg-background, text-foreground) KHÔNG resolve đúng
 * trên iOS 26 khi switch theme dark/light
 */
export default function CustomScreenHeader({
  navigation,
  route,
  options,
  back,
}: NativeStackHeaderProps) {
  const colors = useColors();
  const theme = useAppStore(state => state.theme);
  const isDark = theme !== 'light';

  return (
    <View
      className="px-4 py-3 pt-safe-offset-3 flex-row items-center"
      style={{
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? colors.glassBorder : colors.border,
      }}>
      {options.headerLeft ? (
        options.headerLeft({tintColor: colors.foreground, canGoBack: !!back})
      ) : back ? (
        <TouchableOpacity
          onPress={navigation.goBack}
          style={{marginRight: 12}}>
          <ChevronLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
      ) : null}
      <AppText
        variant="heading3"
        className="font-sans-semibold flex-1"
        style={{color: colors.foreground}}
        numberOfLines={1}
        raw>
        {options.title || route.name}
      </AppText>
      {options.headerRight
        ? options.headerRight({
            tintColor: colors.foreground,
            canGoBack: !!back,
          })
        : null}
    </View>
  );
}
