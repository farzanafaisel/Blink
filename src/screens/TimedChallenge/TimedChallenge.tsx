import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Zap } from 'lucide-react'
import { Button } from '@/components/Button'
import { MorseKey } from '@/components/MorseKey'
import { useMorseStore } from '@/app/store'
import { CURRICULUM, unlockedAlphaLetters } from '@/game/curriculum'
import { MORSE_CODE, shuffle } from '@/game/morse'
import { comboMultiplier, POINTS_PER_CORRECT } from '@/game/scoring'
import { playCorrect, playTick, playWrong } from '@/services/audio'
import { useKeyboard } from '@/hooks/useKeyboard'
import { errorShake, successPop } from '@/utils/motion'

const ROUND_SECONDS = 60

/* Screen 011: countdown, combo chip, giant letter, keys, best/score. */
export function TimedChallenge() {
  const chapterIndex = useMorseStore((s) => s.chapterIndex)
  const best = useMorseStore((s) => s.bestTimedScore)
  const setBestTimedScore = useMorseStore((s) => s.setBestTimedScore)
  const applyLetterAttempt = useMorseStore((s) => s.applyLetterAttempt)

  const pool = useMemo(
    () => unlockedAlphaLetters(CURRICULUM, chapterIndex),
    [chapterIndex],
  )
  const [letter, setLetter] = useState(() =>
    shuffle(unlockedAlphaLetters(CURRICULUM, chapterIndex)).at(0) ?? 'E',
  )
  const [input, setInput] = useState('')
  const [pressedKey, setPressedKey] = useState<'dot' | 'dash' | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (finished) return
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer)
          setFinished(true)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [finished])

  useEffect(() => {
    if (finished) setBestTimedScore(score)
  }, [finished, score, setBestTimedScore])

  const nextLetter = useCallback(() => {
    setInput('')
    setLetter((current) => {
      const others = pool.filter((l) => l !== current)
      return shuffle(others)[0] ?? current
    })
  }, [pool])

  const addGlyph = useCallback(
    (glyph: '.' | '-') => {
      if (finished) return
      playTick()
      setPressedKey(glyph === '.' ? 'dot' : 'dash')
      setTimeout(() => setPressedKey(null), 150)
      const next = input + glyph
      const target = MORSE_CODE[letter]
      if (!target.startsWith(next)) {
        playWrong()
        applyLetterAttempt(
          { letter, correct: false, seconds: 0, usedHint: false },
          0,
        )
        setCombo(0)
        setFlash('wrong')
        setTimeout(() => setFlash(null), 350)
        setInput('')
        return
      }
      if (next === target) {
        playCorrect()
        applyLetterAttempt(
          { letter, correct: true, seconds: 0, usedHint: false },
          0,
        )
        setScore((s) => s + POINTS_PER_CORRECT * comboMultiplier(combo))
        setCombo((c) => c + 1)
        setFlash('correct')
        setTimeout(() => setFlash(null), 350)
        nextLetter()
        return
      }
      setInput(next)
    },
    [applyLetterAttempt, combo, finished, input, letter, nextLetter],
  )

  useKeyboard({
    ' ': () => addGlyph('.'),
    f: () => addGlyph('-'),
  })

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const seconds = String(secondsLeft % 60).padStart(2, '0')

  if (finished) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <span className="text-overline text-accent-text">Time's up</span>
        <span className="font-mono text-[72px] leading-none font-medium text-text-primary">
          {score.toLocaleString()}
        </span>
        <p className="text-body-md text-text-secondary">
          {score > best
            ? 'New personal best.'
            : `Best ${best.toLocaleString()}. Keep at it.`}
        </p>
        <Button
          onClick={() => {
            setScore(0)
            setCombo(0)
            setSecondsLeft(ROUND_SECONDS)
            setFinished(false)
            nextLetter()
          }}
        >
          Run it back
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-between py-8">
      <div className="flex flex-col items-center gap-2">
        <span className="text-overline text-text-muted">Time left</span>
        <span
          className={`font-mono text-[64px] leading-none font-medium ${secondsLeft <= 10 ? 'text-feedback-error' : 'text-accent-text'}`}
          role="timer"
          aria-label={`${secondsLeft} seconds left`}
        >
          {minutes}:{seconds}
        </span>
        <div className="mt-2 h-1 w-52 overflow-hidden rounded-full bg-progress-track">
          <div
            className="h-full rounded-full bg-accent-default transition-[width] duration-1000 ease-linear"
            style={{ width: `${(secondsLeft / ROUND_SECONDS) * 100}%` }}
          />
        </div>
      </div>

      <span className="flex items-center gap-2 rounded-full bg-[#e3e5f2] px-3.5 py-1.5">
        <Zap aria-hidden="true" className="size-3.5 text-particle-pink" />
        <span className="font-mono text-sm font-medium tracking-wide text-accent-default uppercase">
          Combo ×{comboMultiplier(combo)}
        </span>
      </span>

      <motion.span
        key={`${letter}-${flash}`}
        variants={flash === 'wrong' ? errorShake : successPop}
        initial="hidden"
        animate={flash ? 'visible' : 'hidden'}
        className={`text-[clamp(110px,20vh,160px)] leading-none font-semibold ${
          flash === 'correct'
            ? 'text-feedback-success'
            : flash === 'wrong'
              ? 'text-feedback-error'
              : 'text-text-primary'
        }`}
        aria-label={`Tap the pattern for ${letter}`}
      >
        {letter}
      </motion.span>

      <div className="flex items-center gap-6">
        <MorseKey type="dot" pressed={pressedKey === 'dot'} onPress={() => addGlyph('.')} />
        <MorseKey type="dash" pressed={pressedKey === 'dash'} onPress={() => addGlyph('-')} />
      </div>

      <div className="flex items-center gap-8">
        <span className="flex items-center gap-2 text-text-secondary">
          <Trophy aria-hidden="true" className="size-4" />
          <span className="font-mono text-sm font-medium tracking-wide">
            BEST {best.toLocaleString()}
          </span>
        </span>
        <span className="flex items-center gap-2">
          <Zap
            aria-hidden="true"
            className="size-4 fill-accent-pressed text-accent-pressed"
          />
          <span className="font-mono text-sm font-medium text-text-primary">
            {score.toLocaleString()}
          </span>
        </span>
      </div>
    </div>
  )
}
