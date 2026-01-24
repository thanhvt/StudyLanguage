"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"

interface Message {
  id: string
  role: "ai" | "user"
  text: string
  timestamp: number
  corrections?: {
    original: string
    correction: string
    explanation: string
  }[]
}

interface SessionTranscriptProps {
  messages: Message[]
  isThinking?: boolean
  className?: string
}

export function SessionTranscript({ messages, isThinking, className }: SessionTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isThinking])

  return (
    <div className={cn("flex flex-col h-full overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm", className)}>
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          💬 Conversation History
        </h3>
      </div>
      
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
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
                
                {/* Corrections */}
                {msg.role === "user" && msg.corrections && msg.corrections.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-primary/20 space-y-2">
                    <p className="text-xs font-medium opacity-80">📝 Corrections:</p>
                    {msg.corrections.map((correction, idx) => (
                      <div key={idx} className="text-xs space-y-1 bg-black/10 rounded-lg p-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="line-through opacity-70">{correction.original}</span>
                          <span className="text-primary-foreground">→</span>
                          <span className="font-medium text-green-300">{correction.correction}</span>
                        </div>
                        {correction.explanation && (
                          <p className="opacity-70 italic">{correction.explanation}</p>
                        )}
                      </div>
                    ))}
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
    </div>
  )
}
