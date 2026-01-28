'use client'

import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface GoalsStepProps {
  goals: string[]
  onGoalsChange: (goals: string[]) => void
}

const goalOptions = [
  { id: 'academic', label: 'Academic Writing', description: 'Essays, research papers, thesis' },
  { id: 'professional', label: 'Professional Writing', description: 'Emails, reports, presentations' },
  { id: 'creative', label: 'Creative Writing', description: 'Stories, poems, scripts' },
  { id: 'blog', label: 'Blog & Content', description: 'Articles, social media, newsletters' },
  { id: 'personal', label: 'Personal Improvement', description: 'General writing skills' },
]

export function GoalsStep({ goals, onGoalsChange }: GoalsStepProps) {
  const toggleGoal = (goalId: string) => {
    if (goals.includes(goalId)) {
      onGoalsChange(goals.filter((g) => g !== goalId))
    } else {
      onGoalsChange([...goals, goalId])
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">What are your writing goals?</h2>
        <p className="text-gray-600">
          Select all that apply. This helps us personalize your feedback.
        </p>
      </div>

      <div className="space-y-4">
        {goalOptions.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <label
              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                goals.includes(goal.id)
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Checkbox
                id={goal.id}
                checked={goals.includes(goal.id)}
                onCheckedChange={() => toggleGoal(goal.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor={goal.id} className="text-lg font-medium cursor-pointer text-gray-900">
                  {goal.label}
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  {goal.description}
                </p>
              </div>
            </label>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
