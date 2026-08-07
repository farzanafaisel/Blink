import type { HTMLAttributes, ReactNode } from 'react'

type CardVariant = 'elevated' | 'glass'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  children: ReactNode
}

const variantClasses: Record<CardVariant, string> = {
  elevated: 'border-border-subtle bg-surface-elevated',
  glass: 'border-border-subtle bg-surface-glass',
}

export function Card({
  variant = 'elevated',
  className = '',
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={`rounded-lg border ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
