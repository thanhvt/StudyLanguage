"use client"

import { useState, useCallback } from "react"
import { Headphones, ListMusic, History, RotateCcw } from "lucide-react"
import { FeatureHeader, RecentLessonsPanel } from "@/components/shared"
import { useAuth } from "@/components/providers/auth-provider"
import { 
  TopicPicker, 
  ConfigPanel, 
  ModeTabs,
  SessionPlayer,
  InteractiveMode,
  RadioMode,
  PlaylistPanel
} from "@/components/modules/listening"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { generateConversation, generateConversationAudio } from "@/lib/api"
import { useListeningPlaylist } from "@/hooks/use-listening-playlist"
import { useSaveLesson } from "@/hooks/use-save-lesson"
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
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false)
  const [isRecentOpen, setIsRecentOpen] = useState(false)

  // Hooks
  const { user } = useAuth()
  const playlists = useListeningPlaylist()
  const { saveLesson } = useSaveLesson()

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

      // Save to history (Database)
      await saveLesson({
        type: 'listening',
        topic: selectedTopic.name,
        content: { script: conversationWithIds },
        durationMinutes: duration,
        numSpeakers: speakers,
        keywords: keywords,
        mode: 'passive',
        status: 'completed'
      })

      // Generate audio in background
      setIsGeneratingAudio(true)
      try {
        const audioResponse = await generateConversationAudio(conversationWithIds)
        setAudioUrl(audioResponse.audioUrl)
        setTimestamps(audioResponse.timestamps)
        
        // Update history with audio? (The audio URL is saved, but we might need to update the lesson record text time)
        // For now, saveLesson created the record. We might need a way to update it.
        // But let's keep it simple as per plan.
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
  }, [selectedTopic, duration, speakers, keywords, mode, saveLesson])

  // Reset to config view
  const handleReset = useCallback(() => {
    setViewState('config')
    setConversation([])
    setAudioUrl(undefined)
    setTimestamps(undefined)
  }, [])

  // Play from History/Playlist - regenerate audio
  const handlePlaySession = useCallback(async (conversationData: ConversationLine[], topicName: string) => {
    // Set state first to show UI immediately
    setSelectedTopic({ id: 'history', name: topicName, description: 'From History' })
    setConversation(conversationData)
    setAudioUrl(undefined) // Reset audio first
    setTimestamps(undefined)
    setViewState('playing')
    setIsPlaylistOpen(false)
    setIsRecentOpen(false)
    
    // Generate audio in background
    setIsGeneratingAudio(true)
    try {
      const audioResponse = await generateConversationAudio(conversationData)
      setAudioUrl(audioResponse.audioUrl)
      setTimestamps(audioResponse.timestamps)
    } catch (audioError) {
      console.error('Audio regeneration failed:', audioError)
      toast.error('Không thể tạo audio', {
        description: 'Vui lòng thử lại sau',
      })
    } finally {
      setIsGeneratingAudio(false)
    }
  }, [])

  // Xử lý khi chọn entry từ RecentLessonsDropdown
  const handleRecentLessonPlay = useCallback((entry: { topic: string; content: Record<string, unknown> }) => {
    const script = entry.content?.script as ConversationLine[] | undefined
    if (script) {
      handlePlaySession(script, entry.topic)
    }
  }, [handlePlaySession])

  return (
    <div className="flex flex-col lg:h-[calc(100vh-6rem)] h-auto gap-4 px-4 lg:px-0 overflow-hidden">
      {/* Header */}
      <div className="flex-none">
        <FeatureHeader
          icon={Headphones}
          colorScheme="listening"
          title="Listening Practice"
          subtitle="140+ scenarios • AI-powered"
          actions={[
            { icon: History, label: "Gần đây", onClick: () => setIsRecentOpen(true) },
            { icon: ListMusic, label: "Playlists", onClick: () => setIsPlaylistOpen(true) },
            // Hiển thị nút "Mới" chỉ khi đang ở trạng thái playing
            ...(viewState === 'playing' ? [{ icon: RotateCcw, label: "Mới", onClick: handleReset }] : []),
          ]}
        />
      </div>

      {/* Main Content Area - Flexible height on desktop, Auto on mobile */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {/* View: Config */}
        {viewState === 'config' && (
          <div className="h-full flex flex-col lg:flex-row gap-6">
            {/* Left Column: Topic Picker - Chiều cao ngang với cột phải */}
            <div className="flex-1 min-h-0 lg:order-none order-1">
              <TopicPicker 
                onSelect={handleTopicSelect}
                selectedTopic={selectedTopic}
                className="h-full" 
              />
            </div>

            {/* Right Column: Config - Width cố định, chiều cao tự động */}
            <div className="lg:w-80 xl:w-96 shrink-0 flex flex-col gap-4 lg:order-none order-first">
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
                  onPlaylistGenerated={(result) => {
                    console.log('Radio playlist generated:', result)
                    toast.success(`🎵 Playlist "${result.playlist.name}" đã được tạo!`, {
                      description: `${result.items.length} bài • ${result.playlist.duration} phút`,
                      duration: 5000,
                    })
                    
                    // Add playlist to local state for immediate visibility
                    playlists.addRadioPlaylist({
                      id: result.playlist.id,
                      name: result.playlist.name,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      items: result.items.map(item => ({
                        id: item.id,
                        topic: item.topic,
                        duration: item.duration,
                        speakers: item.numSpeakers,
                        conversation: item.conversation.map((line, idx) => ({
                          id: `${item.id}-${idx}`,
                          speaker: line.speaker,
                          text: line.text,
                        })),
                      })),
                    })
                    
                    // Play first track immediately
                    if (result.items.length > 0) {
                      const firstItem = result.items[0]
                      const conversationWithIds = firstItem.conversation.map((line, idx) => ({
                        id: `${firstItem.id}-${idx}`,
                        speaker: line.speaker,
                        text: line.text,
                      }))
                      
                      setSelectedTopic({ 
                        id: firstItem.id, 
                        name: firstItem.topic, 
                        description: `Radio Mode - ${firstItem.category}` 
                      })
                      setSelectedCategory(firstItem.category)
                      setSelectedSubCategory(firstItem.subCategory)
                      setConversation(conversationWithIds)
                      setViewState('playing')
                      
                      toast.info(`▶️ Đang phát: ${firstItem.topic}`, { duration: 3000 })
                      
                      // Auto-generate audio for radio track
                      setIsGeneratingAudio(true)
                      generateConversationAudio(conversationWithIds)
                        .then((audioResponse) => {
                          setAudioUrl(audioResponse.audioUrl)
                          setTimestamps(audioResponse.timestamps)
                          toast.success('🎧 Audio đã sẵn sàng!')
                        })
                        .catch((err) => {
                          console.error('Radio audio generation failed:', err)
                          toast.error('Không thể tạo audio. Vui lòng thử lại.')
                        })
                        .finally(() => {
                          setIsGeneratingAudio(false)
                        })
                    }
                  }}
                  onRequireLogin={() => {
                    toast.error('Vui lòng đăng nhập để sử dụng Radio Mode')
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
          <div className="lg:flex-1 lg:min-h-0 overflow-y-auto pb-1">
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



      {/* Recent Lessons Dialog */}
      <Dialog open={isRecentOpen} onOpenChange={setIsRecentOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">Recent Lessons</DialogTitle>
          <RecentLessonsPanel 
            type="listening"
            isAuthenticated={!!user}
            onPlayEntry={(entry) => {
              handleRecentLessonPlay(entry)
              setIsRecentOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Playlist Dialog */}
      <Dialog open={isPlaylistOpen} onOpenChange={setIsPlaylistOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">Your Playlists</DialogTitle>
          <PlaylistPanel
            playlists={user ? playlists.playlists : []}
            isAuthenticated={!!user}
            onCreatePlaylist={playlists.createPlaylist}
            onDeletePlaylist={playlists.deletePlaylist}
            onRenamePlaylist={playlists.updatePlaylistName}
            onPlayPlaylist={(playlist) => {
              console.log('Play playlist', playlist)
              
              // Close dialog first
              setIsPlaylistOpen(false)
              
              // Check if playlist has items
              if (playlist.items.length === 0) {
                toast.error('Playlist này chưa có bài nào')
                return
              }
              
              // Get first item to play
              const firstItem = playlist.items[0]
              
              // Set up conversation and topic
              const conversationWithIds = firstItem.conversation.map((line, idx) => ({
                id: `${firstItem.id}-${idx}`,
                speaker: line.speaker,
                text: line.text,
              }))
              
              setSelectedTopic({ 
                id: firstItem.id, 
                name: firstItem.topic, 
                description: `Playlist: ${playlist.name}` 
              })
              setSelectedCategory('')
              setSelectedSubCategory('')
              setConversation(conversationWithIds)
              setViewState('playing')
              
              toast.info(`▶️ Đang phát: ${firstItem.topic}`, { duration: 3000 })
              
              // Auto-generate audio
              setIsGeneratingAudio(true)
              generateConversationAudio(conversationWithIds)
                .then((audioResponse) => {
                  setAudioUrl(audioResponse.audioUrl)
                  setTimestamps(audioResponse.timestamps)
                  toast.success('🎧 Audio đã sẵn sàng!')
                })
                .catch((err) => {
                  console.error('Playlist audio generation failed:', err)
                  toast.error('Không thể tạo audio. Vui lòng thử lại.')
                })
                .finally(() => {
                  setIsGeneratingAudio(false)
                })
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Error Toast/Overlay */}
      {error && (
        <div 
          role="alert"
          aria-live="assertive"
          className="fixed bottom-28 left-1/2 -translate-x-1/2 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm backdrop-blur-md shadow-lg z-50 w-[90%] max-w-md text-center"
        >
          {error}
        </div>
      )}
    </div>
  )
}
