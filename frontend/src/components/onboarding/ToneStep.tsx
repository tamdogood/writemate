'use client'

import { motion } from 'framer-motion'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface ToneStepProps {
  tone: string
  onToneChange: (tone: string) => void
}

const toneOptions = [
  {
    id: 'supportive',
    label: 'Supportive',
    description: 'Encouraging feedback that builds confidence. Great for beginners.',
    emoji: '🤗',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Mix of encouragement and constructive criticism. Best for most writers.',
    emoji: '⚖️',
  },
  {
    id: 'direct',
    label: 'Direct',
    description: 'Straight-to-the-point feedback. No fluff, just actionable advice.',
    emoji: '🎯',
  },
  {
    id: 'strict',
    label: 'Strict',
    description: 'Rigorous critique for those who want to be challenged.',
    emoji: '📏',
  },
]

export function ToneStep({ tone, onToneChange }: ToneStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">How should we give feedback?</h2>
        <p className="text-gray-600">
          Choose the tone that works best for you.
        </p>
      </div>

      <RadioGroup value={tone} onValueChange={onToneChange} className="space-y-4">
        {toneOptions.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <label
              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                tone === option.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{option.emoji}</span>
                  <Label htmlFor={option.id} className="text-lg font-medium cursor-pointer text-gray-900">
                    {option.label}
                  </Label>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {option.description}
                </p>
              </div>
            </label>
          </motion.div>
        ))}
      </RadioGroup>
    </div>
  )
}
