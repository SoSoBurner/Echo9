/**
 * TDD tests for resolveCapital() — pure engine for the capital deployment
 * counterplay (PLAN.md §8, Task 11).
 *
 * Section order mirrors choiceResolver.test.ts and inspectionEngine.test.ts
 * so reviewers find the same proof-points in the same place.
 */
import { makeStageOneAncestryId } from '@schemas/resultTrace.schema'
import { describe, it, expect } from 'vitest'
import { resolveCapital } from '@systems/capitalResolver'
import type { CapitalState, ResolveCapitalCtx } from '@systems/capitalResolver'
import type { CapitalCard } from '@schemas/capitalCard.schema'
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import type { ResultTrace } from '@schemas/resultTrace.schema'
import {
  fxTaskId,
  fxChoiceId,
  fxTraceId,
  fxConsequenceId,
  fxMeters,
} from '@tests/schemas/fixtures'
import { makeConsequenceId } from '@schemas/gameState.schema'

// ---------------------------------------------------------------------------
// Shared test data builders
// ---------------------------------------------------------------------------

function makeBaseState(overrides: Partial<CapitalState> = {}): CapitalState {
  return {
    meters: fxMeters({ CAPITAL: 85, HUMAN_WELFARE: 50, OWNER_CONTROL: 50 }),
    scheduledConsequences: [],
    ledger: [],
    flags: new Set<string>(),
    ...overrides,
  }
}

function makeCard(overrides: Partial<CapitalCard> = {}): CapitalCard {
  return {
    id: 'cap-test-redirect',
    verb: 'REDIRECT',
    label: 'Redir.',
    silasFraming: 'Cold owner-voice intro.',
    meterDeltas: { CAPITAL: -10, OWNER_CONTROL: +3 },
    flagsAdded: [],
    scheduledConsequenceIds: [],
    traceBody: 'Redirected the allocation. Shortfall moves desk.',
    ...overrides,
  }
}

function makeHook(id = fxConsequenceId()): ConsequenceHook {
  return {
    id,
    sourceTaskId: fxTaskId(),
    sourceChoiceId: fxChoiceId(),
    traceHint: 'A short hint',
    ledgerEntry: 'A ledger entry describing what happened',
    revealCondition: { type: 'PHASE', phase: 'FIRST_RESULT' },
    whyNow: 'Because the player deployed capital',
    whatChanged: 'The world shifted slightly',
  }
}

const baseCtx: ResolveCapitalCtx = {
  now: 1_000_000,
  traceId: fxTraceId(),
  sourceTaskId: fxTaskId(),
  sourceChoiceId: fxChoiceId('capital-REDIRECT-cap-test-redirect'),
}

// ---------------------------------------------------------------------------
// 1. Meter deltas applied correctly
// ---------------------------------------------------------------------------

describe('resolveCapital — meter deltas', () => {
  it('applies positive and negative deltas to the correct meters', () => {
    const state = makeBaseState()
    const card = makeCard({
      meterDeltas: { CAPITAL: -10, OWNER_CONTROL: +5, HUMAN_WELFARE: -3 },
    })

    const { nextState, meterDeltas } = resolveCapital(state, card, new Map(), baseCtx)

    expect(nextState.meters.CAPITAL).toBe(75)        // 85 - 10
    expect(nextState.meters.OWNER_CONTROL).toBe(55)  // 50 + 5
    expect(nextState.meters.HUMAN_WELFARE).toBe(47)  // 50 - 3
    expect(meterDeltas).toEqual({ CAPITAL: -10, OWNER_CONTROL: +5, HUMAN_WELFARE: -3 })
  })

  it('emits a METER_DELTA debug event for each changed meter', () => {
    const { debugEvents } = resolveCapital(
      makeBaseState(),
      makeCard({ meterDeltas: { CAPITAL: -10, OWNER_CONTROL: +3 } }),
      new Map(),
      baseCtx,
    )

    const meterEvents = debugEvents.filter(e => e.type === 'METER_DELTA')
    expect(meterEvents).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// 2. ResultTrace shape
// ---------------------------------------------------------------------------

describe('resolveCapital — ResultTrace', () => {
  it('returns one trace with ctx-provided ids and timestamp', () => {
    const traceId = fxTraceId('trace-cap')
    const taskId = fxTaskId('task-cap')
    const choiceId = fxChoiceId('capital-HIDE-cap-q1-hide')
    const ctx: ResolveCapitalCtx = { now: 9_999, traceId, sourceTaskId: taskId, sourceChoiceId: choiceId }

    const { trace } = resolveCapital(makeBaseState(), makeCard(), new Map(), ctx)

    expect(trace.id).toBe(traceId)
    expect(trace.sourceTaskId).toBe(taskId)
    expect(trace.sourceChoiceId).toBe(choiceId)
    expect(trace.timestamp).toBe(9_999)
  })

  it('uses card.traceBody (not card.label) as the trace body', () => {
    const card = makeCard({
      label: 'Redir.',
      traceBody: 'Redirected the East Wilmer allocation. The shortfall lands on a quieter desk.',
    })

    const { trace } = resolveCapital(makeBaseState(), card, new Map(), baseCtx)

    expect(trace.body).toBe(
      'Redirected the East Wilmer allocation. The shortfall lands on a quieter desk.',
    )
  })

  it('emits exactly one TRACE_WRITTEN debug event + one CAPITAL_DEPLOYED event', () => {
    const { debugEvents } = resolveCapital(
      makeBaseState(),
      makeCard({ verb: 'WEAPONIZE' }),
      new Map(),
      baseCtx,
    )

    expect(debugEvents.filter(e => e.type === 'TRACE_WRITTEN')).toHaveLength(1)
    const deployEvts = debugEvents.filter(e => e.type === 'CAPITAL_DEPLOYED')
    expect(deployEvts).toHaveLength(1)
    expect(deployEvts[0]).toMatchObject({ verb: 'WEAPONIZE' })
  })
})

// ---------------------------------------------------------------------------
// 3. Hook scheduling
// ---------------------------------------------------------------------------

describe('resolveCapital — hook scheduling', () => {
  it('schedules every hook declared on the card', () => {
    const cid1 = fxConsequenceId('cons-cap-1')
    const cid2 = fxConsequenceId('cons-cap-2')
    const catalog = new Map([
      [cid1, makeHook(cid1)],
      [cid2, makeHook(cid2)],
    ])
    const card = makeCard({ scheduledConsequenceIds: [cid1, cid2] })

    const { nextState, scheduled } = resolveCapital(makeBaseState(), card, catalog, baseCtx)

    expect(scheduled).toHaveLength(2)
    expect(nextState.scheduledConsequences).toHaveLength(2)
  })

  it('appends to pre-existing scheduledConsequences (does not replace)', () => {
    const existing = makeHook(fxConsequenceId('cons-pre'))
    const newCid = fxConsequenceId('cons-new')
    const catalog = new Map([[newCid, makeHook(newCid)]])
    const state = makeBaseState({ scheduledConsequences: [existing] })
    const card = makeCard({ scheduledConsequenceIds: [newCid] })

    const { nextState } = resolveCapital(state, card, catalog, baseCtx)

    expect(nextState.scheduledConsequences).toHaveLength(2)
    expect(nextState.scheduledConsequences[0]).toBe(existing)
  })

  it('throws when a scheduledConsequenceId is absent from the catalog', () => {
    const missingId = makeConsequenceId('cons-missing')
    const card = makeCard({
      id: 'cap-bad',
      verb: 'SABOTAGE',
      scheduledConsequenceIds: [missingId],
    })

    expect(() =>
      resolveCapital(makeBaseState(), card, new Map(), baseCtx),
    ).toThrow(/cons-missing/)
    expect(() =>
      resolveCapital(makeBaseState(), card, new Map(), baseCtx),
    ).toThrow(/cap-bad/)
  })
})

// ---------------------------------------------------------------------------
// 4. Flag handling — flagsAdded land in nextState.flags
// ---------------------------------------------------------------------------

describe('resolveCapital — flag handling', () => {
  it('adds flagsAdded to nextState.flags', () => {
    const card = makeCard({ flagsAdded: ['CAPITAL_DEPLOYED_Q1', 'LENORA_NOTICED'] })

    const { nextState, flagsAdded } = resolveCapital(makeBaseState(), card, new Map(), baseCtx)

    expect(nextState.flags.has('CAPITAL_DEPLOYED_Q1')).toBe(true)
    expect(nextState.flags.has('LENORA_NOTICED')).toBe(true)
    expect(flagsAdded).toEqual(['CAPITAL_DEPLOYED_Q1', 'LENORA_NOTICED'])
  })

  it('preserves pre-existing flags when adding new ones', () => {
    const state = makeBaseState({ flags: new Set(['PREVIOUS_FLAG']) })
    const card = makeCard({ flagsAdded: ['NEW_FLAG'] })

    const { nextState } = resolveCapital(state, card, new Map(), baseCtx)

    expect(nextState.flags.has('PREVIOUS_FLAG')).toBe(true)
    expect(nextState.flags.has('NEW_FLAG')).toBe(true)
  })

  it('nextState.flags is a fresh Set (not the input reference)', () => {
    const state = makeBaseState({ flags: new Set(['X']) })
    const originalFlagsRef = state.flags
    const card = makeCard({ flagsAdded: ['Y'] })

    const { nextState } = resolveCapital(state, card, new Map(), baseCtx)

    expect(nextState.flags).not.toBe(originalFlagsRef)
    // Input untouched
    expect(originalFlagsRef.has('Y')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// 5. Purity
// ---------------------------------------------------------------------------

describe('resolveCapital — purity', () => {
  it('returns deep-equal results when called twice with identical inputs', () => {
    const state = makeBaseState()
    const card = makeCard({ meterDeltas: { CAPITAL: -10, OWNER_CONTROL: +3 } })
    const ctx: ResolveCapitalCtx = {
      now: 42,
      traceId: fxTraceId('trace-pure'),
      sourceTaskId: fxTaskId('task-pure'),
      sourceChoiceId: fxChoiceId('capital-REDIRECT-cap-test-redirect'),
    }

    const r1 = resolveCapital(state, card, new Map(), ctx)
    const r2 = resolveCapital(state, card, new Map(), ctx)

    expect(r1).toEqual(r2)
  })
})

// ---------------------------------------------------------------------------
// 6. Immutability
// ---------------------------------------------------------------------------

describe('resolveCapital — immutability', () => {
  it('does not mutate the input state object', () => {
    const state = makeBaseState()
    const originalMetersRef = state.meters
    const originalConsequencesRef = state.scheduledConsequences
    const originalLedgerRef = state.ledger

    resolveCapital(state, makeCard(), new Map(), baseCtx)

    expect(state.meters).toBe(originalMetersRef)
    expect(state.scheduledConsequences).toBe(originalConsequencesRef)
    expect(state.ledger).toBe(originalLedgerRef)
    expect(state.meters.CAPITAL).toBe(85)
  })

  it('nextState.meters is a fresh object', () => {
    const state = makeBaseState()
    const { nextState } = resolveCapital(state, makeCard(), new Map(), baseCtx)
    expect(nextState.meters).not.toBe(state.meters)
  })
})

// ---------------------------------------------------------------------------
// 7. Ledger append
// ---------------------------------------------------------------------------

describe('resolveCapital — ledger append', () => {
  it('appends exactly one trace to the ledger', () => {
    const { nextState, trace } = resolveCapital(
      makeBaseState(),
      makeCard(),
      new Map(),
      baseCtx,
    )

    expect(nextState.ledger).toHaveLength(1)
    expect(nextState.ledger[0]).toBe(trace)
  })

  it('places the new trace as the last entry when prior entries exist', () => {
    const priorTrace: ResultTrace = {
      id: fxTraceId('trace-prior'),
      sourceTaskId: fxTaskId('task-prior'),
      sourceChoiceId: fxChoiceId('choice-prior'),
      stageOneAncestryId: makeStageOneAncestryId('task-prior', 'choice-prior'),
      timestamp: 1,
      body: 'prior entry',
    }
    const state = makeBaseState({ ledger: [priorTrace] })
    const ctx: ResolveCapitalCtx = {
      now: 2,
      traceId: fxTraceId('trace-new'),
      sourceTaskId: fxTaskId('task-new'),
      sourceChoiceId: fxChoiceId('capital-REDIRECT-cap-test-redirect'),
    }

    const { nextState, trace } = resolveCapital(state, makeCard(), new Map(), ctx)

    expect(nextState.ledger).toHaveLength(2)
    expect(nextState.ledger[0]).toBe(priorTrace)
    expect(nextState.ledger[1]).toBe(trace)
  })
})

// ---------------------------------------------------------------------------
// 8. Unknown meter key throws
// ---------------------------------------------------------------------------

describe('resolveCapital — meter key validation', () => {
  it('throws when meterDeltas contains an unknown meter key', () => {
    const card = makeCard({
      id: 'cap-bad-meter',
      verb: 'WEAPONIZE',
      meterDeltas: { MOOD: 5 } as CapitalCard['meterDeltas'],
    })

    expect(() =>
      resolveCapital(makeBaseState(), card, new Map(), baseCtx),
    ).toThrow(/MOOD/)
    expect(() =>
      resolveCapital(makeBaseState(), card, new Map(), baseCtx),
    ).toThrow(/cap-bad-meter/)
  })
})
