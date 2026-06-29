/**
 * Color guard — Echo 9 T7
 *
 * Two responsibilities:
 *   1. Contrast assertions: verify every palette token meets WCAG AA minimums
 *      against the background (#0A0B0D).
 *   2. Arbitrary-color scan: fail if any .ts/.tsx file under src/ uses
 *      Tailwind arbitrary color utilities (text-[#, bg-[#, border-[#, ring-[#).
 *
 * All color must come from @theme tokens.
 * To add a color, edit src/ui/tokens/palette.ts.
 */

import { describe, it, expect } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PALETTE, contrastRatio } from '@ui/tokens/palette'

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
  it.each(TEXT_TOKENS)('%s has contrast ≥ 4.5:1 against %s', (name, hex) => {
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
  it.each(UI_TOKENS)('%s has contrast ≥ 3.0:1 against %s', (name, hex) => {
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
// 2. Arbitrary-color scan
// ---------------------------------------------------------------------------

/** Tailwind arbitrary color utility patterns that are forbidden. */
const FORBIDDEN_PATTERNS: RegExp[] = [
  /text-\[#/,
  /bg-\[#/,
  /border-\[#/,
  /ring-\[#/,
]

/** Collect all .ts and .tsx files under a directory, recursively. */
function collectSourceFiles(dir: string): string[] {
  const results: string[] = []

  function walk(current: string): void {
    const entries = fs.readdirSync(current, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
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

  it('src/ contains scannable .ts/.tsx files', () => {
    expect(allFiles.length).toBeGreaterThan(0)
  })

  it.each(allFiles.map((f) => [path.relative(srcDir, f), f]))(
    '%s — no arbitrary color utilities',
    (_rel, filePath) => {
      const content = fs.readFileSync(filePath, 'utf-8')
      const lines = content.split('\n')

      const violations: string[] = []

      lines.forEach((line, i) => {
        for (const pattern of FORBIDDEN_PATTERNS) {
          if (pattern.test(line)) {
            violations.push(
              `  Line ${i + 1}: ${line.trim()}\n` +
              `  Pattern: ${pattern.source}`
            )
          }
        }
      })

      expect(
        violations,
        `Arbitrary color utility found in ${filePath}:\n${violations.join('\n')}\n\n` +
        `All color must come from @theme tokens. ` +
        `To add a color, edit src/ui/tokens/palette.ts.`
      ).toHaveLength(0)
    }
  )
})
