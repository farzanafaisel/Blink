import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { pressable } from '@/utils/motion'

export interface IconButtonProps extends HTMLMotionProps<'button'> {
  'aria-label': string
  children: ReactNode
}

/* Figma Icon Button (1:299): 40px visual inside a 44px hit area, 10px radius. */
export function IconButton({ className = '', children, ...rest }: IconButtonProps) {
  return (
    <motion.button
      {...pressable}
      className={`relative inline-flex size-10 items-center justify-center rounded-[10px] text-text-primary outline-none transition-colors duration-150 before:absolute before:-inset-0.5 before:content-[''] hover:bg-surface-hover active:bg-surface-glass focus-visible:ring-2 focus-visible:ring-accent-focus disabled:pointer-events-none disabled:opacity-40 ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
