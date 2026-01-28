'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface ContinueWritingProps {
  documentTitle?: string
  lastEditedAt?: string
  wordCount?: number
}

export function ContinueWriting({
  documentTitle = 'Untitled Document',
  lastEditedAt,
  wordCount = 0,
}: ContinueWritingProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Just now'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 border border-gray-100"
    >
      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 mb-4">
        Resume
      </Badge>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{documentTitle}</h4>
          <div className="text-sm text-gray-500">
            {wordCount} words &middot; {formatDate(lastEditedAt)}
          </div>
        </div>
      </div>
      <Link href="/editor">
        <Button className="w-full group">
          Continue Writing
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </motion.div>
  )
}
