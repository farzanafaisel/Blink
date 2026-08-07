import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

interface ToastState {
  toast: { id: number; message: string; type: ToastType } | null
  show: (message: string, type?: ToastType) => void
  dismiss: () => void
}

let nextId = 1
let timer: ReturnType<typeof setTimeout> | undefined

/* Dev notes p012: toasts auto-dismiss after 3s; only one visible at a time. */
export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  show: (message, type = 'info') => {
    clearTimeout(timer)
    set({ toast: { id: nextId++, message, type } })
    timer = setTimeout(() => set({ toast: null }), 3000)
  },
  dismiss: () => {
    clearTimeout(timer)
    set({ toast: null })
  },
}))

export const toast = (message: string, type?: ToastType) =>
  useToastStore.getState().show(message, type)
