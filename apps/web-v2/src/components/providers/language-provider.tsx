"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Language = "vi" | "en"

type Translations = {
  [key: string]: {
    vi: string
    en: string
  }
}

// Simple dictionary for MVP
const DICTIONARY: Translations = {
  "app.title": { vi: "StudyLanguage", en: "StudyLanguage" },
  "app.subtitle": {
    vi: "Luyện 3 kỹ năng: Nghe, Nói, Đọc với trợ lý AI thông minh",
    en: "Master 3 skills: Listening, Speaking, Reading with Smart AI",
  },
  "auth.login": { vi: "Đăng nhập", en: "Login" },
  "auth.loginWithGoogle": { vi: "Đăng nhập với Google", en: "Login with Google" },
  "auth.logout": { vi: "Đăng xuất", en: "Logout" },
  "auth.loading": { vi: "Đang tải...", en: "Loading..." },
  "settings.title": { vi: "Cài đặt", en: "Settings" },
  "settings.interface": { vi: "Giao diện & Trải nghiệm", en: "Interface & Experience" },
  "settings.audio": { vi: "Cài đặt Âm thanh", en: "Audio Preferences" },
  "settings.learning": { vi: "Cài đặt Học tập", en: "Learning Preferences" },
  "settings.account": { vi: "Dữ liệu & Tài khoản", en: "Data & Account" },
  "settings.theme": { vi: "Chế độ giao diện", en: "Theme Mode" },
  "settings.themeLight": { vi: "Sáng", en: "Light" },
  "settings.themeDark": { vi: "Tối", en: "Dark" },
  "settings.themeSystem": { vi: "Hệ thống", en: "System" },
  "settings.accentColor": { vi: "Màu chủ đạo", en: "Accent Color" },
  "settings.language": { vi: "Ngôn ngữ", en: "Language" },
  "settings.smartDucking": { vi: "Smart Ducking", en: "Smart Ducking" },
  "settings.smartDuckingDesc": { vi: "Tự động giảm nhạc nền khi AI nói", en: "Auto-lower music when AI speaks" },
  "settings.ttsSpeed": { vi: "Tốc độ đọc AI", en: "AI Speech Speed" },
  "settings.soundEffects": { vi: "Hiệu ứng âm thanh", en: "Sound Effects" },
  "settings.autoPlay": { vi: "Tự động phát", en: "Auto-play" },
  "settings.autoPlayDesc": { vi: "Tự động phát audio khi vào bài", en: "Auto-play audio when entering lesson" },
  "settings.handsFree": { vi: "Chế độ rảnh tay", en: "Hands-free Mode" },
  "settings.handsFreeDesc": { vi: "Bật mặc định cho Speaking", en: "Enable by default for Speaking" },
  "settings.clearCache": { vi: "Xóa bộ nhớ đệm", en: "Clear Cache" },
  "settings.clearCacheDesc": { vi: "Xóa audio đã tải về", en: "Clear downloaded audio" },
  "nav.dashboard": { vi: "Tổng quan", en: "Dashboard" },
  "nav.listening": { vi: "Luyện Nghe", en: "Listening" },
  "nav.speaking": { vi: "Luyện Nói", en: "Speaking" },
  "nav.reading": { vi: "Luyện Đọc", en: "Reading" },
  "nav.history": { vi: "Lịch sử", en: "History" },
  "nav.settings": { vi: "Cài đặt", en: "Settings" },
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("vi")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedLang = localStorage.getItem("app-language") as Language
    if (savedLang && (savedLang === "vi" || savedLang === "en")) {
      setLanguageState(savedLang)
    }
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("app-language", lang)
  }

  const t = (key: string): string => {
    if (!DICTIONARY[key]) return key
    return DICTIONARY[key][language]
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div className={!mounted ? "invisible" : ""}>{children}</div>
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    // Return default values if used outside provider
    return {
      language: "vi" as Language,
      setLanguage: () => {},
      t: (key: string) => key,
    }
  }
  return context
}
