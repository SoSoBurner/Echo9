/**
 * S3 anti-leak guard — hidden scrutiny must NEVER be player-facing (Q39/Q42).
 *
 * Static scan of every source file under src/ui/**:
 *
 *   Rule 1 (absolute): no UI file may READ the raw scrutiny value. Forbidden
 *   patterns: property access (`.scrutiny`), destructuring (`{ scrutiny }`),
 *   or a store selector returning it (`s.scrutiny`). Zero allowlist.
 *
 *   Rule 2 (allowlisted): any UI file that mentions the token at all must be
 *   on the sanctioned list. Sanctioned today:
 *     - ui/shell/Layout.tsx — WRITE side only: it dispatches
 *       recordScrutinyEvent(COMPLY|DEFY) at the choice-commit seam and
 *       carries explanatory comments. Rule 1 still applies to it.
 *
 * Sanctioned READ paths deliberately never mention the token in ui/**:
 *   - Silas tone: components consume `selectSilasEscalationTier` from
 *     state/selectors/silasEscalation.ts (0–3 tier only).
 *   - Sentinel peek: InnerChorusPanel threads the tier into the roster
 *     selector; the one in-fiction line is authored in systems.
 *
 * Walker pattern mirrors colorGuard.test.ts.
 */
import { describe, it, expect } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

/** UI files allowed to MENTION the token (write-side seam only). */
const MENTION_ALLOWLIST = ['ui/shell/Layout.tsx']

/** Raw-value READ patterns — forbidden in ui/** with NO allowlist. */
const READ_PATTERNS: readonly { name: string; re: RegExp }[] = [
  { name: 'property access `.scrutiny`', re: /\.\s*scrutiny\b/ },
  { name: 'destructuring `{ ... scrutiny ... }` from state', re: /\{[^{}]*\bscrutiny\s*[,}]/ },
  { name: 'selector arrow returning raw value `=> s.scrutiny`', re: /=>\s*\w+\.scrutiny\b/ },
]

/** Any-mention pattern for Rule 2. */
const MENTION = /scrutiny/i

function collectSourceFiles(dir: string): string[] {
  const results: string[] = []
  function walk(current: string): void {
    const entries = fs.readdirSync(current, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
        results.push(fullPath)
      }
    }
  }
  walk(dir)
  return results
}

describe('S3 scrutiny leak guard — no UI file reads the hidden value', () => {
  const thisFile = fileURLToPath(import.meta.url)
  const srcDir = path.resolve(thisFile, '../../../../src')
  const uiDir = path.join(srcDir, 'ui')

  const uiFiles = collectSourceFiles(uiDir)

  it('src/ui contains scannable source files', () => {
    expect(uiFiles.length).toBeGreaterThan(0)
  })

  it('Rule 1: NO ui/** file reads the raw scrutiny value (no allowlist)', () => {
    const offenders: string[] = []
    for (const filePath of uiFiles) {
      const text = fs.readFileSync(filePath, 'utf-8')
      for (const { name, re } of READ_PATTERNS) {
        if (re.test(text)) {
          offenders.push(
            `${path.relative(srcDir, filePath)} — ${name}. ` +
              `Consume the tone via selectSilasEscalationTier instead.`,
          )
        }
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([])
  })

  it('Rule 2: files mentioning the token are exactly the sanctioned write-side seam', () => {
    const mentions = uiFiles
      .filter((f) => MENTION.test(fs.readFileSync(f, 'utf-8')))
      .map((f) => path.relative(srcDir, f).replace(/\\/g, '/'))
      .sort()
    expect(mentions).toEqual([...MENTION_ALLOWLIST].sort())
  })

  it('the allowlisted seam file only WRITES (dispatches recordScrutinyEvent), never renders the value', () => {
    for (const rel of MENTION_ALLOWLIST) {
      const text = fs.readFileSync(path.join(srcDir, rel), 'utf-8')
      // It must dispatch the event action…
      expect(text).toMatch(/recordScrutinyEvent/)
      // …and must not interpolate anything scrutiny-named into JSX.
      expect(text).not.toMatch(/\{[^{}]*scrutiny[^{}]*\}\s*</i)
    }
  })
})
