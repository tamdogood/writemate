'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSession } from '@/contexts/SessionContext'
import { useProgress } from '@/hooks/useProgress'
import { useDocuments } from '@/hooks/useDocuments'
import { Navbar } from '@/components/shared'
import {
  ScoreChart,
  CategoryRadar,
  MasteredBadges,
  PatternsList,
  OverallProgress,
  StatsCard,
  LevelProgress,
  ContinueWriting,
  StreakCalendar,
} from '@/components/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Trophy, BarChart3, Target, Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { sessionId, isLoading: sessionLoading } = useSession()
  const {
    metrics,
    patterns,
    masteredPatterns,
    isLoading,
    fetchMetrics,
    fetchPatterns,
    getAverageScores,
    getImprovement,
  } = useProgress()
  const { documents, fetchDocuments } = useDocuments()

  useEffect(() => {
    if (!sessionLoading && !sessionId) {
      router.push('/onboarding')
    }
  }, [sessionId, sessionLoading, router])

  useEffect(() => {
    if (sessionId) {
      fetchMetrics()
      fetchPatterns()
      fetchDocuments()
    }
  }, [sessionId, fetchMetrics, fetchPatterns, fetchDocuments])

  if (sessionLoading || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F5F5F5]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const averageScores = getAverageScores()
  const recentDocument = documents.length > 0 ? documents[0] : null

  // Calculate total words from all documents
  const totalWords = documents.reduce((sum, doc) => sum + (doc.word_count || 0), 0)

  // Calculate level based on documents analyzed (simple formula)
  const level = Math.floor(metrics.length / 3) + 1
  const currentXP = (metrics.length % 3) * 100
  const requiredXP = 300

  // Calculate active days from actual document activity
  const getActiveDays = (): Date[] => {
    const uniqueDates = new Set<string>()

    // Add dates from documents (created or updated)
    documents.forEach((doc) => {
      if (doc.created_at) {
        const date = new Date(doc.created_at)
        uniqueDates.add(date.toDateString())
      }
      if (doc.updated_at) {
        const date = new Date(doc.updated_at)
        uniqueDates.add(date.toDateString())
      }
    })

    // Add dates from metrics (analysis dates)
    metrics.forEach((metric) => {
      if (metric.created_at) {
        const date = new Date(metric.created_at)
        uniqueDates.add(date.toDateString())
      }
    })

    return Array.from(uniqueDates).map((dateStr) => new Date(dateStr))
  }

  // Calculate current streak from consecutive days
  const calculateStreak = (activeDays: Date[]): number => {
    if (activeDays.length === 0) return 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Sort dates descending
    const sortedDates = activeDays
      .map((d) => {
        const date = new Date(d)
        date.setHours(0, 0, 0, 0)
        return date.getTime()
      })
      .sort((a, b) => b - a)

    // Remove duplicates
    const uniqueDates = [...new Set(sortedDates)]

    // Check if today or yesterday is in the list (streak must be recent)
    const todayTime = today.getTime()
    const yesterdayTime = todayTime - 86400000

    if (uniqueDates[0] !== todayTime && uniqueDates[0] !== yesterdayTime) {
      return 0 // No recent activity, streak is broken
    }

    // Count consecutive days
    let streak = 1
    for (let i = 1; i < uniqueDates.length; i++) {
      const diff = uniqueDates[i - 1] - uniqueDates[i]
      if (diff === 86400000) { // Exactly 1 day difference
        streak++
      } else {
        break
      }
    }

    return streak
  }

  const activeDays = getActiveDays()
  const currentStreak = calculateStreak(activeDays)
  const bestStreak = Math.max(currentStreak, documents.length > 0 ? currentStreak : 0)

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Navbar variant="app" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-gray-600">Keep improving your writing skills with personalized feedback.</p>
        </motion.div>

        {/* Main Content - 2 columns */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column (wider) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Progress */}
            <OverallProgress
              percentage={averageScores.overall}
              subtitle="Based on your recent writing analysis"
            />

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard
                icon={FileText}
                label="Documents"
                value={metrics.length}
                iconColor="text-blue-500"
                iconBg="bg-blue-50"
                delay={0.1}
              />
              <StatsCard
                icon={Trophy}
                label="Current Streak"
                value={`${currentStreak} days`}
                iconColor="text-orange-500"
                iconBg="bg-orange-50"
                delay={0.2}
              />
              <StatsCard
                icon={BarChart3}
                label="Total Words"
                value={totalWords.toLocaleString()}
                iconColor="text-purple-500"
                iconBg="bg-purple-50"
                delay={0.3}
              />
              <StatsCard
                icon={Target}
                label="Patterns Mastered"
                value={masteredPatterns.length}
                iconColor="text-green-500"
                iconBg="bg-green-50"
                delay={0.4}
              />
            </div>

            {/* Level Progress */}
            <LevelProgress
              level={level}
              currentXP={currentXP}
              requiredXP={requiredXP}
            />

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-gray-100">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Score Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScoreChart metrics={metrics} />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="border-gray-100">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Category Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategoryRadar scores={averageScores} />
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Patterns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="border-gray-100">
                <CardHeader>
                  <CardTitle className="text-gray-900">Writing Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="active">
                    <TabsList>
                      <TabsTrigger value="active">
                        Active ({patterns.length})
                      </TabsTrigger>
                      <TabsTrigger value="mastered">
                        Mastered ({masteredPatterns.length})
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="active" className="mt-4">
                      <PatternsList patterns={patterns} />
                    </TabsContent>
                    <TabsContent value="mastered" className="mt-4">
                      <MasteredBadges patterns={masteredPatterns} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column (sidebar) */}
          <div className="space-y-6">
            {/* Continue Writing */}
            {recentDocument && (
              <ContinueWriting
                documentTitle={recentDocument.title}
                lastEditedAt={recentDocument.updated_at}
                wordCount={recentDocument.word_count}
              />
            )}
            {!recentDocument && (
              <ContinueWriting
                documentTitle="Start your first document"
                wordCount={0}
              />
            )}

            {/* Daily Streak Calendar */}
            <StreakCalendar
              currentStreak={currentStreak}
              bestStreak={bestStreak}
              activeDays={activeDays}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
