import { useEffect } from 'react'
import { useMorseStore } from '@/app/store'

/** Accumulates time-played (for the Statistics screen) while mounted. */
export function usePlayTime() {
  const addPlayTime = useMorseStore((s) => s.addPlayTime)

  useEffect(() => {
    const start = performance.now()
    return () => {
      const seconds = Math.round((performance.now() - start) / 1000)
      if (seconds > 0) addPlayTime(seconds)
    }
  }, [addPlayTime])
}
