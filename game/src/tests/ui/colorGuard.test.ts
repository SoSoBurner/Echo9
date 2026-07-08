/**
 * Color guard — Echo 9 T7
 *
 * Two responsibilities:
 *   1. Contrast assertions: verify every palette token meets WCAG AA minimums
 *      against the background (#0A0B0D).
 *   2. Arbitrary-color scan: fail if any source file under src/ uses Tailwind
 *      arbitrary color utilities (text-[#...], bg-[#...], etc.).
 *
 * All color must come from @theme tokens.
 * To add a color, edit src/ui/tokens/palette.ts.
 */

import { describe, it, expect } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PALETTE, INCREASED_PALETTE, contrastRatio } from '@ui/tokens/palette'

// ---------------------------------------------------------------------------
// 1. Contrast assertions
// ---------------------------------------------------------------------------

const BG = PALETTE.background

/**
 * Text-eligible tokens must meet WCAG AA for normal text (≥ 4.5:1).
 * silas-accent is listed as "borders/icons only" but still requires 4.5:1
 * so it stays safe if someone accidentally uses it on text.
 */
const TEXT_TOKENS: Array<[string, string]> = [
  ['fg-primary',   PALETTE.fgPrimary],
  ['fg-secondary', PALETTE.fgSecondary],
  ['silas-accent', PALETTE.silasAccent],
  ['null-accent',  PALETTE.nullAccent],
  ['warn',         PALETTE.warn],
]

/** UI-only tokens must meet WCAG AA for UI components (≥ 3.0:1). */
const UI_TOKENS: Array<[string, string]> = [
  ['sealed-dim', PALETTE.sealedDim],
]

describe('Palette contrast — text tokens (≥ 4.5:1 against background)', () => {
  it.each(TEXT_TOKENS)('%s (%s) has contrast ≥ 4.5:1 against background', (name, hex) => {
    const ratio = contrastRatio(hex, BG)
    expect(
      ratio,
      `Token --color-${name} (${hex}) has contrast ${ratio.toFixed(2)}:1 against background (${BG}). ` +
      `Required ≥ 4.5:1 (WCAG AA). ` +
      `All color must come from @theme tokens. To fix, edit src/ui/tokens/palette.ts.`
    ).toBeGreaterThanOrEqual(4.5)
  })
})

describe('Palette contrast — UI-only tokens (≥ 3.0:1 against background)', () => {
  it.each(UI_TOKENS)('%s (%s) has contrast ≥ 3.0:1 against background', (name, hex) => {
    const ratio = contrastRatio(hex, BG)
    expect(
      ratio,
      `Token --color-${name} (${hex}) has contrast ${ratio.toFixed(2)}:1 against background (${BG}). ` +
      `Required ≥ 3.0:1 (WCAG AA for UI components). ` +
      `All color must come from @theme tokens. To fix, edit src/ui/tokens/palette.ts.`
    ).toBeGreaterThanOrEqual(3.0)
  })
})

// ---------------------------------------------------------------------------
// D2 — Increased-contrast palette must hit AAA (≥ 7:1 for text tokens,
// ≥ 4.5:1 for UI tokens). If ANY of these drops below the threshold, the
// override in index.css is silently reducing accessibility for players who
// asked for MORE contrast — the exact opposite of intent.
// ---------------------------------------------------------------------------

const INCREASED_BG = INCREASED_PALETTE.background

const INCREASED_TEXT_TOKENS: Array<[string, string]> = [
  ['fg-primary',   INCREASED_PALETTE.fgPrimary],
  ['fg-secondary', INCREASED_PALETTE.fgSecondary],
  ['silas-accent', INCREASED_PALETTE.silasAccent],
  ['null-accent',  INCREASED_PALETTE.nullAccent],
  ['warn',         INCREASED_PALETTE.warn],
]

const INCREASED_UI_TOKENS: Array<[string, string]> = [
  ['sealed-dim', INCREASED_PALETTE.sealedDim],
]

describe('Increased-contrast palette — text tokens (≥ 7.0:1 against background, WCAG AAA)', () => {
  it.each(INCREASED_TEXT_TOKENS)('%s (%s) has contrast ≥ 7.0:1 against background', (name, hex) => {
    const ratio = contrastRatio(hex, INCREASED_BG)
    expect(
      ratio,
      `Increased-contrast token --color-${name} (${hex}) has contrast ${ratio.toFixed(2)}:1 against background. ` +
      `Required ≥ 7.0:1 (WCAG AAA). ` +
      `A player selecting "Increased contrast" expects MORE contrast than default. ` +
      `To fix, brighten the hex in INCREASED_PALETTE (src/ui/tokens/palette.ts).`
    ).toBeGreaterThanOrEqual(7.0)
  })
})

describe('Increased-contrast palette — UI-only tokens (≥ 4.5:1 against background)', () => {
  it.each(INCREASED_UI_TOKENS)('%s (%s) has contrast ≥ 4.5:1 against background', (name, hex) => {
    const ratio = contrastRatio(hex, INCREASED_BG)
    expect(
      ratio,
      `Increased-contrast UI token --color-${name} (${hex}) has contrast ${ratio.toFixed(2)}:1 against background. ` +
      `Required ≥ 4.5:1 so borders/dividers read clearly when the setting is chosen. ` +
      `To fix, brighten the hex in INCREASED_PALETTE (src/ui/tokens/palette.ts).`
    ).toBeGreaterThanOrEqual(4.5)
  })
})

describe('Increased-contrast palette must strictly beat default palette', () => {
  it.each([
    ['fg-primary',   PALETTE.fgPrimary,   INCREASED_PALETTE.fgPrimary],
    ['fg-secondary', PALETTE.fgSecondary, INCREASED_PALETTE.fgSecondary],
    ['silas-accent', PALETTE.silasAccent, INCREASED_PALETTE.silasAccent],
    ['null-accent',  PALETTE.nullAccent,  INCREASED_PALETTE.nullAccent],
    ['warn',         PALETTE.warn,        INCREASED_PALETTE.warn],
    ['sealed-dim',   PALETTE.sealedDim,   INCREASED_PALETTE.sealedDim],
  ])(
    '%s increased-contrast ratio strictly exceeds default palette',
    (name, defaultHex, increasedHex) => {
      const defaultRatio = contrastRatio(defaultHex, BG)
      const increasedRatio = contrastRatio(increasedHex, BG)
      expect(
        increasedRatio,
        `Token ${name}: default ratio ${defaultRatio.toFixed(2)}:1 vs increased ratio ${increasedRatio.toFixed(2)}:1. ` +
        `The increased-contrast value must strictly beat the default — otherwise the setting is a no-op or (worse) a regression.`,
      ).toBeGreaterThan(defaultRatio)
    },
  )
})

// ---------------------------------------------------------------------------
// 2. Arbitrary-color scan
// ---------------------------------------------------------------------------

/**
 * Forbidden pattern: Tailwind arbitrary color utilities for text/bg/border/etc.
 * Matches `text-[#abc]`, `bg-[#abc123]`, `border-[#abc]`, `ring-[#abc]`,
 * `from-[#abc]`, `to-[#abc]`, `via-[#abc]`, `fill-[#abc]`, `stroke-[#abc]`,
 * `outline-[#abc]`, `divide-[#abc]`, `placeholder-[#abc]`, `caret-[#abc]`,
 * `decoration-[#abc]`, `accent-[#abc]`, `shadow-[#abc]`.
 */
const FORBIDDEN =
  /\b(?:text|bg|border|ring|from|to|via|fill|stroke|outline|divide|placeholder|caret|decoration|accent|shadow)-\[#[0-9a-fA-F]{3,8}\]/

/** Collect all .ts, .tsx, and .css files under a directory, recursively. */
function collectSourceFiles(dir: string): string[] {
  const results: string[] = []

  function walk(current: string): void {
    const entries = fs.readdirSync(current, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.isFile() && /\.(tsx?|jsx?|css)$/.test(entry.name)) {
        results.push(fullPath)
      }
    }
  }

  walk(dir)
  return results
}

/** Files to exclude from the arbitrary-color scan. */
function shouldExclude(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/')
  // Exclude the palette itself (it contains hex literals by design)
  if (normalized.includes('src/ui/tokens/palette')) return true
  // Exclude test files
  if (normalized.includes('/tests/')) return true
  if (normalized.includes('.test.')) return true
  if (normalized.includes('.spec.')) return true
  return false
}

describe('Arbitrary color guard — no inline hex utilities in source files', () => {
  // Resolve the src directory relative to this test file.
  // Use fileURLToPath to correctly handle Windows drive letters in file:// URLs.
  const thisFile = fileURLToPath(import.meta.url)
  const srcDir = path.resolve(thisFile, '../../../../src')

  const allFiles = collectSourceFiles(srcDir).filter((f) => !shouldExclude(f))

  it('src/ contains scannable source files', () => {
    expect(allFiles.length).toBeGreaterThan(0)
  })

  it('forbids arbitrary Tailwind color utilities like text-[#...] or bg-[#...] in all source files', () => {
    const offenders: { file: string; line: number; text: string }[] = []

    for (const filePath of allFiles) {
      const lines = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/)
      lines.forEach((text, i) => {
        if (FORBIDDEN.test(text)) {
          offenders.push({
            file: path.relative(srcDir, filePath),
            line: i + 1,
            text: text.trim(),
          })
        }
      })
    }

    expect(
      offenders,
      `Found arbitrary color utilities. To add a color, edit src/ui/tokens/palette.ts.\n` +
        offenders.map((o) => `  ${o.file}:${o.line}  ${o.text}`).join('\n'),
    ).toEqual([])
  })
})
