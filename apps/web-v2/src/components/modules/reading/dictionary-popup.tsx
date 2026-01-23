"use client"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Volume2, ExternalLink } from "lucide-react"

interface DictionaryPopupProps {
  word: string
  children: React.ReactNode
}

export function DictionaryPopup({ word, children }: DictionaryPopupProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className="cursor-pointer border-b border-primary/30 hover:bg-primary/10 hover:border-primary transition-colors decoration-dotted">
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-80 shadow-xl border-border/50">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-xl capitalize">{word}</h4>
              <p className="text-sm text-muted-foreground font-mono">/ɑːrtɪˈfɪʃl/</p>
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Volume2 className="size-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
               <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">adj</span>
            </div>
            <p className="text-sm">Made or produced by human beings rather than occurring naturally, especially as a copy of something natural.</p>
            <p className="text-xs text-muted-foreground italic">"her skin glowed in the artificial light"</p>
          </div>

          <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary/80" asChild>
            <a href={`https://google.com/search?q=define+${word}`} target="_blank" rel="noopener noreferrer">
              View full definition <ExternalLink className="size-3 ml-1" />
            </a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
