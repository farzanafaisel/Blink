import { MORSE_CODE } from './morse'

/*
  Curriculum data, the single source of truth for progression
  (dev notes p012). The engine and UI are generic over this shape:
  reorder chapters, swap words, or move mode unlocks here and nothing
  in gameplay logic changes.
*/

export type GameMode = 'timed' | 'audio'

export interface Chapter {
  /** Stable id: survives reordering. */
  id: string
  title: string
  /** Characters introduced by this chapter. */
  letters: string[]
  /** Mode that becomes available once this chapter is reached. */
  unlocksMode?: GameMode
  /** Playable words, in order, using only characters unlocked so far. */
  words: string[]
}

export interface Curriculum {
  chapters: Chapter[]
}

export const CURRICULUM: Curriculum = {
  chapters: [
    {
      id: 'ch-1',
      title: 'First signals',
      letters: ['E', 'T', 'A', 'N'],
      words: ['TEA', 'EAT', 'ANT', 'NET', 'TAN', 'NEAT', 'ANTE', 'TEEN'],
    },
    {
      id: 'ch-2',
      title: 'Common ground',
      letters: ['I', 'M', 'S', 'O'],
      words: ['SIT', 'MOST', 'TIME', 'MOON', 'SEAT', 'MIST', 'STONE', 'ATOMS'],
    },
    {
      id: 'ch-3',
      title: 'Rhythm builds',
      letters: ['R', 'D', 'L', 'U'],
      unlocksMode: 'timed',
      words: ['RAIN', 'LOUD', 'DREAM', 'SOLID', 'TRAIL', 'ROUND', 'MEDAL', 'RESULT'],
    },
    {
      id: 'ch-4',
      title: 'Growing fluent',
      letters: ['H', 'C', 'W', 'G'],
      unlocksMode: 'audio',
      words: ['WATCH', 'CHARM', 'LIGHT', 'GROWS', 'CHASE', 'WEIGH', 'SIGNAL', 'SWITCH'],
    },
    {
      id: 'ch-5',
      title: 'The full alphabet',
      letters: ['F', 'P', 'V', 'B', 'K', 'J', 'X', 'Q', 'Y', 'Z'],
      words: ['PIXEL', 'QUIZ', 'VERB', 'KAYAK', 'FOXES', 'ZEBRA', 'QUEEN', 'JOKER'],
    },
    {
      id: 'ch-6',
      title: 'Numbers',
      letters: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      words: ['10', '26', '42', '73', '88', '100', '365', '999'],
    },
  ],
}

/** Characters unlocked once the given chapter (0-based) is reachable. */
export function unlockedLetters(
  curriculum: Curriculum,
  chapterIndex: number,
): string[] {
  return curriculum.chapters
    .slice(0, chapterIndex + 1)
    .flatMap((c) => c.letters)
}

/** Alphabetic letters only (skips the numbers chapter), for mastery /26. */
export function unlockedAlphaLetters(
  curriculum: Curriculum,
  chapterIndex: number,
): string[] {
  return unlockedLetters(curriculum, chapterIndex).filter((c) =>
    /[A-Z]/.test(c),
  )
}

/** The first playable word in the curriculum, used for one-time tutorial hints. */
export function firstWord(curriculum: Curriculum): string {
  return curriculum.chapters[0]?.words[0] ?? ''
}

export function wordAt(
  curriculum: Curriculum,
  chapterIndex: number,
  wordIndex: number,
): string | undefined {
  return curriculum.chapters[chapterIndex]?.words[wordIndex]
}

/** 0-based chapter index at which a mode unlocks; null = always available. */
export function modeUnlockChapter(
  curriculum: Curriculum,
  mode: GameMode,
): number | null {
  const index = curriculum.chapters.findIndex((c) => c.unlocksMode === mode)
  return index === -1 ? null : index
}

export function isModeUnlocked(
  curriculum: Curriculum,
  mode: GameMode,
  chapterIndex: number,
): boolean {
  const unlockAt = modeUnlockChapter(curriculum, mode)
  return unlockAt === null || chapterIndex >= unlockAt
}

/**
 * Sanity-checks the data: every word must be spellable with the letters
 * unlocked by its chapter, and every letter must exist in the code table.
 * Returns human-readable problems; empty array = valid.
 */
export function validateCurriculum(curriculum: Curriculum): string[] {
  const problems: string[] = []
  curriculum.chapters.forEach((chapter, index) => {
    for (const letter of chapter.letters) {
      if (!(letter in MORSE_CODE)) {
        problems.push(`${chapter.id}: "${letter}" has no Morse pattern`)
      }
    }
    const available = new Set(unlockedLetters(curriculum, index))
    for (const word of chapter.words) {
      for (const char of word) {
        if (!available.has(char)) {
          problems.push(
            `${chapter.id}: word "${word}" uses locked character "${char}"`,
          )
        }
      }
    }
  })
  return problems
}

if (import.meta.env.DEV) {
  for (const problem of validateCurriculum(CURRICULUM)) {
    console.error(`[curriculum] ${problem}`)
  }
}
