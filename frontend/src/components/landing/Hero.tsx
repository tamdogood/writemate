'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight, FileText, Flame, BarChart3, Trophy } from 'lucide-react'
import Link from 'next/link'

const stats = [
  {
    icon: FileText,
    value: '10K+',
    label: 'Documents Analyzed',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: Flame,
    value: '85%',
    label: 'Improvement Rate',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    icon: BarChart3,
    value: '500+',
    label: 'Active Writers',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  {
    icon: Trophy,
    value: '4.9',
    label: 'User Rating',
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
]

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-16 bg-[#F5F5F5]">
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto py-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-2 mb-8"
        >
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-orange-700">
            AI-powered writing coach
          </span>
        </motion.div>

        {/* Animated title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-900"
        >
          Master your writing,{' '}
          <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
            one feedback at a time
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
        >
          Get personalized feedback on your writing, track your progress, and build your vocabulary with AI-powered assistance tailored to your goals.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Link href="/onboarding">
            <Button size="lg" className="text-lg px-8 py-6 group">
              Start writing free
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              See how it works
            </Button>
          </Link>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className={`inline-flex p-3 rounded-xl ${stat.bg} mb-3`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
