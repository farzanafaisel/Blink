import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Flame, Zap } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { IconButton } from '@/components/Button'
import { ProgressBar } from '@/components/ProgressBar'
import { masteredLetters, useMorseStore } from '@/app/store'
import { LETTERS } from '@/game/morse'

export interface HudProps {
  badge?: string
  progress?: { value: number; max: number; caption: string }
  /** When set, shows the KEY chip (screen 004) and toggles the panel. */
  onKeyToggle?: () => void
  streak?: number
  score?: number
}

/*
  Figma HUD (1:329, v2 usage on 004): back + chapter badge left,
  progress + caption centre, KEY chip + streak + score right.
  Without props it falls back to store-level defaults (Timed/Audio).
*/
export function Hud({ badge, progress, onKeyToggle, streak, score }: HudProps) {
  const navigate = useNavigate()
  const chapterIndex = useMorseStore((s) => s.chapterIndex)
  const dailyStreak = useMorseStore((s) => s.dailyStreak)
  const totalScore = useMorseStore((s) => s.totalScore)
  const letterHistory = useMorseStore((s) => s.letterHistory)

  const shownBadge = badge ?? `CHAPTER ${chapterIndex + 1}`
  const shownProgress = progress ?? {
    value: masteredLetters(letterHistory).length,
    max: LETTERS.length,
    caption: `${masteredLetters(letterHistory).length} / ${LETTERS.length}`,
  }
  const shownStreak = streak ?? dailyStreak
  const shownScore = score ?? totalScore

  return (
    <header className="flex h-18 items-center justify-between px-6 md:px-12">
      <div className="flex items-center gap-4">
        <IconButton aria-label="Back" onClick={() => navigate('/play')}>
          <ArrowLeft aria-hidden="true" className="size-5" />
        </IconButton>
        <Badge tone="accent" className="text-overline max-md:hidden">
          {shownBadge}
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <ProgressBar
          value={shownProgress.value}
          max={shownProgress.max}
          label={shownProgress.caption}
          className="w-40 md:w-64"
        />
        <span className="text-caption whitespace-nowrap text-text-muted max-md:hidden">
          {shownProgress.caption}
        </span>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {onKeyToggle && (
          <button
            type="button"
            onClick={onKeyToggle}
            className="flex items-center gap-1.5 rounded-sm border border-border-subtle bg-surface-glass px-2.5 py-1 outline-none transition-colors duration-150 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent-focus"
            aria-label="Toggle Morse Key (K)"
          >
            <BookOpen aria-hidden="true" className="size-3.5 text-text-secondary" />
            <span className="font-mono text-[11px] font-medium tracking-wide text-text-secondary">
              KEY
            </span>
          </button>
        )}
        <span className="flex items-center gap-1.5" aria-label={`Streak ${shownStreak}`}>
          <Flame
            aria-hidden="true"
            className="size-[18px] fill-accent-pressed text-accent-pressed"
          />
          <span className="font-mono text-[15px] font-medium text-text-primary">
            {shownStreak}
          </span>
        </span>
        <span
          className="flex items-center gap-1.5 max-md:hidden"
          aria-label={`Score ${shownScore}`}
        >
          <Zap aria-hidden="true" className="size-[18px] text-text-secondary" />
          <span className="font-mono text-[15px] font-medium text-text-primary">
            {shownScore.toLocaleString()}
          </span>
        </span>
      </div>
    </header>
  )
}
