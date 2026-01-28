'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Highlighter,
  Sparkles,
  Save,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react'
import { AnnotationMark } from '@/lib/editor'
import type { Document, Annotation } from '@/hooks/useDocuments'
import { analyzeDocument, ApiError, type AnalysisResponse } from '@/lib/api'

interface DocumentEditorProps {
  document: Document | null
  annotations: Annotation[]
  onSave: (content: string, contentHtml: string, wordCount: number) => Promise<void>
  onTitleChange: (title: string) => Promise<void>
  onAnalysisComplete: (response: AnalysisResponse) => void
  onAnnotationClick: (id: string) => void
  selectedAnnotationId: string | null
}

export function DocumentEditor({
  document,
  annotations,
  onSave,
  onTitleChange,
  onAnalysisComplete,
  onAnnotationClick,
  selectedAnnotationId,
}: DocumentEditorProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [title, setTitle] = useState(document?.title || 'Untitled')
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedContent = useRef<string>('')

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      AnnotationMark,
      Placeholder.configure({
        placeholder: 'Start writing here...',
      }),
    ],
    content: document?.content_html || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-lg prose-gray max-w-none focus:outline-none min-h-[400px] px-4 py-2 text-gray-900',
      },
      handleClick: (_view, _pos, event) => {
        const target = event.target as HTMLElement
        const annotationSpan = target.closest('[data-annotation-id]')
        if (annotationSpan) {
          const annotationId = annotationSpan.getAttribute('data-annotation-id')
          if (annotationId) {
            onAnnotationClick(annotationId)
            return true
          }
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getText()
      const contentHtml = editor.getHTML()

      if (content === lastSavedContent.current) return

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = setTimeout(async () => {
        const wordCount = content.split(/\s+/).filter((w) => w.length > 0).length
        lastSavedContent.current = content
        setIsSaving(true)
        try {
          await onSave(content, contentHtml, wordCount)
        } finally {
          setIsSaving(false)
        }
      }, 2000)
    },
  })

  useEffect(() => {
    if (document && editor) {
      if (document.content_html !== editor.getHTML()) {
        editor.commands.setContent(document.content_html || '')
        lastSavedContent.current = document.content || ''
      }
      setTitle(document.title)
    }
  }, [document, editor])

  // Apply annotations to the editor when they change
  useEffect(() => {
    if (!editor || !document) return

    // Always clear existing annotations first
    editor.commands.unsetAnnotation()

    // Only apply annotations that belong to the current document
    const documentAnnotations = annotations.filter(
      (a) => a.document_id === document.id
    )

    if (documentAnnotations.length > 0) {
      const { state, view } = editor
      const tr = state.tr

      documentAnnotations.forEach((annotation) => {
        const from = annotation.start_offset
        const to = annotation.end_offset

        if (from >= 0 && to <= state.doc.content.size && from < to) {
          tr.addMark(
            from,
            to,
            state.schema.marks.annotation.create({
              id: annotation.id,
              category: annotation.category,
              severity: annotation.severity,
            })
          )
        }
      })

      view.dispatch(tr)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, document?.id, annotations.length])

  useEffect(() => {
    if (editor && selectedAnnotationId) {
      const annotation = annotations.find((a) => a.id === selectedAnnotationId)
      if (annotation) {
        editor.commands.setTextSelection({
          from: annotation.start_offset,
          to: annotation.end_offset,
        })
        editor.commands.scrollIntoView()
      }
    }
  }, [selectedAnnotationId, annotations, editor])

  const handleAnalyze = useCallback(async () => {
    if (!document || !editor) return

    setIsAnalyzing(true)
    setAnalysisError(null)
    try {
      const content = editor.getText()
      const response = await analyzeDocument({
        document_id: document.id,
        content,
      })
      onAnalysisComplete(response)
    } catch (error) {
      if (error instanceof ApiError) {
        // Log detailed diagnostic information for debugging
        console.error('Analysis failed:', error.message)
        console.error('Diagnostic info:\n' + error.getDiagnosticInfo())

        // Set user-friendly error message for display
        setAnalysisError(error.getUserMessage())
      } else if (error instanceof Error) {
        console.error('Analysis failed with unexpected error:', error)
        setAnalysisError(`Unexpected error: ${error.message}`)
      } else {
        console.error('Analysis failed with unknown error:', error)
        setAnalysisError('An unknown error occurred while analyzing the document.')
      }
    } finally {
      setIsAnalyzing(false)
    }
  }, [document, editor, onAnalysisComplete])

  const handleTitleBlur = useCallback(async () => {
    if (title !== document?.title) {
      await onTitleChange(title)
    }
  }, [title, document, onTitleChange])

  if (!editor) return null

  const wordCount = editor.getText().split(/\s+/).filter((w) => w.length > 0).length

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="text-lg font-semibold border-none shadow-none focus-visible:ring-0 px-0 w-64 text-gray-900 bg-transparent"
          />
          {isSaving && (
            <Badge variant="secondary" className="gap-1">
              <Save className="w-3 h-3" />
              Saving...
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`rounded-none ${editor.isActive('bold') ? 'bg-gray-100' : ''}`}
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`rounded-none ${editor.isActive('italic') ? 'bg-gray-100' : ''}`}
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`rounded-none ${editor.isActive('underline') ? 'bg-gray-100' : ''}`}
            >
              <UnderlineIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={`rounded-none ${editor.isActive('highlight') ? 'bg-gray-100' : ''}`}
            >
              <Highlighter className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || wordCount < 10}
            className="gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {analysisError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border-b border-red-200 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1 text-sm">{analysisError}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAnalysisError(null)}
            className="h-6 w-6 p-0 hover:bg-red-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-auto bg-[#F5F5F5]">
        <div className="max-w-4xl mx-auto py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-white text-sm text-gray-500">
        <span>{wordCount} words</span>
        <span>{document?.status === 'analyzed' ? 'Last analyzed' : 'Not analyzed yet'}</span>
      </div>
    </div>
  )
}
