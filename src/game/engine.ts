import type { Curriculum } from './curriculum'
import { unlockedLetters, wordAt } from './curriculum'
import { patternFor } from './morse'
import { scoreForAnswer } from './scoring'

/*
  The word engine, a pure reducer that owns all gameplay logic:
  current chapter/word/letter, input, hints, streak, scoring, and
  progression. It never touches React, the DOM, storage, or audio;
  timestamps come in through actions, and side-effects go out as
  events for the caller to interpret.
*/

export type EnginePhase =
  | 'playing'
  | 'letter-correct'
  | 'letter-incorrect'
  | 'word-complete'
  | 'chapter-complete'
  | 'game-complete'

export interface LetterAttempt {
  letter: string
  correct: boolean
  seconds: number
  usedHint: boolean
}

export interface WordSummary {
  word: string
  /** First-try correct letters / letters, 0–100. */
  accuracy: number
  seconds: number
  points: number
  usedHint: boolean
  usedKey: boolean
  perfect: boolean
}

export interface ChapterSummary {
  chapterIndex: number
  accuracy: number
  words: number
  points: number
  /** Characters introduced by the NEXT chapter, empty at the end. */
  unlocked: string[]
}

export interface EngineState {
  chapterIndex: number
  wordIndex: number
  letterIndex: number
  input: string
  phase: EnginePhase
  /** Glyphs of the current letter revealed by the hint button. */
  hintRevealed: number
  usedHintThisLetter: boolean
  usedHintThisWord: boolean
  usedKeyThisWord: boolean
  /** Consecutive first-try correct letters: drives the multiplier. */
  streak: number
  /** Points earned this session. */
  score: number
  wordPoints: number
  lastAward: number | null
  /** Whether the current letter has already had a wrong submission. */
  missedCurrentLetter: boolean
  /** Pattern revealed after a miss; stays until the letter is solved. */
  reveal: string | null
  /** Glyphs typed ahead during the correct-pop window, applied on advance. */
  buffer: string
  letterStartAt: number
  wordStartAt: number
  attempts: LetterAttempt[]
  chapterAttempts: LetterAttempt[]
  chapterPoints: number
  /** Set while phase is word-complete / chapter-complete. */
  wordSummary: WordSummary | null
  chapterSummary: ChapterSummary | null
}

export type EngineAction =
  | { type: 'glyph'; glyph: '.' | '-'; now: number }
  | { type: 'clear' }
  | { type: 'submit'; now: number }
  | { type: 'hint' }
  | { type: 'key-opened' }
  | { type: 'advance'; now: number }
  | { type: 'retry'; now: number }
  | { type: 'next-word'; now: number }
  /** masteredAll gates the finale: without it the last chapter cycles as practice. */
  | { type: 'next-chapter'; now: number; masteredAll: boolean }

export type EngineEvent =
  | { type: 'letter-correct'; letter: string; points: number; attempt: LetterAttempt }
  | { type: 'letter-incorrect'; letter: string; attempted: string }
  | { type: 'hint-used'; letter: string }
  | { type: 'word-complete'; summary: WordSummary }
  | { type: 'chapter-complete'; summary: ChapterSummary }
  | { type: 'game-complete' }

export interface EngineResult {
  state: EngineState
  events: EngineEvent[]
}

export function createEngine(
  curriculum: Curriculum,
  position: { chapterIndex: number; wordIndex: number },
  now: number,
): EngineState {
  const chapterIndex = Math.min(
    position.chapterIndex,
    curriculum.chapters.length - 1,
  )
  const wordCount = curriculum.chapters[chapterIndex].words.length
  return {
    chapterIndex,
    wordIndex: Math.min(position.wordIndex, wordCount - 1),
    letterIndex: 0,
    input: '',
    phase: 'playing',
    hintRevealed: 0,
    usedHintThisLetter: false,
    usedHintThisWord: false,
    usedKeyThisWord: false,
    streak: 0,
    score: 0,
    wordPoints: 0,
    lastAward: null,
    missedCurrentLetter: false,
    reveal: null,
    buffer: '',
    letterStartAt: now,
    wordStartAt: now,
    attempts: [],
    chapterAttempts: [],
    chapterPoints: 0,
    wordSummary: null,
    chapterSummary: null,
  }
}

/* Selectors: the UI reads gameplay state only through these. */

export function currentWord(curriculum: Curriculum, s: EngineState): string {
  return wordAt(curriculum, s.chapterIndex, s.wordIndex) ?? ''
}

export function currentLetter(curriculum: Curriculum, s: EngineState): string {
  return currentWord(curriculum, s)[s.letterIndex] ?? ''
}

export function targetPattern(curriculum: Curriculum, s: EngineState): string {
  return patternFor(currentLetter(curriculum, s))
}

/** The next glyph the hint button would reveal, or null when exhausted. */
export function nextHintGlyph(
  curriculum: Curriculum,
  s: EngineState,
): string | null {
  const pattern = targetPattern(curriculum, s)
  return s.hintRevealed < pattern.length ? pattern[s.hintRevealed] : null
}

export function lettersInPlay(curriculum: Curriculum, s: EngineState): string[] {
  return unlockedLetters(curriculum, s.chapterIndex)
}

export function reduce(
  curriculum: Curriculum,
  state: EngineState,
  action: EngineAction,
): EngineResult {
  switch (action.type) {
    case 'glyph': {
      const cap = Math.max(targetPattern(curriculum, state).length + 1, 5)
      if (state.phase === 'playing') {
        if (state.input.length >= cap) return noop(state)
        return noop({ ...state, input: state.input + action.glyph })
      }
      /* Type-ahead: taps during the correct pop buffer into the next letter. */
      if (state.phase === 'letter-correct') {
        if (state.buffer.length >= cap) return noop(state)
        return noop({ ...state, buffer: state.buffer + action.glyph })
      }
      /* Instant retry: the first tap after a miss restarts the letter. */
      if (state.phase === 'letter-incorrect') {
        return noop({
          ...state,
          phase: 'playing',
          input: action.glyph,
          letterStartAt: action.now,
        })
      }
      return noop(state)
    }

    case 'clear':
      if (state.phase !== 'playing') return noop(state)
      return noop({ ...state, input: '' })

    case 'hint': {
      if (state.phase !== 'playing') return noop(state)
      const pattern = targetPattern(curriculum, state)
      if (state.hintRevealed >= pattern.length) return noop(state)
      return {
        state: {
          ...state,
          hintRevealed: state.hintRevealed + 1,
          usedHintThisLetter: true,
          usedHintThisWord: true,
        },
        events: [
          { type: 'hint-used', letter: currentLetter(curriculum, state) },
        ],
      }
    }

    case 'key-opened':
      return noop({ ...state, usedKeyThisWord: true })

    case 'submit': {
      if (state.phase !== 'playing' || state.input.length === 0) {
        return noop(state)
      }
      const letter = currentLetter(curriculum, state)
      const pattern = targetPattern(curriculum, state)
      const seconds = (action.now - state.letterStartAt) / 1000

      if (state.input !== pattern) {
        const attempt: LetterAttempt = {
          letter,
          correct: false,
          seconds,
          usedHint: state.usedHintThisLetter,
        }
        return {
          state: {
            ...state,
            phase: 'letter-incorrect',
            streak: 0,
            missedCurrentLetter: true,
            reveal: pattern,
            attempts: [...state.attempts, attempt],
            chapterAttempts: [...state.chapterAttempts, attempt],
          },
          events: [
            { type: 'letter-incorrect', letter, attempted: state.input },
          ],
        }
      }

      const attempt: LetterAttempt = {
        letter,
        correct: true,
        seconds,
        usedHint: state.usedHintThisLetter,
      }
      /* Streak counts clean letters: first try, no hint. */
      const clean = !state.missedCurrentLetter && !state.usedHintThisLetter
      const points = scoreForAnswer(state.streak)
      return {
        state: {
          ...state,
          phase: 'letter-correct',
          streak: clean ? state.streak + 1 : 0,
          score: state.score + points,
          wordPoints: state.wordPoints + points,
          chapterPoints: state.chapterPoints + points,
          lastAward: points,
          attempts: [...state.attempts, attempt],
          chapterAttempts: [...state.chapterAttempts, attempt],
        },
        events: [{ type: 'letter-correct', letter, points, attempt }],
      }
    }

    case 'retry':
      if (state.phase !== 'letter-incorrect') return noop(state)
      return noop({
        ...state,
        phase: 'playing',
        input: '',
        letterStartAt: action.now,
      })

    case 'advance': {
      if (state.phase !== 'letter-correct') return noop(state)
      const word = currentWord(curriculum, state)
      if (state.letterIndex + 1 < word.length) {
        return noop({
          ...state,
          phase: 'playing',
          letterIndex: state.letterIndex + 1,
          input: state.buffer,
          buffer: '',
          hintRevealed: 0,
          usedHintThisLetter: false,
          missedCurrentLetter: false,
          reveal: null,
          letterStartAt: action.now,
        })
      }
      const summary = summarizeWord(curriculum, state, action.now)
      return {
        state: { ...state, phase: 'word-complete', wordSummary: summary },
        events: [{ type: 'word-complete', summary }],
      }
    }

    case 'next-word': {
      if (state.phase !== 'word-complete') return noop(state)
      const chapter = curriculum.chapters[state.chapterIndex]
      if (state.wordIndex + 1 < chapter.words.length) {
        return noop(startWord(state, state.chapterIndex, state.wordIndex + 1, action.now))
      }
      const summary = summarizeChapter(curriculum, state)
      return {
        state: { ...state, phase: 'chapter-complete', chapterSummary: summary },
        events: [{ type: 'chapter-complete', summary }],
      }
    }

    case 'next-chapter': {
      if (state.phase !== 'chapter-complete') return noop(state)
      if (state.chapterIndex + 1 < curriculum.chapters.length) {
        return noop({
          ...startWord(state, state.chapterIndex + 1, 0, action.now),
          chapterAttempts: [],
          chapterPoints: 0,
        })
      }
      /* Chapters exhausted: the finale requires real mastery. Until then
         the last chapter cycles as practice. */
      if (!action.masteredAll) {
        return noop({
          ...startWord(state, state.chapterIndex, 0, action.now),
          chapterAttempts: [],
          chapterPoints: 0,
        })
      }
      return {
        state: { ...state, phase: 'game-complete' },
        events: [{ type: 'game-complete' }],
      }
    }
  }
}

function noop(state: EngineState): EngineResult {
  return { state, events: [] }
}

function startWord(
  state: EngineState,
  chapterIndex: number,
  wordIndex: number,
  now: number,
): EngineState {
  return {
    ...state,
    chapterIndex,
    wordIndex,
    letterIndex: 0,
    input: '',
    phase: 'playing',
    hintRevealed: 0,
    usedHintThisLetter: false,
    usedHintThisWord: false,
    usedKeyThisWord: false,
    wordPoints: 0,
    lastAward: null,
    missedCurrentLetter: false,
    reveal: null,
    buffer: '',
    letterStartAt: now,
    wordStartAt: now,
    attempts: [],
    wordSummary: null,
    chapterSummary: null,
  }
}

function summarizeWord(
  curriculum: Curriculum,
  state: EngineState,
  now: number,
): WordSummary {
  const word = currentWord(curriculum, state)
  /* Attempts arrive in slot order; a slot advances after its correct
     submit, so the first attempt seen per slot decides "first try". */
  let firstTryCorrect = 0
  let firstAttemptOfSlot = true
  for (const attempt of state.attempts) {
    if (firstAttemptOfSlot && attempt.correct) firstTryCorrect += 1
    firstAttemptOfSlot = attempt.correct
  }
  const accuracy =
    word.length > 0 ? Math.round((firstTryCorrect / word.length) * 100) : 100
  return {
    word,
    accuracy,
    seconds: (now - state.wordStartAt) / 1000,
    points: state.wordPoints,
    usedHint: state.usedHintThisWord,
    usedKey: state.usedKeyThisWord,
    perfect: accuracy === 100 && !state.usedHintThisWord,
  }
}

function summarizeChapter(
  curriculum: Curriculum,
  state: EngineState,
): ChapterSummary {
  const attempts = state.chapterAttempts
  const correct = attempts.filter((a) => a.correct).length
  return {
    chapterIndex: state.chapterIndex,
    accuracy:
      attempts.length > 0
        ? Math.round((correct / attempts.length) * 100)
        : 100,
    words: curriculum.chapters[state.chapterIndex].words.length,
    points: state.chapterPoints,
    unlocked: curriculum.chapters[state.chapterIndex + 1]?.letters ?? [],
  }
}
