import { motion } from 'framer-motion'
import { pressable } from '@/utils/motion'

export interface MorseKeyProps {
  type: 'dot' | 'dash'
  onPress: () => void
  /** Mirrors keyboard input (SPACE/F) so the key lights up without a pointer. */
  pressed?: boolean
  disabled?: boolean
  className?: string
}

/* Figma Morse Key (1:197): 160×112, radius 16. Pressed = gold tint + indigo. */
export function MorseKey({
  type,
  onPress,
  pressed = false,
  disabled,
  className = '',
}: MorseKeyProps) {
  return (
    <motion.button
      type="button"
      aria-label={type === 'dot' ? 'Dot' : 'Dash'}
      disabled={disabled}
      onPointerDown={(event) => {
        event.preventDefault()
        onPress()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onPress()
      }}
      {...pressable}
      className={`flex h-28 w-40 items-center justify-center rounded-lg outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent-focus disabled:pointer-events-none disabled:opacity-50 ${
        pressed
          ? 'border-[1.5px] border-accent-default bg-accent-tint text-accent-default'
          : 'border border-border-subtle bg-surface-elevated text-text-primary hover:border-border-strong hover:bg-surface-hover active:border-[1.5px] active:border-accent-default active:bg-accent-tint active:text-accent-default'
      } ${className}`}
    >
      {type === 'dot' ? (
        <span className="size-[22px] rounded-full bg-current" />
      ) : (
        <span className="h-3 w-14 rounded-[6px] bg-current" />
      )}
    </motion.button>
  )
}
