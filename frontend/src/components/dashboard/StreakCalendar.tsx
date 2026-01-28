'use client'

import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

interface StreakCalendarProps {
  currentStreak: number
  bestStreak: number
  activeDays?: Date[]
}

export function StreakCalendar({
  currentStreak,
  bestStreak,
  activeDays = [],
}: StreakCalendarProps) {
  const today = new Date()
  const daysInWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  // Generate last 4 weeks of dates
  const weeks: Date[][] = []
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 27) // Go back 4 weeks

  for (let w = 0; w < 4; w++) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + w * 7 + d)
      week.push(date)
    }
    weeks.push(week)
  }

  const isActiveDay = (date: Date) => {
    return activeDays.some(
      (d) =>
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
    )
  }

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isFuture = (date: Date) => {
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    return dateStart > todayStart
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 border border-gray-100"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Daily Streak</h3>
          <p className="text-sm text-gray-500">Keep writing every day!</p>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysInWeek.map((day, i) => (
            <div key={i} className="text-center text-xs text-gray-400 font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((date, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`aspect-square rounded-md flex items-center justify-center text-xs ${
                    isFuture(date)
                      ? 'bg-gray-50 text-gray-300'
                      : isActiveDay(date)
                        ? 'bg-orange-500 text-white'
                        : isToday(date)
                          ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-500'
                          : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {date.getDate()}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Streak Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div>
          <div className="text-2xl font-bold text-orange-500">{currentStreak}</div>
          <div className="text-xs text-gray-500">Current streak</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{bestStreak}</div>
          <div className="text-xs text-gray-500">Best streak</div>
        </div>
      </div>
    </motion.div>
  )
}
