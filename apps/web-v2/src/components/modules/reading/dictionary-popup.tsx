"use client"

import { useEffect, useRef } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Volume2, ExternalLink, Loader2, AlertCircle } from "lucide-react"
import { useDictionary } from "@/hooks/use-dictionary"
import { cn } from "@/lib/utils"

interface DictionaryPopupProps {
  word: string
  children: React.ReactNode
}

/**
 * DictionaryPopup - Popup tra từ điển với Free Dictionary API
 * 
 * Features:
 * - Gọi Free Dictionary API khi mở popup
 * - Hiển thị phonetics + pronunciation audio
 * - Multiple definitions với examples
 * - Loading & error states
 * - Google fallback link
 */
export function DictionaryPopup({ word, children }: DictionaryPopupProps) {
  const { result, isLoading, error, lookup, clear } = useDictionary()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleOpenChange = (open: boolean) => {
    if (open) {
      lookup(word)
    } else {
      clear()
    }
  }

  const playAudio = () => {
    if (result?.phoneticAudio && audioRef.current) {
      audioRef.current.src = result.phoneticAudio
      audioRef.current.play()
    }
  }

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <span className="cursor-pointer border-b border-dashed border-primary/40 hover:bg-primary/10 hover:border-primary transition-colors duration-200">
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 shadow-xl border-border/50 overflow-hidden"
        align="start"
        sideOffset={5}
      >
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="size-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Đang tra từ...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-4" />
              <span className="text-sm font-medium">{error}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              asChild
            >
              <a 
                href={`https://www.google.com/search?q=define+${encodeURIComponent(word)}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Tìm trên Google <ExternalLink className="size-3 ml-1" />
              </a>
            </Button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="divide-y divide-border/50">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-xl capitalize">{result.word}</h4>
                  {result.phonetic && (
                    <p className="text-sm text-muted-foreground font-mono">
                      {result.phonetic}
                    </p>
                  )}
                </div>
                {result.phoneticAudio && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 hover:bg-primary/10"
                    onClick={playAudio}
                  >
                    <Volume2 className="size-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Meanings */}
            <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
              {result.meanings.map((meaning, idx) => (
                <div key={idx} className="space-y-2">
                  {/* Part of Speech */}
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded",
                    meaning.partOfSpeech === 'noun' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                    meaning.partOfSpeech === 'verb' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                    meaning.partOfSpeech === 'adjective' && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                    meaning.partOfSpeech === 'adverb' && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                    !['noun', 'verb', 'adjective', 'adverb'].includes(meaning.partOfSpeech) && "bg-secondary text-secondary-foreground"
                  )}>
                    {meaning.partOfSpeech}
                  </span>
                  
                  {/* Definitions */}
                  <ul className="space-y-2">
                    {meaning.definitions.map((def, defIdx) => (
                      <li key={defIdx} className="pl-3 border-l-2 border-muted">
                        <p className="text-sm">{def.definition}</p>
                        {def.example && (
                          <p className="text-xs text-muted-foreground italic mt-1">
                            "{def.example}"
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 bg-muted/30">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-xs text-primary/80 hover:text-primary" 
                asChild
              >
                <a 
                  href={`https://www.google.com/search?q=define+${encodeURIComponent(word)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Xem thêm trên Google <ExternalLink className="size-3 ml-1" />
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Hidden audio element */}
        <audio ref={audioRef} className="hidden" />
      </PopoverContent>
    </Popover>
  )
}
