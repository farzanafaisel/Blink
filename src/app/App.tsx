import { useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useMorseStore } from './store'
import { Splash } from '@/screens/Splash'
import { Offline } from '@/screens/Offline'

/* Screen 001: splash auto-advances to Landing after 1.2s. */
const SPLASH_MS = 1200

export function App() {
  const reducedMotion = useMorseStore((s) => s.settings.reducedMotion)
  const highContrast = useMorseStore((s) => s.settings.highContrast)
  const [booting, setBooting] = useState(true)
  const [showOffline, setShowOffline] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), SPLASH_MS)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast)
  }, [highContrast])

  useEffect(() => {
    const onOffline = () => setShowOffline(true)
    const onOnline = () => setShowOffline(false)
    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)
    return () => {
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
    }
  }, [])

  return (
    <MotionConfig reducedMotion={reducedMotion ? 'always' : 'user'}>
      <RouterProvider router={router} />
      <AnimatePresence>{booting && <Splash />}</AnimatePresence>
      {showOffline && <Offline onDismiss={() => setShowOffline(false)} />}
    </MotionConfig>
  )
}
