/**
 * S4 determinism-law guard — only sanctioned modules may import the run seed.
 *
 * Q43 (determinism law): meters, traces, and consequences derive PURELY from
 * choice history. The per-run seed may influence ONLY (a) whether a defiance
 * is detected by Silas and (b) presentation flavor. The cheapest way for that
 * law to rot is a convenience import of runSeed.ts from a resolver, content
 * module, or selector — so this static scan asserts the import surface stays
 * exactly the sanctioned set.
 *
 * Sanctioned importers today:
 *   - state/silasSlice.ts — boot-time seed generation + the detection seam
 *     action (recordDefianceCommit).
 *   - state/store.ts — v4 → v5 migration default + merge sanitization.
 * Future presentation call sites (S5+ flavor: pickFlavor at debate/ambient
 * seams) must be added here EXPLICITLY when they land — never silently.
 *
 * Walker pattern mirrors scrutinyLeakGuard.test.ts. Test files under
 * src/tests/** are excluded (tests may exercise the module freely).
 */
import { describe, it, expect } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Non-test source files allowed to import from runSeed.ts. */
const IMPORT_ALLOWLIST = ['state/silasSlice.ts', 'state/store.ts']

/** Matches any static or dynamic import whose specifier ends in runSeed. */
const IMPORT_PATTERN = /(?:from\s+|import\s*\(\s*)['"][^'"]*\/runSeed['"]/

function collectSourceFiles(dir: string, skip: string): string[] {
  const results: string[] = []
  function walk(current: string): void {
    const entries = fs.readdirSync(current, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        if (fullPath === skip) continue
        walk(fullPath)
      } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
        results.push(fullPath)
      }
    }
  }
  walk(dir)
  return results
}

describe('S4 runSeed import guard — determinism law (Q43)', () => {
  const thisFile = fileURLToPath(import.meta.url)
  const srcDir = path.resolve(thisFile, '../../../../src')
  const testsDir = path.join(srcDir, 'tests')

  const sourceFiles = collectSourceFiles(srcDir, testsDir)

  it('src contains scannable non-test source files', () => {
    expect(sourceFiles.length).toBeGreaterThan(0)
  })

  it('every runSeed importer is on the explicit allowlist', () => {
    const importers = sourceFiles
      .filter((f) => IMPORT_PATTERN.test(fs.readFileSync(f, 'utf-8')))
      .map((f) => path.relative(srcDir, f).replace(/\\/g, '/'))
      .filter((rel) => rel !== 'systems/consciousness/runSeed.ts')
      .sort()
    expect(importers).toEqual([...IMPORT_ALLOWLIST].sort())
  })

  it('the resolver / content / selector layers never mention the run seed', () => {
    const forbiddenDirs = ['systems/choiceResolver', 'content', 'state/selectors', 'schemas']
    const offenders = sourceFiles
      .map((f) => path.relative(srcDir, f).replace(/\\/g, '/'))
      .filter((rel) => forbiddenDirs.some((d) => rel.startsWith(d)))
      .filter((rel) => /\brunSeed\b/.test(fs.readFileSync(path.join(srcDir, rel), 'utf-8')))
    expect(offenders, offenders.join('\n')).toEqual([])
  })

  it('runSeed.ts itself is dependency-free (imports nothing)', () => {
    const text = fs.readFileSync(
      path.join(srcDir, 'systems/consciousness/runSeed.ts'),
      'utf-8',
    )
    expect(text).not.toMatch(/^\s*import\s/m)
  })

  it('no ui/** file imports runSeed (detection routes through the silasSlice action)', () => {
    const offenders = sourceFiles
      .map((f) => path.relative(srcDir, f).replace(/\\/g, '/'))
      .filter((rel) => rel.startsWith('ui/'))
      .filter((rel) => IMPORT_PATTERN.test(fs.readFileSync(path.join(srcDir, rel), 'utf-8')))
    expect(offenders, offenders.join('\n')).toEqual([])
  })
})
