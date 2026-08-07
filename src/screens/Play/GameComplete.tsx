import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Confetti } from '@/components/Confetti'
import { ToastViewport } from '@/components/Toast'
import { masteredLetters, useMorseStore } from '@/app/store'
import { fadeInUp, scaleIn, staggerChildren } from '@/utils/motion'

/* Screen 018: the finale: mark, "Fluent.", mini stats. */
export function GameComplete() {
  const navigate = useNavigate()
  const letterHistory = useMorseStore((s) => s.letterHistory)
  const daysPlayed = useMorseStore((s) => s.daysPlayed)
  const animations = useMorseStore((s) => s.settings.animations)
  const resetProgress = useMorseStore((s) => s.resetProgress)

  const histories = Object.values(letterHistory)
  const attempts = histories.reduce((n, h) => n + h.length, 0)
  const correct = histories.reduce((n, h) => n + h.filter(Boolean).length, 0)
  const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 100

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-between px-6 py-14">
      {animations && <Confetti count={24} />}

      <motion.div
        variants={staggerChildren(0.1)}
        initial="hidden"
        animate="visible"
        className="flex flex-1 flex-col items-center justify-center gap-8 text-center"
      >
        <motion.div variants={scaleIn} className="flex items-center gap-2">
          <span className="size-4 rounded-full bg-accent-default" />
          <span className="h-4 w-11 rounded-full bg-accent-default" />
          <span className="size-4 rounded-full bg-accent-default" />
        </motion.div>
        <motion.h1 variants={fadeInUp} className="text-display text-text-primary">
          Fluent.
        </motion.h1>
        <motion.p
          variants={fadeInUp}
          className="text-body-lg max-w-[480px] text-text-secondary"
        >
          All 26 letters mastered. You can now read the oldest digital language
          on Earth.
        </motion.p>

        <motion.div variants={fadeInUp} className="mt-4 flex items-start gap-12">
          <Stat value={String(masteredLetters(letterHistory).length)} label="Letters" />
          <Stat value={`${accuracy}%`} label="Best accuracy" />
          <Stat value={String(Math.max(daysPlayed.length, 1))} label="Days" />
        </motion.div>
      </motion.div>

      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          onClick={() => {
            resetProgress()
            navigate('/play/word')
          }}
        >
          Restart journey
        </Button>
        <Button onClick={() => navigate('/timed')}>Free play</Button>
      </div>
      <ToastViewport />
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-mono text-[28px] leading-9 font-medium text-accent-text">
        {value}
      </span>
      <span className="text-overline text-text-muted">{label}</span>
    </div>
  )
}
