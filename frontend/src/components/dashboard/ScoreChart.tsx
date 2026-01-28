'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { ProgressMetric } from '@/hooks/useProgress'

interface ScoreChartProps {
  metrics: ProgressMetric[]
}

export function ScoreChart({ metrics }: ScoreChartProps) {
  const data = metrics.map((m, index) => ({
    name: `#${index + 1}`,
    grammar: Number(m.grammar_score),
    clarity: Number(m.clarity_score),
    vocabulary: Number(m.vocabulary_score),
    overall: Number(m.overall_score),
    date: new Date(m.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }))

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500">
        No data yet. Analyze some documents to see your progress.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="overall"
          name="Overall"
          stroke="#f97316"
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="grammar"
          name="Grammar"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="clarity"
          name="Clarity"
          stroke="#eab308"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="vocabulary"
          name="Vocabulary"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
