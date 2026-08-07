import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Volume2 } from 'lucide-react'
import { Button, IconButton } from '@/components/Button'
import { Waveform } from '@/components/Waveform'
import { toast } from '@/components/Toast'
import { useMorseStore } from '@/app/store'
import { CURRICULUM, unlockedAlphaLetters } from '@/game/curriculum'
import { MORSE_CODE, pickOptions, shuffle } from '@/game/morse'
import {
  isAudioUnlocked,
  playCorrect,
  playWrong,
  unlockAudio,
} from '@/services/audio'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useMorsePlayer } from '@/hooks/useMorsePlayer'
import { fadeIn } from '@/utils/motion'

/*
  Screen 012. Plays the current word's pattern one letter at a time;
  each letter is answered from four options. Finishing every letter
  clears one audio word (dev notes p012).
*/
export function AudioChallenge() {
  const chapterIndex = useMorseStore((s) => s.chapterIndex)
  const applyLetterAttempt = useMorseStore((s) => s.applyLetterAttempt)
  const recordAudioWord = useMorseStore((s) => s.recordAudioWord)
  const { play, activeIndex, isPlaying } = useMorsePlayer()

  const pool = useMemo(
    () => unlockedAlphaLetters(CURRICULUM, chapterIndex),
    [chapterIndex],
  )
  const words = useMemo(
    () =>
      CURRICULUM.chapters
        .slice(0, chapterIndex + 1)
        .flatMap((c) => c.words)
        .filter((w) => /^[A-Z]+$/.test(w)),
    [chapterIndex],
  )

  const [word, setWord] = useState(() => shuffle(words)[0] ?? 'TEA')
  const [letterIndex, setLetterIndex] = useState(0)
  const [options, setOptions] = useState(() =>
    pickOptions((shuffle(words)[0] ?? 'TEA')[0], pool, 4),
  )
  const [answer, setAnswer] = useState<string | null>(null)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [missedThisWord, setMissedThisWord] = useState(false)
  const [soundReady, setSoundReady] = useState(isAudioUnlocked)

  const letter = word[letterIndex]
  const pattern = MORSE_CODE[letter] ?? ''
  const progress =
    activeIndex >= 0
      ? (activeIndex + 1) / Math.max(pattern.length, 1)
      : hasPlayed
        ? 0.42
        : 0

  const playLetter = useCallback(() => {
    setHasPlayed(true)
    void play(pattern, 1)
  }, [pattern, play])

  /* Autoplay only once the browser lets audio through (dev notes p012). */
  useEffect(() => {
    if (!soundReady) return
    const t = setTimeout(playLetter, 500)
    return () => clearTimeout(t)
  }, [playLetter, soundReady])

  const enableSound = useCallback(() => {
    void unlockAudio().then(() => {
      setSoundReady(true)
    })
  }, [])

  const nextLetter = useCallback(
    (fromWord: string, index: number, missed: boolean) => {
      if (index + 1 < fromWord.length) {
        setLetterIndex(index + 1)
        setOptions(pickOptions(fromWord[index + 1], pool, 4))
      } else {
        if (!missed) {
          recordAudioWord()
          toast(`${fromWord} decoded. Well heard.`, 'success')
        } else {
          toast(`${fromWord} finished. Try the next one clean.`, 'info')
        }
        const next = shuffle(words.filter((w) => w !== fromWord))[0] ?? fromWord
        setWord(next)
        setLetterIndex(0)
        setOptions(pickOptions(next[0], pool, 4))
        setMissedThisWord(false)
      }
      setAnswer(null)
    },
    [pool, recordAudioWord, words],
  )

  const choose = useCallback(
    (choice: string) => {
      if (answer) return
      setAnswer(choice)
      const correct = choice === letter
      applyLetterAttempt(
        { letter, correct, seconds: 0, usedHint: false },
        0,
      )
      const missed = missedThisWord || !correct
      if (correct) playCorrect()
      else {
        playWrong()
        setMissedThisWord(true)
        toast(`That was ${letter}.`, 'error')
      }
      setTimeout(() => nextLetter(word, letterIndex, missed), 1200)
    },
    [answer, applyLetterAttempt, letter, letterIndex, missedThisWord, nextLetter, word],
  )

  useKeyboard({
    '1': () => options[0] && choose(options[0]),
    '2': () => options[1] && choose(options[1]),
    '3': () => options[2] && choose(options[2]),
    '4': () => options[3] && choose(options[3]),
    r: playLetter,
  })

  return (
    <div className="flex flex-1 flex-col items-center justify-between py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="text-overline text-feedback-info">Audio challenge</span>
        <h1 className="text-h3 text-text-primary">Listen. What did you hear?</h1>
        <p className="text-body-sm text-text-secondary" aria-live="polite">
          Letter {letterIndex + 1} of {word.length}
        </p>
      </div>

      <div className="relative flex w-full max-w-[425px] items-center gap-7 rounded-xl border border-border-subtle bg-surface-elevated px-9 py-8">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-background-secondary text-feedback-info">
          <Volume2 aria-hidden="true" className="size-7" />
        </span>
        <Waveform progress={progress} playing={isPlaying} className="flex-1" />
        <IconButton aria-label="Replay pattern" onClick={playLetter}>
          <RotateCcw aria-hidden="true" className="size-[22px]" />
        </IconButton>
        {!soundReady && (
          <button
            type="button"
            onClick={enableSound}
            className="text-body-sm absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-surface-overlay/90 font-medium text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent-focus"
          >
            <Volume2 aria-hidden="true" className="size-4 text-feedback-info" />
            Tap to enable sound
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {options.map((choice) => {
          const state = answer
            ? choice === letter
              ? 'correct'
              : choice === answer
                ? 'incorrect'
                : 'idle'
            : 'idle'
          return (
            <motion.button
              key={choice}
              type="button"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              onClick={() => choose(choice)}
              disabled={answer !== null}
              className={`flex h-18 w-22 items-center justify-center rounded-lg border text-[34px] font-semibold outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent-focus disabled:pointer-events-none ${
                state === 'correct'
                  ? 'border-feedback-success bg-tint-success text-feedback-success'
                  : state === 'incorrect'
                    ? 'border-feedback-error bg-tint-error text-feedback-error'
                    : 'border-border-subtle bg-surface-elevated text-text-primary hover:border-border-strong hover:bg-surface-hover'
              }`}
            >
              {choice}
            </motion.button>
          )
        })}
      </div>

      <span className="text-caption text-text-muted">
        Press 1 to 4 to answer · R to replay
      </span>

      <Button
        variant="ghost"
        onClick={() => {
          const next = shuffle(words.filter((w) => w !== word))[0] ?? word
          setWord(next)
          setLetterIndex(0)
          setOptions(pickOptions(next[0], pool, 4))
          setAnswer(null)
        }}
      >
        Skip this word
      </Button>
    </div>
  )
}
