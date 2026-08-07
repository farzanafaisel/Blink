import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Flame } from 'lucide-react'
import { Button } from '@/components/Button'
import { MorseKey } from '@/components/MorseKey'
import { toast } from '@/components/Toast'
import { useMorseStore } from '@/app/store'
import { CURRICULUM } from '@/game/curriculum'
import { MAX_PATTERN_LENGTH, MORSE_CODE } from '@/game/morse'
import { playCorrect, playTick, playWrong } from '@/services/audio'
import { useKeyboard } from '@/hooks/useKeyboard'
import { fadeInUp, staggerChildren, streakFlame } from '@/utils/motion'

/*
  Screen 013: one word, one attempt, a fresh signal every midnight.
  An attempt is a submitted letter: build the pattern freely, then
  commit. Only a wrong submission ends the run.
*/
export function DailyChallenge() {
  const chapterIndex = useMorseStore((s) => s.chapterIndex)
  const dailyStreak = useMorseStore((s) => s.dailyStreak)
  const lastDailyDate = useMorseStore((s) => s.lastDailyDate)
  const completeDaily = useMorseStore((s) => s.completeDaily)

  const today = new Date().toISOString().slice(0, 10)
  const doneToday = lastDailyDate === today

  /* Deterministic per date, always from unlocked words (dev notes p012). */
  const word = useMemo(
    () => dailyWord(today, chapterIndex),
    [today, chapterIndex],
  )

  const [started, setStarted] = useState(false)
  const [letterIndex, setLetterIndex] = useState(0)
  const [input, setInput] = useState('')
  const [pressedKey, setPressedKey] = useState<'dot' | 'dash' | null>(null)
  const [failed, setFailed] = useState(false)

  const letter = word[letterIndex]
  const finished = doneToday || letterIndex >= word.length || failed

  const addGlyph = (glyph: '.' | '-') => {
    if (!started || finished) return
    playTick()
    setPressedKey(glyph === '.' ? 'dot' : 'dash')
    setTimeout(() => setPressedKey(null), 150)
    setInput((c) => (c.length < MAX_PATTERN_LENGTH ? c + glyph : c))
  }

  const submit = () => {
    if (!started || finished || input.length === 0) return
    if (input !== MORSE_CODE[letter]) {
      playWrong()
      setFailed(true)
      completeDaily({ date: today, word, success: false })
      toast(`That letter was ${letter}. Come back tomorrow.`, 'error')
      return
    }
    playCorrect()
    setInput('')
    if (letterIndex + 1 === word.length) {
      completeDaily({ date: today, word, success: true })
      toast('Daily complete. Streak extended.', 'success')
    }
    setLetterIndex((i) => i + 1)
  }

  useKeyboard({
    ' ': () => addGlyph('.'),
    f: () => addGlyph('-'),
    Enter: submit,
    Backspace: () => setInput(''),
  })

  return (
    <div className="flex flex-1 items-center justify-center py-14">
      <motion.div
        variants={staggerChildren(0.08)}
        initial="hidden"
        animate="visible"
        className="flex w-full max-w-[560px] flex-col items-center gap-5 rounded-2xl border border-border-subtle bg-surface-elevated px-10 py-11 text-center"
      >
        <motion.span
          variants={fadeInUp}
          className="flex size-14 items-center justify-center rounded-lg bg-[#e7e3f6] text-particle-violet"
        >
          <Calendar aria-hidden="true" className="size-7" />
        </motion.span>
        <motion.h1 variants={fadeInUp} className="text-h3 text-text-primary">
          Daily Challenge
        </motion.h1>
        <motion.p variants={fadeInUp} className="text-body-md text-text-secondary">
          One word. One attempt. A fresh signal every midnight.
        </motion.p>

        <motion.span variants={streakFlame} className="mt-2 flex items-center gap-2">
          <Flame
            aria-hidden="true"
            className="size-[18px] fill-accent-pressed text-accent-pressed"
          />
          <span className="font-mono text-sm font-medium tracking-wide text-accent-text">
            {dailyStreak} DAY STREAK
          </span>
        </motion.span>

        <motion.div variants={fadeInUp} className="flex items-center gap-2.5">
          {Array.from({ length: 7 }, (_, i) => {
            const isToday = i === 5
            const done = i < 5 ? i < Math.min(dailyStreak, 5) : isToday && doneToday
            return (
              <span
                key={i}
                className={`rounded-full ${isToday ? 'size-3.5' : 'size-2.5'} ${
                  done && !isToday
                    ? 'bg-accent-default'
                    : isToday
                      ? 'bg-particle-violet'
                      : 'bg-border-subtle'
                }`}
              />
            )
          })}
        </motion.div>

        {started && !finished ? (
          <motion.div variants={fadeInUp} className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2.5" aria-label={`Word: ${word}`}>
              {[...word].map((char, i) => (
                <span
                  key={i}
                  className={`flex h-16 w-14 items-center justify-center rounded-md border ${
                    i === letterIndex
                      ? 'border-[1.5px] border-text-primary bg-surface-elevated'
                      : i < letterIndex
                        ? 'border-feedback-success bg-tint-success'
                        : 'border-border-subtle bg-surface-glass'
                  }`}
                >
                  <span
                    className={`text-2xl font-semibold ${
                      i < letterIndex
                        ? 'text-feedback-success'
                        : i === letterIndex
                          ? 'text-text-primary'
                          : 'text-text-muted/70'
                    }`}
                  >
                    {char}
                  </span>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2" aria-live="polite">
              {[...input].map((glyph, i) => (
                <span
                  key={i}
                  className="flex size-9 items-center justify-center rounded-sm border border-border-subtle bg-surface-elevated"
                >
                  {glyph === '.' ? (
                    <span className="size-2 rounded-full bg-accent-default" />
                  ) : (
                    <span className="h-1.5 w-4 rounded-full bg-accent-default" />
                  )}
                </span>
              ))}
              <span className="flex size-9 items-center justify-center rounded-sm border border-cta-default bg-surface-elevated">
                <span className="h-3.5 w-0.5 animate-pulse bg-cta-default" />
              </span>
            </div>
            <div className="flex items-center gap-4">
              <MorseKey type="dot" pressed={pressedKey === 'dot'} onPress={() => addGlyph('.')} />
              <MorseKey type="dash" pressed={pressedKey === 'dash'} onPress={() => addGlyph('-')} />
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => setInput('')}
                disabled={input.length === 0}
              >
                Clear
              </Button>
              <Button onClick={submit} disabled={input.length === 0}>
                Submit
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={fadeInUp} className="mt-3">
            <Button onClick={() => setStarted(true)} disabled={doneToday || failed}>
              {doneToday
                ? 'Done for today'
                : failed
                  ? 'Back at midnight'
                  : "Start today's run"}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

function dailyWord(dateISO: string, chapterIndex: number): string {
  const words = CURRICULUM.chapters
    .slice(0, chapterIndex + 1)
    .flatMap((c) => c.words)
  let seed = [...dateISO].reduce((n, c) => n + c.charCodeAt(0) * 31, 7)
  seed = (seed * 1103515245 + 12345) % 2147483648
  return words[seed % words.length]
}
