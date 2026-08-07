import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'

/* Screen 020: 404 with its own morse spelling: ····— ————— ····—. */
export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <span className="text-[100px] leading-none font-semibold text-text-primary">
        404
      </span>
      <span className="font-mono text-[22px] tracking-[0.1em] text-accent-default">
        ····— ————— ····—
      </span>
      <p className="text-body-md mt-3 text-text-secondary">
        This page got lost in transmission.
      </p>
      <div className="mt-8">
        <Button onClick={() => navigate('/')}>Back to base</Button>
      </div>
    </div>
  )
}
