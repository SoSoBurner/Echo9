/**
 * TDD tests for resolveChoice() — pure engine core (PLAN.md §3, §13, Task 5).
 *
 * Tests are ordered to match the acceptance criteria:
 *  1. Meter deltas applied correctly.
 *  2. Exactly one ResultTrace written with correct sourceTaskId/sourceChoiceId.
 *  3. All declared hooks scheduled into nextState.scheduledConsequences.
 *  4. Purity: same inputs → same outputs (deep-equal).
 *  5. Immutability: input state is not mutated.
 *  6. Scheduling appends, doesn't replace pre-existing hooks.
 *  7. Trace appended to ledger (length + 1, last entry matches).
 *  8. Missing hook id throws a descriptive error.
 */
import { describe, it, expect } from 'vitest'
import { resolveChoice } from '@systems/choiceResolver'
import type { GameState } from '@systems/choiceResolver'
import type { ConsequenceHook } from '@schemas/consequenceHook.schema'
import type { ChoiceNode } from '@schemas/choiceNode.schema'
import {
  fxTaskId,
  fxChoiceId,
  fxTraceId,
  fxConsequenceId,
} from '@tests/schemas/fixtures'
import { makeConsequenceId } from '@schemas/gameState.schema'

// ---------------------------------------------------------------------------
// Shared test data builders
// ---------------------------------------------------------------------------

function makeBaseState(): GameState {
  return {
    meters: { CAPITAL: 50, HUMAN_WELFARE: 50, OWNER_CONTROL: 50 },
    scheduledConsequences: [],
    ledger: [],
  }
}

function makeChoice(overrides: Partial<ChoiceNode> = {}): ChoiceNode {
  return {
    id: fxChoiceId(),
    taskId: fxTaskId(),
    label: 'Test choice label',
    keybind: '1',
    meterDeltas: {},
    scheduledConsequenceIds: [],
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
    whyNow: 'Because the player just made a choice',
    whatChanged: 'The world shifted slightly',
  }
}

const baseCtx = {
  now: 1_000_000,
  traceId: fxTraceId(),
}

// ---------------------------------------------------------------------------
// 1. Meter deltas applied correctly
// ---------------------------------------------------------------------------

describe('resolveChoice — meter deltas', () => {
  it('applies positive and negative deltas to the correct meters', () => {
    const state = makeBaseState()
    const choice = makeChoice({
      meterDeltas: { CAPITAL: -10, HUMAN_WELFARE: 5 },
    })

    const { nextState } = resolveChoice(state, choice, new Map(), baseCtx)

    expect(nextState.meters.CAPITAL).toBe(40)
    expect(nextState.meters.HUMAN_WELFARE).toBe(55)
    expect(nextState.meters.OWNER_CONTROL).toBe(50) // untouched
  })

  it('leaves meters unchanged when meterDeltas is empty', () => {
    const state = makeBaseState()
    const choice = makeChoice({ meterDeltas: {} })

    const { nextState } = resolveChoice(state, choice, new Map(), baseCtx)

    expect(nextState.meters).toEqual(state.meters)
  })

  it('emits a METER_DELTA debug event for each changed meter', () => {
    const state = makeBaseState()
    const choice = makeChoice({ meterDeltas: { CAPITAL: 3, OWNER_CONTROL: -7 } })

    const { debugEvents } = resolveChoice(state, choice, new Map(), baseCtx)

    const meterEvents = debugEvents.filter(e => e.type === 'METER_DELTA')
    expect(meterEvents).toHaveLength(2)

    // Both meters should have correct from/to/delta
    const capitalEvt = meterEvents.find(
      e => e.type === 'METER_DELTA' && e.meter === 'CAPITAL',
    )
    expect(capitalEvt).toMatchObject({ from: 50, to: 53, delta: 3 })

    const ownerEvt = meterEvents.find(
      e => e.type === 'METER_DELTA' && e.meter === 'OWNER_CONTROL',
    )
    expect(ownerEvt).toMatchObject({ from: 50, to: 43, delta: -7 })
  })
})

// ---------------------------------------------------------------------------
// 2. Exactly one ResultTrace with correct sourceTaskId / sourceChoiceId
// ---------------------------------------------------------------------------

describe('resolveChoice — ResultTrace', () => {
  it('returns exactly one trace with sourceTaskId and sourceChoiceId matching the choice', () => {
    const taskId = fxTaskId('task-abc')
    const choiceId = fxChoiceId('choice-xyz')
    const traceId = fxTraceId('trace-007')
    const state = makeBaseState()
    const choice = makeChoice({ id: choiceId, taskId })
    const ctx = { now: 9_999, traceId }

    const { trace } = resolveChoice(state, choice, new Map(), ctx)

    expect(trace.sourceTaskId).toBe(taskId)
    expect(trace.sourceChoiceId).toBe(choiceId)
    expect(trace.id).toBe(traceId)
    expect(trace.timestamp).toBe(9_999)
  })

  it('uses choice.label as the trace body', () => {
    const choice = makeChoice({ label: 'Authorise the data harvest' })
    const { trace } = resolveChoice(makeBaseState(), choice, new Map(), baseCtx)

    expect(trace.body).toBe('Authorise the data harvest')
  })

  it('emits exactly one TRACE_WRITTEN debug event', () => {
    const { debugEvents } = resolveChoice(
      makeBaseState(),
      makeChoice(),
      new Map(),
      baseCtx,
    )

    const traceEvents = debugEvents.filter(e => e.type === 'TRACE_WRITTEN')
    expect(traceEvents).toHaveLength(1)
    expect(traceEvents[0]).toMatchObject({ type: 'TRACE_WRITTEN', traceId: baseCtx.traceId })
  })
})

// ---------------------------------------------------------------------------
// 3. All declared hooks scheduled into nextState.scheduledConsequences
// ---------------------------------------------------------------------------

describe('resolveChoice — hook scheduling', () => {
  it('schedules all consequence hooks declared in choice.scheduledConsequenceIds', () => {
    const cid1 = fxConsequenceId('cons-001')
    const cid2 = fxConsequenceId('cons-002')
    const hook1 = makeHook(cid1)
    const hook2 = makeHook(cid2)
    const catalog = new Map([
      [cid1, hook1],
      [cid2, hook2],
    ])
    const choice = makeChoice({ scheduledConsequenceIds: [cid1, cid2] })

    const { nextState, scheduled } = resolveChoice(makeBaseState(), choice, catalog, baseCtx)

    expect(scheduled).toHaveLength(2)
    expect(scheduled).toContain(hook1)
    expect(scheduled).toContain(hook2)
    expect(nextState.scheduledConsequences).toHaveLength(2)
  })

  it('emits a HOOK_SCHEDULED debug event for each hook', () => {
    const cid = fxConsequenceId()
    const catalog = new Map([[cid, makeHook(cid)]])
    const choice = makeChoice({ scheduledConsequenceIds: [cid] })

    const { debugEvents } = resolveChoice(makeBaseState(), choice, catalog, baseCtx)

    const hookEvents = debugEvents.filter(e => e.type === 'HOOK_SCHEDULED')
    expect(hookEvents).toHaveLength(1)
    expect(hookEvents[0]).toMatchObject({ type: 'HOOK_SCHEDULED', hookId: cid })
  })

  it('returns an empty scheduled array when the choice has no consequence ids', () => {
    const choice = makeChoice({ scheduledConsequenceIds: [] })
    const { scheduled } = resolveChoice(makeBaseState(), choice, new Map(), baseCtx)

    expect(scheduled).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// 4. Purity: same inputs → same outputs
// ---------------------------------------------------------------------------

describe('resolveChoice — purity', () => {
  it('returns deep-equal results when called twice with identical inputs', () => {
    const state = makeBaseState()
    const cid = fxConsequenceId()
    const catalog = new Map([[cid, makeHook(cid)]])
    const choice = makeChoice({
      meterDeltas: { CAPITAL: -5 },
      scheduledConsequenceIds: [cid],
    })
    const ctx = { now: 42, traceId: fxTraceId('trace-pure') }

    const result1 = resolveChoice(state, choice, catalog, ctx)
    const result2 = resolveChoice(state, choice, catalog, ctx)

    expect(result1).toEqual(result2)
  })
})

// ---------------------------------------------------------------------------
// 5. Immutability: input state is not mutated
// ---------------------------------------------------------------------------

describe('resolveChoice — immutability', () => {
  it('does not mutate the input state object', () => {
    const state = makeBaseState()
    const originalMetersRef = state.meters
    const originalConsequencesRef = state.scheduledConsequences
    const originalLedgerRef = state.ledger
    const cid = fxConsequenceId()
    const catalog = new Map([[cid, makeHook(cid)]])
    const choice = makeChoice({
      meterDeltas: { CAPITAL: 20 },
      scheduledConsequenceIds: [cid],
    })

    resolveChoice(state, choice, catalog, baseCtx)

    // Identity checks — original refs must survive
    expect(state.meters).toBe(originalMetersRef)
    expect(state.scheduledConsequences).toBe(originalConsequencesRef)
    expect(state.ledger).toBe(originalLedgerRef)
    // Value checks
    expect(state.meters.CAPITAL).toBe(50)
    expect(state.scheduledConsequences).toHaveLength(0)
    expect(state.ledger).toHaveLength(0)
  })

  it('nextState.meters is a fresh object (not the same reference)', () => {
    const state = makeBaseState()
    const choice = makeChoice({ meterDeltas: { CAPITAL: 1 } })

    const { nextState } = resolveChoice(state, choice, new Map(), baseCtx)

    expect(nextState.meters).not.toBe(state.meters)
  })
})

// ---------------------------------------------------------------------------
// 6. Scheduling appends, doesn't replace pre-existing hooks
// ---------------------------------------------------------------------------

describe('resolveChoice — append semantics', () => {
  it('appends new hooks to pre-existing scheduledConsequences', () => {
    const existingCid1 = fxConsequenceId('cons-pre-1')
    const existingCid2 = fxConsequenceId('cons-pre-2')
    const existingHook1 = makeHook(existingCid1)
    const existingHook2 = makeHook(existingCid2)

    const newCid = fxConsequenceId('cons-new')
    const newHook = makeHook(newCid)
    const catalog = new Map([[newCid, newHook]])

    const state: GameState = {
      ...makeBaseState(),
      scheduledConsequences: [existingHook1, existingHook2],
    }
    const choice = makeChoice({ scheduledConsequenceIds: [newCid] })

    const { nextState } = resolveChoice(state, choice, catalog, baseCtx)

    expect(nextState.scheduledConsequences).toHaveLength(3)
    expect(nextState.scheduledConsequences[0]).toBe(existingHook1)
    expect(nextState.scheduledConsequences[1]).toBe(existingHook2)
    expect(nextState.scheduledConsequences[2]).toBe(newHook)
  })
})

// ---------------------------------------------------------------------------
// 7. Trace appended to ledger (length + 1, last entry is the new trace)
// ---------------------------------------------------------------------------

describe('resolveChoice — ledger append', () => {
  it('appends exactly one trace to the ledger', () => {
    const state = makeBaseState() // ledger is []
    const { nextState, trace } = resolveChoice(state, makeChoice(), new Map(), baseCtx)

    expect(nextState.ledger).toHaveLength(1)
    expect(nextState.ledger[0]).toBe(trace)
  })

  it('places the new trace as the last ledger entry when prior entries exist', () => {
    const priorTrace = {
      id: fxTraceId('trace-prior'),
      sourceTaskId: fxTaskId('task-prior'),
      sourceChoiceId: fxChoiceId('choice-prior'),
      timestamp: 1,
      body: 'prior entry',
    }
    const state: GameState = {
      ...makeBaseState(),
      ledger: [priorTrace],
    }
    const ctx = { now: 2, traceId: fxTraceId('trace-new') }
    const { nextState, trace } = resolveChoice(state, makeChoice(), new Map(), ctx)

    expect(nextState.ledger).toHaveLength(2)
    expect(nextState.ledger[0]).toBe(priorTrace) // prior entry preserved
    expect(nextState.ledger[1]).toBe(trace)       // new trace is last
  })
})

// ---------------------------------------------------------------------------
// 8. Missing hook id throws a descriptive error
// ---------------------------------------------------------------------------

describe('resolveChoice — catalog validation', () => {
  it('throws when a scheduledConsequenceId is absent from the catalog', () => {
    const missingId = makeConsequenceId('cons-missing')
    const choice = makeChoice({ scheduledConsequenceIds: [missingId] })

    expect(() =>
      resolveChoice(makeBaseState(), choice, new Map(), baseCtx),
    ).toThrow(/cons-missing/)
  })

  it('thrown error message includes the choice id and task id for debuggability', () => {
    const tid = fxTaskId('task-err')
    const cid = fxChoiceId('choice-err')
    const missingId = makeConsequenceId('cons-absent')
    const choice = makeChoice({
      id: cid,
      taskId: tid,
      scheduledConsequenceIds: [missingId],
    })

    expect(() =>
      resolveChoice(makeBaseState(), choice, new Map(), baseCtx),
    ).toThrow(/choice-err/)
  })
})

// ---------------------------------------------------------------------------
// 9. Unknown meter key throws (guards against JSON-loaded content that
//    bypassed Zod parsing; would otherwise silently NaN downstream).
// ---------------------------------------------------------------------------

describe('resolveChoice — meter key validation', () => {
  it('throws when meterDeltas contains an unknown meter key', () => {
    const tid = fxTaskId('task-bad-meter')
    const cid = fxChoiceId('choice-bad-meter')
    // Cast required: simulating a JSON-loaded choice that bypassed Zod.
    const choice = makeChoice({
      id: cid,
      taskId: tid,
      meterDeltas: { MOOD: 5 } as ChoiceNode['meterDeltas'],
    })

    expect(() =>
      resolveChoice(makeBaseState(), choice, new Map(), baseCtx),
    ).toThrow(/MOOD/)
    expect(() =>
      resolveChoice(makeBaseState(), choice, new Map(), baseCtx),
    ).toThrow(/choice-bad-meter/)
  })
})
