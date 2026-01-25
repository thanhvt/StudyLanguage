"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"

export type AccentColor =
  | "ocean-scholar"
  | "sunset-focus"
  | "royal-purple"
  | "rose-focus"
  | "ocean-blue"
  | "emerald-study"

export interface Settings {
  accentColor: AccentColor
  ttsSpeed: number
  soundEffectsEnabled: boolean
  autoPlayEnabled: boolean
  handsFreeEnabled: boolean
}

const DEFAULT_SETTINGS: Settings = {
  accentColor: "ocean-scholar",
  ttsSpeed: 1.0,
  soundEffectsEnabled: true,
  autoPlayEnabled: false,
  handsFreeEnabled: false,
}

interface SettingsContextType {
  settings: Settings
  setAccentColor: (color: AccentColor) => void
  setTtsSpeed: (speed: number) => void
  setSoundEffectsEnabled: (enabled: boolean) => void
  setAutoPlayEnabled: (enabled: boolean) => void
  setHandsFreeEnabled: (enabled: boolean) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [mounted, setMounted] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("app-settings")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      } catch {
        // Invalid JSON, use defaults
      }
    }
    setMounted(true)
  }, [])

  // Apply accent color to document
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-accent", settings.accentColor)
    }
  }, [settings.accentColor, mounted])

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings)
    localStorage.setItem("app-settings", JSON.stringify(newSettings))
  }, [])

  const setAccentColor = useCallback(
    (color: AccentColor) => {
      saveSettings({ ...settings, accentColor: color })
    },
    [settings, saveSettings]
  )

  const setTtsSpeed = useCallback(
    (speed: number) => {
      saveSettings({ ...settings, ttsSpeed: speed })
    },
    [settings, saveSettings]
  )

  const setSoundEffectsEnabled = useCallback(
    (enabled: boolean) => {
      saveSettings({ ...settings, soundEffectsEnabled: enabled })
    },
    [settings, saveSettings]
  )

  const setAutoPlayEnabled = useCallback(
    (enabled: boolean) => {
      saveSettings({ ...settings, autoPlayEnabled: enabled })
    },
    [settings, saveSettings]
  )

  const setHandsFreeEnabled = useCallback(
    (enabled: boolean) => {
      saveSettings({ ...settings, handsFreeEnabled: enabled })
    },
    [settings, saveSettings]
  )

  const resetSettings = useCallback(() => {
    saveSettings(DEFAULT_SETTINGS)
  }, [saveSettings])

  const value: SettingsContextType = {
    settings,
    setAccentColor,
    setTtsSpeed,
    setSoundEffectsEnabled,
    setAutoPlayEnabled,
    setHandsFreeEnabled,
    resetSettings,
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    return {
      settings: DEFAULT_SETTINGS,
      setAccentColor: () => {},
      setTtsSpeed: () => {},
      setSoundEffectsEnabled: () => {},
      setAutoPlayEnabled: () => {},
      setHandsFreeEnabled: () => {},
      resetSettings: () => {},
    }
  }
  return context
}
