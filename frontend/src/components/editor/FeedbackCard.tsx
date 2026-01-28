'use client'

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

export function FeedbackCard({
  annotation,
  isSelected,
  onSelect,
  onDismiss,
  onApplySuggestion,
}: FeedbackCardProps) {
  const config = severityConfig[annotation.severity]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={onSelect}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${config.bg} ${config.border} ${
        isSelected ? 'ring-2 ring-orange-500' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 ${config.color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className={config.badge}>
              {annotation.category}
            </Badge>
          </div>
          <p className="text-sm text-gray-800 mb-2">
            {annotation.message}
          </p>
          {annotation.suggestion && (
            <div className="bg-white rounded-md p-2 text-sm border border-gray-200">
              <span className="text-gray-500">Suggestion: </span>
              <span className="text-orange-600">
                {annotation.suggestion}
              </span>
            </div>
          )}
          <div className="flex gap-2 mt-3">
            {annotation.suggestion && onApplySuggestion && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  onApplySuggestion()
                }}
                className="h-7 text-xs gap-1"
              >
                <Check className="w-3 h-3" />
                Apply
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
        </div>
      </div>
    </motion.div>
  )
}
