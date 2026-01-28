'use client'

import { motion } from 'framer-motion'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface ExperienceStepProps {
  experience: string
  onExperienceChange: (experience: string) => void
}

const experienceLevels = [
  {
    id: 'beginner',
    label: 'Beginner',
    description: 'Just getting started with writing. Looking for basic guidance.',
    icon: '🌱',
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    description: 'Comfortable with writing basics. Want to improve style and clarity.',
    icon: '🌿',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Experienced writer seeking nuanced feedback and polish.',
    icon: '🌳',
  },
  {
    id: 'professional',
    label: 'Professional',
    description: 'Expert level. Looking for subtle improvements and consistency.',
    icon: '🏆',
  },
]

export function ExperienceStep({ experience, onExperienceChange }: ExperienceStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">What&apos;s your experience level?</h2>
        <p className="text-gray-600">
          We&apos;ll adjust feedback complexity to match your level.
        </p>
      </div>

      <RadioGroup value={experience} onValueChange={onExperienceChange} className="space-y-4">
        {experienceLevels.map((level, index) => (
          <motion.div
            key={level.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <label
              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                experience === level.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <RadioGroupItem value={level.id} id={level.id} className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{level.icon}</span>
                  <Label htmlFor={level.id} className="text-lg font-medium cursor-pointer text-gray-900">
                    {level.label}
                  </Label>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {level.description}
                </p>
              </div>
            </label>
          </motion.div>
        ))}
      </RadioGroup>
    </div>
  )
}
