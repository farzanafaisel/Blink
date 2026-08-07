import type { Transition, Variants } from 'framer-motion'

/* Motion tokens: Figma page 009 Motion Specification. */

export const duration = {
  fast: 0.15,
  base: 0.2,
  slow: 0.3,
  celebrate: 0.6,
} as const

export const easeStandard: [number, number, number, number] = [0.2, 0, 0, 1]
export const easeDecelerate: [number, number, number, number] = [0, 0, 0, 1]

export const spring: Transition = {
  type: 'spring',
  mass: 1,
  stiffness: 80,
  damping: 12,
}

/* Fade in: screen and card entrances. 200ms decelerate. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.base, ease: easeDecelerate },
  },
  exit: { opacity: 0, transition: { duration: duration.base, ease: easeDecelerate } },
}

/* Scale in: letter reveal, dialog opening. 300ms spring, 0.92 → 1. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { ...spring, duration: duration.slow } },
  exit: {
    opacity: 0,
    scale: 0.92,
    transition: { duration: duration.fast, ease: easeStandard },
  },
}

/* Slide up: toasts entering, teaching → recall transition. 300ms standard. */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: easeStandard },
  },
  exit: {
    opacity: 0,
    y: 16,
    transition: { duration: duration.base, ease: easeStandard },
  },
}

/* Alias: slide up is the standard entrance for stacked content. */
export const fadeInUp = slideUp

/* Success pop: correct answer. 600ms spring, 1 → 1.06 → 1. */
export const successPop: Variants = {
  hidden: { scale: 1 },
  visible: {
    scale: [1, 1.06, 1],
    transition: { ...spring, duration: duration.celebrate },
  },
}

/* Error shake: incorrect answer. 300ms standard, x ±6px, 3 cycles. */
export const errorShake: Variants = {
  hidden: { x: 0 },
  visible: {
    x: [0, -6, 6, -6, 6, -6, 0],
    transition: { duration: duration.slow, ease: easeStandard },
  },
}

/* Streak flame: daily streak tick. 400ms spring, 200ms delay, rotate ±4°. */
export const streakFlame: Variants = {
  hidden: { scale: 1, rotate: 0 },
  visible: {
    scale: [1, 1.15, 1],
    rotate: [0, -4, 4, 0],
    transition: { ...spring, duration: 0.4, delay: 0.2 },
  },
}

/* Progress fill: 300ms standard, 100ms delay. Use as a transition. */
export const progressFill: Transition = {
  duration: duration.slow,
  ease: easeStandard,
  delay: 0.1,
}

export const staggerChildren = (stagger = 0.06, delay = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
})

/* Button press: tactile feedback. 150ms standard, scale 1 → 0.97 → 1. */
export const pressable = {
  whileTap: { scale: 0.97 },
  transition: { duration: duration.fast, ease: easeStandard },
} as const
