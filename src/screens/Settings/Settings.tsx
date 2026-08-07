import { useState } from 'react'
import { Moon } from 'lucide-react'
import { Button } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import { Keycap } from '@/components/Keycap'
import { Toggle } from '@/components/Toggle'
import { toast } from '@/components/Toast'
import { useMorseStore, type Settings as SettingsShape } from '@/app/store'

interface RowDef {
  key: keyof SettingsShape
  title: string
  description: string
}

const sections: { heading: string; rows: RowDef[] }[] = [
  {
    heading: 'Audio',
    rows: [
      {
        key: 'music',
        title: 'Music',
        description: 'Ambient soundtrack while you play',
      },
      {
        key: 'soundEffects',
        title: 'Sound effects',
        description: 'Tones for dots, dashes and results',
      },
    ],
  },
  {
    heading: 'Experience',
    rows: [
      {
        key: 'animations',
        title: 'Animations',
        description: 'Motion, glows and particles',
      },
      {
        key: 'reducedMotion',
        title: 'Reduced motion',
        description: 'Respect system accessibility setting',
      },
    ],
  },
  {
    heading: 'Accessibility',
    rows: [
      {
        key: 'highContrast',
        title: 'High contrast',
        description: 'Boost contrast of patterns and text',
      },
      {
        key: 'largerPatterns',
        title: 'Larger patterns',
        description: 'Bigger dots and dashes during teaching',
      },
    ],
  },
]

const shortcuts: [string, string][] = [
  ['Dot', 'SPACE'],
  ['Dash', 'F'],
  ['Replay pattern', 'R'],
  ['Pause', 'ESC'],
]

/* Screen 019: settings rows left, theme + keyboard reference right. */
export function Settings() {
  const settings = useMorseStore((s) => s.settings)
  const setSetting = useMorseStore((s) => s.setSetting)
  const resetProgress = useMorseStore((s) => s.resetProgress)
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div className="flex flex-1 flex-col gap-10 py-14">
      <h1 className="text-h3 text-text-primary">Settings</h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,640px)_360px]">
        <div className="flex flex-col gap-3">
          {sections.map(({ heading, rows }) => (
            <section key={heading} className="mb-3 flex flex-col gap-3">
              <h2 className="text-overline text-text-muted">{heading}</h2>
              {rows.map(({ key, title, description }) => (
                <div
                  key={key}
                  className="flex items-center rounded-md border border-border-subtle bg-surface-glass px-6 py-4"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-body-md text-text-primary">{title}</span>
                    <span className="text-body-sm text-text-muted">
                      {description}
                    </span>
                  </div>
                  <Toggle
                    checked={settings[key] as boolean}
                    onChange={(value) => setSetting(key, value)}
                    aria-label={title}
                  />
                </div>
              ))}
            </section>
          ))}

          <div className="mt-2">
            <Button variant="ghost" onClick={() => setConfirmReset(true)}>
              Reset progress
            </Button>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="flex items-center gap-4 rounded-lg border border-border-subtle bg-surface-glass px-6 py-5">
            <Moon aria-hidden="true" className="size-5 text-text-secondary" />
            <div className="flex flex-col gap-0.5">
              <span className="text-body-md text-text-primary">Theme</span>
              <span className="text-caption text-text-muted">
                Daylight: warm paper, ink and signal gold
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3.5 rounded-lg border border-border-subtle bg-surface-glass p-6">
            <h2 className="text-overline text-text-muted">Keyboard</h2>
            {shortcuts.map(([action, key]) => (
              <div key={action} className="flex items-center justify-between">
                <span className="text-body-sm text-text-secondary">{action}</span>
                <Keycap>{key}</Keycap>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset progress?"
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                resetProgress()
                setConfirmReset(false)
                toast('Progress reset. A clean signal.', 'info')
              }}
            >
              Reset
            </Button>
          </>
        }
      >
        <p className="text-body-sm text-text-secondary">
          This clears every mastered letter and statistic. This action cannot be
          undone.
        </p>
      </Dialog>
    </div>
  )
}
