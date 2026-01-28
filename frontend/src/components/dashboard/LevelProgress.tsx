'use client'

import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { Star } from 'lucide-react'

interface LevelProgressProps {
  level: number
  currentXP: number
  requiredXP: number
}

export function LevelProgress({ level, currentXP, requiredXP }: LevelProgressProps) {
  const percentage = Math.min((currentXP / requiredXP) * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 border border-gray-100"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
          <Star className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="text-sm text-gray-500">Current Level</div>
          <div className="text-2xl font-bold text-gray-900">Level {level}</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Progress to Level {level + 1}</span>
          <span className="font-medium text-gray-900">{currentXP} / {requiredXP} XP</span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>
    </motion.div>
  )
}
