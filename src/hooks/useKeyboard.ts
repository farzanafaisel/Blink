import { useEffect } from 'react'

export type KeyHandlerMap = Record<string, (event: KeyboardEvent) => void>

/**
 * Game keyboard controls, a11y p011 / dev notes p012.
 * Keys map by KeyboardEvent.key (' ' for SPACE, 'f', 'Enter', 'Backspace',
 * 'r', '1'–'4', 'Escape'). Disabled while a dialog is open, except ESC
 * callers pass `enabled: false` when a dialog owns the keyboard.
 */
export function useKeyboard(handlers: KeyHandlerMap, enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      const handler =
        handlers[event.key] ?? handlers[event.key.toLowerCase()]
      if (handler) {
        event.preventDefault()
        handler(event)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handlers, enabled])
}
