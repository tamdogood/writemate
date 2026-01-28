'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession } from '@/contexts/SessionContext'

export interface VocabularyWord {
  id: string
  word: string
  definition: string
  part_of_speech: string
  example_sentence: string | null
  is_learned: boolean
  review_count: number
  created_at: string
}

export function useVocabulary() {
  const { sessionId } = useSession()
  const [words, setWords] = useState<VocabularyWord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchWords = useCallback(async () => {
    if (!sessionId) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('vocabulary_bank')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWords(data || [])
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  const addWord = useCallback(
    async (word: {
      word: string
      definition: string
      part_of_speech: string
      example_sentence?: string
    }) => {
      if (!sessionId) throw new Error('No session found')

      const { data, error } = await supabase
        .from('vocabulary_bank')
        .insert({
          session_id: sessionId,
          ...word,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new Error('This word is already in your vocabulary bank')
        }
        throw error
      }

      setWords((prev) => [data, ...prev])
      return data
    },
    [sessionId]
  )

  const updateWord = useCallback(
    async (id: string, updates: Partial<VocabularyWord>) => {
      const { data, error } = await supabase
        .from('vocabulary_bank')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setWords((prev) => prev.map((w) => (w.id === id ? data : w)))
      return data
    },
    []
  )

  const deleteWord = useCallback(async (id: string) => {
    const { error } = await supabase.from('vocabulary_bank').delete().eq('id', id)

    if (error) throw error
    setWords((prev) => prev.filter((w) => w.id !== id))
  }, [])

  const markAsLearned = useCallback(
    async (id: string) => {
      return updateWord(id, { is_learned: true })
    },
    [updateWord]
  )

  const incrementReviewCount = useCallback(
    async (id: string) => {
      const word = words.find((w) => w.id === id)
      if (!word) return

      return updateWord(id, { review_count: word.review_count + 1 })
    },
    [words, updateWord]
  )

  const getLearnedWords = useCallback(() => {
    return words.filter((w) => w.is_learned)
  }, [words])

  const getUnlearnedWords = useCallback(() => {
    return words.filter((w) => !w.is_learned)
  }, [words])

  return {
    words,
    isLoading,
    fetchWords,
    addWord,
    updateWord,
    deleteWord,
    markAsLearned,
    incrementReviewCount,
    getLearnedWords,
    getUnlearnedWords,
  }
}
