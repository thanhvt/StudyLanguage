"use client"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Lightbulb } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Message {
  id: string
  role: "user" | "ai"
  text: string
  feedback?: string
}

interface ConversationBubbleProps {
  message: Message
  isLatest: boolean
}

export function ConversationBubble({ message, isLatest }: ConversationBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div 
      className={cn(
        "flex w-full items-end gap-3 transition-opacity duration-500",
        isUser ? "flex-row-reverse" : "flex-row",
        isLatest ? "opacity-100" : "opacity-40 hover:opacity-80"
      )}
    >
      <Avatar className="size-8 shrink-0">
        <AvatarImage src={isUser ? "/placeholder-user.jpg" : "/placeholder-ai.jpg"} />
        <AvatarFallback>{isUser ? "ME" : "AI"}</AvatarFallback>
      </Avatar>

      <div 
        className={cn(
          "relative max-w-[80%] rounded-2xl px-5 py-3 text-lg leading-relaxed shadow-sm",
          isUser 
            ? "bg-primary text-primary-foreground rounded-br-none" 
            : "bg-card border text-foreground rounded-bl-none",
          isLatest && "shadow-md scale-105"
        )}
      >
        {message.text}

        {/* AI Feedback Indicator */}
        {message.feedback && (
          <div className="absolute -left-8 top-1/2 -translate-y-1/2">
             <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full hover:bg-yellow-100 hover:text-yellow-600 text-yellow-500">
                    <Lightbulb className="size-4 fill-current" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="bg-yellow-50 border-yellow-200 text-yellow-900 border p-3 max-w-xs">
                  <p className="font-semibold text-xs uppercase mb-1">Feedback</p>
                  <p>{message.feedback}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  )
}
