import { motion } from 'framer-motion'
import { Button } from '@/components/Button'
import { Confetti } from '@/components/Confetti'
import { useMorseStore } from '@/app/store'
import { CURRICULUM } from '@/game/curriculum'
import { currentWord, type EngineState, type WordSummary } from '@/game/engine'
import { fadeInUp, staggerChildren } from '@/utils/motion'

export interface WordCompleteProps {
  /** Falls back to engineState.wordSummary. */
  summary: WordSummary | null
  engineState: EngineState
  onNextWord: () => void
  onBackToModes: () => void
}

/* Screen 008: lightweight celebration with word, accuracy · time · score. */
export function WordComplete({
  summary,
  engineState,
  onNextWord,
  onBackToModes,
}: WordCompleteProps) {
  const animations = useMorseStore((s) => s.settings.animations)
  const shown = summary ?? engineState.wordSummary
  const word = shown?.word ?? currentWord(CURRICULUM, engineState)

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-10 py-10">
      {animations && <Confetti />}

      <motion.div
        variants={staggerChildren(0.08)}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-10"
      >
        <motion.span variants={fadeInUp} className="text-overline text-accent-text">
          Word complete
        </motion.span>

        <motion.div variants={fadeInUp} className="flex items-center gap-4">
          {[...word].map((char, i) => (
            <span
              key={i}
              className="flex h-[120px] w-[110px] items-center justify-center rounded-lg border border-feedback-success bg-tint-success"
            >
              <span className="text-[53px] leading-none font-semibold text-feedback-success">
                {char}
              </span>
            </span>
          ))}
        </motion.div>

        <motion.div variants={fadeInUp} className="flex items-start gap-12">
          <Stat
            value={`${shown?.accuracy ?? 100}%`}
            label="Accuracy"
          />
          <Stat
            value={`${Math.round(shown?.seconds ?? 0)}s`}
            label="Time"
          />
          <Stat value={`+${shown?.points ?? 0}`} label="Score" />
        </motion.div>

        <motion.div variants={fadeInUp} className="flex items-center gap-4">
          <Button onClick={onNextWord}>Next word</Button>
          <Button variant="secondary" onClick={onBackToModes}>
            Back to modes
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-h3 text-text-primary">{value}</span>
      <span className="text-overline text-text-muted">{label}</span>
    </div>
  )
}
