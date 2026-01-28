'use client'

import { motion } from 'framer-motion'
import { MessageSquareText, TrendingUp, BookOpen, Target, Lightbulb, Award } from 'lucide-react'

const features = [
  {
    icon: MessageSquareText,
    title: 'Smart Feedback',
    description: 'Get detailed, contextual feedback on grammar, clarity, style, and vocabulary right where you need it.',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Target,
    title: 'Personalized Learning',
    description: 'Set your writing goals and experience level. Receive feedback tailored to your specific needs.',
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description: 'Watch your writing skills improve over time with visual progress charts and metrics.',
    iconColor: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    icon: Lightbulb,
    title: 'Pattern Recognition',
    description: "Identify recurring mistakes and celebrate when you've mastered them.",
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-50',
  },
  {
    icon: BookOpen,
    title: 'Vocabulary Bank',
    description: 'Build your personal vocabulary with words discovered during writing sessions.',
    iconColor: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
  },
  {
    icon: Award,
    title: 'Achievement System',
    description: 'Earn badges for mastering common mistakes and hitting writing milestones.',
    iconColor: 'text-rose-500',
    bgColor: 'bg-rose-50',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
              write better
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful tools designed to help you improve your writing skills, one word at a time.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-[#F5F5F5] rounded-2xl p-8 hover:shadow-lg transition-all border border-gray-100"
            >
              <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
