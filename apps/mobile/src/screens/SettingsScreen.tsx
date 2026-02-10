import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useAppStore} from '@/store/useAppStore';
import {LANGUAGES} from '@/config/i18n';
import {useTranslation} from 'react-i18next';
import {AppText, Select} from '@/components/ui';

export default function SettingsScreen() {
  const theme = useAppStore(state => state.theme);
  const language = useAppStore(state => state.language);
  const toggleTheme = useAppStore(state => state.toggleTheme);
  const setLanguage = useAppStore(state => state.setLanguage);
  const {t} = useTranslation();

  return (
    <View className="flex-1">
      <View className="p-4">
        <View className="mb-4">
          <AppText className="section-title" variant={'heading1'}>
            APPEARANCE
          </AppText>
        </View>

        <TouchableOpacity
          className="flex-row justify-between items-center py-4 px-4 bg-neutrals800 rounded-lg mb-2"
          onPress={toggleTheme}>
          <Text className="text-foreground text-base font-sans-semibold">
            {t('THEME')}
          </Text>
          <Text className="text-neutrals300 text-sm font-sans-regular">
            {theme === 'dark' ? t('DARK_MODE') : t('LIGHT_MODE')}
          </Text>
        </TouchableOpacity>
        <Select
          label={'Select language'}
          labelClassName={'hidden'}
          options={Object.values(LANGUAGES).map(lang => ({
            label: lang.nativeName,
            value: lang.code,
          }))}
          value={language}
          onValueChange={(value: any) => {
            setLanguage(value);
          }}
          renderSelector={
            <TouchableOpacity className="flex-row justify-between items-center py-4 px-4 bg-neutrals800 rounded-lg mb-2">
              <Text className="text-foreground text-base font-sans-semibold">
                {t('LANGUAGE')}
              </Text>
              <Text className="text-neutrals300 text-sm font-sans-regular">
                {LANGUAGES[language].nativeName}
              </Text>
            </TouchableOpacity>
          }
        />
      </View>
    </View>
  );
}
