'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'vi' | 'en';

type Translations = {
  [key: string]: {
    vi: string;
    en: string;
  };
};

// Từ điển đơn giản cho MVP
const DICTIONARY: Translations = {
  'app.title': { vi: 'AI Learning', en: 'AI Learning' },
  'app.subtitle': { 
    vi: 'Luyện 4 kỹ năng: Nghe, Nói, Đọc, Viết với trợ lý AI thông minh', 
    en: 'Master 4 skills: Listening, Speaking, Reading, Writing with Smart AI' 
  },
  'auth.login': { vi: 'Đăng nhập với Google', en: 'Login with Google' },
  'auth.logout': { vi: 'Đăng xuất', en: 'Logout' },
  'auth.loading': { vi: 'Đang tải...', en: 'Loading...' },
  'settings.theme': { vi: 'Cài đặt giao diện', en: 'Interface Settings' },
  'settings.language': { vi: 'Ngôn ngữ', en: 'Language' },
  'footer.copyright': { vi: 'AI Learning © 2026 - Powered by AI ✨', en: 'AI Learning © 2026 - Powered by AI ✨' },
  
  // Skills
  'skill.listening.name': { vi: 'Luyện Nghe', en: 'Listening' },
  'skill.listening.desc': { vi: 'Nghe hội thoại AI tạo theo chủ đề', en: 'Listen to AI-generated conversations' },
  'skill.speaking.name': { vi: 'Luyện Nói', en: 'Speaking' },
  'skill.speaking.desc': { vi: 'Luyện phát âm với AI Coach', en: 'Practice pronunciation with AI Coach' },
  'skill.reading.name': { vi: 'Luyện Đọc', en: 'Reading' },
  'skill.reading.desc': { vi: 'Đọc hiểu với câu hỏi AI', en: 'Reading comprehension with AI questions' },
  'skill.writing.name': { vi: 'Luyện Viết', en: 'Writing' },
  'skill.writing.desc': { vi: 'Viết và nhận phản hồi từ AI', en: 'Write and get AI feedback' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('vi');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('app-language') as Language;
    if (savedLang && (savedLang === 'vi' || savedLang === 'en')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string): string => {
    if (!DICTIONARY[key]) return key;
    return DICTIONARY[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
