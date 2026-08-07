import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/Button'
import { useMorseStore } from '@/app/store'
import { fadeInUp, staggerChildren } from '@/utils/motion'

/* Screen 002: hero with Play · Continue · Morse Key CTAs and the daily chip. */
export function Landing() {
  const navigate = useNavigate()
  const chapterIndex = useMorseStore((s) => s.chapterIndex)
  const dailyStreak = useMorseStore((s) => s.dailyStreak)
  const hasProgress = useMorseStore((s) => s.wordsCompleted > 0)

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center">
      <motion.div
        variants={staggerChildren(0.08)}
        initial="hidden"
        animate="visible"
        className="flex w-full max-w-[560px] flex-col items-center gap-8 text-center"
      >
        <motion.span variants={fadeInUp} className="text-overline text-accent-text">
          A word game in Morse code
        </motion.span>
        <motion.h1 variants={fadeInUp} className="text-h1 text-text-primary">
          Learn Morse code through play.
        </motion.h1>
        <motion.p
          variants={fadeInUp}
          className="text-body-lg max-w-[560px] text-text-secondary"
        >
          Five minutes a day. Build real words from dots and dashes, and check
          the Key whenever you like.
        </motion.p>
        <motion.div
          variants={fadeInUp}
          className="mt-4 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Button
            onClick={() => navigate('/play/word')}
            className="min-w-32 max-sm:w-full"
          >
            Play
          </Button>
          {hasProgress && (
            <Button
              variant="secondary"
              onClick={() => navigate('/play/word')}
              className="max-sm:w-full"
            >
              Continue · Chapter {chapterIndex + 1}
            </Button>
          )}
          <Button variant="coral" onClick={() => navigate('/key')}>
            Morse Key
          </Button>
        </motion.div>

        <motion.button
          variants={fadeInUp}
          type="button"
          onClick={() => navigate('/daily')}
          className="flex items-center gap-2.5 rounded-full border border-border-subtle bg-surface-glass px-3.5 py-2 outline-none transition-colors duration-150 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent-focus"
        >
          <Calendar aria-hidden="true" className="size-3.5 text-feedback-warning" />
          <span className="font-mono text-[11px] font-medium tracking-wide text-text-secondary uppercase">
            Daily Challenge · {dailyStreak} day streak
          </span>
        </motion.button>
      </motion.div>

      <p
        aria-hidden="true"
        className="pointer-events-none absolute bottom-6 font-mono text-2xl tracking-[0.2em] whitespace-nowrap text-border-subtle select-none"
      >
        ·—·· · ·— ·—· —· ·· —· ——·
      </p>
    </div>
  )
}
