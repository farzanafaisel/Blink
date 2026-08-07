import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { letterKeyState, useMorseStore } from '@/app/store'
import { LETTERS, MORSE_CODE, patternToGlyphs } from '@/game/morse'
import { useMorsePlayer } from '@/hooks/useMorsePlayer'
import { fadeIn, staggerChildren } from '@/utils/motion'

const DIGITS = Object.keys(MORSE_CODE).filter((c) => /[0-9]/.test(c))

/* Screen 010: full reference: search, key tiles, mastery dots. */
export function MorseKeyPage() {
  const [query, setQuery] = useState('')
  const chapterIndex = useMorseStore((s) => s.chapterIndex)
  const letterHistory = useMorseStore((s) => s.letterHistory)
  const { play } = useMorsePlayer()

  const q = query.trim().toUpperCase()
  const matches = (char: string) =>
    q === '' || char === q || patternToGlyphs(MORSE_CODE[char], '').includes(q)

  const visibleLetters = LETTERS.filter(matches)
  const visibleDigits = DIGITS.filter(matches)

  return (
    <div className="flex flex-1 flex-col gap-10 py-14">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-h3 text-text-primary">Morse Key</h1>
          <p className="text-body-sm text-text-secondary">
            Every letter and number, one tap away. Green dot = letters you own.
          </p>
        </div>
        <label className="flex w-[280px] items-center gap-2.5 rounded-md border border-border-subtle bg-surface-elevated px-4 py-2.5">
          <Search aria-hidden="true" className="size-4 text-text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search letters…"
            aria-label="Search letters"
            className="text-body-sm w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted"
          />
        </label>
      </div>

      <motion.div
        variants={staggerChildren(0.01)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-[repeat(auto-fill,minmax(154px,1fr))] gap-3.5"
      >
        {visibleLetters.map((char) => (
          <KeyTile
            key={char}
            char={char}
            state={letterKeyState(char, chapterIndex, letterHistory)}
            onPlay={() => void play(MORSE_CODE[char], 1)}
          />
        ))}
      </motion.div>

      {visibleDigits.length > 0 && (
        <>
          <h2 className="text-overline text-text-muted">Numbers</h2>
          <motion.div
            variants={staggerChildren(0.01)}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-[repeat(auto-fill,minmax(154px,1fr))] gap-3.5"
          >
            {visibleDigits.map((char) => (
              <KeyTile
                key={char}
                char={char}
                state={letterKeyState(char, chapterIndex, letterHistory)}
                onPlay={() => void play(MORSE_CODE[char], 1)}
              />
            ))}
          </motion.div>
        </>
      )}

      {visibleLetters.length === 0 && visibleDigits.length === 0 && (
        <p className="text-body-sm text-text-secondary">
          Nothing matches “{query}”.
        </p>
      )}
    </div>
  )
}

function KeyTile({
  char,
  state,
  onPlay,
}: {
  char: string
  state: 'locked' | 'unlocked' | 'mastered'
  onPlay: () => void
}) {
  return (
    <motion.button
      type="button"
      variants={fadeIn}
      onClick={onPlay}
      aria-label={`${char}: ${patternToGlyphs(MORSE_CODE[char])}. Tap to hear${state === 'mastered' ? ' (mastered)' : ''}`}
      className={`flex h-[104px] flex-col items-center justify-center gap-1.5 rounded-lg border outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent-focus ${
        state === 'locked'
          ? 'border-border-subtle bg-surface-glass'
          : 'border-border-subtle bg-surface-elevated hover:border-border-strong hover:bg-surface-hover'
      }`}
    >
      <span
        className={`font-mono text-2xl font-medium ${state === 'locked' ? 'text-text-muted' : 'text-text-primary'}`}
      >
        {char}
      </span>
      <span
        className={`font-mono text-sm ${state === 'locked' ? 'text-text-muted/70' : 'text-accent-default'}`}
      >
        {patternToGlyphs(MORSE_CODE[char], '')}
      </span>
      {state === 'mastered' && (
        <span
          className="size-[7px] rounded-full bg-cta-default"
          aria-hidden="true"
        />
      )}
    </motion.button>
  )
}
