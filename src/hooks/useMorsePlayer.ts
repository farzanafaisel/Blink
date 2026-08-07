import { useCallback, useEffect, useRef, useState } from 'react'
import { playPattern, type PlaybackHandle } from '@/services/audio'

/**
 * Plays a Morse pattern with per-glyph highlight state.
 * `activeIndex` is the glyph currently sounding, -1 when idle.
 */
export function useMorsePlayer() {
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const handleRef = useRef<PlaybackHandle | null>(null)

  const stop = useCallback(() => {
    handleRef.current?.cancel()
    handleRef.current = null
    setIsPlaying(false)
  }, [])

  const play = useCallback(
    async (pattern: string, times = 1) => {
      stop()
      setIsPlaying(true)
      for (let i = 0; i < times; i++) {
        const handle = playPattern(pattern, setActiveIndex)
        handleRef.current = handle
        await handle.done
        if (handleRef.current !== handle) return // cancelled mid-way
      }
      handleRef.current = null
      setIsPlaying(false)
    },
    [stop],
  )

  useEffect(() => stop, [stop])

  return { play, stop, activeIndex, isPlaying }
}
