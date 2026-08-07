import type { HTMLAttributes, ReactNode } from 'react'

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'error'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  children: ReactNode
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-surface-hover text-text-secondary',
  accent: 'bg-accent-tint text-accent-default',
  success: 'bg-[#d3ece6] text-feedback-success',
  warning: 'bg-[#faeadd] text-feedback-warning',
  error: 'bg-[#fae0e5] text-feedback-error',
}

export function Badge({
  tone = 'accent',
  className = '',
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs leading-4 tracking-[0.005em] ${toneClasses[tone]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  )
}
