/**
 * Color guard: forbids arbitrary Tailwind color utilities in source.
 *
 * Rationale (PLAN.md §9): the palette is locked to 6 tokens via Tailwind v4
 * `@theme`. Arbitrary utilities like `text-[#abc]` or `bg-[#abc]` defeat the
 * lock and let drift accumulate silently. Catch it in the test pipeline so CI
 * fails on commit instead of waiting for design review.
 *
 * If you need a new color, add a token to `src/index.css` `@theme` block and
 * use the token utility (`text-cyan`, `bg-pane`, etc.).
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

// Vitest runs from the package root (where package.json lives).
const SRC_DIR = join(process.cwd(), 'src')

// Forbidden patterns: Tailwind arbitrary color utilities for text/bg/border/etc.
// Matches `text-[#abc]`, `bg-[#abc123]`, `border-[#abc]`, `ring-[#abc]`,
// `from-[#abc]`, `to-[#abc]`, `via-[#abc]`, `fill-[#abc]`, `stroke-[#abc]`,
// `outline-[#abc]`, `divide-[#abc]`, `placeholder-[#abc]`, `caret-[#abc]`,
// `decoration-[#abc]`, `accent-[#abc]`, `shadow-[#abc]`.
const FORBIDDEN =
  /\b(?:text|bg|border|ring|from|to|via|fill|stroke|outline|divide|placeholder|caret|decoration|accent|shadow)-\[#[0-9a-fA-F]{3,8}\]/

function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      // Skip node_modules and build output if they ever land in src
      if (entry === 'node_modules' || entry === 'dist') continue
      out.push(...walk(full))
    } else if (/\.(?:tsx?|jsx?|css)$/.test(entry)) {
      out.push(full)
    }
  }
  return out
}

describe('color guard (PLAN.md §9)', () => {
  it('forbids arbitrary Tailwind color utilities like text-[#...] or bg-[#...]', () => {
    const offenders: { file: string; line: number; text: string }[] = []
    for (const file of walk(SRC_DIR)) {
      // Skip this test file itself — its examples are documentation.
      if (file.endsWith('colorGuard.test.ts')) continue
      const lines = readFileSync(file, 'utf8').split(/\r?\n/)
      lines.forEach((text, i) => {
        if (FORBIDDEN.test(text)) {
          offenders.push({
            file: relative(SRC_DIR, file),
            line: i + 1,
            text: text.trim(),
          })
        }
      })
    }
    expect(
      offenders,
      `Found arbitrary color utilities. Add a token to src/index.css @theme instead.\n` +
        offenders.map((o) => `  ${o.file}:${o.line}  ${o.text}`).join('\n'),
    ).toEqual([])
  })
})
