import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { Button } from '@/components/Button'
import { Confetti } from '@/components/Confetti'
import { StatCard } from '@/components/StatCard'
import { masteredLetters, useMorseStore } from '@/app/store'
import { CURRICULUM } from '@/game/curriculum'
import type { EngineState } from '@/game/engine'
import { LETTERS, patternFor, patternToGlyphs } from '@/game/morse'
import { fadeInUp, scaleIn, staggerChildren } from '@/utils/motion'

export interface ChapterCompleteProps {
  engineState: EngineState
  onNextChapter: () => void
  onMorseKey: () => void
}

const COUNTS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']

/* Screen 009: trophy, new letters with patterns, chapter stats. */
export function ChapterComplete({
  engineState,
  onNextChapter,
  onMorseKey,
}: ChapterCompleteProps) {
  const animations = useMorseStore((s) => s.settings.animations)
  const letterHistory = useMorseStore((s) => s.letterHistory)
  const summary = engineState.chapterSummary
  const chapterNumber = (summary?.chapterIndex ?? engineState.chapterIndex) + 1
  const unlocked = summary?.unlocked ?? []
  const isFinalChapter =
    (summary?.chapterIndex ?? engineState.chapterIndex) ===
    CURRICULUM.chapters.length - 1
  const masteredCount = masteredLetters(letterHistory).length
  const practiceMode = isFinalChapter && masteredCount < LETTERS.length

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-8 py-10">
      {animations && <Confetti count={24} />}

      <motion.div
        variants={staggerChildren(0.09)}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-6 text-center"
      >
        <motion.span
          variants={scaleIn}
          className="flex size-[88px] items-center justify-center rounded-2xl bg-accent-tint text-accent-pressed"
        >
          <Trophy aria-hidden="true" className="size-10" />
        </motion.span>
        <motion.h1 variants={fadeInUp} className="text-h2 text-text-primary">
          {practiceMode ? 'Chapters complete' : `Chapter ${chapterNumber} complete`}
        </motion.h1>
        <motion.p variants={fadeInUp} className="text-body-md text-text-secondary">
          {practiceMode
            ? `${masteredCount} of ${LETTERS.length} letters mastered. Keep playing to own them all.`
            : unlocked.length === 0
              ? 'Every signal in the book is yours now.'
              : `${COUNTS[unlocked.length - 1] ?? unlocked.length} new letters join your alphabet. Hear them in the Key any time.`}
        </motion.p>

        {unlocked.length > 0 && (
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap items-center justify-center gap-3.5"
          >
            {unlocked.map((char) => (
              <span
                key={char}
                className="flex h-[110px] w-[104px] flex-col items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface-elevated"
              >
                <span className="text-[36px] leading-none font-semibold text-text-primary">
                  {char}
                </span>
                <span className="font-mono text-sm text-text-secondary">
                  {patternToGlyphs(patternFor(char), '')}
                </span>
              </span>
            ))}
          </motion.div>
        )}

        <motion.div
          variants={fadeInUp}
          className="grid w-full max-w-[760px] grid-cols-1 gap-5 sm:grid-cols-3"
        >
          <StatCard
            label="Accuracy"
            value={`${summary?.accuracy ?? 100}%`}
            delta="this chapter"
          />
          <StatCard
            label="Words"
            value={String(summary?.words ?? CURRICULUM.chapters[0].words.length)}
            delta="completed"
          />
          <StatCard
            label="Points"
            value={`+${(summary?.points ?? 0).toLocaleString()}`}
            delta="earned"
          />
        </motion.div>

        <motion.div variants={fadeInUp} className="flex items-center gap-4">
          <Button variant="secondary" onClick={onMorseKey}>
            Open the Key
          </Button>
          <Button onClick={onNextChapter}>
            {practiceMode ? 'Keep practicing' : 'Start next chapter'}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
