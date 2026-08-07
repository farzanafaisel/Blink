/* Scoring rules: dev notes p012 Game Logic Summary. */

export const POINTS_PER_CORRECT = 40
export const MASTERY_THRESHOLD = 0.85
export const MASTERY_WINDOW = 5

export function scoreForAnswer(comboCount: number): number {
  return POINTS_PER_CORRECT * comboMultiplier(comboCount)
}

/** Combo multiplier: ×1 base, +1 every 3 consecutive correct answers, capped ×4. */
export function comboMultiplier(comboCount: number): number {
  return Math.min(4, 1 + Math.floor(comboCount / 3))
}

/** Letter accuracy ≥85% over the last 5 recalls ⇒ mastered. */
export function isMastered(history: boolean[]): boolean {
  if (history.length < MASTERY_WINDOW) return false
  const recent = history.slice(-MASTERY_WINDOW)
  const accuracy = recent.filter(Boolean).length / recent.length
  return accuracy >= MASTERY_THRESHOLD
}
