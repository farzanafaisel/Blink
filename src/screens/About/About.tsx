import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/Button'
import { MorseDisplay } from '@/components/MorseDisplay'

const facts: [string, string][] = [
  ['1836', 'First demonstrated'],
  ['1912', 'Titanic distress calls'],
  ['Today', 'Aviation & amateur radio'],
]

/* Screen 023: story column left, SOS card right, back CTA. */
export function About() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-1 flex-col gap-16 py-16">
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,560px)_minmax(0,480px)] lg:justify-between">
        <div className="flex flex-col gap-5">
          <span className="text-overline text-accent-text">About</span>
          <h1 className="text-h3 text-text-primary">
            The oldest digital language
          </h1>
          <p className="text-body-md text-text-secondary">
            Invented in the 1830s by Samuel Morse and Alfred Vail, Morse code
            turned electricity into language, long before phones, radios or the
            internet.
          </p>
          <p className="text-body-md text-text-secondary">
            Every letter is a rhythm of short and long signals. Skilled
            operators read it like music, by feel rather than counting. That is
            exactly how MORSE teaches you: pattern first, theory later.
          </p>
          <p className="text-body-md text-text-secondary">
            It still saves lives today. SOS remains the most recognised distress
            signal in the world.
          </p>
        </div>

        <div className="flex h-fit flex-col rounded-xl border border-border-subtle bg-surface-elevated px-9 py-9">
          <span className="text-overline mb-6 self-center text-accent-pressed">
            The most famous signal
          </span>
          <MorseDisplay
            pattern="...---..."
            unit={7}
            className="self-center text-accent-text"
          />
          <span className="mt-4 mb-6 self-center font-mono text-lg tracking-[0.3em] text-accent-text">
            S O S
          </span>
          <hr className="mb-5 border-border-subtle" />
          <dl className="flex flex-col gap-5">
            {facts.map(([year, fact]) => (
              <div key={year} className="flex items-baseline justify-between">
                <dt className="font-mono text-sm font-medium text-accent-text">
                  {year}
                </dt>
                <dd className="text-body-sm text-text-secondary">{fact}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div>
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to menu
        </Button>
      </div>
    </div>
  )
}
