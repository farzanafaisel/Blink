import { motion, useReducedMotion } from 'framer-motion'
import { useMemo } from 'react'

const CANDY = ['#8f7fd8', '#64c1a4', '#e88bb0', '#f7da6e']

/*
  Dev notes p012: 12–24 particles, candy palette, 600ms, gravity ease-in.
  Disabled entirely under reduced motion (a11y p011).
*/
export function Confetti({ count = 18 }: { count?: number }) {
  const reduced = useReducedMotion()
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: 15 + ((i * 37) % 70),
        top: 10 + ((i * 23) % 45),
        size: 4 + ((i * 13) % 5),
        color: CANDY[i % CANDY.length],
        dx: ((i * 17) % 40) - 20,
        delay: (i % 6) * 0.03,
      })),
    [count],
  )

  if (reduced) return null

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ opacity: 0, y: 0, x: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [0, -30 - p.size * 4, 60],
            x: [0, p.dx, p.dx * 1.4],
            scale: [0.5, 1, 0.9],
          }}
          transition={{ duration: 0.6, delay: p.delay, ease: [0.4, 0, 1, 1] }}
        />
      ))}
    </div>
  )
}
