/**
 * textSize — runtime bridge from the persisted comfort setting to the DOM
 * (Track D, Sprint D3).
 *
 * Pre-D3 the comfort panel wrote `textSize` to `localStorage['echo9:comfort']`
 * and nothing at runtime read it. A player who explicitly picked "Large" or
 * "Extra Large" in the panel got the default 16px root font anyway.
 *
 * This module closes the gap on three surfaces (matching D1/D2's shape):
 *
 *   1. DOM custom property — `applyComfortTextSizeToDom(size)` sets
 *      `--text-scale: <number>` on `<html>` as an inline style (not a
 *      data-attribute — we need a numeric value the CSS `calc()` in
 *      `index.css` can consume). The `:root` rule in `index.css` reads
 *      `--text-scale` (default 1) and multiplies the root font-size by it,
 *      so every rem-based utility (Tailwind's `text-sm`, `text-base`, `text-lg`)
 *      scales automatically without touching call-sites.
 *
 *   2. React hook — `useTextSize()` returns the current `TextSize` (S/M/L/XL).
 *      Unlike D1/D2 there is no OS media query for text size (there isn't
 *      one), so the hook only tracks the persisted setting. Same-tab updates
 *      from AccessibilityComfortPanel arrive via the shared
 *      `echo9:comfort-changed` custom event; cross-tab updates via the
 *      standard `storage` event.
 *
 *   3. Boot-time apply — `bootstrapComfortTextSize()` reads the persisted
 *      size once on module load (called from `main.tsx` before React mounts)
 *      so the very first paint reflects the setting. Without this, there is a
 *      1–2-frame window where the default (M / scale=1) shows even when the
 *      player picked XL on a prior boot.
 *
 * Scale factors (locked here so the hook and CSS agree):
 *   S  = 0.9   (subtle downshift for space-constrained monitors)
 *   M  = 1.0   (default — no visual change)
 *   L  = 1.15  (comfortable upshift)
 *   XL = 1.3   (max reasonable step without breaking HUD layout)
 *
 * The steps intentionally clear WCAG's 200% zoom advice when combined
 * (browser zoom stacks on top of `--text-scale`), and each step is large
 * enough to be perceptible without turning the HUD into a phone-first
 * layout that the current column grid can't accommodate.
 */
import {
  ComfortSettingsSchema,
  COMFORT_DEFAULTS,
  COMFORT_STORAGE_KEY,
  type TextSize,
} from '@schemas/comfortSettings.schema'
import { useEffect, useState } from 'react'
import { COMFORT_CHANGED_EVENT } from '@systems/comfort/reducedMotion'

/**
 * Root font-size multipliers per TextSize choice. Kept in TS (not CSS) so
 * both the hook and `applyComfortTextSizeToDom` share the same source of
 * truth — the CSS side only reads `var(--text-scale, 1)`, letting the number
 * flow through calc().
 */
export const TEXT_SIZE_SCALES: Readonly<Record<TextSize, number>> = {
  S: 0.9,
  M: 1.0,
  L: 1.15,
  XL: 1.3,
}

/** CSS custom property name — kept exported so tests can assert against it. */
export const TEXT_SCALE_PROPERTY = '--text-scale'

/**
 * Read the persisted `textSize` value from localStorage, falling back to the
 * default when storage is empty, malformed, or blocked. Never throws.
 */
export function readComfortTextSize(): TextSize {
  try {
    const raw = localStorage.getItem(COMFORT_STORAGE_KEY)
    if (raw === null) return COMFORT_DEFAULTS.textSize
    const parsed = ComfortSettingsSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return COMFORT_DEFAULTS.textSize
    return parsed.data.textSize
  } catch {
    return COMFORT_DEFAULTS.textSize
  }
}

/**
 * Set (or clear) the `--text-scale` custom property on `<html>` so the CSS
 * `calc(1rem * var(--text-scale, 1))` in `index.css` scales the root
 * font-size. For the default 'M' (scale 1), the property is removed so
 * `var(--text-scale, 1)` falls back to 1 — keeps DevTools' style panel
 * clean for the default. Safe to call in non-DOM environments (bail early).
 */
export function applyComfortTextSizeToDom(size: TextSize): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const scale = TEXT_SIZE_SCALES[size]
  if (scale === 1) {
    root.style.removeProperty(TEXT_SCALE_PROPERTY)
  } else {
    root.style.setProperty(TEXT_SCALE_PROPERTY, String(scale))
  }
}

/**
 * Boot-time init: read the persisted size, apply it to `<html>`. Called once
 * from `main.tsx` before React mounts so first paint honors the setting.
 * Idempotent — repeat calls just re-apply the same value.
 */
export function bootstrapComfortTextSize(): void {
  applyComfortTextSizeToDom(readComfortTextSize())
}

/**
 * Return the currently persisted `TextSize`, reacting to same-tab
 * (`echo9:comfort-changed`) and cross-tab (`storage`) updates. No OS media
 * query gate — there isn't one for text size.
 */
export function useTextSize(): TextSize {
  const [size, setSize] = useState<TextSize>(() => readComfortTextSize())

  useEffect(() => {
    if (typeof window === 'undefined') return
    const recompute = () => setSize(readComfortTextSize())

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

  return size
}
