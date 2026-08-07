import { AnimatePresence, motion } from 'framer-motion'
import { Keycap } from '@/components/Keycap'
import { letterKeyState, useMorseStore } from '@/app/store'
import {
  LETTERS,
  MORSE_CODE,
  patternToGlyphs,
  patternToWords,
} from '@/game/morse'
import { playPattern } from '@/services/audio'
import { duration, easeStandard } from '@/utils/motion'

export interface MorseKeyPanelProps {
  open: boolean
  /** Letter row highlighted green: the letter currently in play. */
  currentLetter?: string
  onClose: () => void
}

const DIGITS = Object.keys(MORSE_CODE).filter((c) => /[0-9]/.test(c))

/*
  Figma Morse Key Panel (21:286): permanent in-game reference.
  Desktop: collapsible right panel (K), non-modal, gameplay stays
  interactive. Mobile: bottom sheet. Green row = current letter.
  Rows are tappable: hearing a pattern is part of checking it.
*/
export function MorseKeyPanel({
  open,
  currentLetter,
  onClose,
}: MorseKeyPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Desktop: right slide-in */}
          <motion.aside
            key="panel"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: duration.slow, ease: easeStandard }}
            className="shadow-toast fixed top-12 right-4 bottom-6 z-30 hidden w-[360px] flex-col gap-4 overflow-y-auto rounded-xl border border-border-subtle bg-surface-overlay p-6 md:flex"
            aria-label="Morse Key reference"
          >
            <PanelContent currentLetter={currentLetter} onClose={onClose} />
          </motion.aside>

          {/* Mobile: bottom sheet */}
          <motion.aside
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: duration.slow, ease: easeStandard }}
            className="shadow-toast fixed inset-x-0 bottom-0 z-30 flex max-h-[70dvh] flex-col gap-4 overflow-y-auto rounded-t-2xl border border-border-subtle bg-surface-overlay p-6 md:hidden"
            aria-label="Morse Key reference"
          >
            <div
              className="mx-auto h-1 w-10 shrink-0 rounded-full bg-border-strong"
              aria-hidden="true"
            />
            <PanelContent currentLetter={currentLetter} onClose={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function PanelContent({
  currentLetter,
  onClose,
}: {
  currentLetter?: string
  onClose: () => void
}) {
  const chapterIndex = useMorseStore((s) => s.chapterIndex)
  const letterHistory = useMorseStore((s) => s.letterHistory)

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Morse Key</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Morse Key"
          className="rounded-[6px] outline-none focus-visible:ring-2 focus-visible:ring-accent-focus"
        >
          <Keycap>K</Keycap>
        </button>
      </div>

      <div className="flex items-center gap-4 rounded-md bg-surface-glass px-3.5 py-2.5">
        <span className="size-2.5 shrink-0 rounded-full bg-accent-default" />
        <span className="font-mono text-[11px] text-text-muted">1 unit</span>
        <span className="h-2.5 w-7 shrink-0 rounded-full bg-accent-default" />
        <span className="font-mono text-[11px] text-text-muted">3 units</span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {LETTERS.map((letter) => (
          <KeyRow
            key={letter}
            char={letter}
            current={letter === currentLetter}
            mastered={
              letterKeyState(letter, chapterIndex, letterHistory) === 'mastered'
            }
          />
        ))}
      </div>

      <span className="font-mono text-[10px] font-medium tracking-[0.1em] text-text-muted">
        NUMBERS
      </span>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {DIGITS.map((digit) => (
          <KeyRow
            key={digit}
            char={digit}
            current={digit === currentLetter}
            mastered={
              letterKeyState(digit, chapterIndex, letterHistory) === 'mastered'
            }
          />
        ))}
      </div>

      <p className="text-[11px] text-text-muted">
        Checking is always free. Streaks grow when you answer from memory. Tap
        a row to hear it.
      </p>
    </>
  )
}

function KeyRow({
  char,
  current,
  mastered,
}: {
  char: string
  current: boolean
  mastered: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => playPattern(MORSE_CODE[char], () => {})}
      aria-label={`${char}: ${patternToWords(MORSE_CODE[char])}. Tap to hear${mastered ? '. Mastered' : ''}`}
      aria-current={current ? 'true' : undefined}
      className={`flex items-center justify-between rounded-sm px-2.5 py-[5px] outline-none transition-colors duration-150 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent-focus ${current ? 'bg-cta-tint hover:bg-cta-tint' : ''}`}
    >
      <span className="flex items-center gap-1.5">
        <span className="font-mono text-[13px] font-medium text-text-primary">
          {char}
        </span>
        {mastered && (
          <span
            className="size-[5px] rounded-full bg-cta-default"
            aria-hidden="true"
          />
        )}
      </span>
      <span
        className={`font-mono text-xs ${current ? 'text-cta-pressed' : 'text-accent-default'}`}
      >
        {patternToGlyphs(MORSE_CODE[char], '')}
      </span>
    </button>
  )
}
