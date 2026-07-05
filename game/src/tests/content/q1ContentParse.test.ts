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
import { Q1_SEQUENCE } from '@content/directiveSchedule'
import { mercyMarginTask } from '@content/tasks/q1/week1-mercy-margin.task'
import * as gameFlags from '@systems/gameFlags'

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

// ---------------------------------------------------------------------------
// Q1_SEQUENCE — Sprint C2 schedule shape.
//
// Guards the additive Q1 directive spine. Every C-track sprint appends one
// entry; these assertions catch schedule drift (duplicate weeks, off-registry
// flags, out-of-range week numbers) before content bugs reach the resolver.
// ---------------------------------------------------------------------------

describe('Q1_SEQUENCE — directive schedule shape', () => {
  it('contains at least Week 1 (Sprint C2 baseline)', () => {
    expect(Q1_SEQUENCE.length).toBeGreaterThanOrEqual(1)
    expect(Q1_SEQUENCE[0]?.week).toBe(1)
  })

  it('Week 1 references the canonical mercy-margin task', () => {
    const week1 = Q1_SEQUENCE.find((e) => e.week === 1)
    expect(week1?.task.id).toBe(mercyMarginTask.id)
    expect(week1?.slug).toBe('mercy-margin')
  })

  it('weeks are unique and monotonically increasing', () => {
    const weeks = Q1_SEQUENCE.map((e) => e.week)
    expect(new Set(weeks).size).toBe(weeks.length)
    for (let i = 1; i < weeks.length; i += 1) {
      expect(weeks[i]).toBeGreaterThan(weeks[i - 1]!)
    }
  })

  it('slugs are unique across the sequence', () => {
    const slugs = Q1_SEQUENCE.map((e) => e.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('every resolutionFlag is an exported constant from @systems/gameFlags', () => {
    const exportedFlagValues = new Set(
      Object.values(gameFlags).filter(
        (v): v is string => typeof v === 'string',
      ),
    )
    for (const entry of Q1_SEQUENCE) {
      expect(
        exportedFlagValues.has(entry.resolutionFlag),
        `week ${entry.week} resolutionFlag "${entry.resolutionFlag}" ` +
          `must be exported from @systems/gameFlags`,
      ).toBe(true)
    }
  })

  it('no week is scheduled past Q1 close (weeks 1–12 only)', () => {
    for (const entry of Q1_SEQUENCE) {
      expect(entry.week).toBeGreaterThanOrEqual(1)
      expect(entry.week).toBeLessThanOrEqual(12)
    }
  })
})
