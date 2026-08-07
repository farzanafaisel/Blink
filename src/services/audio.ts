/*
  Web Audio engine, dev notes p012 Sound Behaviour.
  Dot = 1 unit (120ms) · dash = 3 units · intra-letter gap = 1 unit ·
  letter gap = 3 units · word gap = 7 units.
  Tone: 600Hz sine, 0.2 gain, 5ms attack/release to avoid clicks.
*/

export const UNIT_MS = 120

let ctx: AudioContext | null = null

function context(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/**
 * Browsers keep the AudioContext suspended until a user gesture.
 * Call from a click/keydown handler before autoplaying anything.
 */
export function unlockAudio(): Promise<void> {
  const ac = context()
  return ac.state === 'running' ? Promise.resolve() : ac.resume()
}

export function isAudioUnlocked(): boolean {
  return ctx !== null && ctx.state === 'running'
}

let sfxEnabled = true
export function setSfxEnabled(enabled: boolean) {
  sfxEnabled = enabled
}

function tone(frequency: number, durationMs: number, gainValue = 0.2, type: OscillatorType = 'sine') {
  if (!sfxEnabled) return
  const ac = context()
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.value = frequency
  const now = ac.currentTime
  const duration = durationMs / 1000
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(gainValue, now + 0.005)
  gain.gain.setValueAtTime(gainValue, now + duration - 0.005)
  gain.gain.linearRampToValueAtTime(0, now + duration)
  osc.connect(gain).connect(ac.destination)
  osc.start(now)
  osc.stop(now + duration)
}

export function playGlyph(glyph: '.' | '-') {
  tone(600, glyph === '.' ? UNIT_MS : UNIT_MS * 3)
}

/* UI sounds: soft tick (press), major-third chime (correct), low thud (wrong). */
export function playTick() {
  tone(880, 30, 0.08)
}

export function playCorrect() {
  tone(523.25, 120, 0.15) // C5
  setTimeout(() => tone(659.25, 180, 0.15), 130) // E5, a major third up
}

export function playWrong() {
  tone(130, 180, 0.18)
}

export interface PlaybackHandle {
  cancel: () => void
  done: Promise<void>
}

/**
 * Plays a pattern, invoking onGlyph(i) as each glyph starts and
 * onGlyph(-1) when finished. Timing is content, not decoration
 * it never changes with reduced motion (a11y p011).
 */
export function playPattern(
  pattern: string,
  onGlyph: (index: number) => void,
): PlaybackHandle {
  let cancelled = false
  const timers: ReturnType<typeof setTimeout>[] = []

  const done = new Promise<void>((resolve) => {
    let at = 0
    ;[...pattern].forEach((glyph, i) => {
      timers.push(
        setTimeout(() => {
          if (cancelled) return
          onGlyph(i)
          playGlyph(glyph as '.' | '-')
        }, at),
      )
      at += (glyph === '.' ? 1 : 3) * UNIT_MS + UNIT_MS
    })
    timers.push(
      setTimeout(() => {
        if (cancelled) return
        onGlyph(-1)
        resolve()
      }, at + UNIT_MS),
    )
  })

  return {
    cancel: () => {
      cancelled = true
      timers.forEach(clearTimeout)
      onGlyph(-1)
    },
    done,
  }
}

/** Total playback duration of a pattern in ms, including trailing letter gap. */
export function patternDurationMs(pattern: string): number {
  let ms = 0
  for (const glyph of pattern) ms += (glyph === '.' ? 1 : 3) * UNIT_MS + UNIT_MS
  return ms + UNIT_MS
}
