"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { SetupScreen } from "@/components/modules/speaking/setup-screen"
import { SessionTranscript } from "@/components/modules/speaking/session-transcript"
import { VoiceVisualizer } from "@/components/modules/speaking/voice-visualizer"
import { SpeakingControls } from "@/components/modules/speaking/speaking-controls"
import { PronunciationAlert } from "@/components/modules/speaking/pronunciation-alert"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { useSaveLesson } from "@/hooks/use-save-lesson"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { 
  Mic, 
  Phone, 
  Send, 
  Loader2, 
  LogOut, 
  Clock,
  MessageSquare
} from "lucide-react"
import { cn } from "@/lib/utils"

// Types
interface ConversationMessage {
  id: string
  role: "user" | "ai"
  text: string
  timestamp: number
  corrections?: {
    original: string
    correction: string
    explanation: string
  }[]
}

export default function SpeakingPage() {
  // View State
  const [viewMode, setViewMode] = useState<"setup" | "session">("setup")

  // Setup State
  const [topic, setTopic] = useState("")
  const [duration, setDuration] = useState(10)
  const [feedbackMode, setFeedbackMode] = useState<"strict" | "gentle">("gentle")

  // Session State
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice")
  const [textInput, setTextInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<number>(0)
  const [sessionDuration, setSessionDuration] = useState(0)

  // Pronunciation Alert State
  const [alertOpen, setAlertOpen] = useState(false)
  const [currentMistake, setCurrentMistake] = useState<{
    userSaid: string
    suggestion: string
  } | null>(null)

  // Hooks
  const { saveLesson, isSaving } = useSaveLesson()
  const {
    isRecording,
    duration: recordingDuration,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder()

  // Session timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (viewMode === "session" && sessionStartTime) {
      interval = setInterval(() => {
        setSessionDuration(Math.floor((Date.now() - sessionStartTime) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [viewMode, sessionStartTime])

  // Keyboard shortcut: Space to toggle recording
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode === "session" && inputMode === "voice" && e.code === "Space" && !e.repeat) {
        // Check if not typing in textarea
        if (document.activeElement?.tagName !== "TEXTAREA" && document.activeElement?.tagName !== "INPUT") {
          e.preventDefault()
          handleMicClick()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [viewMode, inputMode, isRecording])

  /**
   * Start a new session
   */
  const startSession = () => {
    if (!topic.trim()) return
    setViewMode("session")
    setSessionStartTime(Date.now())
    setSessionDuration(0)
    setMessages([
      {
        id: "1",
        role: "ai",
        text: `Hello! I'm your AI Speaking Coach. Let's practice talking about "${topic}". I'll ${feedbackMode === "gentle" ? "help you with major mistakes" : "correct all your mistakes"} as we go. You can start by telling me your thoughts on this topic!`,
        timestamp: Date.now(),
      },
    ])
    resetRecording()
  }

  /**
   * Exit session and save to database
   */
  const exitSession = async () => {
    if (messages.length > 1) {
      try {
        await saveLesson({
          type: "speaking",
          topic,
          content: { messages, feedbackMode },
          durationMinutes: Math.ceil(sessionDuration / 60),
          mode: "interactive",
          status: "completed",
        })
      } catch {
        // Error already handled in hook
      }
    }
    setViewMode("setup")
    setMessages([])
    setTopic("")
    setInputMode("voice")
    setTextInput("")
    setSessionStartTime(0)
    setSessionDuration(0)
    resetRecording()
  }

  /**
   * Send user input to AI
   */
  const sendToAI = useCallback(
    async (userText: string) => {
      if (!userText.trim()) return

      const userMsgId = Date.now().toString()
      const userMsg: ConversationMessage = {
        id: userMsgId,
        role: "user",
        text: userText,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, userMsg])
      setIsThinking(true)

      try {
        const conversationHistory = messages.map((msg) => ({
          speaker: msg.role === "ai" ? "AI Coach" : "User",
          text: msg.text,
        }))

        console.log("[SpeakingPage] Calling AI continue-conversation...")
        const response = await api("/ai/continue-conversation", {
          method: "POST",
          body: JSON.stringify({
            conversationHistory,
            userInput: userText,
            topic,
            // Note: feedbackMode is handled client-side, not in backend DTO
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("[SpeakingPage] API Error:", response.status, errorData)
          throw new Error(errorData.message || `API Error: ${response.status}`)
        }

        const data = await response.json()
        console.log("[SpeakingPage] AI response:", data)

        const aiMsg: ConversationMessage = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: data.response || "I'm sorry, I couldn't understand. Could you please try again?",
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, aiMsg])

        // Attach corrections to user message for Corrections Tab
        if (data.corrections && data.corrections.length > 0) {
          // Update user message with corrections
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === userMsgId
                ? { ...msg, corrections: data.corrections }
                : msg
            )
          )

          // Also show popup for immediate feedback
          const firstCorrection = data.corrections[0]
          setCurrentMistake({
            userSaid: firstCorrection.original,
            suggestion: firstCorrection.correction,
          })
          setAlertOpen(true)
        }
      } catch (err) {
        console.error("[SpeakingPage] AI error:", err)
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "ai",
            text: "Sorry, I'm having trouble responding right now. Please try again.",
            timestamp: Date.now(),
          },
        ])
        toast.error("Could not get AI response")
      } finally {
        setIsThinking(false)
      }
    },
    [messages, topic, feedbackMode]
  )

  /**
   * Handle microphone click (start/stop recording)
   */
  const handleMicClick = useCallback(async () => {
    if (isRecording) {
      console.log("[SpeakingPage] Stopping recording...")
      const audioBlob = await stopRecording()

      if (!audioBlob) {
        console.warn("[SpeakingPage] No audio data")
        return
      }

      setIsThinking(true)

      try {
        const formData = new FormData()
        const mimeType = audioBlob.type
        let extension = "webm"
        if (mimeType.includes("ogg")) extension = "ogg"
        else if (mimeType.includes("mp4")) extension = "mp4"

        formData.append("audio", audioBlob, `recording.${extension}`)

        console.log("[SpeakingPage] Calling transcribe API...", audioBlob.size, "bytes")
        const transcribeResponse = await api("/ai/transcribe", {
          method: "POST",
          body: formData,
        })

        if (!transcribeResponse.ok) {
          const errorData = await transcribeResponse.json().catch(() => ({}))
          throw new Error(errorData.message || "Transcription error")
        }

        const transcribeData = await transcribeResponse.json()
        console.log("[SpeakingPage] Transcription result:", transcribeData)

        const transcribedText = transcribeData.text
        if (!transcribedText || transcribedText.trim() === "") {
          console.warn("[SpeakingPage] Could not recognize speech")
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "ai",
              text: "I couldn't hear you clearly. Please try speaking again.",
              timestamp: Date.now(),
            },
          ])
          setIsThinking(false)
          return
        }

        setIsThinking(false)
        await sendToAI(transcribedText)
      } catch (err) {
        console.error("[SpeakingPage] Audio processing error:", err)
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "ai",
            text: "Sorry, I couldn't process your audio. Please try again.",
            timestamp: Date.now(),
          },
        ])
        setIsThinking(false)
        toast.error("Could not process audio")
      }
    } else {
      console.log("[SpeakingPage] Starting recording...")
      await startRecording()
    }
  }, [isRecording, stopRecording, startRecording, sendToAI])

  /**
   * Handle text input send
   */
  const handleSendText = async () => {
    if (!textInput.trim() || isSending) return

    setIsSending(true)
    const text = textInput
    setTextInput("")

    await sendToAI(text)
    setIsSending(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

  const formatSessionDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // SETUP MODE
  if (viewMode === "setup") {
    return (
      <div className="max-w-5xl mx-auto">
        <SetupScreen
          topic={topic}
          onTopicChange={setTopic}
          duration={duration}
          onDurationChange={setDuration}
          feedbackMode={feedbackMode}
          onFeedbackModeChange={setFeedbackMode}
          onStart={startSession}
          onPlayRecentLesson={(entry) => {
            if (entry.content) {
              const content = entry.content as { 
                messages?: ConversationMessage[]
                feedbackMode?: "strict" | "gentle" 
              }
              
              if (content.messages && content.messages.length > 0) {
                setTopic(entry.topic)
                setMessages(content.messages)
                setFeedbackMode(content.feedbackMode || "gentle")
                setViewMode("session")
                // Reset other states
                setInputMode("voice")
                setTextInput("")
                setSessionStartTime(Date.now()) // Start new session timer or keep old duration? Let's start new for practice.
                setSessionDuration(0)
              }
            }
          }}
        />
      </div>
    )
  }

  // SESSION MODE
  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.24))] max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-background/80 backdrop-blur-md border-b sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg">{topic}</h1>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatSessionDuration(sessionDuration)}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {messages.length} messages
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                feedbackMode === "gentle" 
                  ? "bg-blue-500/10 text-blue-500" 
                  : "bg-orange-500/10 text-orange-500"
              )}>
                {feedbackMode === "gentle" ? "😊 Gentle" : "📝 Strict"}
              </span>
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={exitSession}
          disabled={isSaving}
          className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          End Session
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0 overflow-hidden">
        {/* Left: Voice/Text Input Area */}
        <div className="flex-1 flex flex-col gap-4 min-h-[300px] lg:min-h-0">
          {inputMode === "voice" ? (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                  backgroundSize: '24px 24px'
                }} />
              </div>
              
              <VoiceVisualizer
                isListening={isRecording}
                isProcessing={isThinking}
                duration={recordingDuration}
                onClick={handleMicClick}
                disabled={isThinking}
                showKeyboardHint={true}
                sessionStats={{
                  duration: sessionDuration,
                  messageCount: messages.length,
                  correctionCount: messages.filter(m => m.corrections && m.corrections.length > 0).length
                }}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col p-4 rounded-2xl border bg-muted/20">
              <div className="flex-1 flex flex-col">
                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                  className="flex-1 resize-none min-h-[200px]"
                  disabled={isSending || isThinking}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleSendText}
                  disabled={!textInput.trim() || isSending || isThinking}
                  className="bg-gradient-to-r from-primary/90 to-primary hover:opacity-90 text-primary-foreground gap-2"
                >
                  {isSending || isThinking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send
                </Button>
              </div>
            </div>
          )}

          {/* Mode Toggle */}
          <SpeakingControls
            mode={inputMode}
            onModeToggle={() => setInputMode((m) => (m === "voice" ? "text" : "voice"))}
          />
        </div>

        {/* Right: Transcript */}
        <div className="w-full lg:w-[400px] h-[300px] lg:h-full">
          <SessionTranscript
            messages={messages}
            isThinking={isThinking}
            className="h-full"
          />
        </div>
      </div>

      {/* Pronunciation Alert */}
      <PronunciationAlert
        isOpen={alertOpen}
        userSaid={currentMistake?.userSaid || ""}
        suggestion={currentMistake?.suggestion || ""}
        onRetry={() => setAlertOpen(false)}
        onIgnore={() => setAlertOpen(false)}
      />

    </div>
  )
}
