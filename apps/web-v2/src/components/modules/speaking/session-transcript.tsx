"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CorrectionsPanel } from "./corrections-panel"
import { cn } from "@/lib/utils"
import { Bot, User, MessageSquare, AlertTriangle } from "lucide-react"

interface Correction {
  original: string
  correction: string
  explanation?: string
}

interface Message {
  id: string
  role: "ai" | "user"
  text: string
  timestamp: number
  corrections?: Correction[]
}

interface CorrectionItem {
  messageId: string
  userText: string
  timestamp: number
  corrections: Correction[]
}

interface SessionTranscriptProps {
  messages: Message[]
  isThinking?: boolean
  className?: string
  autoSwitchToCorrections?: boolean // Auto switch to corrections tab when new correction arrives
}

export function SessionTranscript({ 
  messages, 
  isThinking, 
  className,
  autoSwitchToCorrections = true 
}: SessionTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<"chat" | "corrections">("chat")
  const [hasNewCorrection, setHasNewCorrection] = useState(false)

  // Extract all corrections from user messages
  const allCorrections: CorrectionItem[] = messages
    .filter(msg => msg.role === "user" && msg.corrections && msg.corrections.length > 0)
    .map(msg => ({
      messageId: msg.id,
      userText: msg.text,
      timestamp: msg.timestamp,
      corrections: msg.corrections!,
    }))

  const totalCorrections = allCorrections.reduce((acc, item) => acc + item.corrections.length, 0)

  // Auto scroll to bottom for chat
  useEffect(() => {
    if (scrollRef.current && activeTab === "chat") {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isThinking, activeTab])

  // Auto-switch to corrections tab when new correction arrives
  useEffect(() => {
    if (autoSwitchToCorrections && allCorrections.length > 0) {
      const latestCorrection = allCorrections[allCorrections.length - 1]
      const isRecent = Date.now() - latestCorrection.timestamp < 3000 // within 3 seconds
      
      if (isRecent) {
        setActiveTab("corrections")
        setHasNewCorrection(true)
        
        // Reset notification after 5 seconds
        const timer = setTimeout(() => setHasNewCorrection(false), 5000)
        return () => clearTimeout(timer)
      }
    }
  }, [allCorrections.length, autoSwitchToCorrections])

  return (
    <div className={cn("flex flex-col h-full overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm", className)}>
      {/* Tabs Header */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "chat" | "corrections")} className="flex flex-col h-full">
        <TabsList className="w-full rounded-none border-b bg-muted/30 p-1 h-auto">
          <TabsTrigger 
            value="chat" 
            className="flex-1 gap-2 data-[state=active]:bg-background rounded-lg py-2"
          >
            <MessageSquare className="w-4 h-4" />
            Chat
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
              {messages.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="corrections" 
            className={cn(
              "flex-1 gap-2 data-[state=active]:bg-background rounded-lg py-2 relative",
              hasNewCorrection && "animate-pulse"
            )}
          >
            <AlertTriangle className={cn("w-4 h-4", totalCorrections > 0 && "text-amber-500")} />
            Corrections
            {totalCorrections > 0 && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-[10px] h-5 px-1.5",
                  hasNewCorrection && "bg-amber-500 text-white animate-bounce"
                )}
              >
                {totalCorrections}
              </Badge>
            )}
            {hasNewCorrection && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping" />
            )}
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 m-0 overflow-hidden">
          <div ref={scrollRef} className="h-full overflow-y-auto p-4 space-y-4 scroll-smooth">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {/* Avatar */}
                  <Avatar className="w-8 h-8 shrink-0 shadow-sm">
                    {msg.role === "ai" ? (
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>

                  {/* Message Bubble */}
                  <div className={cn(
                    "max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm",
                    msg.role === "ai" 
                      ? "bg-muted/50 rounded-tl-none border" 
                      : "bg-primary text-primary-foreground rounded-tr-none"
                  )}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    
                    {/* Corrections indicator for user messages */}
                    {msg.role === "user" && msg.corrections && msg.corrections.length > 0 && (
                      <div 
                        className="mt-2 pt-2 border-t border-primary/20 flex items-center gap-2 cursor-pointer hover:opacity-80"
                        onClick={() => setActiveTab("corrections")}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                        <span className="text-xs text-primary-foreground/80">
                          {msg.corrections.length} correction{msg.corrections.length !== 1 ? 's' : ''} - tap to view
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* AI Thinking Indicator */}
            {isThinking && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted/50 p-3 rounded-2xl rounded-tl-none border">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Empty State */}
            {messages.length === 0 && !isThinking && (
              <div className="flex-1 flex items-center justify-center text-center text-muted-foreground py-8">
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="font-medium">Start speaking</p>
                  <p className="text-sm">Your conversation will appear here</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Corrections Tab */}
        <TabsContent value="corrections" className="flex-1 m-0 overflow-hidden">
          <CorrectionsPanel corrections={allCorrections} className="h-full" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
