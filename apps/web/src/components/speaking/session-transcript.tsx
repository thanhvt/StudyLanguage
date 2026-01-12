'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils'; // Assuming this exists or I will used standard utility

interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
  timestamp: number;
  corrections?: {
    original: string;
    correction: string;
    explanation: string;
  }[];
}

interface SessionTranscriptProps {
  messages: Message[];
  isThinking?: boolean;
  className?: string;
}

export function SessionTranscript({ messages, isThinking, className }: SessionTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom smoothly
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  return (
    <div className={cn("glass-card flex flex-col h-full overflow-hidden", className)}>
      <div className="p-4 border-b border-white/10 bg-black/20">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          💬 Conversation History
        </h3>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <Avatar className="w-8 h-8 shrink-0">
                {msg.role === 'ai' ? (
                  <AvatarFallback className="bg-primary/20 text-primary border border-primary/30">🤖</AvatarFallback>
                ) : (
                  <AvatarFallback className="bg-secondary/20 text-blue-400 border border-blue-400/30">👤</AvatarFallback>
                )}
              </Avatar>

              <div className={cn(
                "max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed",
                msg.role === 'ai' 
                  ? "bg-muted/50 rounded-tl-none border border-white/5" 
                  : "bg-primary/10 text-primary-foreground rounded-tr-none border border-primary/20"
              )}>
                {/* Text logic with highlighting corrections if needed */}
                <p>
                  {/* Note: This is a simple render. Complex highlighting logic can be added later if needed */}
                  {msg.text}
                </p>
                
                {msg.role === 'user' && msg.corrections && msg.corrections.length > 0 && (
                   <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                      {msg.corrections.map((correction, idx) => (
                        <div key={idx} className="text-xs text-red-400">
                          <span className="line-through opacity-70">{correction.original}</span>
                          {' '}&rarr;{' '}
                          <span className="text-green-400 font-medium">{correction.correction}</span>
                        </div>
                      ))}
                   </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isThinking && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
             <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary border border-primary/30">🤖</AvatarFallback>
             </Avatar>
             <div className="bg-muted/30 p-3 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></span>
                </div>
             </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
