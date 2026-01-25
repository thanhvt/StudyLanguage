"use client"

import { Settings, Palette, Volume2, BookOpen, User, Sun, Moon, Monitor, Check } from "lucide-react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSettings, AccentColor } from "@/components/providers/settings-provider"
import { useMusic } from "@/components/providers/music-provider"
import { useLanguage } from "@/components/providers/language-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

const ACCENT_COLORS: { id: AccentColor; name: string; color: string }[] = [
  { id: "ocean-scholar", name: "Ocean Scholar", color: "oklch(0.60 0.15 195)" },
  { id: "sunset-focus", name: "Sunset Focus", color: "oklch(0.65 0.20 50)" },
  { id: "royal-purple", name: "Royal Purple", color: "oklch(0.55 0.25 290)" },
  { id: "rose-focus", name: "Rose Focus", color: "oklch(0.60 0.20 350)" },
  { id: "ocean-blue", name: "Ocean Blue", color: "oklch(0.55 0.22 240)" },
  { id: "emerald-study", name: "Emerald Study", color: "oklch(0.60 0.18 155)" },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { settings, setAccentColor, setTtsSpeed, setSoundEffectsEnabled, setAutoPlayEnabled, setHandsFreeEnabled } = useSettings()
  const { smartDuckingEnabled, setSmartDuckingEnabled } = useMusic()
  const { language, setLanguage, t } = useLanguage()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // User display info
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"
  const displayEmail = user?.email || "user@example.com"
  const avatarUrl = user?.user_metadata?.avatar_url || ""
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)

  const handleClearCache = () => {
    if (confirm(t("settings.clearCacheDesc") + "?")) {
      // Clear any cached audio data
      localStorage.removeItem("cached-audio")
      alert("Cache cleared!")
    }
  }

  if (!mounted) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Settings className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
            <p className="text-muted-foreground text-sm">Customize your learning experience</p>
          </div>
        </div>

        {/* Section 1: Interface & Experience */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Palette className="size-5 text-primary" />
              <CardTitle className="text-lg">{t("settings.interface")}</CardTitle>
            </div>
            <CardDescription>Theme, accent color, and language preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme Mode */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t("settings.theme")}</Label>
              <div className="flex gap-2">
                {[
                  { value: "light", icon: Sun, label: t("settings.themeLight") },
                  { value: "dark", icon: Moon, label: t("settings.themeDark") },
                  { value: "system", icon: Monitor, label: t("settings.themeSystem") },
                ].map((item) => (
                  <Button
                    key={item.value}
                    variant={theme === item.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme(item.value)}
                    className="flex-1 gap-2"
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Accent Color */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t("settings.accentColor")}</Label>
              <div className="grid grid-cols-3 gap-2">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setAccentColor(color.id)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border transition-all",
                      settings.accentColor === color.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div
                      className="size-5 rounded-full shrink-0"
                      style={{ background: color.color }}
                    />
                    <span className="text-sm font-medium truncate">{color.name}</span>
                    {settings.accentColor === color.id && (
                      <Check className="size-4 text-primary ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t("settings.language")}</Label>
              <div className="flex gap-2">
                <Button
                  variant={language === "vi" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLanguage("vi")}
                  className="flex-1 gap-2"
                >
                  <span>🇻🇳</span>
                  Tiếng Việt
                </Button>
                <Button
                  variant={language === "en" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLanguage("en")}
                  className="flex-1 gap-2"
                >
                  <span>🇬🇧</span>
                  English
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Audio Preferences */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Volume2 className="size-5 text-primary" />
              <CardTitle className="text-lg">{t("settings.audio")}</CardTitle>
            </div>
            <CardDescription>Music and speech settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Smart Ducking */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">{t("settings.smartDucking")}</Label>
                <p className="text-xs text-muted-foreground">{t("settings.smartDuckingDesc")}</p>
              </div>
              <Switch
                checked={smartDuckingEnabled}
                onCheckedChange={setSmartDuckingEnabled}
              />
            </div>

            {/* TTS Speed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{t("settings.ttsSpeed")}</Label>
                <span className="text-sm text-muted-foreground">{settings.ttsSpeed.toFixed(1)}x</span>
              </div>
              <Slider
                value={[settings.ttsSpeed]}
                onValueChange={([value]) => setTtsSpeed(value)}
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.5x</span>
                <span>1.0x</span>
                <span>2.0x</span>
              </div>
            </div>

            {/* Sound Effects */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">{t("settings.soundEffects")}</Label>
                <p className="text-xs text-muted-foreground">Play sounds for completion, clicks</p>
              </div>
              <Switch
                checked={settings.soundEffectsEnabled}
                onCheckedChange={setSoundEffectsEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Learning Preferences */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-primary" />
              <CardTitle className="text-lg">{t("settings.learning")}</CardTitle>
            </div>
            <CardDescription>Default behaviors for lessons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auto-play */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">{t("settings.autoPlay")}</Label>
                <p className="text-xs text-muted-foreground">{t("settings.autoPlayDesc")}</p>
              </div>
              <Switch
                checked={settings.autoPlayEnabled}
                onCheckedChange={setAutoPlayEnabled}
              />
            </div>

            {/* Hands-free Mode */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">{t("settings.handsFree")}</Label>
                <p className="text-xs text-muted-foreground">{t("settings.handsFreeDesc")}</p>
              </div>
              <Switch
                checked={settings.handsFreeEnabled}
                onCheckedChange={setHandsFreeEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Data & Account */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <User className="size-5 text-primary" />
              <CardTitle className="text-lg">{t("settings.account")}</CardTitle>
            </div>
            <CardDescription>Your account information and data management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <Avatar className="size-14">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{displayName}</p>
                <p className="text-sm text-muted-foreground">{displayEmail}</p>
                <p className="text-xs text-muted-foreground mt-1">Logged in with Google</p>
              </div>
            </div>

            {/* Clear Cache */}
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">{t("settings.clearCache")}</Label>
                <p className="text-xs text-muted-foreground">{t("settings.clearCacheDesc")}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleClearCache}>
                {t("settings.clearCache")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
