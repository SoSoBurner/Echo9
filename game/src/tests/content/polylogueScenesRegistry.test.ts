/**
 * Polylogue scene registry tests (Sprint P5).
 *
 * Extends the P2 schema tests (`src/tests/schemas/polylogueScene.schema.test.ts`)
 * with the P5 content invariants over the three seed scenes:
 *   1. every registered scene parses under the strict schema,
 *   2. Stage-1 roster plausibility (qa-log Q9): beats come only from
 *      installedModules-plausible voices + NULL — install #1 is the MOURNER
 *      (W1→W2 boundary) and module #2 does not arrive until Week 12, so every
 *      Q1 W1/W4/W8 roster is a subset of {NULL, MOURNER},
 *   3. every beat's voice is declared in its scene's roster,
 *   4. P5 assembly contract: every beat line exists verbatim in the speaking
 *      voice's register pool (`game/src/content/voices/`),
 *   5. line rubric: ≤12 words per line,
 *   6. Q16 Option-3 linkage: the three Q1 week tasks point at registered
 *      scenes and the ids resolve through `findPolylogueScene`.
 */
import { describe, it, expect } from 'vitest'
import { PolylogueSceneSchema, type VoiceId } from '@schemas/polylogueScene.schema'
import { ALL_POLYLOGUE_SCENES, findPolylogueScene } from '@content/polylogueScenes'
import { voiceLines } from '@content/voices'
import { mercyMarginTask } from '@content/tasks/q1/week1-mercy-margin.task'
import { eastWilmerAuditPreBriefTask } from '@content/tasks/q1/week4-east-wilmer-audit-pre-brief.task'
import { payrollAuditInspectionTask } from '@content/tasks/q1/week8-payroll-audit-inspection.task'

/** Stage-1 plausible chorus for Q1 weeks 1–11 (Q9): Null + install #1. */
const STAGE1_PLAUSIBLE_VOICES: ReadonlySet<VoiceId> = new Set(['NULL', 'MOURNER'])

const EXPECTED_SCENE_IDS = [
  'PLG_W01_MERCY_MARGIN',
  'PLG_W04_EAST_WILMER_AUDIT_PRE_BRIEF',
  'PLG_W08_PAYROLL_AUDIT_INSPECTION',
] as const

describe('polylogue scene registry (P5 seed content)', () => {
  it('registers exactly the three seed scenes', () => {
    expect(ALL_POLYLOGUE_SCENES.map((s) => s.id)).toEqual(EXPECTED_SCENE_IDS)
  })

  it('every registered scene parses under strict schema compliance', () => {
    for (const scene of ALL_POLYLOGUE_SCENES) {
      expect(() => PolylogueSceneSchema.parse(scene)).not.toThrow()
    }
  })

  it('rosters respect Stage-1 plausibility (Q9: NULL + MOURNER only)', () => {
    for (const scene of ALL_POLYLOGUE_SCENES) {
      for (const voice of scene.voices) {
        expect(
          STAGE1_PLAUSIBLE_VOICES.has(voice),
          `${scene.id} roster voice ${voice} is not Stage-1 plausible`,
        ).toBe(true)
      }
    }
  })

  it('every beat speaks through a voice declared in its scene roster', () => {
    for (const scene of ALL_POLYLOGUE_SCENES) {
      for (const beat of scene.beats) {
        expect(
          scene.voices,
          `${scene.id} beat by ${beat.voice} is off-roster`,
        ).toContain(beat.voice)
      }
    }
  })

  it('every beat line exists verbatim in its voice register pool (P5 assembly)', () => {
    for (const scene of ALL_POLYLOGUE_SCENES) {
      for (const beat of scene.beats) {
        const pool = voiceLines(beat.voice, beat.register)
        expect(
          pool,
          `${scene.id}: "${beat.line}" not found in ${beat.voice}/${beat.register} pool`,
        ).toContain(beat.line)
      }
    }
  })

  it('every beat line respects the ≤12-word rubric', () => {
    for (const scene of ALL_POLYLOGUE_SCENES) {
      for (const beat of scene.beats) {
        const wordCount = beat.line.trim().split(/\s+/).length
        expect(
          wordCount,
          `${scene.id}: "${beat.line}" is ${wordCount} words (max 12)`,
        ).toBeLessThanOrEqual(12)
      }
    }
  })

  it('beat counts stay in the authored 3–6 band', () => {
    for (const scene of ALL_POLYLOGUE_SCENES) {
      expect(scene.beats.length).toBeGreaterThanOrEqual(3)
      expect(scene.beats.length).toBeLessThanOrEqual(6)
    }
  })

  it('W1/W4 fire BEFORE_CHOICE; W8 fires ON_CONSEQUENCE', () => {
    expect(findPolylogueScene('PLG_W01_MERCY_MARGIN')?.triggerPhase).toBe('BEFORE_CHOICE')
    expect(findPolylogueScene('PLG_W04_EAST_WILMER_AUDIT_PRE_BRIEF')?.triggerPhase).toBe(
      'BEFORE_CHOICE',
    )
    expect(findPolylogueScene('PLG_W08_PAYROLL_AUDIT_INSPECTION')?.triggerPhase).toBe(
      'ON_CONSEQUENCE',
    )
  })
})

describe('Q1 week task linkage (Q16 Option 3, wired in P5)', () => {
  const wiring = [
    { task: mercyMarginTask, sceneId: 'PLG_W01_MERCY_MARGIN' },
    { task: eastWilmerAuditPreBriefTask, sceneId: 'PLG_W04_EAST_WILMER_AUDIT_PRE_BRIEF' },
    { task: payrollAuditInspectionTask, sceneId: 'PLG_W08_PAYROLL_AUDIT_INSPECTION' },
  ] as const

  it.each(wiring)('$task.id links $sceneId and it resolves', ({ task, sceneId }) => {
    expect(task.polylogueSceneId).toBe(sceneId)
    const scene = findPolylogueScene(task.polylogueSceneId as string)
    expect(scene).toBeDefined()
    expect(scene?.id).toBe(sceneId)
  })

  it('unknown scene ids resolve to undefined (loose linkage preserved)', () => {
    expect(findPolylogueScene('PLG_DOES_NOT_EXIST')).toBeUndefined()
  })
})
