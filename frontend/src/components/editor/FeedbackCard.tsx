'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import type { Annotation } from '@/hooks/useDocuments'

interface FeedbackCardProps {
  annotation: Annotation
  isSelected: boolean
  onSelect: () => void
  onDismiss: () => void
  onApplySuggestion?: () => void
}

const severityConfig = {
  error: {
    icon: AlertCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
  },
}

export const FeedbackCard = React.forwardRef<HTMLDivElement, FeedbackCardProps>(
  ({ annotation, isSelected, onSelect, onDismiss, onApplySuggestion }, ref) => {
    const config = severityConfig[annotation.severity]
    const Icon = config.icon

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        onClick={onSelect}
        className={`p-4 rounded-lg border cursor-pointer transition-all ${config.bg} ${config.border} ${
          isSelected ? 'ring-2 ring-primary' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 mt-0.5 ${config.color}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className={config.badge}>
                {annotation.category}
              </Badge>
            </div>
            
            {annotation.suggestion && (
              <p className="text-lg text-primary font-medium mb-3">
                {annotation.suggestion}
              </p>
            )}

            <div className="flex gap-2 mb-3">
              {annotation.suggestion && onApplySuggestion && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={(e) => {
                    e.stopPropagation()
                    onApplySuggestion()
                  }}
                  className="h-7 text-xs gap-1"
                >
                  <Check className="w-3 h-3" />
                  Apply Suggestion
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onDismiss()
                }}
                className="h-7 text-xs gap-1"
              >
                <X className="w-3 h-3" />
                Dismiss
              </Button>
            </div>

            <div className="bg-card rounded-md p-2 text-xs border">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Reasoning: </span>
                {annotation.message}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }
)

FeedbackCard.displayName = 'FeedbackCard'
