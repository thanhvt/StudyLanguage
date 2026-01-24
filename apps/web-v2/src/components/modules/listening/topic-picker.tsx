"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { Search, ChevronDown, ChevronRight, Star, Sparkles, Play } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { 
  TOPIC_CATEGORIES, 
  searchScenarios, 
  getTotalScenarios 
} from "@/data/topic-data"
import type { TopicCategory, TopicScenario } from "@/types/listening-types"

interface TopicPickerProps {
  onSelect: (topic: TopicScenario, category: string, subCategory: string) => void
  selectedTopic?: TopicScenario | null
}

export function TopicPicker({ onSelect, selectedTopic }: TopicPickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>('it')
  const [expandedSubCategories, setExpandedSubCategories] = useState<string[]>(['agile'])
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('favorite-scenarios')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    }
    return new Set()
  })

  const totalScenarios = getTotalScenarios()

  // Filter scenarios by search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null
    return searchScenarios(searchQuery)
  }, [searchQuery])

  // Get current category
  const currentCategory = TOPIC_CATEGORIES.find(c => c.id === activeCategory)

  // Toggle subcategory expansion
  const toggleSubCategory = (subCategoryId: string) => {
    setExpandedSubCategories(prev =>
      prev.includes(subCategoryId)
        ? prev.filter(id => id !== subCategoryId)
        : [...prev, subCategoryId]
    )
  }

  // Toggle favorite
  const toggleFavorite = (scenarioId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(scenarioId)) {
        next.delete(scenarioId)
      } else {
        next.add(scenarioId)
      }
      localStorage.setItem('favorite-scenarios', JSON.stringify([...next]))
      return next
    })
  }

  // Handle scenario selection
  const handleSelect = (
    scenario: TopicScenario, 
    categoryId: string, 
    subCategoryName: string
  ) => {
    onSelect(scenario, categoryId, subCategoryName)
    setSearchQuery('')
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-semibold">Choose a Topic</h2>
        <Badge variant="secondary" className="font-mono">
          {totalScenarios} scenarios
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search scenarios... (e.g., Sprint, Hotel, Dating)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-secondary/30 border-border/50 focus:border-primary/50"
        />
      </div>

      {/* Search Results */}
      {searchResults && searchResults.length > 0 && (
        <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm">
          <p className="text-xs text-muted-foreground mb-3">
            Found {searchResults.length} results
          </p>
          <ScrollArea className="max-h-60">
            <div className="space-y-2">
              {searchResults.map(({ category, subCategory, scenario }) => (
                <button
                  key={scenario.id}
                  onClick={() => handleSelect(scenario, category.id, subCategory.name)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-all duration-200",
                    "hover:bg-primary/10 hover:border-primary/30",
                    "border border-transparent",
                    selectedTopic?.id === scenario.id && "bg-primary/20 border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                    <ChevronRight className="size-3" />
                    <span>{subCategory.name}</span>
                  </div>
                  <p className="font-medium text-sm">{scenario.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{scenario.description}</p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {searchResults && searchResults.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No matching scenarios found
        </p>
      )}

      {/* Category Tabs */}
      {!searchQuery && (
        <>
          <div className="flex gap-1 p-1 bg-secondary/30 rounded-xl overflow-x-auto">
            {TOPIC_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg",
                  "text-sm font-medium transition-all duration-200",
                  activeCategory === category.id
                    ? "bg-background shadow-md text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <span className="text-lg">{category.icon}</span>
                <span className="hidden sm:inline">{category.name}</span>
              </button>
            ))}
          </div>

          {/* Category Description */}
          {currentCategory && (
            <p className="text-sm text-muted-foreground">
              {currentCategory.description}
            </p>
          )}

          {/* SubCategories Accordion */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {currentCategory?.subCategories.map((subCategory) => {
                const isExpanded = expandedSubCategories.includes(subCategory.id)

                return (
                  <div 
                    key={subCategory.id} 
                    className="border border-border/50 rounded-xl overflow-hidden bg-card/50"
                  >
                    {/* SubCategory Header */}
                    <button
                      onClick={() => toggleSubCategory(subCategory.id)}
                      className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium text-sm">{subCategory.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {subCategory.scenarios.length}
                        </Badge>
                        {isExpanded ? (
                          <ChevronDown className="size-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="size-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {/* Scenarios List */}
                    {isExpanded && (
                      <div className="p-2 space-y-1 bg-background/50 border-t border-border/30">
                        {subCategory.scenarios.map((scenario) => {
                          const isSelected = selectedTopic?.id === scenario.id
                          const isFavorite = favorites.has(scenario.id)

                          return (
                            <div
                              key={scenario.id}
                              className={cn(
                                "flex items-center gap-2 p-2.5 rounded-lg transition-all duration-200",
                                "hover:bg-primary/10 cursor-pointer group",
                                isSelected && "bg-primary/15 ring-1 ring-primary/30"
                              )}
                              onClick={() => handleSelect(scenario, currentCategory.id, subCategory.name)}
                            >
                              {/* Favorite Button */}
                              <button
                                onClick={(e) => toggleFavorite(scenario.id, e)}
                                className={cn(
                                  "shrink-0 transition-colors p-1 rounded",
                                  isFavorite 
                                    ? "text-yellow-500 hover:text-yellow-600" 
                                    : "text-muted-foreground/40 hover:text-yellow-500"
                                )}
                              >
                                <Star className={cn("size-4", isFavorite && "fill-yellow-500")} />
                              </button>

                              {/* Scenario Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {isSelected && (
                                    <Sparkles className="size-3.5 text-primary animate-pulse" />
                                  )}
                                  <p className="font-medium text-sm truncate">{scenario.name}</p>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {scenario.description}
                                </p>
                              </div>

                              {/* Play Button on Hover */}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              >
                                <Play className="size-4 fill-primary text-primary" />
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </>
      )}

      {/* Selected Topic Display */}
      {selectedTopic && (
        <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-xl border border-primary/20">
          <Sparkles className="size-4 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedTopic.name}</p>
            <p className="text-xs text-muted-foreground truncate">{selectedTopic.description}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelect({ id: '', name: '', description: '' }, '', '')}
            className="shrink-0 text-xs"
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  )
}
