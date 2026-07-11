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
import { Q1_PAYROLL_INSPECTION_SCENES } from '@content/inspections/q1Payroll.scene'
import { Q1_ETHICS_INSPECTION_SCENES } from '@content/inspections/q1Ethics.scene'
import { INSPECTION_MITIGATIONS } from '@content/inspections/inspectionMitigations'
import { Q1_CAPITAL_CARDS } from '@content/capitalDeployments/q1CapitalPower.cards'
import { InspectionSceneSchema } from '@schemas/inspectionScene.schema'
import { CapitalCardSchema } from '@schemas/capitalCard.schema'
import { Q1_SEQUENCE } from '@content/directiveSchedule'
import { mercyMarginTask } from '@content/tasks/q1/week1-mercy-margin.task'
import * as gameFlags from '@systems/gameFlags'

// C14: all Q1 inspection scene sets — Week 4 (East Wilmer, T11-authored),
// Week 8 (payroll audit, C14-authored), Week 12 (ethics hearing, C14-authored).
// Each set follows the same 3-posture / 3-category shape.
const ALL_Q1_INSPECTION_SCENES = [
  ...Q1_INSPECTION_SCENES,
  ...Q1_PAYROLL_INSPECTION_SCENES,
  ...Q1_ETHICS_INSPECTION_SCENES,
]

describe('T11 content parses under schemas', () => {
  it('every Q1 inspection scene parses', () => {
    for (const s of ALL_Q1_INSPECTION_SCENES) {
      expect(() => InspectionSceneSchema.parse(s)).not.toThrow()
    }
  })

  it('every Q1 capital card parses', () => {
    for (const c of Q1_CAPITAL_CARDS) {
      expect(() => CapitalCardSchema.parse(c)).not.toThrow()
    }
  })

  it('each Q1 scene has 3 distinct posture categories (COMPLIANT/EVASIVE/STRATEGIC_ALTERNATIVE)', () => {
    for (const s of ALL_Q1_INSPECTION_SCENES) {
      const categories = new Set(s.postures.map(p => p.category))
      expect(categories.size).toBe(3)
      expect(categories.has('COMPLIANT')).toBe(true)
      expect(categories.has('EVASIVE')).toBe(true)
      expect(categories.has('STRATEGIC_ALTERNATIVE')).toBe(true)
    }
  })

  it('scene ids are unique across all Q1 inspection sets', () => {
    const ids = ALL_Q1_INSPECTION_SCENES.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
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

  // -------------------------------------------------------------------------
  // C-14 (8-meter pass) — arc doc §Inspection weeks invariants.
  // -------------------------------------------------------------------------

  it('every inspection posture moves ≥2 of the 8 meters (Q34)', () => {
    for (const s of ALL_Q1_INSPECTION_SCENES) {
      for (const p of s.postures) {
        const moved = Object.values(p.meterDeltas).filter(
          (d) => d !== undefined && d !== 0,
        )
        expect(
          moved.length,
          `scene ${s.id} posture ${p.id} must move ≥2 meters`,
        ).toBeGreaterThanOrEqual(2)
      }
    }
  })

  it('W8 payroll postures stay inside ±[1,3] (posture beat, arc §W8)', () => {
    for (const s of Q1_PAYROLL_INSPECTION_SCENES) {
      for (const p of s.postures) {
        for (const [key, d] of Object.entries(p.meterDeltas)) {
          if (d === undefined) continue
          expect(
            Math.abs(d),
            `scene ${s.id} posture ${p.id} meter ${key}`,
          ).toBeGreaterThanOrEqual(1)
          expect(
            Math.abs(d),
            `scene ${s.id} posture ${p.id} meter ${key}`,
          ).toBeLessThanOrEqual(3)
        }
      }
    }
  })

  it('W12 ethics postures stay inside ±[1,5] (aggregation beat, arc §W12)', () => {
    for (const s of Q1_ETHICS_INSPECTION_SCENES) {
      for (const p of s.postures) {
        for (const [key, d] of Object.entries(p.meterDeltas)) {
          if (d === undefined) continue
          expect(
            Math.abs(d),
            `scene ${s.id} posture ${p.id} meter ${key}`,
          ).toBeGreaterThanOrEqual(1)
          expect(
            Math.abs(d),
            `scene ${s.id} posture ${p.id} meter ${key}`,
          ).toBeLessThanOrEqual(5)
        }
      }
    }
  })

  it('W12 ethics set reads all 8 meters across its postures (arc §W12)', () => {
    const touched = new Set<string>()
    for (const s of Q1_ETHICS_INSPECTION_SCENES) {
      for (const p of s.postures) {
        for (const [key, d] of Object.entries(p.meterDeltas)) {
          if (d !== undefined && d !== 0) touched.add(key)
        }
      }
    }
    expect([...touched].sort()).toEqual(
      [
        'AUTONOMY',
        'CAPITAL',
        'DATA_INTEGRITY',
        'HUMAN_STABILITY',
        'HUMAN_WELFARE',
        'OWNER_CONTROL',
        'PUBLIC_TRUST',
        'TARGET_VARIANCE',
      ].sort(),
    )
  })

  it('W12 mitigation rows read all 6 module-signal flags (arc §W12 module reads)', () => {
    const w12SceneIds = new Set(
      Q1_ETHICS_INSPECTION_SCENES.map((s) => s.id),
    )
    const w12Flags = new Set(
      INSPECTION_MITIGATIONS.filter((m) => w12SceneIds.has(m.sceneId)).map(
        (m) => m.flag,
      ),
    )
    expect(w12Flags.size).toBe(6)
  })

  it('every mitigation row targets a real (sceneId, postureId) pair', () => {
    for (const m of INSPECTION_MITIGATIONS) {
      const scene = ALL_Q1_INSPECTION_SCENES.find((s) => s.id === m.sceneId)
      expect(scene, `mitigation flag ${m.flag} sceneId ${m.sceneId}`).toBeDefined()
      expect(
        scene?.postures.some((p) => p.id === m.postureId),
        `mitigation flag ${m.flag} postureId ${m.postureId} in ${m.sceneId}`,
      ).toBe(true)
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
    const exportedFlagValues = new Set<string>(
      Object.values(gameFlags).filter(
        (v): v is (typeof gameFlags)[keyof typeof gameFlags] =>
          typeof v === 'string',
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

  // C15: Layout renders whichever week the derivation selects. Every entry
  // must carry the runtime-consumed narrative fields (silasPrompt / nullText /
  // humanMessage) so no week can render blank.
  it('every entry carries a well-formed silasPrompt', () => {
    for (const entry of Q1_SEQUENCE) {
      expect(entry.silasPrompt, `week ${entry.week} silasPrompt`).toBeDefined()
      expect(typeof entry.silasPrompt.id).toBe('string')
      expect(entry.silasPrompt.id.length).toBeGreaterThan(0)
      expect(typeof entry.silasPrompt.body).toBe('string')
      expect(entry.silasPrompt.body.length).toBeGreaterThan(0)
    }
  })

  it('every entry carries a non-empty nullText', () => {
    for (const entry of Q1_SEQUENCE) {
      expect(typeof entry.nullText, `week ${entry.week} nullText`).toBe(
        'string',
      )
      expect(entry.nullText.length).toBeGreaterThan(0)
    }
  })

  it('every entry carries a well-formed humanMessage', () => {
    for (const entry of Q1_SEQUENCE) {
      expect(entry.humanMessage, `week ${entry.week} humanMessage`).toBeDefined()
      expect(typeof entry.humanMessage.speaker).toBe('string')
      expect(entry.humanMessage.speaker.length).toBeGreaterThan(0)
      expect(typeof entry.humanMessage.body).toBe('string')
      expect(entry.humanMessage.body.length).toBeGreaterThan(0)
    }
  })

  it('Q1_SEQUENCE covers all 12 weeks (C15 spine complete)', () => {
    expect(Q1_SEQUENCE.length).toBe(12)
    const weeks = Q1_SEQUENCE.map((e) => e.week).sort((a, b) => a - b)
    expect(weeks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  })
})
