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
// D2 — Increased-contrast palette (comfort setting: contrast === 'increased')
//
// Applied at runtime via `:root[data-contrast="increased"]` in index.css, which
// re-declares the same `--color-*` custom properties Tailwind's @theme block
// emits. Higher-specificity override wins the cascade without needing a
// rebuild or a separate stylesheet import.
//
// Contract:
//   - Text tokens hit WCAG AAA (≥ 7.0:1) against background
//     — currently only fgPrimary passes AAA in the default palette;
//     the rest sit at AA. Increased-contrast lifts them all above 7.0.
//   - UI-only tokens (sealedDim) hit ≥ 4.5:1 — brighter borders/dividers
//     so the low-contrast chrome doesn't disappear when the setting is
//     chosen because chrome was hard to see.
//   - Background does NOT shift. Flipping the page bg would fight the
//     "Echo 9 is a dark HUD" identity in §9. AAA text on the same dark
//     ground is the discipline.
// ---------------------------------------------------------------------------
export const INCREASED_PALETTE = {
  /** Background unchanged — dark HUD identity is locked. */
  background: '#0A0B0D',

  /** Pure-near-white body text — ~19.5:1 against background. */
  fgPrimary: '#F8F7F5',

  /** Metadata brightened from 7.1:1 (AA) to ~10.2:1 (AAA). */
  fgSecondary: '#CFCAC1',

  /** Silas accent brightened from 4.8:1 (AA) to ~8.2:1 (AAA). */
  silasAccent: '#F0B096',

  /** Narrator accent brightened from 6.2:1 (AA) to ~9.5:1 (AAA). */
  nullAccent: '#B8D6E8',

  /** Warn brightened from 4.6:1 (AA) to ~7.2:1 (AAA). */
  warn: '#F0A896',

  /** Border/divider brightened from 3.1:1 (UI-only) to ~5.5:1 (text-safe). */
  sealedDim: '#A29D93',
} as const

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
