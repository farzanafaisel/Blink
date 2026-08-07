import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, Check, X } from 'lucide-react'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { StatCard } from '@/components/StatCard'
import { useMorseStore } from '@/app/store'
import { unlockedAlphaLetters, CURRICULUM } from '@/game/curriculum'
import { isMastered } from '@/game/scoring'
import { fadeIn } from '@/utils/motion'

/* Screen 016: words, accuracy, streaks, time, hints, per-letter chart. */
export function Statistics() {
  const navigate = useNavigate()
  const letterHistory = useMorseStore((s) => s.letterHistory)
  const chapterIndex = useMorseStore((s) => s.chapterIndex)
  const wordsCompleted = useMorseStore((s) => s.wordsCompleted)
  const hintsUsed = useMorseStore((s) => s.hintsUsed)
  const dailyStreak = useMorseStore((s) => s.dailyStreak)
  const longestDailyStreak = useMorseStore((s) => s.longestDailyStreak)
  const dailyHistory = useMorseStore((s) => s.dailyHistory)
  const playSeconds = useMorseStore((s) => s.playSeconds)
  const daysPlayed = useMorseStore((s) => s.daysPlayed)

  const practiced = Object.keys(letterHistory)
  if (practiced.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No statistics yet"
        description="Once you play, your accuracy and streaks appear here."
        action={
          <Button variant="secondary" onClick={() => navigate('/play/word')}>
            Play first word
          </Button>
        }
      />
    )
  }

  const attempts = practiced.reduce((n, l) => n + letterHistory[l].length, 0)
  const correct = practiced.reduce(
    (n, l) => n + letterHistory[l].filter(Boolean).length,
    0,
  )
  const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0
  const hours = Math.floor(playSeconds / 3600)
  const minutes = Math.floor((playSeconds % 3600) / 60)

  const bars = unlockedAlphaLetters(CURRICULUM, chapterIndex)
    .filter((l) => letterHistory[l]?.length)
    .map((letter) => {
      const history = letterHistory[letter]
      const pct = Math.round(
        (history.filter(Boolean).length / history.length) * 100,
      )
      return { letter, pct, mastered: isMastered(history) }
    })

  return (
    <div className="flex flex-1 flex-col gap-10 py-14">
      <h1 className="text-h3 text-text-primary">Statistics</h1>

      <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
        <StatCard
          label="Words completed"
          value={String(wordsCompleted)}
          delta={`${hintsUsed} hints used`}
        />
        <StatCard label="Overall accuracy" value={`${accuracy}%`} delta="all time" />
        <StatCard
          label="Longest streak"
          value={`${longestDailyStreak} ${longestDailyStreak === 1 ? 'day' : 'days'}`}
          delta={`current: ${dailyStreak}`}
        />
        <StatCard
          label="Time played"
          value={hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
          delta={`across ${daysPlayed.length} ${daysPlayed.length === 1 ? 'day' : 'days'}`}
        />
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface-elevated p-8">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="text-h4 text-text-primary">Accuracy by letter</h2>
          <span className="text-overline text-text-muted">All attempts</span>
        </div>
        <div
          className="flex h-[220px] items-end justify-between gap-3 overflow-x-auto"
          role="img"
          aria-label="Bar chart of accuracy per letter"
        >
          {bars.map(({ letter, pct, mastered }) => (
            <div
              key={letter}
              className="flex h-full min-w-7 flex-col items-center justify-end gap-2"
            >
              <motion.div
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                className={`w-7 rounded-full ${
                  mastered
                    ? 'bg-accent-default'
                    : pct >= 60
                      ? 'bg-accent-focus/70'
                      : 'bg-progress-track'
                }`}
                style={{ height: `${Math.max(pct, 8)}%` }}
                title={`${letter}: ${pct}%`}
              />
              <span className="font-mono text-[11px] text-text-secondary">
                {letter}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-8">
        <Legend className="bg-accent-default" label="Mastered · 85%+" />
        <Legend className="bg-accent-focus/70" label="Learning" />
        <Legend className="bg-progress-track" label="Needs work" />
      </div>

      {dailyHistory.length > 0 && (
        <div className="rounded-xl border border-border-subtle bg-surface-elevated p-8">
          <h2 className="text-h4 mb-6 text-text-primary">Daily challenges</h2>
          <div className="flex flex-col gap-2.5">
            {dailyHistory
              .slice(-7)
              .reverse()
              .map((record) => (
                <div
                  key={record.date}
                  className="flex items-center justify-between rounded-md bg-surface-glass px-4 py-2.5"
                >
                  <span className="text-caption text-text-muted">{record.date}</span>
                  <span className="font-mono text-sm text-text-primary">
                    {record.word}
                  </span>
                  {record.success ? (
                    <Check aria-label="Solved" className="size-4 text-feedback-success" />
                  ) : (
                    <X aria-label="Missed" className="size-4 text-feedback-error" />
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`size-2.5 rounded-[3px] ${className}`} />
      <span className="text-caption text-text-secondary">{label}</span>
    </span>
  )
}
