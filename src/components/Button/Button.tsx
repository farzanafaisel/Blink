import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { pressable } from '@/utils/motion'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: ButtonVariant
  fullWidth?: boolean
  children: ReactNode
}

/* Figma Button (1:166): 48px height, 12px radius, Inter Medium 15/16 +0.5%. */
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-cta-default text-cta-on hover:bg-cta-hover active:bg-cta-pressed focus-visible:ring-[3px] focus-visible:ring-cta-default/30 focus-visible:border focus-visible:border-cta-focus disabled:bg-state-disabled disabled:opacity-50',
  secondary:
    'border border-border-subtle bg-surface-glass text-text-primary hover:border-border-strong hover:bg-surface-hover active:border-border-strong active:bg-surface-glass focus-visible:ring-2 focus-visible:ring-accent-focus disabled:opacity-40',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary active:bg-surface-glass focus-visible:ring-2 focus-visible:ring-accent-focus disabled:opacity-40',
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
      className={`text-btn inline-flex h-12 items-center justify-center gap-2 rounded-md px-6 outline-none transition-colors duration-150 disabled:pointer-events-none ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
