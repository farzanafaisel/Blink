import { motion } from 'framer-motion'
import { fadeIn, staggerChildren, scaleIn } from '@/utils/motion'

/* Screen 001: dot–dash–dot mark, mono wordmark, overline pinned low. */
export function Splash() {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background-primary"
      aria-label="Morse is starting"
    >
      <motion.div
        variants={staggerChildren(0.12)}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-10"
      >
        <motion.div variants={scaleIn} className="flex items-center gap-3">
          <span className="size-5 rounded-full bg-accent-default" />
          <span className="h-5 w-14 rounded-full bg-accent-default" />
          <span className="size-5 rounded-full bg-accent-default" />
        </motion.div>
        <motion.span
          variants={fadeIn}
          className="font-mono text-[28px] font-medium tracking-[0.35em] text-text-primary"
        >
          MORSE
        </motion.span>
      </motion.div>
      <motion.span
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
        className="text-overline absolute bottom-[10%] text-text-secondary"
      >
        Learn Morse code through play
      </motion.span>
    </motion.div>
  )
}
