"use client"

import { AudioPlayer } from "@/components/modules/listening/audio-player"
import { TopicPicker } from "@/components/modules/listening/topic-picker"
import { TranscriptViewer } from "@/components/modules/listening/transcript-viewer"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export default function ListeningPage() {
  const [hasStarted, setHasStarted] = useState(false)

  return (
    <div className="flex flex-col gap-8 pb-24 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Listening Practice</h1>
          <p className="text-muted-foreground">Improve your listening skills with AI-generated conversations.</p>
        </div>
        <Button 
          onClick={() => setHasStarted(true)} 
          className="gap-2 bg-gradient-to-r from-primary to-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all font-semibold"
        >
          <Sparkles className="size-4" />
          Generate New
        </Button>
      </div>
      
      <Separator />

      {!hasStarted ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8">
             <TopicPicker />
           </div>
           
           {/* Sidebar Info/Stats could go here */}
           <div className="lg:col-span-4 space-y-4">
             <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50">
               <h3 className="font-semibold mb-2">How it works</h3>
               <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                 <li>Choose a topic from the list</li>
                 <li>AI generates a unique conversation</li>
                 <li>Listen and follow the transcript</li>
                 <li>Practice speaking in Interactive Mode</li>
               </ul>
             </div>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col gap-4">
               {/* Metadata Card */}
               <div className="p-6 rounded-2xl bg-card border shadow-sm">
                 <h2 className="text-xl font-bold mb-1">Ordering Coffee</h2>
                 <p className="text-muted-foreground mb-4">Daily Life</p>
                 <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 rounded-md bg-secondary text-xs font-medium">Intermediate</span>
                    <span className="px-2 py-1 rounded-md bg-secondary text-xs font-medium">2 Speakers</span>
                    <span className="px-2 py-1 rounded-md bg-secondary text-xs font-medium">5 mins</span>
                 </div>
               </div>
               
               {/* Controls/Settings could go here */}
             </div>

             <div className="flex flex-col">
                <TranscriptViewer />
             </div>

             <AudioPlayer />
        </div>
      )}
    </div>
  )
}
