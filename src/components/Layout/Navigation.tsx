import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { Button, IconButton } from '@/components/Button'
import { Logo } from './Logo'

const links = [
  { label: 'Play', to: '/play' },
  { label: 'Morse Key', to: '/key' },
  { label: 'Statistics', to: '/statistics' },
  { label: 'Achievements', to: '/achievements' },
  { label: 'About', to: '/about' },
]

/*
  Figma Navigation (1:319): 80px, 48px side padding. Logo left, links
  centre, settings + Play right. Mobile 390 collapses to centred logo
  with Play (responsive notes p010).
*/
export function Navigation() {
  const navigate = useNavigate()
  /* The Landing hero already carries the primary Play CTA. */
  const onLanding = useLocation().pathname === '/'

  return (
    <header className="flex h-20 items-center justify-between px-6 max-md:justify-center md:px-12">
      <Logo />
      <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
        {links.map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `text-body-sm outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent-focus ${
                isActive
                  ? 'text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="hidden items-center gap-3 md:flex">
        <IconButton
          aria-label="Settings"
          onClick={() => navigate('/settings')}
        >
          <Settings aria-hidden="true" className="size-5" />
        </IconButton>
        {!onLanding && (
          <Button onClick={() => navigate('/play/word')}>Play</Button>
        )}
      </div>
    </header>
  )
}

export function NavigationLink({ to, children }: { to: string; children: string }) {
  return (
    <Link to={to} className="text-body-sm text-text-secondary hover:text-text-primary">
      {children}
    </Link>
  )
}
