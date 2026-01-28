'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSession } from '@/contexts/SessionContext'
import { useVocabulary } from '@/hooks/useVocabulary'
import { VocabList, AddWordDialog } from '@/components/vocabulary'
import { Navbar } from '@/components/shared'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, CheckCircle2, Clock, Loader2 } from 'lucide-react'

export default function VocabularyPage() {
  const router = useRouter()
  const { sessionId, isLoading: sessionLoading } = useSession()
  const {
    words,
    isLoading,
    fetchWords,
    addWord,
    markAsLearned,
    deleteWord,
    getLearnedWords,
    getUnlearnedWords,
  } = useVocabulary()

  useEffect(() => {
    if (!sessionLoading && !sessionId) {
      router.push('/onboarding')
    }
  }, [sessionId, sessionLoading, router])

  useEffect(() => {
    if (sessionId) {
      fetchWords()
    }
  }, [sessionId, fetchWords])

  const handleAddWord = async (word: {
    word: string
    definition: string
    part_of_speech: string
    example_sentence?: string
  }) => {
    await addWord(word)
  }

  const handleMarkLearned = async (id: string) => {
    await markAsLearned(id)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this word?')) {
      await deleteWord(id)
    }
  }

  if (sessionLoading || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F5F5F5]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const learnedWords = getLearnedWords()
  const unlearnedWords = getUnlearnedWords()

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Navbar variant="app" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vocabulary Bank</h1>
            <p className="text-gray-600">Build and track your personal word collection.</p>
          </div>
          <AddWordDialog onAddWord={handleAddWord} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="bg-white rounded-2xl p-5 border border-gray-100"
          >
            <div className="inline-flex p-2.5 rounded-xl bg-blue-50 mb-3">
              <BookOpen className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{words.length}</div>
            <div className="text-sm text-gray-500">Total Words</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-5 border border-gray-100"
          >
            <div className="inline-flex p-2.5 rounded-xl bg-green-50 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{learnedWords.length}</div>
            <div className="text-sm text-gray-500">Learned</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-5 border border-gray-100"
          >
            <div className="inline-flex p-2.5 rounded-xl bg-orange-50 mb-3">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{unlearnedWords.length}</div>
            <div className="text-sm text-gray-500">To Learn</div>
          </motion.div>
        </div>

        {/* Word lists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-gray-100"
        >
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({words.length})</TabsTrigger>
              <TabsTrigger value="unlearned">To Learn ({unlearnedWords.length})</TabsTrigger>
              <TabsTrigger value="learned">Learned ({learnedWords.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <VocabList
                words={words}
                onMarkLearned={handleMarkLearned}
                onDelete={handleDelete}
              />
            </TabsContent>

            <TabsContent value="unlearned" className="mt-6">
              <VocabList
                words={unlearnedWords}
                onMarkLearned={handleMarkLearned}
                onDelete={handleDelete}
              />
            </TabsContent>

            <TabsContent value="learned" className="mt-6">
              <VocabList
                words={learnedWords}
                onMarkLearned={handleMarkLearned}
                onDelete={handleDelete}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  )
}
