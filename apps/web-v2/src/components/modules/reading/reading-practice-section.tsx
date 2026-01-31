"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, Square, RotateCcw, Play, Pause, Loader2, Send, Save, Keyboard } from "lucide-react"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { useReadingFeedback } from "@/hooks/use-reading-feedback"
import { ReadingFeedback } from "./reading-feedback"
import { cn } from "@/lib/utils"

interface ReadingPracticeSectionProps {
  articleContent: string
  onSave?: (result: unknown) => void
}

/**
 * ReadingPracticeSection - Inline component for pronunciation practice
 * Designed to fit in a single screen alongside the article
 */
export function ReadingPracticeSection({ articleContent, onSave }: ReadingPracticeSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Hooks
  const { isRecording, startRecording, stopRecording, resetRecording, duration, audioBlob } = useAudioRecorder()
  const { analyze, isAnalyzing, result, reset: resetFeedback } = useReadingFeedback()

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Handlers
  const handleStart = useCallback(async () => {
    resetFeedback()
    await startRecording()
  }, [resetFeedback, startRecording])

  const handleStop = useCallback(async () => {
    await stopRecording()
  }, [stopRecording])

  /**
   * Toggle ghi âm: bắt đầu nếu chưa ghi, dừng nếu đang ghi
   * Được gọi khi click nút hoặc nhấn phím Space
   */
  const handleToggleRecording = useCallback(async () => {
    if (isAnalyzing) return // Không toggle khi đang phân tích
    
    if (isRecording) {
      await handleStop()
    } else if (!audioBlob && !result) {
      // Chỉ bắt đầu ghi khi chưa có audio hoặc result
      await handleStart()
    }
  }, [isRecording, isAnalyzing, audioBlob, result, handleStart, handleStop])

  const handleAnalyze = async () => {
    if (audioBlob) {
      await analyze(audioBlob, articleContent)
    }
  }

  const handleReset = () => {
    resetRecording()
    resetFeedback()
    setIsPlaying(false)
  }

  const handlePlayPause = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  const handleSave = () => {
    if (result) {
      onSave?.(result)
      handleReset()
    }
  }

  // Update audio source when blob changes
  useEffect(() => {
    if (audioBlob && audioRef.current) {
      const url = URL.createObjectURL(audioBlob)
      audioRef.current.src = url
      
      // Add event listeners for play state
      const audio = audioRef.current
      const handlePlay = () => setIsPlaying(true)
      const handlePause = () => setIsPlaying(false)
      const handleEnded = () => setIsPlaying(false)
      
      audio.addEventListener('play', handlePlay)
      audio.addEventListener('pause', handlePause)
      audio.addEventListener('ended', handleEnded)
      
      return () => {
        URL.revokeObjectURL(url)
        audio.removeEventListener('play', handlePlay)
        audio.removeEventListener('pause', handlePause)
        audio.removeEventListener('ended', handleEnded)
      }
    }
  }, [audioBlob])

  /**
   * Keyboard shortcut: Space để toggle ghi âm
   * Chỉ hoạt động khi không focus vào input/textarea
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Chỉ xử lý phím Space, không repeat
      if (e.code === "Space" && !e.repeat) {
        // Không xử lý khi đang focus vào input hoặc textarea
        const activeTag = document.activeElement?.tagName
        if (activeTag === "INPUT" || activeTag === "TEXTAREA") {
          return
        }
        
        e.preventDefault()
        handleToggleRecording()
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleToggleRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-base">
          <div className={cn(
            "p-2 rounded-lg transition-colors",
            isRecording ? "bg-red-500/10 text-red-500" : 
            isPlaying ? "bg-green-500/10 text-green-500" :
            "bg-primary/10 text-primary"
          )}>
            <Mic className="size-4" />
          </div>
          <div>
            <span className="font-semibold">Luyện phát âm với AI</span>
            <p className="text-xs font-normal text-muted-foreground">Đọc to đoạn văn và nhận đánh giá</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Compact Recording UI */}
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
          {/* Status Circle */}
          <div className={cn(
            "relative size-16 shrink-0 rounded-full flex items-center justify-center border-3 transition-all duration-300",
            isRecording ? "border-red-500 bg-red-50 dark:bg-red-900/20" : 
            isAnalyzing ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" :
            isPlaying ? "border-green-500 bg-green-50 dark:bg-green-900/20" :
            audioBlob ? "border-primary bg-primary/10" :
            "border-muted-foreground/30 bg-muted/50"
          )}>
            {isRecording ? (
              <div className="flex flex-col items-center animate-pulse">
                <span className="text-sm font-bold text-red-500">{formatTime(duration)}</span>
              </div>
            ) : isAnalyzing ? (
              <Loader2 className="size-6 text-blue-500 animate-spin" />
            ) : isPlaying ? (
              <div className="flex gap-0.5">
                <span className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0ms'}}></span>
                <span className="w-1 h-6 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '150ms'}}></span>
                <span className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '300ms'}}></span>
              </div>
            ) : audioBlob ? (
              <span className="text-xs font-medium text-primary">{formatTime(duration)}</span>
            ) : (
              <Mic className="size-5 text-muted-foreground" />
            )}
          </div>

          {/* Visual Connector */}
          {!isRecording && !audioBlob && !result && (
            <div className="flex-1 flex items-center justify-center px-2">
              <div className="flex items-center gap-1.5 opacity-40">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{animationDelay: '0ms'}}></div>
                <div className="w-8 h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{animationDelay: '200ms'}}></div>
                <div className="w-8 h-0.5 bg-gradient-to-r from-primary/30 to-transparent"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" style={{animationDelay: '400ms'}}></div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {!isRecording && !audioBlob && (
              <Button onClick={handleStart} disabled={isAnalyzing} className="gap-2 rounded-full">
                <Mic className="size-4" /> Ghi âm
              </Button>
            )}

            {isRecording && (
              <Button variant="destructive" onClick={handleStop} className="gap-2 rounded-full">
                <Square className="size-3 fill-current" /> Dừng ({formatTime(duration)})
              </Button>
            )}

            {audioBlob && !isRecording && !isAnalyzing && !result && (
              <>
                <Button 
                  variant={isPlaying ? "default" : "outline"} 
                  size="icon" 
                  onClick={handlePlayPause} 
                  className={cn(
                    "rounded-full size-10 transition-all",
                    isPlaying && "bg-green-600 hover:bg-green-700 text-white"
                  )}
                  title={isPlaying ? "Tạm dừng" : "Nghe lại"}
                >
                  {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                </Button>
                
                <Button variant="outline" size="icon" onClick={handleReset} className="rounded-full size-10" title="Ghi âm lại">
                  <RotateCcw className="size-4" />
                </Button>

                <Button onClick={handleAnalyze} className="gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Send className="size-4" /> Chấm điểm
                </Button>
              </>
            )}

            {isAnalyzing && (
              <span className="text-sm text-muted-foreground animate-pulse">Đang phân tích giọng đọc...</span>
            )}
          </div>
          
          {/* Hidden audio element */}
          <audio ref={audioRef} className="hidden" />
        </div>

        {/* Keyboard Shortcut Hint */}
        {!isRecording && !audioBlob && !result && !isAnalyzing && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 py-2 px-3 rounded-lg border border-border/50">
            <Keyboard className="size-3.5" />
            <span>
              Nhấn <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px] font-mono mx-0.5 border border-border">Space</kbd> để bắt đầu ghi âm
            </span>
          </div>
        )}
        
        {isRecording && (
          <div className="flex items-center justify-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 py-2 px-3 rounded-lg border border-red-200 dark:border-red-800">
            <Keyboard className="size-3.5" />
            <span>
              Nhấn <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px] font-mono mx-0.5 border border-red-300 dark:border-red-700">Space</kbd> để dừng ghi âm
            </span>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4 pt-2">
            <ReadingFeedback result={result} compact />
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset} className="flex-1">
                <RotateCcw className="size-3.5 mr-1.5" /> Thử lại
              </Button>
              <Button size="sm" onClick={handleSave} className="flex-1">
                <Save className="size-3.5 mr-1.5" /> Lưu
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
