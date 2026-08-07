import { Lock, Trophy } from 'lucide-react'

export interface AchievementCardProps {
  title: string
  description: string
  unlocked: boolean
  className?: string
}

/* Figma Achievement Card (1:280): 88px tall, radius 16, 48px icon well.
   Unlocked = gold trophy on gold tint; locked = lock on glass. */
export function AchievementCard({
  title,
  description,
  unlocked,
  className = '',
}: AchievementCardProps) {
  return (
    <div
      className={`flex h-[88px] items-center gap-4 rounded-lg border px-5 py-[18px] ${
        unlocked
          ? 'border-border-strong bg-surface-elevated'
          : 'border-border-subtle bg-surface-glass'
      } ${className}`}
    >
      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-md ${
          unlocked
            ? 'bg-accent-tint text-accent-pressed'
            : 'bg-surface-hover text-text-muted'
        }`}
      >
        {unlocked ? (
          <Trophy aria-hidden="true" className="size-6" />
        ) : (
          <Lock aria-hidden="true" className="size-6" />
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span
          className={`text-body-md truncate ${unlocked ? 'text-text-primary' : 'text-text-muted'}`}
        >
          {title}
        </span>
        <span className="text-caption truncate text-text-muted">{description}</span>
      </div>
    </div>
  )
}
