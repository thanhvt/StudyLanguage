"use client"

import * as React from "react"
import { useState, useMemo, useEffect } from "react"
import { Search, ChevronDown, ChevronRight, Star, Sparkles, Play, X } from "lucide-react"
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
import { CustomScenarioInput } from "./custom-scenario-input"
import type { TopicCategory, TopicScenario } from "@/types/listening-types"

interface TopicPickerProps {
  onSelect: (topic: TopicScenario, category: string, subCategory: string) => void
  selectedTopic?: TopicScenario | null
  className?: string
}

export function TopicPicker({ onSelect, selectedTopic, className }: TopicPickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>('it')
  const [expandedSubCategories, setExpandedSubCategories] = useState<string[]>(['agile'])
  const [searchQuery, setSearchQuery] = useState('')
  // Initialize empty to avoid hydration mismatch, then hydrate from localStorage
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Hydrate favorites from localStorage after mount (client-only)
  useEffect(() => {
    const saved = localStorage.getItem('favorite-scenarios')
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)))
    }
  }, [])

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
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Header & Search Section (Non-scrollable) */}
      <div className="flex-none space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
          <Input
            type="text"
            placeholder="Search scenarios…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-10 bg-secondary/30 border-border/50 focus:border-primary/50"
            aria-label="Search scenarios"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Clear search"
            >
              <X className="size-3 text-muted-foreground" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        {!searchQuery && (
          <div className="flex gap-1 p-1 bg-secondary/30 rounded-xl overflow-x-auto">
            {TOPIC_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg",
                  "text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  activeCategory === category.id
                    ? "bg-background shadow-md text-foreground"
                    : "text-foreground/60 hover:text-foreground hover:bg-background/50"
                )}
              >
                <span className="text-lg">{category.icon}</span>
                <span className="hidden sm:inline">{category.name}</span>
              </button>
            ))}
            {/* Custom Tab */}
            <button
              onClick={() => setActiveCategory('custom')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg",
                "text-sm font-medium transition-all duration-200 whitespace-nowrap",
                activeCategory === 'custom'
                  ? "bg-gradient-to-r from-primary/20 to-primary/10 shadow-md text-primary border border-primary/30"
                  : "text-foreground/60 hover:text-primary hover:bg-primary/5"
              )}
            >
              <Sparkles className="size-4" />
              <span className="hidden sm:inline">Custom</span>
            </button>
          </div>
        )}
      </div>

      {/* Content Area (Scrollable) */}
      <div className="flex-1 min-h-0 relative">
        <ScrollArea className="h-full pr-3">
          {/* Search Results */}
          {searchResults && searchResults.length > 0 && (
            <div className="space-y-2 pb-4">
              <p className="text-xs text-muted-foreground px-1">
                Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </p>
              {searchResults.map(({ category, subCategory, scenario }) => (
                <button
                  key={scenario.id}
                  onClick={() => handleSelect(scenario, category.id, subCategory.name)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-all duration-200",
                    "hover:bg-primary/10 hover:border-primary/30",
                    "border border-border/50 bg-card/50",
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
                </button>
              ))}
            </div>
          )}

          {searchResults && searchResults.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Search className="size-8 opacity-20 mb-2" />
              <p className="text-sm">No scenarios found</p>
            </div>
          )}

          {/* Custom Scenarios Tab */}
          {!searchQuery && activeCategory === 'custom' && (
            <CustomScenarioInput
              onSelect={onSelect}
              selectedTopic={selectedTopic}
              className="h-full"
            />
          )}

          {/* Categories List */}
          {!searchQuery && activeCategory !== 'custom' && currentCategory && (
            <div className="space-y-2 pb-4">
              {currentCategory.subCategories.map((subCategory) => {
                const isExpanded = expandedSubCategories.includes(subCategory.id)

                return (
                  <div 
                    key={subCategory.id} 
                    className="border border-border/50 rounded-xl overflow-hidden bg-card/30"
                  >
                    <button
                      onClick={() => toggleSubCategory(subCategory.id)}
                      className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium text-sm">{subCategory.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-primary/15 text-primary border-0">
                          {subCategory.scenarios.length}
                        </Badge>
                        <ChevronDown className={cn(
                          "size-4 text-muted-foreground transition-transform duration-200",
                          !isExpanded && "-rotate-90"
                        )} />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-2 space-y-1 bg-background/30 border-t border-border/30">
                        {subCategory.scenarios.map((scenario) => {
                          const isSelected = selectedTopic?.id === scenario.id
                          const isFavorite = favorites.has(scenario.id)

                          return (
                            <div
                              key={scenario.id}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded-lg transition-all duration-200",
                                "hover:bg-primary/10 cursor-pointer group",
                                isSelected && "bg-primary/15 ring-1 ring-primary/30"
                              )}
                              onClick={() => handleSelect(scenario, currentCategory.id, subCategory.name)}
                            >
                              <button
                                onClick={(e) => toggleFavorite(scenario.id, e)}
                                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                className={cn(
                                  "shrink-0 p-1 rounded-full hover:bg-background/80 transition-colors",
                                  isFavorite ? "text-yellow-500" : "text-muted-foreground/30 hover:text-yellow-500"
                                )}
                              >
                                <Star className={cn("size-3.5", isFavorite && "fill-current")} aria-hidden="true" />
                              </button>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {isSelected && (
                                    <Sparkles className="size-3 text-primary animate-pulse" />
                                  )}
                                  <p className="font-medium text-sm truncate leading-tight">{scenario.name}</p>
                                </div>
                                <p className="text-[11px] text-muted-foreground truncate opacity-70">
                                  {scenario.description}
                                </p>
                              </div>

                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label={`Play ${scenario.name}`}
                                className="size-6 opacity-50 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0"
                              >
                                <Play className="size-3 fill-primary text-primary" aria-hidden="true" />
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
          )}
        </ScrollArea>
      </div>

      {/* Selected Topic Footer (if needed) */}
      {selectedTopic && (
        <div className="flex-none flex items-center gap-3 p-3 bg-primary/10 rounded-xl border border-primary/20">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">Selected</p>
            <p className="text-sm font-medium truncate">{selectedTopic.name}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelect({ id: '', name: '', description: '' }, '', '')}
            className="shrink-0 h-7 text-xs hover:bg-primary/20"
          >
            Change
          </Button>
        </div>
      )}
    </div>
  )
}
