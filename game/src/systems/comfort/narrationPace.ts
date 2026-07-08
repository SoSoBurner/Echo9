/**
 * narrationPace — runtime bridge from the persisted comfort setting to
 * teletype pacing (Track D, Sprint D4).
 *
 * Pre-D4 the comfort panel wrote `narrationPace` to
 * `localStorage['echo9:comfort']` and `useTeletype` ignored it entirely — the
 * only speed knob was the `speedMs` prop, hard-coded per call site (18ms in
 * the general case, 22ms in SilasPromptPanel). A player who picked "Instant"
 * still got the full 22ms/character reveal; a player who picked "On demand"
 * still got the same fast pace.
 *
 * Difference from D1/D2/D3: no DOM apply function. Narration pace is a
 * JS-time value only — no CSS consumes it, so there is nothing to stamp on
 * `<html>`. `useTeletype` reads the multiplier via `useNarrationPaceMultiplier()`
 * and does the math inline. This also means no boot-time bootstrap is
 * required — the first `useTeletype` mount is what triggers the first read.
 *
 * Multipliers (locked here — both `useTeletype` and the tests import them):
 *   instant       = 0    — bail to full-text immediately (like reduced motion)
 *   polite-queue  = 1.0  — baseline: no change from pre-D4 behaviour
 *   on-demand     = 2.0  — deliberately slower for readers who need more time
 *
 * The 0 for 'instant' is intentional: `useTeletype` interprets a 0-multiplier
 * exactly the same as `useReducedMotion() === true` — the reveal skips
 * straight to full text, no interval. Composes cleanly with D1: if EITHER
 * pace is 'instant' OR motion is reduced/none, teletype bails.
 */
import {
  ComfortSettingsSchema,
  COMFORT_DEFAULTS,
  COMFORT_STORAGE_KEY,
  type NarrationPace,
} from '@schemas/comfortSettings.schema'
import { useEffect, useState } from 'react'
import { COMFORT_CHANGED_EVENT } from '@systems/comfort/reducedMotion'

/**
 * Reveal-speed multipliers per NarrationPace choice. 0 means "skip the
 * interval and reveal instantly" (matching the reduced-motion contract).
 */
export const NARRATION_PACE_MULTIPLIERS: Readonly<Record<NarrationPace, number>> = {
  instant: 0,
  'polite-queue': 1.0,
  'on-demand': 2.0,
}

/**
 * Read the persisted `narrationPace` value from localStorage, falling back
 * to the default when storage is empty, malformed, or blocked. Never throws.
 */
export function readComfortNarrationPace(): NarrationPace {
  try {
    const raw = localStorage.getItem(COMFORT_STORAGE_KEY)
    if (raw === null) return COMFORT_DEFAULTS.narrationPace
    const parsed = ComfortSettingsSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return COMFORT_DEFAULTS.narrationPace
    return parsed.data.narrationPace
  } catch {
    return COMFORT_DEFAULTS.narrationPace
  }
}

/**
 * Return the currently persisted `NarrationPace`, reacting to same-tab
 * (`echo9:comfort-changed`) and cross-tab (`storage`) updates.
 */
export function useNarrationPace(): NarrationPace {
  const [pace, setPace] = useState<NarrationPace>(() => readComfortNarrationPace())

  useEffect(() => {
    if (typeof window === 'undefined') return
    const recompute = () => setPace(readComfortNarrationPace())

    const onStorage = (e: StorageEvent) => {
      if (e.key === COMFORT_STORAGE_KEY || e.key === null) recompute()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener(COMFORT_CHANGED_EVENT, recompute)

    // Recompute once on mount in case a `dispatchComfortChanged()` fired
    // between the initial useState read and this effect subscribing.
    recompute()

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(COMFORT_CHANGED_EVENT, recompute)
    }
  }, [])

  return pace
}

/**
 * Convenience selector: return the numeric multiplier for the current pace.
 * `useTeletype` uses this directly so it doesn't have to import the table.
 */
export function useNarrationPaceMultiplier(): number {
  const pace = useNarrationPace()
  return NARRATION_PACE_MULTIPLIERS[pace]
}
