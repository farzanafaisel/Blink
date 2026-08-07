import { AnimatePresence, motion } from 'framer-motion'
import { Check, Info, X } from 'lucide-react'
import { slideUp } from '@/utils/motion'
import { useToastStore, type ToastType } from './toastStore'

const wellClasses: Record<ToastType, string> = {
  success: 'bg-[#d0ebe2] text-feedback-success',
  error: 'bg-[#e4e0e9] text-feedback-error',
  info: 'bg-surface-hover text-feedback-info',
}

const icons: Record<ToastType, typeof Check> = {
  success: Check,
  error: X,
  info: Info,
}

/* Figma Toast (1:260): white, border-strong, radius 12, 28px icon well. */
export function ToastViewport() {
  const toast = useToastStore((s) => s.toast)

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center"
    >
      <AnimatePresence>
        {toast && (
          <ToastCard key={toast.id} message={toast.message} type={toast.type} />
        )}
      </AnimatePresence>
    </div>
  )
}

function ToastCard({ message, type }: { message: string; type: ToastType }) {
  const Icon = icons[type]
  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="shadow-toast flex items-center gap-3 rounded-md border border-border-strong bg-surface-overlay py-3 pr-5 pl-4"
    >
      <span
        className={`flex size-7 items-center justify-center rounded-sm ${wellClasses[type]}`}
      >
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className="text-body-sm text-text-primary">{message}</span>
    </motion.div>
  )
}
