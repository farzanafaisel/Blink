import { Link } from 'react-router-dom'
import mark from '@/assets/icons/mark-small.svg'

/* Figma Logo (1:313): 44×8 mark + JetBrains Mono 16 wordmark, 22% tracking. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="MORSE home"
      className={`flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-accent-focus ${className}`}
    >
      <img src={mark} alt="" className="h-2 w-11" />
      <span className="font-mono text-base font-medium tracking-[0.22em] text-text-primary">
        MORSE
      </span>
    </Link>
  )
}
