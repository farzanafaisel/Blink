import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Keycap } from '@/components/Keycap'
import { MorseKey } from '@/components/MorseKey'
import { MorseKeyPanel } from '@/components/MorseKeyPanel'
import { Hud } from '@/components/Layout'
import { ToastViewport } from '@/components/Toast'
import { useMorseStore } from '@/app/store'
import { CURRICULUM, firstWord } from '@/game/curriculum'
import {
  currentLetter,
  currentWord,
  targetPattern,
} from '@/game/engine'
import { patternToGlyphs, patternToWords } from '@/game/morse'
import { useKeyboard } from '@/hooks/useKeyboard'
import { usePlayTime } from '@/hooks/usePlayTime'
import { useWordEngine } from '@/hooks/useWordEngine'
import { errorShake, fadeIn, successPop } from '@/utils/motion'
import { PauseMenu } from './PauseMenu'
import { WordComplete } from './WordComplete'
import { ChapterComplete } from './ChapterComplete'
import { GameComplete } from './GameComplete'

/* Screens 004 to 007: the whole loop lives on this one screen. */
export function WordGameplay() {
  const navigate = useNavigate()
  const engine = useWordEngine()
  const { state } = engine
  usePlayTime()

  const totalScore = useMorseStore((s) => s.totalScore)
  const tutorialSeen = useMorseStore((s) => s.tutorialSeen)
  const markTutorialSeen = useMorseStore((s) => s.markTutorialSeen)

  const [keyOpen, setKeyOpen] = useState(false)
  const [paused, setPaused] = useState(false)

  const word = currentWord(CURRICULUM, state)
  const letter = currentLetter(CURRICULUM, state)
  const pattern = targetPattern(CURRICULUM, state)
  const chapter = CURRICULUM.chapters[state.chapterIndex]
  const reveal = state.reveal

  const isTutorialWord =
    !tutorialSeen && word === firstWord(CURRICULUM) && state.chapterIndex === 0

  /* The scaffold retires once the first word is done, never again. */
  useEffect(() => {
    if (isTutorialWord && state.phase === 'word-complete') markTutorialSeen()
  }, [isTutorialWord, state.phase, markTutorialSeen])

  const toggleKey = useCallback(() => {
    setKeyOpen((open) => {
      if (!open) engine.keyOpened()
      return !open
    })
  }, [engine])

  const submit = engine.submit

  /* Screen-reader narration of the loop (a11y p011). */
  const announcement =
    state.phase === 'letter-correct'
      ? `${letter} correct. Plus ${state.lastAward} points.`
      : state.phase === 'letter-incorrect'
        ? `Incorrect. ${letter} is ${patternToWords(pattern)}. Try again.`
        : state.phase === 'word-complete'
          ? `Word ${word} complete.`
          : state.phase === 'chapter-complete'
            ? `Chapter ${state.chapterIndex + 1} complete.`
            : letter
              ? `Letter ${state.letterIndex + 1} of ${word.length}: ${letter}.`
              : ''

  useKeyboard({ Escape: () => setPaused((p) => !p) }, true)
  useKeyboard(
    {
      ' ': () => engine.addGlyph('.'),
      f: () => engine.addGlyph('-'),
      Enter: () => {
        if (state.phase === 'playing') submit()
        else if (state.phase === 'word-complete') engine.nextWord()
        else if (state.phase === 'chapter-complete') engine.nextChapter()
      },
      Backspace: engine.clear,
      h: engine.hint,
      k: toggleKey,
    },
    !paused,
  )

  if (state.phase === 'game-complete') {
    return <GameComplete />
  }

  const celebration =
    state.phase === 'word-complete' || state.phase === 'chapter-complete'

  return (
    <div className="flex min-h-dvh flex-col">
      <div aria-live="polite" className="sr-only" role="status">
        {announcement}
      </div>
      {!celebration && (
        <Hud
          badge={`CHAPTER ${state.chapterIndex + 1}`}
          progress={{
            value: state.wordIndex + (state.phase === 'word-complete' ? 1 : 0),
            max: chapter.words.length,
            caption: `WORD ${state.wordIndex + 1} / ${chapter.words.length}`,
          }}
          onKeyToggle={toggleKey}
          streak={state.streak}
          score={totalScore + state.wordPoints}
        />
      )}

      <main className="mx-auto flex w-full max-w-[800px] flex-1 flex-col px-[22px] md:px-6">
        <AnimatePresence mode="wait">
          {state.phase === 'word-complete' ? (
            <motion.div
              key="word-complete"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-1 flex-col"
            >
              <WordComplete
                summary={null}
                engineState={state}
                onNextWord={engine.nextWord}
                onBackToModes={() => navigate('/play')}
              />
            </motion.div>
          ) : state.phase === 'chapter-complete' ? (
            <motion.div
              key="chapter-complete"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-1 flex-col"
            >
              <ChapterComplete
                engineState={state}
                onNextChapter={engine.nextChapter}
                onMorseKey={() => navigate('/key')}
              />
            </motion.div>
          ) : (
            <motion.div
              key={`play-${state.wordIndex}`}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-1 flex-col items-center justify-between py-10"
            >
              {/* Word slots */}
              <div className="flex items-center gap-4" aria-label={`Word: ${word}`}>
                {[...word].map((char, i) => {
                  const done = i < state.letterIndex
                  const current = i === state.letterIndex
                  return (
                    <motion.div
                      key={i}
                      variants={
                        current && state.phase === 'letter-correct'
                          ? successPop
                          : undefined
                      }
                      initial="hidden"
                      animate="visible"
                      className={`flex h-[120px] w-[110px] flex-col items-center justify-center gap-2 rounded-lg border ${
                        current
                          ? 'border-[1.5px] border-text-primary bg-surface-elevated'
                          : 'border-border-subtle bg-surface-glass'
                      }`}
                      aria-current={current ? 'true' : undefined}
                    >
                      <span
                        className={`text-[53px] leading-none font-semibold ${
                          current && state.phase === 'letter-correct'
                            ? 'text-feedback-success'
                            : current
                              ? 'text-text-primary'
                              : done
                                ? 'text-cta-pressed'
                                : 'text-text-muted/70'
                        }`}
                      >
                        {char}
                      </span>
                      {current && (
                        <span className="h-[3px] w-7 rounded-full bg-text-primary" />
                      )}
                    </motion.div>
                  )
                })}
              </div>

              <span className="text-overline text-text-muted">
                Spell it in signals
              </span>

              {/* Reveal chip (incorrect state) */}
              {reveal && (
                <motion.div
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  className="flex items-center gap-2.5 rounded-full border border-border-subtle bg-surface-elevated px-4 py-2"
                  aria-live="polite"
                >
                  <span className="text-body-sm text-text-secondary">
                    {letter} =
                  </span>
                  <span className="font-mono text-lg tracking-[0.1em] text-accent-default">
                    {patternToGlyphs(reveal)}
                  </span>
                </motion.div>
              )}

              {/* Sequence input */}
              <motion.div
                key={`seq-${state.attempts.length}`}
                variants={
                  state.phase === 'letter-incorrect' ? errorShake : undefined
                }
                initial="hidden"
                animate="visible"
                className="flex items-center gap-3"
                aria-label={`Your input: ${state.input || 'empty'}`}
                aria-live="polite"
              >
                {[...state.input].map((glyph, i) => (
                  <span
                    key={`g${i}`}
                    className={`flex size-14 items-center justify-center rounded-md border bg-surface-elevated ${
                      state.phase === 'letter-incorrect'
                        ? 'border-feedback-error'
                        : 'border-border-subtle'
                    }`}
                  >
                    {glyph === '.' ? (
                      <span className="size-3 rounded-full bg-accent-default" />
                    ) : (
                      <span className="h-2 w-6 rounded-full bg-accent-default" />
                    )}
                  </span>
                ))}
                {/* Hint ghosts */}
                {pattern
                  .slice(state.input.length, state.hintRevealed)
                  .split('')
                  .map((glyph, i) => (
                    <span
                      key={`h${i}`}
                      className="flex size-14 items-center justify-center rounded-md border border-dashed border-border-strong bg-surface-glass opacity-70"
                    >
                      {glyph === '.' ? (
                        <span className="size-3 rounded-full bg-text-muted" />
                      ) : (
                        <span className="h-2 w-6 rounded-full bg-text-muted" />
                      )}
                    </span>
                  ))}
                {state.phase === 'playing' && (
                  <span className="flex size-14 items-center justify-center rounded-md border border-cta-default bg-surface-elevated">
                    <span className="h-5 w-0.5 animate-pulse bg-cta-default" />
                  </span>
                )}
                {state.phase === 'letter-correct' && (
                  <motion.span
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    className="ml-2 font-mono text-xl font-medium text-accent-text"
                  >
                    +{state.lastAward}
                  </motion.span>
                )}
              </motion.div>

              {/* Keys */}
              <div className="flex items-center gap-6">
                <MorseKey type="dot" onPress={() => engine.addGlyph('.')} />
                <MorseKey type="dash" onPress={() => engine.addGlyph('-')} />
              </div>

              {/* Shortcuts + tutorial ghosts */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-3 max-md:hidden">
                  <Keycap>SPACE</Keycap>
                  <span className="text-caption text-text-muted">dot</span>
                  <span className="mx-1 h-px w-3 bg-border-subtle" />
                  <Keycap>F</Keycap>
                  <span className="text-caption text-text-muted">dash</span>
                  <span className="mx-1 h-px w-3 bg-border-subtle" />
                  <Keycap>K</Keycap>
                  <span className="text-caption text-text-muted">morse key</span>
                </div>
                {isTutorialWord && (
                  <div
                    className="flex items-center gap-2 rounded-full bg-accent-tint px-4 py-1.5"
                    role="status"
                  >
                    <span className="text-caption text-accent-default">
                      {state.letterIndex === 0
                        ? `${letter} is ${patternToGlyphs(pattern)} in Morse. Tap it below, then press Submit.`
                        : state.letterIndex === 1
                          ? `Now ${letter}: tap ${patternToGlyphs(pattern)} and submit again.`
                          : 'Stuck later? Press K to open the Morse Key.'}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={engine.hint}>
                  Hint
                </Button>
                <Button
                  variant="ghost"
                  onClick={engine.clear}
                  disabled={state.input.length === 0}
                >
                  Clear
                </Button>
                <Button onClick={submit} disabled={state.input.length === 0}>
                  Submit
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <MorseKeyPanel
        open={keyOpen && !celebration}
        currentLetter={letter}
        onClose={() => setKeyOpen(false)}
      />

      <PauseMenu
        open={paused}
        wordNumber={state.wordIndex + 1}
        chapterNumber={state.chapterIndex + 1}
        onResume={() => setPaused(false)}
        onSettings={() => navigate('/settings')}
        onQuit={() => navigate('/play')}
      />
      <ToastViewport />
    </div>
  )
}
