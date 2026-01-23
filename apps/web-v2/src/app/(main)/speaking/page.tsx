"use client"

import { useState } from "react"
import { ConversationBubble } from "@/components/modules/speaking/conversation-bubble"
import { VoiceVisualizer } from "@/components/modules/speaking/voice-visualizer"
import { SpeakingControls } from "@/components/modules/speaking/speaking-controls"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const MOCK_CONVO: Array<any> = [
  { id: "1", role: "ai", text: "Hello! I'm your AI Coach. What topic shall we discuss today?", timestamp: "10:00" },
  { id: "2", role: "user", text: "I'd like to practice ordering food at a restaurant.", timestamp: "10:01" },
  { id: "3", role: "ai", text: "Great choice! Let's pretend you are at a fancy Italian restaurant. I'll be the waiter. 'Buonasera! Welcome to Roma Delights. Do you have a reservation?'", timestamp: "10:01" },
  { id: "4", role: "user", text: "Yes, I have a table four two under the name John.", feedback: "You said 'table four two', but it should be 'table for two'.", timestamp: "10:02" },
]

export default function SpeakingPage() {
  const [isListening, setIsListening] = useState(false)
  const [mode, setMode] = useState<"voice" | "text">("voice")
  const [messages, setMessages] = useState(MOCK_CONVO)

  const handleMicClick = () => {
    setIsListening(!isListening)
    // Simulate stopping -> AI Speak
    if (isListening) {
      setTimeout(() => {
         setMessages(prev => [...prev, { 
             id: Date.now().toString(), 
             role: "ai", 
             text: "Excellent. Right this way, please. Here is the menu. Can I get you something to drink to start?" 
         }])
      }, 1500)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.24))] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Speaking Practice</h1>
          <p className="text-muted-foreground">Conversational AI Coach • Live Focus Mode</p>
        </div>
        <Button variant="outline">End Session</Button>
      </div>

      <Separator />

      {/* Main Conversation Area (Live Focus) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8 flex flex-col justify-end min-h-0">
         {/* Spacer to push content down if few messages */}
         <div className="flex-1" />
         
         {messages.map((msg, idx) => (
           <ConversationBubble 
              key={msg.id} 
              message={msg} 
              isLatest={idx === messages.length - 1} 
            />
         ))}
         
         {/* Live Indicator Spacer */}
         <div className="h-4" />
      </div>

      {/* Footer Controls */}
      <div className="shrink-0 flex flex-col items-center gap-6 p-4">
        {mode === "voice" ? (
           <div className="flex flex-col items-center gap-4">
              <VoiceVisualizer 
                isListening={isListening} 
                onClick={handleMicClick}
              />
              <p className="text-sm font-medium text-muted-foreground animate-pulse">
                {isListening ? "Listening..." : "Tap to Speak"}
              </p>
           </div>
        ) : (
           <div className="w-full max-w-2xl">
              {/* Text Input Fallback Placeholder */}
              <div className="h-12 w-full rounded-full border bg-secondary/30 flex items-center px-6 text-muted-foreground">
                Type your response here...
              </div>
           </div>
        )}

        <SpeakingControls 
          mode={mode} 
          onModeToggle={() => setMode(m => m === "voice" ? "text" : "voice")} 
        />
      </div>
    </div>
  )
}
