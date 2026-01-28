'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  iconColor?: string
  iconBg?: string
  delay?: number
}

export function StatsCard({
  icon: Icon,
  label,
  value,
  iconColor = 'text-orange-500',
  iconBg = 'bg-orange-50',
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl p-5 border border-gray-100"
    >
      <div className={`inline-flex p-2.5 rounded-xl ${iconBg} mb-3`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </motion.div>
  )
}
