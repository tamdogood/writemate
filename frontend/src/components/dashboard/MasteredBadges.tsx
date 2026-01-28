'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star } from 'lucide-react'
import type { WritingPattern } from '@/hooks/useProgress'

interface MasteredBadgesProps {
  patterns: WritingPattern[]
}

export function MasteredBadges({ patterns }: MasteredBadgesProps) {
  if (patterns.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p>No mastered patterns yet</p>
        <p className="text-sm mt-1">Keep writing to overcome your common mistakes!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <span className="font-medium">
          {patterns.length} Pattern{patterns.length !== 1 ? 's' : ''} Mastered
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {patterns.map((pattern, index) => (
          <motion.div
            key={pattern.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Badge
              variant="secondary"
              className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200"
            >
              <Star className="w-4 h-4 mr-2 fill-yellow-500 text-yellow-500" />
              <span className="font-medium">{pattern.pattern_type}</span>
            </Badge>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 space-y-2">
        {patterns.map((pattern) => (
          <div
            key={pattern.id}
            className="p-3 bg-gray-50 rounded-lg text-sm"
          >
            <div className="font-medium text-green-600">
              {pattern.pattern_type}
            </div>
            <div className="text-gray-600 mt-1">
              {pattern.description}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Occurred {pattern.occurrence_count} times before mastery
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
