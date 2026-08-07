import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { pressable } from '@/utils/motion'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'coral'

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: ButtonVariant
  fullWidth?: boolean
  children: ReactNode
}

/* Figma Button (1:166): 48px height, 12px radius, Inter Medium 15/16 +0.5%.
   Transition timing lives per-variant: coral runs 180ms ease by request. */
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'duration-150 bg-cta-default text-cta-on hover:bg-cta-hover active:bg-cta-pressed focus-visible:ring-[3px] focus-visible:ring-cta-default/30 focus-visible:border focus-visible:border-cta-focus disabled:bg-state-disabled disabled:opacity-50',
  secondary:
    'duration-150 border border-border-subtle bg-surface-glass text-text-primary hover:border-border-strong hover:bg-surface-hover active:border-border-strong active:bg-surface-glass focus-visible:ring-2 focus-visible:ring-accent-focus disabled:opacity-40',
  ghost:
    'duration-150 bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary active:bg-surface-glass focus-visible:ring-2 focus-visible:ring-accent-focus disabled:opacity-40',
  coral:
    'duration-[180ms] ease-[ease] bg-[#ff5757] text-white hover:bg-[#3f3f3f] active:bg-[#2f2f2f] focus-visible:ring-2 focus-visible:ring-accent-focus disabled:opacity-40',
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      {...pressable}
      className={`text-btn inline-flex h-12 items-center justify-center gap-2 rounded-md px-6 outline-none transition-colors disabled:pointer-events-none ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
