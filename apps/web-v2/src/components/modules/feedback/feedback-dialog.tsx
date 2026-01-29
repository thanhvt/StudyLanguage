"use client"

import * as React from "react"
import { useState } from "react"
import {
  Bug,
  Lightbulb,
  MessageCircle,
  BookOpen,
  Send,
  Loader2,
  CheckCircle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"

// Feedback types with icons and labels
const feedbackTypes = [
  {
    id: "bug" as const,
    label: "Báo lỗi",
    icon: Bug,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    description: "Báo cáo lỗi hoặc sự cố",
  },
  {
    id: "feature" as const,
    label: "Đề xuất",
    icon: Lightbulb,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    description: "Đề xuất tính năng mới",
  },
  {
    id: "general" as const,
    label: "Góp ý",
    icon: MessageCircle,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    description: "Góp ý chung về ứng dụng",
  },
  {
    id: "content" as const,
    label: "Nội dung",
    icon: BookOpen,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    description: "Góp ý về nội dung bài học",
  },
]

type FeedbackType = "bug" | "feature" | "general" | "content"

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const { user } = useAuth()
  const [type, setType] = useState<FeedbackType>("general")
  const [email, setEmail] = useState(user?.email || "")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setType("general")
      setEmail(user?.email || "")
      setTitle("")
      setDescription("")
      setIsSuccess(false)
      setError(null)
    }
  }, [open, user?.email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          type,
          title,
          description,
          pageUrl: window.location.href,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Có lỗi xảy ra")
      }

      setIsSuccess(true)
      
      // Auto close after 2 seconds
      setTimeout(() => {
        onOpenChange(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedType = feedbackTypes.find((t) => t.id === type)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] glass-card !bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <MessageCircle className="size-5 text-primary" />
            Góp ý & Phản hồi
          </DialogTitle>
          <DialogDescription>
            Ý kiến của bạn giúp chúng tôi cải thiện ứng dụng tốt hơn
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="size-8 text-emerald-500" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">Cảm ơn bạn!</h3>
              <p className="text-muted-foreground text-sm">
                Góp ý của bạn đã được gửi thành công
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Loại góp ý</Label>
              <div className="grid grid-cols-4 gap-2">
                {feedbackTypes.map((feedbackType) => {
                  const Icon = feedbackType.icon
                  const isSelected = type === feedbackType.id
                  return (
                    <button
                      key={feedbackType.id}
                      type="button"
                      onClick={() => setType(feedbackType.id)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200",
                        "hover:scale-[1.02] active:scale-[0.98]",
                        isSelected
                          ? cn(
                              feedbackType.bgColor,
                              feedbackType.borderColor,
                              "shadow-lg"
                            )
                          : "border-border/50 hover:border-border bg-muted/30 hover:bg-muted/50"
                      )}
                    >
                      <div
                        className={cn(
                          "size-8 rounded-lg flex items-center justify-center transition-colors",
                          isSelected ? feedbackType.bgColor : "bg-background"
                        )}
                      >
                        <Icon
                          className={cn(
                            "size-4 transition-colors",
                            isSelected ? feedbackType.color : "text-muted-foreground"
                          )}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium transition-colors",
                          isSelected ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {feedbackType.label}
                      </span>
                    </button>
                  )
                })}
              </div>
              {selectedType && (
                <p className="text-xs text-muted-foreground pl-1">
                  {selectedType.description}
                </p>
              )}
            </div>

            {/* Email - only show for guests */}
            {!user && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-muted/30 border-border/50 focus:border-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Để chúng tôi có thể phản hồi lại bạn
                </p>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Tiêu đề <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Mô tả ngắn gọn..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
                className="bg-muted/30 border-border/50 focus:border-primary"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Chi tiết <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết vấn đề hoặc đề xuất của bạn..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                maxLength={1000}
                className="bg-muted/30 border-border/50 focus:border-primary resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/1000
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isSubmitting || !email || !title || !description}
              className="w-full h-11 font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="size-4 mr-2" />
                  Gửi góp ý
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
