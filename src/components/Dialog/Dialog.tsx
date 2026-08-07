import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { fadeIn, scaleIn } from '@/utils/motion'

export interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children?: ReactNode
  actions: ReactNode
}

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

/*
  Figma Dialog (1:293): white, radius 24, border-strong, overlay shadow.
  Renders in a portal above a Scrim; focus is trapped and ESC returns
  focus to the trigger (a11y page 011).
*/
export function Dialog({ open, onClose, title, children, actions }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panel) return
      const focusable = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      restoreRef.current?.focus()
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-40 flex items-center justify-center bg-scrim p-6"
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            variants={scaleIn}
            className="shadow-toast flex w-[440px] max-w-full flex-col gap-6 rounded-2xl border border-border-strong bg-surface-overlay p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-h4 text-text-primary">{title}</h2>
            {children}
            <div className="flex justify-end gap-3">{actions}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
