'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession } from '@/contexts/SessionContext'

export interface Document {
  id: string
  title: string
  content: string
  content_html: string
  word_count: number
  status: 'draft' | 'analyzed'
  created_at: string
  updated_at: string
}

export interface Annotation {
  id: string
  document_id: string
  start_offset: number
  end_offset: number
  category: string
  severity: 'info' | 'warning' | 'error'
  message: string
  suggestion: string | null
  is_dismissed: boolean
}

export function useDocuments() {
  const { sessionId } = useSession()
  const [documents, setDocuments] = useState<Document[]>([])
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchDocuments = useCallback(async () => {
    if (!sessionId) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('session_id', sessionId)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  const createDocument = useCallback(
    async (title = 'Untitled') => {
      if (!sessionId) throw new Error('No session found')

      const { data, error } = await supabase
        .from('documents')
        .insert({
          session_id: sessionId,
          title,
          content: '',
          content_html: '',
          word_count: 0,
        })
        .select()
        .single()

      if (error) throw error
      setCurrentDocument(data)
      setDocuments((prev) => [data, ...prev])
      return data
    },
    [sessionId]
  )

  const updateDocument = useCallback(
    async (id: string, updates: Partial<Document>) => {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setCurrentDocument(data)
      setDocuments((prev) => prev.map((d) => (d.id === id ? data : d)))
      return data
    },
    []
  )

  const deleteDocument = useCallback(async (id: string) => {
    const { error } = await supabase.from('documents').delete().eq('id', id)

    if (error) throw error
    setDocuments((prev) => prev.filter((d) => d.id !== id))
    if (currentDocument?.id === id) {
      setCurrentDocument(null)
    }
  }, [currentDocument])

  const loadDocument = useCallback(async (id: string) => {
    setIsLoading(true)
    try {
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single()

      if (docError) throw docError
      setCurrentDocument(doc)

      const { data: annots, error: annotError } = await supabase
        .from('feedback_annotations')
        .select('*')
        .eq('document_id', id)
        .eq('is_dismissed', false)
        .order('start_offset')

      if (annotError) throw annotError
      setAnnotations(annots || [])

      return doc
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchAnnotations = useCallback(async (documentId: string) => {
    const { data, error } = await supabase
      .from('feedback_annotations')
      .select('*')
      .eq('document_id', documentId)
      .eq('is_dismissed', false)
      .order('start_offset')

    if (error) throw error
    setAnnotations(data || [])
    return data || []
  }, [])

  const dismissAnnotation = useCallback(async (annotationId: string) => {
    const { error } = await supabase
      .from('feedback_annotations')
      .update({ is_dismissed: true })
      .eq('id', annotationId)

    if (error) throw error
    setAnnotations((prev) => prev.filter((a) => a.id !== annotationId))
  }, [])

  const clearAnnotations = useCallback(async (documentId: string) => {
    const { error } = await supabase
      .from('feedback_annotations')
      .delete()
      .eq('document_id', documentId)

    if (error) throw error
    setAnnotations([])
  }, [])

  return {
    documents,
    currentDocument,
    annotations,
    isLoading,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    loadDocument,
    fetchAnnotations,
    dismissAnnotation,
    clearAnnotations,
    setCurrentDocument,
    setAnnotations,
  }
}
