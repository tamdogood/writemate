'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession } from '@/contexts/SessionContext'

export interface ProgressMetric {
  id: string
  document_id: string
  grammar_score: number
  clarity_score: number
  vocabulary_score: number
  overall_score: number
  created_at: string
}

export interface WritingPattern {
  id: string
  pattern_type: string
  description: string
  occurrence_count: number
  last_occurrence_at: string
  is_mastered: boolean
}

export function useProgress() {
  const { sessionId } = useSession()
  const [metrics, setMetrics] = useState<ProgressMetric[]>([])
  const [patterns, setPatterns] = useState<WritingPattern[]>([])
  const [masteredPatterns, setMasteredPatterns] = useState<WritingPattern[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchMetrics = useCallback(async () => {
    if (!sessionId) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('progress_metrics')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMetrics(data || [])
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  const fetchPatterns = useCallback(async () => {
    if (!sessionId) return

    const { data, error } = await supabase
      .from('writing_patterns')
      .select('*')
      .eq('session_id', sessionId)
      .order('occurrence_count', { ascending: false })

    if (error) throw error

    const allPatterns = data || []
    setPatterns(allPatterns.filter((p) => !p.is_mastered))
    setMasteredPatterns(allPatterns.filter((p) => p.is_mastered))
  }, [sessionId])

  const getAverageScores = useCallback(() => {
    if (metrics.length === 0) {
      return { grammar: 0, clarity: 0, voice: 0, overall: 0 }
    }

    const totals = metrics.reduce(
      (acc, m) => ({
        grammar: acc.grammar + Number(m.grammar_score),
        clarity: acc.clarity + Number(m.clarity_score),
        voice: acc.voice + Number(m.vocabulary_score), // vocabulary_score maps to voice
        overall: acc.overall + Number(m.overall_score),
      }),
      { grammar: 0, clarity: 0, voice: 0, overall: 0 }
    )

    const count = metrics.length
    return {
      grammar: Math.round(totals.grammar / count),
      clarity: Math.round(totals.clarity / count),
      voice: Math.round(totals.voice / count),
      overall: Math.round(totals.overall / count),
    }
  }, [metrics])

  const getImprovement = useCallback(() => {
    if (metrics.length < 2) return 0

    const firstScore = Number(metrics[0].overall_score)
    const lastScore = Number(metrics[metrics.length - 1].overall_score)
    return Math.round(lastScore - firstScore)
  }, [metrics])

  return {
    metrics,
    patterns,
    masteredPatterns,
    isLoading,
    fetchMetrics,
    fetchPatterns,
    getAverageScores,
    getImprovement,
  }
}
