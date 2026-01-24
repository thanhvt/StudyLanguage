"use client"

import { useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mic, Search, Star, X } from "lucide-react"
import { TOPICS } from "@/data/mock-listening-topics"
import { cn } from "@/lib/utils"

interface TopicPickerProps {
  value?: string
  onSelect: (topic: string) => void
  onClose?: () => void
}

export function TopicPicker({ value, onSelect, onClose }: TopicPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])

  // Filter topics based on search
  const filteredTopics = TOPICS.map(category => ({
    ...category,
    topics: category.topics.filter(topic => 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.topics.length > 0)

  const toggleFavorite = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    )
  }

  const handleSelectTopic = (topic: { title: string }) => {
    onSelect(topic.title)
    if (onClose) onClose()
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-display font-semibold">Choose a Topic</h2>
            <p className="text-sm text-muted-foreground">Select a conversation scenario to practice</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input 
          placeholder="Search topics..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Quick Topics */}
      {!searchQuery && (
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => handleSelectTopic({ title: "Daily Routine" })}
          >
            ☀️ Daily Routine
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => handleSelectTopic({ title: "Job Interview" })}
          >
            💼 Job Interview
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => handleSelectTopic({ title: "Restaurant Order" })}
          >
            🍽️ Restaurant Order
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => handleSelectTopic({ title: "Travel Plans" })}
          >
            ✈️ Travel Plans
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => handleSelectTopic({ title: "Technology" })}
          >
            💻 Technology
          </Badge>
        </div>
      )}

      {/* Topics List */}
      <div className="max-h-[400px] overflow-y-auto pr-2 -mr-2">
        <Accordion type="single" collapsible className="w-full space-y-2">
          {filteredTopics.map((category, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`} 
              className="border rounded-lg bg-card/50 px-4 shadow-xs"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <span className="font-medium text-lg">{category.category}</span>
                <Badge variant="secondary" className="ml-2">
                  {category.topics.length}
                </Badge>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="grid grid-cols-1 gap-2">
                  {category.topics.map((topic) => (
                    <Card 
                      key={topic.id} 
                      className={cn(
                        "border border-border/50 hover:border-primary/50 transition-colors cursor-pointer group",
                        value === topic.title && "border-primary bg-primary/5"
                      )}
                      onClick={() => handleSelectTopic(topic)}
                    >
                      <CardContent className="p-3 flex items-center justify-between gap-3">
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <h3 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                            {topic.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {topic.description}
                          </p>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="shrink-0 h-8 w-8"
                          onClick={(e) => toggleFavorite(topic.id, e)}
                        >
                          <Star className={cn(
                            "size-4 transition-all",
                            favorites.includes(topic.id) 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "text-muted-foreground hover:text-yellow-400"
                          )} />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* No Results */}
      {filteredTopics.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No topics found for "{searchQuery}"</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  )
}
