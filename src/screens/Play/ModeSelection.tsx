import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Calendar, Lock, Timer, Volume2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useMorseStore } from '@/app/store'
import {
  CURRICULUM,
  isModeUnlocked,
  modeUnlockChapter,
} from '@/game/curriculum'
import { fadeInUp, pressable, staggerChildren } from '@/utils/motion'

/* Screen 003: four mode cards, colour-coded, curriculum-driven unlocks. */
export function ModeSelection() {
  const navigate = useNavigate()
  const chapterIndex = useMorseStore((s) => s.chapterIndex)
  const wordIndex = useMorseStore((s) => s.wordIndex)
  const bestTimedScore = useMorseStore((s) => s.bestTimedScore)
  const dailyStreak = useMorseStore((s) => s.dailyStreak)

  const timedUnlocked = isModeUnlocked(CURRICULUM, 'timed', chapterIndex)
  const audioUnlocked = isModeUnlocked(CURRICULUM, 'audio', chapterIndex)
  const wordsInChapter = CURRICULUM.chapters[chapterIndex].words.length

  return (
    <div className="flex flex-1 flex-col items-center gap-16 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-h3 text-text-primary">Play</h1>
        <p className="text-body-sm text-text-secondary">
          Pick a way to play. Every mode builds the same alphabet.
        </p>
      </div>

      <motion.div
        variants={staggerChildren(0.07)}
        initial="hidden"
        animate="visible"
        className="grid w-full max-w-[1272px] grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
      >
        <ModeCard
          icon={BookOpen}
          title="Word Mode"
          copy="Build real words letter by letter"
          status={`CHAPTER ${chapterIndex + 1} · WORD ${wordIndex + 1}/${wordsInChapter}`}
          accent="green"
          onClick={() => navigate('/play/word')}
        />
        <ModeCard
          icon={timedUnlocked ? Timer : Lock}
          title="Timed Challenge"
          copy="Beat the clock, chase the combo"
          status={
            timedUnlocked
              ? `BEST ${bestTimedScore.toLocaleString()}`
              : `UNLOCKS AT CHAPTER ${(modeUnlockChapter(CURRICULUM, 'timed') ?? 0) + 1}`
          }
          accent="blue"
          locked={!timedUnlocked}
          onClick={() => navigate('/timed')}
        />
        <ModeCard
          icon={audioUnlocked ? Volume2 : Lock}
          title="Audio Challenge"
          copy="Hear the code, catch the signal"
          status={
            audioUnlocked
              ? 'LISTEN & ANSWER'
              : `UNLOCKS AT CHAPTER ${(modeUnlockChapter(CURRICULUM, 'audio') ?? 0) + 1}`
          }
          accent="blue"
          locked={!audioUnlocked}
          onClick={() => navigate('/audio')}
        />
        <ModeCard
          icon={Calendar}
          title="Daily Challenge"
          copy="One word a day, keep the streak"
          status={`${dailyStreak} DAY STREAK`}
          accent="amber"
          onClick={() => navigate('/daily')}
        />
      </motion.div>

      <p className="text-body-sm text-text-secondary">
        New letters unlock as you finish chapters in Word Mode.
      </p>
    </div>
  )
}

type Accent = 'green' | 'blue' | 'amber'

const accentClasses: Record<
  Accent,
  { border: string; well: string; status: string }
> = {
  green: {
    border: 'border-cta-hover',
    well: 'bg-cta-tint text-cta-pressed',
    status: 'text-cta-pressed',
  },
  blue: {
    border: 'border-[#a9b8ec]',
    well: 'bg-[#e4e7f7] text-[#5b6dc8]',
    status: 'text-[#5b6dc8]',
  },
  amber: {
    border: 'border-[#eaa04c]',
    well: 'bg-accent-tint text-feedback-warning',
    status: 'text-feedback-warning',
  },
}

function ModeCard({
  icon: Icon,
  title,
  copy,
  status,
  accent,
  locked = false,
  onClick,
}: {
  icon: LucideIcon
  title: string
  copy: string
  status: string
  accent: Accent
  locked?: boolean
  onClick: () => void
}) {
  const colors = accentClasses[accent]
  return (
    <motion.div variants={fadeInUp}>
      <motion.button
        type="button"
        disabled={locked}
        onClick={onClick}
        {...pressable}
        className={`flex h-[300px] w-full flex-col items-center rounded-xl border pt-8 outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent-focus disabled:pointer-events-none ${
          locked
            ? 'border-border-subtle bg-surface-glass'
            : `${colors.border} bg-surface-elevated hover:bg-surface-glass`
        }`}
      >
        <span
          className={`flex size-16 items-center justify-center rounded-lg ${
            locked ? 'bg-surface-hover text-text-muted' : colors.well
          }`}
        >
          <Icon aria-hidden="true" className="size-7" />
        </span>
        <span
          className={`mt-3.5 text-2xl leading-8 font-semibold ${locked ? 'text-text-muted' : 'text-text-primary'}`}
        >
          {title}
        </span>
        <span className="text-body-sm mt-1 text-text-secondary">{copy}</span>
        <span
          className={`text-overline mt-9 ${locked ? 'text-text-muted' : colors.status}`}
        >
          {status}
        </span>
      </motion.button>
    </motion.div>
  )
}
