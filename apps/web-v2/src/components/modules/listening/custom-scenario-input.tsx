"use client"

import * as React from "react"
import { useState } from "react"
import { Plus, Star, Trash2, Sparkles, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useCustomScenarios, CustomScenario } from "@/hooks/use-custom-scenarios"
import { useAuth } from "@/components/providers/auth-provider"
import { AuthActionGuard } from "@/components/auth"
import type { TopicScenario } from "@/types/listening-types"

interface CustomScenarioInputProps {
  onSelect: (topic: TopicScenario, category: string, subCategory: string) => void
  selectedTopic?: TopicScenario | null
  className?: string
}

export function CustomScenarioInput({ 
  onSelect, 
  selectedTopic, 
  className 
}: CustomScenarioInputProps) {
  const { user } = useAuth()
  const { 
    scenarios, 
    loading, 
    createScenario, 
    deleteScenario, 
    toggleFavorite 
  } = useCustomScenarios()

  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Handle create new scenario
  const handleCreate = async () => {
    if (!newName.trim()) return

    setIsSaving(true)
    try {
      await createScenario(newName.trim(), newDescription.trim())
      setNewName('')
      setNewDescription('')
      setIsCreating(false)
    } catch {
      // Error handled in hook
    } finally {
      setIsSaving(false)
    }
  }

  // Handle select scenario
  const handleSelect = (scenario: CustomScenario) => {
    const topicScenario: TopicScenario = {
      id: scenario.id,
      name: scenario.name,
      description: scenario.description,
    }
    onSelect(topicScenario, 'custom', 'Custom Scenarios')
  }

  // Handle favorite toggle
  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await toggleFavorite(id)
    } catch {
      // Error handled in hook
    }
  }

  // Handle delete
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await deleteScenario(id)
    } catch {
      // Error handled in hook
    }
  }

  // Not logged in state
  if (!user) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Sparkles className="size-7 text-primary" />
        </div>
        <h3 className="font-semibold mb-2">Custom Scenarios</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Đăng nhập để tạo và lưu scenarios của riêng bạn
        </p>
        <AuthActionGuard message="Đăng nhập để tạo custom scenario">
          <Button size="sm">Đăng nhập</Button>
        </AuthActionGuard>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Custom Scenarios
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {scenarios.length} scenarios đã tạo
          </p>
        </div>
        
        {!isCreating && (
          <Button 
            size="sm" 
            onClick={() => setIsCreating(true)}
            className="gap-1.5"
          >
            <Plus className="size-4" />
            Tạo mới
          </Button>
        )}
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
          <Input
            placeholder="Tên scenario (VD: Phỏng vấn xin việc)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="bg-background"
            autoFocus
          />
          <Textarea
            placeholder="Mô tả chi tiết (optional)..."
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="bg-background resize-none h-20"
          />
          <div className="flex gap-2 justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setIsCreating(false)
                setNewName('')
                setNewDescription('')
              }}
            >
              Hủy
            </Button>
            <Button 
              size="sm" 
              onClick={handleCreate}
              disabled={!newName.trim() || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 mr-1.5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Plus className="size-4 mr-1.5" />
                  Tạo
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Scenarios List */}
      <ScrollArea className="flex-1 h-[300px]">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && scenarios.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <Sparkles className="size-5 text-muted-foreground opacity-50" />
            </div>
            <p className="text-sm text-muted-foreground">Chưa có custom scenario nào</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Nhấn "Tạo mới" để bắt đầu
            </p>
          </div>
        )}

        {!loading && scenarios.length > 0 && (
          <div className="space-y-2 pr-2">
            {scenarios.map((scenario) => {
              const isSelected = selectedTopic?.id === scenario.id

              return (
                <button
                  key={scenario.id}
                  onClick={() => handleSelect(scenario)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl transition-all duration-200 group",
                    "border hover:border-primary/30 hover:bg-primary/5",
                    isSelected 
                      ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20"
                      : "border-border/50 bg-card/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Favorite button */}
                    <button
                      onClick={(e) => handleToggleFavorite(scenario.id, e)}
                      className={cn(
                        "shrink-0 p-1 rounded-full transition-colors mt-0.5",
                        scenario.isFavorite 
                          ? "text-yellow-500" 
                          : "text-muted-foreground/30 hover:text-yellow-500"
                      )}
                    >
                      <Star className={cn("size-4", scenario.isFavorite && "fill-current")} />
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <Sparkles className="size-3 text-primary animate-pulse" />
                        )}
                        <p className="font-medium text-sm truncate">{scenario.name}</p>
                      </div>
                      {scenario.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5 opacity-70">
                          {scenario.description}
                        </p>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDelete(scenario.id, e)}
                      className={cn(
                        "shrink-0 p-1.5 rounded-full transition-colors",
                        "text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10",
                        "opacity-0 group-hover:opacity-100"
                      )}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
