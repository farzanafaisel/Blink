export interface KeycapProps {
  children: string
  className?: string
}

export function Keycap({ children, className = '' }: KeycapProps) {
  return (
    <kbd
      className={`inline-flex items-center justify-center rounded-[6px] border border-border-subtle bg-surface-glass px-2 py-1 font-mono text-xs font-medium text-text-secondary ${className}`}
    >
      {children}
    </kbd>
  )
}
