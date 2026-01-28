'use client'

import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface FocusAreasStepProps {
  focusAreas: string[]
  onFocusAreasChange: (areas: string[]) => void
}

const focusOptions = [
  { id: 'grammar', label: 'Grammar & Punctuation', icon: '📝' },
  { id: 'clarity', label: 'Clarity & Conciseness', icon: '💡' },
  { id: 'vocabulary', label: 'Vocabulary Expansion', icon: '📚' },
  { id: 'structure', label: 'Sentence Structure', icon: '🏗️' },
  { id: 'flow', label: 'Flow & Transitions', icon: '🌊' },
  { id: 'tone', label: 'Tone & Voice', icon: '🎭' },
]

export function FocusAreasStep({ focusAreas, onFocusAreasChange }: FocusAreasStepProps) {
  const toggleArea = (areaId: string) => {
    if (focusAreas.includes(areaId)) {
      onFocusAreasChange(focusAreas.filter((a) => a !== areaId))
    } else {
      onFocusAreasChange([...focusAreas, areaId])
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">What do you want to focus on?</h2>
        <p className="text-gray-600">
          Select areas you&apos;d like extra feedback on. Choose at least one.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {focusOptions.map((area, index) => (
          <motion.div
            key={area.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <label
              className={`flex flex-col items-center gap-2 p-6 rounded-xl border-2 cursor-pointer transition-all text-center ${
                focusAreas.includes(area.id)
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Checkbox
                id={area.id}
                checked={focusAreas.includes(area.id)}
                onCheckedChange={() => toggleArea(area.id)}
                className="sr-only"
              />
              <span className="text-3xl">{area.icon}</span>
              <Label htmlFor={area.id} className="font-medium cursor-pointer text-gray-900">
                {area.label}
              </Label>
            </label>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
