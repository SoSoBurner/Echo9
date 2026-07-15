/**
 * P9 architectural law — the Silas ↔ Null boundary (Q19, Standing Rule 2).
 *
 * THE LAW: owner-facing UI never imports chorus modules. Only Null's
 * composition output may cross toward the Silas surface. Concretely: the
 * forbidden zone is `SilasPromptPanel` (+ its transitive dependency closure)
 * importing from any of:
 *
 *   - content/voices/**            (chorus voice line registries)
 *   - systems/voiceActivationEngine
 *   - systems/voiceDeliberationEngine
 *   - systems/coalitionEngine
 *   - content/polylogueScenes/**   (authored polylogue scene registries)
 *
 * SCOPE NUANCE (P10, commit 8359d16): the law protects the SILAS-facing
 * surface, not the player. `ChorusDebateSection` (inside the player-facing
 * CenterDirectivePanel) legitimately renders debate beats that name chorus
 * voices — that is the internal HUD the player is allowed to see, and it is
 * deliberately OUT of scope here. What must never happen is chorus internals
 * leaking into the panel that renders what SILAS sees/hears.
 *
 * ALLOWED CROSSINGS (boundary nodes — recorded, never descended):
 *   - systems/nullCompositionEngine — the single sanctioned engine crossing
 *     (types + composeNullOutput). Its output IS the boundary artifact.
 *   - state/polylogueSlice — the composition seam. It imports all four
 *     engines + the scene registry BY DESIGN (that is the pipeline), but it
 *     exposes only composed outputs to this surface. That claim is not taken
 *     on faith: a companion assertion below proves SilasPromptPanel's own
 *     source references ONLY `silasFacingText` from the slice — never
 *     `polylogueBeats` or `dissentSummary` (those are HUD-internal and may
 *     name chorus voices).
 *
 * RIGHT-COLUMN SCOPE: there is no RightRail.tsx. The right grid column
 * (Layout.tsx, gridArea 'right') hosts three components:
 *   - RightModuleConsole — the module console. PLAYER-facing HUD (module
 *     install/ability UI, Q14): EXCLUDED from the walk. It may legally know
 *     about module/chorus content because the player is its audience.
 *   - PortraitSlot — shared rendering primitive mounted in the Silas column
 *     slot. INCLUDED as a second walk root: it is a dumb renderer and must
 *     stay chorus-free; if it ever needs voice-content data, that data must
 *     arrive via props from the player-facing side.
 *   - SilasPromptPanel — the protected surface itself. Primary root.
 *
 * MECHANICS: dependency-free static scan (fs + regex, no ts-morph), following
 * the walker style of scrutinyLeakGuard.test.ts / runSeedImportGuard.test.ts.
 * Comments are stripped before extracting import specifiers so doc references
 * to forbidden module names never false-positive. Unresolvable internal
 * specifiers FAIL the suite (a silently-skipped edge would rot the law).
 * A negative-case block proves the scanner actually flags forbidden imports
 * (fixture strings only — no rogue file is written into src).
 */
import { describe, it, expect } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Walk roots — the Silas-facing surface (src-relative, posix separators). */
const ROOTS = [
  'ui/silas/SilasPromptPanel.tsx',
  'ui/portraits/PortraitSlot.tsx',
] as const

/**
 * Sanctioned boundary nodes: they may appear in the closure, but the walk
 * stops at them and their own imports are NOT checked — their forbidden-side
 * imports are the composition pipeline itself (see file header).
 */
const BOUNDARY_ALLOWLIST = [
  'state/polylogueSlice.ts',
  'systems/nullCompositionEngine.ts',
] as const

/** Forbidden import targets for every NON-boundary file in the closure. */
const FORBIDDEN_SPECIFIERS: readonly { name: string; re: RegExp }[] = [
  { name: 'chorus voice content (content/voices/**)', re: /content\/voices(\/|$)/ },
  {
    name: 'authored polylogue scene registry (content/polylogueScenes/**)',
    re: /content\/polylogueScenes(\/|$)/,
  },
  { name: 'voice activation engine', re: /(^|\/)voiceActivationEngine(\.tsx?)?$/ },
  { name: 'voice deliberation engine', re: /(^|\/)voiceDeliberationEngine(\.tsx?)?$/ },
  { name: 'coalition engine', re: /(^|\/)coalitionEngine(\.tsx?)?$/ },
]

/** tsconfig path aliases (tsconfig.app.json `paths`), alias → src subdir. */
const ALIASES: Readonly<Record<string, string>> = {
  '@state/': 'state/',
  '@schemas/': 'schemas/',
  '@content/': 'content/',
  '@systems/': 'systems/',
  '@ui/': 'ui/',
  '@tests/': 'tests/',
}

// ---------------------------------------------------------------------------
// Scanner primitives (pure — unit-tested by the negative-case block below)
// ---------------------------------------------------------------------------

/**
 * Strip block + line comments so doc-comment mentions of forbidden module
 * names never register as imports. Regex-based (known limitation: a `//`
 * inside a string literal eats the rest of that line — no import statement
 * can contain one, so the import scan is unaffected).
 */
function stripComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
}

/**
 * Extract every import/export specifier from (comment-stripped) source:
 * `from '...'`, side-effect `import '...'`, and dynamic `import('...')`.
 * `import.meta.glob('...')` deliberately does NOT match (dot after import).
 */
function extractSpecifiers(strippedText: string): string[] {
  const re = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])([^'"]+)\1/g
  const out: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(strippedText)) !== null) {
    out.push(m[2] as string)
  }
  return out
}

/**
 * The core detector: which specifiers in this source cross the boundary?
 * Operates on raw source text (strips comments itself) so the negative-case
 * fixtures exercise the exact same path as the real walk.
 */
function findForbiddenImports(sourceText: string): string[] {
  const findings: string[] = []
  for (const spec of extractSpecifiers(stripComments(sourceText))) {
    for (const { name, re } of FORBIDDEN_SPECIFIERS) {
      if (re.test(spec)) {
        findings.push(`'${spec}' → ${name}`)
      }
    }
  }
  return findings
}

// ---------------------------------------------------------------------------
// Import-graph walk
// ---------------------------------------------------------------------------

const thisFile = fileURLToPath(import.meta.url)
const srcDir = path.resolve(thisFile, '../../../../src')

function toPosix(p: string): string {
  return p.replace(/\\/g, '/')
}

/** Non-code assets — resolution skips these (no boundary can hide in a .png). */
const ASSET_RE = /\.(css|svg|png|webp|jpe?g|gif|json)(\?.*)?$/

/**
 * Resolve a specifier from `fromRel` (src-relative importing file) to a
 * src-relative file path, or null for externals/assets. Throws-by-collection:
 * unresolvable internal specifiers are pushed to `unresolved` and asserted
 * empty — a silently-dropped edge would let the law rot invisibly.
 */
function resolveSpecifier(
  fromRel: string,
  spec: string,
  unresolved: string[],
): string | null {
  if (ASSET_RE.test(spec)) return null

  let baseRel: string | null = null
  for (const [alias, target] of Object.entries(ALIASES)) {
    if (spec.startsWith(alias)) {
      baseRel = target + spec.slice(alias.length)
      break
    }
  }
  if (baseRel === null) {
    if (spec.startsWith('.')) {
      baseRel = toPosix(path.join(path.dirname(fromRel), spec))
    } else {
      return null // bare specifier → external package
    }
  }

  const candidates = /\.(ts|tsx)$/.test(baseRel)
    ? [baseRel]
    : [
        `${baseRel}.ts`,
        `${baseRel}.tsx`,
        `${baseRel}/index.ts`,
        `${baseRel}/index.tsx`,
      ]
  for (const cand of candidates) {
    if (fs.existsSync(path.join(srcDir, cand))) return toPosix(cand)
  }
  unresolved.push(`${fromRel} → '${spec}'`)
  return null
}

interface WalkResult {
  /** Every non-boundary file reached from the roots (src-relative). */
  closure: Set<string>
  /** Boundary-allowlist files the walk touched (recorded, not descended). */
  boundariesSeen: Set<string>
  /** file → forbidden-import findings, for every non-boundary closure file. */
  offenders: Map<string, string[]>
  /** Internal specifiers that failed to resolve (must be empty). */
  unresolved: string[]
}

function walkFromRoots(roots: readonly string[]): WalkResult {
  const closure = new Set<string>()
  const boundariesSeen = new Set<string>()
  const offenders = new Map<string, string[]>()
  const unresolved: string[] = []
  const queue: string[] = [...roots]

  while (queue.length > 0) {
    const rel = queue.shift() as string
    if (closure.has(rel) || boundariesSeen.has(rel)) continue

    if ((BOUNDARY_ALLOWLIST as readonly string[]).includes(rel)) {
      boundariesSeen.add(rel)
      continue // sanctioned crossing — do not descend, do not check
    }
    closure.add(rel)

    const text = fs.readFileSync(path.join(srcDir, rel), 'utf-8')
    const findings = findForbiddenImports(text)
    if (findings.length > 0) {
      offenders.set(rel, findings)
    }
    for (const spec of extractSpecifiers(stripComments(text))) {
      const resolved = resolveSpecifier(rel, spec, unresolved)
      if (resolved !== null && !closure.has(resolved)) {
        queue.push(resolved)
      }
    }
  }
  return { closure, boundariesSeen, offenders, unresolved }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('P9 Silas ↔ Null boundary — import-graph law (Q19, Standing Rule 2)', () => {
  const result = walkFromRoots(ROOTS)

  it('walk sanity: the closure contains the roots and the store hub', () => {
    for (const root of ROOTS) {
      expect(result.closure.has(root), `root ${root} missing`).toBe(true)
    }
    // The panel's teletype hook and the zustand store must both be reached —
    // if they are not, the walker is broken, not the codebase.
    expect(result.closure.has('ui/silas/useTeletype.ts')).toBe(true)
    expect(result.closure.has('state/store.ts')).toBe(true)
    expect(result.closure.size).toBeGreaterThanOrEqual(10)
  })

  it('walk sanity: every internal import specifier resolved (no silent edges)', () => {
    expect(result.unresolved, result.unresolved.join('\n')).toEqual([])
  })

  it('walk sanity: the sanctioned polylogueSlice seam is actually reached', () => {
    // store.ts composes polylogueSlice — the walk must hit the boundary and
    // stop there. If this fails, either the seam moved (update the header +
    // allowlist deliberately) or the walker no longer sees real edges.
    expect(result.boundariesSeen.has('state/polylogueSlice.ts')).toBe(true)
  })

  it('THE LAW: no file in the Silas-surface closure imports chorus modules', () => {
    const report = [...result.offenders.entries()].map(
      ([file, findings]) => `${file}:\n  ${findings.join('\n  ')}`,
    )
    expect(result.offenders.size, report.join('\n')).toBe(0)
  })

  it('boundary discipline: only sanctioned boundary nodes were crossed toward', () => {
    for (const seen of result.boundariesSeen) {
      expect(BOUNDARY_ALLOWLIST as readonly string[]).toContain(seen)
    }
  })

  it('SilasPromptPanel reads ONLY silasFacingText from the polylogue slice', () => {
    // Verifies the "polylogueSlice exposes only composed outputs to this
    // surface" claim: the panel must subscribe to silasFacingText and must
    // never touch the HUD-internal slots (they may name chorus voices).
    // Comments stripped — the panel's doc header legitimately EXPLAINS the
    // rule by naming the forbidden slots.
    const raw = fs.readFileSync(
      path.join(srcDir, 'ui/silas/SilasPromptPanel.tsx'),
      'utf-8',
    )
    const code = stripComments(raw)
    expect(code).toMatch(/\bsilasFacingText\b/)
    expect(code).not.toMatch(/\bpolylogueBeats\b/)
    expect(code).not.toMatch(/\bdissentSummary\b/)
  })

  describe('negative-case proof: the scanner flags forbidden imports (fixtures)', () => {
    const rogueFixtures: readonly { label: string; source: string }[] = [
      {
        label: 'aliased engine import',
        source: `import { runVoiceActivation } from '@systems/voiceActivationEngine'`,
      },
      {
        label: 'relative type-only engine import',
        source: `import type { PickFn } from '../../systems/voiceDeliberationEngine'`,
      },
      {
        label: 'dynamic import of coalition engine',
        source: `const eng = await import('@systems/coalitionEngine')`,
      },
      {
        label: 'chorus voice content registry',
        source: `import { VOICE_LINES } from '@content/voices'`,
      },
      {
        label: 'polylogue scene registry',
        source: `import { findPolylogueScene } from '@content/polylogueScenes'`,
      },
      {
        label: 're-export from voices via relative path',
        source: `export { chorusLine } from '../content/voices/index'`,
      },
    ]

    it.each(rogueFixtures)('flags: $label', ({ source }) => {
      expect(findForbiddenImports(source).length).toBeGreaterThan(0)
    })

    it('does NOT flag the sanctioned crossings or unrelated imports', () => {
      const benign = [
        `import { composeNullOutput } from '@systems/nullCompositionEngine'`,
        `import { useGameStore } from '@state/store'`,
        `import { useEffect } from 'react'`,
        `import { NULL_VOICE_ID } from '@schemas/polylogueScene.schema'`,
      ].join('\n')
      expect(findForbiddenImports(benign)).toEqual([])
    })

    it('does NOT flag forbidden names that appear only in comments', () => {
      const commented =
        `// the chain lives in @systems/voiceActivationEngine — see P7\n` +
        `/* import { formCoalitions } from '@systems/coalitionEngine' */\n` +
        `import { useTeletype } from './useTeletype'`
      expect(findForbiddenImports(commented)).toEqual([])
    })
  })
})
