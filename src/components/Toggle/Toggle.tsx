import { motion } from 'framer-motion'
import { duration, easeStandard } from '@/utils/motion'

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  'aria-label': string
  disabled?: boolean
}

/* Figma Toggle (1:210): 44×24 track, 18px knob. */
export function Toggle({ checked, onChange, disabled, ...rest }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={rest['aria-label']}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-accent-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary disabled:pointer-events-none disabled:opacity-50 ${checked ? 'bg-cta-default' : 'bg-surface-hover'}`}
    >
      <motion.span
        className="absolute top-[3px] left-[3px] block size-[18px] rounded-full bg-white shadow-[0_1px_2px_rgb(28_73_102/0.2)]"
        initial={false}
        animate={{ x: checked ? 20 : 0 }}
        transition={{ duration: duration.base, ease: easeStandard }}
      />
    </button>
  )
}
