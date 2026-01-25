"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TOPICS } from "@/data/mock-listening-topics"
import { cn } from "@/lib/utils"
import { Search, ChevronDown, ChevronUp, Star, X, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface TopicComboboxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

// Quick topics that show without expansion
const QUICK_TOPICS = [
  { emoji: "☀️", title: "Daily Routine" },
  { emoji: "💼", title: "Job Interview" },
  { emoji: "🍽️", title: "Restaurant Order" },
  { emoji: "✈️", title: "Travel Plans" },
  { emoji: "💻", title: "Technology" },
  { emoji: "🛒", title: "Shopping" },
]

export function TopicCombobox({ value, onChange, placeholder = "Type or select a topic..." }: TopicComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter topics based on search
  const filteredTopics = TOPICS.map(category => ({
    ...category,
    topics: category.topics.filter(topic =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.topics.length > 0)

  const handleSelectTopic = (topic: string) => {
    onChange(topic)
    setSearchQuery("")
    setIsOpen(false)
    setIsExpanded(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchQuery(newValue)
    onChange(newValue)
    if (newValue && !isOpen) setIsOpen(true)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const toggleFavorite = (topicTitle: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites(prev =>
      prev.includes(topicTitle)
        ? prev.filter(t => t !== topicTitle)
        : [...prev, topicTitle]
    )
  }

  return (
    <div ref={containerRef} className="relative w-full space-y-3">
      {/* Input Field */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
            onClick={() => {
              onChange("")
              setSearchQuery("")
              inputRef.current?.focus()
            }}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Quick Topics */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="size-3" />
          <span>Quick topics</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_TOPICS.map((topic) => (
            <Badge
              key={topic.title}
              variant={value === topic.title ? "default" : "outline"}
              className={cn(
                "cursor-pointer py-1.5 px-3 text-sm transition-all hover:scale-105",
                value === topic.title
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-transparent"
                  : "hover:bg-primary/10 hover:border-primary/50"
              )}
              onClick={() => handleSelectTopic(topic.title)}
            >
              {topic.emoji} {topic.title}
            </Badge>
          ))}
        </div>
      </div>

      {/* Expandable More Topics Section */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between text-muted-foreground hover:text-foreground h-8"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="flex items-center gap-2">
            <span className="text-xs">More topics ({TOPICS.reduce((acc, cat) => acc + cat.topics.length, 0)}+)</span>
          </span>
          {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </Button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {/* Search in expanded section */}
              {isExpanded && (
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search all topics..."
                    className="pl-10 h-9 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}

              <ScrollArea className="h-[200px] rounded-lg border bg-muted/20 p-2">
                <div className="space-y-3">
                  {filteredTopics.map((category) => (
                    <div key={category.category} className="space-y-1.5">
                      <div className="flex items-center gap-2 px-2 py-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {category.category}
                        </span>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          {category.topics.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {category.topics.map((topic) => (
                          <div
                            key={topic.id}
                            className={cn(
                              "group flex items-center justify-between gap-2 px-2.5 py-2 rounded-md cursor-pointer transition-all text-sm",
                              value === topic.title
                                ? "bg-primary/10 text-primary border border-primary/30"
                                : "hover:bg-muted border border-transparent"
                            )}
                            onClick={() => handleSelectTopic(topic.title)}
                          >
                            <span className="truncate flex-1">{topic.title}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => toggleFavorite(topic.title, e)}
                            >
                              <Star className={cn(
                                "size-3",
                                favorites.includes(topic.title)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              )} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {filteredTopics.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No topics found for "{searchQuery}"
                    </div>
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
