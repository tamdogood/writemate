'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Trash2, CheckCircle2 } from 'lucide-react'
import type { Document } from '@/hooks/useDocuments'

interface DocumentListProps {
  documents: Document[]
  currentDocumentId: string | null
  onSelectDocument: (id: string) => void
  onCreateDocument: () => void
  onDeleteDocument: (id: string) => void
}

export function DocumentList({
  documents,
  currentDocumentId,
  onSelectDocument,
  onCreateDocument,
  onDeleteDocument,
}: DocumentListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="w-64 h-full flex flex-col bg-card border-r">
      <div className="p-4 border-b">
        <Button onClick={onCreateDocument} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          New Document
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {documents.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 px-4">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No documents yet</p>
              <p className="text-xs mt-1">Create one to get started</p>
            </div>
          ) : (
            documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  onClick={() => onSelectDocument(doc.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors group cursor-pointer ${
                    currentDocumentId === doc.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium truncate text-foreground">{doc.title}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{doc.word_count} words</span>
                        <span>·</span>
                        <span>{formatDate(doc.updated_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {doc.status === 'analyzed' && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-500/10 text-green-500"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Analyzed
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteDocument(doc.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

