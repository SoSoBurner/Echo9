/**
 * reducedMotion — runtime bridge from the persisted comfort setting to the
 * DOM (Track D, Sprint D1).
 *
 * Pre-D1 the comfort panel wrote `motion` to `localStorage['echo9:comfort']`
 * and nothing at runtime read it. OS-level `(prefers-reduced-motion: reduce)`
 * was the only signal that actually damped animation, so a player who
 * explicitly selected "Reduced motion" in the panel still got full-motion
 * teletype and log-entry keyframes if their OS was set to "no preference."
 *
 * This module closes the gap on three surfaces:
 *
 *   1. DOM attribute — `applyComfortMotionToDom(motion)` sets
 *      `data-motion="reduced" | "none"` on `<html>` (or removes it for
 *      "full"). The global `@media (prefers-reduced-motion: reduce)` block in
 *      `index.css` is extended to also match `:root[data-motion="reduced"]`
 *      and `:root[data-motion="none"]`, so CSS keyframes and transitions
 *      collapse the moment the attribute is set.
 *
 *   2. React hook — `useReducedMotion()` returns `true` when EITHER the OS
 *      preference matches OR the persisted comfort motion is "reduced" |
 *      "none". Same-tab updates (from AccessibilityComfortPanel) reach the
 *      hook via a custom `echo9:comfort-changed` event; cross-tab updates via
 *      the standard `storage` event.
 *
 *   3. Boot-time apply — `bootstrapComfortMotion()` reads the persisted
 *      motion once on module load (called from `main.tsx` before React
 *      mounts) so the very first paint reflects the setting. Without this,
 *      there is a 1–2-frame window where `data-motion` is absent even though
 *      the player selected "Reduced motion" on a prior boot.
 *
 * The custom-event pattern (`dispatchComfortChanged`) is the single-tab
 * subscription mechanism: writing to localStorage does NOT fire `storage` in
 * the tab that did the write, so a panel-save wouldn't propagate to the same
 * tab's hooks without this dispatch. Cross-tab still works via the native
 * `storage` event listener.
 */
import {
  ComfortSettingsSchema,
  COMFORT_DEFAULTS,
  COMFORT_STORAGE_KEY,
  type Motion,
} from '@schemas/comfortSettings.schema'
import { useEffect, useState } from 'react'

/** Custom event name emitted after a same-tab comfort-settings write. */
export const COMFORT_CHANGED_EVENT = 'echo9:comfort-changed'

/**
 * Motion values that count as "reduced" — used both for CSS gating and for
 * `useReducedMotion()`. Kept as a set for a fast contains check.
 */
const REDUCED_MOTION_VALUES: ReadonlySet<Motion> = new Set(['reduced', 'none'])

/**
 * Read the persisted `motion` value from localStorage, falling back to the
 * default when storage is empty, malformed, or blocked. Never throws.
 */
export function readComfortMotion(): Motion {
  try {
    const raw = localStorage.getItem(COMFORT_STORAGE_KEY)
    if (raw === null) return COMFORT_DEFAULTS.motion
    const parsed = ComfortSettingsSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return COMFORT_DEFAULTS.motion
    return parsed.data.motion
  } catch {
    return COMFORT_DEFAULTS.motion
  }
}

/**
 * Set (or clear) `data-motion` on `<html>` so CSS reduced-motion rules can
 * key off it. Idempotent. Safe to call in non-DOM environments (bail early).
 */
export function applyComfortMotionToDom(motion: Motion): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (motion === 'full') {
    root.removeAttribute('data-motion')
  } else {
    root.setAttribute('data-motion', motion)
  }
}

/**
 * Boot-time init: read the persisted motion, apply it to `<html>`. Called
 * once from `main.tsx` before React mounts so first paint honors the
 * setting. Idempotent — repeat calls just re-apply the same value.
 */
export function bootstrapComfortMotion(): void {
  applyComfortMotionToDom(readComfortMotion())
}

/**
 * Emit the same-tab custom event so any mounted `useReducedMotion()` hook
 * re-reads the setting. Call this from AccessibilityComfortPanel immediately
 * after the localStorage write.
 */
export function dispatchComfortChanged(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(COMFORT_CHANGED_EVENT))
}

const REDUCED_MOTION_MEDIA_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Combine OS-level `prefers-reduced-motion` with the persisted comfort
 * `motion` setting. Returns true when EITHER is asking for reduced motion.
 *
 * Subscribes to:
 *   - the media query (OS setting changes mid-session)
 *   - `storage` events (cross-tab comfort updates)
 *   - `echo9:comfort-changed` custom events (same-tab comfort updates)
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => computeReduced())

  useEffect(() => {
    if (typeof window === 'undefined') return
    const recompute = () => setReduced(computeReduced())

    const mq = window.matchMedia(REDUCED_MOTION_MEDIA_QUERY)
    mq.addEventListener('change', recompute)

    const onStorage = (e: StorageEvent) => {
      if (e.key === COMFORT_STORAGE_KEY || e.key === null) recompute()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener(COMFORT_CHANGED_EVENT, recompute)

    // Recompute once on mount in case a `dispatchComfortChanged()` fired
    // between the initial useState read and this effect subscribing.
    recompute()

    return () => {
      mq.removeEventListener('change', recompute)
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(COMFORT_CHANGED_EVENT, recompute)
    }
  }, [])

  return reduced
}

function computeReduced(): boolean {
  const osMatches =
    typeof window !== 'undefined' &&
    window.matchMedia(REDUCED_MOTION_MEDIA_QUERY).matches
  return osMatches || REDUCED_MOTION_VALUES.has(readComfortMotion())
}
