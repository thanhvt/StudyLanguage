"use client"

import { useState, useRef, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Mic, Square, RotateCcw, Play, Loader2, Send, Save, X } from "lucide-react"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { useReadingFeedback } from "@/hooks/use-reading-feedback"
import { ReadingFeedback } from "./reading-feedback"
import { cn } from "@/lib/utils"

interface ReadingPracticeSheetProps {
  articleContent: string
  onSave?: (result: any) => void
  children?: React.ReactNode
}

/**
 * ReadingPracticeSheet - Panel luyện phát âm dạng Sheet (slide-in từ bên phải)
 * Cho phép người dùng vẫn nhìn thấy bài đọc ở bên trái
 */
export function ReadingPracticeSheet({ articleContent, onSave, children }: ReadingPracticeSheetProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Hooks
  const { isRecording, startRecording, stopRecording, resetRecording, duration, audioBlob } = useAudioRecorder()
  const { analyze, isAnalyzing, result, reset: resetFeedback } = useReadingFeedback()

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Handlers
  const handleStart = async () => {
    resetFeedback()
    await startRecording()
  }

  const handleStop = async () => {
    await stopRecording()
  }

  const handleAnalyze = async () => {
    if (audioBlob) {
      await analyze(audioBlob, articleContent)
    }
  }

  const handleReset = () => {
    resetRecording()
    resetFeedback()
  }

  const handleClose = () => {
    if (isRecording) stopRecording()
    setIsOpen(false)
    // Don't reset on close - user might want to come back
  }

  // Update audio source when blob changes
  useEffect(() => {
    if (audioBlob && audioRef.current) {
      const url = URL.createObjectURL(audioBlob)
      audioRef.current.src = url
      return () => URL.revokeObjectURL(url)
    }
  }, [audioBlob])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild onClick={() => setIsOpen(true)}>
        {children || (
          <Button variant="outline" className="gap-2">
            <Mic className="size-4" />
            Luyện đọc
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:w-[420px] sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Mic className="size-5" />
            </div>
            Luyện phát âm AI
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Hướng dẫn:</span> Đọc to đoạn văn bên trái. 
              Sau khi ghi âm xong, nhấn "Chấm điểm" để AI phân tích giọng đọc của bạn.
            </p>
          </div>

          {/* Recording Controls */}
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Visualizer / Status */}
            <div className={cn(
              "relative size-28 rounded-full flex items-center justify-center border-4 transition-all duration-300",
              isRecording ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "border-muted bg-muted/30",
              isAnalyzing && "border-blue-500 animate-pulse"
            )}>
              {isRecording ? (
                <div className="flex flex-col items-center animate-pulse">
                  <span className="text-2xl font-bold text-red-500">{formatTime(duration)}</span>
                  <span className="text-xs font-medium text-red-400 uppercase mt-1">Recording...</span>
                </div>
              ) : isAnalyzing ? (
                <Loader2 className="size-8 text-blue-500 animate-spin" />
              ) : (
                <Mic className={cn("size-8", audioBlob ? "text-primary" : "text-muted-foreground")} />
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              {!isRecording && !audioBlob && (
                <Button size="lg" onClick={handleStart} disabled={isAnalyzing} className="rounded-full px-8 h-12 shadow-lg shadow-primary/20">
                  <Mic className="size-4 mr-2" /> Bắt đầu
                </Button>
              )}

              {isRecording && (
                <Button size="lg" variant="destructive" onClick={handleStop} className="rounded-full px-8 h-12 shadow-lg shadow-red-500/20">
                  <Square className="size-4 mr-2 fill-current" /> Dừng lại
                </Button>
              )}

              {audioBlob && !isRecording && !isAnalyzing && (
                <>
                  <Button variant="outline" size="icon" onClick={handleReset} className="rounded-full size-11" title="Ghi âm lại">
                    <RotateCcw className="size-4" />
                  </Button>
                  
                  {/* Hidden audio player for verification */}
                  <audio ref={audioRef} controls className="hidden" />
                  <Button variant="ghost" size="icon" onClick={() => audioRef.current?.play()} className="rounded-full size-11 border" title="Nghe lại">
                     <Play className="size-4" />
                  </Button>

                  {!result && (
                    <Button size="lg" onClick={handleAnalyze} className="rounded-full px-6 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20">
                      <Send className="size-4 mr-2" /> Chấm điểm
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Analysis Results */}
          {result && (
            <div className="space-y-4 pt-4 border-t">
              <ReadingFeedback result={result} />
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  <RotateCcw className="size-4 mr-2" /> Thử lại
                </Button>
                <Button onClick={() => {
                  onSave?.(result)
                  setIsOpen(false)
                }} className="flex-1">
                  <Save className="size-4 mr-2" /> Lưu
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
