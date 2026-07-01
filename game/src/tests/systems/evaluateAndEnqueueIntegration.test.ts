/**
 * evaluateAndEnqueue integration tests (Task 12).
 *
 * The thin store action evaluateAndEnqueue() bridges the pure
 * consequenceEngine.evaluate() with the eventQueueSlice + ledgerSlice +
 * consequenceSlice. Per PLAN.md §8:
 *
 *   "consequenceEngine.evaluate(state) runs at every phase transition.
 *    On fire: ConsequenceReturnPanel opens with all 7 §11 fields visible."
 *
 * Contract tested here:
 *   - A PHASE hook whose phase matches `state.phase` fires:
 *       * removed from scheduledConsequences
 *       * appended to ledger as a ResultTrace
 *       * pushed onto pendingFiredHooks
 *   - A NEVER hook never fires (stays in scheduledConsequences).
 *   - Already-pending hooks aren't re-fired (idempotency under repeat calls).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@state/store'
import { resetStore } from '@tests/state/testHelpers'
import {
  makePhaseHook as phaseHook,
  makeNeverHook as neverHook,
} from '@tests/systems/fixtures/hookFixtures'

describe('evaluateAndEnqueue — integration', () => {
  beforeEach(() => {
    resetStore()
  })

  it('fires a matching PHASE hook into pendingFiredHooks and ledger, removing from scheduled', () => {
    const hook = phaseHook('phase-match')
    useGameStore.getState().scheduleHook(hook)
    useGameStore.getState().setPhase('CONSEQUENCE_RETURN')

    useGameStore.getState().evaluateAndEnqueue()

    const s = useGameStore.getState()
    expect(s.pendingFiredHooks).toHaveLength(1)
    expect(s.pendingFiredHooks[0]?.id).toBe(hook.id)
    expect(s.scheduledConsequences).toEqual([])
    expect(s.ledger).toHaveLength(1)
    const trace = s.ledger[0]
    expect(trace?.sourceTaskId).toBe(hook.sourceTaskId)
    expect(trace?.sourceChoiceId).toBe(hook.sourceChoiceId)
    // Body must contain all 7 §11 field values (via materialize()).
    expect(trace?.body).toContain(hook.whyNow)
    expect(trace?.body).toContain(hook.whatChanged)
    expect(trace?.body).toContain(hook.traceHint)
    expect(trace?.body).toContain(hook.ledgerEntry)
  })

  it('does NOT fire a NEVER hook — stays in scheduledConsequences', () => {
    const hook = neverHook('never-stays')
    useGameStore.getState().scheduleHook(hook)
    useGameStore.getState().setPhase('CONSEQUENCE_RETURN')

    useGameStore.getState().evaluateAndEnqueue()

    const s = useGameStore.getState()
    expect(s.pendingFiredHooks).toEqual([])
    expect(s.scheduledConsequences).toHaveLength(1)
    expect(s.scheduledConsequences[0]?.id).toBe(hook.id)
    expect(s.ledger).toEqual([])
  })

  it('does NOT fire a PHASE hook when phase mismatches', () => {
    const hook = phaseHook('phase-miss')
    useGameStore.getState().scheduleHook(hook)
    useGameStore.getState().setPhase('FIRST_DIRECTIVE')

    useGameStore.getState().evaluateAndEnqueue()

    expect(useGameStore.getState().pendingFiredHooks).toEqual([])
    expect(useGameStore.getState().scheduledConsequences).toHaveLength(1)
  })

  it('repeat calls are idempotent — does not re-fire an already-fired hook', () => {
    const hook = phaseHook('idempotent')
    useGameStore.getState().scheduleHook(hook)
    useGameStore.getState().setPhase('CONSEQUENCE_RETURN')

    useGameStore.getState().evaluateAndEnqueue()
    useGameStore.getState().evaluateAndEnqueue()

    const s = useGameStore.getState()
    expect(s.pendingFiredHooks).toHaveLength(1)
    expect(s.ledger).toHaveLength(1)
  })
})

/**
 * ackFirstPending — drain flow.
 *
 * Seeds pendingFiredHooks directly via setState so the drain semantics are
 * exercised in isolation from evaluateAndEnqueue's schedule → fire pipeline.
 * The queue is FIFO; ackFirstPending() must shift only the head and leave the
 * tail untouched. Calling on an empty queue must be a no-op — the panel dispatch
 * path may hit ack after the last hook is already gone (e.g. rapid double-tap).
 */
describe('ackFirstPending — drain flow', () => {
  beforeEach(() => {
    resetStore()
  })

  it('ackFirstPending drains head only; tail intact', () => {
    const h1 = phaseHook('drain-1')
    const h2 = phaseHook('drain-2')
    const h3 = phaseHook('drain-3')
    useGameStore.setState({ pendingFiredHooks: [h1, h2, h3] })

    useGameStore.getState().ackFirstPending()

    const remaining = useGameStore.getState().pendingFiredHooks
    expect(remaining.map((h) => h.id)).toEqual([h2.id, h3.id])
  })

  it('ackFirstPending on empty queue is a no-op', () => {
    useGameStore.setState({ pendingFiredHooks: [] })

    expect(() => useGameStore.getState().ackFirstPending()).not.toThrow()
    expect(useGameStore.getState().pendingFiredHooks).toEqual([])
  })
})
