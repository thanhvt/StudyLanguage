"use client"

import { useState, useCallback, useEffect } from "react"
import { Headphones, History, ListMusic } from "lucide-react"
import { FeatureHeader } from "@/components/shared"
import { 
  TopicPicker, 
  ConfigPanel, 
  ModeTabs,
  SessionPlayer,
  InteractiveMode,
  RadioMode,
  PlaylistPanel,
  HistoryPanel
} from "@/components/modules/listening"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { generateConversation, generateConversationAudio } from "@/lib/api"
import { useListeningHistory } from "@/hooks/use-listening-history"
import { useListeningPlaylist } from "@/hooks/use-listening-playlist"
import type { 
  TopicScenario, 
  ConversationLine, 
  ConversationTimestamp,
  HistoryEntry,
  Playlist
} from "@/types/listening-types"

type ListeningMode = 'passive' | 'interactive'
type ViewState = 'config' | 'playing' | 'interactive'

// Mock conversation for development
const MOCK_CONVERSATION: ConversationLine[] = [
  { id: '1', speaker: 'Person A', text: "Good morning! I'd like to check in, please.", timestamp: '0:00' },
  { id: '2', speaker: 'Person B', text: "Good morning, sir! Do you have a reservation with us?", timestamp: '0:03' },
]

export default function ListeningPage() {
  // Mode & View state
  const [mode, setMode] = useState<ListeningMode>('passive')
  const [viewState, setViewState] = useState<ViewState>('config')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false)

  // Hooks
  const history = useListeningHistory()
  const playlists = useListeningPlaylist()

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

    if (mode === 'interactive') {
      setViewState('interactive')
      return
    }

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

      // Save to history
      history.addEntry({
        type: 'listening',
        topic: selectedTopic.name,
        content: { script: conversationWithIds },
        durationMinutes: duration,
        numSpeakers: speakers,
        keywords: keywords,
        mode: 'passive',
        userNotes: `Generated conversation about ${selectedTopic.name}`,
      })

      // Generate audio in background
      setIsGeneratingAudio(true)
      try {
        const audioResponse = await generateConversationAudio(conversationWithIds)
        setAudioUrl(audioResponse.audioUrl)
        setTimestamps(audioResponse.timestamps)
        
        // Update history with audio? (Hook doesn't support update yet, but simple add is fine for now)
      } catch (audioError) {
        console.error('Audio generation failed:', audioError)
      } finally {
        setIsGeneratingAudio(false)
      }

    } catch (err) {
      console.error('Generation failed:', err)
      // Fallback
      setConversation(MOCK_CONVERSATION)
      setViewState('playing')
    } finally {
      setIsGenerating(false)
    }
  }, [selectedTopic, duration, speakers, keywords, mode, history])

  // Reset to config view
  const handleReset = useCallback(() => {
    setViewState('config')
    setConversation([])
    setAudioUrl(undefined)
    setTimestamps(undefined)
  }, [])

  // Play from History/Playlist
  const handlePlaySession = (conversation: ConversationLine[], topicName: string) => {
    // In a real app we'd load the full topic object, for now we mock it or assume simple display
    setSelectedTopic({ id: 'history', name: topicName, description: 'From History' })
    setConversation(conversation)
    setViewState('playing')
    setIsHistoryOpen(false)
    setIsPlaylistOpen(false)
  }

  return (
    <div className="flex flex-col lg:h-[calc(100vh-6rem)] h-auto gap-4 pb-4 px-4 lg:px-0">
      {/* Header */}
      <div className="flex-none">
        <FeatureHeader
          icon={Headphones}
          colorScheme="listening"
          title="Listening Practice"
          subtitle="140+ scenarios • AI-powered"
          actions={[
            { icon: History, label: "History", onClick: () => setIsHistoryOpen(true) },
            { icon: ListMusic, label: "Playlists", onClick: () => setIsPlaylistOpen(true) },
          ]}
        />
      </div>

      {/* Main Content Area - Flexible height on desktop, Auto on mobile */}
      <div className="flex-1 lg:min-h-0 relative">
        {/* View: Config */}
        {viewState === 'config' && (
          <div className="lg:h-full grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20 lg:pb-0">
            {/* Left Column: Topic Picker */}
            <div className="lg:col-span-8 lg:h-full flex flex-col min-h-0 order-2 lg:order-1">
              <TopicPicker 
                onSelect={handleTopicSelect}
                selectedTopic={selectedTopic}
                className="lg:h-full h-[500px]" 
              />
            </div>

            {/* Right Column: Config */}
            <div className="lg:col-span-4 flex flex-col gap-4 lg:overflow-y-auto pr-1 order-1 lg:order-2">
              {/* Mode Switcher */}
              <ModeTabs 
                value={mode} 
                onChange={setMode} 
                variant="compact"
                className="flex-none"
              />

              {/* Config Panel */}
              <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm flex-none">
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

              {/* Radio Mode & Tips */}
              <div className="flex-none space-y-3">
                <RadioMode 
                  onPlaylistGenerated={(duration, count) => {
                    console.log(`Generated: ${count} tracks`)
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* View: Interactive Mode */}
        {viewState === 'interactive' && selectedTopic && (
          <div className="h-full flex flex-col">
            <InteractiveMode
              topic={selectedTopic}
              duration={duration}
              onBack={handleReset}
            />
          </div>
        )}

        {/* View: Playing */}
        {viewState === 'playing' && selectedTopic && (
          <div className="lg:h-full h-[80vh] overflow-y-auto">
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
          </div>
        )}
      </div>

      {/* History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">Listening History</DialogTitle>
          <HistoryPanel 
            history={history.history}
            onPlaySession={(entry) => {
              if (entry.content.script) {
                handlePlaySession(entry.content.script, entry.topic)
              }
            }}
            onToggleFavorite={history.toggleFavorite}
            onClearHistory={history.clearHistory}
          />
        </DialogContent>
      </Dialog>

      {/* Playlist Dialog */}
      <Dialog open={isPlaylistOpen} onOpenChange={setIsPlaylistOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">Your Playlists</DialogTitle>
          <PlaylistPanel
            playlists={playlists.playlists}
            onCreatePlaylist={playlists.createPlaylist}
            onDeletePlaylist={playlists.deletePlaylist}
            onRenamePlaylist={playlists.updatePlaylistName}
            onPlayPlaylist={(playlist) => {
              // Create a combined conversation from all items? Or just play first?
              // For now, playing logic is complex for multi-item. We'll just confirm play
              console.log('Play playlist', playlist)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Error Toast/Overlay */}
      {error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm backdrop-blur-md shadow-lg z-50 w-[90%] lg:w-auto text-center">
          {error}
        </div>
      )}
    </div>
  )
}
