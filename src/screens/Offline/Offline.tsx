import { WifiOff } from 'lucide-react'
import { Button } from '@/components/Button'

export interface OfflineProps {
  onDismiss: () => void
}

/* Screen 026: reassurance: everything works offline. */
export function Offline({ onDismiss }: OfflineProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background-primary px-6 text-center">
      <span className="flex size-18 items-center justify-center rounded-xl bg-surface-glass">
        <WifiOff aria-hidden="true" className="size-8 text-text-secondary" />
      </span>
      <h1 className="text-h3 mt-3 text-text-primary">You're offline</h1>
      <p className="text-body-md max-w-[460px] text-text-secondary">
        MORSE works fully offline. Your progress is saved on this device and
        syncs when you reconnect.
      </p>
      <div className="mt-6">
        <Button onClick={onDismiss}>Keep playing</Button>
      </div>
    </div>
  )
}
