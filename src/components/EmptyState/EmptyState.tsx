import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

/* Screen 027: glass card, violet icon well, 24px title, CTA. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center py-14">
      <div className="flex w-full max-w-[480px] flex-col items-center gap-1 rounded-2xl border border-border-subtle bg-surface-glass px-10 py-14 text-center">
        <div className="mb-4 flex size-18 items-center justify-center rounded-xl bg-[#e7e3f6]">
          <Icon aria-hidden="true" className="size-8 text-particle-violet" />
        </div>
        <h2 className="text-2xl leading-8 font-semibold text-text-primary">
          {title}
        </h2>
        <p className="text-body-sm mt-2 max-w-[300px] text-text-secondary">
          {description}
        </p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  )
}
