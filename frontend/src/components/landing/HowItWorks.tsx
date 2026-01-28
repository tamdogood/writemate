'use client'

import { motion } from 'framer-motion'
import { UserCircle, PenLine, Sparkles, TrendingUp } from 'lucide-react'

const steps = [
  {
    icon: UserCircle,
    title: 'Set Your Profile',
    description: 'Tell us about your writing goals, experience level, and what you want to focus on.',
    number: '01',
  },
  {
    icon: PenLine,
    title: 'Write Freely',
    description: 'Use our distraction-free editor to write your essays, stories, or any content.',
    number: '02',
  },
  {
    icon: Sparkles,
    title: 'Get AI Feedback',
    description: 'Click analyze to receive detailed, personalized feedback with inline annotations.',
    number: '03',
  },
  {
    icon: TrendingUp,
    title: 'Track & Improve',
    description: "Watch your progress over time and see which patterns you've mastered.",
    number: '04',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            How it{' '}
            <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
              works
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Getting started is simple. Begin improving your writing in minutes.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-200 via-orange-300 to-orange-200 -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-8 text-center relative z-10 border border-gray-100">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 mb-4"
                  >
                    <step.icon className="w-8 h-8" />
                  </motion.div>
                  <div className="text-5xl font-bold text-gray-100 absolute top-4 right-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
