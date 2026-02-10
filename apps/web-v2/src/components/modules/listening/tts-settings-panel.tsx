'use client'

/**
 * TtsSettingsPanel - Panel cài đặt TTS (Azure / OpenAI)
 *
 * Mục đích: Cho user chọn provider, voice, emotion, SSML controls
 * Tham số đầu vào:
 *   - settings: TtsSettings hiện tại
 *   - onSettingsChange: Callback khi settings thay đổi
 *   - compact: Hiển thị compact cho toolbar
 * Tham số đầu ra: UI component
 * Khi nào sử dụng: Settings page (full) và Toolbar (compact)
 */

import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import {
  Volume2,
  Shuffle,
  Settings2,
  Play,
  Loader2,
  Sparkles,
  Mic,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { getAvailableVoices, textToSpeech } from '@/lib/api'
import type { TtsSettings, TtsProvider, AzureVoice, VoicesResponse } from '@/types/listening-types'

// ============================================
// DEFAULT SETTINGS
// ============================================

export const DEFAULT_TTS_SETTINGS: TtsSettings = {
  provider: 'openai',
  randomVoice: false,
  randomEmotion: false,
  multiTalker: false,
}

// ============================================
// COMPONENT PROPS
// ============================================

interface TtsSettingsPanelProps {
  settings: TtsSettings
  onSettingsChange: (settings: TtsSettings) => void
  compact?: boolean
  className?: string
}

// ============================================
// MAIN COMPONENT
// ============================================

export function TtsSettingsPanel({
  settings,
  onSettingsChange,
  compact = false,
  className,
}: TtsSettingsPanelProps) {
  const [voices, setVoices] = useState<VoicesResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [selectedEmotion, setSelectedEmotion] = useState<string | undefined>(settings.emotion)

  // Tải danh sách voices khi provider thay đổi
  useEffect(() => {
    const loadVoices = async () => {
      setIsLoading(true)
      try {
        const result = await getAvailableVoices(settings.provider)
        setVoices(result)
      } catch (error) {
        console.error('Lỗi tải danh sách giọng:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadVoices()
  }, [settings.provider])

  // Cập nhật setting
  const updateSettings = useCallback((partial: Partial<TtsSettings>) => {
    onSettingsChange({ ...settings, ...partial })
  }, [settings, onSettingsChange])

  // Preview giọng
  const handlePreview = useCallback(async () => {
    setIsPreviewing(true)
    try {
      const result = await textToSpeech(
        'Hello! This is a voice preview. How does it sound?',
        settings.voice || 'alloy',
        settings.provider === 'azure' ? settings : undefined
      )

      // Phát audio preview
      const audioBytes = atob(result.audio)
      const audioArray = new Uint8Array(audioBytes.length)
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i)
      }
      const blob = new Blob([audioArray], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.play()
      audio.onended = () => {
        URL.revokeObjectURL(url)
        setIsPreviewing(false)
      }
    } catch (error) {
      console.error('Lỗi preview:', error)
      setIsPreviewing(false)
    }
  }, [settings])

  // Lấy styles (emotions) cho voice hiện tại
  const currentVoiceStyles = React.useMemo(() => {
    if (!voices || settings.provider !== 'azure') return []
    const voice = voices.voices.find(v => v.name === settings.voice)
    return voice?.styles || []
  }, [voices, settings.voice, settings.provider])

  // ==========================================
  // COMPACT MODE (Toolbar quick change)
  // ==========================================
  if (compact) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className={cn('gap-2', className)}>
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">
              {settings.provider === 'azure' ? '🔷 Azure' : '🟢 OpenAI'}
            </span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[380px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Cài đặt giọng đọc
            </SheetTitle>
            <SheetDescription>
              Chọn TTS provider, giọng đọc và cảm xúc
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <TtsSettingsContent
              settings={settings}
              updateSettings={updateSettings}
              voices={voices}
              isLoading={isLoading}
              isPreviewing={isPreviewing}
              handlePreview={handlePreview}
              currentVoiceStyles={currentVoiceStyles}
              selectedEmotion={selectedEmotion}
              setSelectedEmotion={setSelectedEmotion}
            />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // ==========================================
  // FULL MODE (Settings page)
  // ==========================================
  return (
    <div className={cn('space-y-6', className)}>
      <TtsSettingsContent
        settings={settings}
        updateSettings={updateSettings}
        voices={voices}
        isLoading={isLoading}
        isPreviewing={isPreviewing}
        handlePreview={handlePreview}
        currentVoiceStyles={currentVoiceStyles}
        selectedEmotion={selectedEmotion}
        setSelectedEmotion={setSelectedEmotion}
      />
    </div>
  )
}

// ============================================
// INNER CONTENT COMPONENT
// ============================================

interface TtsSettingsContentProps {
  settings: TtsSettings
  updateSettings: (partial: Partial<TtsSettings>) => void
  voices: VoicesResponse | null
  isLoading: boolean
  isPreviewing: boolean
  handlePreview: () => void
  currentVoiceStyles: string[]
  selectedEmotion: string | undefined
  setSelectedEmotion: (emotion: string | undefined) => void
}

function TtsSettingsContent({
  settings,
  updateSettings,
  voices,
  isLoading,
  isPreviewing,
  handlePreview,
  currentVoiceStyles,
  selectedEmotion,
  setSelectedEmotion,
}: TtsSettingsContentProps) {
  return (
    <div className="space-y-6">
      {/* Provider Toggle */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">🔊 TTS Provider</Label>
        <div className="flex gap-2">
          <Button
            variant={settings.provider === 'openai' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateSettings({ provider: 'openai', voice: undefined, emotion: undefined })}
            className="flex-1"
          >
            🟢 OpenAI
          </Button>
          <Button
            variant={settings.provider === 'azure' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateSettings({ provider: 'azure', voice: undefined, emotion: undefined })}
            className="flex-1"
          >
            🔷 Azure
          </Button>
        </div>
      </div>

      {/* Voice Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">🎙️ Giọng đọc</Label>
          <div className="flex items-center gap-2">
            <Label htmlFor="random-voice" className="text-xs text-muted-foreground">Ngẫu nhiên</Label>
            <Switch
              id="random-voice"
              checked={settings.randomVoice}
              onCheckedChange={(checked) => updateSettings({ randomVoice: checked })}
            />
          </div>
        </div>

        {!settings.randomVoice && (
          <Select
            value={settings.voice || ''}
            onValueChange={(value) => updateSettings({ voice: value, emotion: undefined })}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? 'Đang tải...' : 'Chọn giọng đọc'} />
            </SelectTrigger>
            <SelectContent>
              {voices && (
                <>
                  {/* Nhóm nữ */}
                  <SelectGroup>
                    <SelectLabel>👩 Nữ</SelectLabel>
                    {voices.voices
                      .filter(v => v.gender === 'female' || v.gender === 'neutral')
                      .map(v => (
                        <SelectItem key={v.name} value={v.name}>
                          {v.displayName} {v.styles.length > 0 ? `(${v.styles.length} emotions)` : ''}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                  {/* Nhóm nam */}
                  <SelectGroup>
                    <SelectLabel>👨 Nam</SelectLabel>
                    {voices.voices
                      .filter(v => v.gender === 'male')
                      .map(v => (
                        <SelectItem key={v.name} value={v.name}>
                          {v.displayName} {v.styles.length > 0 ? `(${v.styles.length} emotions)` : ''}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </>
              )}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Emotion / Style (chỉ Azure) */}
      {settings.provider === 'azure' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">🎭 Cảm xúc</Label>
            <div className="flex items-center gap-2">
              <Label htmlFor="random-emotion" className="text-xs text-muted-foreground">Ngẫu nhiên</Label>
              <Switch
                id="random-emotion"
                checked={settings.randomEmotion}
                onCheckedChange={(checked) => updateSettings({ randomEmotion: checked })}
              />
            </div>
          </div>

          {!settings.randomEmotion && currentVoiceStyles.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {currentVoiceStyles.map(style => (
                <Badge
                  key={style}
                  variant={settings.emotion === style ? 'default' : 'outline'}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => {
                    const newEmotion = settings.emotion === style ? undefined : style
                    setSelectedEmotion(newEmotion)
                    updateSettings({ emotion: newEmotion })
                  }}
                >
                  {getEmotionEmoji(style)} {style}
                </Badge>
              ))}
            </div>
          )}

          {!settings.randomEmotion && currentVoiceStyles.length === 0 && settings.voice && (
            <p className="text-xs text-muted-foreground">
              Giọng này không hỗ trợ emotion styles
            </p>
          )}
        </div>
      )}

      {/* Multi-talker (chỉ Azure) */}
      {settings.provider === 'azure' && voices?.multiTalker && voices.multiTalker.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">
              <Sparkles className="inline h-4 w-4 mr-1" />
              Multi-talker (Preview)
            </Label>
            <Switch
              checked={settings.multiTalker || false}
              onCheckedChange={(checked) => updateSettings({ multiTalker: checked })}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Sinh cả conversation trong 1 lần, giọng tự nhiên như podcast thật
          </p>
        </div>
      )}

      {/* SSML Controls (chỉ Azure) */}
      {settings.provider === 'azure' && (
        <div className="space-y-4">
          <Label className="text-sm font-semibold">⚙️ Điều chỉnh SSML</Label>
          
          {/* Tốc độ */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Tốc độ</Label>
              <span className="text-xs font-mono">{settings.rate || '0%'}</span>
            </div>
            <Slider
              min={-50}
              max={100}
              step={10}
              value={[parseInt(settings.rate || '0')]}
              onValueChange={([value]) => updateSettings({ rate: `${value >= 0 ? '+' : ''}${value}%` })}
            />
          </div>

          {/* Cao độ */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Cao độ</Label>
              <span className="text-xs font-mono">{settings.pitch || '0%'}</span>
            </div>
            <Slider
              min={-50}
              max={50}
              step={5}
              value={[parseInt(settings.pitch || '0')]}
              onValueChange={([value]) => updateSettings({ pitch: `${value >= 0 ? '+' : ''}${value}%` })}
            />
          </div>
        </div>
      )}

      {/* Preview Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handlePreview}
        disabled={isPreviewing}
        className="w-full"
      >
        {isPreviewing ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Play className="h-4 w-4 mr-2" />
        )}
        {isPreviewing ? 'Đang phát...' : 'Nghe thử giọng'}
      </Button>
    </div>
  )
}

// ============================================
// HELPER: Emoji cho emotion
// ============================================

function getEmotionEmoji(emotion: string): string {
  const map: Record<string, string> = {
    cheerful: '😊',
    excited: '🤩',
    friendly: '🤗',
    hopeful: '🌟',
    chat: '💬',
    sad: '😢',
    angry: '😠',
    terrified: '😱',
    shouting: '📢',
    whispering: '🤫',
    empathetic: '💗',
    customerservice: '👤',
    newscast: '📰',
    'newscast-casual': '📰',
    'newscast-formal': '🎙️',
    'narration-professional': '📖',
    unfriendly: '😒',
    assistant: '🤖',
  }
  return map[emotion] || '🎭'
}
