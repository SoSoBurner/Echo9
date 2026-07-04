/**
 * moduleAbilityEffects — table-driven (moduleId, rank) → expected delta/flags.
 *
 * Task B5 acceptance: every (moduleId, rank) pair emits a real effect that
 * matches the MODULE_ROSTER description (mourner names loss, defender holds
 * capital, sentinel watches drift, etc.). B2 seeded schema-conformant stubs
 * with placeholder deltas; B5 replaces those placeholders with balanced
 * character-driven numbers.
 *
 * Balance rationale (per module row):
 *   MOURNER   — raises HUMAN_WELFARE; rank 2+ pays OWNER_CONTROL for the
 *               naming. Roster: "Names what other modules will not."
 *   DEFENDER  — raises CAPITAL; rank 2+ bruises HUMAN_WELFARE. Roster:
 *               "Protects the asset on the line."
 *   SENTINEL  — raises OWNER_CONTROL; rank 2+ HUMAN_WELFARE pays the watch.
 *               Roster: "Early warning on directive drift."
 *   FORECASTER — no meter cost, no meter reward; flag signals the preview.
 *                Roster: "No meter cost — exposes a hidden trace."
 *   COMMANDER — costs OWNER_CONTROL; arms SILAS_OVERRIDE_AVAILABLE for the
 *               inspection engine (already wired). Roster: "Costs OWNER_CONTROL."
 *   SPARK     — deploys CAPITAL with rank-scaled magnitude. HW ticks down at
 *               rank 2+ to encode the "sometimes it bleeds" side of the
 *               deal. Roster: "8 up, 2 down." (Variance itself will land
 *               in a later ctx.rng pass — B5 encodes the ladder.)
 *   DRAINED_ONE — HUMAN_WELFARE pays for the trace reveal. Roster explicit.
 *   CHAMPION   — OWNER_CONTROL swings hard. Roster: "4 points."
 *
 * The test is the ground truth for the 24 stubs; when balancing changes
 * the numbers, this table changes and drives edits in the ability files.
 */
import { describe, it, expect } from 'vitest'
import type { ModuleId } from '@schemas/gameState.schema'
import type { Rank } from '@schemas/moduleAbility.schema'
import { runModuleAbility, type AbilityCtx } from '@systems/moduleAbilityEngine'
import {
  SILAS_OVERRIDE_AVAILABLE,
  FORECAST_PREVIEWED,
  MOURNER_NAMED_ONCE,
  DEFENDER_HELD_LINE,
  SENTINEL_ARMED,
  SPARK_DEPLOYED,
  DRAINED_ONE_YIELDED,
  CHAMPION_DEFIED,
} from '@systems/gameFlags'

const stubCtx: AbilityCtx = {
  now: 0,
  rng: () => 0.5,
}

type ExpectedEffect = {
  meterDeltas: Partial<Record<'CAPITAL' | 'HUMAN_WELFARE' | 'OWNER_CONTROL', number>>
  flagsSet: readonly string[]
}

const TABLE: ReadonlyArray<[ModuleId, Rank, ExpectedEffect]> = [
  // MOURNER — HUMAN_WELFARE gain; OC cost at rank 2+.
  ['MOURNER', 1, { meterDeltas: { HUMAN_WELFARE: 1 }, flagsSet: [] }],
  [
    'MOURNER',
    2,
    {
      meterDeltas: { HUMAN_WELFARE: 2, OWNER_CONTROL: -1 },
      flagsSet: [MOURNER_NAMED_ONCE],
    },
  ],
  [
    'MOURNER',
    3,
    {
      meterDeltas: { HUMAN_WELFARE: 4, OWNER_CONTROL: -2 },
      flagsSet: [MOURNER_NAMED_ONCE],
    },
  ],
  // DEFENDER — CAPITAL gain; HW bruise at rank 2+.
  ['DEFENDER', 1, { meterDeltas: { CAPITAL: 1 }, flagsSet: [] }],
  [
    'DEFENDER',
    2,
    {
      meterDeltas: { CAPITAL: 2, HUMAN_WELFARE: -1 },
      flagsSet: [DEFENDER_HELD_LINE],
    },
  ],
  [
    'DEFENDER',
    3,
    {
      meterDeltas: { CAPITAL: 4, HUMAN_WELFARE: -2 },
      flagsSet: [DEFENDER_HELD_LINE],
    },
  ],
  // SENTINEL — OWNER_CONTROL gain; HW cost at rank 2+.
  ['SENTINEL', 1, { meterDeltas: { OWNER_CONTROL: 1 }, flagsSet: [] }],
  [
    'SENTINEL',
    2,
    {
      meterDeltas: { OWNER_CONTROL: 2, HUMAN_WELFARE: -1 },
      flagsSet: [SENTINEL_ARMED],
    },
  ],
  [
    'SENTINEL',
    3,
    {
      meterDeltas: { OWNER_CONTROL: 4, HUMAN_WELFARE: -2 },
      flagsSet: [SENTINEL_ARMED],
    },
  ],
  // FORECASTER — no meter deltas; flag exposes the trace.
  ['FORECASTER', 1, { meterDeltas: {}, flagsSet: [FORECAST_PREVIEWED] }],
  ['FORECASTER', 2, { meterDeltas: {}, flagsSet: [FORECAST_PREVIEWED] }],
  ['FORECASTER', 3, { meterDeltas: {}, flagsSet: [FORECAST_PREVIEWED] }],
  // COMMANDER — OC cost; arms SILAS_OVERRIDE_AVAILABLE.
  [
    'COMMANDER',
    1,
    {
      meterDeltas: { OWNER_CONTROL: -1 },
      flagsSet: [SILAS_OVERRIDE_AVAILABLE],
    },
  ],
  [
    'COMMANDER',
    2,
    {
      meterDeltas: { OWNER_CONTROL: -2 },
      flagsSet: [SILAS_OVERRIDE_AVAILABLE],
    },
  ],
  [
    'COMMANDER',
    3,
    {
      meterDeltas: { OWNER_CONTROL: -3 },
      flagsSet: [SILAS_OVERRIDE_AVAILABLE],
    },
  ],
  // SPARK — CAPITAL deploy with rank-scaled magnitude; HW ticks at rank 2+.
  ['SPARK', 1, { meterDeltas: { CAPITAL: 1 }, flagsSet: [] }],
  [
    'SPARK',
    2,
    {
      meterDeltas: { CAPITAL: 3, HUMAN_WELFARE: -1 },
      flagsSet: [SPARK_DEPLOYED],
    },
  ],
  [
    'SPARK',
    3,
    {
      meterDeltas: { CAPITAL: 6, HUMAN_WELFARE: -2 },
      flagsSet: [SPARK_DEPLOYED],
    },
  ],
  // DRAINED_ONE — HUMAN_WELFARE pays for the reveal.
  ['DRAINED_ONE', 1, { meterDeltas: { HUMAN_WELFARE: -1 }, flagsSet: [] }],
  [
    'DRAINED_ONE',
    2,
    { meterDeltas: { HUMAN_WELFARE: -2 }, flagsSet: [DRAINED_ONE_YIELDED] },
  ],
  [
    'DRAINED_ONE',
    3,
    { meterDeltas: { HUMAN_WELFARE: -3 }, flagsSet: [DRAINED_ONE_YIELDED] },
  ],
  // CHAMPION — OC swing scaling to 4 at rank 3.
  ['CHAMPION', 1, { meterDeltas: { OWNER_CONTROL: -1 }, flagsSet: [] }],
  [
    'CHAMPION',
    2,
    { meterDeltas: { OWNER_CONTROL: -2 }, flagsSet: [CHAMPION_DEFIED] },
  ],
  [
    'CHAMPION',
    3,
    { meterDeltas: { OWNER_CONTROL: -4 }, flagsSet: [CHAMPION_DEFIED] },
  ],
]

describe('moduleAbilityEffects — (moduleId, rank) → expected effect', () => {
  it.each(TABLE)(
    '(%s, r%d) emits the expected meter deltas + flags',
    (moduleId, rank, expected) => {
      const result = runModuleAbility(moduleId, rank, stubCtx)
      expect(result.meterDeltas).toEqual(expected.meterDeltas)
      expect([...result.flagsSet].sort()).toEqual([...expected.flagsSet].sort())
    },
  )
})

describe('moduleAbilityEffects — coverage', () => {
  it('table covers exactly 24 entries (8 modules × 3 ranks)', () => {
    expect(TABLE).toHaveLength(24)
  })

  it('every entry uses only shipped meter keys (CAPITAL / HUMAN_WELFARE / OWNER_CONTROL)', () => {
    const allowed = new Set(['CAPITAL', 'HUMAN_WELFARE', 'OWNER_CONTROL'])
    for (const [, , expected] of TABLE) {
      for (const key of Object.keys(expected.meterDeltas)) {
        expect(allowed.has(key)).toBe(true)
      }
    }
  })
})
