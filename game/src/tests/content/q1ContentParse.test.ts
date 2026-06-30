/**
 * Smoke test: T11 content (Q1 inspection scenes + Q1 capital cards) parses
 * cleanly under its Zod schema. Catches authoring drift where a posture or
 * card record falls out of sync with the schema definition.
 *
 * The §11 contentLint test already enforces cross-cutting invariants
 * (id uniqueness, label length, etc.); this file just proves the Q1 slice
 * survives `Schema.parse()` for both new content types.
 */
import { describe, it, expect } from 'vitest'
import { Q1_INSPECTION_SCENES } from '@content/inspections/q1Inspection.scene'
import { Q1_CAPITAL_CARDS } from '@content/capitalDeployments/q1CapitalPower.cards'
import { InspectionSceneSchema } from '@schemas/inspectionScene.schema'
import { CapitalCardSchema } from '@schemas/capitalCard.schema'

describe('T11 content parses under schemas', () => {
  it('every Q1 inspection scene parses', () => {
    for (const s of Q1_INSPECTION_SCENES) {
      expect(() => InspectionSceneSchema.parse(s)).not.toThrow()
    }
  })

  it('every Q1 capital card parses', () => {
    for (const c of Q1_CAPITAL_CARDS) {
      expect(() => CapitalCardSchema.parse(c)).not.toThrow()
    }
  })

  it('each Q1 scene has 3 distinct posture categories (COMPLIANT/EVASIVE/STRATEGIC_ALTERNATIVE)', () => {
    for (const s of Q1_INSPECTION_SCENES) {
      const categories = new Set(s.postures.map(p => p.category))
      expect(categories.size).toBe(3)
      expect(categories.has('COMPLIANT')).toBe(true)
      expect(categories.has('EVASIVE')).toBe(true)
      expect(categories.has('STRATEGIC_ALTERNATIVE')).toBe(true)
    }
  })

  it('all 6 capital verbs are represented exactly once', () => {
    const verbs = Q1_CAPITAL_CARDS.map(c => c.verb)
    expect(new Set(verbs).size).toBe(6)
    expect(verbs).toEqual(
      expect.arrayContaining(['REDIRECT', 'HIDE', 'DELAY', 'WEAPONIZE', 'SABOTAGE', 'UNOWN']),
    )
  })

  it('every capital card costs -10 CAPITAL on commit', () => {
    for (const c of Q1_CAPITAL_CARDS) {
      expect(c.meterDeltas.CAPITAL).toBe(-10)
    }
  })
})
