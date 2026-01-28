'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Trash2, BookOpen } from 'lucide-react'
import type { VocabularyWord } from '@/hooks/useVocabulary'

interface VocabCardProps {
  word: VocabularyWord
  onMarkLearned: () => void
  onDelete: () => void
}

export function VocabCard({ word, onMarkLearned, onDelete }: VocabCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      className={`rounded-xl p-4 border ${
        word.is_learned
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-gray-100'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{word.word}</h3>
            <Badge variant="outline" className="text-xs">
              {word.part_of_speech}
            </Badge>
            {word.is_learned && (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                <Check className="w-3 h-3 mr-1" />
                Learned
              </Badge>
            )}
          </div>

          <p className="text-gray-700 mb-2">{word.definition}</p>

          {word.example_sentence && (
            <p className="text-sm text-gray-500 italic">
              &ldquo;{word.example_sentence}&rdquo;
            </p>
          )}

          <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
            <BookOpen className="w-3 h-3" />
            <span>Reviewed {word.review_count} times</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {!word.is_learned && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkLearned}
              className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
            >
              <Check className="w-4 h-4" />
              Learned
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="gap-1 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
