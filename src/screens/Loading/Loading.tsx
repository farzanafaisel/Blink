import { motion } from 'framer-motion'

/* Screen 025: three pulsing dots, hint, slim indeterminate track. */
export function Loading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <div className="flex gap-3.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-3.5 rounded-full bg-accent-default"
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
      <p className="text-body-sm mt-4 text-text-secondary" role="status">
        Tuning frequencies…
      </p>
      <div className="mt-6 h-1 w-60 overflow-hidden rounded-full bg-progress-track">
        <motion.div
          className="h-full w-1/3 rounded-full bg-accent-default"
          animate={{ x: ['-100%', '300%'] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  )
}
