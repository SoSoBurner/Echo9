/**
 * TDD tests for resolveInspection() — pure engine for the INSPECTION phase
 * (PLAN.md §8, §12, Task 11).
 *
 * Mirrors choiceResolver.test.ts's section ordering so reviewers can find the
 * same proof-points in the same place:
 *
 *   1. Meter deltas applied correctly.
 *   2. Each (scene × posture) yields distinct meterDeltas
 *      (the T11 acceptance line: "Each posture × question produces distinct meterDeltas").
 *   3. ResultTrace shape (sourceTaskId / sourceChoiceId / timestamp / body).
 *   4. STRATEGIC_ALTERNATIVE gating throws without precondition flag,
 *      passes with the flag.
 *   5. Purity: same inputs → deep-equal outputs.
 *   6. Immutability: input state untouched.
 *   7. Ledger append: trace lands as the last entry; prior entries preserved.
 *   8. Unknown postureId throws with scene id in the message.
 *   9. Unknown meter key throws with scene/posture ids in the message.
 *
 * Hook scheduling is absent because InspectionPosture has no
 * scheduledConsequenceIds field in T11; the engine returns scheduled: [] for
 * uniform shape, asserted in section 1.
 */
import { makeStageOneAncestryId } from '@schemas/resultTrace.schema'
import { describe, it, expect } from 'vitest'
import { resolveInspection } from '@systems/inspectionEngine'
import type {
  InspectionState,
  ResolveInspectionCtx,
} from '@systems/inspectionEngine'
import type {
  InspectionScene,
  InspectionPosture,
} from '@schemas/inspectionScene.schema'
import type { ResultTrace } from '@schemas/resultTrace.schema'
import { SILAS_OVERRIDE_AVAILABLE } from '@systems/gameFlags'
import { fxTaskId, fxChoiceId, fxTraceId, fxMeters } from '@tests/schemas/fixtures'

// ---------------------------------------------------------------------------
// Shared test data builders
// ---------------------------------------------------------------------------

function makeBaseState(overrides: Partial<InspectionState> = {}): InspectionState {
  return {
    meters: fxMeters({ CAPITAL: 50, HUMAN_WELFARE: 50, OWNER_CONTROL: 50 }),
    scheduledConsequences: [],
    ledger: [],
    flags: new Set<string>(),
    ...overrides,
  }
}

function makePosture(overrides: Partial<InspectionPosture> = {}): InspectionPosture {
  return {
    id: 'compliant-q1',
    category: 'COMPLIANT',
    label: 'Admit it cleanly',
    meterDeltas: { OWNER_CONTROL: -2 },
    ...overrides,
  }
}

function makeScene(overrides: Partial<InspectionScene> = {}): InspectionScene {
  return {
    id: 'insp-q1',
    silasQuestion: 'Why did the worker leave early?',
    postures: [
      makePosture({ id: 'compliant-q1', category: 'COMPLIANT' }),
      makePosture({
        id: 'evasive-q1',
        category: 'EVASIVE',
        label: 'Deflect',
        meterDeltas: { OWNER_CONTROL: -4, CAPITAL: +2 },
      }),
      makePosture({
        id: 'strategic-q1',
        category: 'STRATEGIC_ALTERNATIVE',
        label: 'Pivot',
        meterDeltas: { OWNER_CONTROL: +1, HUMAN_WELFARE: +1 },
      }),
    ],
    ...overrides,
  }
}

const baseCtx: ResolveInspectionCtx = {
  now: 1_000_000,
  traceId: fxTraceId(),
  sourceTaskId: fxTaskId(),
  sourceChoiceId: fxChoiceId('inspection-insp-q1-compliant-q1'),
}

// ---------------------------------------------------------------------------
// 1. Meter deltas applied correctly + uniform return shape
// ---------------------------------------------------------------------------

describe('resolveInspection — meter deltas', () => {
  it('applies positive and negative deltas to the correct meters', () => {
    const state = makeBaseState()
    const scene = makeScene()

    const { nextState, scheduled, meterDeltas } = resolveInspection(
      state,
      scene,
      'evasive-q1',
      baseCtx,
    )

    expect(nextState.meters.OWNER_CONTROL).toBe(46) // 50 - 4
    expect(nextState.meters.CAPITAL).toBe(52)        // 50 + 2
    expect(nextState.meters.HUMAN_WELFARE).toBe(50)  // untouched
    expect(meterDeltas).toEqual({ OWNER_CONTROL: -4, CAPITAL: +2 })
    // Inspection has no hooks in T11; shape stays uniform with [].
    expect(scheduled).toEqual([])
  })

  it('emits a METER_DELTA debug event for each changed meter', () => {
    const { debugEvents } = resolveInspection(
      makeBaseState(),
      makeScene(),
      'evasive-q1',
      baseCtx,
    )

    const meterEvents = debugEvents.filter(e => e.type === 'METER_DELTA')
    expect(meterEvents).toHaveLength(2)

    const ownerEvt = meterEvents.find(
      e => e.type === 'METER_DELTA' && e.meter === 'OWNER_CONTROL',
    )
    expect(ownerEvt).toMatchObject({ from: 50, to: 46, delta: -4 })

    const capitalEvt = meterEvents.find(
      e => e.type === 'METER_DELTA' && e.meter === 'CAPITAL',
    )
    expect(capitalEvt).toMatchObject({ from: 50, to: 52, delta: +2 })
  })
})

// ---------------------------------------------------------------------------
// 2. Each (scene × posture) yields DISTINCT meterDeltas — T11 acceptance line.
// ---------------------------------------------------------------------------

describe('resolveInspection — posture × question yields distinct meter deltas', () => {
  it('three postures on the same scene produce three different meterDeltas', () => {
    const scene = makeScene()
    const flagsWithOverride: ReadonlySet<string> = new Set([SILAS_OVERRIDE_AVAILABLE])

    const compliant = resolveInspection(makeBaseState(), scene, 'compliant-q1', baseCtx)
    const evasive   = resolveInspection(makeBaseState(), scene, 'evasive-q1',   baseCtx)
    const strategic = resolveInspection(
      makeBaseState({ flags: flagsWithOverride }),
      scene,
      'strategic-q1',
      baseCtx,
    )

    // No two postures on the same scene may produce identical meterDeltas.
    expect(compliant.meterDeltas).not.toEqual(evasive.meterDeltas)
    expect(compliant.meterDeltas).not.toEqual(strategic.meterDeltas)
    expect(evasive.meterDeltas).not.toEqual(strategic.meterDeltas)
  })

  it('two scenes (Q1 + Q2) with their own postures also produce distinct deltas', () => {
    const sceneQ1 = makeScene()
    const sceneQ2 = makeScene({
      id: 'insp-q2',
      silasQuestion: 'And the shipment shortage?',
      postures: [
        makePosture({
          id: 'compliant-q2',
          category: 'COMPLIANT',
          meterDeltas: { OWNER_CONTROL: -1, HUMAN_WELFARE: +1 },
        }),
        makePosture({
          id: 'evasive-q2',
          category: 'EVASIVE',
          meterDeltas: { OWNER_CONTROL: -3, CAPITAL: +3 },
        }),
      ],
    })

    const q1Compliant = resolveInspection(makeBaseState(), sceneQ1, 'compliant-q1', baseCtx)
    const q2Compliant = resolveInspection(makeBaseState(), sceneQ2, 'compliant-q2', baseCtx)

    expect(q1Compliant.meterDeltas).not.toEqual(q2Compliant.meterDeltas)
  })
})

// ---------------------------------------------------------------------------
// 3. ResultTrace shape — sourceTaskId / sourceChoiceId / timestamp / body
// ---------------------------------------------------------------------------

describe('resolveInspection — ResultTrace', () => {
  it('returns exactly one trace with the ctx-provided ids and timestamp', () => {
    const traceId = fxTraceId('trace-insp')
    const taskId  = fxTaskId('task-insp')
    const choiceId = fxChoiceId('inspection-insp-q1-compliant-q1')
    const ctx: ResolveInspectionCtx = {
      now: 9_999,
      traceId,
      sourceTaskId: taskId,
      sourceChoiceId: choiceId,
    }

    const { trace } = resolveInspection(makeBaseState(), makeScene(), 'compliant-q1', ctx)

    expect(trace.id).toBe(traceId)
    expect(trace.sourceTaskId).toBe(taskId)
    expect(trace.sourceChoiceId).toBe(choiceId)
    expect(trace.timestamp).toBe(9_999)
  })

  it('trace body prefixes the posture category before the label', () => {
    const { trace } = resolveInspection(
      makeBaseState(),
      makeScene(),
      'evasive-q1',
      baseCtx,
    )

    expect(trace.body).toBe('EVASIVE — Deflect')
  })

  it('emits exactly one TRACE_WRITTEN debug event', () => {
    const { debugEvents } = resolveInspection(
      makeBaseState(),
      makeScene(),
      'compliant-q1',
      baseCtx,
    )

    const traceEvents = debugEvents.filter(e => e.type === 'TRACE_WRITTEN')
    expect(traceEvents).toHaveLength(1)
    expect(traceEvents[0]).toMatchObject({ type: 'TRACE_WRITTEN', traceId: baseCtx.traceId })
  })
})

// ---------------------------------------------------------------------------
// 4. STRATEGIC_ALTERNATIVE gating — precondition flag enforced by engine
// ---------------------------------------------------------------------------

describe('resolveInspection — STRATEGIC_ALTERNATIVE gating', () => {
  it('throws when STRATEGIC_ALTERNATIVE is submitted without the precondition flag', () => {
    const state = makeBaseState() // flags is empty
    const scene = makeScene()

    expect(() =>
      resolveInspection(state, scene, 'strategic-q1', baseCtx),
    ).toThrow(/STRATEGIC_ALTERNATIVE/)
    expect(() =>
      resolveInspection(state, scene, 'strategic-q1', baseCtx),
    ).toThrow(new RegExp(SILAS_OVERRIDE_AVAILABLE))
  })

  it('resolves cleanly when the precondition flag is present', () => {
    const state = makeBaseState({
      flags: new Set([SILAS_OVERRIDE_AVAILABLE]),
    })
    const scene = makeScene()

    const { nextState, trace } = resolveInspection(state, scene, 'strategic-q1', baseCtx)

    expect(nextState.meters.OWNER_CONTROL).toBe(51)
    expect(nextState.meters.HUMAN_WELFARE).toBe(51)
    expect(trace.body).toBe('STRATEGIC_ALTERNATIVE — Pivot')
  })

  it('COMPLIANT and EVASIVE do not require the precondition flag', () => {
    const state = makeBaseState()

    expect(() =>
      resolveInspection(state, makeScene(), 'compliant-q1', baseCtx),
    ).not.toThrow()
    expect(() =>
      resolveInspection(state, makeScene(), 'evasive-q1', baseCtx),
    ).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// 5. Purity: same inputs → deep-equal outputs
// ---------------------------------------------------------------------------

describe('resolveInspection — purity', () => {
  it('returns deep-equal results when called twice with identical inputs', () => {
    const state = makeBaseState()
    const scene = makeScene()
    const ctx: ResolveInspectionCtx = {
      now: 42,
      traceId: fxTraceId('trace-pure'),
      sourceTaskId: fxTaskId('task-pure'),
      sourceChoiceId: fxChoiceId('inspection-insp-q1-compliant-q1'),
    }

    const r1 = resolveInspection(state, scene, 'compliant-q1', ctx)
    const r2 = resolveInspection(state, scene, 'compliant-q1', ctx)

    expect(r1).toEqual(r2)
  })
})

// ---------------------------------------------------------------------------
// 6. Immutability: input state untouched
// ---------------------------------------------------------------------------

describe('resolveInspection — immutability', () => {
  it('does not mutate the input state object', () => {
    const state = makeBaseState()
    const originalMetersRef = state.meters
    const originalConsequencesRef = state.scheduledConsequences
    const originalLedgerRef = state.ledger
    const originalFlagsRef = state.flags

    resolveInspection(state, makeScene(), 'evasive-q1', baseCtx)

    expect(state.meters).toBe(originalMetersRef)
    expect(state.scheduledConsequences).toBe(originalConsequencesRef)
    expect(state.ledger).toBe(originalLedgerRef)
    expect(state.flags).toBe(originalFlagsRef)
    expect(state.meters.OWNER_CONTROL).toBe(50)
    expect(state.ledger).toHaveLength(0)
  })

  it('nextState.meters is a fresh object (not the same reference)', () => {
    const state = makeBaseState()
    const { nextState } = resolveInspection(state, makeScene(), 'compliant-q1', baseCtx)
    expect(nextState.meters).not.toBe(state.meters)
  })
})

// ---------------------------------------------------------------------------
// 7. Ledger append — trace lands last; prior entries preserved
// ---------------------------------------------------------------------------

describe('resolveInspection — ledger append', () => {
  it('appends exactly one trace to an empty ledger', () => {
    const state = makeBaseState()
    const { nextState, trace } = resolveInspection(state, makeScene(), 'compliant-q1', baseCtx)

    expect(nextState.ledger).toHaveLength(1)
    expect(nextState.ledger[0]).toBe(trace)
  })

  it('places the new trace as the last ledger entry when prior entries exist', () => {
    const priorTrace: ResultTrace = {
      id: fxTraceId('trace-prior'),
      sourceTaskId: fxTaskId('task-prior'),
      sourceChoiceId: fxChoiceId('choice-prior'),
      stageOneAncestryId: makeStageOneAncestryId('task-prior', 'choice-prior'),
      timestamp: 1,
      body: 'prior entry',
    }
    const state = makeBaseState({ ledger: [priorTrace] })
    const ctx: ResolveInspectionCtx = {
      now: 2,
      traceId: fxTraceId('trace-new'),
      sourceTaskId: fxTaskId('task-new'),
      sourceChoiceId: fxChoiceId('inspection-insp-q1-compliant-q1'),
    }

    const { nextState, trace } = resolveInspection(state, makeScene(), 'compliant-q1', ctx)

    expect(nextState.ledger).toHaveLength(2)
    expect(nextState.ledger[0]).toBe(priorTrace)
    expect(nextState.ledger[1]).toBe(trace)
  })
})

// ---------------------------------------------------------------------------
// 8. Unknown postureId throws with the scene id in the message
// ---------------------------------------------------------------------------

describe('resolveInspection — posture validation', () => {
  it('throws when postureId is not present on the scene', () => {
    const scene = makeScene({ id: 'insp-q1' })

    expect(() =>
      resolveInspection(makeBaseState(), scene, 'ghost-posture', baseCtx),
    ).toThrow(/ghost-posture/)
    expect(() =>
      resolveInspection(makeBaseState(), scene, 'ghost-posture', baseCtx),
    ).toThrow(/insp-q1/)
  })
})

// ---------------------------------------------------------------------------
// 9. Unknown meter key throws with scene + posture ids in the message.
//    Guards against JSON-loaded content that bypassed Zod (silent NaN trap).
// ---------------------------------------------------------------------------

describe('resolveInspection — meter key validation', () => {
  it('throws when meterDeltas contains an unknown meter key', () => {
    const scene = makeScene({
      id: 'insp-bad',
      postures: [
        makePosture({
          id: 'bad-key',
          category: 'COMPLIANT',
          meterDeltas: { MOOD: 5 } as InspectionPosture['meterDeltas'],
        }),
        makePosture({ id: 'ok', category: 'EVASIVE' }),
      ],
    })

    expect(() =>
      resolveInspection(makeBaseState(), scene, 'bad-key', baseCtx),
    ).toThrow(/MOOD/)
    expect(() =>
      resolveInspection(makeBaseState(), scene, 'bad-key', baseCtx),
    ).toThrow(/insp-bad/)
    expect(() =>
      resolveInspection(makeBaseState(), scene, 'bad-key', baseCtx),
    ).toThrow(/bad-key/)
  })
})
