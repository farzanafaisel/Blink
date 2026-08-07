/* Morse code data: pure, no gameplay logic. */

export const MORSE_CODE: Record<string, string> = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
}

export const LETTERS = Object.keys(MORSE_CODE).filter((c) => /[A-Z]/.test(c))
export const ALPHABET_SIZE = LETTERS.length

/** Longest pattern in the code table (numbers are 5 glyphs). */
export const MAX_PATTERN_LENGTH = Math.max(
  ...Object.values(MORSE_CODE).map((p) => p.length),
)

export function patternFor(char: string): string {
  return MORSE_CODE[char.toUpperCase()] ?? ''
}

/** Pattern as typographic glyphs for display: ".-" → "· —". */
export function patternToGlyphs(pattern: string, separator = ' '): string {
  return [...pattern].map((g) => (g === '.' ? '·' : '—')).join(separator)
}

/** Pattern spoken for screen readers: ".-" → "dot dash". */
export function patternToWords(pattern: string): string {
  return [...pattern].map((g) => (g === '.' ? 'dot' : 'dash')).join(' ')
}

export function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** N-1 wrong options + the right one, shuffled, for the audio challenge. */
export function pickOptions(
  correct: string,
  pool: string[],
  count = 4,
): string[] {
  const wrong = shuffle(pool.filter((l) => l !== correct)).slice(0, count - 1)
  return shuffle([correct, ...wrong])
}
