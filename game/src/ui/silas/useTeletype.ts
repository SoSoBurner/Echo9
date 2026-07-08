/**
 * useTeletype — character-by-character reveal hook for Silas voice.
 *
 * Returns { text, done, skip } where:
 *   text — the currently revealed substring
 *   done — true when full text is revealed
 *   skip — function to jump instantly to end
 *
 * Two independent gates skip the reveal and jump straight to full text:
 *   - `useReducedMotion()` — OS-level `prefers-reduced-motion: reduce` OR
 *     in-game motion setting is "reduced" | "none" (D1).
 *   - Narration-pace multiplier of 0 — in-game pace setting is "instant" (D4).
 *
 * For non-zero pace multipliers, the base `speedMs` is scaled: 1.0 for
 * polite-queue (baseline, no change), 2.0 for on-demand (slower reveal).
 * The multiplier composes cleanly with `speedMs`: call sites still pick their
 * own base cadence (18ms for the default, 22ms for SilasPromptPanel), and the
 * pace setting scales all of them uniformly.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useReducedMotion } from '@systems/comfort/reducedMotion'
import { useNarrationPaceMultiplier } from '@systems/comfort/narrationPace'

export function useTeletype(
  fullText: string,
  speedMs = 18,
): { text: string; done: boolean; skip: () => void } {
  const prefersReduced = useReducedMotion()
  const paceMultiplier = useNarrationPaceMultiplier()
  // D1 gate OR D4 'instant' — both jump to full text without an interval.
  const bailInstantly = prefersReduced || paceMultiplier === 0
  const effectiveSpeedMs = speedMs * paceMultiplier

  const [revealed, setRevealed] = useState(bailInstantly ? fullText.length : 0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Reset when fullText changes
  useEffect(() => {
    if (bailInstantly) {
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
    }, effectiveSpeedMs)

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [fullText, effectiveSpeedMs, bailInstantly])

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
