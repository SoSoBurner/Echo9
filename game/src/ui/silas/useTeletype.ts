/**
 * useTeletype — character-by-character reveal hook for Silas voice.
 *
 * Returns { text, done, skip } where:
 *   text — the currently revealed substring
 *   done — true when full text is revealed
 *   skip — function to jump instantly to end
 *
 * Reduced motion: if `useReducedMotion()` is true (OS-level
 * `prefers-reduced-motion: reduce` OR in-game comfort setting is "reduced" |
 * "none"), reveals full text immediately (no interval). PLAN.md §9 animation
 * discipline. Pre-D1 this hook only checked the OS media query and ignored
 * the in-game comfort setting; now both feed the same gate.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useReducedMotion } from '@systems/comfort/reducedMotion'

export function useTeletype(
  fullText: string,
  speedMs = 18,
): { text: string; done: boolean; skip: () => void } {
  const prefersReduced = useReducedMotion()

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
