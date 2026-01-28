'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useSession } from '@/contexts/SessionContext'
import { GoalsStep } from './GoalsStep'
import { ExperienceStep } from './ExperienceStep'
import { FocusAreasStep } from './FocusAreasStep'
import { ToneStep } from './ToneStep'

const steps = ['Goals', 'Experience', 'Focus Areas', 'Tone']

export function OnboardingWizard() {
  const router = useRouter()
  const { sessionId, createSession, updatePersona } = useSession()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    goals: [] as string[],
    experience_level: 'intermediate',
    focus_areas: [] as string[],
    preferred_tone: 'balanced',
  })

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.goals.length > 0
      case 1:
        return formData.experience_level !== ''
      case 2:
        return formData.focus_areas.length > 0
      case 3:
        return formData.preferred_tone !== ''
      default:
        return true
    }
  }

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsSubmitting(true)
      try {
        let sid = sessionId
        if (!sid) {
          sid = await createSession()
        }
        await updatePersona(formData, sid)
        router.push('/editor')
      } catch (error) {
        console.error('Failed to save persona:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] p-4">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
        >
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{steps[currentStep]}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 0 && (
                <GoalsStep
                  goals={formData.goals}
                  onGoalsChange={(goals) => setFormData({ ...formData, goals })}
                />
              )}
              {currentStep === 1 && (
                <ExperienceStep
                  experience={formData.experience_level}
                  onExperienceChange={(experience_level) =>
                    setFormData({ ...formData, experience_level })
                  }
                />
              )}
              {currentStep === 2 && (
                <FocusAreasStep
                  focusAreas={formData.focus_areas}
                  onFocusAreasChange={(focus_areas) =>
                    setFormData({ ...formData, focus_areas })
                  }
                />
              )}
              {currentStep === 3 && (
                <ToneStep
                  tone={formData.preferred_tone}
                  onToneChange={(preferred_tone) =>
                    setFormData({ ...formData, preferred_tone })
                  }
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : currentStep === steps.length - 1 ? (
                <>
                  Start Writing
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
