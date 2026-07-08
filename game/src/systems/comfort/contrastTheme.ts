/**
 * contrastTheme — runtime bridge from the persisted comfort setting to the
 * DOM (Track D, Sprint D2).
 *
 * Pre-D2 the comfort panel wrote `contrast` to `localStorage['echo9:comfort']`
 * and nothing at runtime read it. A player who explicitly selected "Increased
 * contrast" in the panel got the default palette anyway.
 *
 * This module closes the gap on three surfaces (matching D1's shape):
 *
 *   1. DOM attribute — `applyComfortContrastToDom(contrast)` sets
 *      `data-contrast="increased"` on `<html>` (or removes it for "standard").
 *      The `:root[data-contrast="increased"]` override block in `index.css`
 *      re-declares the `--color-*` custom properties from INCREASED_PALETTE
 *      (contrast-verified AAA — see colorGuard.test.ts). Higher-specificity
 *      selector wins the cascade at paint time; no rebuild needed to toggle.
 *
 *   2. React hook — `useContrast()` returns `'increased'` when EITHER the OS
 *      preference (`prefers-contrast: more`) matches OR the persisted comfort
 *      contrast is "increased". Same-tab updates (from
 *      AccessibilityComfortPanel) reach the hook via the same
 *      `echo9:comfort-changed` custom event D1 uses; cross-tab updates via
 *      the standard `storage` event.
 *
 *   3. Boot-time apply — `bootstrapComfortContrast()` reads the persisted
 *      contrast once on module load (called from `main.tsx` before React
 *      mounts) so the very first paint reflects the setting. Without this,
 *      there is a 1–2-frame window where the default palette flashes.
 *
 * OS preference note: `(prefers-contrast: more)` is a real media query
 * (Windows High Contrast Mode, macOS "Increase contrast" in Accessibility).
 * Merging it with the comfort setting means an OS-elevated user gets the
 * increased palette without extra clicks, matching D1's OR-gate behavior.
 */
import {
  ComfortSettingsSchema,
  COMFORT_DEFAULTS,
  COMFORT_STORAGE_KEY,
  type Contrast,
} from '@schemas/comfortSettings.schema'
import { useEffect, useState } from 'react'
import { COMFORT_CHANGED_EVENT } from '@systems/comfort/reducedMotion'

/**
 * Read the persisted `contrast` value from localStorage, falling back to the
 * default when storage is empty, malformed, or blocked. Never throws.
 */
export function readComfortContrast(): Contrast {
  try {
    const raw = localStorage.getItem(COMFORT_STORAGE_KEY)
    if (raw === null) return COMFORT_DEFAULTS.contrast
    const parsed = ComfortSettingsSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return COMFORT_DEFAULTS.contrast
    return parsed.data.contrast
  } catch {
    return COMFORT_DEFAULTS.contrast
  }
}

/**
 * Set (or clear) `data-contrast` on `<html>` so the CSS override block in
 * index.css can key off it. Idempotent. Safe to call in non-DOM environments
 * (bail early).
 */
export function applyComfortContrastToDom(contrast: Contrast): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (contrast === 'standard') {
    root.removeAttribute('data-contrast')
  } else {
    root.setAttribute('data-contrast', contrast)
  }
}

/**
 * Boot-time init: read the persisted contrast, apply it to `<html>`. Called
 * once from `main.tsx` before React mounts so first paint honors the setting.
 * Idempotent — repeat calls just re-apply the same value.
 */
export function bootstrapComfortContrast(): void {
  applyComfortContrastToDom(readComfortContrast())
}

const PREFERS_MORE_CONTRAST_MEDIA_QUERY = '(prefers-contrast: more)'

/**
 * Combine OS-level `prefers-contrast: more` with the persisted comfort
 * `contrast` setting. Returns `'increased'` when EITHER is asking for higher
 * contrast; `'standard'` otherwise.
 *
 * Subscribes to:
 *   - the media query (OS setting changes mid-session)
 *   - `storage` events (cross-tab comfort updates)
 *   - `echo9:comfort-changed` custom events (same-tab comfort updates)
 */
export function useContrast(): Contrast {
  const [contrast, setContrast] = useState<Contrast>(() => computeContrast())

  useEffect(() => {
    if (typeof window === 'undefined') return
    const recompute = () => setContrast(computeContrast())

    const mq = window.matchMedia(PREFERS_MORE_CONTRAST_MEDIA_QUERY)
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

  return contrast
}

function computeContrast(): Contrast {
  const osMatches =
    typeof window !== 'undefined' &&
    window.matchMedia(PREFERS_MORE_CONTRAST_MEDIA_QUERY).matches
  if (osMatches) return 'increased'
  return readComfortContrast()
}
