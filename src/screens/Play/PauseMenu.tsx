import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Button } from '@/components/Button'
import { Keycap } from '@/components/Keycap'
import { fadeIn, scaleIn } from '@/utils/motion'

export interface PauseMenuProps {
  open: boolean
  wordNumber: number
  chapterNumber: number
  onResume: () => void
  onSettings: () => void
  onQuit: () => void
}

/* Screen 014: scrim over the frozen game, pause panel, ESC hint. */
export function PauseMenu({
  open,
  wordNumber,
  chapterNumber,
  onResume,
  onSettings,
  onQuit,
}: PauseMenuProps) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-40 flex items-center justify-center bg-scrim p-6"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Paused"
            variants={scaleIn}
            className="shadow-toast flex w-[400px] max-w-full flex-col items-center gap-3 rounded-2xl border border-border-strong bg-surface-overlay px-10 py-10"
          >
            <h2 className="text-h3 text-text-primary">Paused</h2>
            <span className="text-overline text-text-muted">
              Word {wordNumber} · Chapter {chapterNumber}
            </span>
            <div className="mt-6 flex w-full flex-col gap-2.5">
              <Button fullWidth onClick={onResume}>
                Resume
              </Button>
              <Button fullWidth variant="secondary" onClick={onSettings}>
                Settings
              </Button>
              <Button fullWidth variant="ghost" onClick={onQuit}>
                Quit to modes
              </Button>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Keycap>ESC</Keycap>
              <span className="text-caption text-text-muted">to resume</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
