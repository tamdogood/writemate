'use client'

import { AnimatePresence } from 'framer-motion'
import { VocabCard } from './VocabCard'
import type { VocabularyWord } from '@/hooks/useVocabulary'
import { BookOpen } from 'lucide-react'

interface VocabListProps {
  words: VocabularyWord[]
  onMarkLearned: (id: string) => void
  onDelete: (id: string) => void
}

export function VocabList({ words, onMarkLearned, onDelete }: VocabListProps) {
  if (words.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg">No words in this category</p>
        <p className="text-sm mt-2">
          Add words manually or get suggestions from document analysis
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <AnimatePresence>
        {words.map((word) => (
          <VocabCard
            key={word.id}
            word={word}
            onMarkLearned={() => onMarkLearned(word.id)}
            onDelete={() => onDelete(word.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
