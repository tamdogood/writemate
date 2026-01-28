'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/contexts/SessionContext'
import { useDocuments } from '@/hooks/useDocuments'
import { DocumentEditor, DocumentList, FeedbackPanel } from '@/components/editor'
import { Navbar } from '@/components/shared'
import { Loader2 } from 'lucide-react'
import type { AnalysisResponse } from '@/lib/api'

export default function EditorPage() {
  const router = useRouter()
  const { sessionId, hasCompletedOnboarding, isLoading: sessionLoading } = useSession()
  const {
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
    setAnnotations,
  } = useDocuments()

  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    if (!sessionLoading && !sessionId) {
      router.push('/onboarding')
    }
  }, [sessionId, sessionLoading, router])

  useEffect(() => {
    if (sessionId) {
      fetchDocuments()
    }
  }, [sessionId, fetchDocuments])

  const handleSelectDocument = useCallback(
    async (id: string) => {
      const doc = await loadDocument(id)
      setSelectedAnnotationId(null)
      // Show feedback panel if the document has been analyzed
      setShowFeedback(doc?.status === 'analyzed')
    },
    [loadDocument]
  )

  const handleCreateDocument = useCallback(async () => {
    const doc = await createDocument()
    if (doc) {
      setShowFeedback(false)
      setSelectedAnnotationId(null)
    }
  }, [createDocument])

  const handleDeleteDocument = useCallback(
    async (id: string) => {
      if (confirm('Are you sure you want to delete this document?')) {
        await deleteDocument(id)
      }
    },
    [deleteDocument]
  )

  const handleSave = useCallback(
    async (content: string, contentHtml: string, wordCount: number) => {
      if (currentDocument) {
        await updateDocument(currentDocument.id, {
          content,
          content_html: contentHtml,
          word_count: wordCount,
        })
      }
    },
    [currentDocument, updateDocument]
  )

  const handleTitleChange = useCallback(
    async (title: string) => {
      if (currentDocument) {
        await updateDocument(currentDocument.id, { title })
      }
    },
    [currentDocument, updateDocument]
  )

  const handleAnalysisComplete = useCallback(
    async (response: AnalysisResponse) => {
      if (currentDocument) {
        await fetchAnnotations(currentDocument.id)
        setShowFeedback(true)
      }
    },
    [currentDocument, fetchAnnotations]
  )

  const handleDismissAnnotation = useCallback(
    async (id: string) => {
      await dismissAnnotation(id)
      if (selectedAnnotationId === id) {
        setSelectedAnnotationId(null)
      }
    },
    [dismissAnnotation, selectedAnnotationId]
  )

  if (sessionLoading || !sessionId) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F5F5F5]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#F5F5F5]">
      <Navbar variant="app" />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document list sidebar */}
        <DocumentList
          documents={documents}
          currentDocumentId={currentDocument?.id || null}
          onSelectDocument={handleSelectDocument}
          onCreateDocument={handleCreateDocument}
          onDeleteDocument={handleDeleteDocument}
        />

        {/* Editor */}
        <div className="flex-1 flex overflow-hidden">
          {currentDocument ? (
            <>
              <div className={`flex-1 ${showFeedback ? 'w-2/3' : 'w-full'}`}>
                <DocumentEditor
                  document={currentDocument}
                  annotations={annotations}
                  onSave={handleSave}
                  onTitleChange={handleTitleChange}
                  onAnalysisComplete={handleAnalysisComplete}
                  onAnnotationClick={setSelectedAnnotationId}
                  selectedAnnotationId={selectedAnnotationId}
                />
              </div>

              {showFeedback && annotations.length > 0 && (
                <div className="w-80">
                  <FeedbackPanel
                    annotations={annotations}
                    selectedAnnotationId={selectedAnnotationId}
                    onSelectAnnotation={setSelectedAnnotationId}
                    onDismissAnnotation={handleDismissAnnotation}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2 text-gray-900">No document selected</h2>
                <p className="text-gray-500 mb-4">
                  Select a document or create a new one to get started
                </p>
                <button
                  onClick={handleCreateDocument}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                >
                  Create New Document
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
