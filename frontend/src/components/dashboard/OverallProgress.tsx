'use client'

import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'

interface OverallProgressProps {
  percentage: number
  subtitle?: string
}

export function OverallProgress({ percentage, subtitle }: OverallProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 border border-gray-100"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="text-3xl font-bold text-orange-500">{percentage}%</div>
      </div>
      <Progress value={percentage} className="h-3" />
    </motion.div>
  )
}
