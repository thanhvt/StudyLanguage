"use client"

import * as React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX,
  Loader2,
  CheckCircle,
  RotateCcw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { VoiceVisualizer } from "@/components/modules/speaking/voice-visualizer"
import { cn } from "@/lib/utils"
import { api, textToSpeech, transcribeAudio } from "@/lib/api"
import { useSaveLesson } from "@/hooks/use-save-lesson"
import type { ConversationLine, TopicScenario, TtsSettings } from "@/types/listening-types"

interface InteractiveModeProps {
  topic: TopicScenario
  duration: number
  onBack: () => void
  ttsSettings?: TtsSettings
}

interface ScriptLine {
  id: string
  speaker: string
  text: string
  isUserTurn: boolean
  status: 'pending' | 'playing' | 'waiting' | 'completed'
}

export function InteractiveMode({ topic, duration, onBack, ttsSettings }: InteractiveModeProps) {
  // Script state
  const [script, setScript] = useState<ScriptLine[]>([])
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // NEW: Scenario context from API
  const [scenario, setScenario] = useState<string | null>(null)
  
  // NEW: Completion tracking
  const [isComplete, setIsComplete] = useState(false)
  
  // NEW: Hook để lưu lesson
  const { saveLesson } = useSaveLesson()

  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Settings
  const [autoPlay, setAutoPlay] = useState(true)
  const [handsOnlyMode, setHandsOnlyMode] = useState(false)

  // Conversation history for AI context
  const conversationHistoryRef = useRef<{ speaker: string; text: string }[]>([])

  // Generate interactive script on mount
  useEffect(() => {
    generateInteractiveScript()
  }, [])

  // Generate initial script
  const generateInteractiveScript = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await api('/conversation-generator/generate-interactive', {
        method: 'POST',
        body: JSON.stringify({
          topic: `${topic.name}: ${topic.description}`,
          contextDescription: `Generate an interactive ${duration} minute conversation where the user participates. Include [YOUR TURN] markers where the user should speak.`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate script')
      }

      const data = await response.json()
      
      // NEW: Store scenario context
      setScenario(data.scenario || null)
      setIsComplete(false)
      conversationHistoryRef.current = []
      
      // Parse script and identify user turns
      const scriptLines: ScriptLine[] = data.script.map((line: any, index: number) => ({
        id: `line-${index}`,
        speaker: line.speaker,
        text: line.text,
        isUserTurn: line.isUserTurn || line.speaker.toLowerCase() === 'you' || line.speaker.toLowerCase() === 'user',
        status: 'pending' as const,
      }))

      setScript(scriptLines)
      
      // Start playing if autoPlay is enabled
      if (autoPlay && scriptLines.length > 0) {
        playNextLine(scriptLines, 0)
      }

    } catch (err) {
      console.error('Script generation failed:', err)
      setError('Failed to generate conversation. Please try again.')
      
      // Use mock data for development
      const mockScript: ScriptLine[] = [
        { id: '1', speaker: 'Host', text: "Welcome! Let's practice ordering coffee. I'll be the barista. Ready?", isUserTurn: false, status: 'pending' },
        { id: '2', speaker: 'You', text: "[YOUR TURN] - Greet the barista and order your drink", isUserTurn: true, status: 'pending' },
        { id: '3', speaker: 'Host', text: "Great choice! Would you like that hot or iced?", isUserTurn: false, status: 'pending' },
        { id: '4', speaker: 'You', text: "[YOUR TURN] - Specify hot or iced and any modifications", isUserTurn: true, status: 'pending' },
        { id: '5', speaker: 'Host', text: "Perfect! That'll be $5.50. Anything else?", isUserTurn: false, status: 'pending' },
        { id: '6', speaker: 'You', text: "[YOUR TURN] - Complete the order or add something", isUserTurn: true, status: 'pending' },
      ]
      setScript(mockScript)
      if (autoPlay) {
        playNextLine(mockScript, 0)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // Play a script line using TTS
  const playNextLine = async (currentScript: ScriptLine[], index: number) => {
    if (index >= currentScript.length) {
      // Conversation completed
      return
    }

    const line = currentScript[index]
    setCurrentLineIndex(index)

    // Update line status
    setScript(prev => prev.map((l, i) => ({
      ...l,
      status: i === index ? 'playing' : i < index ? 'completed' : 'pending',
    })))

    if (line.isUserTurn) {
      // It's user's turn - wait for recording
      setScript(prev => prev.map((l, i) => ({
        ...l,
        status: i === index ? 'waiting' : l.status,
      })))
      
      // In hands-free mode, auto-start recording
      if (handsOnlyMode) {
        setTimeout(() => startRecording(), 500)
      }
      return
    }

    // Phát audio AI — hỗ trợ cả OpenAI và Azure TTS
    if (!isMuted) {
      setIsPlaying(true)
      try {
        const ttsResult = await textToSpeech(
          line.text,
          ttsSettings?.voice || 'nova',
          ttsSettings?.provider === 'azure' ? ttsSettings : undefined
        )
        
        // Chuyển base64 thành URL phát audio
        const audioBytes = atob(ttsResult.audio)
        const audioArray = new Uint8Array(audioBytes.length)
        for (let i = 0; i < audioBytes.length; i++) {
          audioArray[i] = audioBytes.charCodeAt(i)
        }
        const blob = new Blob([audioArray], { type: 'audio/mpeg' })
        const audioSrc = URL.createObjectURL(blob)
        
        if (audioRef.current) {
          audioRef.current.src = audioSrc
          audioRef.current.onended = () => {
            setIsPlaying(false)
            URL.revokeObjectURL(audioSrc)
            // Thêm vào conversation history
            conversationHistoryRef.current.push({
              speaker: line.speaker,
              text: line.text,
            })
            // Tự động chuyển sang câu tiếp theo
            playNextLine(currentScript, index + 1)
          }
          audioRef.current.play()
        }
      } catch (err) {
        console.error('TTS lỗi:', err)
        setIsPlaying(false)
        // Tiếp tục dù lỗi
        conversationHistoryRef.current.push({
          speaker: line.speaker,
          text: line.text,
        })
        setTimeout(() => playNextLine(currentScript, index + 1), 2000)
      }
    } else {
      // Muted - just advance after delay
      conversationHistoryRef.current.push({
        speaker: line.speaker,
        text: line.text,
      })
      setTimeout(() => playNextLine(currentScript, index + 1), 2000)
    }
  }

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      })

      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach(track => track.stop())
        await processUserRecording(audioBlob)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(500) // Capture in 500ms chunks

      setIsRecording(true)
      setRecordingDuration(0)
      
      // Start duration timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)

    } catch (err) {
      console.error('Recording failed:', err)
      setError('Microphone access denied. Please allow microphone access.')
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }
    }
  }

  // Process user's recording - Enhanced with continue-conversation API
  const processUserRecording = async (audioBlob: Blob) => {
    setIsProcessing(true)

    try {
      // Transcribe audio
      const { text: userText } = await transcribeAudio(audioBlob)

      // Add user response to history
      conversationHistoryRef.current.push({
        speaker: 'You',
        text: userText,
      })

      // Update current line with user's actual response
      setScript(prev => prev.map((l, i) => ({
        ...l,
        text: i === currentLineIndex ? userText : l.text,
        status: i === currentLineIndex ? 'completed' : l.status,
      })))

      // NEW: Gọi API continue-conversation để AI phản hồi tự nhiên
      try {
        const continueRes = await api('/conversation-generator/continue-conversation', {
          method: 'POST',
          body: JSON.stringify({
            conversationHistory: conversationHistoryRef.current,
            userInput: userText,
            topic: topic.name,
          }),
        })

        if (continueRes.ok) {
          const { response: aiResponse, shouldEnd } = await continueRes.json()
          
          // Thêm phản hồi AI vào history
          conversationHistoryRef.current.push({
            speaker: 'AI Partner',
            text: aiResponse,
          })

          // Đọc phản hồi AI bằng TTS
          await speakAiResponse(aiResponse)

          if (shouldEnd) {
            setIsComplete(true)
          } else if (autoPlay && currentLineIndex + 1 < script.length) {
            playNextLine(script, currentLineIndex + 1)
          }
        } else {
          // Fallback: tiếp tục theo script có sẵn
          if (autoPlay && currentLineIndex + 1 < script.length) {
            playNextLine(script, currentLineIndex + 1)
          } else if (currentLineIndex + 1 >= script.length) {
            setIsComplete(true)
          }
        }
      } catch (continueError) {
        console.error('Continue conversation failed:', continueError)
        // Fallback: tiếp tục theo script
        if (autoPlay && currentLineIndex + 1 < script.length) {
          playNextLine(script, currentLineIndex + 1)
        } else if (currentLineIndex + 1 >= script.length) {
          setIsComplete(true)
        }
      }

    } catch (err) {
      console.error('Processing failed:', err)
      setError('Failed to process your speech. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * speakAiResponse - Đọc phản hồi AI bằng TTS
   * 
   * Mục đích: Phát audio cho câu phản hồi động của AI
   * Tham số: text - nội dung cần đọc
   * Khi nào sử dụng: Sau khi nhận phản hồi từ continue-conversation API
   */
  const speakAiResponse = async (text: string) => {
    setIsPlaying(true)
    try {
      const ttsResult = await textToSpeech(
        text,
        ttsSettings?.voice || 'nova',
        ttsSettings?.provider === 'azure' ? ttsSettings : undefined
      )
      
      // Chuyển base64 thành URL audio
      const audioBytes = atob(ttsResult.audio)
      const audioArray = new Uint8Array(audioBytes.length)
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i)
      }
      const blob = new Blob([audioArray], { type: 'audio/mpeg' })
      const audioSrc = URL.createObjectURL(blob)
      
      if (audioRef.current) {
        audioRef.current.src = audioSrc
        await new Promise<void>((resolve) => {
          audioRef.current!.onended = () => {
            setIsPlaying(false)
            URL.revokeObjectURL(audioSrc)
            resolve()
          }
          audioRef.current!.play()
        })
      }
    } catch (err) {
      console.error('TTS cho AI response lỗi:', err)
      setIsPlaying(false)
    }
  }

  /**
   * skipUserTurn - Bỏ qua lượt nói của user (Hands-only mode)
   * 
   * Mục đích: Tự động skip khi bật chế độ chỉ nghe
   * Khi nào sử dụng: Khi handsOnlyMode = true và đến lượt user
   */
  const skipUserTurn = useCallback(() => {
    if (!script || script.length === 0) return
    
    conversationHistoryRef.current.push({ 
      speaker: 'You', 
      text: '(Bỏ qua)' 
    })
    
    setScript(prev => prev.map((l, i) => ({
      ...l,
      text: i === currentLineIndex ? '(Bỏ qua lượt nói)' : l.text,
      status: i === currentLineIndex ? 'completed' : l.status,
    })))
    
    if (currentLineIndex + 1 >= script.length) {
      setIsComplete(true)
    } else {
      playNextLine(script, currentLineIndex + 1)
    }
  }, [script, currentLineIndex])

  // Auto-skip user turn when hands-only mode is active
  useEffect(() => {
    const currentLine = script?.[currentLineIndex]
    if (
      handsOnlyMode &&
      currentLine?.isUserTurn &&
      currentLine?.status === 'waiting' &&
      !isComplete &&
      !isRecording &&
      !isProcessing
    ) {
      const timer = setTimeout(() => {
        skipUserTurn()
      }, 1500) // 1.5s delay như user yêu cầu
      return () => clearTimeout(timer)
    }
  }, [handsOnlyMode, script, currentLineIndex, isComplete, isRecording, isProcessing, skipUserTurn])

  // Auto-save lesson on completion
  useEffect(() => {
    if (isComplete && script.length > 0) {
      saveLesson({
        type: 'listening',
        topic: topic.name,
        content: { 
          scenario,
          script, 
          conversationHistory: conversationHistoryRef.current 
        },
        durationMinutes: duration,
        mode: 'interactive',
        status: 'completed',
      })
    }
  }, [isComplete, script, topic, duration, scenario, saveLesson])

  // Handle mic button click
  const handleMicClick = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  // Current line info
  const currentLine = script[currentLineIndex]
  const isUserTurn = currentLine?.isUserTurn

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">{topic.name}</h2>
            <p className="text-sm text-muted-foreground">Interactive Mode</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </Button>
          
          <Badge variant="outline" className="font-mono">
            {currentLineIndex + 1}/{script.length}
          </Badge>
        </div>
      </div>

      {/* Loading State */}
      {isGenerating && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="size-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="size-8 text-primary animate-spin" />
            </div>
            <div>
              <p className="font-medium">Generating conversation...</p>
              <p className="text-sm text-muted-foreground">This may take a moment</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isGenerating && !isComplete && (
        <>
          {/* Scenario Card - Hiển thị ngữ cảnh tình huống */}
          {scenario && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-l-4 border-primary mb-4 animate-in fade-in duration-500">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-2">
                📍 Tình huống
              </p>
              <p className="text-sm leading-relaxed">{scenario}</p>
            </div>
          )}

          {/* Transcript */}
          <ScrollArea className="flex-1 rounded-2xl border bg-card/30 p-4 mb-6">
            <div className="space-y-4">
              {script.map((line, index) => (
                <div
                  key={line.id}
                  className={cn(
                    "p-4 rounded-xl transition-all duration-300",
                    line.status === 'playing' || line.status === 'waiting'
                      ? "bg-primary/15 ring-2 ring-primary/30 scale-[1.02]"
                      : line.status === 'completed'
                      ? "bg-muted/30 opacity-70"
                      : "bg-muted/10 opacity-50",
                    line.isUserTurn && "border-l-4 border-emerald-500"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      line.isUserTurn ? "text-emerald-500" : "text-primary"
                    )}>
                      {line.speaker}
                    </span>
                    {line.status === 'completed' && (
                      <CheckCircle className="size-3 text-emerald-500" />
                    )}
                    {line.status === 'waiting' && (
                      <Badge variant="secondary" className="text-xs animate-pulse">
                        🎤 Đến lượt bạn!
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{line.text}</p>
                  
                  {/* Enhanced Your Turn Prompt */}
                  {line.status === 'waiting' && line.isUserTurn && (
                    <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 animate-pulse">
                      <p className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
                        <span className="size-2 rounded-full bg-amber-500 animate-ping" />
                        Bấm mic để bắt đầu nói
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Voice Input Area */}
          <div className="flex flex-col items-center gap-4 pb-4">
            {isUserTurn ? (
              <VoiceVisualizer
                isListening={isRecording}
                isProcessing={isProcessing}
                duration={recordingDuration}
                onClick={handleMicClick}
                disabled={isProcessing}
              />
            ) : isPlaying ? (
              <div className="flex items-center gap-3 text-primary">
                <div className="size-3 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium">AI đang nói...</span>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Đang chờ...
              </div>
            )}

            {/* Settings */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch
                  checked={autoPlay}
                  onCheckedChange={setAutoPlay}
                  className="scale-75"
                />
                <span>Tự động phát</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch
                  checked={handsOnlyMode}
                  onCheckedChange={setHandsOnlyMode}
                  className="scale-75"
                />
                <span>Chỉ nghe</span>
              </label>
            </div>
          </div>
        </>
      )}

      {/* Completion Screen with Feedback Summary */}
      {!isGenerating && isComplete && (
        <div className="flex-1 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-full max-w-lg space-y-6 p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20">
            {/* Success Header */}
            <div className="text-center">
              <div className="size-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                <CheckCircle className="size-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold">🎉 Hoàn thành!</h3>
              <p className="text-sm text-muted-foreground mt-1">{topic.name}</p>
            </div>
            
            {/* Feedback Summary Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-background/50 border">
                <p className="text-2xl font-bold text-primary">{script.length}</p>
                <p className="text-xs text-muted-foreground">Lượt trao đổi</p>
              </div>
              <div className="p-3 rounded-xl bg-background/50 border">
                <p className="text-2xl font-bold text-emerald-500">
                  {script.filter(l => l.status === 'completed' && !l.isUserTurn).length}
                </p>
                <p className="text-xs text-muted-foreground">AI đã nói</p>
              </div>
              <div className="p-3 rounded-xl bg-background/50 border">
                <p className="text-2xl font-bold text-amber-500">
                  {script.filter(l => l.isUserTurn && l.status === 'completed').length}
                </p>
                <p className="text-xs text-muted-foreground">Lượt của bạn</p>
              </div>
            </div>
            
            {/* Scenario Recap */}
            {scenario && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="text-xs font-medium text-muted-foreground mb-1">Tình huống đã luyện:</p>
                <p>{scenario}</p>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-3 justify-center pt-2">
              <Button variant="outline" onClick={onBack}>
                ← Quay lại
              </Button>
              <Button onClick={generateInteractiveScript} className="gap-2">
                <RotateCcw className="size-4" />
                Thử lại
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div 
          role="alert"
          aria-live="assertive"
          className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center"
        >
          {error}
        </div>
      )}
    </div>
  )
}
