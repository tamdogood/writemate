'use client'

import React, { useRef, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeedbackCard } from './FeedbackCard'
import type { Annotation } from '@/hooks/useDocuments'
import { AlertCircle, AlertTriangle, Info } from 'lucide-react'

interface FeedbackPanelProps {
  annotations: Annotation[]
  selectedAnnotationId: string | null
  onSelectAnnotation: (id: string) => void
  onDismissAnnotation: (id: string) => void
  onApplySuggestion?: (annotation: Annotation) => void
}

export function FeedbackPanel({
  annotations,
  selectedAnnotationId,
  onSelectAnnotation,
  onDismissAnnotation,
  onApplySuggestion,
}: FeedbackPanelProps) {
  const cardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
  const errors = annotations.filter((a) => a.severity === 'error')
  const warnings = annotations.filter((a) => a.severity === 'warning')
  const infos = annotations.filter((a) => a.severity === 'info')

  useEffect(() => {
    if (selectedAnnotationId) {
      const card = cardRefs.current.get(selectedAnnotationId)
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [selectedAnnotationId])

  const renderAnnotationList = (items: Annotation[]) => {
    if (items.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No issues in this category
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <AnimatePresence>
          {items.map((annotation) => (
            <FeedbackCard
              key={annotation.id}
              ref={(el) => cardRefs.current.set(annotation.id, el)}
              annotation={annotation}
              isSelected={selectedAnnotationId === annotation.id}
              onSelect={() => onSelectAnnotation(annotation.id)}
              onDismiss={() => onDismissAnnotation(annotation.id)}
              onApplySuggestion={
                onApplySuggestion ? () => onApplySuggestion(annotation) : undefined
              }
            />
          ))}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-card border-l">
      <div className="p-4 border-b flex-shrink-0">
        <h2 className="font-semibold text-lg text-foreground">Feedback</h2>
        <p className="text-sm text-muted-foreground">
          {annotations.length} issues found
        </p>
      </div>

      <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 mt-2 flex-shrink-0">
          <TabsTrigger value="all" className="flex-1">
            All ({annotations.length})
          </TabsTrigger>
          <TabsTrigger value="errors" className="flex-1 gap-1">
            <AlertCircle className="w-3 h-3" />
            ({errors.length})
          </TabsTrigger>
          <TabsTrigger value="warnings" className="flex-1 gap-1">
            <AlertTriangle className="w-3 h-3" />
            ({warnings.length})
          </TabsTrigger>
          <TabsTrigger value="info" className="flex-1 gap-1">
            <Info className="w-3 h-3" />
            ({infos.length})
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="all" className="mt-0 m-0">
            {renderAnnotationList(annotations)}
          </TabsContent>
          <TabsContent value="errors" className="mt-0 m-0">
            {renderAnnotationList(errors)}
          </TabsContent>
          <TabsContent value="warnings" className="mt-0 m-0">
            {renderAnnotationList(warnings)}
          </TabsContent>
          <TabsContent value="info" className="mt-0 m-0">
            {renderAnnotationList(infos)}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
