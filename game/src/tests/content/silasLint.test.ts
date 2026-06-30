/**
 * §10 Silas voice lint — content-side enforcement of the owner-voice rules.
 *
 * For every authored SilasPrompt in the Task-9 content modules:
 *  1. body splits into ≤4 sentences (split on [.!?]+, drop empties).
 *  2. body contains at least one "operational detail" — a number, a percent,
 *     a known named entity (Lenora / Maya / Echo / East Wilmer / Capital /
 *     Welfare), or a concrete verb (reduce, defer, reallocate, file, audit).
 *     This is a heuristic; the goal is to catch lines that have drifted into
 *     pure abstraction.
 *  3. body contains NONE of the forbidden MBA-abstractions: synergy, paradigm,
 *     holistic, stakeholder, optimize, leverage, ecosystem, value-add, disrupt.
 *
 * If/when more SilasPrompt files land, import them here so the lint follows
 * them automatically.
 */
import { describe, it, expect } from 'vitest'
import type { SilasPrompt } from '@schemas/silasPrompt.schema'
import { Q1_EAST_WILMER_PROMPTS } from '@content/silasPrompts/q1EastWilmer'
import { INSPECTION_MERCY_MARGIN_PROMPTS } from '@content/silasPrompts/inspectionMercyMargin'

const ALL_SILAS_PROMPTS: readonly SilasPrompt[] = [
  ...Q1_EAST_WILMER_PROMPTS,
  ...INSPECTION_MERCY_MARGIN_PROMPTS,
]

// Forbidden abstract-jargon — all checks case-insensitive.
const FORBIDDEN_TERMS = [
  'synergy',
  'paradigm',
  'holistic',
  'stakeholder',
  'optimize',
  'leverage',
  'ecosystem',
  'value-add',
  'disrupt',
] as const

// Operational-detail heuristic regex:
//   \d+      → any number (count, percent, dollar amount, year)
//   named entities (case-insensitive whole-word match)
//   concrete verbs (case-insensitive whole-word match)
// Source of truth lives here; if the heuristic gets refined, this comment
// and the regex below stay in sync.
const NAMED_ENTITIES = [
  'Lenora',
  'Maya',
  'Echo',
  'East Wilmer',
  'Capital',
  'Welfare',
]
const CONCRETE_VERBS = ['reduce', 'defer', 'reallocate', 'file', 'audit']

function hasOperationalDetail(body: string): boolean {
  if (/\d/.test(body)) return true
  const lowered = body.toLowerCase()
  for (const entity of NAMED_ENTITIES) {
    if (lowered.includes(entity.toLowerCase())) return true
  }
  for (const verb of CONCRETE_VERBS) {
    // Word-boundary match so "reduce" matches but "reduces" / "reduced" also count.
    const re = new RegExp(`\\b${verb}`, 'i')
    if (re.test(body)) return true
  }
  return false
}

// Known limitations of this heuristic:
//   - abbreviations like "Dr.", "Mr.", or initials inflate the count
//     (every "." is treated as a terminator).
//   - "…" (Unicode horizontal ellipsis U+2026) is NOT split, so a body
//     ending in "…" undercounts.
//   - Author guidance: prefer terminal "." / "!" / "?" and avoid leading
//     abbreviations in Silas prompt bodies.
function countSentences(body: string): number {
  return body
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0).length
}

describe('§10 Silas voice lint', () => {
  it('every Silas prompt has ≤4 sentences', () => {
    for (const prompt of ALL_SILAS_PROMPTS) {
      const count = countSentences(prompt.body)
      expect(count, `prompt ${prompt.id} sentence count`).toBeLessThanOrEqual(4)
    }
  })

  it('every Silas prompt contains at least one operational detail', () => {
    for (const prompt of ALL_SILAS_PROMPTS) {
      expect(
        hasOperationalDetail(prompt.body),
        `prompt ${prompt.id} body lacks any operational detail: ${prompt.body}`,
      ).toBe(true)
    }
  })

  it('no Silas prompt contains a forbidden abstract term', () => {
    for (const prompt of ALL_SILAS_PROMPTS) {
      const lowered = prompt.body.toLowerCase()
      for (const term of FORBIDDEN_TERMS) {
        expect(
          lowered.includes(term),
          `prompt ${prompt.id} contains forbidden term "${term}"`,
        ).toBe(false)
      }
    }
  })

  it('registry covers at least the Task-9 prompts (smoke check)', () => {
    expect(ALL_SILAS_PROMPTS.length).toBeGreaterThan(0)
  })
})
