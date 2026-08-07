import { motion } from 'framer-motion'

const BAR_HEIGHTS = [
  10, 18, 30, 46, 34, 52, 40, 24, 44, 56, 38, 20, 32, 48, 26, 40, 54, 30, 16,
  36, 24, 12, 20, 10,
]

export interface WaveformProps {
  /** Playback progress 0–1; bars up to that point render in indigo. */
  progress?: number
  playing?: boolean
  className?: string
}

/* Figma Waveform (1:343): 24 bars, 4px wide, radius 2, 5px gap. */
export function Waveform({
  progress = 0.42,
  playing = false,
  className = '',
}: WaveformProps) {
  return (
    <div
      className={`flex h-14 items-center gap-[5px] ${className}`}
      aria-hidden="true"
    >
      {BAR_HEIGHTS.map((height, i) => {
        const active = i / BAR_HEIGHTS.length < progress
        return (
          <motion.span
            key={i}
            className={`w-1 shrink-0 rounded-[2px] ${active ? 'bg-accent-default' : 'bg-progress-track'}`}
            style={{ height }}
            initial={false}
            animate={
              playing && active
                ? { scaleY: [1, 1.35, 0.8, 1], transition: { duration: 0.9, repeat: Infinity, delay: i * 0.04 } }
                : { scaleY: 1 }
            }
          />
        )
      })}
    </div>
  )
}
