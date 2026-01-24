"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mic, Square, RotateCcw, Play, Loader2, Send, Save, X } from "lucide-react"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { useReadingFeedback } from "@/hooks/use-reading-feedback"
import { ReadingFeedback } from "./reading-feedback"
import { cn } from "@/lib/utils"

interface ReadingPracticeModalProps {
  articleContent: string
  onSave?: (result: any) => void
  children?: React.ReactNode
}

export function ReadingPracticeModal({ articleContent, onSave, children }: ReadingPracticeModalProps) {
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
    handleReset()
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        {children || (
          <Button variant="outline" className="gap-2">
            <Mic className="size-4" />
            Luyện đọc
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Mic className="size-5" />
            </div>
            Luyện phát âm AI
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 1. Recording Controls */}
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Visualizer / Status */}
            <div className={cn(
              "relative size-32 rounded-full flex items-center justify-center border-4 transition-all duration-300",
              isRecording ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "border-muted bg-muted/30",
              isAnalyzing && "border-blue-500 animate-pulse"
            )}>
              {isRecording ? (
                <div className="flex flex-col items-center animate-pulse">
                  <span className="text-3xl font-bold text-red-500">{formatTime(duration)}</span>
                  <span className="text-xs font-medium text-red-400 uppercase mt-1">Recording...</span>
                </div>
              ) : isAnalyzing ? (
                <Loader2 className="size-10 text-blue-500 animate-spin" />
              ) : (
                <Mic className={cn("size-10", audioBlob ? "text-primary" : "text-muted-foreground")} />
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-4">
              {!isRecording && !audioBlob && (
                <Button size="lg" onClick={handleStart} disabled={isAnalyzing} className="rounded-full w-40 h-12 shadow-lg shadow-primary/20">
                  <Mic className="size-4 mr-2" /> Bắt đầu
                </Button>
              )}

              {isRecording && (
                <Button size="lg" variant="destructive" onClick={handleStop} className="rounded-full w-40 h-12 shadow-lg shadow-red-500/20">
                  <Square className="size-4 mr-2 fill-current" /> Dừng lại
                </Button>
              )}

              {audioBlob && !isRecording && !isAnalyzing && (
                <>
                  <Button variant="outline" size="icon" onClick={handleReset} className="rounded-full size-12" title="Ghi âm lại">
                    <RotateCcw className="size-4" />
                  </Button>
                  
                  {/* Hidden audio player for verification */}
                  <audio ref={audioRef} controls className="hidden" />
                  <Button variant="ghost" size="icon" onClick={() => audioRef.current?.play()} className="rounded-full size-12 border" title="Nghe lại">
                     <Play className="size-4" />
                  </Button>

                  {!result && (
                    <Button size="lg" onClick={handleAnalyze} className="rounded-full w-40 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20">
                      <Send className="size-4 mr-2" /> Chấm điểm
                    </Button>
                  )}
                </>
              )}
            </div>
            
            {/* Guide Text */}
            {!isRecording && !audioBlob && (
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Nhấn <b>Bắt đầu</b> và đọc to đoạn văn. AI sẽ phân tích giọng đọc của bạn về độ trôi chảy và phát âm.
              </p>
            )}
          </div>

          {/* 2. Analysis Results */}
          {result && (
            <div className="space-y-6 pt-6 border-t">
              <ReadingFeedback result={result} />
              
              <div className="flex justify-end gap-3 sticky bottom-0 bg-background/95 p-4 border-t backdrop-blur">
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="size-4 mr-2" /> Thử lại
                </Button>
                <Button onClick={() => {
                  onSave?.(result)
                  setIsOpen(false)
                }}>
                  <Save className="size-4 mr-2" /> Lưu kết quả
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
