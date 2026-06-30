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
