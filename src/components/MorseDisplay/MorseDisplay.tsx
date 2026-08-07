import { motion } from 'framer-motion'

export interface MorseDisplayProps {
  /** Pattern string of '.' and '-' glyphs, e.g. ".-" for A. */
  pattern: string
  /** Dot diameter in px. Dash = 2.8×unit wide, gap = 0.7×unit. */
  unit?: number
  /** Index of the glyph currently sounding, or -1 when idle. */
  activeIndex?: number
  className?: string
}

/*
  Dots and dashes as shapes, matching the Figma Morse glyph frames.
  During playback the active glyph pulses (opacity, per motion spec p009);
  upcoming glyphs sit dimmed.
*/
export function MorseDisplay({
  pattern,
  unit = 20,
  activeIndex = -1,
  className = '',
}: MorseDisplayProps) {
  const playing = activeIndex >= 0
  return (
    <div
      className={`flex items-center ${className}`}
      style={{ gap: Math.round(unit * 0.7) }}
      aria-hidden="true"
    >
      {[...pattern].map((glyph, i) => {
        const dimmed = playing && i > activeIndex
        const active = playing && i === activeIndex
        return (
          <motion.span
            key={i}
            className="shrink-0 bg-current"
            style={{
              width: glyph === '.' ? unit : Math.round(unit * 2.8),
              height: unit,
              borderRadius: unit / 2,
            }}
            initial={false}
            animate={
              active
                ? { opacity: [0.3, 1] }
                : { opacity: dimmed ? 0.3 : 1 }
            }
            transition={{ duration: 0.12, ease: 'linear' }}
          />
        )
      })}
    </div>
  )
}
