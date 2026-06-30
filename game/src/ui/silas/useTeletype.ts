/**
 * useTeletype — character-by-character reveal hook for Silas voice.
 *
 * Returns { text, done, skip } where:
 *   text — the currently revealed substring
 *   done — true when full text is revealed
 *   skip — function to jump instantly to end
 *
 * prefers-reduced-motion: if the media query matches, reveals full text
 * immediately (no animation). PLAN.md §9 animation discipline.
 */
import { useState, useEffect, useCallback, useRef } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function useTeletype(
  fullText: string,
  speedMs = 18,
): { text: string; done: boolean; skip: () => void } {
  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia(REDUCED_MOTION_QUERY).matches
      : false

  const [revealed, setRevealed] = useState(prefersReduced ? fullText.length : 0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Reset when fullText changes
  useEffect(() => {
    if (prefersReduced) {
      setRevealed(fullText.length)
      return
    }

    setRevealed(0)

    intervalRef.current = setInterval(() => {
      setRevealed((prev) => {
        const next = prev + 1
        if (next >= fullText.length) {
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
        }
        return next
      })
    }, speedMs)

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [fullText, speedMs, prefersReduced])

  const skip = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setRevealed(fullText.length)
  }, [fullText.length])

  const text = fullText.slice(0, revealed)
  const done = revealed >= fullText.length

  return { text, done, skip }
}
