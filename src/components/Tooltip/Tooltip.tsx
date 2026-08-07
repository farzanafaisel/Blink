import type { ReactNode } from 'react'

export interface TooltipProps {
  text: string
  children: ReactNode
}

/* Figma Tooltip (1:273). CSS-only reveal on hover/focus. */
export function Tooltip({ text, children }: TooltipProps) {
  return (
    <span className="group/tooltip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-sm border border-border-subtle bg-surface-overlay px-3 py-1.5 text-xs whitespace-nowrap text-text-primary opacity-0 transition-opacity duration-150 group-focus-within/tooltip:opacity-100 group-hover/tooltip:opacity-100"
      >
        {text}
      </span>
    </span>
  )
}
