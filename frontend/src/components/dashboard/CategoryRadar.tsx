'use client'

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface CategoryRadarProps {
  scores: {
    grammar: number
    clarity: number
    voice: number
    overall: number
  }
}

export function CategoryRadar({ scores }: CategoryRadarProps) {
  const data = [
    { subject: 'Grammar', score: scores.grammar, fullMark: 100 },
    { subject: 'Clarity', score: scores.clarity, fullMark: 100 },
    { subject: 'Voice', score: scores.voice, fullMark: 100 },
    { subject: 'Overall', score: scores.overall, fullMark: 100 },
  ]

  const hasData = Object.values(scores).some((s) => s > 0)

  if (!hasData) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500">
        No scores yet. Start writing to see your breakdown.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#f97316"
          fill="#f97316"
          fillOpacity={0.5}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
