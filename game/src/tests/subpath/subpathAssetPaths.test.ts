/**
 * subpathAssetPaths.test.ts — regression pin for vite.config.ts `base: './'`.
 *
 * Reads dist/index.html and asserts every asset href/src is relative
 * (starts with ./) not root-absolute (starts with /). If someone drops the
 * base:'./' field from vite.config.ts, this test fails immediately without
 * needing to spin up a browser.
 *
 * Skips gracefully if dist/ hasn't been built yet — the Playwright verifier
 * (scripts/verify-subpath-safe.mjs) is the authoritative gate; this is a
 * cheap early-warning tripwire for the common case where devs rebuild often.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

describe('dist/index.html asset paths', () => {
  const distIndex = resolve(__dirname, '../../../dist/index.html')

  it.runIf(existsSync(distIndex))(
    'emits relative (./) asset URLs, never root-absolute (/) — protects file:// and subpath serving',
    () => {
      const html = readFileSync(distIndex, 'utf-8')
      const attrRe = /(?:src|href)="([^"]+)"/g
      const violations: string[] = []
      for (const m of html.matchAll(attrRe)) {
        const url = m[1] ?? ''
        if (
          url.startsWith('http') ||
          url.startsWith('//') ||
          url.startsWith('data:') ||
          url.startsWith('#') ||
          url === ''
        ) continue
        if (url.startsWith('/')) violations.push(url)
      }
      expect(
        violations,
        `dist/index.html contains root-absolute asset URLs — set base:'./' in vite.config.ts. Offenders: ${violations.join(', ')}`,
      ).toEqual([])
    },
  )
})
