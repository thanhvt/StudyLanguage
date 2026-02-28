import React from 'react';
import {ScrollView, View, Pressable} from 'react-native';
import {AppText} from '@/components/ui';
import SegmentedControl from '@/components/ui/SegmentedControl';
import {useAppStore, AccentColorId} from '@/store/useAppStore';
import {LANGUAGES} from '@/config/i18n';
import {useTranslation} from 'react-i18next';
import {useColors} from '@/hooks/useColors';

// 6 accent colors — khớp với hi-fi ps_appearance screen
const ACCENT_COLORS: {id: AccentColorId; name: string; hex: string}[] = [
  {id: 'ocean-scholar', name: 'Ocean Scholar', hex: '#10b981'},
  {id: 'sunset-focus', name: 'Sunset Focus', hex: '#f97316'},
  {id: 'royal-purple', name: 'Royal Purple', hex: '#6366f1'},
  {id: 'rose-focus', name: 'Rose Focus', hex: '#f43f5e'},
  {id: 'ocean-blue', name: 'Ocean Blue', hex: '#3b82f6'},
  {id: 'emerald-study', name: 'Emerald Study', hex: '#10b981'},
];

// Danh sách theme
const THEMES = ['Sáng', 'Tối', 'Auto'];
const THEME_MAP = ['light', 'dark', 'dark'] as const; // Auto → dark cho MVP

/**
 * Mục đích: Màn hình cài đặt giao diện — Theme, Accent Color, Language
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Navigation từ ProfileScreen → "Giao diện"
 */
export default function AppearanceSettingsScreen() {
  const theme = useAppStore(state => state.theme);
  const accentColor = useAppStore(state => state.accentColor);
  const language = useAppStore(state => state.language);
  const setTheme = useAppStore(state => state.setTheme);
  const setAccentColor = useAppStore(state => state.setAccentColor);
  const setLanguage = useAppStore(state => state.setLanguage);
  const colors = useColors();
  const {t} = useTranslation();

  // Tìm index hiện tại cho mỗi SegmentedControl
  const themeIndex = theme === 'light' ? 0 : 1;
  const languageIndex = language === 'en' ? 0 : 1;

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: 40}}>
      {/* === Chủ đề (Theme) === */}
      <View className="px-4 pt-4">
        <AppText variant="label" className="text-neutrals400 mb-3 uppercase" raw>
          Chủ đề
        </AppText>
        <SegmentedControl
          segments={THEMES}
          selectedIndex={themeIndex}
          onSelect={index => setTheme(THEME_MAP[index])}
        />
      </View>

      {/* === Màu chủ đạo (Accent Color) === */}
      <View className="px-4 mt-6">
        <AppText variant="label" className="text-neutrals400 mb-3 uppercase" raw>
          Màu chủ đạo
        </AppText>
        <View
          className="flex-row flex-wrap gap-3 p-4 rounded-2xl"
          style={{backgroundColor: colors.surface}}>
          {ACCENT_COLORS.map(color => {
            const isSelected = accentColor === color.id;
            return (
              <Pressable
                key={color.id}
                onPress={() => setAccentColor(color.id)}
                className="items-center"
                style={{width: '30%'}}>
                <View
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: color.hex,
                    borderWidth: isSelected ? 3 : 0,
                    borderColor: '#ffffff',
                  }}>
                  {isSelected && (
                    <AppText variant="body" className="text-white" raw>
                      ✓
                    </AppText>
                  )}
                </View>
                <AppText
                  variant="caption"
                  className="text-neutrals400 mt-1 text-center"
                  raw>
                  {color.name}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* === Ngôn ngữ (Language) === */}
      <View className="px-4 mt-6">
        <AppText variant="label" className="text-neutrals400 mb-3 uppercase" raw>
          Ngôn ngữ
        </AppText>
        <SegmentedControl
          segments={Object.values(LANGUAGES).map(lang => lang.nativeName)}
          selectedIndex={languageIndex}
          onSelect={index => {
            const codes = Object.keys(LANGUAGES);
            setLanguage(codes[index] as any);
          }}
        />
      </View>
    </ScrollView>
  );
}
