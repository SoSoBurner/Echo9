/**
 * Echo 9 — Canonical palette tokens (PLAN.md §9, locked)
 *
 * This file is the single source of truth for all colors in the project.
 * - src/index.css @theme block must mirror these hex values.
 * - TS code that needs raw hex (SVG fill, canvas, inline styles) imports from here.
 * - colorGuard.test.ts imports the contrast utility from here.
 *
 * DO NOT edit hex values without re-running the contrast assertions in
 * src/tests/ui/colorGuard.test.ts and verifying all thresholds still pass.
 */

// ---------------------------------------------------------------------------
// Hex values (single source of truth)
// ---------------------------------------------------------------------------

export const PALETTE = {
  /** Page/canvas background — all contrast ratios are computed against this. */
  background: '#0A0B0D',

  /** Body text, headings — minimum 4.5:1 against background. */
  fgPrimary: '#E8E6E1',

  /** Metadata, trace hints — minimum 4.5:1 against background. */
  fgSecondary: '#A8A39A',

  /** Silas voice borders and icons ONLY — never use as body text. */
  silasAccent: '#D97757',

  /** Echo 9 narrator accents — minimum 4.5:1 against background. */
  nullAccent: '#7FB3D5',

  /** Destructive/warning — minimum 4.5:1 against background. Pair with text label. */
  warn: '#E07A5F',

  /** UI components only — NEVER use as text. Minimum 3.0:1 against background. */
  sealedDim: '#6B6660',
} as const

export type PaletteKey = keyof typeof PALETTE

// ---------------------------------------------------------------------------
// WCAG contrast utility — exported so tests can import without duplicating
// ---------------------------------------------------------------------------

/**
 * Convert an 8-bit channel value (0–255) to linearised sRGB.
 * Formula from WCAG 2.1 relative luminance definition.
 */
function linearise(channel8bit: number): number {
  const c = channel8bit / 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

/**
 * Parse a 6-digit hex color string (with or without leading `#`) and return
 * the WCAG 2.1 relative luminance value (0–1).
 */
export function relativeLuminance(hex: string): number {
  const h = hex.replace(/^#/, '')
  if (h.length !== 6) throw new Error(`relativeLuminance: expected 6-digit hex, got "${hex}"`)

  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)

  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b)
}

/**
 * Compute WCAG 2.1 contrast ratio between two hex colors.
 * Returns a ratio ≥ 1 (lighter / darker).
 */
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1)
  const l2 = relativeLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}
