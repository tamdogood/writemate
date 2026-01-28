'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle } from 'lucide-react'
import type { WritingPattern } from '@/hooks/useProgress'

interface PatternsListProps {
  patterns: WritingPattern[]
}

export function PatternsList({ patterns }: PatternsListProps) {
  if (patterns.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p>No recurring patterns detected</p>
        <p className="text-sm mt-1">We&apos;ll identify areas for improvement as you write more.</p>
      </div>
    )
  }

  // Progress toward mastery: need 3+ occurrences and no occurrence in last 5 docs
  const getMasteryProgress = (count: number) => {
    // Simplified: show progress as percentage towards 3 occurrences
    return Math.min((count / 3) * 100, 100)
  }

  return (
    <div className="space-y-4">
      {patterns.map((pattern, index) => (
        <motion.div
          key={pattern.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="p-4 bg-white rounded-lg border border-gray-200"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{pattern.pattern_type}</span>
                <Badge variant="outline" className="text-xs">
                  {pattern.occurrence_count}x
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {pattern.description}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress to mastery</span>
              <span>
                {pattern.occurrence_count >= 3
                  ? 'Avoid in 5 more docs'
                  : `${3 - pattern.occurrence_count} more occurrences needed`}
              </span>
            </div>
            <Progress value={getMasteryProgress(pattern.occurrence_count)} className="h-2" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
