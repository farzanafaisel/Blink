import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LetterAttempt, WordSummary } from '@/game/engine'
import { CURRICULUM, unlockedLetters } from '@/game/curriculum'
import { isMastered } from '@/game/scoring'
import { LETTERS } from '@/game/morse'
import { setSfxEnabled } from '@/services/audio'

/*
  Persistence layer. The engine owns gameplay logic; this store owns
  durable progress and settings, and applies engine outcomes
  (attempts, word/chapter summaries) plus achievement triggers.
*/

export interface Settings {
  music: boolean
  soundEffects: boolean
  animations: boolean
  reducedMotion: boolean
  highContrast: boolean
  largerPatterns: boolean
}

export interface DailyRecord {
  date: string
  word: string
  success: boolean
}

interface MorseState {
  settings: Settings
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void

  /** Resume position in the curriculum. */
  chapterIndex: number
  wordIndex: number
  /** Rolling recall history per character, newest last. */
  letterHistory: Record<string, boolean[]>
  totalScore: number
  wordsCompleted: number
  hintsUsed: number
  bestTimedScore: number
  audioWordsCorrect: number
  dailyStreak: number
  longestDailyStreak: number
  lastDailyDate: string | null
  dailyHistory: DailyRecord[]
  playSeconds: number
  daysPlayed: string[]
  achievements: Record<string, true>
  tutorialSeen: boolean

  applyLetterAttempt: (attempt: LetterAttempt, streakAfter: number) => void
  recordHintUsed: () => void
  applyWordComplete: (summary: WordSummary, hour: number) => void
  advancePosition: (chapterIndex: number, wordIndex: number) => void
  completeDaily: (record: DailyRecord) => void
  recordAudioWord: () => void
  setBestTimedScore: (score: number) => void
  addPlayTime: (seconds: number) => void
  markTutorialSeen: () => void
  unlockAchievement: (id: string) => void
  resetProgress: () => void
}

const initialProgress = {
  chapterIndex: 0,
  wordIndex: 0,
  letterHistory: {} as Record<string, boolean[]>,
  totalScore: 0,
  wordsCompleted: 0,
  hintsUsed: 0,
  bestTimedScore: 0,
  audioWordsCorrect: 0,
  dailyStreak: 0,
  longestDailyStreak: 0,
  lastDailyDate: null,
  dailyHistory: [] as DailyRecord[],
  playSeconds: 0,
  daysPlayed: [] as string[],
  achievements: {} as Record<string, true>,
  tutorialSeen: false,
}

export const useMorseStore = create<MorseState>()(
  persist(
    (set) => ({
      settings: {
        music: false,
        soundEffects: true,
        animations: true,
        reducedMotion: false,
        highContrast: false,
        largerPatterns: false,
      },
      setSetting: (key, value) => {
        set((s) => ({ settings: { ...s.settings, [key]: value } }))
        if (key === 'soundEffects') setSfxEnabled(value as boolean)
      },

      ...initialProgress,

      applyLetterAttempt: (attempt, streakAfter) =>
        set((s) => {
          const history = [
            ...(s.letterHistory[attempt.letter] ?? []),
            attempt.correct,
          ].slice(-20)
          const achievements = { ...s.achievements }
          if (streakAfter >= 3) achievements['hat-trick'] = true
          if (attempt.correct && attempt.seconds < 1) {
            achievements['sub-second'] = true
          }
          return {
            letterHistory: { ...s.letterHistory, [attempt.letter]: history },
            achievements,
          }
        }),

      recordHintUsed: () => set((s) => ({ hintsUsed: s.hintsUsed + 1 })),

      applyWordComplete: (summary, hour) =>
        set((s) => {
          const achievements = { ...s.achievements }
          achievements['first-word'] = true
          if (!summary.usedKey && !summary.usedHint) {
            achievements['no-key-word'] = true
          }
          if (hour < 5) achievements['midnight-word'] = true
          if (summary.perfect) achievements['perfect-word'] = true
          return {
            wordsCompleted: s.wordsCompleted + 1,
            totalScore: s.totalScore + summary.points,
            achievements,
          }
        }),

      advancePosition: (chapterIndex, wordIndex) =>
        set((s) => {
          const achievements = { ...s.achievements }
          if (
            masteredLetters(s.letterHistory).length >= LETTERS.length
          ) {
            achievements['fluent'] = true
          }
          return { chapterIndex, wordIndex, achievements }
        }),

      completeDaily: (record) =>
        set((s) => {
          if (s.lastDailyDate === record.date) return s
          const yesterday = new Date(record.date)
          yesterday.setDate(yesterday.getDate() - 1)
          const wasYesterday =
            s.lastDailyDate === yesterday.toISOString().slice(0, 10)
          const dailyStreak = record.success
            ? wasYesterday
              ? s.dailyStreak + 1
              : 1
            : 0
          return {
            dailyStreak,
            longestDailyStreak: Math.max(s.longestDailyStreak, dailyStreak),
            lastDailyDate: record.date,
            dailyHistory: [...s.dailyHistory, record].slice(-60),
            achievements:
              dailyStreak >= 30
                ? { ...s.achievements, marathon: true }
                : s.achievements,
          }
        }),

      recordAudioWord: () =>
        set((s) => {
          const audioWordsCorrect = s.audioWordsCorrect + 1
          return {
            audioWordsCorrect,
            achievements:
              audioWordsCorrect >= 50
                ? { ...s.achievements, 'deep-listener': true }
                : s.achievements,
          }
        }),

      setBestTimedScore: (score) =>
        set((s) => ({ bestTimedScore: Math.max(s.bestTimedScore, score) })),

      addPlayTime: (seconds) =>
        set((s) => {
          const today = new Date().toISOString().slice(0, 10)
          return {
            playSeconds: s.playSeconds + seconds,
            daysPlayed: s.daysPlayed.includes(today)
              ? s.daysPlayed
              : [...s.daysPlayed, today],
          }
        }),

      markTutorialSeen: () => set({ tutorialSeen: true }),

      unlockAchievement: (id) =>
        set((s) => ({ achievements: { ...s.achievements, [id]: true } })),

      resetProgress: () => set({ ...initialProgress }),
    }),
    {
      name: 'morse-storage',
      version: 2,
      onRehydrateStorage: () => (state) => {
        if (state) setSfxEnabled(state.settings.soundEffects)
      },
    },
  ),
)

export function masteredLetters(
  letterHistory: Record<string, boolean[]>,
): string[] {
  return Object.keys(letterHistory).filter(
    (l) => /[A-Z]/.test(l) && isMastered(letterHistory[l]),
  )
}

export type LetterKeyState = 'locked' | 'unlocked' | 'mastered'

export function letterKeyState(
  char: string,
  chapterIndex: number,
  letterHistory: Record<string, boolean[]>,
): LetterKeyState {
  const unlocked = new Set(unlockedLetters(CURRICULUM, chapterIndex))
  if (!unlocked.has(char)) return 'locked'
  return isMastered(letterHistory[char] ?? []) ? 'mastered' : 'unlocked'
}
