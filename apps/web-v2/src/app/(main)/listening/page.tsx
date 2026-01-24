"use client"

import { useState, useCallback } from "react"
import { Headphones, Sparkles, History, ListMusic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  TopicPicker, 
  ConfigPanel, 
  ModeTabs,
  SessionPlayer,
  InteractiveMode,
  RadioMode
} from "@/components/modules/listening"
import { cn } from "@/lib/utils"
import { generateConversation, generateConversationAudio } from "@/lib/api"
import type { 
  TopicScenario, 
  ConversationLine, 
  ConversationTimestamp,
  ListeningSession 
} from "@/types/listening-types"

type ListeningMode = 'passive' | 'interactive'
type ViewState = 'config' | 'playing' | 'interactive'

// Mock conversation for development (remove when API is integrated)
const MOCK_CONVERSATION: ConversationLine[] = [
  { id: '1', speaker: 'Person A', text: "Good morning! I'd like to check in, please.", timestamp: '0:00' },
  { id: '2', speaker: 'Person B', text: "Good morning, sir! Do you have a reservation with us?", timestamp: '0:03' },
  { id: '3', speaker: 'Person A', text: "Yes, I booked a room online. The name is John Smith.", timestamp: '0:07' },
  { id: '4', speaker: 'Person B', text: "Let me check... Yes, I found it. You have a deluxe room for three nights, is that correct?", timestamp: '0:12' },
  { id: '5', speaker: 'Person A', text: "That's right. Is breakfast included?", timestamp: '0:18' },
  { id: '6', speaker: 'Person B', text: "Yes, breakfast is included. It's served from 7 AM to 10 AM in our restaurant on the second floor.", timestamp: '0:22' },
  { id: '7', speaker: 'Person A', text: "Perfect. And what time is check-out?", timestamp: '0:28' },
  { id: '8', speaker: 'Person B', text: "Check-out is at 11 AM. Would you like a wake-up call?", timestamp: '0:32' },
]

export default function ListeningPage() {
  // Mode & View state
  const [mode, setMode] = useState<ListeningMode>('passive')
  const [viewState, setViewState] = useState<ViewState>('config')

  // Config state
  const [selectedTopic, setSelectedTopic] = useState<TopicScenario | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('')
  const [duration, setDuration] = useState(5)
  const [speakers, setSpeakers] = useState(2)
  const [keywords, setKeywords] = useState('')

  // Session state
  const [conversation, setConversation] = useState<ConversationLine[]>([])
  const [audioUrl, setAudioUrl] = useState<string | undefined>()
  const [timestamps, setTimestamps] = useState<ConversationTimestamp[] | undefined>()
  
  // Loading states
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle topic selection
  const handleTopicSelect = useCallback((
    topic: TopicScenario, 
    category: string, 
    subCategory: string
  ) => {
    if (topic.id) {
      setSelectedTopic(topic)
      setSelectedCategory(category)
      setSelectedSubCategory(subCategory)
    } else {
      setSelectedTopic(null)
      setSelectedCategory('')
      setSelectedSubCategory('')
    }
  }, [])

  // Generate conversation
  const handleGenerate = useCallback(async () => {
    if (!selectedTopic) return

    setIsGenerating(true)
    setError(null)

    try {
      // Try API call first
      const topicText = `${selectedTopic.name}: ${selectedTopic.description}`
      const response = await generateConversation({
        topic: topicText,
        durationMinutes: duration,
        numSpeakers: speakers,
        keywords: keywords || undefined,
      })

      // Add IDs to conversation lines
      const conversationWithIds = response.script.map((line, index) => ({
        ...line,
        id: `line-${index}`,
      }))

      setConversation(conversationWithIds)
      setViewState('playing')

      // Generate audio in background
      setIsGeneratingAudio(true)
      try {
        const audioResponse = await generateConversationAudio(conversationWithIds)
        setAudioUrl(audioResponse.audioUrl)
        setTimestamps(audioResponse.timestamps)
      } catch (audioError) {
        console.error('Audio generation failed:', audioError)
        // Continue without audio - user can still read transcript
      } finally {
        setIsGeneratingAudio(false)
      }

    } catch (err) {
      console.error('Generation failed:', err)
      
      // Fallback to mock data for development
      console.log('Using mock data for development')
      setConversation(MOCK_CONVERSATION)
      setViewState('playing')
      
      // Mock timestamps
      setTimestamps(MOCK_CONVERSATION.map((_, i) => ({
        startTime: i * 4,
        endTime: (i + 1) * 4,
      })))
    } finally {
      setIsGenerating(false)
    }
  }, [selectedTopic, duration, speakers, keywords])

  // Reset to config view
  const handleReset = useCallback(() => {
    setViewState('config')
    setConversation([])
    setAudioUrl(undefined)
    setTimestamps(undefined)
    setSelectedTopic(null)
    setSelectedCategory('')
    setSelectedSubCategory('')
    setKeywords('')
  }, [])

  // Handle mode change
  const handleModeChange = useCallback((newMode: ListeningMode) => {
    setMode(newMode)
    // Reset state when changing modes
    if (viewState === 'playing') {
      handleReset()
    }
  }, [viewState, handleReset])

  return (
    <div className="flex flex-col gap-8 pb-24 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "size-14 rounded-2xl flex items-center justify-center",
            "bg-gradient-to-br from-skill-listening to-primary",
            "shadow-lg shadow-skill-listening/30"
          )}>
            <Headphones className="size-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">Listening Practice</h1>
            <p className="text-muted-foreground">
              140+ scenarios • AI-powered conversations
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <History className="size-4" />
            <span className="hidden sm:inline">History</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <ListMusic className="size-4" />
            <span className="hidden sm:inline">Playlists</span>
          </Button>
        </div>
      </div>

      <Separator />

      {/* Mode Tabs - Only show in config view */}
      {viewState === 'config' && (
        <ModeTabs value={mode} onChange={handleModeChange} />
      )}

      {/* Config View */}
      {viewState === 'config' && mode === 'passive' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Topic Picker - Main Column */}
          <div className="lg:col-span-7">
            <TopicPicker 
              onSelect={handleTopicSelect}
              selectedTopic={selectedTopic}
            />
          </div>

          {/* Config Panel - Sidebar */}
          <div className="lg:col-span-5">
            <div className="sticky top-4 space-y-6">
              <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="size-5 text-primary" />
                  Configuration
                </h3>
                <ConfigPanel
                  duration={duration}
                  setDuration={setDuration}
                  speakers={speakers}
                  setSpeakers={setSpeakers}
                  keywords={keywords}
                  setKeywords={setKeywords}
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                  disabled={!selectedTopic}
                />
              </div>

              {/* Quick Tips */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                <h4 className="font-medium text-sm mb-2">💡 Quick Tips</h4>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li>• Choose a topic that interests you</li>
                  <li>• Start with 5-minute conversations</li>
                  <li>• Add keywords for specific vocabulary</li>
                  <li>• Use favorites ⭐ to save topics</li>
                </ul>
              </div>

              {/* Radio Mode Button */}
              <RadioMode 
                onPlaylistGenerated={(duration, count) => {
                  console.log(`Generated playlist: ${count} tracks, ${duration} min`)
                  // TODO: Implement playlist playback
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Interactive Mode Config */}
      {viewState === 'config' && mode === 'interactive' && (
        <div className="max-w-2xl mx-auto w-full">
          <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <div className="size-16 rounded-full bg-gradient-to-br from-skill-listening to-primary mx-auto flex items-center justify-center">
                <Headphones className="size-8 text-white" />
              </div>
              <h2 className="text-xl font-bold">Interactive Listening</h2>
              <p className="text-muted-foreground text-sm">
                Join the conversation! AI will pause for you to respond.
              </p>
            </div>

            <TopicPicker 
              onSelect={handleTopicSelect}
              selectedTopic={selectedTopic}
            />

            <ConfigPanel
              duration={duration}
              setDuration={setDuration}
              speakers={speakers}
              setSpeakers={setSpeakers}
              keywords={keywords}
              setKeywords={setKeywords}
              onGenerate={() => {
                if (selectedTopic) {
                  setViewState('interactive')
                }
              }}
              isGenerating={false}
              disabled={!selectedTopic}
            />
          </div>
        </div>
      )}

      {/* Interactive Mode View */}
      {viewState === 'interactive' && selectedTopic && (
        <InteractiveMode
          topic={selectedTopic}
          duration={duration}
          onBack={handleReset}
        />
      )}

      {/* Playing View */}
      {viewState === 'playing' && selectedTopic && (
        <SessionPlayer
          topic={selectedTopic}
          category={selectedCategory}
          subCategory={selectedSubCategory}
          conversation={conversation}
          duration={duration}
          speakers={speakers}
          audioUrl={audioUrl}
          timestamps={timestamps}
          isGeneratingAudio={isGeneratingAudio}
          onReset={handleReset}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
