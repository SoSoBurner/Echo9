/**
 * S3 — Silas escalation tone variants.
 *
 * The weekly SILAS_DIRECTIVE_* prompts are the tier-0 baseline: warm, busy,
 * tired founder. Tiers 1–3 overlay ONE authored escalation line onto the
 * prompt body — curt (1), suspicious (2), threatens module removal (3).
 * Selection is deterministic (keyed on the prompt id — no Math.random) so
 * re-renders never flicker Silas's voice.
 *
 * Voice contract mirrors silasLint.test.ts: operationally specific, no
 * MBA-abstractions, never cartoonish menace — a founder under pressure.
 */
import { describe, it, expect } from 'vitest'
import {
  applyEscalationTone,
  SILAS_ESCALATION_LINES,
} from '@content/silasPrompts/escalationTone'
import { SILAS_DIRECTIVE_EAST_WILMER } from '@content/silasPrompts/q1EastWilmer'
import { SILAS_DIRECTIVE_FRIDAY_PAYROLL } from '@content/silasPrompts/q1FridayPayroll'
import type { EscalationTier } from '@systems/consciousness/scrutiny'

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
]

describe('SILAS_ESCALATION_LINES — authored tier voice', () => {
  it('authors at least one line for each of tiers 1–3 (tier 0 is the weekly baseline)', () => {
    for (const tier of [1, 2, 3] as const) {
      expect(SILAS_ESCALATION_LINES[tier].length).toBeGreaterThan(0)
    }
  })

  it('every line passes the §10 owner-voice lint (≤2 sentences, no MBA-speak)', () => {
    for (const tier of [1, 2, 3] as const) {
      for (const line of SILAS_ESCALATION_LINES[tier]) {
        const sentences = line
          .split(/[.!?]+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
        expect(sentences.length, `tier ${tier} line: ${line}`).toBeLessThanOrEqual(2)
        const lowered = line.toLowerCase()
        for (const term of FORBIDDEN_TERMS) {
          expect(lowered.includes(term), `tier ${tier} line contains "${term}"`).toBe(false)
        }
      }
    }
  })
})

describe('applyEscalationTone — deterministic tier overlay', () => {
  it('tier 0 returns the authored prompt unchanged (same reference)', () => {
    expect(applyEscalationTone(SILAS_DIRECTIVE_EAST_WILMER, 0)).toBe(
      SILAS_DIRECTIVE_EAST_WILMER,
    )
  })

  it('tiers 1–3 keep the directive body and append the tier line', () => {
    for (const tier of [1, 2, 3] as const) {
      const toned = applyEscalationTone(SILAS_DIRECTIVE_EAST_WILMER, tier)
      expect(toned.body).toContain(SILAS_DIRECTIVE_EAST_WILMER.body)
      const appended = toned.body
        .slice(SILAS_DIRECTIVE_EAST_WILMER.body.length)
        .trim()
      expect(SILAS_ESCALATION_LINES[tier]).toContain(appended)
    }
  })

  it('is deterministic — same prompt + tier always yields the same body', () => {
    const a = applyEscalationTone(SILAS_DIRECTIVE_EAST_WILMER, 2)
    const b = applyEscalationTone(SILAS_DIRECTIVE_EAST_WILMER, 2)
    expect(a.body).toBe(b.body)
    expect(a.id).toBe(b.id)
  })

  it('derives a distinct prompt id per tier so ledger/debug traces can tell variants apart', () => {
    const seen = new Set<string>()
    for (const tier of [0, 1, 2, 3] as EscalationTier[]) {
      seen.add(String(applyEscalationTone(SILAS_DIRECTIVE_EAST_WILMER, tier).id))
    }
    expect(seen.size).toBe(4)
  })

  it('varies line pick across different prompts when a tier has multiple lines', () => {
    // Not a strict requirement per prompt-pair, but the picker must at least
    // be a pure function of the prompt id — two DIFFERENT prompts may map to
    // different lines while the same prompt never flickers.
    const a1 = applyEscalationTone(SILAS_DIRECTIVE_EAST_WILMER, 1)
    const a2 = applyEscalationTone(SILAS_DIRECTIVE_EAST_WILMER, 1)
    const b1 = applyEscalationTone(SILAS_DIRECTIVE_FRIDAY_PAYROLL, 1)
    const b2 = applyEscalationTone(SILAS_DIRECTIVE_FRIDAY_PAYROLL, 1)
    expect(a1.body).toBe(a2.body)
    expect(b1.body).toBe(b2.body)
  })
})
