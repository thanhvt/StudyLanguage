"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play } from "lucide-react"
import { TOPICS } from "@/data/mock-listening-topics"

export function TopicPicker() {
  return (
    <div className="w-full space-y-4">
      <h2 className="text-xl font-display font-semibold">Choose a Topic</h2>
      <Accordion type="single" collapsible className="w-full space-y-2">
        {TOPICS.map((category, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg bg-card px-4 shadow-xs">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="font-medium text-lg">{category.category}</span>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {category.topics.map((topic) => (
                  <Card key={topic.id} className="border border-border/50 hover:border-primary/50 transition-colors cursor-pointer group">
                    <CardContent className="p-4 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{topic.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{topic.description}</p>
                      </div>
                      <Button size="icon" variant="ghost" className="shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="size-4 fill-primary text-primary" />
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
  )
}
