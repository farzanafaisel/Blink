import { useCallback, useEffect, useRef, useState } from 'react'
import { CURRICULUM } from '@/game/curriculum'
import {
  createEngine,
  reduce,
  type EngineAction,
  type EngineEvent,
  type EngineState,
} from '@/game/engine'
import { masteredLetters, useMorseStore } from '@/app/store'
import { LETTERS } from '@/game/morse'
import { playCorrect, playTick, playWrong } from '@/services/audio'

const AUTO_ADVANCE_MS = 400
const RETRY_MS = 700

/*
  Bridges the pure engine to the app: React state on one side,
  persistence + audio on the other. Components read `state` and call
  the action helpers, no gameplay rules live here or in the UI.
*/
export function useWordEngine() {
  const applyLetterAttempt = useMorseStore((s) => s.applyLetterAttempt)
  const recordHintUsed = useMorseStore((s) => s.recordHintUsed)
  const applyWordComplete = useMorseStore((s) => s.applyWordComplete)
  const advancePosition = useMorseStore((s) => s.advancePosition)

  const [state, setState] = useState<EngineState>(() =>
    createEngine(
      CURRICULUM,
      {
        chapterIndex: useMorseStore.getState().chapterIndex,
        wordIndex: useMorseStore.getState().wordIndex,
      },
      performance.now(),
    ),
  )
  /* All mutations flow through dispatch, which keeps this ref current. */
  const stateRef = useRef(state)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  const handleEvents = useCallback(
    (events: EngineEvent[], nextState: EngineState) => {
      for (const event of events) {
        switch (event.type) {
          case 'letter-correct':
            playCorrect()
            applyLetterAttempt(event.attempt, nextState.streak)
            break
          case 'letter-incorrect':
            playWrong()
            applyLetterAttempt(
              { letter: event.letter, correct: false, seconds: 0, usedHint: false },
              0,
            )
            break
          case 'hint-used':
            recordHintUsed()
            break
          case 'word-complete':
            applyWordComplete(event.summary, new Date().getHours())
            break
          case 'chapter-complete':
          case 'game-complete':
            break
        }
      }
    },
    [applyLetterAttempt, applyWordComplete, recordHintUsed],
  )

  const dispatch = useCallback(
    (action: EngineAction) => {
      const { state: next, events } = reduce(
        CURRICULUM,
        stateRef.current,
        action,
      )
      stateRef.current = next
      setState(next)
      handleEvents(events, next)
      return next
    },
    [handleEvents],
  )

  /* Correct letters auto-advance after 400ms with no interruption;
     misses reveal the pattern and retry in place shortly after. */
  useEffect(() => {
    if (state.phase === 'letter-correct') {
      advanceTimer.current = setTimeout(
        () => dispatch({ type: 'advance', now: performance.now() }),
        AUTO_ADVANCE_MS,
      )
      return () => clearTimeout(advanceTimer.current)
    }
    if (state.phase === 'letter-incorrect') {
      advanceTimer.current = setTimeout(
        () => dispatch({ type: 'retry', now: performance.now() }),
        RETRY_MS,
      )
      return () => clearTimeout(advanceTimer.current)
    }
  }, [state.phase, dispatch])

  /* Persist the resume position whenever a word or chapter resolves. */
  useEffect(() => {
    if (state.phase === 'word-complete') {
      const chapter = CURRICULUM.chapters[state.chapterIndex]
      const nextWord = Math.min(
        state.wordIndex + 1,
        chapter.words.length - 1,
      )
      advancePosition(state.chapterIndex, nextWord)
    } else if (state.phase === 'chapter-complete') {
      const last = CURRICULUM.chapters.length - 1
      advancePosition(Math.min(state.chapterIndex + 1, last), 0)
    }
  }, [state.phase, state.chapterIndex, state.wordIndex, advancePosition])

  const addGlyph = useCallback(
    (glyph: '.' | '-') => {
      const phase = stateRef.current.phase
      if (
        phase !== 'playing' &&
        phase !== 'letter-correct' &&
        phase !== 'letter-incorrect'
      ) {
        return
      }
      playTick()
      dispatch({ type: 'glyph', glyph, now: performance.now() })
    },
    [dispatch],
  )

  return {
    state,
    dispatch,
    addGlyph,
    clear: useCallback(() => dispatch({ type: 'clear' }), [dispatch]),
    submit: useCallback(
      () => dispatch({ type: 'submit', now: performance.now() }),
      [dispatch],
    ),
    hint: useCallback(() => dispatch({ type: 'hint' }), [dispatch]),
    keyOpened: useCallback(() => dispatch({ type: 'key-opened' }), [dispatch]),
    retry: useCallback(
      () => dispatch({ type: 'retry', now: performance.now() }),
      [dispatch],
    ),
    nextWord: useCallback(
      () => dispatch({ type: 'next-word', now: performance.now() }),
      [dispatch],
    ),
    nextChapter: useCallback(() => {
      const masteredAll =
        masteredLetters(useMorseStore.getState().letterHistory).length >=
        LETTERS.length
      return dispatch({ type: 'next-chapter', now: performance.now(), masteredAll })
    }, [dispatch]),
  }
}
