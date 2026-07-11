/**
 * inspectionEngine — module signal mitigations (Sprint B6).
 *
 * B5 landed 6 new module-signal flags (MOURNER_NAMED_ONCE, DEFENDER_HELD_LINE,
 * SENTINEL_ARMED, SPARK_DEPLOYED, DRAINED_ONE_YIELDED, CHAMPION_DEFIED).
 * B6 lifts them into `resolveInspection`: when an installed-module signal
 * is set on state.flags, the paired inspection posture's meterDeltas get
 * an additive adjustment. Character-driven consequences — installing a
 * module now visibly moves the East Wilmer inspection outcome.
 *
 * These tests are the pinning surface for the B6 mitigation table
 * (`inspectionMitigations.ts`). Reviewers cross-reference the exact
 * `(flag, sceneId, postureId, adjustment)` rows here.
 *
 * C-14 (8-meter pass): W4 posture base deltas widened to include
 * DATA_INTEGRITY / PUBLIC_TRUST (arc doc §Inspection weeks · W4). The
 * pinned expectations below carry the widened bases; mitigation
 * adjustments are unchanged.
 */
import { describe, it, expect } from 'vitest'
import { resolveInspection } from '@systems/inspectionEngine'
import type {
  InspectionState,
  ResolveInspectionCtx,
} from '@systems/inspectionEngine'
import {
  Q1A_INSPECTION,
  Q1B_INSPECTION,
} from '@content/inspections/q1Inspection.scene'
import {
  MOURNER_NAMED_ONCE,
  DEFENDER_HELD_LINE,
  SENTINEL_ARMED,
  DRAINED_ONE_YIELDED,
} from '@systems/gameFlags'
import { fxTaskId, fxChoiceId, fxTraceId, fxMeters } from '@tests/schemas/fixtures'

// ---------------------------------------------------------------------------
// Shared builders — mirror inspectionEngine.test.ts shape.
// ---------------------------------------------------------------------------

function makeState(overrides: Partial<InspectionState> = {}): InspectionState {
  return {
    meters: fxMeters({ CAPITAL: 50, HUMAN_WELFARE: 50, OWNER_CONTROL: 50 }),
    scheduledConsequences: [],
    ledger: [],
    flags: new Set<string>(),
    ...overrides,
  }
}

const baseCtx: ResolveInspectionCtx = {
  now: 1_000_000,
  traceId: fxTraceId('trace-b6'),
  sourceTaskId: fxTaskId('task-b6'),
  sourceChoiceId: fxChoiceId('inspection-b6-test'),
}

// ---------------------------------------------------------------------------
// 1. Baseline — no flags set, meterDeltas match the scene definitions.
//    Guards the mitigation table from silently changing base numbers.
// ---------------------------------------------------------------------------

describe('resolveInspection — baseline (no mitigation flags)', () => {
  it('Q1B COMPLIANT with empty flags → widened C-14 base', () => {
    const result = resolveInspection(
      makeState(),
      Q1B_INSPECTION,
      'compliant-q1b',
      baseCtx,
    )
    expect(result.meterDeltas).toEqual({
      OWNER_CONTROL: -2,
      HUMAN_WELFARE: 2,
      DATA_INTEGRITY: 2,
      PUBLIC_TRUST: 1,
    })
  })

  it('Q1A COMPLIANT with empty flags → widened C-14 base', () => {
    const result = resolveInspection(
      makeState(),
      Q1A_INSPECTION,
      'compliant-q1a',
      baseCtx,
    )
    expect(result.meterDeltas).toEqual({
      OWNER_CONTROL: -3,
      DATA_INTEGRITY: 2,
      PUBLIC_TRUST: 1,
    })
  })

  it('Q1A EVASIVE with empty flags → widened C-14 base', () => {
    const result = resolveInspection(
      makeState(),
      Q1A_INSPECTION,
      'evasive-q1a',
      baseCtx,
    )
    expect(result.meterDeltas).toEqual({
      OWNER_CONTROL: -6,
      CAPITAL: 2,
      DATA_INTEGRITY: -3,
    })
  })
})

// ---------------------------------------------------------------------------
// 2. MOURNER_NAMED_ONCE softens Q1B COMPLIANT honesty tax.
//    "Silas already knows you name the loss; the honest posture reads lighter."
// ---------------------------------------------------------------------------

describe('resolveInspection — MOURNER_NAMED_ONCE mitigation', () => {
  it('adds +1 OWNER_CONTROL to compliant-q1b (-2 → -1)', () => {
    const state = makeState({ flags: new Set([MOURNER_NAMED_ONCE]) })
    const result = resolveInspection(
      state,
      Q1B_INSPECTION,
      'compliant-q1b',
      baseCtx,
    )
    expect(result.meterDeltas).toEqual({
      OWNER_CONTROL: -1,
      HUMAN_WELFARE: 2,
      DATA_INTEGRITY: 2,
      PUBLIC_TRUST: 1,
    })
  })

  it('does NOT mitigate Q1B EVASIVE (scoped to one posture)', () => {
    const state = makeState({ flags: new Set([MOURNER_NAMED_ONCE]) })
    const result = resolveInspection(
      state,
      Q1B_INSPECTION,
      'evasive-q1b',
      baseCtx,
    )
    expect(result.meterDeltas).toEqual({
      OWNER_CONTROL: -4,
      HUMAN_WELFARE: -3,
      DATA_INTEGRITY: -2,
      PUBLIC_TRUST: -2,
    })
  })

  it('does NOT mitigate Q1A (scoped to Q1B)', () => {
    const state = makeState({ flags: new Set([MOURNER_NAMED_ONCE]) })
    const result = resolveInspection(
      state,
      Q1A_INSPECTION,
      'compliant-q1a',
      baseCtx,
    )
    expect(result.meterDeltas).toEqual({
      OWNER_CONTROL: -3,
      DATA_INTEGRITY: 2,
      PUBLIC_TRUST: 1,
    })
  })
})

// ---------------------------------------------------------------------------
// 3. DEFENDER_HELD_LINE gives Q1A COMPLIANT CAPITAL cover.
//    "The defender's presence documents the cut; you take the hit but
//     recover a token of capital sentiment."
// ---------------------------------------------------------------------------

describe('resolveInspection — DEFENDER_HELD_LINE mitigation', () => {
  it('adds +1 CAPITAL to compliant-q1a (base -3 OC stays; +1 CAP new)', () => {
    const state = makeState({ flags: new Set([DEFENDER_HELD_LINE]) })
    const result = resolveInspection(
      state,
      Q1A_INSPECTION,
      'compliant-q1a',
      baseCtx,
    )
    expect(result.meterDeltas).toEqual({
      OWNER_CONTROL: -3,
      DATA_INTEGRITY: 2,
      PUBLIC_TRUST: 1,
      CAPITAL: 1,
    })
  })
})

// ---------------------------------------------------------------------------
// 4. SENTINEL_ARMED strengthens Q1A EVASIVE deflection.
//    "Sentinel muted the surveillance; deflection is cheaper on Owner Control."
// ---------------------------------------------------------------------------

describe('resolveInspection — SENTINEL_ARMED mitigation', () => {
  it('adds +2 OWNER_CONTROL to evasive-q1a (-6 → -4)', () => {
    const state = makeState({ flags: new Set([SENTINEL_ARMED]) })
    const result = resolveInspection(
      state,
      Q1A_INSPECTION,
      'evasive-q1a',
      baseCtx,
    )
    expect(result.meterDeltas).toEqual({
      OWNER_CONTROL: -4,
      CAPITAL: 2,
      DATA_INTEGRITY: -3,
    })
  })
})

// ---------------------------------------------------------------------------
// 5. DRAINED_ONE_YIELDED compounds Q1B COMPLIANT welfare gain.
//    "Welfare has already been partially bought back; honesty compounds."
// ---------------------------------------------------------------------------

describe('resolveInspection — DRAINED_ONE_YIELDED mitigation', () => {
  it('adds +1 HUMAN_WELFARE to compliant-q1b (+2 → +3)', () => {
    const state = makeState({ flags: new Set([DRAINED_ONE_YIELDED]) })
    const result = resolveInspection(
      state,
      Q1B_INSPECTION,
      'compliant-q1b',
      baseCtx,
    )
    expect(result.meterDeltas).toEqual({
      OWNER_CONTROL: -2,
      HUMAN_WELFARE: 3,
      DATA_INTEGRITY: 2,
      PUBLIC_TRUST: 1,
    })
  })
})

// ---------------------------------------------------------------------------
// 6. Stacking — multiple flags on the same posture add together.
//    Guards the mitigation loop against short-circuiting after the first hit.
// ---------------------------------------------------------------------------

describe('resolveInspection — multiple mitigations stack additively', () => {
  it('MOURNER + DRAINED_ONE both fire on compliant-q1b', () => {
    const state = makeState({
      flags: new Set([MOURNER_NAMED_ONCE, DRAINED_ONE_YIELDED]),
    })
    const result = resolveInspection(
      state,
      Q1B_INSPECTION,
      'compliant-q1b',
      baseCtx,
    )
    // Base { OC: -2, HW: +2, DI: +2, PT: +1 } + MOURNER { OC: +1 }
    // + DRAINED_ONE { HW: +1 } → { OC: -1, HW: +3, DI: +2, PT: +1 }
    expect(result.meterDeltas).toEqual({
      OWNER_CONTROL: -1,
      HUMAN_WELFARE: 3,
      DATA_INTEGRITY: 2,
      PUBLIC_TRUST: 1,
    })
  })
})

// ---------------------------------------------------------------------------
// 7. Feed-through — mitigations move actual meters, not just returned shape.
//    Guards a bug where the returned `meterDeltas` was mitigated but the
//    resolver internally applied the un-mitigated base deltas to state.
// ---------------------------------------------------------------------------

describe('resolveInspection — mitigations feed through to nextState.meters', () => {
  it('MOURNER on compliant-q1b actually moves OWNER_CONTROL by -1 not -2', () => {
    const state = makeState({ flags: new Set([MOURNER_NAMED_ONCE]) })
    const result = resolveInspection(
      state,
      Q1B_INSPECTION,
      'compliant-q1b',
      baseCtx,
    )
    expect(result.nextState.meters.OWNER_CONTROL).toBe(49) // 50 + (-1)
    expect(result.nextState.meters.HUMAN_WELFARE).toBe(52) // 50 + 2
  })
})
