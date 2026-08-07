import { motion } from 'framer-motion'
import { progressFill } from '@/utils/motion'

export interface ProgressBarProps {
  /** Current progress, from 0 to max. */
  value: number
  max?: number
  label?: string
  /** Green by default; level progress uses the indigo accent fill. */
  fill?: 'green' | 'indigo'
  className?: string
}

/* Figma Progress Bar (1:228): 6px tall, 3px radius, green fill on track. */
export function ProgressBar({
  value,
  max = 100,
  label,
  fill = 'green',
  className = '',
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label ?? 'Progress'}
      className={`h-1.5 overflow-hidden rounded-[3px] bg-progress-track ${className}`}
    >
      <motion.div
        className={`h-full rounded-[3px] ${fill === 'indigo' ? 'bg-accent-default' : 'bg-progress-fill'}`}
        initial={false}
        animate={{ width: `${percent}%` }}
        transition={progressFill}
      />
    </div>
  )
}
