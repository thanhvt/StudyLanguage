import {useEffect} from 'react';
import {changeLanguage} from '@/config/i18n';
import {useAppStore} from '@/store/useAppStore';

export const LanguageHelper = () => {
  const language = useAppStore(state => state.language);

  useEffect(() => {
    changeLanguage(language).then(() => {
      console.log('Đã chuyển ngôn ngữ sang', language);
    });
  }, [language]);

  return <></>;
};
